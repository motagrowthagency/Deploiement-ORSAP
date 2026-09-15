import { useEffect, useMemo, useRef, useState } from "react"

interface Article {
  code: string
  designation: string
  tva: number
  priceTtc: number
  rayon: string
  famille: string
}

interface Facets {
  rayons: { name: string; count: number }[]
  familles: { name: string; rayon: string; count: number }[]
}

interface CartLine {
  code: string
  designation: string
  priceTtc: number
  quantity: number
}

const PAGE_SIZE = 24

function formatMAD(n: number) {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
}

export default function CatalogueDevisBuilder({
  token,
  onSubmitted,
}: {
  token: string
  onSubmitted: () => void
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

  const [cart, setCart] = useState<Record<string, CartLine>>({})
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load category facets once
  useEffect(() => {
    fetch("/api/articles/facets", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setFacets(data)
      })
      .catch(() => {})
  }, [token])

  // Reset to page 1 whenever the query or filters change
  useEffect(() => {
    setPage(1)
  }, [query, rayon, famille])

  // Debounced, paginated search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      setSearchError(null)
      const params = new URLSearchParams({
        q: query,
        rayon,
        famille,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      })
      fetch(`/api/articles?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => {
          if (!r.ok) throw new Error("Erreur lors de la recherche.")
          return r.json()
        })
        .then((data) => {
          setResults(data.items || [])
          setTotal(data.total || 0)
        })
        .catch(() => setSearchError("Impossible de charger les articles. Réessayez."))
        .finally(() => setLoading(false))
    }, 280)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, rayon, famille, page, token])

  const availableFamilles = useMemo(
    () => (rayon ? facets.familles.filter((f) => f.rayon === rayon) : facets.familles),
    [facets.familles, rayon]
  )

  const cartLines = useMemo(() => Object.values(cart), [cart])
  const cartTotal = useMemo(
    () => cartLines.reduce((sum, l) => sum + l.priceTtc * l.quantity, 0),
    [cartLines]
  )
  const cartCount = cartLines.reduce((sum, l) => sum + l.quantity, 0)

  function addToCart(article: Article) {
    setCart((prev) => {
      const existing = prev[article.code]
      return {
        ...prev,
        [article.code]: {
          code: article.code,
          designation: article.designation,
          priceTtc: article.priceTtc,
          quantity: (existing?.quantity || 0) + 1,
        },
      }
    })
  }

  function setQuantity(code: string, quantity: number) {
    setCart((prev) => {
      if (quantity <= 0) {
        const next = { ...prev }
        delete next[code]
        return next
      }
      return { ...prev, [code]: { ...prev[code], quantity } }
    })
  }

  function removeFromCart(code: string) {
    setCart((prev) => {
      const next = { ...prev }
      delete next[code]
      return next
    })
  }

  async function handleSubmit() {
    if (cartLines.length === 0) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/devis-catalogue", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cartLines.map((l) => ({ code: l.code, quantity: l.quantity })),
          note,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Erreur lors de l'envoi de la demande.")
      setSubmitted(data.id)
      setCart({})
      setNote("")
      onSubmitted()
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Erreur réseau.")
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (submitted) {
    return (
      <div className="mt-8 mx-auto max-w-xl rounded-xl border border-hairline bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-orsap-red/10">
          <svg className="size-7 text-orsap-red" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-black tracking-tight text-ink">Demande envoyée !</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Référence <span className="font-mono font-bold text-ink">{submitted.toUpperCase()}</span>. Un expert ORSAP
          vous recontactera avec un devis personnalisé. Vous pouvez suivre son statut dans l'onglet "Mes Demandes de
          Devis".
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(null)}
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-ink px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper"
        >
          Nouvelle demande
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      {/* ── Search & results ────────────────────────────────────────── */}
      <div>
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Catalogue Produits ORSAP</h2>
          <p className="text-xs text-ink-soft">
            Recherchez par mot-clé, ajoutez les articles souhaités à votre devis avec les quantités.
          </p>
        </div>

        {/* Search bar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel"
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
              placeholder="Ex: gants, mitigeur, câble, casque…"
              className="w-full rounded-lg border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orsap-red focus:ring-1 focus:ring-orsap-red"
            />
          </div>
          <select
            value={rayon}
            onChange={(e) => {
              setRayon(e.target.value)
              setFamille("")
            }}
            className="rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-orsap-red sm:w-56"
          >
            <option value="">Toutes catégories</option>
            {facets.rayons.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name} ({r.count})
              </option>
            ))}
          </select>
          <select
            value={famille}
            onChange={(e) => setFamille(e.target.value)}
            className="rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-orsap-red sm:w-56"
          >
            <option value="">Toutes sous-catégories</option>
            {availableFamilles.map((f) => (
              <option key={`${f.rayon}-${f.name}`} value={f.name}>
                {f.name} ({f.count})
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="mt-3 text-xs text-ink-soft">
          {loading ? "Recherche en cours…" : `${total.toLocaleString("fr-FR")} article(s) trouvé(s)`}
        </div>

        {searchError && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            {searchError}
          </div>
        )}

        {/* Results list */}
        <div className="mt-3 divide-y divide-hairline rounded-xl border border-hairline bg-card shadow-sm">
          {!loading && results.length === 0 && (
            <div className="p-10 text-center text-sm text-ink-soft">
              Aucun article ne correspond à votre recherche.
            </div>
          )}
          {results.map((a) => {
            const inCart = cart[a.code]
            return (
              <div key={a.code} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[11px] text-ink-soft">{a.code}</div>
                  <div className="mt-0.5 truncate text-sm font-medium text-ink" title={a.designation}>
                    {a.designation}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-soft">
                    {a.rayon}
                    {a.famille ? ` · ${a.famille}` : ""}
                  </div>
                </div>
                <div className="whitespace-nowrap text-sm font-bold text-ink">{formatMAD(a.priceTtc)}</div>
                {inCart ? (
                  <div className="flex items-center gap-1.5 rounded-lg border border-hairline bg-paper px-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(a.code, inCart.quantity - 1)}
                      className="grid size-6 place-items-center rounded text-ink hover:bg-white"
                      aria-label="Diminuer la quantité"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-ink">{inCart.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(a.code, inCart.quantity + 1)}
                      className="grid size-6 place-items-center rounded text-ink hover:bg-white"
                      aria-label="Augmenter la quantité"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(a)}
                    className="shrink-0 rounded-lg bg-ink px-3.5 py-2 font-display text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-orsap-red"
                  >
                    Ajouter
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-hairline bg-white px-3 py-2 font-bold uppercase tracking-wider disabled:opacity-40"
            >
              ← Précédent
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-hairline bg-white px-3 py-2 font-bold uppercase tracking-wider disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>

      {/* ── Cart sidebar ─────────────────────────────────────────────── */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border border-hairline bg-ink p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider">Votre devis</h3>
            <span className="rounded-full bg-orsap-red px-2.5 py-1 text-[11px] font-bold">{cartCount}</span>
          </div>

          {cartLines.length === 0 ? (
            <p className="mt-4 text-xs text-white/60">
              Ajoutez des articles depuis le catalogue pour construire votre demande de devis.
            </p>
          ) : (
            <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {cartLines.map((l) => (
                <div key={l.code} className="rounded-lg bg-white/5 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] text-white/50">{l.code}</div>
                      <div className="truncate text-xs font-medium text-white" title={l.designation}>
                        {l.designation}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(l.code)}
                      className="shrink-0 text-white/40 hover:text-orsap-red"
                      aria-label="Retirer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(l.code, l.quantity - 1)}
                        className="grid size-5 place-items-center rounded text-white hover:bg-white/20"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-[11px] font-bold">{l.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(l.code, l.quantity + 1)}
                        className="grid size-5 place-items-center rounded text-white hover:bg-white/20"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-bold">{formatMAD(l.priceTtc * l.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-white/70">Total estimé (TTC)</span>
            <span className="font-display text-lg font-black">{formatMAD(cartTotal)}</span>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Précisions utiles (délai, lieu de livraison…) — optionnel"
            className="mt-4 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-orsap-red"
          />

          {submitError && (
            <div className="mt-3 rounded-lg bg-orsap-red/10 p-2.5 text-[11px] font-semibold text-orsap-red">
              {submitError}
            </div>
          )}

          <button
            type="button"
            disabled={cartLines.length === 0 || submitting}
            onClick={handleSubmit}
            className="mt-4 w-full rounded-lg bg-orsap-red py-3 font-display text-xs font-bold uppercase tracking-wider text-white transition hover:bg-orsap-red-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Envoi en cours…" : "Envoyer ma demande de devis"}
          </button>
          <p className="mt-2 text-center text-[10.5px] text-white/40">
            Prix indicatifs TTC. Confirmation par email dès réception.
          </p>
        </div>
      </aside>
    </div>
  )
}
