import { useEffect } from "react"
import { useLocation } from "react-router"

export type BreadcrumbItem = {
  name: string
  url: string
}

export type SEOProps = {
  title: string
  description?: string
  keywords?: string[]
  canonical?: string
  image?: string
  type?: "website" | "article" | "product"
  noIndex?: boolean
  breadcrumbs?: BreadcrumbItem[]
  jsonLd?: Record<string, any> | Array<Record<string, any>>
}

const DEFAULT_TITLE = "ORSAP — Import & Distribution d'Équipements Industriels au Maroc"
const DEFAULT_DESCRIPTION =
  "Fournisseur B2B d'Équipements de Protection Individuelle (EPI), solutions de travail en hauteur, manutention, outillage et vêtements professionnels personnalisés au Maroc."
const BASE_URL = "https://orsap.ma"
const DEFAULT_IMAGE = "https://orsap.ma/apple-touch-icon.png"

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
  breadcrumbs,
  jsonLd,
}: SEOProps) {
  const location = useLocation()
  const currentPath = canonical || `${BASE_URL}${location.pathname}`
  const fullTitle = title.includes("ORSAP") ? title : `${title} | ORSAP Maroc`

  useEffect(() => {
    // 1. Update Title
    const prevTitle = document.title
    document.title = fullTitle

    // Helper to update or create meta tag
    function setMeta(attribute: string, value: string, content: string) {
      let element = document.querySelector(`meta[${attribute}="${value}"]`)
      if (!element) {
        element = document.createElement("meta")
        element.setAttribute(attribute, value)
        document.head.appendChild(element)
      }
      element.setAttribute("content", content)
    }

    // 2. Standard Metadata
    setMeta("name", "description", description)
    if (keywords && keywords.length > 0) {
      setMeta("name", "keywords", keywords.join(", "))
    }
    setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1")

    // 3. Open Graph
    setMeta("property", "og:title", fullTitle)
    setMeta("property", "og:description", description)
    setMeta("property", "og:type", type)
    setMeta("property", "og:url", currentPath)
    setMeta("property", "og:image", image.startsWith("http") ? image : `${BASE_URL}${image}`)
    setMeta("property", "og:site_name", "ORSAP")
    setMeta("property", "og:locale", "fr_MA")

    // 4. Twitter Card
    setMeta("name", "twitter:card", "summary_large_image")
    setMeta("name", "twitter:title", fullTitle)
    setMeta("name", "twitter:description", description)
    setMeta("name", "twitter:image", image.startsWith("http") ? image : `${BASE_URL}${image}`)

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement("link")
      canonicalLink.setAttribute("rel", "canonical")
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute("href", currentPath)

    // 6. Structured Data (JSON-LD)
    const scriptId = "dynamic-json-ld"
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null
    if (!scriptTag) {
      scriptTag = document.createElement("script")
      scriptTag.id = scriptId
      scriptTag.type = "application/ld+json"
      document.head.appendChild(scriptTag)
    }

    // Base sitewide schemas
    const schemas: Array<Record<string, any>> = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "ORSAP",
        "legalName": "ORSAP SARL",
        "url": BASE_URL,
        "logo": `${BASE_URL}/apple-touch-icon.png`,
        "telephone": "+212644203030",
        "email": "orsap@orsap.ma",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Casablanca",
          "addressCountry": "MA"
        },
        "sameAs": [
          "https://www.linkedin.com/company/orsap"
        ]
      }
    ]

    // BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url.startsWith("http") ? crumb.url : `${BASE_URL}${crumb.url}`
        }))
      })
    }

    // Custom or Page-Specific Schemas
    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        schemas.push(...jsonLd)
      } else {
        schemas.push(jsonLd)
      }
    }

    scriptTag.text = JSON.stringify(schemas.length === 1 ? schemas[0] : {
      "@context": "https://schema.org",
      "@graph": schemas
    })

    return () => {
      document.title = prevTitle
    }
  }, [fullTitle, description, keywords, currentPath, image, type, noIndex, breadcrumbs, jsonLd])

  return null
}
