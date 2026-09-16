import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import {
  useAuthStore,
  type User,
} from '@/store/auth.store'


type ApiEnvelope<T> = {
  success: boolean
  data: T
  message?: string
}


type RequestOtpResult = {
  expiresIn: number
  resendAfter: number
}


type AuthResponseData = {
  user: User
  accessToken: string
  accessTokenExpiresIn: number
}


type ClientSignupInput = {
  phone: string
  password: string
}


type ClientPasswordLoginInput = {
  phone: string
  password: string
}


type ClientOtpLoginInput = {
  phone: string
  code: string
}


function assertAuthResponse(
  value:
    unknown,
): AuthResponseData {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    throw new Error(
      'پاسخ احراز هویت معتبر نیست.',
    )
  }


  const data =
    value as Partial<AuthResponseData>


  if (
    !data.user ||
    typeof data.accessToken !==
      'string' ||
    !data.accessToken.trim()
  ) {
    throw new Error(
      'پاسخ احراز هویت معتبر نیست.',
    )
  }


  return data as AuthResponseData
}


async function rejectNonClientSession(
  user:
    User,
): Promise<never> {
 
  try {
    await api.post(
      '/auth/logout',
    )
  } catch {
   }


  useAuthStore.setState({
    user:
      null,

    token:
      null,

    isLoading:
      false,

    isSessionChecking:
      false,

    isInitialized:
      true,

    error:
      null,
  })


  throw new Error(
    user.role ===
      'LAWYER'
      ? 'این شماره مربوط به حساب وکیل است. از بخش ورود وکلا استفاده کنید.'
      : 'این حساب برای ورود به بخش موکلین مجاز نیست.',
  )
}


async function applyClientAuthSession(
  payload:
    AuthResponseData,
): Promise<void> {
  if (
    payload.user.role !==
    'CLIENT'
  ) {
    await rejectNonClientSession(
      payload.user,
    )
  }


  useAuthStore.setState({
    user:
      payload.user,

    token:
      payload.accessToken,

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


function readRequestOtpResult(
  value:
    unknown,
): RequestOtpResult {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    throw new Error(
      'پاسخ ارسال کد ورود معتبر نیست.',
    )
  }


  const data =
    value as Partial<RequestOtpResult>


  if (
    typeof data.expiresIn !==
      'number' ||
    !Number.isFinite(
      data.expiresIn,
    ) ||
    typeof data.resendAfter !==
      'number' ||
    !Number.isFinite(
      data.resendAfter,
    )
  ) {
    throw new Error(
      'پاسخ ارسال کد ورود معتبر نیست.',
    )
  }


  return {
    expiresIn:
      data.expiresIn,

    resendAfter:
      data.resendAfter,
  }
}


 
export async function clientSignup(
  input:
    ClientSignupInput,
): Promise<void> {
  const response =
    await api.post<
      ApiEnvelope<AuthResponseData>
    >(
      '/auth/client/signup',

      input,
    )


  if (
    response.data.success !==
    true
  ) {
    throw new Error(
      response.data.message ||
        'ثبت‌نام موکل ناموفق بود.',
    )
  }


  const authData =
    assertAuthResponse(
      response.data.data,
    )


  await applyClientAuthSession(
    authData,
  )
}

 
export async function clientPasswordLogin(
  input:
    ClientPasswordLoginInput,
): Promise<void> {
  const response =
    await api.post<
      ApiEnvelope<AuthResponseData>
    >(
      '/auth/login',

      input,
    )


  if (
    response.data.success !==
    true
  ) {
    throw new Error(
      response.data.message ||
        'ورود با رمز عبور ناموفق بود.',
    )
  }


  const authData =
    assertAuthResponse(
      response.data.data,
    )


  await applyClientAuthSession(
    authData,
  )
}


 
export async function requestClientLoginOtp(
  phone:
    string,
): Promise<RequestOtpResult> {
  const response =
    await api.post<
      ApiEnvelope<RequestOtpResult>
    >(
      '/auth/otp/request',

      {
        phone,
      },
    )


  if (
    response.data.success !==
    true
  ) {
    throw new Error(
      response.data.message ||
        'ارسال کد ورود ناموفق بود.',
    )
  }


  return readRequestOtpResult(
    response.data.data,
  )
}

 
export async function clientOtpLogin(
  input:
    ClientOtpLoginInput,
): Promise<void> {
  const response =
    await api.post<
      ApiEnvelope<AuthResponseData>
    >(
      '/auth/otp/login',

      input,
    )


  if (
    response.data.success !==
    true
  ) {
    throw new Error(
      response.data.message ||
        'ورود با کد یک‌بارمصرف ناموفق بود.',
    )
  }


  const authData =
    assertAuthResponse(
      response.data.data,
    )


  await applyClientAuthSession(
    authData,
  )
}


export function getClientAuthApiErrorMessage(
  error:
    unknown,

  fallback =
    'عملیات با خطا مواجه شد.',
): string {
  return getApiErrorMessage(
    error,

    fallback,
  )
}
