import type {
  FinancePaymentStatus,
} from '../domain/types'

export type FinanceExportScope =
  | 'all-cases'
  | 'all-clients'
  | 'selected-clients'

export type FinanceExportFormat =
  | 'xlsx'
  | 'pdf'

export interface FinanceExportSelection {
  scope: FinanceExportScope
  clientKeys: string[]
}

export interface FinanceExportRow {
  rowKind:
    | 'case'
    | 'client-share'

  caseId: string
  caseNumber: string
  caseTitle: string

  clientName: string

  
  contractAmount: number

  clientShareAmount?: number

  paidAmount: number
  remainingAmount: number
  overdueAmount: number
  expensesAmount: number

  collectionRate: number

  status: FinancePaymentStatus

  dueDate?: string
  lastPaymentDate?: string

  allocationEstimated: boolean
}

export interface FinanceExportSummary {
  totalFee: number
  totalPaid: number
  totalRemaining: number
  totalOverdue: number
  totalExpenses: number

  netCollected: number
  collectionRate: number

  caseCount: number
  clientCount: number
}

export interface FinanceExportReport {
  title: string
  scopeLabel: string
  amountLabel: string

  generatedAt: string

  fileBaseName: string

  summary: FinanceExportSummary

  rows: FinanceExportRow[]

  selectedClientNames: string[]
}