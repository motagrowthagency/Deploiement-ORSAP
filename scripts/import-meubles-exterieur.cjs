const fs = require('fs');
const path = require('path');

const meublesCsvPath = path.join(__dirname, '../data/meubles_exterieur_user_import.csv');
const jardinCsvPath = path.join(__dirname, '../data/jardin_user_import.csv');
const signalisationCsvPath = path.join(__dirname, '../data/signalisation_user_import.csv');
const articlesPath = path.join(__dirname, '../data/articles.json');
const publicArticlesPath = path.join(__dirname, '../public/data/articles.json');

function parsePrice(priceStr) {
  if (!priceStr) return { priceTtc: 0, priceHt: 0 };
  const cleaned = priceStr
    .replace(/\s+/g, '')
    .replace(/MAD/gi, '')
    .replace(/\u00a0/g, '') // non-breaking space
    .replace(/ /g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');
  const ttc = parseFloat(cleaned) || 0;
  const ht = Math.round((ttc / 1.2) * 100) / 100;
  return { priceTtc: ttc, priceHt: ht };
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function normalizeStr(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('Reading data files...');
const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
const existingCodes = new Set(articles.map(a => a.code));

// Find next available code number
let nextCodeNum = 90001;
articles.forEach(a => {
  const m = a.code && a.code.match(/^OR(\d+)$/);
  if (m) {
    const num = parseInt(m[1], 10);
    if (num >= nextCodeNum) {
      nextCodeNum = num + 1;
    }
  }
});

function getNextCode(sku) {
  if (sku && !existingCodes.has(sku)) {
    existingCodes.add(sku);
    return sku;
  }
  let code = `OR${nextCodeNum++}`;
  while (existingCodes.has(code)) {
    code = `OR${nextCodeNum++}`;
  }
  existingCodes.add(code);
  return code;
}

// ── 1. Process Meubles Exterieur CSV (Primary Target) ──
const meublesContent = fs.readFileSync(meublesCsvPath, 'utf8');
const meublesLines = meublesContent.split(/\r?\n/).filter(l => l.trim().length > 0);

console.log(`Processing ${meublesLines.length - 1} outdoor furniture products...`);

let matchedMeubles = 0;
let addedMeubles = 0;

for (let i = 1; i < meublesLines.length; i++) {
  const row = parseCSVLine(meublesLines[i]);
  if (row.length < 5) continue;

  const designation = (row[3] || '').trim();
  const priceStr = (row[4] || '').trim();
  const brand = (row[6] || '').trim();
  const photo = (row[row.length - 1] || '').trim();

  if (!designation) continue;

  const { priceTtc, priceHt } = parsePrice(priceStr);
  const norm = normalizeStr(designation);

  // Extract sku number from image url if available (e.g. /122817_copie.png or /108564_mdf.jpg)
  const matchId = photo.match(/\/([0-9]{5,8})[_\.\-]/);
  const potentialSku = matchId ? `BR${matchId[1]}` : null;

  // Search by exact photo OR (exact norm + price match) OR exact SKU
  let found = articles.find(a => a.imageUrl === photo || a.image === photo);
  if (!found && potentialSku) {
    found = articles.find(a => a.code === potentialSku);
  }
  if (!found) {
    found = articles.find(a => normalizeStr(a.designation) === norm && Math.abs((a.priceTtc || 0) - priceTtc) < 1.0);
  }

  if (found) {
    found.designation = designation;
    found.priceTtc = priceTtc || found.priceTtc;
    found.priceHt = priceHt || found.priceHt;
    found.tva = 20;
    found.rayon = 'JARDINAGE ET PLEIN AIR';
    found.famille = 'MEUBLES EXTERIEUR';
    if (brand) found.brand = brand;
    found.imageUrl = photo;
    found.image = photo;
    matchedMeubles++;
  } else {
    // Create new distinct article
    const newCode = getNextCode(potentialSku);
    const newArticle = {
      code: newCode,
      designation: designation,
      tva: 20,
      priceHt: priceHt,
      priceTtc: priceTtc,
      rayon: 'JARDINAGE ET PLEIN AIR',
      famille: 'MEUBLES EXTERIEUR',
      imageUrl: photo,
      image: photo,
    };
    if (brand) newArticle.brand = brand;
    articles.push(newArticle);
    addedMeubles++;
  }
}

console.log(`✅ Meubles exterieur: ${matchedMeubles} matched/updated, ${addedMeubles} newly added.`);

// ── 2. Also attach images from Jardin & Signalisation CSVs if matching ──
if (fs.existsSync(jardinCsvPath)) {
  const jardinLines = fs.readFileSync(jardinCsvPath, 'utf8').split(/\r?\n/).filter(l => l.trim().length > 0);
  let jardinCount = 0;
  for (let i = 1; i < jardinLines.length; i++) {
    const row = parseCSVLine(jardinLines[i]);
    const name = (row[2] || '').trim();
    const photo = (row[row.length - 1] || '').trim();
    if (!name || !photo || !photo.startsWith('http')) continue;

    const norm = normalizeStr(name);
    const found = articles.find(a => normalizeStr(a.designation) === norm);
    if (found && !found.imageUrl) {
      found.imageUrl = photo;
      found.image = photo;
      jardinCount++;
    }
  }
  console.log(`🌿 Jardin CSV: ${jardinCount} additional images attached.`);
}

if (fs.existsSync(signalisationCsvPath)) {
  const sigLines = fs.readFileSync(signalisationCsvPath, 'utf8').split(/\r?\n/).filter(l => l.trim().length > 0);
  let sigCount = 0;
  for (let i = 1; i < sigLines.length; i++) {
    const row = parseCSVLine(sigLines[i]);
    const name = (row[2] || '').trim();
    const photo = (row[row.length - 1] || '').trim();
    if (!name || !photo || !photo.startsWith('http')) continue;

    const norm = normalizeStr(name);
    const found = articles.find(a => normalizeStr(a.designation) === norm);
    if (found && !found.imageUrl) {
      found.imageUrl = photo;
      found.image = photo;
      sigCount++;
    }
  }
  console.log(`🚧 Signalisation CSV: ${sigCount} additional images attached.`);
}

console.log(`📦 Total articles in catalogue: ${articles.length}`);
const totalWithImages = articles.filter(a => a.imageUrl || a.image).length;
console.log(`🖼️ Total articles with valid images: ${totalWithImages}`);

fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
console.log(`Saved to ${articlesPath}`);

if (fs.existsSync(path.dirname(publicArticlesPath))) {
  fs.writeFileSync(publicArticlesPath, JSON.stringify(articles, null, 2), 'utf8');
  console.log(`Saved to ${publicArticlesPath}`);
}
