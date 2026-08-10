from django.urls import path
from .views import EventReviewListCreateView, ReviewDetailView

urlpatterns = [
    path('events/<uuid:event_id>/reviews/', EventReviewListCreateView.as_view(), name='event-reviews-list-create'),
    path('reviews/<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
]
