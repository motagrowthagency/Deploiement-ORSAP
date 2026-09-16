const fs = require('fs');
const path = require('path');

const batchCsv = `Nom de l'article,Prix TTC (MAD),URL image produit
CONE DE SIGNALISATION 30CM,39.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/432e95fb-2691-5441-8112-47356128d0a8/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
CONE DE SIGNALISATION H.70CM,260.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/432e95fb-2691-5441-8112-47356128d0a8/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
LAMPE DE SIGNALISATION DE CHANTIER AVEC 2 BATTERIES,296.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/3f587a8b-c474-5cdf-a463-3117b7a339a2/3d414715-705d-5584-9046-bd80869340f4.jpg
LAMPE DE SIGNALISATION DE CHANTIER REF.IL08,216.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/3f587a8b-c474-5cdf-a463-3117b7a339a2/3d414715-705d-5584-9046-bd80869340f4.jpg
RUBAN DE SIGNALISATION 100M,35.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7040f866-23b2-5baf-9c53-de567067bc1e/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
RUBAN DE SIGNALISATION 200M,42.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7040f866-23b2-5baf-9c53-de567067bc1e/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
RUBAN DE SIGNALISATION AUTO COLLANT,70.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7040f866-23b2-5baf-9c53-de567067bc1e/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
RUBAN DE SIGNALISATION 50X200,28.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7040f866-23b2-5baf-9c53-de567067bc1e/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
RUBAN DE SIGNALISATION ROUGE-BLANC 50MM - 100M,29.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7040f866-23b2-5baf-9c53-de567067bc1e/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
RUBAN DE SIGNALISATION ROUGE-BLANC 70MM - 100M,35.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7040f866-23b2-5baf-9c53-de567067bc1e/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
RUBAN DE SIGNALISATION DE 50X100 METRES,26.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7040f866-23b2-5baf-9c53-de567067bc1e/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
RUBAN DE SIGNALISATION DE 70X100 METRES,39.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7040f866-23b2-5baf-9c53-de567067bc1e/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
RUBAN SIGNALISATION ROUGE/BLANC 100M X 50MM,25.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7040f866-23b2-5baf-9c53-de567067bc1e/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
RUBAN SIGNALISATION JAUNE/NOIR 100M X 50MM,25.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7040f866-23b2-5baf-9c53-de567067bc1e/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg`;

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

// Read articles
const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

const preprocessedArticles = articles.map(a => ({
  art: a,
  norm: normalizeStr(a.designation),
  tokens: tokenize(a.designation),
  tokenSet: new Set(tokenize(a.designation))
}));

const lines = batchCsv.split(/\r?\n/).filter(l => l.trim().length > 0);
const items = lines.slice(1).map(line => {
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

let count = 0;
items.forEach(item => {
  if (!item.url || !item.url.startsWith('http')) return;

  // 1. Exact match
  let match = preprocessedArticles.find(p => p.norm === item.norm);

  // 2. Prefix or substring
  if (!match) {
    match = preprocessedArticles.find(p => p.norm.startsWith(item.norm) || item.norm.startsWith(p.norm));
  }

  // 3. Token containment
  if (!match && item.tokens.length > 0) {
    match = preprocessedArticles.find(p => item.tokens.every(t => p.tokenSet.has(t)));
  }

  // 4. Jaccard
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
    count++;
    match.art.image = item.url;
    console.log(`✅ Assigned: "${item.name}" -> ${match.art.designation} (${item.url.substring(0, 50)}...)`);
  } else {
    console.log(`⚠️ Not matched: "${item.name}"`);
  }
});

console.log(`\nMatched and updated ${count}/${items.length} items.`);

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

console.log(`✅ Catalogue data bundle successfully regenerated.`);
