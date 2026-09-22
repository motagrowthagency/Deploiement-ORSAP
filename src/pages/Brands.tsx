import { useMemo, useState } from "react"
import { Link } from "react-router"
import { BRANDS, CATEGORIES, type Category } from "@/data/brands"
import SEO from "@/components/SEO"

import logoBosch from "@/imports/logo_bosch.jpg"
import logoDewalt from "@/imports/logo_dewalt.png"
import logoFacom from "@/imports/logo_facom.jpg"
import logoDeltaplus from "@/imports/logo_deltaplus.jpg"
import logoAbb from "@/imports/logo_abb.png"
import logoStihl from "@/imports/logo_stihl.jpg"
import logoSchneider from "@/imports/logo_schneider.jpg"
import logoSika from "@/imports/logo_sika.png"
import logoStanley from "@/imports/logo_stanley.png"
import logoValex from "@/imports/logo_valex.png"
import logoMapei from "@/imports/logo_mapei.jpg"
import logoPhilips from "@/imports/logo_philips.jpg"
import logoFenwick from "@/imports/logo_fenwick.jpg"
import logoGrohe from "@/imports/logo_grohe.png"
import logoHilti from "@/imports/logo_hilti.jpg"
import logoHoneywell from "@/imports/logo_honeywell.png"
import logoJungheinrich from "@/imports/logo_jungheinrich.jpg"
import logoMakita from "@/imports/logo_makita.jpg"
import logoVito from "@/imports/logo_vito.jpg"
import logoWilo from "@/imports/logo_wilo.jpg"

// LOGO_IMAGES maps a brand's URL-friendly "slug" to its imported logo image asset.
// If a brand is added to this dictionary, the website will display its official logo.
const LOGO_IMAGES: Record<string, string> = {
  bosch: logoBosch,
  dewalt: logoDewalt,
  facom: logoFacom,
  "delta-plus": logoDeltaplus,
  abb: logoAbb,
  stihl: logoStihl,
  "schneider-electric": logoSchneider,
  sika: logoSika,
  stanley: logoStanley,
  valex: logoValex,
  mapei: logoMapei,
  philips: logoPhilips,
  fenwick: logoFenwick,
  grohe: logoGrohe,
  hilti: logoHilti,
  honeywell: logoHoneywell,
  jungheinrich: logoJungheinrich,
  makita: logoMakita,
  vito: logoVito,
  wilo: logoWilo,
}

// BrandLogo renders the official logo image if available in LOGO_IMAGES.
// Otherwise, it falls back to a clean, styled CSS-only logo badge using the brand's primary colors.
function BrandLogo({ slug, name }: { slug: string; name: string }) {
  if (LOGO_IMAGES[slug]) {
    return (
      <div className="inline-flex items-center justify-center select-none bg-white p-1 rounded-sm border border-hairline">
        <img
          src={LOGO_IMAGES[slug]}
          alt={name}
          className="h-10 w-auto object-contain max-w-[130px]"
        />
      </div>
    )
  }

  const colors: Record<string, {
    bg: string
    text: string
    border?: string
    font?: string
    label?: string
  }> = {
    bosch: {
      bg: "#e20015",
      text: "#ffffff",
      font: "font-sans font-black italic tracking-wide text-[13px]",
    },
    dewalt: {
      bg: "#febd11",
      text: "#000000",
      font: "font-sans font-black tracking-tighter italic text-[14px]",
    },
    stanley: {
      bg: "#000000",
      text: "#febd11",
      font: "font-sans font-black tracking-wide text-[12px]",
    },
    facom: {
      bg: "#ffffff",
      text: "#d3121a",
      border: "border border-[#d3121a] px-3",
      font: "font-serif font-black italic text-[14px]",
    },
    makita: {
      bg: "#008a97",
      text: "#ffffff",
      font: "font-sans font-extrabold italic tracking-tight text-[13px]",
    },
    vito: {
      bg: "#ff5000",
      text: "#ffffff",
      font: "font-sans font-black tracking-widest text-[11px]",
    },
    valex: {
      bg: "#ffffff",
      text: "#005ea6",
      border: "border border-[#005ea6] px-2",
      font: "font-sans font-extrabold text-[12px]",
    },
    "3m": {
      bg: "#ff0000",
      text: "#ffffff",
      font: "font-sans font-black tracking-tighter text-[15px]",
    },
    honeywell: {
      bg: "#ff0000",
      text: "#ffffff",
      font: "font-sans font-black tracking-widest italic text-[10px]",
    },
    "delta-plus": {
      bg: "#1e3a8a",
      text: "#ffffff",
      font: "font-sans font-bold text-[11px]",
      label: "DELTA PLUS",
    },
    "schneider-electric": {
      bg: "#3dcd58",
      text: "#ffffff",
      font: "font-sans font-bold text-[10px]",
      label: "SCHNEIDER",
    },
    legrand: {
      bg: "#e20015",
      text: "#ffffff",
      font: "font-sans font-extrabold italic text-[12px]",
    },
    abb: {
      bg: "#ffffff",
      text: "#ff0000",
      border: "border border-red-500 px-3",
      font: "font-sans font-black text-[13px]",
    },
    grohe: {
      bg: "#002f6c",
      text: "#ffffff",
      font: "font-sans font-bold italic text-[12px]",
    },
    wilo: {
      bg: "#009639",
      text: "#ffffff",
      font: "font-sans font-black tracking-wider text-[12px]",
    },
    sika: {
      bg: "#ffcd00",
      text: "#000000",
      font: "font-sans font-black text-[14px]",
    },
    mapei: {
      bg: "#0055a5",
      text: "#ffffff",
      font: "font-sans font-black tracking-wide text-[12px]",
    },
    jungheinrich: {
      bg: "#ffc600",
      text: "#000000",
      font: "font-sans font-black italic text-[11px]",
    },
    fenwick: {
      bg: "#ffffff",
      text: "#ff0000",
      border: "border border-red-500 px-2",
      font: "font-sans font-bold italic text-[12px]",
    },
    philips: {
      bg: "#002d62",
      text: "#ffffff",
      font: "font-sans font-black tracking-wide text-[11px]",
    },
    stihl: {
      bg: "#ff7300",
      text: "#ffffff",
      font: "font-sans font-black tracking-wide text-[12px]",
    },
    hilti: {
      bg: "#d3121a",
      text: "#ffffff",
      font: "font-sans font-black tracking-widest text-[11px]",
    },
  }

  const style = colors[slug] || {
    bg: "#14171a",
    text: "#ffffff",
    font: "font-sans font-bold text-[12px]",
  }

  return (
    <div
      className={`inline-flex items-center justify-center min-w-[75px] text-center py-2 px-3.5 select-none ${style.font || ""} ${style.border || ""}`}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label || name}
    </div>
  )
}

