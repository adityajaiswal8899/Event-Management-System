from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer
from apps.events.models import Event

class EventReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        event_id = self.kwargs.get('event_id')
        return Review.objects.filter(event_id=event_id).order_by('-created_at')

    def perform_create(self, serializer):
        event_id = self.kwargs.get('event_id')
        event = Event.objects.get(id=event_id)
        serializer.save(event=event)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.all()

    def check_object_permissions(self, request, obj):
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            if obj.user != request.user and request.user.role != 'ADMIN':
                self.permission_denied(request, message="You do not have permission to edit/delete this review.")
        super().check_object_permissions(request, obj)
