export type TicketPurpose = 'bug' | 'suggestion'
export type TicketStatus = 'open' | 'in-progress' | 'closed'

export interface Ticket {
  id: string
  title: string
  purpose: TicketPurpose
  description: string
  attachmentUrl?: string
  status: TicketStatus
  createdAt: string
  updatedAt: string
}

export interface CreateTicketPayload {
  title: string
  purpose: TicketPurpose
  description: string
  attachment?: File | null
}