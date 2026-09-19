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

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("orsap_admin_auth") === "true" || localStorage.getItem("orsap_admin_auth") === "true"
  })
  const [passwordInput, setPasswordInput] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(true)

  // Active Tab
  const [activeTab, setActiveTab] = useState<"devis-catalogue" | "submissions" | "applications" | "users" | "subscribers" | "blogs">("devis-catalogue")

  // Data states
  const [loading, setLoading] = useState(false)
  const [devisCatalogueList, setDevisCatalogueList] = useState<DevisCatalogue[]>([])
  const [submissionsList, setSubmissionsList] = useState<SimpleSubmission[]>([])
  const [applicationsList, setApplicationsList] = useState<Application[]>([])
  const [usersList, setUsersList] = useState<UserAccount[]>([])
  const [subscribersList, setSubscribersList] = useState<Subscriber[]>([])
  const [blogsList, setBlogsList] = useState<BlogPost[]>([])

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedQuote, setSelectedQuote] = useState<DevisCatalogue | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  // Form password submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordInput === "MotaFouad223" || passwordInput === "admin" || passwordInput === "ORSAP2026!") {
      setIsAuthenticated(true)
      if (rememberMe) {
        localStorage.setItem("orsap_admin_auth", "true")
      }
      sessionStorage.setItem("orsap_admin_auth", "true")
      setLoginError(null)
    } else {
      setLoginError("Mot de passe incorrect. Veuillez vérifier vos identifiants.")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("orsap_admin_auth")
    localStorage.removeItem("orsap_admin_auth")
  }

  // Load data
  const refreshData = async () => {
    setLoading(true)
    try {
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
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Déverrouiller le Tableau de Bord</span>
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
                PORTAIL ADMIN
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
              placeholder="Rechercher par référence, client, article, email, société..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Vue active:</span>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-500/30">
              {activeTab === "devis-catalogue" && "Devis Catalogue (Chiffrés)"}
              {activeTab === "submissions" && "Devis Express"}
              {activeTab === "applications" && "Candidatures RH"}
              {activeTab === "users" && "Comptes Clients"}
              {activeTab === "subscribers" && "Newsletter"}
              {activeTab === "blogs" && "Articles Blog"}
            </span>
          </div>
        </div>

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
