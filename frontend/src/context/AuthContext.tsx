import { createContext, useContext, useState, type ReactNode } from 'react'
import * as authApi from '../lib/auth'

interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: authApi.RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

  async function login(email: string, password: string) {
    const newToken = await authApi.login({ email, password })
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }

  async function register(payload: authApi.RegisterPayload) {
    const newToken = await authApi.register(payload)
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: token !== null, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
