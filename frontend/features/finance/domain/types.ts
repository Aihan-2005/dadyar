export type FinancePaymentStatus =
  | 'paid'
  | 'partial'
  | 'unpaid'
  | 'overdue'

export type FinanceCurrency = 'IRR'

export type FinanceDisplayUnit =
  | 'rial'
  | 'toman'

export type DateValue =
  | Date
  | string
  | null
  | undefined

export type NumericValue =
  | number
  | string
  | null
  | undefined

export interface FinanceClientSource {
  clientId?: string
  name?: string

  
  feeShareAmount?: NumericValue
}

export interface FinancePaymentSource {
  id?: string

  clientId?: string
  clientName?: string

  amount?: NumericValue
  isPaid?: boolean

  paymentDate?: DateValue
  dueDate?: DateValue
  paidDate?: DateValue
}

export interface FinanceNonCashPaymentSource {
  id?: string

  clientId?: string
  clientName?: string

  title?: string
  description?: string

  amount?: NumericValue

  dueDate?: DateValue
  deliveredDate?: DateValue
  isDelivered?: boolean
}

export interface FinanceExpenseSource {
  id?: string
  title?: string
  amount?: NumericValue
  date?: DateValue
  isPaid?: boolean
  description?: string
}

export interface FinanceCaseSource {
  id: string

  title?: string
  caseNumber?: string
  status?: string

  clientId?: string
  clientName?: string
  clients?: FinanceClientSource[]

  totalFee?: NumericValue
  contractAmount?: NumericValue
  totalAmount?: NumericValue

  paidAmount?: NumericValue
  remainingAmount?: NumericValue
  overdueAmount?: NumericValue

  dueDate?: DateValue
  lastPaymentDate?: DateValue

  cashPayments?: FinancePaymentSource[]
  installments?: FinancePaymentSource[]
  nonCashPayments?: FinanceNonCashPaymentSource[]

  expenses?: FinanceExpenseSource[]
}

export interface ResolvedClientAllocation {
  clientId?: string
  clientName: string

  
  feeAmount: number

  ratio: number

  
  isEstimated: boolean
}

export interface CaseFinance {
  caseId: string
  caseNumber: string
  caseTitle: string

  clientId?: string
  clientName: string

  
  totalFee: number

  paidAmount: number
  remainingDebt: number
  overdueAmount: number
  expensesAmount: number

  lastPaymentDate?: string
  dueDate?: string

  status: FinancePaymentStatus
  collectionRate: number

  caseContractAmount?: number

  
  allocationEstimated?: boolean
}

export interface ClientFinanceSummary {
  clientId?: string
  clientName: string

  totalContracts: number

  totalFee: number
  totalPaid: number
  totalRemaining: number
  totalOverdue: number
  totalExpenses: number

  collectionRate: number

  
  estimatedAllocationCases: number

  cases: CaseFinance[]
}

export interface FinancialStats {
  
  totalRevenue: number

  totalReceived: number
  totalRemaining: number
  totalOverdue: number
  totalExpenses: number

  netCollected: number
  collectionRate: number

  clientCount: number
  activeContracts: number
}

export interface FinanceOverview {
  stats: FinancialStats
  clients: ClientFinanceSummary[]
  cases: CaseFinance[]
}