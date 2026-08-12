import {
  create,
} from 'zustand'

import {
  createCaseApi,
  deleteCaseApi,
  fetchAllCasesApi,
  fetchCaseByIdApi,
  getCaseApiErrorMessage,
  updateCaseApi,
} from '@/features/cases/api/case.api'

import {
  toFiniteNumber,
} from '@/features/finance/utils/number'

import type {
  Case,
  CaseStatus,
  CreateCasePayload,
  UpdateCasePayload,
} from '@/types/case'

export type {
  Case,
  CaseStatus,
  CreateCasePayload,
  UpdateCasePayload,
  CourtBranch,
} from '@/types/case'



const LEGACY_STORAGE_KEY =
  'cases-storage'

const ACTIVE_STATUSES:
  CaseStatus[] = [
    'pending',
    'in-progress',
    'open',
    'in_progress',
  ]



function removeLegacyCaseStorage():
  void {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.removeItem(
    LEGACY_STORAGE_KEY
  )
}


interface FetchCasesOptions {
  force?: boolean
}

interface CasesStore {
  cases: Case[]

  selectedCase:
    Case | null

  isLoading:
    boolean

  isSaving:
    boolean

  isDeleting:
    boolean

  error:
    string | null

 
  hasHydrated:
    boolean

  hasLoaded:
    boolean

  lastSyncedAt:
    string | null

  fetchCases: (
    options?:
      FetchCasesOptions
  ) => Promise<void>

  fetchCaseById: (
    id:
      string
  ) => Promise<
    Case | null
  >

  addCase: (
    caseData:
      CreateCasePayload
  ) => Promise<
    Case | null
  >

  updateCase: (
    id:
      string,
    caseData:
      UpdateCasePayload
  ) => Promise<
    Case | null
  >

  deleteCase: (
    id:
      string
  ) => Promise<void>

  setSelectedCase: (
    caseItem:
      Case | null
  ) => void

  clearError:
    () => void

  
  setHasHydrated: (
    value:
      boolean
  ) => void

  clearLocalCases:
    () => void

  restoreDemoCases:
    () => void

  resetCases:
    () => void

  getCaseById: (
    id:
      string
  ) =>
    Case | undefined

  getActiveCases:
    () => Case[]

  getArchivedCases:
    () => Case[]

  getTotalDebt:
    () => number
}



const initialDomainState = {
  cases:
    [] as Case[],

  selectedCase:
    null as
      | Case
      | null,

  isLoading:
    false,

  isSaving:
    false,

  isDeleting:
    false,

  error:
    null as
      | string
      | null,

 
  hasHydrated:
    true,

  hasLoaded:
    false,

  lastSyncedAt:
    null as
      | string
      | null,
}


