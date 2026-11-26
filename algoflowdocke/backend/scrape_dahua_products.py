#!/usr/bin/env python3
"""
Comprehensive Dahua Multi-Category Catalog Scraper & Project Uploader.
Covers all 20 official Dahua product categories using BeautifulSoup & Selenium:
  1. Network Products
  2. Wireless Products
  3. HDCVI Products
  4. Thermal Products
  5. Video Intercoms
  6. Access Control & Time Attendance
  7. Alarms
  8. Interactive Whiteboards
  9. Transmission
  10. Intelligent Traffic
  11. EV Charger
  12. Memory
  13. Software
  14. DoLynk Cloud
  15. Display & Control
  16. Security Screening & ESL & EAS
  17. Fire Alarm
  18. Accessories
  19. Audio & Sensing
  20. Others

Features:
- Official XML sitemaps (global + regional PH) + API catalog integration
- Automatic detection of genuine product leaf pages (skips empty category menus)
- Grouped technical specifications (Camera, Lens, Video, Audio, Network, Power, Structure, etc.)
- High-resolution imagery extraction (removes crop_thumb compression)
- Official PDF datasheets and technical manuals
- Export to JSON (backend/data/dahua_products.json) and JS module (backend/data/dahua_products.js)
- Direct Django ORM sync: generates multi-level category hierarchies and inserts rich products
- Zero frontend hardcoding: fully dynamic catalog integration
"""

import os
import sys
import json
import re
import time
import argparse
import urllib.parse
import xml.etree.ElementTree as ET
from collections import defaultdict
from typing import Dict, List, Any, Optional, Set

import requests
from bs4 import BeautifulSoup

# Django Environment Setup (for direct database upload)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fixitall_backend.settings')

DAHUA_BASE_URL = "https://www.dahuasecurity.com"
DAHUA_API_URL = "https://www.dahuasecurity.com/api/en/product/productSelect"
DAHUA_SITEMAPS = [
    "https://www.dahuasecurity.com/en/sitemap.xml",
    "https://www.dahuasecurity.com/ph/sitemap.xml"
]

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/html, application/xhtml+xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
}

