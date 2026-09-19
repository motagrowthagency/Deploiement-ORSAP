// Interface definitions for Catalogue and Products

export interface Article {
  code: string
  designation: string
  tva?: number
  priceHt?: number
  priceTtc?: number
  rayon?: string
  famille?: string
  image?: string | null
}

export interface FacetItem {
  name: string
  count: number
  rayon?: string
}

export interface Facets {
  rayons: FacetItem[]
  familles: FacetItem[]
}

export const DEFAULT_FACETS: Facets = {
  rayons: [],
  familles: [],
}
