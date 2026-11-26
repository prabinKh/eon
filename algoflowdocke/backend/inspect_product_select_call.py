import requests

r = requests.get("https://www.dahuasecurity.com/assets/js/productMain.js", headers={"User-Agent": "Mozilla/5.0"})
lines = r.text.split("\n")
for i, l in enumerate(lines):
    if "product/productSelect" in l:
        start = max(0, i - 10)
        end = min(len(lines), i + 40)
        print("\n".join(lines[start:end]))
        break
