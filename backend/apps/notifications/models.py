from django.db import models
from apps.users.models import User

class Notification(models.Model):
    TYPES = [
        ('booking', 'Booking Notification'),
        ('payment', 'Payment Notification'),
        ('approval', 'Event Approval'),
        ('cancellation', 'Cancellation Notice'),
        ('reminder', 'Event Reminder'),
        ('system', 'System Message'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPES, default='system')
    link = models.CharField(max_length=300, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.title} ({'Read' if self.is_read else 'Unread'})"
