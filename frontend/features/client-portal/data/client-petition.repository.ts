import type {
  ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import type {
  ClientPetitionDraft,
  ClientPetitionRecord,
  ClientPetitionStatus,
} from '@/features/client-portal/types/petition'

import {
  normalizePetitionDraft,
  validatePetitionStep,
} from '@/features/client-portal/utils/petition'

const STORAGE_KEY =
  'dadyar:client-petitions:v1'

const GUEST_DRAFT_KEY =
  'dadyar:client-petition:guest-draft:v1'

const CHANGE_EVENT =
  'dadyar:client-petitions:changed'

interface StoredGuestPetitionDraft {
  schemaVersion:
    1

  savedAt:
    number

  draft:
    ClientPetitionDraft
}

function isBrowser():
  boolean {
  return (
    typeof window !==
    'undefined'
  )
}

function createId(
  prefix:
    string
): string {
  if (
    typeof crypto !==
      'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

function createReference():
  string {
  const timestamp =
    Date.now()
      .toString(36)
      .toUpperCase()

  const random =
    Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()

  return `DY-LH-${timestamp}-${random}`
}

function isPetitionRecord(
  value:
    unknown
): value is ClientPetitionRecord {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return false
  }

  const candidate =
    value as Partial<ClientPetitionRecord>

  return (
    candidate.schemaVersion ===
      1 &&
    typeof candidate.id ===
      'string' &&
    typeof candidate.reference ===
      'string' &&
    typeof candidate.accountId ===
      'string' &&
    typeof candidate.status ===
      'string' &&
    typeof candidate.templateKey ===
      'string' &&
    typeof candidate.authorityName ===
      'string' &&
    typeof candidate.authorFullName ===
      'string' &&
    typeof candidate.subject ===
      'string' &&
    typeof candidate.facts ===
      'string' &&
    typeof candidate.request ===
      'string' &&
    Array.isArray(
      candidate.evidence
    ) &&
    typeof candidate.createdAt ===
      'string' &&
    typeof candidate.updatedAt ===
      'string' &&
    typeof candidate.version ===
      'number'
  )
}

function readRecords():
  ClientPetitionRecord[] {
  if (!isBrowser()) {
    return []
  }

  const raw =
    window.localStorage.getItem(
      STORAGE_KEY
    )

  if (!raw) {
    return []
  }

  try {
    const parsed:
      unknown =
      JSON.parse(
        raw
      )

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return []
    }

    return parsed.filter(
      isPetitionRecord
    )
  } catch {
    return []
  }
}

function notifyChanged():
  void {
  if (!isBrowser()) {
    return
  }

  window.dispatchEvent(
    new Event(
      CHANGE_EVENT
    )
  )
}

function writeRecords(
  records:
    ClientPetitionRecord[]
): void {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      records
    )
  )

  notifyChanged()
}

function sortRecords(
  records:
    ClientPetitionRecord[]
): ClientPetitionRecord[] {
  return [
    ...records,
  ].sort(
    (
      first,
      second
    ) =>
      new Date(
        second.updatedAt
      ).getTime() -
      new Date(
        first.updatedAt
      ).getTime()
  )
}

export function getClientPetitions(
  accountId:
    string
): ClientPetitionRecord[] {
  return sortRecords(
    readRecords().filter(
      (
        record
      ) =>
        record.accountId ===
        accountId
    )
  )
}

export function getClientPetitionById(
  petitionId:
    string,

  accountId:
    string
): ClientPetitionRecord | null {
  return (
    readRecords().find(
      (
        record
      ) =>
        record.id ===
          petitionId &&
        record.accountId ===
          accountId
    ) ??
    null
  )
}

