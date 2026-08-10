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
from apps.events.models import Category, Event, EventStatus, TicketType
from apps.bookings.models import Coupon, DiscountType, Booking, BookingItem, BookingStatus

class BookingAndCouponAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.attendee = User.objects.create_user(
            username='booking_user',
            email='booker@test.com',
            password='Password@123',
            role=UserRole.ATTENDEE
        )
        self.organizer = User.objects.create_user(
            username='event_host',
            email='host@test.com',
            password='Password@123',
            role=UserRole.ORGANIZER
        )
        self.category = Category.objects.create(name='Music', slug='music')
        self.event = Event.objects.create(
            organizer=self.organizer,
            category=self.category,
            title='Summer Fest 2026',
            slug='summer-fest-2026',
            description='Live Music Festival',
            start_date=timezone.now().date() + timedelta(days=20),
            end_date=timezone.now().date() + timedelta(days=21),
            start_time=time(16, 0),
            end_time=time(23, 0),
            status=EventStatus.PUBLISHED,
            city='Austin',
            venue_name='Zilker Park'
        )
        self.vip_ticket = TicketType.objects.create(
            event=self.event,
            name='VIP Pass',
            price=Decimal('150.00'),
            total_quantity=20,
            available_quantity=20
        )
        self.coupon = Coupon.objects.create(
            code='FEST50',
            discount_type=DiscountType.FIXED,
            discount_value=Decimal('50.00'),
            min_order_amount=Decimal('100.00'),
            max_uses=100,
            is_active=True
        )

    def test_coupon_validation_api(self):
        self.client.force_authenticate(user=self.attendee)
        resp = self.client.post('/api/coupons/validate/', {
            'code': 'FEST50',
            'subtotal': '300.00'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['valid'])
        self.assertEqual(Decimal(str(resp.data['discount_amount'])), Decimal('50.00'))

    def test_booking_creation_and_cancellation(self):
        self.client.force_authenticate(user=self.attendee)
        # Create booking
        booking_resp = self.client.post('/api/bookings/create/', {
            'event_id': self.event.id,
            'attendee_name': 'Festival Attendee',
            'attendee_email': 'booker@test.com',
            'attendee_phone': '+1 555-123-4567',
            'coupon_code': 'FEST50',
            'items': [
                {
                    'ticket_type_id': self.vip_ticket.id,
                    'quantity': 2
                }
            ]
        }, format='json')
        self.assertEqual(booking_resp.status_code, status.HTTP_201_CREATED)
        booking_data = booking_resp.data['booking']
        booking_id = booking_data['id']
        self.assertEqual(Decimal(str(booking_data['total_amount'])), Decimal('300.00'))
        self.assertEqual(Decimal(str(booking_data['discount_amount'])), Decimal('50.00'))
        self.assertEqual(Decimal(str(booking_data['final_amount'])), Decimal('250.00'))

        # Cancel booking
        cancel_resp = self.client.post(f'/api/bookings/{booking_id}/cancel/')
        self.assertEqual(cancel_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(cancel_resp.data['booking']['status'], BookingStatus.CANCELLED)

if __name__ == '__main__':
    from django.core.management import call_command
    call_command('test', 'apps.bookings.tests')

