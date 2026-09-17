import { useState } from "react"
import { Link, useSearchParams } from "react-router"
import SEO from "@/components/SEO"
import {
  trackFormStart,
  trackGenerateLead,
  trackPhoneClick,
  trackWhatsAppClick,
  trackEmailClick,
} from "@/utils/analytics"
import { classifyLead, getStoredAttribution } from "@/utils/attribution"

const CONTACT_SEO_CLUSTERS = [
  "Achats EPI",
  "Arc électrique",
  "Culture sécurité",
  "Digitalisation",
  "EPI intelligents",
  "Efforts physiques",
  "Espaces confinés",
  "IA",
  "IA prévention",
  "IoT",
  "Port des EPI",
  "Risque chimique",
  "Vêtements connectés",
]

const CONTACT_ARTICLES = [
  { id: "ART-036", title: "Optimiser les achats d'EPI en entreprise : TCO, groupement et négociation", excerpt: "Stratégies d'achat pour réduire vos coûts tout en élevant le niveau de protection.", clusters: ["Achats EPI"], readTime: "6 min" },
  { id: "ART-044", title: "Risque chimique en industrie : Fiches de Données de Sécurité (FDS) et EPI", excerpt: "Conformité REACH/CLP, stockage des produits dangereux et gants adaptés.", clusters: ["Risque chimique"], readTime: "6 min" },
  { id: "ART-046", title: "Protection contre le risque d'arc électrique : Normes IEC 61482 et vêtements ATPV", excerpt: "Sélection des casques avec écran facial et tenues antistatiques pour électriciens.", clusters: ["Arc électrique"], readTime: "7 min" },
  { id: "ART-048", title: "Sécurité lors des interventions en espaces confinés : Détecteurs et ventilation", excerpt: "Procédures CATEC, trépieds d'ancrage et surveillance continue des gaz.", clusters: ["Espaces confinés"], readTime: "6 min" },
  { id: "ART-055", title: "Digitalisation des processus QHSE : Logiciels, tablettes et remontées terrain", excerpt: "Comment automatiser les rapports d'incidents et le suivi des non-conformités.", clusters: ["Digitalisation"], readTime: "5 min" },
  { id: "ART-056", title: "Intelligence Artificielle et vision par ordinateur pour la détection du port des EPI", excerpt: "Caméras intelligentes d'atelier pour alerter sur l'absence de casque ou gilet fluo.", clusters: ["IA", "IA prévention"], readTime: "6 min" },
  { id: "ART-057", title: "Objets connectés (IoT) et sécurité au travail : Capteurs de gaz et bracelets DATI", excerpt: "Protection des travailleurs isolés (PTI/DATI) et géolocalisation d'urgence.", clusters: ["IoT", "EPI intelligents"], readTime: "5 min" },
  { id: "ART-058", title: "Vêtements professionnels connectés : Suivi des constantes et de la chaleur", excerpt: "Textiles intelligents régulant la température et détectant les coups de chaleur.", clusters: ["Vêtements connectés"], readTime: "5 min" },
  { id: "ART-059", title: "L'intelligence artificielle au service de l'analyse prédictive des accidents", excerpt: "Anticiper les pics d'accidents grâce aux données historiques et à la météo.", clusters: ["IA", "IA prévention"], readTime: "6 min" },
  { id: "ART-060", title: "Exosquelettes industriels passifs : Soulager les efforts physiques lombaires", excerpt: "Retour d'expérience sur l'intégration des exosquelettes en logistique et tôlerie.", clusters: ["Efforts physiques"], readTime: "7 min" },
  { id: "ART-061", title: "Développer une culture de sécurité juste et apprenante dans l'entreprise", excerpt: "Passer de la sanction à la coopération pour élever les standards HSE.", clusters: ["Culture sécurité"], readTime: "5 min" },
  { id: "ART-063", title: "Sensibilisation et communication interne : Les clés de l'adhésion aux EPI", excerpt: "Affichages percutants, vidéos de témoignages et challenges sécurité.", clusters: ["Port des EPI"], readTime: "4 min" },
  { id: "ART-071", title: "La maintenance prédictive des équipements de sécurité grâce aux capteurs IoT", excerpt: "Contrôler l'usure des harnais, filtres respiratoires et filets antichute en temps réel.", clusters: ["IoT", "EPI intelligents"], readTime: "6 min" }
]

