import { api, getApiErrorMessage } from '@/lib/api'
import type { CreateTicketPayload, Ticket } from '@/types/ticket'

import { fromApiTicket, toApiTicketPurpose } from './ticket.mapper'
import type { ApiEnvelope, ApiTicketRecord } from './types'

export async function createTicketApi(
  payload: CreateTicketPayload
): Promise<Ticket> {
  const formData = new FormData()

  formData.append('title', payload.title)
  formData.append('purpose', toApiTicketPurpose(payload.purpose))
  formData.append('description', payload.description)

  if (payload.attachment) {
    formData.append('attachment', payload.attachment)
  }

  const response = await api.post<ApiEnvelope<ApiTicketRecord>>(
    '/tickets',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return fromApiTicket(response.data.data)
}

export function getTicketApiErrorMessage(
  error: unknown,
  fallback = 'ثبت تیکت با خطا مواجه شد.'
): string {
  return getApiErrorMessage(error, fallback)
}