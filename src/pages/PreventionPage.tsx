import { Link, useLocation } from "react-router"
import { PREVENTION_DATA, type PreventionHubItem } from "@/data/preventionData"
import SEO from "@/components/SEO"

export default function PreventionPage() {
  const location = useLocation()
  
  // Extract slug: /blog/prevention -> prevention, /blog/prevention/ergonomie -> prevention/ergonomie, etc.
  const rawPath = location.pathname.replace(/^\/blog\/?/, "").replace(/\/$/, "")
  const slug = rawPath.toLowerCase() || "prevention"

  const data: PreventionHubItem = PREVENTION_DATA[slug] || PREVENTION_DATA["prevention"]

  return (
    <div>
      <SEO
        title={`${data.heroTitle} | Pôle Prévention ORSAP Maroc`}
        description={data.subtitle || data.intro.slice(0, 160)}
        keywords={data.seoClusters}
        breadcrumbs={data.breadcrumbs.map((b) => ({ name: b.label, url: b.to }))}
      />

      {/* Header Banner */}
      <section className="border-b border-hairline bg-ink text-paper">
        <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-20">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-[12.5px] text-white/60">
            {data.breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {idx > 0 && <span className="text-white/30">/</span>}
                {idx === data.breadcrumbs.length - 1 ? (
                  <span className="text-white font-semibold">{crumb.label}</span>
                ) : (
                  <Link to={crumb.to} className="hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-safety">
            <span className="h-px w-8 bg-safety" />
            Pôle Prévention &amp; Culture Sécurité
          </div>

          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em] text-white">
            {data.heroTitle}
          </h1>

          <p className="mt-5 max-w-3xl text-[18px] leading-[1.6] text-white/80 italic">
            {data.subtitle}
          </p>

          {/* SEO Clusters Badges */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-white/60">
              Clusters SEO :
            </span>
            {data.seoClusters.map((cluster, idx) => (
              <span
                key={idx}
                className="rounded-full bg-safety/20 text-safety px-3 py-1 text-[12px] font-semibold"
              >
                #{cluster}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Body */}
      <section className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          {/* Main Column */}
          <div className="lg:col-span-8">
            {/* Intro text */}
            <div className="space-y-6 text-[17px] leading-[1.75] text-ink-soft">
              <p className="text-[19px] font-medium leading-[1.65] text-ink">
                {data.intro}
              </p>
              <p>{data.description}</p>
            </div>

            {/* Target Audience Bar */}
            <div className="mt-8 border border-hairline bg-paper p-5 rounded-md flex items-center gap-4">
              <span className="font-mono text-xs font-bold text-orsap-red bg-card px-2 py-1 border border-hairline">CIBLE</span>
              <div>
                <div className="font-display text-[12px] font-bold uppercase tracking-wider text-orsap-red">
                  Public Cible &amp; Décideurs
                </div>
                <div className="text-[14px] font-semibold text-ink">
                  {data.targetAudience}
                </div>
              </div>
            </div>

            {/* Methodology Steps */}
            <div className="mt-14">
              <div className="mb-6">
                <div className="text-[12px] font-bold uppercase tracking-wider text-orsap-red">
                  Démarche Opérationnelle
                </div>
                <h2 className="font-display text-[24px] font-black text-ink">
                  Méthodologie en 4 Étapes Clés
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {data.methodologySteps.map((step) => (
                  <div
                    key={step.step}
                    className="border border-hairline bg-card p-6 rounded-lg relative overflow-hidden flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[12px] font-black text-orsap-red bg-paper px-2 py-0.5 border border-hairline">
                        ÉTAPE 0{step.step}
                      </span>
                    </div>
                    <h3 className="font-display text-[16.5px] font-bold text-ink mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[14px] text-ink-soft leading-relaxed flex-1">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklists & Toolkits Box */}
            <div className="mt-14">
              <div className="mb-6">
                <div className="text-[12px] font-bold uppercase tracking-wider text-orsap-red">
                  Outils &amp; Modèles de Terrain
                </div>
                <h2 className="font-display text-[24px] font-black text-ink">
                  Check-lists &amp; Trame d&apos;Audit Téléchargeables
                </h2>
              </div>

              <div className="space-y-6">
                {data.keyToolsAndChecklists.map((tool, idx) => (
                  <div key={idx} className="border border-hairline bg-paper p-7 rounded-lg">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h3 className="font-display text-[17.5px] font-bold text-ink">
                        {tool.title}
                      </h3>
                      <span className="bg-ink text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
                        {tool.badge}
                      </span>
                    </div>
                    <p className="text-[14px] text-ink-soft mb-4">{tool.desc}</p>
                    <ul className="space-y-2 border-t border-hairline/80 pt-4">
                      {tool.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3 text-[14px] text-ink">
                          <span className="mt-0.5 font-bold text-orsap-red">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Advice */}
            <div className="mt-14 border border-hairline bg-card p-8 rounded-lg">
              <h3 className="font-display text-[19px] font-bold text-ink mb-5 flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orsap-red" />
                Recommandations &amp; Bonnes Pratiques de Terrain
              </h3>
              <ul className="space-y-4">
                {data.practicalAdvice.map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[15px] text-ink-soft">
                    <span className="font-bold text-orsap-red text-sm font-mono">•</span>
                    <span className="leading-relaxed">{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expert Quote */}
            {data.expertQuote && (
              <div className="mt-10 border-l-4 border-orsap-red bg-paper p-7">
                <p className="text-[16px] italic leading-relaxed text-ink font-medium mb-3">
                  &ldquo;{data.expertQuote.quote}&rdquo;
                </p>
                <div className="text-[13px] font-bold text-ink">
                  {data.expertQuote.author}
                </div>
                <div className="text-[12px] text-ink-soft">
                  {data.expertQuote.role}
                </div>
              </div>
            )}

            {/* Sub-Hubs Navigation if present */}
            {data.subHubs && data.subHubs.length > 0 && (
              <div className="mt-12 border-t border-hairline pt-8">
                <h4 className="font-display text-[16px] font-bold uppercase tracking-wider text-ink mb-4">
                  Thématiques de Prévention Spécialisées :
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {data.subHubs.map((sub, idx) => (
                    <Link
                      key={idx}
                      to={sub.to}
                      className="border border-hairline bg-card p-5 transition-all hover:border-orsap-red hover:shadow-sm"
                    >
                      <div className="font-display text-[16px] font-bold text-ink mb-1 group-hover:text-orsap-red">
                        {sub.title} →
                      </div>
                      <p className="text-[13px] text-ink-soft">
                        {sub.desc}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Articles */}
            {data.linkedArticles && data.linkedArticles.length > 0 && (
              <div className="mt-14 border-t border-hairline pt-10">
                <div className="mb-6">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-orsap-red">
                    Lectures Complémentaires
                  </div>
                  <h3 className="font-display text-[22px] font-black text-ink">
                    Articles &amp; Guides du Plan Éditorial
                  </h3>
                </div>

                <div className="space-y-4">
                  {data.linkedArticles.map((art) => (
                    <div
                      key={art.id}
                      className="border border-hairline bg-card p-6 transition-all hover:border-orsap-red"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-orsap-red bg-paper px-2 py-0.5">
                          {art.id}
                        </span>
                        <span className="text-[12px] text-ink-soft">{art.readTime} de lecture</span>
                      </div>
                      <h4 className="font-display text-[17px] font-bold text-ink mb-2">
                        {art.title}
                      </h4>
                      <p className="text-[14px] text-ink-soft mb-4 leading-relaxed">
                        {art.excerpt}
                      </p>
                      <div className="flex items-center justify-between border-t border-hairline/60 pt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {art.clusters.map((c, cIdx) => (
                            <span key={cIdx} className="text-[11px] text-ink-soft bg-paper px-2 py-0.5">
                              #{c}
                            </span>
                          ))}
                        </div>
                        <Link
                          to={`/contact?subject=${encodeURIComponent(art.title)}`}
                          className="text-[13px] font-bold text-orsap-red hover:underline"
                        >
                          Demander un conseil →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {data.faq && data.faq.length > 0 && (
              <div className="mt-14 border-t border-hairline pt-8">
                <h3 className="font-display text-[20px] font-bold text-ink mb-6">
                  Foire Aux Questions Prévention
                </h3>
                <div className="space-y-4">
                  {data.faq.map((faqItem, idx) => (
                    <div key={idx} className="border border-hairline bg-card p-5 rounded-md">
                      <h4 className="font-display text-[15.5px] font-bold text-ink mb-2">
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

          {/* Right Sticky Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="border border-hairline bg-card p-8 rounded-lg shadow-sm">
              <span className="inline-block bg-safety/20 text-safety font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 mb-3">
                Accompagnement QHSE
              </span>
              <h3 className="font-display text-[18px] font-extrabold text-ink uppercase tracking-wider mb-3">
                Besoin d&apos;un audit de sécurité ou de causeries ?
              </h3>
              <p className="text-[14px] text-ink-soft leading-relaxed mb-6">
                Nos conseillers en prévention et experts techniques vous aident à structurer vos causeries sécurité, auditer vos postes et équiper vos équipes en toute conformité.
              </p>

              <Link
                to={`/contact?subject=${encodeURIComponent(data.title)}`}
                className="flex w-full items-center justify-center bg-orsap-red py-4 text-center font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep mb-3"
              >
                Demander un diagnostic site
              </Link>

              <Link
                to="/solutions/epi"
                className="flex w-full items-center justify-center border border-ink py-3.5 text-center font-display text-[13px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-white mb-6"
              >
                Découvrir les solutions EPI
              </Link>

              <div className="border-t border-hairline pt-6 space-y-3">
                <h4 className="font-display text-[12.5px] font-bold text-ink uppercase tracking-wider mb-3">
                  Piliers Prévention ORSAP
                </h4>
                <div className="flex items-center gap-3 text-[13px] text-ink-soft">
                  <span className="text-orsap-red font-bold text-xs bg-paper px-1.5 py-0.5 border border-hairline">01</span>
                  <span>Trame d&apos;accueil sécurité sur mesure</span>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-ink-soft">
                  <span className="text-orsap-red font-bold text-xs bg-paper px-1.5 py-0.5 border border-hairline">02</span>
                  <span>Fiches causeries sécurité prêtes à animer</span>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-ink-soft">
                  <span className="text-orsap-red font-bold text-xs bg-paper px-1.5 py-0.5 border border-hairline">03</span>
                  <span>Sélection d&apos;EPI adaptés à chaque poste</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
