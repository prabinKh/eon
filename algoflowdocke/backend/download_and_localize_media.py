import os
import sys
import re
import ssl
import time
import hashlib
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fixitall_backend.settings")

import django
django.setup()

from django.conf import settings
from efrontend.models import Product

MEDIA_ROOT = Path(settings.MEDIA_ROOT)
IMAGES_DIR = MEDIA_ROOT / "products" / "images"
DOCUMENTS_DIR = MEDIA_ROOT / "products" / "documents"

IMAGES_DIR.mkdir(parents=True, exist_ok=True)
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Referer": "https://www.dahuasecurity.com/",
    "Accept": "*/*",
}

def get_filename_for_url(url: str, is_image: bool = True) -> str:
    parsed = urllib.parse.urlparse(url)
    ext = os.path.splitext(parsed.path)[1].lower()
    
    if is_image:
        if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp"]:
            ext = ".png"
    else:
        if ext not in [".pdf", ".zip", ".doc", ".docx", ".xls", ".xlsx", ".rar", ".tar", ".gz"]:
            ext = ".pdf"
            
    url_hash = hashlib.md5(url.encode("utf-8")).hexdigest()
    raw_base = os.path.splitext(os.path.basename(parsed.path))[0]
    sanitized_base = re.sub(r"[^a-zA-Z0-9_\-]", "_", raw_base)[:28]
    return f"{url_hash[:10]}_{sanitized_base}{ext}"

def download_file(url: str, target_dir: Path, is_image: bool = True, max_retries: int = 3) -> tuple[str, bool, str]:
    """
    Downloads URL to target_dir. Returns (url, success, relative_media_path).
    """
    if not url or not url.startswith("http"):
        return url, False, ""

    filename = get_filename_for_url(url, is_image=is_image)
    dest_path = target_dir / filename
    rel_type = "images" if is_image else "documents"
    media_url = f"/media/products/{rel_type}/{filename}"

    # If already downloaded and has content, skip
    if dest_path.exists() and dest_path.stat().st_size > 0:
        return url, True, media_url

    tmp_path = target_dir / f"{filename}.tmp"
    req = urllib.request.Request(url, headers=HEADERS)

    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=20) as response:
                if response.status == 200:
                    with open(tmp_path, "wb") as f:
                        while True:
                            chunk = response.read(65536)
                            if not chunk:
                                break
                            f.write(chunk)
                    if tmp_path.exists() and tmp_path.stat().st_size > 0:
                        tmp_path.rename(dest_path)
                        return url, True, media_url
        except Exception:
            if tmp_path.exists():
                tmp_path.unlink(missing_ok=True)
            time.sleep(0.5 * (attempt + 1))

    return url, False, ""

def process_batch_downloads(url_list: list[str], target_dir: Path, is_image: bool = True, max_workers: int = 20) -> dict[str, str]:
    unique_urls = list(set([u for u in url_list if u and u.startswith("http")]))
    total = len(unique_urls)
    print(f"Starting download of {total} unique {'images' if is_image else 'documents'} with {max_workers} threads...")

    url_to_local = {}
    completed = 0
    success_count = 0

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_file, url, target_dir, is_image): url for url in unique_urls}
        for future in as_completed(futures):
            url, success, media_url = future.result()
            completed += 1
            if success:
                success_count += 1
                url_to_local[url] = media_url
            if completed % 100 == 0 or completed == total:
                print(f"Progress: {completed}/{total} ({completed * 100 // total}%) - Success: {success_count}")

    print(f"Finished: {success_count}/{total} {'images' if is_image else 'documents'} successfully localized.")
    return url_to_local

def run():
    print("=== DAHUA PRODUCT MEDIA LOCALIZATION SCRIPT ===")
    products = list(Product.objects.all())
    print(f"Loaded {len(products)} products from database.")

    # 1. Collect Primary Card Images
    print("\n--- PHASE 1: Primary Product Images ---")
    primary_image_urls = [p.image for p in products if p.image and p.image.startswith("http")]
    image_map = process_batch_downloads(primary_image_urls, IMAGES_DIR, is_image=True, max_workers=25)

    # Update database primary images
    updated_primary_images = 0
    for p in products:
        if p.image and p.image in image_map:
            p.image = image_map[p.image]
            p.save(update_fields=["image"])
            updated_primary_images += 1
    print(f"Updated {updated_primary_images} products with local primary images.")

    # 2. Collect Primary Datasheets
    print("\n--- PHASE 2: Primary Product Datasheets ---")
    primary_datasheet_urls = [p.datasheet_url for p in products if p.datasheet_url and p.datasheet_url.startswith("http")]
    doc_map = process_batch_downloads(primary_datasheet_urls, DOCUMENTS_DIR, is_image=False, max_workers=20)

    updated_primary_datasheets = 0
    for p in products:
        if p.datasheet_url and p.datasheet_url in doc_map:
            p.datasheet_url = doc_map[p.datasheet_url]
            p.save(update_fields=["datasheet_url"])
            updated_primary_datasheets += 1
    print(f"Updated {updated_primary_datasheets} products with local primary datasheets.")

    # 3. Collect Gallery Images
    print("\n--- PHASE 3: Product Gallery Images ---")
    gallery_urls = []
    for p in products:
        if p.gallery and isinstance(p.gallery, list):
            for g in p.gallery:
                if isinstance(g, str) and g.startswith("http"):
                    gallery_urls.append(g)

    gallery_map = process_batch_downloads(gallery_urls, IMAGES_DIR, is_image=True, max_workers=25)
    image_map.update(gallery_map)

    updated_galleries = 0
    for p in products:
        if p.gallery and isinstance(p.gallery, list):
            modified = False
            new_gallery = []
            for g in p.gallery:
                if isinstance(g, str) and g in image_map:
                    new_gallery.append(image_map[g])
                    modified = True
                else:
                    new_gallery.append(g)
            if modified:
                p.gallery = new_gallery
                p.save(update_fields=["gallery"])
                updated_galleries += 1
    print(f"Updated {updated_galleries} product galleries with local images.")

    # 4. Collect Additional Downloads & Documents
    print("\n--- PHASE 4: Product Downloads & Documents ---")
    extra_doc_urls = []
    for p in products:
        if p.downloads and isinstance(p.downloads, list):
            for d in p.downloads:
                if isinstance(d, dict) and d.get("url", "").startswith("http"):
                    extra_doc_urls.append(d["url"])
                elif isinstance(d, str) and d.startswith("http"):
                    extra_doc_urls.append(d)

    extra_doc_map = process_batch_downloads(extra_doc_urls, DOCUMENTS_DIR, is_image=False, max_workers=20)
    doc_map.update(extra_doc_map)

    updated_downloads = 0
    for p in products:
        if p.downloads and isinstance(p.downloads, list):
            modified = False
            new_downloads = []
            for d in p.downloads:
                if isinstance(d, dict):
                    d_url = d.get("url", "")
                    if d_url in doc_map:
                        item = dict(d)
                        item["url"] = doc_map[d_url]
                        new_downloads.append(item)
                        modified = True
                    else:
                        new_downloads.append(d)
                elif isinstance(d, str):
                    if d in doc_map:
                        new_downloads.append(doc_map[d])
                        modified = True
                    else:
                        new_downloads.append(d)
            if modified:
                p.downloads = new_downloads
                p.save(update_fields=["downloads"])
                updated_downloads += 1
    print(f"Updated {updated_downloads} product download lists with local files.")

    print("\n=== ALL MEDIA SUCCESSFULLY LOCALIZED AND SAVED IN DATABASE ===")

if __name__ == "__main__":
    run()
