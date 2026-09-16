import { useEffect, useMemo, useRef, useState } from "react"
import {
  Article,
  Facets,
  fetchArticleFacets,
  searchArticles,
} from "@/utils/catalogueClient"

export interface CartLine {
  id: string
  code: string
  designation: string
  priceHt: number
  priceTtc: number
  quantity: number
  isCustom?: boolean
}

const PAGE_SIZE = 24

function formatMAD(n: number) {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
}

export default function CatalogueDevisBuilder({
  token,
  onSubmitted,
  onSessionExpired,
}: {
  token: string
  onSubmitted: () => void
  onSessionExpired: () => void
}) {
  const [query, setQuery] = useState("")
  const [rayon, setRayon] = useState("")
  const [famille, setFamille] = useState("")
  const [page, setPage] = useState(1)

  const [facets, setFacets] = useState<Facets>({ rayons: [], familles: [] })
  const [results, setResults] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Basket / Cart state
  const [cart, setCart] = useState<Record<string, CartLine>>({})
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Custom article modal state
  const [customModalOpen, setCustomModalOpen] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customQty, setCustomQty] = useState(1)
  const [customNotes, setCustomNotes] = useState("")

  const [mobileCartOpen, setMobileCartOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load category facets on mount
  useEffect(() => {
    fetchArticleFacets(token)
      .then((data) => {
        if (data && Array.isArray(data.rayons) && data.rayons.length > 0) {
          setFacets(data)
        }
      })
      .catch(() => {})
  }, [token])

  // Reset to page 1 whenever query or filters change
  useEffect(() => {
    setPage(1)
  }, [query, rayon, famille])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setSearchError(null)

      try {
        const data = await searchArticles({
          query,
          rayon,
          famille,
          page,
          pageSize: PAGE_SIZE,
          token,
        })
        setResults(data.items || [])
        setTotal(data.total || 0)
      } catch (err) {
        console.error("Erreur de recherche catalogue:", err)
        setSearchError("Impossible de charger les articles. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, rayon, famille, page, token])

  const availableFamilles = useMemo(() => {
    if (!rayon) return []
    return facets.familles.filter((f) => f.rayon === rayon)
  }, [facets.familles, rayon])

  const cartLines = useMemo(() => Object.values(cart), [cart])
  const totalHt = useMemo(
    () => cartLines.reduce((sum, l) => sum + (l.priceHt || 0) * l.quantity, 0),
    [cartLines]
  )
  const totalTtc = useMemo(
    () => cartLines.reduce((sum, l) => sum + (l.priceTtc || 0) * l.quantity, 0),
    [cartLines]
  )
  const totalTva = totalTtc - totalHt
  const cartItemCount = cartLines.reduce((sum, l) => sum + l.quantity, 0)

  function addToCart(article: Article, quantityToAdd = 1) {
    setCart((prev) => {
      const existing = prev[article.code]
      const newQty = (existing?.quantity || 0) + quantityToAdd
      return {
        ...prev,
        [article.code]: {
          id: article.code,
          code: article.code,
          designation: article.designation,
          priceHt: article.priceHt || (article.priceTtc > 0 ? article.priceTtc / 1.2 : 0),
          priceTtc: article.priceTtc || 0,
          quantity: newQty,
          isCustom: false,
        },
      }
    })
  }

  function setLineQuantity(key: string, qty: number) {
    setCart((prev) => {
      if (qty <= 0) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return {
        ...prev,
        [key]: { ...prev[key], quantity: qty },
      }
    })
  }

  function removeLine(key: string) {
    setCart((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function handleAddCustomArticle(e: React.FormEvent) {
    e.preventDefault()
    if (!customName.trim()) return
    const customKey = `custom_${Date.now()}`
    const fullDesig = customNotes.trim()
      ? `${customName.trim()} (${customNotes.trim()})`
      : customName.trim()

    setCart((prev) => ({
      ...prev,
      [customKey]: {
        id: customKey,
        code: "SUR-MESURE",
        designation: fullDesig,
        priceHt: 0,
        priceTtc: 0,
        quantity: Math.max(1, customQty),
        isCustom: true,
      },
    }))

    setCustomName("")
    setCustomQty(1)
    setCustomNotes("")
    setCustomModalOpen(false)
  }

  async function handleSubmitDevis() {
    if (cartLines.length === 0) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch("/api/devis-catalogue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartLines.map((l) => ({
            code: l.isCustom ? "CUSTOM" : l.code,
            designation: l.designation,
            quantity: l.quantity,
            isCustom: Boolean(l.isCustom),
          })),
          note,
        }),
      })

      if (res.status === 401) {
        onSessionExpired()
        return
      }

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de l'enregistrement de votre devis.")
      }

      setSubmittedId(data.id || "DEV-CONFIRMED")
      setCart({})
      setNote("")
      onSubmitted()
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Erreur de connexion.")
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // ── Confirmation Screen ───────────────────────────────────────────
  if (submittedId) {
    return (
      <div className="mt-8 mx-auto max-w-2xl rounded-2xl border border-hairline bg-white p-8 sm:p-12 text-center shadow-lg animate-in fade-in duration-300">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
          <svg className="size-10" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <span className="inline-block rounded-full bg-emerald-100 px-4 py-1 text-xs font-black uppercase tracking-wider text-emerald-800">
          Demande Certifiée &amp; Transmise
        </span>

        <h3 className="mt-4 font-display text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Votre Demande de Devis est validée !
        </h3>

        <div className="mt-6 rounded-xl border border-hairline bg-slate-50 p-5 text-left">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Référence du Devis</span>
            <span className="font-mono text-base font-black text-orsap-red">{submittedId.toUpperCase()}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-soft">
            Un récapitulatif officiel a été envoyé à votre adresse email et transmis en direct à nos conseillers techniques ORSAP.
            Vous pouvez suivre l'évolution du traitement à tout moment dans votre onglet <strong>"Mes Demandes de Devis"</strong>.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-white px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-ink transition hover:bg-slate-50 shadow-sm"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-3.076 1.838-5.829 4.908-5.829s5.148 2.753 4.908 5.829m-9.816 0A9.004 9.004 0 0112 4.5c2.31 0 4.438.87 6.056 2.308m-12.112 7.02A8.966 8.966 0 003 17.25c0 1.518.375 2.949 1.036 4.2M21 17.25c0-1.518-.375-2.949-1.036-4.2M6.75 21h10.5a2.25 2.25 0 002.25-2.25V17.25a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v1.5A2.25 2.25 0 006.75 21z" />
            </svg>
            Imprimer / Télécharger
          </button>
          <button
            type="button"
            onClick={() => setSubmittedId(null)}
            className="inline-flex items-center justify-center rounded-xl bg-orsap-red px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white transition hover:bg-orsap-red-dark shadow-md"
          >
            Nouvelle Demande de Devis
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {/* ── Top Bar Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-6">
        <div>
          <h2 className="font-display text-2xl font-black text-ink">Catalogue Produits &amp; Devis ORSAP</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Explorez plus de 48 000 références industrielles, ajustez vos quantités et demandez votre devis officiel en 1 clic.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCustomModalOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-dashed border-orsap-red bg-orsap-red/5 px-4 py-2.5 font-display text-xs font-bold text-orsap-red transition hover:bg-orsap-red hover:text-white"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Ajouter un article hors catalogue
        </button>
      </div>

      {/* ── Main Layout: Products Grid + Sticky Devis Drawer ───────── */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* LEFT COLUMN: Search, Filters & Product Cards */}
        <div>
          {/* Search bar */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-steel"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par code article (ex: OR120280) ou mots-clés (ex: mitigeur, rouleau, gants)..."
                className="w-full rounded-xl border border-hairline bg-white py-3 pl-11 pr-10 text-sm outline-none transition focus:border-orsap-red focus:ring-2 focus:ring-orsap-red/20 shadow-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-ink text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sub-family dropdown if category selected */}
            {availableFamilles.length > 0 && (
              <select
                value={famille}
                onChange={(e) => setFamille(e.target.value)}
                className="rounded-xl border border-hairline bg-white px-4 py-3 text-xs font-semibold text-ink outline-none transition focus:border-orsap-red focus:ring-2 focus:ring-orsap-red/20 shadow-sm"
              >
                <option value="">Toutes les sous-familles ({availableFamilles.length})</option>
                {availableFamilles.map((f) => (
                  <option key={`${f.rayon}_${f.name}`} value={f.name}>
                    {f.name} ({f.count})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Department Pills */}
          <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                setRayon("")
                setFamille("")
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                !rayon
                  ? "bg-ink text-paper shadow-sm"
                  : "border border-hairline bg-white text-ink-soft hover:bg-slate-100 hover:text-ink"
              }`}
            >
              Tous ({facets.rayons.reduce((s, r) => s + r.count, 0).toLocaleString("fr-FR")})
            </button>
            {facets.rayons.map((r) => (
              <button
                key={r.name}
                type="button"
                onClick={() => {
                  setRayon(rayon === r.name ? "" : r.name)
                  setFamille("")
                }}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                  rayon === r.name
                    ? "bg-orsap-red text-white shadow-sm"
                    : "border border-hairline bg-white text-ink-soft hover:bg-slate-100 hover:text-ink"
                }`}
              >
                {r.name} <span className="opacity-70 font-normal">({r.count.toLocaleString("fr-FR")})</span>
              </button>
            ))}
          </div>

          {/* Results count & status */}
          <div className="mt-5 flex items-center justify-between text-xs text-ink-soft">
            <span>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-orsap-red animate-ping" />
                  Recherche en cours...
                </span>
              ) : (
                <>
                  <strong className="text-ink font-bold">{total.toLocaleString("fr-FR")}</strong> article(s) trouvé(s)
                  {rayon && <span> dans <strong className="text-ink">{rayon}</strong></span>}
                  {famille && <span> &gt; <strong className="text-ink">{famille}</strong></span>}
                </>
              )}
            </span>
            {totalPages > 1 && (
              <span>
                Page {page} sur {totalPages}
              </span>
            )}
          </div>

          {searchError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
              {searchError}
            </div>
          )}

          {/* Product Cards List */}
          <div className="mt-4 space-y-3">
            {results.map((article) => {
              const inCartQty = cart[article.code]?.quantity || 0
              return (
                <div
                  key={article.code}
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-white p-4 transition-all hover:shadow-md ${
                    inCartQty > 0 ? "border-orsap-red/40 ring-1 ring-orsap-red/20 bg-red-50/10" : "border-hairline"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-black text-ink bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {article.code}
                      </span>
                      <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded">
                        {article.rayon} &gt; {article.famille}
                      </span>
                    </div>
                    <h4 className="font-display text-sm font-bold text-ink leading-snug break-words">
                      {article.designation}
                    </h4>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="font-display text-base font-black text-orsap-red">
                        {formatMAD(article.priceHt)} <span className="text-xs font-semibold text-ink-soft">HT</span>
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        ({formatMAD(article.priceTtc)} TTC)
                      </span>
                    </div>
                  </div>

                  {/* Actions / Quantity control */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {inCartQty > 0 ? (
                      <div className="flex items-center rounded-xl border border-orsap-red bg-white shadow-sm overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setLineQuantity(article.code, inCartQty - 1)}
                          className="px-3 py-1.5 font-bold text-orsap-red hover:bg-orsap-red/10 transition"
                          title="Diminuer la quantité"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="99999"
                          value={inCartQty}
                          onChange={(e) => setLineQuantity(article.code, parseInt(e.target.value, 10) || 1)}
                          className="w-12 text-center text-xs font-bold text-ink outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setLineQuantity(article.code, inCartQty + 1)}
                          className="px-3 py-1.5 font-bold text-orsap-red hover:bg-orsap-red/10 transition"
                          title="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(article, 1)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-paper transition hover:bg-orsap-red shadow-sm"
                      >
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Ajouter
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {!loading && results.length === 0 && (
              <div className="rounded-2xl border border-dashed border-hairline p-12 text-center bg-white">
                <p className="text-sm font-semibold text-ink">Aucun article trouvé pour cette recherche.</p>
                <p className="mt-1 text-xs text-ink-soft">
                  Essayez d'autres mots-clés ou utilisez le bouton ci-dessus pour ajouter un article sur-mesure.
                </p>
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orsap-red px-4 py-2 text-xs font-bold text-white shadow"
                >
                  Ajouter cet article sur-mesure
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-hairline bg-white px-4 py-2 text-xs font-bold text-ink disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Précédent
              </button>
              <span className="px-3 text-xs font-bold text-ink">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-hairline bg-white px-4 py-2 text-xs font-bold text-ink disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Suivant
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sticky Devis Basket Panel */}
        <div>
          <div className="sticky top-6 rounded-2xl border border-hairline bg-white p-6 shadow-md">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-orsap-red text-white font-black text-xs">
                  {cartItemCount}
                </div>
                <h3 className="font-display text-base font-black text-ink">Mon Devis en Cours</h3>
              </div>
              {cartLines.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart({})}
                  className="text-xs text-steel hover:text-orsap-red font-semibold transition"
                >
                  Vider
                </button>
              )}
            </div>

            {/* Cart items list */}
            {cartLines.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-steel">
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-ink">Votre panier de devis est vide</p>
                <p className="mt-1 text-[11px] text-ink-soft">
                  Recherchez et ajoutez des articles depuis le catalogue pour estimer votre devis.
                </p>
              </div>
            ) : (
              <div className="mt-4 max-h-80 overflow-y-auto space-y-3 pr-1">
                {cartLines.map((line) => (
                  <div key={line.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="font-mono font-bold text-[10px] text-ink-soft">
                          {line.isCustom ? (
                            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                              SUR-MESURE
                            </span>
                          ) : (
                            line.code
                          )}
                        </span>
                        <p className="font-bold text-ink leading-tight mt-0.5">{line.designation}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="text-slate-400 hover:text-orsap-red text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-slate-200/50 pt-2">
                      <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setLineQuantity(line.id, line.quantity - 1)}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-slate-100"
                        >
                          −
                        </button>
                        <span className="px-2 text-xs font-bold">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setLineQuantity(line.id, line.quantity + 1)}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-ink">
                          {line.priceHt > 0 ? formatMAD(line.priceHt * line.quantity) : "Sur devis"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals & Submissions */}
            {cartLines.length > 0 && (
              <div className="mt-5 border-t border-hairline pt-4 space-y-2">
                <div className="flex justify-between text-xs text-ink-soft">
                  <span>Total HT :</span>
                  <span className="font-bold text-ink">{formatMAD(totalHt)}</span>
                </div>
                <div className="flex justify-between text-xs text-ink-soft">
                  <span>TVA estimée (20%) :</span>
                  <span className="font-bold text-ink">{formatMAD(totalTva)}</span>
                </div>
                <div className="flex justify-between border-t border-hairline pt-2 text-sm font-black text-orsap-red">
                  <span>Total Estimé TTC :</span>
                  <span>{formatMAD(totalTtc)}</span>
                </div>

                {/* Notes */}
                <div className="mt-4 pt-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                    Précisions / Lieu de livraison (optionnel)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Ex: Livraison Casablanca, besoin sous 48h, fiche technique souhaitée..."
                    className="w-full rounded-xl border border-hairline bg-slate-50 p-2.5 text-xs outline-none focus:border-orsap-red focus:bg-white transition"
                  />
                </div>

                {submitError && (
                  <div className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                    {submitError}
                  </div>
                )}

                <button
                  type="button"
                  disabled={submitting || cartLines.length === 0}
                  onClick={handleSubmitDevis}
                  className="mt-3 w-full rounded-xl bg-orsap-red py-3.5 font-display text-xs font-black uppercase tracking-wider text-white transition hover:bg-orsap-red-dark disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Transmission...
                    </>
                  ) : (
                    "Valider & Envoyer ma Demande de Devis"
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  Prix indicatifs hors frais de transport éventuels. Confirmation transmise par email.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Custom Article Modal ────────────────────────────────────── */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-hairline bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-display text-base font-black text-ink">Ajouter un article spécifique</h3>
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                className="text-slate-400 hover:text-ink font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomArticle} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Désignation du produit ou matériel *</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Câble armé 4x25mm² cuivre sur touret 500m"
                  className="w-full rounded-xl border border-hairline bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-orsap-red focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Quantité souhaitée *</label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  required
                  value={customQty}
                  onChange={(e) => setCustomQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-xl border border-hairline bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-orsap-red focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Spécifications techniques / Référence marque (optionnel)</label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Ex: Norme NF, marque Schneider ou équivalent certifié"
                  className="w-full rounded-xl border border-hairline bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-orsap-red focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="flex-1 rounded-xl border border-hairline py-2.5 font-bold text-ink hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orsap-red py-2.5 font-bold text-white hover:bg-orsap-red-dark shadow"
                >
                  Ajouter au devis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
