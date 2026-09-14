export interface PublicLawyer {
  id: string

  firstName: string

  lastName: string

  fullName: string

  phone: string | null

  email: string | null

  specialization: string

  licenseNumber: string

  yearsOfExperience: number

  website: string | null

  address: string

  bio: string

  skills: string[]

  languages: string[]

  isFeatured: boolean

  displayOrder: number

  publishedAt: string | null
}


export interface PublicLawyerListParams {
  search?: string

  specialization?: string

  featuredOnly?: boolean

  page?: number

  limit?: number
}


export interface PublicLawyerPagination {
  page: number

  limit: number

  total: number

  totalPages: number
}


export interface PublicLawyerPage {
  items: PublicLawyer[]

  pagination: PublicLawyerPagination
}
