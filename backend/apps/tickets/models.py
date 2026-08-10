import uuid
import random
import string
from django.db import models
from django.utils import timezone
from apps.users.models import User
from apps.events.models import Event, TicketType
from apps.bookings.models import Booking, BookingItem

class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(max_length=60, unique=True, blank=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='tickets')
    booking_item = models.ForeignKey(BookingItem, on_delete=models.SET_NULL, null=True, related_name='tickets')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='issued_tickets')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_tickets')
    ticket_type = models.ForeignKey(TicketType, on_delete=models.CASCADE, related_name='tickets')
    
    attendee_name = models.CharField(max_length=150)
    attendee_email = models.EmailField()
    seat_label = models.CharField(max_length=50, blank=True, null=True)
    
    qr_code_data = models.TextField(blank=True, null=True)
    qr_code_image = models.ImageField(upload_to='tickets/qr/', blank=True, null=True)
    
    is_checked_in = models.BooleanField(default=False)
    checked_in_at = models.DateTimeField(blank=True, null=True)
    checked_in_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='scanned_tickets')
    
    created_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            setattr(self, 'ticket_number', f"TKT-ESPH-{chars}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_number} - {self.event.title} ({self.ticket_type.name})"
