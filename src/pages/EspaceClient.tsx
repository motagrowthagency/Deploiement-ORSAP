import { useState, useEffect, useId } from "react"
import { useSearchParams, Link, useNavigate } from "react-router"
import { useAuth, AuthUser } from "@/context/AuthContext"

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
  const [activeTab, setActiveTab] = useState<"devis" | "profile" | "docs">("devis")
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([])
  const [loadingDashboard, setLoadingDashboard] = useState(false)
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

  // Load client data if logged in
  useEffect(() => {
    if (token && user) {
      loadClientData()
    }
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

  async function loadClientData() {
    if (!token) return
    setLoadingDashboard(true)
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUserSubmissions(data.submissions || [])
      }
    } catch (e) {
      console.error("Failed to load client data:", e)
    } finally {
      setLoadingDashboard(false)
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
        setResendStatus("✅ Un nouvel email a été envoyé !")
        if (data.previewUrl) setDevPreviewUrl(data.previewUrl)
      } else {
        setResendStatus("⚠️ Erreur lors de l'envoi.")
      }
    } catch {
      setResendStatus("⚠️ Erreur réseau.")
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
                onClick={() => setActiveTab("devis")}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "devis"
                    ? "bg-orsap-red text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                📋 Mes Demandes de Devis ({userSubmissions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "profile"
                    ? "bg-orsap-red text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                🏢 Mon Profil &amp; Coordonnées
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("docs")}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "docs"
                    ? "bg-orsap-red text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                📑 Catalogues &amp; Fiches Techniques
              </button>
            </div>
          </div>

          {/* TAB 1: DEVIS */}
          {activeTab === "devis" && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">Historique de vos demandes de devis</h2>
                  <p className="text-xs text-ink-soft">Consultez le statut et les solutions demandées</p>
                </div>
                <Link
                  to="/devis"
                  className="text-xs font-bold text-orsap-red hover:underline"
                >
                  Faire une nouvelle demande →
                </Link>
              </div>

              {loadingDashboard ? (
                <div className="mt-6 rounded-xl border border-hairline bg-card p-12 text-center text-sm text-ink-soft">
                  Chargement de vos demandes...
                </div>
              ) : userSubmissions.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-hairline bg-card p-12 text-center">
                  <div className="mx-auto size-12 rounded-full bg-orsap-red/10 text-orsap-red grid place-items-center mb-3">
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-base font-bold text-ink">Aucune demande de devis enregistrée</h3>
                  <p className="mt-1 text-xs text-ink-soft max-w-sm mx-auto">
                    Vous n'avez pas encore envoyé de demande de devis avec cette adresse email ({user.email}).
                  </p>
                  <Link
                    to="/devis"
                    className="mt-4 inline-block rounded-lg bg-orsap-red px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-orsap-red-deep"
                  >
                    Demander mon premier devis
                  </Link>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-4">
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
            <div className="mt-8">
              <h2 className="font-display text-lg font-bold text-ink">Catalogues &amp; Fiches Techniques Réservées</h2>
              <p className="text-xs text-ink-soft mt-1">Accédez aux documentations professionnelles d'ORSAP</p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="rounded-xl border border-hairline bg-card p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="size-10 rounded-lg bg-orsap-red/10 text-orsap-red grid place-items-center font-bold text-sm">
                      PDF
                    </div>
                    <h3 className="mt-4 font-display text-sm font-bold text-ink">
                      Catalogue Général Équipements &amp; EPI 2026
                    </h3>
                    <p className="mt-1 text-xs text-ink-soft">
                      Guide complet des 15 000+ références : Travail en hauteur, protection individuelle, manutention.
                    </p>
                  </div>
                  <a
                    href="/produits"
                    className="mt-4 inline-block text-xs font-bold text-orsap-red hover:underline"
                  >
                    Consulter le catalogue en ligne →
                  </a>
                </div>

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
              Gérez vos demandes de devis, accédez aux tarifs et documentations techniques
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
                      <div className="font-display text-xs font-bold text-ink">🏢 Professionnel</div>
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
                      <div className="font-display text-xs font-bold text-ink">👤 Particulier</div>
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

                <p className="text-[11px] text-ink-soft leading-relaxed">
                  En créant un compte, vous recevrez un email pour authentifier votre adresse.
                </p>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full rounded-xl bg-orsap-red py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-orsap-red/25 transition hover:bg-orsap-red-deep disabled:opacity-50"
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
