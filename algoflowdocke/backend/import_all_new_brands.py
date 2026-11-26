import os
import sys
import glob
import json
import re
import ssl
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from decimal import Decimal
from pathlib import Path
from django.utils.text import slugify
from django.db import transaction

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fixitall_backend.settings")

import django
django.setup()

from django.conf import settings
from django.core.cache import cache
from company.models import Company
from efrontend.models import Category, Brand, Product
from efrontend.media_utils import get_filename_for_url

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "*/*",
}

BRAND_CONFIGS = [
    {
        "name": "Ant Esports",
        "slug": "ant-esports",
        "dir": "/Users/prabinkhadka/Documents/EOn/full backend and frontend/antesports_josne",
        "default_price": Decimal("1899.00"),
    },
    {
        "name": "Bestor",
        "slug": "bestor",
        "dir": "/Users/prabinkhadka/Documents/EOn/full backend and frontend/bestor_josne",
        "default_price": Decimal("999.00"),
    },
    {
        "name": "CP Plus",
        "slug": "cp-plus",
        "dir": "/Users/prabinkhadka/Documents/EOn/full backend and frontend/cpplus_josne",
        "default_price": Decimal("3200.00"),
    },
    {
        "name": "Intex",
        "slug": "intex",
        "dir": "/Users/prabinkhadka/Documents/EOn/full backend and frontend/intex_josne",
        "default_price": Decimal("1499.00"),
    },
]

MEDIA_ROOT = Path(settings.MEDIA_ROOT)
IMAGES_DIR = MEDIA_ROOT / "products" / "images"
DOCS_DIR = MEDIA_ROOT / "products" / "documents"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
DOCS_DIR.mkdir(parents=True, exist_ok=True)

def download_single_url(url: str, is_image: bool = True) -> tuple[str, bool]:
    if not url or not isinstance(url, str):
        return url, False
    trimmed = url.strip()
    if not (trimmed.startswith("http://") or trimmed.startswith("https://")):
        return trimmed, False

    target_dir = IMAGES_DIR if is_image else DOCS_DIR
    filename = get_filename_for_url(trimmed, is_image=is_image)
    dest_path = target_dir / filename
    if dest_path.exists() and dest_path.stat().st_size > 0:
        return trimmed, True

    tmp_path = target_dir / f"{filename}.tmp"
    req = urllib.request.Request(trimmed, headers=HEADERS)

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=20) as resp:
                if resp.status == 200:
                    with open(tmp_path, "wb") as f:
                        while True:
                            chunk = resp.read(65536)
                            if not chunk:
                                break
                            f.write(chunk)
                    if tmp_path.exists() and tmp_path.stat().st_size > 0:
                        tmp_path.rename(dest_path)
                        return trimmed, True
        except Exception:
            if tmp_path.exists():
                tmp_path.unlink(missing_ok=True)
            time.sleep(0.3 * (attempt + 1))
    return trimmed, False

def localize_url_path(url: str, is_image: bool = True) -> str:
    if not url or not isinstance(url, str):
        return url or ""
    url_s = url.strip()
    if not (url_s.startswith("http://") or url_s.startswith("https://")):
        return url_s
    sub = "images" if is_image else "documents"
    fn = get_filename_for_url(url_s, is_image=is_image)
    return f"/media/products/{sub}/{fn}"

def clean_breadcrumb(h, brand_name):
    raw_crumbs = h.get('breadcrumbs') or []
    cleaned = []
    for c in raw_crumbs:
        if not isinstance(c, str):
            continue
        c_str = c.strip()
        if not c_str:
            continue
        if c_str.lower() in ('home', brand_name.lower(), 'products', f'{brand_name.lower()} products'):
            continue
        cleaned.append(c_str)

    if cleaned:
        category_chain = cleaned[:-1] if len(cleaned) > 1 else cleaned
    else:
        cat = (h.get('category') or 'General').strip()
        subcat = (h.get('subcategory') or '').strip()
        series = (h.get('series') or '').strip()
        category_chain = [cat]
        if subcat and subcat.lower() != cat.lower():
            category_chain.append(subcat)
        if series and series.lower() != category_chain[-1].lower() and series.lower() != 'blank':
            category_chain.append(series)

    if not category_chain:
        category_chain = ['General Accessories']
    return category_chain

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

