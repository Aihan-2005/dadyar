export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

export type ApiLawyerRequestKind = 'INITIAL_REQUEST' | 'CONSULTATION_BOOKING'

export type ApiLawyerRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'COMPLETED'
  | 'CANCELLED'

export type ApiLegalMatterCategory =
  | 'FAMILY'
  | 'CRIMINAL'
  | 'PROPERTY'
  | 'CONTRACTS'
  | 'COMPANY'
  | 'LABOR'
  | 'INHERITANCE'
  | 'FINANCIAL'
  | 'OTHER'

export type ApiLegalCaseStage =
  | 'PRE_FILING'
  | 'FILED'
  | 'HEARING'
  | 'APPEAL'
  | 'ENFORCEMENT'
  | 'OTHER'

export type ApiRequestUrgency = 'NORMAL' | 'SOON' | 'URGENT'

export type ApiPreferredContactMethod = 'WRITTEN_RESPONSE' | 'PHONE_CALLBACK'

export type ApiCallbackWindow = 'MORNING' | 'AFTERNOON' | 'EVENING'

export type ApiConsultationMode = 'IN_PERSON' | 'PHONE' | 'ONLINE'

export interface ApiClientSnapshot {
  id: string
  fullName: string
  phone: string
}

export interface ApiLawyerSnapshot {
  id: string
  fullName: string
  title: string
  city: string
  province: string
  phone: string
  officeAddress: string
  licenseNumber: string
}

export interface ApiRequestStatusEvent {
  id: string
  status: ApiLawyerRequestStatus
  label: string
  createdAt: string
}

interface ApiLawyerRequestBase {
  _id: string
  reference: string
  kind: ApiLawyerRequestKind
  client: ApiClientSnapshot
  lawyer: ApiLawyerSnapshot
  category: ApiLegalMatterCategory
  caseStage: ApiLegalCaseStage
  opposingPartyName?: string
  subject: string
  description: string
  status: ApiLawyerRequestStatus
  createdAt: string
  updatedAt: string
  history: ApiRequestStatusEvent[]
}

export interface ApiInitialLawyerRequestRecord extends ApiLawyerRequestBase {
  kind: 'INITIAL_REQUEST'
  preferredContactMethod: ApiPreferredContactMethod
  urgency: ApiRequestUrgency
  callbackWindow?: ApiCallbackWindow
}

export interface ApiConsultationBookingRecord extends ApiLawyerRequestBase {
  kind: 'CONSULTATION_BOOKING'
  offerId: string
  consultationMode: ApiConsultationMode
  consultationTitle: string
  durationMinutes: number
  priceToman: number
  date: string
  dateLabel: string
  time: string
}

export type ApiLawyerRequestRecord =
  | ApiInitialLawyerRequestRecord
  | ApiConsultationBookingRecord

export type UiLawyerRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'confirmed'
  | 'declined'
  | 'completed'
  | 'cancelled'