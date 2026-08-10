from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CreateBookingView, ValidateCouponView, UserBookingListView,
    BookingDetailView, CancelBookingView, AdminBookingListView,
    OrganizerBookingListView, AdminCouponViewSet
)

router = DefaultRouter()
router.register(r'admin/coupons', AdminCouponViewSet, basename='admin-coupons')

urlpatterns = [
    path('bookings/', UserBookingListView.as_view(), name='user-bookings'),
    path('bookings/create/', CreateBookingView.as_view(), name='create-booking'),
    path('bookings/<uuid:id>/', BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/<uuid:id>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),
    path('coupons/validate/', ValidateCouponView.as_view(), name='validate-coupon'),
    
    # Organizer & Admin routes
    path('organizer/bookings/', OrganizerBookingListView.as_view(), name='organizer-bookings'),
    path('admin/bookings/', AdminBookingListView.as_view(), name='admin-bookings'),
    path('', include(router.urls)),
]
