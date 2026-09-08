export type TicketType = 'bug' | 'suggestion'
export type TicketStatus =
  | 'open'
  | 'in-progress'
  | 'waiting-for-lawyer'
  | 'resolved'
  | 'closed'

export interface Ticket {
  id: string
  title: string
  type?: TicketType
  status: TicketStatus
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  senderType: 'LAWYER' | 'ADMIN'
  message: string
  attachmentId?: string
  createdAt: string
}

export interface CreateTicketPayload {
  title: string
  description: string
  type?: TicketType
  attachment?: File | null
}