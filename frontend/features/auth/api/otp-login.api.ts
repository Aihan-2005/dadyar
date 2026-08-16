import axios from 'axios'

import {
  getApiErrorMessage,
} from '@/lib/api'

import type {
  User,
} from '@/store/auth.store'

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

export const LOGIN_OTP_LENGTH =
  6

const API_TIMEOUT_MS =
  25_000

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const IRAN_MOBILE_PATTERN =
  /^09\d{9}$/

/*
|--------------------------------------------------------------------------
| Public Auth Client
|--------------------------------------------------------------------------
|
| OTP login intentionally uses its own Axios instance.
|
| Why?
| Wrong/expired OTP can return 401.
| That 401 must NOT trigger normal access-token refresh logic.
|--------------------------------------------------------------------------
*/

const otpAuthClient =
  axios.create({
    baseURL:
      '/api/proxy',

    timeout:
      API_TIMEOUT_MS,

    withCredentials:
      true,

    headers: {
      Accept:
        'application/json',

      'Content-Type':
        'application/json',
    },
  })

/*
|--------------------------------------------------------------------------
| Shared Envelope
|--------------------------------------------------------------------------
*/

interface ApiEnvelope<T> {
  success:
    boolean

  data:
    T

  message?:
    string
}

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type OtpPurpose = 'LOGIN'

export interface LoginOtpChallenge {
  challengeId:
    string

  /*
   * Masked destination returned by backend.
   *
   * Example:
   * 0912***7890
   * m***@gmail.com
   */
  destination:
    string

  expiresIn:
    number

  resendAfter:
    number
}

export interface LoginOtpSession {
  user:
    User

  accessToken:
    string

  accessTokenExpiresIn:
    number
}

interface RequestLoginOtpPayload {
  identifier:
    string

  purpose:
    OtpPurpose
}

interface VerifyLoginOtpPayload {
  challengeId:
    string

  otp:
    string
}

interface ResendLoginOtpPayload {
  challengeId:
    string
}

/*
|--------------------------------------------------------------------------
| Normalize Digits
|--------------------------------------------------------------------------
*/

function normalizeDigits(
 value:
    string
): string {
  const persianDigits =
    '۰۱۲۳۴۵۶۷۸۹'

  const arabicDigits =
    '٠١٢٣٤٥٦٧٨٩'

  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          persianDigits.indexOf(
            digit
          )
        )
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          arabicDigits.indexOf(
            digit
          )
        )
    )
}

/*
|--------------------------------------------------------------------------
| Identifier
|--------------------------------------------------------------------------
*/

function normalizeIdentifier(
  value:
    string
): string {
  const trimmed =
    value.trim()

  if (
    EMAIL_PATTERN.test(
      trimmed
    )
  ) {
    return trimmed.toLowerCase()
  }

  const phone =
    normalizeDigits(
      trimmed
    )

  if (
    IRAN_MOBILE_PATTERN.test(
      phone
    )
  ) {
    return phone
  }

  throw new Error(
    'ایمیل یا شماره همراه معتبر نیست.'
  )
}

/*
|--------------------------------------------------------------------------
| OTP
|--------------------------------------------------------------------------
*/

function normalizeOtp(
  value:
    string
): string {
  const otp =
    normalizeDigits(
      value ).replace(
      /\D/g,
      ''
    )

  if (
    otp.length !==
    LOGIN_OTP_LENGTH
  ) {
    throw new Error(
      `کد ورود باید ${LOGIN_OTP_LENGTH.toLocaleString(
        'fa-IR'
      )} رقم باشد.`
    )
  }

  return otp
}

/*
|--------------------------------------------------------------------------
| Numbers
|--------------------------------------------------------------------------
*/

function positiveNumber(
  value:
    unknown,

  fallback:
    number
): number {
  const result =
    Number(
      value
    )

  if (
    Number.isFinite(
      result
    ) &&
    result >
      0
  ) {
    return result
  }

  return fallback
}

/*
|--------------------------------------------------------------------------
| Parse Challenge
|--------------------------------------------------------------------------
*/

