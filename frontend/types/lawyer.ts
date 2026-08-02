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