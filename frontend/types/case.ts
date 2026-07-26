export type CaseStatus =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'archived'
  | 'open'
  | 'in_progress'
  | 'closed'

export type PaymentType =
  | 'cash'
  | 'non-cash'
  | 'both'

export type DateValue = Date | string
export type MoneyValue = number | string

export interface Payment {
  id?: string
  amount?: number
  dueDate?: DateValue
  paidDate?: DateValue
  paymentDate?: string
  isPaid?: boolean
}

export interface ContractStage {
  id?: string
  title?: string
  amount?: number
  isPaid?: boolean
  dueDate?: DateValue
  paidDate?: DateValue
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
  role?: string
  birthDate?: string
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
  id?: string
  amount?: number
  isPaid?: boolean
  paymentDate?: string
  dueDate?: DateValue
  paidDate?: DateValue
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
  id?: string
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
  role?: string
  description?: string
}

export interface Case {
  id: string
  lawyerId?: string

  title: string
  status: CaseStatus
  createdAt: DateValue
  updatedAt: DateValue
  closedAt?: DateValue

  caseNumber?: string
  trackingCode?: string
  archiveNumberOffice?: string
  archiveNumberLawyer?: string
  archiveNumberBranch?: string

  province?: string
  city?: string
  courtType?: string
  courtName?: string
  branchName?: string
  courtBranch?: CourtBranch
  branchHistory?: BranchHistoryItem[]

  clients?: CaseClient[]
  clientId?: string
  clientName?: string
  clientPhone?: string

  opposingParties?: OpposingParty[]
  coLawyers?: Lawyer[]
  opposingLawyers?: Lawyer[]
  otherPersons?: OtherPerson[]

  subject?: string
  claim?: string
  opponent?: string
  description?: string
  coLawyerName?: string
  coLawyerInCase?: string

  paymentType?: PaymentType
  contractAmount?: MoneyValue
  totalFee?: number
  totalAmount?: number
  paidAmount?: number
  remainingAmount?: MoneyValue
  overdueAmount?: MoneyValue
  dueDate?: DateValue
  lastPaymentDate?: DateValue

  cashPayments?: CashPayment[]
  installments?: Payment[]
  contracts?: ContractStage[]
  expenses?: Expense[]

  nonCashDescription?: string
  installmentDescription?: string
}

export type CreateCasePayload = Omit<
  Case,
  'id' | 'createdAt' | 'updatedAt' | 'status'
> & {
  title: string
  status?: CaseStatus
}

export type UpdateCasePayload = Partial<
  Omit<Case, 'id' | 'createdAt'>
>