import axios from 'axios'

import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  ClientCase,
  ClientCaseListParams,
  ClientCasePage,
  ClientCasePagination,
  ClientCasePayment,
} from '@/types/client-case'


type ApiEnvelope<T> = {
  success: boolean

  data: T

  message?: string
}


type ClientCaseListEnvelope = {
  success: boolean

  data: ClientCase[]

  pagination:
    ClientCasePagination

  message?: string
}


const CLIENT_CASES_ENDPOINT =
  '/client/cases'


function buildParams(
  params: ClientCaseListParams,
) {
  return {
    ...(params.search?.trim()
      ? {
          search:
            params.search.trim(),
        }
      : {}),

    ...(params.state?.trim()
      ? {
          state:
            params.state.trim(),
        }
      : {}),

    page:
      Math.max(
        params.page ?? 1,
        1,
      ),

    limit:
      Math.min(
        Math.max(
          params.limit ?? 20,
          1,
        ),
        100,
      ),
  }
}


export async function getClientCases(
  params:
    ClientCaseListParams = {},
): Promise<ClientCasePage> {
  try {
    const response =
      await api.get<ClientCaseListEnvelope>(
        CLIENT_CASES_ENDPOINT,
        {
          params:
            buildParams(
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
        'ساختار پاسخ پرونده‌های موکل معتبر نیست.',
      )
    }

    return {
      items:
        response.data.data,

      pagination:
        response.data.pagination,
    }
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'دریافت پرونده‌های موکل ناموفق بود.',
      ),
    )
  }
}


export async function getClientCaseById(
  caseId: string,
): Promise<ClientCase | null> {
  const id =
    caseId.trim()

  if (!id) {
    return null
  }

  try {
    const response =
      await api.get<
        ApiEnvelope<ClientCase>
      >(
        `${CLIENT_CASES_ENDPOINT}/${encodeURIComponent(
          id,
        )}`,
      )

    if (
      response.data.success !==
        true ||
      !response.data.data
    ) {
      throw new Error(
        'ساختار پاسخ پرونده موکل معتبر نیست.',
      )
    }

    return response.data.data
  } catch (error: unknown) {
    if (
      axios.isAxiosError(
        error,
      ) &&
      error.response?.status ===
        404
    ) {
      return null
    }

    throw new Error(
      getApiErrorMessage(
        error,
        'دریافت پرونده موکل ناموفق بود.',
      ),
    )
  }
}


export async function getClientCasePayments(
  caseId: string,
): Promise<ClientCasePayment[]> {
  const id =
    caseId.trim()

  if (!id) {
    return []
  }

  try {
    const response =
      await api.get<
        ApiEnvelope<ClientCasePayment[]>
      >(
        `${CLIENT_CASES_ENDPOINT}/${encodeURIComponent(
          id,
        )}/payments`,
      )

    if (
      response.data.success !==
        true ||
      !Array.isArray(
        response.data.data,
      )
    ) {
      throw new Error(
        'ساختار پاسخ پرداخت‌های پرونده معتبر نیست.',
      )
    }

    return response.data.data
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'دریافت پرداخت‌های پرونده ناموفق بود.',
      ),
    )
  }
}