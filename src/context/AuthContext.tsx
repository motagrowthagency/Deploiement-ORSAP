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
        setUser(data.user)
        localStorage.setItem("orsap_client_user", JSON.stringify(data.user))
      } else {
        // Token expired or invalid
        logout()
      }
    } catch {
      // Network error, keep cached user
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
    localStorage.setItem("orsap_client_token", newToken)
    localStorage.setItem("orsap_client_user", JSON.stringify(newUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("orsap_client_token")
    localStorage.removeItem("orsap_client_user")
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
