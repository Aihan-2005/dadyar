import { api, getApiErrorMessage } from '@/lib/api'
import type { ClientLawyerRequestRecord } from '@/features/client-portal/types/communication'

import { fromApiLawyerRequest, toApiStatus } from './mapper'
import type { ApiEnvelope, ApiLawyerRequestRecord } from './types'

export async function fetchLawyerRequestsApi(): Promise<
  ClientLawyerRequestRecord[]
> {
  const response =
    await api.get<ApiEnvelope<ApiLawyerRequestRecord[]>>('/lawyer-requests')

  return response.data.data.map(fromApiLawyerRequest)
}

export async function fetchLawyerRequestByIdApi(
  requestId: string
): Promise<ClientLawyerRequestRecord> {
  const response = await api.get<ApiEnvelope<ApiLawyerRequestRecord>>(
    `/lawyer-requests/${requestId}`
  )

  return fromApiLawyerRequest(response.data.data)
}

export async function updateLawyerRequestStatusApi(
  requestId: string,
  status: 'under_review' | 'confirmed' | 'declined' | 'completed'
): Promise<ClientLawyerRequestRecord> {
  const response = await api.patch<ApiEnvelope<ApiLawyerRequestRecord>>(
    `/lawyer-requests/${requestId}/status`,
    { status: toApiStatus(status) }
  )

  return fromApiLawyerRequest(response.data.data)
}

export function getLawyerRequestApiErrorMessage(
  error: unknown,
  fallback = 'دریافت درخواست‌ها با خطا مواجه شد.'
): string {
  return getApiErrorMessage(error, fallback)
}