import uuid
from typing import Any
from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.utils import timezone
from datetime import timedelta

class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrator'
    ORGANIZER = 'ORGANIZER', 'Event Organizer'
    ATTENDEE = 'ATTENDEE', 'Attendee / User'


class CustomUserManager(UserManager):
    def create_user(self, username=None, email=None, password=None, **extra_fields):
        # Handle cases where email is passed as 1st positional arg or username contains @
        if username and '@' in str(username) and not email:
            email = username
            username = email.split('@')[0]
        elif email and '@' in str(email) and not username:
            username = email.split('@')[0]
        elif not email and not username:
            raise ValueError('Either email or username must be set.')

        if not email and username:
            email = f"{username}@example.com"

        email = self.normalize_email(email)
        if not username:
            username = email.split('@')[0]

        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username=None, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username=username, email=email, password=password, **extra_fields)


class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.ATTENDEE
    )
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    # Organizer specific fields
    organization_name = models.CharField(max_length=200, blank=True, null=True)
    organization_description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    is_verified_organizer = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()
    reset_tokens: Any
    organized_events: Any
    bookings: Any
    event_reviews: Any
    my_tickets: Any
    notifications: Any
    payments: Any

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN or self.is_superuser or self.is_staff

    @property
    def is_organizer(self):
        return self.role == UserRole.ORGANIZER or self.is_admin

    @property
    def full_name(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else self.username

    @property
    def display_avatar(self):
        avatar_file_url = getattr(self.avatar, 'url', None) if self.avatar else None
        if avatar_file_url:
            return avatar_file_url
        if self.avatar_url:
            return self.avatar_url
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={self.username}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    objects = models.Manager()

    def is_valid(self):
        return not self.used and timezone.now() <= self.created_at + timedelta(hours=2)
