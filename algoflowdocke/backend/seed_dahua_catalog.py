import os
import django
from django.utils.text import slugify

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fixitall_backend.settings')
django.setup()

from company.models import Company
from efrontend.models import Category, Brand, Product

def seed_dahua_catalog():
    print("=" * 65)
    print("🚀 Seeding Dahua Hierarchical Catalog & Real Products...")
    print("=" * 65)

    company = Company.objects.first()
    if not company:
        print("❌ Error: No company found. Run seed_eon_technology.py first.")
        return

    # Ensure Brand: Dahua
    dahua_brand, _ = Brand.objects.get_or_create(
        company=company,
        slug="dahua",
        defaults={
            "name": "Dahua",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Dahua_Technology_logo.svg",
            "description": "World leader in video surveillance and AIoT technology",
            "is_active": True
        }
    )

    # -------------------------------------------------------------
    # 1. HIERARCHICAL CATEGORY TREE DEFINITION (20 Official Dahua Categories)
    # -------------------------------------------------------------
    hierarchy = [
        {
            "name": "Network Products",
            "slug": "network-products",
            "icon": "camera",
            "desc": "Advanced IP video surveillance, AI cameras, NVRs, and intelligent network storage.",
            "image": "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069483.PNG",
            "children": [
                {
                    "name": "Network Cameras",
                    "slug": "network-cameras",
                    "icon": "cctv",
                    "desc": "High performance network IP cameras with AI analytics and WizMind intelligence.",
                    "children": [
                        {
                            "name": "WizMind 4 Series",
                            "slug": "wizmind-4-series",
                            "desc": "Targeted at enterprise projects, offering precise AI functions and industry-leading low-light imaging.",
                            "children": [
                                {
                                    "name": "Smart Dual Light",
                                    "slug": "smart-dual-lght",
                                    "desc": "Intelligently switches between warm light and IR light based on AI target detection.",
                                    "children": []
                                },
                                {
                                    "name": "WizColor",
                                    "slug": "wizcolor",
                                    "desc": "Superior colorful video in ultra low illumination environments.",
                                    "children": []
                                },
                                {
                                    "name": "IR",
                                    "slug": "ir",
                                    "desc": "Classic infrared night vision cameras with high performance sensors.",
                                    "children": []
                                }
                            ]
                        },
                        {
                            "name": "WizMind 5 Series",
                            "slug": "wizmind-5-series",
                            "desc": "Comprehensive AI surveillance cameras with face recognition, metadata, and sound detection.",
                            "children": [
                                {
                                    "name": "WizMind 5 Pro",
                                    "slug": "wizmind-5-pro",
                                    "desc": "Flagship WizMind 5 Series Pro AI cameras.",
                                    "children": []
                                }
                            ]
                        },
                        {
                            "name": "WizSense 3 Series",
                            "slug": "wizsense-3-series",
                            "desc": "Affordable AI technology with SMD Plus and active deterrence TiOC.",
                            "children": [
                                {
                                    "name": "WizSense TiOC",
                                    "slug": "wizsense-tioc",
                                    "desc": "Three-in-One Camera: 24/7 Full Color, Active Deterrence & AI.",
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "PTZ Cameras",
                    "slug": "ptz-cameras",
                    "icon": "crosshair",
                    "desc": "Pan-Tilt-Zoom speed dome cameras with optical zoom and auto-tracking.",
                    "children": [
                        {
                            "name": "WizMind PTZ",
                            "slug": "wizmind-ptz",
                            "desc": "High zoom speed domes with auto tracking 3.0 and perimeter defense.",
                            "children": []
                        }
                    ]
                },
                {
                    "name": "Network Recorders",
                    "slug": "network-recorders",
                    "icon": "hard-drive",
                    "desc": "High capacity 4K Network Video Recorders (NVR) with built-in PoE.",
                    "children": [
                        {
                            "name": "WizMind NVR",
                            "slug": "wizmind-nvr",
                            "desc": "AI NVRs with face recognition and perimeter protection.",
                            "children": []
                        }
                    ]
                },
                {
                    "name": "Storage",
                    "slug": "storage",
                    "icon": "database",
                    "desc": "High endurance surveillance memory cards and enterprise hard drives.",
                    "children": []
                }
            ]
        },
        {
            "name": "Wireless Products",
            "slug": "wireless-products",
            "icon": "wifi",
            "desc": "Flexible plug-and-play wireless surveillance cameras and solar 4G units.",
            "image": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800",
            "children": [
                {
                    "name": "Wireless Cameras",
                    "slug": "wireless-cameras",
                    "desc": "Wi-Fi smart consumer and commercial cameras.",
                    "children": []
                },
                {
                    "name": "Wireless NVR Kits",
                    "slug": "wireless-nvr-kits",
                    "desc": "Complete Wi-Fi security systems with pre-paired cameras.",
                    "children": []
                },
                {
                    "name": "4G Solar Cameras",
                    "slug": "4g-solar-cameras",
                    "desc": "Independent 4G LTE surveillance with solar power generation.",
                    "children": []
                }
            ]
        },
        {
            "name": "HDCVI Products",
            "slug": "hdcvi-products",
            "icon": "shield",
            "desc": "High Definition Composite Video Interface analog cameras and XVRs.",
            "image": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800",
            "children": [
                {
                    "name": "HDCVI Cameras",
                    "slug": "hdcvi-cameras",
                    "desc": "High resolution analog cameras over coaxial cabling.",
                    "children": []
                },
                {
                    "name": "XVR Recorders",
                    "slug": "xvr-recorders",
                    "desc": "Penta-brid hybrid digital video recorders.",
                    "children": []
                },
                {
                    "name": "HDCVI Accessories",
                    "slug": "hdcvi-accessories",
                    "desc": "Video baluns, power supplies, and testing monitors.",
                    "children": []
                }
            ]
        },
        {
            "name": "Thermal Products",
            "slug": "thermal-products",
            "icon": "thermometer",
            "desc": "Advanced thermal imaging cameras for fire detection and perimeter security.",
            "image": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800",
            "children": [
                {
                    "name": "Thermal Network Cameras",
                    "slug": "thermal-network-cameras",
                    "desc": "Dual spectrum thermal and visible bi-spectrum cameras.",
                    "children": []
                },
                {
                    "name": "Thermography Cameras",
                    "slug": "thermography-cameras",
                    "desc": "Handheld and fixed industrial temperature inspection devices.",
                    "children": []
                }
            ]
        },
        {
            "name": "Video Intercoms",
            "slug": "video-intercoms",
            "icon": "phone-call",
            "desc": "IP and 2-wire smart doorbells, villa door stations, and indoor touch monitors.",
            "image": "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
            "children": [
                {
                    "name": "IP Video Intercoms",
                    "slug": "ip-video-intercoms",
                    "desc": "Multi-tenant and residential IP door stations with mobile app unlocking.",
                    "children": []
                },
                {
                    "name": "2-Wire Intercoms",
                    "slug": "2-wire-intercoms",
                    "desc": "Retrofit door stations using existing 2-wire cabling.",
                    "children": []
                },
                {
                    "name": "Indoor Monitors",
                    "slug": "indoor-monitors",
                    "desc": "Android-based 7-inch and 10-inch capacitive touch indoor panels.",
                    "children": []
                }
            ]
        },
        {
            "name": "Access Control & Time Attendance",
            "slug": "access-control-time-attendance",
            "icon": "fingerprint",
            "desc": "Biometric face recognition terminals, card controllers, and smart turnstiles.",
            "image": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800",
            "children": [
                {
                    "name": "Face Recognition Terminals",
                    "slug": "face-recognition-terminals",
                    "desc": "AI face recognition access terminals with mask and fever detection.",
                    "children": []
                },
                {
                    "name": "Controllers & Readers",
                    "slug": "controllers-readers",
                    "desc": "Multi-door access control units and RFID/Mifare readers.",
                    "children": []
                },
                {
                    "name": "Speed Gates & Turnstiles",
                    "slug": "speed-gates-turnstiles",
                    "desc": "Pedestrian barrier gates and optical swing turnstiles.",
                    "children": []
                }
            ]
        },
        {
            "name": "Alarms",
            "slug": "alarms",
            "icon": "bell",
            "desc": "Wireless intruder alarms, perimeter sensors, and smart emergency buttons.",
            "image": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800",
            "children": [
                {
                    "name": "Wireless Alarm Hubs",
                    "slug": "wireless-alarm-hubs",
                    "desc": "Airfly 32/64 wireless zone central alarm control panels.",
                    "children": []
                },
                {
                    "name": "PIR Detectors",
                    "slug": "pir-detectors",
                    "desc": "Passive infrared motion and pet-immune intrusion detectors.",
                    "children": []
                },
                {
                    "name": "Sirens & Keypads",
                    "slug": "sirens-keypads",
                    "desc": "Indoor/outdoor strobe sirens and wireless touch keypads.",
                    "children": []
                }
            ]
        },
        {
            "name": "Interactive Whiteboards",
            "slug": "interactive-whiteboards",
            "icon": "monitor",
            "desc": "DeepHub interactive smart displays for education, business meetings, and collaboration.",
            "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
            "children": [
                {
                    "name": "DeepHub Smart Displays",
                    "slug": "deephub-smart-displays",
                    "desc": "4K UHD interactive touchscreens with 48MP built-in AI camera.",
                    "children": []
                },
                {
                    "name": "Whiteboard Accessories",
                    "slug": "whiteboard-accessories",
                    "desc": "Mobile carts, smart pens, and OPS computer modules.",
                    "children": []
                }
            ]
        },
        {
            "name": "Transmission",
            "slug": "transmission",
            "icon": "network",
            "desc": "PoE Switches, industrial switches, and wireless bridges.",
            "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800",
            "children": [
                {
                    "name": "PoE Switches",
                    "slug": "poe-switches",
                    "desc": "Cloud managed and unmanaged PoE network switches.",
                    "children": []
                },
                {
                    "name": "Industrial Switches",
                    "slug": "industrial-switches",
                    "desc": "Hardened wide-temperature DIN-rail network switches.",
                    "children": []
                },
                {
                    "name": "Wireless Bridges",
                    "slug": "wireless-bridges",
                    "desc": "Long-range point-to-point 5GHz outdoor wireless transmission.",
                    "children": []
                }
            ]
        },
        {
            "name": "Intelligent Traffic",
            "slug": "intelligent-traffic",
            "icon": "car",
            "desc": "Automatic Number Plate Recognition (ANPR), speed enforcement, and parking systems.",
            "image": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
            "children": [
                {
                    "name": "ANPR Cameras",
                    "slug": "anpr-cameras",
                    "desc": "High accuracy license plate capture and red light enforcement.",
                    "children": []
                },
                {
                    "name": "Traffic Speed Radar",
                    "slug": "traffic-speed-radar",
                    "desc": "Integrated radar and video capture speed enforcement units.",
                    "children": []
                }
            ]
        },
        {
            "name": "EV Charger",
            "slug": "ev-charger",
            "icon": "zap",
            "desc": "Smart AC and DC electric vehicle charging stations with RFID and app control.",
            "image": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
            "children": [
                {
                    "name": "AC EV Chargers",
                    "slug": "ac-ev-chargers",
                    "desc": "7kW and 22kW wallbox residential and commercial EV chargers.",
                    "children": []
                },
                {
                    "name": "DC Fast Chargers",
                    "slug": "dc-fast-chargers",
                    "desc": "Commercial rapid DC chargers for public and fleet charging.",
                    "children": []
                }
            ]
        },
        {
            "name": "Memory",
            "slug": "memory",
            "icon": "cpu",
            "desc": "Surveillance MicroSD Cards, enterprise SSDs, and high speed USB flash drives.",
            "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800",
            "children": [
                {
                    "name": "Surveillance MicroSD Cards",
                    "slug": "surveillance-microsd-cards",
                    "desc": "High endurance flash cards designed for 24/7 continuous video recording.",
                    "children": []
                },
                {
                    "name": "Solid State Drives",
                    "slug": "solid-state-drives",
                    "desc": "NVMe M.2 and SATA consumer and enterprise grade SSDs.",
                    "children": []
                }
            ]
        },
        {
            "name": "Software",
            "slug": "software",
            "icon": "code",
            "desc": "Video Management Software (VMS), mobile surveillance apps, and analytics platforms.",
            "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
            "children": [
                {
                    "name": "DSS Express & Pro VMS",
                    "slug": "dss-express-pro-vms",
                    "desc": "All-in-one centralized video management software.",
                    "children": []
                },
                {
                    "name": "DMSS Mobile Platform",
                    "slug": "dmss-mobile-platform",
                    "desc": "Real-time remote surveillance app for iOS and Android.",
                    "children": []
                }
            ]
        },
        {
            "name": "DoLynk Cloud",
            "slug": "dolynk-cloud",
            "icon": "cloud",
            "desc": "Cloud-based video surveillance, device onboarding, and health diagnostics.",
            "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
            "children": [
                {
                    "name": "Cloud Video Management",
                    "slug": "cloud-video-management",
                    "desc": "Direct-to-cloud camera streaming and cloud archive storage.",
                    "children": []
                },
                {
                    "name": "Device Health Monitoring",
                    "slug": "device-health-monitoring",
                    "desc": "Automated offline alerting and remote firmware update management.",
                    "children": []
                }
            ]
        },
        {
            "name": "Display & Control",
            "slug": "display-control",
            "icon": "tv",
            "desc": "Professional CCTV security monitors, ultra narrow bezel video walls, and keyboard controllers.",
            "image": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800",
            "children": [
                {
                    "name": "CCTV Surveillance Monitors",
                    "slug": "cctv-surveillance-monitors",
                    "desc": "24/7 industrial grade LED monitors from 22-inch to 55-inch.",
                    "children": []
                },
                {
                    "name": "LCD Video Walls",
                    "slug": "lcd-video-walls",
                    "desc": "Ultra narrow bezel video wall displays for control room centers.",
                    "children": []
                }
            ]
        },
        {
            "name": "Security Screening & ESL & EAS",
            "slug": "security-screening-esl-eas",
            "icon": "scan",
            "desc": "Metal detectors, baggage X-ray scanners, and electronic shelf labels.",
            "image": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800",
            "children": [
                {
                    "name": "Walk-Through Metal Detectors",
                    "slug": "walk-through-metal-detectors",
                    "desc": "Multi-zone walk-through security gates with thermal screening.",
                    "children": []
                },
                {
                    "name": "Electronic Shelf Labels",
                    "slug": "electronic-shelf-labels",
                    "desc": "Wireless e-paper retail price tags and management base stations.",
                    "children": []
                }
            ]
        },
        {
            "name": "Fire Alarm",
            "slug": "fire-alarm",
            "icon": "flame",
            "desc": "Smoke alarms, heat detectors, and addressable fire alarm control panels.",
            "image": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800",
            "children": [
                {
                    "name": "Conventional Fire Panels",
                    "slug": "conventional-fire-panels",
                    "desc": "Reliable 4/8/16 zone conventional fire alarm control systems.",
                    "children": []
                },
                {
                    "name": "Addressable Detectors",
                    "slug": "addressable-detectors",
                    "desc": "Optical smoke detectors and thermal rate-of-rise sensors.",
                    "children": []
                }
            ]
        },
        {
            "name": "Accessories",
            "slug": "accessories",
            "icon": "wrench",
            "desc": "Wall and ceiling mounting brackets, junction boxes, and weather enclosures.",
            "image": "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800",
            "children": [
                {
                    "name": "Camera Mounts & Brackets",
                    "slug": "camera-mounts",
                    "desc": "Pole, corner, wall, and ceiling mount adapters.",
                    "children": []
                },
                {
                    "name": "Junction Boxes",
                    "slug": "junction-boxes",
                    "desc": "Waterproof aluminum junction boxes for tidy cable termination.",
                    "children": []
                }
            ]
        },
        {
            "name": "Audio & Sensing",
            "slug": "audio-sensing",
            "icon": "mic",
            "desc": "High sensitivity omnidirectional pickups, speakers, and radar sensors.",
            "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
            "children": [
                {
                    "name": "Surveillance Microphones",
                    "slug": "surveillance-microphones",
                    "desc": "High fidelity audio pickup microphones with noise reduction.",
                    "children": []
                },
                {
                    "name": "Environmental Sensors",
                    "slug": "environmental-sensors",
                    "desc": "Temperature, humidity, and gas detection sensors.",
                    "children": []
                }
            ]
        },
        {
            "name": "Others",
            "slug": "others",
            "icon": "box",
            "desc": "CCTV installation testers, crimping tools, RG59/CAT6 cables, and accessories.",
            "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
            "children": [
                {
                    "name": "Testing Tools",
                    "slug": "testing-tools",
                    "desc": "Multi-function 4K CCTV video testers with PoE output.",
                    "children": []
                },
                {
                    "name": "Cables & Connectors",
                    "slug": "cables-connectors",
                    "desc": "Pure copper CAT6 network cables, BNC connectors, and RJ45 jacks.",
                    "children": []
                }
            ]
        }
    ]

    created_categories = {}

    def sync_node(node_data, parent_obj=None, order_idx=0):
        c_slug = node_data["slug"]
        cat_obj, created = Category.objects.update_or_create(
            company=company,
            slug=c_slug,
            defaults={
                "name": node_data["name"],
                "parent": parent_obj,
                "icon": node_data.get("icon", ""),
                "description": node_data.get("desc", ""),
                "image": node_data.get("image") or (parent_obj.image if parent_obj else ""),
                "order": order_idx + 1,
                "is_active": True
            }
        )
        dahua_brand.categories.add(cat_obj)
        created_categories[c_slug] = cat_obj
        prefix = "  " * (len(cat_obj.get_ancestors()) + 1)
        print(f"{prefix}📁 {cat_obj.name} (slug: {cat_obj.slug}, path: {cat_obj.full_path})")

        for c_idx, child in enumerate(node_data.get("children", [])):
            sync_node(child, parent_obj=cat_obj, order_idx=c_idx)

    for idx, root in enumerate(hierarchy):
        sync_node(root, None, idx)

    print(f"\n✅ Created/Updated {len(created_categories)} hierarchical categories.")

    # -------------------------------------------------------------
    # 2. SEED REAL DAHUA PRODUCTS
    # -------------------------------------------------------------
    smart_dual_light_cat = created_categories.get("smart-dual-lght")
    wizcolor_cat = created_categories.get("wizcolor")
    ir_cat = created_categories.get("ir")
    wizmind_ptz_cat = created_categories.get("wizmind-ptz")
    wizmind_nvr_cat = created_categories.get("wizmind-nvr")
    storage_cat = created_categories.get("storage")

    dahua_products = [
        # --- Leaf: smart-dual-lght (The Exact Product from User URL) ---
        {
            "name": "2MP Smart Dual Light Fixed-focal Dome WizMind Network Camera",
            "slug": "ipc-hdbw4239e-s-il",
            "category": smart_dual_light_cat,
            "type": "Dome Network Camera",
            "price": 12500,
            "original_price": 14500,
            "stock": 25,
            "image": "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069483.PNG",
            "gallery": [
                "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069483.PNG",
                "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069486.PNG",
                "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069481.PNG",
                "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069488.PNG"
            ],
            "description": "IPC-HDBW4239E-S-IL: 2MP Smart Dual Light Fixed-focal Dome WizMind Network Camera. Equipped with an advanced deep-learning algorithm, the camera supports intelligent detection such as perimeter protection, smart motion detection (SMD), and face detection. With Smart Dual Light technology, it intelligently switches between IR mode and Warm LED mode upon event trigger.",
            "features": [
                "2-MP 1/2.8\" CMOS image sensor, low luminance, and high definition image.",
                "Outputs max. 2 MP (1920 × 1080) @25/30 fps.",
                "Built-in IR LED and warm light; the max. IR distance is 50 m and warm light distance is 40 m.",
                "ROI, SMART H.264+/H.265+, flexible coding, applicable to various bandwidth and storage environments.",
                "Rotation mode, WDR, 3D NR, HLC, BLC, digital watermarking, applicable to various monitoring scenes.",
                "Intelligent monitoring: Intrusion, tripwire, fast moving, abandoned object, missing object.",
                "SMD 3.0: High precision human and vehicle classification with minimal false alarms.",
                "12 VDC/PoE power supply, easy for installation.",
                "IP67 and IK10 vandal-proof protection."
            ],
            "specs": [
                "2 MP Resolution (1920 × 1080) @ 30fps",
                "2.8mm / 3.6mm Fixed-focal Lens",
                "Smart Dual Light (IR 50m / Warm LED 40m)",
                "Built-in High Sensitivity Microphone",
                "IP67 Weatherproof & IK10 Vandal-Resistant",
                "Micro SD Card Slot up to 512 GB",
                "PoE (802.3af) and 12V DC Support"
            ],
            "detailed_specs": {
                "Camera": {
                    "Image Sensor": "1/2.8\" progressive scan CMOS",
                    "Max. Resolution": "1920 (H) × 1080 (V)",
                    "ROM / RAM": "128 MB / 512 MB",
                    "Min. Illumination": "0.002 lux@F1.6 (Color, 30 IRE); 0.0002 lux@F1.6 (B/W); 0 lux (Illuminator on)",
                    "S/N Ratio": "> 56 dB",
                    "Illumination Distance": "Up to 50 m (IR); Up to 40 m (Warm light)",
                    "Illuminator Control": "Auto; Manual; Smart Dual Light"
                },
                "Lens": {
                    "Lens Type": "Fixed-focal",
                    "Focal Length": "2.8 mm (Optional 3.6 mm)",
                    "Max. Aperture": "F1.6",
                    "Field of View": "Horizontal: 107°; Vertical: 56°; Diagonal: 127°",
                    "Iris Control": "Fixed"
                },
                "Intelligence": {
                    "Perimeter Protection": "Tripwire; intrusion (Support human and vehicle classification)",
                    "SMD 3.0": "Less false alarms triggered by leaves, rain, and light changes",
                    "Face Detection": "Face detection, track, priority, snapshot, face enhancement",
                    "People Counting": "Tripwire people counting; generating daily, monthly, and yearly reports",
                    "Heat Map": "Yes"
                },
                "Video": {
                    "Compression": "Smart H.265+; H.265; Smart H.264+; H.264; H.264H; H.264B; MJPEG",
                    "Video Frame Rate": "Main stream: 1920 × 1080 @(1–25/30 fps); Sub stream 1: 704 × 576; Sub stream 2: 1920 × 1080",
                    "Wide Dynamic Range": "120 dB True WDR",
                    "Noise Reduction": "3D NR"
                },
                "Audio": {
                    "Built-in Mic": "Yes, built-in high sensitivity microphone",
                    "Audio Compression": "G.711a; G.711Mu; PCM; G.726; G.723"
                },
                "Network & Power": {
                    "Network Port": "RJ-45 (10/100 Base-T)",
                    "SDK and API": "Yes, ONVIF (Profile S/Profile G/Profile T); CGI; Milestone; P2P",
                    "Storage": "Micro SD card (support max. 512 GB); FTP; SFTP; NAS",
                    "Power Supply": "12 VDC / PoE (802.3af)",
                    "Protection": "IP67; IK10 Vandal-proof"
                }
            },
            "datasheet_url": "https://materialfile.dahuasecurity.com/uploads/cpq/88199/datasheet/DH-IPC-HDBW4239E-S-IL_S0_datasheet_20260904_English.pdf",
            "downloads": [
                {
                    "title": "Datasheet",
                    "name": "IPC-HDBW4239E-S-IL_Datasheet.pdf",
                    "url": "https://materialfile.dahuasecurity.com/uploads/cpq/88199/datasheet/DH-IPC-HDBW4239E-S-IL_S0_datasheet_20260904_English.pdf",
                    "type": "pdf"
                },
                {
                    "title": "Installation Method",
                    "name": "IPC-HDBW4239E-S-IL_INSTALLATION_METHOD_EN.pdf",
                    "url": "https://materialfile.dahuasecurity.com/uploads/cpq/88199/drawings/1_0_01_04_50215_72044826.pdf",
                    "type": "pdf"
                },
                {
                    "title": "Dimensions Drawing",
                    "name": "IPC-HDBW4239E-S-IL_DIMENSIONS.pdf",
                    "url": "https://materialfile.dahuasecurity.com/uploads/cpq/88199/drawings/1_0_01_04_50215_633500147.pdf",
                    "type": "pdf"
                }
            ],
            "collections": ["New Arrivals", "Dahua Security", "Popular"],
            "is_new": True,
            "is_best_seller": True,
            "is_popular": True
        },
        {
            "name": "4MP Smart Dual Light Fixed-focal Dome WizMind Network Camera",
            "slug": "ipc-hdbw4439e-s-il",
            "category": smart_dual_light_cat,
            "type": "Dome Network Camera",
            "price": 15500,
            "original_price": 17800,
            "stock": 18,
            "image": "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069486.PNG",
            "gallery": [
                "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069486.PNG",
                "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069483.PNG"
            ],
            "description": "IPC-HDBW4439E-S-IL: 4MP Smart Dual Light Fixed-focal Dome Network Camera featuring 4MP 1/1.8\" CMOS sensor, 140dB WDR, Smart Dual Light, and AI Perimeter Protection.",
            "specs": ["4MP Resolution (2688 × 1520)", "1/1.8\" CMOS Sensor", "Smart Dual Light 50m IR / 40m LED", "Built-in Mic", "IP67 & IK10"],
            "features": ["AI SMD 3.0", "Built-in Mic", "PoE Support", "MicroSD up to 512GB"],
            "collections": ["New Arrivals", "Best Price"],
            "is_new": True,
            "is_popular": True
        },
        {
            "name": "8MP 4K Smart Dual Light Fixed-focal Dome WizMind Network Camera",
            "slug": "ipc-hdbw4839e-s-il",
            "category": smart_dual_light_cat,
            "type": "Dome Network Camera",
            "price": 24500,
            "original_price": 28000,
            "stock": 12,
            "image": "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069481.PNG",
            "gallery": [
                "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069481.PNG",
                "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069488.PNG"
            ],
            "description": "IPC-HDBW4839E-S-IL: 8MP 4K Ultra-HD Smart Dual Light fixed-focal dome camera with high-precision AI video analytics.",
            "specs": ["8MP 4K (3840 × 2160) @ 25/30 fps", "Large 1/1.8\" Low-Light Sensor", "Smart Dual Light 60m IR", "Built-in Mic", "IP67 & IK10"],
            "features": ["4K Ultra HD", "Face Recognition", "Perimeter Protection", "PoE Powered"],
            "collections": ["Deal Of The Week", "Dahua Security"],
            "is_best_seller": True
        },
        {
            "name": "2MP Smart Dual Light Eyeball WizMind Network Camera",
            "slug": "ipc-hdw4239t-s-il",
            "category": smart_dual_light_cat,
            "type": "Eyeball Network Camera",
            "price": 11800,
            "original_price": 13900,
            "stock": 30,
            "image": "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069488.PNG",
            "gallery": ["https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069488.PNG"],
            "description": "IPC-HDW4239T-S-IL: 2MP Eyeball turret camera with quick 3-axis ball adjustment, built-in mic, and Smart Dual Illumination.",
            "specs": ["2MP Full HD 1080P", "Quick-mount Eyeball Turret", "Smart Dual Light", "Built-in Mic", "IP67"],
            "features": ["SMD 3.0", "H.265+ Compression", "PoE", "MicroSD 256GB"],
            "collections": ["Best Price", "Popular"],
            "is_popular": True
        },
        {
            "name": "4MP Smart Dual Light Bullet WizMind Network Camera",
            "slug": "ipc-hfw4439tc1-s-il",
            "category": smart_dual_light_cat,
            "type": "Bullet Network Camera",
            "price": 16200,
            "original_price": 18900,
            "stock": 20,
            "image": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80",
            "gallery": ["https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80"],
            "description": "IPC-HFW4439TC1-S-IL: 4MP Outdoor Bullet camera with high power warm LEDs and IR, built-in mic, long-range night vision.",
            "specs": ["4MP Resolution", "Outdoor Bullet IP67", "60m IR / 50m Warm Light", "Built-in Mic", "PoE"],
            "features": ["Human/Vehicle Classification", "Active Deterrence Support", "WDR 120dB"],
            "collections": ["New Arrivals"],
            "is_new": True
        },

        # --- Leaf: wizcolor ---
        {
            "name": "4MP WizColor Full-Color Fixed-focal Network Camera",
            "slug": "ipc-hdbw4439e-wizcolor",
            "category": wizcolor_cat,
            "type": "Dome Network Camera",
            "price": 17800,
            "original_price": 20500,
            "stock": 15,
            "image": "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80",
            "gallery": ["https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80"],
            "description": "Dahua WizColor Technology delivers brilliant 24/7 vivid color images with ultra-large F1.0 aperture lens in pitch dark.",
            "specs": ["4MP 2688 × 1520", "Super Large F1.0 Aperture", "24/7 Full Color Vivid", "Built-in Mic", "IP67"],
            "features": ["Color night vision with zero light", "AI Perimeter Protection", "PoE"],
            "collections": ["New Arrivals", "Dahua Security"]
        },

        # --- Leaf: ir ---
        {
            "name": "4MP IR Fixed-focal Vandal-proof Network Camera",
            "slug": "ipc-hdbw4431e-as",
            "category": ir_cat,
            "type": "Dome Network Camera",
            "price": 13400,
            "original_price": 15600,
            "stock": 25,
            "image": "https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069483.PNG",
            "gallery": ["https://materialfile.dahuasecurity.com/uploads/cpq/88199/image/1_0_01_04_50215_778069483.PNG"],
            "description": "Reliable 4MP IR Dome camera with 50m Starlight infrared illumination and IK10 vandal resistance.",
            "specs": ["4MP 1/3\" CMOS", "50m Starlight IR", "IK10 Vandal-Proof", "Audio I/O & Alarm I/O", "IP67"],
            "features": ["True WDR", "Smart IR 2.0", "H.265+ Compression"],
            "collections": ["Best Price"]
        },

        # --- PTZ ---
        {
            "name": "Dahua 4MP 32x Starlight IR WizMind PTZ Network Camera",
            "slug": "sd5a432gb-hnr",
            "category": wizmind_ptz_cat,
            "type": "PTZ Camera",
            "price": 78000,
            "original_price": 89000,
            "stock": 8,
            "image": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
            "gallery": ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80"],
            "description": "32x Optical Zoom speed dome PTZ camera with Auto-Tracking 3.0, 150m IR distance, and deep-learning AI algorithms.",
            "specs": ["32x Optical Zoom", "4MP (2560 × 1440) @ 25/30 fps", "150m IR Range", "Auto-Tracking 3.0", "Hi-PoE Support"],
            "features": ["Perimeter Protection", "Face Recognition", "Electronic Image Stabilization (EIS)"],
            "collections": ["Deal Of The Week"],
            "is_best_seller": True
        },

        # --- NVR ---
        {
            "name": "Dahua 32 Channel 4K AI WizMind Network Video Recorder",
            "slug": "nvr5232-16p-i",
            "category": wizmind_nvr_cat,
            "type": "Network Recorder",
            "price": 48500,
            "original_price": 55000,
            "stock": 10,
            "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
            "gallery": ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"],
            "description": "32 Channels IP video input with 16 PoE ports, 4K HDMI, 2 SATA HDDs up to 16TB each, AI face recognition and vehicle search.",
            "specs": ["32 Channels with 16 PoE Ports", "Up to 32MP Decoding", "384 Mbps Incoming Bandwidth", "2 SATA HDDs"],
            "features": ["Face Recognition on 4 channels", "Perimeter Protection on 8 channels", "Smart H.265+"],
            "collections": ["Popular"]
        },

        # --- Storage ---
        {
            "name": "Dahua Surveillance Grade 256GB MicroSDXC Memory Card",
            "slug": "dahua-microsd-256gb-surveillance",
            "category": storage_cat,
            "type": "Storage",
            "price": 3800,
            "original_price": 4500,
            "stock": 60,
            "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
            "gallery": ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80"],
            "description": "Industrial high endurance MicroSD card specifically engineered for continuous 24/7 video recording in IP security cameras.",
            "specs": ["256GB Capacity", "UHS-I U3 V30 A2", "Read up to 100MB/s, Write up to 80MB/s", "High Endurance TLC"],
            "features": ["Waterproof", "Shock resistant", "Operating temp -25°C to 85°C"],
            "collections": ["Best Price"]
        }
    ]

    for p in dahua_products:
        if not p.get("category"):
            continue
        p_slug = p["slug"]
        discount = 0
        if p.get("original_price") and p["original_price"] > p["price"]:
            discount = int(round((p["original_price"] - p["price"]) / p["original_price"] * 100))

        prod_obj, created = Product.objects.update_or_create(
            company=company,
            slug=p_slug,
            defaults={
                "name": p["name"],
                "category": p["category"],
                "brand": dahua_brand,
                "brand_name": dahua_brand.name,
                "type": p.get("type", "Network Camera"),
                "price": p["price"],
                "original_price": p.get("original_price"),
                "discount": discount,
                "stock": p.get("stock", 20),
                "in_stock": True,
                "description": p.get("description", ""),
                "specs": p.get("specs", []),
                "detailed_specs": p.get("detailed_specs", {}),
                "features": p.get("features", []),
                "image": p.get("image", ""),
                "gallery": p.get("gallery", [p.get("image", "")]),
                "datasheet_url": p.get("datasheet_url", ""),
                "downloads": p.get("downloads", []),
                "collections": p.get("collections", []),
                "is_new": p.get("is_new", False),
                "is_popular": p.get("is_popular", False),
                "is_best_seller": p.get("is_best_seller", False),
                "is_offer": p.get("is_offer", False),
                "free_shipping": True,
                "rating": 4.9,
                "reviews_count": 38,
                "is_active": True
            }
        )
        print(f"  📦 Product: {prod_obj.name} (slug: {prod_obj.slug}, path: {prod_obj.category.full_path})")

    print("\n" + "=" * 65)
    print("🎉 Dahua Hierarchical Catalog & Products Seeded Successfully!")
    print("=" * 65)

if __name__ == "__main__":
    seed_dahua_catalog()
