export type CaseStatus = 'pending' | 'in-progress' | 'completed' | 'archived'
export type PaymentType = 'cash' | 'non-cash' | 'both'

/**
 * ساختار قدیمی پرداخت اقساطی؛ برای سازگاری با داده‌های قبلی نگه داشته شده است.
 * در مدل جدید، paymentType باید cash | non-cash | both باشد.
 */
export interface Payment {
  amount?: number
  dueDate?: Date | string
  paidDate?: Date | string
  isPaid?: boolean
}

export interface ContractStage {
  title?: string
  amount?: number
  isPaid?: boolean
}

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
  lawyerId: string

  title: string
  status: CaseStatus
  createdAt: Date | string
  updatedAt: Date | string
  closedAt?: Date | string

  caseNumber?: string
  archiveNumberOffice?: string
  archiveNumberLawyer?: string
  archiveNumberBranch?: string
  courtBranch?: CourtBranch

  clients?: CaseClient[]
  opposingParties?: OpposingParty[]
  coLawyers?: Lawyer[]
  opposingLawyers?: Lawyer[]
  otherPersons?: OtherPerson[]

  description?: string

  paymentType?: PaymentType
  contractAmount?: string
  remainingAmount?: number | string
  overdueAmount?: string
  cashPayments?: CashPayment[]
  nonCashDescription?: string
  totalAmount?: number
  expenses?: Expense[]

  subject?: string
  claim?: string
  opponent?: string
  trackingCode?: string
  clientName?: string
  clientPhone?: string
  coLawyerName?: string
  coLawyerInCase?: string
  contracts?: ContractStage[]
  totalFee?: number
  paidAmount?: number
  installments?: Payment[]
  installmentDescription?: string
  dueDate?: Date | string
  lastPaymentDate?: Date | string
}
