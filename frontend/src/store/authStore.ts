import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSummary } from '../types/auth'
import * as authApi from '../api/auth'

interface AuthState {
  token: string | null
  user: UserSummary | null
  isLoading: boolean
  isInitialized: boolean

  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
  fetchCurrentUser: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      isInitialized: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login({ email, password })
          set({ token: response.accessToken, user: response.user })
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (fullName, email, password) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register({ fullName, email, password })
          set({ token: response.accessToken, user: response.user })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        set({ token: null, user: null })
      },

      fetchCurrentUser: async () => {
        const token = get().token
        if (!token) return
        try {
          const user = await authApi.getMe()
          set({ user })
        } catch {
          set({ token: null, user: null })
        }
      },

      initialize: async () => {
        const token = get().token
        if (token) {
          await get().fetchCurrentUser()
        }
        set({ isInitialized: true })
      },
    }),
    {
      name: 'weekdays-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
