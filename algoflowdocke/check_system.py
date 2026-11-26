#!/usr/bin/env python3
"""
System Health & Integrity Verification Script for Eon Technology Platform.
Checks:
  1. Backend Server (port 8001)
  2. Frontend Server (port 3000)
  3. Database & Company (Eon Technology Pvt. Ltd.)
  4. Admin Credentials & Superuser Status (prabin@gmail.com)
  5. Django Admin Portal (/django-admin/)
  6. Frontend Store APIs (/api/store/categories, products, brands)
  7. Frontend Admin APIs (/api/admin/products, categories, orders, customers)
  8. Frontend Vite Proxy routing (/api, /django-admin via port 3000)
  9. Category & Subcategory Catalog Matching

Usage:
  python check_system.py
  or ./check_system.sh
"""

import sys
import os
import json
import urllib.request
import urllib.error
import urllib.parse
import http.cookiejar

# ANSI Color Codes
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

PASS_BADGE = f"{GREEN}{BOLD}[PASS]{RESET}"
FAIL_BADGE = f"{RED}{BOLD}[FAIL]{RESET}"
WARN_BADGE = f"{YELLOW}{BOLD}[WARN]{RESET}"
INFO_BADGE = f"{CYAN}{BOLD}[INFO]{RESET}"

TOTAL_CHECKS = 0
PASSED_CHECKS = 0
FAILED_CHECKS = 0
WARNINGS = 0

def record_pass(message, detail=""):
    global TOTAL_CHECKS, PASSED_CHECKS
    TOTAL_CHECKS += 1
    PASSED_CHECKS += 1
    extra = f" ({detail})" if detail else ""
    print(f"  {PASS_BADGE} {message}{extra}")

def record_fail(message, error=""):
    global TOTAL_CHECKS, FAILED_CHECKS
    TOTAL_CHECKS += 1
    FAILED_CHECKS += 1
    extra = f" -> {error}" if error else ""
    print(f"  {FAIL_BADGE} {message}{extra}")

def record_warn(message, detail=""):
    global WARNINGS
    WARNINGS += 1
    extra = f" ({detail})" if detail else ""
    print(f"  {WARN_BADGE} {message}{extra}")

def http_get(url, headers=None, timeout=5):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            body = res.read().decode("utf-8")
            return res.status, res.headers, body
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read().decode("utf-8")
    except Exception as e:
        return None, None, str(e)

def http_post_json(url, data_dict, headers=None, timeout=5):
    data = json.dumps(data_dict).encode("utf-8")
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, data=data, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            body = res.read().decode("utf-8")
            return res.status, res.headers, body
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read().decode("utf-8")
    except Exception as e:
        return None, None, str(e)

