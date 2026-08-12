import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  Client,
  ClientListOptions,
  ClientPagination,
  CreateClientPayload,
  UpdateClientPayload,
} from '@/types/client'

import {
  fromApiClient,
  toCreateClientApiRequest,
  toUpdateClientApiRequest,
} from './client.mapper'

import type {
  ApiClientListEnvelope,
  ApiClientRecord,
  ApiEnvelope,
} from './types'


export interface ClientListResult {
  items: Client[]

  pagination:
    ClientPagination
}



export async function fetchClientsApi(
  options:
    ClientListOptions = {}
): Promise<ClientListResult> {
  const response =
    await api.get<
      ApiClientListEnvelope
    >(
      '/clients',
      {
        params: {
          search:
            options.search?.trim() ||
            undefined,

          page:
            options.page ??
            1,

          limit:
            options.limit ??
            20,
        },
      }
    )

  return {
    items:
      response.data.data.map(
        fromApiClient
      ),

    pagination:
      response.data.pagination,
  }
}



export async function fetchAllClientsApi():
  Promise<Client[]> {
  const firstPage =
    await fetchClientsApi({
      page: 1,
      limit: 100,
    })

  const allClients = [
    ...firstPage.items,
  ]

  const totalPages =
    firstPage.pagination
      .totalPages

  


  for (
    let page = 2;
    page <= totalPages;
    page += 1
  ) {
    const result =
      await fetchClientsApi({
        page,
        limit: 100,
      })

    allClients.push(
      ...result.items
    )
  }

 
  const uniqueClients =
    new Map<
      string,
      Client
    >()

  for (
    const client of
    allClients
  ) {
    uniqueClients.set(
      client.id,
      client
    )
  }

  return Array.from(
    uniqueClients.values()
  )
}


export async function fetchClientByIdApi(
  clientId:
    string
): Promise<Client> {
  const response =
    await api.get<
      ApiEnvelope<ApiClientRecord>
    >(
      `/clients/${clientId}`
    )

  return fromApiClient(
    response.data.data
  )
}



export async function lookupClientByPhoneApi(
  phone:
    string
): Promise<Client | null> {
  const response =
    await api.get<
      ApiEnvelope<
        ApiClientRecord | null
      >
    >(
      '/clients/lookup',
      {
        params: {
          phone,
        },
      }
    )

  if (
    !response.data.data
  ) {
    return null
  }

  return fromApiClient(
    response.data.data
  )
}



export async function createClientApi(
  payload:
    CreateClientPayload
): Promise<Client> {
  const request =
    toCreateClientApiRequest(
      payload
    )

  const response =
    await api.post<
      ApiEnvelope<ApiClientRecord>
    >(
      '/clients',
      request
    )

  return fromApiClient(
    response.data.data
  )
}



export async function updateClientApi(
  clientId:
    string,

  payload:
    UpdateClientPayload
): Promise<Client> {
  const request =
    toUpdateClientApiRequest(
      payload
    )

  const response =
    await api.patch<
      ApiEnvelope<ApiClientRecord>
    >(
      `/clients/${clientId}`,
      request
    )

  return fromApiClient(
    response.data.data
  )
}


export function getClientApiErrorMessage(
  error:
    unknown,

  fallback =
    'عملیات موکل با خطا مواجه شد.'
): string {
  return getApiErrorMessage(
    error,
    fallback
  )
}