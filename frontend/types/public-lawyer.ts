export interface PublicLawyer {
  id: string

  firstName: string

  lastName: string

  fullName: string

  phone?: string

  email?: string

  specialization: string

  licenseNumber: string

  yearsOfExperience: number

  address?: string

  website?: string

  bio?: string

  skills: string[]

  languages: string[]

  isFeatured: boolean

  displayOrder: number
}

export interface PublicLawyerListParams {
  search?: string

  specialization?: string

  featuredOnly?: boolean
}