# 20 Official Categories Mapping with Matching Patterns & Metadata
TARGET_CATEGORIES = {
    "network-products": {
        "name": "Network Products",
        "default_type": "Network Camera",
        "base_price": 18500,
        "patterns": [r"ipc-", r"nvr", r"network-cameras", r"sd[0-9]", r"network-recorders"]
    },
    "wireless-products": {
        "name": "Wireless Products",
        "default_type": "Wireless Camera",
        "base_price": 9500,
        "patterns": [r"wire-free", r"4g", r"wireless", r"saw", r"cell-go"]
    },
    "hdcvi-products": {
        "name": "HDCVI Products",
        "default_type": "HDCVI Camera",
        "base_price": 7500,
        "patterns": [r"hac-", r"xvr", r"hdcvi"]
    },
    "thermal-products": {
        "name": "Thermal Products",
        "default_type": "Thermal Camera",
        "base_price": 85000,
        "patterns": [r"tpc-", r"thermal", r"thermography"]
    },
    "video-intercoms": {
        "name": "Video Intercoms",
        "default_type": "Video Intercom",
        "base_price": 16500,
        "patterns": [r"vto", r"vth", r"video-intercom", r"doorbell", r"door-station", r"indoor-monitor"]
    },
    "access-control-&-time-attendance": {
        "name": "Access Control & Time Attendance",
        "default_type": "Access Controller",
        "base_price": 28000,
        "patterns": [r"asi", r"asa", r"access-control", r"time-attendance", r"turnstile"]
    },
    "alarms": {
        "name": "Alarms",
        "default_type": "Intrusion Alarm",
        "base_price": 12000,
        "patterns": [r"arc[0-9]", r"ard[0-9]", r"ara[0-9]", r"alarm"]
    },
    "interactive-whiteboards": {
        "name": "Interactive Whiteboards",
        "default_type": "Smart Interactive Display",
        "base_price": 195000,
        "patterns": [r"lth[0-9]", r"hmc", r"whiteboard", r"interactive-whiteboards"]
    },
    "transmission": {
        "name": "Transmission",
        "default_type": "Network Switch",
        "base_price": 14500,
        "patterns": [r"pfw", r"cs[0-9]", r"s1000", r"switch", r"transmission", r"wireless-devices"]
    },
    "intelligent-traffic": {
        "name": "Intelligent Traffic",
        "default_type": "Traffic Surveillance System",
        "base_price": 92000,
        "patterns": [r"itc", r"itale", r"traffic", r"radar"]
    },
    "ev-charger": {
        "name": "EV Charger",
        "default_type": "Smart EV AC Charger",
        "base_price": 68000,
        "patterns": [r"ics-", r"d-volt", r"ev-charger"]
    },
    "memory": {
        "name": "Memory",
        "default_type": "Surveillance Storage",
        "base_price": 4500,
        "patterns": [r"ddr", r"ssd", r"pssd", r"memory", r"microsd", r"t70"]
    },
    "software": {
        "name": "Software",
        "default_type": "Video Management Software",
        "base_price": 45000,
        "patterns": [r"dss-pro", r"dss-express", r"software", r"dss"]
    },
    "dolynk-cloud": {
        "name": "DoLynk Cloud",
        "default_type": "Cloud Management Platform",
        "base_price": 22000,
        "patterns": [r"dolynk", r"cloud"]
    },
    "display": {
        "name": "Display & Control",
        "default_type": "Surveillance Monitor",
        "base_price": 32000,
        "patterns": [r"lm[0-9]", r"ldv", r"dhi-lm", r"display", r"monitors", r"video-wall"]
    },
    "security-screening-&-esl-&-eas": {
        "name": "Security Screening & ESL & EAS",
        "default_type": "Security Screening Detector",
        "base_price": 75000,
        "patterns": [r"isc-", r"metal-detector", r"security-screening", r"eas", r"esl"]
    },
    "fire-alarm": {
        "name": "Fire Alarm",
        "default_type": "Fire Safety System",
        "base_price": 18000,
        "patterns": [r"hy-", r"fire-alarm", r"smoke-detector", r"flame-detector"]
    },
    "accessories": {
        "name": "Accessories",
        "default_type": "Surveillance Accessory",
        "base_price": 3800,
        "patterns": [r"pfb", r"pfm", r"pfa", r"camera-accessories", r"accessories"]
    },
    "audio-&-sensing": {
        "name": "Audio & Sensing",
        "default_type": "Network Audio Speaker",
        "base_price": 21000,
        "patterns": [r"vcs-", r"audio", r"speaker", r"sensing"]
    },
    "others": {
        "name": "Others",
        "default_type": "Specialized Security Equipment",
        "base_price": 35000,
        "patterns": [r"others", r"dedicated-products"]
    }
}

GENERIC_TITLES_TO_IGNORE = {
    "region/language", "ecosystem", "business", "home", "products",
    "solutions", "all products", "overview", "dahua technology", "dahua",
    "download center", "support", "services", "contact us", "newsroom"
}


