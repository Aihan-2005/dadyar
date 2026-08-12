export interface Client {
  id: string

  fullName: string

  phoneNumber: string

 
  phone?: string

  nationalId?: string

  landlineNumber?: string

  birthDate?: string

  representative?: string

  address?: string

  createdAt: string
  updatedAt: string

 
  caseIds?: string[]

  
  role?: string


  isMinor?: boolean
}

export interface CreateClientPayload {
  fullName: string

  phoneNumber: string

  nationalId?: string

  landlineNumber?: string

  birthDate?: string

  representative?: string

  address?: string
}

export type UpdateClientPayload =
  Partial<CreateClientPayload>

export interface ClientPagination {
  page: number

  limit: number

  total: number

  totalPages: number
}

export interface ClientListOptions {
  search?: string

  page?: number

  limit?: number

  force?: boolean
}