from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryListView, AdminCategoryViewSet, EventListView,
    FeaturedEventsView, TrendingEventsView, UpcomingEventsView,
    EventDetailView, OrganizerEventViewSet, AdminEventApprovalViewSet,
    WishlistToggleView, UserWishlistView
)
from .analytics_views import OrganizerDashboardStatsView, AdminDashboardStatsView

router = DefaultRouter()
router.register(r'organizer/events', OrganizerEventViewSet, basename='organizer-events')
router.register(r'admin/categories', AdminCategoryViewSet, basename='admin-categories')
router.register(r'admin/event-approvals', AdminEventApprovalViewSet, basename='admin-event-approvals')

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='categories-list'),
    path('events/', EventListView.as_view(), name='events-list'),
    path('events/featured/', FeaturedEventsView.as_view(), name='events-featured'),
    path('events/trending/', TrendingEventsView.as_view(), name='events-trending'),
    path('events/upcoming/', UpcomingEventsView.as_view(), name='events-upcoming'),
    path('events/<slug:slug>/', EventDetailView.as_view(), name='event-detail'),
    path('wishlist/', UserWishlistView.as_view(), name='user-wishlist'),
    path('wishlist/toggle/<uuid:event_id>/', WishlistToggleView.as_view(), name='wishlist-toggle'),
    
    # Analytics & Dashboards
    path('organizer/analytics/', OrganizerDashboardStatsView.as_view(), name='organizer-analytics'),
    path('admin/analytics/', AdminDashboardStatsView.as_view(), name='admin-analytics'),
    
    path('', include(router.urls)),
]
