from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User
from apps.events.models import Event

class Review(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=150, blank=True, null=True)
    comment = models.TextField()
    is_verified_attendee = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    class Meta:
        unique_together = ('event', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.event.title} ({self.rating}★)"