def main():
    print(f"\n{BOLD}{CYAN}{'=' * 65}{RESET}")
    print(f"{BOLD}{CYAN}  EON TECHNOLOGY PLATFORM - COMPREHENSIVE SYSTEM CHECK{RESET}")
    print(f"{BOLD}{CYAN}{'=' * 65}{RESET}\n")

    backend_url = "http://127.0.0.1:8001"
    frontend_url = "http://localhost:3000"
    admin_email = "prabin@gmail.com"
    admin_password = "Prabin@1234"

    # -------------------------------------------------------------
    # 1. SERVER CONNECTIVITY CHECKS
    # -------------------------------------------------------------
    print(f"{BOLD}1. Server Connectivity Checks{RESET}")
    # Backend 8001
    status, _, err = http_get(f"{backend_url}/api/store/current-company/")
    if status in (200, 301, 302):
        record_pass(f"Django Backend is running at {backend_url}", f"Status {status}")
    else:
        record_fail(f"Django Backend is reachable at {backend_url}", err)

    # Frontend 3000
    status, _, err = http_get(f"{frontend_url}/")
    if status == 200:
        record_pass(f"Vite Frontend is running at {frontend_url}", "Status 200 OK")
    else:
        record_fail(f"Vite Frontend is reachable at {frontend_url}", err)

    # -------------------------------------------------------------
    # 2. VITE PROXY ROUTING CHECKS (via port 3000)
    # -------------------------------------------------------------
    print(f"\n{BOLD}2. Frontend Proxy Routing (port 3000 -> 8001){RESET}")
    # Proxy /api
    status, _, body = http_get(f"{frontend_url}/api/store/current-company/")
    if status == 200:
        record_pass("Proxy /api/store/current-company/ forwards to Django", "Status 200")
    else:
        record_fail("Proxy /api/store/current-company/ forwards to Django", f"Status {status}")

    # Proxy /django-admin/
    status, _, _ = http_get(f"{frontend_url}/django-admin/")
    if status in (200, 301, 302):
        record_pass("Proxy /django-admin/ forwards to Django", f"Status {status}")
    else:
        record_fail("Proxy /django-admin/ forwards to Django", f"Status {status}")

    # Dahua multi-level frontend product page
    dahua_fe_url = f"{frontend_url}/products/network-products/network-cameras/wizmind-4-series/smart-dual-lght/ipc-hdbw4239e-s-il"
    status, _, _ = http_get(dahua_fe_url)
    if status == 200:
        record_pass("Dahua deep-nested product URL renders via Vite", "Status 200")
    else:
        record_fail(f"Dahua frontend URL {dahua_fe_url}", f"Status {status}")

    # Admin Categories page
    status, _, _ = http_get(f"{frontend_url}/admin/categories")
    if status == 200:
        record_pass("Admin Categories & Hierarchy page renders via Vite", "Status 200")
    else:
        record_fail("Admin Categories page", f"Status {status}")

    # -------------------------------------------------------------
    # 3. STORE PUBLIC APIS & DATA
    # -------------------------------------------------------------
    print(f"\n{BOLD}3. Public Store APIs & Catalog Data{RESET}")
    # Company check
    status, _, body = http_get(f"{backend_url}/api/store/current-company/")
    company_name = ""
    if status == 200:
        try:
            c_data = json.loads(body)
            company_name = c_data.get("name", "")
            if "Eon Technology" in company_name:
                record_pass("Current company resolved properly", f"{company_name}")
            else:
                record_warn(f"Company name is '{company_name}', expected 'Eon Technology Pvt. Ltd.'")
        except Exception as e:
            record_fail("Parse current-company response", str(e))
    else:
        record_fail("Endpoint /api/store/current-company/", f"Status {status}")

    # Categories check
    dahua_20_categories = [
        "network-products", "wireless-products", "hdcvi-products", "thermal-products",
        "video-intercoms", "access-control-time-attendance", "alarms", "interactive-whiteboards",
        "transmission", "intelligent-traffic", "ev-charger", "memory", "software",
        "dolynk-cloud", "display-control", "security-screening-esl-eas", "fire-alarm",
        "accessories", "audio-sensing", "others"
    ]
    status, _, body = http_get(f"{backend_url}/api/store/categories/")
    cats = []
    if status == 200:
        try:
            cats = json.loads(body)
            if isinstance(cats, dict) and "results" in cats:
                cats = cats["results"]
            cat_slugs = [c.get("slug") for c in cats]
            record_pass(f"Categories API returned {len(cats)} active categories")
            
            missing_dahua = [s for s in dahua_20_categories if s not in cat_slugs]
            if not missing_dahua:
                record_pass("All 20 Official Dahua Top-Level Categories present in DB", f"{len(dahua_20_categories)} categories verified")
            else:
                record_fail("All 20 Official Dahua Top-Level Categories present", f"Missing: {missing_dahua}")
        except Exception as e:
            record_fail("Parse categories response", str(e))
    else:
        record_fail("Endpoint /api/store/categories/", f"Status {status}")

    # Products check
    status, _, body = http_get(f"{backend_url}/api/store/products/")
    prods = []
    if status == 200:
        try:
            p_data = json.loads(body)
            prods = p_data if isinstance(p_data, list) else p_data.get("results", [])
            if len(prods) > 0:
                record_pass(f"Products API returned {len(prods)} active products")
            else:
                record_fail("Products API returned active products", "Catalog is empty (0 products)")
        except Exception as e:
            record_fail("Parse products response", str(e))
    else:
        record_fail("Endpoint /api/store/products/", f"Status {status}")

    # Brands check
    status, _, body = http_get(f"{backend_url}/api/store/brands/")
    if status == 200:
        try:
            b_data = json.loads(body)
            brands = b_data if isinstance(b_data, list) else b_data.get("results", [])
            record_pass(f"Brands API returned {len(brands)} active brands")
        except Exception as e:
            record_fail("Parse brands response", str(e))
    else:
        record_fail("Endpoint /api/store/brands/", f"Status {status}")

    # Hierarchical Category Tree check
    status, _, body = http_get(f"{backend_url}/api/store/categories/?tree=true")
    if status == 200:
        try:
            tree_data = json.loads(body)
            tree_cats = tree_data if isinstance(tree_data, list) else tree_data.get("results", [])
            record_pass(f"Hierarchical Category Tree API returned {len(tree_cats)} root categories")
            # Verify children nesting
            has_nested = any(len(c.get("children", [])) > 0 for c in tree_cats)
            if has_nested:
                record_pass("Category Tree includes nested subcategories (children array)")
            else:
                record_warn("Category Tree returned no nested children")
        except Exception as e:
            record_fail("Parse Category Tree response", str(e))
    else:
        record_fail("Endpoint /api/store/categories/?tree=true", f"Status {status}")

    # Dahua Multi-level Category Path Product Filtering check
    dahua_path = "network-products/network-cameras/wizmind-4-series/smart-dual-lght"
    status, _, body = http_get(f"{backend_url}/api/store/products/?category_path={dahua_path}")
    if status == 200:
        try:
            path_data = json.loads(body)
            path_products = path_data if isinstance(path_data, list) else path_data.get("results", [])
            record_pass(f"Category Path API ({dahua_path}) returned {len(path_products)} products")
        except Exception as e:
            record_fail("Parse Category Path products response", str(e))
    else:
        record_fail(f"Category Path API for {dahua_path}", f"Status {status}")

    # Dahua IPC-HDBW4239E-S-IL Product Detail & Datasheet check
    status, _, body = http_get(f"{backend_url}/api/store/products/ipc-hdbw4239e-s-il/")
    if status == 200:
        try:
            prod = json.loads(body)
            record_pass("Dahua IPC-HDBW4239E-S-IL product detail API accessible")
            if prod.get("datasheet_url"):
                record_pass(f"Product includes official datasheet: {prod['datasheet_url'][:50]}...")
            else:
                record_warn("Product datasheet_url is missing")
            if prod.get("category_path"):
                record_pass(f"Product category_path resolved: {prod['category_path']}")
        except Exception as e:
            record_fail("Parse Dahua product detail", str(e))
    else:
        record_fail("Dahua IPC-HDBW4239E-S-IL detail API", f"Status {status}")

    # -------------------------------------------------------------
    # 4. AUTHENTICATION & ADMIN PERMISSIONS
    # -------------------------------------------------------------
    print(f"\n{BOLD}4. Authentication & Superuser Permissions{RESET}")
    auth_status, _, auth_body = http_post_json(
        f"{backend_url}/api/account/login/",
        {"email": admin_email, "password": admin_password}
    )
    token = None
    if auth_status == 200:
        try:
            auth_data = json.loads(auth_body)
            token = auth_data.get("access")
            user_info = auth_data.get("user", {})
            record_pass(f"Sign In successful for {admin_email}")

            # Check permissions
            is_staff = user_info.get("is_staff")
            is_superuser = user_info.get("is_superuser")
            role = user_info.get("role")

            if is_superuser:
                record_pass("User is_superuser is True (required for Django Admin)")
            else:
                record_fail("User is_superuser is True", f"Currently: {is_superuser}")

            if is_staff:
                record_pass("User is_staff is True")
            else:
                record_fail("User is_staff is True", f"Currently: {is_staff}")

            if role in ("superadmin", "company_admin"):
                record_pass(f"User role is elevated: '{role}'")
            else:
                record_warn(f"User role is '{role}'")
        except Exception as e:
            record_fail(f"Parse login response for {admin_email}", str(e))
    else:
        record_fail(f"Sign In failed for {admin_email} / {admin_password}", f"Status {auth_status}: {auth_body}")

    # -------------------------------------------------------------
    # 5. FRONTEND ADMIN APIS (Protected endpoints)
    # -------------------------------------------------------------
    print(f"\n{BOLD}5. Frontend Admin APIs (/api/admin/...){RESET}")
    if token:
        admin_headers = {"Authorization": f"Bearer {token}"}
        
        endpoints = [
            ("/api/admin/products/", "Admin Products"),
            ("/api/admin/categories/", "Admin Categories"),
            ("/api/admin/brands/", "Admin Brands"),
            ("/api/admin/orders/", "Admin Orders"),
            ("/api/admin/customers/", "Admin Customers"),
        ]

        for ep, name in endpoints:
            st, _, bd = http_get(f"{backend_url}{ep}", headers=admin_headers)
            if st == 200:
                try:
                    data = json.loads(bd)
                    cnt = len(data) if isinstance(data, list) else len(data.get("results", []))
                    record_pass(f"{name} endpoint accessible", f"{cnt} records")
                except:
                    record_pass(f"{name} endpoint accessible", "Status 200")
            else:
                record_fail(f"{name} endpoint accessible", f"Status {st}")
    else:
        record_fail("Skip Admin APIs test", "No valid authentication token available")

    # -------------------------------------------------------------
    # 6. DJANGO ADMIN PORTAL SESSION TEST
    # -------------------------------------------------------------
    print(f"\n{BOLD}6. Django Admin Portal (/django-admin/){RESET}")
    # Check Django admin login using cookie jar
    cookie_jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))
    try:
        login_url = f"{backend_url}/django-admin/login/"
        login_page_res = opener.open(login_url, timeout=5)
        login_html = login_page_res.read().decode("utf-8")
        
        # Extract CSRF token from cookies
        csrf_token = ""
        for cookie in cookie_jar:
            if cookie.name == "csrftoken":
                csrf_token = cookie.value
                break

        if csrf_token:
            post_data = urllib.parse.urlencode({
                "username": admin_email,
                "password": admin_password,
                "csrfmiddlewaretoken": csrf_token,
                "next": "/django-admin/"
            }).encode("utf-8")

            req = urllib.request.Request(
                login_url,
                data=post_data,
                headers={"Referer": login_url}
            )
            admin_dash_res = opener.open(req, timeout=5)
            admin_dash_html = admin_dash_res.read().decode("utf-8")

            if "FixItAll Administration" in admin_dash_html or "Dashboard" in admin_dash_html or "Log out" in admin_dash_html:
                record_pass(f"Django Admin login succeeded for {admin_email}", "Dashboard loaded")
            else:
                record_fail(f"Django Admin login for {admin_email}", "Did not reach dashboard")
        else:
            record_fail("Fetch CSRF token from /django-admin/login/", "No csrftoken cookie found")
    except Exception as e:
        record_fail("Django Admin authentication test", str(e))

    # -------------------------------------------------------------
    # 7. SUMMARY REPORT
    # -------------------------------------------------------------
    print(f"\n{BOLD}{CYAN}{'=' * 65}{RESET}")
    print(f"{BOLD}  VERIFICATION SUMMARY{RESET}")
    print(f"{BOLD}{CYAN}{'=' * 65}{RESET}")
    print(f"  Total Checks: {TOTAL_CHECKS}")
    print(f"  Passed:       {GREEN}{PASSED_CHECKS}{RESET}")
    print(f"  Failed:       {RED}{FAILED_CHECKS}{RESET}")
    if WARNINGS > 0:
        print(f"  Warnings:     {YELLOW}{WARNINGS}{RESET}")
    
    if FAILED_CHECKS == 0:
        print(f"\n{GREEN}{BOLD}  >>> ALL SYSTEM CHECKS PASSED SUCCESSFULLY! <<<{RESET}")
        print(f"  - Backend:  {backend_url}")
        print(f"  - Frontend: {frontend_url}")
        print(f"  - Admin:    {frontend_url}/admin (User: {admin_email})")
        print(f"  - Django:   {backend_url}/django-admin/")
        print(f"{BOLD}{CYAN}{'=' * 65}{RESET}\n")
        return 0
    else:
        print(f"\n{RED}{BOLD}  >>> SOME CHECKS FAILED. REVIEW THE LOGS ABOVE. <<<{RESET}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
