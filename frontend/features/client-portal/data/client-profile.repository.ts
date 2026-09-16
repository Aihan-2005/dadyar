import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  ClientProfile,
} from '@/types/client-profile'


type ApiEnvelope<T> = {
  success: boolean
  data: T
  message?: string
}


const CLIENT_PROFILE_ENDPOINT =
  '/clients/me/profile'


const CACHE_KEY_PREFIX =
  'dadyar:client-portal:fullname-cache:'


const PROFILE_CHANGED_EVENT =
  'dadyar:client-profile:changed'


function isBrowser(): boolean {
  return typeof window !==
    'undefined'
}


function normalizeFullName(
  fullName:
    string,
): string {
  const normalizedFullName =
    fullName.trim()


  if (
    normalizedFullName.length <
    3
  ) {
    throw new Error(
      'نام و نام خانوادگی را کامل وارد کنید.',
    )
  }


  return normalizedFullName
}


function readCachedFullName(
  userId:
    string,
): string {
  if (
    !isBrowser()
  ) {
    return ''
  }


  return (
    window.localStorage.getItem(
      CACHE_KEY_PREFIX +
        userId,
    ) ??
    ''
  ).trim()
}


function notifyProfileChanged(): void {
  if (
    !isBrowser()
  ) {
    return
  }


  window.dispatchEvent(
    new Event(
      PROFILE_CHANGED_EVENT,
    ),
  )
}


function writeCachedFullName(
  userId:
    string,

  fullName:
    string,
): void {
  if (
    !isBrowser()
  ) {
    return
  }


  window.localStorage.setItem(
    CACHE_KEY_PREFIX +
      userId,

    fullName,
  )


  notifyProfileChanged()
}


 
export function stageClientFullName(
  userId:
    string,

  fullName:
    string,
): string {
  const normalizedFullName =
    normalizeFullName(
      fullName,
    )


  writeCachedFullName(
    userId,

    normalizedFullName,
  )


  return normalizedFullName
}


export function clearClientFullNameCache(
  userId:
    string,
): void {
  if (
    !isBrowser()
  ) {
    return
  }


  window.localStorage.removeItem(
    CACHE_KEY_PREFIX +
      userId,
  )


  notifyProfileChanged()
}


function validateProfile(
  profile:
    ClientProfile,

  expectedUserId:
    string,
): ClientProfile {
  if (
    !profile ||
    typeof profile !==
      'object' ||
    typeof profile.id !==
      'string' ||
    typeof profile.userId !==
      'string' ||
    typeof profile.fullName !==
      'string' ||
    profile.userId !==
      expectedUserId
  ) {
    throw new Error(
      'ساختار پاسخ پروفایل موکل معتبر نیست.',
    )
  }


  return {
    ...profile,

    fullName:
      profile.fullName.trim(),
  }
}


export function getClientFullName(
  userId:
    string,
): string {
  return readCachedFullName(
    userId,
  )
}


export async function saveClientFullName(
  userId:
    string,

  fullName:
    string,
): Promise<ClientProfile> {
  const normalizedFullName =
    normalizeFullName(
      fullName,
    )


  try {
    const response =
      await api.patch<
        ApiEnvelope<ClientProfile>
      >(
        CLIENT_PROFILE_ENDPOINT,

        {
          fullName:
            normalizedFullName,
        },
      )


    if (
      response.data.success !==
        true ||
      !response.data.data
    ) {
      throw new Error(
        'ساختار پاسخ ذخیره پروفایل معتبر نیست.',
      )
    }


    const profile =
      validateProfile(
        response.data.data,

        userId,
      )


    writeCachedFullName(
      userId,

      profile.fullName,
    )


    return profile
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'ذخیره نام و نام خانوادگی ناموفق بود.',
      ),
    )
  }
}


export async function getClientProfile(
  userId:
    string,
): Promise<
  ClientProfile | null
> {
  try {
    const response =
      await api.get<
        ApiEnvelope<
          ClientProfile | null
        >
      >(
        CLIENT_PROFILE_ENDPOINT,
      )


    if (
      response.data.success !==
      true
    ) {
      throw new Error(
        'ساختار پاسخ پروفایل موکل معتبر نیست.',
      )
    }


    if (
      !response.data.data
    ) {
    
      const stagedFullName =
        readCachedFullName(
          userId,
        )


      if (
        stagedFullName
      ) {
        return saveClientFullName(
          userId,

          stagedFullName,
        )
      }


      return null
    }


    const profile =
      validateProfile(
        response.data.data,

        userId,
      )


    writeCachedFullName(
      userId,

      profile.fullName,
    )


    return profile
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت پروفایل موکل ناموفق بود.',
      ),
    )
  }
}


export function subscribeClientProfile(
  listener:
    () => void,
): () => void {
  if (
    !isBrowser()
  ) {
    return () =>
      undefined
  }


  window.addEventListener(
    PROFILE_CHANGED_EVENT,

    listener,
  )


  return () => {
    window.removeEventListener(
      PROFILE_CHANGED_EVENT,

      listener,
    )
  }
}