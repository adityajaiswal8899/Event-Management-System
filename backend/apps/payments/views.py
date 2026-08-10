import hmac
import hashlib
import uuid
from decimal import Decimal
from rest_framework import views, status, generics, permissions
from rest_framework.response import Response
from django.conf import settings
from django.db import transaction
from django.core.mail import send_mail
from .models import Payment, PaymentStatus
from apps.bookings.models import Booking, BookingStatus
from apps.tickets.utils import generate_tickets_for_booking
from apps.notifications.models import Notification
from apps.users.permissions import IsAdminUser

class CreateRazorpayOrderView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response({'error': 'booking_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != BookingStatus.PENDING:
            return Response({'error': f'Cannot process payment for booking with status {booking.status}.'}, status=status.HTTP_400_BAD_REQUEST)

        amount_in_paise = int(booking.final_amount * 100)
        
        # Check if Razorpay SDK client can be used or simulated order ID generated
        order_id = f"order_esph_{uuid.uuid4().hex[:14]}"
        try:
            import razorpay
            if settings.RAZORPAY_KEY_ID and not settings.RAZORPAY_KEY_ID.startswith('rzp_test_sample'):
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                razorpay_order = client.order.create({
                    'amount': amount_in_paise,
                    'currency': 'INR',
                    'receipt': booking.booking_number,
                    'notes': {'booking_id': str(booking.id)}
                })
                order_id = razorpay_order.get('id', order_id)
        except Exception:
            pass

        # Create or update Payment record
        payment, _ = Payment.objects.get_or_create(
            booking=booking,
            defaults={
                'user': request.user,
                'transaction_id': f"TXN-{uuid.uuid4().hex[:12].upper()}",
                'razorpay_order_id': order_id,
                'amount': booking.final_amount,
                'currency': 'INR',
                'status': PaymentStatus.CREATED
            }
        )
        payment.razorpay_order_id = order_id
        payment.save()

        return Response({
            'order_id': order_id,
            'razorpay_key': settings.RAZORPAY_KEY_ID,
            'amount': amount_in_paise,
            'currency': 'INR',
            'booking_number': booking.booking_number,
            'event_title': booking.event.title,
            'attendee_name': booking.attendee_name,
            'attendee_email': booking.attendee_email,
            'attendee_phone': booking.attendee_phone,
            'payment_id': str(payment.id),
            'transaction_id': payment.transaction_id
        }, status=status.HTTP_200_OK)


class VerifyRazorpayPaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        booking_id = request.data.get('booking_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        payment_method = request.data.get('payment_method', 'online')

        if not booking_id or not razorpay_payment_id:
            return Response({'error': 'Missing required payment verification parameters.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.select_for_update().get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Signature verification
        verified = True
        if razorpay_order_id and razorpay_signature and settings.RAZORPAY_KEY_SECRET and not settings.RAZORPAY_KEY_SECRET.startswith('sampleSecretKey'):
            msg = f"{razorpay_order_id}|{razorpay_payment_id}"
            generated_sig = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                msg.encode(),
                hashlib.sha256
            ).hexdigest()
            if generated_sig != razorpay_signature:
                verified = False

        if not verified:
            payment, _ = Payment.objects.get_or_create(booking=booking, defaults={'user': request.user, 'amount': booking.final_amount, 'transaction_id': f"TXN-{uuid.uuid4().hex[:12].upper()}"})
            payment.status = PaymentStatus.FAILED
            payment.error_description = "Payment signature verification failed."
            payment.save()
            booking.status = BookingStatus.FAILED
            booking.save()
            return Response({'verified': False, 'message': 'Payment signature verification failed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark payment successful
        payment, _ = Payment.objects.get_or_create(
            booking=booking,
            defaults={
                'user': request.user,
                'transaction_id': f"TXN-{uuid.uuid4().hex[:12].upper()}",
                'amount': booking.final_amount,
                'currency': 'INR'
            }
        )
        payment.razorpay_order_id = razorpay_order_id
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = PaymentStatus.SUCCESSFUL
        payment.payment_method = payment_method
        payment.save()

        # Update booking status
        booking.status = BookingStatus.CONFIRMED
        booking.save()

        # Increment coupon count if used
        if booking.coupon:
            booking.coupon.used_count += 1
            booking.coupon.save()

        # Generate Digital QR Tickets & decrement inventory
        tickets = generate_tickets_for_booking(booking)

        # Dispatch In-App Notification
        Notification.objects.create(
            user=booking.user,
            title="Payment Confirmed & Tickets Ready! 🎟️",
            message=f"Your payment of ₹{booking.final_amount} for '{booking.event.title}' was successful. Your QR-code tickets are ready!",
            notification_type="booking",
            link=f"/my-bookings"
        )

        # Dispatch Confirmation Email
        try:
            send_mail(
                subject=f"EventSphere Ticket Confirmation - {booking.event.title}",
                message=f"Hello {booking.attendee_name},\n\nYour booking #{booking.booking_number} is confirmed!\n\nEvent: {booking.event.title}\nDate: {booking.event.start_date}\nTotal Tickets: {len(tickets)}\nAmount Paid: ₹{booking.final_amount}\n\nYou can access your QR tickets anytime in your EventSphere profile.\n\nBest regards,\nEventSphere Team",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[booking.attendee_email],
                fail_silently=True
            )
        except Exception:
            pass

        return Response({
            'verified': True,
            'message': 'Payment verified and booking confirmed successfully!',
            'booking_id': str(booking.id),
            'booking_number': booking.booking_number,
            'tickets_count': len(tickets)
        }, status=status.HTTP_200_OK)


class AdminPaymentListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        payments = Payment.objects.all().select_related('booking', 'user', 'booking__event').order_by('-created_at')
        search = request.query_params.get('search')
        status_param = request.query_params.get('status')

        if status_param:
            payments = payments.filter(status=status_param)
        if search:
            payments = payments.filter(transaction_id__icontains=search) | payments.filter(razorpay_payment_id__icontains=search) | payments.filter(user__email__icontains=search)

        data = []
        for p in payments:
            data.append({
                'id': str(p.id),
                'transaction_id': p.transaction_id,
                'razorpay_order_id': p.razorpay_order_id,
                'razorpay_payment_id': p.razorpay_payment_id,
                'amount': p.amount,
                'currency': p.currency,
                'status': p.status,
                'payment_method': p.payment_method,
                'user_email': p.user.email,
                'booking_number': p.booking.booking_number,
                'event_title': p.booking.event.title,
                'created_at': p.created_at
            })

        return Response(data, status=status.HTTP_200_OK)