export default function Contact() {
  const [searchParams] = useSearchParams()
  const initialSubject = searchParams.get("subject") || ""

  const [formStarted, setFormStarted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    subject: initialSubject || "Conseil technique & audit de sécurité",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const PHONE_DISPLAY = "+212 6 44 20 30 30"
  const PHONE_HREF = "tel:+212644203030"
  const WHATSAPP_DISPLAY = "+212 6 44 20 30 30"
  const WHATSAPP_HREF = "https://wa.me/212644203030"
  const EMAIL_DISPLAY = "orsap@orsap.ma"
  const EMAIL_HREF = "mailto:orsap@orsap.ma"
  const ADDRESS = "Casablanca, Maroc"
  const MAP_HREF =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("ORSAP Casablanca Maroc")

  const handleInputChange = (field: string, value: string) => {
    if (!formStarted) {
      setFormStarted(true)
      trackFormStart("contact")
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const leadType = classifyLead({
      formType: "contact",
      category: formData.subject,
      message: formData.message,
    })
    const attribution = getStoredAttribution()

    try {
      await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.name,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          category: formData.subject,
          details: formData.message,
          type: "Demande de contact / Conseil",
          leadType,
          attribution,
        }),
      })

      trackGenerateLead({
        formName: "contact",
        leadType,
        company: formData.company,
      })
    } catch {}
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div>
      <SEO
        title="Contactez nos Experts & Conseil Technique | ORSAP Maroc"
        description="Besoin d'un accompagnement technique pour vos EPI, audit de travail en hauteur ou devis d'équipements industriels ? Contactez les équipes ORSAP à Casablanca."
        keywords={[
          "contact ORSAP Maroc",
          "conseil technique EPI Casablanca",
          "expert sécurité travail en hauteur",
          "fournisseur industriel contact",
          "téléphone ORSAP"
        ]}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Contact", url: "/contact" }
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
            <span className="text-white">Contact &amp; Conseil</span>
          </nav>
          <div className="flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-safety">
            <span className="h-px w-8 bg-safety" />
            Contact &amp; Expertise Technique
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em] text-white">
            Nous sommes à votre écoute.
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-white/80">
            Une question technique sur vos EPI ? Un projet de travail en hauteur, risque chimique ou digitalisation HSE ? Nos experts basés à Casablanca vous répondent sous 24h.
          </p>

          {/* SEO Clusters Cloud */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-white/60">
              Expertises couvertes :
            </span>
            {CONTACT_SEO_CLUSTERS.slice(0, 8).map((cluster, idx) => (
              <span
                key={idx}
                className="rounded-full bg-safety/20 text-safety px-3 py-1 text-[11.5px] font-semibold"
              >
                #{cluster}
              </span>
            ))}
            <span className="text-[11.5px] text-white/60">+{CONTACT_SEO_CLUSTERS.length - 8} autres</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        {/* Contact channels cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Card 1: Phone */}
          <div className="flex flex-col border border-hairline bg-card p-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Du lundi au samedi · 8h – 18h
            </div>
            <h2 className="mt-4 font-display text-[22px] font-black tracking-[-0.01em] text-ink">
              Par téléphone
            </h2>
            <p className="mt-2 text-[14.5px] leading-[1.5] text-ink-soft">
              Pour joindre directement l&apos;un de nos ingénieurs commerciaux ou experts EPI.
            </p>
            <div className="mt-6 flex-1 font-display text-[20px] font-bold text-orsap-red">
              {PHONE_DISPLAY}
            </div>
            <a
              href={PHONE_HREF}
              onClick={() => trackPhoneClick(PHONE_DISPLAY, "contact_page_card")}
              className="mt-8 inline-flex items-center justify-center border border-ink px-6 py-3.5 font-display text-[13.5px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Appeler le standard
            </a>
          </div>

          {/* Card 2: WhatsApp */}
          <div className="flex flex-col border border-orsap-red bg-card p-8 shadow-sm">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-orsap-red font-bold">
              Réponse Rapide
            </div>
            <h2 className="mt-4 font-display text-[22px] font-black tracking-[-0.01em] text-ink">
              WhatsApp Direct
            </h2>
            <p className="mt-2 text-[14.5px] leading-[1.5] text-ink-soft">
              Envoyez vos photos de pièces, fiches techniques ou besoins urgents directement sur WhatsApp.
            </p>
            <div className="mt-6 flex-1 font-display text-[20px] font-bold text-orsap-red">
              {WHATSAPP_DISPLAY}
            </div>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("contact_page_card")}
              className="mt-8 inline-flex items-center justify-center bg-orsap-red px-6 py-3.5 font-display text-[13.5px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep"
            >
              Écrire sur WhatsApp
            </a>
          </div>

          {/* Card 3: Email */}
          <div className="flex flex-col border border-hairline bg-card p-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Cahiers des charges
            </div>
            <h2 className="mt-4 font-display text-[22px] font-black tracking-[-0.01em] text-ink">
              Par email
            </h2>
            <p className="mt-2 text-[14.5px] leading-[1.5] text-ink-soft">
              Pour nous transmettre vos appels d&apos;offres, documents uniques ou listes de références.
            </p>
            <div className="mt-6 flex-1 font-display text-[20px] font-bold text-orsap-red">
              {EMAIL_DISPLAY}
            </div>
            <a
              href={EMAIL_HREF}
              onClick={() => trackEmailClick(EMAIL_DISPLAY, "contact_page_card")}
              className="mt-8 inline-flex items-center justify-center border border-ink px-6 py-3.5 font-display text-[13.5px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Envoyer un email
            </a>
          </div>
        </div>

        {/* Advisory Form & Address Grid */}
        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          {/* Direct Technical Form */}
          <div className="lg:col-span-7 border border-hairline bg-card p-8 sm:p-10 rounded-lg">
            <div className="mb-6">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-orsap-red">
                Formulaire Direct
              </span>
              <h3 className="font-display text-[24px] font-black text-ink mt-1">
                Envoyer un message à un expert technique
              </h3>
              <p className="text-[14px] text-ink-soft mt-1">
                Remplissez ce formulaire pour recevoir un conseil ou une proposition personnalisée sous 24h.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-8 text-center rounded-md">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 uppercase tracking-wider inline-block mb-3">
                  Message Envoyé
                </span>
                <h4 className="font-display text-[20px] font-bold text-emerald-900 mb-2">
                  Votre demande a bien été transmise
                </h4>
                <p className="text-[14px] text-emerald-700">
                  Un ingénieur technique ORSAP prendra contact avec vous dans les plus brefs délais.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 inline-flex bg-ink px-6 py-2.5 text-[13px] font-bold text-white uppercase tracking-wider hover:bg-orsap-red"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-bold text-ink mb-1.5">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ex: Yassine Bennani"
                      className="w-full border border-hairline bg-paper px-4 py-3 text-[14px] text-ink focus:border-orsap-red focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-ink mb-1.5">
                      Entreprise / Raison sociale *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="Ex: Société Industrielle SA"
                      className="w-full border border-hairline bg-paper px-4 py-3 text-[14px] text-ink focus:border-orsap-red focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-bold text-ink mb-1.5">
                      Email professionnel *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="contact@entreprise.ma"
                      className="w-full border border-hairline bg-paper px-4 py-3 text-[14px] text-ink focus:border-orsap-red focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-ink mb-1.5">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+212 6..."
                      className="w-full border border-hairline bg-paper px-4 py-3 text-[14px] text-ink focus:border-orsap-red focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-ink mb-1.5">
                    Thématique de la demande
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className="w-full border border-hairline bg-paper px-4 py-3 text-[14px] text-ink focus:border-orsap-red focus:outline-none"
                  >
                    <option>Conseil technique &amp; audit de sécurité</option>
                    <option>EPI &amp; Protection Individuelle</option>
                    <option>Travail en Hauteur &amp; Antichute</option>
                    <option>Manutention &amp; Levage</option>
                    <option>Personnalisation de Vêtements de Travail</option>
                    <option>Autre demande commerciale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-ink mb-1.5">
                    Votre message / Description du besoin *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Précisez votre environnement de travail, les risques identifiés, le nombre d'opérateurs concernés..."
                    className="w-full border border-hairline bg-paper px-4 py-3 text-[14px] text-ink focus:border-orsap-red focus:outline-none"
                  />
                </div>

                {/* Consent checkbox */}
                <div className="flex items-start gap-3 rounded-lg border border-hairline bg-paper p-3.5">
                  <input
                    id="contact-consent"
                    type="checkbox"
                    required
                    className="mt-1 size-4 shrink-0 rounded accent-orsap-red focus-visible:ring-2 focus-visible:ring-orsap-red cursor-pointer"
                  />
                  <label htmlFor="contact-consent" className="text-xs leading-relaxed text-ink-soft select-none cursor-pointer">
                    J&apos;accepte que les informations saisies soient traitées par ORSAP SARL afin de répondre à ma demande d&apos;information ou de conseil, conformément à la{" "}
                    <Link to="/politique-de-confidentialite" target="_blank" className="font-semibold text-orsap-red underline hover:text-orsap-red-deep">
                      Politique de Confidentialité
                    </Link>{" "}
                    (Loi 09-08 / CNDP).
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orsap-red py-4 text-center font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orsap-red focus-visible:ring-offset-2"
                >
                  {loading ? "Envoi en cours..." : "Transmettre ma demande"}
                </button>
              </form>
            )}
          </div>

          {/* Location & Commitments */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-hairline bg-card p-8 rounded-lg">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                Siège &amp; Stock Central
              </div>
              <h3 className="mt-2 font-display text-[22px] font-black text-ink">
                Nos installations à Casablanca
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                Nos bureaux et entrepôts sont stratégiquement implantés à Casablanca pour assurer des expéditions express dans toutes les régions du Maroc (Tanger, Rabat, Fès, Marrakech, Agadir, Oujda).
              </p>
              <div className="mt-5 text-[16px] font-bold text-ink flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-orsap-red bg-card px-2 py-0.5 border border-hairline">ADRESSE</span>
                <span>{ADDRESS}</span>
              </div>
              <a
                href={MAP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center bg-ink py-3.5 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-paper transition-colors hover:bg-orsap-red hover:text-white"
              >
                Itinéraire Google Maps
              </a>
            </div>

            <div className="border border-hairline bg-paper p-8 rounded-lg">
              <h4 className="font-display text-[14px] font-bold uppercase tracking-wider text-ink mb-4">
                Tous les clusters d&apos;expertise ORSAP :
              </h4>
              <div className="flex flex-wrap gap-2">
                {CONTACT_SEO_CLUSTERS.map((cluster, idx) => (
                  <span
                    key={idx}
                    className="border border-hairline bg-card px-2.5 py-1 text-[12px] font-medium text-ink-soft"
                  >
                    {cluster}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Editorial Articles Grid */}
        <div className="mt-20 border-t border-hairline pt-14">
          <div className="mb-8">
            <div className="text-[12px] font-bold uppercase tracking-wider text-orsap-red">
              Bibliothèque Technique
            </div>
            <h2 className="font-display text-[26px] font-black text-ink mt-1">
              Guides d&apos;Achat, Réglementation &amp; Innovations HSE
            </h2>
            <p className="text-[15px] text-ink-soft mt-2 max-w-3xl">
              Consultez nos articles de fond rédigés par nos experts pour vous guider dans vos décisions d&apos;achats, d&apos;audits et de digitalisation de la prévention.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CONTACT_ARTICLES.map((art) => (
              <div
                key={art.id}
                className="flex flex-col justify-between border border-hairline bg-card p-6 transition-all hover:border-orsap-red hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-orsap-red bg-paper px-2 py-0.5 border border-hairline">
                      {art.id}
                    </span>
                    <span className="text-[12px] text-ink-soft">{art.readTime} de lecture</span>
                  </div>
                  <h3 className="font-display text-[16px] font-bold text-ink leading-snug mb-2">
                    {art.title}
                  </h3>
                  <p className="text-[13.5px] text-ink-soft leading-relaxed mb-4">
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
                  <button
                    onClick={() => {
                      setFormData({ ...formData, subject: art.title })
                      window.scrollTo({ top: 400, behavior: "smooth" })
                    }}
                    className="text-[12px] font-bold text-orsap-red hover:underline"
                  >
                    Questionner l&apos;expert →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
