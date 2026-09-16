/**
 * ORSAP Product Imagery Engine
 * Hyper-granular, pure white-background (#ffffff) studio photography
 * matching exact product types, designations, references, and taxonomy.
 * Supports Option 1 (local SKU files in public/images/products/[CODE].jpg)
 * and Option 2 (direct custom image URLs).
 */

export interface ProductImageInfo {
  url: string
  primaryUrl: string
  fallbackUrl: string
  alt: string
  label: string
  hasCustomImage: boolean
}

// Curated high-definition studio shots isolated on pure white background (#ffffff)
const WHITE_BG: Record<string, string> = {
  // === ADHESIFS & ABRASIFS ===
  adhesif_rouleau: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&h=600&q=80",
  toile_emeri: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&h=600&q=80",
  disque_abrasif: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&h=600&q=80",

  // === EPI & PROTECTION INDIVIDUELLE ===
  chaussures_hautes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&h=600&q=80",
  chaussures_basses: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&h=600&q=80",
  bottes_chantier: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&h=600&q=80",
  gants_nitrile: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&h=600&q=80",
  gants_cuir: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&h=600&q=80",
  casque_chantier: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&h=600&q=80",
  masque_ffp: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&h=600&q=80",
  masque_cartouche: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&h=600&q=80",
  lunettes_protection: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&h=600&q=80",
  harnais_securite: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&h=600&q=80",
  gilet_fluo: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&h=600&q=80",
  combinaison_travail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&h=600&q=80",
  casque_antibruit: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&h=600&q=80",

  // === SIGNALISATION & SECURITE CHANTIER ===
  extincteur_poudre: "/images/categories/extincteur_incendie.jpg",
  cone_signalisation: "/images/categories/cone_chantier.jpg",
  panneau_chantier: "/images/categories/panneau_signalisation.jpg",
  coffre_fort: "/images/categories/coffre_fort_securite.jpg",
  armoire_cles: "/images/categories/armoire_cles.jpg",
  ralentisseur: "/images/categories/ralentisseur_voirie.jpg",

  // === ACCES EN HAUTEUR ===
  echelle_aluminium: "/images/categories/ladder_coulissante.jpg",
  echafaudage_roulant: "/images/categories/echafaudage_roulant.jpg",
  escabeau_pro: "/images/categories/escabeau_pro.jpg",
  telescopique: "/images/categories/ladder_telescopique.jpg",
  transformable_3p: "/images/categories/ladder_transformable.jpg",
  pliante_articulee: "/images/categories/ladder_articulee.jpg",
  marchepied: "/images/categories/marchepied_folding.jpg",

  // === MANUTENTION & LEVAGE ===
  transpalette_manuel: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&h=600&q=80",
  gerbeur: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&h=600&q=80",
  diable_manutention: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&h=600&q=80",
  roulette_industrielle: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  palan_chaine: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  sangle_arrimage: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&h=600&q=80",
  elingue_levage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",

  // === OUTILLAGE ELECTROPORTATIF ===
  perceuse_visseuse: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&h=600&q=80",
  perforateur_burineur: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&h=600&q=80",
  meuleuse_angle: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&h=600&q=80",
  scie_circulaire: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&h=600&q=80",
  disque_tronconner: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&h=600&q=80",

  // === OUTILLAGE A MAIN & ATELIER ===
  cle_mixte: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&h=600&q=80",
  cle_molette: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&h=600&q=80",
  coffret_douilles: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&h=600&q=80",
  tournevis_isole: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&h=600&q=80",
  pince_coupante: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&h=600&q=80",
  marteau_coffreur: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&h=600&q=80",
  metre_ruban: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&h=600&q=80",
  niveau_bulle: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&h=600&q=80",
  servante_atelier: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&h=600&q=80",
  boite_outils: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&h=600&q=80",
  compresseur_air: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  poste_souder: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&h=600&q=80",

  // === ELECTRICITE & APPAREILLAGE ===
  interrupteur_mural: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&h=600&q=80",
  prise_courant: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&h=600&q=80",
  disjoncteur_modulaire: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&h=600&q=80",
  tableau_electrique: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&h=600&q=80",
  cable_electrique: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&h=600&q=80",
  enrouleur_chantier: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&h=600&q=80",
  projecteur_led: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&h=600&q=80",
  ampoule_led: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&h=600&q=80",

  // === QUINCAILLERIE & FIXATION ===
  vis_bois: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  boulon_ecrou: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  cheville_fixation: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  serrure_cylindre: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&h=600&q=80",
  cadenas_securite: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&h=600&q=80",
  poignee_porte: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&h=600&q=80",

  // === PEINTURE & CHIMIE DE CHANTIER ===
  pot_peinture: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&h=600&q=80",
  rouleau_peintre: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&h=600&q=80",
  pinceau_plat: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&h=600&q=80",
  cartouche_silicone: "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=600&h=600&q=80",
  colle_pu: "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=600&h=600&q=80",

  // === PLOMBERIE & SANITAIRE ===
  mitigeur_lavabo: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80",
  mitigeur_cuisine: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80",
  colonne_douche: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80",
  raccord_plomberie: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80",
  chauffe_eau_cumulus: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80",

  // === POMPAGE & JARDINAGE ===
  pompe_eau: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  tuyau_arrosage: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=600&h=600&q=80",
  tondeuse_motoculture: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&h=600&q=80",

  default_item: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
}

