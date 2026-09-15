import { Link } from "react-router"
import { SUCCESSES } from "@/data/successes"
import SEO from "@/components/SEO"

const STATS = [
  { value: "8", label: "secteurs accompagnés" },
  { value: "15 000+", label: "références mobilisées" },
  { value: "1", label: "interlocuteur unique" },
  { value: "48h", label: "livraison max" },
]

export default function Testimonials() {
  return (
    <div>
      <SEO
        title="Témoignages & Références Clients | ORSAP Maroc"
        description="Découvrez comment ORSAP accompagne les leaders de l'industrie, du BTP et de la logistique au Maroc dans leurs projets d'approvisionnement et de sécurité."
        keywords={[
          "clients ORSAP Maroc",
          "références industrielles Casablanca",
          "études de cas B2B Maroc",
          "témoignages sécurité industrielle"
        ]}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Témoignages", url: "/temoignages" }
        ]}
      />

      {/* Intro */}
      <section className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        <nav className="mb-8 flex items-center gap-2 text-[12.5px] text-ink-soft">
          <Link to="/" className="hover:text-orsap-red">
            Accueil
          </Link>
          <span className="text-hairline">/</span>
          <span className="text-ink">Témoignages</span>
        </nav>

        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-orsap-red">
            <span className="h-px w-8 bg-orsap-red" />
            Témoignages clients
          </div>
          <h1 className="font-display text-[clamp(2.2rem,4.2vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em]">
            Ils nous font confiance.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.6] text-ink-soft">
            ORSAP accompagne des entreprises de secteurs variés — industrie,
            construction, logistique, distribution et services techniques. Grâce
            à une offre complète en équipements, outillage, EPI, consommables et
            solutions de maintenance, nous aidons nos clients à améliorer la
            sécurité, la disponibilité de leur matériel et l&apos;efficacité de
            leurs opérations.
          </p>
        </div>

        {/* Logo wall */}
        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-3 lg:grid-cols-4">
          {SUCCESSES.map((s) => (
            <Link
              key={s.slug}
              to={`/temoignages/${s.slug}`}
              className="group flex min-h-[130px] items-center justify-center bg-white px-8 py-9 transition-colors hover:bg-paper"
            >
              <img
                src={s.logo}
                alt={s.client}
                loading="lazy"
                className="max-h-14 w-auto max-w-full object-contain opacity-80 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Story cards */}
      <section className="border-t border-hairline bg-card">
        <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SUCCESSES.map((s) => (
              <Link
                key={s.slug}
                to={`/temoignages/${s.slug}`}
                className="group flex flex-col border border-hairline bg-paper p-7 transition-colors hover:border-orsap-red"
              >
                <div className="flex h-12 items-center">
                  <img
                    src={s.logo}
                    alt={s.client}
                    loading="lazy"
                    className="max-h-11 w-auto max-w-[65%] object-contain"
                  />
                </div>
                <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-steel">
                  {s.sector}
                </div>
                <h2 className="mt-4 font-display text-[16px] font-bold leading-tight tracking-[-0.01em] text-ink">
                  {s.title}
                </h2>
                <p className="mt-3 flex-1 text-[14px] leading-[1.55] text-ink-soft">
                  {s.card}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-ink transition-colors group-hover:text-orsap-red">
                  Lire l&apos;histoire
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Key figures */}
      <section className="border-y border-hairline bg-paper">
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

      {/* Final CTA */}
      <section className="mx-auto max-w-[1240px] px-6 py-20 lg:py-28">
        <div className="flex flex-col items-start justify-between gap-6 bg-ink p-10 text-paper sm:flex-row sm:items-center lg:p-14">
          <h2 className="max-w-xl font-display text-[clamp(1.6rem,2.8vw,2.4rem)] font-black leading-[1.05] tracking-[-0.02em] text-white">
            Envie de rejoindre nos clients ? Parlons de vos besoins
            d&apos;équipement.
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
