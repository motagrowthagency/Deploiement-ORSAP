import { useState, useEffect, type FormEvent } from "react"
import orsapLogo from "@/imports/logo.jpg"

const POPUP_STORAGE_KEY = "orsap_newsletter_status"
const DELAY_MS = 1200 // Shows shortly after page load (1.2s)
const DISMISS_DURATION_DAYS = 7

export default function ClientListPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [clientType, setClientType] = useState<"professional" | "personal">("professional")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check localStorage
    try {
      const stored = localStorage.getItem(POPUP_STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.status === "subscribed") {
          return
        }
        if (data.status === "dismissed" && data.timestamp) {
          const daysPassed = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24)
          if (daysPassed < DISMISS_DURATION_DAYS) {
            return
          }
        }
      }
    } catch {
      // ignore localStorage errors
    }

    // Trigger popup after short initial delay
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        handleDismiss()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  function handleDismiss() {
    setIsOpen(false)
    try {
      localStorage.setItem(
        POPUP_STORAGE_KEY,
        JSON.stringify({ status: "dismissed", timestamp: Date.now() })
      )
    } catch {}
  }

  function handleOpenManual() {
    setIsOpen(true)
    setSuccess(false)
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name.trim() || null,
          company: clientType === "professional" ? (company.trim() || null) : null,
          phone: phone.trim() || null,
          clientType,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Une erreur est survenue. Veuillez réessayer.")
      }

      setSuccess(true)
      try {
        localStorage.setItem(
          POPUP_STORAGE_KEY,
          JSON.stringify({ status: "subscribed", timestamp: Date.now() })
        )
      } catch {}
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Impossible de vous inscrire pour le moment."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating trigger pill in bottom-right corner when popup is closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpenManual}
          title="Rejoindre la liste clients ORSAP"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-ink px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wider text-white shadow-xl border border-white/20 transition-all hover:bg-orsap-red hover:scale-105 hover:shadow-2xl cursor-pointer"
        >
          <span className="flex size-2 rounded-full bg-safety animate-ping" />
          <span>Offres &amp; Nouveautés</span>
        </button>
      )}

      {/* Main Popup Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm transition-opacity"
            onClick={handleDismiss}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-[560px] my-auto overflow-hidden rounded-2xl border border-hairline/80 bg-white shadow-2xl z-10 transition-all">
            {/* Top Header Banner */}
            <div className="bg-ink px-6 pt-7 pb-6 text-white relative">
              {/* Close button (X) */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Fermer le pop-up"
                className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-orsap-red hover:text-white focus:outline-none focus:ring-2 focus:ring-orsap-red cursor-pointer"
              >
                <svg
                  className="size-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Logo & Category badge */}
              <div className="flex items-center gap-3">
                <img
                  src={orsapLogo}
                  alt="ORSAP"
                  className="size-9 rounded-lg object-contain bg-white p-0.5"
                />
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-safety/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-safety border border-safety/30">
                    <span className="size-1.5 rounded-full bg-safety animate-pulse" />
                    Offres &amp; Actualités
                  </span>
                </div>
              </div>

              <h2
                id="popup-title"
                className="mt-3.5 font-display text-[22px] sm:text-[26px] font-black leading-tight tracking-tight text-white"
              >
                Rejoignez notre réseau client &amp; bénéficiez de nos offres exclusives
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/75">
                Restez informé en avant-première des arrivages d'équipements, promotions spéciales et actualités techniques.
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-7 bg-paper/40">
              {success ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                    <svg
                      className="size-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-[20px] font-bold text-ink">
                    Merci de votre inscription !
                  </h3>
                  <p className="mt-2 text-[14px] text-ink-soft max-w-sm mx-auto leading-relaxed">
                    Vous recevrez nos prochaines offres spéciales, nouveautés catalogues et informations exclusives directement par email.
                  </p>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="mt-6 inline-flex items-center justify-center bg-ink px-6 py-2.5 font-display text-[13px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-ink-soft rounded cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  {/* Value Perks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
                    <div className="flex items-center gap-2 rounded-lg bg-white p-2.5 border border-hairline/80 shadow-xs">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded bg-orsap-red/10 text-orsap-red">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-[12px] font-medium text-ink leading-tight">
                        Remises &amp; tarifs préférentiels
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-white p-2.5 border border-hairline/80 shadow-xs">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded bg-orsap-red/10 text-orsap-red">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <span className="text-[12px] font-medium text-ink leading-tight">
                        Arrivages en avant-première
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-white p-2.5 border border-hairline/80 shadow-xs">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded bg-orsap-red/10 text-orsap-red">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="text-[12px] font-medium text-ink leading-tight">
                        Conseils sécurité &amp; normes EPI
                      </span>
                    </div>
                  </div>

                  {/* Error Banner */}
                  {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-[13px] text-orsap-red flex items-center gap-2">
                      <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Client Type Toggle */}
                    <div className="flex rounded-lg bg-paper p-1 border border-hairline">
                      <button
                        type="button"
                        onClick={() => setClientType("professional")}
                        className={`flex-1 py-1.5 text-center text-[12.5px] font-semibold transition-all rounded cursor-pointer ${
                          clientType === "professional"
                            ? "bg-white text-ink shadow-sm"
                            : "text-steel hover:text-ink"
                        }`}
                      >
                        Entreprise / Professionnel
                      </button>
                      <button
                        type="button"
                        onClick={() => setClientType("personal")}
                        className={`flex-1 py-1.5 text-center text-[12.5px] font-semibold transition-all rounded cursor-pointer ${
                          clientType === "personal"
                            ? "bg-white text-ink shadow-sm"
                            : "text-steel hover:text-ink"
                        }`}
                      >
                        Artisan / Particulier
                      </button>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label
                        htmlFor="newsletter-email"
                        className="block text-[12px] font-semibold uppercase tracking-wider text-ink-soft mb-1"
                      >
                        Adresse Email <span className="text-orsap-red">*</span>
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemple@entreprise.ma"
                        className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder:text-steel/60 focus:border-orsap-red focus:outline-none focus:ring-1 focus:ring-orsap-red transition-all"
                      />
                    </div>

                    {/* Name & Company (side by side on sm) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="newsletter-name"
                          className="block text-[12px] font-semibold uppercase tracking-wider text-ink-soft mb-1"
                        >
                          Nom complet <span className="text-steel font-normal text-[11px]">(optionnel)</span>
                        </label>
                        <input
                          id="newsletter-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Votre nom"
                          className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2 text-[14px] text-ink placeholder:text-steel/60 focus:border-orsap-red focus:outline-none focus:ring-1 focus:ring-orsap-red transition-all"
                        />
                      </div>

                      {clientType === "professional" ? (
                        <div>
                          <label
                            htmlFor="newsletter-company"
                            className="block text-[12px] font-semibold uppercase tracking-wider text-ink-soft mb-1"
                          >
                            Société <span className="text-steel font-normal text-[11px]">(optionnel)</span>
                          </label>
                          <input
                            id="newsletter-company"
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Nom de votre société"
                            className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2 text-[14px] text-ink placeholder:text-steel/60 focus:border-orsap-red focus:outline-none focus:ring-1 focus:ring-orsap-red transition-all"
                          />
                        </div>
                      ) : (
                        <div>
                          <label
                            htmlFor="newsletter-phone"
                            className="block text-[12px] font-semibold uppercase tracking-wider text-ink-soft mb-1"
                          >
                            Téléphone <span className="text-steel font-normal text-[11px]">(optionnel)</span>
                          </label>
                          <input
                            id="newsletter-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+212 6..."
                            className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2 text-[14px] text-ink placeholder:text-steel/60 focus:border-orsap-red focus:outline-none focus:ring-1 focus:ring-orsap-red transition-all"
                          />
                        </div>
                      )}
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-orsap-red px-5 py-3.5 font-display text-[13.5px] font-bold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-orsap-red-deep active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="size-4.5 animate-spin text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                          <span>Inscription en cours...</span>
                        </>
                      ) : (
                        <span>Rejoindre la liste clients</span>
                      )}
                    </button>

                    {/* Dismiss button / No thanks */}
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleDismiss}
                        className="text-[12.5px] text-steel hover:text-ink transition-colors cursor-pointer"
                      >
                        Non merci, je préfère continuer ma visite
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
