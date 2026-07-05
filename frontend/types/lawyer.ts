

export interface Lawyer{
    id : string
    firstName:string
    lastName : string
    phone?: string
    email?:string
    clientIds?: string[]

}
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
  level: number
}

export interface LawyerProfile {
  specialization: string
  licenseNumber: string
  yearsOfExperience: string
  phone: string
  website: string
  address: string
  bio: string
  education: Education[]  
  experience: Experience[]
  skills: Skill[]
  languages: string[]
}