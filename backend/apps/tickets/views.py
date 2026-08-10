import json
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Ticket
from .serializers import TicketSerializer
from apps.users.permissions import IsOrganizerUser

class UserTicketListView(generics.ListAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user).order_by('-created_at')


class TicketDetailView(generics.RetrieveAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'ORGANIZER']:
            return Ticket.objects.all()
        return Ticket.objects.filter(user=user)


class VerifyTicketView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ticket_number = request.data.get('ticket_number')
        ticket_id = request.data.get('ticket_id')

        if not ticket_number and not ticket_id:
            return Response({'valid': False, 'message': 'Ticket number or ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if ticket_id:
                ticket = Ticket.objects.get(id=ticket_id)
            else:
                ticket = Ticket.objects.get(ticket_number=ticket_number)

            return Response({
                'valid': True,
                'ticket': TicketSerializer(ticket).data,
                'is_checked_in': ticket.is_checked_in,
                'checked_in_at': ticket.checked_in_at,
                'message': 'Ticket is valid.' if not ticket.is_checked_in else 'Ticket has already been checked in.'
            }, status=status.HTTP_200_OK)

        except Ticket.DoesNotExist:
            return Response({'valid': False, 'message': 'Ticket not found or invalid.'}, status=status.HTTP_404_NOT_FOUND)


class CheckInTicketView(APIView):
    permission_classes = [IsOrganizerUser]

    def post(self, request, id):
        try:
            ticket = Ticket.objects.get(id=id)
            
            # Check permissions for organizer's event
            if request.user.role != 'ADMIN' and ticket.event.organizer != request.user:
                return Response({'error': 'You are not the organizer for this event.'}, status=status.HTTP_403_FORBIDDEN)

            if ticket.is_checked_in:
                return Response({
                    'message': f"Ticket was already checked in on {ticket.checked_in_at.strftime('%b %d, %Y %I:%M %p')}.",
                    'ticket': TicketSerializer(ticket).data,
                    'already_checked_in': True
                }, status=status.HTTP_200_OK)

            ticket.is_checked_in = True
            ticket.checked_in_at = timezone.now()
            ticket.checked_in_by = request.user
            ticket.save()

            return Response({
                'message': f"Attendee {ticket.attendee_name} successfully checked in!",
                'ticket': TicketSerializer(ticket).data,
                'already_checked_in': False
            }, status=status.HTTP_200_OK)

        except Ticket.DoesNotExist:
            return Response({'error': 'Ticket not found.'}, status=status.HTTP_404_NOT_FOUND)