function parseChallenge(
  response:
    ApiEnvelope<LoginOtpChallenge>
): LoginOtpChallenge {
  const data =
    response.data

  if (
    response.success !==
      true ||
    !data ||
    typeof data.challengeId !==
      'string' ||
    data.challengeId
      .trim()
      .length ===
      0
  ) {
    throw new Error(
      'پاسخ ارسال کد ورود معتبر نیست.'
    )
  } return {
    challengeId:
      data.challengeId.trim(),

    destination:
      typeof data.destination ===
        'string' &&
      data.destination.trim()
        .length >
        0
        ? data.destination.trim()
        : 'راه ارتباطی ثبت‌شده',

    expiresIn:
      positiveNumber(
        data.expiresIn,
        300
      ),

    resendAfter:
      positiveNumber(
        data.resendAfter,
        60
      ),
  }
}

/*
|--------------------------------------------------------------------------
| Parse Session
|--------------------------------------------------------------------------
*/

function parseSession(
  response:
    ApiEnvelope<LoginOtpSession>
): LoginOtpSession {
  const data =
    response.data

  if (
    response.success !==
      true ||
    !data?.user ||
    typeof data.accessToken !==
      'string' ||
    data.accessToken.trim()
      .length ===
      0
  ) {
    throw new Error(
      'پاسخ ورود با کد یک‌بارمصرف معتبر نیست.'
    )
  }

  return {
    user:
      data.user,

    accessToken:
      data.accessToken.trim(),

    accessTokenExpiresIn:
      positiveNumber(
        data.accessTokenExpiresIn,
        900
      ),
  }
}

/*
|--------------------------------------------------------------------------
| Request Login OTP
|--------------------------------------------------------------------------
|
| POST /auth/otp/request
|
| {
|   identifier: string,
|   purpose: "LOGIN"
| }
|--------------------------------------------------------------------------
*/

export async function requestLoginOtp(
  identifier:
    string
): Promise<LoginOtpChallenge> {
  const payload:
    RequestLoginOtpPayload = {
      identifier:normalizeIdentifier(
          identifier
        ),

      purpose:
        'LOGIN',
    }

  const response =
    await otpAuthClient.post<
      ApiEnvelope<LoginOtpChallenge>
    >(
      '/auth/otp/request',
      payload
    )

  return parseChallenge(
    response.data
  )
}

/*
|--------------------------------------------------------------------------
| Verify Login OTP
|--------------------------------------------------------------------------
|
| Successful verification must return the SAME auth session shape
| used by normal password login.
|--------------------------------------------------------------------------
*/

export async function verifyLoginOtp(
  challengeId:
    string,

  otp:
    string
): Promise<LoginOtpSession> {
  const normalizedChallengeId =
    challengeId.trim()

  if (
    !normalizedChallengeId
  ) {
    throw new Error(
      'درخواست ورود معتبر نیست.'
    )
  }

  const payload:
    VerifyLoginOtpPayload = {
      challengeId:
        normalizedChallengeId,

      otp:
        normalizeOtp(
          otp
        ),
    }

  const response =
    await otpAuthClient.post<
      ApiEnvelope<LoginOtpSession>
    >(
      '/auth/otp/verify',
      payload
    )

  return parseSession(
    response.data
  )
}

/*
|--------------------------------------------------------------------------
| Resend
|--------------------------------------------------------------------------
*/

export async function resendLoginOtp(
  challengeId:
    string
): Promise<LoginOtpChallenge> {
  const normalizedChallengeId =
    challengeId.trim()

  if (
    !normalizedChallengeId  ) {
    throw new Error(
      'درخواست ورود معتبر نیست.'
    )
  }

  const payload:
    ResendLoginOtpPayload = {
      challengeId:
        normalizedChallengeId,
    }

  const response =
    await otpAuthClient.post<
      ApiEnvelope<LoginOtpChallenge>
    >(
      '/auth/otp/resend',
      payload
    )

  return parseChallenge(
    response.data
  )
}

/*
|--------------------------------------------------------------------------
| Error
|--------------------------------------------------------------------------
*/

export function getLoginOtpErrorMessage(
  error:
    unknown,

  fallback:
    string
): string {
  return getApiErrorMessage(
    error,
    fallback
  )
}