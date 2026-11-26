import os
import sys
import glob
import json
import re
from decimal import Decimal
from pathlib import Path
from django.utils.text import slugify
from django.db import transaction

# Setup Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fixitall_backend.settings")

import django
django.setup()

from company.models import Company
from efrontend.models import Category, Brand, Product
from efrontend.media_utils import get_filename_for_url

def run_fast_import():
    print("=== FAST BULK IMPORT OF ALL PRODUCTS FROM CORRECT_JOSNE COPY ===")
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

    json_dir = "/Users/prabinkhadka/Documents/EOn/full backend and frontend/correct_josne copy"
    files = glob.glob(os.path.join(json_dir, "*.json"))
    files = [f for f in files if not f.endswith("master_network_products_summary.json")]
    files.sort()
    print(f"Found {len(files)} product JSON files to import from '{json_dir}'.")

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
                if b and len(b) > 4:
                    cleaned_b = re.sub(r'\s+', ' ', b)
                    bullets.append(cleaned_b)
        if not bullets and text:
            for line in text.split('\n'):
                line = line.strip()
                if line.startswith('-') or line.startswith('*'):
                    cleaned_b = re.sub(r'^[-*]\s*', '', line)
                    if cleaned_b:
                        bullets.append(cleaned_b)
        return bullets

    def extract_specs(raw_specs):
        specs_dict = {}
        if isinstance(raw_specs, dict):
            for k, v in raw_specs.items():
                if isinstance(v, dict):
                    for subk, subv in v.items():
                        if subv and isinstance(subv, (str, int, float)):
                            specs_dict[f"{k} - {subk}"] = str(subv)
                elif isinstance(v, list):
                    specs_dict[k] = ", ".join([str(x) for x in v if x])
                elif v and isinstance(v, (str, int, float)):
                    specs_dict[k] = str(v)
        elif isinstance(raw_specs, list):
            for item in raw_specs:
                if isinstance(item, dict):
                    k = item.get("name") or item.get("key") or item.get("label")
                    v = item.get("value") or item.get("val")
                    if k and v:
                        specs_dict[str(k)] = str(v)
        return specs_dict

    def parse_downloads(raw_downloads):
        downloads = []
        datasheet_url = None
        if isinstance(raw_downloads, list):
            for item in raw_downloads:
                if isinstance(item, dict):
                    title = item.get("title") or item.get("name") or "Document"
                    url = item.get("url") or item.get("download_url") or ""
                    file_type = item.get("type") or "datasheet"
                    size = item.get("size") or ""
                    if url:
                        downloads.append({
                            "name": title,
                            "url": url,
                            "type": file_type,
                            "size": size
                        })
                        if "datasheet" in title.lower() or "datasheet" in url.lower():
                            if not datasheet_url:
                                datasheet_url = url
                elif isinstance(item, str) and item.startswith("http"):
                    downloads.append({"name": "Datasheet", "url": item, "type": "datasheet"})
                    if not datasheet_url:
                        datasheet_url = item
        if not datasheet_url and downloads:
            datasheet_url = downloads[0]["url"]
        return datasheet_url, downloads

    def localize_url_path(url, is_image=True):
        if not url or not isinstance(url, str):
            return url
        url_s = url.strip()
        if not (url_s.startswith("http://") or url_s.startswith("https://")):
            return url_s
        sub = "images" if is_image else "documents"
        fn = get_filename_for_url(url_s, is_image=is_image)
        return f"/media/products/{sub}/{fn}"

    def estimate_price(chain, model, title):
        chain_str = " > ".join(chain).lower()
        title_str = title.lower()
        if "nvr" in model.lower() or "nvr" in title_str or "storage" in chain_str:
            if "32" in model or "64" in model or "128" in model:
                return Decimal("75000.00")
            elif "16" in model:
                return Decimal("45000.00")
            elif "8" in model:
                return Decimal("28000.00")
            return Decimal("35000.00")
        elif "thermal" in chain_str or "explosion" in chain_str:
            return Decimal("185000.00")
        elif "wizmind" in chain_str or "x-spans" in chain_str:
            if "7-series" in chain_str or "8-series" in chain_str:
                return Decimal("65000.00")
            elif "5-series" in chain_str:
                return Decimal("48000.00")
            return Decimal("36000.00")
        elif "wizsense" in chain_str:
            if "8mp" in title_str or "4k" in title_str:
                return Decimal("32000.00")
            return Decimal("22000.00")
        elif "pt camera" in chain_str:
            return Decimal("16500.00")
        elif "memory" in chain_str:
            if "128g" in model.lower() or "128gb" in title_str:
                return Decimal("3500.00")
            elif "64g" in model.lower() or "64gb" in title_str:
                return Decimal("2200.00")
            elif "32g" in model.lower() or "32gb" in title_str:
                return Decimal("1500.00")
            elif "256g" in model.lower() or "256gb" in title_str:
                return Decimal("6500.00")
            elif "ssd" in chain_str or "ssd" in title_str:
                return Decimal("8500.00")
            return Decimal("2500.00")
        elif "access control" in chain_str or "time attendance" in chain_str:
            return Decimal("28000.00")
        elif "video intercom" in chain_str:
            return Decimal("21000.00")
        elif "ev charger" in chain_str:
            return Decimal("95000.00")
        elif "display" in chain_str or "whiteboard" in chain_str:
            return Decimal("125000.00")
        elif "alarm" in chain_str:
            return Decimal("14500.00")
        elif "transmission" in chain_str:
            return Decimal("18000.00")
        elif "accessories" in chain_str:
            return Decimal("4500.00")
        else:
            return Decimal("19500.00")

    print("\nStep 1: Building category tree in memory and database...")
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

    print("\nStep 2: Processing 1788 JSON product records...")
    for i, file_path in enumerate(files):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        card = data.get("card_info", {})
        detail = data.get("detail", {})
        h = data.get("hierarchy", {})

        model = (detail.get("model") or card.get("product_name") or os.path.basename(file_path).replace('.json', '')).strip()
        title = (detail.get("title") or card.get("product_title") or model).strip()

        chain = clean_breadcrumb(h)
        parent_node = None
        for depth, node_name in enumerate(chain):
            parent_node = get_or_create_category(parent_node, node_name, order=depth)

        leaf_category = parent_node
        subcategory_name = chain[1] if len(chain) > 1 else chain[0]

        if model.lower() in title.lower():
            display_name = title
        else:
            display_name = f"{model} - {title}"
        display_name = display_name[:250]

        base_slug = slugify(model)[:200]
        if not base_slug:
            base_slug = slugify(os.path.basename(file_path).replace('.json', ''))[:200]

        prod_slug = base_slug
        counter = 2
        while prod_slug in used_slugs:
            prod_slug = f"{base_slug[:190]}-{counter}"
            counter += 1
        used_slugs.add(prod_slug)

        card_img = card.get("card_image") or ""
        gallery_raw = detail.get("gallery_images") or []
        gallery = [g["url"] for g in gallery_raw if isinstance(g, dict) and g.get("url")]
        if not gallery and card_img:
            gallery = [card_img]
        primary_img = card_img or (gallery[0] if gallery else "")

        loc_primary = localize_url_path(primary_img, is_image=True)
        loc_gallery = [localize_url_path(u, is_image=True) for u in gallery]

        datasheet_url, downloads = parse_downloads(detail.get("downloads") or [])
        loc_datasheet = localize_url_path(datasheet_url, is_image=False)
        loc_downloads = []
        for d in downloads:
            d_copy = dict(d)
            if d_copy.get("url"):
                d_copy["url"] = localize_url_path(d_copy["url"], is_image=False)
            loc_downloads.append(d_copy)

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
            image=loc_primary,
            gallery=loc_gallery,
            datasheet_url=loc_datasheet,
            downloads=loc_downloads,
            stock=30 + (i % 30),
            in_stock=True,
            is_active=True,
            is_new=bool(card.get("is_new", False))
        )
        products_to_create.append(product)

    print(f"\nStep 3: Replacing existing Dahua products and bulk inserting {len(products_to_create)} products...")
    with transaction.atomic():
        deleted_count, _ = Product.objects.filter(company=company, brand=dahua_brand).delete()
        print(f"Cleared {deleted_count} older records.")
        Product.objects.bulk_create(products_to_create, batch_size=250)

    print("\n=== SUCCESS: ALL PRODUCTS INSERTED ===")
    dahua_count = Product.objects.filter(company=company, brand=dahua_brand).count()
    total_cats = Category.objects.filter(company=company).count()
    print(f"Total Dahua Products in DB: {dahua_count} / {len(files)}")
    print(f"Total Categories in DB: {total_cats}")

if __name__ == "__main__":
    run_fast_import()
