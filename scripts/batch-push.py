#!/usr/bin/env python3
"""
Batch Git Pusher: Commits and pushes images in chunks of 1,000 files
to prevent timeouts and memory limits on cPanel / remote Git servers.
"""

import os
import subprocess
import glob

BATCH_SIZE = 1000

def run_cmd(cmd):
    print(f"👉 {cmd}")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"⚠️ Error ({res.returncode}):\n{res.stderr}")
    else:
        if res.stdout.strip():
            print(res.stdout.strip()[:300])
    return res.returncode == 0

def main():
    # 1. Reset soft to 782cbf8 so all local files are preserved in the workspace
    print("🔄 Resetting git pointer to base commit 782cbf8...")
    run_cmd("git reset --mixed 782cbf8")
    
    # 2. Stage and push all code, data and scripts first
    print("\n📦 Staging and committing core code, routes and catalogue data...")
    run_cmd("git add src/ data/ public/data/ scripts/ .gitignore public/.htaccess public/sitemap.xml")
    run_cmd('git commit -m "feat(catalogue): update 48,949 products data and routes"')
    run_cmd("git push -f origin main")
    
    # 3. Collect all images in public/images/products/
    images = sorted(glob.glob("public/images/products/*.jpg") + glob.glob("public/images/products/*.png"))
    total_images = len(images)
    print(f"\n📸 Found {total_images:,} images to push in batches of {BATCH_SIZE}...")
    
    batch_num = 1
    for i in range(0, total_images, BATCH_SIZE):
        batch_files = images[i:i + BATCH_SIZE]
        print(f"\n🚀 [Batch {batch_num}] Adding {len(batch_files)} images ({i+1} to {min(i+BATCH_SIZE, total_images)} of {total_images})...")
        
        # Add files in chunks
        chunk_str = " ".join(f'"{f}"' for f in batch_files)
        run_cmd(f"git add {chunk_str}")
        run_cmd(f'git commit -m "feat(images): add product images batch {batch_num} ({i+1}-{min(i+BATCH_SIZE, total_images)})"')
        
        print(f"⬆️ Pushing batch {batch_num} to GitHub...")
        success = run_cmd("git push origin main")
        if not success:
            print(f"⚠️ Retrying push for batch {batch_num}...")
            run_cmd("git push origin main")
            
        batch_num += 1

    print(f"\n🎉 ALL {total_images:,} images pushed to GitHub in {batch_num - 1} batches of 1,000!")

if __name__ == "__main__":
    main()
