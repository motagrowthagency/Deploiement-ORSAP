import { useState, useEffect, useId } from "react"
import { Link, useNavigate } from "react-router"
import { useCart, CartLine } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"

function formatMAD(amount: number) {
  return `${amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
}

export default function GlobalCartDrawer() {
  const {
    cart,
    cartItems,
    totalCount,
    totalHt,
    totalTva,
    totalTtc,
    contactDetails,
    updateContactField,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateQuantity,
    updateItemNotes,
    removeFromCart,
    addCustomArticle,
    clearCart,
  } = useCart()

  const { user, token } = useAuth()
  const navigate = useNavigate()

  // Item inline notes editor state
  const [editingNoteCode, setEditingNoteCode] = useState<string | null>(null)
  const [tempItemNote, setTempItemNote] = useState("")

  // Custom Article Form State inside Drawer
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customQty, setCustomQty] = useState(1)
  const [customNotes, setCustomNotes] = useState("")

  // Order Submission State
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const guestNameId = useId()
  const guestCompanyId = useId()
  const guestEmailId = useId()
  const guestPhoneId = useId()
  const guestCityId = useId()
  const orderNotesId = useId()
  const customNameId = useId()
  const customQtyId = useId()
  const customNotesId = useId()

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cartDrawerOpen) {
        setCartDrawerOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [cartDrawerOpen, setCartDrawerOpen])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [cartDrawerOpen])

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName.trim()) return
    addCustomArticle(customName, customQty, customNotes)
    setCustomName("")
    setCustomQty(1)
    setCustomNotes("")
    setShowCustomForm(false)
  }

  const handleSaveItemNote = (code: string) => {
    updateItemNotes(code, tempItemNote.trim())
    setEditingNoteCode(null)
    setTempItemNote("")
  }

  // Generate WhatsApp Direct Quote Request Link
  const getWhatsAppQuoteUrl = () => {
    const phone = "212644203030"
    const clientHeader = user
      ? `👤 Client : ${user.name} (${user.company ? user.company + " - " : ""}${user.phone || user.email})`
      : contactDetails.name || contactDetails.phone
        ? `👤 Client : ${contactDetails.name || "Visiteur"} (${contactDetails.company ? contactDetails.company + " - " : ""}${contactDetails.phone || contactDetails.email || "Sans contact"})`
        : "👤 Demande Express Catalogue ORSAP"

    const itemsText = cartItems
      .map((it, idx) => {
        const spec = it.notes ? ` [Détail : ${it.notes}]` : ""
        return `${idx + 1}. [${it.code}] ${it.designation}${spec} — Qté : ${it.quantity}${
          it.priceHt > 0 ? ` (${formatMAD(it.priceHt * it.quantity)} HT)` : ""
        }`
      })
      .join("\n")

    const totalText = totalHt > 0 ? `\n\n💰 Total estimatif : ${formatMAD(totalHt)} HT (${formatMAD(totalTtc)} TTC)` : ""
    const noteText = contactDetails.notes?.trim() ? `\n📝 Instructions : ${contactDetails.notes.trim()}` : ""

    const fullMessage = `Bonjour ORSAP Maroc,\n\nJe souhaite obtenir un devis / chiffrage officiel pour la sélection d'articles suivante :\n\n${clientHeader}\n\n📦 Articles sélectionnés (${totalCount}) :\n${itemsText}${totalText}${noteText}\n\nMerci de me recontacter.`

    return `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`
  }

  // Handle Official Devis Submission
  const handleSubmitDevis = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cartItems.length === 0) return

    // If guest, validate minimum contact details
    if (!user && !contactDetails.phone.trim() && !contactDetails.email.trim()) {
      setSubmitError("Veuillez renseigner au moins un numéro de téléphone ou un email pour recevoir votre devis.")
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const payload = {
        clientType: user ? user.clientType : contactDetails.company ? "professional" : "individual",
        name: user ? user.name : contactDetails.name.trim() || "Visiteur En Ligne",
        company: user ? user.company : contactDetails.company.trim() || null,
        email: user ? user.email : contactDetails.email.trim() || null,
        phone: user ? user.phone : contactDetails.phone.trim() || "0600000000",
        note: contactDetails.notes?.trim() || undefined,
        items: cartItems.map((i) => ({
          code: i.code,
          designation: i.designation,
          priceHt: i.priceHt,
          priceTtc: i.priceTtc,
          quantity: i.quantity,
          isCustom: i.isCustom,
          notes: i.notes,
        })),
      }

      const res = await fetch("/api/devis-catalogue", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de l'enregistrement de votre demande.")
      }

      const ref = data.reference || data.id || `DEV-${Date.now().toString(36).toUpperCase()}`
      setSubmitSuccess(ref)
      clearCart()

      // Dispatch reactivity event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("orsap:devis-created", {
            detail: { id: ref, reference: ref, items: cartItems },
          })
        )
      }
    } catch (err: any) {
      setSubmitError(err.message || "Une erreur est survenue lors de l'envoi.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!cartDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setCartDrawerOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-paper shadow-2xl border-l border-hairline animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-orsap-red/10 text-orsap-red grid place-items-center font-bold">
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg font-black text-ink flex items-center gap-2">
                Panier de Devis B2B
                {totalCount > 0 && (
                  <span className="rounded-full bg-orsap-red px-2 py-0.5 text-[11px] font-mono font-bold text-white">
                    {totalCount}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-ink-soft">
                {user ? `Connecté : ${user.name}` : "Sélection d'articles & chiffrage express"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCartDrawerOpen(false)}
            className="size-9 rounded-lg border border-hairline bg-paper text-ink-soft hover:text-ink hover:bg-slate-100 grid place-items-center transition cursor-pointer"
            aria-label="Fermer le panier"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Submission Success Screen */}
          {submitSuccess ? (
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-6 text-center space-y-4 animate-in zoom-in-95">
              <div className="mx-auto size-14 rounded-full bg-emerald-600 text-white grid place-items-center shadow-lg shadow-emerald-600/20">
                <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-xl font-black text-emerald-950">
                  Demande de Devis Transmise !
                </h3>
                <p className="mt-1 font-mono text-sm font-bold text-emerald-800">
                  Référence : {submitSuccess}
                </p>
                <p className="mt-2 text-xs text-emerald-900 leading-relaxed max-w-sm mx-auto">
                  Notre équipe commerciale a bien reçu votre sélection et prépare votre chiffrage officiel avec nos meilleures conditions tarifaires.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href={`https://wa.me/212644203030?text=${encodeURIComponent(
                    `Bonjour ORSAP, je viens de déposer la demande de devis réf ${submitSuccess} sur votre site.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  💬 Suivi express sur WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitSuccess(null)
                    setCartDrawerOpen(false)
                    if (user) navigate("/espace-client?tab=devis")
                  }}
                  className="rounded-xl border border-emerald-600/30 bg-white px-4 py-2.5 text-xs font-bold text-emerald-950 hover:bg-emerald-50 transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty State */
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-hairline bg-card p-8 text-center space-y-4">
                <div className="mx-auto size-14 rounded-2xl bg-orsap-red/10 text-orsap-red grid place-items-center">
                  <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    Votre panier est actuellement vide
                  </h3>
                  <p className="mt-1 text-xs text-ink-soft max-w-xs mx-auto">
                    Sélectionnez des articles parmi nos 48 000+ références certifiées ou ajoutez un équipement sur-mesure.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/espace-client"
                    onClick={() => setCartDrawerOpen(false)}
                    className="rounded-xl bg-orsap-red px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orsap-red/20 hover:bg-orsap-red-deep transition"
                  >
                    Ouvrir le Catalogue &amp; Boutique B2B →
                  </Link>
                  {!showCustomForm && (
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(true)}
                      className="rounded-xl border border-hairline bg-paper px-4 py-2.5 text-xs font-semibold text-ink hover:bg-slate-50 transition cursor-pointer"
                    >
                      + Ajouter une référence sur mesure
                    </button>
                  )}
                </div>
              </div>

              {showCustomForm && (
                <form onSubmit={handleAddCustom} className="rounded-xl border border-hairline bg-card p-4 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-ink">
                      Référence sur-mesure / Hors catalogue
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="text-xs text-ink-soft hover:text-ink cursor-pointer"
                    >
                      ✕ Annuler
                    </button>
                  </div>
                  <div>
                    <label htmlFor={customNameId} className="block text-[11px] font-bold text-ink-soft uppercase mb-1">
                      Désignation de l&apos;article *
                    </label>
                    <input
                      id={customNameId}
                      type="text"
                      required
                      autoFocus
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Ex: Harnais antichute avec longe spécifique 3m"
                      className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-xs text-ink focus:border-orsap-red focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label htmlFor={customQtyId} className="block text-[11px] font-bold text-ink-soft uppercase mb-1">
                        Quantité
                      </label>
                      <input
                        id={customQtyId}
                        type="number"
                        min={1}
                        value={customQty}
                        onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-xs text-ink focus:border-orsap-red focus:outline-hidden"
                      />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor={customNotesId} className="block text-[11px] font-bold text-ink-soft uppercase mb-1">
                        Spécifications / Taille (optionnel)
                      </label>
                      <input
                        id={customNotesId}
                        type="text"
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="Ex: Taille XL, Norme EN 361"
                        className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-xs text-ink focus:border-orsap-red focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-ink py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-orsap-red transition cursor-pointer"
                  >
                    Ajouter au panier
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Active Items List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Articles Sélectionnés ({cartItems.length})
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    ✓ Mémorisé
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] font-semibold text-orsap-red hover:underline cursor-pointer"
                >
                  Vider le panier
                </button>
              </div>

              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.code}
                    className="rounded-xl border border-hairline bg-card p-3.5 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="size-11 rounded-lg bg-paper border border-hairline grid place-items-center shrink-0 overflow-hidden font-bold text-xs text-ink-soft">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.designation} className="size-full object-cover" />
                          ) : item.isCustom ? (
                            "⚙️"
                          ) : (
                            "EPI"
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-orsap-red uppercase">
                              {item.code}
                            </span>
                            {item.rayon && (
                              <span className="text-[10px] text-ink-soft bg-paper px-1.5 py-0.5 rounded border border-hairline">
                                {item.rayon}
                              </span>
                            )}
                          </div>
                          <h4 className="font-display text-xs font-bold text-ink truncate mt-0.5">
                            {item.designation}
                          </h4>
                          <div className="mt-1 font-mono text-[11px] font-semibold text-ink">
                            {item.priceHt > 0 ? (
                              <span>
                                {formatMAD(item.priceHt)} HT{" "}
                                <span className="text-[10px] text-ink-soft font-normal">
                                  ({formatMAD(item.priceHt * item.quantity)} HT)
                                </span>
                              </span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                Sur devis spécial
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.code)}
                          className="text-ink-soft hover:text-orsap-red p-1 cursor-pointer"
                          title="Supprimer l'article"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        <div className="flex items-center rounded-lg border border-hairline bg-paper p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.code, item.quantity - 1)}
                            className="size-6 rounded bg-card text-ink font-bold hover:bg-slate-200 grid place-items-center text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-bold text-ink px-2">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.code, item.quantity + 1)}
                            className="size-6 rounded bg-orsap-red text-white font-bold hover:bg-orsap-red-deep grid place-items-center text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Item Specification / Note Editor */}
                    <div className="border-t border-hairline/60 pt-2 text-[11px]">
                      {editingNoteCode === item.code ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            autoFocus
                            value={tempItemNote}
                            onChange={(e) => setTempItemNote(e.target.value)}
                            placeholder="Ex: Taille 43, Coloris Bleu Marine, Spécification..."
                            className="flex-1 rounded border border-orsap-red/60 bg-paper px-2 py-1 text-xs text-ink focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveItemNote(item.code)}
                            className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteCode(null)
                              setTempItemNote("")
                            }}
                            className="rounded bg-slate-200 px-2 py-1 text-xs text-ink hover:bg-slate-300 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 text-ink-soft">
                          <span className="truncate italic">
                            {item.notes ? `📝 ${item.notes}` : "Aucune précision de taille/norme"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteCode(item.code)
                              setTempItemNote(item.notes || "")
                            }}
                            className="text-orsap-red hover:underline shrink-0 font-semibold cursor-pointer"
                          >
                            {item.notes ? "Modifier" : "+ Préciser taille / options"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Item Toggle */}
              {!showCustomForm ? (
                <button
                  type="button"
                  onClick={() => setShowCustomForm(true)}
                  className="w-full rounded-xl border border-dashed border-hairline py-2.5 text-center text-xs font-semibold text-ink-soft hover:text-orsap-red hover:border-orsap-red/50 transition cursor-pointer"
                >
                  + Ajouter un équipement ou une référence hors-catalogue
                </button>
              ) : (
                <form onSubmit={handleAddCustom} className="rounded-xl border border-hairline bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-ink">
                      Référence sur-mesure / Hors catalogue
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="text-xs text-ink-soft hover:text-ink cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                  <div>
                    <label htmlFor={customNameId} className="block text-[11px] font-bold text-ink-soft uppercase mb-1">
                      Désignation de l&apos;article *
                    </label>
                    <input
                      id={customNameId}
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Ex: Harnais antichute avec longe spécifique 3m"
                      className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-xs text-ink focus:border-orsap-red focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label htmlFor={customQtyId} className="block text-[11px] font-bold text-ink-soft uppercase mb-1">
                        Quantité
                      </label>
                      <input
                        id={customQtyId}
                        type="number"
                        min={1}
                        value={customQty}
                        onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-xs text-ink focus:border-orsap-red focus:outline-hidden"
                      />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor={customNotesId} className="block text-[11px] font-bold text-ink-soft uppercase mb-1">
                        Spécifications (taille, norme...)
                      </label>
                      <input
                        id={customNotesId}
                        type="text"
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="Ex: Taille XL, Norme EN 361"
                        className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-xs text-ink focus:border-orsap-red focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-ink py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-orsap-red transition cursor-pointer"
                  >
                    Ajouter au panier
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Pricing Summary */}
          {cartItems.length > 0 && !submitSuccess && (
            <div className="rounded-xl border border-hairline bg-card p-4 space-y-2">
              <div className="flex justify-between text-xs text-ink-soft">
                <span>Total HT estimatif :</span>
                <span className="font-mono font-bold text-ink">{formatMAD(totalHt)}</span>
              </div>
              <div className="flex justify-between text-xs text-ink-soft">
                <span>TVA (20%) :</span>
                <span className="font-mono font-bold text-ink">{formatMAD(totalTva)}</span>
              </div>
              <div className="border-t border-hairline pt-2 flex justify-between font-display text-sm font-black text-ink">
                <span>Total TTC :</span>
                <span className="font-mono text-orsap-red">{formatMAD(totalTtc)}</span>
              </div>
              <p className="text-[10px] text-ink-soft italic pt-1">
                * Tarifs indicatifs HT soumis aux remises commerciales grands comptes et volume.
              </p>
            </div>
          )}

          {/* Contact / Client Dossier Form with Automatic Persistence */}
          {cartItems.length > 0 && !submitSuccess && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                    {user ? "Coordonnées du Compte Client" : "Vos Coordonnées (Mémorisées)"}
                  </span>
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                {!user && (
                  <Link
                    to="/espace-client"
                    onClick={() => setCartDrawerOpen(false)}
                    className="text-[11px] font-semibold text-orsap-red hover:underline"
                  >
                    Déjà un compte ? Se connecter
                  </Link>
                )}
              </div>

              {user ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      Dossier Client : {user.name}
                    </span>
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono">
                      Compte Certifié
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900">
                    {user.company ? `${user.company} · ` : ""}{user.email} · {user.phone || "Téléphone non renseigné"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label htmlFor={guestNameId} className="block text-[11px] font-bold text-ink-soft mb-1">
                      Nom &amp; Prénom <span className="text-orsap-red">*</span>
                    </label>
                    <input
                      id={guestNameId}
                      type="text"
                      required
                      placeholder="Ex: Karim Alami"
                      value={contactDetails.name}
                      onChange={(e) => updateContactField("name", e.target.value)}
                      className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-ink focus:border-orsap-red focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label htmlFor={guestCompanyId} className="block text-[11px] font-bold text-ink-soft mb-1">
                      Entreprise / Raison Sociale
                    </label>
                    <input
                      id={guestCompanyId}
                      type="text"
                      placeholder="Ex: Somasteel BTP"
                      value={contactDetails.company}
                      onChange={(e) => updateContactField("company", e.target.value)}
                      className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-ink focus:border-orsap-red focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label htmlFor={guestPhoneId} className="block text-[11px] font-bold text-ink-soft mb-1">
                      Téléphone / WhatsApp <span className="text-orsap-red">*</span>
                    </label>
                    <input
                      id={guestPhoneId}
                      type="tel"
                      required
                      placeholder="06 XX XX XX XX"
                      value={contactDetails.phone}
                      onChange={(e) => updateContactField("phone", e.target.value)}
                      className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-ink focus:border-orsap-red focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label htmlFor={guestEmailId} className="block text-[11px] font-bold text-ink-soft mb-1">
                      Email Professionnel
                    </label>
                    <input
                      id={guestEmailId}
                      type="email"
                      placeholder="contact@entreprise.ma"
                      value={contactDetails.email}
                      onChange={(e) => updateContactField("email", e.target.value)}
                      className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-ink focus:border-orsap-red focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={guestCityId} className="block text-[11px] font-bold text-ink-soft mb-1">
                      Ville / Région de livraison
                    </label>
                    <input
                      id={guestCityId}
                      type="text"
                      placeholder="Ex: Casablanca, Tanger, Marrakech..."
                      value={contactDetails.city || ""}
                      onChange={(e) => updateContactField("city", e.target.value)}
                      className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-ink focus:border-orsap-red focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor={orderNotesId} className="block text-[11px] font-bold text-ink-soft mb-1">
                  Instructions ou Remarques Spécifiques (délais, chantier, personnalisation...)
                </label>
                <textarea
                  id={orderNotesId}
                  rows={2}
                  value={contactDetails.notes || ""}
                  onChange={(e) => updateContactField("notes", e.target.value)}
                  placeholder="Ex: Livraison souhaitée sur Casablanca sous 48h, marquage logo brodé sur les vestes..."
                  className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-xs text-ink focus:border-orsap-red focus:outline-hidden resize-none"
                />
              </div>

              {submitError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800">
                  {submitError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {cartItems.length > 0 && !submitSuccess && (
          <div className="border-t border-hairline bg-card p-5 space-y-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitDevis}
              className="w-full rounded-xl bg-orsap-red py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-orsap-red/25 hover:bg-orsap-red-deep transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Traitement en cours...</span>
                </>
              ) : (
                <>
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Valider &amp; Demander le Devis Officiel ({totalCount} réf.)</span>
                </>
              )}
            </button>

            <a
              href={getWhatsAppQuoteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-xl border border-emerald-600/30 bg-emerald-600/10 py-3 font-display text-xs font-bold uppercase tracking-wider text-emerald-900 hover:bg-emerald-600 hover:text-white transition flex items-center justify-center gap-2 text-center"
            >
              <span>💬 Demander un Chiffrage Express sur WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