def parse_price(data, brand_name, default_price):
    card = data.get("card_info", {})
    card_price = card.get("price")
    if isinstance(card_price, dict):
        amt = card_price.get("amount")
        orig = card_price.get("original_price")
        if amt:
            try:
                price_val = Decimal(str(amt))
                orig_val = Decimal(str(orig)) if orig else (price_val * Decimal("1.25")).quantize(Decimal("1.00"))
                disc = int(card_price.get("discount_percentage") or 15)
                return price_val, orig_val, disc
            except Exception:
                pass

    detail = data.get("detail", {})
    specs = detail.get("specifications", {})
    if isinstance(specs, dict):
        for sec, kv in specs.items():
            if isinstance(kv, dict):
                offer_str = kv.get("Offer Price (INR)") or kv.get("offer_price") or kv.get("Sale Price")
                mrp_str = kv.get("MRP (INR)") or kv.get("mrp") or kv.get("Regular Price")
                if offer_str:
                    try:
                        clean_num = re.sub(r"[^\d.]", "", str(offer_str))
                        if clean_num:
                            p = Decimal(clean_num)
                            clean_mrp = re.sub(r"[^\d.]", "", str(mrp_str or ""))
                            orig_p = Decimal(clean_mrp) if clean_mrp else (p * Decimal("1.30")).quantize(Decimal("1.00"))
                            disc = int(round(float((orig_p - p) / orig_p * 100))) if orig_p > p else 10
                            return p, orig_p, disc
                    except Exception:
                        pass

    # Estimate based on keywords
    model = (detail.get("model") or "").lower()
    title = (detail.get("title") or "").lower()
    cat_text = str(data.get("hierarchy", {})).lower()

    if brand_name == "CP Plus":
        if "camera" in title or "cam" in title or "cp-unc" in model or "cp-e" in model:
            if "4k" in title or "8mp" in title:
                p = Decimal("8500.00")
            elif "5mp" in title:
                p = Decimal("4200.00")
            elif "wifi" in title or "wireless" in title or "pt" in title:
                p = Decimal("2499.00")
            else:
                p = Decimal("1950.00")
        elif "nvr" in title or "dvr" in title or "cp-unr" in model or "cp-uvr" in model:
            if "32" in model or "64" in model:
                p = Decimal("35000.00")
            elif "16" in model:
                p = Decimal("18500.00")
            elif "8" in model:
                p = Decimal("9500.00")
            else:
                p = Decimal("5500.00")
        elif "switch" in title or "poe" in title:
            p = Decimal("3800.00")
        elif "rack" in title:
            p = Decimal("2400.00")
        else:
            p = Decimal("1650.00")
        orig_p = (p * Decimal("1.25")).quantize(Decimal("1.00"))
        return p, orig_p, 20

    p = default_price
    orig_p = (p * Decimal("1.25")).quantize(Decimal("1.00"))
    return p, orig_p, 20

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

