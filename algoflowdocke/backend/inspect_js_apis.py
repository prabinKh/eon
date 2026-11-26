import requests
import re

for js_name in ["productMain.js", "productCctv.js"]:
    url = f"https://www.dahuasecurity.com/assets/js/{js_name}"
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    print(f"=== {js_name} ({len(r.text)} bytes) ===")
    matches = re.findall(r"['\"](/api/[^'\"]+)['\"]", r.text)
    print("APIs found:", list(dict.fromkeys(matches)))
    # Look for ajax post/get
    lines = [l.strip() for l in r.text.split("\n") if "url:" in l or "$.ajax" in l or "type:" in l]
    for l in lines[:10]:
        print(" ", l)
