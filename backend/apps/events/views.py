from rest_framework import generics, viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.db.models import Q
from django.utils import timezone
from .models import Category, Event, EventStatus, Wishlist, TicketType
from .serializers import (
    CategorySerializer, EventListSerializer, EventDetailSerializer,
    EventCreateUpdateSerializer, TicketTypeSerializer
)
from apps.users.permissions import IsAdminUser, IsOrganizerUser
from apps.notifications.models import Notification

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]


class EventListView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Event.objects.filter(status=EventStatus.PUBLISHED).order_by('-start_date')
        
        # Search query (title, description, venue, organizer name)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(short_description__icontains=search) |
                Q(description__icontains=search) |
                Q(venue_name__icontains=search) |
                Q(city__icontains=search) |
                Q(organizer__organization_name__icontains=search) |
                Q(organizer__first_name__icontains=search)
            )

        # Category filter
        category_slug = self.request.query_params.get('category')
        if category_slug and category_slug != 'all':
            queryset = queryset.filter(category__slug=category_slug)

        # Event type
        event_type = self.request.query_params.get('event_type')
        if event_type and event_type != 'ALL':
            queryset = queryset.filter(event_type=event_type)

        # City / Location
        city = self.request.query_params.get('city')
        if city and city != 'all':
            queryset = queryset.filter(city__iexact=city)

        # Date filtering
        date_filter = self.request.query_params.get('date_filter')
        today = timezone.now().date()
        if date_filter == 'today':
            queryset = queryset.filter(start_date=today)
        elif date_filter == 'this_week':
            week_end = today + timezone.timedelta(days=7)
            queryset = queryset.filter(start_date__gte=today, start_date__lte=week_end)
        elif date_filter == 'this_month':
            month_end = today + timezone.timedelta(days=30)
            queryset = queryset.filter(start_date__gte=today, start_date__lte=month_end)
        elif date_filter == 'upcoming':
            queryset = queryset.filter(start_date__gte=today)

        # Price filter
        is_free = self.request.query_params.get('free')
        if is_free == 'true':
            # Events with ticket price == 0
            queryset = queryset.filter(ticket_types__price=0).distinct()
        
        max_price = self.request.query_params.get('max_price')
        if max_price:
            try:
                max_p = float(max_price)
                queryset = queryset.filter(ticket_types__price__lte=max_p).distinct()
            except ValueError:
                pass

        # Ordering
        sort_by = self.request.query_params.get('sort', 'date_asc')
        if sort_by == 'date_asc':
            queryset = queryset.order_by('start_date')
        elif sort_by == 'date_desc':
            queryset = queryset.order_by('-start_date')
        elif sort_by == 'created_desc':
            queryset = queryset.order_by('-created_at')

        return queryset


class FeaturedEventsView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Event.objects.filter(
            status=EventStatus.PUBLISHED,
            is_featured=True
        ).order_by('-start_date')[:6]


class TrendingEventsView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Event.objects.filter(
            status=EventStatus.PUBLISHED,
            is_trending=True
        ).order_by('-start_date')[:6]


class UpcomingEventsView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        today = timezone.now().date()
        return Event.objects.filter(
            status=EventStatus.PUBLISHED,
            start_date__gte=today
        ).order_by('start_date')[:8]


class EventDetailView(generics.RetrieveAPIView):
    serializer_class = EventDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        # Admins and organizers can view their drafts/pending by slug too; attendees view published
        if self.request.user.is_authenticated and (self.request.user.role in ['ADMIN', 'ORGANIZER']):
            return Event.objects.all()
        return Event.objects.filter(status=EventStatus.PUBLISHED)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class OrganizerEventViewSet(viewsets.ModelViewSet):
    serializer_class = EventCreateUpdateSerializer
    permission_classes = [IsOrganizerUser]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Event.objects.all().order_by('-created_at')
        return Event.objects.filter(organizer=user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return EventDetailSerializer
        return EventCreateUpdateSerializer

    def perform_create(self, serializer):
        event = serializer.save()
        # Create notification for admin if pending
        if event.status == EventStatus.PENDING_APPROVAL:
            # We can notify admins
            pass


class AdminEventApprovalViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        status_filter = request.query_params.get('status', EventStatus.PENDING_APPROVAL)
        events = Event.objects.filter(status=status_filter).order_by('-created_at')
        serializer = EventDetailSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        try:
            event = Event.objects.get(pk=pk)
            event.status = EventStatus.PUBLISHED
            event.rejection_reason = None
            event.save()
            
            # Send notification to organizer
            Notification.objects.create(
                user=event.organizer,
                title="Event Approved! 🎉",
                message=f"Your event '{event.title}' has been reviewed and approved by admin. It is now live on EventSphere!",
                notification_type="approval",
                link=f"/events/{event.slug}"
            )

            return Response({'message': f"Event '{event.title}' approved successfully.", 'status': event.status})
        except Event.DoesNotExist:
            return Response({'error': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reason = request.data.get('reason', 'Event does not meet platform guidelines.')
        try:
            event = Event.objects.get(pk=pk)
            event.status = EventStatus.REJECTED
            event.rejection_reason = reason
            event.save()

            Notification.objects.create(
                user=event.organizer,
                title="Event Submission Needs Changes",
                message=f"Your event '{event.title}' was rejected. Reason: {reason}",
                notification_type="approval",
                link=f"/organizer/events/edit/{event.id}"
            )

            return Response({'message': f"Event '{event.title}' rejected.", 'status': event.status})
        except Event.DoesNotExist:
            return Response({'error': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)


class WishlistToggleView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, event=event)
            if not created:
                wishlist_item.delete()
                return Response({'wishlisted': False, 'message': 'Removed from wishlist.'}, status=status.HTTP_200_OK)
            return Response({'wishlisted': True, 'message': 'Added to wishlist.'}, status=status.HTTP_201_CREATED)
        except Event.DoesNotExist:
            return Response({'error': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)


class UserWishlistView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_ids = Wishlist.objects.filter(user=self.request.user).values_list('event_id', flat=True)
        return Event.objects.filter(id__in=event_ids, status=EventStatus.PUBLISHED)
