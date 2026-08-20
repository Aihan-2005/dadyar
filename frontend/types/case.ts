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

export type DateValue =
  | Date
  | string

export type MoneyValue =
  | number
  | string

export interface Payment {
  id?: string

  clientId?: string
  clientName?: string

  amount?: number

  dueDate?: DateValue
  paidDate?: DateValue
  paymentDate?: string

  description?: string
  paymentDescription?: string

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

  birthDate?: string

  role?: string
  representative?: string

  feeShareAmount?: MoneyValue
}

export interface OpposingParty {
  name?: string
  phone?: string
  nationalId?: string

  birthDate?: string

  role?: string
  description?: string
}

export interface Lawyer {
  name?: string
  phone?: string

  nationalId?: string
  birthDate?: string

  role?: string

  licenseNumber?: string
  licenseExpiry?: string
  licenseIssuePlace?: string
}

export interface CashPayment {
  id?: string

  /**
   * موکلی که پرداخت یا قسط متعلق به او است.
   */
  clientId?: string
  clientName?: string

  amount?: number
  isPaid?: boolean

  /**
   * تاریخ سررسید/پرداختی که در فرم پرونده وارد می‌شود.
   */
  paymentDate?: string

  /**
   * توضیح همان پرداخت نقدی.
   */
  paymentDescription?: string

  dueDate?: DateValue
  paidDate?: DateValue
}

export interface NonCashPayment {
  id?: string

  clientId?: string
  clientName?: string

  title?: string
  description?: string

  amount?: number

  dueDate?: DateValue
  deliveredDate?: DateValue

  isDelivered?: boolean
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

  birthDate?: string

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

  /**
   * شماره پرونده قضایی.
   */
  caseNumber?: string

  trackingCode?: string

  /**
   * شماره بایگانی داخلی دفتر وکیل.
   * این مقدار مستقل از caseNumber است.
   */
  archiveNumberOffice?: string

  /**
   * فیلد legacy؛ فعلاً برای سازگاری با داده‌های قبلی نگه داشته شده است.
   */
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

  /**
   * فیلدهای legacy پرونده‌های تک‌موکله.
   */
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
  nonCashPayments?: NonCashPayment[]

  installments?: Payment[]
  contracts?: ContractStage[]

  expenses?: Expense[]

  nonCashDescription?: string

  /**
   * ارزش تقریبی مال/تعهد غیرنقدی برای گزارش مالی.
   */
  estimatedPrice?: MoneyValue

  installmentDescription?: string
}

export type CreateCasePayload = Omit<
  Case,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'status'
> & {
  title: string
  status?: CaseStatus
}

export type UpdateCasePayload =
  Partial<
    Omit<
      Case,
      'id' | 'createdAt'
    >
  >