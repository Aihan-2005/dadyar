export interface Lawyer {
  id: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
  clientIds?: string[]
}


export type SkillLevel =
  | 1
  | 2
  | 3
  | 4
  | 5


export interface Education {
  id: string
  degree: string
  field: string
  university: string
  year: string
}


export interface Experience {
  id: string
  title: string
  company: string
  startYear: string
  endYear: string
  description: string
}


export interface Skill {
  id: string
  name: string
  level: SkillLevel
}


export interface LawyerProfile {
  specialization: string
  licenseNumber: string
  yearsOfExperience: number
  phone: string
  website: string
  address: string
  bio: string
  education: Education[]
  experience: Experience[]
  skills: Skill[]
  languages: string[]
}


export interface LawyerProfileResponseData {
  profile: LawyerProfile
}


export type LawyerDirectoryBlockedReason =
  | 'LAWYER_SUSPENDED'
  | 'LAWYER_REJECTED'
  | 'ACCOUNT_NOT_ACTIVE'


export interface LawyerDirectoryMissingField {
  key: string
  label: string
}


export interface LawyerDirectoryPublicationState {
  isVisible: boolean

  isFeatured: boolean

  displayOrder:
    number | null

  publishedAt:
    string | null

  profileComplete:
    boolean

  canPublish:
    boolean

  missingFields:
    LawyerDirectoryMissingField[]

  blockedReason:
    LawyerDirectoryBlockedReason | null
}


export const EMPTY_LAWYER_PROFILE:
  LawyerProfile = {
  specialization: '',
  licenseNumber: '',
  yearsOfExperience: 0,
  phone: '',
  website: '',
  address: '',
  bio: '',
  education: [],
  experience: [],
  skills: [],
  languages: [],
}