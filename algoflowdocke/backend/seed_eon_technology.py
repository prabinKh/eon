import os
import django
import random
from django.utils.text import slugify

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fixitall_backend.settings')
django.setup()

from company.models import Company, FooterSettings
from account.models import MyUser as User
from efrontend.models import Category, Brand, Product, Collection, HeroSetting, Order, OrderItem
from eadmin.models import CategoryFeature, ServiceTicket, StaffRole, StaffMember

def seed_eon():
    print("=" * 60)
    print("🚀 Seeding Eon Technology Catalog & Admin Data...")
    print("=" * 60)

    # 1. Company Setup
    company = Company.objects.first()
    if not company:
        company = Company.objects.create(
            name="Eon Technology Pvt. Ltd.",
            slug="eon-technology",
            theme_color="#6366f1",
            email="info@eontechnology.com",
            phone="+977-1-4444444",
            address="Putalisadak, Kathmandu, Nepal",
            description="Authorized Distributor of CCTV, Security Surveillance, Networking & IT Hardware Products.",
            logo="http://demo.neoteric.com.np/media/bnejumgd/eontechnology-logo.png",
            is_active=True
        )
        print(f"✅ Created Company: {company.name}")
    else:
        company.name = "Eon Technology Pvt. Ltd."
        company.slug = "eon-technology"
        company.theme_color = "#6366f1"
        company.logo = "http://demo.neoteric.com.np/media/bnejumgd/eontechnology-logo.png"
        company.email = "info@eontechnology.com"
        company.phone = "+977-1-4444444"
        company.address = "Putalisadak, Kathmandu, Nepal"
        company.description = "Authorized Distributor of CCTV, Security Surveillance, Networking & IT Hardware Products."
        company.is_active = True
        company.save()
        print(f"✅ Updated Company: {company.name}")

    # Ensure Footer Settings
    FooterSettings.objects.update_or_create(
        company=company,
        defaults={
            "company_name": "Eon Technology Pvt. Ltd.",
            "email": "info@eontechnology.com",
            "phone": "+977-1-4444444",
            "address": "Putalisadak, Kathmandu, Nepal",
            "copyright_text": "© 2026 Eon Technology Pvt. Ltd. All rights reserved.",
            "facebook_url": "https://facebook.com/eontechnology",
            "twitter_url": "https://twitter.com/eontechnology",
            "instagram_url": "https://instagram.com/eontechnology",
            "linkedin_url": "https://linkedin.com/company/eontechnology",
            "show_social_links": True,
            "show_payment_methods": True
        }
    )

    # 2. Superadmin User: prabin@gmail.com
    admin_user, created = User.objects.get_or_create(
        email="prabin@gmail.com",
        defaults={
            "name": "Prabin Khadka",
            "company": company,
            "role": "superadmin",
            "is_staff": True,
            "is_superuser": True,
            "is_admin": True,
            "is_active": True,
            "email_verified": True
        }
    )
    admin_user.name = "Prabin Khadka"
    admin_user.company = company
    admin_user.set_password("Prabin@1234")
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.is_admin = True
    admin_user.role = "superadmin"
    admin_user.is_active = True
    admin_user.email_verified = True
    admin_user.save()
    print(f"✅ Verified Admin User: {admin_user.email} (superuser=True, staff=True)")

    # 3. Hero Banner Settings
    HeroSetting.objects.update_or_create(
        company=company,
        defaults={
            "title": "Next-Gen Security & IT Solutions",
            "subtitle": "Official Distributor of Dahua, CP Plus & ANT Esports",
            "description": "Empowering enterprises and smart homes with cutting-edge surveillance, gaming gear, networking, and high-performance hardware.",
            "image": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80",
            "cta_text": "Explore Catalog",
            "cta_link": "/category/dahua",
            "is_active": True
        }
    )
    print("✅ Configured Hero Banner Settings")

    # 4. Collections
    collection_names = [
        "New Arrivals",
        "Deal Of The Week",
        "Best Price",
        "Popular",
        "Dahua Security",
        "Surveillance Systems",
        "Gaming & Peripherals"
    ]
    for c_name in collection_names:
        Collection.objects.get_or_create(
            company=company,
            name=c_name,
            defaults={"is_active": True}
        )
    print("✅ Created Homepage Collections")

    # 5. Brands Definition
    brands_data = [
        {"name": "Dahua", "logo": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Dahua_Technology_logo.svg", "desc": "World leader in video surveillance and AIoT technology"},
        {"name": "CP Plus", "logo": "https://upload.wikimedia.org/wikipedia/commons/e/ec/CP_PLUS_Logo.png", "desc": "Intelligent security solutions and high-definition surveillance systems"},
        {"name": "ANT Esports", "logo": "https://m.media-amazon.com/images/S/stores-image-uploads-eu-prod/6/AmazonStores/A21TJRUUN4KGV/e53a39e9241b181ca265005ddbe54f3b.w400.h400.jpg", "desc": "India's premier gaming peripheral and hardware gear brand"},
        {"name": "Fenda", "logo": "https://fenda.com/wp-content/themes/fenda/images/logo.png", "desc": "F&D Audio acoustic technology and sound innovation"},
        {"name": "D-Link", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/D-Link_wordmark.svg/1200px-D-Link_wordmark.svg.png", "desc": "Networking for people and businesses worldwide"},
        {"name": "TP-Link", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/TP-Link_logo_2016.svg/1280px-TP-Link_logo_2016.svg.png", "desc": "Reliably Smart networking devices and Wi-Fi solutions"},
        {"name": "Cisco", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Cisco_logo_blue_2016.svg/1200px-Cisco_logo_blue_2016.svg.png", "desc": "Global networking, cloud, and security enterprise equipment"},
        {"name": "Kingston", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Kingston_Technology_logo.svg/1280px-Kingston_Technology_logo.svg.png", "desc": "Leading memory and storage solutions provider"},
        {"name": "SanDisk", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/SanDisk_Logo.svg/1200px-SanDisk_Logo.svg.png", "desc": "Flash memory, SD cards, and portable digital storage"},
        {"name": "Western Digital", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Western_Digital_logo.svg/1200px-Western_Digital_logo.svg.png", "desc": "Data infrastructure and high capacity hard drives"},
        {"name": "Intex", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Intex_Technologies_Logo.png/1200px-Intex_Technologies_Logo.png", "desc": "Affordable and reliable IT peripherals, monitors, and accessories"},
        {"name": "Posiflex", "logo": "https://www.posiflex.com/images/logo.png", "desc": "Global leader in point-of-sale hardware and touch terminals"}
    ]

    brand_objs = {}
    for b in brands_data:
        slug = slugify(b["name"])
        brand_obj, _ = Brand.objects.update_or_create(
            company=company,
            slug=slug,
            defaults={
                "name": b["name"],
                "logo": b["logo"],
                "description": b["desc"],
                "is_active": True
            }
        )
        brand_objs[b["name"]] = brand_obj

    print(f"✅ Synced {len(brand_objs)} Brands")

    # 6. Categories Definition (Matching Navbar Exactly)
    categories_spec = [
        {
            "name": "Dahua",
            "slug": "dahua",
            "icon": "camera",
            "desc": "Dahua Technology - Leading Video-Centric AIoT Solution & Service Provider",
            "image": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80",
            "brands": ["Dahua"],
            "subcategories": [
                {"name": "HDCVI Cameras", "slug": "dahua?type=HDCVI+Camera"},
                {"name": "IP Cameras (IPC)", "slug": "dahua?type=IPC"},
                {"name": "PTZ Cameras", "slug": "dahua?type=PTZ"},
                {"name": "NVR", "slug": "dahua?type=NVR"},
                {"name": "XVR", "slug": "dahua?type=XVR"},
                {"name": "Switch", "slug": "dahua?type=Switch"},
                {"name": "Dahua Storage", "slug": "dahua?type=Storage"},
            ],
            "sections": [
                {
                    "title": "Surveillance Hardware",
                    "items": [
                        {"name": "HDCVI Cameras", "slug": "/category/dahua?type=HDCVI+Camera"},
                        {"name": "IP Cameras (IPC)", "slug": "/category/dahua?type=IPC"},
                        {"name": "PTZ Cameras", "slug": "/category/dahua?type=PTZ"},
                    ]
                },
                {
                    "title": "Recording & Network",
                    "items": [
                        {"name": "NVR", "slug": "/category/dahua?type=NVR"},
                        {"name": "XVR", "slug": "/category/dahua?type=XVR"},
                        {"name": "Switch", "slug": "/category/dahua?type=Switch"},
                        {"name": "Dahua Storage", "slug": "/category/dahua?type=Storage"},
                    ]
                }
            ]
        },
        {
            "name": "CP Plus",
            "slug": "cp-plus",
            "icon": "shield",
            "desc": "CP PLUS World - Advanced Security & Surveillance Solutions",
            "image": "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80",
            "brands": ["CP Plus"],
            "subcategories": [
                {"name": "IP Cameras", "slug": "cp-plus?type=IPC"},
                {"name": "HDCVI Cameras", "slug": "cp-plus?type=HDCVI"},
                {"name": "NVR", "slug": "cp-plus?type=NVR"},
                {"name": "Cable", "slug": "cp-plus?type=Cable"},
                {"name": "Power Supply", "slug": "cp-plus?type=Power+Supply"},
                {"name": "Racks", "slug": "cp-plus?type=Racks"},
            ],
            "sections": [
                {
                    "title": "Surveillance Equipment",
                    "items": [
                        {"name": "IP Cameras", "slug": "/category/cp-plus?type=IPC"},
                        {"name": "HDCVI Cameras", "slug": "/category/cp-plus?type=HDCVI"},
                        {"name": "NVR", "slug": "/category/cp-plus?type=NVR"},
                    ]
                },
                {
                    "title": "Accessories & Racks",
                    "items": [
                        {"name": "Cable", "slug": "/category/cp-plus?type=Cable"},
                        {"name": "Power Supply", "slug": "/category/cp-plus?type=Power+Supply"},
                        {"name": "Racks", "slug": "/category/cp-plus?type=Racks"},
                    ]
                }
            ]
        },
        {
            "name": "ANT Esports",
            "slug": "ant-esports",
            "icon": "gamepad",
            "desc": "ANT Esports - Premium Gaming Peripherals, Coolers, Chairs & PC Components",
            "image": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
            "brands": ["ANT Esports"],
            "subcategories": [
                {"name": "Mouse & Keyboard", "slug": "ant-esports?type=Mouse+Keyboard"},
                {"name": "Cabinet", "slug": "ant-esports?type=Cabinet"},
                {"name": "Power Supply", "slug": "ant-esports?type=Power+Supply"},
                {"name": "Coolers", "slug": "ant-esports?type=Coolers"},
                {"name": "Gaming Headset", "slug": "ant-esports?type=Headset"},
                {"name": "Projector", "slug": "ant-esports?type=Projector"},
                {"name": "Gamepad", "slug": "ant-esports?type=Gamepad"},
            ],
            "sections": [
                {
                    "title": "Gaming Peripherals",
                    "items": [
                        {"name": "Mouse & Keyboard", "slug": "/category/ant-esports?type=Mouse+Keyboard"},
                        {"name": "Gaming Headset", "slug": "/category/ant-esports?type=Headset"},
                        {"name": "Gamepad", "slug": "/category/ant-esports?type=Gamepad"},
                    ]
                },
                {
                    "title": "PC Hardware & Power",
                    "items": [
                        {"name": "Cabinet", "slug": "/category/ant-esports?type=Cabinet"},
                        {"name": "Power Supply", "slug": "/category/ant-esports?type=Power+Supply"},
                        {"name": "Coolers", "slug": "/category/ant-esports?type=Coolers"},
                        {"name": "Projector", "slug": "/category/ant-esports?type=Projector"},
                    ]
                }
            ]
        },
        {
            "name": "Fenda",
            "slug": "fenda",
            "icon": "speaker",
            "desc": "Fenda Audio (F&D) - Premium Speakers, Soundbars & Multimedia Audio",
            "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
            "brands": ["Fenda"],
            "subcategories": [
                {"name": "Speakers", "slug": "fenda?type=Speakers"},
            ],
            "sections": [
                {
                    "title": "Audio Systems",
                    "items": [
                        {"name": "Speakers", "slug": "/category/fenda?type=Speakers"},
                    ]
                }
            ]
        },
        {
            "name": "Networking",
            "slug": "networking",
            "icon": "network",
            "desc": "Enterprise & Home Networking Equipment, Routers, Cables & Switches",
            "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
            "brands": ["D-Link", "TP-Link", "Cisco"],
            "subcategories": [
                {"name": "Routers", "slug": "networking?type=Routers"},
                {"name": "CAT 6 Cable", "slug": "networking?type=Cable"},
                {"name": "Switch", "slug": "networking?type=Switch"},
                {"name": "WiFi Camera", "slug": "networking?type=WiFi+Camera"},
            ],
            "sections": [
                {
                    "title": "Connectivity",
                    "items": [
                        {"name": "Routers", "slug": "/category/networking?type=Routers"},
                        {"name": "Switch", "slug": "/category/networking?type=Switch"},
                    ]
                },
                {
                    "title": "Infrastructure",
                    "items": [
                        {"name": "CAT 6 Cable", "slug": "/category/networking?type=Cable"},
                        {"name": "WiFi Camera", "slug": "/category/networking?type=WiFi+Camera"},
                    ]
                }
            ]
        },
        {
            "name": "Storage",
            "slug": "storage",
            "icon": "hard-drive",
            "desc": "High-Performance Solid State Drives, Memory Cards & Storage Solutions",
            "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
            "brands": ["Kingston", "SanDisk", "Western Digital"],
            "subcategories": [
                {"name": "SSD", "slug": "storage?type=SSD"},
                {"name": "SD Cards", "slug": "storage?type=SD+Cards"},
                {"name": "Pendrive", "slug": "storage?type=Pendrive"},
                {"name": "USB Flash Drive", "slug": "storage?type=USB"},
            ],
            "sections": [
                {
                    "title": "Internal & Solid State",
                    "items": [
                        {"name": "SSD", "slug": "/category/storage?type=SSD"},
                    ]
                },
                {
                    "title": "Removable Media",
                    "items": [
                        {"name": "SD Cards", "slug": "/category/storage?type=SD+Cards"},
                        {"name": "Pendrive", "slug": "/category/storage?type=Pendrive"},
                        {"name": "USB Flash Drive", "slug": "/category/storage?type=USB"},
                    ]
                }
            ]
        },
        {
            "name": "Intex",
            "slug": "intex",
            "icon": "monitor",
            "desc": "Intex IT Peripherals, Monitors, Motherboards & Power Backups",
            "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
            "brands": ["Intex"],
            "subcategories": [
                {"name": "Monitor", "slug": "intex?type=Monitor"},
                {"name": "Motherboard", "slug": "intex?type=Motherboard"},
                {"name": "SMPS", "slug": "intex?type=SMPS"},
                {"name": "Mouse", "slug": "intex?type=Mouse"},
                {"name": "Keyboards", "slug": "intex?type=Keyboards"},
                {"name": "Cables", "slug": "intex?type=Cables"},
                {"name": "UPS", "slug": "intex?type=UPS"},
            ],
            "sections": [
                {
                    "title": "Displays & Core Components",
                    "items": [
                        {"name": "Monitor", "slug": "/category/intex?type=Monitor"},
                        {"name": "Motherboard", "slug": "/category/intex?type=Motherboard"},
                        {"name": "SMPS", "slug": "/category/intex?type=SMPS"},
                        {"name": "UPS", "slug": "/category/intex?type=UPS"},
                    ]
                },
                {
                    "title": "Peripherals & Cables",
                    "items": [
                        {"name": "Mouse", "slug": "/category/intex?type=Mouse"},
                        {"name": "Keyboards", "slug": "/category/intex?type=Keyboards"},
                        {"name": "Cables", "slug": "/category/intex?type=Cables"},
                    ]
                }
            ]
        },
        {
            "name": "POS Systems",
            "slug": "pos",
            "icon": "printer",
            "desc": "Point of Sale Systems, Posiflex Touch Terminals, Barcode Scanners & Printers",
            "image": "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80",
            "brands": ["Posiflex"],
            "subcategories": [
                {"name": "Posiflex Monitor", "slug": "pos?type=Monitor"},
                {"name": "Thermal Printer", "slug": "pos?type=Thermal+Printer"},
                {"name": "Scanner", "slug": "pos?type=Scanner"},
                {"name": "Cash Drawer", "slug": "pos?type=Cash+Drawer"},
                {"name": "Barcode Scanner", "slug": "pos?type=Barcode+Scanner"},
            ],
            "sections": [
                {
                    "title": "Point of Sale Terminals",
                    "items": [
                        {"name": "Posiflex Monitor", "slug": "/category/pos?type=Monitor"},
                        {"name": "Thermal Printer", "slug": "/category/pos?type=Thermal+Printer"},
                    ]
                },
                {
                    "title": "Retail Automation",
                    "items": [
                        {"name": "Scanner", "slug": "/category/pos?type=Scanner"},
                        {"name": "Cash Drawer", "slug": "/category/pos?type=Cash+Drawer"},
                        {"name": "Barcode Scanner", "slug": "/category/pos?type=Barcode+Scanner"},
                    ]
                }
            ]
        }
    ]

    category_objs = {}
    for idx, c in enumerate(categories_spec):
        cat_obj, _ = Category.objects.update_or_create(
            company=company,
            slug=c["slug"],
            defaults={
                "name": c["name"],
                "icon": c["icon"],
                "description": c["desc"],
                "image": c["image"],
                "order": idx + 1,
                "subcategories": c["subcategories"],
                "brand_list": c["brands"],
                "sections": c["sections"],
                "is_active": True
            }
        )
        for b_name in c["brands"]:
            if b_name in brand_objs:
                brand_objs[b_name].categories.add(cat_obj)
        category_objs[c["slug"]] = cat_obj

    print(f"✅ Synced {len(category_objs)} Categories matching Navbar")

    # 7. Products Catalog Data
    products_data = [
        # Dahua
        {
            "name": "Dahua 2MP HDCVI IR Bullet Camera (DH-HAC-HFW1200THP-I8)",
            "category": "dahua", "type": "HDCVI Camera", "brand": "Dahua",
            "price": 3850, "original_price": 4500, "stock": 45,
            "image": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80",
            "description": "High performance 2MP CMOS sensor with 80m IR distance, DWDR, IP67 weatherproof.",
            "specs": ["2MP Full HD 1080P", "3.6mm Fixed Lens", "80m Smart IR", "IP67 Weatherproof"],
            "features": ["HDCVI/AHD/TVI/CVBS switchable", "CVI Transmission up to 800m", "Day/Night ICR"],
            "is_popular": True, "is_new": True, "collections": ["New Arrivals", "Dahua Security"]
        },
        {
            "name": "Dahua 4MP WizSense Full-Color IP Camera (IPC-HFW2439S-SA-LED-S2)",
            "category": "dahua", "type": "IPC", "brand": "Dahua",
            "price": 7950, "original_price": 9500, "stock": 30,
            "image": "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=500&q=80",
            "description": "4MP Full-color Starlight AI Network camera with SMD Plus, built-in mic, and warm LED.",
            "specs": ["4MP 1/3\" CMOS", "24/7 Full Color", "Built-in Mic", "MicroSD up to 256GB"],
            "features": ["AI Smart Motion Detection", "PoE Powered", "H.265+ Smart Codec"],
            "is_best_seller": True, "collections": ["Best Price", "Popular", "Dahua Security"]
        },
        {
            "name": "Dahua 4MP 25x Starlight IR PTZ Network Camera (SD49425XB-HNR)",
            "category": "dahua", "type": "PTZ", "brand": "Dahua",
            "price": 42000, "original_price": 48000, "stock": 12,
            "image": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80",
            "description": "Powerful 25x optical zoom camera with auto-tracking, 100m IR, and perimeter protection.",
            "specs": ["25x Optical Zoom", "100m IR Illumination", "True WDR 120dB", "PoE+ Support"],
            "features": ["Deep-learning auto-tracking", "Face Detection", "Smart H.265+"],
            "is_new": True, "collections": ["New Arrivals", "Deal Of The Week"]
        },
        {
            "name": "Dahua 16 Channel 4K AI Network Video Recorder (NVR4216-16P-I)",
            "category": "dahua", "type": "NVR", "brand": "Dahua",
            "price": 26500, "original_price": 31000, "stock": 18,
            "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80",
            "description": "16 PoE ports, 4K HDMI output, 2 SATA HDDs up to 10TB each, AI facial recognition.",
            "specs": ["16 PoE Ports", "Up to 4K / 8MP Recording", "2 SATA HDDs supported", "Bandwidth 200Mbps"],
            "features": ["AI Face Recognition", "Perimeter Protection", "Plug and Play PoE"],
            "is_popular": True, "collections": ["Popular", "Dahua Security"]
        },
        {
            "name": "Dahua 8 Channel Penta-brid 1080P Compact 1U XVR (XVR5108HS-I3)",
            "category": "dahua", "type": "XVR", "brand": "Dahua",
            "price": 10500, "original_price": 12500, "stock": 25,
            "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=500&q=80",
            "description": "5-in-1 hybrid recorder supporting HDCVI/AHD/TVI/CVBS/IP with SMD Plus AI motion detection.",
            "specs": ["8 BNC Channels + 4 IP", "H.265+ Compression", "1 SATA Port up to 10TB", "HDMI & VGA"],
            "features": ["Smart Search", "Audio over Coax on all channels", "Real-time 1080P"],
            "is_offer": True, "collections": ["Best Price"]
        },
        {
            "name": "Dahua 16-Port Gigabit PoE Cloud Managed Switch (PFS3117-16ET-135)",
            "category": "dahua", "type": "Switch", "brand": "Dahua",
            "price": 19500, "original_price": 23000, "stock": 20,
            "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80",
            "description": "16 FE PoE ports with 135W total power, 250m long distance PoE transmission mode.",
            "specs": ["16 PoE 10/100M Ports", "1 Gigabit Combo Port", "135W Power Budget", "250m Long Distance"],
            "features": ["PoE Watchdog", "Surge Protection 4kV", "Cloud App Management"],
            "is_popular": True, "collections": ["Popular"]
        },
        {
            "name": "Dahua Surveillance MicroSD Card 128GB High Endurance",
            "category": "dahua", "type": "Storage", "brand": "Dahua",
            "price": 2200, "original_price": 2600, "stock": 80,
            "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80",
            "description": "Engineered for 24/7 continuous video surveillance recording with superior endurance.",
            "specs": ["128GB Capacity", "UHS-I U3 V30", "Up to 100MB/s Read", "High Endurance TLC"],
            "features": ["Waterproof", "Shockproof", "Temperature resistant -25°C to 85°C"],
            "is_best_seller": True, "collections": ["Best Price", "New Arrivals"]
        },

        # CP Plus
        {
            "name": "CP Plus 2MP Full HD IR Network Dome IPC (CP-UNC-DA21L2-V3)",
            "category": "cp-plus", "type": "IPC", "brand": "CP Plus",
            "price": 4400, "original_price": 5200, "stock": 35,
            "image": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80",
            "description": "Crystal clear 1080P video streaming, 30m IR range, DWDR, and PoE compliance.",
            "specs": ["2MP 1/2.8\" CMOS", "2.8mm Lens", "30m Smart IR", "PoE 802.3af"],
            "features": ["H.265+ Compression", "Mobile View via gCMOB", "Vandal Resistant Housing"],
            "is_popular": True, "collections": ["Popular", "Surveillance Systems"]
        },
        {
            "name": "CP Plus 2.4MP Cosmic HDCVI Camera (CP-UVC-T2400L2)",
            "category": "cp-plus", "type": "HDCVI", "brand": "CP Plus",
            "price": 2900, "original_price": 3400, "stock": 60,
            "image": "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=500&q=80",
            "description": "2.4MP Cosmic IR bullet camera with 20m night vision, IP66 rating, OSD menu.",
            "specs": ["2.4MP Resolution", "3.6mm Lens", "20m IR Distance", "IP66 Weatherproof"],
            "features": ["Multi-format video output", "Real-time high speed transmission", "DWDR"],
            "is_best_seller": True, "collections": ["Best Price"]
        },
        {
            "name": "CP Plus 8 Channel 4K Network Video Recorder (CP-UNR-408F1)",
            "category": "cp-plus", "type": "NVR", "brand": "CP Plus",
            "price": 13800, "original_price": 16000, "stock": 22,
            "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80",
            "description": "8-channel 4K Ultra HD NVR with 80Mbps incoming bandwidth, H.265+, 1 SATA up to 8TB.",
            "specs": ["8 Channels", "Supports up to 8MP Cameras", "1 SATA HDD up to 8TB", "4K HDMI Output"],
            "features": ["Instastream Video encoding", "Cloud P2P Easy Setup", "ONVIF Profile S/G/T"],
            "is_new": True, "collections": ["New Arrivals", "Surveillance Systems"]
        },
        {
            "name": "CP Plus Solid 3+1 CCTV Pure Copper Coaxial Cable 90M",
            "category": "cp-plus", "type": "Cable", "brand": "CP Plus",
            "price": 3800, "original_price": 4400, "stock": 40,
            "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80",
            "description": "High conductivity pure copper composite cable designed for interference-free CCTV signals.",
            "specs": ["90 Meters Roll", "3 Power + 1 Video Core", "Solid Bare Copper", "Flame Retardant PVC"],
            "features": ["Low attenuation", "Weatherproof outdoor jacket", "Noise resistant shielding"],
            "is_best_seller": True, "collections": ["Best Price"]
        },
        {
            "name": "CP Plus 8 Channel 12V 10A Heavy Duty SMPS Power Supply",
            "category": "cp-plus", "type": "Power Supply", "brand": "CP Plus",
            "price": 2400, "original_price": 2900, "stock": 50,
            "image": "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=500&q=80",
            "description": "Regulated CCTV power supply with short circuit, over-voltage, and overload protection.",
            "specs": ["Input 180V-260V AC", "Output 12V DC 10 Amp", "8 Separate Output Channels", "Fuse Protected"],
            "features": ["Surge protection", "LED power status", "Compact metal cabinet"],
            "is_popular": True, "collections": ["Popular"]
        },
        {
            "name": "CP Plus 4U Wall Mount Network Server Rack",
            "category": "cp-plus", "type": "Racks", "brand": "CP Plus",
            "price": 4600, "original_price": 5400, "stock": 25,
            "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=500&q=80",
            "description": "Durable powder-coated cold-rolled steel server rack with toughened glass front door.",
            "specs": ["4U Standard 19-inch", "Depth 400mm", "Toughened Glass Door", "Cable Entry from Top & Bottom"],
            "features": ["Lockable front door", "Fan mounting provision", "Heavy load carrying capacity"],
            "is_new": True, "collections": ["New Arrivals"]
        },

        # ANT Esports
        {
            "name": "ANT Esports KM540 RGB Gaming Keyboard & Mouse Combo",
            "category": "ant-esports", "type": "Mouse & Keyboard", "brand": "ANT Esports",
            "price": 3200, "original_price": 3900, "stock": 35,
            "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80",
            "description": "Membrane tactile feedback keyboard with Rainbow LED backlighting & high precision 3200 DPI gaming mouse.",
            "specs": ["104 Keys Keyboard", "3200 DPI Gaming Mouse", "RGB Rainbow Backlit", "Braided Cable"],
            "features": ["19-key Anti-Ghosting", "Ergonomic Wrist Rest", "Instant DPI Switch"],
            "is_best_seller": True, "collections": ["Best Price", "Gaming & Peripherals"]
        },
        {
            "name": "ANT Esports ICE-511MT Mid Tower ARGB Gaming Cabinet",
            "category": "ant-esports", "type": "Cabinet", "brand": "ANT Esports",
            "price": 6400, "original_price": 7500, "stock": 20,
            "image": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=500&q=80",
            "description": "Meshed front panel with 4 pre-installed 120mm Auto-RGB fans and tempered glass side panel.",
            "specs": ["Mid Tower ATX/M-ATX", "4x 120mm RGB Fans", "Tempered Glass Panel", "Up to 360mm Radiator"],
            "features": ["High Airflow Mesh Front", "Dedicated PSU Shroud", "Magnetic Dust Filters"],
            "is_popular": True, "collections": ["Popular", "Gaming & Peripherals"]
        },
        {
            "name": "ANT Esports VS600L 600W Non-Modular Power Supply",
            "category": "ant-esports", "type": "Power Supply", "brand": "ANT Esports",
            "price": 4200, "original_price": 4900, "stock": 28,
            "image": "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=500&q=80",
            "description": "High efficiency continuous power delivery with silent 120mm cooling fan and circuit safeguards.",
            "specs": ["600W Output", "120mm Hydraulic Fan", "Single +12V Rail", "Active PFC"],
            "features": ["Over Voltage Protection (OVP)", "Short Circuit Protection (SCP)", "Black Flat Cables"],
            "is_new": True, "collections": ["New Arrivals"]
        },
        {
            "name": "ANT Esports ICE-Flow 240 ARGB CPU Liquid Cooler",
            "category": "ant-esports", "type": "Coolers", "brand": "ANT Esports",
            "price": 8200, "original_price": 9500, "stock": 15,
            "image": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=500&q=80",
            "description": "240mm aluminum radiator with dual high-static pressure ARGB fans and infinity mirror pump.",
            "specs": ["240mm Dual Fan Radiator", "Infinity Mirror ARGB Pump", "PWM 800-1800 RPM", "Intel LGA 1700 & AMD AM5"],
            "features": ["Pure Copper Coldplate", "Braided Sleeved Tubing", "Motherboard Sync RGB"],
            "is_offer": True, "collections": ["Deal Of The Week"]
        },
        {
            "name": "ANT Esports H530 RGB Pro Gaming Headset with Mic",
            "category": "ant-esports", "type": "Headset", "brand": "ANT Esports",
            "price": 2500, "original_price": 3100, "stock": 40,
            "image": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=80",
            "description": "50mm neodymium audio drivers, 360-degree noise-cancelling microphone, and plush ear cushions.",
            "specs": ["50mm Dynamic Drivers", "Omnidirectional Mic", "RGB Breathing Light", "3.5mm + USB for LED"],
            "features": ["Memory Foam Earcups", "Inline Volume Controller", "Multi-platform Compatibility"],
            "is_best_seller": True, "collections": ["Best Price", "Gaming & Peripherals"]
        },
        {
            "name": "ANT Esports Elite Mini Full HD Smart LED Projector",
            "category": "ant-esports", "type": "Projector", "brand": "ANT Esports",
            "price": 17500, "original_price": 21000, "stock": 10,
            "image": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=500&q=80",
            "description": "Compact home cinema projector supporting 1080P resolution, Wi-Fi screen mirroring, and built-in speakers.",
            "specs": ["1080P Support", "3000 Lumens Brightness", "Up to 150-inch Display", "HDMI, USB, WiFi, Bluetooth"],
            "features": ["Keystone Correction", "Wireless Screen Cast", "Long Lamp Life 50000 Hrs"],
            "is_new": True, "collections": ["New Arrivals"]
        },
        {
            "name": "ANT Esports GP300 Pro Wireless Dual Vibration Gamepad",
            "category": "ant-esports", "type": "Gamepad", "brand": "ANT Esports",
            "price": 2900, "original_price": 3500, "stock": 30,
            "image": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=500&q=80",
            "description": "Ergonomic 2.4GHz wireless controller with dual vibration motors, clickable thumbsticks, and PC/Android support.",
            "specs": ["2.4GHz Wireless Connection", "Dual Vibration Feedback", "600mAh Rechargeable Battery", "Up to 8m Range"],
            "features": ["X-Input and Direct-Input Switch", "Non-slip Textured Grips", "Type-C Charging"],
            "is_popular": True, "collections": ["Popular", "Gaming & Peripherals"]
        },

        # Fenda
        {
            "name": "F&D F550X 56W 2.1 Bluetooth Multimedia Speaker",
            "category": "fenda", "type": "Speakers", "brand": "Fenda",
            "price": 9500, "original_price": 11000, "stock": 25,
            "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=500&q=80",
            "description": "6.5-inch bass driver for subwoofer, Bluetooth 4.0, multicolour LED light display, and remote control.",
            "specs": ["56W RMS Output", "6.5\" Bass Driver Subwoofer", "Bluetooth 4.0 up to 15m", "USB, SD & FM Radio"],
            "features": ["Automatic multi-color LED", "Full functional remote", "Heavy wooden cabinet"],
            "is_best_seller": True, "collections": ["Best Price"]
        },
        {
            "name": "F&D T-60X 110W Floor Standing Tower Speaker System",
            "category": "fenda", "type": "Speakers", "brand": "Fenda",
            "price": 25500, "original_price": 29000, "stock": 14,
            "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=500&q=80",
            "description": "Tower speakers with silk dome tweeter, optical input, karaoke wireless microphone, and deep acoustic bass.",
            "specs": ["110W Total RMS", "Wireless Mic Included", "Optical & Coaxial Input", "Bluetooth & NFC"],
            "features": ["Studio Quality Acoustics", "Karaoke echo control", "Slim elegant wooden towers"],
            "is_new": True, "collections": ["New Arrivals", "Deal Of The Week"]
        },

        # Networking
        {
            "name": "TP-Link Archer AX73 Dual-Band Gigabit Wi-Fi 6 Router",
            "category": "networking", "type": "Routers", "brand": "TP-Link",
            "price": 14800, "original_price": 17500, "stock": 22,
            "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80",
            "description": "Blazing fast 5400Mbps Wi-Fi 6 speeds, 6 external high-gain antennas with Beamforming, USB 3.0 sharing.",
            "specs": ["AX5400 Wi-Fi 6", "6x High Gain Antennas", "1x Gigabit WAN + 4x Gigabit LAN", "USB 3.0 Media Sharing"],
            "features": ["OFDMA & MU-MIMO Technology", "HomeShield Security", "OneMesh Supported"],
            "is_popular": True, "collections": ["Popular"]
        },
        {
            "name": "D-Link CAT6 UTP High Speed Copper Cable Box 305M",
            "category": "networking", "type": "Cable", "brand": "D-Link",
            "price": 13200, "original_price": 15000, "stock": 30,
            "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80",
            "description": "305-meter roll of 23 AWG solid bare copper 4-pair unshielded twisted pair Gigabit Ethernet cable.",
            "specs": ["305 Meters (1000 Feet)", "23 AWG Solid Bare Copper", "Frequency up to 250MHz", "Gigabit Speed (1000BASE-T)"],
            "features": ["Cross separator for noise reduction", "RoHS compliant", "Durable easy-pull dispenser box"],
            "is_best_seller": True, "collections": ["Best Price"]
        },
        {
            "name": "Cisco Business 250 Series 24-Port Gigabit Smart Switch",
            "category": "networking", "type": "Switch", "brand": "Cisco",
            "price": 44000, "original_price": 50000, "stock": 10,
            "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=500&q=80",
            "description": "Enterprise-grade 24 Gigabit Ethernet ports + 4 Gigabit SFP uplink ports with intuitive web UI management.",
            "specs": ["24x 10/100/1000 Ports", "4x SFP Uplinks", "Switching Capacity 56Gbps", "Rackmount Kit Included"],
            "features": ["VLAN, QoS, IGMP Snooping", "Energy Efficient Ethernet (EEE)", "Cisco Business Dashboard integration"],
            "is_new": True, "collections": ["New Arrivals"]
        },
        {
            "name": "EZVIZ C3N 1080P Outdoor Smart Color Night Vision WiFi Camera",
            "category": "networking", "type": "WiFi Camera", "brand": "Dahua",
            "price": 5800, "original_price": 6800, "stock": 35,
            "image": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80",
            "description": "Standalone outdoor Wi-Fi camera with AI person detection, color night vision, IP67 weatherproof.",
            "specs": ["Full HD 1080P", "Color Night Vision with Spotlights", "Dual Wi-Fi Antennas", "MicroSD Slot up to 256GB"],
            "features": ["AI-Powered Person Detection", "Active Defense with Strobe Light", "Two-Way Audio Talk"],
            "is_popular": True, "collections": ["Popular"]
        },

        # Storage
        {
            "name": "Kingston NV2 1TB PCIe 4.0 NVMe M.2 Solid State Drive",
            "category": "storage", "type": "SSD", "brand": "Kingston",
            "price": 9900, "original_price": 11500, "stock": 40,
            "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80",
            "description": "Blazing read speeds up to 3500MB/s and write speeds up to 2100MB/s for ultrabooks and gaming PCs.",
            "specs": ["1TB Capacity", "M.2 2280 Form Factor", "PCIe 4.0 x4 NVMe", "Read 3500MB/s, Write 2100MB/s"],
            "features": ["Low power consumption", "Endurance 320 TBW", "3-Year Limited Warranty"],
            "is_best_seller": True, "collections": ["Best Price"]
        },
        {
            "name": "SanDisk Extreme PRO 128GB microSDXC UHS-I Card",
            "category": "storage", "type": "SD Cards", "brand": "SanDisk",
            "price": 3500, "original_price": 4200, "stock": 55,
            "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80",
            "description": "Pro-level performance up to 200MB/s read speeds, rated A2 for faster app loading and 4K UHD video.",
            "specs": ["128GB Capacity", "UHS-I U3 V30 A2", "Read up to 200MB/s", "Write up to 90MB/s"],
            "features": ["Temperature-proof", "Waterproof and X-ray proof", "Includes SD Adapter"],
            "is_popular": True, "collections": ["Popular"]
        },
        {
            "name": "Kingston DataTraveler Kyson 64GB USB 3.2 Metal Pendrive",
            "category": "storage", "type": "Pendrive", "brand": "Kingston",
            "price": 1250, "original_price": 1600, "stock": 90,
            "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80",
            "description": "Stylish capless all-metal casing with functional keyring loop and fast USB 3.2 Gen 1 speeds up to 200MB/s.",
            "specs": ["64GB Capacity", "USB 3.2 Gen 1 (USB 3.0)", "200MB/s Read Speed", "Durable Metal Casing"],
            "features": ["Capless design", "Built-in functional key loop", "Plug and Play compatibility"],
            "is_offer": True, "collections": ["Best Price"]
        },
        {
            "name": "SanDisk Ultra Dual Drive Luxe 128GB USB Type-C Flash Drive",
            "category": "storage", "type": "USB", "brand": "SanDisk",
            "price": 2600, "original_price": 3200, "stock": 45,
            "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80",
            "description": "All-metal 2-in-1 flash drive with reversible USB Type-C and traditional Type-A connectors.",
            "specs": ["128GB Storage", "Dual USB Type-C & Type-A", "High speed 150MB/s Read", "Swivel Metal Housing"],
            "features": ["Seamless transfer between phone and PC", "Keyring hole", "SanDisk Memory Zone App support"],
            "is_new": True, "collections": ["New Arrivals"]
        },

        # Intex
        {
            "name": "Intex 21.5-inch Full HD Frameless LED Monitor (HDMI/VGA)",
            "category": "intex", "type": "Monitor", "brand": "Intex",
            "price": 11500, "original_price": 13500, "stock": 20,
            "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80",
            "description": "Ultra-slim bezel 1920x1080 Full HD IPS display with vibrant colors, HDMI and VGA ports, anti-glare screen.",
            "specs": ["21.5-inch Full HD 1080P", "75Hz Refresh Rate", "HDMI + VGA Ports", "Built-in Dual Stereo Speakers"],
            "features": ["Frameless zero-bezel design", "Low Blue Light & Flicker-Free", "VESA Wall Mountable"],
            "is_best_seller": True, "collections": ["Best Price"]
        },
        {
            "name": "Intex H61 LGA 1155 Micro-ATX Motherboard",
            "category": "intex", "type": "Motherboard", "brand": "Intex",
            "price": 4900, "original_price": 5800, "stock": 30,
            "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
            "description": "Budget-friendly motherboard supporting 2nd and 3rd Generation Intel Core i3/i5/i7 with dual DDR3 slots.",
            "specs": ["Intel H61 Chipset", "LGA 1155 Socket", "Dual Channel DDR3 up to 16GB", "NVMe M.2 Slot + 4 SATA"],
            "features": ["All Solid Capacitors", "Integrated HD Audio & Gigabit LAN", "VGA & HDMI Dual Display"],
            "is_popular": True, "collections": ["Popular"]
        },
        {
            "name": "Intex Gamma 1000VA / 600W Line Interactive UPS",
            "category": "intex", "type": "UPS", "brand": "Intex",
            "price": 8500, "original_price": 9800, "stock": 18,
            "image": "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=500&q=80",
            "description": "Automatic Voltage Regulation (AVR) UPS providing uninterrupted battery backup for PCs and CCTV systems.",
            "specs": ["1000VA / 600 Watts", "Wide Input 140V-300V AC", "Dual 12V 7Ah Battery", "3 Universal Power Sockets"],
            "features": ["Microprocessor controlled", "Overload & Short circuit protection", "Audible alarm buzzer"],
            "is_new": True, "collections": ["New Arrivals"]
        },
        {
            "name": "Intex Corona Spill-Resistant Wired USB Keyboard",
            "category": "intex", "type": "Keyboards", "brand": "Intex",
            "price": 650, "original_price": 850, "stock": 80,
            "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80",
            "description": "Full-size standard 104-key USB keyboard with comfortable soft-touch keys and spill-proof drainage holes.",
            "specs": ["104 Membrane Keys", "USB 2.0 Wired 1.5M", "Spill Resistant Design", "10 Million Keystroke Life"],
            "features": ["Ergonomic tilt legs", "Laser engraved keycaps", "Quiet keystroke acoustics"],
            "is_best_seller": True, "collections": ["Best Price"]
        },
        {
            "name": "Intex Speedy Optical USB Wired Mouse",
            "category": "intex", "type": "Mouse", "brand": "Intex",
            "price": 350, "original_price": 450, "stock": 100,
            "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=500&q=80",
            "description": "Ambidextrous optical mouse with accurate 1000 DPI sensor, smooth scrolling wheel, and plug-and-play USB.",
            "specs": ["1000 DPI Optical Sensor", "3 Buttons + Scroll Wheel", "1.2m Cable", "Weight 70g"],
            "features": ["Symmetric ambidextrous shape", "Smooth glide teflon feet", "Zero software driver required"],
            "is_best_seller": True, "collections": ["Best Price"]
        },

        # POS Systems
        {
            "name": "Posiflex XT-3815 15-inch Bezel-Free Touch POS Terminal",
            "category": "pos", "type": "Monitor", "brand": "Posiflex",
            "price": 85000, "original_price": 95000, "stock": 8,
            "image": "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=500&q=80",
            "description": "Fanless all-in-one POS terminal with true-flat PCAP touch screen, Intel Celeron J1900, 4GB RAM, 128GB SSD.",
            "specs": ["15\" TFT LCD 1024x768", "Projected Capacitive Touch (PCAP)", "Intel Celeron Quad Core J1900", "Spill & Dust Resistant IP65 Front"],
            "features": ["Fanless silent cooling", "Multiple COM and USB ports", "Foldable base design"],
            "is_popular": True, "collections": ["Popular"]
        },
        {
            "name": "Posiflex Aura PP-8800 High Speed Thermal Receipt Printer",
            "category": "pos", "type": "Thermal Printer", "brand": "Posiflex",
            "price": 23500, "original_price": 27000, "stock": 16,
            "image": "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=500&q=80",
            "description": "High performance 3-inch thermal printer with auto-cutter, print speeds up to 220mm/s, USB and LAN.",
            "specs": ["80mm Paper Width", "Print Speed 220 mm/sec", "Dual Interface USB + Ethernet", "Auto Cutter 1.5 Million cuts"],
            "features": ["Drop-in paper loading", "Wall mountable", "ESC/POS command set compatible"],
            "is_best_seller": True, "collections": ["Best Price"]
        },
        {
            "name": "Posiflex CD-4160 Heavy Duty Steel Cash Drawer",
            "category": "pos", "type": "Cash Drawer", "brand": "Posiflex",
            "price": 9800, "original_price": 11500, "stock": 20,
            "image": "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=500&q=80",
            "description": "Rugged all-steel construction with 5 note compartments, 8 coin slots, RJ11 printer kick interface.",
            "specs": ["Dimensions 410 x 420 x 100 mm", "5 Bill / 8 Coin Trays", "3-Position Key Lock", "RJ11 Interface (12V/24V)"],
            "features": ["Heavy duty ball-bearing rollers", "Check / voucher front media slot", "Durable textured finish"],
            "is_new": True, "collections": ["New Arrivals"]
        },
        {
            "name": "Honeywell Voyager 1400g 2D Barcode Scanner",
            "category": "pos", "type": "Barcode Scanner", "brand": "Posiflex",
            "price": 9200, "original_price": 10800, "stock": 25,
            "image": "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=500&q=80",
            "description": "Omnidirectional 1D and 2D barcode scanner capable of reading digital coupons directly off mobile phone screens.",
            "specs": ["Area Imager 640x480", "Scans 1D, PDF, 2D QR Codes", "USB Interface with Stand", "Drop Resistance 1.5m"],
            "features": ["Reads screen barcodes", "Motion tolerance", "Automatic hands-free presentation mode"],
            "is_popular": True, "collections": ["Popular"]
        }
    ]

    for p in products_data:
        cat = category_objs.get(p["category"])
        brand = brand_objs.get(p["brand"])
        p_slug = slugify(p["name"])
        
        # Calculate discount %
        discount = 0
        if p.get("original_price") and p["original_price"] > p["price"]:
            discount = int(round((p["original_price"] - p["price"]) / p["original_price"] * 100))

        product_obj, _ = Product.objects.update_or_create(
            company=company,
            slug=p_slug,
            defaults={
                "name": p["name"],
                "category": cat,
                "brand": brand,
                "brand_name": brand.name if brand else "",
                "type": p["type"],
                "price": p["price"],
                "original_price": p.get("original_price"),
                "discount": discount,
                "stock": p["stock"],
                "in_stock": p["stock"] > 0,
                "description": p["description"],
                "specs": p["specs"],
                "features": p["features"],
                "image": p["image"],
                "gallery": [p["image"], p["image"]],
                "collections": p.get("collections", []),
                "is_new": p.get("is_new", False),
                "is_popular": p.get("is_popular", False),
                "is_best_seller": p.get("is_best_seller", False),
                "is_offer": p.get("is_offer", False),
                "free_shipping": True,
                "rating": round(random.uniform(4.5, 5.0), 1),
                "reviews_count": random.randint(12, 85),
                "is_active": True
            }
        )

    print(f"✅ Synced {len(products_data)} Products with specs, prices & categories")

    # 8. Sample Customer & Orders (To populate Frontend Admin Dashboard statistics)
    cust_email = "customer1@gmail.com"
    customer, _ = User.objects.get_or_create(
        email=cust_email,
        defaults={
            "name": "Arjun Sharma",
            "company": company,
            "role": "customer",
            "is_active": True
        }
    )

    sample_products = list(Product.objects.filter(company=company)[:5])
    if sample_products:
        order_statuses = ["delivered", "delivered", "processing", "new"]
        for idx, status in enumerate(order_statuses):
            order_id = f"EON-ORD-2026-{1001 + idx}"
            prod = sample_products[idx % len(sample_products)]
            qty = random.randint(1, 3)
            subtotal = prod.price * qty
            tax = round(float(subtotal) * 0.13, 2)
            total = float(subtotal) + tax

            order, _ = Order.objects.update_or_create(
                company=company,
                order_id=order_id,
                defaults={
                    "user": customer,
                    "full_name": f"Customer {idx + 1}",
                    "email": f"client{idx + 1}@gmail.com",
                    "phone": "+977-9801234567",
                    "address": f"Building {idx + 10}, New Road",
                    "city": "Kathmandu",
                    "status": status,
                    "payment_status": "completed" if status == "delivered" else "pending",
                    "payment_method": "credit_card",
                    "subtotal": subtotal,
                    "tax": tax,
                    "total_amount": total
                }
            )

            OrderItem.objects.get_or_create(
                order=order,
                product=prod,
                defaults={
                    "name": prod.name,
                    "quantity": qty,
                    "price": prod.price,
                    "image": prod.image
                }
            )

        print("✅ Created Sample Orders for Admin Dashboard reporting")

    print("=" * 60)
    print("🎉 All Eon Technology Data Seeded & Synced Successfully!")
    print("=" * 60)

if __name__ == "__main__":
    seed_eon()