def run_import():
    print("=" * 60)
    print("MULTI-BRAND DATA IMPORT & LOCAL MEDIA SYNCHRONIZATION")
    print("=" * 60)

    company = Company.objects.filter(id=10).first()
    if not company:
        company = Company.objects.first()
    print(f"Target company: id={company.id}, name='{company.name}'")

    # Step 1: Pre-scan files and gather unique download tasks
    all_brand_files = {}
    all_image_urls = set()
    all_doc_urls = set()

    for config in BRAND_CONFIGS:
        b_name = config["name"]
        files = glob.glob(os.path.join(config["dir"], "*.json"))
        files.sort()
        all_brand_files[b_name] = files
        print(f"[{b_name}] Found {len(files)} JSON files in '{config['dir']}'.")

        for fpath in files:
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    d = json.load(f)
                c_img = d.get("card_info", {}).get("card_image")
                if c_img and c_img.startswith("http"):
                    all_image_urls.add(c_img)
                det = d.get("detail", {})
                for g in det.get("gallery_images") or []:
                    u = g.get("url") if isinstance(g, dict) else g
                    if u and isinstance(u, str) and u.startswith("http"):
                        all_image_urls.add(u)
                for dl in det.get("downloads") or []:
                    u = dl.get("url") if isinstance(dl, dict) else dl
                    if u and isinstance(u, str) and u.startswith("http") and not u.endswith("/downloads") and not u.endswith("/warranty-policy"):
                        all_doc_urls.add(u)
            except Exception:
                pass

    print(f"\nUnique external images to download: {len(all_image_urls)}")
    print(f"Unique external documents to download: {len(all_doc_urls)}")

    # Step 2: Concurrently download all media
    print("\nStarting concurrent download of images and documents...")
    start_time = time.time()
    download_tasks = []
    with ThreadPoolExecutor(max_workers=35) as executor:
        for url in all_image_urls:
            download_tasks.append(executor.submit(download_single_url, url, True))
        for url in all_doc_urls:
            download_tasks.append(executor.submit(download_single_url, url, False))

        done_count = 0
        total_tasks = len(download_tasks)
        for fut in as_completed(download_tasks):
            done_count += 1
            if done_count % 300 == 0 or done_count == total_tasks:
                elapsed = time.time() - start_time
                print(f"  [Download Progress] {done_count}/{total_tasks} media items processed ({elapsed:.1f}s)...")

    print(f"Media download stage completed in {time.time() - start_time:.1f}s.")

    # Step 3: Process Brands, Categories and Products
    category_cache = {}
    for cat in Category.objects.filter(company=company):
        category_cache[(cat.parent_id, cat.name.lower())] = cat

    def get_or_create_category(parent, name, order, brand_obj, brand_name):
        key = (parent.id if parent else None, name.lower())
        if key in category_cache:
            cat = category_cache[key]
            updated = False
            if not cat.is_active:
                cat.is_active = True
                updated = True
            bl = cat.brand_list or []
            if brand_name not in bl:
                bl.append(brand_name)
                cat.brand_list = bl
                updated = True
            if updated:
                cat.save()
            brand_obj.categories.add(cat)
            return cat

        base_slug = slugify(name) or "category"
        if parent:
            base_slug = f"{parent.slug}-{base_slug}"
        base_slug = base_slug[:200]

        slug = base_slug
        counter = 2
        while Category.objects.filter(company=company, slug=slug).exists():
            existing = Category.objects.filter(company=company, slug=slug).first()
            if existing and existing.parent_id == (parent.id if parent else None) and existing.name.lower() == name.lower():
                category_cache[key] = existing
                return existing
            slug = f"{base_slug[:190]}-{counter}"
            counter += 1

        cat = Category.objects.create(
            company=company,
            parent=parent,
            name=name,
            slug=slug,
            order=order,
            is_active=True,
            brand_list=[brand_name]
        )
        brand_obj.categories.add(cat)
        category_cache[key] = cat
        return cat

    total_inserted = 0

    for config in BRAND_CONFIGS:
        b_name = config["name"]
        b_slug = config["slug"]
        files = all_brand_files[b_name]

        print(f"\nProcessing brand '{b_name}' ({len(files)} items)...")
        brand_obj, _ = Brand.objects.get_or_create(
            company=company,
            slug=b_slug,
            defaults={"name": b_name, "is_active": True}
        )
        if brand_obj.name != b_name:
            brand_obj.name = b_name
            brand_obj.save()

        used_slugs = set(Product.objects.filter(company=company).values_list('slug', flat=True))
        products_to_create = []

        for i, file_path in enumerate(files):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception as e:
                print(f"Skipping corrupt file {file_path}: {e}")
                continue

            card = data.get("card_info", {})
            detail = data.get("detail", {})
            h = data.get("hierarchy", {})

            model = (detail.get("model") or card.get("product_name") or os.path.basename(file_path).replace('.json', '')).strip()
            title = (detail.get("title") or card.get("product_title") or model).strip()

            chain = clean_breadcrumb(h, b_name)
            parent_node = None
            for depth, node_name in enumerate(chain):
                parent_node = get_or_create_category(parent_node, node_name, depth, brand_obj, b_name)

            leaf_category = parent_node
            subcategory_name = chain[1] if len(chain) > 1 else chain[0]

            if model.lower() in title.lower():
                display_name = title
            else:
                display_name = f"{model} - {title}"
            display_name = display_name[:250]

            base_slug = slugify(f"{b_slug}-{model}")[:190]
            if not base_slug:
                base_slug = slugify(f"{b_slug}-{os.path.basename(file_path).replace('.json', '')}")[:190]

            prod_slug = base_slug
            counter = 2
            while prod_slug in used_slugs:
                prod_slug = f"{base_slug[:180]}-{counter}"
                counter += 1
            used_slugs.add(prod_slug)

            card_img = card.get("card_image") or ""
            gallery_raw = detail.get("gallery_images") or []
            gallery = []
            for g in gallery_raw:
                u = g.get("url") if isinstance(g, dict) else g
                if u and isinstance(u, str):
                    gallery.append(u)
            if not gallery and card_img:
                gallery = [card_img]
            primary_img = card_img or (gallery[0] if gallery else "")

            loc_primary = localize_url_path(primary_img, is_image=True)
            loc_gallery = [localize_url_path(u, is_image=True) for u in gallery]

            datasheet_url, downloads = parse_downloads(detail.get("downloads") or [])
            loc_datasheet = localize_url_path(datasheet_url, is_image=False) if datasheet_url else ""
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

            features = detail.get("features") or []
            if isinstance(features, list):
                for f_item in features:
                    if isinstance(f_item, str) and f_item.strip() and f_item.strip() not in bullets:
                        bullets.append(f_item.strip())

            specs = []
            for b in bullets[:6]:
                specs.append(b)
            for k, v in list(detailed_specs.items())[:8]:
                s_str = f"{k}: {v}"
                if s_str not in specs:
                    specs.append(s_str)
            if not specs:
                specs = [f"Brand: {b_name}", f"Category: {chain[-1]}"]

            price, orig_price, discount = parse_price(data, b_name, config["default_price"])

            product = Product(
                company=company,
                name=display_name,
                slug=prod_slug,
                category=leaf_category,
                brand=brand_obj,
                brand_name=b_name,
                type=subcategory_name[:100],
                description=desc,
                details=ov,
                specs=specs,
                detailed_specs=detailed_specs,
                key_specifications=bullets[:8],
                features=features,
                price=price,
                original_price=orig_price,
                discount=discount,
                image=loc_primary,
                gallery=loc_gallery,
                datasheet_url=loc_datasheet,
                downloads=loc_downloads,
                stock=40 + (i % 35),
                in_stock=True,
                is_active=True,
                is_new=bool(card.get("is_new", False))
            )
            products_to_create.append(product)

        print(f"Bulk inserting {len(products_to_create)} products for {b_name}...")
        with transaction.atomic():
            # Delete old records for this brand only
            deleted_count, _ = Product.objects.filter(company=company, brand=brand_obj).delete()
            if deleted_count > 0:
                print(f"  Cleaned {deleted_count} existing records for {b_name}.")
            Product.objects.bulk_create(products_to_create, batch_size=250)
            total_inserted += len(products_to_create)

    # Step 4: Clear all caches
    print("\nInvalidating backend query caches...")
    cache.clear()

    total_prods = Product.objects.filter(company=company).count()
    total_cats = Category.objects.filter(company=company).count()
    print("=" * 60)
    print(f"IMPORT COMPLETE!")
    print(f"Newly Inserted Products: {total_inserted}")
    print(f"Total Products in Database: {total_prods}")
    print(f"Total Categories in Database: {total_cats}")
    print("=" * 60)

if __name__ == "__main__":
    run_import()
