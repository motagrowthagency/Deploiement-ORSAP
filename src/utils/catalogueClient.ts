import { Article, Facets, DEFAULT_FACETS } from "@/data/catalogueData"

export type { Article, Facets }

export interface SearchResult {
  items: Article[]
  total: number
  page: number
  pageSize: number
}

let cachedArticles: Article[] | null = null
let cachedFacets: Facets | null = null
let fetchPromise: Promise<Article[]> | null = null

function normalizeText(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export async function getCatalogueArticles(): Promise<Article[]> {
  if (cachedArticles && cachedArticles.length > 0) {
    return cachedArticles
  }
  if (fetchPromise) {
    return fetchPromise
  }

  fetchPromise = (async () => {
    try {
      const res = await fetch("/data/articles.json")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          cachedArticles = data
          return cachedArticles
        }
      }
    } catch (err) {
      console.warn("Impossible de charger /data/articles.json en ligne:", err)
    } finally {
      fetchPromise = null
    }
    return []
  })()

  return fetchPromise
}

export async function fetchArticleFacets(_token?: string): Promise<Facets> {
  if (cachedFacets && cachedFacets.rayons.length > 0) {
    return cachedFacets
  }

  const articles = await getCatalogueArticles()
  if (!articles || articles.length === 0) {
    return DEFAULT_FACETS
  }

  const rayonCountMap: Record<string, number> = {}
  const familleCountMap: Record<string, { name: string; count: number; rayon: string }> = {}

  articles.forEach((a) => {
    const r = a.rayon || "AUTRE"
    rayonCountMap[r] = (rayonCountMap[r] || 0) + 1

    const f = a.famille || "DIVERS"
    const key = `${r}___${f}`
    if (!familleCountMap[key]) {
      familleCountMap[key] = { name: f, count: 0, rayon: r }
    }
    familleCountMap[key].count++
  })

  cachedFacets = {
    rayons: Object.entries(rayonCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    familles: Object.values(familleCountMap).sort((a, b) => b.count - a.count),
  }

  return cachedFacets
}

export async function searchArticles({
  query = "",
  rayon = "",
  famille = "",
  page = 1,
  pageSize = 24,
  _token,
}: {
  query?: string
  rayon?: string
  famille?: string
  page?: number
  pageSize?: number
  _token?: string
  token?: string
}): Promise<SearchResult> {
  const articles = await getCatalogueArticles()
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
  const pageNum = Math.max(1, page)
  const offset = (pageNum - 1) * pageSize
  const items = filtered.slice(offset, offset + pageSize)

  return {
    items,
    total,
    page: pageNum,
    pageSize,
  }
}
