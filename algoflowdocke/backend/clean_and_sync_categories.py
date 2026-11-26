import os
import sys
import json
import re
from urllib.parse import urlparse, unquote

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fixitall_backend.settings')
import django
django.setup()

from company.models import Company
from efrontend.models import Category, Brand, Product

company = Company.objects.first()
if not company:
    print("No company found.")
    sys.exit(1)

CANONICAL_20 = {
    "network-products": "Network Products",
    "wireless-products": "Wireless Products",
    "hdcvi-products": "HDCVI Products",
    "thermal-products": "Thermal Products",
    "video-intercoms": "Video Intercoms",
    "access-control-&-time-attendance": "Access Control & Time Attendance",
    "alarms": "Alarms",
    "interactive-whiteboards": "Interactive Whiteboards",
    "transmission": "Transmission",
    "intelligent-traffic": "Intelligent Traffic",
    "ev-charger": "EV Charger",
    "memory": "Memory",
    "software": "Software",
    "dolynk-cloud": "DoLynk Cloud",
    "display-&-control": "Display & Control",
    "security-screening-&-esl-&-eas": "Security Screening & ESL & EAS",
    "fire-alarm": "Fire Alarm",
    "accessories": "Accessories",
    "audio-&-sensing": "Audio & Sensing",
    "others": "Others",
}

ROOT_ALIASES = {
    "network-cameras": ("network-products", ["network-cameras"]),
    "pt-cameras": ("network-products", ["pt-cameras"]),
    "network-recorders": ("network-products", ["network-recorders"]),
    "storage": ("network-products", ["storage"]),
    "wireless-series": ("wireless-products", ["wireless-series"]),
    "4g-camera": ("wireless-products", ["4g-camera"]),
    "wire-free-cameras": ("wireless-products", ["wire-free-cameras"]),
    "outdoor-camera": ("wireless-products", ["outdoor-camera"]),
    "hdcvi-cameras": ("hdcvi-products", ["hdcvi-cameras"]),
    "hdcvi-recorders": ("hdcvi-products", ["hdcvi-recorders"]),
    "thermal-cameras": ("thermal-products", ["thermal-cameras"]),
    "video-interkomy": ("video-intercoms", []),
    "interphones-vid-o": ("video-intercoms", []),
    "video-portero": ("video-intercoms", []),
    "access-control": ("access-control-&-time-attendance", ["access-control"]),
    "access-control-time-attendance": ("access-control-&-time-attendance", []),
    "access-control--time-attendance": ("access-control-&-time-attendance", []),
    "turnstiles": ("access-control-&-time-attendance", ["turnstiles"]),
    "wired-alarm": ("alarms", ["wired-alarm"]),
    "wireless-alarm": ("alarms", ["wireless-alarm"]),
    "emergency-alarm": ("alarms", ["emergency-alarm"]),
    "cloud-managed-switches": ("transmission", ["cloud-managed-switches"]),
    "poe-switches": ("transmission", ["poe-switches"]),
    "smart-parking-products": ("intelligent-traffic", ["smart-parking-products"]),
    "intelligent-traffic-products": ("intelligent-traffic", ["intelligent-traffic-products"]),
    "intelligent-ev-charger": ("ev-charger", []),
    "d-volt-pro": ("ev-charger", ["d-volt-pro"]),
    "dahua-memory": ("memory", []),
    "memory-card": ("memory", ["memory-card"]),
    "memory-module": ("memory", ["memory-module"]),
    "internal-ssd": ("memory", ["internal-ssd"]),
    "dahua-cloud": ("dolynk-cloud", []),
    "display": ("display-&-control", ["display"]),
    "lcd-video-walls": ("display-&-control", ["lcd-video-walls"]),
    "video-conferencing": ("display-&-control", ["video-conferencing"]),
    "security-screening-esl-eas": ("security-screening-&-esl-&-eas", []),
    "security-screening--esl--eas": ("security-screening-&-esl-&-eas", []),
    "metal-detector": ("security-screening-&-esl-&-eas", ["metal-detector"]),
    "eas": ("security-screening-&-esl-&-eas", ["eas"]),
    "bollard": ("security-screening-&-esl-&-eas", ["bollard"]),
    "smoke-alarms": ("fire-alarm", ["smoke-alarms"]),
    "conventional-fire-alarm-system": ("fire-alarm", ["conventional-fire-alarm-system"]),
    "camera-accessories": ("accessories", ["camera-accessories"]),
    "general-audio": ("audio-&-sensing", ["general-audio"]),
    "recorder-server": ("others", ["recorder-server"]),
    "mobile": ("others", ["mobile"]),
}

def derive_clean_category_path(product_item):
    url = product_item.get("source_url") or ""
    cat_key = product_item.get("category_key") or ""
    try:
        u = urlparse(url)
        path = unquote(u.path.lower()).strip("/")
        # Strip country code prefix (e.g. /ph/, /au/, /es/, /mena/, etc.)
        path = re.sub(r"^[a-z]{2,4}/", "", path)
        path = re.sub(r"^(all-products|products)/", "", path)
        segments = [s.strip() for s in path.split("/") if s.strip()]
        if len(segments) > 1:
            segments.pop() # remove product slug
            
        clean_segs = []
        skip_set = {
            "all-products", "dedicated-products", "project-exclusive", "discontinued-products",
            "solutions", "support", "partners", "news-events", "about-us", "key-technologies",
            "new-products", "product-compare", "specializovan-produkty", "produkty-s-ukon-enou-v-robou"
        }
        for s in segments:
            c = re.sub(r"[^a-z0-9&]+", "-", s).strip("-")
            if c and c not in skip_set and not c.startswith("ipc-") and not c.startswith("hac-"):
                clean_segs.append(c)
                
        if not clean_segs:
            if cat_key in CANONICAL_20:
                return cat_key
            return "network-products"
            
        root = clean_segs[0]
        if root in CANONICAL_20:
            final_root = root
            sub_segs = clean_segs[1:]
        elif root in ROOT_ALIASES:
            final_root, extra_sub = ROOT_ALIASES[root]
            sub_segs = extra_sub + clean_segs[1:]
        elif cat_key in CANONICAL_20:
            final_root = cat_key
            sub_segs = clean_segs
        else:
            final_root = "network-products"
            sub_segs = clean_segs
            
        # Deduplicate sequential identical segments
        final_parts = [final_root]
        for s in sub_segs:
            if s != final_parts[-1]:
                final_parts.append(s)
                
        # Limit depth to 5 max
        final_parts = final_parts[:5]
        return "/".join(final_parts)
    except Exception as e:
        return cat_key if cat_key in CANONICAL_20 else "network-products"

