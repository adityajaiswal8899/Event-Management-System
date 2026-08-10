from rest_framework import permissions
from .models import UserRole

class IsAdminUser(permissions.BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == UserRole.ADMIN or request.user.is_superuser or request.user.is_staff))


class IsOrganizerUser(permissions.BasePermission):
    """Allows access to organizers and admins."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role in [UserRole.ORGANIZER, UserRole.ADMIN] or request.user.is_staff)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allows access only to the owner of the object or admins."""
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRole.ADMIN or request.user.is_superuser:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'organizer'):
            return obj.organizer == request.user
        return obj == request.user
