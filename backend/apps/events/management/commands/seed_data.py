from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date, time
from decimal import Decimal
from apps.users.models import User, UserRole
from apps.events.models import Category, Event, EventStatus, EventType, EventImage, Speaker, EventSchedule, TicketType
from apps.bookings.models import Coupon, DiscountType, Booking, BookingItem, BookingStatus
from apps.payments.models import Payment, PaymentStatus
from apps.tickets.models import Ticket
from apps.tickets.utils import generate_tickets_for_booking
from apps.reviews.models import Review
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Populates the database with realistic sample events, categories, organizers, attendees, and tickets.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding EventSphere database...")

        # 1. Users
        admin_user, _ = User.objects.get_or_create(
            email='admin@eventsphere.com',
            defaults={
                'username': 'admin',
                'first_name': 'Alexander',
                'last_name': 'Vance',
                'role': UserRole.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'bio': 'Chief Platform Administrator & Operations Director'
            }
        )
        admin_user.set_password('Admin@123')
        admin_user.save()

        organizer1, _ = User.objects.get_or_create(
            email='organizer@techsummit.com',
            defaults={
                'username': 'technova',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'role': UserRole.ORGANIZER,
                'organization_name': 'TechNova Conferences Global',
                'organization_description': 'Premier organizer of global technology, AI and developer summits.',
                'website': 'https://technovaglobal.io',
                'is_verified_organizer': True,
                'avatar_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
                'bio': 'Tech visionary and curator of global innovation gatherings.'
            }
        )
        organizer1.set_password('Organizer@123')
        organizer1.save()

        organizer2, _ = User.objects.get_or_create(
            email='music@vibes.com',
            defaults={
                'username': 'pulsarlive',
                'first_name': 'Marcus',
                'last_name': 'Chen',
                'role': UserRole.ORGANIZER,
                'organization_name': 'Pulsar Live & Festivals',
                'organization_description': 'Curating unforgettable live music concerts, acoustic nights and cultural carnivals.',
                'website': 'https://pulsarlive.events',
                'is_verified_organizer': True,
                'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
                'bio': 'Passionate festival director bringing world-class artists to vibrant venues.'
            }
        )
        organizer2.set_password('Organizer@123')
        organizer2.save()

        attendee1, _ = User.objects.get_or_create(
            email='john.doe@example.com',
            defaults={
                'username': 'johndoe',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': UserRole.ATTENDEE,
                'avatar_url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
                'phone': '+91 98765 43210',
                'bio': 'Software Engineer & Tech Enthusiast'
            }
        )
        attendee1.set_password('User@123')
        attendee1.save()

        attendee2, _ = User.objects.get_or_create(
            email='sarah.smith@example.com',
            defaults={
                'username': 'sarahsmith',
                'first_name': 'Sarah',
                'last_name': 'Smith',
                'role': UserRole.ATTENDEE,
                'avatar_url': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
                'phone': '+91 91234 56789',
                'bio': 'UI/UX Designer and Music Lover'
            }
        )
        attendee2.set_password('User@123')
        attendee2.save()

        # 2. Categories
        categories_data = [
            {'name': 'Technology', 'slug': 'technology', 'icon': 'Cpu', 'description': 'AI, Cloud, Developer Summits, & Next-Gen Innovations', 'image_url': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 1},
            {'name': 'Music & Concerts', 'slug': 'music', 'icon': 'Music', 'description': 'Live Gigs, EDM Nights, Acoustic Concerts & Music Festivals', 'image_url': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 2},
            {'name': 'Business & Startups', 'slug': 'business', 'icon': 'Briefcase', 'description': 'Pitch Days, VC Networking, Leadership & Founder Summits', 'image_url': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 3},
            {'name': 'Design & Creative', 'slug': 'design', 'icon': 'Palette', 'description': 'UI/UX, Visual Arts, Creative Direction & Design Systems', 'image_url': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 4},
            {'name': 'Workshops & Education', 'slug': 'workshops', 'icon': 'GraduationCap', 'description': 'Hands-on Bootcamps, Certifications & Interactive Labs', 'image_url': 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 5},
            {'name': 'Sports & Fitness', 'slug': 'sports', 'icon': 'Trophy', 'description': 'Marathons, CrossFit Challenges, Yoga Retreats & Tournaments', 'image_url': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 6},
            {'name': 'Conferences', 'slug': 'conferences', 'icon': 'Users', 'description': 'Keynotes, Panel Discussions & Industry Mega-Conventions', 'image_url': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80', 'is_popular': False, 'order': 7},
            {'name': 'Food & Drinks', 'slug': 'food-drinks', 'icon': 'Utensils', 'description': 'Culinary Festivals, Craft Beer Tasting & Gourmet Pop-ups', 'image_url': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80', 'is_popular': False, 'order': 8},
            {'name': 'Networking', 'slug': 'networking', 'icon': 'Network', 'description': 'Executive Mixers, Speed Mentoring & Community Meetups', 'image_url': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80', 'is_popular': False, 'order': 9},
            {'name': 'Cultural & Arts', 'slug': 'cultural', 'icon': 'Sparkles', 'description': 'Heritage Shows, Theatre, Poetry Slams & Art Exhibitions', 'image_url': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80', 'is_popular': False, 'order': 10},
        ]

        cat_objs = {}
        for cdata in categories_data:
            c_obj, created = Category.objects.update_or_create(slug=cdata['slug'], defaults=cdata)
            cat_objs[cdata['slug']] = c_obj

        # 3. Coupons
        coupons_data = [
            {
                'code': 'WELCOME50',
                'discount_type': DiscountType.PERCENTAGE,
                'discount_value': Decimal('50.00'),
                'max_discount_amount': Decimal('500.00'),
                'min_order_amount': Decimal('499.00'),
                'max_uses': 500,
                'valid_until': timezone.now() + timedelta(days=90),
                'is_active': True
            },
            {
                'code': 'EARLYBIRD',
                'discount_type': DiscountType.PERCENTAGE,
                'discount_value': Decimal('20.00'),
                'max_discount_amount': Decimal('1000.00'),
                'min_order_amount': Decimal('200.00'),
                'max_uses': 1000,
                'valid_until': timezone.now() + timedelta(days=60),
                'is_active': True
            },
            {
                'code': 'FLAT100',
                'discount_type': DiscountType.FIXED,
                'discount_value': Decimal('100.00'),
                'min_order_amount': Decimal('300.00'),
                'max_uses': 200,
                'valid_until': timezone.now() + timedelta(days=30),
                'is_active': True
            }
        ]
        for cp in coupons_data:
            Coupon.objects.get_or_create(code=cp['code'], defaults=cp)

        # 4. Rich Sample Events
        events_spec = [
            {
                'title': 'Global AI & Cloud Innovation Summit 2026',
                'slug': 'global-ai-cloud-innovation-summit-2026',
                'category': cat_objs['technology'],
                'organizer': organizer1,
                'short_description': 'Join 3,000+ AI researchers, tech executives, and full-stack builders exploring GenAI, Autonomous Agents, and Scalable Cloud Infrastructure.',
                'description': """Welcome to the flagship edition of the Global AI & Cloud Innovation Summit 2026. 

Over 2 power-packed days, engage in 40+ keynotes, technical deep-dives, live coding demos, and networking lounges with leaders from top tech giants, venture capital firms, and hyper-growth AI startups.

### Summit Highlights:
- **Next-Gen LLMs & Multi-Modal Intelligence**: Architectural breakdowns and production deployment strategies.
- **Autonomous Agents in Enterprise**: Real-world case studies on deploying autonomous AI workflows securely.
- **Cloud Architecture & Zero-Latency Pipelines**: Modern DevOps, Kubernetes orchestration, and GPU clusters.
- **VIP Networking Dinner & Pitch Lounge**: Connect directly with accredited investors and tech luminaries.

All ticket tiers include gourmet lunch, access to summit recording library, interactive QA sessions, and official digital certification.""",
                'banner_image_url': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.HYBRID,
                'venue_name': 'KTPO Convention Centre, Whitefield',
                'address': 'Plot No 25-P, EPIP Zone, Whitefield',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'country': 'India',
                'postal_code': '560066',
                'google_maps_url': 'https://maps.google.com/?q=KTPO+Bengaluru',
                'online_meeting_url': 'https://stream.eventsphere.com/ai-summit-2026',
                'start_date': timezone.now().date() + timedelta(days=14),
                'end_date': timezone.now().date() + timedelta(days=15),
                'start_time': time(9, 0),
                'end_time': time(18, 30),
                'status': EventStatus.PUBLISHED,
                'is_featured': True,
                'is_trending': True,
                'contact_email': 'contact@technovaglobal.io',
                'contact_phone': '+91 80 4912 3000',
                'terms_conditions': 'Tickets are non-refundable after 48 hours prior to the event. Badges are transferable upon written notice.',
                'tickets': [
                    {'name': 'Early Bird Pass', 'price': Decimal('999.00'), 'original_price': Decimal('1999.00'), 'total_quantity': 150, 'available_quantity': 42, 'perks': ['Full 2-Day Conference Access', 'Keynote & Breakout Sessions', 'Digital Attendee Kit', 'Conference Lunch & Coffee']},
                    {'name': 'Standard Delegate Pass', 'price': Decimal('1999.00'), 'original_price': Decimal('2499.00'), 'total_quantity': 300, 'available_quantity': 180, 'perks': ['All Early Bird Perks', 'Exclusive Hands-on AI Workshop', 'Access to Summit Recordings for 1 Year', 'Official Verified Certificate']},
                    {'name': 'VIP All-Access Pass', 'price': Decimal('4999.00'), 'original_price': Decimal('6999.00'), 'total_quantity': 50, 'available_quantity': 18, 'perks': ['Front-Row Reserved Seating', 'VIP Lounge & Networking Dinner', '1-on-1 Speaker Meet & Greet', 'Fast-Track Check-In', 'Custom Summit Gift Hamper']},
                ],
                'speakers': [
                    {'name': 'Dr. Aris Thorne', 'designation': 'VP of Machine Learning', 'company': 'NeuralGrid AI', 'bio': 'Leading multi-agent research with 15+ years in high-performance neural computing.', 'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', 'twitter': 'https://twitter.com', 'linkedin': 'https://linkedin.com'},
                    {'name': 'Pooja Narang', 'designation': 'Principal Cloud Architect', 'company': 'Hyperscale Labs', 'bio': 'Specializing in resilient distributed architectures and multi-region Kubernetes.', 'avatar_url': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80', 'twitter': 'https://twitter.com', 'linkedin': 'https://linkedin.com'},
                    {'name': 'Vikram Seth', 'designation': 'Founder & CEO', 'company': 'OmniAgent Systems', 'bio': 'Forbes 30 Under 30 entrepreneur scaling agentic AI products to millions of users.', 'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', 'twitter': 'https://twitter.com', 'linkedin': 'https://linkedin.com'},
                ],
                'schedules': [
                    {'day_number': 1, 'start_time': time(9, 0), 'end_time': time(10, 30), 'title': 'Opening Keynote: The Dawn of Multi-Modal Autonomous Agents', 'speaker_name': 'Dr. Aris Thorne', 'location_room': 'Grand Hall Alpha', 'description': 'A deep analysis of the frontier AI paradigm shift and what it means for modern software development.'},
                    {'day_number': 1, 'start_time': time(11, 0), 'end_time': time(12, 30), 'title': 'Production Architecture: Scalable Inference at Sub-50ms Latency', 'speaker_name': 'Pooja Narang', 'location_room': 'Hall Beta', 'description': 'Hands-on design patterns for building zero-cold-start inference services on GPU clusters.'},
                    {'day_number': 1, 'start_time': time(14, 0), 'end_time': time(16, 0), 'title': 'Live Workshop: Building Resilient Agentic Workflows', 'speaker_name': 'Vikram Seth', 'location_room': 'Lab 4', 'description': 'Code live with us to assemble self-healing autonomous agents.'},
                    {'day_number': 2, 'start_time': time(10, 0), 'end_time': time(12, 0), 'title': 'Panel Discussion: Enterprise Security & Guardrails in Generative Systems', 'speaker_name': 'All Keynote Speakers', 'location_room': 'Grand Hall Alpha', 'description': 'Governance, compliance, and red-teaming production AI models.'},
                ],
                'gallery': [
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80'
                ]
            },
            {
                'title': 'Neon Horizons: Electronic Music & Arts Festival',
                'slug': 'neon-horizons-electronic-music-festival',
                'category': cat_objs['music'],
                'organizer': organizer2,
                'short_description': '3 stages of hypnotic basslines, immersive laser architecture, international DJs, and sunset beach vibes in North Goa.',
                'description': """Immerse yourself in Neon Horizons – India's most breathtaking electronic music, visual arts, and coastal culture experience.

Featuring over 24 global acts across 3 uniquely crafted stages: The Solar Stage (Melodic House & Techno), The Bass Lagoon (Future Bass & Drum & Bass), and The Ambient Haven (Chillout & Sound Healing).

### What to Expect:
- Spectacular visual art installations, holographic projection mapping, and fireworks.
- Beachside food village with artisanal cocktail bars and organic vegan trucks.
- Chill-out zones, hammock gardens, and sunset yoga sessions.
- Secure lockers, eco-friendly water refilling stations, and medical support on-site.""",
                'banner_image_url': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Vagator Beach Arena & Cliffs',
                'address': 'Near Chapora Fort Road, Vagator',
                'city': 'Goa',
                'state': 'Goa',
                'country': 'India',
                'postal_code': '403509',
                'google_maps_url': 'https://maps.google.com/?q=Vagator+Beach+Goa',
                'start_date': timezone.now().date() + timedelta(days=21),
                'end_date': timezone.now().date() + timedelta(days=22),
                'start_time': time(16, 0),
                'end_time': time(23, 59),
                'status': EventStatus.PUBLISHED,
                'is_featured': True,
                'is_trending': True,
                'contact_email': 'support@pulsarlive.events',
                'contact_phone': '+91 832 245 9900',
                'terms_conditions': 'Strictly 18+ event. Valid government ID required at entry gate. Wristbands must be worn at all times.',
                'tickets': [
                    {'name': 'General Admission Phase 1', 'price': Decimal('1499.00'), 'original_price': Decimal('2499.00'), 'total_quantity': 400, 'available_quantity': 120, 'perks': ['Entry to all 3 Music Stages', 'Access to Beach Food Village', 'Free Eco Cup & Wristband']},
                    {'name': 'VIP Elevated Deck Pass', 'price': Decimal('3499.00'), 'original_price': Decimal('4999.00'), 'total_quantity': 100, 'available_quantity': 28, 'perks': ['Elevated VIP Deck Views', 'Exclusive VIP Bar & Restrooms', 'Dedicated Express Entry Lane', 'Welcome Drink Coupon Included']},
                ],
                'speakers': [
                    {'name': 'DJ Kaelen Voss', 'designation': 'Headliner & Producer', 'company': 'Berlin Soundworks', 'bio': 'Internationally acclaimed techno producer with top charted tracks on Beatport.', 'avatar_url': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80', 'twitter': 'https://twitter.com', 'linkedin': ''},
                    {'name': 'Astraea', 'designation': 'Live Synthesist & DJ', 'company': 'Solaris Records', 'bio': 'Master of melodic techno and hypnotic audio-visual live sets.', 'avatar_url': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80', 'twitter': 'https://twitter.com', 'linkedin': ''}
                ],
                'schedules': [
                    {'day_number': 1, 'start_time': time(16, 0), 'end_time': time(19, 0), 'title': 'Sunset Ambient & Melodic Opening', 'speaker_name': 'Astraea', 'location_room': 'Solar Stage', 'description': 'Warm-up melodies as the sun sets over the Arabian Sea.'},
                    {'day_number': 1, 'start_time': time(20, 0), 'end_time': time(23, 59), 'title': 'Midnight Headliner Set: Kaelen Voss Live', 'speaker_name': 'DJ Kaelen Voss', 'location_room': 'Main Stage', 'description': 'Hypnotic driving techno with 3D laser synchronizations.'},
                ],
                'gallery': [
                    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'
                ]
            },
            {
                'title': 'NextGen Founders & Venture Capital Pitch Summit',
                'slug': 'nextgen-founders-vc-pitch-summit-2026',
                'category': cat_objs['business'],
                'organizer': organizer1,
                'short_description': 'Connecting high-growth B2B & consumer tech startups with Tier-1 Venture Capitalists and angel syndicates.',
                'description': """Are you ready to scale your venture? The NextGen Founders & Venture Capital Pitch Summit brings together 50+ curated investors managing over $2B in AUM and 100 high-potential seed to Series-A founders.

### Summit Format:
- **Curated 1-on-1 Speed Pitching**: 15-minute dedicated investor matchmaking slots.
- **Masterclasses on Unit Economics & SaaS GTM**: Delivered by founders who scaled to $50M+ ARR.
- **Live Shark Pitch Competition**: Top 10 finalists pitch on stage for a ₹1 Crore non-dilutive grant pool.
- **Closed-Door Investor Cocktail Hour**: Exclusive networking for funded founders and GP partners.""",
                'banner_image_url': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'St. Regis Grand Ballroom, Lower Parel',
                'address': '462 Senapati Bapat Marg, Lower Parel',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'country': 'India',
                'postal_code': '400013',
                'google_maps_url': 'https://maps.google.com/?q=St+Regis+Mumbai',
                'start_date': timezone.now().date() + timedelta(days=28),
                'end_date': timezone.now().date() + timedelta(days=28),
                'start_time': time(9, 30),
                'end_time': time(19, 0),
                'status': EventStatus.PUBLISHED,
                'is_featured': True,
                'is_trending': False,
                'contact_email': 'pitch@technovaglobal.io',
                'contact_phone': '+91 22 6162 8000',
                'terms_conditions': 'Founder pitches are subject to committee selection. Attendee passes include full conference access and lunch.',
                'tickets': [
                    {'name': 'Founder Observer Pass', 'price': Decimal('2499.00'), 'original_price': Decimal('3499.00'), 'total_quantity': 120, 'available_quantity': 65, 'perks': ['Access to All Keynotes & Panel Tracks', 'Lunch & Networking Breaks', 'Access to Startup Exhibition Hall']},
                    {'name': 'Pitching Startup Pass (Includes 2 Founders)', 'price': Decimal('7999.00'), 'original_price': Decimal('9999.00'), 'total_quantity': 30, 'available_quantity': 7, 'perks': ['Stage Pitch Slot for 2 Founders', 'Curated 1-on-1 Investor Matchmaking', 'Startup Booth Space', 'Access to Investor VIP Lounge & Dinner']},
                ],
                'speakers': [
                    {'name': 'Devika Singhania', 'designation': 'Managing Partner', 'company': 'Horizon Ventures', 'bio': 'Early backer of 4 unicorn startups with over 18 years in venture investing.', 'avatar_url': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80', 'twitter': 'https://twitter.com', 'linkedin': 'https://linkedin.com'},
                    {'name': 'Rahul Kothari', 'designation': 'Co-Founder & CEO', 'company': 'PaySphere Technologies', 'bio': 'Scaled fintech enterprise solution to $40M ARR and 5,000 corporate clients.', 'avatar_url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', 'twitter': 'https://twitter.com', 'linkedin': 'https://linkedin.com'}
                ],
                'schedules': [
                    {'day_number': 1, 'start_time': time(9, 30), 'end_time': time(11, 0), 'title': 'State of Venture Capital 2026: Where the Smart Money is Flowing', 'speaker_name': 'Devika Singhania', 'location_room': 'Grand Ballroom', 'description': 'Macro analysis of funding trends, valuation multiples, and early-stage opportunities.'},
                    {'day_number': 1, 'start_time': time(14, 0), 'end_time': time(17, 30), 'title': 'Live Shark Pitch Competition & Awards', 'speaker_name': 'Selected Founders & Jury', 'location_room': 'Grand Ballroom', 'description': 'Fast-paced 5-minute pitches with real-time feedback from venture capitalists.'},
                ],
                'gallery': [
                    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80'
                ]
            },
            {
                'title': 'Mastering Modern UI/UX & Design Systems',
                'slug': 'mastering-modern-ui-ux-design-systems',
                'category': cat_objs['design'],
                'organizer': organizer1,
                'short_description': 'A comprehensive 2-day live interactive masterclass on crafting scalable design tokens, micro-interactions, and Figma to Code pipelines.',
                'description': """Elevate your product design craft to world-class standards. This hands-on masterclass dives deep into creating responsive design systems, ergonomic micro-interactions, dark mode color science, and automated Figma-to-Tailwind pipelines.

### Masterclass Curriculum:
1. **Color Geometry & Contrast Ratios**: Building accessible, vibrant HSL palettes and dynamic themes.
2. **Tokens, Components, & Variables in Figma**: Streamlining engineering handoff.
3. **Motion Design & Micro-Animations**: Designing joyful UI feedback loops with Framer & CSS.
4. **Interactive Design System Review**: Real-time critique of participant portfolio projects.""",
                'banner_image_url': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Live Interactive Virtual Studio',
                'address': 'Online Webinar / Zoom Pro',
                'city': 'Online',
                'country': 'India',
                'online_meeting_url': 'https://zoom.us/j/eventsphere-design-masterclass',
                'start_date': timezone.now().date() + timedelta(days=7),
                'end_date': timezone.now().date() + timedelta(days=8),
                'start_time': time(10, 0),
                'end_time': time(14, 0),
                'status': EventStatus.PUBLISHED,
                'is_featured': False,
                'is_trending': True,
                'contact_email': 'workshops@technovaglobal.io',
                'terms_conditions': 'Participants receive full lifetime access to session recordings and Figma starter kits.',
                'tickets': [
                    {'name': 'Online Live Ticket', 'price': Decimal('499.00'), 'original_price': Decimal('999.00'), 'total_quantity': 250, 'available_quantity': 114, 'perks': ['2 Days Live HD Interactive Stream', 'Figma Component & Token Template Kit', 'Q&A Chat Access', 'Certificate of Completion']},
                    {'name': 'Pro Ticket + Portfolio Critique', 'price': Decimal('1499.00'), 'original_price': Decimal('2499.00'), 'total_quantity': 40, 'available_quantity': 12, 'perks': ['All Live Stream Perks', '1-on-1 20-min Portfolio Video Critique', 'Lifetime Access to Design System Library']},
                ],
                'speakers': [
                    {'name': 'Zara Qureshi', 'designation': 'Lead Design Architect', 'company': 'PixelCraft Studio', 'bio': 'Product designer who created design systems used by over 50M daily active users.', 'avatar_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', 'twitter': 'https://twitter.com', 'linkedin': 'https://linkedin.com'}
                ],
                'schedules': [
                    {'day_number': 1, 'start_time': time(10, 0), 'end_time': time(12, 0), 'title': 'Design Token Architecture & Dark Mode Theming', 'speaker_name': 'Zara Qureshi', 'location_room': 'Live Stream 1', 'description': 'Building mathematically balanced type scales and dark mode lightness curves.'},
                    {'day_number': 2, 'start_time': time(10, 0), 'end_time': time(12, 30), 'title': 'Figma to React & Tailwind Code Automation', 'speaker_name': 'Zara Qureshi', 'location_room': 'Live Stream 1', 'description': 'Integrating design systems directly into modern component libraries.'},
                ],
                'gallery': [
                    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80'
                ]
            },
            {
                'title': 'National Marathon & Sunrise Fitness Carnival',
                'slug': 'national-marathon-fitness-carnival-2026',
                'category': cat_objs['sports'],
                'organizer': organizer2,
                'short_description': 'Run through the iconic monuments of New Delhi in 5K, 10K, and 21K Half Marathon categories with live cheer bands.',
                'description': """Lace up your running shoes for the most exhilarating endurance and fitness celebration of the year!

The National Marathon takes runners through a picturesque scenic loop past historical landmarks with timing chips, hydration stations every kilometer, medical pacers, and high-energy music zones.

### Runner Kit Includes:
- High-Performance Breathable Running Jersey
- RFID Timing Bib Chip
- Finisher Commemorative Heavy Medal
- Hot Healthy Post-Run Breakfast Buffet
- Free High-Resolution Marathon Action Photographs""",
                'banner_image_url': 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Jawaharlal Nehru Stadium',
                'address': 'Pragati Vihar, Lodhi Road',
                'city': 'New Delhi',
                'state': 'Delhi',
                'country': 'India',
                'postal_code': '110003',
                'google_maps_url': 'https://maps.google.com/?q=Jawaharlal+Nehru+Stadium+Delhi',
                'start_date': timezone.now().date() + timedelta(days=35),
                'end_date': timezone.now().date() + timedelta(days=35),
                'start_time': time(5, 30),
                'end_time': time(11, 0),
                'status': EventStatus.PUBLISHED,
                'is_featured': False,
                'is_trending': True,
                'contact_email': 'run@fitindia.org',
                'contact_phone': '+91 11 2436 1000',
                'terms_conditions': 'Participants must collect bib kits 1 day prior at the expo. Medical self-declaration required.',
                'tickets': [
                    {'name': '5K Fun Run & Carnival Walk', 'price': Decimal('599.00'), 'original_price': Decimal('899.00'), 'total_quantity': 500, 'available_quantity': 240, 'perks': ['Official Dri-Fit Jersey', 'Finisher Medal', 'Hot Breakfast', 'Carnival Pass']},
                    {'name': '10K Timed Challenge', 'price': Decimal('899.00'), 'original_price': Decimal('1199.00'), 'total_quantity': 400, 'available_quantity': 180, 'perks': ['RFID Timing Bib', 'Official Dri-Fit Jersey', 'Finisher Medal', 'E-Timing Certificate', 'Breakfast']},
                    {'name': '21.1K Half Marathon Open', 'price': Decimal('1299.00'), 'original_price': Decimal('1699.00'), 'total_quantity': 300, 'available_quantity': 95, 'perks': ['Official Timing Chip & Pacer Group', 'Half Marathoner Tech T-Shirt', 'Engraved Metal Medal', 'Hydration & Nutrition Gel Packs', 'Post-Race Massage Access']},
                ],
                'speakers': [
                    {'name': 'Captain Rajesh Verma', 'designation': 'Ultra-Runner & Coach', 'company': 'IronPace India', 'bio': 'Finished 12 international marathons and trained over 2,000 long-distance runners.', 'avatar_url': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80', 'twitter': '', 'linkedin': ''}
                ],
                'schedules': [
                    {'day_number': 1, 'start_time': time(5, 30), 'end_time': time(6, 0), 'title': 'Warmup Zumba & Flag-off 21K Half Marathon', 'speaker_name': 'Captain Rajesh Verma', 'location_room': 'Starting Arena Gate 1', 'description': 'High tempo group warmup and official start.'},
                    {'day_number': 1, 'start_time': time(9, 30), 'end_time': time(11, 0), 'title': 'Podium Ceremony & Post-Run Music Fiesta', 'speaker_name': 'Organizers', 'location_room': 'Main Stage', 'description': 'Trophy presentations, cash prizes and breakfast party.'},
                ],
                'gallery': [
                    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80'
                ]
            },
            {
                'title': 'CyberShield: Enterprise Security & Cloud Defense',
                'slug': 'cybershield-security-cloud-defense-2026',
                'category': cat_objs['technology'],
                'organizer': organizer1,
                'short_description': 'Defend against modern ransomware, zero-day exploits, and supply chain attacks with top ethical hackers and CISOs.',
                'description': """CyberShield 2026 is the premier gathering for Information Security leaders, ethical penetration testers, SecOps teams, and cloud security architects.

### Highlights:
- Live Red-Team vs Blue-Team CTF (Capture The Flag) Competition with a ₹2.5 Lakh bounty.
- Zero Trust architecture real-world deployment playbooks.
- API security and software supply-chain integrity deep dives.
- Direct networking with top cybersecurity vendors and recruiters.""",
                'banner_image_url': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'HICC Novotel Convention Center',
                'address': 'Near HITEC City, Madhapur',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'country': 'India',
                'postal_code': '500081',
                'google_maps_url': 'https://maps.google.com/?q=HICC+Hyderabad',
                'start_date': timezone.now().date() + timedelta(days=45),
                'end_date': timezone.now().date() + timedelta(days=46),
                'start_time': time(9, 0),
                'end_time': time(18, 0),
                'status': EventStatus.PUBLISHED,
                'is_featured': False,
                'is_trending': False,
                'contact_email': 'security@technovaglobal.io',
                'contact_phone': '+91 40 6682 4422',
                'terms_conditions': 'Participants must bring laptops with Docker/VirtualBox for CTF and lab challenges.',
                'tickets': [
                    {'name': 'Conference Pass', 'price': Decimal('1499.00'), 'original_price': Decimal('2199.00'), 'total_quantity': 200, 'available_quantity': 110, 'perks': ['Access to all 20+ talks', 'Exhibition floor & networking', 'Buffet Lunch & High Tea']},
                    {'name': 'CTF Player + Conference Pass', 'price': Decimal('2499.00'), 'original_price': Decimal('3299.00'), 'total_quantity': 100, 'available_quantity': 35, 'perks': ['Official CTF Entry Badge', 'Custom Hackers Swag Pack', 'All Conference Keynotes & Lunch']},
                ],
                'speakers': [
                    {'name': 'Ananya Roy', 'designation': 'Chief Information Security Officer', 'company': 'Apex Cloud Defense', 'bio': 'Advises Fortune 500 banks on threat mitigation, Zero Trust and cryptography.', 'avatar_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', 'twitter': '', 'linkedin': 'https://linkedin.com'}
                ],
                'schedules': [
                    {'day_number': 1, 'start_time': time(9, 30), 'end_time': time(11, 0), 'title': 'Dissecting Modern Supply Chain Exploits in Cloud Native Stack', 'speaker_name': 'Ananya Roy', 'location_room': 'Main Auditorium', 'description': 'Analysis of actual CVE attack paths and defense mechanisms.'},
                ],
                'gallery': [
                    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80'
                ]
            },
            {
                'title': 'Craft Beer & Culinary Weekend Carnival',
                'slug': 'craft-beer-culinary-weekend-carnival',
                'category': cat_objs['food-drinks'],
                'organizer': organizer2,
                'short_description': 'Celebrate over 30 craft micro-breweries, artisanal food trucks, live acoustic music and chef masterclasses.',
                'description': """Savor the finest handcrafted ales, stouts, ciders, and gourmet street food at the Craft Beer & Culinary Weekend Carnival.

Experience live cooking showdowns by masterchefs, cocktail crafting workshops, giant lawn games, and acoustic indie bands under fairy lights.""",
                'banner_image_url': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'The Royal Palms Turf Club Grounds',
                'address': 'Koregaon Park Annexe',
                'city': 'Pune',
                'state': 'Maharashtra',
                'country': 'India',
                'postal_code': '411001',
                'google_maps_url': 'https://maps.google.com/?q=Koregaon+Park+Pune',
                'start_date': timezone.now().date() + timedelta(days=18),
                'end_date': timezone.now().date() + timedelta(days=19),
                'start_time': time(13, 0),
                'end_time': time(22, 30),
                'status': EventStatus.PENDING_APPROVAL,  # For testing admin approval flow!
                'is_featured': False,
                'is_trending': False,
                'contact_email': 'cheers@vibes.com',
                'contact_phone': '+91 20 2613 4000',
                'terms_conditions': 'Entry allowed for 21 years and above. Drink responsibly.',
                'tickets': [
                    {'name': 'Single Day Tasting Pass', 'price': Decimal('699.00'), 'original_price': Decimal('999.00'), 'total_quantity': 300, 'available_quantity': 300, 'perks': ['Entry to Carnival', 'Commemorative Tasting Glass', '4 Craft Beer Sampler Tokens', 'Live Band Access']},
                    {'name': 'Weekend All-Access Pass', 'price': Decimal('1199.00'), 'original_price': Decimal('1699.00'), 'total_quantity': 150, 'available_quantity': 150, 'perks': ['2 Days Full Access', '8 Tasting Tokens', 'Chef Masterclass Reserved Seat', 'Special Brew Gift Bottle']},
                ],
                'speakers': [],
                'schedules': [],
                'gallery': []
            }
        ]

        created_events = []
        for espec in events_spec:
            tickets_data = list(espec.pop('tickets', []))
            speakers_data = list(espec.pop('speakers', []))
            schedules_data = list(espec.pop('schedules', []))
            gallery_data = list(espec.pop('gallery', []))

            slug = espec.pop('slug')
            event, created = Event.objects.get_or_create(
                slug=slug,
                defaults={
                    'slug': slug,
                    **espec
                }
            )

            # Clear and create related
            event.ticket_types.all().delete()
            for t in tickets_data:
                TicketType.objects.create(event=event, **t)

            event.speakers.all().delete()
            for s in speakers_data:
                Speaker.objects.create(event=event, **s)

            event.schedules.all().delete()
            for sc in schedules_data:
                EventSchedule.objects.create(event=event, **sc)

            event.gallery_images.all().delete()
            for idx, img_url in enumerate(gallery_data):
                EventImage.objects.create(event=event, image_url=img_url, order=idx)

            created_events.append(event)

        # 5. Create Sample Reviews
        sample_reviews = [
            {
                'event': created_events[0],
                'user': attendee1,
                'rating': 5,
                'title': 'Mind-blowing AI insights and world-class speakers!',
                'comment': 'Attended last year and this edition has taken the quality even higher. The breakout labs on autonomous agents were worth 10x the ticket price.',
                'is_verified_attendee': True
            },
            {
                'event': created_events[0],
                'user': attendee2,
                'rating': 5,
                'title': 'Impeccable organization and great venue',
                'comment': 'Smooth registration via QR code badge, delicious food, and incredible networking opportunities with engineering heads.',
                'is_verified_attendee': True
            },
            {
                'event': created_events[1],
                'user': attendee2,
                'rating': 5,
                'title': 'The best music festival atmosphere in India!',
                'comment': 'Unbelievable sound system, stunning stage design, and safe respectful crowd. Will definitely be returning every year!',
                'is_verified_attendee': True
            }
        ]
        for r_data in sample_reviews:
            Review.objects.update_or_create(
                event=r_data['event'],
                user=r_data['user'],
                defaults=r_data
            )

        # 6. Create Confirmed Booking and Generate Sample QR Tickets for Attendee 1
        first_event = created_events[0]
        ticket_type = first_event.ticket_types.first()
        
        if not Booking.objects.filter(user=attendee1, event=first_event).exists():
            booking = Booking.objects.create(
                user=attendee1,
                event=first_event,
                attendee_name="John Doe",
                attendee_email="john.doe@example.com",
                attendee_phone="+91 98765 43210",
                total_amount=ticket_type.price * 2,
                discount_amount=Decimal('100.00'),
                final_amount=(ticket_type.price * 2) - Decimal('100.00'),
                status=BookingStatus.CONFIRMED
            )

            BookingItem.objects.create(
                booking=booking,
                ticket_type=ticket_type,
                quantity=2,
                price_per_ticket=ticket_type.price,
                subtotal=ticket_type.price * 2
            )

            Payment.objects.create(
                booking=booking,
                user=attendee1,
                transaction_id="TXN-DEMO89421A",
                razorpay_order_id="order_demo_123456",
                razorpay_payment_id="pay_demo_987654321",
                amount=booking.final_amount,
                status=PaymentStatus.SUCCESSFUL,
                payment_method="UPI / Card"
            )

            # Generate Digital QR Tickets
            generate_tickets_for_booking(booking)

            # Notifications
            Notification.objects.create(
                user=attendee1,
                title="Booking Confirmed! 🎉",
                message=f"Your booking #{booking.booking_number} for {first_event.title} is confirmed. View your QR tickets anytime.",
                notification_type="booking",
                link="/my-bookings"
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded EventSphere database!"))
        self.stdout.write(self.style.SUCCESS("Demo accounts:"))
        self.stdout.write("  Admin: admin@eventsphere.com / Admin@123")
        self.stdout.write("  Organizer: organizer@techsummit.com / Organizer@123")
        self.stdout.write("  Attendee: john.doe@example.com / User@123")
