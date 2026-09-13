import { api, getApiErrorMessage } from '@/lib/api'
import { useAuthStore, type User } from '@/store/auth.store'

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

interface RequestOtpResult {
  expiresIn: number
  resendAfter: number
}

interface AuthResponseData {
  user: User
  accessToken: string
  accessTokenExpiresIn: number
}

export async function requestClientSignupOtp(
  phone: string
): Promise<RequestOtpResult> {
  const response = await api.post<ApiEnvelope<RequestOtpResult>>(
    '/auth/client/signup/otp/request',
    { phone }
  )

  return response.data.data
}

export async function clientSignup(input: {
  phone: string
  password: string
  code: string
}): Promise<void> {
  const response = await api.post<ApiEnvelope<AuthResponseData>>(
    '/auth/client/signup',
    input
  )

  const { user, accessToken } = response.data.data


  useAuthStore.setState({
    user,
    token: accessToken,
    isInitialized: true,
    error: null,
  })
}

export function getClientAuthApiErrorMessage(
  error: unknown,
  fallback = 'عملیات با خطا مواجه شد.'
): string {
  return getApiErrorMessage(error, fallback)
}