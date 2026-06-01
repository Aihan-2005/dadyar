export interface Client {
  id: string
  firstName: string
  lastName: string
  nationalId: string
  phoneNumber: string

  /** فیلدهای جدید */
  role?: string
  landlineNumber?: string
  birthDate?: string
  isMinor?: boolean
  representative?: string

  email?: string
  address?: string
  notes?: string
  lawyerId?: string
  createdAt: string
  updatedAt: string
  caseIds: string[]
}

export interface CreateClientPayload {
  firstName: string
  lastName: string
  nationalId: string
  phoneNumber: string

  /** فیلدهای جدید */
  role?: string
  landlineNumber?: string
  birthDate?: string
  isMinor?: boolean
  representative?: string

  email?: string
  address?: string
  notes?: string
  lawyerId?: string
}

export interface UpdateClientPayload extends Partial<CreateClientPayload> {
  id: string
}
