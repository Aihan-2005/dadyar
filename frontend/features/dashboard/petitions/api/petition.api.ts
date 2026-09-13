import { api, getApiErrorMessage } from '@/lib/api'

import type {
  LawyerPetitionDraft,
  LawyerPetitionRecord,
} from '@/features/dashboard/petitions/types'

import type { ClientPetitionStatus } from '@/features/client-portal/types/petition'

import { fromApiPetition, toApiPetitionPayload } from './mapper'
import type { ApiEnvelope, ApiPetitionRecord } from './types'

export async function fetchPetitionsApi(): Promise<LawyerPetitionRecord[]> {
  const response =
    await api.get<ApiEnvelope<ApiPetitionRecord[]>>('/petitions')

  return response.data.data.map(fromApiPetition)
}

export async function fetchPetitionByIdApi(
  petitionId: string
): Promise<LawyerPetitionRecord> {
  const response = await api.get<ApiEnvelope<ApiPetitionRecord>>(
    `/petitions/${petitionId}`
  )

  return fromApiPetition(response.data.data)
}

export async function savePetitionApi(
  draft: LawyerPetitionDraft,
  status: ClientPetitionStatus,
  petitionId?: string
): Promise<LawyerPetitionRecord> {
  const payload = toApiPetitionPayload(draft, status)

  if (petitionId) {
    const response = await api.patch<ApiEnvelope<ApiPetitionRecord>>(
      `/petitions/${petitionId}`,
      payload
    )

    return fromApiPetition(response.data.data)
  }

  const response = await api.post<ApiEnvelope<ApiPetitionRecord>>(
    '/petitions',
    payload
  )

  return fromApiPetition(response.data.data)
}

export async function deletePetitionApi(petitionId: string): Promise<void> {
  await api.delete(`/petitions/${petitionId}`)
}

export function getPetitionApiErrorMessage(
  error: unknown,
  fallback = 'عملیات لایحه با خطا مواجه شد.'
): string {
  return getApiErrorMessage(error, fallback)
}