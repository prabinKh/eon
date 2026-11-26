import requests
from bs4 import BeautifulSoup
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
url = 'https://www.dahuasecurity.com/products/network-products/network-cameras/wizmind-4-series/smart-dual-lght'
r = requests.get(url, headers=headers, timeout=10)

soup = BeautifulSoup(r.text, 'html.parser')
for s in soup.find_all('script'):
    src = s.get('src')
    if src:
        print("Script src:", src)
    elif s.string and ('ajax' in s.string.lower() or 'fetch' in s.string.lower() or 'axios' in s.string.lower()):
        print("Inline script with ajax/fetch:")
        lines = [line.strip() for line in s.string.split('\n') if any(k in line.lower() for k in ['url:', 'post', 'get', 'api', 'products/'])]
        for l in lines[:10]:
            print("  ", l)
