export type ClientLawyerInquiryStatus =
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CLOSED'


export interface ClientLawyerInquiryLawyer {
  id: string

  firstName: string

  lastName: string

  fullName: string

  specialization: string
}


export interface ClientLawyerInquiryClient {
  id: string

  fullName: string

  phone:
    string | null

  email:
    string | null
}


interface ClientLawyerInquiryBase {
  id: string

 
  
  lawyerClientId:
    string | null

  subject: string

  description: string

  status:
    ClientLawyerInquiryStatus

  lawyerResponse: string

  respondedAt:
    string | null

  cancelledAt:
    string | null

  closedAt:
    string | null

  createdAt: string

  updatedAt: string
}


export interface ClientLawyerInquiry
  extends ClientLawyerInquiryBase {

  lawyer:
    ClientLawyerInquiryLawyer
}


export interface LawyerClientInquiry
  extends ClientLawyerInquiryBase {

  client:
    ClientLawyerInquiryClient
}


export interface CreateClientLawyerInquiryInput {
  lawyerId: string

  subject: string

  description: string
}


export interface LawyerInquiryDecisionInput {
  status:
    | 'IN_REVIEW'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'CLOSED'

  response?: string
}


export interface ClientLawyerInquiryListParams {
  status?:
    ClientLawyerInquiryStatus

  search?: string

  page?: number

  limit?: number
}


export interface ClientLawyerInquiryPagination {
  page: number

  limit: number

  total: number

  totalPages: number
}


export interface ClientLawyerInquiryPage<T> {
  items: T[]

  pagination:
    ClientLawyerInquiryPagination
}