export default function Brands() {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState<Category | "all">("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return BRANDS.filter((b) => {
      const matchQuery = !q || b.name.toLowerCase().includes(q)
      const matchCat = active === "all" || b.categories.includes(active)
      return matchQuery && matchCat
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [query, active])

  return (
    <div>
      <SEO
        title="300+ Marques Internationales d'Outillage & EPI | ORSAP Maroc"
        description="Distributeur officiel et partenaire des plus grandes marques mondiales : Bosch, DeWalt, Facom, Delta Plus, 3M, Honeywell, Schneider Electric, Makita au Maroc."
        keywords={[
          "marques outillage Maroc",
          "distributeur Bosch Maroc",
          "catalogue Facom Casablanca",
          "EPI Delta Plus Maroc",
          "matériel 3M Maroc",
          "Schneider Electric Maroc"
        ]}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Marques", url: "/marques" }
        ]}
      />

      {/* Intro */}
      <section className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        <nav className="mb-8 flex items-center gap-2 text-[12.5px] text-ink-soft">
          <Link to="/" className="hover:text-orsap-red">
            Accueil
          </Link>
          <span className="text-hairline">/</span>
          <span className="text-ink">Marques</span>
        </nav>

        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-orsap-red">
            <span className="h-px w-8 bg-orsap-red" />
            Nos marques
          </div>
          <h1 className="font-display text-[clamp(2.2rem,4.2vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em]">
            Plus de 300 marques internationales sélectionnées.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.6] text-ink-soft">
            ORSAP travaille avec plus de 300 marques reconnues pour leur
            qualité, leur fiabilité et leur innovation. Nous sélectionnons des
            fabricants leaders dans chaque catégorie — EPI, outillage,
            électricité, plomberie, revêtements — pour vous garantir des
            produits conformes aux normes et adaptés à vos besoins.
          </p>
        </div>

        {/* Search + filters */}
        <div className="mt-12 border-t border-hairline pt-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <label className="block w-full max-w-sm">
              <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                Rechercher une marque
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex : Bosch, Facom…"
                className="w-full border border-hairline bg-card px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-steel focus:border-orsap-red"
              />
            </label>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              {filtered.length} marque{filtered.length > 1 ? "s" : ""}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {(["all", ...CATEGORIES] as const).map((cat) => {
              const isActive = active === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  className={`border px-4 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.03em] transition-colors ${
                    isActive
                      ? "border-orsap-red bg-orsap-red text-white"
                      : "border-hairline bg-card text-ink-soft hover:border-orsap-red hover:text-orsap-red"
                  }`}
                >
                  {cat === "all" ? "Toutes" : cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Brand grid */}
        {filtered.length === 0 ? (
          <p className="mt-16 text-[15px] text-ink-soft">
            Aucune marque ne correspond à votre recherche.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <Link
                key={b.slug}
                to={`/marques/${b.slug}`}
                className="group flex flex-col border border-hairline bg-card p-7 transition-colors hover:border-orsap-red"
              >
                <div className="flex h-14 items-center">
                  <BrandLogo slug={b.slug} name={b.name} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-steel">
                    {b.origin}
                  </div>
                  {b.certified && (
                    <span className="shrink-0 border border-orsap-red px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-orsap-red">
                      Agréé
                    </span>
                  )}
                </div>
                <h2 className="mt-3 font-display text-[17px] font-bold leading-tight tracking-[-0.01em] text-ink group-hover:text-orsap-red">
                  {b.name}
                </h2>
                <p className="mt-3 flex-1 text-[13.5px] leading-[1.55] text-ink-soft line-clamp-2">
                  {b.positioning}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {b.categories.map((c) => (
                    <span
                      key={c}
                      className="bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-steel"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-ink transition-colors group-hover:text-orsap-red">
                  Voir les produits
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1240px] px-6 pb-20 lg:pb-28">
        <div className="flex flex-col items-start justify-between gap-6 bg-ink p-10 text-paper sm:flex-row sm:items-center lg:p-14">
          <h2 className="max-w-xl font-display text-[clamp(1.6rem,2.8vw,2.4rem)] font-black leading-[1.05] tracking-[-0.02em] text-white">
            Vous cherchez une marque précise ? Nous la référençons probablement.
          </h2>
          <Link
            to="/devis"
            className="shrink-0 bg-orsap-red px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep"
          >
            Nous consulter
          </Link>
        </div>
      </section>
    </div>
  )
}