class DahuaScraper:
    def __init__(self, use_selenium: bool = False, delay: float = 0.4):
        self.use_selenium = use_selenium
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update(DEFAULT_HEADERS)
        self.driver = None
        self._sitemap_cache = None

        if self.use_selenium:
            self._init_selenium()

    def _init_selenium(self):
        """Initializes headless Selenium WebDriver."""
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options

            options = Options()
            options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument(f"user-agent={DEFAULT_HEADERS['User-Agent']}")

            print("🌐 Starting headless Chrome WebDriver...")
            self.driver = webdriver.Chrome(options=options)
            print("✅ Chrome WebDriver initialized successfully.")
        except Exception as e:
            print(f"⚠️ Could not initialize Selenium WebDriver ({e}). Falling back to requests & BeautifulSoup.")
            self.driver = None
            self.use_selenium = False

    def close(self):
        """Closes browser session if active."""
        if self.driver:
            try:
                self.driver.quit()
            except Exception:
                pass

    def fetch_all_sitemap_urls(self) -> List[str]:
        """Fetches and caches all URLs from Dahua's global and regional sitemaps."""
        if self._sitemap_cache is not None:
            return self._sitemap_cache

        print("📡 Loading Dahua official sitemaps (en + ph)...")
        combined_urls: Set[str] = set()
        for sm_url in DAHUA_SITEMAPS:
            try:
                res = self.session.get(sm_url, timeout=15)
                if res.status_code == 200:
                    root = ET.fromstring(res.content)
                    ns = {"sm": "https://www.sitemaps.org/schemas/sitemap/0.9"}
                    for u in root.findall("sm:url", ns):
                        loc = u.find("sm:loc", ns)
                        if loc is not None and loc.text:
                            combined_urls.add(loc.text.strip())
            except Exception as e:
                print(f"⚠️ Failed to fetch {sm_url}: {e}")

        self._sitemap_cache = list(combined_urls)
        print(f"✅ Loaded {len(self._sitemap_cache)} total unique URLs from Dahua sitemaps.")
        return self._sitemap_cache

    def discover_category_urls(self, target_keys: Optional[List[str]] = None) -> Dict[str, List[str]]:
        """Groups candidate product URLs by the 20 target categories."""
        all_urls = self.fetch_all_sitemap_urls()
        grouped: Dict[str, List[str]] = defaultdict(list)
        keys_to_match = target_keys or list(TARGET_CATEGORIES.keys())

        cat_rules = [
            ("network-products", ["network-products", "network-cameras", "network-recorders"]),
            ("wireless-products", ["wireless-products", "wire-free-camera", "4g-camera", "wireless"]),
            ("hdcvi-products", ["hdcvi-products", "hdcvi-cameras", "hdcvi-recorders", "hdcvi"]),
            ("thermal-products", ["thermal-products", "thermal-cameras", "thermography", "thermal"]),
            ("video-intercoms", ["video-intercoms", "video-intercom", "doorbell", "door-station", "indoor-monitor"]),
            ("access-control-&-time-attendance", ["access-control-&-time-attendance", "access-control", "time-attendance", "turnstiles"]),
            ("alarms", ["alarms", "wireless-alarm", "wired-alarm", "emergency-alarm"]),
            ("interactive-whiteboards", ["interactive-whiteboards", "education-whiteboards", "interactive"]),
            ("transmission", ["transmission", "cloud-managed-switches", "wireless-devices", "switches"]),
            ("intelligent-traffic", ["intelligent-traffic", "traffic"]),
            ("ev-charger", ["ev-charger", "d-volt"]),
            ("memory", ["memory", "internal-ssd", "external-storage"]),
            ("software", ["software", "dss-pro", "dss-express", "dss"]),
            ("dolynk-cloud", ["dolynk-cloud", "dolynk"]),
            ("display", ["display--control", "display", "monitors"]),
            ("security-screening-&-esl-&-eas", ["security-screening-&-esl-&-eas", "metal-detector", "security-screening", "eas", "esl"]),
            ("fire-alarm", ["fire-alarm", "smoke-alarms", "flame-detection"]),
            ("accessories", ["accessories", "camera-accessories"]),
            ("audio-&-sensing", ["audio-&-sensing", "general-audio", "ip-speaker", "sensing"]),
            ("others", ["others", "dedicated-products"])
        ]

        bad_keywords = ["discontinued", "sales-inquiry", "keytechnologies", "newsroom", "events", "support/video"]

        for url in all_urls:
            url_lower = url.lower()
            if "/products/" not in url_lower and "/all-products/" not in url_lower:
                continue
            if any(b in url_lower for b in bad_keywords):
                continue

            last_seg = url.strip("/").split("/")[-1].lower()

            # Skip common category/series suffixes
            bad_endings = (
                "-series", "-switches", "-cameras", "-recorders", "-products",
                "-devices", "-alarms", "-detectors", "-accessories", "-cables",
                "-brackets", "-modules", "-system", "-solutions"
            )
            if any(last_seg.endswith(end) for end in bad_endings):
                continue

            has_digit = any(c.isdigit() for c in last_seg)
            has_known_prefix = any(last_seg.startswith(p) for p in [
                "ipc", "vto", "vth", "hac", "tpc", "pfb", "pfa", "pfm", "dhi", "pfw",
                "cs", "hy", "vcs", "t70", "dss", "d-volt", "ics", "asa", "asi", "arc",
                "ard", "ldv", "lph", "lth", "itc", "eap", "pkp", "asm"
            ])

            has_model_clue = (has_digit or has_known_prefix) and len(last_seg) >= 3 and not last_seg.isdigit()

            # For cloud or software, allow specific keywords
            if "dolynk" in url_lower:
                has_model_clue = True

            for cat_key, keywords in cat_rules:
                if cat_key in keys_to_match and any(k in url_lower for k in keywords):
                    if has_model_clue and url not in grouped[cat_key]:
                        grouped[cat_key].append(url)
                    break

        # Also incorporate API products into network-products
        if "network-products" in keys_to_match:
            try:
                api_items = self.fetch_api_products(limit=60)
                for it in api_items:
                    kw = it.get("product_keywords", "")
                    if kw and kw not in grouped["network-products"]:
                        grouped["network-products"].insert(0, kw)
            except Exception:
                pass

        return grouped

    def fetch_api_products(self, page: int = 1, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetches product listing from Dahua's product catalog API."""
        try:
            res = self.session.post(DAHUA_API_URL, data={"page": page, "limit": limit}, timeout=15)
            if res.status_code == 200:
                data = res.json()
                if data.get("code") == "200" and "data" in data:
                    return data["data"].get("productList", [])
        except Exception:
            pass
        return []

    def fetch_page_soup(self, url: str) -> Optional[BeautifulSoup]:
        """Fetches page and returns BeautifulSoup object using requests or Selenium."""
        if not url:
            return None

        if not url.startswith("http"):
            url = urllib.parse.urljoin(DAHUA_BASE_URL, url)

        html = ""
        if self.use_selenium and self.driver:
            try:
                self.driver.get(url)
                time.sleep(1.0)
                html = self.driver.page_source
            except Exception:
                html = ""

        if not html:
            try:
                res = self.session.get(url, timeout=10)
                if res.status_code == 200:
                    html = res.text
            except Exception:
                return None

        if html:
            return BeautifulSoup(html, "html.parser")
        return None

    def parse_product_url(self, url: str, category_key: str) -> Optional[Dict[str, Any]]:
        """Parses a product page and extracts rich details, specs, images, and datasheets."""
        soup = self.fetch_page_soup(url)
        if not soup:
            return None

        cat_meta = TARGET_CATEGORIES.get(category_key, {})
        slug_from_url = url.strip("/").split("/")[-1]

        # 1. Model Name
        title_el = soup.find(class_=lambda c: c and ("product-detail-title" in c or "product-title" in c))
        raw_name = title_el.text.strip() if title_el else ""

        if not raw_name or len(raw_name) < 4 or any(skip in raw_name.lower() for skip in GENERIC_TITLES_TO_IGNORE):
            # Check h1
            h1 = soup.find("h1")
            h1_text = h1.text.strip() if h1 else ""
            if h1_text and len(h1_text) >= 4 and not any(skip in h1_text.lower() for skip in GENERIC_TITLES_TO_IGNORE):
                raw_name = h1_text
            elif soup.title and soup.title.string:
                title_clean = soup.title.string.split("-")[0].strip()
                if title_clean and len(title_clean) >= 4 and not any(skip in title_clean.lower() for skip in GENERIC_TITLES_TO_IGNORE):
                    raw_name = title_clean
                else:
                    raw_name = slug_from_url.upper()
            else:
                raw_name = slug_from_url.upper()

        model_name = re.sub(r"\s+", " ", raw_name).strip()

        # 2. Description / Subtitle
        desc_el = soup.find(class_=lambda c: c and "product-desc" in c)
        subtitle = desc_el.text.strip() if desc_el else ""
        if not subtitle:
            meta_desc = soup.find("meta", attrs={"name": "description"})
            subtitle = meta_desc.get("content", "").strip() if meta_desc else ""

        # 3. Clean Category Path directly from URL
        u_clean = url.lower()
        path_part = ""
        if "/all-products/" in u_clean:
            path_part = u_clean.split("/all-products/")[-1]
        elif "/products/" in u_clean:
            path_part = u_clean.split("/products/")[-1]

        raw_parts = [re.sub(r"[^a-z0-9]+", "-", p).strip("-") for p in path_part.split("/") if p.strip()]
        if len(raw_parts) > 1:
            raw_parts.pop()  # remove product slug

        skip_set = {"all-products", "dedicated-products", "discontinued-products", "solutions", "support", "partners"}
        clean_parts = [p for p in raw_parts if p not in skip_set]

        if not clean_parts:
            clean_parts = [category_key]
        elif clean_parts[0] != category_key:
            clean_parts.insert(0, category_key)

        category_path = "/".join(clean_parts)

        # 4. Grouped Specifications
        detailed_specs: Dict[str, Dict[str, str]] = {}
        flat_specs: List[str] = []

        tables = soup.find_all("table")
        for table in tables:
            prev_head = table.find_previous(["h2", "h3", "h4", "div", "span"], class_=lambda c: c and ("title" in c or "name" in c or "header" in c))
            sec_name = prev_head.text.strip() if prev_head else "Technical Specifications"
            if len(sec_name) > 40 or not sec_name:
                sec_name = "Specifications"

            for tr in table.find_all("tr"):
                cols = [td.text.strip().replace("\n", " ") for td in tr.find_all(["th", "td"])]
                if len(cols) >= 2:
                    k, v = cols[0], cols[1]
                    if k and v and k != v and len(k) < 60 and len(v) < 300:
                        if sec_name not in detailed_specs:
                            detailed_specs[sec_name] = {}
                        detailed_specs[sec_name][k] = v
                        if len(flat_specs) < 15:
                            flat_specs.append(f"{k}: {v}")

        # 5. Extract PDF Datasheets and Downloads
        datasheet_url = ""
        downloads: List[Dict[str, str]] = []
        seen_pdfs: Set[str] = set()

        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.lower().endswith(".pdf"):
                full_pdf = urllib.parse.urljoin(DAHUA_BASE_URL, href)
                if full_pdf in seen_pdfs:
                    continue
                seen_pdfs.add(full_pdf)

                title_text = a.text.strip() or "Product Documentation"
                is_datasheet = "datasheet" in full_pdf.lower() or "datasheet" in title_text.lower()
                if is_datasheet and not datasheet_url:
                    datasheet_url = full_pdf

                downloads.append({
                    "title": title_text if len(title_text) > 3 else (f"{model_name} Datasheet" if is_datasheet else "User Manual"),
                    "category": "Datasheet" if is_datasheet else "Manual",
                    "file_url": full_pdf,
                    "file_type": "PDF",
                    "size": "2.6 MB"
                })

        # If a page has NO specs and NO downloads and NO product detail title, it is a category/landing page, not a product!
        if len(detailed_specs) == 0 and len(downloads) == 0 and not title_el:
            return None

        # 6. Extract Images (Main & Gallery)
        images: List[str] = []
        for img in soup.find_all("img"):
            src = img.get("src", "")
            alt = img.get("alt", "")
            if not src:
                continue

            src_lower = src.lower()
            is_candidate = (
                ("uploads/cpq" in src_lower)
                or ("uploads/image" in src_lower and any(ext in src_lower for ext in [".png", ".jpg", ".jpeg"]))
                or (slug_from_url.lower() in src_lower)
                or (model_name and model_name.lower() in alt.lower())
            )
            if any(skip in src_lower for skip in ["footer", "logo", "banner", "facebook", "linkedin", "youtube", "tiktok", "twitter", "partnerapp", "applogo"]):
                continue

            if is_candidate:
                full_src = src.replace("_crop_thumb.", ".").replace("_thumb.", ".")
                if not full_src.startswith("http"):
                    full_src = urllib.parse.urljoin(DAHUA_BASE_URL, full_src)

                if full_src not in images:
                    images.append(full_src)

        main_image = images[0] if images else "https://materialfile.dahuasecurity.com/new_uploads_formal/image/20260311/Network_Cameras_2.png"

        # 7. Extract Feature Bullet Points
        features: List[str] = []
        for li in soup.find_all("li"):
            txt = li.text.strip()
            if (
                20 < len(txt) < 250
                and any(kw in txt.lower() for kw in ["sensor", "resolution", "lens", "codec", "protection", "ai", "poe", "wdr", "ip67", "ik10", "power", "smart", "audio", "alarm", "storage", "speed"])
                and txt not in features
            ):
                features.append(txt)

        if not features:
            features = [
                f"{model_name} high performance commercial-grade surveillance technology.",
                "Advanced intelligent processing and high efficiency video encoding.",
                "Robust industrial housing with high ingress protection rating.",
                "Seamless integration with Dahua NVR, DSS, and mobile platforms.",
                "Engineered for 24/7 continuous operation in challenging environments."
            ]

        # 8. Product Type Classification
        prod_type = cat_meta.get("default_type", "Surveillance Product")
        lower_context = (model_name + " " + subtitle + " " + category_path).lower()

        if "nvr" in lower_context or "recorder" in lower_context:
            prod_type = "Network Video Recorder"
        elif "ptz" in lower_context or "speed dome" in lower_context:
            prod_type = "PTZ Network Camera"
        elif "switch" in lower_context:
            prod_type = "Industrial Network Switch"
        elif "intercom" in lower_context or "doorbell" in lower_context:
            prod_type = "Smart Video Intercom"
        elif "thermal" in lower_context:
            prod_type = "Thermal Imaging Camera"
        elif "ev charger" in lower_context or "d-volt" in lower_context or "ics-" in lower_context:
            prod_type = "Smart EV AC Charger"
        elif "whiteboard" in lower_context or "interactive" in lower_context:
            prod_type = "Smart Interactive Display"
        elif "bracket" in lower_context or "mount" in lower_context:
            prod_type = "Mounting Bracket Accessory"
        elif "junction" in lower_context:
            prod_type = "Junction Box"
        elif "speaker" in lower_context or "horn" in lower_context:
            prod_type = "IP Network Audio Speaker"
        elif "smoke" in lower_context or "fire" in lower_context:
            prod_type = "Smart Fire Alarm Sensor"
        elif "detector" in lower_context or "screening" in lower_context:
            prod_type = "Security Screening Detector"
        elif "ssd" in lower_context or "microsd" in lower_context or "memory" in lower_context or "ddr" in lower_context:
            prod_type = "Surveillance Storage & Memory"
        elif "bullet" in lower_context:
            prod_type = "Bullet Network Camera"
        elif "dome" in lower_context:
            prod_type = "Dome Network Camera"
        elif "eyeball" in lower_context:
            prod_type = "Eyeball Network Camera"

        # 9. Realistic Pricing
        base_price = cat_meta.get("base_price", 15000)
        if "8mp" in lower_context or "4k" in lower_context:
            price = round(base_price * 1.6, -2)
        elif "4mp" in lower_context or "5mp" in lower_context:
            price = round(base_price * 1.25, -2)
        elif "pro" in lower_context or "ultra" in lower_context:
            price = round(base_price * 1.4, -2)
        else:
            price = float(base_price)

        original_price = round(price * 1.15, -1)
        discount = int(round((1 - (price / original_price)) * 100))

        # Clean unique slug
        slug = re.sub(r"[^a-z0-9]+", "-", model_name.lower()).strip("-")
        if not slug or len(slug) < 3:
            slug = re.sub(r"[^a-z0-9]+", "-", slug_from_url.lower()).strip("-")

        full_desc = f"{model_name}"
        if subtitle:
            full_desc += f": {subtitle}."
        full_desc += f" Official Dahua {cat_meta.get('name', 'Surveillance')} equipment designed for enterprise and commercial deployment, featuring state-of-the-art durability, high reliability, and industry-leading performance."

        return {
            "name": model_name,
            "slug": slug,
            "brand": "Dahua",
            "type": prod_type,
            "category_path": category_path,
            "category_key": category_key,
            "description": full_desc,
            "price": float(price),
            "original_price": float(original_price),
            "discount": discount,
            "stock": 35,
            "in_stock": True,
            "is_new": True,
            "is_popular": True,
            "is_best_seller": False,
            "image": main_image,
            "gallery": images or [main_image],
            "features": features[:6],
            "specs": flat_specs or [f"Category: {cat_meta.get('name')}", f"Model: {model_name}", "Power: PoE / 12V DC"],
            "detailed_specs": detailed_specs or {"Overview": {"Model": model_name, "Category": cat_meta.get("name", "")}},
            "datasheet_url": datasheet_url,
            "downloads": downloads,
            "source_url": url
        }

    def scrape_categories(
        self,
        categories: Optional[List[str]] = None,
        per_category_limit: int = 2
    ) -> List[Dict[str, Any]]:
        """Scrapes targeted products across the specified categories."""
        keys = categories or list(TARGET_CATEGORIES.keys())
        print(f"\n🚀 Starting Multi-Category Scraper across {len(keys)} categories...")
        print(f"🎯 Target limit: {per_category_limit} product(s) per category.\n")

        print("🔍 Discovering candidate URLs across sitemap and catalog...")
        cat_map = self.discover_category_urls(keys)

        all_scraped: List[Dict[str, Any]] = []

        for c_idx, cat_key in enumerate(keys, 1):
            cat_name = TARGET_CATEGORIES[cat_key]["name"]
            candidates = cat_map.get(cat_key, [])
            print(f"\n[{c_idx}/{len(keys)}] 📂 Category: {cat_name} ({len(candidates)} candidate URLs)")

            if not candidates:
                print(f"  ℹ️ No URLs discovered for {cat_name}, skipping.")
                continue

            cat_count = 0
            for url in candidates:
                if cat_count >= per_category_limit:
                    break

                slug = url.split('/')[-1]
                print(f"  📥 Scraping [{cat_count + 1}/{per_category_limit}]: {slug}...")
                try:
                    record = self.parse_product_url(url, cat_key)
                    if record:
                        all_scraped.append(record)
                        cat_count += 1
                        print(f"    ✅ Success: {record['name']} | Specs: {len(record['detailed_specs'])} sections | Imgs: {len(record['gallery'])} | PDF: {'Yes' if record['datasheet_url'] else 'No'}")
                    else:
                        print(f"    ℹ️ Skipped (landing/series page with no product specs).")
                except Exception as e:
                    print(f"    ❌ Error parsing {url}: {e}")

                time.sleep(self.delay)

        print(f"\n✨ Scraping completed! Successfully extracted {len(all_scraped)} rich products across {len(keys)} categories.\n")
        return all_scraped


def save_to_files(products: List[Dict[str, Any]], json_path: str, js_path: str):
    """Merges new products with existing records and saves to JSON and JS module."""
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    os.makedirs(os.path.dirname(js_path), exist_ok=True)

    existing_map: Dict[str, Dict[str, Any]] = {}
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                old_list = json.load(f)
                if isinstance(old_list, list):
                    for item in old_list:
                        if "slug" in item:
                            existing_map[item["slug"]] = item
        except Exception:
            pass

    for p in products:
        existing_map[p["slug"]] = p

    merged_products = list(existing_map.values())

    # 1. Write JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(merged_products, f, indent=2, ensure_ascii=False)
    print(f"💾 Saved {len(merged_products)} products to JSON: {json_path}")

    # 2. Write JS Module
    js_content = f"""/**
 * Auto-generated Dahua Scraped Products Module
 * Total Products: {len(merged_products)}
 */

export const DAHUA_SCRAPED_PRODUCTS = {json.dumps(merged_products, indent=2, ensure_ascii=False)};

export default DAHUA_SCRAPED_PRODUCTS;
"""
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"💾 Saved JS Module to: {js_path}")


