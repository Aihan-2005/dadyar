import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from '@/types/client'

import {
  parseFinanceDate,
} from '@/features/finance/utils/date'

import {
  normalizeDigits,
} from '@/features/finance/utils/number'

import type {
  ApiClientRecord,
  ApiCreateClientRequest,
  ApiUpdateClientRequest,
} from './types'

function clean(
  value?: string | null
): string {
  return (
    value?.trim() ||
    ''
  )
}

function optional(
  value?: string | null
): string | undefined {
  return (
    clean(value) ||
    undefined
  )
}

function normalizedDigits(
  value?: string | null
): string {
  return normalizeDigits(
    clean(value)
  )
}

function optionalDigits(
  value?: string | null
): string | undefined {
  return (
    normalizedDigits(
      value
    ) ||
    undefined
  )
}

function toBirthdayIso(
  value?: string
): string | undefined {
  if (
    !value?.trim()
  ) {
    return undefined
  }

  const parsed =
    parseFinanceDate(
      value
    )

  if (!parsed) {
    throw new Error(
      'تاریخ تولد معتبر نیست.'
    )
  }

  if (
    parsed.getTime() >
    Date.now()
  ) {
    throw new Error(
      'تاریخ تولد نمی‌تواند در آینده باشد.'
    )
  }

  return parsed.toISOString()
}

function toJalaliDate(
  value?: string
): string | undefined {
  if (!value) {
    return undefined
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return undefined
  }

  const parts =
    new Intl.DateTimeFormat(
      'en-US-u-ca-persian-nu-latn',
      {
        year:
          'numeric',

        month:
          '2-digit',

        day:
          '2-digit',
      }
    ).formatToParts(
      date
    )

  const year =
    parts.find(
      (part) =>
        part.type ===
        'year'
    )?.value

  const month =
    parts.find(
      (part) =>
        part.type ===
        'month'
    )?.value

  const day =
    parts.find(
      (part) =>
        part.type ===
        'day'
    )?.value

  if (
    !year ||
    !month ||
    !day
  ) {
    return undefined
  }

  return `${year}/${month}/${day}`
}


export function fromApiClient(
  source:
    ApiClientRecord
): Client {
  const birthDate =
    toJalaliDate(
      source.birthday
    )

  return {
    id:
      source._id,

    fullName:
      source.fullName,

    phoneNumber:
      source.phone,

    phone:
      source.phone,

    nationalId:
      source.nationalId,

    landlineNumber:
      source.homeNumber,

    birthDate,

    representative:
      source.represent,

    address:
      source.homeAddress,

    createdAt:
      source.createdAt,

    updatedAt:
      source.updatedAt,

    caseIds: [],
  }
}



export function toCreateClientApiRequest(
  source:
    CreateClientPayload
): ApiCreateClientRequest {
  const fullName =
    clean(
      source.fullName
    )

  const phone =
    normalizedDigits(
      source.phoneNumber
    )

  const nationalId =
    optionalDigits(
      source.nationalId
    )

  const homeNumber =
    optionalDigits(
      source.landlineNumber
    )

  if (!fullName) {
    throw new Error(
      'نام و نام خانوادگی موکل الزامی است.'
    )
  }

  if (
    !/^09\d{9}$/.test(
      phone
    )
  ) {
    throw new Error(
      'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.'
    )
  }

  if (
    nationalId &&
    !/^\d{10}$/.test(
      nationalId
    )
  ) {
    throw new Error(
      'کد ملی باید ۱۰ رقم باشد.'
    )
  }

  return {
    fullName,

    phone,

    nationalId,

    homeNumber,

    birthday:
      toBirthdayIso(
        source.birthDate
      ),

    homeAddress:
      optional(
        source.address
      ),

    represent:
      optional(
        source.representative
      ),
  }
}

export function toUpdateClientApiRequest(
  source:
    UpdateClientPayload
): ApiUpdateClientRequest {
  const result:
    ApiUpdateClientRequest = {}

  if (
    source.fullName !==
    undefined
  ) {
    const fullName =
      clean(
        source.fullName
      )

    if (!fullName) {
      throw new Error(
        'نام موکل نمی‌تواند خالی باشد.'
      )
    }

    result.fullName =
      fullName
  }

  if (
    source.phoneNumber !==
    undefined
  ) {
    const phone =
      normalizedDigits(
        source.phoneNumber
      )

    if (
      !/^09\d{9}$/.test(
        phone
      )
    ) {
      throw new Error(
        'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.'
      )
    }

    result.phone =
      phone
  }

  if (
    source.nationalId !==
    undefined
  ) {
    const nationalId =
      normalizedDigits(
        source.nationalId
      )

    if (
      nationalId &&
      !/^\d{10}$/.test(
        nationalId
      )
    ) {
      throw new Error(
        'کد ملی باید ۱۰ رقم باشد.'
      )
    }

    result.nationalId =
      nationalId ||
      null
  }

  if (
    source.landlineNumber !==
    undefined
  ) {
    result.homeNumber =
      normalizedDigits(
        source.landlineNumber
      ) ||
      null
  }

  if (
    source.birthDate !==
    undefined
  ) {
    result.birthday =
      source.birthDate.trim()
        ? toBirthdayIso(
            source.birthDate
          ) ??
          null
        : null
  }

  if (
    source.address !==
    undefined
  ) {
    result.homeAddress =
      clean(
        source.address
      ) ||
      null
  }

  if (
    source.representative !==
    undefined
  ) {
    result.represent =
      clean(
        source.representative
      ) ||
      null
  }

  return result
}