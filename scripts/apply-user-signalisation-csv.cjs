const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../data/signalisation_user_import.csv');
const articlesPath = path.join(__dirname, '../data/articles.json');
const publicArticlesPath = path.join(__dirname, '../public/data/articles.json');
const catalogueDataPath = path.join(__dirname, '../src/data/catalogueData.ts');

const STOP_WORDS = new Set(['de', 'du', 'la', 'le', 'les', 'des', 'et', 'en', 'pour', 'a', 'ou', 'avec', 'ref', 'sur', 'un', 'une']);

function normalizeStr(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/monaie/g, 'monnaie')
    .replace(/kgale/g, 'kg ale')
    .replace(/inteligent/g, 'intelligent')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(str) {
  if (!str) return [];
  return normalizeStr(str)
    .split(' ')
    .filter(t => t.length > 0 && !STOP_WORDS.has(t));
}

// Read CSV
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);

const csvItems = lines.slice(1).map(line => {
  const parts = line.split(',');
  const name = parts[0].trim();
  const price = parts[1] ? parts[1].trim() : '';
  const url = parts.slice(2).join(',').trim();
  return {
    name,
    price,
    url,
    norm: normalizeStr(name),
    tokens: tokenize(name)
  };
});

console.log(`Parsed ${csvItems.length} items from CSV.`);

// Read articles
const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

// Pre-tokenize articles
const preprocessedArticles = articles.map(a => ({
  art: a,
  norm: normalizeStr(a.designation),
  tokens: tokenize(a.designation),
  tokenSet: new Set(tokenize(a.designation))
}));

let matchedCount = 0;
let urlCount = 0;
let fallbackCount = 0;
const matchedArticlesSet = new Set();

function getFallbackImage(designation, famille) {
  const d = designation.toUpperCase();
  if (d.includes('COFFRE') || d.includes('CAISSE') || d.includes('CAISSETTE') || d.includes('SERRURE') || d.includes('MONNAIE')) {
    return '/images/categories/coffre_fort_securite.jpg';
  }
  if (d.includes('CLE') || d.includes('ARMOIRE') || d.includes('BOITE A CLE')) {
    return '/images/categories/armoire_cles.jpg';
  }
  if (d.includes('EXTINCTEUR') || d.includes('POUDRE') || d.includes('CO2') || d.includes('CROCHET') || d.includes('SUPPORT POUR EXTINCTEUR')) {
    return '/images/categories/extincteur_studio.jpg';
  }
  if (d.includes('DOS D ANE') || d.includes('PONT DE CROISEMENT') || d.includes('RALENTISSEUR') || d.includes('COIN POUR DOS')) {
    return '/images/categories/ralentisseur_voirie.jpg';
  }
  if (d.includes('PANNEAU') || d.includes('SIGNALISATION') || d.includes('MACARON') || d.includes('PLAQUE') || d.includes('TRIANGLE') || d.includes('TRIPIED') || d.includes('TOILETTES')) {
    return '/images/categories/panneau_chevalet.jpg';
  }
  if (d.includes('CONE')) {
    return '/images/categories/cone_signalisation.jpg';
  }
  return '/images/categories/cone_signalisation.jpg';
}

csvItems.forEach(item => {
  // 1. Exact match
  let match = preprocessedArticles.find(p => p.norm === item.norm);

  // 2. Prefix or substring
  if (!match) {
    match = preprocessedArticles.find(p => p.norm.startsWith(item.norm) || item.norm.startsWith(p.norm));
  }

  // 3. All CSV item tokens contained in article tokens
  if (!match && item.tokens.length > 0) {
    match = preprocessedArticles.find(p => item.tokens.every(t => p.tokenSet.has(t)));
  }

  // 4. Jaccard token similarity >= 0.7
  if (!match && item.tokens.length >= 2) {
    let bestScore = 0;
    let bestP = null;
    preprocessedArticles.forEach(p => {
      let common = 0;
      item.tokens.forEach(t => {
        if (p.tokenSet.has(t)) common++;
      });
      const score = common / item.tokens.length;
      if (score > bestScore && score >= 0.7) {
        bestScore = score;
        bestP = p;
      }
    });
    if (bestP) match = bestP;
  }

  if (match) {
    matchedCount++;
    matchedArticlesSet.add(match.art);
    if (item.url && item.url.startsWith('http')) {
      match.art.image = item.url;
      urlCount++;
    } else {
      match.art.image = getFallbackImage(match.art.designation, match.art.famille);
      fallbackCount++;
    }
  } else {
    console.log(`⚠️ Unmatched CSV item: "${item.name}"`);
  }
});

console.log(`\n================ SUMMARY ================`);
console.log(`Total CSV items: ${csvItems.length}`);
console.log(`Matched to articles: ${matchedCount}`);
console.log(`Assigned direct CDN URLs: ${urlCount}`);
console.log(`Assigned Studio Fallbacks: ${fallbackCount}`);

// Ensure all other articles in signalisation / securite families also have valid fallback images
const signalisationFamilles = [
  'Signalisation de chantier & Balisage',
  'Sécurité Incendie & Extincteurs',
  'Coffres-forts & Sécurité physique',
  'Protection de voirie & Ralentisseurs',
  'SIGNALISATION ET SECURITE CHANTIER'
];

articles.forEach(art => {
  if (signalisationFamilles.includes(art.famille) && !art.image) {
    art.image = getFallbackImage(art.designation, art.famille);
  }
});

// Save to disk
fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
fs.writeFileSync(publicArticlesPath, JSON.stringify(articles, null, 2), 'utf8');

// Compute facet counts accurately from articles
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

console.log(`\n✅ Successfully updated database and bundle files!`);
