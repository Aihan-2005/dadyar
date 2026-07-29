import axios from 'axios'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
  api,
  configureApiAuth,
  getApiErrorMessage,
} from '@/lib/api'

export type User = {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  role: 'LAWYER' | 'CLIENT' | string
  status:
    | 'PENDING_VERIFICATION'
    | 'ACTIVE'
    | 'SUSPENDED'
    | string
  profile?: Record<string, unknown>
}

export type LoginCredentials =
  | {
      identifier: string
      password: string
    }
  | {
      email: string
      password: string
      phone?: never
    }
  | {
      phone: string
      password: string
      email?: never
    }

export type SignupPayload = {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  password: string
}

type LoginRequest =
  | {
      email: string
      password: string
    }
  | {
      phone: string
      password: string
    }

type AuthResponseData = {
  user: User
  accessToken: string
  accessTokenExpiresIn: number
}

type MeResponseData = {
  user: User
}

type ApiEnvelope<T> = {
  success: boolean
  data: T
  message?: string
}

type AuthStore = {
  user: User | null
  token: string | null

  isLoading: boolean
  isSessionChecking: boolean
  isInitialized: boolean
  hasHydrated: boolean

  error: string | null

  login: (
    credentials: LoginCredentials,
  ) => Promise<void>

  signup: (
    payload: SignupPayload,
  ) => Promise<void>

 
  register: (
    payload: SignupPayload,
  ) => Promise<void>

  fetchMe: () => Promise<User | null>
  initialize: () => Promise<void>
  logout: () => Promise<void>

  clearError: () => void

  setHasHydrated: (
    hasHydrated: boolean,
  ) => void
}

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const IRAN_MOBILE_PATTERN =
  /^09\d{9}$/

function normalizeDigits(value: string): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩'

  return value
    .replace(/[۰-۹]/g, (digit) =>
      String(
        persianDigits.indexOf(digit),
      ),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String(
        arabicDigits.indexOf(digit),
      ),
    )
}

function createLoginRequest(
  credentials: LoginCredentials,
): LoginRequest {
  const password = credentials.password

  if (
    'email' in credentials &&
    credentials.email
  ) {
    return {
      email: credentials.email
        .trim()
        .toLowerCase(),
      password,
    }
  }

  if (
    'phone' in credentials &&
    credentials.phone
  ) {
    return {
      phone: normalizeDigits(
        credentials.phone,
      ).trim(),
      password,
    }
  }

  if (!('identifier' in credentials)) {
    throw new Error(
      'ایمیل یا شماره همراه وارد نشده است.',
    )
  }

  const identifier =
    credentials.identifier.trim()

  const normalizedPhone =
    normalizeDigits(identifier)

  if (EMAIL_PATTERN.test(identifier)) {
    return {
      email: identifier.toLowerCase(),
      password,
    }
  }

  if (
    IRAN_MOBILE_PATTERN.test(
      normalizedPhone,
    )
  ) {
    return {
      phone: normalizedPhone,
      password,
    }
  }

  throw new Error(
    'ایمیل یا شماره همراه معتبر نیست.',
  )
}

function createSignupRequest(
  payload: SignupPayload,
): SignupPayload {
  const email = payload.email
    ?.trim()
    .toLowerCase()

  const phone = payload.phone
    ? normalizeDigits(
        payload.phone,
      ).trim()
    : undefined

  if (!email && !phone) {
    throw new Error(
      'حداقل ایمیل یا شماره همراه باید وارد شود.',
    )
  }

  return {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    password: payload.password,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
  }
}

function getAuthResponseData(
  response: ApiEnvelope<AuthResponseData>,
): AuthResponseData {
  const data = response.data

  if (
    response.success !== true ||
    !data?.user ||
    typeof data.accessToken !== 'string' ||
    data.accessToken.trim().length === 0
  ) {
    throw new Error(
      'ساختار پاسخ ورود یا ثبت‌نام معتبر نیست.',
    )
  }

  return data
}

function getMeResponseUser(
  response: ApiEnvelope<MeResponseData>,
): User {
  if (
    response.success !== true ||
    !response.data?.user
  ) {
    throw new Error(
      'ساختار پاسخ اطلاعات کاربر معتبر نیست.',
    )
  }

  return response.data.user
}

