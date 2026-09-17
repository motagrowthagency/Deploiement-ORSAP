import { Link } from "react-router"
import SEO from "@/components/SEO"

export default function TermsAndConditions() {
  return (
    <div className="bg-paper text-ink">
      <SEO
        title="Mentions Légales & Conditions Générales de Vente (CGV) | ORSAP Maroc"
        description="Consultez les mentions légales, conditions générales d'utilisation (CGU) et conditions générales de vente (CGV) B2B d'ORSAP Maroc. Réglementation commerciale marocaine et protection des acheteurs."
        keywords={[
          "mentions legales orsap",
          "conditions generales de vente maroc",
          "cgv b2b casablanca",
          "conditions d'utilisation orsap.ma",
          "rc if ice orsap sarl"
        ]}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Conditions Générales & Mentions Légales", url: "/conditions-generales" }
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
            <span className="text-ink font-medium">Mentions Légales & CGV</span>
          </nav>
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orsap-red">
              <span className="h-px w-6 bg-orsap-red" />
              Cadre Juridique & Commercial
            </div>
            <h1 className="font-display text-[clamp(2rem,3.5vw,3.2rem)] font-black leading-tight tracking-tight text-ink">
              Mentions Légales & Conditions Générales de Vente
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Les présentes dispositions régissent l&apos;utilisation de la plateforme en ligne <strong>orsap.ma</strong> ainsi que l&apos;ensemble des relations commerciales, propositions tarifaires et ventes de fournitures industrielles conclues entre la société <strong>ORSAP SARL</strong> et ses clients professionnels et institutionnels.
            </p>
            <div className="mt-4 text-xs text-ink-soft font-mono">
              En vigueur au : 17 Septembre 2026
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-[900px] px-6 space-y-10 text-[15px] leading-relaxed text-ink/90">

          {/* Section 1 : Mentions Légales */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">1</span>
              Mentions Légales & Identification de l&apos;Éditeur
            </h2>
            <div className="space-y-2 text-ink-soft">
              <p>Le site <strong>orsap.ma</strong> est édité et exploité par la société :</p>
              <div className="mt-3 rounded-lg bg-paper p-4 text-sm space-y-1.5 border border-hairline/60 text-ink">
                <p><strong>Dénomination sociale :</strong> ORSAP SARL (Société à Responsabilité Limitée)</p>
                <p><strong>Activité principale :</strong> Importation, distribution de matériel industriel, outillage professionnel, EPI, levage, quincaillerie et fournitures de chantier.</p>
                <p><strong>Siège social :</strong> Casablanca, Royaume du Maroc</p>
                <p><strong>Téléphone :</strong> +212 6 44 20 30 30</p>
                <p><strong>Email officiel :</strong> <a href="mailto:orsap@orsap.ma" className="text-orsap-red font-semibold hover:underline">orsap@orsap.ma</a></p>
                <p><strong>Directeur de la publication :</strong> Direction Générale ORSAP SARL</p>
                <p><strong>Hébergement du site :</strong> Infrastructure Cloud sécurisée avec protocole SSL/TLS chiffré</p>
              </div>
            </div>
          </div>

          {/* Section 2 : Propriété Intellectuelle & Marques Tierces */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">2</span>
              Propriété Intellectuelle & Marques Distribuées
            </h2>
            <p className="text-ink-soft">
              L&apos;ensemble des éléments constituant le site <strong>orsap.ma</strong> (textes, arborescences, chartes graphiques, photographies de mise en situation, logotypes et marques propres à ORSAP) sont protégés au titre du droit d&apos;auteur et de la propriété intellectuelle marocaine et internationale.
            </p>
            <div className="mt-3 rounded-lg bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-950 border border-amber-500/20">
              <strong>Mention concernant les marques partenaires :</strong> Les marques commerciales citées ou reproduites dans notre catalogue (notamment Bosch, Makita, Sika, Delta Plus, Honeywell, Facom, DeWalt, Schneider Electric, Philips, etc.) ainsi que leurs logos respectifs demeurent la propriété exclusive de leurs détenteurs légitimes. Leur reproduction sur orsap.ma intervient exclusivement à des fins d&apos;identification et de commercialisation légitime des produits distribués.
            </div>
          </div>

          {/* Section 3 : Modalités de Devis & Formation du Contrat */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">3</span>
              Devis, Tarification & Formation de la Vente
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-ink-soft">
              <li><strong>Validité des devis :</strong> Les offres de prix et devis émis par ORSAP sont valables pour une durée standard de trente (30) jours à compter de leur date d&apos;émission, sauf stipulation contraire expressément indiquée sur l&apos;offre commerciale.</li>
              <li><strong>Monnaie et Taxes :</strong> Sauf mention expresse, tous les prix sont libellés en <strong>Dirhams Marocains (MAD)</strong> Hors Taxes (HT). La Taxe sur la Valeur Ajoutée (TVA au taux légal en vigueur au Maroc, soit 20%) est calculée et précisée lors de la confirmation du devis et de la facturation.</li>
              <li><strong>Acceptation de commande :</strong> La vente est réputée conclue à réception du devis signé et revêtu du cachet de l&apos;entreprise cliente avec la mention « Bon pour accord », ou par l&apos;émission d&apos;un Bon de Commande (PO) officiel concordant.</li>
            </ul>
          </div>

          {/* Section 4 : Modalités de Paiement & Pénalités */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">4</span>
              Conditions de Paiement & Délais
            </h2>
            <p className="text-ink-soft">
              Sauf conditions de compte professionnel négociées et validées préalablement par le service financier d&apos;ORSAP (ex: règlement à 30 ou 60 jours fin de mois) :
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-ink-soft">
              <li>Le règlement s&apos;effectue par virement bancaire, chèque barré non endossable ou effet de commerce libellé à l&apos;ordre d&apos;ORSAP SARL.</li>
              <li>Conformément aux dispositions de la <strong>Loi n° 32-10</strong> complétant la loi n° 15-95 formant Code de Commerce relative aux délais de paiement, tout retard de règlement entraîne de plein droit et sans mise en demeure préalable l&apos;application de pénalités de retard calculées selon le taux légal en vigueur, ainsi que la suspension des livraisons en cours.</li>
            </ul>
          </div>

          {/* Section 5 : Réserve de Propriété */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">5</span>
              Clause de Réserve de Propriété (Loi 15-95)
            </h2>
            <p className="text-ink-soft">
              <strong>ORSAP conserve la propriété intégrale et exclusive des marchandises vendues jusqu&apos;au paiement effectif et intégral de leur prix en principal et accessoires.</strong>
            </p>
            <p className="mt-2 text-ink-soft text-sm">
              Nonobstant cette réserve de propriété, le transfert des risques de perte et de détérioration des marchandises est transféré au client dès la remise matérielle des articles à l&apos;adresse de livraison convenue ou dès leur prise en charge par le transporteur.
            </p>
          </div>

          {/* Section 6 : Livraison, Réception & Réclamations */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">6</span>
              Livraison, Réception & Délais de Réclamation
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-ink-soft">
              <li>Les délais de livraison indiqués dans nos propositions sont donnés à titre indicatif selon la disponibilité des stocks et le planning logistique au Maroc (standard 24h à 48h pour les références courantes en zone urbaine).</li>
              <li><strong>Contrôle à réception :</strong> Il appartient au client de vérifier le nombre de colis, l&apos;état des emballages et la conformité des articles livrés en présence du livreur ou transporteur.</li>
              <li>Toute anomalie (avarie de transport, produit manquant ou non conforme) doit être mentionnée de façon précise sur le bon de livraison (BL) et confirmée par écrit auprès d&apos;ORSAP dans un délai impératif de <strong>48 heures ouvrées</strong> suivant la réception.</li>
            </ul>
          </div>

          {/* Section 7 : Droit Applicable & Juridiction */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">7</span>
              Droit Applicable & Juridiction Compétente
            </h2>
            <p className="text-ink-soft">
              Les présentes conditions générales, ainsi que tous les actes et opérations qui en découlent, sont régis et soumis exclusivement au <strong>Droit Marocain</strong>.
            </p>
            <p className="mt-2 text-ink-soft">
              En cas de litige, contestation ou différend relatif à l&apos;interprétation, l&apos;exécution ou la validité d&apos;une vente, les parties s&apos;engagent à rechercher préalablement un règlement amiable. À défaut d&apos;accord amiable sous 30 jours, compétence exclusive et expresse est attribuée au <strong>Tribunal de Commerce de Casablanca</strong>, nonobstant pluralité de défendeurs ou appel en garantie.
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
