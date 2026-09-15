export type SolutionArticleRef = {
  id: string;
  title: string;
  excerpt: string;
  clusters: string[];
  readTime: string;
  url?: string;
};

export type SolutionItem = {
  slug: string; // Full relative path, e.g. "epi/casques" or "industrie"
  route: string; // e.g. "/solutions/epi/casques"
  category: string;
  title: string;
  heroTitle: string;
  subtitle: string;
  intro: string;
  description: string;
  seoClusters: string[];
  targetSectors: string[];
  normsAndStandards: { code: string; label: string; desc: string }[];
  keyChallenges: { title: string; desc: string; icon?: string }[];
  technicalFeaturesTitle: string;
  technicalFeatures: string[];
  subRangesTitle: string;
  subRanges: { title: string; desc: string; badge?: string; to?: string }[];
  expertAdvice: string;
  faq: { q: string; a: string }[];
  linkedArticles: SolutionArticleRef[];
  breadcrumbs: { label: string; to: string }[];
  relatedSolutions?: { title: string; to: string; desc: string }[];
};

export const SOLUTIONS_DATA: Record<string, SolutionItem> = {
  "epi": {
    slug: "epi",
    route: "/solutions/epi",
    category: "EPI",
    title: "EPI — Équipements de Protection Individuelle",
    heroTitle: "Solutions EPI Intégrales & Sécurité Corporelle de la Tête aux Pieds",
    subtitle: "Sécurité intégrale, conformité réglementaire internationale et protection maximale sur vos chantiers et sites industriels.",
    intro: "Dans le secteur industriel, le BTP et la logistique au Maroc, préserver l'intégrité physique de vos collaborateurs est la priorité absolue. Véritables boucliers du quotidien, les équipements de protection individuelle (EPI) distribués par ORSAP répondent aux exigences les plus strictes pour neutraliser les risques professionnels.",
    description: "De la protection crânienne et oculaire jusqu'aux chaussures de sécurité anti-perforation, en passant par les gants anti-coupure et les équipements antichute, ORSAP vous propose des solutions éprouvées issues des leaders mondiaux (Delta Plus, 3M, Honeywell, Ansell). Notre approche combine conformité réglementaire, ergonomie supérieure et durabilité extrême pour garantir le port effectif des protections par vos équipes.",
    seoClusters: ["EPI", "EPI par métier", "Kit EPI", "Port des EPI", "Risque électrique"],
    targetSectors: ["BTP & Génie Civil", "Industrie Lourde", "Logistique & Supply Chain", "Énergie & Pétrochimie", "Agroalimentaire"],
    normsAndStandards: [
      { code: "Règlement (UE) 2016/425", label: "Catégories EPI I, II et III", desc: "Conformité CE certifiée pour la protection contre les risques mineurs, intermédiaires et mortels." },
      { code: "Normes EN / ISO", label: "Harmonisation internationale", desc: "Traçabilité et certification par laboratoires notifiés pour chaque équipement." },
      { code: "Code du Travail Marocain", label: "Obligations légales d'hygiène et sécurité", desc: "Mise à disposition gratuite et maintenance conforme des équipements par l'employeur." }
    ],
    keyChallenges: [
      { title: "Zéro Accident Évitable", desc: "Stopper les chocs, coupures, brûlures et inhalations toxiques dès la source." },
      { title: "Adhésion & Confort de Port", desc: "Des matières respirantes et légères pour éliminer le refus de port par les opérateurs." },
      { title: "Maîtrise des Budgets & TCO", desc: "Des équipements résistants qui durent plus longtemps et réduisent vos coûts d'approvisionnement." }
    ],
    technicalFeaturesTitle: "Pourquoi choisir les solutions EPI d'ORSAP ?",
    technicalFeatures: [
      "Catalogue exhaustif de plus de 15 000 références en stock pour une livraison rapide en 48h.",
      "Conseil technique expert pour la définition du Document Unique et des matrices d'EPI par poste.",
      "Kits d'EPI personnalisés par corps de métier (BTP, électricien, soudeur, cariste, maintenance).",
      "Traçabilité rigoureuse et fiches techniques certifiées fournies avec chaque lot livré."
    ],
    subRangesTitle: "Nos gammes d'équipements de protection individuelle :",
    subRanges: [
      { title: "Protection de la Tête", desc: "Casques de chantier ventilés, casquettes anti-heurt, visières intégrées.", badge: "EN 397", to: "/solutions/epi/casques" },
      { title: "Protection des Pieds", desc: "Chaussures de sécurité S1P, S3, S7S, bottes de sécurité et semelles SRC.", badge: "ISO 20345", to: "/solutions/epi/chaussures-securite" },
      { title: "Protection des Mains", desc: "Gants anti-coupure, manutention, chimiques, thermiques et isolants.", badge: "EN 388 / 374", to: "/solutions/epi/gants" },
      { title: "Protection Respiratoire", desc: "Masques FFP2/FFP3, demi-masques à cartouches ABEK, masques complets.", badge: "EN 149 / 140", to: "/solutions/epi/protection-respiratoire" },
      { title: "Protection Auditive", desc: "Bouchons d'oreilles réutilisables, casques anti-bruit passifs et électroniques.", badge: "EN 352", to: "/solutions/epi/protection-auditive" },
      { title: "Protection Antichute", desc: "Harnais de sécurité, longes avec absorbeur, lignes de vie et enrouleurs.", badge: "EN 361 / 355", to: "/solutions/travail-en-hauteur" }
    ],
    expertAdvice: "Le saviez-vous ? 70% des accidents de la main et de la tête surviennent lorsque l'opérateur a retiré son EPI en raison d'un inconfort ou d'une mauvaise taille. Nos experts vous accompagnent pour tester et sélectionner les modèles les plus ergonomiques.",
    faq: [
      { q: "Quelles sont les obligations de l'employeur concernant les EPI ?", a: "Selon la réglementation marocaine et les standards internationaux, l'employeur doit fournir gratuitement les EPI appropriés aux risques, veiller à leur utilisation effective et assurer leur entretien périodique." },
      { q: "Comment définir un kit EPI par métier ?", a: "ORSAP évalue les risques spécifiques de vos postes (mécaniques, chimiques, électriques, thermiques) et compose des packs tout-en-un optimisés pour chaque collaborateur." }
    ],
    linkedArticles: [
      { id: "ART-001", title: "Guide complet du choix des EPI : Catégories 1, 2 et 3", excerpt: "Comprendre les exigences légales et les seuils de gravité pour protéger efficacement vos équipes.", clusters: ["EPI", "Réglementation"], readTime: "5 min" },
      { id: "ART-002", title: "Comment composer le Kit EPI idéal par corps de métier", excerpt: "Méthode pas-à-pas pour équiper peintres, électriciens, maçons et techniciens d'atelier.", clusters: ["Kit EPI", "EPI par métier"], readTime: "6 min" },
      { id: "ART-047", title: "Risque électrique : EPI isolants et normes NF C 18-510", excerpt: "Gants diélectriques, visières anti-arc électrique et chaussures isolantes pour électriciens.", clusters: ["Risque électrique", "EPI"], readTime: "7 min" },
      { id: "ART-062", title: "Adhésion au port des EPI : Stratégies managériales en atelier", excerpt: "Comment transformer la contrainte du port en réflexe sécurité naturel au quotidien.", clusters: ["Port des EPI", "Culture sécurité"], readTime: "4 min" },
      { id: "ART-067", title: "Entretien, stockage et renouvellement des EPI : Les règles d'or", excerpt: "Optimiser la durée de vie de vos équipements tout en garantissant une sécurité sans faille.", clusters: ["EPI", "Maintenance"], readTime: "5 min" },
      { id: "ART-070", title: "EPI connectés et IoT : L'avenir de la prévention des accidents", excerpt: "Capteurs de choc, détection d'immobilité et gestion intelligente du parc d'équipements.", clusters: ["EPI intelligents", "IoT"], readTime: "6 min" },
      { id: "ART-072", title: "Check-list d'audit annuel du parc d'EPI en entreprise", excerpt: "La grille d'évaluation complète pour auditer la conformité de vos stocks et usages.", clusters: ["EPI", "Audit"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" }
    ],
    relatedSolutions: [
      { title: "EPI BTP & Chantier", to: "/solutions/epi/btp", desc: "Packs complets adaptés aux contraintes du gros œuvre et du second œuvre." },
      { title: "Protection de la Tête", to: "/solutions/epi/casques", desc: "Casques antichocs et casquettes anti-heurt haute résistance." },
      { title: "Chaussures de Sécurité", to: "/solutions/epi/chaussures-securite", desc: "Modèles légers, confortables et ultra-résistants normes S1P et S3." }
    ]
  },

  "epi/btp": {
    slug: "epi/btp",
    route: "/solutions/epi/btp",
    category: "EPI Chantier",
    title: "EPI BTP — Protection pour le BTP & Chantier",
    heroTitle: "Solutions EPI Chantier & BTP : La Sécurité au Cœur du Gros Œuvre",
    subtitle: "Équipements renforcés pour résister aux environnements sévères, intempéries et risques multiples des chantiers de construction.",
    intro: "Le secteur du BTP concentre une multiplicité de risques majeurs : chutes d'objets, perforations au sol, poussières abrasives, projections et engins en mouvement. Les solutions EPI BTP d'ORSAP sont conçues pour offrir une résistance maximale tout en assurant une mobilité sans entrave.",
    description: "Nous équipons les entreprises générales de construction, les artisans et les régies de travaux publics avec des packs d'EPI certifiés : casques haute visibilité avec jugulaire, chaussures de sécurité S3 à semelle anti-perforation acier ou textile, gants de maçonnerie haute résistance et vêtements de signalisation haute visibilité classe 2 et 3.",
    seoClusters: ["EPI BTP", "EPI chantier"],
    targetSectors: ["BTP", "Gros Œuvre", "Travaux Publics", "Démolition & VRD", "Second Œuvre"],
    normsAndStandards: [
      { code: "EN 397", label: "Casques de protection pour l'industrie", desc: "Absorption des chocs verticaux et résistance à la pénétration." },
      { code: "EN ISO 20345 (S3)", label: "Chaussures de chantier tout-terrain", desc: "Embout 200J, semelle crantée anti-perforation et tige hydrofuge." },
      { code: "EN ISO 20471", label: "Vêtements de signalisation à haute visibilité", desc: "Matière fluorescente et bandes rétro-réfléchissantes pour être vu de jour comme de nuit." }
    ],
    keyChallenges: [
      { title: "Risques de Chutes & Co-activité", desc: "Sécuriser les interactions entre engins de terrassement et ouvriers au sol." },
      { title: "Conditions Climatiques Difficiles", desc: "Protéger contre la chaleur accablante, le vent de sable et l'humidité." },
      { title: "Solidité Extrême", desc: "Des matières anti-abrasion pour supporter le béton, l'acier et les gravats." }
    ],
    technicalFeaturesTitle: "Les spécificités de la gamme BTP ORSAP :",
    technicalFeatures: [
      "Casques avec calotte en polyéthylène haute densité et coiffe textile 6 points ultra-confort.",
      "Chaussures de sécurité avec sur-embout renforcé anti-usure pour les travaux à genoux.",
      "Gants enduits nitrile épais ou cuir pleine fleur pour la manipulation de parpaings et fers à béton.",
      "Gilets, parkas et pantalons haute visibilité respirants adaptés aux climats chauds."
    ],
    subRangesTitle: "Packs EPI Chantier recommandés :",
    subRanges: [
      { title: "Pack Gros Œuvre & Maçonnerie", desc: "Casque jugulaire + Chaussures S3 montantes + Gants de prise + Lunettes étanches.", badge: "Indispensable", to: "/solutions/epi/btp/gros-oeuvre" },
      { title: "Pack Second Œuvre & Finition", desc: "Casquette anti-heurt + Chaussures légères S1P + Gants dextérité PU + Masque FFP2.", badge: "Confort", to: "/solutions/epi/btp/second-oeuvre" },
      { title: "Pack Voirie & Travaux Publics", desc: "Vêtement Haute Visibilité Fluo + Bottes S5 + Casque anti-bruit + Gants étanches.", badge: "Sécurité Max", to: "/solutions/epi/btp/voirie" }
    ],
    expertAdvice: "Sur chantier, 45% des accidents graves touchent les pieds et la tête. Exigez des semelles anti-perforation non métalliques (souples et légères) et des casques équipés de jugulaires pour éviter la perte du casque lors des mouvements amples.",
    faq: [
      { q: "Quelles chaussures privilégier sur un chantier de terrassement ?", a: "Optez systématiquement pour la norme S3 (ou S7S) avec semelle à crampons profonds, tige hydrofuge et embout renforcé pour éviter les perforations par clous et fers tors." }
    ],
    linkedArticles: [
      { id: "ART-049", title: "EPI indispensables sur un chantier BTP : Le guide du chef de chantier", excerpt: "Réglementation, obligations d'affichage et sélection des équipements essentiels.", clusters: ["EPI BTP", "EPI chantier"], readTime: "6 min" },
      { id: "ART-050", title: "Comment choisir ses chaussures de sécurité de chantier : S1P vs S3", excerpt: "Comparatif des normes de semelles, étanchéité et résistance aux hydrocarbures.", clusters: ["Protection des pieds", "EPI BTP"], readTime: "5 min" },
      { id: "ART-068", title: "Sécurité sur les chantiers de nuit : Éclairage et Haute Visibilité", excerpt: "Norme EN ISO 20471 et bonnes pratiques pour les travaux nocturnes sur voies publiques.", clusters: ["EPI chantier", "Haute visibilité"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "BTP & Chantier", to: "/solutions/epi/btp" }
    ]
  },

  "epi/casques": {
    slug: "epi/casques",
    route: "/solutions/epi/casques",
    category: "Protection Tête",
    title: "Casques de Sécurité & Protection de la Tête",
    heroTitle: "Casques de Sécurité & Protection Crânienne Certifiée",
    subtitle: "Casques de chantier ventilés, casquettes anti-heurt, casques isolants et visières intégrées pour une protection optimale.",
    intro: "La tête est l'organe le plus vulnérable face aux chutes d'objets, heurts contre des structures fixes et risques d'arc électrique. Les casques distribués par ORSAP garantissent une absorption d'énergie cinétique irréprochable et un équilibre parfait.",
    description: "Notre sélection comprend des casques de chantier standards (EN 397), des casques pour travaux en hauteur sans visière avec jugulaire de sécurité 4 points, des casques isolants électriques jusqu'à 1000V (EN 50365) ainsi que des casquettes textiles anti-heurt à coque ABS (EN 812).",
    seoClusters: ["Protection de la tête"],
    targetSectors: ["BTP & Travaux Publics", "Industrie Chimique & Pétrolière", "Maintenance Industrielle", "Secteur Électrique", "Logistique"],
    normsAndStandards: [
      { code: "EN 397", label: "Casques de protection pour l'industrie", desc: "Absorption des chocs jusqu'à 5 kN, résistance à la flamme et à la pénétration." },
      { code: "EN 812", label: "Casquettes anti-heurt industrielles", desc: "Protection contre les chocs de la tête contre des objets durs et immobiles." },
      { code: "EN 50365", label: "Casques électriquement isolants", desc: "Utilisation sur installations basse tension n'excédant pas 1000V AC." }
    ],
    keyChallenges: [
      { title: "Chutes de Matériaux & Objets", desc: "Stopper les projectiles et outils chutant des échafaudages." },
      { title: "Chaleur & Transpiration", desc: "Ventilation modulable et bandeaux absorbants pour les climats arides." },
      { title: "Polyvalence des Accessoires", desc: "Fixation directe de coquilles anti-bruit, visières faciales et lampes frontales." }
    ],
    technicalFeaturesTitle: "Caractéristiques techniques avancées :",
    technicalFeatures: [
      "Calottes en ABS haute résistance aux impacts ou polyéthylène stabilisé aux UV.",
      "Molette de réglage crémaillère micrométrique pour un ajustement rapide et précis de 53 à 63 cm.",
      "Coiffes textiles à 6 ou 8 points d'ancrage avec coussinets confort en mousse respirante.",
      "Bandeaux anti-transpiration remplaçables et lavables en cuir synthétique ou éponge."
    ],
    subRangesTitle: "Gamme de casques disponibles :",
    subRanges: [
      { title: "Casques Chantier Ventilés", desc: "Aérations réglables pour un flux d'air continu et réduction de la température interne.", badge: "Best-Seller", to: "/solutions/epi/btp" },
      { title: "Casques Travail en Hauteur", desc: "Calotte compacte sans visière pour vision dégagée vers le haut et jugulaire 4 points.", badge: "Hauteur", to: "/solutions/travail-en-hauteur" },
      { title: "Casquettes Anti-Heurt", desc: "Look casquette sportive légère avec coque de protection ergonomique interne.", badge: "EN 812", to: "/solutions/epi/casques" },
      { title: "Casques Électricien Isolants", desc: "Sans aération métallique, certifiés 1000V et résistance aux projections de métal en fusion.", badge: "1000V", to: "/solutions/industrie" }
    ],
    expertAdvice: "Attention à la date de péremption : un casque de sécurité a une durée de vie limitée (généralement 3 à 5 ans selon le matériau ABS ou PE). Tout casque ayant subi un choc violent doit être immédiatement mis au rebut, même sans fissure visible.",
    faq: [
      { q: "Quand utiliser une casquette anti-heurt plutôt qu'un casque de chantier ?", a: "La casquette (EN 812) est réservée aux espaces clos sans risque de chute d'objets (mécanique sous véhicule, maintenance en combles). Sur tout chantier avec co-activité, le casque EN 397 est obligatoire." }
    ],
    linkedArticles: [
      { id: "ART-003", title: "Guide complet de la protection de la tête : Casque EN 397 vs Casquette EN 812", excerpt: "Réglementation, tests d'impact et critères de sélection selon l'environnement de travail.", clusters: ["Protection de la tête"], readTime: "5 min" },
      { id: "ART-019", title: "Date de péremption et règles de contrôle des casques de chantier", excerpt: "Comment inspecter la calotte, le harnais et identifier les signes de vieillissement prématuré.", clusters: ["Protection de la tête", "Maintenance"], readTime: "4 min" },
      { id: "ART-020", title: "Accessoires pour casques de sécurité : Visières, coquilles et jugulaires", excerpt: "Modularité et compatibilité des équipements montés sur fentes universelles 30 mm.", clusters: ["Protection de la tête", "Accessoires"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "Protection de la Tête", to: "/solutions/epi/casques" }
    ]
  },

  "epi/chaussures-securite": {
    slug: "epi/chaussures-securite",
    route: "/solutions/epi/chaussures-securite",
    category: "Protection Pieds",
    title: "Chaussures de Sécurité & Bottes de Travail",
    heroTitle: "Chaussures de Sécurité Hautes & Basses : S1P, S3, ESD & Anti-Glisse",
    subtitle: "Ergonomie, légèreté et protection certifiée EN ISO 20345 pour tous les environnements industriels et chantiers.",
    intro: "Marcher 10 000 pas par jour sur des sols en béton, dans la boue ou parmi des débris métalliques exige des chaussures de sécurité d'un confort exceptionnel. ORSAP distribue des modèles alliant semelles anti-fatigue et matériaux ultra-légers.",
    description: "Notre gamme couvre les chaussures basses respirantes pour l'intérieur (S1P), les chaussures montantes hydrofuges pour le BTP (S3), les modèles ESD pour l'électronique et les bottes en polyuréthane S5 pour les milieux chimiques et agroalimentaires. Embouts en fibre de verre non magnétique et semelles textiles anti-perforation haute ténacité.",
    seoClusters: ["Protection des pieds"],
    targetSectors: ["BTP & Gros Œuvre", "Logistique & Entrepôt", "Industrie Aéronautique & Automobile", "Agroalimentaire & Chimie", "Espaces Verts"],
    normsAndStandards: [
      { code: "EN ISO 20345:2022", label: "Norme fondamentale chaussures de sécurité", desc: "Embout de sécurité résistant à 200 Joules et compression de 15 kN." },
      { code: "S1P / S3 / S7S", label: "Niveaux de protection complets", desc: "Antistatique, absorption au talon, semelle anti-perforation et tige hydrofuge." },
      { code: "SRC / SR", label: "Adhérence maximale anti-glisse", desc: "Testée sur sol céramique avec détergent et sol acier avec glycérine." }
    ],
    keyChallenges: [
      { title: "Écrasement & Perforation", desc: "Empêcher la pénétration de clous et protéger les orteils des chutes d'objets lourds." },
      { title: "Glissades & Entorses", desc: "Semelles à profil autopurgeant et maintien anatomique de la cheville." },
      { title: "Légèreté & Confort Prolongé", desc: "Amorti talon à restitution d'énergie pour réduire les douleurs dorsales et la fatigue." }
    ],
    technicalFeaturesTitle: "Avantages de nos chaussures de sécurité :",
    technicalFeatures: [
      "Embout composite ou fibre de verre jusqu'à 50% plus léger que l'acier traditionnel.",
      "Semelle intercalaire anti-perforation textile Kevlar souple et athermique (isolation chaud/froid).",
      "Doublure respirante 3D avec traitement antibactérien et régulation thermique active.",
      "Semelles d'usure en PU double densité ou caoutchouc nitrile résistant jusqu'à 300°C (HRO)."
    ],
    subRangesTitle: "Gamme de chaussures de sécurité :",
    subRanges: [
      { title: "Chaussures Basses Légères S1P", desc: "Design basket sportive, tissu mesh respirant pour logistique et ateliers.", badge: "Légèreté", to: "/solutions/logistique" },
      { title: "Chaussures Montantes BTP S3", desc: "Cuir pleine fleur hydrofuge, maintien de cheville et sur-embout anti-choc.", badge: "BTP", to: "/solutions/epi/btp" },
      { title: "Bottes de Sécurité S5 / Polyuréthane", desc: "Imperméabilité totale, résistance aux hydrocarbures, graisses et lisiers.", badge: "Étanche", to: "/solutions/industrie" },
      { title: "Chaussures Agroalimentaire & Hygiène", desc: "Microfibre lavable en machine, semelle blanche non marquante et anti-bactérienne.", badge: "Agro", to: "/solutions/epi/chaussures-securite" }
    ],
    expertAdvice: "Pour les travailleurs effectuant des stations debout prolongées, nous préconisons des semelles à technologie d'amorti actif en polyuréthane expansé (E-TPU), qui réduisent de 40% l'impact articulaire.",
    faq: [
      { q: "Quelle est la différence entre une semelle anti-perforation acier et textile ?", a: "La semelle textile couvre 100% de la surface du pied (contre 85% pour l'acier), est plus souple, plus légère et n'est pas conductrice de chaleur ou de froid." }
    ],
    linkedArticles: [
      { id: "ART-005", title: "Guide des normes de chaussures de sécurité : S1P, S3, ESD, SRC", excerpt: "Tout savoir sur les nouvelles exigences de la norme EN ISO 20345:2022.", clusters: ["Protection des pieds"], readTime: "6 min" },
      { id: "ART-016", title: "Semelle anti-perforation : Textile haute ténacité vs Acier inoxydable", excerpt: "Avantages comparatifs en termes de flexibilité, poids et protection thermique.", clusters: ["Protection des pieds"], readTime: "5 min" },
      { id: "ART-017", title: "Chaussures de sécurité respirantes pour le travail en période estivale", excerpt: "Sélection des meilleures matières techniques pour garder les pieds au sec sous forte chaleur.", clusters: ["Protection des pieds", "Vêtements été"], readTime: "4 min" },
      { id: "ART-051", title: "Comment prévenir les glissades et chutes de plain-pied en atelier", excerpt: "Choix des profils de semelle SRC et aménagement des revêtements de sol industriels.", clusters: ["Protection des pieds", "Prévention"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "Chaussures de Sécurité", to: "/solutions/epi/chaussures-securite" }
    ]
  },

  "epi/gants": {
    slug: "epi/gants",
    route: "/solutions/epi/gants",
    category: "Protection Mains",
    title: "Gants de Protection Professionnels",
    heroTitle: "Protection des Mains : Gants de Travail Certifiés EN 388 & EN ISO 374",
    subtitle: "Gants anti-coupure, de manutention, chimiques, thermiques et diélectriques pour préserver vos mains sans perdre en dextérité.",
    intro: "Les mains constituent le premier outil de vos opérateurs et représentent près d'un tiers des accidents du travail avec arrêt. ORSAP propose une gamme complète de gants professionnels répondant à chaque niveau d'agression mécanique, thermique ou chimique.",
    description: "Grâce à des partenariats avec les leaders mondiaux du tricotage technique (Ansell, Delta Plus, Honeywell), nous mettons à votre disposition des gants ergonomiques offrant un grip exceptionnel en milieu sec, huileux ou humide, tout en garantissant une sensation seconde peau.",
    seoClusters: ["Protection des mains"],
    targetSectors: ["Métallurgie & Tôlerie", "Logistique & Messagerie", "Industrie Chimique & Pharmaceutique", "BTP & Maçonnerie", "Automobile"],
    normsAndStandards: [
      { code: "EN 388:2016+A1:2018", label: "Protection contre les risques mécaniques", desc: "Indices d'abrasion (1-4), coupure coup test (1-5), déchirure (1-4), perforation (1-4) et coupure TDM (A-F)." },
      { code: "EN ISO 374-1:2016", label: "Protection contre les produits chimiques", desc: "Types A, B ou C selon le temps de perméation face à une liste normalisée de solvants et acides." },
      { code: "EN 407:2020", label: "Protection thermique", desc: "Résistance à la chaleur de contact jusqu'à 500°C et aux projections de métal en fusion." }
    ],
    keyChallenges: [
      { title: "Coupures par Bords Tranchants", desc: "Neutraliser le risque de lacération lors du travail du verre et de la tôle." },
      { title: "Brûlures Chimiques & Dermites", desc: "Étanchéité totale face aux solvants, huiles de coupe et acides." },
      { title: "Précision & Dextérité", desc: "Manipuler de petites pièces et composants sans retirer les gants." }
    ],
    technicalFeaturesTitle: "Nos technologies d'enduction et de fibres :",
    technicalFeatures: [
      "Fibres techniques HPPE, Dyneema®, Kevlar® et fils d'acier inoxydable pour une résistance anti-coupure record.",
      "Enductions en polyuréthane (PU) microporeux pour une respirabilité et un toucher incomparables.",
      "Mousse de nitrile sablée 'Sandy Finish' pour une préhension infaillible des pièces grasses ou huileuses.",
      "Formulations hypoallergéniques sans solvants DMF pour le respect des peaux sensibles."
    ],
    subRangesTitle: "Sous-catégories de gants professionnels :",
    subRanges: [
      { title: "Gants Anti-Coupure (Niveaux B à F)", desc: "Protection renforcée pour tôlerie, découpe et manipulation de verre.", badge: "Anti-Coupure", to: "/solutions/epi/gants/anti-coupure" },
      { title: "Gants de Manutention & Assemblage", desc: "Grip optimisé, résistance à l'abrasion et légèreté pour manutentionnaires.", badge: "Manutention", to: "/solutions/epi/gants/manutention" },
      { title: "Gants Chimiques Étanches", desc: "Nitrile lourd, néoprène ou PVC pour la manipulation de liquides dangereux.", badge: "EN 374", to: "/solutions/industrie" },
      { title: "Gants Chaleur & Soudeur", desc: "Croûte de cuir traitée anti-chaleur ou tricot aramide résistant jusqu'à 350°C.", badge: "EN 407", to: "/solutions/industrie" }
    ],
    expertAdvice: "Pour tester l'adéquation d'un gant, réalisez toujours un essai de préhension avec vos pièces réelles : un gant trop épais fatigue les muscles de la main, tandis qu'un gant trop fin expose à la blessure.",
    faq: [
      { q: "Comment lire le marquage EN 388 sous le pictogramme ?", a: "Le marquage comporte 6 caractères (ex: 4X42C) correspondant respectivement à l'abrasion, la coupure classique, la déchirure, la perforation, la coupure TDM (ISO) et la protection aux chocs (P)." }
    ],
    linkedArticles: [
      { id: "ART-004", title: "Comment choisir ses gants de protection selon la norme EN 388", excerpt: "Déchiffrer les indices de performance mécanique pour chaque poste d'atelier.", clusters: ["Protection des mains"], readTime: "5 min" },
      { id: "ART-014", title: "Guide de sélection des gants pour risques chimiques et biologiques", excerpt: "Tableau de perméation des matériaux (Nitrile, Néoprène, Latex, Butyle) face aux solvants.", clusters: ["Protection des mains", "Risque chimique"], readTime: "6 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "Gants de Protection", to: "/solutions/epi/gants" }
    ]
  },

  "epi/gants/anti-coupure": {
    slug: "epi/gants/anti-coupure",
    route: "/solutions/epi/gants/anti-coupure",
    category: "Gants Anti-Coupure",
    title: "Gants de Protection Anti-Coupure",
    heroTitle: "Gants Anti-Coupure Haute Performance : Niveaux B à F (ISO 13997)",
    subtitle: "Tricots techniques en HPPE, Kevlar et acier inoxydable pour la manipulation sécurisée de tôles, profilés et verre.",
    intro: "La manipulation de bords vifs, de bavures de découpe laser ou de vitrages tranchants requiert des gants anti-coupure de très haut niveau. ORSAP vous fournit des protections certifiées testées selon la méthode rigoureuse TDM-100.",
    description: "Du niveau B pour les travaux d'ébavurage léger jusqu'au niveau F (résistance supérieure à 30 Newtons) pour l'industrie lourde et le recyclage des métaux, nos gants anti-coupure préservent la motricité fine des doigts tout en constituant une barrière infranchissable pour les arêtes acérées.",
    seoClusters: ["Protection des mains"],
    targetSectors: ["Métallurgie & Chaudronnerie", "Miroiterie & Verrerie", "Découpe & Emboutissage", "Recyclage & Tri de Métaux", "Maintenance"],
    normsAndStandards: [
      { code: "ISO 13997 (TDM-100)", label: "Échelle de coupure de A à F", desc: "Mesure de la force requise pour couper le matériau sur une course de 20 mm." },
      { code: "Niveau D (15-22 N)", label: "Protection élevée", desc: "Recommandé pour manipulation de tôles huilées et vitrages non ébavurés." },
      { code: "Niveau F (> 30 N)", label: "Protection extrême", desc: "Sécurité maximale pour le désossage, le déchiquetage et la sidérurgie." }
    ],
    keyChallenges: [
      { title: "Arêtes Vives & Copeaux Métalliques", desc: "Éviter les entailles profondes et les sections tendineuses." },
      { title: "Préhension des Pièces Huilées", desc: "Enduction micro-nitrile drainant l'huile pour éviter le glissement de la pièce." },
      { title: "Durabilité au Frottement", desc: "Renfort entre le pouce et l'index pour prolonger la durée d'utilisation de 50%." }
    ],
    technicalFeaturesTitle: "Points forts des gants anti-coupure ORSAP :",
    technicalFeatures: [
      "Jauge 13, 15 et 18 ultra-fine pour un toucher tactile précis.",
      "Enduction nitrile sablée respirante sur la paume et le bout des doigts.",
      "Renfort crotch (fourche pouce-index) en cuir ou nitrile renforcé contre l'usure par frottement.",
      "Compatibilité avec écrans tactiles pour une utilisation fluide des scanners et tablettes en usine."
    ],
    subRangesTitle: "Niveaux de protection anti-coupure :",
    subRanges: [
      { title: "Niveau B & C (Moyen Risque)", desc: "Assemblage mécanique, électroménager, montage de menuiseries.", badge: "Niveau B/C", to: "/solutions/epi/gants" },
      { title: "Niveau D & E (Haut Risque)", desc: "Tôlerie automobile, pliage, plasturgie et chaudronnerie.", badge: "Niveau D/E", to: "/solutions/epi/gants/anti-coupure" },
      { title: "Niveau F (Risque Extrême)", desc: "Manipulation de verre brut, profilés acier tranchants, découpe industrielle.", badge: "Niveau F", to: "/solutions/industrie" }
    ],
    expertAdvice: "Attention : un gant anti-coupure ne protège pas contre le risque de perforation par pointe fine (ex: aiguilles médicales) ni contre le happement par des machines tournantes (perceuses, meules). Pour les machines tournantes, le port de gants peut être formellement contre-indiqué.",
    faq: [
      { q: "Quelle est la différence entre le niveau 5 classique et le niveau F ?", a: "L'ancien test 'Coup Test' (noté de 1 à 5) était faussé par l'émoussement des lames sur les fibres de verre. La norme ISO 13997 (notée de A à F) applique une force linéaire constante et certifie la résistance réelle." }
    ],
    linkedArticles: [
      { id: "ART-013", title: "Gants anti-coupure : Comprendre les niveaux A à F de la norme ISO 13997", excerpt: "Comment choisir le juste niveau de protection sans sacrifier la dextérité des opérateurs.", clusters: ["Protection des mains"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "Gants", to: "/solutions/epi/gants" },
      { label: "Anti-Coupure", to: "/solutions/epi/gants/anti-coupure" }
    ]
  },

  "epi/gants/manutention": {
    slug: "epi/gants/manutention",
    route: "/solutions/epi/gants/manutention",
    category: "Gants Manutention",
    title: "Gants de Manutention & Travaux de Précision",
    heroTitle: "Gants de Manutention Légers : Grip, Dextérité & Anti-Fatigue",
    subtitle: "Gants tricotés avec enduction PU ou mousse de nitrile pour la logistique, l'emballage et les lignes de montage.",
    intro: "Pour déplacer des cartons, charger des palettes ou assembler des faisceaux électriques, les manutentionnaires ont besoin de gants très respirants, offrant un excellent grip et évitant la formation d'ampoules et irritations.",
    description: "Les gants de manutention ORSAP sont conçus pour un usage intensif quotidien. Leur tricotage en polyamide ou polyester sans couture épouse parfaitement la morphologie de la main, tandis que leur enduction sur la paume assure une prise ferme sans glissement.",
    seoClusters: ["Manutention"],
    targetSectors: ["Logistique & Préparation de Commandes", "Commerce & Grande Distribution", "Agencement & Montage de Meubles", "Artisanat & Second Œuvre"],
    normsAndStandards: [
      { code: "EN 388 (4121X)", label: "Excellente résistance à l'abrasion", desc: "Niveau 4 pour résister à des milliers de cycles de frottement contre cartons et bois." },
      { code: "Oeko-Tex® Standard 100", label: "Innocuité dermatologique", desc: "Garantie sans substances chimiques nocives pour la peau lors du port prolongé." }
    ],
    keyChallenges: [
      { title: "Fatigue Musculaire de la Main", desc: "Réduire l'effort de serrage grâce à une enduction ultra-adhérente." },
      { title: "Transpiration Excessive", desc: "Dos de la main aéré pour évacuer la chaleur pendant les cadences élevées." },
      { title: "Précision Tactile", desc: "Saisie rapide de petites vis, rubans adhésifs et utilisation de terminaux code-barres." }
    ],
    technicalFeaturesTitle: "Spécifications techniques :",
    technicalFeatures: [
      "Enduction polyuréthane (PU) fine pour un toucher mécanique maximal.",
      "Poignet tricot élastiqué assurant un maintien optimal et évitant l'intrusion de poussières.",
      "Lavables et réutilisables pour une durée de vie prolongée.",
      "Disponibles du format XS (taille 6) au XXL (taille 11) pour toutes les morphologies."
    ],
    subRangesTitle: "Modèles adaptés à vos opérations :",
    subRanges: [
      { title: "Gants PU Blancs & Gris", desc: "Idéals pour les opérations propres, l'électronique et le contrôle qualité.", badge: "Précision", to: "/solutions/manutention" },
      { title: "Gants Mousse de Nitrile Noirs", desc: "Résistance accrue aux salissures et environnements poussiéreux ou huileux.", badge: "Robuste", to: "/solutions/manutention" },
      { title: "Gants à Picots PVC", desc: "Adhérence renforcée pour la manipulation intensive de cartons lisses.", badge: "Grip Max", to: "/solutions/logistique" }
    ],
    expertAdvice: "Le saviez-vous ? L'utilisation de gants de manutention adaptés permet de réduire le temps de manipulation de colis de 8% tout en éliminant les risques de coupures par papier ou ruban adhésif.",
    faq: [
      { q: "Combien de temps dure une paire de gants de manutention en entrepôt ?", a: "En utilisation intensive 8h/jour, une paire de qualité supérieure en jauge 15 dure entre 2 à 4 semaines, contre quelques jours pour des modèles d'entrée de gamme." }
    ],
    linkedArticles: [
      { id: "ART-015", title: "Optimiser le confort et le grip des gants de manutention en logistique", excerpt: "Comparatif des enductions PU, Nitrile et Latex pour la préparation de commandes.", clusters: ["Manutention", "Logistique"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "Gants", to: "/solutions/epi/gants" },
      { label: "Manutention", to: "/solutions/epi/gants/manutention" }
    ]
  },

  "epi/protection-auditive": {
    slug: "epi/protection-auditive",
    route: "/solutions/epi/protection-auditive",
    category: "Protection Ouïe",
    title: "Protection Auditive — Bouchons & Casques Anti-Bruit",
    heroTitle: "Protection Auditive Professionnelle : Bouchons & Casques EN 352",
    subtitle: "Solutions d'atténuation phonique adaptées pour prévenir la surdité professionnelle en milieu bruyant.",
    intro: "L'exposition quotidienne à des niveaux sonores supérieurs à 80 dB(A) provoque des lésions auditives irréversibles. ORSAP fournit des équipements de protection auditive performants qui réduisent le bruit nocif tout en préservant la perception des signaux d'alerte et des conversations.",
    description: "Notre offre comprend des bouchons d'oreilles en mousse polyuréthane à expansion lente (jetables ou avec cordelette), des bouchons réutilisables en élastomère thermoplastique, des arceaux antibruit ultra-légers ainsi que des casques antibruit passifs ou communicants à haute atténuation (SNR jusqu'à 37 dB).",
    seoClusters: ["Bruit", "Protection auditive"],
    targetSectors: ["Usinage & Métallurgie", "Chantiers BTP & Démolition", "Aéroports & Pistes", "Imprimerie & Papeterie", "Agroalimentaire"],
    normsAndStandards: [
      { code: "EN 352-1", label: "Serre-têtes antibruit", desc: "Casques passifs à coquilles rembourrées avec pression constante." },
      { code: "EN 352-2", label: "Bouchons d'oreilles", desc: "Modèles jetables, réutilisables ou moulés sur mesure." },
      { code: "Valeur SNR", label: "Indice d'affaiblissement global (Single Number Rating)", desc: "Quantifie la réduction moyenne du niveau sonore en décibels." }
    ],
    keyChallenges: [
      { title: "Surdité Professionnelle & Acouphènes", desc: "Bloquer les pics de décibels des presses, compresseurs et marteaux piqueurs." },
      { title: "Sur-protection & Isolement", desc: "Éviter d'isoler excessivement l'opérateur pour qu'il entende les alarmes et chariots." },
      { title: "Confort dans le Conduit Auditif", desc: "Mousses hypoallergéniques à mémoire de forme sans sensation de pression excessive." }
    ],
    technicalFeaturesTitle: "Nos critères de sélection auditive :",
    technicalFeatures: [
      "Bouchons détectables aux métaux et rayons X pour les industries agroalimentaires et pharmaceutiques.",
      "Distributeurs muraux de bouchons pour un accès hygiénique et économique à l'entrée des ateliers.",
      "Casques antibruit montables directement sur les fentes des casques de chantier.",
      "Coussins de casques remplis de liquide et mousse pour une étanchéité acoustique parfaite même avec lunettes."
    ],
    subRangesTitle: "Gamme de protection auditive :",
    subRanges: [
      { title: "Bouchons Jetables en Mousse", desc: "SNR 34 à 37 dB, insertion facile, forme conique s'adaptant à tous les conduits.", badge: "Économique", to: "/solutions/industrie" },
      { title: "Bouchons Réutilisables avec Cordelette", desc: "Lavables, collerettes multiples, boîtier de rangement individuel.", badge: "Pratique", to: "/solutions/epi/btp" },
      { title: "Casques Antibruit Passifs", desc: "SNR 26 à 35 dB, serre-tête réglable rembourré, coquilles profilées.", badge: "Haute Protection", to: "/solutions/epi/casques" },
      { title: "Casques Électroniques Actifs", desc: "Amplification des voix et coupure instantanée des bruits impulsionnels violents.", badge: "High-Tech", to: "/solutions/industrie" }
    ],
    expertAdvice: "Règle de calcul : Le niveau sonore perçu sous le protecteur doit idéalement se situer entre 70 et 75 dB(A). Si le bruit d'atelier est de 100 dB(A), un protecteur avec un SNR de 28 dB est parfaitement adapté (100 - 28 = 72 dB).",
    faq: [
      { q: "À partir de quel niveau sonore le port de protections auditives est-il obligatoire ?", a: "Dès 80 dB(A), les protections doivent être mises à disposition. À partir de 85 dB(A) (seuil d'action supérieur), le port effectif est strictement obligatoire." }
    ],
    linkedArticles: [
      { id: "ART-022", title: "Bruit au travail : Seuils de dangerosité en dB(A) et obligations légales", excerpt: "Mesure de l'exposition sonore quotidienne et mise en place du plan de prévention.", clusters: ["Bruit", "Protection auditive"], readTime: "5 min" },
      { id: "ART-023", title: "Casques antibruit vs Bouchons d'oreilles : Comment calculer le SNR idéal", excerpt: "Méthode HML et sélection du bon niveau d'atténuation acoustique.", clusters: ["Protection auditive"], readTime: "6 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "Protection Auditive", to: "/solutions/epi/protection-auditive" }
    ]
  },

  "epi/protection-respiratoire": {
    slug: "epi/protection-respiratoire",
    route: "/solutions/epi/protection-respiratoire",
    category: "Protection Respiratoire",
    title: "Protection Respiratoire — Masques & Filtres",
    heroTitle: "Protection Respiratoire Professionnelle : Masques FFP2, FFP3 & Filtres ABEK",
    subtitle: "Équipements filtrants certifiés contre les poussières nocives, fumées de soudage, vapeurs toxiques et gaz industriels.",
    intro: "Inhaler des particules fines de silice, des solvants ou des gaz toxiques expose à des pathologies pulmonaires graves. ORSAP vous conseille et vous fournit les systèmes de protection respiratoire adaptés à la concentration et à la nature exacte de vos polluants.",
    description: "Notre catalogue intègre des masques pliables ou en coque FFP1/FFP2/FFP3 avec ou sans soupape d'expiration Cool Flow, des demi-masques réutilisables bi-filtres en silicone haute étanchéité, ainsi que des cartouches de filtration combinées (poussières P3, vapeurs organiques A2, gaz acides B2E2, ammoniac K2).",
    seoClusters: ["Protection respiratoire"],
    targetSectors: ["Chimie & Peinture Industrielle", "BTP & Ponçage de Béton", "Menuiserie & Travail du Bois", "Soudage & Métallurgie", "Agriculture & Traitement Phytosanitaire"],
    normsAndStandards: [
      { code: "EN 149:2001+A1:2009", label: "Demi-masques filtrants contre les particules (FFP)", desc: "FFP1 (80% filtration), FFP2 (94% filtration), FFP3 (99% filtration)." },
      { code: "EN 140 / EN 136", label: "Demi-masques et Masques complets", desc: "Corps de masque réutilisable avec raccord à baïonnette ou fileté standard." },
      { code: "EN 14387", label: "Filtres anti-gaz et combinés", desc: "Code couleur normalisé : Marron (Vapeurs A), Gris (Inorganiques B), Jaune (Acides E), Vert (Ammoniac K)." }
    ],
    keyChallenges: [
      { title: "Poussières Fines & Silice Cristalline", desc: "Filtration des particules cancérogènes et poussières d'amiante avec des filtres P3." },
      { title: "Vapeurs de Solvants & Peintures", desc: "Absorber les composés organiques volatils (COV) lors de l'application au pistolet." },
      { title: "Résistance Respiratoire & Buée", desc: "Soupape expiratoire pour évacuer l'humidité et empêcher la formation de buée sur les lunettes." }
    ],
    technicalFeaturesTitle: "Points clés de notre gamme respiratoire :",
    technicalFeatures: [
      "Demi-masques ergonomiques en silicone souple épousant parfaitement l'arête nasale.",
      "Fixation rapide des cartouches avec système à baïonnette clic audible pour une étanchéité garantie.",
      "Matériaux filtrants électrostatiques haute performance offrant une faible résistance respiratoire.",
      "Kits complets prêts à l'emploi spécifiques 'Peinture', 'Soudage' et 'Poussières toxiques'."
    ],
    subRangesTitle: "Gamme d'équipements respiratoires :",
    subRanges: [
      { title: "Masques Jetables FFP2 & FFP3", desc: "Avec soupape, barrette nasale ajustable et élastiques sans latex.", badge: "Usage Unique", to: "/solutions/epi/btp" },
      { title: "Demi-Masques Bi-Filtres Réutilisables", desc: "Excellente répartition du poids, champ de vision dégagé et pièces de rechange.", badge: "Confort", to: "/solutions/industrie" },
      { title: "Cartouches & Filtres ABEK1P3", desc: "Protection combinée contre les gaz, vapeurs et aérosols solides.", badge: "Norme EN 14387", to: "/solutions/industrie" },
      { title: "Masques Panoramiques Complets", desc: "Protection simultanée des yeux, du visage et des voies respiratoires.", badge: "Intégral", to: "/solutions/epi/casques" }
    ],
    expertAdvice: "Le saviez-vous ? Pour être efficace, un appareil de protection respiratoire à masque étanche doit être porté sur une peau rasée de près : la présence d'une barbe de 3 jours multiplie par 20 le taux de fuite vers l'intérieur.",
    faq: [
      { q: "Quelle est la différence entre un masque chirurgical et un masque FFP2 ?", a: "Le masque chirurgical protège uniquement l'environnement contre les gouttelettes émises par le porteur. Le masque FFP2 protège le porteur contre l'inhalation des aérosols et particules fines en suspension." }
    ],
    linkedArticles: [
      { id: "ART-024", title: "Guide de choix des masques respiratoires : FFP1, FFP2, FFP3 et filtres ABEK", excerpt: "Identifier la classe de filtration selon la VLEP (Valeur Limite d'Exposition Professionnelle).", clusters: ["Protection respiratoire"], readTime: "6 min" },
      { id: "ART-045", title: "Protection respiratoire en cabine de peinture : Solvants et COV", excerpt: "Sélection des cartouches A2P3 et vérification de la saturation des filtres au charbon actif.", clusters: ["Protection respiratoire", "Risque chimique"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "Protection Respiratoire", to: "/solutions/epi/protection-respiratoire" }
    ]
  },

  "epi/protection-yeux": {
    slug: "epi/protection-yeux",
    route: "/solutions/epi/protection-yeux",
    category: "Protection Yeux",
    title: "Protection des Yeux & du Visage",
    heroTitle: "Lunettes de Sécurité, Sur-Lunettes & Écrans Faciaux EN 166",
    subtitle: "Protection oculaire haute résistance contre les éclats mécaniques, poussières, rayons UV et projections chimiques.",
    intro: "Les yeux sont d'une extrême sensibilité : une simple étincelle de meulage ou une micro-gouttelette d'acide peut entraîner une cécité partielle ou définitive. ORSAP propose des oculaires de sécurité traités anti-rayures et anti-buée pour une vision claire en toute circonstance.",
    description: "Notre gamme comprend des lunettes de protection à branches ergonomiques et design sportif, des sur-lunettes compatibles avec lunettes correctrices, des lunettes-masques étanches à ventilation indirecte contre les liquides et gaz, ainsi que des visières faciales relevables pour les travaux de tronçonnage et meulage lourd.",
    seoClusters: ["Protection des yeux"],
    targetSectors: ["Usinage, Meulage & Tournage", "Laboratoires & Chimie", "Soudage & Brasage", "BTP & Chantier", "Agroalimentaire"],
    normsAndStandards: [
      { code: "EN 166", label: "Spécifications de protection oculaire", desc: "Norme cadre définissant la classe optique (1 = port permanent) et la résistance mécanique." },
      { code: "Marquage F / B / A", label: "Résistance aux impacts", desc: "F (bille 45 m/s), B (bille 120 m/s - lunettes masques), A (bille 190 m/s - visières)." },
      { code: "EN 170 / EN 172", label: "Filtres ultraviolets et solaires", desc: "Filtration des rayonnements UV nocifs et verres teintés fumés pour l'extérieur." }
    ],
    keyChallenges: [
      { title: "Projections de Copeaux & Étincelles", desc: "Résistance balistique aux particules lancées à haute vitesse lors du meulage." },
      { title: "Buée & Rayures", desc: "Traitements permanents hydrophobes pour garder une visibilité totale sans retirer ses lunettes." },
      { title: "Projections de Liquides Agressifs", desc: "Étanchéité périphérique totale avec joint mousse ou lunette-masque fermée." }
    ],
    technicalFeaturesTitle: "Qualités de notre protection oculaire :",
    technicalFeatures: [
      "Oculaires en polycarbonate de classe optique 1 (zéro distorsion visuelle pour éviter maux de tête).",
      "Revêtement Platinum® anti-buée et anti-rayures certifié K et N sur les deux faces des verres.",
      "Branches bimatière ultra-souples et pont de nez anti-glisse ajustable.",
      "Teintes disponibles : Incolore (intérieur), Fumée (travaux extérieurs ensoleillés), Jaune (amplification des contrastes)."
    ],
    subRangesTitle: "Modèles de protection oculaire :",
    subRanges: [
      { title: "Lunettes de Sécurité à Branches", desc: "Légères (25g), branches inclinables, protection latérale intégrée.", badge: "Quotidien", to: "/solutions/epi/btp" },
      { title: "Sur-Lunettes de Protection", desc: "Large champ de vision, conçues pour être portées par-dessus les lunettes de vue.", badge: "Universel", to: "/solutions/industrie" },
      { title: "Lunettes-Masques Étanches", desc: "Bandeau élastique large, aération indirecte, protection liquide (3) et poussière (4).", badge: "Chimie/Poussière", to: "/solutions/industrie" },
      { title: "Écrans Faciaux & Visières", desc: "Protection intégrale du visage contre les projections thermiques et de métal en fusion.", badge: "EN 166 (B/A)", to: "/solutions/epi/casques" }
    ],
    expertAdvice: "90% des traumatismes oculaires auraient pu être évités par le port de lunettes de sécurité conformes. Privilégiez des modèles avec traitement anti-buée certifié N pour éviter que l'opérateur ne doive retirer ses lunettes pour les essuyer.",
    faq: [
      { q: "Peut-on porter des lunettes de sécurité ordinaires pour souder ?", a: "Non, le soudage exige des filtres spécifiques conformes à la norme EN 169 (échelons de teinte DIN 5 à 13) pour filtrer les rayonnements infrarouges et ultraviolets intenses." }
    ],
    linkedArticles: [
      { id: "ART-006", title: "Guide de la protection oculaire au travail : Norme EN 166 et marquages", excerpt: "Comprendre les symboles de classe optique, résistance aux impacts et traitements de surface.", clusters: ["Protection des yeux"], readTime: "5 min" },
      { id: "ART-021", title: "Traitements anti-buée et anti-rayures : Pourquoi choisir la certification K et N", excerpt: "Performance durable des oculaires techniques dans les environnements humides et poussiéreux.", clusters: ["Protection des yeux"], readTime: "4 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "Protection des Yeux", to: "/solutions/epi/protection-yeux" }
    ]
  },

  "industrie": {
    slug: "industrie",
    route: "/solutions/industrie",
    category: "Industrie",
    title: "Solutions Industrie & Risques Industriels",
    heroTitle: "Solutions de Sécurité Industrielle, Consignation & Protection Machines",
    subtitle: "Sécurisation des lignes de production, procédures LOTO de consignation, rétention de fluides et maintenance zéro risque.",
    intro: "L'environnement industriel combine des risques énergétiques majeurs : tensions électriques, fluides sous pression, pièces mécaniques en rotation et produits chimiques agressifs. ORSAP accompagne les directeurs d'usine et responsables QHSE pour sécuriser leurs ateliers.",
    description: "Notre offre industrielle intègre des solutions complètes de condamnation et consignation (cadenas LOTO, moraillons, bloque-vannes), des bacs et armoires de rétention pour produits polluants, des tapis anti-fatigue industriels ainsi que de la signalétique de sécurité normalisée.",
    seoClusters: ["Risques industriels"],
    targetSectors: ["Industrie Manufacturière", "Pétrochimie & Raffinage", "Sidérurgie & Métallurgie", "Cimenteries & Mines", "Automobile"],
    normsAndStandards: [
      { code: "Norme NF C 18-510 / OSHA 1910.147", label: "Consignation et maîtrise des énergies dangereuses (LOTO)", desc: "Procédure en 5 étapes pour neutraliser les énergies électrique, mécanique, hydraulique et pneumatique." },
      { code: "Directives Machines 2006/42/CE", label: "Sécurité des équipements de travail", desc: "Protection des zones d'écrasement, carters de sécurité et arrêts d'urgence." },
      { code: "ISO 7010", label: "Signalisation graphique de sécurité", desc: "Pictogrammes normalisés de danger, obligation, interdiction et secours." }
    ],
    keyChallenges: [
      { title: "Redémarrage Intempestif de Machine", desc: "Empêcher la remise sous tension d'une machine lors d'une opération de maintenance." },
      { title: "Fuites & Déversements Toxiques", desc: "Contenir immédiatement les hydrocarbures et produits chimiques dangereux." },
      { title: "Conformité des Audits & VGP", desc: "Fournir un matériel certifié pour réussir les audits de conformité réglementaire." }
    ],
    technicalFeaturesTitle: "Nos solutions pour l'industrie :",
    technicalFeatures: [
      "Systèmes complets de consignation LOTO (Lockout / Tagout) : cadenas diélectriques, stations de consignation.",
      "Kits d'absorbants industriels d'urgence (rouleaux, boudins, coussins) pour huiles et produits chimiques.",
      "Bacs de rétention en polyéthylène haute densité et acier galvanisé pour fûts et cuves IBC 1000L.",
      "Tapis d'atelier ergonomiques et caillebotis antidérapants résistants aux copeaux et aux huiles."
    ],
    subRangesTitle: "Domaines d'intervention industrielle :",
    subRanges: [
      { title: "Consignation LOTO", desc: "Cadenas de sécurité, moraillons d'extension, bloque-disjoncteurs et étiquettes.", badge: "LOTO", to: "/solutions/industrie/consignation-loto" },
      { title: "Rétention & Dépollution", desc: "Plates-formes de rétention, armoires de sécurité coupe-feu et kits d'intervention.", badge: "Environnement", to: "/solutions/industrie/retention-depollution" },
      { title: "Signalétique & Marquage au Sol", desc: "Peintures époxy, rubans thermocollants et panneaux de danger ISO 7010.", badge: "ISO 7010", to: "/solutions/logistique/signalisation" },
      { title: "Maintenance & Outillage Isolé", desc: "Outils à main isolés 1000V conformes IEC 60900 pour armoires électriques.", badge: "1000V", to: "/solutions/industrie/outillage-isole" }
    ],
    expertAdvice: "La consignation LOTO sauve des vies : 80% des accidents graves en maintenance industrielle sont dus à l'absence de cadenassage de l'énergie résiduelle (pression pneumatique résiduelle, gravité d'une masse en hauteur).",
    faq: [
      { q: "Qu'est-ce que le principe 'Une personne, Un cadenas' ?", a: "C'est la règle fondamentale de la consignation : chaque technicien intervenant doit poser son propre cadenas avec une clé unique. La machine ne peut être redémarrée tant que le dernier intervenant n'a pas retiré son cadenas personnel." }
    ],
    linkedArticles: [
      { id: "ART-043", title: "Consignation industrielle LOTO : Procédure étape par étape et matériel obligatoire", excerpt: "Guide pratique pour mettre en œuvre le cadenassage électrique, pneumatique et mécanique.", clusters: ["Risques industriels", "Consignation"], readTime: "7 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Solutions Industrie", to: "/solutions/industrie" }
    ]
  },

  "logistique": {
    slug: "logistique",
    route: "/solutions/logistique",
    category: "Logistique",
    title: "Solutions Logistique & Sécurité en Entrepôt",
    heroTitle: "Sécurité Logistique & Entrepôt : Séparation des Flux, Chariots & Piétons",
    subtitle: "Aménagement des quais, protection des racks de stockage, signalisation et EPI pour plateformes logistiques sécurisées.",
    intro: "L'entrepôt logistique est un lieu d'intense co-activité où se croisent chariots élévateurs, préparateurs de commandes à pied et flux de camions aux quais de déchargement. ORSAP conçoit et distribue des solutions pour éliminer les risques de collision et d'effondrement.",
    description: "De la protection des échelles de rayonnages par sabots antichoc flexibles jusqu'aux barrières de guidage piéton à mémoire de forme, nos solutions sécurisent vos zones de stockage, vos allées de circulation et vos zones de transbordement.",
    seoClusters: ["Chariots", "Circulation", "EPI", "Entrepôt", "Logistique"],
    targetSectors: ["Hubs Logistiques & Supply Chain", "Messagerie & Transport", "Entrepôts Frigorifiques", "Centres de Distribution E-commerce", "Stockage Industriel"],
    normsAndStandards: [
      { code: "Norme EN 15635", label: "Contrôle et maintenance des rayonnages à palettes", desc: "Obligation de protection des montants de racks et audits périodiques de déformation." },
      { code: "Code de la Route & Sécurité Interne", label: "Plan de circulation en entreprise", desc: "Séparation physique des voies piétonnes et des couloirs de circulation d'engins." },
      { code: "EN ISO 20471", label: "Haute visibilité pour caristes et piétons", desc: "Port obligatoire de gilets et vêtements fluo classe 2 pour tout visiteur ou travailleur en entrepôt." }
    ],
    keyChallenges: [
      { title: "Collisions Chariots / Piétons", desc: "Séparer hermétiquement les allées de marche des zones d'évolution des chariots." },
      { title: "Chocs contre les Rayonnages", desc: "Absorber les impacts de fourches pour éviter l'effet domino d'effondrement de racks." },
      { title: "Chutes de Quai", desc: "Sécuriser les portes de quai ouvertes et caler les remorques lors du chargement." }
    ],
    technicalFeaturesTitle: "Nos équipements pour plates-formes logistiques :",
    technicalFeatures: [
      "Protections d'extrémités de racks et sabots métalliques ou polymère à haute absorption d'énergie.",
      "Barrières de circulation piétonne modulables résistantes à des impacts jusqu'à 6 000 Joules.",
      "Miroirs convexes grand angle de sécurité d'intersection incassables pour carrefours sans visibilité.",
      "Projecteurs LED 'Blue Spot' et 'Red Line' projetant une zone de sécurité visuelle au sol autour du chariot."
    ],
    subRangesTitle: "Solutions de sécurisation pour entrepôts :",
    subRanges: [
      { title: "Protections de Rayonnage", desc: "Sabots de montants, protections d'allées et butoirs de fond de travée.", badge: "Anti-Choc", to: "/solutions/logistique/protection-rayonnage" },
      { title: "Barrières Piétons / Engins", desc: "Barrières flexibles à mémoire de forme en polymère technique haute visibilité.", badge: "Séparation", to: "/solutions/logistique/barrieres-pietons" },
      { title: "Sécurité des Quais de Chargement", desc: "Cales de roues de camion, butoirs de quai en caoutchouc et barrières d'accès.", badge: "Quais", to: "/solutions/logistique/quais-chargement" },
      { title: "Signalisation & Éclairage Sol", desc: "Projecteurs Blue Light, bandes de marquage haute résistance et panneaux de limitation.", badge: "Visibilité", to: "/solutions/logistique/signalisation" }
    ],
    expertAdvice: "Un impact de chariot élévateur à seulement 5 km/h exerce une force suffisante pour tordre un montant de rack métallique et réduire sa capacité de charge de 50%. Protégez systématiquement chaque angle d'allée.",
    faq: [
      { q: "Qu'est-ce qu'un système Blue Spot pour chariot ?", a: "C'est un projecteur LED fixé sur le toit du chariot qui projette un point bleu lumineux au sol à 5 mètres devant ou derrière l'engin, prévenant les piétons de l'arrivée du chariot dans les allées aveugles." }
    ],
    linkedArticles: [
      { id: "ART-025", title: "Plan de circulation en entrepôt : Comment séparer efficacement piétons et chariots", excerpt: "Règles d'aménagement, largeurs d'allées et marquages au sol normalisés.", clusters: ["Circulation", "Logistique"], readTime: "6 min" },
      { id: "ART-027", title: "Sécurité des chariots élévateurs : CACES, équipements et dispositifs Blue Spot", excerpt: "Guide des bonnes pratiques de conduite et équipements de prévention embarqués.", clusters: ["Chariots", "Logistique"], readTime: "5 min" },
      { id: "ART-029", title: "Protection des racks et rayonnages : Prévenir l'effondrement en entrepôt", excerpt: "Contrôle des déformations selon l'EN 15635 et installation de sabots de protection.", clusters: ["Entrepôt", "Logistique"], readTime: "6 min" },
      { id: "ART-030", title: "Sécurité des quais de chargement : Cales de camion et butoirs de quai", excerpt: "Éviter les départs inopinés de semi-remorques et les chutes de chariots depuis les quais.", clusters: ["Logistique", "Sécurité"], readTime: "5 min" },
      { id: "ART-069", title: "Audit de sécurité logistique : Grille des 50 points de contrôle", excerpt: "Le référentiel complet pour inspecter vos allées, éclairages, racks et flux logistiques.", clusters: ["Logistique", "Audit"], readTime: "7 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Solutions Logistique", to: "/solutions/logistique" }
    ]
  },

  "manutention": {
    slug: "manutention",
    route: "/solutions/manutention",
    category: "Manutention",
    title: "Solutions Manutention & Levage",
    heroTitle: "Solutions Manutention, Levage & Transpalettes : Ergonomie & Efficacité",
    subtitle: "Transpalettes manuels et électriques, gerbeurs compacts, tables élévatrices et accessoires de levage certifiés.",
    intro: "Le déplacement et le soulèvement manuel de charges lourdes sont la première cause d'arrêts de travail pour lombalgies et TMS. ORSAP fournit des équipements de manutention et de levage conçus pour soulager l'effort physique des opérateurs tout en augmentant la cadence logistique.",
    description: "Notre sélection comprend des transpalettes manuels ultra-robustes en acier ou inox (capacité 2,5T), des transpalettes électriques à batterie lithium compacts pour camions et ateliers, des gerbeurs semi-électriques et des accessoires d'élingage haute résistance (élingues chaîne Grade 80/100, élingues textiles rondes et sangles d'arrimage).",
    seoClusters: ["Manutention", "Transpalette"],
    targetSectors: ["Logistique & Messagerie", "Industrie & Ateliers d'Usinage", "BTP & Approvisionnement", "Agroalimentaire & Grande Distribution", "Magasins & Stockage"],
    normsAndStandards: [
      { code: "EN 1757-1 / EN 1757-2", label: "Sécurité des chariots de manutention", desc: "Spécifications de stabilité, freinage et commandes ergonomiques pour transpalettes et gerbeurs." },
      { code: "EN 1492-1 / EN 1492-2", label: "Élingues textiles synthétiques", desc: "Coefficient de sécurité 7:1 avec code couleur normalisé pour la charge maximale d'utilisation (CMU)." },
      { code: "EN 818-4", label: "Élingues en chaîne de levage", desc: "Assemblages à maillons courts pour levage lourd avec coefficient de sécurité 4:1." }
    ],
    keyChallenges: [
      { title: "Prévention des Troubles Musculo-Squelettiques", desc: "Éliminer le port de charges lourdes grâce à l'assistance électrique au levage." },
      { title: "Maniabilité dans les Espaces Restreints", desc: "Rayon de braquage ultra-court pour manœuvrer dans les camions et allées étroites." },
      { title: "Sécurité Absolue au Levage", desc: "Traçabilité des élingues avec plaquette d'identification CMU et certificat de conformité." }
    ],
    technicalFeaturesTitle: "Atouts techniques de notre matériel de manutention :",
    technicalFeatures: [
      "Châssis en acier renforcé avec peinture époxy cuite au four résistante aux chocs et rayures.",
      "Pompe hydraulique monobloc étanche avec soupape de surcharge automatique évitant la casse.",
      "Roues directrices et galets boggies en polyuréthane silencieux ne marquant pas les sols d'atelier.",
      "Batteries Lithium-ion légères amovibles avec charge rapide en 2h et possibilité de biberonnage."
    ],
    subRangesTitle: "Gamme de manutention et levage :",
    subRanges: [
      { title: "Transpalettes Manuels Standards & Pèseurs", desc: "Capacité 2 000 à 3 000 kg, fourches standards 1150 mm ou courtes.", badge: "Indispensable", to: "/solutions/manutention/transpalettes" },
      { title: "Transpalettes Électriques Compacts Lithium", desc: "Déplacement et levée 100% motorisés, poids plume (130 kg), idéal hayon camion.", badge: "Lithium", to: "/solutions/manutention/transpalettes-electriques" },
      { title: "Gerbeurs Manuels & Semi-Électriques", desc: "Levée jusqu'à 3,5 mètres pour chargement de rayonnages et mise à niveau de palettes.", badge: "Hauteur", to: "/solutions/manutention/gerbeurs" },
      { title: "Élingues & Accessoires de Levage", desc: "Élingues textiles 1T à 10T, manilles haute résistance, palans à chaîne et crochets.", badge: "Levage", to: "/solutions/manutention/levage" }
    ],
    expertAdvice: "Réglez vos postes de travail à hauteur d'homme : l'utilisation d'une table élévatrice ou d'un transpalette haute levée permet à l'opérateur de prélever des pièces sans jamais se pencher, réduisant la fatigue lombaire de 70%.",
    faq: [
      { q: "Quelle est la durée de vie des élingues textiles ?", a: "Les élingues textiles doivent être inspectées visuellement avant chaque utilisation et soumises à un contrôle périodique annuel. Toute élingue présentant une coupure, effilochage ou agression chimique doit être détruite immédiatement." }
    ],
    linkedArticles: [
      { id: "ART-026", title: "Transpalettes manuels vs électriques : Comparatif de rentabilité et d'ergonomie", excerpt: "Analyser les flux de palettes pour choisir la motorisation la plus productive.", clusters: ["Manutention", "Transpalette"], readTime: "5 min" },
      { id: "ART-028", title: "Guide du levage sécurisé : Choix et calcul de CMU des élingues textiles et chaînes", excerpt: "Angles d'élingage, facteurs de mode et coefficients de sécurité au levage.", clusters: ["Manutention", "Levage"], readTime: "6 min" },
      { id: "ART-035", title: "Aménagement ergonomique des postes d'emballage et de palettisation", excerpt: "Tables élévatrices et manipulateurs de charge pour supprimer les flexions répétitives.", clusters: ["Manutention", "Ergonomie"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Solutions Manutention", to: "/solutions/manutention" }
    ]
  },

  "travail-en-hauteur": {
    slug: "travail-en-hauteur",
    route: "/solutions/travail-en-hauteur",
    category: "Travail en Hauteur",
    title: "Travail en Hauteur & Sécurité Antichute",
    heroTitle: "Solutions Travail en Hauteur & Systèmes Antichute Certifiés",
    subtitle: "Sécurité intégrale pour toitures, échafaudages, pylônes et maintenance industrielle selon les normes européennes EN.",
    intro: "Les chutes de hauteur représentent la deuxième cause de mortalité au travail dans le BTP et l'industrie. La mise en place d'un système d'arrêt des chutes complet et certifié est une obligation réglementaire absolue dès lors qu'il existe un risque de dénivellation.",
    description: "ORSAP conçoit et distribue l'ensemble des éléments de la chaîne de sécurité antichute (Principe ABC) : les Ancrages (fixes ou temporaires EN 795), les Baudriers et Harnais (EN 361) et les Connecteurs / Lignes de vie / Longes avec absorbeur (EN 355 / EN 360).",
    seoClusters: ["Antichute", "Maintenance", "Toiture", "Échafaudage", "Échelles"],
    targetSectors: ["Couverture & Étanchéité Toiture", "Échafaudages & BTP", "Maintenance Industrielle & Ponts Roulants", "Télécoms & Pylônes", "Énergie Éolienne & Solaire"],
    normsAndStandards: [
      { code: "EN 363", label: "Systèmes d'arrêt des chutes", desc: "Ensemble complet comprenant point d'ancrage, harnais et dispositif de liaison." },
      { code: "EN 361", label: "Harnais d'antichute", desc: "Sangles de maintien corporel avec anneaux sternal ou dorsal marqués 'A'." },
      { code: "EN 795", label: "Dispositifs d'ancrage", desc: "Types A (points fixes), B (amovibles), C (lignes de vie câble), D (rails), E (corps morts)." }
    ],
    keyChallenges: [
      { title: "Arrêt Instantané de la Chute", desc: "Limiter la force d'impact transmise au corps humain à moins de 6 kN grâce aux absorbeurs." },
      { title: "Calcul du Tirant d'Air", desc: "Garantir une distance libre suffisante sous les pieds de l'opérateur pour éviter le contact au sol." },
      { title: "Liberté de Mouvement & Confort", desc: "Harnais avec sangles élastiques et dosserets thermoformés pour les longues journées en hauteur." }
    ],
    technicalFeaturesTitle: "Pourquoi faire confiance aux solutions Antichute ORSAP ?",
    technicalFeatures: [
      "Accompagnement technique pour l'étude d'implantation de lignes de vie et points d'ancrage.",
      "Kits antichute prêts à l'emploi spécifiques 'Toiture', 'Échafaudage' et 'Nacelle élévatrice'.",
      "Matériel premium en aluminium aéronautique et acier inoxydable résistant à la corrosion marine.",
      "Traçabilité individuelle avec numéro de série gravé et fiches de vérification périodique (VGP)."
    ],
    subRangesTitle: "Composants de la chaîne antichute :",
    subRanges: [
      { title: "Harnais Antichute (EN 361)", desc: "1, 2 ou 4 points d'accrochage, ceintures de maintien au travail et cuissards.", badge: "Baudriers", to: "/solutions/travail-en-hauteur/harnais" },
      { title: "Points d'Ancrage (EN 795)", desc: "Potelets toiture bac acier, anneaux rotatifs, trépieds espaces confinés et pinces IPN.", badge: "Ancrages", to: "/solutions/travail-en-hauteur/ancrages" },
      { title: "Lignes de Vie Câble & Rail", desc: "Lignes horizontales permanentes ou temporaires en sangle pour chantiers.", badge: "Lignes de Vie", to: "/solutions/travail-en-hauteur/lignes-de-vie" },
      { title: "Longes & Antichutes à Rappel Automatique", desc: "Longes en Y avec absorbeur d'énergie et enrouleurs à sangle/câble jusqu'à 20m.", badge: "Liaison", to: "/solutions/travail-en-hauteur/longes" }
    ],
    expertAdvice: "Le saviez-vous ? Un harnais d'antichute doit obligatoirement faire l'objet d'une Vérification Générale Périodique (VGP) au minimum tous les 12 mois par une personne qualifiée, et immédiatement après avoir arrêté une chute.",
    faq: [
      { q: "Qu'est-ce que le principe ABC de l'antichute ?", a: "A = Anchor (Point d'ancrage), B = Body wear (Harnais sur le corps), C = Connecting device (Longe, absorbeur ou enrouleur reliant le harnais à l'ancrage). Les 3 éléments sont indissociables." }
    ],
    linkedArticles: [
      { id: "ART-007", title: "Guide complet du travail en hauteur : Réglementation, normes et système ABC", excerpt: "Les fondamentaux légaux et techniques pour sécuriser vos interventions en élévation.", clusters: ["Antichute", "Réglementation"], readTime: "6 min" },
      { id: "ART-012", title: "Calcul du tirant d'air : Comment éviter l'impact au sol lors d'une chute", excerpt: "Formule de calcul précise intégrant longueur de longe, déploiement de l'absorbeur et taille de l'opérateur.", clusters: ["Antichute", "Sécurité"], readTime: "5 min" },
      { id: "ART-052", title: "Sécurité sur toitures industrielles et bac acier : Lignes de vie et passerelles", excerpt: "Sécuriser l'accès aux panneaux photovoltaïques et unités de climatisation en toiture.", clusters: ["Toiture", "Antichute"], readTime: "6 min" },
      { id: "ART-053", title: "Échafaudages fixes et roulants : Règles de montage et d'utilisation sécurisée", excerpt: "Normes NF EN 1004 et contrôles obligatoires des garde-corps et stabilisateurs.", clusters: ["Échafaudage", "Antichute"], readTime: "5 min" },
      { id: "ART-054", title: "Vérification Générale Périodique (VGP) du matériel de travail en hauteur", excerpt: "Registre de sécurité, critères de mise au rebut et traçabilité annuelle des harnais.", clusters: ["Maintenance", "Antichute"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Travail en Hauteur", to: "/solutions/travail-en-hauteur" }
    ],
    relatedSolutions: [
      { title: "Points d'Ancrage", to: "/solutions/travail-en-hauteur/ancrages", desc: "Ancrages structurels certifiés EN 795 pour toitures et charpentes." },
      { title: "Harnais Antichute", to: "/solutions/travail-en-hauteur/harnais", desc: "Harnais de sécurité ergonomiques 2 et 4 points." },
      { title: "Lignes de Vie", to: "/solutions/travail-en-hauteur/lignes-de-vie", desc: "Lignes de vie horizontales à câble inox pour toitures et terrasses." },
      { title: "Longes de Sécurité", to: "/solutions/travail-en-hauteur/longes", desc: "Longes avec absorbeur d'énergie et enrouleurs à rappel automatique." }
    ]
  },

  "travail-en-hauteur/ancrages": {
    slug: "travail-en-hauteur/ancrages",
    route: "/solutions/travail-en-hauteur/ancrages",
    category: "Ancrages",
    title: "Points d'Ancrage Antichute",
    heroTitle: "Points d'Ancrage Antichute Fixes & Amovibles : Norme EN 795",
    subtitle: "Potelets toiture, anneaux de sécurité scellés, pinces pour poutrelles IPN et ancrages temporaires.",
    intro: "Le point d'ancrage est la clé de voûte de tout système antichute : sans un ancrage solide et certifié capable de supporter une force d'arrachement d'au moins 12 kN, le meilleur harnais du monde est inutile. ORSAP fournit des ancrages pour toutes les structures.",
    description: "Nous installons et fournissons des points d'ancrage fixes de type A pour béton, acier ou bois, des ancrages transportables de type B (trépieds de sauvetage pour cuves et regards, sangles d'ancrage pour charpentes) ainsi que des corps morts de type E pour toitures terrasses sans percement.",
    seoClusters: ["Antichute"],
    targetSectors: ["BTP & Couverture", "Maintenance Éolienne & Pylônes", "Espaces Confinés & Assainissement", "Salles de Spectacle & Rigging"],
    normsAndStandards: [
      { code: "EN 795:2012 Type A", label: "Ancrages structurels fixes", desc: "Fixation permanente par scellement chimique, boulonnage traversant ou rivetage étanche." },
      { code: "EN 795:2012 Type B", label: "Ancrages provisoires transportables", desc: "Trépieds de levage, pinces de poutre et sangles textiles amovibles." },
      { code: "Résistance statique 12 kN", label: "Seuil de charge minimale", desc: "Éprouvé pour résister à la chute simultanée d'un ou plusieurs opérateurs." }
    ],
    keyChallenges: [
      { title: "Étanchéité des Toitures", desc: "Potelets avec collerette d'étanchéité bitumineuse ou membrane PVC sans pont thermique." },
      { title: "Intervention en Espace Confiné", desc: "Trépieds d'accès avec treuil de sauvetage intégré pour descente en citerne." },
      { title: "Ancrage sur Structure Existante", desc: "Pinces amovibles coulissantes pour poutres métalliques IPN sans perçage." }
    ],
    technicalFeaturesTitle: "Caractéristiques des ancrages ORSAP :",
    technicalFeatures: [
      "Fabrication en acier inoxydable 316L ou aluminium anodisé résistant à la corrosion saline.",
      "Anneaux rotatifs multidirectionnels à 360° pour suivre les mouvements sans créer de torsions.",
      "Potelets déformables absorbeurs réduisant la contrainte sur la charpente en cas de chute.",
      "Homologation pour utilisation simultanée par 1 à 3 personnes selon les modèles."
    ],
    subRangesTitle: "Types d'ancrages disponibles :",
    subRanges: [
      { title: "Potelets Toiture Bac Acier & Béton", desc: "Fixation sur bac métallique ou dalle béton avec isolation thermique conservée.", badge: "Type A", to: "/solutions/travail-en-hauteur/lignes-de-vie" },
      { title: "Trépieds & Potences pour Espaces Confinés", desc: "Pieds télescopiques réglables, poulie intégrée et treuil de récupération d'urgence.", badge: "Type B", to: "/solutions/travail-en-hauteur/harnais" },
      { title: "Pinces pour Poutres Métalliques", desc: "Montage manuel rapide sur aile de poutre acier de 75 à 300 mm de largeur.", badge: "Amovible", to: "/solutions/travail-en-hauteur/longes" },
      { title: "Ancrages à Corps Mort (Type E)", desc: "Poids modulaires lestés pour toitures terrasses sans percer l'étanchéité.", badge: "Type E", to: "/solutions/travail-en-hauteur/lignes-de-vie" }
    ],
    expertAdvice: "Tout point d'ancrage fixe structurel doit être validé par un essai d'arrachement à l'aide d'un extractomètre hydraulique lors de sa pose initiale, afin de certifier la tenue mécanique du support.",
    faq: [
      { q: "Peut-on s'ancrer sur un conduit de cheminée ou une rambarde de balcon ?", a: "Formellement non ! Ces éléments ne sont pas dimensionnés pour supporter l'énergie cinétique d'une chute (plus d'une tonne d'impact). Seuls les points d'ancrage testés et marqués EN 795 sont autorisés." }
    ],
    linkedArticles: [
      { id: "ART-011", title: "Points d'ancrage EN 795 : Types A, B, C, D, E et règles d'implantation", excerpt: "Guide de sélection des ancrages selon le support (béton, bac acier, charpente bois, IPN).", clusters: ["Antichute"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Travail en Hauteur", to: "/solutions/travail-en-hauteur" },
      { label: "Ancrages", to: "/solutions/travail-en-hauteur/ancrages" }
    ]
  },

  "travail-en-hauteur/harnais": {
    slug: "travail-en-hauteur/harnais",
    route: "/solutions/travail-en-hauteur/harnais",
    category: "Harnais Antichute",
    title: "Harnais de Sécurité Antichute",
    heroTitle: "Harnais Antichute Ergonomiques : Normes EN 361, EN 358 & EN 813",
    subtitle: "Baudriers et harnais de maintien confortables pour chantiers, nacelles, toitures et travaux sur cordes.",
    intro: "Le harnais d'antichute est le lien direct qui retient le corps humain en cas de défaillance. Il doit répartir uniformément les forces de choc sur les cuisses, le bassin et le thorax pour éviter tout traumatisme ou asphyxie post-chute.",
    description: "ORSAP distribue des harnais de sécurité haut de gamme dotés de boucles automatiques à déclenchement rapide, de sangles élastiques extensibles qui accompagnent chaque flexion et de dosserets moussés respirants. Modèles 1 point (dorsal), 2 points (dorsal et sternal) et 4 points avec ceinture de maintien rotative.",
    seoClusters: ["Antichute"],
    targetSectors: ["BTP & Gros Œuvre", "Travaux sur Cordes & Élagage", "Nacelles Élévatrices de Personnes", "Éolien & Télécoms", "Industrie Chimique & Offshore"],
    normsAndStandards: [
      { code: "EN 361", label: "Harnais de sauvetage et d'antichute", desc: "Points d'accrochage antichute obligatoirement identifiés par la lettre 'A' ou 'A/2'." },
      { code: "EN 358", label: "Ceintures de maintien au travail", desc: "Deux anneaux latéraux pour maintenir les mains libres en position de travail stable." },
      { code: "EN 813", label: "Ceintures à cuissards (suspension)", desc: "Anneau ventral pour la progression sur corde et le travail en suspension prolongée." }
    ],
    keyChallenges: [
      { title: "Prévention du Syndrome de Suspension", desc: "Éviter la stase veineuse sanguine par l'intégration de sangles étriers de secours anti-traumatisme." },
      { title: "Facilité d'Enfilage Rapide", desc: "Boucles automatiques Fast-lock avec témoins visuels de bon verrouillage." },
      { title: "Confort Dorsal & Épaules", desc: "Coussinets ergonomiques matelassés pour éviter les frottements sur les clavicules et les cuisses." }
    ],
    technicalFeaturesTitle: "Technologies intégrées à nos harnais :",
    technicalFeatures: [
      "Sangles en polyester haute ténacité traitées oléophobes et déperlantes contre la boue et l'eau.",
      "Témoins de chute intégrés sous forme de coutures fusibles se déchirant en cas de choc violent.",
      "Porte-matériel renforcés et passants pour trousse à outils sur la ceinture.",
      "Gilets porte-harnais fluorescents haute visibilité intégrés pour enfiler son EPI en moins de 10 secondes."
    ],
    subRangesTitle: "Gamme de harnais de sécurité :",
    subRanges: [
      { title: "Harnais Standard BTP (2 Points)", desc: "Accrochage dorsal et sternal, idéal pour échafaudages et nacelles.", badge: "Best-Seller", to: "/solutions/travail-en-hauteur/longes" },
      { title: "Harnais Multirisque avec Ceinture (4 Points)", desc: "Ceinture de maintien au travail intégrée avec 2 anneaux latéraux pour électriciens et pylônes.", badge: "Maintien", to: "/solutions/travail-en-hauteur/longes" },
      { title: "Harnais Confort Travaux sur Cordes", desc: "Point ventral EN 813, cuissards ultra-larges pour suspension confortable.", badge: "Suspendu", to: "/solutions/travail-en-hauteur/ancrages" },
      { title: "Gilet Porte-Harnais Haute Visibilité", desc: "Veste HV classe 2 incorporant le harnais pour un enfilage instantané sans emmêlement.", badge: "Gilet Intégré", to: "/solutions/vetements-professionnels" }
    ],
    expertAdvice: "Ajustez correctement votre harnais : vous devez pouvoir glisser une main à plat entre la sangle de cuisse et votre jambe, mais pas le poing fermé. Un harnais trop lâche peut provoquer de graves blessures inguinales lors de l'arrêt d'une chute.",
    faq: [
      { q: "Combien de temps un ouvrier peut-il rester suspendu dans son harnais après une chute ?", a: "Moins de 15 minutes ! Le syndrome du harnais (suspension trauma) peut entraîner une perte de conscience rapide. Tout plan de sécurité doit comporter une procédure de sauvetage et décrochage d'urgence." }
    ],
    linkedArticles: [
      { id: "ART-008", title: "Harnais antichute : Bien choisir entre 1, 2 et 4 points d'attache", excerpt: "Normes EN 361 vs EN 358, réglage des cuissards et prévention du syndrome de suspension.", clusters: ["Antichute"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Travail en Hauteur", to: "/solutions/travail-en-hauteur" },
      { label: "Harnais", to: "/solutions/travail-en-hauteur/harnais" }
    ]
  },

  "travail-en-hauteur/lignes-de-vie": {
    slug: "travail-en-hauteur/lignes-de-vie",
    route: "/solutions/travail-en-hauteur/lignes-de-vie",
    category: "Lignes de Vie",
    title: "Lignes de Vie Horizontales & Verticales",
    heroTitle: "Lignes de Vie par Câble ou Rail : Liberté de Déplacement & Sécurité Continue",
    subtitle: "Systèmes de retenue et d'arrêt de chute continus pour toitures industrielles, chemins de roulement et échelles à crinoline.",
    intro: "Lorsqu'un opérateur doit se déplacer le long d'une toiture ou sur une passerelle industrielle, se déconnecter à chaque potelet présente un risque mortel. La ligne de vie continue permet une circulation fluide sans aucune interruption de la sécurité.",
    description: "ORSAP fournit et installe des lignes de vie horizontales à câble en acier inoxydable (EN 795 Type C), des lignes de vie rigides sur rail aluminium (EN 795 Type D) franchissant virages et toitures complexes, ainsi que des lignes de vie verticales pour échelles fixes (EN 353-1) et des lignes de vie temporaires textiles pour chantiers éphémères.",
    seoClusters: ["Antichute"],
    targetSectors: ["Toitures d'Usines & Hangars Logistiques", "Chemins de Roulement de Ponts Roulants", "Silos & Échelles Industrielles", "Chantiers de Bardage & Charpente", "Maintenance Ferroviaire & Aéronautique"],
    normsAndStandards: [
      { code: "EN 795:2012 Type C", label: "Lignes de vie flexibles sur câble", desc: "Système continu par câble inox 8 mm avec absorbeurs de choc aux extrémités." },
      { code: "EN 795:2012 Type D", label: "Lignes de vie rigides sur rail", desc: "Zéro flèche au déclenchement, idéal pour faibles tirants d'air." },
      { code: "EN 353-1", label: "Antichutes mobiles sur support vertical", desc: "Coulisseau autobloquant sur rail ou câble d'échelle guidée." }
    ],
    keyChallenges: [
      { title: "Circulation Fluide sans Décrochage", desc: "Chariot suiveur 'navette' passant automatiquement les pièces intermédiaires et virages." },
      { title: "Faible Tirant d'Air", desc: "Utiliser un rail rigide Type D pour minimiser la flèche et arrêter la chute en quelques centimètres." },
      { title: "Résistance aux Intempéries", desc: "Câbles en inox marine 316 résistant aux embruns et aux environnements corrosifs." }
    ],
    technicalFeaturesTitle: "Nos garanties techniques lignes de vie :",
    technicalFeatures: [
      "Étude de calcul de contrainte préalable fournie pour chaque ligne (logiciel de calcul certifié).",
      "Absorbeur d'énergie terminal breveté dissipant les forces transmises à la charpente sous 6 kN.",
      "Chariots navettes ergonomiques amovibles ou fixes circulant avec une fluidité exceptionnelle.",
      "Indicateur de tension visuel permettant un contrôle immédiat de la tension de ligne par l'utilisateur."
    ],
    subRangesTitle: "Solutions de lignes de vie :",
    subRanges: [
      { title: "Lignes de Vie Câble Inox Horizontales", desc: "Pour toitures métalliques, terrasses béton et charpentes jusqu'à 3 utilisateurs simultanés.", badge: "Type C", to: "/solutions/travail-en-hauteur/ancrages" },
      { title: "Lignes de Vie Rigides sur Rail", desc: "Guidage parfait pour ponts roulants, dômes de citernes et faibles hauteurs libres.", badge: "Type D", to: "/solutions/travail-en-hauteur/ancrages" },
      { title: "Lignes de Vie Verticales pour Échelles", desc: "Coulisseau antichute bloquant instantanément toute glissade sur échelle fixe.", badge: "EN 353-1", to: "/solutions/travail-en-hauteur/longes" },
      { title: "Lignes de Vie Temporaires en Sangle", desc: "Longueur réglable jusqu'à 20m, cliquet tendeur robuste pour chantiers rapides.", badge: "Temporaire", to: "/solutions/travail-en-hauteur/longes" }
    ],
    expertAdvice: "Sur une toiture avec un tirant d'air restreint (moins de 4 mètres sous la toiture), évitez les câbles longs qui présentent une flèche importante en cas de chute. Privilégiez un rail rigide Type D qui garantit un arrêt quasi instantané.",
    faq: [
      { q: "Combien d'opérateurs peuvent s'attacher simultanément sur une ligne de vie ?", a: "Cela dépend de la note de calcul de la ligne (généralement entre 1 et 4 personnes). Chaque système doit comporter une plaque signalétique précisant le nombre maximum d'utilisateurs autorisés." }
    ],
    linkedArticles: [
      { id: "ART-010", title: "Lignes de vie horizontales et verticales : Câble inox vs Rail rigide", excerpt: "Comparatif technique, calcul de flèche et critères d'implantation sur toiture industrielle.", clusters: ["Antichute"], readTime: "6 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Travail en Hauteur", to: "/solutions/travail-en-hauteur" },
      { label: "Lignes de Vie", to: "/solutions/travail-en-hauteur/lignes-de-vie" }
    ]
  },

  "travail-en-hauteur/longes": {
    slug: "travail-en-hauteur/longes",
    route: "/solutions/travail-en-hauteur/longes",
    category: "Longes & Enrouleurs",
    title: "Longes de Sécurité & Antichutes à Rappel Automatique",
    heroTitle: "Longes Antichute avec Absorbeur & Enrouleurs : Normes EN 355 & EN 360",
    subtitle: "Longes simples, longes doubles en Y, longes de maintien réglables et enrouleurs à sangle ou câble.",
    intro: "La longe constitue le connecteur indispensable entre le harnais de l'opérateur et le point d'ancrage. En cas de chute libre, la longe doit impérativement dissiper l'énergie cinétique pour éviter que la force d'arrêt ne brise la colonne vertébrale.",
    description: "ORSAP met à disposition une sélection complète de longes avec absorbeur d'énergie à déchirement progressif (EN 355), de longes doubles en Y permettant de rester connecté en permanence lors du franchissement de structures, et d'antichutes à rappel automatique (enrouleurs EN 360) avec carter renforcé utilisables à l'horizontale comme à la verticale.",
    seoClusters: ["Antichute"],
    targetSectors: ["BTP & Montage d'Échafaudages", "Pylônes & Électricité Haute Tension", "Maintenance Industrielle & Nacelles", "Couverture & Charpente"],
    normsAndStandards: [
      { code: "EN 355", label: "Absorbeurs d'énergie", desc: "Limite la force d'impact maximale à 6 kN grâce à la déchirure de sangles tissées spéciales." },
      { code: "EN 360", label: "Antichutes à rappel automatique (enrouleurs)", desc: "Blocage centrifuge automatique instantané en quelques centimètres (effet ceinture de sécurité)." },
      { code: "EN 354 / EN 358", label: "Longes de retenue et de maintien", desc: "Positionnement au travail avec tendeur mécanique autobloquant." }
    ],
    keyChallenges: [
      { title: "Progression Continue sans Décrochage", desc: "Longes en Y à 2 brins pour déplacer un connecteur tout en restant attaché avec le second." },
      { title: "Arrêt Ultra-Court", desc: "Les enrouleurs à rappel automatique éliminent le mou dans la sangle et stoppent la chute en moins de 30 cm." },
      { title: "Résistance sur Arête Vive", desc: "Connecteurs certifiés VG11 testés contre la coupure sur arête tranchante métallique ou béton (rayon 0,5 mm)." }
    ],
    technicalFeaturesTitle: "Technologies de nos connecteurs :",
    technicalFeatures: [
      "Mousquetons automatiques à double sécurité et grands crochets d'échafaudage à ouverture 60 mm.",
      "Gaines de protection transparentes thermo-rétractables protégeant les coutures et facilitant l'inspection.",
      "Enrouleurs compacts avec sangle Dyneema® ultra-résistante aux frottements et carter ABS antichoc.",
      "Émerillons rotatifs anti-vrillage évitant la torsion de la sangle pendant les déplacements."
    ],
    subRangesTitle: "Gamme de longes et enrouleurs :",
    subRanges: [
      { title: "Longes Doubles en Y avec Absorbeur", desc: "Longueur 1,5m à 2m, grands connecteurs alu, indispensable pour échafaudage et pylônes.", badge: "Longe en Y", to: "/solutions/travail-en-hauteur/harnais" },
      { title: "Antichutes à Rappel Automatique (2m à 20m)", desc: "Blocage immédiat, utilisation verticale ou horizontale (test arête vive).", badge: "Enrouleur", to: "/solutions/travail-en-hauteur/ancrages" },
      { title: "Longes de Maintien au Travail Réglables", desc: "Corde gainée avec bloqueur ergonomique pour ajuster précisément sa distance au support.", badge: "Maintien", to: "/solutions/travail-en-hauteur/harnais" },
      { title: "Mousquetons & Connecteurs de Sécurité", desc: "Mousquetons à vis, à verrouillage automatique 2 et 3 mouvements, aluminium ou acier.", badge: "EN 362", to: "/solutions/travail-en-hauteur/longes" }
    ],
    expertAdvice: "Attention : N'attachez jamais le brin libre d'une longe en Y sur un anneau métallique non prévu du harnais, car cela neutraliserait le déploiement de l'absorbeur d'énergie en cas de chute. Utilisez les porte-longes fusibles dédiés.",
    faq: [
      { q: "Quelle est la durée de vie maximale d'une longe en textile ?", a: "La durée de vie maximale est de 5 à 10 ans à compter de la date de fabrication (selon notice fabricant), sous réserve d'inspections annuelles sans défauts constatés." }
    ],
    linkedArticles: [
      { id: "ART-009", title: "Longes de sécurité antichute : Simples, doubles en Y et absorbeurs d'énergie", excerpt: "Fonctionnement des absorbeurs à déchirure et règles de connexion aux structures métalliques.", clusters: ["Antichute"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Travail en Hauteur", to: "/solutions/travail-en-hauteur" },
      { label: "Longes & Enrouleurs", to: "/solutions/travail-en-hauteur/longes" }
    ]
  },

  "vetements-professionnels": {
    slug: "vetements-professionnels",
    route: "/solutions/vetements-professionnels",
    category: "Vêtements de Travail",
    title: "Vêtements Professionnels & Personnalisation",
    heroTitle: "Vêtements Professionnels & Workwear : Confort, Multirisque & Personnalisation",
    subtitle: "Pantalons de travail renforcés, vestes haute visibilité, tenues grand froid, été respirantes et atelier de marquage broderie/sérigraphie.",
    intro: "Le vêtement de travail protège vos équipes contre les agressions thermiques, mécaniques et climatiques tout en véhiculant l'image de marque et le professionnalisme de votre entreprise. ORSAP propose des gammes complètes certifiées et personnalisées sur mesure.",
    description: "Des tenues estivales légères en coton/polyester respirant jusqu'aux parkas 4-en-1 étanches pour l'hiver, en passant par les vêtements multirisques non-feu et anti-arc électrique (EN ISO 11612), notre catalogue répond à tous les environnements de travail. Notre atelier intégré assure la personnalisation de vos tenues par broderie haute définition, sérigraphie et flocage certifié.",
    seoClusters: ["Chaleur", "EPI chaleur", "Froid", "Pluie", "Travail extérieur", "Vêtements de travail", "Vêtements été"],
    targetSectors: ["BTP & Chantiers", "Industrie & Maintenance", "Logistique & Messagerie", "Énergie & Pétrochimie", "Services & Espaces Verts"],
    normsAndStandards: [
      { code: "EN ISO 20471", label: "Haute visibilité de jour et de nuit", desc: "Classes 1, 2 et 3 selon la surface de tissu fluorescent et de bandes rétroréfléchissantes." },
      { code: "EN 343 / EN 342", label: "Protection contre la pluie et le froid", desc: "Imperméabilité à l'eau et résistance évaporative thermique respirante." },
      { code: "EN ISO 11612 / 11611", label: "Protection flamme, chaleur et soudage", desc: "Tissus ignifugés protégeant contre la chaleur convective, radiante et projections de métal fondu." }
    ],
    keyChallenges: [
      { title: "Confort Thermique Été comme Hiver", desc: "Réguler la température corporelle sous forte chaleur ou par temps pluvieux et froid." },
      { title: "Résistance aux Frottements & Déchirures", desc: "Renforts en Cordura® sur les genoux, coudes et poches d'outils pour tripler la longévité." },
      { title: "Image de Marque & Uniforme d'Équipe", desc: "Marquage corporate de vos logos garantissant une identification immédiate de vos salariés." }
    ],
    technicalFeaturesTitle: "Nos atouts pour vos vêtements professionnels :",
    technicalFeatures: [
      "Tissus haute résistance en Polycoton (65/35 ou 60/40) avec coutures triples renforcées aux points de tension.",
      "Pantalons de travail ergonomiques avec poches genouillères certifiées EN 14404 pour préserver les articulations.",
      "Atelier de marquage intégré : broderie inusable, sérigraphie grand format et transferts rétroréfléchissants.",
      "Conception adaptée aux contraintes des chantiers marocains : tissus aérés, poches smartphone et porte-outils."
    ],
    subRangesTitle: "Gamme de vêtements professionnels :",
    subRanges: [
      { title: "Pantalons & Combinaisons de Travail", desc: "Multi-poches, taille élastiquée, renforts Cordura® et poches genouillères amovibles.", badge: "Workwear", to: "/solutions/vetements-professionnels/pantalons" },
      { title: "Vêtements Été & Respirants", desc: "Polos techniques respirants, bermudas de travail et t-shirts anti-UV légers.", badge: "Été", to: "/solutions/vetements-professionnels/ete" },
      { title: "Parkas, Vestes & Softshells Intempéries", desc: "Imperméables EN 343, doublures polaires amovibles, coupe-vent respirant.", badge: "Hiver/Pluie", to: "/solutions/vetements-professionnels/intemperies" },
      { title: "Vêtements Haute Visibilité (Classes 2 & 3)", desc: "Gilets, vestes, polos et pantalons bicolores jaunes ou oranges fluorescents.", badge: "EN 20471", to: "/solutions/vetements-professionnels/haute-visibilite" },
      { title: "Vêtements Multirisques ATEX & Non-Feu", desc: "Protection retardatrice de flamme, antistatique et anti-arc électrique (EN 11612/1149).", badge: "Multirisque", to: "/solutions/vetements-professionnels/multirisques" }
    ],
    expertAdvice: "Attention au marquage sur les vêtements haute visibilité et ignifugés : tout logo brodé ou floqué doit respecter les surfaces minimales fluorescentes de l'EN 20471 et être réalisé avec des fils ininflammables certifiés pour ne pas dégrader la protection de la tenue.",
    faq: [
      { q: "Quelles techniques de marquage choisir entre broderie et sérigraphie ?", a: "La broderie offre un rendu haut de gamme inaltérable aux lavages industriels à haute température (idéal sur polos, vestes et casquettes). La sérigraphie est plus économique pour les grandes séries sur t-shirts et gilets." }
    ],
    linkedArticles: [
      { id: "ART-018", title: "Vêtements de travail été : Matières respirantes et protection anti-UV", excerpt: "Comment habiller ses équipes pour travailler confortablement sous forte chaleur.", clusters: ["Vêtements été", "Chaleur"], readTime: "5 min" },
      { id: "ART-037", title: "Guide complet des vêtements de travail multirisques et non-feu (EN 11612)", excerpt: "Exigences pour les soudeurs, électriciens et atmosphères explosibles ATEX.", clusters: ["Vêtements de travail"], readTime: "6 min" },
      { id: "ART-038", title: "Vêtements haute visibilité : Quand la classe 3 est-elle obligatoire ?", excerpt: "Calcul des surfaces fluorescentes et normes pour la voirie et le travail de nuit.", clusters: ["Vêtements de travail", "Haute visibilité"], readTime: "5 min" },
      { id: "ART-039", title: "Protection contre le froid et la pluie : Normes EN 342 et EN 343", excerpt: "Choisir des vestes softshells et parkas étanches à haute respirabilité.", clusters: ["Froid", "Pluie"], readTime: "5 min" },
      { id: "ART-040", title: "Personnalisation des vêtements professionnels : Broderie, sérigraphie et flocage", excerpt: "Règles d'or pour valoriser votre marque sans compromettre les certifications de sécurité.", clusters: ["Vêtements de travail"], readTime: "6 min" },
      { id: "ART-041", title: "Entretien et lavage des vêtements de travail techniques : Les bonnes pratiques", excerpt: "Préserver les traitements déperlants, non-feu et bandes réfléchissantes au fil des lavages.", clusters: ["Vêtements de travail", "Maintenance"], readTime: "4 min" },
      { id: "ART-042", title: "Pantalons de travail ergonomiques et protection des genoux (EN 14404)", excerpt: "Prévention de l'hygroma et des douleurs articulaires pour les carreleurs et poseurs.", clusters: ["Vêtements de travail", "Ergonomie"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Vêtements Professionnels", to: "/solutions/vetements-professionnels" }
    ]
  },

  "vetements-professionnels/pantalons": {
    slug: "vetements-professionnels/pantalons",
    route: "/solutions/vetements-professionnels/pantalons",
    category: "Workwear",
    title: "Pantalons de Travail, Combinaisons & Workwear",
    heroTitle: "Pantalons de Travail Renforcés & Combinaisons Professionnelles",
    subtitle: "Ergonomie, résistance à l'abrasion Cordura® et poches genouillères certifiées EN 14404 pour artisans et techniciens.",
    intro: "Le pantalon de travail est la pièce maîtresse de la tenue professionnelle. Soumis à rude épreuve par les frottements, les flexions répétées et les charges d'outils, il doit allier robustesse extrême et confort absolu.",
    description: "Notre sélection intègre des pantalons stretch multi-poches avec renforts en Cordura® aux genoux et aux bas de jambes, des combinaisons doubles fermetures à glissière pour un enfilage express, ainsi que des salopettes à bretelles ajustables. Tissus polycoton haute densité (260 à 310 g/m²) assurant une résistance exceptionnelle aux déchirures et lavages industriels répétés.",
    seoClusters: ["Vêtements de travail", "Workwear", "Ergonomie"],
    targetSectors: ["Artisans & BTP", "Maintenance Industrielle", "Automobile & Mécanique", "Second Œuvre & Poseurs"],
    normsAndStandards: [
      { code: "EN 14404", label: "Protection des genoux pour les travaux à genoux", desc: "Poches genouillères intégrées avec plaques de mousse EVA ou gel absorbant certifiées type 2 niveau 1." },
      { code: "OEKO-TEX® Standard 100", label: "Innocuité textile", desc: "Garantie sans substances nocives ou irritantes pour la peau lors d'un port prolongé." },
      { code: "ISO 15797", label: "Résistance au lavage industriel", desc: "Maintien de la forme et des coloris après des dizaines de cycles à haute température." }
    ],
    keyChallenges: [
      { title: "Prévention des Douleurs Articulaires", desc: "Protéger les genoux et les ménisques lors des longues stations agenouillées." },
      { title: "Résistance aux Déchirures", desc: "Triples surpiqûres aux entrejambes et renforts haute densité aux points de tension." },
      { title: "Praticité & Accessibilité d'Outils", desc: "Poches holster amovibles, porte-mètre, boucle marteau et poche smartphone étanche." }
    ],
    technicalFeaturesTitle: "Points forts de nos pantalons et combinaisons :",
    technicalFeatures: [
      "Tissus Stretch 4D ou inserts extensibles au niveau de l'entrejambe et des cuisses pour une liberté de mouvement totale.",
      "Renforts 100% Cordura® 500D ultra-résistants à l'usure sur les genoux et poches à outils.",
      "Taille haute élastiquée anti-découvrement avec passants de ceinture larges.",
      "Combinaisons double zip intégrales facilitant l'enfilage sans retirer ses chaussures de sécurité."
    ],
    subRangesTitle: "Modèles phares de la gamme Workwear :",
    subRanges: [
      { title: "Pantalons Stretch Multi-Poches", desc: "Tissu élasthanne respirant, coupe moderne ergonomique et renforts Cordura®.", badge: "Top Vente", to: "/solutions/vetements-professionnels/pantalons" },
      { title: "Combinaisons Double Zip Professionnelles", desc: "Double glissière métal ou nylon, poignets élastiqués, multiples poches poitrine.", badge: "Pratique", to: "/solutions/vetements-professionnels/pantalons" },
      { title: "Bermudas & Shorts de Travail", desc: "Version estivale robuste avec poches flottantes pour travailler au frais.", badge: "Été", to: "/solutions/vetements-professionnels/ete" },
      { title: "Salopettes & Cottes à Bretelles", desc: "Protection lombaire intégrée, bretelles élastiques et bavette avec poche zippée.", badge: "Tradition", to: "/solutions/vetements-professionnels/pantalons" }
    ],
    expertAdvice: "Pour les carreleurs, plombiers et plaquistes passant plus de 2 heures par jour à genoux, exigez des genouillères certifiées EN 14404 Type 2 Niveau 1 afin d'éviter l'apparition de bursites et hygromas chroniques.",
    faq: [
      { q: "Quelle est la composition idéale pour un pantalon de chantier au Maroc ?", a: "Le mélange 60% coton / 40% polyester (ou 65/35) en grammage 280 g/m² offre le meilleur compromis entre respirabilité sous climat chaud et résistance à l'abrasion." }
    ],
    linkedArticles: [
      { id: "ART-042", title: "Pantalons de travail ergonomiques et protection des genoux (EN 14404)", excerpt: "Prévention de l'hygroma et des douleurs articulaires pour les carreleurs et poseurs.", clusters: ["Vêtements de travail", "Ergonomie"], readTime: "5 min" },
      { id: "ART-040", title: "Personnalisation des vêtements professionnels : Broderie, sérigraphie et flocage", excerpt: "Règles d'or pour valoriser votre marque sans compromettre les certifications de sécurité.", clusters: ["Vêtements de travail"], readTime: "6 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Vêtements Professionnels", to: "/solutions/vetements-professionnels" },
      { label: "Pantalons & Workwear", to: "/solutions/vetements-professionnels/pantalons" }
    ]
  },

  "vetements-professionnels/ete": {
    slug: "vetements-professionnels/ete",
    route: "/solutions/vetements-professionnels/ete",
    category: "Vêtements Été",
    title: "Vêtements de Travail Été, Respirants & Anti-UV",
    heroTitle: "Tenues de Travail Estivales : Légèreté, Respirabilité & Protection Anti-UV",
    subtitle: "Polos techniques CoolDry, t-shirts respirants, bermudas légers et casquettes sahariennes pour travailler confortablement sous forte chaleur.",
    intro: "Travailler sous des températures excédant 35°C met l'organisme à rude épreuve et multiplie par trois le risque de coup de chaleur et d'accidents de vigilance. ORSAP conçoit des tenues estivales légères qui évacuent activement la transpiration tout en bloquant les rayonnements UV nocifs.",
    description: "Notre gamme été comprend des polos techniques en maille piquée respirante CoolDry, des t-shirts de travail légers à séchage ultra-rapide, des bermudas multi-poches en tissu ripstop aéré et des casquettes de protection solaire avec protège-nuque amovible.",
    seoClusters: ["Chaleur", "EPI chaleur", "Vêtements été"],
    targetSectors: ["Chantiers Extérieurs BTP", "Espaces Verts & Paysagistes", "Logistique & Quais Ouverts", "Services & Maintenance"],
    normsAndStandards: [
      { code: "EN 13758-2 (UPF 50+)", label: "Protection contre les rayonnements solaires UV", desc: "Filtration de plus de 98% des rayons UVA et UVB nocifs pour la peau." },
      { code: "Technologie CoolDry", label: "Gestion active de l'humidité", desc: "Fibres hydrophobes transportant la sueur vers l'extérieur du textile pour une évaporation instantanée." }
    ],
    keyChallenges: [
      { title: "Prévention du Coup de Chaleur", desc: "Maintenir le corps au frais grâce à des textiles micro-perforés hautement aérés." },
      { title: "Protection contre les Brûlures UV", desc: "Bloquer les rayonnements solaires lors des travaux prolongés en plein soleil." },
      { title: "Fraîcheur & Zéro Odeur", desc: "Traitements antibactériens limitant la prolifération des odeurs après une journée de travail." }
    ],
    technicalFeaturesTitle: "Spécificités de nos vêtements d'été :",
    technicalFeatures: [
      "Maille technique nid d'abeilles 100% polyester micro-perforé évacuant 3 fois plus vite l'humidité que le coton standard.",
      "Zones d'aération en mesh respirant sous les aisselles et dans le dos.",
      "Bermudas avec ceinture élastiquée respirante et poches zippées discrètes.",
      "Bandes rétro-réfléchissantes segmentées thermo-collées légères et souples ne bloquant pas l'élasticité du vêtement."
    ],
    subRangesTitle: "Gamme estivale disponible :",
    subRanges: [
      { title: "Polos Techniques CoolDry", desc: "Maille piquée respirante, col tricoté avec patte de boutonnage, coupe moderne.", badge: "Respirant", to: "/solutions/vetements-professionnels/ete" },
      { title: "T-Shirts Anti-UV UPF 50+", desc: "Protection solaire intégrée, col rond renforcé, séchage express.", badge: "Anti-UV", to: "/solutions/vetements-professionnels/ete" },
      { title: "Bermudas de Chantier Ripstop", desc: "Tissu indéchirable ultra-léger 190 g/m² avec poches outils latérales.", badge: "Léger", to: "/solutions/vetements-professionnels/pantalons" },
      { title: "Casquettes avec Protège-Nuque", desc: "Casquette légère anti-UV avec rabat protégeant la nuque des coups de soleil.", badge: "Protection Soleil", to: "/solutions/vetements-professionnels/ete" }
    ],
    expertAdvice: "En été, évitez le 100% coton lourd qui retient la transpiration et reste humide. Privilégiez les mélanges polycoton légers (180 g/m²) ou les fibres CoolDry qui sèchent en quelques minutes.",
    faq: [
      { q: "Les vêtements haute visibilité existent-ils en version été respirante ?", a: "Oui, nos polos et t-shirts haute visibilité EN ISO 20471 sont confectionnés en maille ajourée fluorescente ultra-légère avec bandes thermo-fixées stretch." }
    ],
    linkedArticles: [
      { id: "ART-018", title: "Vêtements de travail été : Matières respirantes et protection anti-UV", excerpt: "Comment habiller ses équipes pour travailler confortablement sous forte chaleur.", clusters: ["Vêtements été", "Chaleur"], readTime: "5 min" },
      { id: "ART-017", title: "Chaussures de sécurité respirantes pour le travail en période estivale", excerpt: "Sélection des meilleures matières techniques pour garder les pieds au sec sous forte chaleur.", clusters: ["Protection des pieds", "Vêtements été"], readTime: "4 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Vêtements Professionnels", to: "/solutions/vetements-professionnels" },
      { label: "Vêtements Été", to: "/solutions/vetements-professionnels/ete" }
    ]
  },

  "vetements-professionnels/intemperies": {
    slug: "vetements-professionnels/intemperies",
    route: "/solutions/vetements-professionnels/intemperies",
    category: "Hiver & Pluie",
    title: "Parkas, Vestes & Softshells Intempéries",
    heroTitle: "Protection Contre la Pluie, le Vent & le Froid : Normes EN 343 & EN 342",
    subtitle: "Parkas 4-en-1 imperméables et respirantes, vestes Softshell coupe-vent et doublures polaires thermiques.",
    intro: "Travailler sous la pluie battante ou par vent glacial engendre un engourdissement rapide et une baisse de concentration critique. Nos vêtements d'intempéries assurent une étanchéité parfaite tout en laissant s'échapper la vapeur corporelle.",
    description: "ORSAP distribue des parkas professionnelles 4-en-1 multifonctions (veste extérieure imperméable + doublure polaire ou gilet amovible), des vestes softshells coupe-vent déperlantes ultra-souples, ainsi que des ensembles veste et pantalon de pluie en PVC ou polyuréthane étanche à coutures soudées.",
    seoClusters: ["Froid", "Pluie", "Travail extérieur"],
    targetSectors: ["BTP & Gros Œuvre", "Voirie & Travaux Publics", "Ports & Environnements Maritimes", "Plateformes Logistiques Extérieures"],
    normsAndStandards: [
      { code: "EN 343 (Classe 4/4)", label: "Protection contre la pluie", desc: "Plus haut niveau d'imperméabilité à l'eau (> 13 000 Pa) et de respirabilité évaporative." },
      { code: "EN 342", label: "Ensembles et vêtements de protection contre le froid", desc: "Isolation thermique certifiée pour des températures jusqu'à -20°C." },
      { code: "Membrane TPU 3 Couches", label: "Technologie coupe-vent respirante", desc: "Barrière microporeuse stoppant le vent tout en évacuant la condensation interne." }
    ],
    keyChallenges: [
      { title: "Étanchéité Zéro Défaut", desc: "Coutures thermo-soudées étanches et zips sous rabat pour résister aux averses continues." },
      { title: "Respirabilité Évaporative", desc: "Éviter l'effet sauna en permettant à la sueur de s'évacuer lors d'efforts physiques intenses." },
      { title: "Modularité 4 Saisons", desc: "Doublures détachables permettant d'adapter la tenue en fonction des variations météo." }
    ],
    technicalFeaturesTitle: "Nos technologies contre les intempéries :",
    technicalFeatures: [
      "Membranes imper-respirantes avec colonne d'eau de 8 000 à 15 000 mm.",
      "Capuches tempête ergonomiques ajustables escamotables dans le col ou détachables.",
      "Manchons coupe-vent élastiqués avec passe-pouce et bas de veste réglable par cordon élastique.",
      "Poches chauffe-mains doublées polaire et poches intérieures étanches pour documents de chantier."
    ],
    subRangesTitle: "Gamme de protection intempéries :",
    subRanges: [
      { title: "Parkas 4-en-1 Imperméables", desc: "Parka modulable avec veste intérieure polaire ou gilet haute visibilité détachable.", badge: "Polyvalent", to: "/solutions/vetements-professionnels/intemperies" },
      { title: "Vestes Softshell 3 Couches Coupe-Vent", desc: "Tissu stretch déperlant avec intérieur polaire doux pour une grande aisance de mouvement.", badge: "Coupe-Vent", to: "/solutions/vetements-professionnels/intemperies" },
      { title: "Ensembles de Pluie Veste & Pantalon", desc: "Ensemble léger 100% étanche en polyester enduit polyuréthane, coutures soudées.", badge: "Pluie", to: "/solutions/vetements-professionnels/intemperies" },
      { title: "Polaires Thermiques Grand Froid", desc: "Maille polaire anti-boulochage 300 g/m² avec renforts aux épaules et aux coudes.", badge: "Froid", to: "/solutions/vetements-professionnels/intemperies" }
    ],
    expertAdvice: "Veillez à respecter la classe de respirabilité de l'EN 343 : une parka de classe 1 (non respirante) ne doit pas être portée plus de 60 minutes en activité continue sous peine de tremper les sous-vêtements de sueur.",
    faq: [
      { q: "Comment nettoyer une veste de travail imperméable sans détruire son traitement déperlant ?", a: "Lavez à 30°C avec une lessive liquide douce sans adoucissant, et réactivez la déperlance au séchoir doux ou avec un spray réimperméabilisant adapté." }
    ],
    linkedArticles: [
      { id: "ART-039", title: "Protection contre le froid et la pluie : Normes EN 342 et EN 343", excerpt: "Choisir des vestes softshells et parkas étanches à haute respirabilité.", clusters: ["Froid", "Pluie"], readTime: "5 min" },
      { id: "ART-041", title: "Entretien et lavage des vêtements de travail techniques : Les bonnes pratiques", excerpt: "Préserver les traitements déperlants, non-feu et bandes réfléchissantes au fil des lavages.", clusters: ["Vêtements de travail", "Maintenance"], readTime: "4 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Vêtements Professionnels", to: "/solutions/vetements-professionnels" },
      { label: "Parkas & Intempéries", to: "/solutions/vetements-professionnels/intemperies" }
    ]
  },

  "vetements-professionnels/haute-visibilite": {
    slug: "vetements-professionnels/haute-visibilite",
    route: "/solutions/vetements-professionnels/haute-visibilite",
    category: "Haute Visibilité",
    title: "Vêtements Haute Visibilité (Classes 2 & 3)",
    heroTitle: "Vêtements Haute Visibilité EN ISO 20471 : Être Vu de Jour Comme de Nuit",
    subtitle: "Gilets, vestes, parkas bicolores, polos et pantalons fluorescents pour voirie, chantiers ferroviaires et zones logistiques.",
    intro: "Sur les voies de circulation, aéroports et plateformes logistiques, le manque de visibilité des opérateurs est responsable d'accidents mortels par heurt d'engins. Nos vêtements haute visibilité garantissent une signalisation visuelle continue sous tous les angles de vue.",
    description: "Conformes à la norme internationale EN ISO 20471, nos tenues se déclinent en jaune fluo, orange fluo et rouge fluo avec des bandes rétroréfléchissantes prismatiques microbilles de classe 2 garantissant une visibilité jusqu'à 300 mètres dans les phares.",
    seoClusters: ["Haute visibilité", "Vêtements de travail"],
    targetSectors: ["Voirie & Travaux Publics", "Chantiers Ferroviaires & Autoroutiers", "Logistique & Caristes", "Aéroports & Pistes"],
    normsAndStandards: [
      { code: "EN ISO 20471 Classe 3", label: "Plus haut niveau de visibilité", desc: "Surface fluorescente > 0,80 m² et surface rétro-réfléchissante > 0,20 m² (obligatoire sur autoroutes et voies ferrées)." },
      { code: "EN ISO 20471 Classe 2", label: "Niveau intermédiaire", desc: "Gilets et polos standard pour chantiers urbains et entrepôts." },
      { code: "RIS-3279-TOM", label: "Standard ferroviaire britannique / international", desc: "Orange fluo spécifique pour les personnels intervenant sur voies ferrées." }
    ],
    keyChallenges: [
      { title: "Détection Visuelle Instantanée", desc: "Permettre aux conducteurs d'engins d'identifier un piéton en moins d'une demi-seconde." },
      { title: "Visibilité à 360 Degrés", desc: "Bandes rétroréfléchissantes ceinturant le torse, les bras et les jambes." },
      { title: "Maintien de la Fluorescence", desc: "Tissus teintés dans la masse résistants aux rayons solaires et aux lavages fréquents." }
    ],
    technicalFeaturesTitle: "Nos garanties haute visibilité :",
    technicalFeatures: [
      "Tissus fluorescents 100% polyester ou polycoton traités anti-salissures.",
      "Bandes rétroréfléchissantes microbilles 3M™ Scotchlite™ cousues ou segmentées thermo-collées.",
      "Empiècements contrastés sombres sur les zones les plus exposées aux salissures (bas de jambes, poignets).",
      "Conception adaptée au port simultané d'un harnais antichute avec passants dédiés."
    ],
    subRangesTitle: "Gamme haute visibilité :",
    subRanges: [
      { title: "Gilets Haute Visibilité Classe 2", desc: "Fermeture velcro ou zip, bandes réfléchissantes horizontales et verticales.", badge: "Classe 2", to: "/solutions/vetements-professionnels/haute-visibilite" },
      { title: "Parkas & Vestes Bicolores Classe 3", desc: "Protection pluie EN 343 combinée à la visibilité maximale de classe 3.", badge: "Classe 3", to: "/solutions/vetements-professionnels/haute-visibilite" },
      { title: "Pantalons Haute Visibilité Bicolores", desc: "Poches genouillères, bandes rétro-réfléchissantes aux mollets et cuisses.", badge: "Pantalons HV", to: "/solutions/vetements-professionnels/haute-visibilite" },
      { title: "Polos & T-Shirts Fluo Respirants", desc: "Maille piquée respirante haute visibilité pour la saison estivale.", badge: "Été HV", to: "/solutions/vetements-professionnels/ete" }
    ],
    expertAdvice: "Sur les voies rapides et chantiers de nuit, la classe 3 est obligatoire. Vous pouvez l'obtenir soit avec une parka Classe 3 seule, soit en combinant une veste Classe 2 avec un pantalon Classe 2 certifiés en ensemble indissociable.",
    faq: [
      { q: "Combien de lavages supporte un vêtement haute visibilité ?", a: "Nos tenues professionnelles sont certifiées pour conserver leur éclat et rétroréflexion entre 25 et 50 cycles de lavage selon la norme EN ISO 20471." }
    ],
    linkedArticles: [
      { id: "ART-038", title: "Vêtements haute visibilité : Quand la classe 3 est-elle obligatoire ?", excerpt: "Calcul des surfaces fluorescentes et normes pour la voirie et le travail de nuit.", clusters: ["Vêtements de travail", "Haute visibilité"], readTime: "5 min" },
      { id: "ART-068", title: "Sécurité sur les chantiers de nuit : Éclairage et Haute Visibilité", excerpt: "Norme EN ISO 20471 et bonnes pratiques pour les travaux nocturnes sur voies publiques.", clusters: ["EPI chantier", "Haute visibilité"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Vêtements Professionnels", to: "/solutions/vetements-professionnels" },
      { label: "Haute Visibilité", to: "/solutions/vetements-professionnels/haute-visibilite" }
    ]
  },

  "vetements-professionnels/multirisques": {
    slug: "vetements-professionnels/multirisques",
    route: "/solutions/vetements-professionnels/multirisques",
    category: "Multirisque ATEX",
    title: "Vêtements Multirisques ATEX & Non-Feu",
    heroTitle: "Vêtements Multirisques : Protection Non-Feu, Antistatique & Anti-Arc Électrique",
    subtitle: "Combinaisons et tenues techniques certifiées EN ISO 11612, EN 1149-5 et IEC 61482 pour environnements pétrochimiques et électriques.",
    intro: "Dans les raffineries, postes de transformation électrique et ateliers de soudage, les travailleurs font face à des risques extrêmes : flashs thermiques, arcs électriques, explosions en atmosphère ATEX et projections de métaux en fusion. Nos tenues multirisques offrent une barrière protectrice infaillible.",
    description: "ORSAP distribue des vêtements de travail confectionnés à partir de fibres intrinsèquement ininflammables (Aramide, Nomex®, modacrylique) ou de cotons traités retardateurs de flamme permanents (Proban®), combinant jusqu'à 7 normes de sécurité dans une seule tenue ergonomique.",
    seoClusters: ["Risque électrique", "Vêtements de travail", "ATEX"],
    targetSectors: ["Pétrole, Gaz & Raffinage", "Secteur Électrique & Haute Tension", "Sidérurgie & Fonderie", "Chaudronnerie & Soudage Lourd"],
    normsAndStandards: [
      { code: "EN ISO 11612 (A1 B1 C1 E1 F1)", label: "Protection contre la chaleur et la flamme", desc: "Résistance à la flamme, chaleur convective, chaleur radiante et projection d'aluminium/fer." },
      { code: "EN 1149-5", label: "Propriétés électrostatiques", desc: "Dissipation des charges électriques pour éviter l'étincelle déclenchante en zone ATEX." },
      { code: "IEC 61482-2 (APC 1 & 2)", label: "Protection contre les dangers thermiques d'un arc électrique", desc: "Prévention des brûlures graves lors d'un court-circuit ou arc électrique accidentel." },
      { code: "EN ISO 11611 (Classe 1 & 2)", label: "Vêtements de protection pour le soudage", desc: "Protection contre les petites projections de métal en fusion et contact de courte durée avec la flamme." }
    ],
    keyChallenges: [
      { title: "Zéro Fusion sur la Peau", desc: "Les fibres textiles ne doivent ni fondre ni goutter sous l'effet d'une chaleur intense de 1000°C." },
      { title: "Dissipation Statique Continue", desc: "Fils d'acier inoxydable tissés dans la trame pour dissiper les charges électrostatiques." },
      { title: "Confort & Respirabilité Prolongés", desc: "Tissus souples à forte teneur en coton pour réguler la chaleur corporelle." }
    ],
    technicalFeaturesTitle: "Technologies des vêtements multirisques :",
    technicalFeatures: [
      "Fermetures zippées sous rabat avec boutons-pression cachés sans aucun élément métallique extérieur conducteur.",
      "Coutures réalisées exclusivement avec du fil aramide incombustible.",
      "Poches fermées par rabats pour éviter la pénétration d'étincelles ou projections de métal en fusion.",
      "Tissus garantis pour conserver leurs propriétés ignifuges après plus de 50 lavages industriels."
    ],
    subRangesTitle: "Gamme multirisque certifiée :",
    subRanges: [
      { title: "Combinaisons Multirisques ATEX", desc: "Protection intégrale non-feu, antistatique et anti-acide pour sites SEVESO.", badge: "ATEX 5 Normes", to: "/solutions/vetements-professionnels/multirisques" },
      { title: "Vestes & Pantalons Anti-Arc Électrique", desc: "APC 1 et APC 2 (Box Test 4kA et 7kA) pour électriciens haute tension.", badge: "Arc Flash", to: "/solutions/vetements-professionnels/multirisques" },
      { title: "Tenues de Soudeur Cuir & Coton Traité", desc: "Croûte de cuir et satin de coton 360 g/m² pour soudage TIG/MIG lourd.", badge: "EN 11611", to: "/solutions/vetements-professionnels/multirisques" },
      { title: "Sous-Vêtements Techniques Ignifugés", desc: "Caleçons et tee-shirts Nomex®/Lenzing FR créant une couche thermique d'air isolante.", badge: "Couche 1", to: "/solutions/vetements-professionnels/multirisques" }
    ],
    expertAdvice: "N'associez jamais un vêtement non-feu extérieur avec un sous-vêtement 100% synthétique (polyester/nylon) classique : sous l'effet du flash thermique, le synthétique fondrait et provoquerait de graves brûlures sous la tenue.",
    faq: [
      { q: "Peut-on broder un logo d'entreprise sur un vêtement multirisque ?", a: "Oui, mais la broderie doit être réalisée obligatoirement avec un fil aramide ininflammable certifié, et le logo ne doit pas dépasser les surfaces autorisées pour préserver la conformité de la tenue." }
    ],
    linkedArticles: [
      { id: "ART-037", title: "Guide complet des vêtements de travail multirisques et non-feu (EN 11612)", excerpt: "Exigences pour les soudeurs, électriciens et atmosphères explosibles ATEX.", clusters: ["Vêtements de travail"], readTime: "6 min" },
      { id: "ART-047", title: "Risque électrique : EPI isolants et normes NF C 18-510", excerpt: "Gants diélectriques, visières anti-arc électrique et chaussures isolantes pour électriciens.", clusters: ["Risque électrique", "EPI"], readTime: "7 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Vêtements Professionnels", to: "/solutions/vetements-professionnels" },
      { label: "Multirisques ATEX", to: "/solutions/vetements-professionnels/multirisques" }
    ]
  },

  "manutention/transpalettes": {
    slug: "manutention/transpalettes",
    route: "/solutions/manutention/transpalettes",
    category: "Transpalettes",
    title: "Transpalettes Manuels Standards, Pèseurs & Inox",
    heroTitle: "Transpalettes Manuels Professionnels : Capacité 2 000 à 3 000 kg",
    subtitle: "Châssis en acier renforcé, pompe hydraulique monobloc étanche, pèseurs intégrés et versions inox pour l'agroalimentaire.",
    intro: "Le transpalette manuel est l'outil fondamental de tout entrepôt, quai de chargement et atelier de production. Sa robustesse mécanique et sa fluidité de roulement garantissent une productivité sans faille au quotidien.",
    description: "ORSAP met à disposition des transpalettes manuels éprouvés avec châssis mécano-soudé haute résistance, pompe hydraulique garantie sans fuite avec clapet de surcharge, ainsi que des modèles spécifiques : transpalettes pèseurs électroniques de haute précision et transpalettes 100% acier inoxydable 316 pour environnements salins et agroalimentaires.",
    seoClusters: ["Manutention", "Transpalette"],
    targetSectors: ["Entrepôts & Plates-formes Logistiques", "Industrie Manufacturière", "Agroalimentaire & Produits Frais", "Grandes Surfaces & Commerce"],
    normsAndStandards: [
      { code: "EN 1757-1 / EN 1757-2", label: "Sécurité des chariots de manutention", desc: "Spécifications de stabilité, freinage de charge et ergonomie du timon de commande." },
      { code: "CE / Directive Machines 2006/42/CE", label: "Conformité de levage", desc: "Épreuve statique et dynamique avec coefficient de surcharge réglementaire." }
    ],
    keyChallenges: [
      { title: "Zéro Panne Hydraulique", desc: "Corps de pompe moulé étanche monobloc évitant les fuites d'huile et désamorçages." },
      { title: "Effort de Traction Minimal", desc: "Roues directrices en polyuréthane ou caoutchouc sur roulements à billes de précision étanches." },
      { title: "Pesage Embarqué Immédiat", desc: "Contrôler le poids des palettes dès la réception pour éliminer les litiges transporteurs." }
    ],
    technicalFeaturesTitle: "Caractéristiques techniques de nos transpalettes :",
    technicalFeatures: [
      "Capacité de charge certifiée 2 500 kg et 3 000 kg.",
      "Fourches profilées standards 1150 mm ou longueurs sur mesure (800 mm à 2000 mm).",
      "Galets doubles 'boggies' sous les fourches facilitant le passage des seuils de porte et palettes fermées.",
      "Timon ergonomique avec poignée 3 positions (Levée, Neutre, Descente) et revêtement isolant confort."
    ],
    subRangesTitle: "Modèles de transpalettes manuels :",
    subRanges: [
      { title: "Transpalette Manuel Standard 2.5T", desc: "Le modèle universel robuste avec roues directrices alu/polyuréthane.", badge: "Indispensable", to: "/solutions/manutention/transpalettes" },
      { title: "Transpalette Pèseur Électronique", desc: "4 capteurs de pesage haute précision, écran LCD rétroéclairé et imprimante ticket.", badge: "Pèseur", to: "/solutions/manutention/transpalettes" },
      { title: "Transpalette 100% Inox & Galvanisé", desc: "Résistance totale à la corrosion, lavable au jet haute pression pour hygiène HACCP.", badge: "Inox", to: "/solutions/manutention/transpalettes" },
      { title: "Transpalette Haute Levée (800 mm)", desc: "Élévation pantographe pour mise à niveau ergonomique des postes de travail.", badge: "Haute Levée", to: "/solutions/manutention/gerbeurs" }
    ],
    expertAdvice: "Privilégiez les galets boggies en polyuréthane pour sols en résine ou béton lisse : ils sont silencieux, ne marquent pas le sol et facilitent l'entrée latérale dans les palettes Europe.",
    faq: [
      { q: "Quelle est la précision d'un transpalette pèseur ?", a: "Nos modèles professionnels offrent une précision de 0,1% du poids total avec graduation par échelon de 0,5 kg ou 1 kg selon la configuration." }
    ],
    linkedArticles: [
      { id: "ART-026", title: "Transpalettes manuels vs électriques : Comparatif de rentabilité et d'ergonomie", excerpt: "Analyser les flux de palettes pour choisir la motorisation la plus productive.", clusters: ["Manutention", "Transpalette"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Manutention", to: "/solutions/manutention" },
      { label: "Transpalettes Manuels", to: "/solutions/manutention/transpalettes" }
    ]
  },

  "manutention/transpalettes-electriques": {
    slug: "manutention/transpalettes-electriques",
    route: "/solutions/manutention/transpalettes-electriques",
    category: "Transpalettes Électriques",
    title: "Transpalettes Électriques Compacts Lithium",
    heroTitle: "Transpalettes Électriques Lithium : Puissance, Maniabilité & Zéro Fatigue",
    subtitle: "Déplacement et levée 100% motorisés, batterie lithium ultra-légère amovible et recharge rapide en 2h.",
    intro: "Tirer des palettes de plus d'une tonne sur des distances répétées ou sur des rampes de chargement provoque des lombalgies et ralentit les cadences. Le transpalette électrique compact Lithium démultiplie l'efficacité de vos manutentionnaires sans aucun effort physique.",
    description: "Avec un poids plume inférieur à 130 kg (proche d'un transpalette manuel) et un rayon de braquage ultra-court, nos transpalettes électriques s'embarquent facilement dans les camions de livraison et manœuvrent avec une aisance déconcertante dans les allées les plus étroites.",
    seoClusters: ["Manutention", "Transpalette", "Logistique"],
    targetSectors: ["Livraison Urbaine & Hayons Camions", "Centres de Distribution & E-commerce", "Supermarchés & Réserves de Magasins", "Ateliers Industriels"],
    normsAndStandards: [
      { code: "EN 1175", label: "Sécurité des chariots de manutention électriques", desc: "Systèmes de freinage automatique électromagnétique et coupe-circuit d'urgence." },
      { code: "Batteries Lithium LiFePO4", label: "Sécurité thermique et longévité", desc: "Chimie stable sans émanation de gaz ni entretien d'eau distillée, durée de vie > 3000 cycles." }
    ],
    keyChallenges: [
      { title: "Suppression Totale de l'Effort Physique", desc: "Déplacement et levée assistés à 100% pour éliminer les TMS lombaires et d'épaules." },
      { title: "Compacité Record pour Hayon Camion", desc: "Longueur de corps minimale pour entrer dans les monte-charges et cabines de camions." },
      { title: "Disponibilité Continue 24/7", desc: "Biberonnage de batterie possible sans effet mémoire et changement de batterie en 10 secondes." }
    ],
    technicalFeaturesTitle: "Nos atouts transpalettes électriques :",
    technicalFeatures: [
      "Capacités de 1 500 kg et 2 000 kg avec vitesse de translation progressive jusqu'à 5 km/h.",
      "Mode 'Tortue' pour manœuvrer avec le timon vertical dans les espaces ultra-restreints.",
      "Bouton ventrale anti-écrasement inversant automatiquement le sens de marche au contact de l'opérateur.",
      "Afficheur digital indiquant l'état de charge précis de la batterie et le compteur horaire."
    ],
    subRangesTitle: "Modèles électriques disponibles :",
    subRanges: [
      { title: "Transpalette Électrique Compact 1.5T", desc: "Poids plume 125 kg, batterie Lithium 24V amovible, idéal livraisons camion.", badge: "Top Vente", to: "/solutions/manutention/transpalettes-electriques" },
      { title: "Transpalette Électrique Robuste 2.0T", desc: "Châssis acier renforcé pour usage intensif continu en entrepôt logistique.", badge: "Usage Intensif", to: "/solutions/manutention/transpalettes-electriques" },
      { title: "Transpalette Tout-Terrain Électrique", desc: "Grandes roues pneumatiques pour chantiers de construction et sols accidentés.", badge: "Extérieur", to: "/solutions/manutention/transpalettes-electriques" },
      { title: "Batteries & Chargeurs Rapides Lithium", desc: "Batteries additionnelles interchangeables pour travail en 2x8 ou 3x8.", badge: "Autonomie", to: "/solutions/manutention/transpalettes-electriques" }
    ],
    expertAdvice: "Le saviez-vous ? Le passage d'un transpalette manuel à un transpalette électrique compact permet d'augmenter la productivité de déchargement de 35% tout en divisant par 4 le risque d'accident du travail.",
    faq: [
      { q: "Combien de temps dure une charge de batterie Lithium ?", a: "Une batterie Lithium 24V/20Ah offre entre 3 et 5 heures d'utilisation continue (environ une journée de livraisons standards) et se recharge à 100% en seulement 2 heures." }
    ],
    linkedArticles: [
      { id: "ART-026", title: "Transpalettes manuels vs électriques : Comparatif de rentabilité et d'ergonomie", excerpt: "Analyser les flux de palettes pour choisir la motorisation la plus productive.", clusters: ["Manutention", "Transpalette"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Manutention", to: "/solutions/manutention" },
      { label: "Transpalettes Électriques", to: "/solutions/manutention/transpalettes-electriques" }
    ]
  },

  "manutention/gerbeurs": {
    slug: "manutention/gerbeurs",
    route: "/solutions/manutention/gerbeurs",
    category: "Gerbeurs",
    title: "Gerbeurs Manuels, Semi-Électriques & Électriques",
    heroTitle: "Gerbeurs d'Atelier & d'Entrepôt : Stockage en Hauteur jusqu'à 3,5 Mètres",
    subtitle: "Gerbeurs compacts manuels, semi-électriques et 100% motorisés pour chargement de rayonnages et mise à niveau de palettes.",
    intro: "Pour empiler des palettes, charger des camionnettes ou approvisionner des racks de stockage sans investir dans un chariot élévateur lourd et encombrant, le gerbeur représente la solution de levage vertical la plus flexible et économique.",
    description: "Notre gamme couvre les gerbeurs manuels hydrauliques légers (levée 1,6m), les gerbeurs semi-électriques (translation manuelle + levée électrique rapide motorisée) jusqu'à 3,5 mètres, ainsi que les tables élévatrices hydrauliques fixes ou mobiles pour l'aménagement ergonomique des postes de travail.",
    seoClusters: ["Manutention", "Logistique", "Ergonomie"],
    targetSectors: ["Entrepôts & Stockage Vertical", "Ateliers Mécaniques & Usinage", "Grandes Surfaces de Bricolage", "Industrie Pharmaceutique & Agro"],
    normsAndStandards: [
      { code: "EN ISO 3691-1", label: "Sécurité des chariots de manutention à mât", desc: "Tests de stabilité au basculement en charge maximale à pleine élévation." },
      { code: "Grille de protection d'opérateur", label: "Écran de sécurité en polycarbonate ou treillis métallique", desc: "Protection physique contre la chute éventuelle d'objets depuis les fourches." }
    ],
    keyChallenges: [
      { title: "Optimisation de l'Espace Vertical", desc: "Exploiter la hauteur sous plafond de l'atelier sans bloquer les allées étroites." },
      { title: "Levée Sans Effort de Charges Lourdes", desc: "Moteurs hydrauliques puissants hissant 1 000 kg à 3,5 mètres en quelques secondes." },
      { title: "Stabilité Absolue au Sol", desc: "Empattement large et frein de stationnement sur roues directrices garantissant une assise parfaite." }
    ],
    technicalFeaturesTitle: "Qualités de notre matériel de gerbage :",
    technicalFeatures: [
      "Mâts simples ou duplex en profilés d'acier profilé en C et en I haute rigidité.",
      "Chaînes de levage industrielles à mailles jointives haute résistance avec coefficient de sécurité 5:1.",
      "Soupape parachute de sécurité bloquant la descente en cas de rupture de flexible hydraulique.",
      "Fourches forgées réglables en largeur pour s'adapter à tous les formats de palettes et caisses."
    ],
    subRangesTitle: "Modèles de gerbeurs disponibles :",
    subRanges: [
      { title: "Gerbeurs Manuels Hydrauliques (1.6m)", desc: "Pompe au pied et au timon, structure compacte, parfait pour déchargement d'appoint.", badge: "Économique", to: "/solutions/manutention/gerbeurs" },
      { title: "Gerbeurs Semi-Électriques (2.5m à 3.5m)", desc: "Déplacement manuel aisé et levée motorisée sur batterie 12V avec chargeur intégré.", badge: "Polyvalent", to: "/solutions/manutention/gerbeurs" },
      { title: "Gerbeurs 100% Électriques Autotractés", desc: "Translation et levée motorisées, timon ergonomique avec commandes proportionnelles.", badge: "Haute Cadence", to: "/solutions/manutention/gerbeurs" },
      { title: "Tables Élévatrices Hydrauliques Mobiles", desc: "Plateaux de 150 kg à 1000 kg à hauteur réglable par pédale pour postes de montage.", badge: "Ergonomie", to: "/solutions/manutention/gerbeurs" }
    ],
    expertAdvice: "Avant d'acheter un gerbeur, vérifiez toujours la hauteur hors-tout du mât baissé pour vous assurer qu'il passera sous vos portes d'atelier (généralement 2,00 mètres).",
    faq: [
      { q: "Un CACES est-il obligatoire pour conduire un gerbeur accompagnant ?", a: "Pour les gerbeurs accompagnants à conducteur à pied, le CACES R485 n'est pas strictement obligatoire au Maroc mais une autorisation de conduite délivrée par l'employeur après formation reste indispensable." }
    ],
    linkedArticles: [
      { id: "ART-035", title: "Aménagement ergonomique des postes d'emballage et de palettisation", excerpt: "Tables élévatrices et manipulateurs de charge pour supprimer les flexions répétitives.", clusters: ["Manutention", "Ergonomie"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Manutention", to: "/solutions/manutention" },
      { label: "Gerbeurs", to: "/solutions/manutention/gerbeurs" }
    ]
  },

  "manutention/levage": {
    slug: "manutention/levage",
    route: "/solutions/manutention/levage",
    category: "Levage & Élingage",
    title: "Élingues & Accessoires de Levage Certifiés",
    heroTitle: "Accessoires de Levage & Élingage : Élingues Textiles, Chaînes & Palans",
    subtitle: "Élingues sangles et rondes 1T à 20T, élingues chaîne Grade 80/100, manilles haute résistance et palans certifiés EN.",
    intro: "Le levage sécurisé de charges industrielles ne tolère aucune approximation : une rupture d'élingue ou de manille peut entraîner des conséquences humaines et matérielles dramatiques. ORSAP distribue exclusivement des accessoires de levage certifiés et testés individuellement en usine.",
    description: "Notre catalogue intègre des élingues sangles plates à boucles renforcées (code couleur normalisé EN 1492-1), des élingues textiles tubulaires rondes sans fin, des assemblages d'élingues en chaîne d'acier allié Grade 80 et 100 (1 à 4 brins avec crochets à linguet de sécurité), ainsi que des manilles lyres et palans manuels à chaîne.",
    seoClusters: ["Manutention", "Levage"],
    targetSectors: ["Chaudronnerie & Charpente Métallique", "Chantiers BTP & Génie Civil", "Ports & Manutention Maritime", "Ateliers de Maintenance Industrielle"],
    normsAndStandards: [
      { code: "EN 1492-1 / EN 1492-2", label: "Élingues textiles synthétiques", desc: "Coefficient de sécurité 7:1 avec code couleur international (Violet 1T, Vert 2T, Jaune 3T, Rouge 5T...)." },
      { code: "EN 818-4", label: "Élingues en chaîne de levage", desc: "Coefficient de sécurité 4:1 pour chaînes d'acier allié trempé Grade 80 et Grade 100." },
      { code: "EN 13889", label: "Manilles forgées en acier haute résistance", desc: "Coefficient de sécurité 6:1 pour manilles droites et lyres avec axe boulonné goupillé." }
    ],
    keyChallenges: [
      { title: "Calcul Précis de la CMU selon l'Angle", desc: "Prendre en compte le facteur d'angle lors de l'utilisation d'élingues à 2, 3 ou 4 brins." },
      { title: "Protection contre les Arêtes Vives", desc: "Utiliser des fourreaux de protection en polyuréthane pour éviter le cisaillement des sangles textiles." },
      { title: "Traçabilité & Contrôles Périodiques (VGP)", desc: "Plaquette métallique d'identification ineffaçable fixée sur chaque élingue avec certificat de conformité." }
    ],
    technicalFeaturesTitle: "Nos critères d'excellence pour le levage :",
    technicalFeatures: [
      "100% polyester haute ténacité insensible aux moisissures, acides doux et graisses d'atelier.",
      "Crochets de levage automatiques à verrouillage sécurisé empêchant tout décrochage inopiné.",
      "Palans à chaîne manuels et électriques avec carters en acier et freins automatiques à disque sans amiante.",
      "Garantie d'épreuve de charge individuelle et délivrance d'un certificat d'épreuve usine conforme."
    ],
    subRangesTitle: "Gamme de levage et élingage :",
    subRanges: [
      { title: "Élingues Sangles Plates (1T à 10T)", desc: "Boucles repliées renforcées, tissage double épaisseur, code couleur EN 1492.", badge: "Sangles", to: "/solutions/manutention/levage" },
      { title: "Élingues Rondes Tubulaires Sans Fin", desc: "Gaine de protection polyester ultra-souple épousant les formes de pièces complexes.", badge: "Tubulaires", to: "/solutions/manutention/levage" },
      { title: "Élingues Chaîne Grade 80 / 100 (1 à 4 Brins)", desc: "Assemblages sur mesure avec crochets raccourcisseurs et crochets automatiques.", badge: "Chaînes", to: "/solutions/manutention/levage" },
      { title: "Manilles, Palans & Accessoires de Prise", desc: "Manilles lyres haute résistance, palans à levier et pinces de levage de tôles.", badge: "Accessoires", to: "/solutions/manutention/levage" }
    ],
    expertAdvice: "Règle de sécurité fondamentale : Lorsque l'angle d'élingage formé par deux brins dépasse 90°, la force de traction sur chaque élingue augmente considérablement. Au-delà de 120° d'angle, l'opération de levage est formellement interdite.",
    faq: [
      { q: "Quelle est la fréquence de contrôle réglementaire des accessoires de levage ?", a: "Selon la réglementation, les élingues, palans et apparaux de levage doivent faire l'objet d'une Vérification Générale Périodique (VGP) tous les 12 mois par un organisme ou une personne qualifiée." }
    ],
    linkedArticles: [
      { id: "ART-028", title: "Guide du levage sécurisé : Choix et calcul de CMU des élingues textiles et chaînes", excerpt: "Angles d'élingage, facteurs de mode et coefficients de sécurité au levage.", clusters: ["Manutention", "Levage"], readTime: "6 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Manutention", to: "/solutions/manutention" },
      { label: "Levage & Élingage", to: "/solutions/manutention/levage" }
    ]
  },

  "logistique/protection-rayonnage": {
    slug: "logistique/protection-rayonnage",
    route: "/solutions/logistique/protection-rayonnage",
    category: "Sécurité Racks",
    title: "Protections de Rayonnage & Racks d'Entrepôt",
    heroTitle: "Protections de Racks & Rayonnages à Palettes : Norme EN 15635",
    subtitle: "Sabots de montants en acier ou polymère à mémoire de forme, protections d'extrémités d'allées et butoirs de fond de travée.",
    intro: "Un choc de chariot élévateur contre un montant de rack métallique peut affaiblir irrémédiablement sa structure et provoquer l'effondrement en chaîne de tonnes de marchandises. La protection physique des échelles de rayonnages est un impératif de sécurité majeur.",
    description: "ORSAP installe et fournit des systèmes de protection de rayonnages conformes à l'EN 15635 : sabots individuels métalliques ancrés au sol ou en polymère technique flexible clipsable sans perçage, protections d'allées doubles robustes et butées d'arrêt de palettes en fond de travée.",
    seoClusters: ["Entrepôt", "Logistique", "Sécurité"],
    targetSectors: ["Entrepôts Logistiques & Stockage Haute Densité", "Centres de Distribution E-commerce", "Plates-formes Agroalimentaires", "Hangars Industriels"],
    normsAndStandards: [
      { code: "Norme EN 15635", label: "Systèmes de stockage statiques en acier", desc: "Obligation de sabots de protection d'une hauteur minimale de 400 mm aux angles d'allées de circulation." },
      { code: "Résistance à l'impact > 400 Joules", label: "Absorption des chocs frontaux et latéraux", desc: "Norme de résistance certifiée évitant toute transmission d'énergie au montant métallique du rack." }
    ],
    keyChallenges: [
      { title: "Prévention de l'Effondrement de Racks", desc: "Absorber l'énergie d'impact des fourches de chariots de 3 tonnes." },
      { title: "Suppression des Coûts de Réparation du Sol", desc: "Les protections polymères à mémoire de forme absorbent le choc sans arracher les chevilles de sol." },
      { title: "Haute Visibilité dans les Carrefours", desc: "Coloris jaune sécurité contrasté alertant instantanément les caristes." }
    ],
    technicalFeaturesTitle: "Nos solutions pour rayonnages :",
    technicalFeatures: [
      "Sabots en acier 5 mm haute résistance peints époxy avec amortisseur interne en caoutchouc.",
      "Protections en polymère technique flexible haute densité absorbant jusqu'à 80% de l'énergie de collision.",
      "Protections d'extrémité d'allées simples et doubles avec barres de liaison tubulaires continues.",
      "Installation rapide par nos équipes techniques avec fixations ancrées dans la dalle béton."
    ],
    subRangesTitle: "Gamme de protection de rayonnage :",
    subRanges: [
      { title: "Sabots de Montants Métalliques", desc: "Acier plié renforcé 5 mm avec 4 ancrages au sol, hauteur 400 mm.", badge: "Acier Robuste", to: "/solutions/logistique/protection-rayonnage" },
      { title: "Sabots Clipsables en Polymère Flexible", desc: "Installation instantanée sans percer le sol, absorbe les chocs et reprend sa forme.", badge: "À Mémoire de Forme", to: "/solutions/logistique/protection-rayonnage" },
      { title: "Protections d'Extrémités d'Allées", desc: "Barrières d'angles simples ou doubles protégeant les échelles complètes en bout de travée.", badge: "Angles d'Allées", to: "/solutions/logistique/protection-rayonnage" },
      { title: "Butées d'Arrêt de Fond de Rack", desc: "Poutres d'arrêt empêchant la chute arrière de palettes lors du chargement.", badge: "Anti-Chute", to: "/solutions/logistique/protection-rayonnage" }
    ],
    expertAdvice: "Conformément à l'EN 15635, tout montant de rayonnage présentant une déformation supérieure à 3 mm sur une longueur d'un mètre doit être immédiatement déchargé et remplacé. Protégez systématiquement chaque angle d'allée.",
    faq: [
      { q: "Quelle est la différence entre sabots acier et sabots polymère ?", a: "Les sabots acier protègent le rack mais transmettent le choc au sol béton (risque d'arrachement). Les sabots polymère flexibles dissipent le choc dans leur matière élastique sans endommager la dalle." }
    ],
    linkedArticles: [
      { id: "ART-029", title: "Protection des racks et rayonnages : Prévenir l'effondrement en entrepôt", excerpt: "Contrôle des déformations selon l'EN 15635 et installation de sabots de protection.", clusters: ["Entrepôt", "Logistique"], readTime: "6 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Logistique", to: "/solutions/logistique" },
      { label: "Protection Rayonnage", to: "/solutions/logistique/protection-rayonnage" }
    ]
  },

  "logistique/barrieres-pietons": {
    slug: "logistique/barrieres-pietons",
    route: "/solutions/logistique/barrieres-pietons",
    category: "Séparation Flux",
    title: "Barrières Piétons & Séparation des Flux",
    heroTitle: "Barrières de Sécurité Piétonnes & Séparation des Flux Chariots / Piétons",
    subtitle: "Barrières modulables en polymère flexible à mémoire de forme, portillons à fermeture automatique et bornes antichoc.",
    intro: "La co-activité entre piétons et chariots élévateurs en mouvement est la cause la plus fréquente d'accidents mortels en entrepôt logistique. Séparer physiquement les allées de marche des voies de circulation d'engins est la mesure de prévention la plus efficace.",
    description: "ORSAP conçoit des plans de circulation complets équipés de barrières piétonnes modulaires ultra-résistantes en polymère technique à absorption d'impact, de portillons battants avec rappel automatique et de bornes de protection haute visibilité.",
    seoClusters: ["Circulation", "Logistique", "Sécurité"],
    targetSectors: ["Hubs Logistiques & Messagerie", "Usines & Lignes d'Assemblage", "Zones de Picking & Préparation de Commandes", "Quais de Déchargement"],
    normsAndStandards: [
      { code: "PAS 13:2017", label: "Code de bonnes pratiques barrières de sécurité", desc: "Standard international de dimensionnement et test d'impact des barrières de sécurité industrielles." },
      { code: "Absorption jusqu'à 6 000 Joules", label: "Résistance aux collisions de chariots", desc: "Capable d'arrêter un chariot de 3 tonnes roulant à 7 km/h sans rupture." }
    ],
    keyChallenges: [
      { title: "Zéro Collision Piéton / Chariot", desc: "Créer un cheminement piéton continu hermétique et sécurisé de l'entrée jusqu'aux postes de travail." },
      { title: "Durabilité sans Entretien", desc: "Matière polymère teintée dans la masse qui ne rouille pas, ne nécessite aucune peinture et reprend sa forme après choc." },
      { title: "Modularité & Facilité d'Évolution", desc: "Système modulaire permettant de modifier les tracés lors du réaménagement de l'entrepôt." }
    ],
    technicalFeaturesTitle: "Nos équipements de séparation des flux :",
    technicalFeatures: [
      "Profilés polymères multicouches absorbant l'énergie par déformation élastique contrôlée.",
      "Embases de fixation au sol montées sur plots d'absorption préservant la dalle béton.",
      "Portillons piétons avec amortisseurs hydrauliques et charnières à fermeture automatique.",
      "Mains courantes ergonomiques et lisses basses évitant l'intrusion des fourches de chariot au sol."
    ],
    subRangesTitle: "Gamme de barrières de sécurité :",
    subRanges: [
      { title: "Barrières Piétonnes Flexibles", desc: "Hauteur 1100 mm, double lisse de guidage, absorption d'impact 3 000 à 6 000 Joules.", badge: "Piétons", to: "/solutions/logistique/barrieres-pietons" },
      { title: "Barrières Mixtes Trafic Lourd & Piétons", desc: "Barrière renforcée avec plinthe basse anti-fourches pour zones à fort trafic de chariots.", badge: "Trafic Lourd", to: "/solutions/logistique/barrieres-pietons" },
      { title: "Portillons de Sécurité Battants", desc: "Ouverture 90° avec rappel automatique et butée de limitation de passage.", badge: "Portillons", to: "/solutions/logistique/barrieres-pietons" },
      { title: "Bornes & Poteaux de Protection Antichoc", desc: "Protection ponctuelle des portes sectionnelles, tableaux électriques et angles de murs.", badge: "Bornes", to: "/solutions/logistique/barrieres-pietons" }
    ],
    expertAdvice: "Lors de l'aménagement des allées piétonnes, installez systématiquement des portillons avec système d'arrêt au niveau des traversées de carrefours afin de forcer le piéton à marquer un temps d'arrêt visuel.",
    faq: [
      { q: "Les barrières en polymère sont-elles adaptées aux entrepôts frigorifiques ?", a: "Oui, nos gammes spécifiques Grand Froid sont formulées pour conserver leur élasticité et pouvoir d'absorption jusqu'à des températures de -30°C." }
    ],
    linkedArticles: [
      { id: "ART-025", title: "Plan de circulation en entrepôt : Comment séparer efficacement piétons et chariots", excerpt: "Règles d'aménagement, largeurs d'allées et marquages au sol normalisés.", clusters: ["Circulation", "Logistique"], readTime: "6 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Logistique", to: "/solutions/logistique" },
      { label: "Barrières Piétons", to: "/solutions/logistique/barrieres-pietons" }
    ]
  },

  "logistique/quais-chargement": {
    slug: "logistique/quais-chargement",
    route: "/solutions/logistique/quais-chargement",
    category: "Sécurité Quais",
    title: "Sécurité des Quais de Chargement & Transbordement",
    heroTitle: "Sécurité des Quais de Chargement : Butoirs, Cales de Roues & Barrières de Quai",
    subtitle: "Prévention des départs inopinés de camions, des chutes de chariots depuis le quai et absorption des impacts de mise à quai.",
    intro: "La zone de quai de transbordement concentre des risques majeurs : chute de chariot élévateur dans le vide lorsque le camion démarre trop tôt, écrasement de piéton entre camion et quai, et détérioration des bâtiments lors des manœuvres de recul.",
    description: "ORSAP sécurise vos postes de transbordement avec des cales de roues manuelles et automatiques asservies aux portes sectionnelles, des butoirs de quai en caoutchouc ou polyuréthane haute absorption, des feux bicolores de signalisation de quai et des barrières de retenue de quai anti-chute.",
    seoClusters: ["Logistique", "Sécurité", "Circulation"],
    targetSectors: ["Plates-formes Logistiques & Transbordement Cross-Dock", "Entrepôts Frigorifiques", "Usines avec Flux Quotidiens de Camions", "Messagerie Express"],
    normsAndStandards: [
      { code: "Recommandation ED 6059 / INRS", label: "Sécurité des quais de chargement", desc: "Mise en place de dispositifs de calage obligatoires et interdiction de circulation sans immobilisation du camion." },
      { code: "EN 1398", label: "Niveleurs de quai", desc: "Spécifications de sécurité pour les ponts et niveleurs de liaison quai-camion." }
    ],
    keyChallenges: [
      { title: "Élimination des Départs Inopinés de Camions", desc: "Asservir l'ouverture de la porte et le nivellement au verrouillage effectif de la cale de roue." },
      { title: "Protection Anti-Chute dans le Vide", desc: "Barrières de protection empêchant la chute de chariots lorsque la porte de quai reste ouverte sans camion." },
      { title: "Préservation des Façades du Bâtiment", desc: "Absorber l'énergie d'accostage des semi-remorques de 40 tonnes sans fissurer le quai béton." }
    ],
    technicalFeaturesTitle: "Nos équipements pour quais sécurisés :",
    technicalFeatures: [
      "Cales de roues acier ou caoutchouc avec poignée ergonomique et détecteur de présence optique relié au coffret de commande.",
      "Butoirs de quai en caoutchouc armé ou butoirs coulissants verticaux suivant le débattement du camion en cours de chargement.",
      "Feux de signalisation LED Rouge/Vert intérieur et extérieur synchronisés avec les cales.",
      "Barrières de retenue de quai manuelles ou motorisées résistantes aux chocs de chariots."
    ],
    subRangesTitle: "Solutions de sécurisation de quai :",
    subRanges: [
      { title: "Cales de Roues Asservies & Manuelles", desc: "Cales ergonomiques avec câble acier et contacteur électrique interdisant l'ouverture de porte si non posée.", badge: "Anti-Départ", to: "/solutions/logistique/quais-chargement" },
      { title: "Butoirs de Quai Haute Résistance", desc: "Butoirs caoutchouc armé, butoirs acier mobiles ou polyuréthane amortisseur longue durée.", badge: "Amortisseurs", to: "/solutions/logistique/quais-chargement" },
      { title: "Barrières de Quai Anti-Chute", desc: "Barrières pivotantes ou levantes protégeant les baies ouvertes contre la chute de chariots.", badge: "Anti-Chute", to: "/solutions/logistique/quais-chargement" },
      { title: "Systèmes de Guidage Camion au Sol", desc: "Tubes métalliques de guidage d'essieux pour alignement parfait du camion dans l'axe de la porte.", badge: "Guidage", to: "/solutions/logistique/quais-chargement" }
    ],
    expertAdvice: "Ne comptez jamais sur le seul frein de parc du camion : le mouvement de va-et-vient des chariots élévateurs lors du chargement crée un phénomène de 'rampage' (avancée progressive du camion) qui peut décrocher la bavette du niveleur sans action de calage physique.",
    faq: [
      { q: "Qu'est-ce qu'un système d'asservissement de quai ?", a: "C'est un automatisme de sécurité qui verrouille la porte de quai fermée tant que la cale n'est pas posée contre la roue du camion, et qui allume le feu rouge extérieur pour interdire au chauffeur de repartir." }
    ],
    linkedArticles: [
      { id: "ART-030", title: "Sécurité des quais de chargement : Cales de camion et butoirs de quai", excerpt: "Éviter les départs inopinés de semi-remorques et les chutes de chariots depuis les quais.", clusters: ["Logistique", "Sécurité"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Logistique", to: "/solutions/logistique" },
      { label: "Sécurité Quais", to: "/solutions/logistique/quais-chargement" }
    ]
  },

  "logistique/signalisation": {
    slug: "logistique/signalisation",
    route: "/solutions/logistique/signalisation",
    category: "Signalisation Sol",
    title: "Signalisation & Éclairage Sol en Entrepôt",
    heroTitle: "Signalisation Horizontale & Marquage au Sol pour Entrepôts & Ateliers",
    subtitle: "Peintures époxy haute résistance, bandes thermocollantes, projecteurs LED Blue Spot et panneaux ISO 7010.",
    intro: "Un marquage au sol clair, normalisé et durable est la clé de voûte de l'organisation visuelle d'un site industriel (Méthode 5S). Il délimite sans équivoque les allées piétonnes, les voies de chariots, les zones de stockage et les emplacements d'équipements de secours.",
    description: "ORSAP réalise et fournit tout le matériel de signalétique au sol : peintures époxy bi-composant haute résistance à l'usure des roues de chariots, bandes de marquage adhésives industrielles ultra-adhérentes, projecteurs de marquage virtuel au sol par LED (Blue Spot, Red Line, passages piétons lumineux) et panneaux de signalisation normalisés.",
    seoClusters: ["Circulation", "Logistique", "Signalétique"],
    targetSectors: ["Entrepôts & Plates-formes Logistiques", "Usines & Ateliers d'Usinage", "Parkings d'Entreprises & Voies de Circulation", "Zones 5S & Lean Manufacturing"],
    normsAndStandards: [
      { code: "Code Couleur NF X 08-003", label: "Code couleur normalisé de sécurité", desc: "Jaune (voies de circulation), Blanc (zones de stockage), Rouge (sécurité incendie), Bleu (obligation/piétons)." },
      { code: "ISO 7010", label: "Symboles graphiques de sécurité", desc: "Pictogrammes universels d'interdiction, d'avertissement et de sauvetage." }
    ],
    keyChallenges: [
      { title: "Résistance au Roulement Intensif", desc: "Peintures et résines résistant au ripage des roues de chariots sans s'écailler." },
      { title: "Visibilité dans les Allées Aveugles", desc: "Projecteurs optiques Blue Spot alertant les piétons de l'approche d'un chariot 5 mètres avant le croisement." },
      { title: "Conformité des Voies d'Évacuation", desc: "Tracer des allées de secours sans encombrement menant directement aux issues d'urgence." }
    ],
    technicalFeaturesTitle: "Nos solutions de signalisation visuelle :",
    technicalFeatures: [
      "Résines époxy bi-composant sans solvant à séchage rapide pour remise en service en 12h.",
      "Bandes thermocollantes et adhésifs industriels chanfreinés anti-arrachement par les roues de chariots.",
      "Projecteurs LED industriels de forte puissance projetant au sol des pictogrammes lumineux inusables.",
      "Miroirs convexes grand angle de sécurité d'intersection incassables."
    ],
    subRangesTitle: "Gamme de signalétique et marquage sol :",
    subRanges: [
      { title: "Projecteurs LED Blue Spot & Red Line", desc: "Projecteurs de sécurité pour chariots élévateurs créant une zone de sécurité lumineuse au sol.", badge: "Optique LED", to: "/solutions/logistique/signalisation" },
      { title: "Peintures Époxy & Résines de Marquage", desc: "Peintures bi-composant haute résistance à l'abrasion pour traçage d'allées et zébras.", badge: "Peinture Sol", to: "/solutions/logistique/signalisation" },
      { title: "Bandes Adhésives Chanfreinées Ultra-Robustes", desc: "Rubans PVC industriels haute densité pour marquage d'emplacements de palettes 5S.", badge: "Adhésif 5S", to: "/solutions/logistique/signalisation" },
      { title: "Miroirs de Sécurité Grand Angle", desc: "Optiques convexes incassables pour carrefours et angles morts en entrepôt.", badge: "Miroirs", to: "/solutions/logistique/signalisation" }
    ],
    expertAdvice: "Avant d'appliquer une peinture de marquage sur un sol en béton lisse, effectuez systématiquement un dérochage mécanique ou chimique pour ouvrir la porosité de la dalle et garantir une adhérence de plusieurs années.",
    faq: [
      { q: "Qu'est-ce qu'un marquage virtuel par projecteur LED ?", a: "C'est un projecteur fixé au plafond qui projette un panneau stop ou un passage piéton lumineux au sol. Il ne s'use jamais, reste visible même sur sol sale et peut être asservi au passage des chariots." }
    ],
    linkedArticles: [
      { id: "ART-025", title: "Plan de circulation en entrepôt : Comment séparer efficacement piétons et chariots", excerpt: "Règles d'aménagement, largeurs d'allées et marquages au sol normalisés.", clusters: ["Circulation", "Logistique"], readTime: "6 min" },
      { id: "ART-027", title: "Sécurité des chariots élévateurs : CACES, équipements et dispositifs Blue Spot", excerpt: "Guide des bonnes pratiques de conduite et équipements de prévention embarqués.", clusters: ["Chariots", "Logistique"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Logistique", to: "/solutions/logistique" },
      { label: "Signalisation Sol", to: "/solutions/logistique/signalisation" }
    ]
  },

  "industrie/consignation-loto": {
    slug: "industrie/consignation-loto",
    route: "/solutions/industrie/consignation-loto",
    category: "Consignation LOTO",
    title: "Consignation LOTO & Cadenassage de Sécurité",
    heroTitle: "Consignation Industrielle LOTO (Lockout / Tagout) : Normes OSHA & NF C 18-510",
    subtitle: "Cadenas de sécurité diélectriques, moraillons, bloque-disjoncteurs, bloque-vannes et stations de consignation.",
    intro: "Lors des opérations de maintenance sur des machines industrielles, la remise sous tension intempestive ou la libération soudaine d'énergie résiduelle (pneumatique, hydraulique, mécanique) est une cause majeure d'accidents mortels. La consignation LOTO neutralise définitivement ces risques.",
    description: "ORSAP vous équipe avec des solutions intégrales de consignation : cadenas de sécurité à clé unique en nylon non-conducteur ou laiton, moraillons d'extension multi-cadenas, systèmes de condamnation mécanique pour vannes papillon et vannes à boisseau, bloqueurs de disjoncteurs électriques universels et étiquettes d'avertissement personnalisées.",
    seoClusters: ["Risques industriels", "Consignation", "Risque électrique"],
    targetSectors: ["Maintenance Industrielle", "Usines de Production Continue", "Pétrochimie & Raffinage", "Cimenteries & Sidérurgie"],
    normsAndStandards: [
      { code: "OSHA 1910.147", label: "Maîtrise des énergies dangereuses (LOTO)", desc: "Standard de référence mondial exigeant la condamnation physique et l'étiquetage de chaque source d'énergie." },
      { code: "NF C 18-510", label: "Opérations sur les ouvrages et installations électriques", desc: "Procédure réglementaire de séparation, condamnation, vérification d'absence de tension (VAT) et mise à la terre." }
    ],
    keyChallenges: [
      { title: "Principe 'Une Personne, Un Cadenas'", desc: "Garantir que la machine ne peut être redémarrée tant que le dernier intervenant n'a pas ôté son cadenas personnel." },
      { title: "Condamnation de Toutes les Énergies", desc: "Bloquer physiquement les énergies électrique, hydraulique, pneumatique, vapeur et gaz." },
      { title: "Identification Visuelle Claire", desc: "Étiquettes ineffaçables avec photo et nom du technicien responsable de la consignation." }
    ],
    technicalFeaturesTitle: "Notre matériel de consignation certifié :",
    technicalFeatures: [
      "Cadenas de sécurité avec corps en nylon non-conducteur et anse isolée, système de retenue de clé (la clé ne s'enlève que si le cadenas est verrouillé).",
      "Moraillons en acier ou nylon permettant à jusqu'à 6 techniciens de poser leur cadenas sur un seul point de coupure.",
      "Bloque-disjoncteurs miniatures et modulaires s'adaptant sur toutes les marques d'armoires électriques (Schneider, ABB, Legrand).",
      "Stations et tableaux de consignation muraux pour centraliser le matériel à l'entrée des ateliers."
    ],
    subRangesTitle: "Gamme d'équipements de consignation LOTO :",
    subRanges: [
      { title: "Cadenas de Consignation Isolants", desc: "Corps nylon léger, anse composite ou acier, système à clé unique avec code couleur par corps de métier.", badge: "Cadenas", to: "/solutions/industrie/consignation-loto" },
      { title: "Moraillons & Câbles de Consignation", desc: "Moraillons multipoints et câbles acier gainés réglables pour condamner plusieurs vannes simultanément.", badge: "Moraillons", to: "/solutions/industrie/consignation-loto" },
      { title: "Bloque-Disjoncteurs & Condamnation Électrique", desc: "Systèmes de blocage pour disjoncteurs modulaires, boîtiers moulés et prises industrielles.", badge: "Électrique", to: "/solutions/industrie/consignation-loto" },
      { title: "Bloque-Vannes & Condamnation Mécanique", desc: "Coquilles de blocage pour vannes à volant, poignées quart de tour et raccords pneumatiques.", badge: "Vannes", to: "/solutions/industrie/consignation-loto" }
    ],
    expertAdvice: "Avant d'intervenir après avoir posé vos cadenas, n'oubliez jamais l'étape 4 de la consignation : la dissipation des énergies résiduelles (purger les réservoirs d'air comprimé, décharger les condensateurs et caler les masses mécaniques en hauteur).",
    faq: [
      { q: "Qu'est-ce qu'une boîte de consignation groupée ?", a: "Lors d'arrêts d'usines complexes avec des dizaines d'intervenants, les clés des sources d'énergie sont placées dans une boîte métallique fermée par le cadenas de chaque responsable de groupe." }
    ],
    linkedArticles: [
      { id: "ART-043", title: "Consignation industrielle LOTO : Procédure étape par étape et matériel obligatoire", excerpt: "Guide pratique pour mettre en œuvre le cadenassage électrique, pneumatique et mécanique.", clusters: ["Risques industriels", "Consignation"], readTime: "7 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Industrie", to: "/solutions/industrie" },
      { label: "Consignation LOTO", to: "/solutions/industrie/consignation-loto" }
    ]
  },

  "industrie/retention-depollution": {
    slug: "industrie/retention-depollution",
    route: "/solutions/industrie/retention-depollution",
    category: "Rétention & Dépollution",
    title: "Bacs de Rétention, Armoires de Sécurité & Absorbants",
    heroTitle: "Rétention des Polluants & Dépollution Industrielle : Normes Environnementales",
    subtitle: "Bacs de rétention en PEHD et acier galvanisé pour fûts et cuves IBC 1000L, armoires coupe-feu et kits d'absorbants d'urgence.",
    intro: "La fuite ou le déversement accidentel d'hydrocarbures, de solvants ou d'acides menace directement la sécurité des opérateurs, pollue les nappes phréatiques et expose l'entreprise à de lourdes sanctions financières. La maîtrise de la rétention est une obligation légale stricte.",
    description: "ORSAP conçoit et distribue des solutions complètes de stockage et d'intervention antipollution : plates-formes de rétention modulaires pour fûts 200L et cuves IBC 1000L en polyéthylène haute densité inaltérable ou acier galvanisé, armoires de sécurité coupe-feu 30/90 minutes et kits absorbants d'urgence mobiles.",
    seoClusters: ["Risques industriels", "Environnement", "Pollution"],
    targetSectors: ["Chimie & Pétrochimie", "Ateliers Mécaniques & Garages", "Industrie Pharmaceutique & Cosmétique", "Traitement des Eaux & Déchets"],
    normsAndStandards: [
      { code: "Arrêté du 4 octobre 2010 / Réglementation ICPE", label: "Règles de rétention obligatoire", desc: "Tout stockage de liquides polluants doit être associé à une rétention d'au moins 100% de la capacité du plus grand réservoir (ou 50% de la capacité totale stockée)." },
      { code: "EN 14470-1", label: "Armoires de stockage de sécurité pour liquides inflammables", desc: "Résistance au feu testée 30, 60 ou 90 minutes avec fermeture automatique des portes thermofusibles." }
    ],
    keyChallenges: [
      { title: "Zéro Rejet dans les Réseaux d'Eaux Usées", desc: "Confiner immédiatement tout liquide dangereux dès la rupture d'un récipient." },
      { title: "Résistance Chimique Totale", desc: "Bacs en PEHD insensible aux acides forts et bases, ou en acier galvanisé pour solvants et hydrocarbures." },
      { title: "Intervention Express en Cas de Fuite", desc: "Kits absorbants placés à proximité stratégique de chaque zone de stockage de produits chimiques." }
    ],
    technicalFeaturesTitle: "Nos équipements de rétention et dépollution :",
    technicalFeatures: [
      "Bacs en PEHD moulé monobloc sans soudure avec caillebotis amovible anti-corrosion.",
      "Bacs en acier galvanisé à chaud avec caillebotis supportant le passage de transpalettes.",
      "Armoires de sécurité coupe-feu avec raccordement pour ventilation forcée et bac de rétention au sol.",
      "Kits d'absorbants d'intervention (boudins de barrage, feuilles absorbantes et coussins) en fûts ou chariots mobiles."
    ],
    subRangesTitle: "Gamme de rétention et dépollution :",
    subRanges: [
      { title: "Bacs de Rétention pour Fûts & Cuves IBC", desc: "Capacité 1 à 4 fûts (220L) et cuves 1000L, polyéthylène haute densité ou acier.", badge: "Rétention", to: "/solutions/industrie/retention-depollution" },
      { title: "Armoires de Sécurité Coupe-Feu (EN 14470)", desc: "Stockage sécurisé de solvants et produits inflammables, résistance au feu 30 à 90 minutes.", badge: "Coupe-Feu", to: "/solutions/industrie/retention-depollution" },
      { title: "Kits d'Absorbants d'Urgence en Fûts Mobiles", desc: "Kits tout-en-un de 50L à 500L spécial Hydrocarbures, Universel ou Produits Chimiques agressifs.", badge: "Absorbants", to: "/solutions/industrie/retention-depollution" },
      { title: "Obturateurs de Regards & Barrages Antipollution", desc: "Plaques magnétiques et tapis polyuréthane bloquant instantanément l'écoulement vers les égouts.", badge: "Obturateurs", to: "/solutions/industrie/retention-depollution" }
    ],
    expertAdvice: "Règle de choix du matériau : Stockez les hydrocarbures et solvants inflammables sur des bacs en acier galvanisé avec liaison équipotentielle à la terre. Pour les acides, bases et produits corrosifs, utilisez exclusivement du polyéthylène haute densité (PEHD).",
    faq: [
      { q: "Quelle capacité de rétention doit-on prévoir pour 4 fûts de 200L d'huile ?", a: "La règle exige 50% de la capacité totale (4 x 200L = 800L x 50% = 400L) ou 100% du plus grand contenant (200L). Le bac doit donc avoir une capacité minimale de 400 litres." }
    ],
    linkedArticles: [
      { id: "ART-043", title: "Consignation industrielle LOTO : Procédure étape par étape et matériel obligatoire", excerpt: "Guide pratique pour mettre en œuvre le cadenassage électrique, pneumatique et mécanique.", clusters: ["Risques industriels"], readTime: "7 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Industrie", to: "/solutions/industrie" },
      { label: "Rétention & Dépollution", to: "/solutions/industrie/retention-depollution" }
    ]
  },

  "industrie/outillage-isole": {
    slug: "industrie/outillage-isole",
    route: "/solutions/industrie/outillage-isole",
    category: "Outillage Isolé",
    title: "Outillage Isolé 1000V & Sécurité Électrique",
    heroTitle: "Outillage à Main Isolé 1000V & Équipements de Sécurité Électrique : Norme IEC 60900",
    subtitle: "Tournevis, pinces, clés dynamométriques isolées 1000V, perches de sauvetage et vérificateurs d'absence de tension (VAT).",
    intro: "Travailler sous tension ou au voisinage de pièces nues sous tension expose les techniciens au risque d'électrisation, de brûlures par arc et d'électrocution fatale. L'outillage isolé certifié 1000V garantit une isolation diélectrique inviolable.",
    description: "ORSAP équipe les électriciens et techniciens de maintenance avec des outils isolés testés unitairement à 10 000V sous l'eau (norme internationale IEC 60900 / EN 60900) : tournevis slim, pinces à branches isolantes bimatière, clés mixtes et douilles isolées, ainsi que des tapis isolants diélectriques et perches de sauvetage.",
    seoClusters: ["Risque électrique", "EPI", "Maintenance"],
    targetSectors: ["Installations Électriques Tertiaires & Industrielles", "Postes Moyenne & Haute Tension", "Véhicules Électriques & Batteries", "Tableautiers & Câblage d'Armoires"],
    normsAndStandards: [
      { code: "IEC 60900 / EN 60900", label: "Outils à main pour travaux sous tension jusqu'à 1000V AC et 1500V DC", desc: "Chaque outil subit un test diélectrique à 10 000V et des tests d'impact et d'adhérence à froid (-25°C)." },
      { code: "NF C 18-510", label: "Habilitations électriques B1, B2, BR, BC", desc: "Obligation d'outillage certifié et d'EPI isolants pour toute opération électrique." }
    ],
    keyChallenges: [
      { title: "Zéro Rupture d'Isolation", desc: "Isolation double couche avec code couleur d'alerte (l'apparition de la sous-couche jaune signale l'usure de l'outil)." },
      { title: "Accès dans les Borniers Étroits", desc: "Lames de tournevis affinées 'Slim' permettant d'atteindre les vis profondes sans dégrader l'isolant." },
      { title: "Sauvetage Immédiat en Cas d'Accident", desc: "Perches de sauvetage isolées 45 kV pour dégager une victime sans s'exposer." }
    ],
    technicalFeaturesTitle: "Points forts de nos outils isolés 1000V :",
    technicalFeatures: [
      "Isolation par injection de polymère haute adhérence indéchirable sur l'acier allié forgé.",
      "Garde de protection anti-glisse sur les manches de pinces évitant tout contact accidentel de la main avec la partie métallique.",
      "Coffrets complets d'outillage d'électricien avec servante d'atelier isolée.",
      "Vérificateurs d'Absence de Tension (VAT) avec autotest intégré conformes NF EN 61243-3."
    ],
    subRangesTitle: "Gamme d'outillage isolé et sécurité électrique :",
    subRanges: [
      { title: "Tournevis & Pinces Isolés 1000V", desc: "Tournevis plats, Pozidriv, Torx et pinces coupantes/universelles certifiés IEC 60900.", badge: "IEC 60900", to: "/solutions/industrie/outillage-isole" },
      { title: "Clés, Cliquets & Douilles Isolées", desc: "Jeux de douilles 3/8\" et 1/2\", clés dynamométriques isolées pour serrage au couple de borniers.", badge: "Clés 1000V", to: "/solutions/industrie/outillage-isole" },
      { title: "Tapis Isolants Diélectriques (Classes 0 à 4)", desc: "Tapis caoutchouc isolant jusqu'à 36 000V à disposer devant les armoires électriques.", badge: "Tapis Isolant", to: "/solutions/industrie/outillage-isole" },
      { title: "Perches de Sauvetage & Détecteurs VAT", desc: "Perche de sauvetage avec crochet corps pour dégagement d'urgence et testeurs VAT.", badge: "Secours", to: "/solutions/industrie/outillage-isole" }
    ],
    expertAdvice: "Inspectez vos outils isolés avant chaque utilisation : tout outil présentant une entaille, brûlure ou fissure dans son isolant doit être mis au rebut immédiatement. Ne stockez jamais d'outils isolés en vrac avec des outils métalliques tranchants.",
    faq: [
      { q: "Pourquoi les tournevis d'électricien ont-ils deux couleurs d'isolant ?", a: "La couche extérieure rouge assure la protection 1000V, tandis que la sous-couche jaune sert de témoin visuel : si le jaune devient visible, l'outil a perdu son étanchéité électrique et doit être changé." }
    ],
    linkedArticles: [
      { id: "ART-047", title: "Risque électrique : EPI isolants et normes NF C 18-510", excerpt: "Gants diélectriques, visières anti-arc électrique et chaussures isolantes pour électriciens.", clusters: ["Risque électrique", "EPI"], readTime: "7 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "Industrie", to: "/solutions/industrie" },
      { label: "Outillage Isolé 1000V", to: "/solutions/industrie/outillage-isole" }
    ]
  },

  "epi/btp/gros-oeuvre": {
    slug: "epi/btp/gros-oeuvre",
    route: "/solutions/epi/btp/gros-oeuvre",
    category: "EPI Gros Œuvre",
    title: "Pack EPI Gros Œuvre & Maçonnerie",
    heroTitle: "Pack EPI Gros Œuvre, Terrassement & Maçonnerie : Résistance Maximale",
    subtitle: "Casque jugulaire renforcé, chaussures de chantier montantes S3, gants cuir et lunettes étanches à la poussière.",
    intro: "Le gros œuvre et le terrassement cumulent les agressions mécaniques les plus sévères : projections de ciment, fers à béton tranchants, poussières abrasives et écrasement par engins lourds. Notre Pack Gros Œuvre est dimensionné pour une protection à toute épreuve.",
    description: "Ce pack réunit les équipements indispensables pour les maçons, coffreurs, ferrailleurs et terrassiers : casques EN 397 avec jugulaire 4 points évitant la chute du casque, chaussures S3 à semelle crantée anti-perforation et tige cuir hydrofuge, gants enduits nitrile épais résistants à l'abrasion du parpaing et lunettes-masques étanches.",
    seoClusters: ["EPI BTP", "EPI chantier", "Protection des pieds"],
    targetSectors: ["Gros Œuvre & Maçonnerie", "Terrassement & Fondations", "Ferraillage & Coffrage", "Démolition & VRD"],
    normsAndStandards: [
      { code: "EN 397", label: "Casques de protection pour l'industrie", desc: "Calotte en polyéthylène haute densité avec jugulaire de sécurité." },
      { code: "EN ISO 20345 (S3 SRC)", label: "Chaussures de sécurité tout-terrain", desc: "Embout acier ou composite 200J, semelle crantée anti-perforation et cuir imperméable." },
      { code: "EN 388 (4132X)", label: "Gants de protection mécanique lourde", desc: "Résistance maximale à l'abrasion et à la déchirure." }
    ],
    keyChallenges: [
      { title: "Résistance à l'Agressivité du Béton", desc: "Des cuirs et enductions résistant au ciment frais et aux alcalis." },
      { title: "Zéro Perforation par Clous et Fers", desc: "Semelles intercalaires anti-perforation acier ou kevlar intégrale." },
      { title: "Maintien Parfait du Casque", desc: "Jugulaires 4 points assurant le maintien du casque lors des flexions et mouvements amples." }
    ],
    technicalFeaturesTitle: "Composition du Pack Gros Œuvre ORSAP :",
    technicalFeatures: [
      "Casque de chantier haute visibilité avec coiffe textile 6 points et molette de réglage micrométrique.",
      "Chaussures de sécurité montantes S3 avec sur-embout renforcé anti-usure en polyuréthane.",
      "Gants en cuir pleine fleur ou tricot enduit nitrile lourd avec renfort de paume.",
      "Lunettes-masques étanches à ventilation indirecte traitées anti-rayures et anti-buée Platinum®."
    ],
    subRangesTitle: "Composants du Pack Gros Œuvre :",
    subRanges: [
      { title: "Casques de Sécurité Chantier", desc: "Casques ventilés ou fermés avec jugulaire 4 points certifiés EN 397.", badge: "Tête", to: "/solutions/epi/casques" },
      { title: "Chaussures Montantes BTP S3", desc: "Cuir hydrofuge, semelle tout-terrain autonettoyante et anti-perforation.", badge: "Pieds", to: "/solutions/epi/chaussures-securite" },
      { title: "Gants Maçonnerie & Ferraillage", desc: "Grip puissant pour pièces humides ou abrasives, paume doublée.", badge: "Mains", to: "/solutions/epi/gants" },
      { title: "Lunettes-Masques Étanche Poussière", desc: "Protection périphérique totale contre le ciment, plâtre et projections.", badge: "Yeux", to: "/solutions/epi/protection-yeux" }
    ],
    expertAdvice: "Exigez des chaussures avec sur-embout protecteur (scuff cap) sur l'avant : lors des travaux de pose de parpaings à genoux, le cuir s'use en quelques semaines sans ce renfort protecteur.",
    faq: [
      { q: "Ce pack est-il adapté aux ouvriers travaillant sous la pluie ?", a: "Oui, la tige des chaussures S3 est hydrofuge et les gants nitrile épais restent parfaitement étanches face à l'eau et aux boues de chantier." }
    ],
    linkedArticles: [
      { id: "ART-049", title: "EPI indispensables sur un chantier BTP : Le guide du chef de chantier", excerpt: "Réglementation, obligations d'affichage et sélection des équipements essentiels.", clusters: ["EPI BTP", "EPI chantier"], readTime: "6 min" },
      { id: "ART-050", title: "Comment choisir ses chaussures de sécurité de chantier : S1P vs S3", excerpt: "Comparatif des normes de semelles, étanchéité et résistance aux hydrocarbures.", clusters: ["Protection des pieds", "EPI BTP"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "BTP & Chantier", to: "/solutions/epi/btp" },
      { label: "Pack Gros Œuvre", to: "/solutions/epi/btp/gros-oeuvre" }
    ]
  },

  "epi/btp/second-oeuvre": {
    slug: "epi/btp/second-oeuvre",
    route: "/solutions/epi/btp/second-oeuvre",
    category: "EPI Second Œuvre",
    title: "Pack EPI Second Œuvre & Finition",
    heroTitle: "Pack EPI Second Œuvre : Légèreté, Dextérité & Protection Respiratoire",
    subtitle: "Casquettes anti-heurt légères, baskets de sécurité S1P respirantes, gants de précision PU et masques FFP2.",
    intro: "Électriciens, plaquistes, peintres et plombiers ont besoin d'EPI ultra-légers qui préservent la précision du geste, permettent de travailler dans des espaces confinés sans heurt et protègent des poussières fines de ponçage.",
    description: "Notre Pack Second Œuvre allie confort et motricité fine : casquette textile anti-heurt avec coque ABS ergonomique pour les interventions en combles et faux-plafonds, baskets de sécurité souples et légères S1P, gants de précision avec enduction polyuréthane et masques filtrants FFP2 à soupape.",
    seoClusters: ["EPI BTP", "Protection respiratoire", "EPI par métier"],
    targetSectors: ["Électricité & Câblage", "Plâtrerie & Cloisons", "Peinture & Revêtements", "Plomberie & Chauffage", "Menuiserie & Agencement"],
    normsAndStandards: [
      { code: "EN 812", label: "Casquettes anti-heurt pour l'industrie", desc: "Protection efficace contre les chocs de la tête contre des structures fixes." },
      { code: "EN ISO 20345 (S1P)", label: "Baskets de sécurité respirantes", desc: "Embout composite 200J, semelle anti-perforation textile souple et tige mesh aérée." },
      { code: "EN 149 (FFP2 NR)", label: "Demi-masques filtrants contre les particules", desc: "Filtration d'au moins 94% des aérosols solides et poussières de plâtre/bois." }
    ],
    keyChallenges: [
      { title: "Dextérité pour les Petites Pièces", desc: "Saisir des vis, dominos et câbles fins sans avoir à retirer ses gants de travail." },
      { title: "Filtration des Poussières Fines de Ponçage", desc: "Protéger les voies respiratoires lors du ponçage d'enduits et de plâtre." },
      { title: "Légèreté & Confort Toute la Journée", desc: "Chaussures souples pesant moins de 450g pour marcher et monter aux escabeaux sans fatigue." }
    ],
    technicalFeaturesTitle: "Avantages du Pack Second Œuvre :",
    technicalFeatures: [
      "Casquette anti-heurt avec coque ventilée et bandeau anti-transpiration amovible.",
      "Baskets de sécurité sans métal avec semelle amortissante à restitution d'énergie.",
      "Gants jauge 15 ou 18 en polyamide avec enduction PU ultra-fine sur le bout des doigts.",
      "Masques FFP2 pliables avec barrette nasale étanche et soupape expiratoire évitant la buée sur les lunettes."
    ],
    subRangesTitle: "Équipements du Pack Second Œuvre :",
    subRanges: [
      { title: "Casquettes Anti-Heurt EN 812", desc: "Design sportif, coque ABS ultra-légère, idéale pour interventions sous charpente.", badge: "Tête", to: "/solutions/epi/casques" },
      { title: "Baskets de Sécurité Basses S1P", desc: "Tissu mesh respirant, semelle anti-fatigue pour techniciens en mouvement permanent.", badge: "Pieds", to: "/solutions/epi/chaussures-securite" },
      { title: "Gants de Précision & Assemblage", desc: "Toucher seconde peau pour tirage de câbles et vissage minutieux.", badge: "Mains", to: "/solutions/epi/gants/manutention" },
      { title: "Masques Poussières FFP2 à Soupape", desc: "Protection respiratoire indispensable pour ponçage de bandes et sciage de bois.", badge: "Respiratoire", to: "/solutions/epi/protection-respiratoire" }
    ],
    expertAdvice: "Pour les peintres et plaquistes portant des lunettes correctrices, utilisez des masques FFP2 avec soupape d'expiration orientée vers le bas pour supprimer totalement la buée sur vos verres.",
    faq: [
      { q: "Peut-on porter une casquette anti-heurt sur un chantier de gros œuvre ?", a: "Non, la casquette EN 812 ne protège pas contre la chute d'objets lourds. Dès qu'il y a co-activité ou travail en hauteur au-dessus de vous, le casque de chantier EN 397 est obligatoire." }
    ],
    linkedArticles: [
      { id: "ART-002", title: "Comment composer le Kit EPI idéal par corps de métier", excerpt: "Méthode pas-à-pas pour équiper peintres, électriciens, maçons et techniciens d'atelier.", clusters: ["Kit EPI", "EPI par métier"], readTime: "6 min" },
      { id: "ART-024", title: "Guide de choix des masques respiratoires : FFP1, FFP2, FFP3 et filtres ABEK", excerpt: "Identifier la classe de filtration selon la VLEP (Valeur Limite d'Exposition Professionnelle).", clusters: ["Protection respiratoire"], readTime: "6 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "BTP & Chantier", to: "/solutions/epi/btp" },
      { label: "Pack Second Œuvre", to: "/solutions/epi/btp/second-oeuvre" }
    ]
  },

  "epi/btp/voirie": {
    slug: "epi/btp/voirie",
    route: "/solutions/epi/btp/voirie",
    category: "EPI Voirie & TP",
    title: "Pack EPI Voirie & Travaux Publics",
    heroTitle: "Pack EPI Voirie, Réseaux & Travaux Publics : Haute Visibilité & Protection Étanche",
    subtitle: "Vêtements haute visibilité classe 2 & 3, bottes de sécurité S5, casques antibruit et gants étanches.",
    intro: "Travailler sur les chaussées, routes et réseaux souterrains expose les agents à la circulation automobile rapide, au bruit assourdissant des compresseurs et marteaux-piqueurs, ainsi qu'aux eaux usées et boues.",
    description: "Notre Pack Voirie & Travaux Publics regroupe les équipements indispensables pour les cantonniers, terrassiers et agents de voirie : ensembles haute visibilité fluorescents avec bandes rétro-réfléchissantes Classe 3, bottes de sécurité S5 étanches aux hydrocarbures, casques anti-bruit haute atténuation et gants étanches anti-vibrations.",
    seoClusters: ["EPI BTP", "Haute visibilité", "Bruit"],
    targetSectors: ["Voirie & Enrobés Routiers", "Assainissement & Réseaux Humides", "Terrassement Urbain", "Travaux Ferroviaires & Tramways"],
    normsAndStandards: [
      { code: "EN ISO 20471 Classe 3", label: "Signalisation visuelle haute performance", desc: "Visibilité maximale de jour comme de nuit à plus de 250 mètres." },
      { code: "EN ISO 20345 (S5)", label: "Bottes de sécurité étanches en PVC/Nitrile", desc: "Embout 200J, semelle anti-perforation acier et imperméabilité totale." },
      { code: "EN 352-1", label: "Serre-tête antibruit pour l'industrie", desc: "Atténuation acoustique SNR 30 à 35 dB contre le bruit des brise-roches." }
    ],
    keyChallenges: [
      { title: "Être Vu Instantanément par les Automobilistes", desc: "Garantir un contraste visuel puissant sur fond de bitume gris et sous pluie battante." },
      { title: "Protection Auditive face aux Marteaux-Piqueurs", desc: "Atténuer les bruits d'impact violents sans isoler l'ouvrier des avertisseurs sonores d'engins." },
      { title: "Étanchéité Absolue dans les Tranchées", desc: "Bottes montantes et pantalons étanches pour travailler les pieds dans l'eau." }
    ],
    technicalFeaturesTitle: "Équipements du Pack Voirie & TP :",
    technicalFeatures: [
      "Parka 4-en-1 haute visibilité imper-respirante avec gilet amovible détachable.",
      "Bottes de sécurité S5 avec semelle autonettoyante à crampons profonds antidérapants SRC.",
      "Casque de chantier avec coquilles antibruit montées directement sur les fentes latérales.",
      "Gants enduits PVC ou nitrile lourd étanches avec manchette de protection de l'avant-bras."
    ],
    subRangesTitle: "Composants du Pack Voirie :",
    subRanges: [
      { title: "Vêtements Haute Visibilité Classe 3", desc: "Parkas, vestes et pantalons bicolores jaunes/oranges fluorescents certifiés.", badge: "Visibilité", to: "/solutions/vetements-professionnels/haute-visibilite" },
      { title: "Bottes de Sécurité Étanche S5", desc: "Protection totale contre l'eau, les hydrocarbures et perforations par clous.", badge: "Pieds Étanches", to: "/solutions/epi/chaussures-securite" },
      { title: "Casques Anti-Bruit Haute Atténuation", desc: "SNR 32 dB montables sur casques de chantier pour brise-béton et compacteurs.", badge: "Ouïe", to: "/solutions/epi/protection-auditive" },
      { title: "Gants Étanches Manutention Lourde", desc: "Enduction PVC souple pour la pose de bordures et tuyaux en milieu boueux.", badge: "Mains", to: "/solutions/epi/gants" }
    ],
    expertAdvice: "Sur les chantiers routiers de nuit ou par temps de brouillard, assurez-vous que les vêtements haute visibilité sont propres : la poussière d'enrobé et la boue peuvent réduire de 70% l'efficacité des bandes réfléchissantes.",
    faq: [
      { q: "Quelles sont les obligations légales pour les travaux sur chaussée ouverte ?", a: "Le port de vêtements haute visibilité de classe 2 au minimum (classe 3 sur voies rapides) et de chaussures S3/S5 est strictement obligatoire pour tout intervenant sur le domaine public routier." }
    ],
    linkedArticles: [
      { id: "ART-068", title: "Sécurité sur les chantiers de nuit : Éclairage et Haute Visibilité", excerpt: "Norme EN ISO 20471 et bonnes pratiques pour les travaux nocturnes sur voies publiques.", clusters: ["EPI chantier", "Haute visibilité"], readTime: "5 min" },
      { id: "ART-022", title: "Bruit au travail : Seuils de dangerosité en dB(A) et obligations légales", excerpt: "Mesure de l'exposition sonore quotidienne et mise en place du plan de prévention.", clusters: ["Bruit", "Protection auditive"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Solutions", to: "/solutions" },
      { label: "EPI", to: "/solutions/epi" },
      { label: "BTP & Chantier", to: "/solutions/epi/btp" },
      { label: "Pack Voirie & TP", to: "/solutions/epi/btp/voirie" }
    ]
  }
};
