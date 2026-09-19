const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../data/meubles_exterieur_user_import.csv');
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
const articlesByNorm = new Map();
articles.forEach((a, idx) => {
  const norm = normalizeStr(a.designation);
  if (norm && !articlesByNorm.has(norm)) {
    articlesByNorm.set(norm, idx);
  }
});

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);

// Find max numeric code in range 80000..89999 for new outdoor furniture items
let nextCodeNum = 80001;
articles.forEach(a => {
  const m = a.code && a.code.match(/^OR(\d+)$/);
  if (m) {
    const num = parseInt(m[1], 10);
    if (num >= 80000 && num < 90000 && num >= nextCodeNum) {
      nextCodeNum = num + 1;
    }
  }
});

let addedCount = 0;
let updatedCount = 0;

for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
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

  let existingIdx = -1;

  if (potentialSku && existingCodes.has(potentialSku)) {
    existingIdx = articles.findIndex(a => a.code === potentialSku);
  } else if (articlesByNorm.has(norm)) {
    existingIdx = articlesByNorm.get(norm);
  }

  if (existingIdx !== -1) {
    // Update existing article
    const target = articles[existingIdx];
    target.designation = designation;
    target.priceTtc = priceTtc || target.priceTtc;
    target.priceHt = priceHt || target.priceHt;
    target.tva = 20;
    target.rayon = 'JARDINAGE ET PLEIN AIR';
    target.famille = 'MEUBLES EXTERIEUR';
    if (brand) target.brand = brand;
    if (photo) {
      target.imageUrl = photo;
      target.image = photo;
    }
    updatedCount++;
  } else {
    // Add new article
    let newCode = potentialSku && !existingCodes.has(potentialSku) ? potentialSku : `OR${nextCodeNum++}`;
    while (existingCodes.has(newCode)) {
      newCode = `OR${nextCodeNum++}`;
    }
    existingCodes.add(newCode);

    const newArticle = {
      code: newCode,
      designation: designation,
      tva: 20,
      priceHt: priceHt,
      priceTtc: priceTtc,
      rayon: 'JARDINAGE ET PLEIN AIR',
      famille: 'MEUBLES EXTERIEUR',
    };
    if (brand) newArticle.brand = brand;
    if (photo) {
      newArticle.imageUrl = photo;
      newArticle.image = photo;
    }

    articles.push(newArticle);
    articlesByNorm.set(norm, articles.length - 1);
    addedCount++;
  }
}

console.log(`✅ Import finished: ${addedCount} articles added, ${updatedCount} articles updated.`);
console.log(`📦 Total articles now: ${articles.length}`);

fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
console.log(`Saved to ${articlesPath}`);

if (fs.existsSync(path.dirname(publicArticlesPath))) {
  fs.writeFileSync(publicArticlesPath, JSON.stringify(articles, null, 2), 'utf8');
  console.log(`Saved to ${publicArticlesPath}`);
}
