#!/usr/bin/env python3
"""
Script to import/convert Excel catalogue files (e.g. 'Orsap Catalogue.xlsx')
into the JSON database used by the Espace Client catalogue and API.
"""

import sys
import os
import json
import glob

def find_catalogue_file():
    candidates = [
        "Orsap Catalogue.xlsx",
        "orsap catalogue.xlsx",
        "catalogue.xlsx",
        "data/catalogue.xlsx",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    xlsx_files = glob.glob("*.xlsx") + glob.glob("data/*.xlsx")
    if xlsx_files:
        return xlsx_files[0]
    return None

def import_catalogue(excel_path=None, output_path="data/articles.json"):
    try:
        import openpyxl
    except ImportError:
        print("❌ Error: 'openpyxl' is required. Install it using: pip3 install openpyxl")
        sys.exit(1)

    if not excel_path:
        excel_path = find_catalogue_file()

    if not excel_path or not os.path.exists(excel_path):
        print(f"❌ Error: Excel catalogue file not found ({excel_path or 'no .xlsx found in folder'}).")
        sys.exit(1)

    print(f"📖 Reading '{excel_path}'...")
    wb = openpyxl.load_workbook(excel_path, read_only=True)
    sheet = wb.active

    articles_by_code = {}
    total_rows = 0

    for row in sheet.iter_rows(values_only=True):
        total_rows += 1
        if not row or not row[0]:
            continue

        code = str(row[0]).strip()
        if code.startswith("Code") or code.startswith("ORSAP") or not code:
            continue

        designation = str(row[2]).strip() if len(row) > 2 and row[2] else ""
        if not designation:
            continue

        try:
            tva = float(row[6]) if len(row) > 6 and row[6] is not None and str(row[6]).replace(".", "", 1).isdigit() else 20.0
        except (ValueError, TypeError):
            tva = 20.0

        try:
            price_ttc = float(row[7]) if len(row) > 7 and row[7] is not None else 0.0
        except (ValueError, TypeError):
            price_ttc = 0.0

        rayon = str(row[8]).strip() if len(row) > 8 and row[8] else "AUTRES"
        famille = str(row[9]).strip() if len(row) > 9 and row[9] else "AUTRES"

        articles_by_code[code] = {
            "code": code,
            "designation": designation,
            "tva": tva,
            "priceTtc": price_ttc,
            "rayon": rayon,
            "famille": famille,
        }

    articles_list = list(articles_by_code.values())
    
    # Save to both data/ and public/data/ for local Node and live PHP environments
    target_paths = ["data/articles.json", "public/data/articles.json"]
    if output_path and output_path not in target_paths:
        target_paths.append(output_path)

    for path in target_paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(articles_list, f, ensure_ascii=False)

    print(f"✅ Successfully saved {len(articles_list):,} unique articles to {', '.join(target_paths)}")
    
    # Print summary statistics
    rayons = {}
    for a in articles_list:
        rayons[a["rayon"]] = rayons.get(a["rayon"], 0) + 1

    print("\n📊 Articles by Department (Rayon):")
    for r, cnt in sorted(rayons.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {r}: {cnt:,} articles")

if __name__ == "__main__":
    file_arg = sys.argv[1] if len(sys.argv) > 1 else None
    import_catalogue(file_arg)
