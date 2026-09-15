import type {
  ConsultationType,
} from '@/types/consultation-booking'


export interface LawyerAvailability {
  id: string
  lawyerId: string
  startsAt: string
  endsAt: string
  consultationTypes: ConsultationType[]
  note: string
  isActive: boolean
  isReserved: boolean
  createdAt: string
  updatedAt: string
}


export interface CreateLawyerAvailabilityInput {
  startsAt: string
  endsAt: string
  consultationTypes: ConsultationType[]
  note?: string
  isActive?: boolean
}


export interface UpdateLawyerAvailabilityInput {
  startsAt?: string
  endsAt?: string
  consultationTypes?: ConsultationType[]
  note?: string
  isActive?: boolean
}


export interface LawyerAvailabilityListParams {
  from?: string
  to?: string
  type?: ConsultationType
  includeInactive?: boolean
}