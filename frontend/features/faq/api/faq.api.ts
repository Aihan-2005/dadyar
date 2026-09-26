import { api, getApiErrorMessage } from '@/lib/api'
import type { FAQItem } from '@/types/faq'
import { fromApiFaq } from './faq.mapper'
import type { ApiFAQListEnvelope } from './types'

export async function fetchFaqApi(): Promise<FAQItem[]> {
  const response = await api.get<ApiFAQListEnvelope>('/faq', {
    params: { limit: 100 },
  })
  return response.data.data.map(fromApiFaq)
}

export function getFaqApiErrorMessage(
  error: unknown,
  fallback = 'دریافت سوالات متداول با خطا مواجه شد.'
): string {
  return getApiErrorMessage(error, fallback)
}