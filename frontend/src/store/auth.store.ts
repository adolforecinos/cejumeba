import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, Rol } from '../types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (user: AuthUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user:            null,
      token:           null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('cejumeva_token', token)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('cejumeva_token')
        localStorage.removeItem('cejumeva_user')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    { name: 'cejumeva_auth' }
  )
)

// ─── Helpers de rol ────────────────────────────────────────────────────────
export const useRole = (): Rol | null => useAuthStore(s => s.user?.rol ?? null)

export const can = (rol: Rol | null, ...allowed: Rol[]): boolean =>
  rol !== null && allowed.includes(rol)
