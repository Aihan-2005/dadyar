import type {
  LawyerPetitionDraft,
  LawyerPetitionRecord,
} from '@/features/dashboard/petitions/types'

import type {
  ClientPetitionStatus,
  PetitionPartyRole,
  PetitionTemplateKey,
} from '@/features/client-portal/types/petition'

import type {
  ApiCreatePetitionRequest,
  ApiPetitionPartyRole,
  ApiPetitionRecord,
  ApiPetitionStatus,
  ApiPetitionTemplateKey,
} from './types'

function fromApiStatus(status: ApiPetitionStatus): ClientPetitionStatus {
  return status.toLowerCase() as ClientPetitionStatus
}

function toApiStatus(status: ClientPetitionStatus): ApiPetitionStatus {
  return status.toUpperCase() as ApiPetitionStatus
}

function fromApiTemplateKey(
  key: ApiPetitionTemplateKey
): PetitionTemplateKey {
  return key.toLowerCase() as PetitionTemplateKey
}

function toApiTemplateKey(
  key: PetitionTemplateKey
): ApiPetitionTemplateKey {
  return key.toUpperCase() as ApiPetitionTemplateKey
}

function fromApiPartyRole(role: ApiPetitionPartyRole): PetitionPartyRole {
  return role.toLowerCase() as PetitionPartyRole
}

function toApiPartyRole(role: PetitionPartyRole): ApiPetitionPartyRole {
  return role.toUpperCase() as ApiPetitionPartyRole
}

export function fromApiPetition(
  source: ApiPetitionRecord
): LawyerPetitionRecord {
  return {
    schemaVersion: 1,
    id: source._id,
    reference: source.reference,
    lawyerId: source.lawyerId,
    clientId: source.client.id,
    clientName: source.client.fullName,
    status: fromApiStatus(source.status),
    templateKey: fromApiTemplateKey(source.templateKey),
    authorityName: source.authorityName,
    branch: source.branch,
    caseNumber: source.caseNumber,
    archiveNumber: source.archiveNumber,
    authorFullName: source.authorFullName,
    authorRole: fromApiPartyRole(source.authorRole),
    opposingPartyName: source.opposingPartyName,
    subject: source.subject,
    facts: source.facts,
    legalArguments: source.legalArguments,
    evidence: source.evidence,
    request: source.request,
    closingNotes: source.closingNotes,
    version: source.version,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  }
}

export function toApiPetitionPayload(
  draft: LawyerPetitionDraft,
  status: ClientPetitionStatus
): ApiCreatePetitionRequest {
  return {
    clientId: draft.clientId,
    status: toApiStatus(status),
    templateKey: toApiTemplateKey(draft.templateKey),
    authorityName: draft.authorityName,
    branch: draft.branch,
    caseNumber: draft.caseNumber,
    archiveNumber: draft.archiveNumber,
    authorFullName: draft.authorFullName,
    authorRole: toApiPartyRole(draft.authorRole),
    opposingPartyName: draft.opposingPartyName,
    subject: draft.subject,
    facts: draft.facts,
    legalArguments: draft.legalArguments,
    evidence: draft.evidence,
    request: draft.request,
    closingNotes: draft.closingNotes,
  }
}