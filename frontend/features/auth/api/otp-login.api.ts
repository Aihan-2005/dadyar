import axios from 'axios'

import {
  getApiErrorMessage,
} from '@/lib/api'

import type {
  User,
} from '@/store/auth.store'




export const LOGIN_OTP_LENGTH =
  6

const API_TIMEOUT_MS =
  25_000

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const IRAN_MOBILE_PATTERN =
  /^09\d{9}$/


  

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


  

interface ApiEnvelope<T> {
  success:
    boolean

  data:
    T

  message?:
    string

  code?:
    string
}




interface BackendOtpRequestResult {
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




export interface LoginOtpChallenge {
  challengeId:
    string

  destination:
    string

  expiresIn:
    number

  resendAfter:
    number
}




type OtpIdentifier =
  | {
      channel:
        'phone'

      value:
        string
    }
  | {
      channel:
        'email'

      value:
        string
    }


    

type RequestOtpPayload =
  | {
      phone:
        string
    }
  | {
      email:
        string
    }

type VerifyOtpPayload =
  | {
      phone:
        string

      code:
        string
    }
  | {
      email:
        string

      code:
        string
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
  rawValue:
    string
): OtpIdentifier {
  const trimmed =
    rawValue.trim()

  if (
    EMAIL_PATTERN.test(
      trimmed
    )
  ) {
    return {
      channel:
        'email',

      value:
        trimmed.toLowerCase(),
    }
  }

  const normalizedPhone =
    normalizeDigits(
      trimmed
    )
      .replace(
        /\s+/g,
        ''
      )

  if (
    IRAN_MOBILE_PATTERN.test(
      normalizedPhone
    )
  ) {
    return {
      channel:
        'phone',

      value:
        normalizedPhone,
    }
  }

  throw new Error(
    'ایمیل یا شماره همراه معتبر نیست.'
  )
}




function normalizeOtp(
  rawValue:
    string
): string {
  const normalized =
    normalizeDigits(
      rawValue
    )
      .replace(
        /\D/g,
        ''
      )

  if (
    normalized.length !==
    LOGIN_OTP_LENGTH
  ) {
    throw new Error(
      `کد ورود باید ${LOGIN_OTP_LENGTH.toLocaleString(
        'fa-IR'
      )} رقم باشد.`
    )
  }

  return normalized
}




function positiveNumber(
  value:
    unknown,

  fallback:
    number
): number {
  const number =
    Number(
      value
    )

  if (
    Number.isFinite(
      number
    ) &&
    number >
      0
  ) {
    return number
  }

  return fallback
}



function createRequestPayload(
  identifier:
    OtpIdentifier
): RequestOtpPayload {
  if (
    identifier.channel ===
    'email'
  ) {
    return {
      email:
        identifier.value,
    }
  }

  return {
    phone:
      identifier.value,
  }
}

function createVerifyPayload(
  identifier:
    OtpIdentifier,

  code:
    string
): VerifyOtpPayload {
  if (
    identifier.channel ===
    'email'
  ) {
    return {
      email:
        identifier.value,

      code,
    }
  }

  return {
    phone:
      identifier.value,

    code,
  }
}




function createChallengeId(
  identifier:
    OtpIdentifier
): string {
  return [
    identifier.channel,
    encodeURIComponent(
      identifier.value
    ),
  ].join(':')
}

function parseChallengeId(
  challengeId:
    string
): OtpIdentifier {
  const normalized =
    challengeId.trim()

  const separatorIndex =
    normalized.indexOf(
      ':'
    )

  if (
    separatorIndex <=
      0
  ) {
    throw new Error(
      'درخواست ورود معتبر نیست. دوباره کد دریافت کنید.'
    )
  }

  const channel =
    normalized.slice(
      0,
      separatorIndex
    )

  const encodedValue =
    normalized.slice(
      separatorIndex +
        1
    )

  if (
    channel !==
      'phone' &&
    channel !==
      'email'
  ) {
    throw new Error(
      'درخواست ورود معتبر نیست. دوباره کد دریافت کنید.'
    )
  }

  let decodedValue:
    string

  try {
    decodedValue =
      decodeURIComponent(
        encodedValue
      )
  } catch {
    throw new Error(
      'درخواست ورود معتبر نیست. دوباره کد دریافت کنید.'
    )
  }

  return normalizeIdentifier(
    decodedValue
  )
}



function maskPhone(
  phone:
    string
): string {
  if (
    phone.length !==
    11
  ) {
    return phone
  }

  return `${phone.slice(
    0,
    4
  )}***${phone.slice(
    -4
  )}`
}

function maskEmail(
  email:
    string
): string {
  const [
    localPart,
    domain,
  ] =
    email.split(
      '@'
    )

  if (
    !localPart ||
    !domain
  ) {
    return email
  }

  const firstCharacter =
    localPart.charAt(
      0
    )

  return `${firstCharacter}***@${domain}`
}

function maskIdentifier(
  identifier:
    OtpIdentifier
): string {
  if (
    identifier.channel ===
    'phone'
  ) {
    return maskPhone(
      identifier.value
    )
  }

  return maskEmail(
    identifier.value
  )
}




function parseOtpMetadata(
  response:
    ApiEnvelope<BackendOtpRequestResult>
): BackendOtpRequestResult {
  if (
    response.success !==
    true ||
    !response.data
  ) {
    throw new Error(
      'پاسخ ارسال کد ورود معتبر نیست.'
    )
  }

  return {
    expiresIn:
      positiveNumber(
        response.data
          .expiresIn,
        120
      ),

    resendAfter:
      positiveNumber(
        response.data
          .resendAfter,
        60
      ),
  }
}




function createChallenge(
  identifier:
    OtpIdentifier,

  metadata:
    BackendOtpRequestResult
): LoginOtpChallenge {
  return {
    challengeId:
      createChallengeId(
        identifier
      ),

    destination:
      maskIdentifier(
        identifier
      ),

    expiresIn:
      metadata.expiresIn,

    resendAfter:
      metadata.resendAfter,
  }
}




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
    data.accessToken
      .trim()
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




export async function requestLoginOtp(
  rawIdentifier:
    string
): Promise<LoginOtpChallenge> {
  const identifier =
    normalizeIdentifier(
      rawIdentifier
    )

  const payload =
    createRequestPayload(
      identifier
    )

  const response =
    await otpAuthClient.post<
      ApiEnvelope<BackendOtpRequestResult>
    >(
      '/auth/otp/request',
      payload
    )

  const metadata =
    parseOtpMetadata(
      response.data
    )

  return createChallenge(
    identifier,
    metadata
  )
}



export async function verifyLoginOtp(
  challengeId:
    string,

  rawOtp:
    string
): Promise<LoginOtpSession> {
  const identifier =
    parseChallengeId(
      challengeId
    )

  const code =
    normalizeOtp(
      rawOtp
    )

  const payload =
    createVerifyPayload(
      identifier,
      code
    )

  const response =
    await otpAuthClient.post<
      ApiEnvelope<LoginOtpSession>
    >(
      '/auth/otp/login',
      payload
    )

  return parseSession(
    response.data
  )
}




export async function resendLoginOtp(
  challengeId:
    string
): Promise<LoginOtpChallenge> {
  const identifier =
    parseChallengeId(
      challengeId
    )

  const payload =
    createRequestPayload(
      identifier
    )

  const response =
    await otpAuthClient.post<
      ApiEnvelope<BackendOtpRequestResult>
    >(
      '/auth/otp/request',
      payload
    )

  const metadata =
    parseOtpMetadata(
      response.data
    )

  return createChallenge(
    identifier,
    metadata
  )
}



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