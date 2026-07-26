import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createDemoCases } from '@/features/cases/data/cases.mock'
import { parseFinanceDate } from '@/features/finance/utils/date'
import { toFiniteNumber } from '@/features/finance/utils/number'
import type {
  Case,
  CaseStatus,
  CreateCasePayload,
  PaymentType,
  UpdateCasePayload,
} from '@/types/case'

export type {
  Case,
  CaseStatus,
  CreateCasePayload,
  UpdateCasePayload,
} from '@/types/case'

interface FetchCasesOptions {
  force?: boolean
}

interface CasesStore {
  cases: Case[]
  selectedCase: Case | null

  isLoading: boolean
  error: string | null

  hasHydrated: boolean
  hasLoaded: boolean
  lastSyncedAt: string | null

  fetchCases: (
    options?: FetchCasesOptions
  ) => Promise<void>

  fetchCaseById: (
    id: string
  ) => Promise<Case | null>

  addCase: (
    caseData: CreateCasePayload
  ) => Promise<Case | null>

  updateCase: (
    id: string,
    caseData: UpdateCasePayload
  ) => Promise<Case | null>

  deleteCase: (id: string) => Promise<void>

  setSelectedCase: (
    caseItem: Case | null
  ) => void

  clearError: () => void

  setHasHydrated: (
    value: boolean
  ) => void

  clearLocalCases: () => void
  restoreDemoCases: () => void

  getCaseById: (
    id: string
  ) => Case | undefined

  getActiveCases: () => Case[]
  getArchivedCases: () => Case[]
  getTotalDebt: () => number
}

const SHOULD_SEED_DEMO_CASES =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_CASES !==
  'false'

const ACTIVE_STATUSES: CaseStatus[] = [
  'pending',
  'in-progress',
  'open',
  'in_progress',
]

function createId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `case-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`
  )
}

function cleanArray<T extends object>(
  items?: T[]
): T[] {
  return (items ?? []).filter((item) =>
    Object.values(
      item as Record<string, unknown>
    ).some((value) => {
      if (typeof value === 'boolean') {
        return value
      }

      if (typeof value === 'number') {
        return value !== 0
      }

      if (Array.isArray(value)) {
        return value.length > 0
      }

      return String(value ?? '').trim().length > 0
    })
  )
}

function normalizePaymentType(
  value?: PaymentType
): PaymentType {
  return value === 'non-cash' || value === 'both'
    ? value
    : 'cash'
}

function toIso(
  value: unknown,
  fallback?: Date
): string | undefined {
  return (
    parseFinanceDate(
      value as Date | string | undefined
    )?.toISOString() ??
    fallback?.toISOString()
  )
}

function firstDate(
  values: Array<string | undefined>,
  direction: 'asc' | 'desc'
): string | undefined {
  return values
    .filter(
      (value): value is string => Boolean(value)
    )
    .sort((first, second) =>
      direction === 'asc'
        ? new Date(first).getTime() -
          new Date(second).getTime()
        : new Date(second).getTime() -
          new Date(first).getTime()
    )[0]
}

