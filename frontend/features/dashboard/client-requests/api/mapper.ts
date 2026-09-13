import type {
  ClientLawyerRequestRecord,
  ClientLawyerRequestStatus,
  ClientCallbackWindow,
  ClientPreferredContactMethod,
  ClientRequestUrgency,
  LegalCaseStage,
  LegalMatterCategory,
} from '@/features/client-portal/types/communication'

import type { LawyerConsultationMode } from '@/features/client-portal/types/lawyer'

import type {
  ApiCallbackWindow,
  ApiConsultationBookingRecord,
  ApiConsultationMode,
  ApiInitialLawyerRequestRecord,
  ApiLawyerRequestRecord,
  ApiLawyerRequestStatus,
  ApiLegalCaseStage,
  ApiLegalMatterCategory,
  ApiPreferredContactMethod,
  ApiRequestStatusEvent,
  ApiRequestUrgency,
} from './types'

function fromApiStatus(
  status: ApiLawyerRequestStatus
): ClientLawyerRequestStatus {
  switch (status) {
    case 'UNDER_REVIEW':
      return 'under_review'
    case 'CONFIRMED':
      return 'confirmed'
    case 'DECLINED':
      return 'declined'
    case 'COMPLETED':
      return 'completed'
    case 'CANCELLED':
      return 'cancelled'
    case 'SUBMITTED':
    default:
      return 'submitted'
  }
}

function fromApiCategory(
  category: ApiLegalMatterCategory
): LegalMatterCategory {
  return category.toLowerCase() as LegalMatterCategory
}

function fromApiCaseStage(stage: ApiLegalCaseStage): LegalCaseStage {
  return stage.toLowerCase() as LegalCaseStage
}

function fromApiUrgency(urgency: ApiRequestUrgency): ClientRequestUrgency {
  return urgency.toLowerCase() as ClientRequestUrgency
}

function fromApiContactMethod(
  method: ApiPreferredContactMethod
): ClientPreferredContactMethod {
  return method.toLowerCase() as ClientPreferredContactMethod
}

function fromApiCallbackWindow(
  window: ApiCallbackWindow
): ClientCallbackWindow {
  return window.toLowerCase() as ClientCallbackWindow
}

function fromApiConsultationMode(
  mode: ApiConsultationMode
): LawyerConsultationMode {
  return mode.toLowerCase() as LawyerConsultationMode
}

function fromApiHistory(history: ApiRequestStatusEvent[]) {
  return history.map((event) => ({
    id: event.id,
    status: fromApiStatus(event.status),
    label: event.label,
    createdAt: event.createdAt,
  }))
}

function fromApiInitialRequest(
  source: ApiInitialLawyerRequestRecord
): ClientLawyerRequestRecord {
  return {
    id: source._id,
    reference: source.reference,
    kind: 'initial_request',
    client: source.client,
    lawyer: source.lawyer,
    category: fromApiCategory(source.category),
    caseStage: fromApiCaseStage(source.caseStage),
    opposingPartyName: source.opposingPartyName,
    subject: source.subject,
    description: source.description,
    status: fromApiStatus(source.status),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    history: fromApiHistory(source.history),
    preferredContactMethod: fromApiContactMethod(
      source.preferredContactMethod
    ),
    urgency: fromApiUrgency(source.urgency),
    callbackWindow: source.callbackWindow
      ? fromApiCallbackWindow(source.callbackWindow)
      : undefined,
  }
}

function fromApiConsultationBooking(
  source: ApiConsultationBookingRecord
): ClientLawyerRequestRecord {
  return {
    id: source._id,
    reference: source.reference,
    kind: 'consultation_booking',
    client: source.client,
    lawyer: source.lawyer,
    category: fromApiCategory(source.category),
    caseStage: fromApiCaseStage(source.caseStage),
    opposingPartyName: source.opposingPartyName,
    subject: source.subject,
    description: source.description,
    status: fromApiStatus(source.status),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    history: fromApiHistory(source.history),
    offerId: source.offerId,
    consultationMode: fromApiConsultationMode(source.consultationMode),
    consultationTitle: source.consultationTitle,
    durationMinutes: source.durationMinutes,
    priceToman: source.priceToman,
    date: source.date,
    dateLabel: source.dateLabel,
    time: source.time,
  }
}

export function fromApiLawyerRequest(
  source: ApiLawyerRequestRecord
): ClientLawyerRequestRecord {
  if (source.kind === 'CONSULTATION_BOOKING') {
    return fromApiConsultationBooking(source)
  }

  return fromApiInitialRequest(source)
}

export function toApiStatus(
  status: 'under_review' | 'confirmed' | 'declined' | 'completed'
): ApiLawyerRequestStatus {
  switch (status) {
    case 'under_review':
      return 'UNDER_REVIEW'
    case 'confirmed':
      return 'CONFIRMED'
    case 'declined':
      return 'DECLINED'
    case 'completed':
      return 'COMPLETED'
  }
}