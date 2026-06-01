import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Client {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  phoneNumber?: string
  phone?: string
  landlineNumber?: string
  nationalId?: string
  role?: string
  representative?: string
  birthDate?: string
  isMinor?: boolean
  address?: string
  caseIds: string[]
  createdAt: string
  updatedAt: string
}

export type CreateClientPayload = Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'caseIds'>> & {
  caseIds?: string[]
}

export type UpdateClientPayload = Partial<CreateClientPayload> & {
  id: string
}

interface ClientStore {
  clients: Client[]
  addClient: (payload: CreateClientPayload) => Client
  updateClient: (payload: UpdateClientPayload) => void
  deleteClient: (id: string) => void
  getClientById: (id: string) => Client | undefined
  getClientsByCaseId: (caseId: string) => Client[]
  linkClientToCase: (clientId: string, caseId: string) => void
  unlinkClientFromCase: (clientId: string, caseId: string) => void
}

const toEnglishDigits = (value?: string) => {
  if (!value) return ''

  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
}

const parseJalaliDate = (value?: string) => {
  const normalizedValue = toEnglishDigits(value).trim()
  const match = normalizedValue.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/)

  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  return { year, month, day }
}

const getTodayJalaliParts = () => {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date())

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value || 0),
    month: Number(parts.find((part) => part.type === 'month')?.value || 0),
    day: Number(parts.find((part) => part.type === 'day')?.value || 0),
  }
}

const calculateIsMinorFromBirthDate = (birthDate?: string) => {
  const birth = parseJalaliDate(birthDate)
  if (!birth) return undefined

  const today = getTodayJalaliParts()
  let age = today.year - birth.year

  const birthdayHasNotPassedThisYear =
    today.month < birth.month ||
    (today.month === birth.month && today.day < birth.day)

  if (birthdayHasNotPassedThisYear) {
    age -= 1
  }

  return age < 18
}

const normalizeClientPayload = <T extends CreateClientPayload | UpdateClientPayload>(payload: T): T => {
  const isMinor =
    payload.isMinor !== undefined
      ? payload.isMinor
      : calculateIsMinorFromBirthDate(payload.birthDate)

  return {
    ...payload,
    firstName: payload.firstName?.trim() || '',
    lastName: payload.lastName?.trim() || '',
    name: payload.name?.trim() || '',
    phoneNumber: payload.phoneNumber?.trim() || '',
    phone: payload.phone?.trim() || '',
    landlineNumber: payload.landlineNumber?.trim() || '',
    nationalId: payload.nationalId?.trim() || '',
    role: payload.role?.trim() || '',
    representative: payload.representative?.trim() || '',
    birthDate: payload.birthDate?.trim() || '',
    address: payload.address?.trim() || '',
    ...(isMinor !== undefined ? { isMinor } : {}),
  }
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],

      addClient: (payload) => {
        const normalizedPayload = normalizeClientPayload(payload)

        const newClient: Client = {
          id: `client_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          firstName: normalizedPayload.firstName || '',
          lastName: normalizedPayload.lastName || '',
          name: normalizedPayload.name || '',
          phoneNumber: normalizedPayload.phoneNumber || '',
          phone: normalizedPayload.phone || '',
          landlineNumber: normalizedPayload.landlineNumber || '',
          nationalId: normalizedPayload.nationalId || '',
          role: normalizedPayload.role || '',
          representative: normalizedPayload.representative || '',
          birthDate: normalizedPayload.birthDate || '',
          isMinor: normalizedPayload.isMinor,
          address: normalizedPayload.address || '',
          caseIds: normalizedPayload.caseIds || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({ clients: [...state.clients, newClient] }))
        return newClient
      },

      updateClient: (payload) => {
        const normalizedPayload = normalizeClientPayload(payload)

        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === payload.id
              ? {
                  ...client,
                  ...normalizedPayload,
                  caseIds: normalizedPayload.caseIds || client.caseIds || [],
                  updatedAt: new Date().toISOString(),
                }
              : client
          ),
        }))
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        }))
      },

      getClientById: (id) => {
        return get().clients.find((client) => client.id === id)
      },

      getClientsByCaseId: (caseId) => {
        return get().clients.filter((client) => client.caseIds.includes(caseId))
      },

      linkClientToCase: (clientId, caseId) => {
        set((state) => ({
          clients: state.clients.map((client) => {
            if (client.id !== clientId) return client

            const currentCaseIds = client.caseIds || []
            if (currentCaseIds.includes(caseId)) return client

            return {
              ...client,
              caseIds: [...currentCaseIds, caseId],
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      unlinkClientFromCase: (clientId, caseId) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  caseIds: (client.caseIds || []).filter((id) => id !== caseId),
                  updatedAt: new Date().toISOString(),
                }
              : client
          ),
        }))
      },
    }),
    {
      name: 'dadyar-clients',
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState?.clients) return persistedState

        return {
          ...persistedState,
          clients: persistedState.clients.map((client: Partial<Client>) => ({
            ...client,
            firstName: client.firstName || '',
            lastName: client.lastName || '',
            name: client.name || '',
            phoneNumber: client.phoneNumber || client.phone || '',
            phone: client.phone || client.phoneNumber || '',
            landlineNumber: client.landlineNumber || '',
            role: client.role || '',
            representative: client.representative || '',
            birthDate: client.birthDate || '',
            isMinor:
              client.isMinor !== undefined
                ? client.isMinor
                : calculateIsMinorFromBirthDate(client.birthDate),
            caseIds: client.caseIds || [],
            createdAt: client.createdAt || new Date().toISOString(),
            updatedAt: client.updatedAt || new Date().toISOString(),
          })),
        }
      },
    }
  )
)
