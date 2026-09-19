export type BlogPost = {
  id: string
  title: string
  summary: string
  content: string
  date: string
  image?: string | null
  pdf?: string | null
  pdfName?: string | null
}

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "les-10-r-gles-d-or-de-la-s-curit-au-travail-8idj",
    title: "Les 10 Règles d'Or de la Sécurité au Travail",
    summary: "Levier de Prévention des Accidents et Performance d'Entreprise au Maroc.",
    content: `La sécurité au travail est un impératif moral, juridique et économique pour toute entreprise moderne. La mise en place d'une culture de prévention rigoureuse permet non seulement de protéger la santé physique et mentale des collaborateurs, mais aussi d'accroître la productivité et de fiabiliser les opérations industrielles.

### 1. Porter systématiquement les EPI adaptés
Chaque poste de travail comporte des risques spécifiques. Le port des Équipements de Protection Individuelle (casques, chaussures de sécurité S3, lunettes, protections auditives, gants anti-coupure) doit être strict et conforme aux normes EN en vigueur.

### 2. Évaluer et signaler les risques en amont
Avant tout démarrage de chantier ou intervention de maintenance, réaliser une analyse des risques (minute sécurité) et consigner les points de vigilance.

### 3. Maîtriser le travail en hauteur
Utiliser exclusivement des échafaudages conformes, vérifiés et des systèmes antichute certifiés (harnais, longes à absorbeur, lignes de vie) avec des points d'ancrage homologués.

### 4. Respecter les consignes de levage et de manutention
Ne jamais dépasser la Charge Maximale d'Utilisation (CMU) des engins et élingues. Adopter les bonnes postures ergonomiques pour prévenir les TMS (Troubles Musculosquelettiques).

### 5. Consigner les énergies avant intervention (LOTO)
Appliquer scrupuleusement la procédure de cadenassage et de condamnation des circuits électriques, pneumatiques et hydrauliques avant toute opération de maintenance.

### 6. Maintenir les zones de travail dégagées et propres
L'ordre et la propreté préviennent plus de 40% des chutes de plain-pied et facilitent les évacuations d'urgence.

### 7. Manipuler les produits chimiques avec précaution
Consulter les Fiches de Données de Sécurité (FDS), porter les EPI chimiques appropriés (gants nitrile/néoprène, masques FFP3 ou à cartouches) et respecter les règles de stockage sécurisé.

### 8. Inspecter régulièrement l'outillage et les machines
Ne jamais utiliser d'outils défectueux ou modifiés. Respecter les plannings de vérification générale périodique (VGP).

### 9. Être formé et habilité
Ne réaliser que les tâches pour lesquelles vous disposez de l'habilitation requise (CACES, habilitation électrique, travail en hauteur, SST).

### 10. Signaler immédiatement tout incident ou presqu'accident
La remontée rapide des anomalies permet d'agir de manière préventive avant la survenue d'un accident grave.`,
    date: "2026-09-01T19:57:11.442Z",
    pdf: "/ORSAP-Services-Catalogue.pdf",
    pdfName: "10_Regles_Securite_Travail_ORSAP_Services.pdf"
  },
  {
    id: "guide-de-la-protection-des-risques-chimiques-dans-l-industrie-qlsk",
    title: "Guide de la Protection des Risques Chimiques dans l'Industrie",
    summary: "Identification des agents dangereux, choix des EPI normés et protocoles de prévention en milieu industriel.",
    content: `L'exposition aux substances chimiques dangereuses (solvants, acides, bases, poussières toxiques, vapeurs organiques) constitue un risque majeur pour la santé des travailleurs industriels au Maroc. Ce guide présente la démarche essentielle pour évaluer le risque chimique et sélectionner les protections adéquates.

### 1. L'évaluation du risque chimique
L'inventaire complet des produits utilisés et la consultation méthodique des Fiches de Données de Sécurité (FDS) permettent d'identifier les phrases de risque (mentions H et P) et de définir les Valeurs Limites d'Exposition Professionnelle (VLEP).

### 2. La protection respiratoire
Selon la nature du contaminant (poussières, aérosols, gaz ou vapeurs) et sa concentration :
- Masques jetables FFP2 ou FFP3 pour les poussières et particules fines.
- Demi-masques ou masques complets à cartouches interchangeables (A2B2E2K2P3) pour les vapeurs combinées et gaz nocifs.
- Systèmes à adduction d'air pour les espaces confinés à déficit d'oxygène.

### 3. La protection corporelle et cutanée
- Combinaisons de protection chimique étanches de Type 3/4/5/6 selon le niveau de projection ou d'étanchéité aux pulvérisations.
- Gants de protection chimique en nitrile renforcé, néoprène ou butyle conformes à la norme EN ISO 374-1 avec niveau de perméation certifié.
- Bottes de sécurité résistantes aux hydrocarbures et aux acides concentrés.

### 4. Rangement, rétention et décontamination
Stockage obligatoire sur bacs de rétention anticorrosion, séparation des produits incompatibles, présence de douches de sécurité et de rince-œil d'urgence à proximité immédiate des zones à risque.`,
    date: "2026-08-30T23:37:32.021Z",
    pdf: "/ORSAP-Services-Catalogue.pdf",
    pdfName: "Guide_Expert_Risques_Chimiques_Industriels_et_EPI.pdf"
  },
  {
    id: "echafaudage-securite-maroc",
    title: "Sécurité & Conformité des Échafaudages en Milieu Industriel",
    summary: "Découvrez les normes de sécurité en vigueur au Maroc pour le montage, la vérification et l'utilisation d'échafaudages sur vos chantiers.",
    content: `Le travail en hauteur reste l'une des principales causes d'accidents du travail dans le secteur du BTP et de l'industrie lourde. L'utilisation d'échafaudages conformes et rigoureusement contrôlés est un enjeu vital.

### Exigences réglementaires et normatives
Tous les échafaudages fixes et multidirectionnels doivent répondre aux normes EN 12810 et EN 12811. Les échafaudages roulants en aluminium doivent être conformes à la norme EN 1004.

### Les 5 étapes d'un montage sécurisé :
1. **Contrôle du sol d'assise :** Vérification de la portance du sol, calage sur semelles bois et réglage des vérins de niveau.
2. **Amarrage et contreventement :** Fixation solide à la structure porteuse selon les plans du constructeur.
3. **Planchers complets et trappes d'accès :** Aucun interstice dangereux, plinthes de 15 cm sur toute la périphérie pour empêcher les chutes d'outils.
4. **Garde-corps de sécurité :** Lisse à 1,00 m, sous-lisse à 45 cm et plinthe de butée.
5. **Procès-verbal de réception :** Inspection contradictoire avant mise en service avec affichage du panneau vert d'autorisation d'accès.`,
    date: "2026-08-29T18:00:00.000Z",
    image: "/images/categories/echafaudage_roulant.jpg",
    pdf: "/ORSAP-Services-Catalogue.pdf",
    pdfName: "Guide_Securite_Echafaudages_ORSAP.pdf"
  },
  {
    id: "optimiser-air-comprime",
    title: "Comment Optimiser l'Efficacité de vos Réseaux d'Air Comprimé ?",
    summary: "L'air comprimé est une ressource énergétique coûteuse. 4 étapes clés pour éliminer les fuites et optimiser le rendement de vos compresseurs.",
    content: `L'air comprimé représente souvent entre 20 et 30% de la facture électrique globale d'une usine industrielle. Pourtant, les réseaux non optimisés perdent en moyenne 25% de leur débit à cause de micro-fuites et de chutes de pression.

### Leviers d'optimisation énergétique :
- **Audit ultrasonore des fuites :** Détection sans arrêt de production des raccords et flexibles fuyards.
- **Réduction de la pression de service :** Abaisser la pression de consigne de 1 bar réduit la consommation électrique de 7%.
- **Traitement de l'air :** Sécheurs frigorifiques et filtres coalescents pour préserver les vérins et actionneurs pneumatiques.
- **Variation de vitesse :** Équiper le compresseur principal d'un variateur de fréquence adapté aux variations de charge.`,
    date: "2026-08-28T14:30:00.000Z",
    image: "/images/categories/coffre_fort_securite.jpg",
    pdf: "/ORSAP-Services-Catalogue.pdf",
    pdfName: "Audit_Efficacite_Air_Comprime_ORSAP.pdf"
  },
  {
    id: "choisir-epi-chantier-btp",
    title: "Guide Pratique : Choisir ses EPI pour les Chantiers BTP au Maroc",
    summary: "Panorama complet des équipements de protection individuelle indispensables pour sécuriser les équipes sur les chantiers de construction.",
    content: `Sur les chantiers de gros œuvre et de génie civil, la coactivité et les risques mécaniques imposent un équipement complet et normé pour chaque compagnon.

### Le pack essentiel du travailleur du BTP :
- **Casque de chantier (EN 397) :** Avec jugulaire 4 points pour le travail en hauteur et résistance aux chocs latéraux.
- **Chaussures de sécurité S3 (EN ISO 20345) :** Embout acier ou composite 200J, semelle anti-perforation et cramponnage tous terrains.
- **Gants de manutention (EN 388) :** Protection contre l'abrasion (niveau 4) et la déchirure.
- **Gilet haute visibilité classe 2 ou 3 (EN ISO 20471) :** Bandes rétro-réfléchissantes pour être vu de jour comme de nuit.
- **Lunettes panoramiques (EN 166) :** Protection contre les projections de poussières de ciment, d'éclats de béton et de métaux.`,
    date: "2026-08-27T10:00:00.000Z",
    image: "/images/categories/panneau_signalisation.jpg",
    pdf: "/ORSAP-Services-Catalogue.pdf",
    pdfName: "Guide_EPI_BTP_ORSAP.pdf"
  }
]
