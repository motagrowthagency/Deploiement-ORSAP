/**
 * ORSAP - Script d'import de photos produits par CSV / Excel (Option 2)
 *
 * Utilisation :
 * 1. Placez votre fichier CSV contenant les colonnes "code" et "image" (ou "url")
 *    dans data/images_import.csv
 * 2. Lancez : node scripts/import-product-images-csv.cjs [chemin_vers_csv]
 */

const fs = require('fs');
const path = require('path');

const csvPath = process.argv[2] || path.join(__dirname, '../data/images_import.csv');
const articlesPath = path.join(__dirname, '../data/articles.json');
const publicArticlesPath = path.join(__dirname, '../public/data/articles.json');
const tsDataPath = path.join(__dirname, '../src/data/catalogueData.ts');

if (!fs.existsSync(csvPath)) {
  console.log(`ℹ️  Fichier CSV d'import non trouvé : ${csvPath}`);
  console.log(`👉 Pour importer des photos en masse, créez un fichier CSV avec le format :`);
  console.log(`   code,image_url`);
  console.log(`   OR120280,https://example.com/photos/OR120280.jpg`);
  console.log(`   OR52491,https://example.com/photos/OR52491.jpg`);
  process.exit(0);
}

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);

if (lines.length <= 1) {
  console.log('⚠️ Le fichier CSV est vide.');
  process.exit(0);
}

// Parse header
const header = lines[0].split(/[,;|\t]/).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
const codeIdx = header.findIndex(h => h.includes('code') || h.includes('ref') || h.includes('sku') || h.includes('article'));
const imgIdx = header.findIndex(h => h.includes('image') || h.includes('url') || h.includes('photo') || h.includes('lien'));

if (codeIdx === -1 || imgIdx === -1) {
  console.error('❌ Colonnes manquantes dans le CSV. Colonnes requises : "code" et "image" (ou "photo")');
  console.error('Colonnes détectées :', header);
  process.exit(1);
}

const mapCodeToImage = new Map();
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(/[,;|\t]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
  const code = parts[codeIdx]?.toUpperCase();
  const img = parts[imgIdx];
  if (code && img) {
    mapCodeToImage.set(code, img);
  }
}

console.log(`📦 ${mapCodeToImage.size} correspondances code -> image trouvées dans le CSV.`);

const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
let updatedCount = 0;

for (const art of articles) {
  const cleanCode = (art.code || '').toUpperCase();
  if (mapCodeToImage.has(cleanCode)) {
    art.image = mapCodeToImage.get(cleanCode);
    updatedCount++;
  }
}

fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
fs.writeFileSync(publicArticlesPath, JSON.stringify(articles, null, 2), 'utf8');

console.log(`✅ ${updatedCount} articles mis à jour avec leur photo spécifique.`);
