import { Link } from "react-router"
import manutentionPhoto from "@/imports/manutention_gerbeur.jpg"
import revetementPhoto from "@/imports/revetement_bois.jpg"
import outillagePhoto from "@/imports/outillage_bosch.jpg"

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

type SolutionCategory = {
  slug: string
  title: string
  desc: string
  img: string
  badge?: string
  subLinks?: { label: string; to: string }[]
}

const SOLUTION_CATEGORIES: SolutionCategory[] = [
  {
    slug: "epi",
    title: "EPI — Protection Individuelle",
    desc: "Équipements certifiés de la tête aux pieds : casques, chaussures S3, gants anti-coupure, masques et protection auditive.",
    img: EPI,
    badge: "Indispensable",
    subLinks: [
      { label: "BTP & Chantier", to: "/solutions/epi/btp" },
      { label: "Casques de Sécurité", to: "/solutions/epi/casques" },
      { label: "Chaussures de Sécurité", to: "/solutions/epi/chaussures-securite" },
      { label: "Gants de Protection", to: "/solutions/epi/gants" },
      { label: "Gants Anti-Coupure", to: "/solutions/epi/gants/anti-coupure" },
      { label: "Gants Manutention", to: "/solutions/epi/gants/manutention" },
      { label: "Protection Auditive", to: "/solutions/epi/protection-auditive" },
      { label: "Protection Respiratoire", to: "/solutions/epi/protection-respiratoire" },
      { label: "Protection des Yeux", to: "/solutions/epi/protection-yeux" },
    ],
  },
  {
    slug: "travail-en-hauteur",
    title: "Travail en Hauteur & Antichute",
    desc: "Solutions complètes antichute certifiées EN 363 : harnais ergonomiques, points d'ancrage fixes/mobiles, lignes de vie et longes avec absorbeur.",
    img: ECHAFAUDAGE,
    badge: "Sécurité Hauteur",
    subLinks: [
      { label: "Points d'Ancrage", to: "/solutions/travail-en-hauteur/ancrages" },
      { label: "Harnais Antichute", to: "/solutions/travail-en-hauteur/harnais" },
      { label: "Lignes de Vie Câble & Rail", to: "/solutions/travail-en-hauteur/lignes-de-vie" },
      { label: "Longes & Enrouleurs", to: "/solutions/travail-en-hauteur/longes" },
    ],
  },
  {
    slug: "vetements-professionnels",
    title: "Vêtements Professionnels & Personnalisation",
    desc: "Pantalons renforcés, vestes haute visibilité EN 20471, tenues été respirantes, grand froid et atelier de broderie/sérigraphie sur mesure.",
    img: U("photo-1578575437130-527eed3abbec"),
    badge: "Atelier Marquage",
    subLinks: [
      { label: "Tenues Été & Respirantes", to: "/solutions/vetements-professionnels" },
      { label: "Haute Visibilité & Multirisque", to: "/solutions/vetements-professionnels" },
    ],
  },
  {
    slug: "manutention",
    title: "Manutention & Levage",
    desc: "Transpalettes manuels et électriques lithium, gerbeurs, tables élévatrices ergonomiques et accessoires d'élingage certifiés.",
    img: MANUTENTION,
    badge: "Ergonomie",
    subLinks: [
      { label: "Transpalettes & Gerbeurs", to: "/solutions/manutention" },
      { label: "Élingues & Accessoires de Levage", to: "/solutions/manutention" },
    ],
  },
  {
    slug: "logistique",
    title: "Solutions Logistique & Entrepôt",
    desc: "Séparation des flux piétons/chariots, sabots de protection pour rayonnages, cales et butoirs de quai de chargement.",
    img: U("photo-1586528116311-ad8dd3c8310d"),
    badge: "Entrepôt Sûr",
  },
  {
    slug: "industrie",
    title: "Industrie & Risques Industriels",
    desc: "Consignation LOTO (Lockout/Tagout), bacs et armoires de rétention pour polluants, tapis d'atelier anti-fatigue et signalétique.",
    img: U("photo-1581091226825-a6a2a5aee158"),
    badge: "LOTO & Rétention",
  },
  {
    slug: "outillage",
    title: "Outillage à Main & Électroportatif",
    desc: "Perceuses, meuleuses, visseuses professionnelles, jeux de douilles, clés mixtes et outillage industriel certifié (Bosch, DeWalt, Facom).",
    img: OUTILLAGE,
  },
  {
    slug: "roulements-transmission",
    title: "Roulements & Transmission",
    desc: "Roulements haute précision, paliers en fonte, courroies trapézoïdales, chaînes mécaniques et accouplements industriels.",
    img: ROULEMENTS,
  },
  {
    slug: "plomberie-fluides",
    title: "Plomberie & Gestion des Fluides",
    desc: "Tuyauteries acier/cuivre/multicouche, vannes industrielles, raccords rapides, réseaux d'air comprimé et solutions de pompage.",
    img: CLIMATISATION,
  },
  {
    slug: "electricite",
    title: "Électricité Industrielle & Bâtiment",
    desc: "Disjoncteurs, armoires électriques, câblages industriels, appareillage étanche et matériel d'installation haute fiabilité.",
    img: ELECTRICITE,
  },
  {
    slug: "quincaillerie",
    title: "Quincaillerie & Agencement",
    desc: "Visserie boulonnerie inox/zingué, chevilles d'ancrage lourd, serrures de sécurité et quincaillerie de bâtiment.",
    img: QUINCAILLERIE,
  },
  {
    slug: "revetements",
    title: "Revêtements Sols & Murs",
    desc: "Revêtements de sols industriels et tertiaires, panneaux MDF, solutions acoustiques et décoratives pour locaux professionnels.",
    img: REVETEMENTS,
  },
  {
    slug: "jardinage",
    title: "Espaces Verts & Aménagement Extérieur",
    desc: "Outillage pour l'entretien des parcs d'entreprise, motoculture, débroussailleuses et équipements de protection paysagiste.",
    img: JARDINAGE,
  },
  {
    slug: "consommables",
    title: "Consommables Industriels & Atelier",
    desc: "Abrasifs de coupe, rubans adhésifs techniques, colles, lubrifiants et produits d'entretien spécialisés.",
    img: CONSOMMABLES,
  },
  {
    slug: "luminaires",
    title: "Luminaires & Éclairage Professionnel",
    desc: "Projecteurs LED d'atelier, réglettes industrielles étanches IP65 et éclairage pour hangars logistiques.",
    img: LUMINAIRES,
  },
]

