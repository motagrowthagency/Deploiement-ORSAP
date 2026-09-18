const fs = require("fs");
const path = require("path");

const dataPath = path.resolve(__dirname, "../data/articles.json");
const publicDataPath = path.resolve(__dirname, "../public/data/articles.json");
const tsPath = path.resolve(__dirname, "../src/data/catalogueData.ts");

if (!fs.existsSync(dataPath)) {
  console.error("articles.json not found at", dataPath);
  process.exit(1);
}

const articles = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
console.log(`Analyzing ${articles.length} articles...`);

function normalizeRayonAndFamille(a) {
  const d = (a.designation || "").toUpperCase();
  const f = (a.famille || "").toUpperCase();
  const r = (a.rayon || "").toUpperCase();

  // 1. EPI - PROTECTION INDIVIDUELLE (Core ORSAP Specialty)
  if (
    d.includes("GANT") || d.includes("GANTS") ||
    d.includes("MASQUE") || d.includes("RESPIRATOIRE") || d.includes("DEMI-MASQUE") || d.includes("FILTRE A PARTICULES") ||
    d.includes("CASQUE") || d.includes("CASQUETTE DE SECURITE") || d.includes("JUGULAIRE") ||
    d.includes("LUNETTE") || d.includes("VISIERE") || d.includes("SUR-LUNETTES") || d.includes("ECRAN FACIAL") ||
    d.includes("CHAUSSURE") || d.includes("BOTTES") || d.includes("BOTTE") || d.includes("SEMELLE") || d.includes("SABOT") || d.includes("RANGERS") ||
    d.includes("COMBINAISON") || d.includes("BLOUSE") || d.includes("TABLIER") || d.includes("GILET") || d.includes("PARKA") || 
    d.includes("VESTE DE TRAVAIL") || d.includes("PANTALON DE TRAVAIL") || d.includes("SALOPETTE") || d.includes("HAUTE VISIBILITE") || 
    d.includes("RETROFLECHISSANT") || d.includes("BRASSARD") || d.includes("COUVRE-CHAUSSURE") ||
    d.includes("HARNAIS") || d.includes("BAUDRIER") || d.includes("ANTICHUTE") || d.includes("LONGE") || d.includes("MOUSQUETON") || d.includes("LIGNE DE VIE") ||
    d.includes("BOUCHON D OREILLE") || d.includes("BOUCHONS D OREILLES") || d.includes("ANTI BRUIT") || d.includes("SERRE-TETE") || d.includes("CASQUE ANTI-BRUIT") ||
    (f === "PROTECTION" && (r.includes("OUTILLAGE") || d.includes("PROTEGE") || d.includes("SECURITE")))
  ) {
    let sub = "Equipements de Protection";
    if (d.includes("GANT")) sub = "Protection des mains & Gants";
    else if (d.includes("CHAUSSURE") || d.includes("BOTTE") || d.includes("SEMELLE") || d.includes("SABOT")) sub = "Chaussures & Bottes de sécurité";
    else if (d.includes("CASQUE") || d.includes("CASQUETTE")) sub = "Protection de la tête & Casques";
    else if (d.includes("MASQUE") || d.includes("RESPIRATOIRE")) sub = "Protection respiratoire & Masques";
    else if (d.includes("LUNETTE") || d.includes("VISIERE")) sub = "Protection des yeux & Visières";
    else if (d.includes("BOUCHON") || d.includes("BRUIT") || d.includes("SERRE-TETE")) sub = "Protection auditive";
    else if (d.includes("HARNAIS") || d.includes("ANTICHUTE") || d.includes("LONGE") || d.includes("MOUSQUETON")) sub = "Harnais & Protection antichute";
    else if (d.includes("GILET") || d.includes("COMBINAISON") || d.includes("BLOUSE") || d.includes("PANTALON") || d.includes("HAUTE VISIBILITE")) sub = "Vêtements de travail & Haute visibilité";
    return { rayon: "PROTECTION ET SECURITE (EPI)", famille: sub };
  }

  // 2. SIGNALISATION, BALISAGE & SECURITE CHANTIER
  if (
    d.includes("SIGNALISATION") || d.includes("PANNEAU DE SECURITE") || d.includes("PANNEAU SECURITE") || d.includes("BALISE") || d.includes("BALISAGE") ||
    d.includes("RUBAN DE SECURITE") || d.includes("RUBAN ADHESIF DE SECURITE") || d.includes("EXTINCTEUR") || f === "COFFRES FORTS" || d.includes("COFFRE FORT") ||
    d.includes("CADENAS DE CONSIGNATION") || d.includes("CONSIGNATION") || d.includes("CÔNE") || d.includes("CONE DE CHANTIER") ||
    d.includes("PROTEGE PILIERS") || d.includes("DOS D ANES") || d.includes("DOS D'ANE") || d.includes("RALENTISSEUR") || d.includes("BATON LUMINEUSE") ||
    d.includes("CHAINE DE SIGNALISATION") || d.includes("POTEAU POUR CHAINE") || d.includes("TRIPIED POUR PANNEAU") || d.includes("MIROIR DE SECURITE")
  ) {
    let sub = "Signalisation de chantier & Balisage";
    if (d.includes("EXTINCTEUR") || d.includes("INCENDIE")) sub = "Sécurité Incendie & Extincteurs";
    else if (d.includes("CADENAS") || d.includes("CONSIGNATION")) sub = "Consignation & Verrouillage de sécurité";
    else if (d.includes("COFFRE")) sub = "Coffres-forts & Sécurité physique";
    else if (d.includes("RALENTISSEUR") || d.includes("DOS D") || d.includes("PROTEGE PILIER") || d.includes("MIROIR")) sub = "Protection de voirie & Ralentisseurs";
    return { rayon: "SIGNALISATION ET SECURITE CHANTIER", famille: sub };
  }

  // 3. ECHELLES & ECHAFAUDAGES
  if (
    d.includes("ECHELLE") || d.includes("ECHELLES") || d.includes("ECHAFAUDAGE") || d.includes("ESCABEAU") || d.includes("MARCHEPIED") || f === "ECHELLES ET ECHAFAUDAGE"
  ) {
    let sub = "Échelles professionnelles";
    if (d.includes("ECHAFAUDAGE")) sub = "Échafaudages & Plates-formes";
    else if (d.includes("MARCHEPIED") || d.includes("ESCABEAU")) sub = "Escabeaux & Marchepieds";
    return { rayon: "ECHELLES ET ECHAFAUDAGES", famille: sub };
  }

  // 4. LEVAGE, MANUTENTION & STOCKAGE
  if (
    f === "MANUTENTION" || d.includes("MANUTENTION") || d.includes("GERBEUR") || d.includes("TRANSPALETTE") || d.includes("CHARIOT") || d.includes("DIABLE") ||
    d.includes("ELINGUE") || d.includes("SANGLE D") || d.includes("SANGLE ARRIMAGE") || d.includes("PALAN") || d.includes("TREUIL") || d.includes("CRIC") ||
    f === "ROUX ET ROULETTES" || f === "CHAINES" || f === "CORDAGES" || d.includes("ROULETTE")
  ) {
    let sub = "Manutention & Chariots";
    if (d.includes("ELINGUE") || d.includes("SANGLE") || d.includes("PALAN") || d.includes("TREUIL") || d.includes("CRIC")) sub = "Levage & Arrimage (Élingues/Palans)";
    else if (f === "CHAINES" || d.includes("CHAINE")) sub = "Chaînes & Câbles de levage";
    else if (f === "CORDAGES" || d.includes("CORDE")) sub = "Cordages & Amarrage";
    else if (f === "ROUX ET ROULETTES" || d.includes("ROULETTE")) sub = "Roues & Roulettes industrielles";
    return { rayon: "LEVAGE ET MANUTENTION", famille: sub };
  }

  return { rayon: a.rayon || "DIVERS", famille: a.famille || "DIVERS" };
}

