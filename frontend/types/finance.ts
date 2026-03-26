export interface CaseFinance {
  caseId: string
  caseNumber: string
  caseTitle: string
  clientName: string
  totalFee: number
  paidAmount: number
  remainingDebt: number
  overdueAmount: number
  lastPaymentDate?: string
  dueDate?: string
  status: 'paid' | 'partial' | 'unpaid' | 'overdue'
}

export interface ClientFinanceSummary {
  clientName: string
  totalContracts: number
  totalFee: number
  totalPaid: number
  totalRemaining: number
  totalOverdue: number
  cases: CaseFinance[]
}

export interface FinancialStats {
  totalRevenue: number
  totalReceived: number
  totalRemaining: number
  totalOverdue: number
  clientCount: number
  activeContracts: number
}
