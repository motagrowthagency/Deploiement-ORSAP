const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../data/jardin_user_import.csv');
const articlesPath = path.join(__dirname, '../data/articles.json');
const publicArticlesPath = path.join(__dirname, '../public/data/articles.json');
const catalogueDataPath = path.join(__dirname, '../src/data/catalogueData.ts');

const STOP_WORDS = new Set(['de', 'du', 'la', 'le', 'les', 'des', 'et', 'en', 'pour', 'a', 'ou', 'avec', 'ref', 'sur', 'un', 'une', 'cm', 'mm', 'm', 'kg', 'mad']);

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

function normalizeStr(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(str) {
  return normalizeStr(str).split(' ').filter(t => t.length > 0 && !STOP_WORDS.has(t));
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

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);

const csvItems = lines.slice(1).map(line => {
  const parts = parseCSVLine(line);
  const order = parts[0];
  const url = parts[1];
  const name = parts[2] ? parts[2].trim() : '';
  const price = parts[3] ? parts[3].trim() : '';
  const photo = parts[parts.length - 1] ? parts[parts.length - 1].trim() : '';
  const { priceTtc, priceHt } = parsePrice(price);
  
  let famille = 'DECORATION JARDIN';
  if (url.includes('meubles-exterieur')) {
    famille = 'MEUBLES EXTERIEUR';
  } else if (url.includes('parasols-et-voiles-d-ombrage')) {
    famille = name.toUpperCase().includes('PARASOL') ? 'MEUBLES EXTERIEUR' : 'DECORATION JARDIN';
  } else if (url.includes('decoration-jardin')) {
    famille = 'DECORATION JARDIN';
  }

  // Extract sku number from image url if available
  const matchId = photo.match(/\/([0-9]{4,8})[_\.\-]/);
  const skuFromUrl = matchId ? matchId[1] : null;

  return {
    order,
    categoryUrl: url,
    name,
    priceStr: price,
    priceTtc,
    priceHt,
    photo,
    famille,
    skuFromUrl,
    norm: normalizeStr(name),
    tokens: tokenize(name),
    tokenSet: new Set(tokenize(name))
  };
}).filter(item => item.name && item.photo);

console.log(`Processing ${csvItems.length} items from CSV...`);

const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

// Track existing codes
const existingCodes = new Set(articles.map(a => (a.code || '').toUpperCase()));
const artByNum = new Map();
articles.forEach(a => {
  const num = (a.code || '').replace(/[^0-9]/g, '');
  if (num) {
    artByNum.set(num, a);
    artByNum.set(num.replace(/^0+/, ''), a);
  }
});

const preprocessed = articles.map(a => ({
  art: a,
  norm: normalizeStr(a.designation),
  tokens: tokenize(a.designation),
  tokenSet: new Set(tokenize(a.designation))
}));

const usedArticles = new Set();
let updatedCount = 0;
let createdCount = 0;

let nextNumericId = 1013000;
articles.forEach(a => {
  const m = (a.code || '').match(/^OR(\d+)$/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= nextNumericId) nextNumericId = n + 1;
  }
});