const rayonCounts = new Map();
const familleCounts = new Map();
const rawArticles = articles.filter(a => a.rayon !== "CONSEILS" && a.famille !== "POST");

const updatedArticles = rawArticles.map(a => {
  const norm = normalizeRayonAndFamille(a);
  const r = norm.rayon;
  const f = norm.famille;

  rayonCounts.set(r, (rayonCounts.get(r) || 0) + 1);

  const key = `${r}|||${f}`;
  const existing = familleCounts.get(key);
  if (existing) {
    existing.count++;
  } else {
    familleCounts.set(key, { name: f, rayon: r, count: 1 });
  }

  return {
    ...a,
    rayon: r,
    famille: f,
  };
});

// Desired priority order for Rayons (Safety / EPI & Core ORSAP at the top)
const priorityOrder = [
  "PROTECTION ET SECURITE (EPI)",
  "SIGNALISATION ET SECURITE CHANTIER",
  "ECHELLES ET ECHAFAUDAGES",
  "LEVAGE ET MANUTENTION",
  "OUTILLAGE ET RANGEMENT",
  "QUINCAILLERIE",
  "ELECTRICITE ET ECLAIRAGE",
  "DROGUERIE ET PEINTURE",
  "SANITAIRE ET ETANCHEITE",
  "LUMINAIRE",
  "JARDINAGE ET PLEIN AIR",
];

const facetsRayons = Array.from(rayonCounts.entries())
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => {
    const idxA = priorityOrder.indexOf(a.name);
    const idxB = priorityOrder.indexOf(b.name);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return b.count - a.count;
  });

const facetsFamilles = Array.from(familleCounts.values()).sort((a, b) => b.count - a.count);

const facets = {
  rayons: facetsRayons,
  familles: facetsFamilles,
};

console.log("\n=== NOUVELLES CATEGORIES ET RAYONS (ORDRE COMMERCIAL) ===");
facetsRayons.forEach(r => {
  console.log(`📌 ${r.name} (${r.count.toLocaleString("fr-FR")} articles)`);
});

// 1. Write data/articles.json
fs.writeFileSync(dataPath, JSON.stringify(updatedArticles, null, 2), "utf-8");
console.log(`\n✅ Saved to ${dataPath}`);

// 2. Write public/data/articles.json
const publicDir = path.dirname(publicDataPath);
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(publicDataPath, JSON.stringify(updatedArticles), "utf-8");
console.log(`✅ Saved to ${publicDataPath}`);

const tsContent = `export interface Article {
  code: string
  designation: string
  tva: number
  priceHt: number
  priceTtc: number
  rayon: string
  famille: string
  image?: string | null
  imageUrl?: string | null
}

export const DEFAULT_FACETS = ${JSON.stringify(facets)};

export const ALL_ARTICLES: Article[] = ${JSON.stringify(updatedArticles)};
`;

fs.writeFileSync(tsPath, tsContent, "utf-8");
console.log(`✅ Saved updated catalogue data to ${tsPath}`);
