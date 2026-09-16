/**
 * ORSAP - Attribution ultra-précise des photos par article
 * pour la section SIGNALISATION ET SECURITE CHANTIER
 */

const fs = require('fs');
const path = require('path');

const articlesPath = path.join(__dirname, '../data/articles.json');
const publicArticlesPath = path.join(__dirname, '../public/data/articles.json');

const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

const IMAGES = {
  extincteur: "/images/categories/extincteur_incendie.jpg",
  cone_balisage: "/images/categories/cone_chantier.jpg",
  panneau_chevalet: "/images/categories/panneau_signalisation.jpg",
  coffre_fort: "/images/categories/coffre_fort_securite.jpg",
  armoire_cles: "/images/categories/armoire_cles.jpg",
  ralentisseur: "/images/categories/ralentisseur_voirie.jpg"
};

let countTotal = 0;
let reclassifiedLights = 0;
const counts = {
  extincteur: 0,
  cone_balisage: 0,
  panneau_chevalet: 0,
  coffre_fort: 0,
  armoire_cles: 0,
  ralentisseur: 0
};

for (const art of articles) {
  const d = (art.designation || '').toUpperCase();

  // 1. Reclassification des luminaires balises vers LUMINAIRE
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
    countTotal++;

    // 1. Extincteurs (Priorité stricte aux appareils extincteurs)
    if (d.includes('EXTINCTEUR') || d.includes('EXTINCT')) {
      art.famille = 'Sécurité Incendie & Extincteurs';
      art.image = IMAGES.extincteur;
      counts.extincteur++;
    }
    // 2. Armoires à clés & Boîtes à clés
    else if (d.includes('ARMOIRE A CLE') || d.includes('BOITE A CLE') || d.includes('BOITE 20CLE') || 
             d.includes('BOITE 48') || d.includes('BOITE 96') || d.includes('BOITE 93') || 
             d.includes('ARMOIRE A CLES') || d.includes('CLES KB-')) {
      art.famille = 'Coffres-forts & Sécurité physique';
      art.image = IMAGES.armoire_cles;
      counts.armoire_cles++;
    }
    // 3. Coffres-forts, Caisses à monnaie, Armoires anti-feu
    else if (d.includes('COFFRE') || d.includes('CAISSE A MONNAIE') || d.includes('CAISSETTE') || 
             d.includes('CAISSE A MONAIE') || d.includes('SELECT ACCESS') || d.includes('ARME A FEU') || 
             d.includes('ANTI-FEU SENTRY') || d.includes('SERRURE POUR COFFRE')) {
      art.famille = 'Coffres-forts & Sécurité physique';
      art.image = IMAGES.coffre_fort;
      counts.coffre_fort++;
    }
    // 4. Ralentisseurs de voirie, Dos d'âne & Ponts de croisement
    else if (d.includes('RALENTISSEUR') || d.includes('DOS D\'ANE') || d.includes('DOS D\'ANES') || 
             d.includes('PONT DE CROISEMENT') || d.includes('PASSE-CABLE') || d.includes('VOIRIE')) {
      art.famille = 'Protection de voirie & Ralentisseurs';
      art.image = IMAGES.ralentisseur;
      counts.ralentisseur++;
    }
    // 5. Cônes, Balisage de chantier, Rubans & Chaînes de sécurité
    else if (d.includes('CONE') || d.includes('CÔNE') || d.includes('GRILLAGE') || 
             d.includes('RUBALISE') || d.includes('RUBAN') || d.includes('CHAINE DE SIGNALISATION') || 
             d.includes('POTEAU POUR CHAINE') || d.includes('SUPPORT POUR CHAINE') || d.includes('POTEAU DE SIGNALISATION')) {
      art.famille = 'Signalisation de chantier & Balisage';
      art.image = IMAGES.cone_balisage;
      counts.cone_balisage++;
    }
    // 6. Panneaux de signalisation, Chevalets, Macarons inox & Pictogrammes
    else {
      art.famille = 'Signalisation de chantier & Balisage';
      art.image = IMAGES.panneau_chevalet;
      counts.panneau_chevalet++;
    }
  }
}

fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
fs.writeFileSync(publicArticlesPath, JSON.stringify(articles, null, 2), 'utf8');

console.log(`✅ ${countTotal} articles dans 'SIGNALISATION ET SECURITE CHANTIER' passés en revue :`);
console.log(`   - 🧯 Extincteurs : ${counts.extincteur}`);
console.log(`   - 🔐 Coffres-forts & Sécurité : ${counts.coffre_fort}`);
console.log(`   - 🔑 Armoires à clés sécurisées : ${counts.armoire_cles}`);
console.log(`   - 🚧 Cônes & Balisage chantier : ${counts.cone_balisage}`);
console.log(`   - 🚸 Panneaux & Chevalets de sécurité : ${counts.panneau_chevalet}`);
console.log(`   - 🚗 Ralentisseurs de voirie : ${counts.ralentisseur}`);
if (reclassifiedLights > 0) {
  console.log(`💡 ${reclassifiedLights} balises d'éclairage reclassées vers Luminaire.`);
}
