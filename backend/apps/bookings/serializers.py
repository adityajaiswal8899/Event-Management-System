from rest_framework import serializers
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from .models import Coupon, Booking, BookingItem, BookingStatus
from apps.events.models import Event, TicketType
from apps.events.serializers import EventListSerializer, TicketTypeSerializer
from apps.users.serializers import UserSerializer

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'discount_type', 'discount_value',
            'min_order_amount', 'max_discount_amount', 'max_uses',
            'used_count', 'valid_from', 'valid_until', 'is_active', 'created_at'
        ]


class BookingItemSerializer(serializers.ModelSerializer):
    ticket_type_details = TicketTypeSerializer(source='ticket_type', read_only=True)

    class Meta:
        model = BookingItem
        fields = ['id', 'ticket_type', 'ticket_type_details', 'quantity', 'price_per_ticket', 'subtotal']


class BookingSerializer(serializers.ModelSerializer):
    event_details = EventListSerializer(source='event', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    items = BookingItemSerializer(many=True, read_only=True)
    coupon_details = CouponSerializer(source='coupon', read_only=True)
    tickets = serializers.SerializerMethodField()
    payment_details = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_number', 'user', 'user_details', 'event', 'event_details',
            'attendee_name', 'attendee_email', 'attendee_phone',
            'total_amount', 'coupon', 'coupon_details', 'discount_amount', 'final_amount',
            'status', 'cancellation_reason', 'notes', 'items', 'tickets', 'payment_details',
            'created_at', 'updated_at'
        ]

    def get_tickets(self, obj):
        from apps.tickets.serializers import TicketSerializer
        tickets = obj.tickets.all()
        return TicketSerializer(tickets, many=True).data

    def get_payment_details(self, obj):
        if hasattr(obj, 'payment'):
            payment = obj.payment
            return {
                'id': payment.id,
                'transaction_id': payment.transaction_id,
                'razorpay_order_id': payment.razorpay_order_id,
                'razorpay_payment_id': payment.razorpay_payment_id,
                'amount': payment.amount,
                'status': payment.status,
                'created_at': payment.created_at
            }
        return None


class BookingCreateItemInputSerializer(serializers.Serializer):
    ticket_type_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class BookingCreateSerializer(serializers.Serializer):
    event_id = serializers.UUIDField()
    attendee_name = serializers.CharField(max_length=150)
    attendee_email = serializers.EmailField()
    attendee_phone = serializers.CharField(max_length=30)
    items = BookingCreateItemInputSerializer(many=True)
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        try:
            event = Event.objects.get(id=attrs['event_id'])
            attrs['event_obj'] = event
        except (Event.DoesNotExist, ObjectDoesNotExist):
            raise serializers.ValidationError({"event_id": "Event not found."})

        if event.status != 'PUBLISHED':
            raise serializers.ValidationError({"event_id": "This event is not published or open for bookings."})

        items_data = attrs.get('items', [])
        if not items_data:
            raise serializers.ValidationError({"items": "At least one ticket must be selected."})

        validated_items = []
        subtotal = 0

        for item in items_data:
            try:
                ticket_type = TicketType.objects.get(id=item['ticket_type_id'], event=event, is_active=True)
            except (TicketType.DoesNotExist, ObjectDoesNotExist):
                raise serializers.ValidationError({"items": f"Invalid ticket type ID {item['ticket_type_id']}."})

            qty = item['quantity']
            if qty > ticket_type.available_quantity:
                raise serializers.ValidationError({
                    "items": f"Only {ticket_type.available_quantity} seats available for '{ticket_type.name}'."
                })
            if qty > ticket_type.max_per_booking:
                raise serializers.ValidationError({
                    "items": f"Maximum {ticket_type.max_per_booking} tickets allowed per booking for '{ticket_type.name}'."
                })

            item_subtotal = ticket_type.price * qty
            subtotal += item_subtotal
            validated_items.append({
                'ticket_type': ticket_type,
                'quantity': qty,
                'price_per_ticket': ticket_type.price,
                'subtotal': item_subtotal
            })

        attrs['validated_items'] = validated_items
        attrs['subtotal'] = subtotal

        # Validate coupon if provided
        coupon_code = str(attrs.get('coupon_code', '')).strip().upper()
        discount_amount = 0
        coupon_obj = None

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                is_valid, msg = coupon.is_valid_for_amount(subtotal)
                if not is_valid:
                    raise serializers.ValidationError({"coupon_code": msg})
                discount_amount = coupon.calculate_discount(subtotal)
                coupon_obj = coupon
            except (Coupon.DoesNotExist, ObjectDoesNotExist):
                raise serializers.ValidationError({"coupon_code": "Invalid coupon code."})

        attrs['coupon_obj'] = coupon_obj
        attrs['discount_amount'] = discount_amount
        attrs['final_amount'] = max(0, subtotal - discount_amount)

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        event = validated_data['event_obj']
        coupon = validated_data.get('coupon_obj')
        subtotal = validated_data['subtotal']
        discount_amount = validated_data['discount_amount']
        final_amount = validated_data['final_amount']

        booking = Booking.objects.create(
            user=user,
            event=event,
            attendee_name=validated_data['attendee_name'],
            attendee_email=validated_data['attendee_email'],
            attendee_phone=validated_data['attendee_phone'],
            total_amount=subtotal,
            coupon=coupon,
            discount_amount=discount_amount,
            final_amount=final_amount,
            status=BookingStatus.PENDING if final_amount > 0 else BookingStatus.CONFIRMED,
            notes=validated_data.get('notes', '')
        )

        for item_info in validated_data['validated_items']:
            BookingItem.objects.create(
                booking=booking,
                ticket_type=item_info['ticket_type'],
                quantity=item_info['quantity'],
                price_per_ticket=item_info['price_per_ticket'],
                subtotal=item_info['subtotal']
            )

        # If free event (final_amount == 0), automatically issue tickets and update inventory immediately
        if final_amount == 0:
            from apps.tickets.utils import generate_tickets_for_booking
            generate_tickets_for_booking(booking)
            if coupon:
                coupon.used_count += 1
                coupon.save()

        return booking
