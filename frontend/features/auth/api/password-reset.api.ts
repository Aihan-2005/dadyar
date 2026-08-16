import axios from 'axios'

import {
  getApiErrorMessage,
} from '@/lib/api'


export const PASSWORD_RESET_OTP_LENGTH =
  6

const API_TIMEOUT_MS =
  25_000

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const IRAN_MOBILE_PATTERN =
  /^09\d{9}$/



const passwordResetClient =
  axios.create({
    baseURL:
      '/api/proxy',

    timeout:
      API_TIMEOUT_MS,

    withCredentials:
      true,  headers: {
      Accept:
        'application/json',

      'Content-Type':
        'application/json',
    },
  })


interface ApiEnvelope<T> {
  success:
    boolean

  data:
    T

  message?:
    string
}


export interface RequestPasswordResetInput {
  identifier:
    string
}

export interface VerifyPasswordResetOtpInput {
  challengeId:
    string

  otp:
    string
}

export interface ResendPasswordResetOtpInput {
  challengeId:
    string}

export interface ConfirmPasswordResetInput {
  resetToken:
    string

  newPassword:
    string
}


export interface PasswordResetChallenge {
  challengeId:
    string


  destination:
    string


  expiresIn:
    number

 
  resendAfter:
    number
}

export interface PasswordResetVerification {
  resetToken:
    string

  expiresIn:
    number
}

export interface PasswordResetConfirmation {
  passwordReset:
    boolean
}



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

function normalizeIdentifier(
  identifier:
    string
): string {
  const trimmed =
    identifier.trim()

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

function normalizeOtp(
  otp:
    string
): string {
  const normalized =
    normalizeDigits(
      otp
    ).replace(
      /\D/g,
      ''
    )
if (
    normalized.length !==
    PASSWORD_RESET_OTP_LENGTH
  ) {
    throw new Error(
      `کد تأیید باید ${PASSWORD_RESET_OTP_LENGTH.toLocaleString(
        'fa-IR'
      )} رقم باشد.`
    )
  }

  return normalized
}



function getPositiveNumber(
  value:
    unknown,

  fallback:
    number
): number {
  const numberValue =
    Number(
      value
    )

  return (
    Number.isFinite(
      numberValue
    ) &&
    numberValue >
      0
  )
    ? numberValue
    : fallback
}

function parseChallengeResponse(
  response:
    ApiEnvelope<PasswordResetChallenge>
): PasswordResetChallenge {
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
      'پاسخ درخواست کد تأیید معتبر نیست.'
    )
  }

  return {
    challengeId:
      data.challengeId.trim(),

    destination:
      typeof data.destination ===
        'string' &&
      data.destination
        .trim()
        .length >
        0
        ? data.destination.trim()
        : 'راه ارتباطی ثبت‌شده شما',

    expiresIn:
      getPositiveNumber(
        data.expiresIn,
        300
      ),

    resendAfter:
      getPositiveNumber(
        data.resendAfter,
        60
      ),
  }
}

function parseVerificationResponse(
  response:
    ApiEnvelope<PasswordResetVerification>
): PasswordResetVerification {
  const data =
    response.data

  if (
    response.success !==
      true ||
    !data ||
    typeof data.resetToken !==
      'string' ||
    data.resetToken
      .trim()
      .length ===
      0
  ) {
    throw new Error(
      'پاسخ تأیید کد معتبر نیست.'
    )
  }

  return {
    resetToken:
      data.resetToken.trim(),

    expiresIn:
      getPositiveNumber(
        data.expiresIn,
        600
      ),
  }}

function parseConfirmationResponse(
  response:
    ApiEnvelope<PasswordResetConfirmation>
): PasswordResetConfirmation {
  if (
    response.success !==
      true ||
    response.data
      ?.passwordReset !==
      true
  ) {
    throw new Error(
      'تغییر رمز عبور تأیید نشد.'
    )
  }

  return {
    passwordReset:
      true,
  }
}

export async function requestPasswordReset(
  input:
    RequestPasswordResetInput
): Promise<PasswordResetChallenge> {
  const identifier =
    normalizeIdentifier(
      input.identifier
    )

  const response =
    await passwordResetClient.post<
      ApiEnvelope<PasswordResetChallenge>
    >(
      '/auth/password-reset/request',

      {
        identifier,
      }
    )

  return parseChallengeResponse(
    response.data
  )
}




export async function verifyPasswordResetOtp(
  input:
    VerifyPasswordResetOtpInput
): Promise<PasswordResetVerification> {
  const challengeId =
    input.challengeId.trim()

  if (!challengeId) { throw new Error(
      'شناسه درخواست بازیابی رمز معتبر نیست.'
    )
  }

  const response =
    await passwordResetClient.post<
      ApiEnvelope<PasswordResetVerification>
    >(
      '/auth/password-reset/verify',

      {
        challengeId,

        otp:
          normalizeOtp(
            input.otp
          ),
      }
    )

  return parseVerificationResponse(
    response.data
  )
}




export async function resendPasswordResetOtp(
  input:
    ResendPasswordResetOtpInput
): Promise<PasswordResetChallenge> {
  const challengeId =
    input.challengeId.trim()

  if (!challengeId) {
    throw new Error(
      'شناسه درخواست بازیابی رمز معتبر نیست.'
    )
  }
  const response =
    await passwordResetClient.post<
      ApiEnvelope<PasswordResetChallenge>
    >(
      '/auth/password-reset/resend',

      {
        challengeId,
      }
    )

  return parseChallengeResponse(
    response.data
  )
}






export async function confirmPasswordReset(
  input:
    ConfirmPasswordResetInput
): Promise<PasswordResetConfirmation> {
  const resetToken =
    input.resetToken.trim()

  if (!resetToken) {
    throw new Error(
      'توکن تغییر رمز معتبر نیست.'
    )
  }

  const response =
    await passwordResetClient.post<
      ApiEnvelope<PasswordResetConfirmation>
    >(
      '/auth/password-reset/confirm',
 {
        resetToken,

        newPassword:
          input.newPassword,
      }
    )

  return parseConfirmationResponse(
    response.data
  )
}




export function getPasswordResetErrorMessage(
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