export const useCasesStore =
  create<CasesStore>()(
    (
      set,
      get
    ) => ({
      ...initialDomainState,

     

      fetchCases:
        async (
          {
            force =
              false,
          } = {}
        ) => {
       
          removeLegacyCaseStorage()

          if (
            get().hasLoaded &&
            !force
          ) {
            return
          }

          set({
            isLoading:
              true,

            error:
              null,
          })

          try {
            const cases =
              await fetchAllCasesApi()

            set({
              cases,

              isLoading:
                false,

              hasLoaded:
                true,

              lastSyncedAt:
                new Date()
                  .toISOString(),

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
                getCaseApiErrorMessage(
                  error,

                  'دریافت پرونده‌ها از سرور ناموفق بود.'
                ),
            })
          }
        },

     

      fetchCaseById:
        async (
          id
        ) => {
          set({
            isLoading:
              true,

            error:
              null,
          })

          try {
            const caseItem =
              await fetchCaseByIdApi(
                id
              )

            set(
              (
                state
              ) => {
                const exists =
                  state.cases.some(
                    (item) =>
                      item.id ===
                      caseItem.id
                  )

                return {
                  selectedCase:
                    caseItem,

                  cases:
                    exists
                      ? state.cases.map(
                          (
                            item
                          ) =>
                            item.id ===
                            caseItem.id
                              ? caseItem
                              : item
                        )
                      : [
                          caseItem,
                          ...state.cases,
                        ],

                  isLoading:
                    false,

                  error:
                    null,

                  lastSyncedAt:
                    new Date()
                      .toISOString(),
                }
              }
            )

            return caseItem
          } catch (
            error
          ) {
            set({
              isLoading:
                false,

              error:
                getCaseApiErrorMessage(
                  error,

                  'دریافت پرونده از سرور ناموفق بود.'
                ),
            })

            return null
          }
        },

      
      addCase:
        async (
          caseData
        ) => {
          set({
            isSaving:
              true,

            error:
              null,
          })

          try {
            const createdCase =
              await createCaseApi(
                caseData
              )

            set(
              (
                state
              ) => ({
                cases: [
                  createdCase,

                  ...state.cases.filter(
                    (item) =>
                      item.id !==
                      createdCase.id
                  ),
                ],

                selectedCase:
                  createdCase,

                isSaving:
                  false,

                hasLoaded:
                  true,

                error:
                  null,

                lastSyncedAt:
                  new Date()
                    .toISOString(),
              })
            )

            return createdCase
          } catch (
            error
          ) {
            set({
              isSaving:
                false,

              error:
                getCaseApiErrorMessage(
                  error,

                  'ثبت پرونده در سرور ناموفق بود.'
                ),
            })

            return null
          }
        },

     

      updateCase:
        async (
          id,
          caseData
        ) => {
          const currentCase =
            get().cases.find(
              (item) =>
                item.id ===
                id
            )

          if (!currentCase) {
            set({
              error:
                'پرونده موردنظر در حافظه پیدا نشد.',
            })

            return null
          }

          set({
            isSaving:
              true,

            error:
              null,
          })

        
          const mergedCase:
            Case = {
              ...currentCase,

              ...caseData,

              id:
                currentCase.id,

              title:
                caseData.title ??
                currentCase.title,

              status:
                caseData.status ??
                currentCase.status,

              createdAt:
                currentCase.createdAt,

              updatedAt:
                currentCase.updatedAt,
            }

          try {
            const updatedCase =
              await updateCaseApi(
                id,

                mergedCase
              )

            set(
              (
                state
              ) => ({
                cases:
                  state.cases.map(
                    (item) =>
                      item.id ===
                      id
                        ? updatedCase
                        : item
                  ),

                selectedCase:
                  state
                    .selectedCase
                    ?.id ===
                  id
                    ? updatedCase
                    : state
                        .selectedCase,

                isSaving:
                  false,

                error:
                  null,

                lastSyncedAt:
                  new Date()
                    .toISOString(),
              })
            )

            return updatedCase
          } catch (
            error
          ) {
            set({
              isSaving:
                false,

              error:
                getCaseApiErrorMessage(
                  error,

                  'ویرایش پرونده در سرور ناموفق بود.'
                ),
            })

            return null
          }
        },

      

      deleteCase:
        async (
          id
        ) => {
          set({
            isDeleting:
              true,

            error:
              null,
          })

          try {
            await deleteCaseApi(
              id
            )

            set(
              (
                state
              ) => ({
                cases:
                  state.cases.filter(
                    (item) =>
                      item.id !==
                      id
                  ),

                selectedCase:
                  state
                    .selectedCase
                    ?.id ===
                  id
                    ? null
                    : state
                        .selectedCase,

                isDeleting:
                  false,

                error:
                  null,

                lastSyncedAt:
                  new Date()
                    .toISOString(),
              })
            )
          } catch (
            error
          ) {
            const message =
              getCaseApiErrorMessage(
                error,

                'حذف پرونده از سرور ناموفق بود.'
              )

            set({
              isDeleting:
                false,

              error:
                message,
            })

           
            throw error
          }
        },

      

      setSelectedCase:
        (
          caseItem
        ) =>
          set({
            selectedCase:
              caseItem,
          }),

     

      clearError:
        () =>
          set({
            error:
              null,
          }),

     

      setHasHydrated:
        (
          value
        ) =>
          set({
            hasHydrated:
              value,
          }),

      clearLocalCases:
        () => {
          removeLegacyCaseStorage()

          set({
            cases: [],

            selectedCase:
              null,

            hasLoaded:
              false,

            error:
              null,

            lastSyncedAt:
              null,
          })
        },

      
      restoreDemoCases:
        () => {
          removeLegacyCaseStorage()

          set({
            cases: [],

            selectedCase:
              null,

            hasLoaded:
              false,

            error:
              null,

            lastSyncedAt:
              null,
          })
        },

    
      resetCases:
        () =>
          set({
            ...initialDomainState,

            hasHydrated:
              true,
          }),

    
      getCaseById:
        (
          id
        ) =>
          get().cases.find(
            (item) =>
              item.id ===
              id
          ),

      getActiveCases:
        () =>
          get().cases.filter(
            (item) =>
              ACTIVE_STATUSES.includes(
                item.status
              )
          ),

      getArchivedCases:
        () =>
          get().cases.filter(
            (item) =>
              item.status ===
              'archived'
          ),

      getTotalDebt:
        () =>
          get().cases.reduce(
            (
              total,
              item
            ) =>
              total +
              toFiniteNumber(
                item.remainingAmount
              ),

            0
          ),
    })
  )