import { Link } from "react-router"
import SEO from "@/components/SEO"

export default function RefundPolicy() {
  return (
    <div className="bg-paper text-ink">
      <SEO
        title="Politique de Retour, Remboursement & Garantie | ORSAP Maroc"
        description="Consultez la politique de retour, d'échange, de remboursement et de garantie commerciale d'ORSAP Maroc. Procédure claire de SAV pour entreprises et professionnels au Maroc."
        keywords={[
          "politique de retour orsap",
          "garantie materiel btp maroc",
          "sav outillage casablanca",
          "reclamation livraison orsap",
          "remboursement fournitures industrielles"
        ]}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Politique de retour et garantie", url: "/politique-de-retour" }
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
            <span className="text-ink font-medium">Retours, Remboursements & Garantie</span>
          </nav>
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orsap-red">
              <span className="h-px w-6 bg-orsap-red" />
              Service Après-Vente & Conformité
            </div>
            <h1 className="font-display text-[clamp(2rem,3.5vw,3.2rem)] font-black leading-tight tracking-tight text-ink">
              Politique de Retours, Échanges & Garantie
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Chez ORSAP, la satisfaction et la sécurité de nos clients professionnels sont au cœur de nos engagements. Cette politique détaille les conditions d&apos;exercice du droit de retour, les modalités d&apos;échange et les garanties applicables conformément à la législation marocaine (Loi 31-08 et Code des Obligations et des Contrats - DOC).
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

          {/* Section 1 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">1</span>
              Contrôle à Réception & Signalement de Non-Conformité
            </h2>
            <p className="text-ink-soft">
              À la livraison des marchandises par nos équipes logistiques ou par transporteur agréé :
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-ink-soft">
              <li>Le client est tenu de vérifier l&apos;état apparent des colis et la conformité du matériel par rapport au Bon de Livraison (BL).</li>
              <li>En cas d&apos;avarie, de détérioration visible ou d&apos;article manquant, des réserves précises et écrites doivent être obligatoirement portées sur le récépissé de livraison.</li>
              <li>Toute réclamation doit être notifiée par écrit au service client ORSAP sous un délai de <strong>48 heures ouvrées</strong> par email à <a href="mailto:orsap@orsap.ma" className="text-orsap-red font-semibold hover:underline">orsap@orsap.ma</a> avec photos justificatives.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">2</span>
              Conditions d&apos;Acceptation des Retours
            </h2>
            <p className="text-ink-soft">Pour qu&apos;un retour de produit soit validé par notre service logistique :</p>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-ink-soft">
              <li>L&apos;article doit être <strong>strictement neuf, complet, non utilisé, non monté</strong>, et restitué dans son emballage d&apos;origine intact avec ses notices et accessoires.</li>
              <li>Le retour doit faire l&apos;objet d&apos;un accord préalable et d&apos;un numéro de bon de retour (RMA) transmis par notre service client.</li>
            </ul>
            <div className="mt-4 rounded-lg bg-amber-500/10 p-4 text-xs text-amber-950 border border-amber-500/20">
              <strong>Exceptions aux retours :</strong> Conformément aux usages professionnels et à la réglementation, les produits personnalisés ou confectionnés sur mesure (notamment les vêtements de travail marqués/brodés/sérigraphiés ou équipements découpés à des dimensions spécifiques) ainsi que les produits d&apos;hygiène ou de protection respiratoire descellés ne peuvent faire l&apos;objet d&apos;aucun retour ni échange, sauf défaut de fabrication avéré.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">3</span>
              Modalités d&apos;Échange, d&apos;Avoir ou de Remboursement
            </h2>
            <p className="text-ink-soft">
              Après réception et validation de l&apos;état du matériel par notre atelier de contrôle qualité à Casablanca :
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-ink-soft">
              <li><strong>Échange standard :</strong> Réexpédition d&apos;un article conforme de remplacement dans les plus brefs délais selon stocks.</li>
              <li><strong>Avoir commercial :</strong> Émission d&apos;une note d&apos;avoir imputable sur vos prochaines commandes de fournitures industrielles.</li>
              <li><strong>Remboursement :</strong> En cas d&apos;annulation justifiée, le remboursement s&apos;effectue par virement bancaire ou recréditation selon le mode de paiement initial sous 7 à 14 jours ouvrés.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">4</span>
              Garanties Fabricants & Vices Cachés
            </h2>
            <p className="text-ink-soft">
              Tous nos équipements bénéficient :
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-ink-soft">
              <li>De la <strong>garantie constructeur officielle</strong> des marques distribuées (Bosch, Makita, Sika, Schneider, etc.) couvrant les pièces et la main-d&apos;œuvre en atelier agréé contre les défauts de fabrication.</li>
              <li>De la <strong>garantie légale contre les vices cachés</strong> conformément aux articles 549 et suivants du Dahir formant Code des Obligations et des Contrats (DOC) au Maroc.</li>
            </ul>
            <p className="mt-3 text-xs text-steel">
              Sont exclus de toute garantie les dommages résultant d&apos;une mauvaise utilisation, d&apos;une surcharge non conforme à la notice technique, d&apos;un défaut d&apos;entretien ou de l&apos;usure normale des consommables.
            </p>
          </div>

          {/* Contact Support */}
          <div className="rounded-xl bg-ink p-7 text-paper shadow-md">
            <h3 className="font-display text-lg font-bold text-white mb-2">Besoin d&apos;assistance sur une commande ou un retour ?</h3>
            <p className="text-sm text-white/70 mb-4">Notre équipe commerciale et technique est à votre écoute du lundi au samedi.</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="tel:+212644203030" className="inline-flex items-center gap-2 rounded-lg bg-orsap-red px-4 py-2 font-bold text-white hover:bg-orsap-red-deep transition focus-visible:ring-2 focus-visible:ring-white">
                +212 6 44 20 30 30
              </a>
              <a href="mailto:orsap@orsap.ma" className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20 transition focus-visible:ring-2 focus-visible:ring-white">
                orsap@orsap.ma
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
