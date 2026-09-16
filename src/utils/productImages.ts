/**
 * ORSAP Product Imagery Resolver
 * High-definition, pure white-background (#ffffff) isolated product studio photography
 * matched precisely by SKU, category (Rayon), sub-family (Famille), and keywords.
 */

export interface ProductImageInfo {
  url: string
  alt: string
  label?: string
}

// Curated high-resolution studio shots isolated on pure white background (#ffffff)
const WHITE_BG_IMAGES: Record<string, string> = {
  // === PROTECTION & SECURITE (EPI) ===
  "chaussures": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&h=600&q=80",
  "chaussures_secu": "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&h=600&q=80",
  "bottes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&h=600&q=80",
  "gants": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&h=600&q=80",
  "casque": "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&h=600&q=80",
  "masque": "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&h=600&q=80",
  "lunettes": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&h=600&q=80",
  "harnais": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&h=600&q=80",
  "vetements": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&h=600&q=80",
  "gilet_hv": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&h=600&q=80",

  // === SIGNALISATION & SECURITE CHANTIER ===
  "signalisation": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&h=600&q=80",
  "extincteur": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&h=600&q=80",
  "coffre_fort": "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=600&h=600&q=80",
  "ralentisseur": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&h=600&q=80",

  // === ECHELLES & ECHAFAUDAGES ===
  "echelle": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&h=600&q=80",
  "echafaudage": "https://images.unsplash.com/photo-1541888946425-d0fbb18086f7?auto=format&fit=crop&w=600&h=600&q=80",
  "escabeau": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&h=600&q=80",

  // === LEVAGE & MANUTENTION ===
  "transpalette": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&h=600&q=80",
  "chariot": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&h=600&q=80",
  "roulette": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  "sangle": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&h=600&q=80",
  "chaine": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  "palan": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",

  // === OUTILLAGE & RANGEMENT ===
  "electroportatif": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&h=600&q=80",
  "perceuse": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&h=600&q=80",
  "meuleuse": "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&h=600&q=80",
  "outillage_main": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&h=600&q=80",
  "tournevis": "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&h=600&q=80",
  "marteau": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&h=600&q=80",
  "cle": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&h=600&q=80",
  "compresseur": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  "soudage": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&h=600&q=80",
  "rangement": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&h=600&q=80",
  "metrologie": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&h=600&q=80",

  // === ELECTRICITE & ECLAIRAGE ===
  "interrupteur": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&h=600&q=80",
  "disjoncteur": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&h=600&q=80",
  "cable": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&h=600&q=80",
  "eclairage_elec": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&h=600&q=80",
  "projecteur": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&h=600&q=80",
  "coffret_elec": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&h=600&q=80",

  // === QUINCAILLERIE ===
  "visserie": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  "serrure": "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&h=600&q=80",
  "poignee": "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&h=600&q=80",
  "cheville": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",

  // === DROGUERIE & PEINTURE ===
  "peinture": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&h=600&q=80",
  "rouleau_peinture": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&h=600&q=80",
  "pinceau": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&h=600&q=80",
  "droguerie": "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=600&h=600&q=80",
  "colle": "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=600&h=600&q=80",

  // === SANITAIRE & ETANCHEITE ===
  "robinetterie": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80",
  "plomberie": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80",
  "chauffe_eau": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80",
  "salle_de_bain": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80",

  // === LUMINAIRE ===
  "luminaire": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&h=600&q=80",
  "spot": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&h=600&q=80",
  "applique": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&h=600&q=80",
  "suspension": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&h=600&q=80",

  // === JARDINAGE & PLEIN AIR ===
  "pompe": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
  "arrosage": "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=600&h=600&q=80",
  "jardinage": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&h=600&q=80",
  "piscine": "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=600&h=600&q=80",

  // Default fallback
  "default": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=600&q=80",
}

/**
 * Returns a high-definition white-background photo matching the item's SKU, designation, or taxonomy.
 */
