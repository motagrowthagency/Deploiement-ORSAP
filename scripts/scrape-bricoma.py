#!/usr/bin/env python3
"""
Bricoma.ma Complete Scraper & Image Downloader for ORSAP Catalogue
Extracts all products from Bricoma's 133+ catalog departments,
downloads all high-resolution images, and syncs the database.
"""

import os
import sys
import re
import json
import time
import ssl
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

SSL_CONTEXT = ssl._create_unverified_context()

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
}

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_JSON = os.path.join(ROOT_DIR, "data/articles.json")
OUTPUT_PUBLIC_JSON = os.path.join(ROOT_DIR, "public/data/articles.json")
CATALOGUE_TS = os.path.join(ROOT_DIR, "src/data/catalogueData.ts")
IMAGES_DIR = os.path.join(ROOT_DIR, "public/images/products")

os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_PUBLIC_JSON), exist_ok=True)
os.makedirs(os.path.dirname(CATALOGUE_TS), exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

def fetch_url(url, retries=3, delay=1.0):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=25, context=SSL_CONTEXT) as response:
                return response.read().decode("utf-8", errors="ignore")
        except Exception:
            if attempt < retries - 1:
                time.sleep(delay * (attempt + 1))
            else:
                return None

def download_image(img_url, local_path):
    if not img_url:
        return False
    if os.path.exists(local_path) and os.path.getsize(local_path) > 1000:
        return True
    try:
        req = urllib.request.Request(img_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=25, context=SSL_CONTEXT) as response:
            with open(local_path, "wb") as f:
                f.write(response.read())
        return True
    except Exception:
        return False

def get_all_categories():
    print("🔍 Analyse des rayons et catégories de Bricoma.ma...")
    cat_set = set()
    
    # 1. Homepage menu categories
    home_html = fetch_url("https://www.bricoma.ma/")
    if home_html:
        matches = re.findall(r'href="(https://www.bricoma.ma/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+\.html)"', home_html)
        for m in matches:
            if not any(x in m for x in ["/Conseils/", "/multimedia/", "/post/"]):
                cat_set.add(m)
                
    # 2. Sitemaps categories
    sitemaps = ["https://www.bricoma.ma/sitemap.xml", "https://www.bricoma.ma/sitemapall.xml"]
    for sm in sitemaps:
        xml = fetch_url(sm)
        if xml:
            locs = re.findall(r"<loc>(https://www.bricoma.ma/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+\.html)</loc>", xml)
            for loc in locs:
                if not any(x in loc for x in ["/Conseils/", "/multimedia/", "/post/"]):
                    cat_set.add(loc)
                    
    categories = sorted(list(cat_set))
    print(f"✅ Total rayons/catégories identifiés : {len(categories)}")
    return categories

def parse_category_page(cat_url, page_num=1):
    url = f"{cat_url}?p={page_num}&product_list_limit=36"
    html = fetch_url(url)
    if not html:
        return [], False
    
    chunks = html.split('class="product-item-info"')
    if len(chunks) <= 1:
        return [], False
    
    path_parts = urllib.parse.urlparse(cat_url).path.strip("/").replace(".html", "").split("/")
    rayon = path_parts[0].replace("-", " ").upper() if len(path_parts) > 0 else "DIVERS"
    famille = path_parts[1].replace("-", " ").upper() if len(path_parts) > 1 else rayon
    
    products = []
    for chunk in chunks[1:]:
        chunk = chunk[:4000]
        
        # Image
        img_match = re.search(r'<img[^>]*class="[^"]*product-image-photo[^"]*"[^>]*data-src="([^"]+)"', chunk)
        if not img_match:
            img_match = re.search(r'<img[^>]*class="[^"]*product-image-photo[^"]*"[^>]*src="([^"]+)"', chunk)
        img_url = img_match.group(1) if img_match else ""
        
        # Title
        title = ""
        link_title = re.search(r'<a[^>]*class="product-item-link"[^>]*>\s*([^<]+)\s*</a>', chunk)
        if link_title and link_title.group(1).strip():
            title = link_title.group(1).strip()
        else:
            alt_match = re.search(r'alt="([^"]+)"', chunk)
            if alt_match:
                title = alt_match.group(1).strip()
            
        if not title:
            continue
            
        # Price
        price_match = re.search(r'data-price-amount="([\d\.]+)"', chunk)
        if price_match:
            price_ttc = float(price_match.group(1))
        else:
            price_span = re.search(r'<span class="price">([^<]+)</span>', chunk)
            if price_span:
                price_clean = re.sub(r"[^\d,\.]", "", price_span.group(1)).replace(",", ".")
                try:
                    price_ttc = float(price_clean) if price_clean else 0.0
                except ValueError:
                    price_ttc = 0.0
            else:
                price_ttc = 0.0
                
        price_ht = round(price_ttc / 1.20, 2) if price_ttc > 0 else 0.0
        
        # SKU / Code
        prod_id = ""
        id_match = re.search(r'id="product-item-info_(\d+)"', chunk)
        if id_match:
            prod_id = id_match.group(1)
        elif img_url:
            sku_match = re.search(r"/([^/_]+)\.(?:jpg|png|jpeg|webp)", img_url)
            if sku_match:
                prod_id = sku_match.group(1)
                
        if not prod_id:
            prod_id = str(abs(hash(title)) % 1000000)
            
        code = f"BR{prod_id}"
        
        products.append({
            "code": code,
            "designation": title.upper(),
            "tva": 20,
            "priceHt": price_ht,
            "priceTtc": price_ttc,
            "rayon": rayon,
            "famille": famille,
            "imageUrl": img_url,
            "image": f"/images/products/{code}.jpg" if img_url else None
        })
        
    has_next = 'class="action  next"' in html or 'class="action next"' in html or 'title="Suivant"' in html
    return products, has_next

