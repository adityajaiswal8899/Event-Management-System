from decimal import Decimal
from rest_framework import generics, viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from .models import Coupon, Booking, BookingItem, BookingStatus
from .serializers import CouponSerializer, BookingSerializer, BookingCreateSerializer
from apps.users.permissions import IsAdminUser, IsOrganizerUser
from apps.notifications.models import Notification

class ValidateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        subtotal_raw = request.data.get('subtotal', 0)

        try:
            subtotal = Decimal(str(subtotal_raw))
        except (ValueError, TypeError, Exception):
            return Response({'error': 'Invalid subtotal amount.'}, status=status.HTTP_400_BAD_REQUEST)

        if not code:
            return Response({'error': 'Coupon code is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code=code)
            is_valid, message = coupon.is_valid_for_amount(subtotal)
            if not is_valid:
                return Response({'valid': False, 'message': message}, status=status.HTTP_400_BAD_REQUEST)

            discount = coupon.calculate_discount(subtotal)
            final_total = max(Decimal('0.00'), subtotal - discount)

            return Response({
                'valid': True,
                'coupon': CouponSerializer(coupon).data,
                'discount_amount': discount,
                'final_total': final_total,
                'message': f"Coupon '{coupon.code}' applied successfully!"
            }, status=status.HTTP_200_OK)

        except (Coupon.DoesNotExist, ObjectDoesNotExist):
            return Response({'valid': False, 'message': 'Invalid coupon code.'}, status=status.HTTP_404_NOT_FOUND)


class CreateBookingView(generics.CreateAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        return Response({
            'message': 'Booking initialized successfully.',
            'booking': BookingSerializer(booking).data
        }, status=status.HTTP_201_CREATED)


class UserBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Booking.objects.filter(user=self.request.user).order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Booking.objects.all()
        if user.role == 'ORGANIZER':
            return Booking.objects.filter(event__organizer=user) | Booking.objects.filter(user=user)
        return Booking.objects.filter(user=user)


class CancelBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, id):
        try:
            booking = Booking.objects.select_for_update().get(id=id)
            if booking.user != request.user and request.user.role != 'ADMIN':
                return Response({'error': 'You do not have permission to cancel this booking.'}, status=status.HTTP_403_FORBIDDEN)

            if booking.status not in [BookingStatus.CONFIRMED, BookingStatus.PENDING]:
                return Response({'error': f'Booking cannot be cancelled because its current status is {booking.status}.'}, status=status.HTTP_400_BAD_REQUEST)

            reason = request.data.get('reason', 'Cancelled by user')
            booking.status = BookingStatus.CANCELLED
            booking.cancellation_reason = reason
            booking.save()

            # Restore ticket inventory
            for item in booking.items.all():
                ticket_type = item.ticket_type
                ticket_type.available_quantity = min(ticket_type.total_quantity, ticket_type.available_quantity + item.quantity)
                ticket_type.save()

            # Mark generated tickets as cancelled / invalid
            booking.tickets.all().delete()

            # Notify user
            Notification.objects.create(
                user=booking.user,
                title="Booking Cancelled",
                message=f"Your booking #{booking.booking_number} for '{booking.event.title}' has been cancelled.",
                notification_type="cancellation",
                link="/my-bookings"
            )

            return Response({
                'message': 'Booking cancelled successfully. Ticket quantities have been restored.',
                'booking': BookingSerializer(booking).data
            }, status=status.HTTP_200_OK)

        except (Booking.DoesNotExist, ObjectDoesNotExist):
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)


class AdminBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Booking.objects.all().order_by('-created_at')
        status_param = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        if status_param:
            queryset = queryset.filter(status=status_param)
        if search:
            queryset = queryset.filter(
                booking_number__icontains=search
            ) | queryset.filter(
                attendee_name__icontains=search
            ) | queryset.filter(
                attendee_email__icontains=search
            ) | queryset.filter(
                event__title__icontains=search
            )
        return queryset


class OrganizerBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsOrganizerUser]

    def get_queryset(self):
        event_id = self.request.query_params.get('event_id')
        queryset = Booking.objects.filter(event__organizer=self.request.user).order_by('-created_at')
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        return queryset


class AdminCouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]