/**
 * Resolves the studio fallback shot based on keywords and taxonomy.
 */
function resolveStudioFallback(designation: string, rayon = "", famille = ""): { url: string; label: string } {
  const d = (designation || "").toLowerCase()
  const f = (famille || "").toLowerCase()
  const r = (rayon || "").toUpperCase()

  // === ABRASIFS, ADHÉSIFS & BANDES ===
  if (d.includes("adhesif") || d.includes("adhésif") || d.includes("scotch") || d.includes("ruban") || d.includes("rouleaux d'adh")) {
    return { url: WHITE_BG.adhesif_rouleau, label: "Adhésif / Ruban Pro" }
  }
  if (d.includes("emeri") || d.includes("émeri") || d.includes("abrasif") || d.includes("papier imperme") || d.includes("grain") || d.includes("finition a sec")) {
    return { url: WHITE_BG.toile_emeri, label: "Abrasif & Toile Émeri" }
  }
  if (d.includes("auto agrippant") || d.includes("velcro") || d.includes("disque poncage") || d.includes("disque abrasif")) {
    return { url: WHITE_BG.disque_abrasif, label: "Disque Abrasif" }
  }

  // === PROTECTION & SECURITE (EPI) ===
  if (d.includes("botte") || f.includes("botte")) {
    return { url: WHITE_BG.bottes_chantier, label: "Bottes de Sécurité" }
  }
  if (d.includes("chaussure") || f.includes("chaussure")) {
    return { url: d.includes("basse") ? WHITE_BG.chaussures_basses : WHITE_BG.chaussures_hautes, label: "Chaussures de Sécurité" }
  }
  if (d.includes("gant") || f.includes("gant") || f.includes("mains")) {
    return { url: d.includes("cuir") ? WHITE_BG.gants_cuir : WHITE_BG.gants_nitrile, label: "Gants de Protection" }
  }
  if (d.includes("casque") || f.includes("casque") || f.includes("tête")) {
    if (d.includes("antibruit") || d.includes("bruit") || d.includes("oreill")) {
      return { url: WHITE_BG.casque_antibruit, label: "Protection Auditive" }
    }
    return { url: WHITE_BG.casque_chantier, label: "Casque de Chantier" }
  }
  if (d.includes("masque") || d.includes("respirat") || f.includes("respirat") || f.includes("masque")) {
    return { url: d.includes("cartouche") ? WHITE_BG.masque_cartouche : WHITE_BG.masque_ffp, label: "Protection Respiratoire" }
  }
  if (d.includes("lunette") || d.includes("visiere") || f.includes("yeux") || f.includes("visière")) {
    return { url: WHITE_BG.lunettes_protection, label: "Lunettes de Protection" }
  }
  if (d.includes("harnais") || d.includes("antichute") || d.includes("longe") || f.includes("antichute") || f.includes("harnais")) {
    return { url: WHITE_BG.harnais_securite, label: "Harnais Antichute" }
  }
  if (d.includes("gilet") || d.includes("haute visib") || f.includes("haute visibilité")) {
    return { url: WHITE_BG.gilet_fluo, label: "Gilet Haute Visibilité" }
  }
  if (d.includes("combinaison") || d.includes("pantalon") || d.includes("veste") || f.includes("vêtement")) {
    return { url: WHITE_BG.combinaison_travail, label: "Vêtement de Travail" }
  }

  // === SIGNALISATION & SECURITE ===
  if (d.includes("extincteur") || d.includes("extinct")) {
    return { url: WHITE_BG.extincteur_poudre, label: "Extincteur Sécurité" }
  }
  if (d.includes("armoire a cle") || d.includes("boite a cle") || d.includes("boite 20cle") || d.includes("boite 48") || d.includes("boite 96")) {
    return { url: WHITE_BG.armoire_cles, label: "Armoire à Clés Sécurisée" }
  }
  if (d.includes("coffre") || d.includes("caisse a monnaie") || d.includes("caissette") || d.includes("caisse a monaie") || d.includes("select access") || d.includes("arme a feu")) {
    return { url: WHITE_BG.coffre_fort, label: "Coffre-fort & Sécurité" }
  }
  if (d.includes("ralentisseur") || d.includes("dos d'ane") || d.includes("dos d'anes") || d.includes("pont de croisement") || d.includes("passe-cable") || f.includes("voirie")) {
    return { url: WHITE_BG.ralentisseur, label: "Équipement Voirie" }
  }
  if (d.includes("cone") || d.includes("cône") || d.includes("grillage") || d.includes("rubalise") || d.includes("ruban") || d.includes("chaine de signalisation") || f.includes("balisage")) {
    return { url: WHITE_BG.cone_signalisation, label: "Balisage & Signalisation" }
  }
  if (d.includes("panneau") || d.includes("macaron") || d.includes("sol glissant") || f.includes("signalisation")) {
    return { url: WHITE_BG.panneau_chantier, label: "Signalétique & Panneau" }
  }

  // === ACCES EN HAUTEUR ===
  if (d.includes("echafaud") || d.includes("échafaudage") || d.includes("plate-forme") || d.includes("plateforme")) {
    return { url: WHITE_BG.echafaudage_roulant, label: "Échafaudage Roulant Pro" }
  }
  if (d.includes("escabeau")) {
    return { url: WHITE_BG.escabeau_pro, label: "Escabeau Professionnel" }
  }
  if (d.includes("marchepied") || d.includes("marche-pied") || d.includes("tabouret")) {
    return { url: WHITE_BG.marchepied, label: "Marchepied Pliable" }
  }
  if (d.includes("telescop") || d.includes("télescop")) {
    return { url: WHITE_BG.telescopique, label: "Échelle Télescopique" }
  }
  if (d.includes("pliante") || d.includes("articul") || d.includes("3x4") || d.includes("4x4")) {
    return { url: WHITE_BG.pliante_articulee, label: "Échelle Pliante Articulée" }
  }
  if (d.includes("3p") || d.includes("3 plans") || d.includes("2p") || d.includes("2 plans") || d.includes("transformable") || d.includes("double")) {
    return { url: WHITE_BG.transformable_3p, label: "Échelle Transformable Pro" }
  }
  if (d.includes("echelle") || f.includes("échelle")) {
    return { url: WHITE_BG.echelle_aluminium, label: "Échelle Aluminium Droite" }
  }

  // === LEVAGE & MANUTENTION ===
  if (d.includes("transpalette") || d.includes("tirpal")) {
    return { url: WHITE_BG.transpalette_manuel, label: "Transpalette Manuel" }
  }
  if (d.includes("gerbeur")) {
    return { url: WHITE_BG.gerbeur, label: "Gerbeur Industriel" }
  }
  if (d.includes("diable") || d.includes("chariot") || f.includes("chariot") || f.includes("manutention")) {
    return { url: WHITE_BG.diable_manutention, label: "Chariot de Manutention" }
  }
  if (d.includes("roulette") || d.includes("roue") || f.includes("roue") || f.includes("roulette")) {
    return { url: WHITE_BG.roulette_industrielle, label: "Roulette Industrielle" }
  }
  if (d.includes("palan") || d.includes("treuil") || f.includes("arrimage")) {
    return { url: WHITE_BG.palan_chaine, label: "Palan de Levage" }
  }
  if (d.includes("sangle") || d.includes("arrimage")) {
    return { url: WHITE_BG.sangle_arrimage, label: "Sangle d'Arrimage" }
  }
  if (d.includes("elingue") || d.includes("élingue") || d.includes("chaine") || d.includes("chaîne")) {
    return { url: WHITE_BG.elingue_levage, label: "Élingue de Levage" }
  }

  // === OUTILLAGE ELECTROPORTATIF ===
  if (d.includes("perceuse") || d.includes("visseuse")) {
    return { url: WHITE_BG.perceuse_visseuse, label: "Perceuse Visseuse" }
  }
  if (d.includes("perforateur") || d.includes("burineur") || d.includes("marteau piqueur")) {
    return { url: WHITE_BG.perforateur_burineur, label: "Perforateur Burineur" }
  }
  if (d.includes("meuleuse") || d.includes("disqueuse")) {
    return { url: WHITE_BG.meuleuse_angle, label: "Meuleuse d'Angle" }
  }
  if (d.includes("scie ") || d.includes("scie sauteuse") || d.includes("circulaire")) {
    return { url: WHITE_BG.scie_circulaire, label: "Scie Électrique" }
  }
  if (d.includes("disque") || d.includes("tronconner") || d.includes("diamant") || d.includes("meule")) {
    return { url: WHITE_BG.disque_tronconner, label: "Disque à Tronçonner" }
  }

  // === OUTILLAGE A MAIN ===
  if (d.includes("cle ") || d.includes("cliquet") || d.includes("douille") || d.includes("fourche")) {
    return { url: d.includes("molette") ? WHITE_BG.cle_molette : (d.includes("douille") ? WHITE_BG.coffret_douilles : WHITE_BG.cle_mixte), label: "Clé Professionnelle" }
  }
  if (d.includes("tournevis") || d.includes("embout")) {
    return { url: WHITE_BG.tournevis_isole, label: "Tournevis Isolé" }
  }
  if (d.includes("pince") || d.includes("tenaille")) {
    return { url: WHITE_BG.pince_coupante, label: "Pince Industrielle" }
  }
  if (d.includes("marteau") || d.includes("massette") || d.includes("burin")) {
    return { url: WHITE_BG.marteau_coffreur, label: "Marteau & Frappe" }
  }
  if (d.includes("metre") || d.includes("ruban") || d.includes("decametre")) {
    return { url: WHITE_BG.metre_ruban, label: "Mètre Ruban" }
  }
  if (d.includes("niveau") || d.includes("laser") || d.includes("regle")) {
    return { url: WHITE_BG.niveau_bulle, label: "Niveau de Précision" }
  }
  if (d.includes("servante") || d.includes("armoire atelier")) {
    return { url: WHITE_BG.servante_atelier, label: "Servante d'Atelier" }
  }
  if (d.includes("caisse") || d.includes("boite") || d.includes("coffret") || f.includes("rangement")) {
    return { url: WHITE_BG.boite_outils, label: "Boîte à Outils" }
  }
  if (d.includes("compresseur") || d.includes("soufflette") || f.includes("compresseur")) {
    return { url: WHITE_BG.compresseur_air, label: "Compresseur d'Air" }
  }
  if (d.includes("soud") || d.includes("inverter") || d.includes("electrode") || f.includes("soudage")) {
    return { url: WHITE_BG.poste_souder, label: "Poste à Souder" }
  }

  // === ELECTRICITE & ECLAIRAGE ===
  if (d.includes("interrupteur") || d.includes("bouton poussoir") || f.includes("interrupteur")) {
    return { url: WHITE_BG.interrupteur_mural, label: "Interrupteur Mural" }
  }
  if (d.includes("prise") || d.includes("socle")) {
    return { url: WHITE_BG.prise_courant, label: "Prise Électrique" }
  }
  if (d.includes("disjoncteur") || d.includes("differentiel") || d.includes("fusible") || f.includes("coffret")) {
    return { url: WHITE_BG.disjoncteur_modulaire, label: "Disjoncteur Électrique" }
  }
  if (d.includes("coffret") || d.includes("armoire electrique") || d.includes("tableau")) {
    return { url: WHITE_BG.tableau_electrique, label: "Tableau Électrique" }
  }
  if (d.includes("enrouleur") || d.includes("rallonge")) {
    return { url: WHITE_BG.enrouleur_chantier, label: "Enrouleur de Chantier" }
  }
  if (d.includes("cable") || d.includes("fil ") || d.includes("gaine") || f.includes("cable")) {
    return { url: WHITE_BG.cable_electrique, label: "Câble Électrique" }
  }
  if (d.includes("projecteur") || d.includes("spot") || d.includes("hublot") || d.includes("reglette") || f.includes("luminaire")) {
    return { url: WHITE_BG.projecteur_led, label: "Éclairage / Projecteur" }
  }
  if (d.includes("ampoule") || d.includes("lampe") || d.includes("tube led")) {
    return { url: WHITE_BG.ampoule_led, label: "Lampe LED" }
  }

  // === QUINCAILLERIE ===
  if (d.includes("vis ") || d.includes("tirefond") || d.includes("visse")) {
    return { url: WHITE_BG.vis_bois, label: "Visserie Professionnelle" }
  }
  if (d.includes("boulon") || d.includes("ecrou") || d.includes("rondelle") || d.includes("tige filetee")) {
    return { url: WHITE_BG.boulon_ecrou, label: "Boulonnerie & Écrous" }
  }
  if (d.includes("cheville") || d.includes("tampon") || d.includes("scellement")) {
    return { url: WHITE_BG.cheville_fixation, label: "Cheville de Fixation" }
  }
  if (d.includes("cadenas") || d.includes("consignation")) {
    return { url: WHITE_BG.cadenas_securite, label: "Cadenas de Sécurité" }
  }
  if (d.includes("serrure") || d.includes("cylindre") || d.includes("verrou") || f.includes("serrure")) {
    return { url: WHITE_BG.serrure_cylindre, label: "Serrure & Cylindre" }
  }
  if (d.includes("poignee") || d.includes("bequille") || d.includes("paumelle") || d.includes("charniere")) {
    return { url: WHITE_BG.poignee_porte, label: "Poignée & Ferrure" }
  }

  // === PEINTURE & CHIMIE ===
  if (d.includes("peinture") || d.includes("laque") || d.includes("vernis") || d.includes("antirouille") || f.includes("peinture")) {
    return { url: WHITE_BG.pot_peinture, label: "Pot de Peinture" }
  }
  if (d.includes("rouleau") || d.includes("manchon") || f.includes("outillage peinture")) {
    return { url: WHITE_BG.rouleau_peintre, label: "Rouleau de Peintre" }
  }
  if (d.includes("pinceau") || d.includes("spalter") || d.includes("brosse")) {
    return { url: WHITE_BG.pinceau_plat, label: "Pinceau Professionnel" }
  }
  if (d.includes("silicone") || d.includes("mastic") || d.includes("joint")) {
    return { url: WHITE_BG.cartouche_silicone, label: "Cartouche Silicone" }
  }
  if (d.includes("colle") || d.includes("resine") || d.includes("mousse expansive") || f.includes("colle")) {
    return { url: WHITE_BG.colle_pu, label: "Colle & Mastic PU" }
  }

  // === SANITAIRE & PLOMBERIE ===
  if (d.includes("douche") || d.includes("colonne")) {
    return { url: WHITE_BG.colonne_douche, label: "Colonne de Douche" }
  }
  if (d.includes("evier") || d.includes("cuisine")) {
    return { url: WHITE_BG.mitigeur_cuisine, label: "Mitigeur Cuisine" }
  }
  if (d.includes("mitigeur") || d.includes("robinet") || d.includes("melangeur") || f.includes("robinetterie")) {
    return { url: WHITE_BG.mitigeur_lavabo, label: "Robinetterie / Mitigeur" }
  }
  if (d.includes("chauffe-eau") || d.includes("cumulus") || d.includes("ballon eau")) {
    return { url: WHITE_BG.chauffe_eau_cumulus, label: "Chauffe-eau Électrique" }
  }
  if (d.includes("raccord") || d.includes("vanne") || d.includes("siphon") || d.includes("flexible") || f.includes("plomberie")) {
    return { url: WHITE_BG.raccord_plomberie, label: "Raccord de Plomberie" }
  }

  // === POMPAGE & JARDINAGE ===
  if (d.includes("pompe") || d.includes("surpresseur") || d.includes("motopompe") || f.includes("pompe")) {
    return { url: WHITE_BG.pompe_eau, label: "Pompe Industrielle" }
  }
  if (d.includes("arrosage") || d.includes("tuyau") || f.includes("arrosage")) {
    return { url: WHITE_BG.tuyau_arrosage, label: "Arrosage & Tuyau" }
  }
  if (d.includes("tondeuse") || d.includes("tronconneuse") || d.includes("debroussailleuse") || r === "JARDINAGE ET PLEIN AIR") {
    return { url: WHITE_BG.tondeuse_motoculture, label: "Matériel Espace Vert" }
  }

  // === CATEGORY FALLBACK ===
  switch (r) {
    case "PROTECTION ET SECURITE (EPI)":
      return { url: WHITE_BG.chaussures_hautes, label: "EPI Sécurité" }
    case "SIGNALISATION ET SECURITE CHANTIER":
      return { url: WHITE_BG.cone_signalisation, label: "Sécurité Chantier" }
    case "ECHELLES ET ECHAFAUDAGES":
      return { url: WHITE_BG.echelle_aluminium, label: "Accès en Hauteur" }
    case "LEVAGE ET MANUTENTION":
      return { url: WHITE_BG.transpalette_manuel, label: "Levage & Manutention" }
    case "OUTILLAGE ET RANGEMENT":
      return { url: WHITE_BG.perceuse_visseuse, label: "Outillage Pro" }
    case "ELECTRICITE ET ECLAIRAGE":
      return { url: WHITE_BG.interrupteur_mural, label: "Électricité" }
    case "QUINCAILLERIE":
      return { url: WHITE_BG.vis_bois, label: "Quincaillerie Pro" }
    case "DROGUERIE ET PEINTURE":
      return { url: WHITE_BG.pot_peinture, label: "Droguerie & Peinture" }
    case "SANITAIRE ET ETANCHEITE":
      return { url: WHITE_BG.mitigeur_lavabo, label: "Sanitaire & Plomberie" }
    default:
      return { url: WHITE_BG.default_item, label: "Article Catalogue ORSAP" }
  }
}

/**
 * Returns image info with Option 1 (SKU file check / fallback) and Option 2 (custom URL) support.
 */
export function getArticleImage(article: {
  code?: string
  designation: string
  rayon?: string
  famille?: string
  image?: string | null
}): ProductImageInfo {
  const fallback = resolveStudioFallback(article.designation, article.rayon, article.famille)
  const cleanCode = (article.code || "").trim().toUpperCase()

  if (article.image && article.image.trim().length > 0) {
    return {
      url: article.image,
      primaryUrl: article.image,
      fallbackUrl: fallback.url,
      alt: article.designation,
      label: "Photo Produit Réelle",
      hasCustomImage: true,
    }
  }

  const primarySkuUrl = cleanCode ? `/images/products/${cleanCode}.jpg` : fallback.url

  return {
    url: primarySkuUrl,
    primaryUrl: primarySkuUrl,
    fallbackUrl: fallback.url,
    alt: article.designation,
    label: fallback.label,
    hasCustomImage: false,
  }
}
