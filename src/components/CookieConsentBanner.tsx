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
    // Check if consent has already been given
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // Small delay for smooth entry
      const timer = setTimeout(() => setOpen(true), 800)
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
    // Listen to custom event to re-open preferences modal from footer or policy page
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
    <aside
      aria-label="Gestion des cookies"
      role="dialog"
      aria-modal="false"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 rounded-2xl border border-hairline bg-paper/95 p-5 shadow-2xl backdrop-blur-md transition-all duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orsap-red/10 text-lg text-orsap-red">
          🍪
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-sm font-bold text-ink">
            Respect de votre vie privée
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Nous utilisons des cookies techniques nécessaires au fonctionnement du site (session, panier de devis) et des traceurs de mesure d&apos;audience anonymes pour améliorer votre expérience.
          </p>

          {/* Customize View */}
          {showCustomize && (
            <div className="mt-3.5 space-y-2.5 rounded-xl bg-card p-3.5 border border-hairline/60 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-ink font-semibold block">Cookies essentiels</strong>
                  <span className="text-[11px] text-ink-soft">Session, devis, sécurité (Requis)</span>
                </div>
                <input
                  type="checkbox"
                  checked
                  disabled
                  aria-label="Cookies essentiels activés par défaut"
                  className="size-4 rounded accent-orsap-red opacity-70 cursor-not-allowed"
                />
              </div>
              <div className="flex items-center justify-between border-t border-hairline/40 pt-2">
                <div>
                  <strong className="text-ink font-semibold block">Statistiques & Performance</strong>
                  <span className="text-[11px] text-ink-soft">Mesure d&apos;audience anonyme</span>
                </div>
                <input
                  type="checkbox"
                  id="cookie-analytics-toggle"
                  checked={analyticsAllowed}
                  onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                  className="size-4 rounded accent-orsap-red cursor-pointer focus-visible:ring-2 focus-visible:ring-orsap-red"
                />
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 text-[11px] text-steel">
            <Link
              to="/politique-des-cookies"
              className="underline hover:text-orsap-red focus-visible:ring-2 focus-visible:ring-orsap-red rounded"
            >
              En savoir plus sur les cookies
            </Link>
            <span>•</span>
            <Link
              to="/politique-de-confidentialite"
              className="underline hover:text-orsap-red focus-visible:ring-2 focus-visible:ring-orsap-red rounded"
            >
              Politique de confidentialité
            </Link>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!showCustomize ? (
              <>
                <button
                  type="button"
                  onClick={() => savePreferences(true)}
                  className="rounded-lg bg-orsap-red px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-orsap-red-deep transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orsap-red"
                >
                  Tout accepter
                </button>
                <button
                  type="button"
                  onClick={() => savePreferences(false)}
                  className="rounded-lg border border-hairline bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-card transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orsap-red"
                >
                  Refuser non-essentiels
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomize(true)}
                  className="text-xs font-medium text-ink-soft hover:text-ink px-1.5 py-2 underline transition focus-visible:ring-2 focus-visible:ring-orsap-red rounded"
                >
                  Personnaliser
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => savePreferences(analyticsAllowed)}
                  className="rounded-lg bg-orsap-red px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-orsap-red-deep transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orsap-red"
                >
                  Enregistrer mes choix
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomize(false)}
                  className="rounded-lg border border-hairline bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-card transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orsap-red"
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
