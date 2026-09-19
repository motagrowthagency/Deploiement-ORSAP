import { useState, useEffect, useRef, useMemo } from "react"

export interface Article {
  id: string
  code: string
  designation: string
  tva: number
  priceHt: number
  priceTtc: number
  rayon: string
  famille: string
}

export interface Facets {
  rayons: { name: string; count: number }[]
  familles: { name: string; rayon: string; count: number }[]
}

export interface CartLine {
  id: string
  code: string
  designation: string
  priceHt: number
  priceTtc: number
  quantity: number
  isCustom?: boolean
  notes?: string
}

const PAGE_SIZE = 24

function formatMAD(amount: number) {
  return `${amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
}

export default function B2BCommercePlatform({
  token,
  onOrderSubmitted,
}: {
  token: string
  onOrderSubmitted: () => void
}) {
  const [query, setQuery] = useState("")
  const [rayon, setRayon] = useState("")
  const [famille, setFamille] = useState("")
  const [page, setPage] = useState(1)

  const [facets, setFacets] = useState<Facets>({ rayons: [], familles: [] })
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Cart & Order State
  const [cart, setCart] = useState<Record<string, CartLine>>({})
  const [orderNotes, setOrderNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)

  // Custom Article Modal State
  const [customModalOpen, setCustomModalOpen] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customQty, setCustomQty] = useState(1)
  const [customNotes, setCustomNotes] = useState("")

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load facets
  useEffect(() => {
    fetch("/api/articles/facets")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.rayons)) {
          setFacets(data)
        }
      })
      .catch(() => {})
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [query, rayon, famille])

  // Search articles
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setSearchError(null)

      try {
        const params = new URLSearchParams()
        if (query.trim()) params.set("q", query.trim())
        if (rayon) params.set("rayon", rayon)
        if (famille) params.set("famille", famille)
        params.set("page", String(page))
        params.set("pageSize", String(PAGE_SIZE))

        const res = await fetch(`/api/articles?${params.toString()}`)
        if (!res.ok) {
          throw new Error("Erreur de communication avec le catalogue")
        }
        const data = await res.json()
        setArticles(data.items || [])
        setTotal(data.total || 0)
      } catch (err: any) {
        setSearchError(err?.message || "Impossible de charger les articles.")
        setArticles([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, rayon, famille, page])

  // Filtered families based on selected department
  const filteredFamilles = useMemo(() => {
    if (!rayon) return []
    return facets.familles.filter((f) => f.rayon === rayon)
  }, [facets, rayon])

  // Cart totals calculation
  const { cartItems, totalCount, totalHt, totalTva, totalTtc } = useMemo(() => {
    const items = Object.values(cart)
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const ht = items.reduce((sum, item) => sum + item.priceHt * item.quantity, 0)
    const ttc = items.reduce((sum, item) => sum + item.priceTtc * item.quantity, 0)
    const tva = ttc - ht
    return {
      cartItems: items,
      totalCount: count,
      totalHt: ht,
      totalTva: tva,
      totalTtc: ttc,
    }
  }, [cart])

  // Cart operations
  const addToCart = (article: Article, qtyToAdd = 1) => {
    setCart((prev) => {
      const existing = prev[article.code]
      const newQty = existing ? existing.quantity + qtyToAdd : qtyToAdd
      return {
        ...prev,
        [article.code]: {
          id: article.id || article.code,
          code: article.code,
          designation: article.designation,
          priceHt: article.priceHt || 0,
          priceTtc: article.priceTtc || 0,
          quantity: newQty,
        },
      }
    })
  }

  const updateQuantity = (code: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(code)
      return
    }
    setCart((prev) => {
      if (!prev[code]) return prev
      return {
        ...prev,
        [code]: { ...prev[code], quantity: newQty },
      }
    })
  }

  const removeFromCart = (code: string) => {
    setCart((prev) => {
      const copy = { ...prev }
      delete copy[code]
      return copy
    })
  }

  const addCustomArticle = () => {
    if (!customName.trim()) return
    const customCode = `SURMESURE-${Date.now()}`
    setCart((prev) => ({
      ...prev,
      [customCode]: {
        id: customCode,
        code: customCode,
        designation: customName.trim(),
        priceHt: 0,
        priceTtc: 0,
        quantity: Math.max(1, customQty),
        isCustom: true,
        notes: customNotes.trim() || undefined,
      },
    }))
    setCustomName("")
    setCustomQty(1)
    setCustomNotes("")
    setCustomModalOpen(false)
  }

  // Submit Order / Devis
  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) return
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
          items: cartItems.map((i) => ({
            code: i.code,
            designation: i.designation,
            priceHt: i.priceHt,
            priceTtc: i.priceTtc,
            quantity: i.quantity,
            isCustom: i.isCustom,
            notes: i.notes,
          })),
          note: orderNotes.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de l'enregistrement de la commande.")
      }

      setOrderSuccess(data.reference || data.id || "DEV-CONFIRME")
      setCart({})
      setOrderNotes("")
      setCartDrawerOpen(false)
      onOrderSubmitted()
    } catch (err: any) {
      setSubmitError(err.message || "Une erreur est survenue lors de l'envoi.")
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-8">
      {/* Top Banner & Cart summary bar */}
      <div className="rounded-2xl border border-hairline bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block size-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-orsap-red">
                Espace B2B &amp; Tarifs Préférentiels
              </span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-ink">
              Boutique &amp; Chiffrage Express
            </h2>
            <p className="mt-1 text-xs text-ink-soft">
              Sélectionnez vos références professionnelles, ajustez vos quantités et générez vos commandes ou devis chiffrés en 1 clic.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCustomModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-paper px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-ink shadow-xs hover:border-orsap-red hover:text-orsap-red transition"
            >
              + Article Hors-Catalogue
            </button>
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-xl bg-orsap-red px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orsap-red/25 hover:bg-orsap-red-deep transition"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Panier B2B</span>
              {totalCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-white font-mono text-[10px] font-bold text-orsap-red">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Order Success Confirmation Modal */}
      {orderSuccess && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-ink">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-emerald-950">
                  Demande de Chiffrage B2B Enregistrée avec Succès !
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Référence officielle : <strong className="font-mono text-emerald-900 bg-white/70 px-2 py-0.5 rounded">{orderSuccess}</strong>. Un récapitulatif détaillé a été transmis à votre commercial ORSAP.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOrderSuccess(null)}
              className="text-xs font-bold uppercase tracking-wider text-emerald-800 hover:text-emerald-950"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters Controls */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-steel"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par code article (ex: OR120280) ou désignation (gants, casque, disjoncteur, meuleuse...)"
            className="w-full rounded-xl border border-hairline bg-paper pl-12 pr-4 py-3.5 text-sm text-ink outline-none transition focus:border-orsap-red focus:ring-1 focus:ring-orsap-red shadow-xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-steel hover:text-ink"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Rayons / Departments facet filters */}
        {facets.rayons.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setRayon("")
                setFamille("")
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                !rayon
                  ? "bg-ink text-white"
                  : "border border-hairline bg-card text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              Tous les rayons
            </button>
            {facets.rayons.slice(0, 10).map((r) => (
              <button
                key={r.name}
                type="button"
                onClick={() => {
                  setRayon(r.name === rayon ? "" : r.name)
                  setFamille("")
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  rayon === r.name
                    ? "bg-orsap-red text-white shadow-xs"
                    : "border border-hairline bg-card text-ink-soft hover:border-orsap-red hover:text-ink"
                }`}
              >
                {r.name}
                <span className="ml-1.5 opacity-60 font-mono text-[10px]">({r.count})</span>
              </button>
            ))}
          </div>
        )}

        {/* Subfamilies if rayon selected */}
        {filteredFamilles.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-hairline/60 bg-paper p-3 text-xs">
            <span className="font-bold text-ink mr-1">Famille :</span>
            <button
              type="button"
              onClick={() => setFamille("")}
              className={`rounded px-2.5 py-1 text-[11px] font-bold ${
                !famille ? "bg-ink text-white" : "bg-card text-ink-soft hover:text-ink"
              }`}
            >
              Toutes
            </button>
            {filteredFamilles.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => setFamille(f.name === famille ? "" : f.name)}
                className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                  famille === f.name
                    ? "bg-orsap-red text-white font-bold"
                    : "bg-card text-ink-soft hover:bg-card/80 hover:text-ink"
                }`}
              >
                {f.name} <span className="opacity-60 font-mono">({f.count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Meta Info */}
      <div className="flex items-center justify-between text-xs text-ink-soft border-b border-hairline pb-3">
        <div>
          {loading ? (
            <span>Recherche en cours...</span>
          ) : (
            <span>
              <strong className="text-ink font-bold">{total.toLocaleString("fr-FR")}</strong> article(s) disponible(s)
            </span>
          )}
        </div>
        {total > 0 && (
          <div>
            Page <strong className="text-ink">{page}</strong> sur {totalPages}
          </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl border border-hairline bg-card/60 animate-pulse p-4" />
          ))}
        </div>
      ) : searchError ? (
        <div className="rounded-xl border border-orsap-red/30 bg-orsap-red/5 p-8 text-center text-sm text-orsap-red">
          {searchError}
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-card p-12 text-center">
          <h3 className="font-display text-base font-bold text-ink">Aucun article ne correspond à votre recherche</h3>
          <p className="mt-1 text-xs text-ink-soft max-w-md mx-auto">
            Vérifiez l&apos;orthographe de votre mot-clé ou tentez d&apos;ajouter un article sur-mesure hors catalogue.
          </p>
          <button
            type="button"
            onClick={() => setCustomModalOpen(true)}
            className="mt-4 rounded-lg bg-orsap-red px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-orsap-red-deep transition"
          >
            + Ajouter un article sur-mesure
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((art) => {
            const inCart = cart[art.code]
            return (
              <div
                key={art.code}
                className="group flex flex-col justify-between rounded-xl border border-hairline bg-card p-4 transition-all hover:border-orsap-red hover:shadow-md"
              >
                <div>
                  {/* SKU & Category Tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-orsap-red bg-paper px-2 py-0.5 rounded border border-hairline">
                      {art.code}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Dispo Stock
                    </span>
                  </div>

                  {art.rayon && (
                    <div className="text-[10.5px] uppercase tracking-wider text-steel font-bold line-clamp-1 mb-1">
                      {art.rayon} {art.famille ? `› ${art.famille}` : ""}
                    </div>
                  )}

                  <h4 className="font-display text-[13.5px] font-bold text-ink leading-snug line-clamp-2">
                    {art.designation}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-hairline/60">
                  {/* Price display */}
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <div className="font-display text-base font-black text-ink">
                        {formatMAD(art.priceHt || 0)}
                      </div>
                      <div className="text-[10px] text-ink-soft">
                        HT ({formatMAD(art.priceTtc || 0)} TTC)
                      </div>
                    </div>
                  </div>

                  {/* Add / Quantity control */}
                  {inCart ? (
                    <div className="flex items-center justify-between rounded-lg border border-orsap-red bg-paper p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(art.code, inCart.quantity - 1)}
                        className="size-7 rounded bg-card text-ink font-bold hover:bg-slate-200 grid place-items-center"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold text-ink px-2">
                        {inCart.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(art.code, inCart.quantity + 1)}
                        className="size-7 rounded bg-orsap-red text-white font-bold hover:bg-orsap-red-deep grid place-items-center"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(art, 1)}
                      className="w-full rounded-lg bg-ink py-2 font-display text-xs font-bold uppercase tracking-wider text-white transition hover:bg-orsap-red"
                    >
                      Ajouter au devis
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-hairline bg-card px-4 py-2 text-xs font-bold uppercase text-ink disabled:opacity-30 hover:bg-paper"
          >
            Précédent
          </button>
          <span className="font-mono text-xs font-bold text-ink px-3">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-hairline bg-card px-4 py-2 text-xs font-bold uppercase text-ink disabled:opacity-30 hover:bg-paper"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Custom Article Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-hairline bg-paper p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-display text-base font-bold text-ink">
                Ajouter une référence hors-catalogue
              </h3>
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                className="text-steel hover:text-ink font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-ink mb-1">
                  Désignation de l&apos;équipement / article <span className="text-orsap-red">*</span>
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Harnais antichute 4 points taille XL spécifique"
                  className="w-full rounded-lg border border-hairline bg-card p-3 text-sm text-ink outline-none focus:border-orsap-red"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-ink mb-1">
                  Quantité souhaitée
                </label>
                <input
                  type="number"
                  min="1"
                  value={customQty}
                  onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-lg border border-hairline bg-card p-3 text-sm text-ink outline-none focus:border-orsap-red"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-ink mb-1">
                  Spécifications &amp; exigences techniques
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Normes souhaitées, marque préférée, dimensions, couleur..."
                  className="w-full rounded-lg border border-hairline bg-card p-3 text-xs text-ink outline-none focus:border-orsap-red"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={!customName.trim()}
                  onClick={addCustomArticle}
                  className="flex-1 rounded-lg bg-orsap-red py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-orsap-red-deep disabled:opacity-50"
                >
                  Ajouter au devis
                </button>
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="rounded-lg border border-hairline bg-card px-4 py-3 font-display text-xs font-bold uppercase text-ink hover:bg-paper"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Panel */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-paper border-l border-hairline shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-hairline bg-card">
              <div className="flex items-center gap-2">
                <svg className="size-5 text-orsap-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="font-display text-base font-bold text-ink">
                  Votre Panier B2B ({totalCount} articles)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                className="text-steel hover:text-ink font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cartItems.length === 0 ? (
                <div className="py-12 text-center text-ink-soft text-xs">
                  Votre panier B2B est vide. Ajoutez des articles depuis le catalogue ci-contre.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.code}
                    className="flex items-start justify-between gap-3 rounded-xl border border-hairline bg-card p-3.5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-orsap-red bg-paper px-1.5 py-0.5 rounded border border-hairline">
                          {item.code}
                        </span>
                        {item.isCustom && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            Sur-Mesure
                          </span>
                        )}
                      </div>
                      <h5 className="mt-1 font-display text-xs font-bold text-ink line-clamp-2">
                        {item.designation}
                      </h5>
                      <div className="mt-1 font-mono text-xs font-semibold text-ink-soft">
                        {item.priceHt > 0 ? `${formatMAD(item.priceHt)} HT` : "Sur devis"}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center rounded border border-hairline bg-paper">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.code, item.quantity - 1)}
                          className="size-6 text-xs font-bold text-ink hover:bg-slate-200 grid place-items-center"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-bold px-2 text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.code, item.quantity + 1)}
                          className="size-6 text-xs font-bold text-ink hover:bg-slate-200 grid place-items-center"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.code)}
                        className="text-[11px] text-steel hover:text-orsap-red underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {cartItems.length > 0 && (
              <div className="border-t border-hairline bg-card p-5 space-y-4">
                {/* Notes & PO input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                    Référence PO / Chantier &amp; Instructions (optionnel) :
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Ex: Projet Usine Tanger - Bon de commande N° 2026-44"
                    className="w-full rounded-lg border border-hairline bg-paper p-2.5 text-xs text-ink outline-none focus:border-orsap-red"
                  />
                </div>

                {/* Financial Totals */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-ink-soft">
                    <span>Total Net HT :</span>
                    <span className="font-mono font-bold text-ink">{formatMAD(totalHt)}</span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>TVA estimée (20%) :</span>
                    <span className="font-mono">{formatMAD(totalTva)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-ink border-t border-hairline pt-2">
                    <span>Total Général TTC :</span>
                    <span className="font-mono text-base text-orsap-red">{formatMAD(totalTtc)}</span>
                  </div>
                </div>

                {submitError && (
                  <div className="rounded-lg bg-red-500/10 p-2.5 text-xs text-red-600 border border-red-500/20">
                    {submitError}
                  </div>
                )}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitOrder}
                  className="w-full rounded-xl bg-orsap-red py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orsap-red/30 hover:bg-orsap-red-deep disabled:opacity-50 transition"
                >
                  {submitting ? "Envoi du chiffrage en cours..." : "Valider et Générer le Devis Officiel"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
