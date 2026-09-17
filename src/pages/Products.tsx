import { Link } from "react-router"
import manutentionPhoto from "@/imports/manutention_gerbeur.jpg"
import revetementPhoto from "@/imports/revetement_bois.jpg"
import outillagePhoto from "@/imports/outillage_bosch.jpg"

// Category imagery sourced from Unsplash, pre-cropped to a 4:3 card ratio.
const U = (id: string) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1080&h=810`

const EPI = U("photo-1735494032948-14ef288fc9d3")
const OUTILLAGE = outillagePhoto
const ROULEMENTS = U("photo-1524514587686-e2909d726e9b")
const JARDINAGE = U("photo-1537877853655-34bdcda5e833")
const CONSOMMABLES = U("photo-1644079446600-219068676743")
const LUMINAIRES = U("photo-1762120514622-d57c902f2fe6")
const ECHAFAUDAGE = U("photo-1649320316177-775fe2d67ca3")
const MANUTENTION = manutentionPhoto
const CLIMATISATION = U("photo-1667983453881-4992fe86ab1b")
const ELECTRICITE = U("photo-1780034766462-e8af5f2c9e22")
const QUINCAILLERIE = U("photo-1763888450676-f0f7a3987917")
const REVETEMENTS = revetementPhoto

type Category = {
  slug: string
  title: string
  desc: string
  img: string
}

const CATEGORIES: Category[] = [
  {
    slug: "epi",
    title: "EPI",
    desc: "Équipements de protection individuelle : casques, gants, chaussures, harnais et protection respiratoire.",
    img: EPI,
  },
  {
    slug: "outillage",
    title: "Outillage à main & électroportatif",
    desc: "Perceuses, meuleuses, visseuses, clés, jeux de douilles et outillage professionnel.",
    img: OUTILLAGE,
  },
  {
    slug: "roulements-transmission",
    title: "Roulements & transmission",
    desc: "Roulements, paliers, courroies, poulies et composants de transmission mécanique.",
    img: ROULEMENTS,
  },
  {
    slug: "echafaudages-nacelles",
    title: "Échafaudages & nacelles",
    desc: "Solutions d'accès en hauteur : échafaudages fixes, roulants, nacelles et accessoires.",
    img: ECHAFAUDAGE,
  },
  {
    slug: "manutention",
    title: "Manutention",
    desc: "Gerbeurs, transpalettes, diables et équipements de levage pour l'atelier et l'entrepôt.",
    img: MANUTENTION,
  },
  {
    slug: "plomberie-fluides",
    title: "Plomberie & fluides",
    desc: "Climatisation, réseaux d'air comprimé, tuyauterie, robinetterie et raccords.",
    img: CLIMATISATION,
  },
  {
    slug: "electricite",
    title: "Électricité industrielle & bâtiment",
    desc: "Appareillage, câbles, tableaux, protection et matériel d'installation électrique.",
    img: ELECTRICITE,
  },
  {
    slug: "quincaillerie",
    title: "Quincaillerie & agencement",
    desc: "Visserie, fixations, serrurerie et quincaillerie de bâtiment et d'agencement.",
    img: QUINCAILLERIE,
  },
  {
    slug: "revetements",
    title: "Revêtements sols & murs",
    desc: "Revêtements de sols et murs, panneaux MDF, décoration et solutions d'aménagement.",
    img: REVETEMENTS,
  },
  {
    slug: "jardinage",
    title: "Jardinage & espaces verts",
    desc: "Outillage de jardin, motoculture et équipements pour l'entretien des espaces verts.",
    img: JARDINAGE,
  },
  {
    slug: "consommables",
    title: "Consommables industriels",
    desc: "Abrasifs, adhésifs, lubrifiants, produits d'entretien et consommables d'atelier.",
    img: CONSOMMABLES,
  },
  {
    slug: "luminaires",
    title: "Luminaires & éclairage",
    desc: "Éclairage industriel, commercial et résidentiel : projecteurs, réglettes et LED.",
    img: LUMINAIRES,
  },
]

export default function Products() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[12.5px] text-ink-soft">
        <Link to="/" className="hover:text-orsap-red">
          Accueil
        </Link>
        <span className="text-hairline">/</span>
        <span className="text-ink">Produits</span>
      </nav>

      {/* Intro */}
      <div className="max-w-3xl">
        <div className="mb-6 flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-orsap-red">
          <span className="h-px w-8 bg-orsap-red" />
          Catalogue produits
        </div>
        <h1 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-black leading-[1.05] tracking-[-0.025em]">
          Plus de 15 000 références pour l&apos;industrie, le bâtiment et
          l&apos;agencement.
        </h1>
        <p className="mt-6 text-[17px] leading-[1.6] text-ink-soft">
          EPI, outillage, manutention, électricité, plomberie, revêtements et
          bien plus : douze familles de produits, plus de 300 marques
          internationales et une livraison en 48h sur la plupart de nos
          références.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/solutions"
            className="inline-flex items-center gap-2 rounded-lg bg-orsap-red px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-orsap-red-deep transition"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            Consulter le catalogue en ligne
          </Link>
          <Link
            to="/devis"
            className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-ink shadow-sm hover:bg-slate-50 transition"
          >
            Demander un devis
          </Link>
        </div>
      </div>

      {/* Category grid */}
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.slug}
            to={`/produits/${c.slug}`}
            className="group flex flex-col overflow-hidden border border-hairline bg-card transition-colors hover:border-orsap-red"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-steel">
              <img
                src={c.img}
                alt={c.title}
                loading={i < 3 ? "eager" : "lazy"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span className="absolute left-0 top-0 bg-orsap-red px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="font-display text-[19px] font-bold leading-tight tracking-[-0.01em] group-hover:text-orsap-red">
                {c.title}
              </h2>
              <p className="mt-2.5 flex-1 text-[14px] leading-[1.55] text-ink-soft">
                {c.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-ink transition-colors group-hover:text-orsap-red">
                Voir la gamme
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Help band */}
      <div className="mt-16 flex flex-col items-start justify-between gap-6 bg-ink p-8 text-paper sm:flex-row sm:items-center lg:p-10">
        <div>
          <h2 className="font-display text-[22px] font-black tracking-[-0.02em] text-white">
            Vous ne trouvez pas votre référence ?
          </h2>
          <p className="mt-2 text-[15px] text-white/70">
            Notre équipe technique vous aide à identifier le bon produit et
            établit votre devis sous 24h.
          </p>
        </div>
        <Link
          to="/devis"
          className="shrink-0 bg-orsap-red px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep"
        >
          Parler à un expert
        </Link>
      </div>
    </div>
  )
}
