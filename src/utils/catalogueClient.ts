import { ALL_ARTICLES, DEFAULT_FACETS, Article, Facets } from "@/data/catalogueData"

export type { Article, Facets }

export interface SearchResult {
  items: Article[]
  total: number
  page: number
  pageSize: number
}

function normalizeText(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export async function fetchArticleFacets(_token?: string): Promise<Facets> {
  return DEFAULT_FACETS
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
  const qClean = normalizeText(query)
  const tokens = qClean ? qClean.split(/\s+/).filter(Boolean) : []
  const rClean = normalizeText(rayon)
  const fClean = normalizeText(famille)

  const filtered = ALL_ARTICLES.filter((a) => {
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
