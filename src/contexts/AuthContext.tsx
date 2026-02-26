import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { api, setAccessToken, clearAccessToken } from '@/lib/api'
import { signupAPI, loginAPI, AuthUser, SignupPayload } from '@/lib/auth.service'

// ── Context Shape ─────────────────────────────────────────────
interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signup: (payload: SignupPayload) => Promise<void>
  login: (email: string, password: string, role?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ── Restore session on page refresh ──────────────────────
  // WHY: When user refreshes the page, memory is wiped
  //      But their refreshToken cookie is still in browser
  //      We silently call /auth/refresh to restore their session
  //      without making them log in again
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.post('/auth/refresh')
        const { accessToken, user } = response.data.data

        setAccessToken(accessToken)
        setUser(user)
      } catch {
        // No valid session — user needs to log in
        // This is normal, not an error
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  // ── Signup ────────────────────────────────────────────────
  const signup = async (payload: SignupPayload) => {
    const response = await signupAPI(payload)
    setAccessToken(response.data.accessToken)
    setUser(response.data.user)
  }

  // ── Login ─────────────────────────────────────────────────
  const login = async (email: string, password: string, role?: string) => {
    const response = await loginAPI(email, password, role)
    setAccessToken(response.data.accessToken)
    setUser(response.data.user)
  }

  // ── Logout ────────────────────────────────────────────────
  const logout = async () => {
    try {
      // tell backend to delete the session from DB
      await api.post('/auth/logout')
    } catch {
      // even if request fails, still clear frontend
    } finally {
      clearAccessToken()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signup,
        login,
        logout,
      }}
    >
      {/* Don't render app until we know if user is logged in */}
      {/* Prevents flash of wrong UI on page refresh */}
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

// ── useAuth hook ──────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