export function saveClientPetition(
  account:
    ClientPortalAccount,

  rawDraft:
    ClientPetitionDraft,

  status:
    ClientPetitionStatus,

  recordId?:
    string
): ClientPetitionRecord {
  if (!isBrowser()) {
    throw new Error(
      'امکان ذخیره لایحه وجود ندارد.'
    )
  }

  const draft =
    normalizePetitionDraft(
      rawDraft
    )

  const errors =
    validatePetitionStep(
      draft,
      4
    )

  if (
    errors.length >
    0
  ) {
    throw new Error(
      errors[0]
    )
  }

  const records =
    readRecords()

  const now =
    new Date().toISOString()

  if (recordId) {
    const index =
      records.findIndex(
        (
          record
        ) =>
          record.id ===
            recordId &&
          record.accountId ===
            account.id
      )

    if (
      index ===
      -1
    ) {
      throw new Error(
        'لایحه مورد نظر پیدا نشد.'
      )
    }

    const previous =
      records[
        index
      ]

    const updated:
      ClientPetitionRecord = {
      ...draft,

      schemaVersion:
        1,

      id:
        previous.id,

      reference:
        previous.reference,

      accountId:
        previous.accountId,

      status,

      version:
        previous.version +
        1,

      createdAt:
        previous.createdAt,

      updatedAt:
        now,
    }

    records[
      index
    ] =
      updated

    writeRecords(
      records
    )

    return updated
  }

  const created:
    ClientPetitionRecord = {
    ...draft,

    schemaVersion:
      1,

    id:
      createId(
        'petition'
      ),

    reference:
      createReference(),

    accountId:
      account.id,

    status,

    version:
      1,

    createdAt:
      now,

    updatedAt:
      now,
  }

  writeRecords([
    created,
    ...records,
  ])

  return created
}

export function deleteClientPetition(
  petitionId:
    string,

  accountId:
    string
): void {
  const records =
    readRecords()

  const exists =
    records.some(
      (
        record
      ) =>
        record.id ===
          petitionId &&
        record.accountId ===
          accountId
    )

  if (!exists) {
    throw new Error(
      'لایحه پیدا نشد.'
    )
  }

  writeRecords(
    records.filter(
      (
        record
      ) =>
        !(
          record.id ===
            petitionId &&
          record.accountId ===
            accountId
        )
    )
  )
}

export function saveGuestPetitionDraft(
  draft:
    ClientPetitionDraft
): void {
  if (!isBrowser()) {
    return
  }

  const payload:
    StoredGuestPetitionDraft = {
    schemaVersion:
      1,

    savedAt:
      Date.now(),

    draft:
      normalizePetitionDraft(
        draft
      ),
  }

  window.sessionStorage.setItem(
    GUEST_DRAFT_KEY,
    JSON.stringify(
      payload
    )
  )
}

export function readGuestPetitionDraft():
  ClientPetitionDraft | null {
  if (!isBrowser()) {
    return null
  }

  const raw =
    window.sessionStorage.getItem(
      GUEST_DRAFT_KEY
    )

  if (!raw) {
    return null
  }

  try {
    const parsed =
      JSON.parse(
        raw
      ) as Partial<StoredGuestPetitionDraft>

    if (
      parsed.schemaVersion !==
        1 ||
      !parsed.draft ||
      typeof parsed.draft !==
        'object'
    ) {
      return null
    }

    return normalizePetitionDraft(
      parsed.draft as ClientPetitionDraft
    )
  } catch {
    return null
  }
}

export function clearGuestPetitionDraft():
  void {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.removeItem(
    GUEST_DRAFT_KEY
  )
}

export function subscribeClientPetitions(
  listener:
    () => void
): () => void {
  if (!isBrowser()) {
    return () => undefined
  }

  const handleInternal =
    () => {
      listener()
    }

  const handleStorage =
    (
      event:
        StorageEvent
    ) => {
      if (
        event.key ===
        STORAGE_KEY
      ) {
        listener()
      }
    }

  window.addEventListener(
    CHANGE_EVENT,
    handleInternal
  )

  window.addEventListener(
    'storage',
    handleStorage
  )

  return () => {
    window.removeEventListener(
      CHANGE_EVENT,
      handleInternal
    )

    window.removeEventListener(
      'storage',
      handleStorage
    )
  }
}