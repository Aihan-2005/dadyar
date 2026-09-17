export type OnlineLegalContractTemplateKey =
  | 'legal_consultation'
  | 'case_legal_services'
  | 'document_services'

export type OnlineContractPaymentMode =
  | 'full'
  | 'staged'
  | 'installments'

export type OnlineContractStatus =
  | 'waiting_lawyer_review'
  | 'waiting_client_approval'
  | 'waiting_lawyer_signature'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export interface OnlineContractTemplateSnapshot {
  key: OnlineLegalContractTemplateKey
  title: string
  shortDescription: string
  lawyerObligations: string[]
  clientObligations: string[]
  standardTerms: string[]
}

export interface OnlineLegalContractTemplate
  extends OnlineContractTemplateSnapshot {
  defaultSubject: string
  defaultScope: string
}

export interface OnlineContractClientParty {
  fullName: string
  phone: string
  nationalId: string
  address?: string
}

export interface OnlineContractLawyerParty {
  id: string
  fullName: string
  specialization: string
  licenseNumber: string
  address: string
}

export interface OnlineContractDraft {
  templateKey: OnlineLegalContractTemplateKey
  client: OnlineContractClientParty
  lawyer: OnlineContractLawyerParty
  subject: string
  scope: string
  feeToman: number
  paymentMode: OnlineContractPaymentMode
  paymentDetails: string
  startDate: string
  servicePeriod: string
  additionalTerms?: string
}

export interface CreateOnlineContractInput {
  lawyerId: string
  templateKey: OnlineLegalContractTemplateKey
  nationalId: string
  address?: string
  subject: string
  scope: string
  feeToman: number
  paymentMode: OnlineContractPaymentMode
  paymentDetails: string
  startDate: string
  servicePeriod: string
  additionalTerms?: string
}

export type OnlineContractVersionAuthor =
  | 'client'
  | 'lawyer'

export interface OnlineContractVersion {
  version: number
  draft: OnlineContractDraft
  createdBy: OnlineContractVersionAuthor
  createdAt: string
  summary: string
}

export type OnlineContractActor =
  | 'client'
  | 'lawyer'
  | 'system'

export type OnlineContractAuditAction =
  | 'created_by_client'
  | 'reviewed_by_lawyer'
  | 'updated_by_lawyer'
  | 'sent_to_client'
  | 'approved_by_client'
  | 'changes_requested_by_client'
  | 'signed_by_lawyer'
  | 'rejected_by_lawyer'
  | 'cancelled'

export interface OnlineContractAuditEvent {
  id: string
  action: OnlineContractAuditAction
  actor: OnlineContractActor
  label: string
  createdAt: string
}

export interface OnlineContractRecord {
  id: string
  reference: string
  version: number
  status: OnlineContractStatus
  templateSnapshot: OnlineContractTemplateSnapshot
  draft: OnlineContractDraft
  versions: OnlineContractVersion[]
  createdAt: string
  updatedAt: string
  completedAt?: string
  rejectionReason?: string
  clientFeedback?: string
  auditTrail: OnlineContractAuditEvent[]
}

export interface LawyerContractReviewInput {
  subject: string
  scope: string
  feeToman: number
  paymentMode: OnlineContractPaymentMode
  paymentDetails: string
  servicePeriod: string
  additionalTerms?: string
}

export interface OnlineContractListParams {
  search?: string
  status?: OnlineContractStatus
  page?: number
  limit?: number
}

export interface OnlineContractPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface OnlineContractPage {
  items: OnlineContractRecord[]
  pagination: OnlineContractPagination
}