csvItems.forEach(item => {
  let matchedArt = null;

  // 1. Try match by SKU in image URL
  if (item.skuFromUrl) {
    const rawNum = item.skuFromUrl;
    const cleanNum = rawNum.replace(/^0+/, '');
    if (artByNum.has(rawNum) && !usedArticles.has(artByNum.get(rawNum))) {
      matchedArt = artByNum.get(rawNum);
    } else if (artByNum.has(cleanNum) && !usedArticles.has(artByNum.get(cleanNum))) {
      matchedArt = artByNum.get(cleanNum);
    }
  }

  // 2. Try exact name match in JARDINAGE ET PLEIN AIR
  if (!matchedArt) {
    const p = preprocessed.find(p => !usedArticles.has(p.art) && p.art.rayon === 'JARDINAGE ET PLEIN AIR' && p.norm === item.norm);
    if (p) matchedArt = p.art;
  }

  // 3. Try exact name match in any rayon
  if (!matchedArt) {
    const p = preprocessed.find(p => !usedArticles.has(p.art) && p.norm === item.norm);
    if (p) matchedArt = p.art;
  }

  // 4. Try fuzzy match in JARDINAGE ET PLEIN AIR
  if (!matchedArt && item.tokens.length >= 2) {
    let bestScore = 0;
    let bestP = null;
    preprocessed.filter(p => p.art.rayon === 'JARDINAGE ET PLEIN AIR' && !usedArticles.has(p.art)).forEach(p => {
      let common = 0;
      item.tokens.forEach(t => { if (p.tokenSet.has(t)) common++; });
      const score = common / Math.max(item.tokens.length, p.tokens.length);
      if (score > bestScore && score >= 0.7) {
        bestScore = score;
        bestP = p;
      }
    });
    if (bestP) matchedArt = bestP.art;
  }

  if (matchedArt) {
    usedArticles.add(matchedArt);
    matchedArt.image = item.photo;
    if (item.priceTtc > 0) {
      matchedArt.priceTtc = item.priceTtc;
      matchedArt.priceHt = item.priceHt;
    }
    if (!matchedArt.rayon || matchedArt.rayon === 'DIVERS') {
      matchedArt.rayon = 'JARDINAGE ET PLEIN AIR';
      matchedArt.famille = item.famille;
    }
    updatedCount++;
  } else {
    // Create new article entry
    let newCode = '';
    if (item.skuFromUrl) {
      const candidateCode = `OR${item.skuFromUrl.replace(/^0+/, '')}`;
      if (!existingCodes.has(candidateCode.toUpperCase())) {
        newCode = candidateCode;
      }
    }
    if (!newCode) {
      while (existingCodes.has(`OR${nextNumericId}`)) {
        nextNumericId++;
      }
      newCode = `OR${nextNumericId}`;
      nextNumericId++;
    }

    existingCodes.add(newCode.toUpperCase());

    const newArticle = {
      code: newCode,
      designation: item.name,
      tva: 20,
      priceHt: item.priceHt,
      priceTtc: item.priceTtc,
      rayon: 'JARDINAGE ET PLEIN AIR',
      famille: item.famille,
      image: item.photo
    };

    articles.push(newArticle);
    createdCount++;
  }
});

console.log(`\n================ SUMMARY ================`);
console.log(`Total CSV items: ${csvItems.length}`);
console.log(`Updated existing articles: ${updatedCount}`);
console.log(`Created new articles: ${createdCount}`);
console.log(`Total articles in DB now: ${articles.length}`);

// Write updated JSON files
fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
fs.writeFileSync(publicArticlesPath, JSON.stringify(articles, null, 2), 'utf8');

// Compute facets
const rayonCountMap = {};
const familleCountMap = {};

articles.forEach(a => {
  const r = a.rayon || 'AUTRE';
  rayonCountMap[r] = (rayonCountMap[r] || 0) + 1;
  
  const f = a.famille || 'DIVERS';
  const key = `${r}___${f}`;
  if (!familleCountMap[key]) {
    familleCountMap[key] = { name: f, count: 0, rayon: r };
  }
  familleCountMap[key].count++;
});

const defaultFacets = {
  rayons: Object.entries(rayonCountMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  familles: Object.values(familleCountMap).sort((a, b) => b.count - a.count)
};

const tsContent = `// Auto-generated catalogue data
import { Article, Facets } from "@/utils/catalogueClient";

export type { Article, Facets };

export const ALL_ARTICLES: Article[] = ${JSON.stringify(articles, null, 2)};
export const CATALOGUE_ARTICLES: Article[] = ALL_ARTICLES;
export const DEFAULT_FACETS: Facets = ${JSON.stringify(defaultFacets, null, 2)};
`;
fs.writeFileSync(catalogueDataPath, tsContent, 'utf8');

console.log(`\n✅ Database files and catalogueData.ts successfully updated!`);
