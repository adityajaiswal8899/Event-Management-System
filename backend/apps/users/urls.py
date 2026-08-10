from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, CurrentUserProfileView,
    ChangePasswordView, PasswordResetRequestView, PasswordResetConfirmView,
    AdminUserListView, AdminUserDetailView, OrganizerPublicListView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/', CurrentUserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('organizers/popular/', OrganizerPublicListView.as_view(), name='popular-organizers'),
    
    # Admin routes
    path('admin/users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-users-detail'),
]
