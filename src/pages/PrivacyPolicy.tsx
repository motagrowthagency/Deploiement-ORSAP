import { Link } from "react-router"
import SEO from "@/components/SEO"

export default function PrivacyPolicy() {
  return (
    <div className="bg-paper text-ink">
      <SEO
        title="Politique de Confidentialité | Données Personnelles | ORSAP Maroc"
        description="Consultez la politique de confidentialité d'ORSAP Maroc. Traitement des données à caractère personnel conforme à la loi marocaine n° 09-08 (CNDP) et aux standards de sécurité."
        keywords={[
          "politique de confidentialite orsap",
          "protection des donnees maroc",
          "loi 09-08 cndp",
          "donnees personnelles casablanca",
          "rgpd b2b maroc"
        ]}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Politique de confidentialité", url: "/politique-de-confidentialite" }
        ]}
      />

      {/* Header Banner */}
      <section className="border-b border-hairline bg-card py-14 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-6">
          <nav className="mb-6 flex items-center gap-2 text-[12.5px] text-ink-soft">
            <Link to="/" className="hover:text-orsap-red focus-visible:ring-2 focus-visible:ring-orsap-red rounded">
              Accueil
            </Link>
            <span className="text-hairline">/</span>
            <span className="text-ink font-medium">Politique de confidentialité</span>
          </nav>
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orsap-red">
              <span className="h-px w-6 bg-orsap-red" />
              Protection des Données & Vie Privée
            </div>
            <h1 className="font-display text-[clamp(2rem,3.5vw,3.2rem)] font-black leading-tight tracking-tight text-ink">
              Politique de Confidentialité
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              La présente politique a pour objet d&apos;informer les utilisateurs du site <strong>orsap.ma</strong> des modalités de collecte, de traitement et de protection de leurs données à caractère personnel, conformément aux dispositions de la <strong>Loi n° 09-08</strong> relative à la protection des personnes physiques à l&apos;égard du traitement des données à caractère personnel promulguée par le Dahir n° 1-09-15 du 22 safar 1430 (18 février 2009).
            </p>
            <div className="mt-4 text-xs text-ink-soft font-mono">
              Dernière mise à jour : 17 Septembre 2026
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-[900px] px-6 space-y-10 text-[15px] leading-relaxed text-ink/90">
          
          {/* Article 1 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">1</span>
              Responsable du Traitement
            </h2>
            <p>
              Le responsable du traitement des données collectées sur le site <strong>orsap.ma</strong> est :
            </p>
            <div className="mt-3 rounded-lg bg-paper p-4 text-sm space-y-1 border border-hairline/60">
              <p><strong>Raison Sociale :</strong> ORSAP SARL</p>
              <p><strong>Siège Social :</strong> Casablanca, Maroc</p>
              <p><strong>Téléphone :</strong> +212 6 44 20 30 30</p>
              <p><strong>Email de contact DPO / Confidentialité :</strong> <a href="mailto:orsap@orsap.ma" className="text-orsap-red font-semibold hover:underline">orsap@orsap.ma</a></p>
            </div>
          </div>

          {/* Article 2 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">2</span>
              Données Collectées (Principe de Minimisation)
            </h2>
            <p>
              ORSAP veille à ne collecter que les données strictement nécessaires à l&apos;exécution des services demandés par l&apos;utilisateur :
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-ink-soft">
              <li><strong>Demande de devis & contact commercial :</strong> Nom, prénom, dénomination sociale de l&apos;entreprise, adresse email professionnelle, numéro de téléphone, secteur d&apos;activité, liste des articles ou solutions demandées, message contextuel.</li>
              <li><strong>Espace Client B2B :</strong> Identifiants de connexion (adresse email et mot de passe chiffré), historique des demandes de devis transmises, coordonnées de facturation et de livraison.</li>
              <li><strong>Candidatures & Recrutement :</strong> Nom, coordonnées, intitulé du poste visé, lettre de motivation et Curriculum Vitae (CV) transmis volontairement.</li>
              <li><strong>Données techniques de navigation :</strong> Adresse IP anonymisée, type de terminal et navigateur, pages consultées dans le cadre de statistiques d&apos;audience anonymes (sans profilage publicitaire invasif).</li>
            </ul>
          </div>

          {/* Article 3 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">3</span>
              Finalités des Traitements
            </h2>
            <p>Les données à caractère personnel recueillies sur le site sont utilisées exclusivement pour :</p>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-ink-soft">
              <li>L&apos;établissement, l&apos;envoi et le suivi personnalisé des devis commerciaux et propositions techniques.</li>
              <li>La gestion de la relation client B2B, l&apos;accès à l&apos;Espace Client et le traitement des commandes de fournitures industrielles.</li>
              <li>Le traitement des questions techniques, demandes d&apos;assistance ou réclamations.</li>
              <li>Le traitement et la gestion des candidatures spontanées ou en réponse à une offre d&apos;emploi.</li>
              <li>L&apos;amélioration continue de l&apos;ergonomie, de la sécurité et des performances techniques du site orsap.ma.</li>
            </ul>
          </div>

          {/* Article 4 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">4</span>
              Destinataires des Données & Non-Revente
            </h2>
            <p>
              <strong>ORSAP ne vend, ne loue et ne cède aucune donnée personnelle à des tiers à des fins commerciales ou publicitaires.</strong>
            </p>
            <p className="mt-2 text-ink-soft">
              Les données sont exclusivement destinées aux équipes internes habilitées d&apos;ORSAP (service commercial, service logistique, support client, direction RH pour les recrutements) ainsi qu&apos;à d&apos;éventuels prestataires techniques agissant en qualité de sous-traitants stricts (hébergement sécurisé, passerelle d&apos;envoi d&apos;emails transactionnels) tenus par des engagements stricts de confidentialité et de sécurité.
            </p>
          </div>

          {/* Article 5 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">5</span>
              Durée de Conservation des Données
            </h2>
            <ul className="mt-2 list-disc pl-5 space-y-2 text-ink-soft">
              <li><strong>Données de prospects et devis :</strong> Conservées pendant 3 ans à compter du dernier contact émanant du prospect.</li>
              <li><strong>Données clients (factures, devis validés) :</strong> Conservées pendant les durées légales obligatoires prévues par le Code de Commerce marocain et la réglementation fiscale (10 ans).</li>
              <li><strong>Données de recrutement (CV) :</strong> Conservées pour une durée maximale de 2 ans afin de recontacter le candidat si une opportunité se présente, sauf demande expresse de suppression anticipée.</li>
              <li><strong>Cookies et traceurs :</strong> Durée maximale de 13 mois conformément aux recommandations applicables.</li>
            </ul>
          </div>

          {/* Article 6 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">6</span>
              Vos Droits (Loi 09-08 & CNDP)
            </h2>
            <p>
              Conformément à la <strong>Loi n° 09-08</strong>, vous disposez à tout moment d&apos;un :
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-paper rounded-lg border border-hairline/60">
                <strong className="text-ink text-sm block mb-1">Droit d&apos;accès</strong>
                <span className="text-xs text-ink-soft">Obtenir confirmation que des données vous concernant sont traitées et en obtenir copie.</span>
              </div>
              <div className="p-3.5 bg-paper rounded-lg border border-hairline/60">
                <strong className="text-ink text-sm block mb-1">Droit de rectification</strong>
                <span className="text-xs text-ink-soft">Demander la mise à jour ou la correction de données inexactes ou incomplètes.</span>
              </div>
              <div className="p-3.5 bg-paper rounded-lg border border-hairline/60">
                <strong className="text-ink text-sm block mb-1">Droit d&apos;opposition</strong>
                <span className="text-xs text-ink-soft">Vous opposer, pour des motifs légitimes, au traitement de vos données.</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink-soft">
              Pour exercer ces droits, vous pouvez contacter notre référent protection des données par email à <a href="mailto:orsap@orsap.ma" className="text-orsap-red font-semibold hover:underline">orsap@orsap.ma</a> ou par courrier postal adressé à ORSAP SARL, Casablanca, Maroc, en joignant une copie d&apos;une pièce d&apos;identité en cours de validité.
            </p>
            <p className="mt-2 text-xs text-steel">
              Ce traitement est notifié et conforme aux prescriptions de la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP - www.cndp.ma).
            </p>
          </div>

          {/* Article 7 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">7</span>
              Sécurité et Chiffrement des Données
            </h2>
            <p className="text-ink-soft">
              ORSAP met en œuvre des mesures techniques et organisationnelles appropriées (chiffrement TLS/HTTPS, pare-feu applicatif, hachage sécurisé des mots de passe, accès restreint aux seuls collaborateurs habilités) afin d&apos;empêcher toute altération, perte, accès non autorisé ou divulgation de vos données personnelles.
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