function normalizeCase(
  input: Partial<Case> &
    Pick<Case, 'id' | 'title'>,
  now = new Date()
): Case {
  const paymentType = normalizePaymentType(
    input.paymentType
  )

  const clients = cleanArray(input.clients)

  const primaryClient = clients.find(
    (client) => client.name?.trim()
  )

  const cashPayments =
    paymentType === 'non-cash'
      ? []
      : cleanArray(input.cashPayments).map(
          (payment) => ({
            ...payment,

            id:
              payment.id ||
              createId(),

            amount: toFiniteNumber(
              payment.amount
            ),

            isPaid: Boolean(
              payment.isPaid
            ),
          })
        )

  const installments = cleanArray(
    input.installments
  ).map((payment) => ({
    ...payment,

    id:
      payment.id ||
      createId(),

    amount: toFiniteNumber(
      payment.amount
    ),

    isPaid: Boolean(
      payment.isPaid
    ),
  }))

  const payments =
    cashPayments.length > 0
      ? cashPayments
      : installments

  const paymentsTotal = payments.reduce(
    (sum, payment) =>
      sum +
      toFiniteNumber(payment.amount),
    0
  )

  const paymentsPaid = payments.reduce(
    (sum, payment) =>
      payment.isPaid
        ? sum +
          toFiniteNumber(payment.amount)
        : sum,
    0
  )

  const contractAmount =
    [
      input.contractAmount,
      input.totalFee,
      input.totalAmount,
      paymentsTotal,
    ]
      .map(toFiniteNumber)
      .find((amount) => amount > 0) ?? 0

  const paidAmount =
    paymentsPaid ||
    toFiniteNumber(input.paidAmount)

  const remainingAmount =
    contractAmount > 0
      ? Math.max(
          contractAmount - paidAmount,
          0
        )
      : Math.max(
          toFiniteNumber(
            input.remainingAmount
          ),
          0
        )

  const dueDates = payments
    .filter(
      (payment) => !payment.isPaid
    )
    .map((payment) =>
      toIso(
        payment.dueDate ??
          payment.paymentDate
      )
    )

  const paidDates = payments
    .filter(
      (payment) => payment.isPaid
    )
    .map((payment) =>
      toIso(
        payment.paidDate ??
          payment.paymentDate ??
          payment.dueDate
      )
    )

  const calculatedOverdue =
    payments.reduce((sum, payment) => {
      if (payment.isPaid) {
        return sum
      }

      const dueDate = parseFinanceDate(
        payment.dueDate ??
          payment.paymentDate
      )

      return dueDate &&
        dueDate.getTime() < now.getTime()
        ? sum +
            toFiniteNumber(
              payment.amount
            )
        : sum
    }, 0)

  const status =
    input.status ?? 'pending'

  return {
    ...input,

    id: input.id,
    title: input.title.trim(),
    status,

    createdAt:
      toIso(input.createdAt, now) ??
      now.toISOString(),

    updatedAt:
      toIso(input.updatedAt, now) ??
      now.toISOString(),

    closedAt:
      toIso(input.closedAt) ??
      (status === 'completed' ||
      status === 'closed'
        ? now.toISOString()
        : undefined),

    clients,

    clientId:
      input.clientId ||
      primaryClient?.clientId,

    clientName:
      input.clientName?.trim() ||
      primaryClient?.name?.trim(),

    clientPhone:
      input.clientPhone ||
      primaryClient?.phone,

    paymentType,
    cashPayments,
    installments,

    expenses: cleanArray(
      input.expenses
    ).map((expense) => ({
      ...expense,

      id:
        expense.id ||
        createId(),

      amount: toFiniteNumber(
        expense.amount
      ),

      isPaid: Boolean(
        expense.isPaid
      ),
    })),

    opposingParties: cleanArray(
      input.opposingParties
    ),

    coLawyers: cleanArray(
      input.coLawyers
    ),

    opposingLawyers: cleanArray(
      input.opposingLawyers
    ),

    otherPersons: cleanArray(
      input.otherPersons
    ),

    branchHistory: cleanArray(
      input.branchHistory
    ),

    contractAmount,
    totalFee: contractAmount,

    totalAmount:
      paymentsTotal ||
      toFiniteNumber(
        input.totalAmount
      ),

    paidAmount,
    remainingAmount,

    overdueAmount: Math.max(
      calculatedOverdue,
      toFiniteNumber(
        input.overdueAmount
      )
    ),

    dueDate:
      firstDate(dueDates, 'asc') ||
      toIso(input.dueDate),

    lastPaymentDate:
      firstDate(paidDates, 'desc') ||
      toIso(input.lastPaymentDate),

    nonCashDescription:
      input.nonCashDescription ||
      input.installmentDescription ||
      '',
  }
}

