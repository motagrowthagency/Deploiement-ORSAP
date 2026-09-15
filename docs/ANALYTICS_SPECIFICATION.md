# ORSAP.ma — Analytics Specification & Conversion Tracking

**Tracking Standard:** Google Analytics 4 (GA4) / Google Tag Manager (GTM)  
**Implementation Mode:** Privacy-friendly, zero UI alteration, event-driven dataLayer.

---

## 1. Google Analytics 4 (GA4) Event Architecture

All critical conversion actions and user engagements are tracked via standard and custom GA4 events:

| Event Name | Trigger | Parameters | Purpose |
| :--- | :--- | :--- | :--- |
| `page_view` | Route transition in React Router | `page_path`, `page_title`, `page_location` | Virtual SPA Pageview tracking |
| `cta_click` | Click on "Demander un devis" or primary CTAs | `cta_label`, `cta_destination`, `cta_location` | Measuring intent on key entry points |
| `form_start` | First user keystroke in any lead form | `form_name` (`devis`, `contact`, `recrutement`) | Funnel drop-off and form initiation rate |
| `generate_lead` | Successful form submission | `form_name`, `lead_type`, `company`, `solutions` | Primary macro conversion metric |
| `phone_click` | Click on `tel:+212644203030` | `phone_number`, `click_location` (header, footer, contact) | Direct telephone contact intent |
| `whatsapp_click` | Click on WhatsApp link | `whatsapp_number`, `click_location` | Instant B2B conversation conversion |
| `email_click` | Click on `mailto:orsap@orsap.ma` | `email_address`, `click_location` | Direct RFQ email conversion |
| `catalogue_view` | Viewing / browsing product catalog | `catalogue_name` | Catalog engagement |
| `catalogue_download`| Downloading product or solution PDF | `catalogue_name` | Mid-funnel technical intent |

---

## 2. Lead Classification Model

Every lead submitted via the platform is programmatically assigned a `lead_type`:

1. `QUOTE_LEAD`: Direct RFQ (Demande de devis) across multi-category products.
2. `PRODUCT_LEAD`: Specific inquiry regarding an individual SKU, catalog item, or brand.
3. `HSE_LEAD`: Prevention, safety audit, lifelines, fall arrest, ergonomics, and compliance.
4. `PROJECT_LEAD`: Industrial installation, workshop setup, piping, or HVAC project.
5. `CATALOG_LEAD`: Documentation or catalog download request.
6. `TECHNICAL_LEAD`: Technical consulting, FDS, maintenance, or after-sales request.

---

## 3. Marketing Attribution & UTM Persistence

Attribution data is captured upon arrival and preserved across the session in `sessionStorage`:
- `utm_source` (e.g. `google`, `linkedin`, `email_newsletter`)
- `utm_medium` (e.g. `cpc`, `organic`, `referral`)
- `utm_campaign` (e.g. `epi_btp_2026`, `travail_hauteur`)
- `utm_term` / `utm_content`
- `referrer`
- `landing_page`
- `timestamp`

When a user submits a form, this attribution payload is automatically attached to the submission.