function isUnauthorized(
  error: unknown,
): boolean {
  return (
    axios.isAxiosError(error) &&
    (error.response?.status === 401 ||
      error.response?.status === 403)
  )
}

async function requestCurrentUser(): Promise<User> {
  const response =
    await api.get<ApiEnvelope<MeResponseData>>(
      '/auth/me',
    )

  return getMeResponseUser(response.data)
}

export const useAuthStore =
  create<AuthStore>()(
    persist(
      (set, get) => {
        const signup = async (
          payload: SignupPayload,
        ): Promise<void> => {
          set({
            isLoading: true,
            error: null,
          })

          try {
            const requestPayload =
              createSignupRequest(payload)

            const response =
              await api.post<
                ApiEnvelope<AuthResponseData>
              >(
                '/auth/signup',
                requestPayload,
              )

            const authData =
              getAuthResponseData(
                response.data,
              )

            set({
              user: authData.user,
              token:
                authData.accessToken,
              isLoading: false,
              isInitialized: true,
              error: null,
            })
          } catch (error: unknown) {
            const message =
              getApiErrorMessage(
                error,
                'ثبت‌نام ناموفق بود.',
              )

            set({
              isLoading: false,
              error: message,
            })

            throw error
          }
        }

        return {
          user: null,
          token: null,

          isLoading: false,
          isSessionChecking: false,
          isInitialized: false,
          hasHydrated: false,

          error: null,

          login: async (
            credentials,
          ) => {
            set({
              isLoading: true,
              error: null,
            })

            try {
              const requestPayload =
                createLoginRequest(
                  credentials,
                )

              const response =
                await api.post<
                  ApiEnvelope<AuthResponseData>
                >(
                  '/auth/login',
                  requestPayload,
                )

              const authData =
                getAuthResponseData(
                  response.data,
                )

              set({
                user: authData.user,
                token:
                  authData.accessToken,
                isLoading: false,
                isInitialized: true,
                error: null,
              })
            } catch (
              error: unknown
            ) {
              const message =
                getApiErrorMessage(
                  error,
                  'ورود به حساب کاربری ناموفق بود.',
                )

              set({
                isLoading: false,
                error: message,
              })

              throw error
            }
          },

          signup,

        
          register: signup,

          fetchMe: async () => {
            set({
              isSessionChecking: true,
              error: null,
            })

            try {
              const user =
                await requestCurrentUser()

              set({
                user,
                isSessionChecking: false,
                isInitialized: true,
                error: null,
              })

              return user
            } catch (
              error: unknown
            ) {
              const unauthorized =
                isUnauthorized(error)

              set({
                ...(unauthorized
                  ? {
                      user: null,
                      token: null,
                    }
                  : {}),

                isSessionChecking: false,
                isInitialized: true,

                error: unauthorized
                  ? null
                  : getApiErrorMessage(
                      error,
                      'بررسی وضعیت ورود ناموفق بود.',
                    ),
              })

              return null
            }
          },

          initialize: async () => {
            if (
              get().isInitialized ||
              get().isSessionChecking
            ) {
              return
            }

            await get().fetchMe()
          },

          logout: async () => {
           
            set({
              user: null,
              token: null,
              error: null,
              isLoading: false,
              isSessionChecking: false,
              isInitialized: true,
            })

            try {
             
              await api.post(
                '/auth/logout',
              )
            } catch (
              error: unknown
            ) {
              console.error(
                '[Auth] Backend logout failed:',
                getApiErrorMessage(
                  error,
                  'خروج از سرور ناموفق بود.',
                ),
              )
            }
          },

          clearError: () =>
            set({
              error: null,
            }),

          setHasHydrated: (
            hasHydrated,
          ) =>
            set({
              hasHydrated,
            }),
        }
      },

      {
        name: 'auth-storage',
        version: 2,

        partialize: (state) => ({
          user: state.user,
          token: state.token,
        }),

        onRehydrateStorage:
          () => (state) => {
            state?.setHasHydrated(true)
          },
      },
    ),
  )


configureApiAuth({
  getAccessToken: () =>
    useAuthStore.getState().token,

  setAccessToken: (
    accessToken,
  ) => {
    useAuthStore.setState({
      token: accessToken,
    })
  },

  clearSession: () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      isSessionChecking: false,
      isInitialized: true,
    })
  },
})