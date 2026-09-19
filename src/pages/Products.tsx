import SEO from "@/components/SEO"
import CatalogueDevisBuilder from "@/components/CatalogueDevisBuilder"

export default function Products() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-12 lg:py-16">
      <SEO
        title="Catalogue Produits & Devis en Ligne (49 000+ Références) | ORSAP Maroc"
        description="Consultez plus de 49 000 références industrielles, EPI, outillage, quincaillerie, électricité, plomberie avec prix et devis instantané."
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Catalogue & E-Commerce", url: "/catalogue" },
        ]}
      />

      {/* Hero Header */}
      <div className="max-w-[840px]">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orsap-red">
          <span className="h-px w-8 bg-orsap-red" />
          Boutique &amp; Catalogue E-Commerce B2B
        </div>
        <h1 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-black leading-[1.05] tracking-[-0.025em] text-ink">
          Catalogue Produits Officiel ORSAP
        </h1>
        <p className="mt-4 text-[16px] leading-[1.6] text-ink-soft">
          Explorez plus de 49 000 références industrielles certifiées avec prix actualisés et disponibilité en direct.
          Ajoutez vos articles au devis en 1 clic pour une expédition rapide sous 24/48h au Maroc.
        </p>
      </div>

      {/* Interactive Catalog & Devis Builder with 7,665 products and images */}
      <div className="mt-8">
        <CatalogueDevisBuilder />
      </div>
    </div>
  )
}
