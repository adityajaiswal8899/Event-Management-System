from django.urls import path
from .views import UserTicketListView, TicketDetailView, VerifyTicketView, CheckInTicketView

urlpatterns = [
    path('tickets/', UserTicketListView.as_view(), name='user-tickets'),
    path('tickets/<uuid:id>/', TicketDetailView.as_view(), name='ticket-detail'),
    path('tickets/verify/', VerifyTicketView.as_view(), name='verify-ticket'),
    path('tickets/<uuid:id>/check-in/', CheckInTicketView.as_view(), name='checkin-ticket'),
]
