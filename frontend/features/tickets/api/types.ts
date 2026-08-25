export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

export type ApiTicketPurpose = 'BUG' | 'SUGGESTION'
export type ApiTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'

export interface ApiCreateTicketRequest {
  title: string
  purpose: ApiTicketPurpose
  description: string
  attachment?: File
}

export interface ApiTicketRecord {
  _id: string
  title: string
  purpose: ApiTicketPurpose
  description: string
  attachmentUrl?: string
  status: ApiTicketStatus
  createdAt: string
  updatedAt: string
}