from rest_framework import serializers
from .models import Category, Event, EventImage, Speaker, EventSchedule, TicketType, Wishlist
from apps.users.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    event_count = serializers.ReadOnlyField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'description', 'image_url', 'is_popular', 'order', 'event_count']


class SpeakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Speaker
        fields = ['id', 'name', 'designation', 'company', 'bio', 'avatar_url', 'twitter', 'linkedin', 'email', 'order']


class EventScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSchedule
        fields = ['id', 'day_number', 'day_date', 'start_time', 'end_time', 'title', 'description', 'speaker_name', 'location_room', 'order']


class TicketTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketType
        fields = [
            'id', 'name', 'description', 'perks', 'price', 'original_price',
            'total_quantity', 'available_quantity', 'max_per_booking',
            'sales_start', 'sales_end', 'is_active', 'order'
        ]


class EventImageSerializer(serializers.ModelSerializer):
    display_url = serializers.ReadOnlyField()

    class Meta:
        model = EventImage
        fields = ['id', 'image', 'image_url', 'display_url', 'caption', 'order']


class EventListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    organizer = UserSerializer(read_only=True)
    display_banner = serializers.ReadOnlyField()
    lowest_price = serializers.ReadOnlyField()
    highest_price = serializers.ReadOnlyField()
    available_seats = serializers.ReadOnlyField()
    total_seats = serializers.ReadOnlyField()
    is_sold_out = serializers.ReadOnlyField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'short_description', 'display_banner',
            'category', 'organizer', 'event_type', 'venue_name', 'address',
            'city', 'state', 'country', 'start_date', 'end_date', 'start_time', 'end_time',
            'status', 'is_featured', 'is_trending', 'lowest_price', 'highest_price',
            'available_seats', 'total_seats', 'is_sold_out', 'average_rating', 'total_reviews',
            'is_wishlisted', 'created_at'
        ]

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return 5.0

    def get_total_reviews(self, obj):
        return obj.reviews.count()

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.wishlisted_by.filter(user=request.user).exists()
        return False


class EventDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    organizer = UserSerializer(read_only=True)
    gallery_images = EventImageSerializer(many=True, read_only=True)
    speakers = SpeakerSerializer(many=True, read_only=True)
    schedules = EventScheduleSerializer(many=True, read_only=True)
    ticket_types = TicketTypeSerializer(many=True, read_only=True)
    display_banner = serializers.ReadOnlyField()
    lowest_price = serializers.ReadOnlyField()
    highest_price = serializers.ReadOnlyField()
    available_seats = serializers.ReadOnlyField()
    total_seats = serializers.ReadOnlyField()
    is_sold_out = serializers.ReadOnlyField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()
    related_events = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'short_description', 'description',
            'display_banner', 'banner_image_url', 'category', 'organizer',
            'event_type', 'venue_name', 'address', 'city', 'state', 'country',
            'postal_code', 'google_maps_url', 'online_meeting_url',
            'start_date', 'end_date', 'start_time', 'end_time', 'timezone',
            'status', 'rejection_reason', 'is_featured', 'is_trending',
            'contact_email', 'contact_phone', 'terms_conditions',
            'lowest_price', 'highest_price', 'available_seats', 'total_seats',
            'is_sold_out', 'average_rating', 'total_reviews', 'is_wishlisted',
            'gallery_images', 'speakers', 'schedules', 'ticket_types',
            'related_events', 'created_at', 'updated_at'
        ]

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return 5.0

    def get_total_reviews(self, obj):
        return obj.reviews.count()

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.wishlisted_by.filter(user=request.user).exists()
        return False

    def get_related_events(self, obj):
        if not obj.category:
            return []
        related = Event.objects.filter(
            category=obj.category,
            status='PUBLISHED'
        ).exclude(id=obj.id).order_by('-start_date')[:3]
        return EventListSerializer(related, many=True, context=self.context).data


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    speakers_data = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    schedules_data = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    ticket_types_data = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    gallery_urls = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)

    class Meta:
        model = Event
        fields = [
            'id', 'category', 'title', 'short_description', 'description',
            'banner_image', 'banner_image_url', 'event_type', 'venue_name',
            'address', 'city', 'state', 'country', 'postal_code',
            'google_maps_url', 'online_meeting_url', 'start_date', 'end_date',
            'start_time', 'end_time', 'timezone', 'status',
            'contact_email', 'contact_phone', 'terms_conditions',
            'speakers_data', 'schedules_data', 'ticket_types_data', 'gallery_urls'
        ]

    def create(self, validated_data):
        speakers_data = validated_data.pop('speakers_data', [])
        schedules_data = validated_data.pop('schedules_data', [])
        ticket_types_data = validated_data.pop('ticket_types_data', [])
        gallery_urls = validated_data.pop('gallery_urls', [])

        user = self.context['request'].user
        validated_data['organizer'] = user
        
        # If user is admin, can auto-publish if status specified; organizers submit as pending or draft
        if getattr(user, 'role', None) != 'ADMIN' and validated_data.get('status') == 'PUBLISHED':
            validated_data['status'] = 'PENDING_APPROVAL'

        event = Event.objects.create(**validated_data)

        # Create Ticket Types
        for idx, t_data in enumerate(ticket_types_data):
            qty = int(t_data.get('total_quantity', 100))
            TicketType.objects.create(
                event=event,
                name=t_data.get('name', 'General Admission'),
                description=t_data.get('description', ''),
                perks=t_data.get('perks', []),
                price=t_data.get('price', 0),
                original_price=t_data.get('original_price'),
                total_quantity=qty,
                available_quantity=qty,
                max_per_booking=t_data.get('max_per_booking', 10),
                sales_start=t_data.get('sales_start'),
                sales_end=t_data.get('sales_end'),
                is_active=t_data.get('is_active', True),
                order=t_data.get('order', idx)
            )

        # Create Speakers
        for idx, s_data in enumerate(speakers_data):
            Speaker.objects.create(
                event=event,
                name=s_data.get('name', ''),
                designation=s_data.get('designation', ''),
                company=s_data.get('company', ''),
                bio=s_data.get('bio', ''),
                avatar_url=s_data.get('avatar_url', ''),
                twitter=s_data.get('twitter', ''),
                linkedin=s_data.get('linkedin', ''),
                email=s_data.get('email', ''),
                order=s_data.get('order', idx)
            )

        # Create Schedules
        for idx, sc_data in enumerate(schedules_data):
            EventSchedule.objects.create(
                event=event,
                day_number=sc_data.get('day_number', 1),
                day_date=sc_data.get('day_date'),
                start_time=sc_data.get('start_time', '09:00:00'),
                end_time=sc_data.get('end_time', '10:00:00'),
                title=sc_data.get('title', ''),
                description=sc_data.get('description', ''),
                speaker_name=sc_data.get('speaker_name', ''),
                location_room=sc_data.get('location_room', ''),
                order=sc_data.get('order', idx)
            )

        # Create Gallery Images
        for idx, url in enumerate(gallery_urls):
            EventImage.objects.create(
                event=event,
                image_url=url,
                order=idx
            )

        return event

    def update(self, instance, validated_data):
        speakers_data = validated_data.pop('speakers_data', None)
        schedules_data = validated_data.pop('schedules_data', None)
        ticket_types_data = validated_data.pop('ticket_types_data', None)
        gallery_urls = validated_data.pop('gallery_urls', None)

        user = self.context['request'].user
        if getattr(user, 'role', None) != 'ADMIN' and validated_data.get('status') == 'PUBLISHED':
            validated_data['status'] = 'PENDING_APPROVAL'

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if ticket_types_data is not None:
            existing_ticket_ids = []
            for idx, t_data in enumerate(ticket_types_data):
                t_id = t_data.get('id')
                qty = int(t_data.get('total_quantity', 100))
                avail = int(t_data.get('available_quantity', qty))
                
                ticket_obj = None
                if t_id:
                    ticket_obj = TicketType.objects.filter(id=t_id, event=instance).first()

                if ticket_obj:
                    ticket_obj.name = t_data.get('name', ticket_obj.name)
                    ticket_obj.description = t_data.get('description', ticket_obj.description)
                    ticket_obj.perks = t_data.get('perks', ticket_obj.perks)
                    ticket_obj.price = t_data.get('price', ticket_obj.price)
                    ticket_obj.original_price = t_data.get('original_price', ticket_obj.original_price)
                    ticket_obj.total_quantity = qty
                    ticket_obj.available_quantity = avail
                    ticket_obj.max_per_booking = t_data.get('max_per_booking', ticket_obj.max_per_booking)
                    ticket_obj.sales_start = t_data.get('sales_start', ticket_obj.sales_start)
                    ticket_obj.sales_end = t_data.get('sales_end', ticket_obj.sales_end)
                    ticket_obj.is_active = t_data.get('is_active', ticket_obj.is_active)
                    ticket_obj.order = t_data.get('order', idx)
                    ticket_obj.save()
                    existing_ticket_ids.append(ticket_obj.id)
                else:
                    new_ticket = TicketType.objects.create(
                        event=instance,
                        name=t_data.get('name', 'General Admission'),
                        description=t_data.get('description', ''),
                        perks=t_data.get('perks', []),
                        price=t_data.get('price', 0),
                        original_price=t_data.get('original_price'),
                        total_quantity=qty,
                        available_quantity=avail,
                        max_per_booking=t_data.get('max_per_booking', 10),
                        sales_start=t_data.get('sales_start'),
                        sales_end=t_data.get('sales_end'),
                        is_active=t_data.get('is_active', True),
                        order=t_data.get('order', idx)
                    )
                    existing_ticket_ids.append(new_ticket.id)
            
            # Safely delete removed ticket types that have no bookings
            for old_t in instance.ticket_types.exclude(id__in=existing_ticket_ids):
                if not old_t.booking_items.exists():
                    old_t.delete()
                else:
                    old_t.is_active = False
                    old_t.save()

        if speakers_data is not None:
            instance.speakers.all().delete()
            for idx, s_data in enumerate(speakers_data):
                Speaker.objects.create(
                    event=instance,
                    name=s_data.get('name', ''),
                    designation=s_data.get('designation', ''),
                    company=s_data.get('company', ''),
                    bio=s_data.get('bio', ''),
                    avatar_url=s_data.get('avatar_url', ''),
                    twitter=s_data.get('twitter', ''),
                    linkedin=s_data.get('linkedin', ''),
                    email=s_data.get('email', ''),
                    order=s_data.get('order', idx)
                )

        if schedules_data is not None:
            instance.schedules.all().delete()
            for idx, sc_data in enumerate(schedules_data):
                EventSchedule.objects.create(
                    event=instance,
                    day_number=sc_data.get('day_number', 1),
                    day_date=sc_data.get('day_date'),
                    start_time=sc_data.get('start_time', '09:00:00'),
                    end_time=sc_data.get('end_time', '10:00:00'),
                    title=sc_data.get('title', ''),
                    description=sc_data.get('description', ''),
                    speaker_name=sc_data.get('speaker_name', ''),
                    location_room=sc_data.get('location_room', ''),
                    order=sc_data.get('order', idx)
                )

        if gallery_urls is not None:
            instance.gallery_images.all().delete()
            for idx, url in enumerate(gallery_urls):
                EventImage.objects.create(event=instance, image_url=url, order=idx)

        return instance