def sync_typescript_catalogue(articles_list):
    print("🔄 Synchronisation du fichier TypeScript src/data/catalogueData.ts...")
    header = "// Auto-generated catalogue data from Bricoma.ma\nimport { Article, Facets } from \"@/utils/catalogueClient\";\n\nexport type { Article, Facets };\n\nexport const ALL_ARTICLES: Article[] = "
    ts_content = header + json.dumps(articles_list, ensure_ascii=False) + ";\n"
    with open(CATALOGUE_TS, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"✅ Fichier TypeScript mis à jour ({len(articles_list):,} articles).")

def run_scraper(max_categories=None, download_images_flag=True):
    print("🚀 Lancement de l'extraction Bricoma.ma...")
    categories = get_all_categories()
    
    if max_categories:
        categories = categories[:max_categories]
        
    all_articles = {}
    images_to_download = []
    
    # Load existing if available to preserve progress
    if os.path.exists(OUTPUT_JSON):
        try:
            with open(OUTPUT_JSON, "r", encoding="utf-8") as f:
                existing = json.load(f)
                for a in existing:
                    all_articles[a["code"]] = a
            print(f"📂 Base existante chargée : {len(all_articles):,} articles.")
        except Exception:
            pass
            
    for idx, cat_url in enumerate(categories, start=1):
        page = 1
        found_in_cat = 0
        while page <= 100:
            products, has_next = parse_category_page(cat_url, page)
            if not products:
                break
                
            for p in products:
                if p["code"] not in all_articles:
                    all_articles[p["code"]] = p
                    found_in_cat += 1
                    if p.get("imageUrl"):
                        local_path = os.path.join(IMAGES_DIR, f"{p['code']}.jpg")
                        images_to_download.append((p["imageUrl"], local_path))
                        
            if not has_next:
                break
            page += 1
            time.sleep(0.1)
            
        print(f"[{idx}/{len(categories)}] {cat_url.split('/')[-1]} ➔ +{found_in_cat} articles (Total cumulé : {len(all_articles):,})")
            
        # Periodic auto-save every 10 categories
        if idx % 10 == 0:
            current_list = list(all_articles.values())
            for path in [OUTPUT_JSON, OUTPUT_PUBLIC_JSON]:
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(current_list, f, ensure_ascii=False)
            sync_typescript_catalogue(current_list)
                    
    articles_list = list(all_articles.values())
    print(f"\n🎉 Extraction complète terminée : {len(articles_list):,} articles uniques !")
    
    # Final JSON save
    for path in [OUTPUT_JSON, OUTPUT_PUBLIC_JSON]:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(articles_list, f, ensure_ascii=False, indent=2)
            
    # Sync TypeScript catalogue
    sync_typescript_catalogue(articles_list)
    
    # Download images with multithreading
    if download_images_flag and images_to_download:
        print(f"\n📸 Téléchargement de {len(images_to_download):,} photos de produits en parallèle (24 flux simultanés)...")
        success_count = 0
        with ThreadPoolExecutor(max_workers=24) as executor:
            futures = {executor.submit(download_image, img_url, path): path for img_url, path in images_to_download}
            for future in as_completed(futures):
                if future.result():
                    success_count += 1
                    if success_count % 100 == 0 or success_count == len(images_to_download):
                        print(f"   Photos téléchargées : {success_count}/{len(images_to_download)}...")
        print(f"✅ Téléchargement des photos terminé ({success_count} photos dans public/images/products/)")

if __name__ == "__main__":
    max_cats = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else None
    run_scraper(max_categories=max_cats)
