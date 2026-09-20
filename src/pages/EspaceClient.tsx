import { useState, useEffect, useId } from "react"
import { useSearchParams, Link, useNavigate } from "react-router"
import { useAuth, AuthUser } from "@/context/AuthContext"
import SEO from "@/components/SEO"
import B2BCommercePlatform from "@/components/B2BCommercePlatform"


interface Submission {
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

interface CatalogueDevisItem {
  code: string
  designation: string
  rayon?: string
  famille?: string
  priceHt: number
  priceTtc: number
  quantity: number
  lineTotalHt: number
  isCustom?: boolean
}

interface CatalogueDevis {
  id: string
  reference: string
  createdAt: string
  status: string
  totalHt: number
  totalTva: number
  totalTtc: number
  notes?: string
  items: CatalogueDevisItem[]
}

export default function EspaceClient() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, token, login, logout, refreshUser } = useAuth()

  const initialMode = searchParams.get("mode") === "register" ? "register" : "login"
  const [mode, setMode] = useState<"login" | "register">(initialMode)

  // Verification state
  const [verifyingToken, setVerifyingToken] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  // Pending email verification screen state
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [verificationCodeInput, setVerificationCodeInput] = useState("")
  const [resendStatus, setResendStatus] = useState<string | null>(null)
  const [devPreviewUrl, setDevPreviewUrl] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  // Register form state
  const [regType, setRegType] = useState<"professional" | "individual">("professional")
  const [regName, setRegName] = useState("")
  const [regCompany, setRegCompany] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("")
  const [regError, setRegError] = useState<string | null>(null)
  const [regLoading, setRegLoading] = useState(false)

  // Forgot password & reset password state
  const [forgotModalOpen, setForgotModalOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotMsg, setForgotMsg] = useState<string | null>(null)
  const [forgotLoading, setForgotLoading] = useState(false)

  const resetTokenParam = searchParams.get("resetToken")
  const [newPassword, setNewPassword] = useState("")
  const [resetMsg, setResetMsg] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)

  // Client dashboard state
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<"catalogue" | "devis" | "profile" | "docs">(
    tabParam === "devis" || tabParam === "profile" || tabParam === "docs" ? tabParam : "catalogue"
  )
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([])
  const [catalogueDevis, setCatalogueDevis] = useState<CatalogueDevis[]>([])
  const [expandedDevisId, setExpandedDevisId] = useState<string | null>(null)
  const [newlyCreatedDevisRef, setNewlyCreatedDevisRef] = useState<string | null>(null)
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [editName, setEditName] = useState(user?.name || "")
  const [editCompany, setEditCompany] = useState(user?.company || "")
  const [editPhone, setEditPhone] = useState(user?.phone || "")

  const codeInputId = useId()
  const loginEmailId = useId()
  const loginPassId = useId()
  const regNameId = useId()
  const regCompanyId = useId()
  const regEmailId = useId()
  const regPhoneId = useId()
  const regPassId = useId()
  const regConfirmId = useId()
  const forgotEmailId = useId()
  const resetPassId = useId()

  // Update edit form values when user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || "")
      setEditCompany(user.company || "")
      setEditPhone(user.phone || "")
    }
  }, [user])

  // Handle URL token verification on mount
  const tokenParam = searchParams.get("token")
  useEffect(() => {
    if (tokenParam) {
      handleVerifyByToken(tokenParam)
    }
  }, [tokenParam])

  // Handle URL created / highlight params
  useEffect(() => {
    const createdParam = searchParams.get("created")
    const highlightParam = searchParams.get("highlight")
    if (createdParam || highlightParam) {
      const ref = createdParam || highlightParam
      setNewlyCreatedDevisRef(ref)
      if (highlightParam) setExpandedDevisId(highlightParam)
      setActiveTab("devis")
    }
  }, [searchParams])

  // Load client data initially
  useEffect(() => {
    if (token && user) {
      loadClientData(false)
    }
  }, [token, user?.id])

  // Auto-refresh data when switching to the Devis tab
  useEffect(() => {
    if (token && user && activeTab === "devis") {
      loadClientData(true)
    }
  }, [activeTab])

  // Auto-sync on window focus & document visibility change
  useEffect(() => {
    if (!token || !user) return

    const handleFocus = () => {
      loadClientData(true)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadClientData(true)
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [token, user?.id])

  // Periodic background polling (every 25 seconds) to ensure devis are always up-to-date
  useEffect(() => {
    if (!token || !user) return
    const interval = setInterval(() => {
      loadClientData(true)
    }, 25000)
    return () => clearInterval(interval)
  }, [token, user?.id])

  // Listen to custom global devis-created event
  useEffect(() => {
    const handleDevisCreated = (e: any) => {
      const detail = e.detail
      if (detail?.devis) {
        setCatalogueDevis((prev) => {
          const exists = prev.some((d) => d.id === detail.devis.id || d.reference === detail.devis.reference)
          if (exists) return prev
          return [detail.devis, ...prev]
        })
      }
      if (detail?.id || detail?.reference) {
        setNewlyCreatedDevisRef(detail.reference || detail.id)
        setExpandedDevisId(detail.id || detail.reference)
      }
      setActiveTab("devis")
      loadClientData(true)
    }

    window.addEventListener("orsap:devis-created", handleDevisCreated)
    return () => window.removeEventListener("orsap:devis-created", handleDevisCreated)
  }, [token, user?.id])

  async function handleVerifyByToken(tok: string) {
    setVerifyingToken(true)
    setVerificationError(null)
    setVerificationSuccess(null)

    try {
      const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(tok)}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setVerificationSuccess("Félicitations ! Votre compte ORSAP a été activé avec succès.")
        login(data.token, data.user)
        // clean URL param
        searchParams.delete("token")
        setSearchParams(searchParams)
      } else {
        setVerificationError(data.error || "Lien de confirmation invalide ou expiré.")
      }
    } catch {
      setVerificationError("Erreur de connexion au serveur.")
    } finally {
      setVerifyingToken(false)
    }
  }

  async function loadClientData(silent = false) {
    if (!token) return
    if (!silent) {
      setLoadingDashboard(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const [resMe, resDevis] = await Promise.all([
        fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/devis-catalogue/mine", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (resMe.ok) {
        const dataMe = await resMe.json()
        setUserSubmissions(dataMe.submissions || [])
      }

      if (resDevis.ok) {
        const dataDevis = await resDevis.json()
        const rawList: any[] = Array.isArray(dataDevis)
          ? dataDevis
          : Array.isArray(dataDevis.devis)
            ? dataDevis.devis
            : Array.isArray(dataDevis.items)
              ? dataDevis.items
              : []

        const sanitized: CatalogueDevis[] = rawList.map((d: any) => {
          const items = Array.isArray(d.items) ? d.items : []
          const calcHt = items.reduce(
            (sum: number, it: any) => sum + (Number(it.priceHt) || (Number(it.price_ht) || 0)) * (Number(it.quantity) || 1),
            0
          )
          const calcTtc = items.reduce(
            (sum: number, it: any) => sum + (Number(it.priceTtc) || (Number(it.price_ttc) || 0)) * (Number(it.quantity) || 1),
            0
          )
          const totalHtVal = typeof d.totalHt === "number" ? d.totalHt : calcHt
          const totalTtcVal = typeof d.totalTtc === "number" ? d.totalTtc : calcTtc
          const totalTvaVal = typeof d.totalTva === "number" ? d.totalTva : (totalTtcVal - totalHtVal)

          return {
            id: d.id || `DEV-${Math.random().toString(36).substring(2, 9)}`,
            reference: d.reference || d.id || "DEV-OFFICIEL",
            createdAt: d.createdAt || d.created_at || new Date().toISOString(),
            status: d.status || "pending",
            totalHt: totalHtVal,
            totalTva: totalTvaVal,
            totalTtc: totalTtcVal,
            notes: d.notes || d.note || "",
            items: items.map((it: any) => {
              const pht = Number(it.priceHt) || (Number(it.price_ht) || 0)
              const pttc = Number(it.priceTtc) || (Number(it.price_ttc) || 0)
              const qty = Number(it.quantity) || 1
              return {
                code: it.articleCode || it.article_code || it.code || "ART",
                designation: it.designation || "Article",
                rayon: it.rayon,
                famille: it.famille,
                priceHt: pht,
                priceTtc: pttc,
                quantity: qty,
                lineTotalHt: pht * qty,
                isCustom: Boolean(it.isCustom || it.is_custom),
              }
            }),
          }
        })

        setCatalogueDevis((prev) => {
          // If we have a newly created devis that might not yet be returned by server, keep it prepended
          if (newlyCreatedDevisRef) {
            const serverHasIt = sanitized.some(
              (s) => s.reference === newlyCreatedDevisRef || s.id === newlyCreatedDevisRef
            )
            if (!serverHasIt) {
              const localNew = prev.find(
                (p) => p.reference === newlyCreatedDevisRef || p.id === newlyCreatedDevisRef
              )
              if (localNew) {
                return [localNew, ...sanitized.filter((s) => s.id !== localNew.id)]
              }
            }
          }
          return sanitized
        })
      }
      setLastSyncTime(new Date())
    } catch (e) {
      console.error("Failed to load client data:", e)
    } finally {
      setLoadingDashboard(false)
      setIsRefreshing(false)
    }
  }

  // Handle Login
  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        login(data.token, data.user)
        setLoginEmail("")
        setLoginPassword("")
      } else {
        if (data.unverified) {
          setPendingEmail(data.email || loginEmail.trim())
          setLoginError("Votre compte n'a pas encore été validé. Veuillez entrer le code reçu par email ci-dessous.")
        } else {
          setLoginError(data.error || "Email ou mot de passe incorrect.")
        }
      }
    } catch {
      setLoginError("Erreur réseau. Veuillez réessayer.")
    } finally {
      setLoginLoading(false)
    }
  }

  // Handle Registration
  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()
    setRegError(null)

    if (regPassword !== regPasswordConfirm) {
      setRegError("Les mots de passe ne correspondent pas.")
      return
    }

    if (regPassword.length < 6) {
      setRegError("Le mot de passe doit comporter au moins 6 caractères.")
      return
    }

    if (regType === "professional" && !regCompany.trim()) {
      setRegError("Le nom de l'entreprise est obligatoire pour un compte professionnel.")
      return
    }

    setRegLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          company: regType === "professional" ? regCompany.trim() : null,
          password: regPassword,
          clientType: regType,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setPendingEmail(regEmail.trim())
        if (data.previewUrl) {
          setDevPreviewUrl(data.previewUrl)
        }
      } else {
        setRegError(data.error || "Une erreur est survenue lors de l'inscription.")
      }
    } catch {
      setRegError("Erreur réseau. Veuillez vérifier votre connexion.")
    } finally {
      setRegLoading(false)
    }
  }

  // Handle PIN Code verification
  async function handleVerifyCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pendingEmail || !verificationCodeInput.trim()) return

    setLoginLoading(true)
    setVerificationError(null)

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingEmail,
          code: verificationCodeInput.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setVerificationSuccess("Votre compte a été activé avec succès !")
        setPendingEmail(null)
        login(data.token, data.user)
      } else {
        setVerificationError(data.error || "Code de confirmation invalide.")
      }
    } catch {
      setVerificationError("Erreur lors de la validation du code.")
    } finally {
      setLoginLoading(false)
    }
  }

  // Handle Resend Verification
  async function handleResendEmail() {
    if (!pendingEmail) return
    setResendStatus("Envoi en cours...")
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setResendStatus("Un nouvel email a été envoyé !")
        if (data.previewUrl) setDevPreviewUrl(data.previewUrl)
      } else {
        setResendStatus("Erreur lors de l'envoi.")
      }
    } catch {
      setResendStatus("Erreur réseau.")
    }
  }

  // Handle Forgot Password
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setForgotLoading(true)
    setForgotMsg(null)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      })
      const data = await res.json()
      setForgotMsg(data.message || "Si l'adresse existe, un lien a été envoyé.")
    } catch {
      setForgotMsg("Erreur de communication avec le serveur.")
    } finally {
      setForgotLoading(false)
    }
  }

  // Handle Reset Password Submit
  async function handleResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!resetTokenParam || !newPassword) return
    setResetLoading(true)
    setResetError(null)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetTokenParam,
          newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setResetMsg("Mot de passe mis à jour avec succès ! Connexion automatique...")
        login(data.token, data.user)
        searchParams.delete("resetToken")
        setSearchParams(searchParams)
      } else {
        setResetError(data.error || "Impossible de réinitialiser le mot de passe.")
      }
    } catch {
      setResetError("Erreur réseau.")
    } finally {
      setResetLoading(false)
    }
  }

  // Handle Profile Update
  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setProfileSuccess(null)
    setProfileError(null)

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          company: editCompany,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setProfileSuccess("Vos coordonnées ont été mises à jour avec succès.")
        refreshUser()
      } else {
        setProfileError(data.error || "Erreur lors de la mise à jour.")
      }
    } catch {
      setProfileError("Erreur réseau.")
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // LOGGED IN DASHBOARD VIEW
  // ══════════════════════════════════════════════════════════════════════
  if (user) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] py-10 text-ink">
        <SEO title="Mon Espace Client | ORSAP Maroc" noIndex={true} />
        <div className="mx-auto max-w-[1240px] px-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-ink p-8 text-white shadow-xl md:p-12">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 size-72 rounded-full bg-orsap-red/20 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-orsap-red backdrop-blur">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Espace Client ORSAP
                </div>
                <h1 className="mt-3 font-display text-2xl font-black tracking-tight text-white md:text-3xl">
                  Bienvenue, {user.name}
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  {user.company ? `${user.company} · ` : ""}
                  {user.clientType === "professional" ? "Compte Professionnel" : "Compte Particulier"} · {user.email}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/devis"
                  className="inline-flex items-center gap-2 rounded-lg bg-orsap-red px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-orsap-red/30 transition hover:bg-orsap-red-deep"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau Devis
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </button>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => setActiveTab("catalogue")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "catalogue"
                    ? "bg-orsap-red text-white shadow-md shadow-orsap-red/30"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Boutique &amp; Catalogue B2B (48 000+ réf.)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("devis")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "devis"
                    ? "bg-orsap-red text-white shadow-md shadow-orsap-red/30"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Mes Demandes de Devis ({catalogueDevis.length + userSubmissions.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "profile"
                    ? "bg-orsap-red text-white shadow-md shadow-orsap-red/30"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mon Profil &amp; Coordonnées
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("docs")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "docs"
                    ? "bg-orsap-red text-white shadow-md shadow-orsap-red/30"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Catalogues &amp; Fiches Techniques
              </button>
            </div>
          </div>

          {/* TAB 0: BOUTIQUE & CATALOGUE B2B */}
          {activeTab === "catalogue" && (
            <div className="mt-8">
              <B2BCommercePlatform
                token={token || ""}
                onOrderSubmitted={(newDevis) => {
                  if (newDevis) {
                    setCatalogueDevis((prev) => {
                      const exists = prev.some((d) => d.id === newDevis.id || d.reference === newDevis.reference)
                      if (exists) return prev
                      return [newDevis, ...prev]
                    })
                    setNewlyCreatedDevisRef(newDevis.reference || newDevis.id)
                    setExpandedDevisId(newDevis.id)
                  }
                  setActiveTab("devis")
                  loadClientData(true)
                }}
              />
            </div>
          )}

          {/* TAB 1: DEVIS */}
          {activeTab === "devis" && (
            <div className="mt-8 space-y-10">
              {/* Newly Created Devis Reassurance Banner */}
              {newlyCreatedDevisRef && (
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-5 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-top-3 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="size-10 rounded-xl bg-emerald-600 text-white grid place-items-center shrink-0 shadow-md shadow-emerald-600/20">
                        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                            ✓ Devis bien enregistré
                          </span>
                          <span className="font-mono text-xs font-black text-emerald-950">
                            Réf : {newlyCreatedDevisRef}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-emerald-900 leading-relaxed">
                          Votre demande a été prise en compte avec succès par nos serveurs et transmise à notre service commercial. Votre devis chiffré apparaît ci-dessous et a été mis à jour automatiquement.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewlyCreatedDevisRef(null)}
                      className="self-start sm:self-center shrink-0 rounded-lg border border-emerald-600/20 bg-emerald-600/10 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-600/20 transition"
                    >
                      Masquer l&apos;alerte
                    </button>
                  </div>
                </div>
              )}

              {/* Top Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-display text-xl font-bold text-ink">Historique de vos devis et demandes</h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-500/20">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      Synchronisé en direct
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    Retrouvez l&apos;ensemble de vos demandes de devis et cotations sur-mesure.
                    {lastSyncTime && (
                      <span className="ml-1.5 opacity-75">
                        • Dernière actualisation : {lastSyncTime.toLocaleTimeString("fr-FR")}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => loadClientData(true)}
                    disabled={isRefreshing || loadingDashboard}
                    className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-card px-3.5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-ink transition hover:bg-paper hover:border-ink-soft disabled:opacity-50"
                  >
                    <svg
                      className={`size-3.5 text-ink-soft ${isRefreshing ? "animate-spin text-orsap-red" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>{isRefreshing ? "Actualisation..." : "Actualiser"}</span>
                  </button>

                  <Link
                    to="/devis"
                    className="inline-flex items-center gap-2 rounded-lg bg-orsap-red px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orsap-red/25 transition hover:bg-orsap-red-deep"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Nouvelle Demande
                  </Link>
                </div>
              </div>

              {loadingDashboard ? (
                <div className="rounded-xl border border-hairline bg-card p-12 text-center text-sm text-ink-soft">
                  Chargement de vos demandes...
                </div>
              ) : catalogueDevis.length === 0 && userSubmissions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-hairline bg-card p-12 text-center">
                  <div className="mx-auto size-12 rounded-full bg-orsap-red/10 text-orsap-red grid place-items-center mb-3">
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-base font-bold text-ink">Aucune demande de devis enregistrée</h3>
                  <p className="mt-1 text-xs text-ink-soft max-w-sm mx-auto">
                    Vous n&apos;avez pas encore créé de demande de devis avec cette adresse email ({user.email}).
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <Link
                      to="/devis"
                      className="rounded-lg bg-orsap-red px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-orsap-red-deep"
                    >
                      Demander un Devis Sur-Mesure
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Itemized Catalogue Devis */}
                  {catalogueDevis.length > 0 && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-orsap-red" />
                          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                            Devis Catalogue Chiffrés ({catalogueDevis.length})
                          </h3>
                        </div>
                        <span className="text-[11px] text-ink-soft">Chiffrages officiels certifiés par référence</span>
                      </div>

                      <div className="space-y-4">
                        {catalogueDevis.map((dev) => {
                          const isExpanded = expandedDevisId === dev.id
                          const isNew =
                            dev.reference === newlyCreatedDevisRef ||
                            dev.id === newlyCreatedDevisRef ||
                            Date.now() - new Date(dev.createdAt).getTime() < 1000 * 60 * 15
                          return (
                            <div
                              key={dev.id}
                              className={`overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md ${
                                isNew
                                  ? "border-emerald-500/60 ring-2 ring-emerald-500/20"
                                  : "border-hairline hover:border-orsap-red/30"
                              }`}
                            >
                              <div className={`border-b p-5 ${isNew ? "bg-emerald-500/[0.04] border-emerald-500/20" : "bg-paper/50 border-hairline"}`}>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1 font-mono text-xs font-bold text-white shadow-sm">
                                      <svg className="size-3.5 text-orsap-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {dev.reference}
                                    </span>
                                    {isNew && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-sm animate-pulse">
                                        ● Nouveau
                                      </span>
                                    )}
                                    <span className="font-mono text-xs text-ink-soft">
                                      {new Date(dev.createdAt).toLocaleDateString("fr-FR", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 border border-emerald-200">
                                      ✓ Reçu &amp; Traité par ORSAP
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Total Estimé</div>
                                      <div className="font-mono text-sm font-extrabold text-orsap-red">
                                        {(dev.totalHt || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD <span className="text-[10px] font-normal text-ink-soft">HT</span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setExpandedDevisId(isExpanded ? null : dev.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-card px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-ink transition hover:bg-paper hover:border-ink-soft"
                                    >
                                      <span>{isExpanded ? "Masquer détails" : "Voir articles"}</span>
                                      <span className="rounded bg-orsap-red/10 px-1.5 py-0.5 font-mono text-[10px] text-orsap-red font-bold">
                                        {dev.items?.length || 0}
                                      </span>
                                      <svg
                                        className={`size-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Accordion Content */}
                              {isExpanded && (
                                <div className="p-6 bg-card space-y-6">
                                  {/* Table of items */}
                                  <div className="overflow-x-auto rounded-xl border border-hairline">
                                    <table className="w-full text-left text-xs">
                                      <thead className="border-b border-hairline bg-paper text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                                        <tr>
                                          <th className="px-4 py-3">Code Réf.</th>
                                          <th className="px-4 py-3">Désignation</th>
                                          <th className="px-4 py-3 text-right">Prix Unit. HT</th>
                                          <th className="px-4 py-3 text-center">Qté</th>
                                          <th className="px-4 py-3 text-right">Total HT</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-hairline">
                                        {dev.items?.map((item, idx) => (
                                          <tr key={`${dev.id}-item-${idx}`} className="hover:bg-paper/40">
                                            <td className="px-4 py-3 font-mono font-bold text-ink">
                                              {item.isCustom ? (
                                                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                  SUR-MESURE
                                                </span>
                                              ) : (
                                                <span className="rounded bg-paper px-2 py-0.5 text-xs text-ink">
                                                  {item.code}
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-4 py-3">
                                              <div className="font-semibold text-ink">{item.designation}</div>
                                              {(item.rayon || item.famille) && (
                                                <div className="text-[10px] text-ink-soft">
                                                  {item.rayon} {item.famille ? `› ${item.famille}` : ""}
                                                </div>
                                              )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-ink-soft">
                                              {item.priceHt > 0
                                                ? `${(item.priceHt || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
                                                : "Sur devis"}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono font-bold text-ink">
                                              × {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-bold text-ink">
                                              {item.lineTotalHt > 0
                                                ? `${(item.lineTotalHt || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
                                                : "Sur devis"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Totals & Notes */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
                                    <div>
                                      {dev.notes && (
                                        <div className="rounded-xl border border-hairline bg-paper p-4 text-xs text-ink-soft">
                                          <div className="font-bold text-ink uppercase text-[10px] tracking-wider mb-1">
                                            Notes / Remarques client :
                                          </div>
                                          {dev.notes}
                                        </div>
                                      )}
                                    </div>

                                    <div className="rounded-xl border border-hairline bg-paper p-4 space-y-2 text-xs">
                                      <div className="flex justify-between text-ink-soft">
                                        <span>Total Net HT</span>
                                        <span className="font-mono font-bold text-ink">
                                          {(dev.totalHt || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-ink-soft">
                                        <span>TVA (20%)</span>
                                        <span className="font-mono font-bold text-ink">
                                          {(dev.totalTva || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                                        </span>
                                      </div>
                                      <div className="border-t border-hairline pt-2 flex justify-between font-display text-sm font-black text-ink">
                                        <span>Total TTC Estimé</span>
                                        <span className="font-mono text-orsap-red">
                                          {(dev.totalTtc || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* General / Contact Devis Submissions */}
                  {userSubmissions.length > 0 && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-ink/40" />
                          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                            Demandes de Devis Générales ({userSubmissions.length})
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {userSubmissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="rounded-xl border border-hairline bg-card p-6 shadow-sm transition hover:shadow-md"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs font-semibold text-ink-soft">
                                  {new Date(sub.createdAt).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 border border-emerald-200">
                                  ✓ Transmis à nos équipes
                                </span>
                              </div>
                              <span className="font-mono text-xs text-ink-soft/70">Réf: {sub.id.toUpperCase()}</span>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                                  Solutions sélectionnées
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {sub.solutions && sub.solutions.length > 0 ? (
                                    sub.solutions.map((sol) => (
                                      <span
                                        key={sol}
                                        className="rounded bg-paper px-2.5 py-1 text-xs font-semibold text-ink"
                                      >
                                        {sol}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-ink-soft">Aucune solution spécifique listée</span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                                  Secteurs d'activité
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {sub.sectors && sub.sectors.length > 0 ? (
                                    sub.sectors.map((sec) => (
                                      <span
                                        key={sec}
                                        className="rounded bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink"
                                      >
                                        {sec}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-ink-soft">—</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {sub.message && (
                              <div className="mt-4 rounded-lg bg-paper p-3 text-xs text-ink-soft">
                                <span className="font-bold text-ink">Message : </span>
                                {sub.message}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === "profile" && (
            <div className="mt-8 max-w-2xl">
              <div className="rounded-xl border border-hairline bg-card p-8 shadow-sm">
                <h2 className="font-display text-lg font-bold text-ink">Vos Informations Personnelles &amp; Entreprise</h2>
                <p className="text-xs text-ink-soft mt-1">
                  Mettez à jour vos informations de contact pour faciliter le traitement de vos demandes.
                </p>

                {profileSuccess && (
                  <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-800 border border-rose-200">
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                      Adresse Email (Identifiant)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full rounded-lg border border-hairline bg-paper/60 px-4 py-2.5 text-sm text-ink-soft cursor-not-allowed"
                    />
                    <span className="text-[10px] text-ink-soft mt-1 block">L'adresse email est votre identifiant unique sécurisé.</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-hairline bg-white px-4 py-2.5 text-sm outline-none focus:border-orsap-red focus:ring-1 focus:ring-orsap-red"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                      Entreprise / Raison Sociale
                    </label>
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="Ex: Société BTP Maroc SARL"
                      className="w-full rounded-lg border border-hairline bg-white px-4 py-2.5 text-sm outline-none focus:border-orsap-red focus:ring-1 focus:ring-orsap-red"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full rounded-lg border border-hairline bg-white px-4 py-2.5 text-sm outline-none focus:border-orsap-red focus:ring-1 focus:ring-orsap-red"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-4 rounded-lg bg-ink px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white transition hover:bg-black"
                  >
                    Enregistrer les modifications
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: DOCS & CATALOGS */}
          {activeTab === "docs" && (
            <div className="mt-8 space-y-8">
              {/* Header & Quick Action Bar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-6">
                <div>
                  <h2 className="font-display text-2xl font-black text-ink">Catalogues &amp; Fiches Techniques Réservées</h2>
                  <p className="mt-1 text-xs text-ink-soft">
                    Feuilletez le catalogue officiel ORSAP Services en consultation sécurisée directement en ligne.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="/ORSAP-Services-Catalogue.pdf#toolbar=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-white px-4 py-2.5 font-display text-xs font-bold text-ink hover:bg-slate-50 shadow-sm transition"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Ouvrir en plein écran
                  </a>
                </div>
              </div>

              {/* Main Interactive PDF Display */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                      Lecteur Catalogue ORSAP Services (Consultation en ligne)
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-soft">
                    Feuilletez les pages du catalogue directement à l'écran
                  </span>
                </div>

                <div className="relative w-full overflow-hidden rounded-2xl border border-hairline bg-slate-900 shadow-2xl">
                  <object
                    data="/ORSAP-Services-Catalogue.pdf#view=FitH&toolbar=0&navpanes=0"
                    type="application/pdf"
                    className="h-[800px] sm:h-[900px] lg:h-[1100px] w-full"
                  >
                    <iframe
                      src="/ORSAP-Services-Catalogue.pdf#view=FitH&toolbar=0&navpanes=0"
                      title="Catalogue Officiel ORSAP Services"
                      className="h-[800px] sm:h-[900px] lg:h-[1100px] w-full border-0"
                    >
                      <div className="p-8 text-center text-white">
                        <p className="text-base font-bold">Votre navigateur ne prend pas en charge l&apos;affichage direct du lecteur.</p>
                      </div>
                    </iframe>
                  </object>
                </div>
              </div>

              {/* Other Technical Guides & Resources */}
              <div className="pt-4">
                <h3 className="font-display text-base font-bold text-ink">
                  Autres Guides &amp; Documentations Techniques
                </h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                <div className="rounded-xl border border-hairline bg-card p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="size-10 rounded-lg bg-orsap-red/10 text-orsap-red grid place-items-center font-bold text-sm">
                      PDF
                    </div>
                    <h3 className="mt-4 font-display text-sm font-bold text-ink">
                      Guide Sécurité &amp; Normes Échafaudages
                    </h3>
                    <p className="mt-1 text-xs text-ink-soft">
                      Conformité des échafaudages industriels, montage, contrôle et sécurité sur chantiers au Maroc.
                    </p>
                  </div>
                  <Link
                    to="/blog"
                    className="mt-4 inline-block text-xs font-bold text-orsap-red hover:underline"
                  >
                    Lire les fiches techniques →
                  </Link>
                </div>

                <div className="rounded-xl border border-hairline bg-card p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="size-10 rounded-lg bg-emerald-100 text-emerald-800 grid place-items-center font-bold text-sm">
                      VIP
                    </div>
                    <h3 className="mt-4 font-display text-sm font-bold text-ink">
                      Assistance Commerciale Dédiée
                    </h3>
                    <p className="mt-1 text-xs text-ink-soft">
                      Contactez directement votre conseiller ORSAP pour vos commandes sur mesure ou projets industriels.
                    </p>
                  </div>
                  <a
                    href="https://wa.me/212644203030"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Contacter sur WhatsApp (+212 6 44 20 30 30) →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // PENDING VERIFICATION / PIN CODE SCREEN
  // ══════════════════════════════════════════════════════════════════════
  if (pendingEmail) {
    return (
      <div className="min-h-[80vh] bg-paper py-16 text-ink flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="rounded-2xl border border-hairline bg-card p-8 shadow-xl">
            <div className="mx-auto size-14 rounded-2xl bg-orsap-red/10 text-orsap-red grid place-items-center mb-4">
              <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-center font-display text-xl font-black tracking-tight text-ink">
              Validez votre adresse email
            </h2>
            <p className="mt-2 text-center text-xs text-ink-soft leading-relaxed">
              Un email contenant un lien d'activation et votre code de confirmation a été envoyé à :
              <br />
              <strong className="text-ink text-sm">{pendingEmail}</strong>
            </p>

            {verificationError && (
              <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-800 border border-rose-200 text-center">
                {verificationError}
              </div>
            )}

            {/* Code Form */}
            <form onSubmit={handleVerifyCodeSubmit} className="mt-6">
              <label htmlFor={codeInputId} className="block text-center text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-2">
                Entrez le code reçu à 6 chiffres
              </label>
              <input
                id={codeInputId}
                type="text"
                maxLength={6}
                autoFocus
                value={verificationCodeInput}
                onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full rounded-xl border-2 border-hairline bg-paper px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.3em] text-ink outline-none focus:border-orsap-red"
              />

              <button
                type="submit"
                disabled={loginLoading || verificationCodeInput.length < 6}
                className="mt-4 w-full rounded-xl bg-orsap-red py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-orsap-red/25 transition hover:bg-orsap-red-deep disabled:opacity-50"
              >
                {loginLoading ? "Vérification..." : "Valider et accéder à mon espace"}
              </button>
            </form>

            {/* Resend & Dev Preview */}
            <div className="mt-6 border-t border-hairline pt-4 text-center space-y-2">
              <button
                type="button"
                onClick={handleResendEmail}
                className="text-xs font-semibold text-ink-soft hover:text-orsap-red transition"
              >
                Vous n'avez pas reçu l'email ? Renvoyer l'email
              </button>
              {resendStatus && (
                <div className="text-[11px] font-semibold text-ink-soft">{resendStatus}</div>
              )}

              {devPreviewUrl && (
                <div className="mt-3 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 border border-amber-200">
                  <span className="font-bold">Aperçu direct (Test) : </span>
                  <a href={devPreviewUrl} className="font-bold text-orsap-red underline">
                    Cliquer ici pour valider automatiquement
                  </a>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingEmail(null)
                    setMode("login")
                  }}
                  className="text-[11px] text-ink-soft/70 hover:underline"
                >
                  ← Retour à la page de connexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC AUTH FORM (CONNECTEZ-VOUS / CRÉER UN COMPTE)
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-[85vh] bg-paper py-12 text-ink flex items-center justify-center">
      <SEO
        title="Espace Client — Connexion & Inscription | ORSAP Maroc"
        description="Connectez-vous à votre espace client ORSAP pour suivre vos devis, commandes et télécharger les documentations techniques exclusives."
        noIndex={true}
      />
      <div className="w-full max-w-xl px-6">
        {/* Verification banner if coming from email link */}
        {verifyingToken && (
          <div className="mb-6 rounded-xl bg-ink p-4 text-center text-xs font-semibold text-white">
            Vérification de votre compte en cours...
          </div>
        )}
        {verificationSuccess && (
          <div className="mb-6 rounded-xl bg-emerald-500 p-4 text-center text-xs font-bold text-white shadow-lg">
            {verificationSuccess}
          </div>
        )}
        {verificationError && (
          <div className="mb-6 rounded-xl bg-rose-500 p-4 text-center text-xs font-bold text-white shadow-lg">
            {verificationError}
          </div>
        )}

        {/* Reset Password Form Modal/State if resetToken present */}
        {resetTokenParam && (
          <div className="mb-8 rounded-2xl border border-hairline bg-card p-8 shadow-xl">
            <h2 className="font-display text-xl font-black text-ink text-center">
              Nouveau mot de passe
            </h2>
            <p className="text-xs text-ink-soft text-center mt-1">
              Entrez votre nouveau mot de passe pour réinitialiser votre accès.
            </p>
            {resetMsg && (
              <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200 text-center">
                {resetMsg}
              </div>
            )}
            {resetError && (
              <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-800 border border-rose-200 text-center">
                {resetError}
              </div>
            )}
            <form onSubmit={handleResetPasswordSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor={resetPassId} className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                  Nouveau mot de passe (min 6 caractères) *
                </label>
                <input
                  id={resetPassId}
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-paper px-4 py-3 text-sm outline-none focus:border-orsap-red"
                />
              </div>
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full rounded-xl bg-orsap-red py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-orsap-red-deep"
              >
                {resetLoading ? "Enregistrement..." : "Enregistrer le mot de passe"}
              </button>
            </form>
          </div>
        )}

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-xl">
          {/* Top Brand Header */}
          <div className="bg-ink p-8 text-center text-white">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-orsap-red">
              ORSAP · Maroc
            </span>
            <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-white md:text-3xl">
              Espace Client
            </h1>
            <p className="mt-2 text-xs text-white/70">
              Accès exclusif au catalogue B2B (48 000+ références outillage &amp; quincaillerie), cotations directes, commandes et documentations techniques
            </p>

            {/* Toggle Switcher */}
            <div className="mt-6 inline-flex rounded-xl bg-white/10 p-1 backdrop-blur">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-lg px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition ${
                  mode === "login"
                    ? "bg-orsap-red text-white shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Connectez-vous
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-lg px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition ${
                  mode === "register"
                    ? "bg-orsap-red text-white shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Créer un compte
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* ── MODE 1: LOGIN (CONNECTEZ-VOUS) ── */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="rounded-lg bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 border border-rose-200">
                    {loginError}
                  </div>
                )}

                <div>
                  <label htmlFor={loginEmailId} className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                    Adresse Email *
                  </label>
                  <input
                    id={loginEmailId}
                    type="email"
                    required
                    placeholder="nom@entreprise.ma"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-paper px-4 py-3 text-sm outline-none transition focus:border-orsap-red focus:bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor={loginPassId} className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                      Mot de passe *
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-[11px] font-semibold text-orsap-red hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <input
                    id={loginPassId}
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-paper px-4 py-3 text-sm outline-none transition focus:border-orsap-red focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="mt-2 w-full rounded-xl bg-orsap-red py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-orsap-red/25 transition hover:bg-orsap-red-deep disabled:opacity-50"
                >
                  {loginLoading ? "Connexion..." : "Se connecter à mon espace"}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-ink-soft">Vous n'avez pas encore de compte ? </span>
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-xs font-bold text-orsap-red hover:underline"
                  >
                    Créer un compte
                  </button>
                </div>
              </form>
            )}

            {/* ── MODE 2: REGISTER (CRÉER UN COMPTE) ── */}
            {mode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {regError && (
                  <div className="rounded-lg bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 border border-rose-200">
                    {regError}
                  </div>
                )}

                {/* Account Type Selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-2">
                    Vous êtes :
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegType("professional")}
                      className={`rounded-xl border p-3 text-left transition ${
                        regType === "professional"
                          ? "border-orsap-red bg-orsap-red/5 ring-1 ring-orsap-red"
                          : "border-hairline bg-paper hover:border-ink/30"
                      }`}
                    >
                      <div className="font-display text-xs font-bold text-ink">Professionnel</div>
                      <div className="text-[10px] text-ink-soft mt-0.5">Entreprise, Industrie, BTP</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegType("individual")}
                      className={`rounded-xl border p-3 text-left transition ${
                        regType === "individual"
                          ? "border-orsap-red bg-orsap-red/5 ring-1 ring-orsap-red"
                          : "border-hairline bg-paper hover:border-ink/30"
                      }`}
                    >
                      <div className="font-display text-xs font-bold text-ink">Particulier</div>
                      <div className="text-[10px] text-ink-soft mt-0.5">Artisan, Projet personnel</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor={regNameId} className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                    Nom &amp; Prénom *
                  </label>
                  <input
                    id={regNameId}
                    type="text"
                    required
                    placeholder="Ex: Karim Benjelloun"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-paper px-4 py-2.5 text-sm outline-none transition focus:border-orsap-red focus:bg-white"
                  />
                </div>

                {regType === "professional" && (
                  <div>
                    <label htmlFor={regCompanyId} className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                      Raison Sociale / Entreprise *
                    </label>
                    <input
                      id={regCompanyId}
                      type="text"
                      required
                      placeholder="Ex: SOMAC Maroc SARL"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      className="w-full rounded-xl border border-hairline bg-paper px-4 py-2.5 text-sm outline-none transition focus:border-orsap-red focus:bg-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={regEmailId} className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                      Adresse Email *
                    </label>
                    <input
                      id={regEmailId}
                      type="email"
                      required
                      placeholder="contact@societe.ma"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full rounded-xl border border-hairline bg-paper px-4 py-2.5 text-sm outline-none transition focus:border-orsap-red focus:bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor={regPhoneId} className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                      Téléphone (+212) *
                    </label>
                    <input
                      id={regPhoneId}
                      type="tel"
                      required
                      placeholder="06 00 00 00 00"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full rounded-xl border border-hairline bg-paper px-4 py-2.5 text-sm outline-none transition focus:border-orsap-red focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={regPassId} className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                      Mot de passe (min 6 car.) *
                    </label>
                    <input
                      id={regPassId}
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full rounded-xl border border-hairline bg-paper px-4 py-2.5 text-sm outline-none transition focus:border-orsap-red focus:bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor={regConfirmId} className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                      Confirmer le mot de passe *
                    </label>
                    <input
                      id={regConfirmId}
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      className="w-full rounded-xl border border-hairline bg-paper px-4 py-2.5 text-sm outline-none transition focus:border-orsap-red focus:bg-white"
                    />
                  </div>
                </div>

                {/* Consent checkbox */}
                <div className="flex items-start gap-2.5 rounded-xl border border-hairline bg-paper/60 p-3">
                  <input
                    id="reg-consent"
                    type="checkbox"
                    required
                    className="mt-0.5 size-4 shrink-0 rounded accent-orsap-red focus-visible:ring-2 focus-visible:ring-orsap-red cursor-pointer"
                  />
                  <label htmlFor="reg-consent" className="text-[11.5px] leading-relaxed text-ink-soft select-none cursor-pointer">
                    J&apos;ai lu et j&apos;accepte les{" "}
                    <Link to="/conditions-generales" target="_blank" className="font-semibold text-orsap-red underline hover:text-orsap-red-deep">
                      Conditions Générales
                    </Link>{" "}
                    et la{" "}
                    <Link to="/politique-de-confidentialite" target="_blank" className="font-semibold text-orsap-red underline hover:text-orsap-red-deep">
                      Politique de Confidentialité
                    </Link>{" "}
                    (Loi 09-08 / CNDP).
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full rounded-xl bg-orsap-red py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-orsap-red/25 transition hover:bg-orsap-red-deep disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orsap-red focus-visible:ring-offset-2"
                >
                  {regLoading ? "Création du compte..." : "Créer mon compte ORSAP"}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-ink-soft">Vous avez déjà un compte ? </span>
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-xs font-bold text-orsap-red hover:underline"
                  >
                    Connectez-vous
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-hairline bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-display text-sm font-bold text-ink">Mot de passe oublié</h3>
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(false)
                  setForgotMsg(null)
                }}
                className="text-ink-soft hover:text-ink text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="mt-4 space-y-4">
              <p className="text-xs text-ink-soft leading-relaxed">
                Entrez votre adresse email enregistrée. Nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
              </p>

              {forgotMsg && (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  {forgotMsg}
                </div>
              )}

              <div>
                <label htmlFor={forgotEmailId} className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                  Adresse email
                </label>
                <input
                  id={forgotEmailId}
                  type="email"
                  required
                  placeholder="nom@entreprise.ma"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full rounded-lg border border-hairline bg-paper px-4 py-2.5 text-sm outline-none focus:border-orsap-red"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(false)
                    setForgotMsg(null)
                  }}
                  className="rounded-lg border border-hairline px-4 py-2 text-xs font-bold text-ink-soft hover:bg-paper"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="rounded-lg bg-orsap-red px-5 py-2 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-orsap-red-deep"
                >
                  {forgotLoading ? "Envoi..." : "Envoyer le lien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
