import type {
  LawyerPetitionDraft,
  LawyerPetitionRecord,
} from '@/features/dashboard/petitions/types'

import type {
  ClientPetitionStatus,
} from '@/features/client-portal/types/petition'

import {
  normalizePetitionDraft,
  validatePetitionStep,
} from '@/features/client-portal/utils/petition'

const STORAGE_KEY = 'dadyar:lawyer-petitions:v1'
const CHANGE_EVENT = 'dadyar:lawyer-petitions:changed'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function createId(prefix: string): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function createReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `DY-LH-L-${timestamp}-${random}`
}

function isPetitionRecord(value: unknown): value is LawyerPetitionRecord {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<LawyerPetitionRecord>

  return (
    candidate.schemaVersion === 1 &&
    typeof candidate.id === 'string' &&
    typeof candidate.reference === 'string' &&
    typeof candidate.lawyerId === 'string' &&
    typeof candidate.clientName === 'string' &&
    typeof candidate.status === 'string' &&
    typeof candidate.templateKey === 'string' &&
    typeof candidate.authorityName === 'string' &&
    typeof candidate.authorFullName === 'string' &&
    typeof candidate.subject === 'string' &&
    typeof candidate.facts === 'string' &&
    typeof candidate.request === 'string' &&
    Array.isArray(candidate.evidence) &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    typeof candidate.version === 'number'
  )
}

function readRecords(): LawyerPetitionRecord[] {
  if (!isBrowser()) return []

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPetitionRecord)
  } catch {
    return []
  }
}

function notifyChanged(): void {
  if (!isBrowser()) return
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function writeRecords(records: LawyerPetitionRecord[]): void {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  notifyChanged()
}

function sortRecords(records: LawyerPetitionRecord[]): LawyerPetitionRecord[] {
  return [...records].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function getLawyerPetitions(lawyerId: string): LawyerPetitionRecord[] {
  return sortRecords(
    readRecords().filter((record) => record.lawyerId === lawyerId)
  )
}

export function getLawyerPetitionById(
  petitionId: string,
  lawyerId: string
): LawyerPetitionRecord | null {
  return (
    readRecords().find(
      (record) => record.id === petitionId && record.lawyerId === lawyerId
    ) ?? null
  )
}

export function saveLawyerPetition(
  lawyerId: string,
  rawDraft: LawyerPetitionDraft,
  status: ClientPetitionStatus,
  recordId?: string
): LawyerPetitionRecord {
  if (!isBrowser()) {
    throw new Error('امکان ذخیره لایحه وجود ندارد.')
  }

  const normalizedBase = normalizePetitionDraft(rawDraft)

  const errors = validatePetitionStep(normalizedBase, 4)

  if (errors.length > 0) {
    throw new Error(errors[0])
  }

  const clientName = rawDraft.clientName.trim()

  if (clientName.length < 3) {
    throw new Error('نام موکل را کامل وارد کنید.')
  }

  const draft: LawyerPetitionDraft = {
    ...normalizedBase,
    clientName,
  }

  const records = readRecords()
  const now = new Date().toISOString()

  if (recordId) {
    const index = records.findIndex(
      (record) => record.id === recordId && record.lawyerId === lawyerId
    )

    if (index === -1) {
      throw new Error('لایحه مورد نظر پیدا نشد.')
    }

    const previous = records[index]

    const updated: LawyerPetitionRecord = {
      ...draft,
      schemaVersion: 1,
      id: previous.id,
      reference: previous.reference,
      lawyerId: previous.lawyerId,
      status,
      version: previous.version + 1,
      createdAt: previous.createdAt,
      updatedAt: now,
    }

    records[index] = updated
    writeRecords(records)
    return updated
  }

  const created: LawyerPetitionRecord = {
    ...draft,
    schemaVersion: 1,
    id: createId('lawyer-petition'),
    reference: createReference(),
    lawyerId,
    status,
    version: 1,
    createdAt: now,
    updatedAt: now,
  }

  writeRecords([created, ...records])
  return created
}

export function deleteLawyerPetition(
  petitionId: string,
  lawyerId: string
): void {
  const records = readRecords()

  const exists = records.some(
    (record) => record.id === petitionId && record.lawyerId === lawyerId
  )

  if (!exists) {
    throw new Error('لایحه پیدا نشد.')
  }

  writeRecords(
    records.filter(
      (record) => !(record.id === petitionId && record.lawyerId === lawyerId)
    )
  )
}

export function subscribeLawyerPetitions(
  listener: () => void
): () => void {
  if (!isBrowser()) return () => undefined

  const handleInternal = () => listener()

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener()
    }
  }

  window.addEventListener(CHANGE_EVENT, handleInternal)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(CHANGE_EVENT, handleInternal)
    window.removeEventListener('storage', handleStorage)
  }
}