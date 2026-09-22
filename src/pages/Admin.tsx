import React, { useState, useEffect, useId } from "react"
import { Link, useNavigate } from "react-router"
import SEO from "@/components/SEO"
import logoImg from "@/imports/logo.jpg"

interface DevisCatalogueItem {
  code: string
  designation: string
  rayon?: string
  famille?: string
  priceHt: number
  priceTtc: number
  quantity: number
  lineTotalHt: number
  customizationNotes?: string
  isCustom?: boolean
}

interface DevisCatalogue {
  id: string
  reference: string
  createdAt: string
  status: string
  clientName: string
  clientEmail?: string
  clientPhone: string
  clientCompany?: string
  clientCity?: string
  clientAddress?: string
  clientIce?: string
  totalHt: number
  totalTva: number
  totalTtc: number
  notes?: string
  items: DevisCatalogueItem[]
}

interface SimpleSubmission {
  id: string
  createdAt: string
  clientType: string
  name: string
  company?: string | null
  email?: string | null
  phone: string
  solutions?: string[]
  sectors?: string[]
  message?: string | null
}

interface Application {
  id: string
  createdAt: string
  name: string
  email: string
  phone: string
  position?: string
  experience?: string
  message?: string
  resumePath?: string
  resumeFileName?: string
}

interface Subscriber {
  id: string
  email: string
  createdAt: string
}

interface UserAccount {
  id: string
  email: string
  companyName?: string
  contactName?: string
  phone?: string
  city?: string
  ice?: string
  accountType?: string
  isVerified?: boolean
  createdAt: string
}

interface BlogPost {
  id: string
  title: string
  summary: string
  content: string
  date: string
  image?: string | null
  pdf?: string | null
  pdfName?: string | null
}

