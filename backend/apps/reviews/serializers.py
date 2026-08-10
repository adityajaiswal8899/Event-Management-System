from rest_framework import serializers
from .models import Review
from apps.users.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'event', 'event_title', 'user', 'rating', 'title', 'comment', 'is_verified_attendee', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_verified_attendee', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        event = validated_data['event']
        
        # Check if verified attendee (has confirmed booking/ticket for event)
        is_verified = user.bookings.filter(event=event, status='CONFIRMED').exists()
        
        review, created = Review.objects.update_or_create(
            event=event,
            user=user,
            defaults={
                'rating': validated_data['rating'],
                'title': validated_data.get('title', ''),
                'comment': validated_data['comment'],
                'is_verified_attendee': is_verified
            }
        )
        return review
