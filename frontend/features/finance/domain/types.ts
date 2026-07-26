export type FinancePaymentStatus = 'paid' | 'partial' | 'unpaid' | 'overdue'

export type FinanceCurrency = 'IRR'
export type FinanceDisplayUnit = 'rial' | 'toman'
export type DateValue = Date | string | null | undefined
export type NumericValue = number | string | null | undefined

export interface FinanceClientSource {
  clientId?: string
  name?: string
}

export interface FinancePaymentSource {
  id?: string
  amount?: NumericValue
  isPaid?: boolean
  paymentDate?: DateValue
  dueDate?: DateValue
  paidDate?: DateValue
}

export interface FinanceExpenseSource {
  id?: string
  title?: string
  amount?: NumericValue
  date?: DateValue
  isPaid?: boolean
  description?: string
}

/**
 * Transitional adapter contract.
 * It accepts both the legacy finance fields and the current case API fields.
 * After the backend contract is finalized, this interface should be replaced
 * by an explicit API DTO mapper rather than expanded further.
 */
export interface FinanceCaseSource {
  id: string
  title?: string
  caseNumber?: string
  clientId?: string
  clientName?: string
  clients?: FinanceClientSource[]
  status?: string

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
  expenses?: FinanceExpenseSource[]
}

export interface CaseFinance {
  caseId: string
  caseNumber: string
  caseTitle: string
  clientId?: string
  clientName: string

  /** Contract value. Kept as totalFee for backward compatibility. */
  totalFee: number
  paidAmount: number
  remainingDebt: number
  overdueAmount: number
  expensesAmount: number

  lastPaymentDate?: string
  dueDate?: string
  status: FinancePaymentStatus
  collectionRate: number
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
  cases: CaseFinance[]
}

export interface FinancialStats {
  /** Total contract value; legacy UI calls this revenue. */
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