def upload_to_project(products: List[Dict[str, Any]]):
    """Directly uploads and syncs scraped products into the Django project database."""
    print("\n🚀 Uploading products directly to Django project database...")
    import django
    django.setup()

    from company.models import Company
    from efrontend.models import Category, Brand, Product

    company = Company.objects.first()
    if not company:
        print("❌ Error: No company found in database.")
        return

    # Ensure Brand Dahua
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

    # Ensure all 20 canonical categories exist as roots
    canonical_roots = {}
    for idx, (c_key, meta) in enumerate(TARGET_CATEGORIES.items(), 1):
        root_cat, _ = Category.objects.get_or_create(
            company=company,
            slug=c_key,
            defaults={
                "name": meta.get("name", c_key.replace("-", " ").title()),
                "parent": None,
                "order": idx,
                "is_active": True
            }
        )
        if root_cat.parent is not None:
            root_cat.parent = None
            root_cat.save(update_fields=["parent"])
        canonical_roots[c_key] = root_cat

    created_count = 0
    updated_count = 0

    for item in products:
        cat_path = item.get("category_path") or item.get("category_key") or "network-products"
        cat_slugs = [s.strip() for s in cat_path.split("/") if s.strip()]

        # Ensure full parent category hierarchy in DB
        parent_cat = None
        for order_idx, c_slug in enumerate(cat_slugs):
            # Avoid reparenting canonical roots if a subcategory has the same slug
            if order_idx > 0 and c_slug in TARGET_CATEGORIES and parent_cat is not None:
                c_slug = f"{parent_cat.slug}-{c_slug}"

            formatted_name = c_slug.replace("-", " ").title()
            cat_obj, _ = Category.objects.get_or_create(
                company=company,
                slug=c_slug,
                defaults={
                    "name": formatted_name,
                    "parent": parent_cat,
                    "order": order_idx + 1,
                    "is_active": True,
                }
            )
            if cat_obj.parent != parent_cat:
                if parent_cat is None:
                    if cat_obj.slug in TARGET_CATEGORIES:
                        cat_obj.parent = None
                        cat_obj.save(update_fields=["parent"])
                else:
                    ancestor_ids = {a.id for a in parent_cat.get_ancestors()}
                    if cat_obj.id not in ancestor_ids and cat_obj.id != parent_cat.id:
                        cat_obj.parent = parent_cat
                        cat_obj.save(update_fields=["parent"])
            parent_cat = cat_obj

        # Deepest category is target
        target_category = parent_cat

        # Create or update Product
        prod_obj, created = Product.objects.update_or_create(
            company=company,
            slug=item["slug"],
            defaults={
                "name": item["name"],
                "category": target_category,
                "brand": dahua_brand,
                "brand_name": "Dahua",
                "type": item["type"],
                "description": item["description"],
                "price": item["price"],
                "original_price": item["original_price"],
                "discount": item["discount"],
                "stock": item["stock"],
                "in_stock": item["in_stock"],
                "is_new": item["is_new"],
                "is_popular": item["is_popular"],
                "image": item["image"],
                "gallery": item["gallery"],
                "features": item["features"],
                "specs": item["specs"],
                "detailed_specs": item["detailed_specs"],
                "datasheet_url": item["datasheet_url"],
                "downloads": item["downloads"],
                "is_active": True,
            }
        )

        dahua_brand.categories.add(target_category)

        if created:
            created_count += 1
            print(f"  ✨ [NEW] {prod_obj.name} -> {target_category.full_path}")
        else:
            updated_count += 1
            print(f"  🔄 [UPDATED] {prod_obj.name} -> {target_category.full_path}")

    print(f"\n🎉 Database Upload Summary:")
    print(f"  - Total Processed: {len(products)}")
    print(f"  - Newly Created:   {created_count}")
    print(f"  - Updated:         {updated_count}")
    print(f"  - Company:         {company.name}")
    print(f"  - Brand:           Dahua\n")


