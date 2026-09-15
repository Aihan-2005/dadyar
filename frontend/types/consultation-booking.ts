export type ConsultationType =
  | 'ONLINE'
  | 'PHONE'
  | 'IN_PERSON'


export type ConsultationBookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED'


export interface ConsultationBookingClient {
  id: string

  fullName: string

  phone:
    string | null

  email:
    string | null


    
  lawyerClientId:
    string | null
}


export interface ConsultationBooking {
  id: string

  clientId: string

  lawyerId: string

  availabilityId:
    string | null

  type:
    ConsultationType

  startsAt:
    string | null

  endsAt:
    string | null

  date: string

  time: string

  description: string

  status:
    ConsultationBookingStatus

  createdAt:
    string | null

  updatedAt:
    string | null
}


export interface LawyerConsultationBooking
  extends ConsultationBooking {

  client:
    ConsultationBookingClient
}


export interface CreateConsultationBookingInput {
  lawyerId: string

  availabilityId: string

  type:
    ConsultationType

  description?: string
}


export type LawyerBookingDecisionStatus =
  | 'CONFIRMED'
  | 'REJECTED'
  | 'COMPLETED'
  