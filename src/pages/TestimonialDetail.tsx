import { Link, useParams } from "react-router"
import { SUCCESSES } from "@/data/successes"
import SEO from "@/components/SEO"

export default function TestimonialDetail() {
  const { client = "" } = useParams()
  const data = SUCCESSES.find((s) => s.slug === client)
  const index = SUCCESSES.findIndex((s) => s.slug === client)

  if (!data) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 py-24 lg:py-32">
        <SEO title="Témoignage introuvable | ORSAP Maroc" noIndex={true} />
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.025em]">
          Témoignage introuvable
        </h1>
        <Link
          to="/temoignages"
          className="mt-6 inline-flex items-center justify-center border border-ink px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Retour aux témoignages
        </Link>
      </div>
    )
  }

  const next = SUCCESSES[(index + 1) % SUCCESSES.length]

  return (
    <div>
      <SEO
        title={`Étude de Cas : ${data.client} (${data.sector}) | ORSAP Maroc`}
        description={data.summary || data.quote}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Témoignages", url: "/temoignages" },
          { name: data.client, url: `/temoignages/${data.slug}` }
        ]}
      />

      {/* Header */}
      <section className="border-b border-hairline bg-ink text-paper">
        <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-20">
          <nav className="mb-10 flex flex-wrap items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="hover:text-white">
              Accueil
            </Link>
            <span className="text-white/30">/</span>
            <Link to="/temoignages" className="hover:text-white">
              Témoignages
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white">{data.client}</span>
          </nav>

          <div className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-safety">
            {data.sector}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <div className="flex h-24 items-center justify-center bg-white px-7 py-5">
              <img
                src={data.logo}
                alt={data.client}
                className="max-h-14 w-auto max-w-[220px] object-contain"
              />
            </div>
            {data.slug !== "ventec" && (
              <span className="font-display text-[clamp(1.6rem,3.5vw,2.6rem)] font-black uppercase leading-none tracking-[-0.02em] text-white">
                {data.client}
              </span>
            )}
          </div>
          <h1 className="mt-6 max-w-2xl font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold leading-[1.1] tracking-[-0.02em] text-white/90">
            {data.title}
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        {/* Pull quote */}
        <blockquote className="max-w-3xl border-l-2 border-orsap-red pl-6 font-display text-[clamp(1.3rem,2.4vw,1.9rem)] font-bold leading-[1.25] tracking-[-0.015em] text-ink">
          {data.card}
        </blockquote>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="font-display text-[15px] font-bold uppercase tracking-[0.06em] text-orsap-red">
              Le besoin
            </h2>
            <p className="mt-5 text-[15px] leading-[1.6] text-ink-soft">
              {data.need}
            </p>
          </div>

          <div className="lg:col-span-8">
            <h2 className="font-display text-[15px] font-bold uppercase tracking-[0.06em] text-orsap-red">
              La solution ORSAP
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.solution.map((it) => (
                <li
                  key={it}
                  className="flex gap-3 text-[15px] leading-[1.5] text-ink-soft"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-orsap-red" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Results */}
        <div className="mt-16 border-t border-hairline pt-14">
          <h2 className="mb-8 font-display text-[15px] font-bold uppercase tracking-[0.06em] text-orsap-red">
            Résultats
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {data.results.map((r, i) => (
              <div key={r} className="border border-hairline bg-card p-6">
                <div className="font-display text-[22px] font-black leading-none text-orsap-red">
                  0{i + 1}
                </div>
                <p className="mt-4 text-[14.5px] leading-[1.5] text-ink">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next + CTA */}
      <section className="border-t border-hairline bg-card">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-6 px-6 py-12 sm:flex-row sm:items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Témoignage suivant
            </div>
            <Link
              to={`/temoignages/${next.slug}`}
              className="mt-2 block max-w-md font-display text-[20px] font-bold leading-tight tracking-[-0.01em] transition-colors hover:text-orsap-red"
            >
              {next.client} — {next.title} →
            </Link>
          </div>
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
