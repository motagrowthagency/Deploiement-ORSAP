import { useState, type FormEvent } from "react"
import { Link } from "react-router"
import SEO from "@/components/SEO"
import { trackFormStart, trackEvent } from "@/utils/analytics"
import { getStoredAttribution } from "@/utils/attribution"

export default function Recruitment() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formStarted, setFormStarted] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "Candidature Spontanée",
    message: "",
    cv: "",
    cvName: "",
  })

  const POSITION_OPTIONS = [
    "Commercial B2B / Technico-commercial",
    "Logistique, Entrepôt & Chauffeurs",
    "Achat, Sourcing & Approvisionnement",
    "Gestion Administrative, Finance & RH",
    "Stage PFE / Stage de fin d'études",
    "Candidature Spontanée",
  ]

  function update(field: keyof typeof form, value: string) {
    if (!formStarted) {
      setFormStarted(true)
      trackFormStart("recrutement")
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("La taille du fichier ne doit pas dépasser 10 Mo.")
      e.target.value = "" // clear input
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setForm((prev) => ({
        ...prev,
        cv: event.target?.result as string,
        cvName: file.name,
      }))
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.cv) {
      setError("Veuillez joindre votre CV (Format PDF ou Word).")
      return
    }

    setSending(true)
    setError(null)
    const attribution = getStoredAttribution()

    try {
      const res = await fetch("/api/recrutement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          attribution,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Une erreur est survenue lors de l'envoi.")
      }

      trackEvent("job_application_submitted", {
        position: form.position,
      })

      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de connexion avec le serveur.")
    } finally {
      setSending(false)
    }
  }

  function handleReset() {
    setForm({
      name: "",
      email: "",
      phone: "",
      position: "Candidature Spontanée",
      message: "",
      cv: "",
      cvName: "",
    })
    setSubmitted(false)
    setError(null)
  }

  return (
    <div>
      <SEO
        title="Rejoignez les Équipes ORSAP — Recrutement & Opportunités B2B | Maroc"
        description="Consultez nos opportunités de carrière chez ORSAP au Maroc : Technico-commerciaux, Logistique, Achats industriels et candidatures spontanées."
        keywords={[
          "recrutement ORSAP Maroc",
          "emploi technico-commercial Casablanca",
          "carrière distribution industrielle",
          "stage PFE industrie Maroc"
        ]}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Recrutement", url: "/recrutement" }
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
            <span className="text-white">Recrutement</span>
          </nav>
          <div className="flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-safety">
            <span className="h-px w-8 bg-safety" />
            Nous recrutons
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em] text-white">
            Rejoignez l&apos;équipe ORSAP.
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-white/80">
            Développez votre carrière au sein d&apos;une entreprise dynamique spécialisée dans
            l&apos;import et la distribution de solutions techniques et d&apos;équipements pour les industries au Maroc.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="border border-safety/30 bg-safety/5 p-8 text-center sm:p-12">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-safety text-white text-[24px]">
                  ✓
                </div>
                <h2 className="mt-6 font-display text-[22px] font-bold text-ink">
                  Candidature envoyée avec succès !
                </h2>
                <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
                  Merci pour l&apos;intérêt que vous portez à ORSAP. Notre équipe des ressources humaines
                  étudiera votre CV et vous contactera dans les plus brefs délais si votre profil correspond
                  à nos besoins actuels.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-8 inline-block bg-ink px-6 py-3 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-paper transition-colors hover:bg-orsap-red"
                >
                  Envoyer une autre candidature
                </button>
              </div>
            ) : (
              <div className="border border-hairline bg-card p-6 sm:p-10">
                <h2 className="font-display text-[22px] font-black tracking-[-0.01em] text-ink">
                  Déposer votre candidature
                </h2>
                <p className="mt-2 text-[14px] text-ink-soft">
                  Remplissez le formulaire ci-dessous et joignez votre CV pour postuler.
                </p>

                {error && (
                  <div className="mt-6 border-l-2 border-orsap-red bg-orsap-red/5 p-4 text-[14px] font-medium text-orsap-red">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
                      Nom complet *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Ex: Mohamed Tazi"
                      className="mt-2 w-full border border-hairline bg-white px-4 py-3 text-[14.5px] outline-none transition-colors focus:border-orsap-red"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
                        Adresse e-mail *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="Ex: contact@email.com"
                        className="mt-2 w-full border border-hairline bg-white px-4 py-3 text-[14.5px] outline-none transition-colors focus:border-orsap-red"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
                        Téléphone *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="Ex: +212 6 00 00 00 00"
                        className="mt-2 w-full border border-hairline bg-white px-4 py-3 text-[14.5px] outline-none transition-colors focus:border-orsap-red"
                      />
                    </div>
                  </div>

                  {/* Position dropdown */}
                  <div>
                    <label htmlFor="position" className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
                      Poste ou domaine souhaité *
                    </label>
                    <select
                      id="position"
                      value={form.position}
                      onChange={(e) => update("position", e.target.value)}
                      className="mt-2 w-full border border-hairline bg-white px-4 py-3 text-[14.5px] outline-none transition-colors focus:border-orsap-red"
                    >
                      {POSITION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CV File Upload */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
                      Votre CV (PDF, DOC, DOCX) *
                    </label>
                    <div className="mt-2 flex flex-col items-center justify-center border border-dashed border-hairline bg-white px-6 py-8 text-center transition-colors hover:border-orsap-red">
                      <div className="font-mono text-xs font-bold text-orsap-red bg-paper px-2.5 py-1 border border-hairline">CV / PDF</div>
                      <div className="mt-3 text-[13.5px] font-semibold text-ink">
                        {form.cvName ? form.cvName : "Sélectionner un fichier"}
                      </div>
                      <div className="mt-1 text-[12px] text-ink-soft">
                        PDF, DOCX ou DOC jusqu&apos;à 10 Mo
                      </div>
                      <label className="mt-4 cursor-pointer bg-ink px-4 py-2 font-display text-[11.5px] font-bold uppercase tracking-[0.04em] text-white hover:bg-orsap-red">
                        Parcourir...
                        <input
                          type="file"
                          required={!form.cv}
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
                      Message ou lettre de motivation (optionnel)
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Présentez-vous brièvement ou indiquez vos disponibilités..."
                      className="mt-2 w-full border border-hairline bg-white px-4 py-3 text-[14.5px] outline-none transition-colors focus:border-orsap-red"
                    />
                  </div>

                  {/* Consent checkbox */}
                  <div className="flex items-start gap-3 rounded-lg border border-hairline bg-paper p-3.5">
                    <input
                      id="recrutement-consent"
                      type="checkbox"
                      required
                      className="mt-1 size-4 shrink-0 rounded accent-orsap-red focus-visible:ring-2 focus-visible:ring-orsap-red cursor-pointer"
                    />
                    <label htmlFor="recrutement-consent" className="text-xs leading-relaxed text-ink-soft select-none cursor-pointer">
                      J&apos;autorise ORSAP SARL à traiter mes données personnelles et mon CV dans le cadre du processus de recrutement et de constitution d&apos;un vivier de talents, conformément à la{" "}
                      <Link to="/politique-de-confidentialite" target="_blank" className="font-semibold text-orsap-red underline hover:text-orsap-red-deep">
                        Politique de Confidentialité
                      </Link>{" "}
                      (Loi 09-08 / CNDP).
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-orsap-red py-4 text-center font-display text-[14px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-orsap-red-deep disabled:bg-orsap-red/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orsap-red focus-visible:ring-offset-2"
                  >
                    {sending ? "Envoi en cours..." : "Soumettre ma candidature"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right: Speculative and values */}
          <div className="lg:col-span-5 space-y-8">
            <div className="border border-hairline bg-paper p-8">
              <h3 className="font-display text-[18px] font-bold text-ink">
                Pourquoi travailler chez ORSAP ?
              </h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-ink-soft">
                Chez ORSAP, nous croyons que notre force réside dans nos collaborateurs. Nous offrons
                un cadre de travail stimulant où chaque membre de l&apos;équipe peut exprimer son plein potentiel.
              </p>

              <ul className="mt-6 space-y-4">
                <li className="flex gap-3">
                  <div className="text-orsap-red font-bold">✓</div>
                  <div>
                    <h4 className="text-[14px] font-bold text-ink">Croissance Professionnelle</h4>
                    <p className="text-[13px] text-ink-soft mt-0.5">
                      Opportunités de développement de carrière et formation continue.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="text-orsap-red font-bold">✓</div>
                  <div>
                    <h4 className="text-[14px] font-bold text-ink">Environnement Collaboratif</h4>
                    <p className="text-[13px] text-ink-soft mt-0.5">
                      Une équipe soudée, à l&apos;écoute et axée sur l&apos;entraide.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="text-orsap-red font-bold">✓</div>
                  <div>
                    <h4 className="text-[14px] font-bold text-ink">Esprit d&apos;Innovation</h4>
                    <p className="text-[13px] text-ink-soft mt-0.5">
                      Nous encourageons l&apos;initiative et l&apos;amélioration de nos processus.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="border border-hairline bg-card p-8">
              <h3 className="font-display text-[18px] font-bold text-ink">
                Candidature directe
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-ink-soft">
                Vous préférez postuler directement par e-mail ? Envoyez votre CV et lettre de motivation
                à l&apos;adresse suivante en précisant le poste souhaité en objet :
              </p>

              <div className="mt-6 space-y-3 font-display">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft">
                    E-mail RH
                  </span>
                  <a href="mailto:rh@orsap.ma" className="text-[16px] font-bold text-orsap-red hover:underline">
                    rh@orsap.ma
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