json_path = os.path.join(os.path.dirname(__file__), "data", "dahua_products.json")
with open(json_path, "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from {json_path}")

# Filter out non-products (e.g. category landing pages that leaked in)
cleaned_products = []
for p in products:
    name_lower = p.get("name", "").lower().strip()
    if name_lower in ["produkty", "software", "4k series", "bollard", "poe switches", "interactive whiteboards"]:
        # Check if it has a real model code or specs
        if not p.get("specs") and not p.get("detailed_specs"):
            print(f"Skipping landing page stub: {p.get('name')}")
            continue
    p["category_path"] = derive_clean_category_path(p)
    cleaned_products.append(p)

print(f"Cleaned products count: {len(cleaned_products)}")

# 1. Reset Dahua Brand
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

# 2. Ensure all 20 canonical categories exist as ROOTS with parent=None
cat_objects = {}
for order_idx, (slug, name) in enumerate(CANONICAL_20.items(), 1):
    cat, created = Category.objects.get_or_create(
        company=company,
        slug=slug,
        defaults={
            "name": name,
            "parent": None,
            "order": order_idx,
            "is_active": True
        }
    )
    if cat.parent is not None:
        cat.parent = None
        cat.name = name
        cat.order = order_idx
        cat.save(update_fields=["parent", "name", "order"])
    cat_objects[slug] = cat

print("Created / verified 20 canonical root categories.")

# 3. Create subcategories and link products
created_cats = 0
updated_prods = 0

for item in cleaned_products:
    path_slugs = item["category_path"].split("/")
    root_slug = path_slugs[0]
    parent_cat = cat_objects.get(root_slug)
    
    for sub_slug in path_slugs[1:]:
        # If sub_slug collides with a canonical root category, namespace it to prevent reparenting the root
        if sub_slug in CANONICAL_20 and sub_slug != root_slug:
            sub_slug = f"{parent_cat.slug}-{sub_slug}"

        sub_name = sub_slug.replace("-", " ").title()
        # Avoid creating duplicate slug under same parent
        sub_cat, created = Category.objects.get_or_create(
            company=company,
            slug=sub_slug,
            defaults={
                "name": sub_name,
                "parent": parent_cat,
                "order": 1,
                "is_active": True
            }
        )
        if sub_cat.parent != parent_cat:
            ancestor_ids = {a.id for a in parent_cat.get_ancestors()}
            if sub_cat.id not in ancestor_ids and sub_cat.id != parent_cat.id:
                sub_cat.parent = parent_cat
                sub_cat.save(update_fields=["parent"])
        if created:
            created_cats += 1
        parent_cat = sub_cat

    target_cat = parent_cat
    
    prod, created = Product.objects.update_or_create(
        company=company,
        slug=item["slug"],
        defaults={
            "name": item["name"],
            "category": target_cat,
            "brand": dahua_brand,
            "brand_name": "Dahua",
            "type": item.get("type") or "Security Equipment",
            "description": item.get("description", ""),
            "price": item.get("price", 25000),
            "stock": 50,
            "in_stock": True,
            "is_active": True,
            "specs": item.get("specs", []),
            "detailed_specs": item.get("detailed_specs", {}),
            "image": item.get("image", ""),
            "gallery": item.get("gallery", []),
            "features": item.get("features", []),
            "datasheet_url": item.get("datasheet_url", ""),
            "downloads": item.get("downloads", []),
        }
    )
    target_cat.brands.add(dahua_brand)
    updated_prods += 1

print(f"Updated/Created {updated_prods} products in Django.")

# 4. Clean up any empty categories with depth > 5 or foreign languages with 0 products
company_cats = list(Category.objects.filter(company=company))
cleaned_up_cats = 0
for c in company_cats:
    if c.slug in CANONICAL_20:
        continue
    # If category has depth > 5 or has 0 products and 0 active children
    if c.depth > 5 or c.slug in ["de64", "prodotti-ip", "productos-de-red", "interaktivn-tabule"]:
        prods_count = Product.objects.filter(category=c).count()
        if prods_count == 0:
            c.delete()
            cleaned_up_cats += 1

print(f"Cleaned up {cleaned_up_cats} obsolete/deep categories.")

# 5. Save updated JSON and JS files
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(cleaned_products, f, indent=2, ensure_ascii=False)
print(f"Saved cleaned products to {json_path}")

js_path = os.path.join(os.path.dirname(__file__), "data", "dahua_products.js")
js_content = f"""// Dahua Official Product Catalog - Auto-generated from official scraping engine
// Total Products: {len(cleaned_products)}

export const DAHUA_SCRAPED_PRODUCTS = {json.dumps(cleaned_products, indent=2, ensure_ascii=False)};

export default DAHUA_SCRAPED_PRODUCTS;
"""
with open(js_path, "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"Saved cleaned products to {js_path}")
