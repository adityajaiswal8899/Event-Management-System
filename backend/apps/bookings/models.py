import uuid
import random
import string
from typing import Any
from django.db import models
from django.utils import timezone
from apps.users.models import User
from apps.events.models import Event, TicketType

class DiscountType(models.TextChoices):
    PERCENTAGE = 'PERCENTAGE', 'Percentage Discount'
    FIXED = 'FIXED', 'Fixed Amount Discount'


class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices, default=DiscountType.PERCENTAGE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    max_uses = models.PositiveIntegerField(default=100)
    used_count = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    def __str__(self):
        return f"{self.code} ({self.discount_value}{'%' if self.discount_type == 'PERCENTAGE' else '₹'})"

    def is_valid_for_amount(self, subtotal):
        if not self.is_active:
            return False, "This coupon is no longer active."
        if self.used_count >= self.max_uses:
            return False, "This coupon usage limit has been reached."
        if self.valid_until and timezone.now() > self.valid_until:
            return False, "This coupon has expired."
        if subtotal < self.min_order_amount:
            return False, f"Minimum order amount of ₹{self.min_order_amount} required to apply this coupon."
        return True, "Valid coupon"

    def calculate_discount(self, subtotal):
        if self.discount_type == DiscountType.PERCENTAGE:
            discount = (subtotal * self.discount_value) / 100
            if self.max_discount_amount:
                discount = min(discount, self.max_discount_amount)
            return round(discount, 2)
        else:
            return min(self.discount_value, subtotal)


class BookingStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Payment'
    CONFIRMED = 'CONFIRMED', 'Confirmed'
    CANCELLED = 'CANCELLED', 'Cancelled'
    REFUNDED = 'REFUNDED', 'Refunded'
    FAILED = 'FAILED', 'Payment Failed'


class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_number = models.CharField(max_length=50, unique=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')
    
    # Attendee Info
    attendee_name = models.CharField(max_length=150)
    attendee_email = models.EmailField()
    attendee_phone = models.CharField(max_length=30)
    
    # Pricing Breakdown
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, blank=True, null=True, related_name='bookings')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    status = models.CharField(max_length=20, choices=BookingStatus.choices, default=BookingStatus.PENDING)
    cancellation_reason = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    items: Any

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.booking_number:
            chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            year = timezone.now().year
            setattr(self, 'booking_number', f"ESPH-{year}-{chars}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.booking_number} - {self.event.title} ({self.status})"

    @property
    def total_tickets_count(self):
        return sum(item.quantity for item in self.items.all())


class BookingItem(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='items')
    ticket_type = models.ForeignKey(TicketType, on_delete=models.CASCADE, related_name='booking_items')
    quantity = models.PositiveIntegerField(default=1)
    price_per_ticket = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    objects = models.Manager()

    def __str__(self):
        return f"{self.booking.booking_number} - {self.ticket_type.name} x {self.quantity}"
