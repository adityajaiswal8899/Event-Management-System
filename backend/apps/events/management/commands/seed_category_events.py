from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date, time
from decimal import Decimal
from apps.users.models import User, UserRole
from apps.events.models import Category, Event, EventStatus, EventType, EventImage, Speaker, EventSchedule, TicketType

class Command(BaseCommand):
    help = 'Seeds at least 15 rich events for each of the 6 key categories: Technology, Music, Business, Design, Workshops, and Sports.'

    def handle(self, *args, **options):
        self.stdout.write("Starting comprehensive seeding of 15+ events per category...")

        # Ensure Organizers exist
        organizer_tech, _ = User.objects.get_or_create(
            email='tech.organizer@eventsphere.com',
            defaults={
                'username': 'tech_lead_org',
                'first_name': 'Vikram',
                'last_name': 'Mehta',
                'role': UserRole.ORGANIZER,
                'organization_name': 'TechSphere Global Innovations',
                'organization_description': 'Organizing top-tier AI, Developer, Cloud and DeepTech conventions across Asia.',
                'website': 'https://techsphere.io',
                'is_verified_organizer': True,
                'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            }
        )
        organizer_music, _ = User.objects.get_or_create(
            email='music.organizer@eventsphere.com',
            defaults={
                'username': 'soundwave_org',
                'first_name': 'Ananya',
                'last_name': 'Deshmukh',
                'role': UserRole.ORGANIZER,
                'organization_name': 'SoundWave & Sunsets Entertainment',
                'organization_description': 'Crafting stellar live concerts, EDM festivals, indie showcases and musical experiences.',
                'website': 'https://soundwavelive.com',
                'is_verified_organizer': True,
                'avatar_url': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
            }
        )
        organizer_biz, _ = User.objects.get_or_create(
            email='biz.organizer@eventsphere.com',
            defaults={
                'username': 'venturehub_org',
                'first_name': 'Rajiv',
                'last_name': 'Kapoor',
                'role': UserRole.ORGANIZER,
                'organization_name': 'VentureHub Capital & Summits',
                'organization_description': 'Connecting visionaries, angel syndicates, founders and corporate executives.',
                'website': 'https://venturehub.in',
                'is_verified_organizer': True,
                'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
            }
        )
        organizer_creative, _ = User.objects.get_or_create(
            email='creative.organizer@eventsphere.com',
            defaults={
                'username': 'pixelcraft_org',
                'first_name': 'Siddharth',
                'last_name': 'Rao',
                'role': UserRole.ORGANIZER,
                'organization_name': 'PixelCraft Design Collective',
                'organization_description': 'Pioneering design conferences, workshops, design systems, and UI/UX expos.',
                'website': 'https://pixelcraft.design',
                'is_verified_organizer': True,
                'avatar_url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
            }
        )
        organizer_sports, _ = User.objects.get_or_create(
            email='sports.organizer@eventsphere.com',
            defaults={
                'username': 'pulsefitness_org',
                'first_name': 'Rohan',
                'last_name': 'Singhania',
                'role': UserRole.ORGANIZER,
                'organization_name': 'PulseFit Active & Endurance League',
                'organization_description': 'Hosting community marathons, CrossFit battles, yoga retreats, and fitness leagues.',
                'website': 'https://pulsefitactive.com',
                'is_verified_organizer': True,
                'avatar_url': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
            }
        )

        # Categories
        cat_map = {
            'technology': Category.objects.update_or_create(
                slug='technology',
                defaults={'name': 'Technology', 'icon': 'Cpu', 'description': 'AI, Cloud, Developer Summits, & Next-Gen Innovations', 'image_url': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 1}
            )[0],
            'music': Category.objects.update_or_create(
                slug='music',
                defaults={'name': 'Music & Concerts', 'icon': 'Music', 'description': 'Live Gigs, EDM Nights, Acoustic Concerts & Music Festivals', 'image_url': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 2}
            )[0],
            'business': Category.objects.update_or_create(
                slug='business',
                defaults={'name': 'Business & Startups', 'icon': 'Briefcase', 'description': 'Pitch Days, VC Networking, Leadership & Founder Summits', 'image_url': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 3}
            )[0],
            'design': Category.objects.update_or_create(
                slug='design',
                defaults={'name': 'Design & Creative', 'icon': 'Palette', 'description': 'UI/UX, Visual Arts, Creative Direction & Design Systems', 'image_url': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 4}
            )[0],
            'workshops': Category.objects.update_or_create(
                slug='workshops',
                defaults={'name': 'Workshops & Education', 'icon': 'GraduationCap', 'description': 'Hands-on Bootcamps, Certifications & Interactive Labs', 'image_url': 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 5}
            )[0],
            'sports': Category.objects.update_or_create(
                slug='sports',
                defaults={'name': 'Sports & Fitness', 'icon': 'Trophy', 'description': 'Marathons, CrossFit Challenges, Yoga Retreats & Tournaments', 'image_url': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80', 'is_popular': True, 'order': 6}
            )[0],
        }

        # -------------------------------------------------------------
        # 1. TECHNOLOGY EVENTS (15 Events)
        # -------------------------------------------------------------
        tech_events = [
            {
                'title': 'Global AI & Cloud Innovation Summit 2026',
                'slug': 'global-ai-cloud-innovation-summit-2026',
                'short_description': 'Join 3,000+ AI researchers, tech executives, and builders exploring GenAI, Autonomous Agents, and Scalable Cloud.',
                'description': 'Over 2 power-packed days, engage in 40+ keynotes, technical deep-dives, live coding demos, and networking lounges with leaders from top tech giants, venture capital firms, and hyper-growth AI startups.\n\nHighlights include Next-Gen LLMs, Autonomous Enterprise Agents, Kubernetes orchestration, and GPU clusters.',
                'banner_image_url': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.HYBRID,
                'venue_name': 'KTPO Convention Centre, Whitefield',
                'address': 'Plot No 25-P, EPIP Zone, Whitefield',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 14,
                'is_featured': True,
                'is_trending': True,
                'tickets': [
                    {'name': 'Early Bird Pass', 'price': Decimal('999.00'), 'original_price': Decimal('1999.00'), 'total_quantity': 200, 'perks': ['Full 2-Day Conference Access', 'Lunch & Coffee', 'Attendee Kit']},
                    {'name': 'VIP All-Access Pass', 'price': Decimal('4999.00'), 'original_price': Decimal('6999.00'), 'total_quantity': 50, 'perks': ['Front-Row Seating', 'VIP Lounge Access', '1-on-1 Speaker Meet', 'Gift Hamper']},
                ]
            },
            {
                'title': 'CyberShield: Enterprise Security & Cloud Defense 2026',
                'slug': 'cybershield-security-cloud-defense-2026',
                'short_description': 'Defend against modern ransomware, zero-day exploits, and supply chain attacks with top ethical hackers.',
                'description': 'CyberShield 2026 brings together SecOps leaders, red teamers, CISOs, and cloud security architects. Includes a live Red-Team vs Blue-Team CTF with real prizes and Zero Trust masterclasses.',
                'banner_image_url': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'HICC Novotel Convention Center',
                'address': 'Near HITEC City, Madhapur',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'days_ahead': 20,
                'is_featured': True,
                'is_trending': False,
                'tickets': [
                    {'name': 'Standard Pass', 'price': Decimal('1499.00'), 'original_price': Decimal('2199.00'), 'total_quantity': 180, 'perks': ['All Security Talks', 'Lunch & Refreshments', 'Exhibition Floor']},
                    {'name': 'CTF Player Pass', 'price': Decimal('2499.00'), 'original_price': Decimal('3299.00'), 'total_quantity': 80, 'perks': ['CTF Contest Entry', 'Swag Pack', 'All Keynotes']},
                ]
            },
            {
                'title': 'DevCon React & Next.js World India',
                'slug': 'devcon-react-nextjs-world-india-2026',
                'short_description': 'The largest gathering of frontend architects, React core contributors, and full-stack builders.',
                'description': 'Deep dive into React Server Components, Next.js App Router optimizations, TurboRepo monorepos, and edge rendering pipelines. Network with 1,500+ frontend engineers.',
                'banner_image_url': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'NIMHANS Convention Centre',
                'address': 'Hosur Road, Lakkasandra',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 18,
                'is_featured': False,
                'is_trending': True,
                'tickets': [
                    {'name': 'Developer Pass', 'price': Decimal('1299.00'), 'original_price': Decimal('1899.00'), 'total_quantity': 300, 'perks': ['Access to 24 Talks', 'Workshop Access', 'Developer Goodie Bag']},
                ]
            },
            {
                'title': 'Autonomous Agentic Systems & LLM Architecture Summit',
                'slug': 'autonomous-agentic-systems-llm-summit',
                'short_description': 'Master multi-agent orchestration, tool-calling frameworks, memory graphs, and self-healing systems.',
                'description': 'An intensive engineering summit on building reliable production AI agents. Learn LangGraph, CrewAI, AutoGen, and vector database indexing directly from leading AI researchers.',
                'banner_image_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Virtual Livestream & Discord Lab',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 10,
                'is_featured': False,
                'is_trending': True,
                'tickets': [
                    {'name': 'Online Live Ticket', 'price': Decimal('499.00'), 'original_price': Decimal('999.00'), 'total_quantity': 500, 'perks': ['Full HD Stream Access', 'GitHub Starter Repos', 'Discord Lab Room']},
                ]
            },
            {
                'title': 'KubeOps & Cloud Native Infrastructure Day',
                'slug': 'kubeops-cloud-native-infrastructure-day',
                'short_description': 'Scale Kubernetes clusters, service meshes, eBPF telemetry, and cost-effective cloud architectures.',
                'description': 'DevOps engineers and Site Reliability Engineers gather to discuss zero-downtime deployments, GitOps with ArgoCD, and infrastructure-as-code best practices.',
                'banner_image_url': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'The Leela Palace Ballroom',
                'address': 'Old Airport Road, Kodihalli',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 25,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'General Pass', 'price': Decimal('1999.00'), 'original_price': Decimal('2899.00'), 'total_quantity': 150, 'perks': ['All Sessions', 'Lunch Buffet', 'Hands-on Labs']},
                ]
            },
            {
                'title': 'Web3, DeFi & Zero-Knowledge Cryptography Expo',
                'slug': 'web3-defi-zk-cryptography-expo',
                'short_description': 'Explore ZK-rollups, smart contract security audits, DeFi protocols, and decentralized AI networks.',
                'description': 'Bringing together top blockchain researchers, protocol developers, and crypto investors for discussions on modular blockchains and cryptography advancements.',
                'banner_image_url': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Grand Hyatt Convention Center',
                'address': 'Bandra Kurla Complex, Santacruz East',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 32,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Web3 Pass', 'price': Decimal('1799.00'), 'original_price': Decimal('2499.00'), 'total_quantity': 200, 'perks': ['Keynote Access', 'Hackathon Participation', 'Networking Mixer']},
                ]
            },
            {
                'title': 'Mobile Developers Conclave (Flutter, Swift & React Native)',
                'slug': 'mobile-developers-conclave-2026',
                'short_description': 'Build high-performance native and cross-platform mobile apps with buttery smooth 120Hz UI animations.',
                'description': 'Master SwiftUI, Jetpack Compose, Flutter 3.x, offline-first sync engines, and App Store optimization strategies from top mobile architects.',
                'banner_image_url': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.HYBRID,
                'venue_name': 'ITC Grand Chola',
                'address': 'No. 63, Mount Road, Guindy',
                'city': 'Chennai',
                'state': 'Tamil Nadu',
                'days_ahead': 28,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Standard Attendee', 'price': Decimal('1199.00'), 'original_price': Decimal('1799.00'), 'total_quantity': 220, 'perks': ['Full Access Pass', 'Mobile Code Templates', 'Lunch & High Tea']},
                ]
            },
            {
                'title': 'Embedded Systems & Robotics IoT Summit',
                'slug': 'embedded-systems-robotics-iot-summit',
                'short_description': 'Hardware hacking, microcontrollers, ROS2 robotics, and Edge AI computing for industrial automation.',
                'description': 'Meet hardware innovators and firmware engineers exploring Raspberry Pi 5, ESP32-S3, TinyML, and drone technology.',
                'banner_image_url': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Auto Cluster Exhibition Center',
                'address': 'Chinchwad East, Old Pune-Mumbai Highway',
                'city': 'Pune',
                'state': 'Maharashtra',
                'days_ahead': 36,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Hardware Hacker Pass', 'price': Decimal('1599.00'), 'original_price': Decimal('2299.00'), 'total_quantity': 120, 'perks': ['Hardware Demo Booth Access', 'Component Starter Kit', 'Lunch']},
                ]
            },
            {
                'title': 'Data Engineering & Real-Time Streaming Conclave',
                'slug': 'data-engineering-realtime-streaming-conclave',
                'short_description': 'Kafka, Apache Flink, ClickHouse, and Iceberg pipelines processing millions of events per second.',
                'description': 'Learn how tech unicorns build petabyte-scale data lakes, low-latency analytics engines, and resilient vector search pipelines.',
                'banner_image_url': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'India Habitat Centre',
                'address': 'Lodhi Road, Near Air Force Bal Bharati School',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 40,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Data Pass', 'price': Decimal('1399.00'), 'original_price': Decimal('1999.00'), 'total_quantity': 160, 'perks': ['All Technical Talks', 'Architecture Whitepapers', 'Buffet Lunch']},
                ]
            },
            {
                'title': 'Quantum Computing & High-Performance Simulation Forum',
                'slug': 'quantum-computing-hpc-simulation-forum',
                'short_description': 'The next frontier of quantum algorithms, Qiskit programming, and supercomputing research.',
                'description': 'A rare gathering of quantum physicists, software engineers, and research scientists demonstrating quantum key distribution and quantum cryptography.',
                'banner_image_url': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Quantum Virtual Auditorium',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 44,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Virtual Researcher Pass', 'price': Decimal('399.00'), 'original_price': Decimal('799.00'), 'total_quantity': 400, 'perks': ['Interactive Q&A', 'Paper Access', 'Digital Certificate']},
                ]
            },
            {
                'title': 'AR / VR & Spatial Computing Developers Expo',
                'slug': 'ar-vr-spatial-computing-expo',
                'short_description': 'Building immersive 3D experiences for Apple Vision Pro, Meta Quest, and Unity 6.',
                'description': 'Experience hands-on spatial UI design, 3D Gaussian Splatting, WebXR development, and photorealistic virtual environments.',
                'banner_image_url': 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Manpho Convention Center',
                'address': 'Nagavara Ring Road, Near Manyata Tech Park',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 48,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Immersive Experience Pass', 'price': Decimal('1699.00'), 'original_price': Decimal('2499.00'), 'total_quantity': 180, 'perks': ['Hands-on VR Headset Testing', 'Unity Workshop', 'Lunch']},
                ]
            },
            {
                'title': 'Python & Django Architecture Day India 2026',
                'slug': 'python-django-architecture-day-2026',
                'short_description': 'Deep-dive into async Django, FastAPI microservices, Celery distributed tasks, and ORM performance.',
                'description': 'Master advanced backend architecture with Python. Learn database profiling, caching strategies with Redis, and containerized deployments.',
                'banner_image_url': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'T-Hub 2.0 Innovation Complex',
                'address': 'Knowledge City, Raidurg',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'days_ahead': 22,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Pythonista Pass', 'price': Decimal('899.00'), 'original_price': Decimal('1499.00'), 'total_quantity': 250, 'perks': ['All Talks', 'Swag T-shirt', 'Lunch & Coffee']},
                ]
            },
            {
                'title': 'Green Tech & Renewable Energy Systems Conference',
                'slug': 'green-tech-renewable-energy-conference',
                'short_description': 'Clean energy grids, EV battery breakthroughs, smart city sensors, and sustainable computing.',
                'description': 'Connecting climate-tech founders, engineers, and government policy makers to accelerate carbon-neutral tech infrastructure.',
                'banner_image_url': 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Pragati Maidan Bharat Mandapam',
                'address': 'Mathura Road, Pragati Maidan',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 52,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Delegate Pass', 'price': Decimal('1499.00'), 'original_price': Decimal('2299.00'), 'total_quantity': 200, 'perks': ['Expo Access', 'Keynote Tracks', 'Networking Lunch']},
                ]
            },
            {
                'title': 'Fintech & Algorithmic Trading Technology Summit',
                'slug': 'fintech-algorithmic-trading-summit',
                'short_description': 'Ultra low-latency C++ trading engines, quantitative analysis, market data feeds, and UPI innovations.',
                'description': 'Join quant developers, HFT engineers, and fintech founders exploring market microstructure, risk management APIs, and payment security.',
                'banner_image_url': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'BSE International Convention Hall',
                'address': 'Dalal Street, Fort',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 56,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Fintech Professional Pass', 'price': Decimal('2499.00'), 'original_price': Decimal('3499.00'), 'total_quantity': 120, 'perks': ['Full Access', 'Algorithmic Trading Starter Kit', 'VIP Networking Dinner']},
                ]
            },
            {
                'title': 'BioTech & Computational Genomics Convention',
                'slug': 'biotech-computational-genomics-convention',
                'short_description': 'AI in drug discovery, CRISPR gene editing computations, protein folding models, and longevity science.',
                'description': 'Explore the intersection of deep learning and biotechnology with bioinformaticians and medical research leaders.',
                'banner_image_url': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.HYBRID,
                'venue_name': 'Indian Institute of Science Auditorium',
                'address': 'CV Raman Road, Malleshwaram',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 60,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'BioTech Pass', 'price': Decimal('1799.00'), 'original_price': Decimal('2499.00'), 'total_quantity': 150, 'perks': ['Scientific Papers Access', 'Poster Session', 'Lunch']},
                ]
            },
        ]

        # -------------------------------------------------------------
        # 2. MUSIC & CONCERTS EVENTS (15 Events)
        # -------------------------------------------------------------
        music_events = [
            {
                'title': 'Neon Horizons: Electronic Music & Arts Festival',
                'slug': 'neon-horizons-electronic-music-festival',
                'short_description': '3 stages of hypnotic basslines, immersive laser architecture, international DJs, and sunset beach vibes.',
                'description': 'Featuring 24 global acts across 3 stages: Solar Stage (Melodic Techno), Bass Lagoon (Drum & Bass), and Ambient Haven (Chillout). Complete with holographic visual mapping and beach food villages.',
                'banner_image_url': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Vagator Beach Arena & Cliffs',
                'address': 'Near Chapora Fort Road, Vagator',
                'city': 'Goa',
                'state': 'Goa',
                'days_ahead': 21,
                'is_featured': True,
                'is_trending': True,
                'tickets': [
                    {'name': 'General Admission Phase 1', 'price': Decimal('1499.00'), 'original_price': Decimal('2499.00'), 'total_quantity': 400, 'perks': ['Entry to All 3 Stages', 'Beach Food Village Access', 'Eco Wristband']},
                    {'name': 'VIP Elevated Deck Pass', 'price': Decimal('3499.00'), 'original_price': Decimal('4999.00'), 'total_quantity': 100, 'perks': ['Elevated VIP Deck', 'Dedicated VIP Bar', 'Express Entry', 'Welcome Drink']},
                ]
            },
            {
                'title': 'Sufi & Ghazal Candlelight Symphony Night',
                'slug': 'sufi-ghazal-candlelight-symphony-night',
                'short_description': 'An ethereal evening of soulful qawwalis and classical poetry illuminated by 5,000 glowing candles.',
                'description': 'Experience timeless melodies performed by renowned classical maestros with traditional harmonium, tabla, sarangi, and acoustic strings in a mesmerizing heritage setting.',
                'banner_image_url': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Sunder Nursery Heritage Amphitheatre',
                'address': 'Opposite Humayun Tomb, Nizamuddin',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 12,
                'is_featured': True,
                'is_trending': True,
                'tickets': [
                    {'name': 'Silver Seating', 'price': Decimal('799.00'), 'original_price': Decimal('1299.00'), 'total_quantity': 250, 'perks': ['Seating Access', 'Souvenir Candle Glow Stick']},
                    {'name': 'Front Row Royal Pass', 'price': Decimal('1999.00'), 'original_price': Decimal('2999.00'), 'total_quantity': 60, 'perks': ['Front Row Seating', 'Meet & Greet with Artists', 'Gourmet High Tea']},
                ]
            },
            {
                'title': 'Sunburn Sunset Beachside Carnival Goa',
                'slug': 'sunburn-sunset-beachside-carnival-goa',
                'short_description': 'India’s ultimate sun-soaked dance music festival with top global EDM DJs and fire dancers.',
                'description': 'Get ready for thumping bass, festival carnival rides, foam parties, fire shows, and unforgettable coastal memories.',
                'banner_image_url': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Anjuna Sunburn Grounds',
                'address': 'Anjuna Beach Coastal Road',
                'city': 'Goa',
                'state': 'Goa',
                'days_ahead': 29,
                'is_featured': False,
                'is_trending': True,
                'tickets': [
                    {'name': 'Single Day Pass', 'price': Decimal('1899.00'), 'original_price': Decimal('2599.00'), 'total_quantity': 350, 'perks': ['Festival Grounds Entry', 'Stage View', 'Free Wristband']},
                ]
            },
            {
                'title': 'Indie Rock & Acoustic Rooftop Vibes',
                'slug': 'indie-rock-acoustic-rooftop-vibes',
                'short_description': 'Intimate indie bands, storytelling songwriters, craft brews, and starry rooftop skyline views.',
                'description': 'Enjoy curated indie rock, dream pop, and acoustic folk sets under fairy lights on a stunning open-air terrace in Koramangala.',
                'banner_image_url': 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'SkyLounge Rooftop Amphitheatre',
                'address': '80 Feet Road, 4th Block Koramangala',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 9,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Entry Ticket', 'price': Decimal('499.00'), 'original_price': Decimal('799.00'), 'total_quantity': 180, 'perks': ['Terrace Access', 'One Craft Beverage Token']},
                ]
            },
            {
                'title': 'Bollywood Retro & Modern Disco Fiesta',
                'slug': 'bollywood-retro-modern-disco-fiesta',
                'short_description': 'Dance non-stop to Bollywood blockbusters, 90s nostalgia remixes, and live dhol percussion.',
                'description': 'A massive dance party featuring celebrity DJs spinning high-tempo remixes with confetti cannons, visual lasers, and LED dance floors.',
                'banner_image_url': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Dome NSCI, SVP Stadium',
                'address': 'Lala Lajpatrai Marg, Worli',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 15,
                'is_featured': False,
                'is_trending': True,
                'tickets': [
                    {'name': 'Club Floor Pass', 'price': Decimal('999.00'), 'original_price': Decimal('1499.00'), 'total_quantity': 500, 'perks': ['Main Dance Floor Access', 'Cover Charge Deductible on Drinks']},
                ]
            },
            {
                'title': 'Jazz & Blues Autumn Festival 2026',
                'slug': 'jazz-blues-autumn-festival-2026',
                'short_description': 'Smooth saxophones, soulful blues guitars, and vintage jazz quintets in a lush garden venue.',
                'description': 'Two enchanting evenings celebrating classic jazz, bebop, funk, and modern blues with international quartets and artisanal wine tastings.',
                'banner_image_url': 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Victoria Memorial Open Gardens',
                'address': '1 Queen’s Way, Maidan',
                'city': 'Kolkata',
                'state': 'West Bengal',
                'days_ahead': 35,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Garden Pass', 'price': Decimal('899.00'), 'original_price': Decimal('1299.00'), 'total_quantity': 220, 'perks': ['Garden Seating', 'Live Performance Access', 'Wine Tasting Voucher']},
                ]
            },
            {
                'title': 'Underground Hip-Hop & Rap Battle Cypher',
                'slug': 'underground-hiphop-rap-battle-cypher',
                'short_description': 'Freestyle rap showdowns, beatboxing battles, live graffiti art, and breakdancing circles.',
                'description': 'Witness the rawest rap battles and cyphers in the city with top street lyrical talent competing for the Golden Mic trophy.',
                'banner_image_url': 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'AntiSocial Underground Warehouse',
                'address': 'Mathuradas Mill Compound, Lower Parel',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 11,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Cypher Entry', 'price': Decimal('599.00'), 'original_price': Decimal('899.00'), 'total_quantity': 250, 'perks': ['Underground Stage Entry', 'Battle Voting Rights']},
                ]
            },
            {
                'title': 'Carnatic & Hindustani Fusion Confluence',
                'slug': 'carnatic-hindustani-fusion-confluence',
                'short_description': 'Jugalbandi between sitar, violin, mridangam, and contemporary acoustic percussion.',
                'description': 'A sublime classical fusion concert bringing together North and South Indian classical traditions with modern improvisational flair.',
                'banner_image_url': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Music Academy Main Auditorium',
                'address': 'TTK Road, Royapettah',
                'city': 'Chennai',
                'state': 'Tamil Nadu',
                'days_ahead': 41,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Auditorium Pass', 'price': Decimal('699.00'), 'original_price': Decimal('999.00'), 'total_quantity': 300, 'perks': ['Reserved Theatre Seating', 'Concert Programme Brochure']},
                ]
            },
            {
                'title': 'Psytrance Forest Gathering: Cosmic Resonance',
                'slug': 'psytrance-forest-gathering-cosmic-resonance',
                'short_description': 'Full-power psychedelic trance in the mystic pine valleys of Kasol with UV decor and flow arts.',
                'description': 'A 3-day spiritual and musical pilgrimage in the Himalayas featuring international darkpsy, twilight, and progressive psytrance artists.',
                'banner_image_url': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Chalal Valley Pine Grounds',
                'address': 'Kasol Valley, Parvati Valley',
                'city': 'Kasol',
                'state': 'Himachal Pradesh',
                'days_ahead': 47,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': '3-Day Festival Pass', 'price': Decimal('2999.00'), 'original_price': Decimal('4500.00'), 'total_quantity': 200, 'perks': ['3-Day Continuous Music', 'Campground Access', 'Chai & Bonfire Access']},
                ]
            },
            {
                'title': 'K-Pop Rave & Dance Cover Extravaganza',
                'slug': 'kpop-rave-dance-cover-extravaganza',
                'short_description': 'Random play dances, BTS & Blackpink fan singalongs, Korean street food, and cosplay competitions.',
                'description': 'The ultimate gathering for K-pop stans! Dance to top Korean chart-toppers with photo booths, official merch stalls, and bubble tea.',
                'banner_image_url': 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Select Citywalk Outdoor Plaza',
                'address': 'Saket District Centre',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 24,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Fan Pass', 'price': Decimal('499.00'), 'original_price': Decimal('799.00'), 'total_quantity': 350, 'perks': ['Fan Glow Stick', 'Random Play Dance Entry', 'Photo Booth Voucher']},
                ]
            },
            {
                'title': 'Symphony Orchestra: Cinema Classics Live in Concert',
                'slug': 'symphony-orchestra-cinema-classics-live',
                'short_description': '60-piece orchestra performing iconic scores from Interstellar, Lord of the Rings, and Harry Potter.',
                'description': 'Experience goosebumps as a grand live symphony orchestra accompanied by a cinematic choir brings epic film scores to life on giant 4K projection screens.',
                'banner_image_url': 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'NCPA Jamshed Bhabha Theatre',
                'address': 'Nariman Point',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 38,
                'is_featured': False,
                'is_trending': True,
                'tickets': [
                    {'name': 'Balcony Pass', 'price': Decimal('1199.00'), 'original_price': Decimal('1699.00'), 'total_quantity': 180, 'perks': ['Balcony Seating', 'Acoustic Soundstage Access']},
                    {'name': 'Grand Tier Orchestra Pass', 'price': Decimal('2899.00'), 'original_price': Decimal('3899.00'), 'total_quantity': 80, 'perks': ['Prime Center Row Seating', 'Champagne Reception']},
                ]
            },
            {
                'title': 'Rock Revival: 90s Grunge & Heavy Metal Festival',
                'slug': 'rock-revival-grunge-metal-festival',
                'short_description': 'Headbanging riffs, drum solos, and roaring rock bands paying tribute to Metallica, Nirvana & AC/DC.',
                'description': 'Mosh pits, electric guitar anthems, leather jackets, and raw energy featuring 8 of the loudest rock & heavy metal bands in the country.',
                'banner_image_url': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Jayamahal Palace Grounds',
                'address': 'Near Cantonment Railway Station',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 31,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Mosh Pit Pass', 'price': Decimal('899.00'), 'original_price': Decimal('1299.00'), 'total_quantity': 300, 'perks': ['Front Stage Standing Access', 'Festival Rock Bandana']},
                ]
            },
            {
                'title': 'Acoustic Soul & Campfire Music Night',
                'slug': 'acoustic-soul-campfire-music-night',
                'short_description': 'Stargazing, acoustic guitars, barbecue grills, and tent camping under open skies.',
                'description': 'Escape city noise to a scenic lakeside campground with intimate acoustic performances, bonfire conversations, and roasted marshmallows.',
                'banner_image_url': 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Pawna Lake Eco Campsite',
                'address': 'Pawna Dam, Lonavala Road',
                'city': 'Lonavala',
                'state': 'Maharashtra',
                'days_ahead': 17,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Camp & Music Pass', 'price': Decimal('1499.00'), 'original_price': Decimal('2199.00'), 'total_quantity': 100, 'perks': ['Tent Stay (2-sharing)', 'Campfire Barbecue Dinner', 'Acoustic Jam Access']},
                ]
            },
            {
                'title': 'Reggae & Caribbean Island Beach Party',
                'slug': 'reggae-caribbean-island-beach-party',
                'short_description': 'Roots reggae, dub rhythms, tropical cocktails, and beach volleyball in South Goa.',
                'description': 'Soak in the island vibrations with live horns, heavy basslines, authentic Jamaican jerk barbecue, and chilled seaside cocktails.',
                'banner_image_url': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Palolem Beach Shack Arena',
                'address': 'Palolem Beach, Canacona',
                'city': 'Goa',
                'state': 'Goa',
                'days_ahead': 45,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Beach Entry Pass', 'price': Decimal('699.00'), 'original_price': Decimal('999.00'), 'total_quantity': 200, 'perks': ['Shack Entry', 'Tropical Mocktail Included']},
                ]
            },
            {
                'title': 'Midnight Silent Disco on the Waterfront',
                'slug': 'midnight-silent-disco-waterfront',
                'short_description': '3 wireless LED channels: Commercial Pop, Techno & Hip-Hop on premium noise-cancelling headphones.',
                'description': 'Pick your DJ channel with glowing headphones and dance under the moonlit sky right on the scenic lakeside waterfront.',
                'banner_image_url': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Hussain Sagar Lake Promenade',
                'address': 'Necklace Road',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'days_ahead': 26,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Silent Headphone Pass', 'price': Decimal('599.00'), 'original_price': Decimal('899.00'), 'total_quantity': 250, 'perks': ['3-Channel LED Headphone Rental', 'Waterfront Entry']},
                ]
            },
        ]

        # -------------------------------------------------------------
        # 3. BUSINESS & STARTUPS EVENTS (15 Events)
        # -------------------------------------------------------------
        biz_events = [
            {
                'title': 'NextGen Founders & Venture Capital Pitch Summit',
                'slug': 'nextgen-founders-vc-pitch-summit-2026',
                'short_description': 'Connecting high-growth B2B & consumer tech startups with Tier-1 Venture Capitalists and angel syndicates.',
                'description': 'Bringing together 50+ curated VC partners managing over $2B in AUM and 100 high-potential seed to Series-A founders for curated 1-on-1 pitch speed-dating, valuation masterclasses, and closed-door dinners.',
                'banner_image_url': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'St. Regis Grand Ballroom, Lower Parel',
                'address': '462 Senapati Bapat Marg, Lower Parel',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 28,
                'is_featured': True,
                'is_trending': True,
                'tickets': [
                    {'name': 'Observer Pass', 'price': Decimal('2499.00'), 'original_price': Decimal('3499.00'), 'total_quantity': 120, 'perks': ['All Keynotes & Tracks', 'Lunch & High Tea', 'Exhibition Hall']},
                    {'name': 'Pitching Startup Pass', 'price': Decimal('7999.00'), 'original_price': Decimal('9999.00'), 'total_quantity': 25, 'perks': ['Stage Pitch Slot for 2 Founders', '1-on-1 VC Matchmaking', 'VIP Dinner']},
                ]
            },
            {
                'title': 'SaaS Scaling & Product-Led Growth Conclave',
                'slug': 'saas-scaling-product-led-growth-conclave',
                'short_description': 'Learn how B2B SaaS companies scaled from $1M to $50M ARR with high net retention and low CAC.',
                'description': 'Actionable masterclasses from unicorn founders and CROs covering enterprise pricing strategies, outbound sales funnels, and customer expansion playbooks.',
                'banner_image_url': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'ITC Gardenia Grand Ballroom',
                'address': '1 Residency Road, Shanthala Nagar',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 16,
                'is_featured': True,
                'is_trending': False,
                'tickets': [
                    {'name': 'SaaS Leader Pass', 'price': Decimal('2999.00'), 'original_price': Decimal('3999.00'), 'total_quantity': 150, 'perks': ['All Panels & Case Studies', 'GTM Framework Toolkit', 'Networking Lunch']},
                ]
            },
            {
                'title': 'Angel Investor & Syndicate Masterclass',
                'slug': 'angel-investor-syndicate-masterclass',
                'short_description': 'Master early-stage startup valuation, term sheet negotiations, due diligence, and portfolio diversification.',
                'description': 'Designed for high-net-worth individuals, CXOs, and aspiring angel investors seeking to participate in high-return technology syndicates.',
                'banner_image_url': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Taj Lands End, Bandra',
                'address': 'Bandstand, BJ Road, Bandra West',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 23,
                'is_featured': False,
                'is_trending': True,
                'tickets': [
                    {'name': 'Investor Seat', 'price': Decimal('4999.00'), 'original_price': Decimal('6999.00'), 'total_quantity': 60, 'perks': ['Due Diligence Templates', 'Dealflow Access for 1 Year', 'Private Dinner']},
                ]
            },
            {
                'title': 'Global E-Commerce & D2C Brands Expo 2026',
                'slug': 'global-ecommerce-d2c-brands-expo-2026',
                'short_description': 'Scaling Direct-to-Consumer brands, supply chain logistics, Meta ad ROAS, and omnichannel retail.',
                'description': 'Meet 800+ consumer brand founders, packaging experts, 3PL logistics leaders, and performance marketing gurus sharing blueprints for 10x revenue.',
                'banner_image_url': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.HYBRID,
                'venue_name': 'Yashobhoomi India International Convention Centre',
                'address': 'Sector 25, Dwarka',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 33,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'D2C Founder Pass', 'price': Decimal('1999.00'), 'original_price': Decimal('2799.00'), 'total_quantity': 200, 'perks': ['Expo Hall Access', 'Performance Marketing Playbook', 'Lunch']},
                ]
            },
            {
                'title': 'AI for Enterprise & Business Leaders Summit',
                'slug': 'ai-for-enterprise-business-leaders-summit',
                'short_description': 'How Fortune 500 CEOs and CIOs are deploying generative AI to automate operations and drive bottom-line margin.',
                'description': 'A high-level executive symposium on enterprise AI governance, ROI calculation, customer support automation, and proprietary data moats.',
                'banner_image_url': 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'The Westin Mindspace',
                'address': 'Raheja IT Park, Hitec City',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'days_ahead': 37,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Executive Pass', 'price': Decimal('3499.00'), 'original_price': Decimal('4999.00'), 'total_quantity': 100, 'perks': ['VIP Lounge', 'Whitepaper Access', 'Roundtable Seat', 'Executive Lunch']},
                ]
            },
            {
                'title': 'Women Entrepreneurs & Tech Leaders Conclave',
                'slug': 'women-entrepreneurs-tech-leaders-conclave',
                'short_description': 'Celebrating trailblazing female founders, venture partners, and leaders building billion-dollar companies.',
                'description': 'Keynotes, mentorship circles, funding opportunities, and community networking empowering women in tech and business leadership.',
                'banner_image_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'JW Marriott Hotel Vittal Mallya Road',
                'address': '24/1 Vittal Mallya Road, Ashok Nagar',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 19,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Delegate Pass', 'price': Decimal('1199.00'), 'original_price': Decimal('1899.00'), 'total_quantity': 250, 'perks': ['All Keynotes', 'Speed Mentorship Slot', 'Lunch Buffet']},
                ]
            },
            {
                'title': 'B2B Sales Mastery & Enterprise Deal Closing Bootcamp',
                'slug': 'b2b-sales-mastery-enterprise-deal-bootcamp',
                'short_description': 'Close 6-figure enterprise contracts, navigate procurement committees, and master consultative selling.',
                'description': 'A rigorous 1-day sales intensive for Account Executives and Sales VPs looking to shorten enterprise sales cycles and boost quota attainment.',
                'banner_image_url': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Zoom Executive Studio',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 13,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Online Ticket', 'price': Decimal('799.00'), 'original_price': Decimal('1499.00'), 'total_quantity': 300, 'perks': ['Live Interactive Stream', 'Cold Email & Pitch Decks Templates', 'Session Recording']},
                ]
            },
            {
                'title': 'Fintech Disruption & Digital Banking Forum',
                'slug': 'fintech-disruption-digital-banking-forum',
                'short_description': 'Open banking APIs, cross-border remittance, account aggregators, and regulatory sandboxes.',
                'description': 'Gathering banking heads, RBI fintech sandbox participants, payment gateway leaders, and compliance officers.',
                'banner_image_url': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Trident Hotel Nariman Point',
                'address': 'CR 2, Nariman Point',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 42,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Fintech Delegate', 'price': Decimal('2199.00'), 'original_price': Decimal('2999.00'), 'total_quantity': 140, 'perks': ['Conference Pass', 'Fintech Report 2026', 'Buffet Lunch']},
                ]
            },
            {
                'title': 'Franchise & Retail Expansion Expo 2026',
                'slug': 'franchise-retail-expansion-expo-2026',
                'short_description': 'Explore 200+ proven franchise opportunities in F&B, education, health, and retail with direct franchisors.',
                'description': 'Connect with top national and international franchise brands looking for master franchise partners, unit operators, and commercial real estate leasing.',
                'banner_image_url': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Bombay Exhibition Centre (NESCO)',
                'address': 'Western Express Highway, Goregaon East',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 46,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Visitor Pass', 'price': Decimal('399.00'), 'original_price': Decimal('699.00'), 'total_quantity': 600, 'perks': ['Expo Access', 'Franchise Directory Guide']},
                ]
            },
            {
                'title': 'Startup Legal, IP & Cap-Table Structuring Masterclass',
                'slug': 'startup-legal-ip-captable-masterclass',
                'short_description': 'Avoid costly mistakes with founder vesting, ESOP pools, trademark protection, and cross-border holding structures.',
                'description': 'Top venture corporate lawyers guide founders through SAFEs, convertible notes, SHA clauses, and intellectual property assignment.',
                'banner_image_url': 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Virtual Legal Clinic',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 15,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Founder Legal Pass', 'price': Decimal('699.00'), 'original_price': Decimal('1199.00'), 'total_quantity': 250, 'perks': ['Live Q&A with Senior Partners', 'Standard Legal Agreement Templates']},
                ]
            },
            {
                'title': 'Agritech & Rural Innovation Summit',
                'slug': 'agritech-rural-innovation-summit',
                'short_description': 'Precision farming, drone crop spraying, cold storage supply chains, and farmer marketplace tech.',
                'description': 'Bridging the gap between agricultural technology innovators, rural supply chains, impact investors, and farming cooperatives.',
                'banner_image_url': 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'College of Agriculture Grounds',
                'address': 'Shivaji Nagar, Pune',
                'city': 'Pune',
                'state': 'Maharashtra',
                'days_ahead': 50,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'General Pass', 'price': Decimal('799.00'), 'original_price': Decimal('1299.00'), 'total_quantity': 200, 'perks': ['Demo Arena Entry', 'Networking Sessions', 'Lunch']},
                ]
            },
            {
                'title': 'Cross-Border Trade & Amazon Global Selling Conclave',
                'slug': 'cross-border-trade-amazon-global-selling',
                'short_description': 'How Indian exporters and manufacturers are doing millions in sales on Amazon US, UK & UAE.',
                'description': 'A blueprint for international compliance, customs clearance, US trademark registry, Amazon FBA logistics, and international currency hedging.',
                'banner_image_url': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Sheraton Grand Whitefield',
                'address': 'Prestige Shantiniketan, Hoodi',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 39,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Exporter Pass', 'price': Decimal('1499.00'), 'original_price': Decimal('2199.00'), 'total_quantity': 180, 'perks': ['Full Event Access', 'Customs & Logistics Directory', 'Lunch']},
                ]
            },
            {
                'title': 'HealthTech & Telemedicine Founders Forum',
                'slug': 'healthtech-telemedicine-founders-forum',
                'short_description': 'Ayushman Bharat digital mission, EHR integrations, AI radiology diagnostics, and medical device regulations.',
                'description': 'Doctors, hospital directors, software engineers, and venture capitalists shaping the digital health ecosystem in India.',
                'banner_image_url': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.HYBRID,
                'venue_name': 'Apollo Knowledge City Auditorium',
                'address': 'Jubilee Hills',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'days_ahead': 54,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'HealthTech Delegate', 'price': Decimal('1699.00'), 'original_price': Decimal('2399.00'), 'total_quantity': 150, 'perks': ['Access to Healthcare Tracks', 'Regulatory Handbook', 'Lunch']},
                ]
            },
            {
                'title': 'Creator Economy & Monetization Summit 2026',
                'slug': 'creator-economy-monetization-summit-2026',
                'short_description': 'Turn your social following into a scalable business through digital courses, merchandise, and paid communities.',
                'description': 'Top creators with 1M+ subscribers team up with monetization platform executives to reveal sponsorships, high-ticket affiliate funnels, and community building.',
                'banner_image_url': 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Jio World Convention Centre',
                'address': 'G Block BKC, Bandra Kurla Complex',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 27,
                'is_featured': False,
                'is_trending': True,
                'tickets': [
                    {'name': 'Creator Pass', 'price': Decimal('1299.00'), 'original_price': Decimal('1999.00'), 'total_quantity': 300, 'perks': ['Creator Masterclasses', 'Brand Pitch Lounge', 'Networking Mixer']},
                ]
            },
            {
                'title': 'Future of Work & HR Leadership Conclave',
                'slug': 'future-of-work-hr-leadership-conclave',
                'short_description': 'Remote team culture, AI-assisted talent acquisition, employee retention, and high-performance incentives.',
                'description': 'Chief Human Resource Officers and People Ops leaders discuss modern hybrid workplaces, competitive compensation benchmarks, and employee mental wellness.',
                'banner_image_url': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Radisson Blu Plaza Hotel',
                'address': 'National Highway 8, Mahipalpur',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 58,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'HR Leader Pass', 'price': Decimal('1599.00'), 'original_price': Decimal('2299.00'), 'total_quantity': 160, 'perks': ['All Panels & Case Studies', 'HR Benchmark Whitepaper', 'Buffet Lunch']},
                ]
            },
        ]

        # -------------------------------------------------------------
        # 4. DESIGN & CREATIVE EVENTS (15 Events)
        # -------------------------------------------------------------
        design_events = [
            {
                'title': 'Mastering Modern UI/UX & Scalable Design Systems',
                'slug': 'mastering-modern-ui-ux-design-systems',
                'short_description': 'A comprehensive 2-day live interactive masterclass on crafting scalable design tokens and micro-interactions.',
                'description': 'Elevate your product design craft to world-class standards. Dives deep into creating responsive design systems, ergonomic micro-interactions, dark mode color science, and automated Figma-to-Tailwind pipelines.',
                'banner_image_url': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Live Interactive Virtual Studio',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 7,
                'is_featured': True,
                'is_trending': True,
                'tickets': [
                    {'name': 'Online Live Ticket', 'price': Decimal('499.00'), 'original_price': Decimal('999.00'), 'total_quantity': 250, 'perks': ['2 Days Live HD Stream', 'Figma Token Template Kit', 'Certificate']},
                    {'name': 'Pro + Portfolio Critique', 'price': Decimal('1499.00'), 'original_price': Decimal('2499.00'), 'total_quantity': 40, 'perks': ['All Stream Perks', '1-on-1 Portfolio Video Review', 'Design System Library']},
                ]
            },
            {
                'title': 'Typography, Editorial Layout & Brand Identity Expo',
                'slug': 'typography-brand-identity-expo',
                'short_description': 'Craft memorable brand identities, custom font foundries, and stunning editorial publication designs.',
                'description': 'Top creative directors and typographic artists reveal the art of font pairing, kerning balance, visual hierarchy, and tactile packaging design.',
                'banner_image_url': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'National Institute of Design (NID) Gallery',
                'address': 'Paldi Road',
                'city': 'Ahmedabad',
                'state': 'Gujarat',
                'days_ahead': 21,
                'is_featured': True,
                'is_trending': False,
                'tickets': [
                    {'name': 'Exhibition Pass', 'price': Decimal('699.00'), 'original_price': Decimal('1099.00'), 'total_quantity': 180, 'perks': ['Full Gallery Access', 'Typography Specimen Booklet']},
                ]
            },
            {
                'title': '3D Motion Design & Cinema 4D / Octane Masterclass',
                'slug': '3d-motion-design-cinema4d-masterclass',
                'short_description': 'Create mesmerizing 3D product animations, particle simulations, and hyper-realistic commercial renders.',
                'description': 'Master Cinema 4D, Redshift, Octane Render, and After Effects compositing for global tech commercials and brand launch videos.',
                'banner_image_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Creative Stream Lab',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 14,
                'is_featured': False,
                'is_trending': True,
                'tickets': [
                    {'name': 'Masterclass Stream Pass', 'price': Decimal('899.00'), 'original_price': Decimal('1599.00'), 'total_quantity': 300, 'perks': ['HD Stream Recording', '3D Project Assets & C4D Files']},
                ]
            },
            {
                'title': 'Framer & Interactive Web Animation Bootcamp',
                'slug': 'framer-interactive-web-animation-bootcamp',
                'short_description': 'Build award-winning interactive landing pages without writing complex boilerplate code.',
                'description': 'Learn Framer motion curves, scroll-driven parallax effects, 3D Canvas embeds, and CMS architecture to launch high-converting creative websites.',
                'banner_image_url': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Live Interactive Discord Studio',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 11,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Bootcamp Ticket', 'price': Decimal('599.00'), 'original_price': Decimal('1199.00'), 'total_quantity': 350, 'perks': ['10+ Framer Remix Templates', 'Live Coding Session', 'Access to Design Community']},
                ]
            },
            {
                'title': 'Graphic Design & Street Art Festival',
                'slug': 'graphic-design-street-art-festival',
                'short_description': 'Live mural painting, silkscreen printmaking, sticker art, and contemporary illustration gallery.',
                'description': 'Celebrating independent visual artists, graffiti creators, and illustrators with live painting battles, merchandise popups, and craft coffee.',
                'banner_image_url': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Dhan Mill Compound Creative District',
                'address': '100 Feet Road, Chhatarpur',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 25,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Art Fest Pass', 'price': Decimal('499.00'), 'original_price': Decimal('799.00'), 'total_quantity': 400, 'perks': ['Festival Access', 'Limited Edition Art Sticker Pack']},
                ]
            },
            {
                'title': 'Architectural & Interior Spatial Design Conclave',
                'slug': 'architectural-interior-spatial-design-conclave',
                'short_description': 'Biophilic architecture, sustainable materials, smart lighting design, and luxury residential aesthetics.',
                'description': 'Leading architects and interior designers showcase groundbreaking residential and commercial interior spaces integrating sustainable biomaterials.',
                'banner_image_url': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'World Trade Centre Convention Hall',
                'address': 'Brigade Gateway, Malleshwaram',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 34,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Architect Pass', 'price': Decimal('1499.00'), 'original_price': Decimal('2299.00'), 'total_quantity': 150, 'perks': ['Full Conclave Access', 'Architecture Catalog', 'Buffet Lunch']},
                ]
            },
            {
                'title': 'Game Art & Character Concept Design Summit',
                'slug': 'game-art-character-concept-design-summit',
                'short_description': 'Character sculpts in ZBrush, environmental world-building in Unreal Engine 5, and concept art pipelines.',
                'description': 'Join veteran concept artists and game designers from AAA studios breaking down character anatomy, stylized lighting, and weapon conceptualization.',
                'banner_image_url': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'HITEX Exhibition Center Hall 2',
                'address': 'Izzathnagar, Madhapur',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'days_ahead': 30,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Game Artist Pass', 'price': Decimal('1299.00'), 'original_price': Decimal('1899.00'), 'total_quantity': 200, 'perks': ['Concept Art Demos', 'Portfolio Review Booth', 'Lunch']},
                ]
            },
            {
                'title': 'Fashion Design & Sustainable Haute Couture Runway',
                'slug': 'fashion-design-sustainable-couture-runway',
                'short_description': 'Eco-conscious textiles, avant-garde silhouettes, and upcycled fashion on a high-octane ramp.',
                'description': 'Witness boundary-pushing runway shows featuring indigenous handlooms reimagined with modern structural tailoring and zero-waste patterns.',
                'banner_image_url': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'The Lalit Grand Ballroom & Runway',
                'address': 'Barakhamba Avenue, Connaught Place',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 29,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Runway Silver Pass', 'price': Decimal('1799.00'), 'original_price': Decimal('2500.00'), 'total_quantity': 180, 'perks': ['Runway Seating', 'Designer Showcase Access']},
                    {'name': 'Front Row VIP Pass', 'price': Decimal('4499.00'), 'original_price': Decimal('6000.00'), 'total_quantity': 40, 'perks': ['Front Row Seat', 'Backstage Access', 'Champagne Lounge']},
                ]
            },
            {
                'title': 'Creative Coding & Generative Visual Art with p5.js',
                'slug': 'creative-coding-generative-art-p5js',
                'short_description': 'Turn mathematical algorithms into captivating visual art, interactive shaders, and kinetic typography.',
                'description': 'Learn how code becomes a canvas using p5.js, GLSL fragment shaders, and TouchDesigner for audio-reactive installations.',
                'banner_image_url': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Interactive Creative Code Lab',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 18,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Workshop Ticket', 'price': Decimal('449.00'), 'original_price': Decimal('899.00'), 'total_quantity': 300, 'perks': ['Source Code Repos', 'Live Code Along', 'Recording Access']},
                ]
            },
            {
                'title': 'Packaging Design & Tactile Unboxing Experience Expo',
                'slug': 'packaging-design-tactile-unboxing-expo',
                'short_description': 'Sustainable paper engineering, metallic foils, embossed finishes, and sensory unboxing journeys.',
                'description': 'Explore how premier luxury, cosmetic, and gourmet brands use tactile packaging mechanics to delight customers and drive organic viral shares.',
                'banner_image_url': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Nehru Centre Exhibition Hall',
                'address': 'Dr. Annie Besant Road, Worli',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 43,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Delegate Pass', 'price': Decimal('999.00'), 'original_price': Decimal('1499.00'), 'total_quantity': 200, 'perks': ['Sample Swatch Kit', 'All Talks', 'Lunch']},
                ]
            },
            {
                'title': 'Design Leadership & Managing Creative Teams',
                'slug': 'design-leadership-managing-creative-teams',
                'short_description': 'How Design Directors scale design teams, influence C-level strategy, and foster psychological safety.',
                'description': 'An executive roundtable for Staff Designers, Lead Researchers, and Design Managers transitioning into VP & Head of Design roles.',
                'banner_image_url': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Soho House Juhu',
                'address': '16 Juhu Tara Road, Chandrabai Nagar',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 26,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Leadership Pass', 'price': Decimal('2999.00'), 'original_price': Decimal('4200.00'), 'total_quantity': 50, 'perks': ['Executive Roundtables', 'Networking Dinner', 'Design Ops Framework']},
                ]
            },
            {
                'title': 'Calligraphy & Hand Lettering Master Workshop',
                'slug': 'calligraphy-hand-lettering-master-workshop',
                'short_description': 'Master pointed pen nibs, brush lettering flourishes, gold leaf illumination, and vintage script.',
                'description': 'An intimate hands-on atelier teaching Copperplate and Gothic calligraphy with bespoke imported nibs, walnut inks, and handmade cotton papers.',
                'banner_image_url': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Atta Galatta Cultural Space',
                'address': '134, KHB Colony, 5th Block Koramangala',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 12,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Workshop Kit & Seat', 'price': Decimal('1299.00'), 'original_price': Decimal('1899.00'), 'total_quantity': 35, 'perks': ['Professional Nib Holder & Inks Kit', 'Worksheets', 'Artisan Coffee & Snacks']},
                ]
            },
            {
                'title': 'Photography Masterclass: Cinematic Lighting & Portraits',
                'slug': 'photography-cinematic-lighting-portraits',
                'short_description': 'Master Rembrandt lighting, color gels, strobe modifiers, and studio portrait direction.',
                'description': 'Shoot live with professional fashion models and cinematic lighting setups. Includes raw file editing masterclasses in Capture One and Photoshop.',
                'banner_image_url': 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Studio 24 Film & Photography City',
                'address': 'Goregaon Film City Road',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 20,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Shooter Pass', 'price': Decimal('1899.00'), 'original_price': Decimal('2699.00'), 'total_quantity': 45, 'perks': ['Hands-on Studio Shooting Time', 'Model Release Access', 'Lightroom Presets Pack']},
                ]
            },
            {
                'title': 'Micro-Interactions & Motion Choreography in UI',
                'slug': 'micro-interactions-motion-choreography-ui',
                'short_description': 'Craft delightful button clicks, fluid morphing transitions, and physics-based gesture responses.',
                'description': 'Understand the psychological impact of micro-feedback, timing curves (cubic-bezier), spring dynamics, and subtle tactile vibrations in modern applications.',
                'banner_image_url': 'https://images.unsplash.com/photo-1581291518655-9523c932deb4?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Motion Design Livestream',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 16,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Motion Pass', 'price': Decimal('499.00'), 'original_price': Decimal('899.00'), 'total_quantity': 350, 'perks': ['Motion Code Snippets', 'Figma Motion File', 'Session Video']},
                ]
            },
            {
                'title': 'Sound Design for Digital Products & Games',
                'slug': 'sound-design-digital-products-games',
                'short_description': 'Compose subtle UI auditory cues, game audio feedback, spatial audio, and branded sonic logos.',
                'description': 'Discover the science of sonic branding. Learn how to synthesize notification bells, swipe whooshes, reward chimes, and ambient soundscapes with Ableton Live.',
                'banner_image_url': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Sonic Arts Virtual Studio',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 31,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Audio Pass', 'price': Decimal('549.00'), 'original_price': Decimal('999.00'), 'total_quantity': 250, 'perks': ['Royalty-free UI Sound Library (200+ SFX)', 'Ableton Project Files']},
                ]
            },
        ]

        # -------------------------------------------------------------
        # 5. WORKSHOPS & EDUCATION EVENTS (15 Events)
        # -------------------------------------------------------------
        workshops_events = [
            {
                'title': 'Full-Stack GenAI Bootcamp: Build & Deploy 5 Production Apps',
                'slug': 'fullstack-genai-bootcamp-build-deploy',
                'short_description': 'Hands-on weekend bootcamp building RAG systems, AI agents, streaming chatbots, and multimodal assistants.',
                'description': 'Over 2 intensive days, build and deploy 5 real-world AI applications using Next.js 15, FastAPI, LangGraph, pgvector, and Claude 3.5 Sonnet. Receive direct code reviews from senior AI engineers.',
                'banner_image_url': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Live Interactive Code Lab & Discord',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 8,
                'is_featured': True,
                'is_trending': True,
                'tickets': [
                    {'name': 'Student Bootcamp Pass', 'price': Decimal('799.00'), 'original_price': Decimal('1499.00'), 'total_quantity': 200, 'perks': ['Live Coding Access', 'All 5 Project Repos', 'Verified Certificate']},
                    {'name': 'Professional Pass + Code Review', 'price': Decimal('1799.00'), 'original_price': Decimal('2999.00'), 'total_quantity': 60, 'perks': ['All Student Perks', '1-on-1 Code Review', 'Resume Review']},
                ]
            },
            {
                'title': 'Financial Modeling & Stock Valuation Masterclass',
                'slug': 'financial-modeling-stock-valuation-masterclass',
                'short_description': 'Build 3-statement DCF models, comparable company analysis, and forecast corporate earnings like Wall Street analysts.',
                'description': 'Taught by ex-Goldman Sachs investment bankers. Learn Excel shortcuts, debt waterfall schedules, scenario sensitivity tables, and valuation pitch decks.',
                'banner_image_url': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Virtual Financial Modeling Room',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 14,
                'is_featured': True,
                'is_trending': False,
                'tickets': [
                    {'name': 'Masterclass Pass', 'price': Decimal('999.00'), 'original_price': Decimal('1899.00'), 'total_quantity': 250, 'perks': ['15+ Unlocked Excel Valuation Models', 'Recorded Videos', 'Certificate']},
                ]
            },
            {
                'title': 'Public Speaking & Executive Presence Masterclass',
                'slug': 'public-speaking-executive-presence-masterclass',
                'short_description': 'Overcome stage fright, master vocal modulation, structure persuasive keynotes, and command any room.',
                'description': 'An interactive physical workshop with live stage practice, instant video playback feedback, and body language coaching by TEDx speech coaches.',
                'banner_image_url': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'India Islamic Cultural Centre Hall',
                'address': '87-88 Lodhi Road',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 22,
                'is_featured': False,
                'is_trending': True,
                'tickets': [
                    {'name': 'Workshop Seat', 'price': Decimal('1499.00'), 'original_price': Decimal('2299.00'), 'total_quantity': 40, 'perks': ['Live Stage Practice', 'Personalized Video Critique', 'Lunch & Workbook']},
                ]
            },
            {
                'title': 'Data Science & Machine Learning with Python Bootcamp',
                'slug': 'data-science-machine-learning-python-bootcamp',
                'short_description': 'Pandas, Scikit-learn, exploratory data analysis, feature engineering, and model deployment.',
                'description': 'A comprehensive beginner to intermediate hands-on bootcamp turning raw datasets into predictive regression, classification, and clustering models.',
                'banner_image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Google Meet Interactive Lab',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 17,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Learner Ticket', 'price': Decimal('699.00'), 'original_price': Decimal('1299.00'), 'total_quantity': 350, 'perks': ['Jupyter Notebook Kits', 'Dataset Bundles', 'Certificate of Completion']},
                ]
            },
            {
                'title': 'Product Management (PM) Accelerator & Case Study Lab',
                'slug': 'product-management-accelerator-case-study',
                'short_description': 'Write bulletproof PRDs, prioritize feature backlogs (RICE framework), run user interviews, and crack PM interviews.',
                'description': 'Led by Senior PMs from Google, Swiggy, and Razorpay. Includes live product tear-downs, metrics calculation (CAC, LTV, Churn), and mock interview drills.',
                'banner_image_url': 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'WeWork Galaxy Residency Road',
                'address': '43 Residency Road, Shanthala Nagar',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 24,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'PM Aspirant Pass', 'price': Decimal('1899.00'), 'original_price': Decimal('2799.00'), 'total_quantity': 75, 'perks': ['PRD Templates', 'Mock Interview Drills', 'Networking Lunch']},
                ]
            },
            {
                'title': 'Creative Writing, Storytelling & Screenplay Workshop',
                'slug': 'creative-writing-screenplay-workshop',
                'short_description': 'Craft compelling narrative arcs, multi-dimensional characters, snappy dialogue, and cinematic scripts.',
                'description': 'Taught by published novelists and OTT series screenwriters. Includes daily writing sprints, constructive group peer critique, and publishing pitching guides.',
                'banner_image_url': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'The Habitat Comedy & Cultural Space',
                'address': 'Hotel Unicontinental, Khar West',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 19,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Writer Seat', 'price': Decimal('899.00'), 'original_price': Decimal('1399.00'), 'total_quantity': 50, 'perks': ['Writing Handbook', 'Direct Feedback on Your Script', 'Coffee & Cookies']},
                ]
            },
            {
                'title': 'AWS Certified Solutions Architect Intensive Exam Prep',
                'slug': 'aws-certified-solutions-architect-exam-prep',
                'short_description': 'Crack the SAA-C03 exam with hands-on VPC configuration, IAM security, high availability, and 500+ practice questions.',
                'description': 'Fast-track your cloud certification with an authorized AWS trainer. Includes architecture diagramming exercises, troubleshooting labs, and mock exams.',
                'banner_image_url': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Cloud Certification Live Portal',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 26,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Exam Prep Ticket', 'price': Decimal('1199.00'), 'original_price': Decimal('1999.00'), 'total_quantity': 250, 'perks': ['6 Full-Length Mock Exams', 'Exam Cheat Sheets', 'Live Doubt Clearing']},
                ]
            },
            {
                'title': 'SEO, Content Strategy & Generative Search Optimization',
                'slug': 'seo-content-strategy-generative-search',
                'short_description': 'Rank #1 on Google and AI search engines (ChatGPT Search, Perplexity) with semantic topical authority.',
                'description': 'Master technical SEO audits, programmatic SEO pipelines, schema markup, and content clustering to drive hundreds of thousands of organic visits.',
                'banner_image_url': 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Search Mastery Virtual Room',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 20,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'SEO Workshop Pass', 'price': Decimal('599.00'), 'original_price': Decimal('1099.00'), 'total_quantity': 300, 'perks': ['SEO Audit Checklist', 'Keyword Research Spreadsheet', 'Recording']},
                ]
            },
            {
                'title': 'Robotics & Arduino Electronics for Kids & Teens (Ages 10-16)',
                'slug': 'robotics-arduino-electronics-kids-teens',
                'short_description': 'Build obstacle-avoiding smart cars, sensor alarms, and automated plant waterers with hands-on microcontrollers.',
                'description': 'An exciting STEM robotics camp introducing young creators to circuit wiring, breadboards, ultrasonic sensors, and block/C++ programming.',
                'banner_image_url': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'MakerSpace Innovation Lab',
                'address': 'Kavuri Hills, Phase 1, Madhapur',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'days_ahead': 15,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Young Maker Pass', 'price': Decimal('1599.00'), 'original_price': Decimal('2299.00'), 'total_quantity': 40, 'perks': ['Complete Robotics Hardware Kit to Take Home', 'Lunch & Certificate']},
                ]
            },
            {
                'title': 'Spanish Language & Culture Immersion Bootcamp',
                'slug': 'spanish-language-culture-immersion-bootcamp',
                'short_description': 'Conversational fluency, essential grammar, Latin American travel phrases, and salsa music culture.',
                'description': 'Learn to speak confident conversational Spanish with native speakers through roleplay dialogues, pronunciation drills, and tapas food culture sessions.',
                'banner_image_url': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Instituto Virtual de Español',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 30,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Language Pass', 'price': Decimal('499.00'), 'original_price': Decimal('899.00'), 'total_quantity': 200, 'perks': ['Interactive Audio Flashcards', 'Practice Workbook PDF', 'Grammar Cheat Sheet']},
                ]
            },
            {
                'title': 'Mastering Kubernetes (CKA) Certification Hands-on Lab',
                'slug': 'mastering-kubernetes-cka-certification-lab',
                'short_description': 'Troubleshoot control planes, worker nodes, ingress controllers, network policies, and storage PVCs.',
                'description': '100% terminal-based scenario training simulating real questions from the Linux Foundation Certified Kubernetes Administrator (CKA) exam.',
                'banner_image_url': 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Live Remote Terminal Lab',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 32,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Lab Access Pass', 'price': Decimal('1299.00'), 'original_price': Decimal('2199.00'), 'total_quantity': 150, 'perks': ['Dedicated Remote K8s Cluster (7 Days)', 'CKA Exam Tips Guide']},
                ]
            },
            {
                'title': 'Art of Negotiation & Conflict Resolution Workshop',
                'slug': 'art-of-negotiation-conflict-resolution-workshop',
                'short_description': 'Harvard negotiation principles, BATNA formulation, salary hike discussions, and commercial dispute settlement.',
                'description': 'Learn tactical empathy, anchoring strategies, and win-win negotiation psychology from veteran corporate mediators.',
                'banner_image_url': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'India International Centre (IIC) Annexe',
                'address': '40 Max Mueller Marg',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 36,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Workshop Participant', 'price': Decimal('1699.00'), 'original_price': Decimal('2499.00'), 'total_quantity': 45, 'perks': ['Negotiation Roleplay Simulations', 'Workbook', 'High Tea & Lunch']},
                ]
            },
            {
                'title': 'Microbiology & Home Fermentation Masterclass',
                'slug': 'microbiology-home-fermentation-masterclass',
                'short_description': 'Craft artisanal Kombucha, sourdough bread starters, kimchi, and probiotic kefir safely at home.',
                'description': 'Understand the microbial biology of lacto-fermentation with food scientists. Includes starter SCOBY cultures and fermentation jars.',
                'banner_image_url': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Culinary Craft Studio',
                'address': 'Powai Plaza, Central Avenue',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 21,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Fermenter Pass', 'price': Decimal('1199.00'), 'original_price': Decimal('1799.00'), 'total_quantity': 35, 'perks': ['Live SCOBY & Sourdough Starter Kit', 'Tasting Platter', 'Recipe Guide']},
                ]
            },
            {
                'title': 'Personal Branding & LinkedIn Growth Blueprint',
                'slug': 'personal-branding-linkedin-growth-blueprint',
                'short_description': 'Optimize your profile, write viral thought leadership carousels, and attract high-paying consulting inbound leads.',
                'description': 'A high-impact masterclass that shows how to generate 100k+ organic views per post and build authority in your niche.',
                'banner_image_url': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.ONLINE,
                'venue_name': 'Virtual Brand Studio',
                'city': 'Online',
                'state': 'Virtual',
                'days_ahead': 10,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Creator Ticket', 'price': Decimal('499.00'), 'original_price': Decimal('999.00'), 'total_quantity': 400, 'perks': ['20+ High-Engagement Post Templates', 'Profile Headline Formula', 'Recording']},
                ]
            },
            {
                'title': 'Guitar & Music Production in Logic Pro / Ableton',
                'slug': 'guitar-music-production-logic-pro-workshop',
                'short_description': 'Record clean guitar stems, program punchy MIDI drums, mix EQ/compression, and master your original songs.',
                'description': 'Step-by-step music production masterclass taking an acoustic idea from raw chords to a radio-ready mastered track on Spotify.',
                'banner_image_url': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'The True School of Music Studios',
                'address': 'Lower Parel West',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 28,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Producer Seat', 'price': Decimal('1499.00'), 'original_price': Decimal('2299.00'), 'total_quantity': 30, 'perks': ['Studio Workstation Access', 'Drum Sample Pack (500+ Samples)', 'Snacks']},
                ]
            },
        ]

        # -------------------------------------------------------------
        # 6. SPORTS & FITNESS EVENTS (15 Events)
        # -------------------------------------------------------------
        sports_events = [
            {
                'title': 'National Marathon & Sunrise Fitness Carnival 2026',
                'slug': 'national-marathon-fitness-carnival-2026',
                'short_description': 'Run through the iconic monuments of New Delhi in 5K, 10K, and 21K Half Marathon categories with live cheer bands.',
                'description': 'Lace up your running shoes for the most exhilarating endurance and fitness celebration of the year! Includes RFID timing bibs, hydration stations every kilometer, medical pacers, finisher medals, and a hot post-run breakfast buffet.',
                'banner_image_url': 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Jawaharlal Nehru Stadium',
                'address': 'Pragati Vihar, Lodhi Road',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 35,
                'is_featured': True,
                'is_trending': True,
                'tickets': [
                    {'name': '5K Fun Run & Carnival Walk', 'price': Decimal('599.00'), 'original_price': Decimal('899.00'), 'total_quantity': 500, 'perks': ['Dri-Fit Jersey', 'Finisher Medal', 'Hot Breakfast Buffet']},
                    {'name': '10K Timed Challenge', 'price': Decimal('899.00'), 'original_price': Decimal('1199.00'), 'total_quantity': 400, 'perks': ['RFID Timing Bib', 'Official Jersey', 'Finisher Medal', 'Certificate']},
                    {'name': '21.1K Half Marathon Open', 'price': Decimal('1299.00'), 'original_price': Decimal('1699.00'), 'total_quantity': 300, 'perks': ['Timing Chip', 'Tech T-shirt', 'Heavy Engraved Metal Medal', 'Post-Race Massage']},
                ]
            },
            {
                'title': 'CrossFit Battlegrounds & Functional Fitness Championship',
                'slug': 'crossfit-battlegrounds-championship-2026',
                'short_description': 'Barbell snatches, kettlebell thrusters, rope climbs, and box jumps in a high-voltage arena.',
                'description': 'Athletes from across the country compete in Scaled, Rx, and Elite divisions for cash prizes and the title of Fittest in India.',
                'banner_image_url': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Kanteerava Indoor Stadium',
                'address': 'Kasturba Road, Sampangi Rama Nagara',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 27,
                'is_featured': True,
                'is_trending': False,
                'tickets': [
                    {'name': 'Spectator Cheer Pass', 'price': Decimal('399.00'), 'original_price': Decimal('699.00'), 'total_quantity': 600, 'perks': ['Stadium Bleacher Seating', 'Fitness Expo Access']},
                    {'name': 'Athlete Competitor Registration', 'price': Decimal('1999.00'), 'original_price': Decimal('2999.00'), 'total_quantity': 120, 'perks': ['Official Athlete Jersey', 'Custom Shaker Bottle', 'Competition Entry Badge']},
                ]
            },
            {
                'title': 'Rishikesh Sunrise Yoga & Meditation Retreat',
                'slug': 'rishikesh-sunrise-yoga-meditation-retreat',
                'short_description': '3 blissful days of Ashtanga Vinyasa, Pranayama breathing, sound healing, and Ganga Aarti ceremonies.',
                'description': 'Rejuvenate mind, body, and soul in the yoga capital of the world. Includes organic Ayurvedic sattvic meals, guided riverbank meditation, and sound bowl therapies.',
                'banner_image_url': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Ananda Ganga Riverside Ashram',
                'address': 'Tapovan, Badrinath Road',
                'city': 'Rishikesh',
                'state': 'Uttarakhand',
                'days_ahead': 23,
                'is_featured': False,
                'is_trending': True,
                'tickets': [
                    {'name': 'All-Inclusive 3-Day Retreat Pass', 'price': Decimal('4999.00'), 'original_price': Decimal('7500.00'), 'total_quantity': 60, 'perks': ['3 Days Yoga & Meditation Sessions', 'Organic Sattvic Meals', 'Sound Healing Therapy', 'Eco Mat Gift']},
                ]
            },
            {
                'title': 'Night Cycling Odyssey & Heritage Trail (25KM)',
                'slug': 'night-cycling-odyssey-heritage-trail',
                'short_description': 'Pedal through the quiet, breezy streets and iconic colonial monuments of Mumbai under starry midnight skies.',
                'description': 'A safe, guided group night bicycle ride starting from Marine Drive to Gateway of India, Bandra Fort, and Worli Seaface with support vehicles, helmet rentals, and midnight snacks.',
                'banner_image_url': 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Marine Drive Promenade Meeting Point',
                'address': 'Opposite Air India Building, Nariman Point',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'days_ahead': 13,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Ride with Own Cycle', 'price': Decimal('499.00'), 'original_price': Decimal('799.00'), 'total_quantity': 150, 'perks': ['Route Marshals Support', 'Mid-ride Snacks & Energy Drink', 'Finisher Badge']},
                    {'name': 'Ride + Geared Bicycle Rental Included', 'price': Decimal('899.00'), 'original_price': Decimal('1299.00'), 'total_quantity': 100, 'perks': ['Geared Bicycle Rental', 'Safety Helmet', 'Snacks & Hydration']},
                ]
            },
            {
                'title': 'Badminton Masters Open Tournament 2026',
                'slug': 'badminton-masters-open-tournament-2026',
                'short_description': 'Singles and Doubles matches across Beginner, Intermediate, and Advanced categories on Yonex synthetic courts.',
                'description': 'Compete with the city\'s finest badminton players with certified BWF referees, feather shuttlecocks, trophy ceremonies, and ₹1 Lakh total prize pool.',
                'banner_image_url': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Pullela Gopichand Badminton Academy',
                'address': 'ISB Road, Gachibowli',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'days_ahead': 25,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Men Singles Entry', 'price': Decimal('799.00'), 'original_price': Decimal('1199.00'), 'total_quantity': 64, 'perks': ['Guaranteed 2 Matches (Knockout + Plate)', 'Tournament T-Shirt', 'Energy Drinks']},
                    {'name': 'Doubles Team Entry', 'price': Decimal('1299.00'), 'original_price': Decimal('1799.00'), 'total_quantity': 48, 'perks': ['Entry for Both Players', '2 Tournament T-Shirts', 'Hydration Pack']},
                ]
            },
            {
                'title': 'Sunset Zumba & High-Energy Dance Fitness Party',
                'slug': 'sunset-zumba-dance-fitness-party',
                'short_description': 'Burn 800+ calories dancing to Latin, Salsa, and Bollywood beats with international master trainers.',
                'description': 'An electrifying outdoor sunset fitness fiesta with live DJ beats, neon face paint, glow accessories, and post-dance electrolyte protein smoothies.',
                'banner_image_url': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Miramar Beach Promenade Grounds',
                'address': 'Miramar Beach Road, Panaji',
                'city': 'Goa',
                'state': 'Goa',
                'days_ahead': 16,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Dance Pass', 'price': Decimal('499.00'), 'original_price': Decimal('799.00'), 'total_quantity': 250, 'perks': ['Zumba Session Access', 'Neon Glow Wristband', 'Fresh Fruit Smoothie']},
                ]
            },
            {
                'title': 'Mixed Martial Arts (MMA) & BJJ Grappling Championship',
                'slug': 'mma-bjj-grappling-championship-2026',
                'short_description': 'High-octane cage fights, Brazilian Jiu-Jitsu submission grappling, and Muay Thai striking bouts.',
                'description': 'Witness intense combat sports bouts in the Octagon cage featuring national champion fighters and IBJJF ranked grapplers.',
                'banner_image_url': 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Talkatora Indoor Stadium',
                'address': 'Talkatora Garden, President Estate',
                'city': 'New Delhi',
                'state': 'Delhi',
                'days_ahead': 31,
                'is_featured': False,
                'is_trending': True,
                'tickets': [
                    {'name': 'Cage-Side Ringside Seat', 'price': Decimal('1999.00'), 'original_price': Decimal('2999.00'), 'total_quantity': 80, 'perks': ['Front-Row Cage-Side Seat', 'Fighter Meet & Greet', 'Lanyard']},
                    {'name': 'Arena Seating Pass', 'price': Decimal('699.00'), 'original_price': Decimal('1099.00'), 'total_quantity': 400, 'perks': ['Standard Stadium Seating', 'Live Match Viewing']},
                ]
            },
            {
                'title': 'Open Water Sea Swimming & Coastal Aquathlon',
                'slug': 'open-water-sea-swimming-aquathlon',
                'short_description': '1KM / 2KM ocean swim followed by a 5KM scenic coastal trail run with full lifeguard safety.',
                'description': 'Test your endurance against ocean currents and sandy trails. Equipped with safety float buoys, rescue boat escorts, and instant timing chip tracking.',
                'banner_image_url': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Bambolim Beach Water Sports Center',
                'address': 'Grand Hyatt Waterfront, Bambolim',
                'city': 'Goa',
                'state': 'Goa',
                'days_ahead': 39,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Swimmer Entry Pass', 'price': Decimal('1199.00'), 'original_price': Decimal('1699.00'), 'total_quantity': 150, 'perks': ['Silicon Swim Cap', 'Safety Float Buoy (Provided)', 'Finisher Medal', 'Breakfast']},
                ]
            },
            {
                'title': 'Himalayan High-Altitude Trekking Expedition (Kedarkantha)',
                'slug': 'himalayan-high-altitude-trek-kedarkantha',
                'short_description': 'Summit 12,500 feet snowy peaks with certified mountaineers, alpine camping, and stargazing.',
                'description': 'A 4-day winter wonderland trek through dense pine forests, frozen lakes, and 360-degree panoramic Himalayan peaks with professional guides and warm high-grade tents.',
                'banner_image_url': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Sankri Basecamp',
                'address': 'Govind Wildlife Sanctuary, Uttarkashi',
                'city': 'Sankri',
                'state': 'Uttarakhand',
                'days_ahead': 42,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'All-Inclusive Trek Package', 'price': Decimal('6999.00'), 'original_price': Decimal('9500.00'), 'total_quantity': 40, 'perks': ['4 Days Camping & Nutritious Meals', 'Mountaineering Guides & Crampons', 'Permits & Trekking Certificate']},
                ]
            },
            {
                'title': 'Corporate 5-a-Side Box Cricket League 2026',
                'slug': 'corporate-box-cricket-league-2026',
                'short_description': 'Short, intense 6-over floodlight box cricket matches on professional artificial turf with live commentary.',
                'description': 'Gather your company or college team and battle for the Box Cricket Trophy. Includes video replays, DRS umpire reviews, and refreshments.',
                'banner_image_url': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'TurfPark Rooftop Arena',
                'address': 'Near Indiranagar Metro Station',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 18,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Team Entry (Up to 8 Players)', 'price': Decimal('3499.00'), 'original_price': Decimal('4999.00'), 'total_quantity': 32, 'perks': ['Guaranteed 3 League Matches', 'Team Custom Jerseys', 'Energy Drinks & Snacks']},
                ]
            },
            {
                'title': 'Pilates & Core Strength Re-Alignment Masterclass',
                'slug': 'pilates-core-strength-realignment-masterclass',
                'short_description': 'Reformer & mat Pilates for posture correction, pelvic stability, and sculpted deep core endurance.',
                'description': 'Master classical Pilates breathwork and alignment with certified physiotherapists. Ideal for resolving desk-job back pain and building functional flexibility.',
                'banner_image_url': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'The PhysioFit Pilates Studio',
                'address': 'Prabhat Road, Deccan Gymkhana',
                'city': 'Pune',
                'state': 'Maharashtra',
                'days_ahead': 14,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Pilates Session Pass', 'price': Decimal('899.00'), 'original_price': Decimal('1399.00'), 'total_quantity': 25, 'perks': ['Reformer + Mat Instruction', 'Resistance Band Gift Set', 'Smoothie']},
                ]
            },
            {
                'title': 'Calisthenics & Bodyweight Street Workout Jam',
                'slug': 'calisthenics-bodyweight-street-workout-jam',
                'short_description': 'Master muscle-ups, human flags, handstands, and planches with national calisthenics champions.',
                'description': 'A high-energy outdoor park session focusing on progressive bodyweight strength, explosive bar freestyle, and joint conditioning.',
                'banner_image_url': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Cubbon Park Open Calisthenics Arena',
                'address': 'Kasturba Road, Sampangi Rama Nagar',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 11,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Jam Pass', 'price': Decimal('399.00'), 'original_price': Decimal('699.00'), 'total_quantity': 100, 'perks': ['Coaching by Calisthenics Athletes', 'Chalk & Wrist Wraps Demo', 'Drink']},
                ]
            },
            {
                'title': 'Table Tennis Fast-Paced Knockout Open',
                'slug': 'table-tennis-fast-paced-knockout-open',
                'short_description': 'Spin, smash, and slice on Stag ITTF approved tables with automated ball tracking and live scoreboards.',
                'description': 'An adrenaline-fueled indoor table tennis showdown for amateur and ranked players. Cash prizes, medals, and Stag merchandise for winners.',
                'banner_image_url': 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Decathlon Sports Arena Complex',
                'address': 'Sarjapur Main Road',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'days_ahead': 21,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Singles Player Entry', 'price': Decimal('599.00'), 'original_price': Decimal('899.00'), 'total_quantity': 64, 'perks': ['Minimum 2 Knockout Matches', 'Stag TT Balls Pack', 'Hydration']},
                ]
            },
            {
                'title': 'Kettlebell Sport & Powerlifting Deadlift Showcase',
                'slug': 'kettlebell-sport-powerlifting-showcase',
                'short_description': 'Long cycle clean & jerks, heavy deadlift PR attempts, and powerlifting coaching cues.',
                'description': 'Witness tremendous feats of strength with calibrated iron plates and eleiko barbells. Includes lifting form clinics by IPF international referees.',
                'banner_image_url': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'IronStrength Barbell Club',
                'address': 'Industrial Area Phase 2',
                'city': 'Chandigarh',
                'state': 'Punjab',
                'days_ahead': 33,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Lifter Registration', 'price': Decimal('999.00'), 'original_price': Decimal('1499.00'), 'total_quantity': 50, 'perks': ['Official Lift Attempt Registration', 'Lifting Chalk & T-Shirt']},
                ]
            },
            {
                'title': 'Kayaking & Stand-Up Paddleboard (SUP) Expedition',
                'slug': 'kayaking-standup-paddleboard-expedition',
                'short_description': 'Glide through serene mangrove backwaters, bird sanctuaries, and calm lagoon waters at sunrise.',
                'description': 'A tranquil morning on the water learning single/tandem sit-on-top kayaking and paddleboarding with certified water sports guides.',
                'banner_image_url': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80',
                'event_type': EventType.IN_PERSON,
                'venue_name': 'Chapora River Mangrove Sanctuary',
                'address': 'Siolim River Jetty',
                'city': 'Goa',
                'state': 'Goa',
                'days_ahead': 15,
                'is_featured': False,
                'is_trending': False,
                'tickets': [
                    {'name': 'Kayak & Guide Pass', 'price': Decimal('1299.00'), 'original_price': Decimal('1799.00'), 'total_quantity': 30, 'perks': ['Kayak & Paddle Gear', 'Life Jacket Provided', 'Waterproof Phone Pouch', 'Breakfast']},
                ]
            },
        ]

        # Group all together with their categories and organizers
        all_event_groups = [
            (cat_map['technology'], organizer_tech, tech_events),
            (cat_map['music'], organizer_music, music_events),
            (cat_map['business'], organizer_biz, biz_events),
            (cat_map['design'], organizer_creative, design_events),
            (cat_map['workshops'], organizer_tech, workshops_events),
            (cat_map['sports'], organizer_sports, sports_events),
        ]

        total_created = 0
        for category, organizer, events_list in all_event_groups:
            self.stdout.write(f"\nProcessing Category: {category.name} ({len(events_list)} events)...")
            for item in events_list:
                slug = item['slug']
                tickets_data = item.get('tickets', [])
                days_ahead = item.get('days_ahead', 14)
                
                event_date = timezone.now().date() + timedelta(days=days_ahead)
                end_date = event_date + timedelta(days=1 if '2-day' in item.get('description', '').lower() or 'conclave' in item['title'].lower() else 0)

                event, created = Event.objects.update_or_create(
                    slug=slug,
                    defaults={
                        'title': item['title'],
                        'category': category,
                        'organizer': organizer,
                        'short_description': item['short_description'],
                        'description': item['description'],
                        'banner_image_url': item['banner_image_url'],
                        'event_type': item.get('event_type', EventType.IN_PERSON),
                        'venue_name': item.get('venue_name', 'Main Convention Arena'),
                        'address': item.get('address', 'Downtown City Center'),
                        'city': item.get('city', 'Bengaluru'),
                        'state': item.get('state', 'Karnataka'),
                        'country': 'India',
                        'postal_code': '560001',
                        'google_maps_url': f"https://maps.google.com/?q={item.get('city', 'Bengaluru')}",
                        'online_meeting_url': 'https://stream.eventsphere.com/live-stream' if item.get('event_type') in [EventType.ONLINE, EventType.HYBRID] else '',
                        'start_date': event_date,
                        'end_date': end_date,
                        'start_time': time(9, 30),
                        'end_time': time(18, 0),
                        'status': EventStatus.PUBLISHED,
                        'is_featured': item.get('is_featured', False),
                        'is_trending': item.get('is_trending', False),
                        'contact_email': organizer.email,
                        'contact_phone': '+91 98765 00000',
                        'terms_conditions': 'Tickets are transferable up to 24 hours before the event start time. Government photo ID required.',
                    }
                )

                # Recreate tickets cleanly
                event.ticket_types.all().delete()
                for idx, t_info in enumerate(tickets_data):
                    tot_qty = t_info.get('total_quantity', 100)
                    avail_qty = max(1, int(tot_qty * 0.7))
                    TicketType.objects.create(
                        event=event,
                        name=t_info['name'],
                        price=t_info['price'],
                        original_price=t_info.get('original_price'),
                        total_quantity=tot_qty,
                        available_quantity=avail_qty,
                        perks=t_info.get('perks', []),
                        order=idx
                    )

                # Add a speaker
                if not event.speakers.exists():
                    Speaker.objects.create(
                        event=event,
                        name=f"Lead Specialist ({category.name})",
                        designation="Keynote Speaker & Domain Expert",
                        company=organizer.organization_name or "Global Tech & Culture",
                        bio="Pioneering industry leader with over a decade of hands-on leadership and domain experience.",
                        avatar_url=organizer.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    )

                # Add a schedule item
                if not event.schedules.exists():
                    EventSchedule.objects.create(
                        event=event,
                        day_number=1,
                        start_time=time(10, 0),
                        end_time=time(12, 30),
                        title="Main Keynote & Interactive Experience",
                        speaker_name=f"Lead Specialist ({category.name})",
                        location_room="Grand Hall Alpha",
                        description="Comprehensive opening track followed by live breakout sessions and networking."
                    )

                total_created += 1

        self.stdout.write(self.style.SUCCESS(f"\nSuccessfully seeded {total_created} events across all 6 requested categories!"))
        for cat_slug, cat_obj in cat_map.items():
            count = Event.objects.filter(category=cat_obj, status=EventStatus.PUBLISHED).count()
            self.stdout.write(f"  • {cat_obj.name}: {count} published events")
