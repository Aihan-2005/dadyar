import { api, getApiErrorMessage } from '@/lib/api'
import type { CreateTicketPayload, Ticket, TicketMessage } from '@/types/ticket'

import { fromApiTicket, fromApiTicketMessage, toApiTicketType } from './ticket.mapper'
import type { ApiEnvelope, ApiTicketMessageRecord, ApiTicketRecord } from './types'

export async function createTicketApi(payload: CreateTicketPayload): Promise<Ticket> {
  const formData = new FormData()

  formData.append('title', payload.title)
  formData.append('description', payload.description)

  if (payload.type) {
    formData.append('type', toApiTicketType(payload.type))
  }

  if (payload.attachment) {
    formData.append('attachment', payload.attachment)
  }

  const response = await api.post<ApiEnvelope<ApiTicketRecord>>('/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return fromApiTicket(response.data.data)
}

export async function fetchTicketsApi(): Promise<Ticket[]> {
  const response = await api.get<ApiEnvelope<ApiTicketRecord[]>>('/tickets')
  return response.data.data.map(fromApiTicket)
}

export async function fetchTicketByIdApi(ticketId: string): Promise<Ticket> {
  const response = await api.get<ApiEnvelope<ApiTicketRecord>>(`/tickets/${ticketId}`)
  return fromApiTicket(response.data.data)
}

export async function fetchTicketMessagesApi(ticketId: string): Promise<TicketMessage[]> {
  const response = await api.get<ApiEnvelope<ApiTicketMessageRecord[]>>(
    `/tickets/${ticketId}/messages`
  )
  return response.data.data.map(fromApiTicketMessage)
}

export async function addTicketMessageApi(
  ticketId: string,
  payload: { message: string; attachment?: File | null }
): Promise<TicketMessage> {
  const formData = new FormData()
  formData.append('message', payload.message)

  if (payload.attachment) {
    formData.append('attachment', payload.attachment)
  }

  const response = await api.post<ApiEnvelope<ApiTicketMessageRecord>>(
    `/tickets/${ticketId}/messages`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )

  return fromApiTicketMessage(response.data.data)
}

export function getTicketApiErrorMessage(
  error: unknown,
  fallback = 'ثبت تیکت با خطا مواجه شد.'
): string {
  return getApiErrorMessage(error, fallback)
}
export async function closeTicketApi(ticketId: string): Promise<Ticket> {
  const response = await api.patch<ApiEnvelope<ApiTicketRecord>>(
    `/tickets/${ticketId}/close`
  )
  return fromApiTicket(response.data.data)
}