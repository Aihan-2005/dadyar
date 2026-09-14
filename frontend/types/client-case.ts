export interface ClientCaseLawyer {
  id: string

  firstName: string

  lastName: string

  specialization: string
}


export interface ClientCaseAssignment {
  lawyerClientId: string

  assignedAmount: number

  birthDate?: string

  role?: string

  represent?: string
}


export interface ClientCaseBranchHistoryItem {
  [key: string]: unknown
}


export interface ClientCase {
  caseId: string

  lawyer: ClientCaseLawyer

  title: string

  caseNumber: string

  archiveNumberOffice?: string

  state: string

  description?: string

  court?: string

  branchHistory:
    ClientCaseBranchHistoryItem[]

  paymentType: string

  nonCashDescription?: string

  assignment:
    ClientCaseAssignment

  createdAt: string

  updatedAt: string
}


export interface ClientCasePayment {
  [key: string]: unknown
}


export interface ClientCaseListParams {
  page?: number

  limit?: number

  search?: string

  state?: string
}


export interface ClientCasePagination {
  page: number

  limit: number

  total: number

  totalPages: number
}


export interface ClientCasePage {
  items: ClientCase[]

  pagination:
    ClientCasePagination
}
