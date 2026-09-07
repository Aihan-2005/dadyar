export type PetitionTemplateKey =
  | 'defense'
  | 'supplementary'
  | 'response'
  | 'expert_objection'
  | 'procedural_request'
  | 'custom'

export type PetitionPartyRole =
  | 'plaintiff'
  | 'defendant'
  | 'appellant'
  | 'respondent'
  | 'applicant'
  | 'complainant'
  | 'accused'
  | 'other'

export type ClientPetitionStatus =
  | 'draft'
  | 'ready'

export interface ClientPetitionDraft {
  templateKey:
    PetitionTemplateKey

  authorityName:
    string

  branch:
    string

  caseNumber?:
    string

  archiveNumber?:
    string

  authorFullName:
    string

  authorRole:
    PetitionPartyRole

  opposingPartyName?:
    string

  subject:
    string

  facts:
    string

  legalArguments?:
    string

  evidence:
    string[]

  request:
    string

  closingNotes?:
    string
}

export interface ClientPetitionRecord
  extends ClientPetitionDraft {
  schemaVersion:
    1

  id:
    string

  reference:
    string

  accountId:
    string

  status:
    ClientPetitionStatus

  version:
    number

  createdAt:
    string

  updatedAt:
    string
}