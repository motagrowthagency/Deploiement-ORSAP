/**
 * ORSAP - Attribution des photos spécifiques sur fond blanc
 * pour la section ECHELLES ET ECHAFAUDAGES
 */

const fs = require('fs');
const path = require('path');

const articlesPath = path.join(__dirname, '../data/articles.json');
const publicArticlesPath = path.join(__dirname, '../public/data/articles.json');

const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

// High quality studio photography isolated on clean white background (Local high-res assets)
const ECHELLE_PHOTOS = {
  // Échelle coulissante à corde 2/3 plans
  coulissante_corde: "/images/categories/ladder_coulissante.jpg",
  
  // Échelle transformable 3 plans (3x7, 3x9, 3x10, 3x12, 3x14 marches)
  transformable_3p: "/images/categories/ladder_transformable.jpg",

  // Échelle transformable 2 plans (2x7, 2x9, 2x10, 2x12 marches)
  transformable_2p: "/images/categories/ladder_transformable.jpg",

  // Échelle simple droite en aluminium
  simple_droite: "/images/categories/ladder_coulissante.jpg",

  // Échelle télescopique compacte (2.60m, 3.80m, 4.40m)
  telescopique: "/images/categories/ladder_telescopique.jpg",

  // Échelle pliante articulée multifonction (3x4, 4x4, échafaudage/escabeau)
  pliante_articulee: "/images/categories/ladder_articulee.jpg",

  // Échafaudage roulant aluminium de chantier avec plancher & garde-corps
  echafaudage_roulant: "/images/categories/echafaudage_roulant.jpg",

  // Escabeau professionnel aluminium avec tablette porte-outils (3 à 8 marches)
  escabeau_alu: "/images/categories/escabeau_pro.jpg",

  // Marchepied pliable aluminium
  marchepied: "/images/categories/marchepied_folding.jpg"
};

let countEchelles = 0;
let reclassifiedCount = 0;

for (const art of articles) {
  const d = (art.designation || '').toUpperCase();

  // Nettoyage : Tuteurs de plantes avec mot échelle -> Jardinage
  if (d.includes('TUTEUR') || d.includes('PLANTE')) {
    art.rayon = 'JARDINAGE ET PLEIN AIR';
    art.famille = 'PLANTES';
    reclassifiedCount++;
    continue;
  }

  if (art.rayon === 'ECHELLES ET ECHAFAUDAGES') {
    countEchelles++;

    // 1. Échafaudages
    if (d.includes('ECHAFAUD') || d.includes('PLATE-FORME') || d.includes('PLATEFORME') || d.includes('TOUR ')) {
      art.famille = 'Échafaudages & Plates-formes';
      art.image = ECHELLE_PHOTOS.echafaudage_roulant;
    }
    // 2. Escabeaux & Marchepieds
    else if (d.includes('ESCABEAU')) {
      art.famille = 'Escabeaux & Marchepieds';
      art.image = ECHELLE_PHOTOS.escabeau_alu;
    }
    else if (d.includes('MARCHEPIED') || d.includes('MARCHE-PIED') || d.includes('TABOURET')) {
      art.famille = 'Escabeaux & Marchepieds';
      art.image = ECHELLE_PHOTOS.marchepied;
    }
    // 3. Échelles télescopiques
    else if (d.includes('TELESCOP') || d.includes('TÉLESCOP')) {
      art.famille = 'Échelles professionnelles';
      art.image = ECHELLE_PHOTOS.telescopique;
    }
    // 4. Échelles pliantes articulées multifonctions
    else if (d.includes('PLIANTE') || d.includes('ARTICULE') || d.includes('MULTIFONCTION') || d.includes('3X4') || d.includes('4X4')) {
      art.famille = 'Échelles professionnelles';
      art.image = ECHELLE_PHOTOS.pliante_articulee;
    }
    // 5. Échelles coulissantes à corde
    else if (d.includes('CORDE') || d.includes('CORDA') || d.includes('C-2P') || d.includes('C-3P')) {
      art.famille = 'Échelles professionnelles';
      art.image = ECHELLE_PHOTOS.coulissante_corde;
    }
    // 6. Échelles transformables 3 plans
    else if (d.includes('3P') || d.includes('3 PLANS') || d.includes('3 PLAN') || d.includes('TRSF-3P') || d.includes('X3')) {
      art.famille = 'Échelles professionnelles';
      art.image = ECHELLE_PHOTOS.transformable_3p;
    }
    // 7. Échelles transformables 2 plans
    else if (d.includes('2P') || d.includes('2 PLANS') || d.includes('TRANSF-2P') || d.includes('X2') || d.includes('DOUBLE')) {
      art.famille = 'Échelles professionnelles';
      art.image = ECHELLE_PHOTOS.transformable_2p;
    }
    // 8. Échelles simples
    else {
      art.famille = 'Échelles professionnelles';
      art.image = ECHELLE_PHOTOS.simple_droite;
    }
  }
}

fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf8');
fs.writeFileSync(publicArticlesPath, JSON.stringify(articles, null, 2), 'utf8');

console.log(`✅ ${countEchelles} articles dans 'ECHELLES ET ECHAFAUDAGES' assignés avec leurs photos réelles.`);
