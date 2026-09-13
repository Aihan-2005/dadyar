export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

export type ApiPetitionStatus = 'DRAFT' | 'READY'

export type ApiPetitionTemplateKey =
  | 'DEFENSE'
  | 'SUPPLEMENTARY'
  | 'RESPONSE'
  | 'EXPERT_OBJECTION'
  | 'PROCEDURAL_REQUEST'
  | 'CUSTOM'

export type ApiPetitionPartyRole =
  | 'PLAINTIFF'
  | 'DEFENDANT'
  | 'APPELLANT'
  | 'RESPONDENT'
  | 'APPLICANT'
  | 'COMPLAINANT'
  | 'ACCUSED'
  | 'OTHER'

export interface ApiPetitionClientSnapshot {
  id: string
  fullName: string
  phone: string
}

export interface ApiPetitionRecord {
  _id: string
  reference: string
  lawyerId: string
  client: ApiPetitionClientSnapshot
  status: ApiPetitionStatus
  templateKey: ApiPetitionTemplateKey
  authorityName: string
  branch: string
  caseNumber?: string
  archiveNumber?: string
  authorFullName: string
  authorRole: ApiPetitionPartyRole
  opposingPartyName?: string
  subject: string
  facts: string
  legalArguments?: string
  evidence: string[]
  request: string
  closingNotes?: string
  version: number
  createdAt: string
  updatedAt: string
}

export interface ApiCreatePetitionRequest {
  clientId: string
  status: ApiPetitionStatus
  templateKey: ApiPetitionTemplateKey
  authorityName: string
  branch: string
  caseNumber?: string
  archiveNumber?: string
  authorFullName: string
  authorRole: ApiPetitionPartyRole
  opposingPartyName?: string
  subject: string
  facts: string
  legalArguments?: string
  evidence: string[]
  request: string
  closingNotes?: string
}

export type ApiUpdatePetitionRequest = ApiCreatePetitionRequest