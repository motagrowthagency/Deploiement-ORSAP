import { Link, useParams } from "react-router"
import { BRANDS, CATEGORY_COPY } from "@/data/brands"

export default function BrandDetail() {
  const { brand = "" } = useParams()
  const data = BRANDS.find((b) => b.slug === brand)

  if (!data) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 py-24 lg:py-32">
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.025em]">
          Marque introuvable
        </h1>
        <Link
          to="/marques"
          className="mt-6 inline-flex items-center justify-center border border-ink px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Retour aux marques
        </Link>
      </div>
    )
  }

  const primary = data.categories[0]
  const copy = CATEGORY_COPY[primary]

  return (
    <div>
      {/* Header */}
      <section className="border-b border-hairline bg-ink text-paper">
        <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-20">
          <nav className="mb-10 flex flex-wrap items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="hover:text-white">
              Accueil
            </Link>
            <span className="text-white/30">/</span>
            <Link to="/marques" className="hover:text-white">
              Marques
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white">{data.name}</span>
          </nav>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-display text-[clamp(2.6rem,7vw,5rem)] font-black uppercase leading-none tracking-[-0.03em] text-white">
                  {data.name}
                </span>
                {data.certified && (
                  <span className="mb-2 self-end border border-safety px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-safety">
                    Distributeur agréé
                  </span>
                )}
              </div>
              <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-white/80">
                {data.positioning}
              </p>
              <p className="mt-3 font-mono text-[11.5px] uppercase tracking-[0.14em] text-white/45">
                Origine : {data.origin} · {data.categories.join(" · ")}
              </p>
            </div>
            <Link
              to="/devis"
              className="shrink-0 self-start bg-orsap-red px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep lg:self-end"
            >
              Demander un devis {data.name}
            </Link>
          </div>
        </div>
      </section>

      {/* Presentation */}
      <section className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="font-display text-[15px] font-bold uppercase tracking-[0.06em] text-orsap-red">
              La marque
            </h2>
            <p className="mt-5 text-[17px] leading-[1.65] text-ink">
              {data.name} est reconnue pour{" "}
              {data.positioning.charAt(0).toLowerCase() +
                data.positioning.slice(1)}{" "}
              {copy.blurb} ORSAP en distribue une large gamme et accompagne ses
              clients dans le choix, l&apos;approvisionnement et le suivi des
              produits.
            </p>

            {/* Strengths */}
            <div className="mt-10">
              <h3 className="font-display text-[15px] font-bold uppercase tracking-[0.06em] text-orsap-red">
                Points forts
              </h3>
              <ul className="mt-5 space-y-3">
                {copy.strengths.map((s) => (
                  <li
                    key={s}
                    className="flex gap-3 text-[15px] leading-[1.55] text-ink-soft"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-orsap-red" />
                    <span>{s}</span>
                  </li>
                ))}
                {data.certified && (
                  <li className="flex gap-3 text-[15px] leading-[1.55] text-ink-soft">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-safety" />
                    <span>
                      Partenaire de long terme d&apos;ORSAP, distributeur agréé.
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Gammes */}
          <div className="lg:col-span-5">
            <h3 className="font-display text-[15px] font-bold uppercase tracking-[0.06em] text-orsap-red">
              Gammes disponibles chez ORSAP
            </h3>
            <div className="mt-5 space-y-px overflow-hidden border border-hairline bg-hairline">
              {copy.gammes.map((g) => (
                <div key={g.title} className="bg-card p-5">
                  <div className="font-display text-[16px] font-bold tracking-[-0.01em] text-ink">
                    {g.title}
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-soft">
                    {g.note}
                  </p>
                </div>
              ))}
            </div>
            <Link
              to="/solutions"
              className="mt-5 inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:text-orsap-red"
            >
              Voir toutes les solutions
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-hairline bg-card">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-6 px-6 py-12 sm:flex-row sm:items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Un projet avec des produits {data.name} ?
            </div>
            <p className="mt-2 max-w-md font-display text-[20px] font-bold leading-tight tracking-[-0.01em]">
              Parlez à un expert ORSAP.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/devis"
              className="border border-ink px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Nous contacter
            </Link>
            <Link
              to="/marques"
              className="border border-hairline px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-ink-soft transition-colors hover:border-orsap-red hover:text-orsap-red"
            >
              Toutes les marques
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
