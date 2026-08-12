import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  Case,
  CreateCasePayload,
} from '@/types/case'

import {
  fromApiCase,
  toApiCaseState,
  toCreateCaseApiRequest,
} from './case.mapper'

import type {
  ApiCaseListEnvelope,
  ApiCaseRecord,
  ApiCaseState,
  ApiDeleteCaseResult,
  ApiEnvelope,
} from './types'


export async function fetchCasesPageApi(
  page =
    1,
  limit =
    100
) {
  const response =
    await api.get<
      ApiCaseListEnvelope
    >(
      '/cases',
      {
        params: {
          page,
          limit,
        },
      }
    )

  return {
    items:
      response.data.data.map(
        fromApiCase
      ),

    pagination:
      response.data.pagination,
  }
}



export async function fetchAllCasesApi():
  Promise<Case[]> {
  const firstPage =
    await fetchCasesPageApi(
      1,
      100
    )

  const allCases = [
    ...firstPage.items,
  ]

  const totalPages =
    firstPage
      .pagination
      .totalPages

  for (
    let page = 2;
    page <=
    totalPages;
    page += 1
  ) {
    const result =
      await fetchCasesPageApi(
        page,
        100
      )

    allCases.push(
      ...result.items
    )
  }

  return allCases
}



export async function fetchCaseByIdApi(
  caseId:
    string
): Promise<Case> {
  const response =
    await api.get<
      ApiEnvelope<ApiCaseRecord>
    >(
      `/cases/${caseId}`
    )

  return fromApiCase(
    response.data.data
  )
}



export async function createCaseApi(
  payload:
    CreateCasePayload
): Promise<Case> {
  const request =
    toCreateCaseApiRequest(
      payload
    )

  const response =
    await api.post<
      ApiEnvelope<ApiCaseRecord>
    >(
      '/cases',
      request
    )

  return fromApiCase(
    response.data.data
  )
}



export async function updateCaseApi(
  caseId:
    string,
  payload:
    CreateCasePayload
): Promise<Case> {
  const request =
    toCreateCaseApiRequest(
      payload
    )

  const {
    state,
    ...caseBody
  } =
    request

  const caseResponse =
    await api.patch<
      ApiEnvelope<ApiCaseRecord>
    >(
      `/cases/${caseId}`,
      caseBody
    )

  let finalRecord =
    caseResponse.data.data

  if (
    state &&
    finalRecord.state !==
      state
  ) {
    const stateResponse =
      await api.patch<
        ApiEnvelope<ApiCaseRecord>
      >(
        `/cases/${caseId}/state`,
        {
          state,
        }
      )

    finalRecord =
      stateResponse.data.data
  }

  return fromApiCase(
    finalRecord
  )
}


export async function updateCaseStateApi(
  caseId:
    string,
  state:
    ApiCaseState
): Promise<Case> {
  const response =
    await api.patch<
      ApiEnvelope<ApiCaseRecord>
    >(
      `/cases/${caseId}/state`,
      {
        state,
      }
    )

  return fromApiCase(
    response.data.data
  )
}

export async function updateCaseStatusApi(
  caseId:
    string,
  status:
    Case['status']
): Promise<Case> {
  return updateCaseStateApi(
    caseId,
    toApiCaseState(
      status
    )
  )
}



export async function deleteCaseApi(
  caseId:
    string
): Promise<void> {
  const response =
    await api.delete<
      ApiEnvelope<ApiDeleteCaseResult>
    >(
      `/cases/${caseId}`
    )

  if (
    response.data.success !==
      true ||
    response.data.data
      .deleted !== true
  ) {
    throw new Error(
      'پاسخ حذف پرونده معتبر نیست.'
    )
  }
}



export function getCaseApiErrorMessage(
  error:
    unknown,
  fallback =
    'عملیات پرونده با خطا مواجه شد.'
): string {
  return getApiErrorMessage(
    error,
    fallback
  )
}