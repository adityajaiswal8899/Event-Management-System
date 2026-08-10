import uuid
from typing import Any
from django.db import models
from django.utils.text import slugify
from apps.users.models import User

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    icon = models.CharField(max_length=50, default='Calendar', help_text='Lucide icon name')
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    is_popular = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    objects = models.Manager()
    events: Any

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            setattr(self, 'slug', slugify(self.name))
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def event_count(self):
        return self.events.filter(status='PUBLISHED').count()


class EventStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Approval'
    PUBLISHED = 'PUBLISHED', 'Published'
    REJECTED = 'REJECTED', 'Rejected'
    CANCELLED = 'CANCELLED', 'Cancelled'
    COMPLETED = 'COMPLETED', 'Completed'


class EventType(models.TextChoices):
    IN_PERSON = 'IN_PERSON', 'In Person'
    ONLINE = 'ONLINE', 'Online / Virtual'
    HYBRID = 'HYBRID', 'Hybrid'


class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='events')
    
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True, null=True)
    description = models.TextField()
    
    banner_image = models.ImageField(upload_to='events/banners/', blank=True, null=True)
    banner_image_url = models.URLField(max_length=600, blank=True, null=True)
    
    event_type = models.CharField(max_length=20, choices=EventType.choices, default=EventType.IN_PERSON)
    
    # Location
    venue_name = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    google_maps_url = models.URLField(max_length=600, blank=True, null=True)
    online_meeting_url = models.URLField(max_length=600, blank=True, null=True)
    
    # Dates & Times
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    
    # Status & Moderation
    status = models.CharField(max_length=20, choices=EventStatus.choices, default=EventStatus.PENDING_APPROVAL)
    rejection_reason = models.TextField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)
    
    # Organizer contact
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=30, blank=True, null=True)
    terms_conditions = models.TextField(blank=True, null=True)
    
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    ticket_types: Any
    speakers: Any
    schedules: Any
    gallery_images: Any
    reviews: Any
    bookings: Any

    class Meta:
        ordering = ['-start_date', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Event.objects.filter(slug=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            setattr(self, 'slug', slug)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.status})"

    @property
    def display_banner(self):
        banner_url = getattr(self.banner_image, 'url', None) if self.banner_image else None
        if banner_url:
            return banner_url
        if self.banner_image_url:
            return self.banner_image_url
        return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80"

    @property
    def lowest_price(self):
        tickets = self.ticket_types.filter(is_active=True)
        if tickets.exists():
            return min(t.price for t in tickets)
        return 0

    @property
    def highest_price(self):
        tickets = self.ticket_types.filter(is_active=True)
        if tickets.exists():
            return max(t.price for t in tickets)
        return 0

    @property
    def total_seats(self):
        return sum(t.total_quantity for t in self.ticket_types.all())

    @property
    def available_seats(self):
        return sum(t.available_quantity for t in self.ticket_types.all())

    @property
    def is_sold_out(self):
        return self.available_seats <= 0


class EventImage(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ImageField(upload_to='events/gallery/', blank=True, null=True)
    image_url = models.URLField(max_length=600, blank=True, null=True)
    caption = models.CharField(max_length=200, blank=True, null=True)
    order = models.IntegerField(default=0)

    objects = models.Manager()

    class Meta:
        ordering = ['order']

    @property
    def display_url(self):
        img_url = getattr(self.image, 'url', None) if self.image else None
        return img_url if img_url else self.image_url


class Speaker(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='speakers')
    name = models.CharField(max_length=150)
    designation = models.CharField(max_length=150)
    company = models.CharField(max_length=150, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    order = models.IntegerField(default=0)

    objects = models.Manager()

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.name} - {self.designation}"


class EventSchedule(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='schedules')
    day_number = models.IntegerField(default=1)
    day_date = models.DateField(blank=True, null=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    speaker_name = models.CharField(max_length=150, blank=True, null=True)
    location_room = models.CharField(max_length=100, blank=True, null=True)
    order = models.IntegerField(default=0)

    objects = models.Manager()

    class Meta:
        ordering = ['day_number', 'start_time', 'order']

    def __str__(self):
        return f"Day {self.day_number}: {self.title} ({self.start_time} - {self.end_time})"


class TicketType(models.Model):
    TICKET_NAMES = [
        ('Early Bird', 'Early Bird'),
        ('General Admission', 'General Admission'),
        ('VIP Pass', 'VIP Pass'),
        ('Premium All-Access', 'Premium All-Access'),
        ('Student Pass', 'Student Pass'),
        ('Group Pass', 'Group Pass'),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='ticket_types')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    perks = models.JSONField(default=list, blank=True, help_text='List of perks included')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_quantity = models.PositiveIntegerField(default=100)
    available_quantity = models.PositiveIntegerField(default=100)
    max_per_booking = models.PositiveIntegerField(default=10)
    sales_start = models.DateTimeField(blank=True, null=True)
    sales_end = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    objects = models.Manager()

    class Meta:
        ordering = ['order', 'price']

    def __str__(self):
        return f"{self.event.title} - {self.name} (₹{self.price})"


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    class Meta:
        unique_together = ('user', 'event')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} -> {self.event.title}"
