# ORSAP.ma — Brevo (Sendinblue) / CRM Integration Architecture

**Document Status:** Technical Architecture & Ready-to-Connect Spec  
**Target Platform:** Brevo Marketing Platform & Brevo CRM API v3  
**Security Standard:** Strict Environment Variables (Zero credentials in client code)

---

## 1. Overview & Objective

This document specifies the technical architecture for syncing B2B leads generated on ORSAP.ma directly into Brevo (or any compliant CRM), enabling:
- Automated lead notification to ORSAP sales representatives.
- Segmented marketing automation sequences based on lead classification (`QUOTE_LEAD`, `HSE_LEAD`, `PROJECT_LEAD`, `PRODUCT_LEAD`).
- Contact list enrichment with UTM attribution data.

---

## 2. Brevo Contact Attribute Schema

When a contact is created or updated in Brevo via API (`POST /v3/contacts`), the payload maps to the following custom contact attributes:

| Brevo Attribute | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `PRENOM` / `NOM` | Text | Contact Name / Full Name | "Karim Benali" |
| `SOCIETE` | Text | Company / Enterprise Name | "BTP Maroc SA" |
| `SECTEUR` | Text | Business Sector | "BTP", "Industrie", "Energie" |
| `SOLUTIONS_INTERET` | Text / Array | Requested Solutions | "EPI, Manutention" |
| `TYPE_LEAD` | Text | Lead Classification | "QUOTE_LEAD", "HSE_LEAD" |
| `SOURCE_CAMPAGNE` | Text | `utm_source` | "google", "linkedin" |
| `MEDIUM_CAMPAGNE` | Text | `utm_medium` | "cpc", "email" |
| `NOM_CAMPAGNE` | Text | `utm_campaign` | "campagne_securite_hauteur" |
| `PAGE_ENTREE` | Text | Initial Landing Page | "/solutions/travail-en-hauteur" |
| `DERNIER_MESSAGE` | Text | RFQ Message details | "Demande de devis pour 50 harnais..." |

---

## 3. Recommended Brevo List Segmentation

1. **List ID: Devis Industriels (Standard RFQ)**: Receives all `QUOTE_LEAD` and `PRODUCT_LEAD` contacts.
2. **List ID: Grands Projets & HSE**: Receives all `HSE_LEAD` and `PROJECT_LEAD` contacts for dedicated engineer follow-up.
3. **List ID: Candidatures RH**: Receives spontaneous job applications from `/recrutement`.
4. **List ID: Newsletter & Veille Réglementaire**: Receives blog newsletter subscribers.

---

## 4. Backend Implementation Blueprint

When Brevo credentials (`BREVO_API_KEY`) are provided in `.env`:
```javascript
// server/brevo.js
export async function syncLeadToBrevo(leadData) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return // Graceful bypass when key is not configured

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: leadData.email,
        attributes: {
          NOM: leadData.name || leadData.fullName,
          SOCIETE: leadData.company,
          SMS: leadData.phone,
          SECTEUR: (leadData.sectors || []).join(", "),
          SOLUTIONS_INTERET: (leadData.solutions || []).join(", "),
          TYPE_LEAD: leadData.leadType || "QUOTE_LEAD",
          SOURCE_CAMPAGNE: leadData.attribution?.utm_source || "direct",
          MEDIUM_CAMPAGNE: leadData.attribution?.utm_medium || "",
          NOM_CAMPAGNE: leadData.attribution?.utm_campaign || "",
          PAGE_ENTREE: leadData.attribution?.landing_page || "",
          DERNIER_MESSAGE: leadData.message || leadData.details || "",
        },
        updateEnabled: true,
      }),
    })
    return await response.json()
  } catch (error) {
    console.error("Brevo synchronization error:", error)
  }
}
```

---

## 5. Security & Credential Isolation

- **Zero Client-Side Exposure:** `BREVO_API_KEY` is exclusively read by the Node.js/PHP backend service.
- **Never Hardcoded:** Configured strictly via environment variable `BREVO_API_KEY` in `.env`.
