from django.urls import path
from .views import NotificationListView, MarkNotificationReadView, MarkAllNotificationsReadView

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('notifications/<int:id>/read/', MarkNotificationReadView.as_view(), name='notification-mark-read'),
    path('notifications/read-all/', MarkAllNotificationsReadView.as_view(), name='notifications-read-all'),
]
