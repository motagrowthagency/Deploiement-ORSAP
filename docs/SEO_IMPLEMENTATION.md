# ORSAP.ma — Technical SEO & Structured Data Implementation

**Document Status:** Approved Architecture  
**Target Search Engine:** Google (Google.ma / Google.com)  
**Primary Language & Locale:** French (`fr_MA`), targeting Morocco & Francophone Africa B2B industrial procurement.

---

## 1. Architecture Overview

Technical SEO is implemented through a dynamic, lightweight React component (`src/components/SEO.tsx`) and static HTML build directives (`vite.config.ts`, `public/robots.txt`, `public/sitemap.xml`).

### Key Principles:
1. **Dynamic Metadata per Route:** Unique `<title>`, `<meta name="description">`, and `<link rel="canonical">` on every route.
2. **Open Graph & Twitter Cards:** Full social graph metadata for preview sharing on LinkedIn, WhatsApp, and Twitter.
3. **Structured Data (Schema.org JSON-LD):** Semantic entity graph linking Organization, WebSite, BreadcrumbList, Product, Service, and BlogPosting schemas without fabricating claims or data.
4. **Crawl Efficiency:** Static `sitemap.xml` listing 140+ indexable canonical endpoints and optimized `robots.txt`.

---

## 2. Structured Data Schemas Deployed

### 2.1. Sitewide `Organization` & `WebSite` Schema
Injected globally on all routes:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ORSAP",
  "legalName": "ORSAP SARL",
  "url": "https://orsap.ma",
  "logo": "https://orsap.ma/apple-touch-icon.png",
  "telephone": "+212644203030",
  "email": "orsap@orsap.ma",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Casablanca",
    "addressCountry": "MA"
  }
}
```

### 2.2. Solution & Product Schemas (`Product` / `Offer`)
Applied to `/solutions/:category/*` pages:
- Name, description, image, and category mapping.
- Provider and brand relationships.
- Strictly verifiable data (no fake review stars or invented aggregate ratings).

### 2.3. Article & Editorial Schemas (`BlogPosting` / `Article`)
Applied to `/blog/:id` and `/blog/prevention/*` pages:
- Headline, excerpt, publish date, author organization, publisher.

### 2.4. Service Schema (`Service`)
Applied to `/services/:service` pages:
- Service name, provider, areaServed (Morocco), terms of service highlights.

---

## 3. On-Page SEO Guidelines & Hierarchy

- **Single `<h1>` Tag:** Every page features exactly one semantic `<h1>` tag matching the search query intent.
- **Heading Hierarchy:** Natural `<h2>` and `<h3>` tags structuring solutions, technical specifications, and key advantages.
- **Image Optimization:** All visual assets have descriptive `alt` attributes highlighting technical compliance (e.g. `Harnais antichute EN 361 ORSAP Maroc`).
- **Internal Linking:** Seamless cross-linking between solutions, HSE services, and technical guides.
