
export type LawyerConsultationMode =
  | 'in_person'
  | 'phone'
  | 'online'



export interface ClientPortalLawyer {
  id: string

  fullName: string

  title: string

  city: string

  province: string

  specialties: string[]

  yearsExperience: number

  rating: number

  reviewCount: number

  barAssociation: string

  licenseNumber: string

  officeAddress: string

  phone: string

  bio: string

  consultationModes: LawyerConsultationMode[]

  acceptsNewClients: boolean

  verified: boolean

  responseTimeLabel: string

  languages: string[]

  avatarInitials: string
}


export type LawyerSortOption =
  | 'recommended'
  | 'experience'
  | 'rating'

export interface LawyerDirectoryFilters {
  search: string

  city: string

  specialty: string

  consultationMode:
    | 'all'
    | LawyerConsultationMode

  acceptsNewClientsOnly: boolean

  sort: LawyerSortOption
}