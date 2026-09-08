import type { Ticket, TicketMessage, TicketStatus, TicketType } from '@/types/ticket'
import type {
  ApiTicketMessageRecord,
  ApiTicketRecord,
  ApiTicketStatus,
  ApiTicketType,
} from './types'

const UI_TO_API_TYPE: Record<TicketType, ApiTicketType> = {
  bug: 'BUG',
  suggestion: 'SUGGESTION',
}

export function toApiTicketType(type: TicketType): ApiTicketType {
  return UI_TO_API_TYPE[type]
}

function fromApiTicketType(type?: ApiTicketType): TicketType | undefined {
  if (!type) return undefined
  return type === 'BUG' ? 'bug' : 'suggestion'
}

function fromApiTicketStatus(status: ApiTicketStatus): TicketStatus {
  switch (status) {
    case 'IN_PROGRESS':
      return 'in-progress'
    case 'WAITING_FOR_LAWYER':
      return 'waiting-for-lawyer'
    case 'RESOLVED':
      return 'resolved'
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
    type: fromApiTicketType(source.type),
    status: fromApiTicketStatus(source.status),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  }
}

export function fromApiTicketMessage(source: ApiTicketMessageRecord): TicketMessage {
  return {
    id: source._id,
    ticketId: source.ticketId,
    senderId: source.senderId,
    senderType: source.senderType,
    message: source.message,
    attachmentId: source.attachmentId,
    createdAt: source.createdAt,
  }
}