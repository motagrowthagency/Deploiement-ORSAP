import { Link, useParams } from "react-router"
import { CATEGORY_ARTICLES } from "@/data/categoryArticles"

export default function ProductCategory() {
  const { category = "" } = useParams()
  const articleData = CATEGORY_ARTICLES[category]

  if (!articleData) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24 text-center">
        <h1 className="font-display text-[2rem] font-bold text-ink">Catégorie introuvable</h1>
        <p className="mt-4 text-ink-soft">Cette gamme de produits n&apos;existe pas ou a été déplacée.</p>
        <Link to="/produits" className="mt-6 inline-flex bg-orsap-red px-6 py-3 text-white font-bold uppercase tracking-wider">
          Retour au catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[12.5px] text-ink-soft">
        <Link to="/" className="hover:text-orsap-red">
          Accueil
        </Link>
        <span className="text-hairline">/</span>
        <Link to="/produits" className="hover:text-orsap-red">
          Produits
        </Link>
        <span className="text-hairline">/</span>
        <span className="text-ink">{articleData.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        {/* Left Side: Article Content */}
        <div className="lg:col-span-8">
          <div className="mb-6 flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-orsap-red">
            <span className="h-px w-8 bg-orsap-red" />
            Gamme produits ORSAP
          </div>
          
          <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em] text-ink">
            {articleData.title}
          </h1>

          <p className="mt-3 font-display text-[17px] font-bold italic leading-relaxed text-orsap-red-deep">
            {articleData.subtitle}
          </p>

          <div className="mt-8 space-y-6 text-[16px] leading-[1.7] text-ink-soft">
            <p className="text-[17px] font-medium leading-[1.65] text-ink">
              {articleData.intro}
            </p>
            <p>
              {articleData.article}
            </p>
          </div>

          {/* Highlights Box */}
          <div className="mt-10 border border-hairline bg-paper p-8 rounded-lg">
            <h3 className="font-display text-[18px] font-bold text-ink mb-6 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-orsap-red" />
              {articleData.highlightsTitle}
            </h3>
            <ul className="space-y-4">
              {articleData.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[15px] text-ink-soft">
                  <span className="mt-1 font-bold text-orsap-red">✓</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sub-ranges list */}
          <div className="mt-10">
            <h3 className="font-display text-[18px] font-bold text-ink mb-6">
              {articleData.subRangesTitle}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {articleData.subRanges.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-3 border border-hairline bg-card p-4 hover:border-orsap-red transition-colors">
                  <span className="h-1.5 w-1.5 shrink-0 bg-orsap-red rounded-full" />
                  <span className="text-[14.5px] font-semibold text-ink leading-snug">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Services Callout & Actions */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <div className="border border-hairline bg-card p-8 rounded-lg shadow-sm">
            <h3 className="font-display text-[17px] font-extrabold text-ink uppercase tracking-wider mb-4">
              Besoin de matériel ?
            </h3>
            <p className="text-[14px] text-ink-soft leading-relaxed mb-6">
              Notre équipe d&apos;experts est disponible pour vous conseiller, vous aider à identifier les bonnes références et établir votre cotation sur mesure.
            </p>

            <Link
              to="/devis"
              className="flex w-full items-center justify-center bg-orsap-red py-4 text-center font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep mb-4"
            >
              Demander un devis gratuit
            </Link>

            <Link
              to="/produits"
              className="flex w-full items-center justify-center border border-ink py-4 text-center font-display text-[14px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Retour au catalogue
            </Link>

            {/* Commitments Band */}
            <div className="mt-8 border-t border-hairline pt-6">
              <h4 className="font-display text-[13px] font-bold text-ink uppercase tracking-wider mb-4">
                Les engagements ORSAP
              </h4>
              <ul className="space-y-3.5">
                <li className="flex items-center gap-3 text-[13px] text-ink-soft">
                  <span className="text-orsap-red font-bold text-xs bg-paper px-1.5 py-0.5 border border-hairline">48H</span>
                  <span>Livraison express sous 48 heures</span>
                </li>
                <li className="flex items-center gap-3 text-[13px] text-ink-soft">
                  <span className="text-orsap-red font-bold text-xs bg-paper px-1.5 py-0.5 border border-hairline">B2B</span>
                  <span>Interlocuteur commercial unique</span>
                </li>
                <li className="flex items-center gap-3 text-[13px] text-ink-soft">
                  <span className="text-orsap-red font-bold text-xs bg-paper px-1.5 py-0.5 border border-hairline">ISO</span>
                  <span>Solutions certifiées et conformes</span>
                </li>
                <li className="flex items-center gap-3 text-[13px] text-ink-soft">
                  <span className="text-orsap-red font-bold text-xs bg-paper px-1.5 py-0.5 border border-hairline">SAV</span>
                  <span>Support technique et SAV réactif</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
