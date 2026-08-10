from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User, UserRole
from apps.events.models import Event, Category, EventStatus, TicketType
from apps.bookings.models import Booking, BookingItem, BookingStatus
from apps.payments.models import Payment, PaymentStatus
from apps.users.permissions import IsOrganizerUser, IsAdminUser

class OrganizerDashboardStatsView(APIView):
    permission_classes = [IsOrganizerUser]

    def get(self, request):
        user = request.user
        events_qs = Event.objects.filter(organizer=user) if user.role != 'ADMIN' else Event.objects.all()
        event_ids = events_qs.values_list('id', flat=True)

        # Totals
        total_events = events_qs.count()
        published_events = events_qs.filter(status=EventStatus.PUBLISHED).count()
        pending_events = events_qs.filter(status=EventStatus.PENDING_APPROVAL).count()
        draft_events = events_qs.filter(status=EventStatus.DRAFT).count()
        
        today = timezone.now().date()
        upcoming_events = events_qs.filter(status=EventStatus.PUBLISHED, start_date__gte=today).count()

        # Bookings & Revenue
        confirmed_bookings = Booking.objects.filter(event_id__in=event_ids, status=BookingStatus.CONFIRMED)
        total_revenue = confirmed_bookings.aggregate(total=Sum('final_amount'))['total'] or 0
        total_tickets_sold = BookingItem.objects.filter(booking__in=confirmed_bookings).aggregate(total=Sum('quantity'))['total'] or 0
        total_attendees = confirmed_bookings.values('attendee_email').distinct().count()

        # Monthly Sales Chart Data (Last 6 Months)
        monthly_sales = []
        for i in range(5, -1, -1):
            start_month = (timezone.now() - timedelta(days=30 * i)).replace(day=1)
            end_month = (start_month + timedelta(days=31)).replace(day=1)
            month_bookings = confirmed_bookings.filter(created_at__gte=start_month, created_at__lt=end_month)
            month_rev = month_bookings.aggregate(total=Sum('final_amount'))['total'] or 0
            month_tickets = BookingItem.objects.filter(booking__in=month_bookings).aggregate(total=Sum('quantity'))['total'] or 0
            
            monthly_sales.append({
                'month': start_month.strftime('%b %Y'),
                'revenue': float(month_rev),
                'tickets': int(month_tickets)
            })

        # Top Events
        top_events_data = []
        for ev in events_qs.filter(status=EventStatus.PUBLISHED)[:5]:
            ev_bookings = confirmed_bookings.filter(event=ev)
            ev_rev = ev_bookings.aggregate(total=Sum('final_amount'))['total'] or 0
            ev_tickets = BookingItem.objects.filter(booking__in=ev_bookings).aggregate(total=Sum('quantity'))['total'] or 0
            top_events_data.append({
                'id': str(ev.id),
                'title': ev.title,
                'revenue': float(ev_rev),
                'tickets_sold': int(ev_tickets),
                'available_seats': ev.available_seats,
                'status': ev.status
            })

        return Response({
            'stats': {
                'total_events': total_events,
                'published_events': published_events,
                'pending_events': pending_events,
                'draft_events': draft_events,
                'upcoming_events': upcoming_events,
                'total_revenue': float(total_revenue),
                'total_tickets_sold': int(total_tickets_sold),
                'total_attendees': total_attendees
            },
            'monthly_sales': monthly_sales,
            'top_events': top_events_data
        }, status=status.HTTP_200_OK)


class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.filter(role=UserRole.ATTENDEE).count()
        total_organizers = User.objects.filter(role=UserRole.ORGANIZER).count()
        total_events = Event.objects.count()
        active_events = Event.objects.filter(status=EventStatus.PUBLISHED).count()
        pending_approvals = Event.objects.filter(status=EventStatus.PENDING_APPROVAL).count()
        
        confirmed_bookings = Booking.objects.filter(status=BookingStatus.CONFIRMED)
        total_bookings = confirmed_bookings.count()
        total_revenue = confirmed_bookings.aggregate(total=Sum('final_amount'))['total'] or 0
        total_tickets_issued = BookingItem.objects.filter(booking__in=confirmed_bookings).aggregate(total=Sum('quantity'))['total'] or 0

        # Monthly platform metrics
        monthly_revenue = []
        for i in range(5, -1, -1):
            start_month = (timezone.now() - timedelta(days=30 * i)).replace(day=1)
            end_month = (start_month + timedelta(days=31)).replace(day=1)
            mb = confirmed_bookings.filter(created_at__gte=start_month, created_at__lt=end_month)
            rev = mb.aggregate(total=Sum('final_amount'))['total'] or 0
            monthly_revenue.append({
                'month': start_month.strftime('%b %Y'),
                'revenue': float(rev),
                'bookings_count': mb.count()
            })

        # Category distribution
        category_stats = []
        for cat in Category.objects.all():
            count = Event.objects.filter(category=cat).count()
            if count > 0:
                category_stats.append({
                    'name': cat.name,
                    'count': count
                })

        return Response({
            'stats': {
                'total_users': total_users,
                'total_organizers': total_organizers,
                'total_events': total_events,
                'active_events': active_events,
                'pending_approvals': pending_approvals,
                'total_bookings': total_bookings,
                'total_revenue': float(total_revenue),
                'total_tickets_issued': int(total_tickets_issued)
            },
            'monthly_revenue': monthly_revenue,
            'category_distribution': category_stats
        }, status=status.HTTP_200_OK)
