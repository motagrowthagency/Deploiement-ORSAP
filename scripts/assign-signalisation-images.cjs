/**
 * ORSAP - Attribution des photos réelles sur fond blanc pur
 * pour la section SIGNALISATION ET SECURITE CHANTIER
 */

const fs = require('fs');
const path = require('path');

const articlesPath = path.join(__dirname, '../data/articles.json');
const publicArticlesPath = path.join(__dirname, '../public/data/articles.json');

const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

const SIGNALISATION_PHOTOS = {
  extincteur: "/images/categories/extincteur_incendie.jpg",
  cone: "/images/categories/cone_chantier.jpg",
  panneau: "/images/categories/panneau_signalisation.jpg",
  coffre: "/images/categories/coffre_fort_securite.jpg",
  ralentisseur: "/images/categories/ralentisseur_voirie.jpg"
};

let countProcessed = 0;
let reclassifiedLights = 0;

for (const art of articles) {
  const d = (art.designation || '').toUpperCase();

  // Reclassification des luminaires balises vers LUMINAIRE
  const isLight = d.includes('LED') || d.includes('220V') || d.includes('230V') || 
                  d.includes('IP44') || d.includes('IP54') || d.includes('IP65') || 
                  d.includes('E27') || d.includes('E14') || d.includes('G9') || 
                  d.includes('G5.3') || d.includes('MR16') || d.includes('HALO') || 
                  d.includes('APPARENT') || d.includes('JARDIN') || d.includes('WATT');

  if (art.rayon === 'SIGNALISATION ET SECURITE CHANTIER' && isLight && (d.includes('BALISE') || d.includes('BALISAGE'))) {
    art.rayon = 'LUMINAIRE';
    art.famille = 'Éclairage jardin & Balisage';
    reclassifiedLights++;
    continue;
  }

  if (art.rayon === 'SIGNALISATION ET SECURITE CHANTIER') {
    countProcessed++;

    // 1. Sécurité Incendie & Extincteurs
    if (d.includes('EXTINCTEUR') || d.includes('INCENDIE') || d.includes('ANTI-FEU') || d.includes('ANTI FEU') && d.includes('EXTINCT')) {
      art.famille = 'Sécurité Incendie & Extincteurs';
      art.image = SIGNALISATION_PHOTOS.extincteur;
    }
    // 2. Coffres-forts & Sécurité physique
    else if (d.includes('COFFRE') || d.includes('CAISSE A MONNAIE') || d.includes('SELECT ACCESS') || d.includes('ARME A FEU')) {
      art.famille = 'Coffres-forts & Sécurité physique';
      art.image = SIGNALISATION_PHOTOS.coffre;
    }
    // 3. Protection de voirie & Ralentisseurs
    else if (d.includes('RALENTISSEUR') || d.includes('DOS D\'ANE') || d.includes('PONT DE CROISEMENT') || d.includes('PASSE-CABLE') || d.includes('VOIRIE')) {
      art.famille = 'Protection de voirie & Ralentisseurs';
      art.image = SIGNALISATION_PHOTOS.ralentisseur;
    }
    // 4. Cônes & Balisage de chantier
    else if (d.includes('CONE') || d.includes('CÔNE') || d.includes('GRILLAGE') || d.includes('RUBALISE') || d.includes('RUBAN ADHESIF DE SECURITE')) {
      art.famille = 'Signalisation de chantier & Balisage';
      art.image = SIGNALISATION_PHOTOS.cone;
    }
    // 5. Panneaux de signalisation, chevalets & macarons
    else {
      art.famille = 'Signalisation de chantier & Balisage';
      art.image = SIGNALISATION_PHOTOS.panneau;
    }
  }
}

fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
fs.writeFileSync(publicArticlesPath, JSON.stringify(articles, null, 2), 'utf8');

console.log(`✅ ${countProcessed} articles dans 'SIGNALISATION ET SECURITE CHANTIER' assignés avec leurs photos réelles.`);
if (reclassifiedLights > 0) {
  console.log(`💡 ${reclassifiedLights} balises d'éclairage reclassées vers Luminaire.`);
}
