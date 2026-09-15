export type LeadClassification =
  | "PRODUCT_LEAD"
  | "QUOTE_LEAD"
  | "HSE_LEAD"
  | "PROJECT_LEAD"
  | "CATALOG_LEAD"
  | "TECHNICAL_LEAD"

export type AttributionData = {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  referrer: string | null
  landing_page: string | null
  timestamp: string | null
}

const STORAGE_KEY = "orsap_attribution_session"

/**
 * Initializes attribution tracking on initial page load or query change.
 * Saves first-touch and last-touch UTM parameters into sessionStorage.
 */
export function initAttribution(): void {
  if (typeof window === "undefined") return

  try {
    const urlParams = new URLSearchParams(window.location.search)
    const hasUtm =
      urlParams.has("utm_source") ||
      urlParams.has("utm_medium") ||
      urlParams.has("utm_campaign")

    let stored = getStoredAttribution()

    if (!stored || hasUtm) {
      const attribution: AttributionData = {
        utm_source: urlParams.get("utm_source") || stored?.utm_source || null,
        utm_medium: urlParams.get("utm_medium") || stored?.utm_medium || null,
        utm_campaign: urlParams.get("utm_campaign") || stored?.utm_campaign || null,
        utm_term: urlParams.get("utm_term") || stored?.utm_term || null,
        utm_content: urlParams.get("utm_content") || stored?.utm_content || null,
        referrer: document.referrer || stored?.referrer || "direct",
        landing_page: stored?.landing_page || window.location.pathname,
        timestamp: new Date().toISOString(),
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
    }
  } catch {}
}

export function getStoredAttribution(): AttributionData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Classifies a B2B lead based on contextual inputs.
 */
export function classifyLead(params: {
  formType?: string
  solutions?: string[]
  sectors?: string[]
  category?: string
  message?: string
  subject?: string
}): LeadClassification {
  const text = `${params.formType || ""} ${params.category || ""} ${params.subject || ""} ${params.message || ""} ${(params.solutions || []).join(" ")} ${(params.sectors || []).join(" ")}`.toLowerCase()

  if (text.includes("catalogue") || text.includes("brochure") || text.includes("documentation")) {
    return "CATALOG_LEAD"
  }
  if (
    text.includes("hse") ||
    text.includes("prévention") ||
    text.includes("prevention") ||
    text.includes("ergonomie") ||
    text.includes("tms") ||
    text.includes("ligne de vie") ||
    text.includes("audit de sécurité")
  ) {
    return "HSE_LEAD"
  }
  if (
    text.includes("étude") ||
    text.includes("etude") ||
    text.includes("projet") ||
    text.includes("installation") ||
    text.includes("aménagement") ||
    text.includes("amenagement") ||
    text.includes("climatisation") ||
    text.includes("fluide")
  ) {
    return "PROJECT_LEAD"
  }
  if (
    text.includes("conseil technique") ||
    text.includes("sav") ||
    text.includes("maintenance") ||
    text.includes("norme") ||
    text.includes("dimensionnement")
  ) {
    return "TECHNICAL_LEAD"
  }
  if (
    text.includes("produit") ||
    text.includes("référence") ||
    text.includes("reference") ||
    text.includes("gant") ||
    text.includes("chaussure") ||
    text.includes("casque") ||
    text.includes("harnais") ||
    text.includes("transpalette")
  ) {
    return "PRODUCT_LEAD"
  }
  return "QUOTE_LEAD"
}
