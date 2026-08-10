from rest_framework import serializers
from .models import Ticket
from apps.events.serializers import EventListSerializer, TicketTypeSerializer

class TicketSerializer(serializers.ModelSerializer):
    event_details = EventListSerializer(source='event', read_only=True)
    ticket_type_details = TicketTypeSerializer(source='ticket_type', read_only=True)
    qr_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_number', 'booking', 'event', 'event_details',
            'ticket_type', 'ticket_type_details', 'attendee_name', 'attendee_email',
            'seat_label', 'qr_code_data', 'qr_code_image', 'qr_image_url',
            'is_checked_in', 'checked_in_at', 'created_at'
        ]

    def get_qr_image_url(self, obj):
        if obj.qr_code_image:
            return obj.qr_code_image.url
        return None
