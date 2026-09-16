const fs = require('fs');
const path = require('path');

const batchCsv = `Référence OR,Nom de l’article,Prix TTC (MAD),URL image produit
OR107841,COFFRE FORT DE SECURITE 610X390X390MM REF. ACS-7,5560.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/a25a9167-bbfd-5b12-9d30-0e915a3c92ac/09673c47-08f7-52ee-9ece-e18113d39bcd.jpg
OR107842,COFFRE FORT DE SECURITE 700X550X486MM REF. ACS-8,7375.00,https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e7db61981ec84c3b4a3f072a7a2e1899c9fb06c6e3f151be9112be73d593036f7bd3d819123fcaa365679f4be107f472af042b872c948f1454cfd3640110ce4d57f4328b095e0f9a0f6e608562cbcefa7bd79c4ae
OR107843,COFFRE FORT DE SECURITE 950X550X486MM REF. ACS-9,8629.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/a25a9167-bbfd-5b12-9d30-0e915a3c92ac/09673c47-08f7-52ee-9ece-e18113d39bcd.jpg
OR35688,COFFRE FORT A CLE 163X286X213 MM-6.8 KG,520.00,https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e7db61981ec84c3b4a3f072a7a2e1899c9fb06c6eb8f7e49f04f8cfee8437920570ca5432594016359567a0f1b9e5ea789b6b6abfc4800e932e6ae9a61ae8e317fa86ca154d3736083fb5faea93af78e36c14e3b0
OR57202,COFFRE FORT ANTI-FEU SENTRY REF EF3428E,6499.00,https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e7db61981ec84c3b4a3f072a7a2e1899c9fb06c6e55b701e2d477782d40c937c93924a3c2947d74f50b8f5824d25dde3ccb6c7f8547fc8858541f5d6e109d388ccc1a864c81297f09c6aec30a9e99395a60549715
OR70620,COFFRET ANTI-FEU SENTRY REF 1200,249.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/4d3063a2-ea2d-5d17-a646-373e56eea9dd/7c7ff811-149f-51e7-b23d-7da89ff9d512.jpg
OR95975,COFFRET SELECT ACCESS MASTERLOCK REF.5412 EURD,569.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/4d3063a2-ea2d-5d17-a646-373e56eea9dd/7c7ff811-149f-51e7-b23d-7da89ff9d512.jpg
OR101214,COFFRET SELECT ACCESS MASTERLOCK REF - 5415EURD,599.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/4d3063a2-ea2d-5d17-a646-373e56eea9dd/7c7ff811-149f-51e7-b23d-7da89ff9d512.jpg
OR104600,ETIQUETTE BALISAGE,3.72,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/608c34c8-f551-5e53-9676-081eb5964296/a69c50b3-59ce-58ef-816e-abf5def34122.jpg
OR104601,CROCHETS BALISAGE,37.20,https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e7db61981ec84c3b4a3f072a7a2e1899c9fb06c6ea5daaf3b66002fc9a7d40869799fda20e8c4a7b18c73f6efc70bde3dc02402cb190d963643d06426d1116ae7b647cf2c89f88f3ba086e129e4aeacb39e76cdc5
OR44478,SIGNALISATION HOMME INOX 100X100X1.5MM REF.SP001,39.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/8a5040d0-7f13-59f4-9b7b-e3074d578d96/a69c50b3-59ce-58ef-816e-abf5def34122.jpg
OR44480,SIGNALISATION HANDICAPE INOX 76X1.5MM REF.SP007,39.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/8a5040d0-7f13-59f4-9b7b-e3074d578d96/a69c50b3-59ce-58ef-816e-abf5def34122.jpg
OR101899,MACARON DE SIGNALISATION HOMME B007905/B007906,15.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/093e9f11-5949-5d3a-8e19-8a4532c4dedd/6143fc3a-3876-57b7-88b6-7cdf15895113.jpg
OR101900,MACARON DE SIGNALISATION FEMME B007905/B007906,15.00,https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e7db61981ec84c3b4a3f072a7a2e1899c9fb06c6ed1aafd2503eca8c621993886a22d5554124498b901fc0522c45fdeb96a2aa264061373faba842e6dcce9ef9dc3953b61f02121d3985291f9457274f3afd5d3bf
OR101901,MACARON DE SIGNALISATION INTERDIT DE FUMER B007905/B007906,15.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/8699f999-5998-535c-9bb8-b79512330b48/10f1907b-2567-564d-b1ad-0ade96af1083.jpg
OR101902,MACARON DE SIGNALISATION WC B007905/B007906,15.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/cbd65fab-6624-5e9f-a9ef-4bea88827a01/9f399b24-922d-580c-8aa4-9632e6b294b2.jpg
OR101903,MACARON DE SIGNALISATION POUBELLE B007905/B007906,15.00,https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e7db61981ec84c3b4a3f072a7a2e1899c9fb06c6edec3987dd2e40d523e6ff274bb59c1f888e56faf15a84e3fa1d0445c0e7a3bf3db76822508d199cb55d7671a5c93b296df5be3791b77de437085feeaa93b462e
OR101904,MACARON DE SIGNALISATION HANDICAPE B007905/B007906,10.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/8a5040d0-7f13-59f4-9b7b-e3074d578d96/a69c50b3-59ce-58ef-816e-abf5def34122.jpg
OR101905,MACARON DE SIGNALISATION TELEPHONE INTERDIT B007905/B007906,15.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/e58191ee-db34-55b1-ac41-735eaa1efafe/88db8e19-69db-53bd-bfec-3008f8f2a3b8.jpg
OR101906,MACARON DE SIGNALISATION SOL GLISSANT B007905/B007906,15.00,https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e7db61981ec84c3b4a3f072a7a2e1899c9fb06c6ef37c36b96a6a37440e4521872e15b287a857f16168a1ef704b5c16108e5c47f122304567f6a38612e7009c74efbcb7fd1592b405acf5e62af079d128795c3559
OR101907,MACARON DE SIGNALISATION NE PAS TOUCHER B007905/B007906,10.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/75d20b47-e935-5378-b04e-395e768cfdbc/a69c50b3-59ce-58ef-816e-abf5def34122.jpg
OR57027,SIGNALISATION TOILETTES FEMMES REF.DB182-F,12.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/cbd65fab-6624-5e9f-a9ef-4bea88827a01/9f399b24-922d-580c-8aa4-9632e6b294b2.jpg
OR57028,SIGNALISATION TOILETTES HOMMES REF.DB182-H,12.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/cbd65fab-6624-5e9f-a9ef-4bea88827a01/9f399b24-922d-580c-8aa4-9632e6b294b2.jpg
OR57029,SIGNALISATION TOILETTES REF.DB182-WC,12.00,https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/cbd65fab-6624-5e9f-a9ef-4bea88827a01/9f399b24-922d-580c-8aa4-9632e6b294b2.jpg`;

