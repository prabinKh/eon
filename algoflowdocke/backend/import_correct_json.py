import os
import sys
import glob
import json
import re
from decimal import Decimal
from django.utils.text import slugify
from django.db import transaction

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fixitall_backend.settings')
import django
django.setup()

from company.models import Company
from efrontend.models import Category, Brand, Product

def run_import():
    company = Company.objects.filter(id=10).first()
    if not company:
        company = Company.objects.first()
    print(f"Target company: id={company.id}, name='{company.name}'")

    dahua_brand, _ = Brand.objects.get_or_create(
        company=company,
        slug='dahua',
        defaults={'name': 'Dahua', 'is_active': True}
    )
    if dahua_brand.name != 'Dahua':
        dahua_brand.name = 'Dahua'
        dahua_brand.save()

    json_dir = "/Users/prabinkhadka/Documents/EOn/full backend and frontend/correct_josne"
    files = glob.glob(os.path.join(json_dir, "*.json"))
    files = [f for f in files if not f.endswith("master_network_products_summary.json")]
    files.sort()
    print(f"Found {len(files)} product JSON files to import.")

    # 1. Clean existing Dahua products for company 10 to ensure fresh 1:1 mapping
    deleted_count, _ = Product.objects.filter(company=company, brand=dahua_brand).delete()
    print(f"Cleaned up {deleted_count} existing Dahua products for clean 1:1 import.")

    series_slug_names = {
        'accessories': 'Accessories',
        'optical-series': 'Optical Series',
        'thermal-series': 'Thermal Series',
        'special-series': 'Special Series',
        'wireless-series': 'Wireless Series',
        'wizmind-series': 'WizMind Series',
        'wizsense-series': 'WizSense Series',
        'x-spans-series': 'X-Spans Series',
        'ip-storage': 'IP Storage',
        'intelligent-video-device': 'Intelligent Video Device',
        'intelligent-video-server': 'Intelligent Video Server',
        'intelligent-video-surveillance-server': 'Intelligent Video Surveillance Server',
        'wizmind-4-series': 'WizMind 4 Series',
        'wizmind-5-series': 'WizMind 5 Series',
        'ir-series': 'WizMind 7 Series',
        'wizmind-7-series': 'WizMind 7 Series',
        'wizmind-8-series': 'WizMind 8 Series',
        'wizmind-panoramic-series': 'WizMind Panoramic Series',
        'wizsense-2-series': 'WizSense 2 Series',
        'wizsense-3-series': 'WizSense 3 Series',
        'lite-series': 'Lite Series',
        'wifi-kit': 'WIFI KIT',
        'hac-pt-series': 'HAC PT Series',
        'ip-pt-1-series': 'IP PT 1 Series',
        'ip-pt-2-series': 'IP PT 2 Series',
        'ip-pt-3-series': 'IP PT 3 Series'
    }

    def clean_breadcrumb(h):
        cat = (h.get('category') or 'Network Products').strip()
        subcat = (h.get('subcategory') or '').strip()
        series_url = (h.get('series_url') or '').rstrip('/')
        series_slug = series_url.split('/')[-1] if series_url else ''
        series = series_slug_names.get(series_slug)
        if not series:
            series = (h.get('series') or '').strip()
        tab = (h.get('tab_title') or '').strip()
        chain = [cat]
        if subcat and subcat.lower() != cat.lower():
            chain.append(subcat)
        if series and series.lower() != chain[-1].lower() and series.lower() != 'view all':
            chain.append(series)
        if tab and tab.lower() != chain[-1].lower() and tab.lower() != 'view all':
            chain.append(tab)
        return chain

    def clean_overview(text):
        if not text:
            return ''
        cleaned = re.sub(r'^(Compare\s+)?(Favourite\s+)?', '', text.strip(), flags=re.IGNORECASE)
        cleaned = re.sub(r'\s*Sales\s+Enquiry.*$', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\s*Datasheet.*$', '', cleaned, flags=re.IGNORECASE)
        return cleaned.strip()

    def extract_bullets(text):
        bullets = []
        if '•' in text:
            parts = text.split('•')
            for p in parts[1:]:
                b = p.strip()
                b = re.sub(r'\s*Sales\s+Enquiry.*$', '', b, flags=re.IGNORECASE).strip()
                if b:
                    bullets.append(b)
        return bullets

    def extract_specs(raw_specs):
        detailed = {}
        if not isinstance(raw_specs, dict):
            return detailed
        for k, v in raw_specs.items():
            if isinstance(v, dict):
                for k2, v2 in v.items():
                    if isinstance(v2, str) and v2.strip():
                        detailed[k2.strip()] = v2.strip()
                    elif isinstance(v2, (int, float, bool)):
                        detailed[k2.strip()] = str(v2)
            elif isinstance(v, str) and v.strip():
                detailed[k.strip()] = v.strip()
            elif isinstance(v, (int, float, bool)):
                detailed[k.strip()] = str(v)
        return detailed

    def parse_downloads(raw_downloads):
        clean = []
        datasheet_url = None
        for d in raw_downloads:
            if not isinstance(d, dict) or not d.get('url'):
                continue
            url = d['url'].strip()
            raw_name = d.get('name', '').strip()
            
            # Determine doc type
            doc_type = 'Document'
            if 'datasheet' in url.lower() or 'datasheet' in raw_name.lower():
                doc_type = 'Datasheet'
                if not datasheet_url and (url.lower().endswith('.pdf') or 'datasheet' in url.lower()):
                    datasheet_url = url
            elif 'user_manual' in url.lower() or 'user manual' in raw_name.lower():
                doc_type = 'User Manual'
            elif 'drawings' in url.lower() or 'dimension' in raw_name.lower() or 'drawings' in raw_name.lower():
                doc_type = 'Drawings & CAD'
            elif 'a_e_document' in url.lower() or 'a&e' in raw_name.lower():
                doc_type = 'A&E Specs'
            elif 'software' in url.lower() or 'app.dahua' in url.lower() or 'software-downloads' in url.lower():
                doc_type = 'Software / Tools'

            # Clean display name
            name = raw_name
            name = re.sub(r'^\d{4}-\d{2}-\d{2}\s*', '', name)
            name = re.sub(r'#(User Manual|A&E Document|Drawings|Datasheet|Quick Start Guide|Installation Guide|Firmware|Operation Manual|Specification)\s*', '', name, flags=re.IGNORECASE)
            name = re.sub(r'\s*Download\s*$', '', name, flags=re.IGNORECASE)
            name = name.strip() or f'{doc_type} ({url.split("/")[-1]})'

            clean.append({
                'name': name,
                'type': doc_type,
                'url': url
            })
        return datasheet_url, clean

    def estimate_price(chain, model, title):
        chain_str = " ".join(chain).lower()
        title_str = (title + " " + model).lower()
        if "evs" in title_str or "storage" in chain_str:
            return Decimal("220000.00")
        elif "ivss" in title_str or "server" in title_str or "intelligent computing" in chain_str:
            return Decimal("145000.00")
        elif "ptz" in chain_str or "x-spans" in chain_str:
            return Decimal("85000.00")
        elif "nvr" in title_str or "recorders" in chain_str:
            if "32ch" in title_str or "64ch" in title_str:
                return Decimal("58000.00")
            elif "16ch" in title_str:
                return Decimal("38000.00")
            return Decimal("24000.00")
        elif "wizmind" in chain_str:
            if "8mp" in title_str or "4k" in title_str:
                return Decimal("48000.00")
            return Decimal("36000.00")
        elif "wizsense" in chain_str:
            if "8mp" in title_str or "4k" in title_str:
                return Decimal("32000.00")
            return Decimal("22000.00")
        elif "pt camera" in chain_str:
            return Decimal("16500.00")
        elif "accessories" in chain_str:
            return Decimal("4500.00")
        else:
            return Decimal("19500.00")

    # Category Cache
    category_cache = {}
    for cat in Category.objects.filter(company=company):
        category_cache[(cat.parent_id, cat.name.lower())] = cat

    def get_or_create_category(parent, name, order=0):
        key = (parent.id if parent else None, name.lower())
        if key in category_cache:
            cat = category_cache[key]
            updated = False
            if not cat.is_active:
                cat.is_active = True
                updated = True
            bl = cat.brand_list or []
            if "Dahua" not in bl:
                bl.append("Dahua")
                cat.brand_list = bl
                updated = True
            if updated:
                cat.save()
            dahua_brand.categories.add(cat)
            return cat

        base_slug = slugify(name)
        if not base_slug:
            base_slug = "category"
        if parent:
            base_slug = f"{parent.slug}-{base_slug}"
        base_slug = base_slug[:200]

        slug = base_slug
        counter = 2
        while Category.objects.filter(company=company, slug=slug).exists():
            existing = Category.objects.filter(company=company, slug=slug).first()
            if existing and existing.parent_id == (parent.id if parent else None) and existing.name.lower() == name.lower():
                cat = existing
                category_cache[key] = cat
                return cat
            slug = f"{base_slug[:190]}-{counter}"
            counter += 1

        cat = Category.objects.create(
            company=company,
            parent=parent,
            name=name,
            slug=slug,
            order=order,
            is_active=True,
            brand_list=["Dahua"]
        )
        dahua_brand.categories.add(cat)
        category_cache[key] = cat
        return cat

    products_to_create = []
    used_slugs = set()

    for i, file_path in enumerate(files):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        card = data.get("card_info", {})
        detail = data.get("detail", {})
        h = data.get("hierarchy", {})

        model = (detail.get("model") or card.get("product_name") or os.path.basename(file_path).replace('.json', '')).strip()
        title = (detail.get("title") or card.get("product_title") or model).strip()

        # Build clean category chain
        chain = clean_breadcrumb(h)
        parent_node = None
        for depth, node_name in enumerate(chain):
            parent_node = get_or_create_category(parent_node, node_name, order=depth)

        leaf_category = parent_node
        subcategory_name = chain[1] if len(chain) > 1 else chain[0]

        # Name formatting: ensure Model is visible
        if model.lower() in title.lower():
            display_name = title
        else:
            display_name = f"{model} - {title}"
        display_name = display_name[:250]

        # Model slug
        base_slug = slugify(model)[:200]
        if not base_slug:
            base_slug = slugify(os.path.basename(file_path).replace('.json', ''))[:200]
        
        prod_slug = base_slug
        counter = 2
        while prod_slug in used_slugs:
            prod_slug = f"{base_slug[:190]}-{counter}"
            counter += 1
        used_slugs.add(prod_slug)

        # Process images
        card_img = card.get("card_image") or ""
        gallery_raw = detail.get("gallery_images") or []
        gallery = [g["url"] for g in gallery_raw if isinstance(g, dict) and g.get("url")]
        if not gallery and card_img:
            gallery = [card_img]
        primary_img = card_img or (gallery[0] if gallery else "")

        # Specs and details
        ov = detail.get("overview") or ""
        desc = clean_overview(ov) or display_name
        bullets = extract_bullets(ov)
        detailed_specs = extract_specs(detail.get("specifications") or {})

        specs = []
        for b in bullets[:6]:
            specs.append(b)
        for k, v in list(detailed_specs.items())[:8]:
            s_str = f"{k}: {v}"
            if s_str not in specs:
                specs.append(s_str)
        if not specs:
            specs = [f"Model: {model}", f"Series: {chain[-1]}"]

        price = estimate_price(chain, model, title)
        orig_price = (price * Decimal("1.18")).quantize(Decimal("1.00"))

        datasheet_url, downloads = parse_downloads(detail.get("downloads") or [])

        product = Product(
            company=company,
            name=display_name,
            slug=prod_slug,
            category=leaf_category,
            brand=dahua_brand,
            brand_name="Dahua",
            type=subcategory_name[:100],
            description=desc,
            details=ov,
            specs=specs,
            detailed_specs=detailed_specs,
            key_specifications=bullets[:8],
            features=detail.get("features") or [],
            price=price,
            original_price=orig_price,
            discount=15,
            image=primary_img[:200] if primary_img else None,
            gallery=gallery,
            datasheet_url=datasheet_url,
            downloads=downloads,
            stock=30 + (i % 30),
            in_stock=True,
            is_active=True,
            is_new=bool(card.get("is_new", False))
        )
        try:
            from efrontend.media_utils import localize_product_media
            localize_product_media(product)
        except Exception:
            pass
        products_to_create.append(product)

    print(f"Bulk creating {len(products_to_create)} products in database...")
    with transaction.atomic():
        Product.objects.bulk_create(products_to_create, batch_size=200)

    print("\n--- FINAL VERIFICATION ---")
    dahua_count = Product.objects.filter(company=company, brand=dahua_brand).count()
    total_prods = Product.objects.filter(company=company).count()
    total_cats = Category.objects.filter(company=company).count()
    print(f"Total Dahua Products in DB: {dahua_count} / {len(files)}")
    print(f"Total Products in Company 10: {total_prods}")
    print(f"Total Categories in Company 10: {total_cats}")

if __name__ == "__main__":
    run_import()
