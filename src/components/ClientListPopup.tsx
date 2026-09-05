import { useState, useEffect, type FormEvent } from "react"
import { useLocation } from "react-router"
import orsapLogo from "@/imports/logo.jpg"

export default function ClientListPopup() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Open automatically after a short delay on the home page
  useEffect(() => {
    if (location.pathname === "/") {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setSuccess(false)
        setError(null)
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [location.pathname])

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
  }

  function handleOpenManual() {
    setIsOpen(true)
    setSuccess(false)
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !company.trim() || !email.trim() || !phone.trim()) {
      setError("Veuillez renseigner votre nom, société, adresse email et numéro de téléphone.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          clientType: "professional",
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Une erreur est survenue. Veuillez réessayer.")
      }

      setSuccess(true)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Impossible d'enregistrer votre demande pour le moment."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Discrete bottom corner pill when popup is closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpenManual}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:bg-orsap-red hover:shadow-xl cursor-pointer"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>Offres &amp; Arrivages</span>
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
            onClick={handleDismiss}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-hairline z-10">
            {/* Close button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Fermer"
              className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full text-steel hover:bg-paper hover:text-ink transition-colors cursor-pointer"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {success ? (
                <div className="py-4 text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    Demande bien reçue
                  </h3>
                  <p className="mt-1.5 text-sm text-steel leading-relaxed">
                    Merci ! Vous recevrez nos disponibilités et offres directement par email.
                  </p>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="mt-6 inline-flex w-full justify-center rounded-lg bg-ink py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-soft cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={orsapLogo}
                      alt="ORSAP"
                      className="size-8 rounded-md object-contain border border-hairline/60 p-0.5"
                    />
                    <div>
                      <h2 id="popup-title" className="font-display text-lg font-bold text-ink leading-tight">
                        Offres &amp; Arrivages ORSAP
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm text-steel leading-relaxed mb-5">
                    Recevez nos disponibilités en stock, arrivages d'équipements et conditions tarifaires pour les professionnels.
                  </p>

                  {/* Error message */}
                  {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-orsap-red">
                      {error}
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="popup-name" className="block text-xs font-medium text-ink-soft mb-1">
                          Nom &amp; Prénom <span className="text-orsap-red">*</span>
                        </label>
                        <input
                          id="popup-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Mohamed Tazi"
                          className="w-full rounded-lg border border-hairline bg-paper/30 px-3 py-2 text-sm text-ink placeholder:text-steel/50 focus:bg-white focus:border-orsap-red focus:outline-none focus:ring-1 focus:ring-orsap-red transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="popup-company" className="block text-xs font-medium text-ink-soft mb-1">
                          Société <span className="text-orsap-red">*</span>
                        </label>
                        <input
                          id="popup-company"
                          type="text"
                          required
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Ex: BTP Maroc"
                          className="w-full rounded-lg border border-hairline bg-paper/30 px-3 py-2 text-sm text-ink placeholder:text-steel/50 focus:bg-white focus:border-orsap-red focus:outline-none focus:ring-1 focus:ring-orsap-red transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="popup-email" className="block text-xs font-medium text-ink-soft mb-1">
                          Email professionnel <span className="text-orsap-red">*</span>
                        </label>
                        <input
                          id="popup-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contact@societe.ma"
                          className="w-full rounded-lg border border-hairline bg-paper/30 px-3 py-2 text-sm text-ink placeholder:text-steel/50 focus:bg-white focus:border-orsap-red focus:outline-none focus:ring-1 focus:ring-orsap-red transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="popup-phone" className="block text-xs font-medium text-ink-soft mb-1">
                          Téléphone <span className="text-orsap-red">*</span>
                        </label>
                        <input
                          id="popup-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+212 6..."
                          className="w-full rounded-lg border border-hairline bg-paper/30 px-3 py-2 text-sm text-ink placeholder:text-steel/50 focus:bg-white focus:border-orsap-red focus:outline-none focus:ring-1 focus:ring-orsap-red transition-all"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-orsap-red py-2.5 font-display text-sm font-bold text-white shadow-sm transition-colors hover:bg-orsap-red-deep disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <svg className="size-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <span>Être informé des offres</span>
                      )}
                    </button>

                    {/* Footer note */}
                    <p className="text-center text-[11.5px] text-steel/80 pt-1">
                      Pas de spam. Vous pouvez vous désabonner à tout moment.
                    </p>
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

