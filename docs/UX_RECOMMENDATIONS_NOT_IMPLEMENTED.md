# ORSAP.ma — UX Recommendations Ledger (NOT IMPLEMENTED)

**Compliance Notice:** In accordance with **Rule 30 ("NO UNAUTHORIZED UX IMPROVEMENTS")** and **Rule 31 ("DESIGN FREEZE")**, no changes have been made to the layout, visual hierarchy, styling, navigation, button placements, cards, typography, or interaction design.

The following potential UX enhancements were identified during the technical and commercial audit and are documented here exclusively for future review by the product owner:

---

## 1. Sticky Quick-Quote Drawer on Mobile
- **Identified Problem:** On deep product and solution pages on mobile devices, users must scroll significantly to reach the quotation CTA or open the hamburger menu.
- **Recommendation:** Add a subtle bottom floating bar on mobile screens (`Demander un devis rapide` + `WhatsApp direct`).
- **Expected Benefit:** +15-25% increase in mobile lead conversions.
- **Risk:** Minor obstruction of bottom content if not tuned.
- **Priority:** Medium
- **Status:** **NOT IMPLEMENTED (Design Freeze)**

---

## 2. Multi-Step Quotation Form with Progress Indicator
- **Identified Problem:** The current `/devis` form presents all fields at once, which could cause slight abandonment on mobile viewports for non-professional inquiries.
- **Recommendation:** Implement a 2-step wizard (Step 1: Selection of solutions & sectors; Step 2: Contact & Company info).
- **Expected Benefit:** Enhanced form completion rate and clearer segmentation.
- **Risk:** Requires user testing on desktop vs mobile.
- **Priority:** Low / Medium
- **Status:** **NOT IMPLEMENTED (Design Freeze)**

---

## 3. Inline Live Search in Solutions & Blog
- **Identified Problem:** With over 100+ blog articles and 15+ solution domains, navigation is predominantly hierarchical.
- **Recommendation:** Add a global instant search modal (Cmd/Ctrl + K or header search input) filtering solutions, brands, and articles in real-time.
- **Expected Benefit:** Drastically faster time-to-product for returning technical purchasers.
- **Risk:** Minimal, requires modal overlay design.
- **Priority:** High (for next major release)
- **Status:** **NOT IMPLEMENTED (Design Freeze)**

---

## 4. Downloadable Technical Specs Sheet Modal
- **Identified Problem:** Visitors seeking specific technical datasheets (FDS, EN certificates) currently submit a general quote form.
- **Recommendation:** Introduce direct "Télécharger la fiche technique" CTA triggers requiring an email capture before opening the PDF.
- **Expected Benefit:** Immediate capture of high-intent B2B leads (`CATALOG_LEAD`).
- **Risk:** Needs dedicated PDF asset repository.
- **Priority:** High
- **Status:** **NOT IMPLEMENTED (Design Freeze)**
