import type {
  CreateClientPayload,
} from '@/types/client'

import {
  createClientApi,
  lookupClientByPhoneApi,
} from '../api/client.api'

import {
  normalizeDigits,
} from '@/features/finance/utils/number'

const LEGACY_STORAGE_KEY =
  'dadyar-clients'

const MIGRATION_MARKER_KEY =
  'dadyar-clients-server-migration-v1'

interface LegacyClient {
  id?: string

  fullName?: string

  name?: string

  firstName?: string
  lastName?: string

  phoneNumber?: string
  phone?: string

  nationalId?: string

  landlineNumber?: string

  birthDate?: string

  representative?: string

  address?: string


}

export interface LegacyClientMigrationReport {
  detected: number

  created: number

  alreadyExists: number

  failed: number

  completed: boolean

  errors: string[]
}

function emptyReport():
  LegacyClientMigrationReport {
  return {
    detected: 0,

    created: 0,

    alreadyExists:
      0,

    failed: 0,

    completed:
      true,

    errors: [],
  }
}

function getFullName(
  client:
    LegacyClient
): string {
  const fullName =
    client.fullName
      ?.trim()

  if (fullName) {
    return fullName
  }

  const name =
    client.name?.trim()

  if (name) {
    return name
  }

  return [
    client.firstName,
    client.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function getPhone(
  client:
    LegacyClient
): string {
  return normalizeDigits(
    (
      client.phoneNumber ??
      client.phone ??
      ''
    ).trim()
  )
}

function toPayload(
  client:
    LegacyClient
): CreateClientPayload | null {
  const fullName =
    getFullName(
      client
    )

  const phoneNumber =
    getPhone(
      client
    )

  if (
    !fullName ||
    !/^09\d{9}$/.test(
      phoneNumber
    )
  ) {
    return null
  }

  return {
    fullName,

    phoneNumber,

    nationalId:
      normalizeDigits(
        (
          client.nationalId ??
          ''
        ).trim()
      ) ||
      undefined,

    landlineNumber:
      normalizeDigits(
        (
          client.landlineNumber ??
          ''
        ).trim()
      ) ||
      undefined,

    birthDate:
      client.birthDate
        ?.trim() ||
      undefined,

    representative:
      client.representative
        ?.trim() ||
      undefined,

    address:
      client.address
        ?.trim() ||
      undefined,
  }
}

function readLegacyClients():
  LegacyClient[] {
  if (
    typeof window ===
    'undefined'
  ) {
    return []
  }

  const raw =
    window.localStorage.getItem(
      LEGACY_STORAGE_KEY
    )

  if (!raw) {
    return []
  }

  try {
    const parsed =
      JSON.parse(raw) as {
        state?: {
          clients?: unknown
        }

        clients?: unknown
      }

    const possibleClients =
      parsed.state?.clients ??
      parsed.clients

    return Array.isArray(
      possibleClients
    )
      ? (
          possibleClients as
            LegacyClient[]
        )
      : []
  } catch {
    return []
  }
}

export async function migrateLegacyClientsToServer():
  Promise<LegacyClientMigrationReport> {
  if (
    typeof window ===
    'undefined'
  ) {
    return emptyReport()
  }

  if (
    window.localStorage.getItem(
      MIGRATION_MARKER_KEY
    ) === 'done'
  ) {
    return emptyReport()
  }

  const legacyClients =
    readLegacyClients()

  if (
    legacyClients.length ===
    0
  ) {
    window.localStorage.setItem(
      MIGRATION_MARKER_KEY,
      'done'
    )

    return emptyReport()
  }

  const report:
    LegacyClientMigrationReport =
    {
      detected:
        legacyClients.length,

      created: 0,

      alreadyExists:
        0,

      failed: 0,

      completed:
        false,

      errors: [],
    }

  for (
    const legacyClient of
    legacyClients
  ) {
    const payload =
      toPayload(
        legacyClient
      )

    if (!payload) {
      report.failed +=
        1

      report.errors.push(
        `یک موکل محلی به دلیل نام یا شماره موبایل نامعتبر منتقل نشد.`
      )

      continue
    }

    try {
      const existing =
        await lookupClientByPhoneApi(
          payload.phoneNumber
        )

      if (existing) {
        report.alreadyExists +=
          1

        continue
      }

      await createClientApi(
        payload
      )

      report.created +=
        1
    } catch (
      error
    ) {
      report.failed +=
        1

      report.errors.push(
        error instanceof Error
          ? `${payload.fullName}: ${error.message}`
          : `${payload.fullName}: انتقال ناموفق بود.`
      )
    }
  }

  report.completed =
    report.failed === 0

  
  if (
    report.completed
  ) {
    window.localStorage.removeItem(
      LEGACY_STORAGE_KEY
    )

    window.localStorage.setItem(
      MIGRATION_MARKER_KEY,
      'done'
    )
  }

  return report
  }