import requests

r = requests.get("https://www.dahuasecurity.com/assets/js/productMain.js", headers={"User-Agent": "Mozilla/5.0"})
lines = r.text.split("\n")
for i, l in enumerate(lines):
    if "productSelect" in l:
        start = max(0, i - 15)
        end = min(len(lines), i + 35)
        print("\n".join(lines[start:end]))
        break
