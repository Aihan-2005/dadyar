

export interface ApiClientRecord {
  _id: string

  fullName: string

  phone: string

  nationalId?: string



  homeNumber?: string

  birthday?: string

  homeAddress?: string

  represent?: string

  description?: string

  createdAt: string

  updatedAt: string
}




export interface ApiCreateClientRequest {
  fullName: string

  phone: string

  nationalId?: string

  
  homeNumber?: string

  birthday?: string

  homeAddress?: string

  represent?: string

  description?: string

 

  personalPassword?: string
}





export interface ApiUpdateClientRequest {
  fullName?: string

  phone?: string

  nationalId?:
    | string
    | null




  homeNumber?:
    | string
    | null

  birthday?:
    | string
    | null

  homeAddress?:
    | string
    | null

  represent?:
    | string
    | null

  description?:
    | string
    | null

  


  personalPassword?: string
}



export interface ApiEnvelope<T> {
  success: boolean

  data: T

  message?: string
}



export interface ApiPagination {
  page: number

  limit: number

  total: number

  totalPages: number
}



export interface ApiClientListEnvelope {
  success: boolean

  data:
    ApiClientRecord[]

  pagination:
    ApiPagination

  message?: string
}