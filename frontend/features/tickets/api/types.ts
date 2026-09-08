export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

export type ApiTicketType = 'BUG' | 'SUGGESTION'

export type ApiTicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_LAWYER'
  | 'RESOLVED'
  | 'CLOSED'

export interface ApiTicketRecord {
  _id: string
  title: string
  type?: ApiTicketType
  status: ApiTicketStatus
  createdAt: string
  updatedAt: string
}

export interface ApiTicketMessageRecord {
  _id: string
  ticketId: string
  senderId: string
  senderType: 'LAWYER' | 'ADMIN'
  message: string
  attachmentId?: string
  createdAt: string
}