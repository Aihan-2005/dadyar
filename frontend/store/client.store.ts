import {
  create,
} from 'zustand'

import type {
  Client,
  ClientListOptions,
  ClientPagination,
  CreateClientPayload,
  UpdateClientPayload,
} from '@/types/client'

import {
  createClientApi,
  fetchAllClientsApi,
  fetchClientByIdApi,
  fetchClientsApi,
  getClientApiErrorMessage,
  lookupClientByPhoneApi,
  updateClientApi,
} from '@/features/clients/api/client.api'

import {
  migrateLegacyClientsToServer,
  type LegacyClientMigrationReport,
} from '@/features/clients/migration/local-client-migration'

export type {
  Client,
  ClientListOptions,
  ClientPagination,
  CreateClientPayload,
  UpdateClientPayload,
} from '@/types/client'



const DEFAULT_PAGINATION:
  ClientPagination = {
    page: 1,

    limit: 20,

    total: 0,

    totalPages: 0,
  }



interface ClientStore {
  clients:
    Client[]

  selectedClient:
    Client | null

  pagination:
    ClientPagination

  isLoading:
    boolean

  isSaving:
    boolean

  error:
    string | null

  hasLoaded:
    boolean

  migrationReport:
    LegacyClientMigrationReport | null

  
  fetchClients: (
    options?:
      ClientListOptions
  ) => Promise<void>


  fetchAllClients:
    () => Promise<void>

  fetchClientById: (
    clientId:
      string
  ) => Promise<
    Client | null
  >

  lookupByPhone: (
    phone:
      string
  ) => Promise<
    Client | null
  >

  

  addClient: (
    payload:
      CreateClientPayload
  ) => Promise<
    Client | null
  >

  updateClient: (
    clientId:
      string,

    payload:
      UpdateClientPayload
  ) => Promise<
    Client | null
  >

  

  migrateLegacyClients:
    () => Promise<
      LegacyClientMigrationReport
    >

  

  setSelectedClient: (
    client:
      Client | null
  ) => void

  getClientById: (
    clientId:
      string
  ) =>
    Client | undefined

  clearError:
    () => void

  clearMigrationReport:
    () => void

  reset:
    () => void
}



const initialState = {
  clients:
    [] as Client[],

  selectedClient:
    null as
      | Client
      | null,

  pagination: {
    ...DEFAULT_PAGINATION,
  },

  isLoading:
    false,

  isSaving:
    false,

  error:
    null as
      | string
      | null,

  hasLoaded:
    false,

  migrationReport:
    null as
      | LegacyClientMigrationReport
      | null,
}



