import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  LoginOtpSession,
} from '@/features/auth/api/otp-login.api'

/*
|--------------------------------------------------------------------------
| Complete External Authentication
|--------------------------------------------------------------------------
|
| Password login updates auth.store internally.
|
| OTP login is performed by a dedicated public API client, so after
| backend verification succeeds we commit the resulting session here.
|
| No OTP / challenge is persisted.
|--------------------------------------------------------------------------
*/

export function completeOtpAuthentication(
  session:
    LoginOtpSession
): void {
  if (
    !session.user ||
    !session.accessToken ||
    session.accessToken.trim()
      .length ===
      0
  ) {
    throw new Error(
      'نشست ورود معتبر نیست.'
    )
  }

  useAuthStore.setState({
    user:
      session.user,

    token:
      session.accessToken.trim(),

    isLoading:
      false,

    isSessionChecking:
      false,

    isInitialized:
      true,

    error:
      null,
  })
}