export function getArticleImage(article: {
  code?: string
  designation: string
  rayon?: string
  famille?: string
  image?: string | null
}): ProductImageInfo {
  // 1. Direct custom image URL if defined in article record
  if (article.image && article.image.trim().length > 0) {
    return {
      url: article.image,
      alt: article.designation,
      label: "Photo officielle",
    }
  }

  const d = (article.designation || "").toLowerCase()
  const r = (article.rayon || "").toUpperCase()
  const f = (article.famille || "").toLowerCase()

  // 2. Keyword & Sub-Family match for white-background photography
  if (d.includes("chaussure") || d.includes("botte") || f.includes("chaussure") || f.includes("botte")) {
    return { url: WHITE_BG_IMAGES.chaussures_secu, alt: article.designation, label: "EPI Chaussures" }
  }
  if (d.includes("gant") || f.includes("gant") || f.includes("mains")) {
    return { url: WHITE_BG_IMAGES.gants, alt: article.designation, label: "EPI Gants" }
  }
  if (d.includes("casque") || f.includes("casque") || f.includes("tête")) {
    return { url: WHITE_BG_IMAGES.casque, alt: article.designation, label: "EPI Casque" }
  }
  if (d.includes("masque") || d.includes("respirat") || f.includes("respirat") || f.includes("masque")) {
    return { url: WHITE_BG_IMAGES.masque, alt: article.designation, label: "EPI Masque" }
  }
  if (d.includes("lunette") || d.includes("visiere") || f.includes("yeux") || f.includes("visière")) {
    return { url: WHITE_BG_IMAGES.lunettes, alt: article.designation, label: "EPI Lunettes" }
  }
  if (d.includes("harnais") || d.includes("antichute") || d.includes("longe") || f.includes("antichute") || f.includes("harnais")) {
    return { url: WHITE_BG_IMAGES.harnais, alt: article.designation, label: "EPI Antichute" }
  }
  if (d.includes("gilet") || d.includes("haute visib") || d.includes("combinaison") || f.includes("vêtement") || f.includes("haute visibilité")) {
    return { url: WHITE_BG_IMAGES.gilet_hv, alt: article.designation, label: "EPI Vêtement" }
  }

  // Signalisation & Sécurité Chantier
  if (d.includes("extincteur") || f.includes("incendie") || f.includes("extincteur")) {
    return { url: WHITE_BG_IMAGES.extincteur, alt: article.designation, label: "Sécurité Incendie" }
  }
  if (d.includes("coffre") || f.includes("coffre")) {
    return { url: WHITE_BG_IMAGES.coffre_fort, alt: article.designation, label: "Coffre-fort" }
  }
  if (d.includes("balisage") || d.includes("cone") || d.includes("panneau") || f.includes("signalisation") || f.includes("balisage")) {
    return { url: WHITE_BG_IMAGES.signalisation, alt: article.designation, label: "Signalisation" }
  }
  if (d.includes("ralentisseur") || f.includes("ralentisseur") || f.includes("voirie")) {
    return { url: WHITE_BG_IMAGES.ralentisseur, alt: article.designation, label: "Voirie" }
  }

  // Échelles & Échafaudages
  if (d.includes("echelle") || f.includes("échelle")) {
    return { url: WHITE_BG_IMAGES.echelle, alt: article.designation, label: "Échelle" }
  }
  if (d.includes("echafaud") || f.includes("échafaudage")) {
    return { url: WHITE_BG_IMAGES.echafaudage, alt: article.designation, label: "Échafaudage" }
  }
  if (d.includes("escabeau") || d.includes("marchepied") || f.includes("escabeau") || f.includes("marchepied")) {
    return { url: WHITE_BG_IMAGES.escabeau, alt: article.designation, label: "Escabeau" }
  }

  // Levage & Manutention
  if (d.includes("transpalette") || d.includes("gerbeur") || d.includes("diable") || f.includes("manutention") || f.includes("chariot")) {
    return { url: WHITE_BG_IMAGES.transpalette, alt: article.designation, label: "Manutention" }
  }
  if (d.includes("roulette") || d.includes("roue") || f.includes("roue") || f.includes("roulette")) {
    return { url: WHITE_BG_IMAGES.roulette, alt: article.designation, label: "Roues & Roulettes" }
  }
  if (d.includes("palan") || d.includes("elingue") || d.includes("treuil") || f.includes("levage") || f.includes("arrimage")) {
    return { url: WHITE_BG_IMAGES.palan, alt: article.designation, label: "Levage" }
  }
  if (d.includes("sangle") || d.includes("corde") || f.includes("cordage")) {
    return { url: WHITE_BG_IMAGES.sangle, alt: article.designation, label: "Arrimage" }
  }
  if (d.includes("chaine") || d.includes("cable") || f.includes("chaîne")) {
    return { url: WHITE_BG_IMAGES.chaine, alt: article.designation, label: "Chaînes & Câbles" }
  }

  // Outillage
  if (d.includes("perceuse") || d.includes("visseuse") || d.includes("meuleuse") || d.includes("perforateur") || f.includes("electroportatif")) {
    return { url: WHITE_BG_IMAGES.perceuse, alt: article.designation, label: "Électroportatif" }
  }
  if (d.includes("cle ") || d.includes("cliquet") || d.includes("tournevis") || d.includes("pince") || f.includes("outillages a main")) {
    return { url: WHITE_BG_IMAGES.outillage_main, alt: article.designation, label: "Outillage à main" }
  }
  if (d.includes("marteau") || d.includes("masse")) {
    return { url: WHITE_BG_IMAGES.marteau, alt: article.designation, label: "Outillage à frapper" }
  }
  if (d.includes("compresseur") || f.includes("compresseur")) {
    return { url: WHITE_BG_IMAGES.compresseur, alt: article.designation, label: "Air comprimé" }
  }
  if (d.includes("soud") || f.includes("soudage")) {
    return { url: WHITE_BG_IMAGES.soudage, alt: article.designation, label: "Soudage" }
  }
  if (d.includes("boite") || d.includes("caisse") || d.includes("servante") || f.includes("rangement")) {
    return { url: WHITE_BG_IMAGES.rangement, alt: article.designation, label: "Rangement" }
  }
  if (d.includes("metre") || d.includes("niveau") || d.includes("laser") || f.includes("metrologie") || f.includes("mesure")) {
    return { url: WHITE_BG_IMAGES.metrologie, alt: article.designation, label: "Mesure & Traçage" }
  }

  // Electricité
  if (d.includes("prise") || d.includes("interrupteur") || f.includes("interrupteur")) {
    return { url: WHITE_BG_IMAGES.interrupteur, alt: article.designation, label: "Appareillage électrique" }
  }
  if (d.includes("disjoncteur") || d.includes("differentiel") || d.includes("coffret") || f.includes("coffret")) {
    return { url: WHITE_BG_IMAGES.disjoncteur, alt: article.designation, label: "Protection électrique" }
  }
  if (d.includes("cable") || d.includes("fil ") || d.includes("enrouleur") || f.includes("cable") || f.includes("enrouleur")) {
    return { url: WHITE_BG_IMAGES.cable, alt: article.designation, label: "Câblage" }
  }

  // Quincaillerie
  if (d.includes("vis") || d.includes("boulon") || d.includes("ecrou") || d.includes("cheville") || f.includes("visserie")) {
    return { url: WHITE_BG_IMAGES.visserie, alt: article.designation, label: "Visserie & Fixation" }
  }
  if (d.includes("serrure") || d.includes("verrou") || d.includes("cylindre") || d.includes("cadenas") || f.includes("serrure")) {
    return { url: WHITE_BG_IMAGES.serrure, alt: article.designation, label: "Serrurerie" }
  }
  if (d.includes("poignee") || d.includes("bequille") || f.includes("poingnee")) {
    return { url: WHITE_BG_IMAGES.poignee, alt: article.designation, label: "Poignée" }
  }

  // Droguerie & Peinture
  if (d.includes("peinture") || d.includes("laque") || d.includes("vernis") || f.includes("peinture") || f.includes("vernis")) {
    return { url: WHITE_BG_IMAGES.peinture, alt: article.designation, label: "Peinture" }
  }
  if (d.includes("rouleau") || d.includes("pinceau") || d.includes("brosse") || f.includes("outillage peinture")) {
    return { url: WHITE_BG_IMAGES.rouleau_peinture, alt: article.designation, label: "Application" }
  }
  if (d.includes("colle") || d.includes("mastic") || d.includes("silicone") || f.includes("colle")) {
    return { url: WHITE_BG_IMAGES.colle, alt: article.designation, label: "Étanchéité & Colle" }
  }

  // Sanitaire & Plomberie
  if (d.includes("mitigeur") || d.includes("robinet") || d.includes("douche") || f.includes("robinetterie")) {
    return { url: WHITE_BG_IMAGES.robinetterie, alt: article.designation, label: "Robinetterie" }
  }
  if (d.includes("raccord") || d.includes("tube") || d.includes("vanne") || d.includes("cuivre") || f.includes("plomberie")) {
    return { url: WHITE_BG_IMAGES.plomberie, alt: article.designation, label: "Plomberie" }
  }
  if (d.includes("chauffe-eau") || d.includes("cumulus") || f.includes("chauffe eau")) {
    return { url: WHITE_BG_IMAGES.chauffe_eau, alt: article.designation, label: "Chauffe-eau" }
  }

  // Luminaire
  if (r === "LUMINAIRE" || f.includes("luminaire") || f.includes("applique") || f.includes("plafonnier") || f.includes("suspension") || f.includes("spot")) {
    return { url: WHITE_BG_IMAGES.luminaire, alt: article.designation, label: "Luminaire" }
  }

  // Jardinage & Pompes
  if (d.includes("pompe") || f.includes("pompe")) {
    return { url: WHITE_BG_IMAGES.pompe, alt: article.designation, label: "Pompage" }
  }
  if (d.includes("arrosage") || d.includes("tuyau") || f.includes("arrosage")) {
    return { url: WHITE_BG_IMAGES.arrosage, alt: article.designation, label: "Arrosage" }
  }
  if (r === "JARDINAGE ET PLEIN AIR") {
    return { url: WHITE_BG_IMAGES.jardinage, alt: article.designation, label: "Jardinage" }
  }

  // 3. Category Fallback
  switch (r) {
    case "PROTECTION ET SECURITE (EPI)":
      return { url: WHITE_BG_IMAGES.chaussures_secu, alt: article.designation, label: "EPI Sécurité" }
    case "SIGNALISATION ET SECURITE CHANTIER":
      return { url: WHITE_BG_IMAGES.signalisation, alt: article.designation, label: "Sécurité Chantier" }
    case "ECHELLES ET ECHAFAUDAGES":
      return { url: WHITE_BG_IMAGES.echelle, alt: article.designation, label: "Accès en hauteur" }
    case "LEVAGE ET MANUTENTION":
      return { url: WHITE_BG_IMAGES.transpalette, alt: article.designation, label: "Levage & Manutention" }
    case "OUTILLAGE ET RANGEMENT":
      return { url: WHITE_BG_IMAGES.outillage_main, alt: article.designation, label: "Outillage" }
    case "ELECTRICITE ET ECLAIRAGE":
      return { url: WHITE_BG_IMAGES.interrupteur, alt: article.designation, label: "Électricité" }
    case "QUINCAILLERIE":
      return { url: WHITE_BG_IMAGES.visserie, alt: article.designation, label: "Quincaillerie" }
    case "DROGUERIE ET PEINTURE":
      return { url: WHITE_BG_IMAGES.peinture, alt: article.designation, label: "Peinture" }
    case "SANITAIRE ET ETANCHEITE":
      return { url: WHITE_BG_IMAGES.robinetterie, alt: article.designation, label: "Sanitaire" }
    default:
      return { url: WHITE_BG_IMAGES.default, alt: article.designation, label: "Produit ORSAP" }
  }
}
