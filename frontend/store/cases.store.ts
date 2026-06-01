import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CaseStatus = 'pending' | 'in-progress' | 'completed' | 'archived'
export type PaymentType = 'cash' | 'non-cash' | 'both'

type LegacyPaymentType = 'installment'

export interface CaseClient {
  clientId?: string
  name?: string
  phone?: string
  nationalId?: string
  role?: string
  representative?: string
}

export interface OpposingParty {
  name?: string
  phone?: string
  nationalId?: string
  description?: string
}

export interface Lawyer {
  name?: string
  phone?: string
  licenseNumber?: string
  licenseExpiry?: string
  licenseIssuePlace?: string
}

export interface CashPayment {
  amount?: number
  isPaid?: boolean
  paymentDate?: string
}

export interface BranchHistoryItem {
  province?: string
  city?: string
  branchNumber?: string
  archiveNumberBranch?: string
  date?: string
  isActive: boolean
}

export interface CourtBranch {
  province?: string
  city?: string
  courtType?: string
  branch?: string
  currentBranchNumber?: string
  branchNumber?: string
  courtName?: string
  archiveNumberBranch?: string
  branchHistory?: BranchHistoryItem[]
}

export interface Expense {
  title?: string
  amount?: number
  date?: string
  description?: string
  isPaid?: boolean
}

export interface OtherPerson {
  name?: string
  phone?: string
  nationalId?: string
  description?: string
}

export interface Case {
  id: string
  lawyerId?: string
  title: string
  clientName?: string
  clientPhone?: string
  caseNumber?: string
  archiveNumberOffice?: string
  archiveNumberLawyer?: string
  archiveNumberBranch?: string
  courtBranch?: CourtBranch
  coLawyerName?: string
  coLawyerInCase?: string
  status: CaseStatus
  description?: string
  clients?: CaseClient[]
  opposingParties?: OpposingParty[]
  coLawyers?: Lawyer[]
  opposingLawyers?: Lawyer[]
  cashPayments?: CashPayment[]
  paymentType?: PaymentType
  nonCashDescription?: string
  installmentDescription?: string
  contractAmount?: string
  remainingAmount?: string | number
  overdueAmount?: string | number
  totalFee?: number
  paidAmount?: number
  totalAmount?: number
  dueDate?: Date | string
  lastPaymentDate?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
  closedAt?: Date | string
  expenses?: Expense[]
  otherPersons?: OtherPerson[]
}

type CreateCasePayload = Omit<Case, 'id' | 'createdAt' | 'updatedAt'>

interface CasesStore {
  cases: Case[]
  addCase: (caseData: CreateCasePayload) => Case
  updateCase: (id: string, caseData: Partial<Case>) => void
  deleteCase: (id: string) => void
  getCaseById: (id: string) => Case | undefined
  getActiveCases: () => Case[]
  getPendingCases: () => Case[]
  getMonthlyCases: () => Case[]
  getTotalDebt: () => number
}

const toNumber = (value: unknown): number => {
  if (value === '' || value === null || value === undefined) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0

  const numericValue = Number(String(value).replace(/,/g, ''))
  return Number.isFinite(numericValue) ? numericValue : 0
}

const calculatePaidAmountFromCashPayments = (cashPayments?: CashPayment[]): number => {
  return (cashPayments || []).reduce((sum, payment) => {
    if (!payment?.isPaid) return sum
    return sum + toNumber(payment.amount)
  }, 0)
}

const calculateTotalCashAmount = (cashPayments?: CashPayment[]): number => {
  return (cashPayments || []).reduce((sum, payment) => sum + toNumber(payment.amount), 0)
}

const calculateRemainingAmount = (caseData: Partial<Case>): number => {
  const contractAmount = toNumber(caseData.contractAmount)
  const totalFee = toNumber(caseData.totalFee)
  const baseAmount = contractAmount || totalFee || toNumber(caseData.totalAmount)
  const paidAmount =
    caseData.paidAmount !== undefined
      ? toNumber(caseData.paidAmount)
      : calculatePaidAmountFromCashPayments(caseData.cashPayments)

  return Math.max(baseAmount - paidAmount, 0)
}

