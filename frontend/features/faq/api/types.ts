export interface ApiFAQRecord {
  _id: string
  question: string
  answer: string
  createdAt?: string
  updatedAt?: string
}

export interface ApiFAQListEnvelope {
  success: boolean
  data: ApiFAQRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}