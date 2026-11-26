import os
import re
import ssl
import time
import hashlib
import urllib.parse
import urllib.request
from pathlib import Path
from django.conf import settings

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

def download_and_localize_url(url: str, subfolder: str = "products/images", is_image: bool = True, max_retries: int = 3) -> str:
    """
    Given a URL, downloads the file into MEDIA_ROOT / subfolder and returns
    the local relative media path (e.g. '/media/products/images/...').
    If the URL is already local or empty, it returns the input unchanged.
    """
    if not url or not isinstance(url, str):
        return url
    
    trimmed = url.strip()
    if not (trimmed.startswith("http://") or trimmed.startswith("https://")):
        return trimmed

    media_root = Path(settings.MEDIA_ROOT)
    target_dir = media_root / subfolder
    target_dir.mkdir(parents=True, exist_ok=True)

    filename = get_filename_for_url(trimmed, is_image=is_image)
    dest_path = target_dir / filename
    local_media_url = f"/media/{subfolder.strip('/')}/{filename}"

    # If file already downloaded and not empty, return existing local path
    if dest_path.exists() and dest_path.stat().st_size > 0:
        return local_media_url

    tmp_path = target_dir / f"{filename}.tmp"
    req = urllib.request.Request(trimmed, headers=HEADERS)

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
                        return local_media_url
        except Exception:
            if tmp_path.exists():
                tmp_path.unlink(missing_ok=True)
            time.sleep(0.5 * (attempt + 1))

    # Fallback to trimmed if download fails completely
    return trimmed

def localize_product_media(product):
    """
    Localizes all external URLs on a Product instance before saving.
    """
    # 1. Main image
    if product.image and (product.image.startswith("http://") or product.image.startswith("https://")):
        product.image = download_and_localize_url(product.image, subfolder="products/images", is_image=True)

    # 2. Datasheet
    if product.datasheet_url and (product.datasheet_url.startswith("http://") or product.datasheet_url.startswith("https://")):
        product.datasheet_url = download_and_localize_url(product.datasheet_url, subfolder="products/documents", is_image=False)

    # 3. Gallery
    if product.gallery and isinstance(product.gallery, list):
        new_gallery = []
        for item in product.gallery:
            if isinstance(item, str) and (item.startswith("http://") or item.startswith("https://")):
                new_gallery.append(download_and_localize_url(item, subfolder="products/images", is_image=True))
            else:
                new_gallery.append(item)
        product.gallery = new_gallery

    # 4. Downloads
    if product.downloads and isinstance(product.downloads, list):
        new_downloads = []
        for item in product.downloads:
            if isinstance(item, dict):
                item_url = item.get("url", "")
                if item_url and (item_url.startswith("http://") or item_url.startswith("https://")):
                    item_copy = dict(item)
                    item_copy["url"] = download_and_localize_url(item_url, subfolder="products/documents", is_image=False)
                    new_downloads.append(item_copy)
                else:
                    new_downloads.append(item)
            elif isinstance(item, str) and (item.startswith("http://") or item.startswith("https://")):
                new_downloads.append(download_and_localize_url(item, subfolder="products/documents", is_image=False))
            else:
                new_downloads.append(item)
        product.downloads = new_downloads

def localize_brand_media(brand):
    """
    Localizes logo on a Brand instance before saving.
    """
    if brand.logo and (brand.logo.startswith("http://") or brand.logo.startswith("https://")):
        brand.logo = download_and_localize_url(brand.logo, subfolder="brands", is_image=True)

def localize_category_media(category):
    """
    Localizes image on a Category instance before saving.
    """
    if category.image and (category.image.startswith("http://") or category.image.startswith("https://")):
        category.image = download_and_localize_url(category.image, subfolder="categories", is_image=True)