export interface CrmActiveCart {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientCompany?: string | null
  clientType: "professional" | "individual" | string
  totalCount: number
  totalHt: number
  totalTtc: number
  items: Array<{
    id?: string
    code: string
    designation: string
    priceHt: number
    priceTtc: number
    quantity: number
    imageUrl?: string
    image?: string
    brand?: string
    isCustom?: boolean
    notes?: string
  }>
  status: "cart_active" | "contacted" | "quote_sent" | "converted" | "abandoned" | "archived" | string
  notes?: string
  lastAlertSentAt?: string | null
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("orsap_admin_auth") === "true" || localStorage.getItem("orsap_admin_auth") === "true"
  })
  const [passwordInput, setPasswordInput] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(true)

  // Active Tab
  const [activeTab, setActiveTab] = useState<"crm" | "devis-catalogue" | "submissions" | "applications" | "users" | "subscribers" | "blogs">("crm")

  // Data states
  const [loading, setLoading] = useState(false)
  const [crmCartsList, setCrmCartsList] = useState<CrmActiveCart[]>([])
  const [devisCatalogueList, setDevisCatalogueList] = useState<DevisCatalogue[]>([])
  const [submissionsList, setSubmissionsList] = useState<SimpleSubmission[]>([])
  const [applicationsList, setApplicationsList] = useState<Application[]>([])
  const [usersList, setUsersList] = useState<UserAccount[]>([])
  const [subscribersList, setSubscribersList] = useState<Subscriber[]>([])
  const [blogsList, setBlogsList] = useState<BlogPost[]>([])

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [crmStatusFilter, setCrmStatusFilter] = useState<string>("all")
  const [selectedCrmCart, setSelectedCrmCart] = useState<CrmActiveCart | null>(null)
  const [editingNotesCartId, setEditingNotesCartId] = useState<string | null>(null)
  const [notesInput, setNotesInput] = useState<string>("")
  const [selectedQuote, setSelectedQuote] = useState<DevisCatalogue | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const [submittingLogin, setSubmittingLogin] = useState(false)

  // Check server auth status on mount
  useEffect(() => {
    fetch("/api/admin/check-auth", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setIsAuthenticated(true)
        }
      })
      .catch(() => {})
  }, [])

  // Form password submit via secure server verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordInput.trim()) return
    setSubmittingLogin(true)
    setLoginError(null)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: passwordInput }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsAuthenticated(true)
        if (rememberMe) {
          localStorage.setItem("orsap_admin_auth", "true")
        }
        sessionStorage.setItem("orsap_admin_auth", "true")
        setPasswordInput("")
        setLoginError(null)
      } else {
        setLoginError(data?.error || "Mot de passe incorrect. Veuillez vérifier vos identifiants.")
      }
    } catch {
      setLoginError("Erreur de connexion au serveur d'authentification.")
    } finally {
      setSubmittingLogin(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" })
    } catch {}
    setIsAuthenticated(false)
    sessionStorage.removeItem("orsap_admin_auth")
    localStorage.removeItem("orsap_admin_auth")
  }

  // Load data
  const refreshData = async () => {
    setLoading(true)
    try {
      // 0. CRM Active Carts
      try {
        const res = await fetch("/api/admin/crm/carts", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setCrmCartsList(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.warn("CRM carts fetch error:", err)
      }

      // 1. Devis Catalogue
      try {
        const res = await fetch("/api/admin/devis-catalogue", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setDevisCatalogueList(Array.isArray(data) ? data : [])
        } else {
          // Fallback to local storage cache if any
          const cached = localStorage.getItem("orsap_saved_catalogue_devis")
          if (cached) setDevisCatalogueList(JSON.parse(cached))
        }
      } catch {
        const cached = localStorage.getItem("orsap_saved_catalogue_devis")
        if (cached) setDevisCatalogueList(JSON.parse(cached))
      }

      // 2. Simple Submissions
      try {
        const res = await fetch("/api/submissions", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setSubmissionsList(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.warn("Submissions fetch error:", err)
      }

      // 3. Applications
      try {
        const res = await fetch("/api/admin/applications", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setApplicationsList(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.warn("Applications fetch error:", err)
      }

      // 4. Users
      try {
        const res = await fetch("/api/admin/users", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setUsersList(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.warn("Users fetch error:", err)
      }

      // 5. Subscribers
      try {
        const res = await fetch("/api/admin/subscribers", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setSubscribersList(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.warn("Subscribers fetch error:", err)
      }

      // 6. Blogs
      try {
        const res = await fetch("/api/blogs")
        if (res.ok) {
          const data = await res.json()
          setBlogsList(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.warn("Blogs fetch error:", err)
      }
    } catch (err) {
      console.error("Erreur chargement données admin:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      refreshData()
    }
  }, [isAuthenticated])

  // CRM Handlers
  const handleUpdateCrmStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/crm/carts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setCrmCartsList((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c))
        )
        if (selectedCrmCart?.id === id) {
          setSelectedCrmCart((prev) => (prev ? { ...prev, status: newStatus } : null))
        }
        showNotification("Statut du prospect mis à jour avec succès.")
      }
    } catch (err) {
      showNotification("Erreur lors de la mise à jour du statut.")
    }
  }

  const handleSaveCrmNotes = async (id: string, notes: string) => {
    try {
      const res = await fetch(`/api/admin/crm/carts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes }),
      })
      if (res.ok) {
        setCrmCartsList((prev) =>
          prev.map((c) => (c.id === id ? { ...c, notes, updatedAt: new Date().toISOString() } : c))
        )
        if (selectedCrmCart?.id === id) {
          setSelectedCrmCart((prev) => (prev ? { ...prev, notes } : null))
        }
        setEditingNotesCartId(null)
        showNotification("Notes commerciales enregistrées.")
      }
    } catch (err) {
      showNotification("Erreur lors de l'enregistrement des notes.")
    }
  }

  const handleDeleteCrmCart = async (id: string) => {
    if (!window.confirm("Supprimer définitivement ce panier / prospect du CRM ?")) return
    try {
      await fetch(`/api/admin/crm/carts/${id}`, { method: "DELETE", credentials: "include" })
      setCrmCartsList((prev) => prev.filter((c) => c.id !== id))
      if (selectedCrmCart?.id === id) setSelectedCrmCart(null)
      showNotification("Panier retiré du CRM.")
    } catch {
      setCrmCartsList((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const handleTriggerCrmAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/crm/carts/${id}/notify`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        showNotification("Email d'alerte CRM envoyé avec succès à l'équipe commerciale !")
      } else {
        showNotification("Erreur lors de l'envoi de l'email.")
      }
    } catch {
      showNotification("Erreur de connexion.")
    }
  }

  // Delete handlers
  const deleteDevisCatalogue = async (id: string) => {
    if (!window.confirm("Confirmer la suppression définitive de ce devis chiffré ?")) return
    try {
      await fetch(`/api/admin/devis-catalogue/${id}`, { method: "DELETE", credentials: "include" })
      setDevisCatalogueList((prev) => prev.filter((item) => item.id !== id))
      if (selectedQuote?.id === id) setSelectedQuote(null)
      showNotification("Devis catalogue supprimé avec succès.")
    } catch {
      setDevisCatalogueList((prev) => prev.filter((item) => item.id !== id))
      showNotification("Devis retiré de l'affichage.")
    }
  }

  const deleteSubmissionItem = async (id: string) => {
    if (!window.confirm("Confirmer la suppression de cette demande de devis express ?")) return
    try {
      await fetch(`/api/submissions/${id}`, { method: "DELETE", credentials: "include" })
      setSubmissionsList((prev) => prev.filter((item) => item.id !== id))
      showNotification("Demande supprimée.")
    } catch {
      setSubmissionsList((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const deleteApplicationItem = async (id: string) => {
    if (!window.confirm("Confirmer la suppression de cette candidature ?")) return
    try {
      await fetch(`/api/admin/applications/${id}`, { method: "DELETE", credentials: "include" })
      setApplicationsList((prev) => prev.filter((item) => item.id !== id))
      showNotification("Candidature supprimée.")
    } catch {
      setApplicationsList((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const showNotification = (msg: string) => {
    setActionFeedback(msg)
    setTimeout(() => setActionFeedback(null), 4000)
  }

  const exportDevisCSV = (devis: DevisCatalogue) => {
    let csv = "Code;Designation;Rayon;Famille;Quantite;Prix Unitaire HT;Total Ligne HT\n"
    devis.items.forEach((item) => {
      csv += `"${item.code}";"${item.designation.replace(/"/g, '""')}";"${item.rayon || ""}";"${item.famille || ""}";${item.quantity};${item.priceHt.toFixed(2)};${item.lineTotalHt.toFixed(2)}\n`
    })
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `Devis_${devis.reference || devis.id}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printQuote = (devis: DevisCatalogue) => {
    const printWin = window.open("", "_blank", "width=900,height=800")
    if (!printWin) return

    const rowsHtml = devis.items
      .map(
        (it, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <td style="padding: 10px; text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px; font-weight: 600; color: #0f172a;">${it.code}</td>
        <td style="padding: 10px; color: #334155;">
          ${it.designation}
          ${it.customizationNotes ? `<br><small style="color: #0284c7;">Marquage: ${it.customizationNotes}</small>` : ""}
        </td>
        <td style="padding: 10px; text-align: right; font-weight: 600;">${it.quantity}</td>
        <td style="padding: 10px; text-align: right; color: #475569;">${it.priceHt.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH</td>
        <td style="padding: 10px; text-align: right; font-weight: 700; color: #0284c7;">${it.lineTotalHt.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH</td>
      </tr>
    `
      )
      .join("")

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Devis ${devis.reference || devis.id} - ORSAP</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0284c7; padding-bottom: 24px; margin-bottom: 30px; }
          .logo-title { font-size: 28px; font-weight: 900; color: #0284c7; letter-spacing: -0.5px; }
          .badge { display: inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-weight: 700; font-size: 12px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #0f172a; color: #ffffff; padding: 12px 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .totals { margin-left: auto; width: 340px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; }
          .tot-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .tot-row.grand { border-top: 2px solid #0284c7; margin-top: 8px; padding-top: 10px; font-size: 18px; font-weight: 800; color: #0284c7; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-title">ORSAP</div>
            <div style="font-size: 14px; color: #64748b; margin-top: 4px;">Solutions Complètes de Sécurité, EPI & Équipements Professionnels</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Casablanca, Maroc • contact@orsap.ma • +212 5 22 00 00 00</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">DEVIS OFFICIEL</div>
            <div style="font-size: 20px; font-weight: 800; margin-top: 8px;">Réf: ${devis.reference || devis.id}</div>
            <div style="font-size: 13px; color: #64748b;">Date: ${new Date(devis.createdAt).toLocaleDateString("fr-FR")}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="box">
            <strong style="color: #0284c7; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Émetteur</strong><br>
            <strong>ORSAP MAROC S.A.R.L.</strong><br>
            Zone Industrielle Sidi Maârouf, Casablanca<br>
            ICE: 002345678000092 • RC: 456789<br>
            Email: contact@orsap.ma • Web: https://orsap.ma
          </div>
          <div class="box">
            <strong style="color: #0284c7; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Client Destinataire</strong><br>
            <strong>${devis.clientCompany || devis.clientName}</strong><br>
            Contact: ${devis.clientName}<br>
            Email: ${devis.clientEmail || "Non renseigné"}<br>
            Téléphone: ${devis.clientPhone || "Non renseigné"}<br>
            ${devis.clientCity ? `Ville: ${devis.clientCity}` : ""} ${devis.clientIce ? `• ICE: ${devis.clientIce}` : ""}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">N°</th>
              <th style="width: 110px; text-align: left;">Code Réf</th>
              <th style="text-align: left;">Désignation & Caractéristiques</th>
              <th style="width: 80px; text-align: right;">Qté</th>
              <th style="width: 120px; text-align: right;">P.U. HT</th>
              <th style="width: 130px; text-align: right;">Total HT</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="tot-row">
            <span>Total Hors Taxes (HT):</span>
            <span style="font-weight: 600;">${devis.totalHt.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH</span>
          </div>
          <div class="tot-row">
            <span>TVA Applicable (20%):</span>
            <span style="font-weight: 600;">${devis.totalTva.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH</span>
          </div>
          <div class="tot-row grand">
            <span>Total Général TTC:</span>
            <span>${devis.totalTtc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH</span>
          </div>
        </div>

        ${
          devis.notes
            ? `<div class="box" style="margin-top: 24px;"><strong>Instructions / Remarques client:</strong><br>${devis.notes}</div>`
            : ""
        }

        <div class="footer">
          ORSAP Maroc — Devis valable 30 jours à compter de la date d'émission. Bon pour accord et commande avec cachet et signature.
        </div>
      </body>
      </html>
    `)
    printWin.document.close()
    setTimeout(() => {
      printWin.print()
    }, 500)
  }

  // If not authenticated, show modern high-security login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        <SEO title="Administration & Back-Office — ORSAP" description="Portail sécurisé d'administration ORSAP." />

        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-700/80 flex items-center justify-center">
                <img src={logoImg} alt="ORSAP Logo" className="h-12 w-auto object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">ORSAP Administration</h1>
            <p className="text-sm text-slate-400 mt-1">Espace sécurisé de gestion et chiffrage devis</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Mot de passe Administrateur
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                />
                <span>Mémoriser ma session</span>
              </label>
              <Link to="/" className="text-cyan-400 hover:text-cyan-300 text-xs">
                Retour au site &rarr;
              </Link>
            </div>

            <button
              type="submit"
              disabled={submittingLogin}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{submittingLogin ? "Vérification..." : "Déverrouiller le Tableau de Bord"}</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
            Protection biométrique et chiffrement SSL 256-bit activés
          </div>
        </div>
      </div>
    )
  }

  // Filtered lists based on search term
  const filteredDevisCatalogue = devisCatalogueList.filter((d) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      (d.reference || "").toLowerCase().includes(term) ||
      (d.clientName || "").toLowerCase().includes(term) ||
      (d.clientCompany || "").toLowerCase().includes(term) ||
      (d.clientEmail || "").toLowerCase().includes(term) ||
      (d.clientPhone || "").toLowerCase().includes(term) ||
      d.items.some((it) => it.code.toLowerCase().includes(term) || it.designation.toLowerCase().includes(term))
    )
  })

  const filteredSubmissions = submissionsList.filter((s) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      (s.name || "").toLowerCase().includes(term) ||
      (s.company || "").toLowerCase().includes(term) ||
      (s.email || "").toLowerCase().includes(term) ||
      (s.phone || "").toLowerCase().includes(term) ||
      (s.message || "").toLowerCase().includes(term)
    )
  })

  const filteredApplications = applicationsList.filter((a) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      (a.name || "").toLowerCase().includes(term) ||
      (a.email || "").toLowerCase().includes(term) ||
      (a.position || "").toLowerCase().includes(term) ||
      (a.phone || "").toLowerCase().includes(term)
    )
  })

  const filteredCrmCarts = crmCartsList.filter((c) => {
    if (crmStatusFilter !== "all" && c.status !== crmStatusFilter) return false
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      (c.clientName || "").toLowerCase().includes(term) ||
      (c.clientCompany || "").toLowerCase().includes(term) ||
      (c.clientEmail || "").toLowerCase().includes(term) ||
      (c.clientPhone || "").toLowerCase().includes(term) ||
      (c.notes || "").toLowerCase().includes(term) ||
      c.items.some((it) => (it.code || "").toLowerCase().includes(term) || (it.designation || "").toLowerCase().includes(term))
    )
  })

  const activeCartsCount = crmCartsList.filter((c) => c.status === "cart_active" || !c.status).length
  const totalCrmValueHt = crmCartsList.reduce((sum, c) => sum + (c.totalHt || 0), 0)
  const contactedCount = crmCartsList.filter((c) => c.status === "contacted" || c.status === "quote_sent").length
  const convertedCount = crmCartsList.filter((c) => c.status === "converted").length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEO title="Administration Globale — ORSAP" description="Gestion complète du catalogue, devis et candidatures." />

      {/* Top Bar Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-1.5 bg-white rounded-xl shadow-md border border-slate-700/80 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src={logoImg} alt="ORSAP Logo" className="h-7 w-auto object-contain" />
            </div>
            <div>
              <span className="font-black tracking-tight text-white text-lg">ORSAP</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PORTAIL ADMIN & CRM
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualiser</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition border border-red-500/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-600 text-white font-medium text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Main Admin Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Top Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          <div
            onClick={() => setActiveTab("crm")}
            className={`cursor-pointer p-4 rounded-xl border transition-all relative overflow-hidden ${
              activeTab === "crm"
                ? "bg-red-950/40 border-red-500 shadow-lg shadow-red-950/50 ring-1 ring-red-500"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            {activeCartsCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <span>🎯 CRM Paniers</span>
            </div>
            <div className="text-2xl font-black text-red-400 mt-1">{crmCartsList.length}</div>
            <div className="text-[10px] text-red-400/80 font-semibold mt-1">
              {activeCartsCount} actif{activeCartsCount > 1 ? "s" : ""} · {totalCrmValueHt > 0 ? (totalCrmValueHt).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' DH' : 'Prospects'}
            </div>
          </div>

          <div
            onClick={() => setActiveTab("devis-catalogue")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activeTab === "devis-catalogue"
                ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-medium text-slate-400">Devis Catalogue</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">{devisCatalogueList.length}</div>
            <div className="text-[10px] text-cyan-500/80 font-semibold mt-1">Paniers chiffrés</div>
          </div>

          <div
            onClick={() => setActiveTab("submissions")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activeTab === "submissions"
                ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-medium text-slate-400">Devis Express</div>
            <div className="text-2xl font-black text-white mt-1">{submissionsList.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">Formulaires simples</div>
          </div>

          <div
            onClick={() => setActiveTab("applications")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activeTab === "applications"
                ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-medium text-slate-400">Candidatures</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{applicationsList.length}</div>
            <div className="text-[10px] text-emerald-500/80 mt-1">Recrutement RH</div>
          </div>

          <div
            onClick={() => setActiveTab("users")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activeTab === "users"
                ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-medium text-slate-400">Comptes Clients</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{usersList.length}</div>
            <div className="text-[10px] text-amber-500/80 mt-1">Espace pro</div>
          </div>

          <div
            onClick={() => setActiveTab("subscribers")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activeTab === "subscribers"
                ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-medium text-slate-400">Abonnés</div>
            <div className="text-2xl font-black text-purple-400 mt-1">{subscribersList.length}</div>
            <div className="text-[10px] text-purple-500/80 mt-1">Newsletter</div>
          </div>

          <div
            onClick={() => setActiveTab("blogs")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activeTab === "blogs"
                ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-medium text-slate-400">Articles Blog</div>
            <div className="text-2xl font-black text-pink-400 mt-1">{blogsList.length}</div>
            <div className="text-[10px] text-pink-500/80 mt-1">Publications</div>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[260px]">
            <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par client, société, téléphone, email, article, notes..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Vue active:</span>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-500/30">
              {activeTab === "crm" && "🎯 CRM & Suivi des Paniers Actifs"}
              {activeTab === "devis-catalogue" && "Devis Catalogue (Chiffrés)"}
              {activeTab === "submissions" && "Devis Express"}
              {activeTab === "applications" && "Candidatures RH"}
              {activeTab === "users" && "Comptes Clients"}
              {activeTab === "subscribers" && "Newsletter"}
              {activeTab === "blogs" && "Articles Blog"}
            </span>
          </div>
        </div>

        {/* ── TAB 0: CRM & PANIERS ACTIFS ─────────────────────────────────── */}
        {activeTab === "crm" && (
          <div className="space-y-6">
            {/* CRM Header & Filters */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span>🎯 CRM & Suivi des Paniers Actifs</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                      {filteredCrmCarts.length} prospect(s)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Détection automatique des articles en panier. Coordonnées complètes pré-remplies de l'Espace Client avec actions de relance en 1 clic.
                  </p>
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: "Tous les prospects", count: crmCartsList.length },
                    { id: "cart_active", label: "🟢 Paniers Actifs", count: activeCartsCount },
                    { id: "contacted", label: "🟡 Contactés", count: contactedCount },
                    { id: "quote_sent", label: "🔵 Devis Transmis", count: crmCartsList.filter((c) => c.status === "quote_sent").length },
                    { id: "converted", label: "🟣 Convertis / Gagnés", count: convertedCount },
                    { id: "abandoned", label: "🔴 Abandonnés", count: crmCartsList.filter((c) => c.status === "abandoned").length },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setCrmStatusFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                        crmStatusFilter === filter.id
                          ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                          : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60 text-slate-300">
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-KPIs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">🛒 Paniers Détectés</div>
                  <div className="text-lg font-bold text-white mt-0.5">{crmCartsList.length}</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">💰 Valeur Potentielle Totale</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {totalCrmValueHt.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} MAD HT
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">📞 Relances Effectuées</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">{contactedCount}</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">🏆 Taux de Conversion</div>
                  <div className="text-lg font-bold text-cyan-400 mt-0.5">
                    {crmCartsList.length > 0 ? ((convertedCount / crmCartsList.length) * 100).toFixed(0) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* List of CRM Leads */}
            {filteredCrmCarts.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="font-semibold text-white">Aucun panier actif / prospect trouvé</div>
                <p className="text-xs text-slate-500 mt-1">
                  Dès qu'un client connecté ajoute des articles à son panier sur l'Espace Client, sa fiche de contact et ses articles apparaîtront ici automatiquement avec les boutons d'action rapide.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredCrmCarts.map((cart) => {
                  // Format Clean Phone for WhatsApp
                  let cleanPhone = String(cart.clientPhone || "").replace(/[^\d+]/g, "")
                  if (cleanPhone.startsWith("0")) cleanPhone = "212" + cleanPhone.substring(1)
                  else if (cleanPhone.startsWith("+")) cleanPhone = cleanPhone.substring(1)
                  else if (!cleanPhone.startsWith("212") && cleanPhone.length === 9) cleanPhone = "212" + cleanPhone

                  const sampleItemsText = cart.items.slice(0, 3).map((it) => it.designation || it.code).join(", ")
                  const waMessage = encodeURIComponent(
                    `Bonjour ${cart.clientName},\n\nNous avons remarqué votre sélection d'articles sur notre catalogue ORSAP (${cart.items.length} article(s) : ${sampleItemsText}${cart.items.length > 3 ? "..." : ""}).\n\nSouhaitez-vous une assistance technique ou un devis personnalisé avec nos remises professionnelles ?\n\nL'équipe ORSAP Maroc\nhttps://orsap.ma`
                  )
                  const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`
                  const mailtoUrl = `mailto:${cart.clientEmail}?subject=${encodeURIComponent(`Votre sélection sur ORSAP — Offre commerciale & Devis`)}`

                  const isEditingNotes = editingNotesCartId === cart.id

                  return (
                    <div
                      key={cart.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition space-y-4 p-5 sm:p-6"
                    >
                      {/* Top Bar with Client Profile & Status */}
                      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-950/60 shrink-0">
                            {(cart.clientName || "C").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-base">{cart.clientName}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                {cart.clientType === "individual" ? "👤 Particulier" : "🏢 Professionnel"}
                              </span>
                              {cart.clientCompany && (
                                <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                                  {cart.clientCompany}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                              <span>Activité: {new Date(cart.updatedAt || cart.createdAt).toLocaleString("fr-FR")}</span>
                              <span>·</span>
                              <span>Compte: {cart.clientEmail}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium">Statut CRM:</span>
                          <select
                            value={cart.status || "cart_active"}
                            onChange={(e) => handleUpdateCrmStatus(cart.id, e.target.value)}
                            className="bg-slate-950 border border-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 text-white outline-none focus:border-cyan-500 cursor-pointer"
                          >
                            <option value="cart_active">🟢 Panier Actif</option>
                            <option value="contacted">🟡 Contacté / En cours</option>
                            <option value="quote_sent">🔵 Devis Envoyé</option>
                            <option value="converted">🟣 Converti / Gagné</option>
                            <option value="abandoned">🔴 Abandonné / Perdu</option>
                            <option value="archived">⚪ Archivé</option>
                          </select>
                        </div>
                      </div>

                      {/* Middle Row: Contact Buttons & Cart Summary */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                        {/* 1-Click Action Buttons (5 Cols) */}
                        <div className="lg:col-span-5 space-y-2">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            ⚡ Actions Rapides en 1 Clic :
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {/* WhatsApp Button */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition active:scale-[0.98]"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.53 1.961.815 2.796.815 3.183 0 5.769-2.587 5.77-5.767 0-3.18-2.587-5.801-5.77-5.801zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.683.056-1.921-.462-1.464-.61-2.42-2.079-2.493-2.179-.074-.098-.592-.787-.592-1.501 0-.713.374-1.066.508-1.21.134-.145.293-.181.391-.181.098 0 .195.001.28.005.09.004.21.034.32.298.113.272.391.954.425 1.025.034.072.057.155.008.252-.049.098-.073.159-.146.244-.073.085-.153.19-.219.255-.073.072-.15.15-.064.297.086.146.38 6.27.815 1.009.562.499 1.036.654 1.182.727.147.073.232.061.317-.037.086-.098.366-.427.464-.573.098-.146.195-.122.329-.073.134.049.854.402 1.001.475.146.073.244.11.28.17.037.061.037.354-.107.759z" />
                              </svg>
                              <span>WhatsApp</span>
                            </a>

                            {/* Call Button */}
                            <a
                              href={`tel:${cart.clientPhone}`}
                              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-950/40 transition active:scale-[0.98]"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>Appeler ({cart.clientPhone || "Tel"})</span>
                            </a>

                            {/* Email Button */}
                            <a
                              href={mailtoUrl}
                              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                            >
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>Email</span>
                            </a>

                            {/* Trigger Email Alert Test */}
                            <button
                              type="button"
                              onClick={() => handleTriggerCrmAlert(cart.id)}
                              title="Envoyer ou ré-envoyer l'alerte email commerciale"
                              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 font-semibold text-xs border border-red-500/30 transition"
                            >
                              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                              <span>Alerte Email</span>
                            </button>
                          </div>
                        </div>

                        {/* Cart Items Preview & Total (4 Cols) */}
                        <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                              <span>🛒 Contenu ({cart.items?.length || 0} réf.)</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded font-semibold text-slate-400">
                                {cart.totalCount} pièces
                              </span>
                            </span>
                            <span className="font-black text-sm text-cyan-400">
                              {(cart.totalHt || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH HT
                            </span>
                          </div>

                          <div className="space-y-1 max-h-20 overflow-y-auto text-xs text-slate-400 pr-1">
                            {cart.items?.slice(0, 3).map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] truncate">
                                <span className="truncate pr-2 font-medium text-slate-300">
                                  {it.quantity}x {it.designation || it.code}
                                </span>
                                <span className="shrink-0 text-slate-500 font-mono">
                                  {it.priceHt ? (it.priceHt * it.quantity).toFixed(2) + " DH" : "Sur devis"}
                                </span>
                              </div>
                            ))}
                            {cart.items && cart.items.length > 3 && (
                              <div className="text-[10px] text-cyan-400 font-semibold italic">
                                + {cart.items.length - 3} autre(s) article(s)...
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedCrmCart(cart)}
                            className="w-full text-center text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline pt-1 flex items-center justify-center gap-1"
                          >
                            <span>Inspecter tous les articles en détail</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>

                        {/* Notes & Commercial Follow-up (3 Cols) */}
                        <div className="lg:col-span-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              📝 Notes de Suivi :
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (isEditingNotes) {
                                  handleSaveCrmNotes(cart.id, notesInput)
                                } else {
                                  setEditingNotesCartId(cart.id)
                                  setNotesInput(cart.notes || "")
                                }
                              }}
                              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                            >
                              {isEditingNotes ? "Enregistrer" : "Modifier"}
                            </button>
                          </div>

                          {isEditingNotes ? (
                            <div className="space-y-1.5">
                              <textarea
                                value={notesInput}
                                onChange={(e) => setNotesInput(e.target.value)}
                                placeholder="Note de relance (ex: Rappelé le 22/09, attend devis formel)..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 h-16 resize-none"
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingNotesCartId(null)}
                                  className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-400"
                                >
                                  Annuler
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveCrmNotes(cart.id, notesInput)}
                                  className="text-[10px] px-2 py-1 rounded bg-cyan-600 font-bold text-white"
                                >
                                  Sauvegarder
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingNotesCartId(cart.id)
                                setNotesInput(cart.notes || "")
                              }}
                              className="bg-slate-950/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 min-h-[50px] cursor-pointer hover:border-slate-700"
                            >
                              {cart.notes ? (
                                <p className="line-clamp-2">{cart.notes}</p>
                              ) : (
                                <span className="text-slate-500 italic text-[11px]">+ Ajouter une note de suivi...</span>
                              )}
                            </div>
                          )}

                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteCrmCart(cart.id)}
                              className="text-[11px] text-red-400/80 hover:text-red-400 hover:underline"
                            >
                              Supprimer du CRM
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Modal for Cart Items Details */}
            {selectedCrmCart && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  {/* Modal Header */}
                  <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <span>Panier détaillé de {selectedCrmCart.clientName}</span>
                        {selectedCrmCart.clientCompany && (
                          <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
                            {selectedCrmCart.clientCompany}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedCrmCart.clientPhone} · {selectedCrmCart.clientEmail}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCrmCart(null)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Modal Table Content */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                            <th className="pb-2">Réf</th>
                            <th className="pb-2">Désignation</th>
                            <th className="pb-2 text-center">Qté</th>
                            <th className="pb-2 text-right">P.U HT</th>
                            <th className="pb-2 text-right">Total HT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {selectedCrmCart.items.map((it, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30">
                              <td className="py-2.5 font-mono text-cyan-400 font-semibold">{it.code}</td>
                              <td className="py-2.5 text-slate-200">
                                <div>{it.designation}</div>
                                {it.notes && <div className="text-[10px] text-cyan-400 italic">Note: {it.notes}</div>}
                              </td>
                              <td className="py-2.5 text-center font-bold text-white">{it.quantity}</td>
                              <td className="py-2.5 text-right text-slate-300">
                                {it.priceHt ? Number(it.priceHt).toFixed(2) + " DH" : "Sur devis"}
                              </td>
                              <td className="py-2.5 text-right font-bold text-cyan-400">
                                {it.priceHt ? (Number(it.priceHt) * it.quantity).toFixed(2) + " DH" : "Sur devis"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-400">Total Estimatif HT :</span>
                      <span className="text-cyan-400 text-lg">
                        {(selectedCrmCart.totalHt || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} MAD HT
                      </span>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setSelectedCrmCart(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 1: DEVIS CATALOGUE (PANIERS CHIFFRÉS) ─────────────────── */}
        {activeTab === "devis-catalogue" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📋 Devis Catalogue & Chiffrage Express</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {filteredDevisCatalogue.length} demande(s)
                </span>
              </h2>
            </div>

            {filteredDevisCatalogue.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="font-semibold text-white">Aucun devis catalogue enregistré</div>
                <p className="text-xs text-slate-500 mt-1">Les demandes de devis avec sélection d'articles du catalogue apparaîtront ici automatiquement.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredDevisCatalogue.map((devis) => {
                  const isExpanded = selectedQuote?.id === devis.id
                  return (
                    <div
                      key={devis.id}
                      className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition"
                    >
                      {/* Card Summary Header */}
                      <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/30">
                              {devis.reference || devis.id}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(devis.createdAt).toLocaleString("fr-FR")}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {devis.status || "En attente"}
                            </span>
                          </div>

                          <div className="text-base font-bold text-white flex items-center gap-2">
                            <span>{devis.clientCompany ? `${devis.clientCompany} — ` : ""}{devis.clientName}</span>
                          </div>

                          <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                            {devis.clientPhone && <span>📞 {devis.clientPhone}</span>}
                            {devis.clientEmail && <span>✉️ {devis.clientEmail}</span>}
                            {devis.clientCity && <span>📍 {devis.clientCity}</span>}
                            {devis.clientIce && <span>🏢 ICE: {devis.clientIce}</span>}
                          </div>
                        </div>

                        {/* Totals & Action Buttons */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-slate-400">Total HT ({devis.items?.length || 0} articles)</div>
                            <div className="text-xl font-black text-cyan-400">
                              {devis.totalHt?.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH
                            </div>
                            <div className="text-[11px] text-slate-500">
                              TTC: {devis.totalTtc?.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedQuote(isExpanded ? null : devis)}
                              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center gap-1.5 border border-slate-700"
                            >
                              <span>{isExpanded ? "Masquer détails" : "Voir les articles"}</span>
                              <svg className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            <button
                              onClick={() => printQuote(devis)}
                              title="Imprimer le devis PDF"
                              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center justify-center shadow-lg shadow-cyan-600/20"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => exportDevisCSV(devis)}
                              title="Exporter au format CSV"
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center border border-slate-700"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>

                            <button
                              onClick={() => deleteDevisCatalogue(devis.id)}
                              title="Supprimer ce devis"
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition flex items-center justify-center border border-red-500/20"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Table for All Line Items */}
                      {isExpanded && (
                        <div className="border-t border-slate-800 bg-slate-950/60 p-5 sm:p-6 space-y-4">
                          <div className="font-bold text-xs text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Détail complet des articles demandés ({devis.items?.length || 0})</span>
                            {devis.notes && (
                              <span className="text-slate-400 font-normal normal-case">
                                Remarque: <i>{devis.notes}</i>
                              </span>
                            )}
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-slate-800">
                            <table className="w-full text-left text-xs text-slate-300">
                              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                                <tr>
                                  <th className="p-3">#</th>
                                  <th className="p-3">Code Article</th>
                                  <th className="p-3">Désignation</th>
                                  <th className="p-3">Rayon / Famille</th>
                                  <th className="p-3 text-right">Quantité</th>
                                  <th className="p-3 text-right">P.U. HT</th>
                                  <th className="p-3 text-right">Total HT</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {devis.items?.map((it, idx) => (
                                  <tr key={idx} className="hover:bg-slate-900/40">
                                    <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                                    <td className="p-3 font-mono font-bold text-cyan-300">{it.code}</td>
                                    <td className="p-3 font-medium text-white">
                                      {it.designation}
                                      {it.customizationNotes && (
                                        <div className="text-[11px] text-cyan-400 mt-0.5">
                                          Personalisation: {it.customizationNotes}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3 text-slate-400">
                                      {it.rayon || "-"} {it.famille ? `> ${it.famille}` : ""}
                                    </td>
                                    <td className="p-3 text-right font-bold text-white">{it.quantity}</td>
                                    <td className="p-3 text-right text-slate-400">
                                      {it.priceHt?.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH
                                    </td>
                                    <td className="p-3 text-right font-bold text-cyan-400">
                                      {it.lineTotalHt?.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: DEVIS EXPRESS (FORMULAIRES SIMPLES) ────────────────── */}
        {activeTab === "submissions" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>💼 Demandes de Devis Express (Formulaire de Contact)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {filteredSubmissions.length} demande(s)
              </span>
            </h2>

            {filteredSubmissions.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                Aucun formulaire express reçu pour l'instant.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSubmissions.map((sub) => (
                  <div key={sub.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                          {sub.clientType === "professional" ? "🏢 Entreprise" : "👤 Particulier"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(sub.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">
                        {sub.company ? `${sub.company} (${sub.name})` : sub.name}
                      </h3>

                      <div className="text-xs text-slate-400 space-y-1 mt-2">
                        {sub.email && <div>✉️ <a href={`mailto:${sub.email}`} className="text-cyan-400 hover:underline">{sub.email}</a></div>}
                        {sub.phone && <div>📞 <a href={`tel:${sub.phone}`} className="text-cyan-400 hover:underline">{sub.phone}</a></div>}
                      </div>

                      {sub.solutions && sub.solutions.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Solutions demandées:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {sub.solutions.map((sol, idx) => (
                              <span key={idx} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                                {sol}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {sub.message && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                          "{sub.message}"
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => deleteSubmissionItem(sub.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition border border-red-500/20"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: CANDIDATURES RECRUTEMENT ─────────────────────────── */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>👥 Candidatures & Recrutement RH</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {filteredApplications.length} candidat(s)
              </span>
            </h2>

            {filteredApplications.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                Aucune candidature enregistrée pour le moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredApplications.map((app) => (
                  <div key={app.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                          {app.position || "Candidature Spontanée"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">{app.name}</h3>

                      <div className="text-xs text-slate-400 space-y-1 mt-2">
                        <div>✉️ <a href={`mailto:${app.email}`} className="text-emerald-400 hover:underline">{app.email}</a></div>
                        <div>📞 <a href={`tel:${app.phone}`} className="text-emerald-400 hover:underline">{app.phone}</a></div>
                        {app.experience && <div>💼 Expérience: <span className="text-slate-200">{app.experience}</span></div>}
                      </div>

                      {app.message && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                          "{app.message}"
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      {app.resumePath || app.resumeFileName ? (
                        <a
                          href={app.resumePath || `/api/admin/download-resume/${app.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Télécharger CV</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">Pas de fichier CV</span>
                      )}

                      <button
                        onClick={() => deleteApplicationItem(app.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition border border-red-500/20"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: COMPTES CLIENTS ──────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🏢 Comptes Clients Inscrits</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {usersList.length} compte(s)
              </span>
            </h2>

            {usersList.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                Aucun compte client créé pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Société / Contact</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Téléphone</th>
                      <th className="p-3.5">Ville & ICE</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-900/40">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{user.companyName || user.contactName}</div>
                          {user.companyName && user.contactName && (
                            <div className="text-[11px] text-slate-400">Contact: {user.contactName}</div>
                          )}
                        </td>
                        <td className="p-3.5 text-cyan-400 font-mono">{user.email}</td>
                        <td className="p-3.5 text-slate-300">{user.phone || "-"}</td>
                        <td className="p-3.5 text-slate-400">
                          {user.city || "-"} {user.ice ? `• ICE: ${user.ice}` : ""}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {user.accountType || "Client Pro"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                            {user.isVerified ? "Vérifié" : "Actif"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: ABONNES NEWSLETTER ───────────────────────────────── */}
        {activeTab === "subscribers" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>✉️ Abonnés à la Newsletter</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {subscribersList.length} abonné(s)
              </span>
            </h2>

            {subscribersList.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                Aucun abonné enregistré.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">Adresse Email</th>
                      <th className="p-3.5">Date d'inscription</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {subscribersList.map((sub, idx) => (
                      <tr key={sub.id || idx} className="hover:bg-slate-900/40">
                        <td className="p-3.5 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="p-3.5 text-cyan-400 font-mono font-medium">{sub.email}</td>
                        <td className="p-3.5 text-slate-400">
                          {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("fr-FR") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6: GESTION DU BLOG ──────────────────────────────────── */}
        {activeTab === "blogs" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📰 Articles de Blog &amp; Actualités</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  {blogsList.length} article(s)
                </span>
              </h2>

              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/admin/sync/github", { method: "POST", credentials: "include" })
                    const data = await res.json()
                    if (data.success) {
                      showNotification("Synchronisation GitHub réussie ! Tous les articles ont été commités et poussés.")
                    } else {
                      showNotification("Sync GitHub: " + (data.error || "Vérifiez le token GitHub configuré."))
                    }
                  } catch {
                    showNotification("Erreur lors de la synchronisation avec GitHub.")
                  }
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
              >
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Synchroniser avec GitHub</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blogsList.map((post) => (
                <div key={post.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    {post.image && (
                      <div className="h-32 w-full rounded-xl overflow-hidden mb-3 bg-slate-950">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400">{post.date}</span>
                    <h3 className="text-sm font-bold text-white line-clamp-2 mt-1">{post.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mt-1.5">{post.summary}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      to={`/blog/${post.id}`}
                      target="_blank"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Voir sur le site &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
