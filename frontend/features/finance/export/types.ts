import type {
  FinancePaymentStatus,
  FinancialStats,
} from '../domain/types'

import type {
  FinanceAgingBucket,
  FinanceDecisionInsight,
  MonthlyCashflowPoint,
} from '../domain/period-analytics'

export type FinanceExportMode =
  | 'management'
  | 'cases'
  | 'clients'

export interface FinanceCaseExportRow {
  caseId: string

  caseNumber: string
  caseTitle: string

  clientNames: string

  contractAmount: number

  paidAmount: number
  remainingAmount: number
  overdueAmount: number
  expensesAmount: number

  collectionRate: number

  status: FinancePaymentStatus

  dueDate?: string
  lastPaymentDate?: string
}

export interface FinanceClientExportRow {
  clientId?: string

  clientName: string

  caseCount: number

  totalFee: number
  totalPaid: number
  totalRemaining: number
  totalOverdue: number
  totalExpenses: number

  collectionRate: number

  estimatedAllocationCases: number
}

export interface FinanceClientCaseExportRow {
  caseId: string

  caseNumber: string
  caseTitle: string

  clientId?: string
  clientName: string

  caseContractAmount: number

  clientShareAmount: number

  paidAmount: number
  remainingAmount: number
  overdueAmount: number
  expensesAmount: number

  collectionRate: number

  status: FinancePaymentStatus

  allocationEstimated: boolean

  dueDate?: string
  lastPaymentDate?: string
}

export interface FinanceExportReport {
  mode: FinanceExportMode

  title: string

  generatedAt: string

  fileBaseName: string

  sourceCaseCount: number
  filteredCaseCount: number

  filterLabels: string[]

  stats: FinancialStats

  caseRows: FinanceCaseExportRow[]

  clientRows: FinanceClientExportRow[]

  clientCaseRows:
    FinanceClientCaseExportRow[]

  cashflow:
    MonthlyCashflowPoint[]

  aging:
    FinanceAgingBucket[]

  insights:
    FinanceDecisionInsight[]
}