export interface Article {
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

export interface SearchResult {
  items: Article[]
  total: number
  page: number
  pageSize: number
}

// In-memory cache for static catalogue if backend is unreachable or in preview
let staticCatalogueCache: Article[] | null = null
let staticFacetsCache: Facets | null = null
let fetchPromise: Promise<Article[]> | null = null

async function loadStaticCatalogue(): Promise<Article[]> {
  if (staticCatalogueCache && staticCatalogueCache.length > 0) return staticCatalogueCache
  if (fetchPromise) return fetchPromise

  fetchPromise = (async () => {
    // 1. Try dynamic ESM import (works 100% in Vite bundler & Figma Make preview)
    try {
      const mod = await import("../data/articles.json")
      const list = (mod.default || mod) as Article[]
      if (Array.isArray(list) && list.length > 0) {
        staticCatalogueCache = list
        return staticCatalogueCache
      }
    } catch (err) {
      console.warn("Dynamic import of articles.json failed, trying fetch fallback:", err)
    }

    // 2. Try static fetch
    try {
      const res = await fetch("/data/articles.json")
      if (res.ok) {
        const list = (await res.json()) as Article[]
        if (Array.isArray(list) && list.length > 0) {
          staticCatalogueCache = list
          return staticCatalogueCache
        }
      }
    } catch (err) {
      console.warn("Could not fetch /data/articles.json:", err)
    }

    return []
  })()

  return fetchPromise
}

function normalizeText(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function computeFacetsFromList(articles: Article[]): Facets {
  const rayonMap = new Map<string, number>()
  const familleMap = new Map<string, { name: string; rayon: string; count: number }>()

  for (const a of articles) {
    if (a.rayon) {
      const r = a.rayon.trim()
      rayonMap.set(r, (rayonMap.get(r) || 0) + 1)
    }
    if (a.famille && a.rayon) {
      const r = a.rayon.trim()
      const f = a.famille.trim()
      const key = `${r}:::${f}`
      const existing = familleMap.get(key)
      if (existing) {
        existing.count++
      } else {
        familleMap.set(key, { name: f, rayon: r, count: 1 })
      }
    }
  }

  const rayons = Array.from(rayonMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const familles = Array.from(familleMap.values()).sort((a, b) => b.count - a.count)

  return { rayons, familles }
}

export async function fetchArticleFacets(token?: string): Promise<Facets> {
  try {
    const res = await fetch("/api/articles/facets", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const cType = res.headers.get("content-type") || ""
    if (res.ok && cType.includes("application/json")) {
      const data = await res.json()
      if (data && Array.isArray(data.rayons) && data.rayons.length > 0) {
        return data
      }
    }
  } catch {
    // API not responding or returned non-JSON
  }

  // Fallback to static catalogue
  if (staticFacetsCache) return staticFacetsCache
  const articles = await loadStaticCatalogue()
  staticFacetsCache = computeFacetsFromList(articles)
  return staticFacetsCache
}

export async function searchArticles({
  query = "",
  rayon = "",
  famille = "",
  page = 1,
  pageSize = 24,
  token,
}: {
  query?: string
  rayon?: string
  famille?: string
  page?: number
  pageSize?: number
  token?: string
}): Promise<SearchResult> {
  const params = new URLSearchParams({
    q: query,
    rayon,
    famille,
    page: String(page),
    pageSize: String(pageSize),
  })

  try {
    const res = await fetch(`/api/articles?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const cType = res.headers.get("content-type") || ""
    if (res.ok && cType.includes("application/json")) {
      const data = await res.json()
      if (data && Array.isArray(data.items)) {
        return data
      }
    }
  } catch {
    // API failed, fallback below
  }

  // Fallback: search in-memory client-side
  const articles = await loadStaticCatalogue()
  const qClean = normalizeText(query)
  const tokens = qClean ? qClean.split(/\s+/).filter(Boolean) : []
  const rClean = normalizeText(rayon)
  const fClean = normalizeText(famille)

  const filtered = articles.filter((a) => {
    if (rClean && normalizeText(a.rayon) !== rClean) return false
    if (fClean && normalizeText(a.famille) !== fClean) return false
    if (tokens.length > 0) {
      const target = normalizeText(`${a.code} ${a.designation} ${a.rayon} ${a.famille}`)
      for (const t of tokens) {
        if (!target.includes(t)) return false
      }
    }
    return true
  })

  const total = filtered.length
  const offset = Math.max(0, (page - 1) * pageSize)
  const items = filtered.slice(offset, offset + pageSize)

  return {
    items,
    total,
    page,
    pageSize,
  }
}
