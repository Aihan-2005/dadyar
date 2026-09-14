import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  ClientPetition,
  ClientPetitionListParams,
  ClientPetitionPage,
  ClientPetitionPagination,
  CreateClientPetitionInput,
  UpdateClientPetitionInput,
} from '@/types/client-petition'


type ApiEnvelope<T> = {
  success: boolean

  data: T

  message?: string
}


type ClientPetitionListEnvelope = {
  success: boolean

  data:
    ClientPetition[]

  pagination:
    ClientPetitionPagination

  message?: string
}


const CLIENT_PETITIONS_ENDPOINT =
  '/client/petitions'


function ensureItemEnvelope(
  payload:
    ApiEnvelope<ClientPetition>,
): ClientPetition {
  if (
    payload.success !==
      true ||
    !payload.data ||
    typeof payload.data !==
      'object'
  ) {
    throw new Error(
      'ساختار پاسخ لایحه معتبر نیست.',
    )
  }

  return payload.data
}


function buildListParams(
  params:
    ClientPetitionListParams,
) {
  return {
    ...(params.search?.trim()
      ? {
          search:
            params.search.trim(),
        }
      : {}),

    ...(params.status
      ? {
          status:
            params.status,
        }
      : {}),

    page:
      Math.max(
        params.page ??
          1,

        1,
      ),

    limit:
      Math.min(
        Math.max(
          params.limit ??
            20,

          1,
        ),

        100,
      ),
  }
}


export async function createClientPetition(
  input:
    CreateClientPetitionInput,
): Promise<ClientPetition> {
  try {
    const response =
      await api.post<
        ApiEnvelope<ClientPetition>
      >(
        CLIENT_PETITIONS_ENDPOINT,

        input,
      )

    return ensureItemEnvelope(
      response.data,
    )
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'ثبت پیش‌نویس لایحه ناموفق بود.',
      ),
    )
  }
}


export async function updateClientPetition(
  petitionId:
    string,

  input:
    UpdateClientPetitionInput,
): Promise<ClientPetition> {
  try {
    const response =
      await api.patch<
        ApiEnvelope<ClientPetition>
      >(
        `${CLIENT_PETITIONS_ENDPOINT}/${encodeURIComponent(
          petitionId,
        )}`,

        input,
      )

    return ensureItemEnvelope(
      response.data,
    )
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'ویرایش لایحه ناموفق بود.',
      ),
    )
  }
}


export async function submitClientPetition(
  petitionId:
    string,
): Promise<ClientPetition> {
  try {
    const response =
      await api.post<
        ApiEnvelope<ClientPetition>
      >(
        `${CLIENT_PETITIONS_ENDPOINT}/${encodeURIComponent(
          petitionId,
        )}/submit`,
      )

    return ensureItemEnvelope(
      response.data,
    )
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'ارسال لایحه ناموفق بود.',
      ),
    )
  }
}


export async function archiveClientPetition(
  petitionId:
    string,
): Promise<ClientPetition> {
  try {
    const response =
      await api.post<
        ApiEnvelope<ClientPetition>
      >(
        `${CLIENT_PETITIONS_ENDPOINT}/${encodeURIComponent(
          petitionId,
        )}/archive`,
      )

    return ensureItemEnvelope(
      response.data,
    )
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'بایگانی لایحه ناموفق بود.',
      ),
    )
  }
}


export async function getClientPetitionById(
  petitionId:
    string,
): Promise<ClientPetition> {
  try {
    const response =
      await api.get<
        ApiEnvelope<ClientPetition>
      >(
        `${CLIENT_PETITIONS_ENDPOINT}/${encodeURIComponent(
          petitionId,
        )}`,
      )

    return ensureItemEnvelope(
      response.data,
    )
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت اطلاعات لایحه ناموفق بود.',
      ),
    )
  }
}


export async function getClientPetitions(
  params:
    ClientPetitionListParams = {},
): Promise<ClientPetitionPage> {
  try {
    const response =
      await api.get<
        ClientPetitionListEnvelope
      >(
        CLIENT_PETITIONS_ENDPOINT,

        {
          params:
            buildListParams(
              params,
            ),
        },
      )

    if (
      response.data.success !==
        true ||
      !Array.isArray(
        response.data.data,
      ) ||
      !response.data.pagination
    ) {
      throw new Error(
        'ساختار پاسخ فهرست لوایح معتبر نیست.',
      )
    }

    return {
      items:
        response.data.data,

      pagination:
        response.data.pagination,
    }
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت لوایح ناموفق بود.',
      ),
    )
  }
}


export async function deleteClientPetitionDraft(
  petitionId:
    string,
): Promise<void> {
  try {
    const response =
      await api.delete<
        ApiEnvelope<{
          id: string
        }>
      >(
        `${CLIENT_PETITIONS_ENDPOINT}/${encodeURIComponent(
          petitionId,
        )}`,
      )

    if (
      response.data.success !==
      true
    ) {
      throw new Error(
        'حذف پیش‌نویس انجام نشد.',
      )
    }
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'حذف پیش‌نویس لایحه ناموفق بود.',
      ),
    )
  }
}