import type {
  ClientPetitionDraft,
  ClientPetitionStatus,
} from '@/features/client-portal/types/petition'
 
export interface LawyerPetitionDraft
  extends ClientPetitionDraft {
  // Free-text client name for now — not linked to the real client list.
  // TODO: replace with a real client picker (clientId) once wired to the
  // actual clients store/API.
  clientName: string
}
 
export interface LawyerPetitionRecord
  extends LawyerPetitionDraft {
  schemaVersion: 1
 
  id: string
  reference: string
  lawyerId: string
 
  status: ClientPetitionStatus
 
  version: number
 
  createdAt: string
  updatedAt: string
}
 