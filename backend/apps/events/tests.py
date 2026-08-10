import os
import sys
import pathlib

# Automatically configure Django settings if run directly or outside manage.py
BACKEND_DIR = str(pathlib.Path(__file__).resolve().parent.parent.parent)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.test import TestCase
from django.utils import timezone
from datetime import timedelta, time
from decimal import Decimal
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User, UserRole
from apps.events.models import Category, Event, EventStatus, TicketType, Wishlist
from apps.bookings.models import Coupon, DiscountType, Booking, BookingItem, BookingStatus
from apps.tickets.models import Ticket
from apps.tickets.utils import generate_tickets_for_booking

class EventSphereComprehensiveTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin = User.objects.create_superuser(
            username='admin_test',
            email='admin@test.com',
            password='AdminPassword@123',
            role=UserRole.ADMIN
        )

        # Organizer user
        self.organizer = User.objects.create_user(
            username='org_test',
            email='org@test.com',
            password='Password@123',
            role=UserRole.ORGANIZER,
            organization_name='TechEvents Global'
        )

        # Attendee user
        self.attendee = User.objects.create_user(
            username='user_test',
            email='attendee@test.com',
            password='Password@123',
            role=UserRole.ATTENDEE
        )

        # Category
        self.category = Category.objects.create(
            name='Technology & AI',
            slug='tech-ai',
            order=1
        )

        # Published Event
        self.event = Event.objects.create(
            organizer=self.organizer,
            category=self.category,
            title='Global AI Summit 2026',
            slug='global-ai-summit-2026',
            description='World premier AI conference',
            start_date=timezone.now().date() + timedelta(days=10),
            end_date=timezone.now().date() + timedelta(days=12),
            start_time=time(9, 0),
            end_time=time(18, 0),
            status=EventStatus.PUBLISHED,
            city='San Francisco',
            venue_name='Moscone Center'
        )

        # Ticket Types
        self.ticket_type = TicketType.objects.create(
            event=self.event,
            name='General Admission',
            price=Decimal('100.00'),
            total_quantity=100,
            available_quantity=100
        )

        # Coupon
        self.coupon = Coupon.objects.create(
            code='DISCOUNT20',
            discount_type=DiscountType.PERCENTAGE,
            discount_value=Decimal('20.00'),
            min_order_amount=Decimal('50.00'),
            max_uses=50,
            is_active=True
        )

    # 1. Coupon & Discount Calculations
    def test_coupon_discount_calculation(self):
        subtotal = Decimal('200.00')
        valid, msg = self.coupon.is_valid_for_amount(subtotal)
        self.assertTrue(valid)
        discount = self.coupon.calculate_discount(subtotal)
        self.assertEqual(discount, Decimal('40.00'))

    # 2. Ticket generation & QR code check
    def test_booking_and_qr_ticket_generation(self):
        booking = Booking.objects.create(
            user=self.attendee,
            event=self.event,
            attendee_name='Jane Attendee',
            attendee_email='attendee@test.com',
            attendee_phone='+1-555-0199',
            total_amount=Decimal('200.00'),
            discount_amount=Decimal('40.00'),
            final_amount=Decimal('160.00'),
            status=BookingStatus.CONFIRMED
        )
        BookingItem.objects.create(
            booking=booking,
            ticket_type=self.ticket_type,
            quantity=2,
            price_per_ticket=Decimal('100.00'),
            subtotal=Decimal('200.00')
        )

        tickets = generate_tickets_for_booking(booking)
        self.assertEqual(len(tickets), 2)
        self.ticket_type.refresh_from_db()
        self.assertEqual(self.ticket_type.available_quantity, 98)
        self.assertTrue(tickets[0].qr_code_data)
        self.assertEqual(tickets[0].attendee_name, 'Jane Attendee')

    # 3. Authentication Flow API tests
    def test_user_registration_and_login_api(self):
        reg_response = self.client.post('/api/auth/register/', {
            'username': 'newuser123',
            'email': 'newuser@example.com',
            'password': 'SecurePassword@123',
            'password_confirm': 'SecurePassword@123',
            'role': 'ATTENDEE',
            'first_name': 'New',
            'last_name': 'User'
        }, format='json')
        self.assertEqual(reg_response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', reg_response.data)

        # Login
        login_response = self.client.post('/api/auth/login/', {
            'email': 'newuser@example.com',
            'password': 'SecurePassword@123'
        }, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)

    # 4. Public Event APIs
    def test_public_event_list_and_detail(self):
        # Categories
        cat_resp = self.client.get('/api/categories/')
        self.assertEqual(cat_resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(cat_resp.data), 1)

        # Event list
        events_resp = self.client.get('/api/events/')
        self.assertEqual(events_resp.status_code, status.HTTP_200_OK)

        # Event detail
        detail_resp = self.client.get(f'/api/events/{self.event.slug}/')
        self.assertEqual(detail_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_resp.data['title'], 'Global AI Summit 2026')

    # 5. Wishlist toggle
    def test_wishlist_toggle(self):
        self.client.force_authenticate(user=self.attendee)
        # First toggle adds to wishlist (201 Created)
        toggle_resp = self.client.post(f'/api/wishlist/toggle/{self.event.id}/')
        self.assertEqual(toggle_resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(toggle_resp.data['wishlisted'])

        # List wishlist (paginated)
        list_resp = self.client.get('/api/wishlist/')
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        results = list_resp.data.get('results', list_resp.data)
        self.assertEqual(len(results), 1)

        # Second toggle removes from wishlist (200 OK)
        toggle_resp2 = self.client.post(f'/api/wishlist/toggle/{self.event.id}/')
        self.assertEqual(toggle_resp2.status_code, status.HTTP_200_OK)
        self.assertFalse(toggle_resp2.data['wishlisted'])

    # 6. Ticket Verification API
    def test_ticket_verification_api(self):
        booking = Booking.objects.create(
            user=self.attendee,
            event=self.event,
            attendee_name='Alice Smith',
            attendee_email='alice@example.com',
            total_amount=Decimal('100.00'),
            final_amount=Decimal('100.00'),
            status=BookingStatus.CONFIRMED
        )
        BookingItem.objects.create(
            booking=booking,
            ticket_type=self.ticket_type,
            quantity=1,
            price_per_ticket=Decimal('100.00'),
            subtotal=Decimal('100.00')
        )
        tickets = generate_tickets_for_booking(booking)
        ticket = tickets[0]

        # Verify by ticket number
        verify_resp = self.client.post('/api/tickets/verify/', {
            'ticket_number': ticket.ticket_number
        }, format='json')
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(verify_resp.data['valid'])
        self.assertFalse(verify_resp.data['is_checked_in'])

if __name__ == '__main__':
    from django.core.management import call_command
    call_command('test', 'apps.events.tests')

