import { Link, useParams } from "react-router"
import { SERVICES } from "@/data/services"
import SEO from "@/components/SEO"

function List({
  title,
  items,
  accent,
}: {
  title: string
  items: string[]
  accent?: boolean
}) {
  return (
    <div>
      <h2 className="font-display text-[15px] font-bold uppercase tracking-[0.06em] text-orsap-red">
        {title}
      </h2>
      <ul className="mt-5 space-y-3">
        {items.map((it) => (
          <li
            key={it}
            className="flex gap-3 text-[15px] leading-[1.55] text-ink-soft"
          >
            <span
              className={`mt-2 h-1.5 w-1.5 shrink-0 ${
                accent ? "bg-safety" : "bg-orsap-red"
              }`}
            />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ServiceDetail() {
  const { service = "" } = useParams()
  const data = SERVICES.find((s) => s.slug === service)
  const index = SERVICES.findIndex((s) => s.slug === service)

  if (!data) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 py-24 lg:py-32">
        <SEO title="Service introuvable | ORSAP Maroc" noIndex={true} />
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.025em]">
          Service introuvable
        </h1>
        <Link
          to="/services"
          className="mt-6 inline-flex items-center justify-center border border-ink px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Retour aux services
        </Link>
      </div>
    )
  }

  const next = SERVICES[(index + 1) % SERVICES.length]

  return (
    <div>
      <SEO
        title={`${data.title} | Services ORSAP Maroc`}
        description={data.short}
        image={data.img}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Services", url: "/services" },
          { name: data.title, url: `/services/${data.slug}` }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": data.title,
          "description": data.short,
          "provider": {
            "@type": "Organization",
            "name": "ORSAP"
          },
          "areaServed": "MA"
        }}
      />

      {/* Header with image */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <img
          src={data.img}
          alt={data.title}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <div className="relative mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="hover:text-white">
              Accueil
            </Link>
            <span className="text-white/30">/</span>
            <Link to="/services" className="hover:text-white">
              Services
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white">{data.title}</span>
          </nav>
          <div className="flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-safety">
            <span className="h-px w-8 bg-safety" />
            Service {String(index + 1).padStart(2, "0")}
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em] text-white">
            {data.title}
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-white/80">
            {data.short}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/devis"
              className="inline-flex items-center justify-center bg-orsap-red px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep"
            >
              {data.ctas[0]}
            </Link>
            <Link
              to="/devis"
              className="inline-flex items-center justify-center border border-white/70 px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-white hover:text-ink"
            >
              {data.ctas[1]}
            </Link>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <List title="Ce que nous faisons" items={data.what} />
          </div>
          <div className="space-y-12 lg:col-span-5">
            <List title="Pour qui" items={data.who} accent />
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16 border-t border-hairline pt-14">
          <h2 className="mb-8 font-display text-[15px] font-bold uppercase tracking-[0.06em] text-orsap-red">
            Bénéfices clés
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {data.benefits.map((b, i) => (
              <div key={b} className="border border-hairline bg-card p-7">
                <div className="font-display text-[22px] font-black leading-none text-orsap-red">
                  0{i + 1}
                </div>
                <p className="mt-4 text-[15px] leading-[1.55] text-ink">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next service + CTA */}
      <section className="border-t border-hairline bg-card">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-6 px-6 py-12 sm:flex-row sm:items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Service suivant
            </div>
            <Link
              to={`/services/${next.slug}`}
              className="mt-2 block max-w-md font-display text-[20px] font-bold leading-tight tracking-[-0.01em] transition-colors hover:text-orsap-red"
            >
              {next.title} →
            </Link>
          </div>
          <Link
            to="/services"
            className="shrink-0 border border-ink px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Tous les services
          </Link>
        </div>
      </section>
    </div>
  )
}
