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

export async function fetchArticleFacets(token?: string): Promise<Facets> {
  try {
    const res = await fetch("/api/articles/facets", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const cType = res.headers.get("content-type") || ""
    if (res.ok && cType.includes("application/json")) {
      const data = await res.json()
      if (data && Array.isArray(data.rayons)) {
        return data
      }
    }
  } catch (err) {
    console.error("fetchArticleFacets error:", err)
  }

  return { rayons: [], familles: [] }
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
  } catch (err) {
    console.error("searchArticles error:", err)
  }

  return {
    items: [],
    total: 0,
    page: 1,
    pageSize,
  }
}
