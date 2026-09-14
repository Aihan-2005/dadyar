export type ClientPetitionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'ARCHIVED'


export interface ClientPetition {
  id: string

  title: string

  caseNumber: string

  court: string

  subject: string

  facts: string

  arguments: string

  evidence: string[]

  requestedRelief: string

  status:
    ClientPetitionStatus

  submittedAt:
    string | null

  createdAt: string

  updatedAt: string
}


export interface CreateClientPetitionInput {
  title: string

  caseNumber?: string

  court?: string

  subject?: string

  facts?: string

  arguments?: string

  evidence?: string[]

  requestedRelief?: string
}


export type UpdateClientPetitionInput =
  Partial<
    CreateClientPetitionInput
  >


export interface ClientPetitionListParams {
  search?: string

  status?:
    ClientPetitionStatus

  page?: number

  limit?: number
}


export interface ClientPetitionPagination {
  page: number

  limit: number

  total: number

  totalPages: number
}


export interface ClientPetitionPage {
  items:
    ClientPetition[]

  pagination:
       ClientPetitionPagination
}