export const useClientStore =
  create<ClientStore>()(
    (
      set,
      get
    ) => ({
      ...initialState,

   
      fetchClients:
        async (
          options = {}
        ) => {
          set({
            isLoading:
              true,

            error:
              null,
          })

          try {
            const result =
              await fetchClientsApi(
                options
              )

            set({
              clients:
                result.items,

              pagination:
                result.pagination,

              isLoading:
                false,

              hasLoaded:
                true,

              error:
                null,
            })
          } catch (
            error
          ) {
            set({
              isLoading:
                false,

              hasLoaded:
                true,

              error:
                getClientApiErrorMessage(
                  error,

                  'دریافت موکلین ناموفق بود.'
                ),
            })
          }
        },

      

      fetchAllClients:
        async () => {
          set({
            isLoading:
              true,

            error:
              null,
          })

          try {
            const clients =
              await fetchAllClientsApi()

            set({
              clients,

              isLoading:
                false,

              hasLoaded:
                true,

              error:
                null,
            })
          } catch (
            error
          ) {
            set({
              isLoading:
                false,

              hasLoaded:
                true,

              error:
                getClientApiErrorMessage(
                  error,

                  'دریافت فهرست کامل موکلین ناموفق بود.'
                ),
            })
          }
        },


      fetchClientById:
        async (
          clientId
        ) => {
          set({
            isLoading:
              true,

            error:
              null,
          })

          try {
            const client =
              await fetchClientByIdApi(
                clientId
              )

            set(
              (
                state
              ) => ({
                selectedClient:
                  client,

                clients:
                  state.clients.some(
                    (item) =>
                      item.id ===
                      client.id
                  )
                    ? state.clients.map(
                        (
                          item
                        ) =>
                          item.id ===
                          client.id
                            ? client
                            : item
                      )
                    : [
                        client,
                        ...state.clients,
                      ],

                isLoading:
                  false,

                error:
                  null,
              })
            )

            return client
          } catch (
            error
          ) {
            set({
              isLoading:
                false,

              error:
                getClientApiErrorMessage(
                  error,

                  'دریافت اطلاعات موکل ناموفق بود.'
                ),
            })

            return null
          }
        },

      

      lookupByPhone:
        async (
          phone
        ) => {
          try {
            return await lookupClientByPhoneApi(
              phone
            )
          } catch (
            error
          ) {
            set({
              error:
                getClientApiErrorMessage(
                  error,

                  'جست‌وجوی موکل ناموفق بود.'
                ),
            })

            return null
          }
        },


      addClient:
        async (
          payload
        ) => {
          set({
            isSaving:
              true,

            error:
              null,
          })

          try {
            const client =
              await createClientApi(
                payload
              )

            set(
              (
                state
              ) => ({
                clients: [
                  client,

                  ...state.clients.filter(
                    (item) =>
                      item.id !==
                      client.id
                  ),
                ],

                pagination: {
                  ...state.pagination,

                  total:
                    state.pagination
                      .total +
                    1,

                  totalPages:
                    Math.max(
                      Math.ceil(
                        (
                          state.pagination
                            .total +
                          1
                        ) /
                          Math.max(
                            state.pagination
                              .limit,
                            1
                          )
                      ),

                      1
                    ),
                },

                isSaving:
                  false,

                error:
                  null,
              })
            )

            return client
          } catch (
            error
          ) {
            set({
              isSaving:
                false,

              error:
                getClientApiErrorMessage(
                  error,

                  'ثبت موکل در سرور ناموفق بود.'
                ),
            })

            return null
          }
        },

      updateClient:
        async (
          clientId,
          payload
        ) => {
          set({
            isSaving:
              true,

            error:
              null,
          })

          try {
            const updated =
              await updateClientApi(
                clientId,
                payload
              )

            set(
              (
                state
              ) => ({
                clients:
                  state.clients.map(
                    (item) =>
                      item.id ===
                      clientId
                        ? updated
                        : item
                  ),

                selectedClient:
                  state
                    .selectedClient
                    ?.id ===
                  clientId
                    ? updated
                    : state
                        .selectedClient,

                isSaving:
                  false,

                error:
                  null,
              })
            )

            return updated
          } catch (
            error
          ) {
            set({
              isSaving:
                false,

              error:
                getClientApiErrorMessage(
                  error,

                  'ویرایش موکل در سرور ناموفق بود.'
                ),
            })

            return null
          }
        },

     
      migrateLegacyClients:
        async () => {
          const report =
            await migrateLegacyClientsToServer()

          set({
            migrationReport:
              report,
          })

          return report
        },

     

      setSelectedClient:
        (
          client
        ) =>
          set({
            selectedClient:
              client,
          }),

     

      getClientById:
        (
          clientId
        ) =>
          get()
            .clients.find(
              (
                client
              ) =>
                client.id ===
                clientId
            ),

     
      clearError:
        () =>
          set({
            error:
              null,
          }),

      clearMigrationReport:
        () =>
          set({
            migrationReport:
              null,
          }),

      

      reset:
        () =>
          set({
            ...initialState,

            pagination: {
              ...DEFAULT_PAGINATION,
            },
          }),
    })
  )