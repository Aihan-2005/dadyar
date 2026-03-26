export interface Client {
  id: string
  firstName: string
  lastName: string
  nationalId: string
  phoneNumber: string
  email?: string
  address?: string
  createdAt: string
  updatedAt: string
  caseIds: string[] // آرایه‌ای از ID پرونده‌ها
}

export interface CreateClientPayload {
  firstName: string
  lastName: string
  nationalId: string
  phoneNumber: string
  email?: string
  address?: string
}

export interface UpdateClientPayload extends Partial<CreateClientPayload> {
  id: string
}
