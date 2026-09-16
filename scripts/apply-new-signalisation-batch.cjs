const fs = require('fs');
const path = require('path');

const newCsvContent = `Nom de l’article,Prix TTC (MAD),URL image produit
RUBAN ADHESIF DE SECURITE ROUGE (VOID) 45MMX10M,60.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/c1a89965-379a-5e98-8548-a5909aa9dfd4/7f31a3c9-4b73-501f-9356-23b21e091604.jpg
PANNEAU SECURITE NETTOYAGE (SOL HUMIDE),79.00,https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e7db61981ec84c3b4a3f072a7a2e1899c9fb06c6e917b18a970100590d3303cc0e93897643b2ac32bc193331c342d463746f8ede3228733faec55e30939ba6038bc70b1335ba9958b56c6e08286180c84c2a70dec
EXTINCTEURS 6KGS,629.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/f870331f-4db5-586d-a50e-1f5f078bc7a3/19fff8e5-c8d2-5bcc-b34c-43e2ef28b80a.jpg
EXTINCTEUR CO2 6KG,1399.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/f870331f-4db5-586d-a50e-1f5f078bc7a3/19fff8e5-c8d2-5bcc-b34c-43e2ef28b80a.jpg
CONE DE SIGNALISATION 50CM,65.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/432e95fb-2691-5441-8112-47356128d0a8/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
RUBAN DE SIGNALISATION 100M,35.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7040f866-23b2-5baf-9c53-de567067bc1e/bf963c3b-de93-5d8e-9ead-ba99b79dfe4b.jpg
LAMPE DE SIGNALISATION DE CHANTIER AVEC 2 BATTERIES,296.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/3f587a8b-c474-5cdf-a463-3117b7a339a2/3d414715-705d-5584-9046-bd80869340f4.jpg
ARMOIRE A CLES 100 CLES,539.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/c8f15b10-3186-5659-8849-0c4af8e13340/19fff8e5-c8d2-5bcc-b34c-43e2ef28b80a.jpg
COFFRE FORT INTELLIGENT SAFWELL TC-195JA,999.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/71650049-3d8d-5e2a-b955-686a3645bec0/85f3b98f-e456-5087-921e-d0501c5dbf35.jpg
COFFRE FORT POUR ARMES A FEU SENTRY E1459E,6699.00,https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e8d85ebcb1b3a4211bffa73fcd3cd250052ad3ffbaa50350e23db751c4b8213f0dfdd9f804c102346a1946e0122ee8fe46e73e1312e164b
SUPPORT AU SOL POUR EXTINCTEUR POUDRE OU EAU 6KG ET 9KG,465.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/b4b796e6-8c36-52df-91b4-c11c91e80583/5d1fb866-bea0-5de5-ac1d-53dcaffcdca5.jpg
DOS D ANES 1M,445.00,https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e8c6db52e52222f63a994899202bee5e4a68a250bc0dbb593c5c4da5f492b6ee844c2c747a6991fd5f519529b4f7a0659872b246a4e495
BALISAGE (GRILLAGE LARGEUR 1M) 50M,785.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/3f64fab2-5402-5ef5-9f42-defae649a8fc/8c3a3e07-c0c2-5082-b55c-3feb1de096dc.jpg
PANNEAU DE SECURITE SOL GLISSANT,79.00,https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e7db61981ec84c3b4a3f072a7a2e1899c9fb06c6e917b18a970100590d3303cc0e93897643b2ac32bc193331c342d463746f8ede3228733faec55e30939ba6038bc70b1335ba9958b56c6e08286180c84c2a70dec`;

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

// Pre-tokenize articles
const preprocessedArticles = articles.map(a => ({
  art: a,
  norm: normalizeStr(a.designation),
  tokens: tokenize(a.designation),
  tokenSet: new Set(tokenize(a.designation))
}));

const lines = newCsvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
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

let matched = 0;
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
    matched++;
    match.art.image = item.url;
    console.log(`✅ Applied: "${item.name}" -> ${match.art.designation} (${item.url.substring(0, 60)}...)`);
  } else {
    console.log(`⚠️ Not matched: "${item.name}"`);
  }
});

console.log(`\nUpdated ${matched} items directly with new user URLs.`);

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
