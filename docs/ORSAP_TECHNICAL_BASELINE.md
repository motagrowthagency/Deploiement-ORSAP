# ORSAP.ma — Technical Baseline & Full Architectural Audit

**Document Status:** Protected Baseline (Phase 1)  
**Date:** September 2026  
**Auditor:** Senior Full-Stack Developer & SEO Architect  
**Constraint:** Strict Design Freeze (Zero UI/UX Redesign)

---

## 1. Executive Summary

ORSAP.ma is the digital platform for **ORSAP** (Casablanca, Morocco), a leading B2B distributor and service provider specializing in Industrial Equipment, Personal Protective Equipment (EPI), Height Safety (Travail en Hauteur), Material Handling (Manutention), and Industrial Workwear Personalization.

The platform is structured as a dual-runtime system:
1. **Frontend:** React 19 Single Page Application (SPA) powered by Vite 8 and Tailwind CSS v4.
2. **Backend Services:** Dual-mode backend with a Node.js/Express service (`server.js`) for local development / Node hosting, and PHP 8 endpoints (`/api/index.php`, `/admin/index.php`) for Apache / cPanel / Heberjahiz production deployment.
3. **Data Storage:** Hybrid storage architecture utilizing MySQL (`server/database.js`, `public/api/db.php`) with fallback to persistent JSON files (`data/blogs.json`, `data/submissions.json`, `data/applications.json`, `data/users.json`).

---

## 2. Inventory of Routes & Pages

All existing routes must remain strictly preserved with 100% backward compatibility:

| Path | Component | Purpose & Target Content | Status |
| :--- | :--- | :--- | :--- |
| `/` | `Home.tsx` | Main B2B landing page (Hero, Video, Highlights, Solutions overview) | Active |
| `/a-propos` | `About.tsx` | Company background, history, mission, and key metrics | Active |
| `/solutions` | `Solutions.tsx` | Solutions catalog hub covering 15 core industrial domains | Active |
| `/solutions/:category` | `SolutionDetail.tsx` | Main category landing page (e.g. `epi`, `manutention`, `outillage`) | Active |
| `/solutions/:category/:sub` | `SolutionDetail.tsx` | Sub-category deep-dive (e.g. `epi/casques`, `epi/chaussures-securite`) | Active |
| `/solutions/:category/:sub/:sub2` | `SolutionDetail.tsx` | Micro-range deep-dive (e.g. `epi/gants/anti-coupure`) | Active |
| `/blog/prevention` | `PreventionPage.tsx` | Dedicated HSE & Ergonomics Hub | Active |
| `/blog/prevention/ergonomie` | `PreventionPage.tsx` | Ergonomics & physical safety hub | Active |
| `/blog/prevention/tms` | `PreventionPage.tsx` | Musculoskeletal disorder (TMS) prevention guide | Active |
| `/produits` | Redirect | 301 alias redirecting to `/solutions` | Preserved Alias |
| `/produits/:category` | `SolutionDetail.tsx` | Legacy product route alias | Preserved Alias |
| `/produits/:category/:sub` | `SolutionDetail.tsx` | Legacy product route alias | Preserved Alias |
| `/services` | `Services.tsx` | 7 Core Industrial Services catalog | Active |
| `/services/:service` | `ServiceDetail.tsx` | Service detail page (`importation-distribution`, `maintenance-sav`, etc.) | Active |
| `/marques` | `Brands.tsx` | Portfolio of 300+ partner brands | Active |
| `/marques/:brand` | `BrandDetail.tsx` | Dedicated brand focus page | Active |
| `/temoignages` | `Testimonials.tsx` | Client case studies and customer stories | Active |
| `/temoignages/:client` | `TestimonialDetail.tsx` | In-depth client success story | Active |
| `/devis` | `Devis.tsx` | Quotation request form (B2B Lead Generation engine) | Core Converter |
| `/blog` | `Blog.tsx` | Technical articles, safety guides, and HSE regulations | Active |
| `/blog/:id` | `BlogDetail.tsx` | In-depth technical article detail page (100+ articles) | Core SEO Driver |
| `/recrutement` | `Recruitment.tsx` | Job openings and spontaneous application form | Active |
| `/contact` | `Contact.tsx` | Contact info, map, and technical advisory request form | Core Converter |
| `/espace-client` | `EspaceClient.tsx` | Customer portal (Login, Registration, Order status, Quotes) | Active |
| `/espace-client/verify` | `EspaceClient.tsx` | Email token verification handler | Active |
| `/intranet` | `ComingSoon.tsx` | Internal staff portal teaser | Placeholder |

