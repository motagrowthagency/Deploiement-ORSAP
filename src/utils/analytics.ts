declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

/**
 * Ensures dataLayer is initialized.
 */
function ensureDataLayer() {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || []
  }
}

/**
 * Checks if the user has allowed analytics cookies.
 */
function isAnalyticsAllowed(): boolean {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem("orsap_cookie_consent")
  if (!stored) return true // default until user explicitly refuses or accepts
  try {
    const parsed = JSON.parse(stored)
    return parsed.analytics !== false
  } catch {
    return true
  }
}

/**
 * Pushes event to Google Tag Manager and GA4 if consent granted.
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return

  // Respect user cookie preferences
  if (!isAnalyticsAllowed()) {
    if (import.meta.env.DEV) {
      console.log(`[Analytics Blocked by Cookie Preferences] ${eventName}`)
    }
    return
  }

  ensureDataLayer()

  const payload = {
    event: eventName,
    ...params,
    timestamp: new Date().toISOString(),
  }

  window.dataLayer?.push(payload)

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params)
  }

  // Development logger for verification
  if (import.meta.env.DEV) {
    console.log(`[Analytics Event] ${eventName}:`, payload)
  }
}

/**
 * Tracks SPA Virtual Pageviews.
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  trackEvent("page_view", {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  })
}

/**
 * Tracks CTA button clicks (Devis, Solution discovery, etc.).
 */
export function trackCtaClick(label: string, destination: string, location: string) {
  trackEvent("cta_click", {
    cta_label: label,
    cta_destination: destination,
    cta_location: location,
  })
}

/**
 * Tracks Phone link clicks.
 */
export function trackPhoneClick(phoneNumber: string, location: string) {
  trackEvent("phone_click", {
    phone_number: phoneNumber,
    click_location: location,
  })
}

/**
 * Tracks WhatsApp link clicks.
 */
export function trackWhatsAppClick(location: string) {
  trackEvent("whatsapp_click", {
    whatsapp_number: "+212644203030",
    click_location: location,
  })
}

/**
 * Tracks Email link clicks.
 */
export function trackEmailClick(emailAddress: string, location: string) {
  trackEvent("email_click", {
    email_address: emailAddress,
    click_location: location,
  })
}

/**
 * Tracks Form Start (User starts typing or interacting with a form).
 */
export function trackFormStart(formName: string) {
  trackEvent("form_start", {
    form_name: formName,
  })
}

/**
 * Tracks Lead Generation / Form Submission.
 */
export function trackGenerateLead(params: {
  formName: string
  leadType: string
  company?: string
  solutions?: string[]
  value?: number
}) {
  trackEvent("generate_lead", {
    form_name: params.formName,
    lead_type: params.leadType,
    company: params.company || "Non renseigné",
    solutions: params.solutions || [],
    currency: "MAD",
    value: params.value || 0,
  })
}

/**
 * Tracks Catalogue Downloads & Views.
 */
export function trackCatalogueInteraction(action: "catalogue_view" | "catalogue_download", catalogueName: string) {
  trackEvent(action, {
    catalogue_name: catalogueName,
  })
}
