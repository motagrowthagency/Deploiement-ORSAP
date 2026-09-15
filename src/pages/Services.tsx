import { Link } from "react-router"
import { SERVICES, PROCESS } from "@/data/services"
import SEO from "@/components/SEO"

const STATS = [
  { value: "15 000+", label: "produits" },
  { value: "300+", label: "marques" },
  { value: "100+", label: "grands comptes" },
  { value: "48h", label: "livraison max" },
]

export default function Services() {
  return (
    <div>
      <SEO
        title="Services & Ingénierie Industrielle au Maroc | ORSAP"
        description="Études et réalisations d'équipements industriels, maintenance & SAV, revêtements de sols, plomberie industrielle, climatisation et aménagement d'ateliers."
        keywords={[
          "services industriels Maroc",
          "maintenance industrielle Casablanca",
          "installation réseaux fluides",
          "revêtements résine industrielle",
          "climatisation professionnelle Maroc"
        ]}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Services", url: "/services" }
        ]}
      />

      {/* Intro */}
      <section className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        <nav className="mb-8 flex items-center gap-2 text-[12.5px] text-ink-soft">
          <Link to="/" className="hover:text-orsap-red">
            Accueil
          </Link>
          <span className="text-hairline">/</span>
          <span className="text-ink">Services</span>
        </nav>

        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-orsap-red">
            <span className="h-px w-8 bg-orsap-red" />
            Nos services
          </div>
          <h1 className="font-display text-[clamp(2.2rem,4.2vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em]">
            De l&apos;étude à la réalisation, un partenaire technique complet.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.6] text-ink-soft">
            ORSAP ne se limite pas à la vente de produits. Nous concevons,
            installons et maintenons des solutions techniques pour
            l&apos;industrie, le bâtiment et les particuliers, avec un
            engagement fort sur la qualité, la sécurité et les délais.
          </p>
        </div>

        {/* Service cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className="group flex flex-col overflow-hidden border border-hairline bg-card transition-colors hover:border-orsap-red"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-steel">
                <img
                  src={s.img}
                  alt={s.title}
                  loading={i < 3 ? "eager" : "lazy"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute left-0 top-0 bg-orsap-red px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-[18px] font-bold leading-tight tracking-[-0.01em] group-hover:text-orsap-red">
                  {s.title}
                </h2>
                <p className="mt-2.5 flex-1 text-[14px] leading-[1.55] text-ink-soft">
                  {s.short}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-ink transition-colors group-hover:text-orsap-red">
                  Découvrir le service
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Key figures */}
      <section className="border-y border-hairline bg-card">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 px-6 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`py-8 lg:py-10 ${
                i !== 0 ? "lg:border-l lg:border-hairline lg:pl-10" : ""
              }`}
            >
              <div className="font-display text-[clamp(2rem,3.2vw,2.8rem)] font-black leading-none tracking-[-0.03em]">
                {s.value}
              </div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-[1240px] px-6 py-20 lg:py-28">
        <div className="mb-12 max-w-2xl">
          <div className="mb-6 flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-orsap-red">
            <span className="h-px w-8 bg-orsap-red" />
            Notre méthode
          </div>
          <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-black leading-[1.05] tracking-[-0.02em]">
            Un process éprouvé, de l&apos;audit au SAV.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS.map((p) => (
            <div key={p.step} className="bg-card p-6">
              <div className="font-display text-[26px] font-black leading-none text-orsap-red">
                {p.step}
              </div>
              <h3 className="mt-4 font-display text-[16px] font-bold tracking-[-0.01em]">
                {p.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-ink-soft">
                {p.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[1240px] px-6 pb-20 lg:pb-28">
        <div className="flex flex-col items-start justify-between gap-6 bg-ink p-10 text-paper sm:flex-row sm:items-center lg:p-14">
          <h2 className="max-w-xl font-display text-[clamp(1.6rem,2.8vw,2.4rem)] font-black leading-[1.05] tracking-[-0.02em] text-white">
            Vous avez un projet ? Nos experts vous accompagnent de l&apos;étude
            à la réalisation.
          </h2>
          <Link
            to="/devis"
            className="shrink-0 bg-orsap-red px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep"
          >
            Demander un devis
          </Link>
        </div>
      </section>
    </div>
  )
}