---

## 3. Technology Stack & Architectural Analysis

### Frontend
- **Framework:** React 19 (`react`, `react-dom`, `react-router` v7).
- **Styling:** Tailwind CSS v4 with `@tailwindcss/vite` and standard theme tokens (`var(--color-ink)`, `var(--color-orsap-red)`, `var(--color-safety)`).
- **Build Engine:** Vite 8.0.5 with custom Figma Make plugins and `@/` path alias.
- **Typography:** Archivo (Display headlines), Inter (Body copy), JetBrains Mono (Technical badges).

### Backend & API Architecture
- **Node.js Environment:** Express 5 (`server.js`) with in-memory rate limiting, CORS configuration, JWT auth, Nodemailer SMTP transport, and MySQL connection pool.
- **PHP Environment:** `public/api/index.php` and `public/admin/index.php` providing complete parity with Node API for Apache/cPanel environments.
- **Database Driver:** `mysql2` on Node and `PDO_MySQL` on PHP with seamless fallback to flat JSON files in `data/`.

---

## 4. Current State Audit & Gap Analysis

### 4.1. Technical SEO Audit
- **Issue 1 (Metadata):** Most pages (`/solutions/*`, `/services/*`, `/marques/*`, `/a-propos`, `/contact`, `/devis`) rely on a static fallback title from `index.html` without unique title tags, meta descriptions, or Open Graph tags.
- **Issue 2 (Canonical Tags):** Missing `<link rel="canonical">` across dynamic routes, risking duplicate content between `/produits/*` and `/solutions/*`.
- **Issue 3 (Structured Data):** Only `BlogDetail.tsx` had basic JSON-LD, but it dumped complete article text into `keywords`. Rich schemas (`Organization`, `WebSite`, `BreadcrumbList`, `Product`, `Service`, `FAQPage`) are absent across core catalog pages.
- **Issue 4 (Robots & Sitemap):** Missing static `robots.txt` and `sitemap.xml` mapping all canonical URLs.

### 4.2. Analytics & Conversion Tracking Audit
- **Issue 1 (GA4):** No centralized GA4 event dispatcher for SPA route changes (`page_view`).
- **Issue 2 (Conversion Events):** Clicks on primary conversion drivers (Phone `tel:+212644203030`, WhatsApp `https://wa.me/212644203030`, Email `mailto:orsap@orsap.ma`, Quotation CTA buttons, Catalogue downloads) are not tracked as conversion events.
- **Issue 3 (Form Telemetry):** Forms (`/devis`, `/contact`, `/recrutement`) do not dispatch `form_start` or `generate_lead` standard events.

### 4.3. Marketing Attribution & Lead Classification Audit
- **Issue 1 (Attribution):** UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, etc.) and referrer data are lost on navigation and not attached to lead submissions.
- **Issue 2 (Lead Classification):** Submissions lack programmatic classification (`PRODUCT_LEAD`, `QUOTE_LEAD`, `HSE_LEAD`, `PROJECT_LEAD`, `CATALOG_LEAD`, `TECHNICAL_LEAD`).

### 4.4. Security Audit
- **Headers:** Basic headers exist (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`). Strict Content Security Policy (CSP) and HSTS need enhancement.
- **File Protection:** Apache `.htaccess` correctly protects `.env`, `.json`, and `.git` from direct HTTP requests.
- **Input Sanitization:** Contact and quote endpoints require thorough string trimming, XSS escaping, and email format validation.

---

## 5. Approved Production Design Rules (Design Freeze)
- The entire layout, colors, typography, header, footer, interactive modals, and forms are strictly locked.
- No new UI libraries, no CSS overhauls, and no structural page refactoring.
- All optimizations must occur exclusively in the head manager, background tracking scripts, backend controllers, and SEO metadata layer.