const normalizePaymentType = (paymentType?: PaymentType | LegacyPaymentType): PaymentType => {
  if (paymentType === 'installment') return 'non-cash'
  if (paymentType === 'non-cash' || paymentType === 'both' || paymentType === 'cash') return paymentType
  return 'cash'
}

const cleanArray = <T extends Record<string, any>>(items?: T[]) => {
  return (items || []).filter((item) =>
    Object.values(item).some((value) => {
      if (typeof value === 'boolean') return value === true
      if (typeof value === 'number') return value !== 0
      if (Array.isArray(value)) return value.length > 0
      return String(value || '').trim() !== ''
    })
  )
}

const normalizeCaseData = <T extends Partial<Case>>(caseData: T): T => {
  const paymentType = normalizePaymentType(caseData.paymentType as PaymentType | LegacyPaymentType | undefined)
  const cashPayments = paymentType === 'non-cash' ? [] : cleanArray(caseData.cashPayments)
  const totalAmount = paymentType === 'non-cash' ? 0 : calculateTotalCashAmount(cashPayments)
  const paidAmount = calculatePaidAmountFromCashPayments(cashPayments)
  const remainingAmount = calculateRemainingAmount({
    ...caseData,
    cashPayments,
    paidAmount,
    totalAmount,
  })

  return {
    ...caseData,
    paymentType,
    cashPayments,
    totalAmount,
    paidAmount,
    remainingAmount,
    clients: cleanArray(caseData.clients),
    opposingParties: cleanArray(caseData.opposingParties),
    coLawyers: cleanArray(caseData.coLawyers),
    opposingLawyers: cleanArray(caseData.opposingLawyers),
    expenses: cleanArray(caseData.expenses),
    otherPersons: cleanArray(caseData.otherPersons),
    nonCashDescription:
      caseData.nonCashDescription || caseData.installmentDescription || '',
    installmentDescription: undefined,
  } as T
}

const isInCurrentMonth = (date: Date | string): boolean => {
  const normalizedDate = new Date(date)
  const now = new Date()

  return (
    normalizedDate.getMonth() === now.getMonth() &&
    normalizedDate.getFullYear() === now.getFullYear()
  )
}

export const useCasesStore = create<CasesStore>()(
  persist(
    (set, get) => ({
      cases: [],

      addCase: (caseData) => {
        const normalizedCaseData = normalizeCaseData(caseData)

        const newCase: Case = {
          ...normalizedCaseData,
          id: crypto.randomUUID(),
          title: normalizedCaseData.title || '',
          status: normalizedCaseData.status || 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({ cases: [...state.cases, newCase] }))
        return newCase
      },

      updateCase: (id, caseData) => {
        set((state) => ({
          cases: state.cases.map((currentCase) => {
            if (currentCase.id !== id) return currentCase

            const mergedCase = {
              ...currentCase,
              ...caseData,
              updatedAt: new Date(),
            }

            return normalizeCaseData(mergedCase)
          }),
        }))
      },

      deleteCase: (id) => {
        set((state) => ({
          cases: state.cases.filter((currentCase) => currentCase.id !== id),
        }))
      },

      getCaseById: (id) => {
        return get().cases.find((currentCase) => currentCase.id === id)
      },

      getActiveCases: () => {
        return get().cases.filter(
          (currentCase) => currentCase.status !== 'archived' && !currentCase.closedAt
        )
      },

      getPendingCases: () => {
        return get().cases.filter((currentCase) => currentCase.status === 'pending')
      },

      getMonthlyCases: () => {
        return get().cases.filter((currentCase) => isInCurrentMonth(currentCase.createdAt))
      },

      getTotalDebt: () => {
        return get().cases.reduce(
          (sum, currentCase) => sum + toNumber(currentCase.remainingAmount),
          0
        )
      },
    }),
    {
      name: 'cases-storage',
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState?.cases) return persistedState

        return {
          ...persistedState,
          cases: persistedState.cases.map((caseItem: Case & { paymentType?: PaymentType | LegacyPaymentType }) =>
            normalizeCaseData({
              ...caseItem,
              paymentType: normalizePaymentType(caseItem.paymentType),
              nonCashDescription:
                caseItem.nonCashDescription || caseItem.installmentDescription || '',
              updatedAt: caseItem.updatedAt || new Date(),
              createdAt: caseItem.createdAt || new Date(),
            })
          ),
        }
      },
    }
  )
)
