// ─── AuthContext (feature/login-area) ────────────────────────────────────────
// Estado de sessão: usuário, token (localStorage), login/registro/logout.
// Ao montar, se há token, valida via /auth/me — "se já logou, abre normal".

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api, getToken, setToken, clearToken } from '../services/api'
import type { AuthUser } from '../types'
import { AUTH_DISABLED } from '../config/flags'

// Usuário fake usado quando o login está desabilitado (flags.AUTH_DISABLED).
// role=admin libera todas as telas em modo dev.
const DEV_USER: AuthUser = {
  id: 0,
  email: 'dev@clutchpro.local',
  name: 'Modo Dev',
  is_active: true,
  role: 'admin',
  plan: 'premium',
  created_at: '2026-01-01T00:00:00Z',
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  /** Re-busca /auth/me (útil quando setamos token fora do login direto,
   *  ex.: pós-reset de senha). */
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(AUTH_DISABLED ? DEV_USER : null)
  const [loading, setLoading] = useState(!AUTH_DISABLED)

  // Revalida a sessão no boot: token presente → /auth/me.
  useEffect(() => {
    // Login desabilitado: pula a validação de sessão.
    if (AUTH_DISABLED) return
    let cancelled = false
    const boot = async () => {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const r = await api.me()
        if (!cancelled) setUser(r.data)
      } catch {
        clearToken()
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.login({ email, password })
    setToken(r.data.access_token)
    setUser(r.data.user)
  }, [])

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const r = await api.register({ email, password, name })
      setToken(r.data.access_token)
      setUser(r.data.user)
    },
    [],
  )

  const logout = useCallback(() => {
    // Com login desabilitado, "Sair" não derruba a sessão dev.
    if (AUTH_DISABLED) return
    clearToken()
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      return
    }
    try {
      const r = await api.me()
      setUser(r.data)
    } catch {
      clearToken()
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