export default function Solutions() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[12.5px] text-ink-soft">
        <Link to="/" className="hover:text-orsap-red">
          Accueil
        </Link>
        <span className="text-hairline">/</span>
        <span className="text-ink">Solutions</span>
      </nav>

      {/* Intro */}
      <div className="max-w-3xl">
        <div className="mb-6 flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-orsap-red">
          <span className="h-px w-8 bg-orsap-red" />
          Catalogue de Solutions ORSAP
        </div>
        <h1 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-black leading-[1.05] tracking-[-0.025em]">
          Des solutions techniques complètes pour la sécurité, l&apos;industrie et le bâtiment.
        </h1>
        <p className="mt-6 text-[17px] leading-[1.6] text-ink-soft">
          EPI certifiés, travail en hauteur, logistique sécurisée, manutention, vêtements de travail personnalisés et fournitures industrielles : découvrez nos gammes adaptées aux exigences des professionnels au Maroc.
        </p>
      </div>

      {/* Fast Shortcuts for Key Pillars */}
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {[
          { label: "Solutions EPI", to: "/solutions/epi", code: "EPI" },
          { label: "Travail en Hauteur", to: "/solutions/travail-en-hauteur", code: "HAUTEUR" },
          { label: "Vêtements Pro", to: "/solutions/vetements-professionnels", code: "WORKWEAR" },
          { label: "Prévention HSE", to: "/blog/prevention", code: "HSE" },
        ].map((shortcut, idx) => (
          <Link
            key={idx}
            to={shortcut.to}
            className="flex items-center gap-3 border border-hairline bg-card p-4 transition-all hover:border-orsap-red hover:shadow-sm"
          >
            <span className="font-mono text-[10px] font-bold text-orsap-red bg-paper px-2 py-0.5 border border-hairline">
              {shortcut.code}
            </span>
            <span className="font-display text-[14px] font-bold text-ink hover:text-orsap-red">
              {shortcut.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Solutions grid */}
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTION_CATEGORIES.map((c, i) => (
          <div
            key={c.slug}
            className="group flex flex-col overflow-hidden border border-hairline bg-card transition-all duration-300 hover:border-orsap-red hover:shadow-md"
          >
            <Link to={`/solutions/${c.slug}`} className="relative aspect-[4/3] overflow-hidden bg-steel block">
              <img
                src={c.img}
                alt={c.title}
                loading={i < 3 ? "eager" : "lazy"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span className="absolute left-0 top-0 bg-orsap-red px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              {c.badge && (
                <span className="absolute right-3 top-3 bg-ink/80 backdrop-blur px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  {c.badge}
                </span>
              )}
            </Link>

            <div className="flex flex-1 flex-col p-6">
              <Link to={`/solutions/${c.slug}`}>
                <h2 className="font-display text-[19px] font-bold leading-tight tracking-[-0.01em] group-hover:text-orsap-red">
                  {c.title}
                </h2>
              </Link>
              <p className="mt-2.5 flex-1 text-[14px] leading-[1.55] text-ink-soft">
                {c.desc}
              </p>

              {/* Sub-links if present */}
              {c.subLinks && c.subLinks.length > 0 && (
                <div className="mt-4 border-t border-hairline/70 pt-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-2">
                    Spécialités :
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.subLinks.slice(0, 4).map((sub, sIdx) => (
                      <Link
                        key={sIdx}
                        to={sub.to}
                        className="rounded bg-paper px-2 py-1 text-[12px] font-medium text-ink hover:bg-orsap-red hover:text-white transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                    {c.subLinks.length > 4 && (
                      <Link
                        to={`/solutions/${c.slug}`}
                        className="rounded bg-paper px-2 py-1 text-[12px] font-semibold text-orsap-red hover:underline"
                      >
                        +{c.subLinks.length - 4} autres
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <Link
                to={`/solutions/${c.slug}`}
                className="mt-5 inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-ink transition-colors group-hover:text-orsap-red"
              >
                Découvrir la solution
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Help band */}
      <div className="mt-16 flex flex-col items-start justify-between gap-6 bg-ink p-8 text-paper sm:flex-row sm:items-center lg:p-10">
        <div>
          <h2 className="font-display text-[22px] font-black tracking-[-0.02em] text-white">
            Vous recherchez une solution ou un équipement sur mesure ?
          </h2>
          <p className="mt-2 text-[15px] text-white/70">
            Notre équipe technique et commerciale vous conseille et établit votre devis personnalisé sous 24h.
          </p>
        </div>
        <Link
          to="/devis"
          className="shrink-0 bg-orsap-red px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep"
        >
          Demander une cotation
        </Link>
      </div>
    </div>
  )
}
