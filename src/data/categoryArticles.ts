export type CategorySubRange = {
  title: string;
  desc?: string;
  badge?: string;
  to?: string;
};

export type CategoryArticle = {
  title: string;
  subtitle: string;
  intro: string;
  article: string;
  highlightsTitle: string;
  highlights: string[];
  subRangesTitle: string;
  subRanges: CategorySubRange[];
};

export const CATEGORY_ARTICLES: Record<string, CategoryArticle> = {
  epi: {
    title: "EPI — Équipements de protection individuelle",
    subtitle: "Sécurité intégrale, conformité et protection corporelle sur vos chantiers et ateliers.",
    intro: "Dans le tumulte des chantiers de construction et le vrombissement des lignes de production industrielles, préserver l'intégrité physique de vos collaborateurs est primordial. Véritables boucliers et armures des temps modernes, nos équipements de protection individuelle (EPI) font barrage aux risques professionnels.",
    article: "Que ce soit pour prémunir vos ouvriers contre les chutes d'objets avec nos casques de chantier antichocs renforcés, prémunir vos techniciens contre les coupures grâce à nos gants de protection en nitrile et kevlar ultra-résistants, ou encore assurer une excellente protection respiratoire et auditive face aux poussières et bruits nocifs de l'usine, ORSAP vous propose des solutions complètes de la tête aux pieds. Nos chaussures de sécurité coquées et nos vêtements de travail haute visibilité allient robustesse et ergonomie pour un confort de port prolongé indispensable à l'efficacité opérationnelle. Choisir nos équipements, c'est investir dans des défenses de première classe pour vos équipes.",
    highlightsTitle: "Pourquoi choisir ORSAP pour vos équipements de protection (EPI) ?",
    highlights: [
      "Conformité rigoureuse aux exigences réglementaires et normes de sécurité internationales (CE, ISO, EN).",
      "Gamme complète couvrant tous les besoins : protection crânienne, oculaire, auditive, respiratoire, des mains et anti-chute.",
      "Ergonomie maximale des vêtements et chaussures pour réduire la fatigue des opérateurs au quotidien.",
      "Partenariats solides avec des marques leaders mondiales telles que Delta Plus, 3M et Honeywell."
    ],
    subRangesTitle: "Nos gammes d'équipements de protection individuelle :",
    subRanges: [
      { title: "Protection de la Tête & Casques", desc: "Casques de chantier ventilés, casquettes anti-heurt, visières.", badge: "EN 397", to: "/solutions/epi/casques" },
      { title: "Chaussures de Sécurité Coquées", desc: "Modèles S1P, S3, S7S et bottes de sécurité antidérapantes.", badge: "ISO 20345", to: "/solutions/epi/chaussures-securite" },
      { title: "Gants de Protection Professionnels", desc: "Anti-coupure, manutention, chimiques et thermiques.", badge: "EN 388 / 374", to: "/solutions/epi/gants" },
      { title: "Protection Antichute & Hauteur", desc: "Harnais de sécurité, longes avec absorbeur, lignes de vie.", badge: "EN 361 / 355", to: "/solutions/travail-en-hauteur" },
      { title: "Protection Respiratoire", desc: "Masques FFP2, FFP3, demi-masques à cartouches ABEK.", badge: "EN 149 / 140", to: "/solutions/epi/protection-respiratoire" },
      { title: "Protection Auditive", desc: "Bouchons d'oreilles réutilisables, casques anti-bruit passifs.", badge: "EN 352", to: "/solutions/epi/protection-auditive" }
    ]
  },
  outillage: {
    title: "Outillage à main & électroportatif",
    subtitle: "Des outils professionnels fiables, précis et robustes pour tous vos travaux et chantiers.",
    intro: "L'outillage professionnel est à l'artisan ce que la plume est à l'écrivain : le prolongement naturel de son savoir-faire et de sa précision. Dans le secteur industriel et le BTP au Maroc, disposer d'un matériel fiable et performant est le gage d'une productivité optimisée et de travaux exécutés dans les règles de l'art.",
    article: "ORSAP distribue une large gamme d'outils électroportatifs de pointe — perceuses-visseuses à percussion sans fil, meuleuses d'angle puissantes, perforateurs burineurs robustes et scies circulaires haute précision. Pour les travaux d'ajustage et de montage quotidiens, notre sélection d'outillage à main (clés plates, jeux de douilles, tournevis de précision et pinces coupantes) offre une prise en main ergonomique et une longévité inégalée sous usage intensif. Nous sourçons nos références auprès des plus grands constructeurs mondiaux pour vous garantir une robustesse à toute épreuve, comme des compagnons de fer infatigables face à la matière.",
    highlightsTitle: "Pourquoi choisir ORSAP pour votre outillage professionnel ?",
    highlights: [
      "Sélection rigoureuse des plus grandes marques d'outils mondiales (Bosch, DeWalt, Makita, Facom, Hilti).",
      "Performance industrielle et durabilité éprouvée pour un usage intensif quotidien.",
      "Outils ergonomiques conçus pour limiter la fatigue musculaire et les troubles musculosquelettiques (TMS).",
      "Disponibilité immédiate des accessoires indispensables (forets, disques diamantés, lames de scie, abrasifs)."
    ],
    subRangesTitle: "Nos gammes d'outillage à main et électroportatif :",
    subRanges: [
      { title: "Perceuses-Visseuses & Perforateurs Sans Fil", desc: "Haute autonomie, moteurs Brushless pour chantier et atelier.", badge: "Sans Fil", to: "/solutions/industrie" },
      { title: "Meuleuses d'Angle & Disqueuses de Chantier", desc: "Meuleuses 125 mm et 230 mm haute puissance avec carters renforcés.", badge: "Tronçonnage", to: "/solutions/epi/protection-yeux" },
      { title: "Perforateurs, Marteaux Piqueurs & Burineurs", desc: "Frappe puissante SDS-Plus et SDS-Max pour béton armé et maçonnerie.", badge: "Gros Œuvre", to: "/solutions/epi/protection-auditive" },
      { title: "Outillage à Main : Clés, Tournevis & Pinces", desc: "Jeux de douilles, clés mixtes en acier chrome-vanadium.", badge: "Précision", to: "/marques/facom" },
      { title: "Coffrets d'Outils & Servantes d'Atelier", desc: "Servantes mobiles 6 à 8 tiroirs garnies et caisses à outils chantier.", badge: "Atelier", to: "/solutions/industrie" },
      { title: "Forets SDS, Disques Diamantés & Abrasifs", desc: "Consommables de coupe, lames de scie circulaire et scies trépans.", badge: "Accessoires", to: "/solutions/consommables" }
    ]
  },
  "roulements-transmission": {
    title: "Roulements & transmission",
    subtitle: "Composants de guidage mécanique et systèmes de transmission de puissance à haute fiabilité.",
    intro: "Le bon fonctionnement de vos machines et lignes de production repose sur des composants mécaniques de haute précision, capables de supporter des charges élevées tout en minimisant les frictions. Les roulements et éléments de transmission représentent le cœur battant de vos installations.",
    article: "Une défaillance mécanique à ce niveau peut paralyser l'ensemble de votre usine et engendrer des coûts d'arrêt de production astronomiques. Chez ORSAP, nous mettons à votre disposition un stock important de roulements à billes, roulements à rouleaux, paliers auto-aligneurs en fonte et composants de guidage linéaire. Pour parfaire vos systèmes de transmission de puissance, nous fournissons également des courroies trapézoïdales, des chaînes de transmission robustes, des poulies et des engrenages de précision. Nos pièces de rechange de haute qualité assurent une rotation fluide et une longévité maximale à vos moteurs et arbres de transmission.",
    highlightsTitle: "Pourquoi choisir ORSAP pour vos roulements et transmissions ?",
    highlights: [
      "Composants de haute précision réduisant efficacement les frictions et l'usure prématurée.",
      "Excellente résistance aux charges radiales, axiales et aux températures industrielles extrêmes.",
      "Large choix de paliers, courroies et chaînes pour toutes les configurations de machines.",
      "Conseil technique pour l'identification des références équivalentes lors de vos opérations de maintenance."
    ],
    subRangesTitle: "Nos gammes de roulements et transmission :",
    subRanges: [
      { title: "Roulements à Billes, Rouleaux & Aiguilles", desc: "Guidage rotatif haute précision pour moteurs et réducteurs industriels.", badge: "Précision", to: "/solutions/industrie" },
      { title: "Paliers Auto-Aligneurs en Fonte & Appliques", desc: "Paliers semelles UC, UCF, UCFL pour convoyeurs et arbres de transmission.", badge: "Robuste", to: "/solutions/industrie" },
      { title: "Courroies de Transmission Trapézoïdales", desc: "Courroies crantées, plates et poly-V résistantes à l'huile et à la chaleur.", badge: "Transmission", to: "/solutions/manutention" },
      { title: "Chaînes de Transmission Mécanique & Pignons", desc: "Chaînes simples, doubles et attaches rapides conformes ISO/BS.", badge: "Grade Acier", to: "/solutions/manutention" },
      { title: "Accouplements d'Arbres Flexibles & Poulies", desc: "Poulies en fonte usinée, moyeux amovibles Taper Lock et flectors.", badge: "Accouplement", to: "/solutions/industrie" },
      { title: "Graisses Industrielles & Lubrification Automatique", desc: "Graisses haute température, savons de lithium et cartouches de graissage.", badge: "Lubrifiants", to: "/solutions/consommables" }
    ]
  },
  "echafaudages-nacelles": {
    title: "Échafaudages & nacelles",
    subtitle: "Solutions de hauteur sécurisées : échafaudages, nacelles et plateformes de travail.",
    intro: "Travailler en hauteur exige une sécurité absolue et des équipements d'accès d'une stabilité irréprochable. Que ce soit pour des travaux de ravalement de façade, de maintenance industrielle ou de pose de réseaux suspendus, ORSAP vous propose des solutions certifiées.",
    article: "Notre gamme comprend des échafaudages fixes de chantier robustes, des échafaudages roulants légers en aluminium faciles à déplacer, ainsi que des plateformes individuelles roulantes et des nacelles élévatrices. Équipés de garde-corps intégrés, de plinthes de sécurité et de stabilisateurs ancrés, nos systèmes d'accès garantissent à vos équipes une plateforme de travail stable et sécurisée. Associez ces structures à nos kits de harnais anti-chute et lignes de vie pour s'élever en toute confiance et travailler sereinement au sommet.",
    highlightsTitle: "Pourquoi choisir ORSAP pour vos solutions d'accès en hauteur ?",
    highlights: [
      "Structures hautement stables en acier galvanisé à chaud ou en aluminium de qualité aéronautique.",
      "Conformité stricte aux exigences des normes européennes et marocaines (NF EN 1004, EN 12811).",
      "Montage rapide et intuitif avec des systèmes de verrouillage automatiques brevetés.",
      "Service d'accompagnement pour le choix de la solution la plus adaptée (hauteur de travail, charge utile)."
    ],
    subRangesTitle: "Nos gammes d'échafaudages et de nacelles :",
    subRanges: [
      { title: "Échafaudages Fixes de Chantier en Acier", desc: "Structures façadières et multidirectionnelles certifiées EN 12810.", badge: "BTP", to: "/solutions/travail-en-hauteur" },
      { title: "Échafaudages Roulants en Aluminium", desc: "Montage express sans outils, roues à frein et stabilisateurs réglables.", badge: "EN 1004", to: "/solutions/travail-en-hauteur" },
      { title: "Plateformes Individuelles Roulantes (PIRL)", desc: "Garde-corps périphérique et portillon automatique pour interventions rapides.", badge: "PIRL", to: "/solutions/travail-en-hauteur" },
      { title: "Nacelles Élévatrices de Personnes & Ciseaux", desc: "Élévation motorisée avec points d'ancrage pour harnais antichute.", badge: "Motorisé", to: "/solutions/travail-en-hauteur/harnais" },
      { title: "Échelles Industrielles & Coulissantes", desc: "Échelles aluminium haute résistance et échelles à crinoline fixes.", badge: "Hauteur", to: "/solutions/travail-en-hauteur/lignes-de-vie" },
      { title: "Garde-Corps de Sécurité & Filets de Protection", desc: "Garde-corps autoportants et filets pare-gravats pour toitures et dalles.", badge: "Collectif", to: "/solutions/travail-en-hauteur/longes" }
    ]
  },
  manutention: {
    title: "Manutention",
    subtitle: "Chariots, transpalettes, gerbeurs et équipements de levage pour entrepôts et ateliers.",
    intro: "Le déplacement et le levage de charges lourdes au sein des entrepôts, des ateliers et des quais de chargement sont des opérations quotidiennes qui requièrent un matériel performant pour fluidifier la logistique et préserver la santé des opérateurs.",
    article: "ORSAP vous propose une gamme complète de matériel de manutention robuste et ergonomique. Pour le transport horizontal de palettes, nous mettons à votre disposition des transpalettes manuels robustes et des transpalettes électriques performants. Pour le stockage en hauteur et le gerbage, nos gerbeurs électriques et gerbeurs semi-électriques vous permettent d'empiler vos charges en toute sécurité. Nous fournissons également des diables de transport légers, des chariots plateformes à roues pivotantes silencieuses, des tables élévatrices pour la mise à niveau des postes de travail, ainsi que des accessoires de levage de haute qualité (sangles de levage, palans et manilles), agissant comme des muscles artificiels pour porter vos ambitions industrielles.",
    highlightsTitle: "Pourquoi choisir ORSAP pour vos équipements de manutention ?",
    highlights: [
      "Matériel conçu pour réduire l'effort physique et prévenir les troubles musculosquelettiques (TMS).",
      "Forte robustesse du châssis en acier renforcé pour un usage intensif en milieu industriel.",
      "Organes de sécurité actifs (freins de parking, clapets de surcharge, boutons d'urgence) sur tous les modèles.",
      "Large assortiment d'accessoires de levage certifiés avec traçabilité complète des charges utiles."
    ],
    subRangesTitle: "Nos gammes d'équipements de manutention et de levage :",
    subRanges: [
      { title: "Transpalettes Manuels Standards & Pèseurs", desc: "Capacité 2T à 3T, pompe monobloc étanche et roues polyuréthane.", badge: "Indispensable", to: "/solutions/manutention" },
      { title: "Transpalettes Électriques & Gerbeurs Lithium", desc: "Batteries amovibles légères, levée électrique et vitesse contrôlée.", badge: "Lithium", to: "/solutions/logistique" },
      { title: "Diables de Manutention & Monte-Escaliers", desc: "Bavette renforcée, roues increvables pour colis et fûts.", badge: "Diables", to: "/solutions/manutention" },
      { title: "Chariots Plateformes & Servantes d'Atelier", desc: "Plateaux antidérapants et ridelles pour transfert sécurisé de pièces.", badge: "Atelier", to: "/solutions/logistique" },
      { title: "Tables Élévatrices Hydrauliques Ergonomiques", desc: "Mise à niveau constante du poste de travail pour supprimer les flexions.", badge: "Ergonomie", to: "/solutions/manutention" },
      { title: "Palans Électriques, Sangles & Élingues", desc: "Élingues textiles CMU 1T à 10T et palans à chaîne Grade 80/100.", badge: "Levage", to: "/solutions/manutention" }
    ]
  },
  "plomberie-fluides": {
    title: "Plomberie & fluides",
    subtitle: "Réseaux de tuyauterie, robinetterie industrielle et solutions de gestion des fluides.",
    intro: "La circulation des fluides (eau, gaz, air comprimé, vapeur ou produits chimiques) constitue le système circulatoire essentiel de tout site industriel ou bâtiment tertiaire. Garantir l'étanchéité et la durabilité de ces installations est capital.",
    article: "Une fuite de fluide ou une baisse de pression peut entraîner des pertes de rendement importantes ou des incidents de sécurité. ORSAP distribue une large gamme de produits de plomberie et gestion des fluides à destination des professionnels. Notre catalogue comprend des tuyauteries en acier, cuivre, PVC et multicouches, ainsi que des raccords rapides de précision, de la robinetterie industrielle (vannes à boisseau, vannes papillon, clapets anti-retour) et des solutions de pompage et de filtration d'eau. Pour la régulation des flux et le contrôle de pression, nous proposons des manomètres et détendeurs de haute fiabilité. Équipés de nos produits de climatisation et réseaux d'air comprimé, vos sites garantissent un transport de fluides propre et sécurisé.",
    highlightsTitle: "Pourquoi choisir ORSAP pour vos réseaux de fluides et plomberie ?",
    highlights: [
      "Matériaux sélectionnés pour leur résistance à la corrosion, à la pression et aux produits chimiques.",
      "Composants de plomberie conformes aux normes techniques les plus strictes pour l'eau et le gaz.",
      "Large choix de diamètres et de types de raccords pour s'adapter à toutes les tuyauteries existantes.",
      "Gamme complète de pompage de surface et de relevage pour les applications civiles et industrielles."
    ],
    subRangesTitle: "Nos gammes de plomberie et de gestion des fluides :",
    subRanges: [
      { title: "Tubes & Tuyaux Industriels (Cuivre, PVC, Acier)", desc: "Tuyauteries certifiées pour eau, gaz, hydrocarbures et air comprimé.", badge: "Tuyauterie", to: "/solutions/industrie" },
      { title: "Raccords de Tuyauterie & Raccords Rapides", desc: "Coudes, tés, brides acier et raccords express pneumatiques.", badge: "Raccords", to: "/solutions/industrie" },
      { title: "Robinetterie Industrielle & Vannes Papillon", desc: "Vannes à boisseau sphérique inox, clapets anti-retour et robinets-vannes.", badge: "Robinetterie", to: "/solutions/industrie" },
      { title: "Pompes de Surface & Pompes de Relevage", desc: "Pompes centrifuges pour alimentation d'eau et relevage d'eaux usées.", badge: "Pompage", to: "/solutions/manutention" },
      { title: "Appareils de Mesure, Manomètres & Détendeurs", desc: "Contrôle précis de pression, débitmètres et régulateurs de flux.", badge: "Mesure", to: "/solutions/industrie" },
      { title: "Climatisation & Réseaux d'Air Comprimé", desc: "Tuyaux spiralés, unités de filtration FRL et diffuseurs thermiques.", badge: "Air & Froid", to: "/solutions/industrie" }
    ]
  },
  electricite: {
    title: "Électricité industrielle & bâtiment",
    subtitle: "Infrastructures de distribution électrique, appareillage et automatismes industriels.",
    intro: "Une alimentation électrique stable, sécurisée et performante est le pilier invisible de l'activité industrielle et tertiaire au Maroc. Les installations électriques doivent répondre à des exigences de sécurité strictes pour prévenir tout risque.",
    article: "ORSAP est votre partenaire de confiance pour l'approvisionnement en matériel électrique de qualité industrielle. Nous distribuons tout le nécessaire pour la conception et la maintenance de vos réseaux : tableaux et coffrets de distribution étanches, disjoncteurs de protection, contacteurs de puissance, câbles industriels haute performance et goulottes de câblage. Pour l'automatisation de vos chaînes de production, nous fournissons également des relais thermiques, des variateurs de vitesse et des automates programmables des plus grands fabricants. Que ce soit pour un nouveau chantier de bâtiment ou la rénovation d'une armoire électrique d'usine, notre stock répond présent pour faire circuler l'énergie motrice de vos projets.",
    highlightsTitle: "Pourquoi choisir ORSAP pour votre matériel électrique ?",
    highlights: [
      "Produits certifiés d'origine garantis par des fabricants de renom (Schneider, Legrand, ABB).",
      "Protection optimale contre les surcharges, courts-circuits et risques de défaut à la terre.",
      "Gamme complète de câbles et d'appareillages robustes adaptés aux ambiances industrielles sévères.",
      "Disponibilité d'appareils d'automatisation avancés pour l'efficacité énergétique et le contrôle des moteurs."
    ],
    subRangesTitle: "Nos gammes d'électricité industrielle et bâtiment :",
    subRanges: [
      { title: "Disjoncteurs Divisionnaires & Boîtiers Moulés", desc: "Coupure de sécurité magnétothermique et différentielle haute sensibilité.", badge: "Protection", to: "/solutions/industrie" },
      { title: "Tableaux Électriques & Armoires Étanches IP66", desc: "Coffrets de chantier, armoires polyester et coffrets modulaires étanches.", badge: "Coffrets", to: "/solutions/industrie" },
      { title: "Câbles Électriques Basse Tension & Goulottes", desc: "Câbles industriels U-1000 R2V, chemins de câbles et goulottes de sol.", badge: "Câblage", to: "/solutions/vetements-professionnels" },
      { title: "Contacteurs de Puissance & Relais Thermiques", desc: "Commande moteur, bobines 24V/230V/400V et auxiliaires de signalisation.", badge: "Puissance", to: "/solutions/industrie" },
      { title: "Variateurs de Vitesse & Démarreurs Moteurs", desc: "Optimisation de la consommation énergétique et contrôle dynamique.", badge: "Automatisme", to: "/solutions/industrie" },
      { title: "Prises Industrielles Étanches & Connecteurs", desc: "Prises CEE 16A à 125A IP44/IP67 et prolongateurs de chantier.", badge: "Prises IP67", to: "/solutions/epi/btp" }
    ]
  },
  quincaillerie: {
    title: "Quincaillerie & agencement",
    subtitle: "Fixations de haute résistance, visserie boulonnerie et serrurerie professionnelle.",
    intro: "En matière de construction, d'agencement et de maintenance industrielle, la solidité d'une structure dépend toujours de la qualité de ses fixations. La quincaillerie et les systèmes d'ancrage lourd en sont les garants.",
    article: "ORSAP vous propose un catalogue complet de quincaillerie professionnelle et de solutions de fixation robustes. Notre gamme comprend des visseries boulonneries en acier zingué et acier inoxydable (inox A2, inox A4), des rondelles, écrous freins, ainsi que des chevilles d'ancrage mécanique lourd pour béton, des chevilles chimiques haute performance et des chevilles légères pour plaques de plâtre. Pour la serrurerie et l'agencement de vos bureaux, ateliers ou locaux commerciaux, nous distribuons également des serrures de sécurité, des cylindres de portes, des charnières de meubles et des ferrures résistantes. Nos produits certifiés assurent un assemblage à toute épreuve, comme un ciment mécanique unissant les matériaux face aux contraintes physiques.",
    highlightsTitle: "Pourquoi choisir ORSAP pour votre quincaillerie et vos fixations ?",
    highlights: [
      "Visserie et boulonnerie conformes aux classes de résistance supérieures (classe 8.8, 10.9, inox A4).",
      "Solutions d'ancrage lourd et de scellement chimique homologuées pour les applications de sécurité.",
      "Serrurerie de haute sûreté pour protéger l'accès à vos locaux professionnels.",
      "Large choix de ferrures et d'accessoires d'agencement pour menuisiers et agenceurs."
    ],
    subRangesTitle: "Nos gammes de quincaillerie et d'agencement :",
    subRanges: [
      { title: "Visserie Métaux & Boulonnerie Inox A2/A4", desc: "Boulons classe 8.8/10.9, écrous Nylstop, rondelles et vis à bois.", badge: "Visserie", to: "/solutions/industrie" },
      { title: "Chevilles d'Ancrage Lourd pour Béton", desc: "Goujons d'ancrage, chevilles métalliques à expansion sous fortes charges.", badge: "Ancrage", to: "/solutions/travail-en-hauteur/ancrages" },
      { title: "Scellement Chimique & Tiges Filetées", desc: "Résines vinylester et époxy sans styrène pour charges lourdes.", badge: "Scellement", to: "/solutions/travail-en-hauteur/ancrages" },
      { title: "Serrurerie, Cylindres & Cadenas LOTO", desc: "Serrures haute sûreté, cylindres européens et cadenas de sécurité.", badge: "Sécurité", to: "/solutions/industrie" },
      { title: "Charnières, Glissières & Ferrures de Meuble", desc: "Accessoires d'agencement pour menuiserie et aménagement tertiaire.", badge: "Agencement", to: "/solutions/revetements" },
      { title: "Supports de Tuyauterie & Colliers de Serrage", desc: "Colliers isophoniques, équerres lourdes et consoles métalliques.", badge: "Fixations", to: "/solutions/plomberie-fluides" }
    ]
  },
  revetements: {
    title: "Revêtements sols & murs",
    subtitle: "Revêtements de sol industriels techniques, résines époxy et agencement mural.",
    intro: "Les sols et murs des usines, entrepôts logistiques, laboratoires et locaux tertiaires sont soumis à de fortes agressions au quotidien : passage intensif d'engins, chutes d'outils lourds, projections de produits chimiques, et exigences d'hygiène strictes.",
    article: "ORSAP propose des revêtements de sol et mur industriels et techniques d'une durabilité exceptionnelle. Notre gamme s'articule autour de résines de sol époxy et polyuréthane autonivelantes qui offrent une surface lisse, étanche, esthétique et très facile à nettoyer, idéale pour l'industrie agroalimentaire et pharmaceutique. Nous fournissons également des mortiers de ragréage et de nivellement de haute performance pour la préparation des supports, des peintures de marquage au sol de sécurité, des dalles de protection amortissantes et des panneaux MDF pour l'agencement intérieur professionnel.",
    highlightsTitle: "Pourquoi choisir ORSAP pour vos revêtements sols et murs ?",
    highlights: [
      "Résines époxy autonivelantes offrant une résistance mécanique et chimique exceptionnelle.",
      "Sols conformes aux normes d'hygiène les plus strictes (normes HACCP pour l'agroalimentaire).",
      "Mortiers de ragréage et colles de haute technicité pour une préparation des supports sans faille.",
      "Panneaux et habillages muraux professionnels pour l'isolation et l'esthétique des bureaux."
    ],
    subRangesTitle: "Nos gammes de revêtements de sol et de mur :",
    subRanges: [
      { title: "Résines de Sol Époxy & Polyuréthane Autonivelantes", desc: "Sols continus sans joints, haute résistance chimique et mécanique.", badge: "Époxy", to: "/solutions/logistique" },
      { title: "Mortiers de Ragréage & Enduits de Nivellement", desc: "Préparation des dalles béton avant pose de résine ou revêtement.", badge: "Ragréage", to: "/solutions/epi/btp" },
      { title: "Peintures de Sol Industrielles & Marquage Sécurité", desc: "Peintures époxy bi-composant pour allées de circulation piétonnes.", badge: "Signalisation", to: "/solutions/logistique" },
      { title: "Panneaux MDF, Mélaminés & Agencement Mural", desc: "Habillages muraux acoustiques et décoratifs pour espaces de travail.", badge: "Agencement", to: "/solutions/quincaillerie" },
      { title: "Dalles de Sol Modulaires Antidérapantes", desc: "Dalles PVC clipsables amortissantes pour ateliers et garages.", badge: "Antidérapant", to: "/solutions/industrie" },
      { title: "Étanchéité des Murs/Sols & Mortiers Hydrofuges", desc: "Primaires d'adhérence, cuvelages et barrières anti-remontées capillaires.", badge: "Étanchéité", to: "/solutions/epi/btp" }
    ]
  },
  jardinage: {
    title: "Jardinage & espaces verts",
    subtitle: "Machines de motoculture professionnelles et outillage à main pour espaces verts.",
    intro: "L'entretien des parcs d'entreprises, des jardins résidentiels et des espaces verts publics nécessite un matériel professionnel fiable, puissant et sécurisé pour optimiser le temps d'intervention des équipes de paysagistes.",
    article: "ORSAP propose aux professionnels du paysage et aux collectivités une sélection de matériel de motoculture et d'outillage de jardin de haute performance. Notre catalogue comprend des tondeuses à gazon thermiques robustes pour les grandes surfaces, des débroussailleuses à dos confortables pour les terrains difficiles, des tronçonneuses et élagueuses professionnelles pour les travaux d'abattage ou de taille, ainsi que des taille-haies ergonomiques. Pour les travaux d'entretien de précision, nous fournissons de l'outillage à main de jardin (sécateurs professionnels, cisailles, pelles et râteaux) et des accessoires de rechange (fils de débroussailleuse, chaînes de tronçonneuse, lames), véritables sculpteurs de verdure à votre service.",
    highlightsTitle: "Pourquoi choisir ORSAP pour votre matériel d'espaces verts ?",
    highlights: [
      "Matériel de motoculture professionnelle sélectionné auprès de constructeurs de renom (Stihl, Valex, Vito).",
      "Motorisations thermiques puissantes ou batteries lithium écologiques haute performance.",
      "Ergonomie étudiée des poignées et harnais avec système anti-vibration pour le confort d'utilisation.",
      "Disponibilité immédiate de toutes les pièces d'usure et consommables (lames, chaînes, fils, filtres)."
    ],
    subRangesTitle: "Nos gammes de jardinage et motoculture :",
    subRanges: [
      { title: "Tondeuses à Gazon Thermiques & Tractées", desc: "Châssis acier, moteurs puissants pour grands parcs d'entreprises.", badge: "Tondeuses", to: "/solutions/vetements-professionnels" },
      { title: "Débroussailleuses Thermiques à Dos", desc: "Moteurs 2-temps performants, harnais rembourrés anti-vibrations.", badge: "Espaces Verts", to: "/solutions/epi/protection-yeux" },
      { title: "Tronçonneuses & Élagueuses Professionnelles", desc: "Scies à chaîne thermiques et perches d'élagage télescopiques.", badge: "Élagage", to: "/solutions/epi/gants/anti-coupure" },
      { title: "Taille-Haies sur Perche & Souffleurs de Feuilles", desc: "Lames double tranchant affûtées au laser et turbines puissantes.", badge: "Entretien", to: "/solutions/epi/protection-auditive" },
      { title: "Outillage à Main : Sécateurs, Cisailles & Pelles", desc: "Outils de coupe de précision et manches ergonomiques incassables.", badge: "Précision", to: "/solutions/outillage" },
      { title: "Systèmes d'Irrigation & Arrosage Automatique", desc: "Tuyaux d'arrosage armés, raccords laiton et programmateurs.", badge: "Arrosage", to: "/solutions/plomberie-fluides" }
    ]
  },
  consommables: {
    title: "Consommables industriels",
    subtitle: "Produits de maintenance, abrasifs de coupe et consommables d'atelier professionnels.",
    intro: "Le bon déroulement des opérations de fabrication, de montage et d'entretien quotidien au sein de l'atelier repose sur une multitude de consommables industriels de haute qualité. Ces indispensables permettent de couper, coller, lubrifier et nettoyer.",
    article: "Une rupture de stock sur ces petites fournitures peut bloquer une ligne de montage complète. ORSAP distribue une large gamme de consommables industriels indispensables au bon fonctionnement de vos installations. Nous fournissons des disques à tronçonner et à ébarber de haute performance pour le travail des métaux, des bandes abrasives de ponçage, des rubans adhésifs techniques ultra-résistants, ainsi que des colles professionnelles (néoprène, cyanoacrylate, colles de fixation). Pour la maintenance de vos machines, nous proposons des huiles et graisses industrielles haute performance, des sprays dégrippants, des dégraissants pour métaux et des chiffons d'essuyage technique, lubrifiant les rouages de votre efficacité industrielle.",
    highlightsTitle: "Pourquoi choisir ORSAP pour vos consommables industriels ?",
    highlights: [
      "Consommables à haut rendement pour réduire la fréquence de remplacement et les temps d'arrêt.",
      "Abrasifs de coupe à haute vitesse pour des découpes nettes sans échauffement des métaux.",
      "Lubrifiants techniques de haute technologie protégeant les pièces en mouvement contre l'usure.",
      "Adhésifs techniques hautes performances offrant une adhésion durable sur tous supports."
    ],
    subRangesTitle: "Nos gammes de consommables industriels d'atelier :",
    subRanges: [
      { title: "Disques à Tronçonner & Ébarber Métaux", desc: "Disques résine renforcés 115, 125 et 230 mm pour découpe d'acier.", badge: "Abrasifs", to: "/solutions/outillage" },
      { title: "Bandes Abrasives & Disques de Ponçage", desc: "Grains corindon et zirconium pour ponceuses à bande et orbitales.", badge: "Ponçage", to: "/solutions/epi/protection-respiratoire" },
      { title: "Lubrifiants Techniques & Huiles Hydrauliques", desc: "Huiles de coupe, graisses synthétiques et fluides industriels.", badge: "Lubrifiants", to: "/solutions/roulements-transmission" },
      { title: "Sprays Dégrippants & Dégraissants Métaux", desc: "Dégrippants pénétrants multifonctions et nettoyants de freins.", badge: "Maintenance", to: "/solutions/industrie" },
      { title: "Rubans Adhésifs Techniques & Double-Face", desc: "Adhésifs toilés haute résistance, masquage peinture et armés.", badge: "Adhésifs", to: "/solutions/logistique" },
      { title: "Colles Néoprène, Polyuréthane & Mastics", desc: "Collage structurel puissant et mastics d'étanchéité hybrides.", badge: "Colles", to: "/solutions/quincaillerie" }
    ]
  },
  luminaires: {
    title: "Luminaires & éclairage",
    subtitle: "Éclairage LED industriel haute efficacité, projecteurs extérieurs et dalles tertiaires.",
    intro: "L'éclairage d'un espace de travail industriel ou tertiaire au Maroc joue un rôle clé dans la productivité, la sécurité et le confort visuel des salariés, tout en représentant un poste de dépense énergétique majeur.",
    article: "Un éclairage performant doit allier intensité lumineuse et efficacité énergétique élevée. ORSAP propose des solutions d'éclairage LED industriel et commercial à destination des professionnels. Notre gamme comprend des projecteurs LED extérieurs étanches de forte puissance pour l'éclairage des parkings et façades, des réglettes LED étanches IP65 pour les ateliers et milieux humides, des suspensions industrielles (High-Bay LED) pour les halls de stockage à grande hauteur sous plafond, ainsi que des dalles LED encastrables pour les bureaux et espaces administratifs. Nos solutions vous permettent de réaliser d'importantes économies d'énergie tout en prolongeant la durée de vie de vos ampoules, chassant les ombres pour laisser place à la performance.",
    highlightsTitle: "Pourquoi choisir ORSAP pour vos luminaires et éclairage LED ?",
    highlights: [
      "Technologie LED haute efficacité permettant jusqu'à 80% d'économies d'énergie électrique.",
      "Durée de vie supérieure à 50 000 heures réduisant drastiquement les frais de maintenance.",
      "Luminaires étanches IP65 / IP66 résistants à la poussière et aux projections d'eau en atelier.",
      "Confort visuel accru avec une lumière homogène limitant la fatigue oculaire des opérateurs."
    ],
    subRangesTitle: "Nos gammes d'éclairage professionnel et industriel :",
    subRanges: [
      { title: "Suspensions High-Bay LED Grande Hauteur", desc: "100W à 240W, 150 lm/W pour hangars logistiques et usines.", badge: "High-Bay", to: "/solutions/logistique" },
      { title: "Réglettes LED Étanches IP65 / IP66", desc: "Boîtier polycarbonate résistant aux chocs IK08 pour ateliers humides.", badge: "IP65 Étanches", to: "/solutions/industrie" },
      { title: "Projecteurs LED Extérieurs de Chantier", desc: "Éclairage grande portée pour façades, voirie et parkings d'usine.", badge: "Extérieur", to: "/solutions/epi/btp" },
      { title: "Dalles LED Encastrables 600x600 Bureaux", desc: "UGR < 19 anti-éblouissement pour confort visuel optimal des bureaux.", badge: "Tertiaire", to: "/solutions/revetements" },
      { title: "Blocs de Secours & Signalisation BAES", desc: "Éclairage autonome d'évacuation de sécurité certifié NF/CE.", badge: "Sécurité", to: "/solutions/electricite" },
      { title: "Tubes & Sources Lumineuses LED T8", desc: "Remplacement direct des anciens tubes néons fluorescents énergivores.", badge: "Relamping", to: "/solutions/electricite" }
    ]
  }
};
