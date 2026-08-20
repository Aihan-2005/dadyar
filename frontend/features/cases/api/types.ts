export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ApiCaseState =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'ARCHIVED'

export type ApiCasePaymentType =
  | 'CASH'
  | 'NON_CASH'
  | 'BOTH'

export type ApiPaymentMethod =
  | 'CASH'
  | 'NON_CASH'

export type ApiCourtType =
  | 'GENERAL_COURT'
  | 'REVOLUTIONARY_COURT'
  | 'CRIMINAL_COURT'
  | 'FAMILY_COURT'
  | 'JUVENILE_COURT'
  | 'LABOR_COURT'
  | 'GUILD_COURT'
  | 'CIVIL_COURT'
  | 'APPEAL_COURT'

export interface ApiCourt {
  type: ApiCourtType

  province: string
  city: string
  branch: string

  branchCode?: string

  /**
   * شماره بایگانی شعبه.
   * optional است تا تا زمان آپدیت بک‌اند قرارداد فعلی API نشکند.
   */
  archiveNumberBranch?: string
}

export interface ApiBranchHistory {
  province?: string
  city?: string

  branchNumber?: string
  archiveNumberBranch?: string

  date?: string

  isActive: boolean
}

export interface ApiCasePaymentInput {
  paymentId?: string

  method: ApiPaymentMethod

  amount: number
  description?: string

  dueDate?: string

  isPaid: boolean
}

export interface ApiCasePaymentRecord {
  paymentId: string

  method: ApiPaymentMethod

  amount: number
  description?: string

  dueDate?: string

  isPaid: boolean

  createdAt?: string
  updatedAt?: string
}

export interface ApiCaseExpenseInput {
  expenseId?: string

  title: string
  amount: number

  description?: string
  expenseDate?: string

  isPaid: boolean
}

export interface ApiCaseExpenseRecord {
  expenseId: string

  title: string
  amount: number

  description?: string
  expenseDate?: string

  isPaid: boolean

  createdAt?: string
  updatedAt?: string
}

export interface ApiExistingCaseClientInput {
  clientId: string

  assignedAmount: number

  /**
   * برای سازگاری با بک‌اند فعلی optional است.
   * در مرحله بک‌اند باید پشتیبانی آن قطعی شود.
   */
  birthDate?: string

  role?: string
  represent?: string

  payments?: ApiCasePaymentInput[]
}

export interface ApiManualCaseClientInput {
  fullName: string
  phone: string

  nationalId?: string
  birthDate?: string

  assignedAmount: number

  role?: string
  represent?: string

  payments?: ApiCasePaymentInput[]
}

export type ApiCaseClientInput =
  | ApiExistingCaseClientInput
  | ApiManualCaseClientInput

export interface ApiCaseClientRecord {
  clientId: string

  fullName: string
  phone: string

  nationalId?: string
  birthDate?: string

  assignedAmount: number

  role?: string
  represent?: string

  payments: ApiCasePaymentRecord[]
}

export interface ApiOpposingPartyInput {
  fullName: string

  phone?: string
  nationalId?: string

  birthDate?: string

  role?: string
  description?: string
}

export interface ApiOpposingPartyRecord
  extends ApiOpposingPartyInput {
  _id?: string
}

export interface ApiLawyerContactInput {
  fullName: string
  phone: string

  nationalId?: string
  birthDate?: string

  barLicenseNumber?: string
  licenseExpiresAt?: string
  licensePlaceOfIssue?: string
}

export interface ApiLawyerContactRecord
  extends ApiLawyerContactInput {
  _id?: string
}

export interface ApiRelatedPersonInput {
  fullName: string
  phone: string

  nationalId?: string
  birthDate?: string

  role?: string
  description?: string
}

export interface ApiRelatedPersonRecord
  extends ApiRelatedPersonInput {
  _id?: string
}

export interface ApiCreateCaseRequest {
  title: string

  /**
   * شماره پرونده قضایی.
   */
  caseNumber: string

  /**
   * شماره بایگانی دفتر وکیل.
   */
  archiveNumberOffice?: string

  value: number

  state?: ApiCaseState

  description?: string

  paymentType?: ApiCasePaymentType
  nonCashDescription?: string

  /**
   * ارزش تقریبی بخش غیرنقدی.
   */
  estimatedPrice?: number

  court?: ApiCourt
  branchHistory?: ApiBranchHistory[]

  clients: ApiCaseClientInput[]

  expenses?: ApiCaseExpenseInput[]

  opposingParties?: ApiOpposingPartyInput[]

  assistantLawyers?: ApiLawyerContactInput[]
  opposingLawyers?: ApiLawyerContactInput[]

  relatedPeople?: ApiRelatedPersonInput[]
}

export type ApiUpdateCaseRequest =
  Omit<
    ApiCreateCaseRequest,
    'state'
  >

export interface ApiCaseRecord {
  _id: string

  title: string

  caseNumber: string
  archiveNumberOffice?: string

  state: ApiCaseState

  value: number

  description?: string

  paymentType?: ApiCasePaymentType
  nonCashDescription?: string
  estimatedPrice?: number

  court?: ApiCourt
  branchHistory?: ApiBranchHistory[]

  clients: ApiCaseClientRecord[]

  expenses: ApiCaseExpenseRecord[]

  opposingParties: ApiOpposingPartyRecord[]

  assistantLawyers: ApiLawyerContactRecord[]
  opposingLawyers: ApiLawyerContactRecord[]

  relatedPeople: ApiRelatedPersonRecord[]

  createdAt: string
  updatedAt: string
}

export interface ApiCaseListEnvelope {
  success: boolean

  data: ApiCaseRecord[]

  pagination: ApiPagination

  message?: string
}

export interface ApiDeleteCaseResult {
  caseId: string
  deleted: true
}