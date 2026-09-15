import { Link, useLocation } from "react-router"
import { SOLUTIONS_DATA, type SolutionItem } from "@/data/solutionsData"
import { CATEGORY_ARTICLES } from "@/data/categoryArticles"

export default function SolutionDetail() {
  const location = useLocation()
  
  // Extract slug from URL: e.g. /solutions/epi/casques -> epi/casques
  const rawPath = location.pathname.replace(/^\/(?:solutions|produits)\/?/, "").replace(/\/$/, "")
  const slug = rawPath.toLowerCase()

  // First check dedicated rich SOLUTIONS_DATA
  const solution = SOLUTIONS_DATA[slug]

  // Fallback to legacy CATEGORY_ARTICLES if standard category
  const legacyArticle = !solution ? CATEGORY_ARTICLES[slug] : null

  if (!solution && !legacyArticle) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24 text-center">
        <h1 className="font-display text-[2rem] font-bold text-ink">Solution introuvable</h1>
        <p className="mt-4 text-ink-soft">Cette gamme ou solution n&apos;existe pas ou a été déplacée.</p>
        <Link to="/solutions" className="mt-6 inline-flex bg-orsap-red px-6 py-3 text-white font-bold uppercase tracking-wider">
          Retour aux solutions
        </Link>
      </div>
    )
  }

  // If standard legacy article, render formatted layout
  if (!solution && legacyArticle) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-[12.5px] text-ink-soft">
          <Link to="/" className="hover:text-orsap-red">
            Accueil
          </Link>
          <span className="text-hairline">/</span>
          <Link to="/solutions" className="hover:text-orsap-red">
            Solutions
          </Link>
          <span className="text-hairline">/</span>
          <span className="text-ink">{legacyArticle.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-orsap-red">
              <span className="h-px w-8 bg-orsap-red" />
              Solution Technique ORSAP
            </div>
            
            <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em] text-ink">
              {legacyArticle.title}
            </h1>

            <p className="mt-3 font-display text-[17px] font-bold italic leading-relaxed text-orsap-red-deep">
              {legacyArticle.subtitle}
            </p>

            <div className="mt-8 space-y-6 text-[16px] leading-[1.7] text-ink-soft">
              <p className="text-[17px] font-medium leading-[1.65] text-ink">
                {legacyArticle.intro}
              </p>
              <p>{legacyArticle.article}</p>
            </div>

            <div className="mt-10 border border-hairline bg-paper p-8 rounded-lg">
              <h3 className="font-display text-[18px] font-bold text-ink mb-6 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-orsap-red" />
                {legacyArticle.highlightsTitle}
              </h3>
              <ul className="space-y-4">
                {legacyArticle.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[15px] text-ink-soft">
                    <span className="mt-1 font-bold text-orsap-red">✓</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <h3 className="font-display text-[18px] font-bold text-ink mb-6">
                {legacyArticle.subRangesTitle}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {legacyArticle.subRanges.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-3 border border-hairline bg-card p-4 hover:border-orsap-red transition-colors">
                    <span className="h-1.5 w-1.5 shrink-0 bg-orsap-red rounded-full" />
                    <span className="text-[14.5px] font-semibold text-ink leading-snug">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar CTA */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="border border-hairline bg-card p-8 rounded-lg shadow-sm">
              <h3 className="font-display text-[17px] font-extrabold text-ink uppercase tracking-wider mb-4">
                Besoin d&apos;une étude de devis ?
              </h3>
              <p className="text-[14px] text-ink-soft leading-relaxed mb-6">
                Notre équipe d&apos;experts est disponible pour vous conseiller, vous aider à identifier les bonnes références et établir votre cotation sous 24h.
              </p>
              <Link
                to="/devis"
                className="flex w-full items-center justify-center bg-orsap-red py-4 text-center font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep mb-4"
              >
                Demander un devis
              </Link>
              <Link
                to="/solutions"
                className="flex w-full items-center justify-center border border-ink py-4 text-center font-display text-[14px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-white"
              >
                Toutes nos solutions
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Full-Feature Solution Page (from SOLUTIONS_DATA)
  const item: SolutionItem = solution!

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-soft">
        {item.breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-2">
            {idx > 0 && <span className="text-hairline">/</span>}
            {idx === item.breadcrumbs.length - 1 ? (
              <span className="text-ink font-semibold">{crumb.label}</span>
            ) : (
              <Link to={crumb.to} className="hover:text-orsap-red transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Rich Content */}
        <div className="lg:col-span-8">
          {/* Header & Badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-block bg-orsap-red px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-white">
              {item.category}
            </span>
            {item.targetSectors.map((sector, idx) => (
              <span key={idx} className="bg-paper border border-hairline px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                {sector}
              </span>
            ))}
          </div>

          <h1 className="font-display text-[clamp(2.2rem,4.2vw,3.4rem)] font-black leading-[1.05] tracking-[-0.025em] text-ink">
            {item.heroTitle || item.title}
          </h1>

          <p className="mt-4 font-display text-[18px] font-bold italic leading-relaxed text-orsap-red-deep">
            {item.subtitle}
          </p>

          {/* SEO Clusters Tags */}
          {item.seoClusters && item.seoClusters.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-ink-soft">
                Thématiques associées :
              </span>
              {item.seoClusters.map((cluster, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-safety/15 text-safety px-3 py-1 text-[12px] font-semibold tracking-tight"
                >
                  #{cluster}
                </span>
              ))}
            </div>
          )}

          {/* Body Intro & Description */}
          <div className="mt-8 space-y-6 text-[16.5px] leading-[1.75] text-ink-soft border-t border-hairline pt-6">
            <p className="text-[18px] font-medium leading-[1.65] text-ink">
              {item.intro}
            </p>
            <p>{item.description}</p>
          </div>

          {/* Key Challenges / Stakes */}
          {item.keyChallenges && item.keyChallenges.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display text-[20px] font-bold text-ink mb-6">
                Enjeux majeurs &amp; Facteurs de risque
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {item.keyChallenges.map((challenge, idx) => (
                  <div key={idx} className="border border-hairline bg-card p-5 rounded-md flex flex-col">
                    <span className="font-mono text-[11px] font-bold text-orsap-red mb-2 bg-paper px-2 py-0.5 w-fit border border-hairline">
                      ENJEU 0{idx + 1}
                    </span>
                    <h4 className="font-display text-[15px] font-bold text-ink mb-2">
                      {challenge.title}
                    </h4>
                    <p className="text-[13.5px] text-ink-soft leading-relaxed flex-1">
                      {challenge.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Norms & Regulatory Standards */}
          {item.normsAndStandards && item.normsAndStandards.length > 0 && (
            <div className="mt-10 border border-hairline bg-paper p-7 rounded-lg">
              <h3 className="font-display text-[18px] font-bold text-ink mb-5 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-orsap-red" />
                Normes &amp; Certifications applicables
              </h3>
              <div className="space-y-4">
                {item.normsAndStandards.map((norm, idx) => (
                  <div key={idx} className="border-b border-hairline/80 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] font-bold text-orsap-red bg-card px-2 py-0.5 border border-hairline">
                        {norm.code}
                      </span>
                      <span className="text-[14px] font-bold text-ink">{norm.label}</span>
                    </div>
                    <p className="mt-1 text-[13.5px] text-ink-soft">{norm.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subranges Grid */}
          <div className="mt-10">
            <h3 className="font-display text-[20px] font-bold text-ink mb-6">
              {item.subRangesTitle}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {item.subRanges.map((sub, idx) => (
                <div
                  key={idx}
                  className="group relative border border-hairline bg-card p-5 transition-all hover:border-orsap-red hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-display text-[16px] font-bold text-ink group-hover:text-orsap-red transition-colors">
                      {sub.title}
                    </h4>
                    {sub.badge && (
                      <span className="shrink-0 bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {sub.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[13.5px] text-ink-soft leading-relaxed">
                    {sub.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Advantages */}
          <div className="mt-10 border border-hairline bg-card p-8 rounded-lg">
            <h3 className="font-display text-[18px] font-bold text-ink mb-6 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-orsap-red" />
              {item.technicalFeaturesTitle}
            </h3>
            <ul className="space-y-3.5">
              {item.technicalFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[15px] text-ink-soft">
                  <span className="mt-0.5 font-bold text-orsap-red">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Expert Advice Box */}
          {item.expertAdvice && (
            <div className="mt-10 border-l-4 border-orsap-red bg-paper p-6">
              <div className="font-display text-[13px] font-bold uppercase tracking-wider text-orsap-red mb-1">
                L&apos;Avis de l&apos;Expert ORSAP
              </div>
              <p className="text-[15px] leading-relaxed text-ink font-medium">
                {item.expertAdvice}
              </p>
            </div>
          )}

          {/* Linked Editorial & SEO Articles */}
          {item.linkedArticles && item.linkedArticles.length > 0 && (
            <div className="mt-14 border-t border-hairline pt-10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-wider text-orsap-red">
                    Ressources &amp; Guides Techniques
                  </div>
                  <h3 className="font-display text-[22px] font-black text-ink">
                    Articles &amp; Guides Associés à cette Solution
                  </h3>
                </div>
                <Link to="/blog" className="text-[13px] font-bold text-orsap-red hover:underline hidden sm:block">
                  Voir tout le blog →
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {item.linkedArticles.map((art) => (
                  <div
                    key={art.id}
                    className="flex flex-col justify-between border border-hairline bg-card p-5 transition-all hover:border-orsap-red"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-orsap-red bg-paper px-2 py-0.5">
                          {art.id}
                        </span>
                        <span className="text-[12px] text-ink-soft">{art.readTime} de lecture</span>
                      </div>
                      <h4 className="font-display text-[15.5px] font-bold text-ink leading-snug mb-2">
                        {art.title}
                      </h4>
                      <p className="text-[13px] text-ink-soft line-clamp-2 mb-4">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-hairline/60 pt-3">
                      <div className="flex flex-wrap gap-1">
                        {art.clusters.map((c, cIdx) => (
                          <span key={cIdx} className="text-[11px] text-ink-soft bg-paper px-1.5 py-0.5">
                            #{c}
                          </span>
                        ))}
                      </div>
                      <Link
                        to={`/contact?subject=${encodeURIComponent(art.title)}`}
                        className="text-[12px] font-bold text-orsap-red hover:underline shrink-0"
                      >
                        Consulter un expert →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Solutions Navigation */}
          {item.relatedSolutions && item.relatedSolutions.length > 0 && (
            <div className="mt-12 border-t border-hairline pt-8">
              <h4 className="font-display text-[16px] font-bold uppercase tracking-wider text-ink mb-4">
                Solutions complémentaires recommandées :
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {item.relatedSolutions.map((rel, idx) => (
                  <Link
                    key={idx}
                    to={rel.to}
                    className="border border-hairline bg-paper p-4 transition-all hover:border-orsap-red hover:bg-card"
                  >
                    <div className="font-display text-[14px] font-bold text-ink mb-1 group-hover:text-orsap-red">
                      {rel.title}
                    </div>
                    <p className="text-[12.5px] text-ink-soft leading-snug">
                      {rel.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {item.faq && item.faq.length > 0 && (
            <div className="mt-12 border-t border-hairline pt-8">
              <h3 className="font-display text-[20px] font-bold text-ink mb-6">
                Questions Fréquentes (FAQ)
              </h3>
              <div className="space-y-4">
                {item.faq.map((faqItem, idx) => (
                  <div key={idx} className="border border-hairline bg-card p-5 rounded-md">
                    <h4 className="font-display text-[15px] font-bold text-ink mb-2">
                      {faqItem.q}
                    </h4>
                    <p className="text-[14px] text-ink-soft leading-relaxed">
                      {faqItem.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Action Box */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <div className="border border-hairline bg-card p-8 rounded-lg shadow-sm">
            <span className="inline-block bg-safety/20 text-safety font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 mb-3">
              Conseil &amp; Devis 24H
            </span>
            <h3 className="font-display text-[18px] font-extrabold text-ink uppercase tracking-wider mb-3">
              Un besoin sur cette solution ?
            </h3>
            <p className="text-[14px] text-ink-soft leading-relaxed mb-6">
              Nos ingénieurs et spécialistes techniques analysent votre cahier des charges et dimensionnent vos équipements selon les normes en vigueur.
            </p>

            <Link
              to={`/devis?solution=${encodeURIComponent(item.title)}`}
              className="flex w-full items-center justify-center bg-orsap-red py-4 text-center font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep mb-3"
            >
              Demander un devis sur mesure
            </Link>

            <Link
              to="/contact"
              className="flex w-full items-center justify-center border border-ink py-3.5 text-center font-display text-[13px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-white mb-6"
            >
              Contacter un expert technique
            </Link>

            {/* Quick Commitments */}
            <div className="border-t border-hairline pt-6 space-y-3">
              <h4 className="font-display text-[12.5px] font-bold text-ink uppercase tracking-wider mb-3">
                Garanties de service ORSAP
              </h4>
              <div className="flex items-center gap-3 text-[13px] text-ink-soft">
                <span className="text-orsap-red font-bold text-xs bg-paper px-1.5 py-0.5 border border-hairline">48H</span>
                <span>Livraison partout au Maroc sous 48h</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-ink-soft">
                <span className="text-orsap-red font-bold text-xs bg-paper px-1.5 py-0.5 border border-hairline">ISO</span>
                <span>Conformité CE, EN &amp; ISO garantie</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-ink-soft">
                <span className="text-orsap-red font-bold text-xs bg-paper px-1.5 py-0.5 border border-hairline">B2B</span>
                <span>Interlocuteur commercial dédié</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-ink-soft">
                <span className="text-orsap-red font-bold text-xs bg-paper px-1.5 py-0.5 border border-hairline">PRO</span>
                <span>Atelier de personnalisation intégré</span>
              </div>
            </div>

            <div className="mt-6 border-t border-hairline pt-4 text-center">
              <a href="tel:+212644203030" className="text-[13px] font-bold text-ink hover:text-orsap-red">
                Tél : +212 6 44 20 30 30
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
