import { useEffect, useState, type FormEvent } from "react"
import { Link } from "react-router"
import SEO from "@/components/SEO"
import { trackFormStart, trackGenerateLead } from "@/utils/analytics"
import { classifyLead, getStoredAttribution } from "@/utils/attribution"

type ClientType = "professional" | "personal"

const API_URL = "/api/devis"

export default function Devis() {
  const [clientType, setClientType] = useState<ClientType>("professional")
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formStarted, setFormStarted] = useState(false)
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  })

  const [solutions, setSolutions] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])

  const SOLUTIONS_OPTIONS = [
    "Equipements de Protection Individuelle",
    "Manutention",
    "Travail En Hauteur",
    "Personnalisation de Vêtements de Travail",
  ]

  const SECTORS_OPTIONS = ["Industrie", "Facility Management", "BTP", "Energie"]

  function update(field: keyof typeof form, value: string) {
    if (!formStarted) {
      setFormStarted(true)
      trackFormStart("devis")
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)

    const leadType = classifyLead({
      formType: "devis",
      solutions: clientType === "professional" ? solutions : [],
      sectors: clientType === "professional" ? sectors : [],
      message: form.message,
    })
    const attribution = getStoredAttribution()

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientType,
          ...form,
          solutions: clientType === "professional" ? solutions : [],
          sectors: clientType === "professional" ? sectors : [],
          leadType,
          attribution,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Erreur serveur. Veuillez réessayer.")
      }

      trackGenerateLead({
        formName: "devis",
        leadType,
        company: form.company,
        solutions: clientType === "professional" ? solutions : [],
      })

      setSubmitted(true)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Impossible d'envoyer la demande.",
      )
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (!submitted) return
    const timer = setTimeout(() => handleReset(), 10000)
    return () => clearTimeout(timer)
  }, [submitted])

  function handleReset() {
    setSubmitted(false)
    setForm({ name: "", company: "", email: "", phone: "", message: "" })
    setSolutions([])
    setSectors([])
    setClientType("professional")
  }

  return (
    <div>
      <SEO
        title="Demander un Devis B2B — Équipements Industriels & EPI | ORSAP Maroc"
        description="Obtenez une cotation rapide et personnalisée pour vos équipements de protection individuelle (EPI), solutions antichute, manutention et vêtements professionnels."
        keywords={[
          "devis EPI Maroc",
          "cotation matériel industriel Casablanca",
          "prix harnais antichute",
          "devis vêtements de travail personnalisés",
          "fournisseur B2B Maroc"
        ]}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Demander un devis", url: "/devis" }
        ]}
      />

      {/* Header */}
      <section className="border-b border-hairline bg-ink text-paper">
        <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-20">
          <nav className="mb-10 flex flex-wrap items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="hover:text-white">
              Accueil
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white">Demander un devis</span>
          </nav>
          <div className="flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-safety">
            <span className="h-px w-8 bg-safety" />
            Demander un devis
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em] text-white">
            Remplissez le formulaire, nous vous répondons rapidement.
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-white/80">
            Décrivez votre besoin et nos experts vous accompagnent avec un devis
            personnalisé, du produit unitaire à la solution complète.
          </p>
        </div>
      </section>

      {/* Form section */}
      <section className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        {submitted ? (
          /* ── Success state ── */
          <div className="mx-auto max-w-xl border border-hairline bg-card p-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orsap-red/10">
              <svg
                className="h-8 w-8 text-orsap-red"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="font-display text-[24px] font-black tracking-[-0.01em] text-ink">
              Demande envoyée !
            </h2>
            <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
              Merci pour votre demande. Un expert ORSAP vous contactera dans les
              plus brefs délais.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-8 inline-flex items-center justify-center border border-ink px-6 py-3 font-display text-[13.5px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Nouvelle demande
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Client type toggle */}
              <div>
                <label className="mb-3 block font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
                  Type de client
                </label>
                <div className="flex gap-0 border border-hairline">
                  {([
                    { key: "professional", label: "Professionnel" },
                    { key: "personal", label: "Particulier" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setClientType(opt.key)}
                      className={`flex-1 px-5 py-3 font-display text-[13.5px] font-bold uppercase tracking-[0.04em] transition-colors ${
                        clientType === opt.key
                          ? "bg-orsap-red text-white"
                          : "bg-card text-ink hover:bg-paper"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="devis-name"
                  className="mb-2 block font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink"
                >
                  Nom complet <span className="text-orsap-red">*</span>
                </label>
                <input
                  id="devis-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Votre nom et prénom"
                  className="w-full border border-hairline bg-card px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-steel focus:border-orsap-red"
                />
              </div>

              {/* Company — professional only */}
              {clientType === "professional" && (
                <div>
                  <label
                    htmlFor="devis-company"
                    className="mb-2 block font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink"
                  >
                    Nom de l&apos;entreprise{" "}
                    <span className="text-orsap-red">*</span>
                  </label>
                  <input
                    id="devis-company"
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    placeholder="Raison sociale"
                    className="w-full border border-hairline bg-card px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-steel focus:border-orsap-red"
                  />
                </div>
              )}

              {/* Email — professional only */}
              {clientType === "professional" && (
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="devis-email"
                      className="mb-2 block font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink"
                    >
                      Adresse email <span className="text-orsap-red">*</span>
                    </label>
                    <input
                      id="devis-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="email@entreprise.com"
                      className="w-full border border-hairline bg-card px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-steel focus:border-orsap-red"
                    />
                  </div>

                  <div>
                    <label className="mb-3 block font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
                      Solution(s) souhaitée(s)
                    </label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {SOLUTIONS_OPTIONS.map((opt) => (
                        <label
                          key={opt}
                          className="flex cursor-pointer select-none items-center gap-3 border border-hairline bg-card p-4 hover:border-orsap-red"
                        >
                          <input
                            type="checkbox"
                            checked={solutions.includes(opt)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSolutions([...solutions, opt])
                              } else {
                                setSolutions(solutions.filter((s) => s !== opt))
                              }
                            }}
                            className="size-4 shrink-0 accent-orsap-red"
                          />
                          <span className="text-[14px] font-medium text-ink">
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
                      Secteur(s) d&apos;activité
                    </label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {SECTORS_OPTIONS.map((opt) => (
                        <label
                          key={opt}
                          className="flex cursor-pointer select-none items-center gap-3 border border-hairline bg-card p-4 hover:border-orsap-red"
                        >
                          <input
                            type="checkbox"
                            checked={sectors.includes(opt)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSectors([...sectors, opt])
                              } else {
                                setSectors(sectors.filter((s) => s !== opt))
                              }
                            }}
                            className="size-4 shrink-0 accent-orsap-red"
                          />
                          <span className="text-[14px] font-medium text-ink">
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Phone */}
              <div>
                <label
                  htmlFor="devis-phone"
                  className="mb-2 block font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink"
                >
                  Numéro de téléphone <span className="text-orsap-red">*</span>
                </label>
                <input
                  id="devis-phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+212 6 44 20 30 30"
                  className="w-full border border-hairline bg-card px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-steel focus:border-orsap-red"
                />
              </div>

              {/* Message (optional) */}
              <div>
                <label
                  htmlFor="devis-message"
                  className="mb-2 block font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink"
                >
                  Message{" "}
                  <span className="text-[11px] font-normal normal-case tracking-normal text-steel">
                    (optionnel)
                  </span>
                </label>
                <textarea
                  id="devis-message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Décrivez votre besoin, les produits souhaités, les quantités…"
                  className="w-full resize-none border border-hairline bg-card px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-steel focus:border-orsap-red"
                />
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start gap-3 rounded-lg border border-hairline bg-card/60 p-3.5">
                <input
                  id="devis-consent"
                  type="checkbox"
                  required
                  className="mt-1 size-4 shrink-0 rounded accent-orsap-red focus-visible:ring-2 focus-visible:ring-orsap-red cursor-pointer"
                />
                <label htmlFor="devis-consent" className="text-xs leading-relaxed text-ink-soft select-none cursor-pointer">
                  J&apos;accepte que les données saisies soient traitées par ORSAP SARL dans le cadre de ma demande de devis et de la relation commerciale, conformément à la{" "}
                  <Link to="/politique-de-confidentialite" target="_blank" className="font-semibold text-orsap-red underline hover:text-orsap-red-deep">
                    Politique de Confidentialité
                  </Link>{" "}
                  (Loi 09-08 / CNDP).
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="border border-orsap-red/30 bg-orsap-red/5 px-4 py-3 text-[14px] text-orsap-red">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-orsap-red px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep disabled:opacity-60 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orsap-red focus-visible:ring-offset-2"
              >
                {sending ? "Envoi en cours…" : "Envoyer ma demande de devis"}
              </button>
            </form>

            {/* Sidebar — reassurance */}
            <aside className="space-y-6 lg:pt-11">
              {[
                {
                  title: "Réponse rapide",
                  note: "Un interlocuteur dédié vous rappelle sans délai.",
                },
                {
                  title: "15 000+ références",
                  note: "Une offre multi-catégories auprès d'un seul fournisseur.",
                },
                {
                  title: "300+ marques",
                  note: "Des produits conformes aux normes et à vos besoins.",
                },
              ].map((r) => (
                <div
                  key={r.title}
                  className="border border-hairline bg-card p-6"
                >
                  <div className="font-display text-[15px] font-bold tracking-[-0.01em] text-orsap-red">
                    {r.title}
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-soft">
                    {r.note}
                  </p>
                </div>
              ))}
            </aside>
          </div>
        )}
      </section>
    </div>
  )
}
