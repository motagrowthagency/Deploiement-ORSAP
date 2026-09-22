import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface AuthUser {
  id: string
  createdAt: string
  email: string
  name: string
  company?: string | null
  phone: string
  clientType: "professional" | "individual" | string
  isVerified: boolean
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("orsap_client_token")
  })
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("orsap_client_user")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {}
    }
    return null
  })
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          try {
            localStorage.setItem("orsap_client_user", JSON.stringify(data.user))
            sessionStorage.setItem("orsap_client_user", JSON.stringify(data.user))
          } catch {}
        }
      } else if (res.status === 401) {
        // Token explicitly expired or invalid on server
        logout()
      }
    } catch {
      // Network error or offline, keep cached user
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [token])

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken)
    setUser(newUser)
    try {
      localStorage.setItem("orsap_client_token", newToken)
      localStorage.setItem("orsap_client_user", JSON.stringify(newUser))
      sessionStorage.setItem("orsap_client_token", newToken)
      sessionStorage.setItem("orsap_client_user", JSON.stringify(newUser))
    } catch {}
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    try {
      localStorage.removeItem("orsap_client_token")
      localStorage.removeItem("orsap_client_user")
      sessionStorage.removeItem("orsap_client_token")
      sessionStorage.removeItem("orsap_client_user")
    } catch {}
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