function createCase(
  caseData: CreateCasePayload
): Case {
  const now = new Date()

  return normalizeCase(
    {
      ...caseData,

      id: createId(),
      title: caseData.title,

      status:
        caseData.status ??
        'pending',

      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    now
  )
}

export const useCasesStore =
  create<CasesStore>()(
    persist(
      (set, get) => ({
        cases: [],
        selectedCase: null,

        isLoading: false,
        error: null,

        hasHydrated: false,
        hasLoaded: false,
        lastSyncedAt: null,

        fetchCases: async (
          { force = false } = {}
        ) => {
          if (
            !get().hasHydrated ||
            (get().hasLoaded && !force)
          ) {
            return
          }

          set({
            isLoading: true,
            error: null,
          })

          const currentCases =
            get().cases

          const cases =
            currentCases.length > 0
              ? currentCases.map(
                  (caseItem) =>
                    normalizeCase(
                      caseItem
                    )
                )
              : SHOULD_SEED_DEMO_CASES
                ? createDemoCases().map(
                    createCase
                  )
                : []

          set({
            cases,
            isLoading: false,
            hasLoaded: true,
            lastSyncedAt:
              new Date().toISOString(),
          })
        },

        fetchCaseById: async (
          id
        ) => {
          const caseItem =
            get().cases.find(
              (item) =>
                item.id === id
            ) ?? null

          set({
            selectedCase: caseItem,
            error: null,
          })

          return caseItem
        },

        addCase: async (
          caseData
        ) => {
          set({
            isLoading: true,
            error: null,
          })

          const newCase =
            createCase(caseData)

          set((state) => ({
            cases: [
              newCase,
              ...state.cases,
            ],

            selectedCase: newCase,

            isLoading: false,
            hasLoaded: true,

            lastSyncedAt:
              new Date().toISOString(),
          }))

          return newCase
        },

        updateCase: async (
          id,
          caseData
        ) => {
          set({
            isLoading: true,
            error: null,
          })

          const currentCase =
            get().cases.find(
              (item) =>
                item.id === id
            )

          if (!currentCase) {
            set({
              isLoading: false,
              error:
                'پرونده موردنظر پیدا نشد',
            })

            return null
          }

          const updatedCase =
            normalizeCase({
              ...currentCase,
              ...caseData,

              id,

              title:
                caseData.title ??
                currentCase.title,

              createdAt:
                currentCase.createdAt,

              updatedAt:
                new Date().toISOString(),
            })

          set((state) => ({
            cases:
              state.cases.map(
                (item) =>
                  item.id === id
                    ? updatedCase
                    : item
              ),

            selectedCase:
              state.selectedCase?.id ===
              id
                ? updatedCase
                : state.selectedCase,

            isLoading: false,

            lastSyncedAt:
              new Date().toISOString(),
          }))

          return updatedCase
        },

        deleteCase: async (
          id
        ) => {
          set((state) => ({
            cases:
              state.cases.filter(
                (item) =>
                  item.id !== id
              ),

            selectedCase:
              state.selectedCase?.id ===
              id
                ? null
                : state.selectedCase,

            isLoading: false,
            error: null,

            lastSyncedAt:
              new Date().toISOString(),
          }))
        },

        setSelectedCase: (
          caseItem
        ) =>
          set({
            selectedCase:
              caseItem,
          }),

        clearError: () =>
          set({
            error: null,
          }),

        setHasHydrated: (
          value
        ) =>
          set({
            hasHydrated: value,
          }),

        clearLocalCases: () =>
          set({
            cases: [],
            selectedCase: null,

            error: null,
            hasLoaded: true,

            lastSyncedAt:
              new Date().toISOString(),
          }),

        restoreDemoCases: () =>
          set({
            cases:
              createDemoCases().map(
                createCase
              ),

            selectedCase: null,
            error: null,
            hasLoaded: true,

            lastSyncedAt:
              new Date().toISOString(),
          }),

        getCaseById: (
          id
        ) =>
          get().cases.find(
            (item) =>
              item.id === id
          ),

        getActiveCases: () =>
          get().cases.filter(
            (item) =>
              ACTIVE_STATUSES.includes(
                item.status
              )
          ),

        getArchivedCases: () =>
          get().cases.filter(
            (item) =>
              item.status ===
              'archived'
          ),

        getTotalDebt: () =>
          get().cases.reduce(
            (sum, item) =>
              sum +
              toFiniteNumber(
                item.remainingAmount
              ),
            0
          ),
      }),

      {
        name: 'cases-storage',

        partialize: (state) => ({
          cases: state.cases,

          selectedCase:
            state.selectedCase,

          lastSyncedAt:
            state.lastSyncedAt,
        }),

        onRehydrateStorage:
          () => (state) => {
            state?.setHasHydrated(
              true
            )
          },
      }
    )
  )