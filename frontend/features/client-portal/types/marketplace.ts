import type {
  LawyerConsultationMode,
} from '@/features/client-portal/types/lawyer'


export interface ConsultationDurationOption {
  minutes:
    number

  priceToman:
    number
}

export interface LawyerConsultationOffer {
  id:
    string

  mode:
    LawyerConsultationMode

  title:
    string

  description:
    string

  durations:
    ConsultationDurationOption[]
}



export interface LawyerAvailabilityDay {
  value:
    string

  label:
    string

  slots:
    string[]
}


export interface LawyerReview {
  id:
    string

  lawyerId:
    string

  authorName:
    string

  rating:
    number

  comment:
    string

  createdAtLabel:
    string

  verifiedClient:
    boolean
}



export interface LawyerMarketplaceProfile {
  lawyerId:
    string

  consultationOffers:
    LawyerConsultationOffer[]

  availability:
    LawyerAvailabilityDay[]

  reviews:
    LawyerReview[]
}




export interface ConsultationBookingDraft {
  offerId:
    string

  durationMinutes:
    number

  date:
    string

  time:
    string

  subject:
    string

  description:
    string
}