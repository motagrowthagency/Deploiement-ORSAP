import { useState, useEffect } from "react"
import { Link } from "react-router"

export interface CookiePreferences {
  essential: boolean
  analytics: boolean
  timestamp: string
}

const STORAGE_KEY = "orsap_cookie_consent"

export default function CookieConsentBanner() {
  const [open, setOpen] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const timer = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(timer)
    } else {
      try {
        const parsed: CookiePreferences = JSON.parse(stored)
        setAnalyticsAllowed(parsed.analytics)
      } catch {
        setOpen(true)
      }
    }
  }, [])

  useEffect(() => {
    const handleReopen = () => {
      setShowCustomize(true)
      setOpen(true)
    }
    window.addEventListener("open-cookie-banner", handleReopen)
    return () => window.removeEventListener("open-cookie-banner", handleReopen)
  }, [])

  const savePreferences = (analytics: boolean) => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    setAnalyticsAllowed(analytics)
    setOpen(false)
    setShowCustomize(false)
  }

  if (!open) return null

  return (
    <div
      aria-label="Gestion des cookies"
      role="dialog"
      aria-modal="false"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="rounded-xl border border-hairline bg-paper/95 p-6 shadow-2xl backdrop-blur-md">
        {!showCustomize ? (
          /* Main Consent View */
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-ink text-white">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <h3 className="font-display text-[15px] font-bold text-ink tracking-tight">
                  Gestion des cookies &amp; confidentialité
                </h3>
              </div>
            </div>

            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              ORSAP utilise des cookies strictement nécessaires au fonctionnement du site et, avec votre accord, des traceurs anonymisés de mesure d&apos;audience pour optimiser nos services. Conforme à la loi 09-08 (CNDP).
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-2 border-t border-hairline/60">
              <button
                type="button"
                onClick={() => savePreferences(true)}
                className="bg-orsap-red px-4 py-2 font-display text-[12px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orsap-red"
              >
                Accepter
              </button>
              <button
                type="button"
                onClick={() => savePreferences(false)}
                className="border border-hairline bg-card px-4 py-2 font-display text-[12px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orsap-red"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={() => setShowCustomize(true)}
                className="px-2 py-2 font-display text-[12px] font-semibold text-ink-soft hover:text-ink transition-colors underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orsap-red"
              >
                Paramétrer
              </button>
            </div>
          </div>
        ) : (
          /* Detailed Customization View */
          <div>
            <div className="flex items-center justify-between border-b border-hairline/60 pb-3">
              <h3 className="font-display text-[15px] font-bold text-ink">
                Paramètres des cookies
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomize(false)}
                aria-label="Fermer la personnalisation"
                className="text-ink-soft hover:text-ink transition-colors text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {/* Essential */}
              <div className="flex items-start justify-between gap-3 rounded-lg border border-hairline/60 bg-card p-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[13px] font-bold text-ink">Cookies essentiels</span>
                    <span className="rounded bg-steel/15 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-ink-soft">
                      Toujours actif
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                    Indispensables à la navigation, à la sécurité et au bon fonctionnement des formulaires de contact et devis.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-3 rounded-lg border border-hairline/60 bg-card p-3.5">
                <div className="pr-2">
                  <span className="font-display text-[13px] font-bold text-ink">Mesure d&apos;audience anonyme</span>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                    Nous permet de comprendre l&apos;utilisation du site afin d&apos;en améliorer l&apos;ergonomie et les contenus.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    id="cookie-analytics-toggle"
                    checked={analyticsAllowed}
                    onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-steel/30 peer-checked:bg-orsap-red transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-ink-soft">
              <Link to="/politique-des-cookies" className="underline hover:text-orsap-red transition-colors">
                Politique des cookies
              </Link>
              <Link to="/politique-de-confidentialite" className="underline hover:text-orsap-red transition-colors">
                Confidentialité
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-2.5 pt-3 border-t border-hairline/60">
              <button
                type="button"
                onClick={() => savePreferences(analyticsAllowed)}
                className="flex-1 bg-orsap-red px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep"
              >
                Enregistrer mes choix
              </button>
              <button
                type="button"
                onClick={() => setShowCustomize(false)}
                className="border border-hairline bg-card px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-paper"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
