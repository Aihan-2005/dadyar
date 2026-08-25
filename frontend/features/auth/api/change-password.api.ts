import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

interface ChangePasswordApiResponse {
  success: boolean
  message?: string
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await api.post<ChangePasswordApiResponse>(
    '/auth/change-password',
    payload,
  )
}

export function getChangePasswordErrorMessage(
  error: unknown,
  fallbackMessage = 'تغییر رمز عبور ناموفق بود.',
): string {
  return getApiErrorMessage(error, fallbackMessage)
}