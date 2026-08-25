import type { Ticket, TicketPurpose, TicketStatus } from '@/types/ticket'
import type { ApiTicketPurpose, ApiTicketRecord, ApiTicketStatus } from './types'

const UI_TO_API_PURPOSE: Record<TicketPurpose, ApiTicketPurpose> = {
  bug: 'BUG',
  suggestion: 'SUGGESTION',
}

export function toApiTicketPurpose(purpose: TicketPurpose): ApiTicketPurpose {
  return UI_TO_API_PURPOSE[purpose]
}

function fromApiTicketPurpose(purpose: ApiTicketPurpose): TicketPurpose {
  return purpose === 'BUG' ? 'bug' : 'suggestion'
}

function fromApiTicketStatus(status: ApiTicketStatus): TicketStatus {
  switch (status) {
    case 'IN_PROGRESS':
      return 'in-progress'
    case 'CLOSED':
      return 'closed'
    case 'OPEN':
    default:
      return 'open'
  }
}

export function fromApiTicket(source: ApiTicketRecord): Ticket {
  return {
    id: source._id,
    title: source.title,
    purpose: fromApiTicketPurpose(source.purpose),
    description: source.description,
    attachmentUrl: source.attachmentUrl,
    status: fromApiTicketStatus(source.status),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  }
}