// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
// import { api } from '@/lib/api'

// type User = {
//   id: string
//   firstName: string
//   lastName: string
//   email?: string
//   token?: string

// }

// type AuthStore = {
//   user: User | null
//   isLoading: boolean
//   error: string | null
//   login: (credentials: { email: string; password: string }) => Promise<void>
//   register: (userData: any) => Promise<void>
//   logout: () => void
  
// }

// export const useAuthStore = create<AuthStore>()(
//   persist(
//     (set) => ({
//       user: null,
//       isLoading: false,
//       error: null,

//       login: async (credentials) => {
//         set({ isLoading: true, error: null });
//         try {
//            const { data } = await api.post('/auth/login', credentials);
//           set({ user: data.user, isLoading: false });
//         } catch (err: any) {
//           set({ error: err.response?.data?.message || 'خطا در ورود', isLoading: false });
//           throw err;
//         }
//       },

//       register: async (userData) => {
//         set({ isLoading: true, error: null });
//         try {
//           const { data } = await api.post('/auth/register', userData);
//           set({ user: data.user, isLoading: false });
//         } catch (err: any) {
//           set({ error: err.response?.data?.message || 'خطا در ثبت‌نام', isLoading: false });
//           throw err;
//         }
//       },

//       logout: () => set({ user: null }),
//     }),
//     { name: 'auth-storage' }
//   )
// )
// src/store/auth.store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

type User = {
  id: string
  firstName: string
  lastName: string
  email?: string
}

type LoginCredentials = {
  email: string
  password: string
}

type RegisterPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  [key: string]: any
}

type AuthStore = {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null

  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterPayload) => Promise<void>
  fetchMe: () => Promise<void>
  logout: () => void
  clearError: () => void
}

const getErrorMessage = (err: any, fallback: string) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  )
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })

        try {
          const { data } = await api.post('/auth/login', credentials)

          const token =
            data.token ||
            data.accessToken ||
            data.access_token ||
            data.user?.token ||
            null

          set({
            user: data.user,
            token,
            isLoading: false,
            error: null,
          })
        } catch (err: any) {
          set({
            error: getErrorMessage(err, 'خطا در ورود'),
            isLoading: false,
          })

          throw err
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })

        try {
          const { data } = await api.post('/auth/register', userData)

          const token =
            data.token ||
            data.accessToken ||
            data.access_token ||
            data.user?.token ||
            null

          set({
            user: data.user,
            token,
            isLoading: false,
            error: null,
          })
        } catch (err: any) {
          set({
            error: getErrorMessage(err, 'خطا در ثبت‌نام'),
            isLoading: false,
          })

          throw err
        }
      },

      fetchMe: async () => {
        set({ isLoading: true, error: null })

        try {
          const { data } = await api.get('/auth/me')

          set({
            user: data.user || data,
            isLoading: false,
            error: null,
          })
        } catch (err: any) {
          set({
            user: null,
            token: null,
            error: getErrorMessage(err, 'خطا در دریافت اطلاعات کاربر'),
            isLoading: false,
          })

          throw err
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          error: null,
          isLoading: false,
        })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)
