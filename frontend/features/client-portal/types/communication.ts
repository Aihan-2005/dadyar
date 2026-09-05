import type {
  LawyerConsultationMode,
} from '@/features/client-portal/types/lawyer'




export type LegalMatterCategory =
  | 'family'
  | 'criminal'
  | 'property'
  | 'contracts'
  | 'company'
  | 'labor'
  | 'inheritance'
  | 'financial'
  | 'other'


  

export type LegalCaseStage =
  | 'pre_filing'
  | 'filed'
  | 'hearing'
  | 'appeal'
  | 'enforcement'
  | 'other'


  

export type ClientRequestUrgency =
  | 'normal'
  | 'soon'
  | 'urgent'


  

export type ClientPreferredContactMethod =
  | 'written_response'
  | 'phone_callback'

export type ClientCallbackWindow =
  | 'morning'
  | 'afternoon'
  | 'evening'


  

export type ClientLawyerRequestKind =
  | 'initial_request'
  | 'consultation_booking'

export type ClientLawyerRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

  

export type ClientRequestMessageAuthor =
  | 'client'
  | 'lawyer'
  | 'system'

export interface ClientRequestMessage {
  id: string

  authorType:
    ClientRequestMessageAuthor

  authorName:
    string

  body:
    string

  createdAt:
    string
}




export interface ClientRequestStatusEvent {
  id: string

  status:
    ClientLawyerRequestStatus

  label:
    string

  createdAt:
    string
}



export interface ClientRequestAccountSnapshot {
  id: string

  fullName: string

  phone: string
}

export interface ClientRequestLawyerSnapshot {
  id: string

  fullName: string

  title: string

  city: string

  province: string

  phone: string

  officeAddress: string

  licenseNumber: string
}



interface ClientLawyerRequestBase {
  id: string

  reference: string

  kind:
    ClientLawyerRequestKind

  client:
    ClientRequestAccountSnapshot

  lawyer:
    ClientRequestLawyerSnapshot

  category:
    LegalMatterCategory

  caseStage:
    LegalCaseStage

  opposingPartyName?:
    string

  subject:
    string

  description:
    string

  status:
    ClientLawyerRequestStatus

  createdAt:
    string

  updatedAt:
    string

  history:
    ClientRequestStatusEvent[]

  messages:
    ClientRequestMessage[]
}




export interface InitialLawyerRequestRecord
  extends ClientLawyerRequestBase {
  kind:
    'initial_request'

  preferredContactMethod:
    ClientPreferredContactMethod

  urgency:
    ClientRequestUrgency

  callbackWindow?:
    ClientCallbackWindow
}



export interface ConsultationBookingRecord
  extends ClientLawyerRequestBase {
  kind:
    'consultation_booking'

  offerId:
    string

  consultationMode:
    LawyerConsultationMode

  consultationTitle:
    string

  durationMinutes:
    number

  priceToman:
    number

  date:
    string

  dateLabel:
    string

  time:
    string
}



export type ClientLawyerRequestRecord =
  | InitialLawyerRequestRecord
  | ConsultationBookingRecord


  

export interface CreateInitialLawyerRequestInput {
  category:
    LegalMatterCategory

  caseStage:
    LegalCaseStage

  opposingPartyName?:
    string

  preferredContactMethod:
    ClientPreferredContactMethod

  urgency:
    ClientRequestUrgency

  callbackWindow?:
    ClientCallbackWindow

  subject:
    string

  description:
    string
}

export interface CreateConsultationBookingInput {
  category:
    LegalMatterCategory

  caseStage:
    LegalCaseStage

  opposingPartyName?:
    string

  offerId:
    string

  consultationMode:
    LawyerConsultationMode

  consultationTitle:
    string

  durationMinutes:
    number

  priceToman:
    number

  date:
    string

  dateLabel:
    string

  time:
    string

  subject:
    string

  description:
    string
}