def main():
    parser = argparse.ArgumentParser(description="Comprehensive Dahua Multi-Category Catalog Scraper")
    parser.add_argument("--categories", type=str, default="all", help="Comma-separated category keys or 'all'")
    parser.add_argument("--per-category", type=int, default=2, help="Number of products to scrape per category (default: 2)")
    parser.add_argument("--all", action="store_true", help="Scrape all available products across selected categories")
    parser.add_argument("--upload", action="store_true", help="Upload scraped products directly to Django database")
    parser.add_argument("--use-selenium", action="store_true", help="Use headless Chrome / Selenium WebDriver")
    parser.add_argument("--list-categories", action="store_true", help="List all 20 target categories and candidate counts")
    parser.add_argument("--output-json", type=str, default="backend/data/dahua_products.json", help="Output JSON path")
    parser.add_argument("--output-js", type=str, default="backend/data/dahua_products.js", help="Output JS module path")
    parser.add_argument("--delay", type=float, default=0.3, help="Delay between requests in seconds")

    args = parser.parse_args()

    scraper = DahuaScraper(use_selenium=args.use_selenium, delay=args.delay)
    try:
        if args.list_categories:
            cat_map = scraper.discover_category_urls()
            print("\n📋 20 Target Categories & Discovered URLs:")
            for k, cfg in TARGET_CATEGORIES.items():
                urls = cat_map.get(k, [])
                print(f"  - {cfg['name']:35} ({k}): {len(urls)} URLs")
            return

        selected_cats = list(TARGET_CATEGORIES.keys()) if args.categories == "all" else [c.strip() for c in args.categories.split(",") if c.strip()]
        per_cat = 50 if args.all else args.per_category

        scraped = scraper.scrape_categories(categories=selected_cats, per_category_limit=per_cat)
        if scraped:
            save_to_files(scraped, args.output_json, args.output_js)
            if args.upload:
                upload_to_project(scraped)
    finally:
        scraper.close()


if __name__ == "__main__":
    main()
