export type LawyerConsultationMode =
  | 'in_person'
  | 'phone'
  | 'online'


export interface ClientPortalLawyerEducation {
  id:
    string

  degree:
    string

  field:
    string

  university:
    string

  year:
    string
}


export interface ClientPortalLawyerExperience {
  id:
    string

  title:
    string

  company:
    string

  startYear:
    string

  endYear:
    string

  description:
    string
}


export interface ClientPortalLawyer {
  id:
    string

  fullName:
    string

  title:
    string

  city:
    string

  province:
    string

  specialties:
    string[]

  yearsExperience:
    number

  rating:
    number

  reviewCount:
    number

  barAssociation:
    string

  licenseNumber:
    string

  officeAddress:
    string

  phone:
    string

  website:
    string

  bio:
    string

  education:
    ClientPortalLawyerEducation[]

  experience:
    ClientPortalLawyerExperience[]

  consultationModes:
    LawyerConsultationMode[]

  acceptsNewClients:
    boolean

  verified:
    boolean

  responseTimeLabel:
    string

  languages:
    string[]

  avatarInitials:
    string
}


export type LawyerSortOption =
  | 'recommended'
  | 'experience'
  | 'rating'


export interface LawyerDirectoryFilters {
  search:
    string

  city:
    string

  specialty:
    string

  consultationMode:
    | 'all'
    | LawyerConsultationMode

  acceptsNewClientsOnly:
    boolean

  sort:
    LawyerSortOption
}