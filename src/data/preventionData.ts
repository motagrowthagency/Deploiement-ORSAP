import { type SolutionArticleRef } from "./solutionsData"

export type PreventionHubItem = {
  slug: string; // e.g. "prevention", "prevention/ergonomie", "prevention/tms"
  route: string; // e.g. "/blog/prevention"
  title: string;
  heroTitle: string;
  subtitle: string;
  intro: string;
  description: string;
  seoClusters: string[];
  targetAudience: string;
  methodologySteps: { step: number; title: string; desc: string; icon?: string }[];
  keyToolsAndChecklists: { title: string; desc: string; badge: string; items: string[] }[];
  practicalAdvice: string[];
  expertQuote: { author: string; role: string; quote: string };
  faq: { q: string; a: string }[];
  linkedArticles: SolutionArticleRef[];
  breadcrumbs: { label: string; to: string }[];
  subHubs?: { title: string; to: string; desc: string }[];
};

export const PREVENTION_DATA: Record<string, PreventionHubItem> = {
  "prevention": {
    slug: "prevention",
    route: "/blog/prevention",
    title: "Prévention Sécurité & Culture HSE",
    heroTitle: "Culture de Prévention, Accueil Sécurité & Rituels QHSE",
    subtitle: "Méthodologies éprouvées, causeries sécurité 1/4h et check-lists de terrain pour instaurer le réflexe zéro accident.",
    intro: "La sécurité en entreprise ne se décrète pas par une simple consigne affichée au mur : elle se bâtit au quotidien à travers des rituels managériaux forts, une écoute active du terrain et l'implication de chaque collaborateur dès son premier jour de travail.",
    description: "Le pôle Prévention & Conseil ORSAP accompagne les directions de site, responsables QHSE et chefs de chantier pour passer d'une sécurité subie à une culture de prévention partagée. Découvrez nos guides méthodologiques, nos trames de causeries sécurité hebdomadaires et nos outils d'audit d'accueil sécurité.",
    seoClusters: ["Accueil sécurité", "Causerie sécurité", "Check-list"],
    targetAudience: "Responsables QHSE, Directeurs d'Usine, Chefs de Chantier, Membres du CSE / CSSCT, Superviseurs de Maintenance",
    methodologySteps: [
      { step: 1, title: "L'Accueil Sécurité Systématique", desc: "Former et sensibiliser 100% des nouveaux arrivants, intérimaires et sous-traitants avant leur premier pas sur le site." },
      { step: 2, title: "La Causerie Sécurité Hebdomadaire (1/4h)", desc: "Un échange direct de 15 minutes sur le terrain autour d'un cas concret, d'un presqu'accident ou d'une bonne pratique." },
      { step: 3, title: "La Check-list d'Audit Quotidienne", desc: "Une vérification rapide de 5 minutes avant la prise de poste : état des EPI, balisage, propreté et outillage." },
      { step: 4, title: "Le Retour d'Expérience & Actions Correctives", desc: "Analyser sans blâme les situations dangereuses signalées par les opérateurs pour adapter les équipements." }
    ],
    keyToolsAndChecklists: [
      {
        title: "Kit d'Accueil Sécurité Nouveaux Arrivants",
        desc: "Trame d'intégration obligatoire pour garantir la prise de conscience des risques du site.",
        badge: "Modèle Prêt à l'Emploi",
        items: [
          "Présentation des risques généraux du site et plan de circulation",
          "Consignes d'évacuation, issues de secours et points de rassemblement",
          "Délivrance et réglage individuel des EPI obligatoires",
          "Signature de la charte sécurité et remise du livret d'accueil"
        ]
      },
      {
        title: "Fiche Causerie Sécurité '15 Minutes pour Sauver une Vie'",
        desc: "Structure pédagogique pour animer un rituel sécurité dynamique et participatif.",
        badge: "Animation Équipe",
        items: [
          "5 min : Présentation du thème (ex: port du casque, risque chimique, gestes et postures)",
          "5 min : Tour de table et recueil des retours d'expérience vécus par l'équipe",
          "5 min : Engagement collectif sur 2 actions concrètes à appliquer immédiatement"
        ]
      },
      {
        title: "Check-List Audit Visuel de Prise de Poste",
        desc: "Contrôle flash de conformité des postes de travail en début de journée.",
        badge: "Contrôle Terrain",
        items: [
          "Allées de circulation dégagées et sans obstacle ni liquide au sol",
          "EPI complets, en bon état et correctement ajustés par chaque équipier",
          "Équipements d'arrêt d'urgence et extincteurs accessibles sans encombrement",
          "Éclairage adéquat et outillage en parfait état de fonctionnement"
        ]
      }
    ],
    practicalAdvice: [
      "Impliquez les opérateurs dans le choix de leurs EPI : un équipement choisi conjointement avec l'équipe est porté dans 95% des cas.",
      "Ne transformez jamais une causerie sécurité en tribunal : valorisez les signalements de presqu'accidents pour désamorcer les risques avant le drame.",
      "Affichez clairement les indicateurs de sécurité (jours sans accident, taux de fréquence) à l'entrée du site pour maintenir la mobilisation collective."
    ],
    expertQuote: {
      author: "Équipe Conseil QHSE ORSAP",
      role: "Experts Prévention & Conformité Industrielle",
      quote: "Une entreprise performante est d'abord une entreprise où chaque collaborateur rentre chez lui en parfaite santé chaque soir. La prévention n'est pas un coût, c'est l'investissement le plus rentable pour la pérennité de votre activité."
    },
    faq: [
      { q: "Quelle est la durée idéale d'une causerie sécurité ?", a: "15 minutes maximum, organisées directement sur le lieu de travail et debout en petit groupe (5 à 10 personnes). La brièveté garantit une attention maximale." },
      { q: "L'accueil sécurité est-il obligatoire pour les intérimaires ?", a: "Oui, la réglementation impose un accueil et une formation renforcée à la sécurité pour tout travailleur temporaire ou intervenant extérieur avant sa prise de poste." }
    ],
    linkedArticles: [
      { id: "ART-064", title: "L'accueil sécurité des nouveaux arrivants et intérimaires : Méthode en 5 étapes", excerpt: "Structurer un parcours d'intégration sécurité efficace pour neutraliser le pic d'accidents des premiers jours.", clusters: ["Accueil sécurité", "Culture sécurité"], readTime: "5 min" },
      { id: "ART-065", title: "Comment animer une causerie sécurité quart d'heure dynamique et engageante", excerpt: "Techniques d'animation, choix des sujets d'actualité et maintien de l'écoute active des équipes.", clusters: ["Causerie sécurité"], readTime: "6 min" },
      { id: "ART-066", title: "Check-lists de sécurité quotidienne : Pourquoi et comment les digitaliser sur le terrain", excerpt: "Transformer les contrôles papier en routines de sécurité rapides sur smartphone ou tablette d'atelier.", clusters: ["Check-list", "Digitalisation"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Blog", to: "/blog" },
      { label: "Prévention & Sécurité", to: "/blog/prevention" }
    ],
    subHubs: [
      { title: "Ergonomie & Postures", to: "/blog/prevention/ergonomie", desc: "Aménagement des postes de travail et correction des contraintes biomécaniques." },
      { title: "Prévention des TMS", to: "/blog/prevention/tms", desc: "Stratégies et équipements pour éradiquer les troubles musculosquelettiques." }
    ]
  },

  "prevention/ergonomie": {
    slug: "prevention/ergonomie",
    route: "/blog/prevention/ergonomie",
    category: "Ergonomie",
    title: "Ergonomie au Travail & Postures",
    heroTitle: "Ergonomie Industrielle, Postures de Travail & Confort Opérateur",
    subtitle: "Adapter le travail à l'homme : aménagement des postes d'atelier, logistique et tertiaire pour allier bien-être et productivité.",
    intro: "Travailler les bras au-dessus des épaules, se pencher 500 fois par jour pour saisir des pièces dans un bac ou rester debout immobile pendant 8 heures sont autant de contraintes posturales qui usent prématurément le corps humain. L'ergonomie industrielle consiste à reconcevoir les postes pour préserver la santé des salariés.",
    description: "ORSAP met à votre disposition son expertise en analyse ergonomique des postes de travail industriels et logistiques. Découvrez comment optimiser les zones de préhension, installer des sièges et tapis anti-fatigue adaptés et choisir des outillages équilibrés limitant les efforts musculaires.",
    seoClusters: ["Ergonomie", "Postures"],
    targetAudience: "Ergonomes, Responsables HSE, Responsables Méthodes & Amélioration Continue, Médecins du Travail, Chefs d'Atelier",
    methodologySteps: [
      { step: 1, title: "Observation & Cartographie des Postures", desc: "Filmer et analyser les cycles de travail pour identifier les amplitudes articulaires extrêmes (méthode RULA / REBA)." },
      { step: 2, title: "Définition de la Zone de Confort Optimal", desc: "Placer 90% des pièces et outils dans la zone d'atteinte naturelle (entre le coude et les hanches, sans extension des bras)." },
      { step: 3, title: "Ajustement & Modularité des Équipements", desc: "Intégrer des plans de travail réglables en hauteur, des repose-pieds et des sièges assis-debout polyvalents." },
      { step: 4, title: "Alternance des Tâches & Micro-Pauses", desc: "Mettre en place des rotations de postes pour éviter la sollicitation continue des mêmes groupes musculaires." }
    ],
    keyToolsAndChecklists: [
      {
        title: "Grille d'Évaluation Ergonomique d'un Poste",
        desc: "Les 4 critères majeurs à évaluer lors de chaque aménagement de poste.",
        badge: "Diagnostic",
        items: [
          "Hauteur du plan de travail par rapport au coude de l'opérateur (précision vs force)",
          "Distance d'atteinte horizontale des composants (idéalement inférieure à 40 cm)",
          "Éclairage au poste sans éblouissement ni ombre portée (500 à 1000 Lux pour travaux fins)",
          "Présence d'un sol amortissant (tapis anti-fatigue) pour les postes debout fixes"
        ]
      },
      {
        title: "Plan d'Aménagement d'un Poste d'Emballage Logistique",
        desc: "Configuration recommandée pour les préparateurs de commandes.",
        badge: "Cas Concret",
        items: [
          "Table d'emballage à hauteur variable motorisée ou manuelle",
          "Distributeur de rouleaux d'adhésif et film étirable à portée de main immédiate",
          "Tapis de sol ergonomique en caoutchouc alvéolaire amortissant",
          "Siège assis-debout ergonomique facilitant le passage assis/debout fluide"
        ]
      }
    ],
    practicalAdvice: [
      "Privilégiez toujours la règle de la zone dorée : le travail lourd doit se faire au niveau des hanches, le travail moyen au niveau du coude, le travail de précision au niveau du thorax.",
      "Évitez à tout prix les torsions du tronc : positionnez toujours les bacs d'approvisionnement face à l'opérateur plutôt que sur les côtés.",
      "Choisissez des outils électroportatifs équilibrés et utilisez des équilibreurs à ressort (rétracteurs) pour suspendre les visseuses et clés à choc lourdes au-dessus du poste."
    ],
    expertQuote: {
      author: "Consultant Ergonomie ORSAP",
      role: "Spécialiste Postures & Aménagement d'Atelier",
      quote: "Une bonne posture ne se force pas, elle se favorise par un poste bien conçu. Quand l'environnement de travail est ergonomique, l'efficacité augmente naturellement sans fatigue supplémentaire."
    },
    faq: [
      { q: "À quelle hauteur doit se situer un plan de travail pour travail debout ?", a: "Pour un travail de précision, le plan doit être 5 à 10 cm au-dessus de la hauteur des coudes. Pour un travail léger, à hauteur des coudes. Pour un travail de force nécessitant un appui, 10 à 15 cm en dessous des coudes." }
    ],
    linkedArticles: [
      { id: "ART-033", title: "Ergonomie des postes de travail en usine et entrepôt : Les 7 principes clés", excerpt: "Règles d'or pour concevoir des postes modulaires qui s'adaptent à toutes les tailles d'opérateurs.", clusters: ["Ergonomie", "Postures"], readTime: "6 min" },
      { id: "ART-034", title: "Guide des postures au travail : Comment prévenir le mal de dos et la fatigue", excerpt: "Exercices d'échauffement avant prise de poste et réglage des postes assis-debout.", clusters: ["Postures", "Prévention"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Blog", to: "/blog" },
      { label: "Prévention", to: "/blog/prevention" },
      { label: "Ergonomie & Postures", to: "/blog/prevention/ergonomie" }
    ]
  },

  "prevention/tms": {
    slug: "prevention/tms",
    route: "/blog/prevention/tms",
    category: "TMS",
    title: "Prévention des TMS & Gestes Répétitifs",
    heroTitle: "Prévention des Troubles Musculo-Squelettiques (TMS) en Entreprise",
    subtitle: "Comprendre, diagnostiquer et éradiquer la première cause de maladie professionnelle au Maroc et à l'international.",
    intro: "Les Troubles Musculo-Squelettiques (TMS) — tendinites de l'épaule, syndrome du canal carpien, lombalgies, épicondylites du coude — représentent plus de 85% des maladies professionnelles reconnues. Ils entraînent absentéisme, perte de compétences et baisse majeure de productivité.",
    description: "ORSAP accompagne les entreprises pour briser le cercle vicieux des TMS grâce à une approche globale combinant équipements d'assistance physique (exosquelettes légers, transpalettes électriques, tables élévatrices), gants anti-vibration et réorganisation des cadences de travail.",
    seoClusters: ["Gestes répétitifs", "TMS"],
    targetAudience: "Directions Générales, Responsables RH, Responsables QHSE, Médecins du Travail, Chefs d'Atelier",
    methodologySteps: [
      { step: 1, title: "Identification des Facteurs de Risque Multiples", desc: "Analyser les 3 dimensions des TMS : biomécanique (force, répétition), organisationnelle (cadences) et environnementale (froid, vibrations)." },
      { step: 2, title: "Suppression des Ports de Charge Manuelle", desc: "Remplacer systématiquement le port de charges supérieures à 15 kg par des gerbeurs, palans ou chariots motorisés." },
      { step: 3, title: "Équipements Anti-Vibrations & Dextérité", desc: "Équiper les opérateurs d'outils à carter amorti et de gants certifiés ISO 10819 pour absorber les vibrations des meuleuses et marteaux." },
      { step: 4, title: "Échauffement & Réveil Musculaire", desc: "Instaurer 5 minutes d'étirements collectifs guidés au démarrage de chaque quart pour préparer les tendons à l'effort." }
    ],
    keyToolsAndChecklists: [
      {
        title: "Plan d'Action Anti-TMS en 4 Axes",
        desc: "Stratégie globale pour réduire de 50% les arrêts de travail liés aux TMS.",
        badge: "Plan Stratégique",
        items: [
          "Axe Technique : Intégration de tables élévatrices pour supprimer les flexions du dos",
          "Axe Équipement : Fourniture de gants ultra-légers à haut grip réduisant la force de serrage",
          "Axe Organisationnel : Rotation des postes toutes les 2 heures sur lignes cadencées",
          "Axe Humain : Sensibilisation des opérateurs aux principes de biomécanique et gestes sûrs"
        ]
      },
      {
        title: "Cartographie des TMS par Articulation",
        desc: "Points de vigilance pour chaque zone anatomique sollicitée.",
        badge: "Anatomie & Risque",
        items: [
          "Épaules : Tendinopathie de la coiffe des rotateurs (travaux les bras levés)",
          "Coudes : Épicondylite / Épitrochléite (mouvements répétés de vissage et serrage)",
          "Poignets & Mains : Syndrome du canal carpien (torsions répétées et saisie en pince)",
          "Dos / Rachis : Lombalgies et hernies discales (soulèvement de charges en flexion/torsion)"
        ]
      }
    ],
    practicalAdvice: [
      "Ne laissez jamais un salarié travailler avec des symptômes débutants de douleur : 80% des TMS pris en charge au stade précoce régressent sans arrêt de travail.",
      "Le froid accentue fortement le risque de TMS en raidissant les tendons : chauffez les ateliers ou équipez les opérateurs de vêtements thermiques légers.",
      "Évitez les outillages trop lourds ou mal équilibrés : une réduction de 500 grammes sur une meuleuse diminue de 30% la fatigue des épaules sur une journée."
    ],
    expertQuote: {
      author: "Pôle Santé & Prévention ORSAP",
      role: "Experts en Biomécanique & Ergonomie Industrielle",
      quote: "Chaque dirham investi dans la prévention des TMS en rapporte trois en gains de productivité, réduction du turnover et baisse des cotisations d'accidents du travail."
    },
    faq: [
      { q: "Quelles sont les causes principales des TMS ?", a: "La combinaison de mouvements répétitifs à fréquence élevée, d'efforts excessifs de préhension, de postures articulaires inconfortables et de temps de récupération insuffisants." },
      { q: "Comment les gants de travail peuvent-ils aider à prévenir les TMS ?", a: "Un gant doté d'un excellent grip réduit de moitié la force de serrage nécessaire pour tenir une pièce ou un carton, ce qui soulage considérablement les tendons des doigts et du poignet." }
    ],
    linkedArticles: [
      { id: "ART-031", title: "Comprendre et éradiquer les TMS en milieu industriel : Le guide complet", excerpt: "Mécanismes physiologiques d'apparition des tendinites et méthodes concrètes de réduction des contraintes.", clusters: ["TMS", "Gestes répétitifs"], readTime: "6 min" },
      { id: "ART-032", title: "Gestes répétitifs et port de charges lourdes : Méthodes et solutions d'assistance", excerpt: "Calcul de la charge limite acceptable (norme AFNOR) et choix des aides mécaniques à la manutention.", clusters: ["Gestes répétitifs", "Manutention"], readTime: "5 min" }
    ],
    breadcrumbs: [
      { label: "Accueil", to: "/" },
      { label: "Blog", to: "/blog" },
      { label: "Prévention", to: "/blog/prevention" },
      { label: "Prévention des TMS", to: "/blog/prevention/tms" }
    ]
  }
};