const articlesPath = path.join(__dirname, '../data/articles.json');
const publicArticlesPath = path.join(__dirname, '../public/data/articles.json');
const catalogueDataPath = path.join(__dirname, '../src/data/catalogueData.ts');

const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

const lines = batchCsv.split(/\r?\n/).filter(l => l.trim().length > 0);
let matched = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const parts = line.split(',');
  const code = parts[0].trim();
  const name = parts[1].trim();
  const price = parts[2] ? parts[2].trim() : '';
  const url = parts.slice(3).join(',').trim();

  if (!url || !url.startsWith('http')) continue;

  // Find article by exact code OR designation
  let art = articles.find(a => (a.code && a.code.toUpperCase() === code.toUpperCase()) || (a.code_article && a.code_article.toUpperCase() === code.toUpperCase()));
  
  if (!art) {
    art = articles.find(a => a.designation.toUpperCase().includes(name.toUpperCase()) || name.toUpperCase().includes(a.designation.toUpperCase()));
  }

  if (art) {
    art.image = url;
    matched++;
    console.log(`✅ [${code}] ${art.designation} -> ${url.substring(0, 60)}...`);
  } else {
    console.log(`⚠️ Could not find article for [${code}] "${name}"`);
  }
}

console.log(`\nMatched and updated ${matched}/${lines.length - 1} items.`);

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

console.log('✅ Catalogue data bundle successfully regenerated.');
