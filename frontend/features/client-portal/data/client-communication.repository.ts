import type {
  ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'

import type {
  ClientLawyerRequestRecord,
  ClientLawyerRequestStatus,
  ClientRequestMessage,
  ClientRequestStatusEvent,
  ConsultationBookingRecord,
  CreateConsultationBookingInput,
  CreateInitialLawyerRequestInput,
  InitialLawyerRequestRecord,
} from '@/features/client-portal/types/communication'

const STORAGE_KEY =
  'dadyar:client-lawyer-requests:v2'

const CHANGE_EVENT =
  'dadyar:client-lawyer-requests:changed'

function isBrowser(): boolean {
  return (
    typeof window !==
    'undefined'
  )
}

function createId(
  prefix:
    string
): string {
  if (
    typeof crypto !==
      'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

function createReference(): string {
  const timestamp =
    Date.now()
      .toString(36)
      .toUpperCase()

  const random =
    Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()

  return `DY-${timestamp}-${random}`
}

function isRequestRecord(
  value:
    unknown
): value is ClientLawyerRequestRecord {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return false
  }

  const candidate =
    value as Partial<ClientLawyerRequestRecord>

  return (
    typeof candidate.id ===
      'string' &&
    typeof candidate.reference ===
      'string' &&
    typeof candidate.kind ===
      'string' &&
    typeof candidate.status ===
      'string' &&
    typeof candidate.createdAt ===
      'string' &&
    typeof candidate.updatedAt ===
      'string' &&
    Boolean(
      candidate.client
    ) &&
    Boolean(
      candidate.lawyer
    )
  )
}

function readRecords():
  ClientLawyerRequestRecord[] {
  if (!isBrowser()) {
    return []
  }

  const raw =
    window.localStorage.getItem(
      STORAGE_KEY
    )

  if (!raw) {
    return []
  }

  try {
    const parsed:
      unknown =
      JSON.parse(
        raw
      )

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return []
    }

    return parsed.filter(
      isRequestRecord
    )
  } catch {
    return []
  }
}

function notifyChanged(): void {
  if (!isBrowser()) {
    return
  }

  window.dispatchEvent(
    new Event(
      CHANGE_EVENT
    )
  )
}

function writeRecords(
  records:
    ClientLawyerRequestRecord[]
): void {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      records
    )
  )

  notifyChanged()
}

function sortRecords(
  records:
    ClientLawyerRequestRecord[]
): ClientLawyerRequestRecord[] {
  return [
    ...records,
  ].sort(
    (
      first,
      second
    ) =>
      new Date(
        second.updatedAt
      ).getTime() -
      new Date(
        first.updatedAt
      ).getTime()
  )
}

function createStatusEvent(
  status:
    ClientLawyerRequestStatus,

  label:
    string
): ClientRequestStatusEvent {
  return {
    id:
      createId(
        'status'
      ),

    status,

    label,

    createdAt:
      new Date().toISOString(),
  }
}

function createSystemMessage(
  body:
    string
): ClientRequestMessage {
  return {
    id:
      createId(
        'message'
      ),

    authorType:
      'system',

    authorName:
      'دادیار',

    body,

    createdAt:
      new Date().toISOString(),
  }
}

function createClientSnapshot(
  account:
    ClientPortalAccount
) {
  return {
    id:
      account.id,

    fullName:
      account.fullName,

    phone:
      account.phone,
  }
}

function createLawyerSnapshot(
  lawyer:
    ClientPortalLawyer
) {
  return {
    id:
      lawyer.id,

    fullName:
      lawyer.fullName,

    title:
      lawyer.title,

    city:
      lawyer.city,

    province:
      lawyer.province,

    phone:
      lawyer.phone,

    officeAddress:
      lawyer.officeAddress,

    licenseNumber:
      lawyer.licenseNumber,
  }
}

function normalizeOptionalText(
  value:
    string | undefined
): string | undefined {
  const normalized =
    value?.trim()

  return normalized
    ? normalized
    : undefined
}




export function getClientLawyerRequests(
  clientId:
    string
): ClientLawyerRequestRecord[] {
  return sortRecords(
    readRecords().filter(
      (
        record
      ) =>
        record.client.id ===
        clientId
    )
  )
}

export function getClientLawyerRequestById(
  requestId:
    string,

  clientId:
    string
): ClientLawyerRequestRecord | null {
  return (
    readRecords().find(
      (
        record
      ) =>
        record.id ===
          requestId &&
        record.client.id ===
          clientId
    ) ??
    null
  )
}



export function createInitialLawyerRequest(
  account:
    ClientPortalAccount,

  lawyer:
    ClientPortalLawyer,

  input:
    CreateInitialLawyerRequestInput
): InitialLawyerRequestRecord {
  if (
    !lawyer.acceptsNewClients
  ) {
    throw new Error(
      'این وکیل در حال حاضر پذیرش موکل جدید ندارد.'
    )
  }

  const subject =
    input.subject.trim()

  const description =
    input.description.trim()

  if (
    subject.length <
    5
  ) {
    throw new Error(
      'موضوع درخواست را کامل‌تر وارد کنید.'
    )
  }

  if (
    description.length <
    20
  ) {
    throw new Error(
      'شرح درخواست باید حداقل ۲۰ کاراکتر باشد.'
    )
  }

  if (
    description.length >
    1500
  ) {
    throw new Error(
      'شرح درخواست بیش از حد طولانی است.'
    )
  }

  if (
    input.preferredContactMethod ===
      'phone_callback' &&
    !input.callbackWindow
  ) {
    throw new Error(
      'زمان مناسب برای تماس را مشخص کنید.'
    )
  }

  const now =
    new Date().toISOString()

  const record:
    InitialLawyerRequestRecord = {
    id:
      createId(
        'request'
      ),

    reference:
      createReference(),

    kind:
      'initial_request',

    client:
      createClientSnapshot(
        account
      ),

    lawyer:
      createLawyerSnapshot(
        lawyer
      ),

    category:
      input.category,

    caseStage:
      input.caseStage,

    opposingPartyName:
      normalizeOptionalText(
        input.opposingPartyName
      ),

    subject,

    description,

    preferredContactMethod:
      input.preferredContactMethod,

    urgency:
      input.urgency,

    callbackWindow:
      input.preferredContactMethod ===
      'phone_callback'
        ? input.callbackWindow
        : undefined,

    status:
      'submitted',

    createdAt:
      now,

    updatedAt:
      now,

    history: [
      createStatusEvent(
        'submitted',
        'درخواست برای بررسی وکیل ارسال شد.'
      ),
    ],

    messages: [
      createSystemMessage(
        'درخواست شما ثبت شد و در انتظار بررسی وکیل است.'
      ),
    ],
  }

  writeRecords([
    record,
    ...readRecords(),
  ])

  return record
}


export function isConsultationSlotReserved(
  lawyerId:
    string,

  date:
    string,

  time:
    string
): boolean {
  return readRecords().some(
    (
      record
    ) =>
      record.kind ===
        'consultation_booking' &&
      record.lawyer.id ===
        lawyerId &&
      record.date ===
        date &&
      record.time ===
        time &&
      record.status !==
        'cancelled'
  )
}




export function createConsultationBooking(
  account:
    ClientPortalAccount,

  lawyer:
    ClientPortalLawyer,

  input:
    CreateConsultationBookingInput
): ConsultationBookingRecord {
  if (
    !lawyer.acceptsNewClients
  ) {
    throw new Error(
      'این وکیل در حال حاضر پذیرش رزرو جدید ندارد.'
    )
  }

  const subject =
    input.subject.trim()

  const description =
    input.description.trim()

  if (
    subject.length <
    5
  ) {
    throw new Error(
      'موضوع مشاوره را کامل‌تر وارد کنید.'
    )
  }

  if (
    description.length >
    1000
  ) {
    throw new Error(
      'توضیحات جلسه بیش از حد طولانی است.'
    )
  }

  if (
    input.durationMinutes <=
      0 ||
    input.priceToman <=
      0
  ) {
    throw new Error(
      'مدت یا مبلغ مشاوره معتبر نیست.'
    )
  }

  if (
    !input.date ||
    !input.time
  ) {
    throw new Error(
      'زمان جلسه کامل نیست.'
    )
  }

  if (
    isConsultationSlotReserved(
      lawyer.id,
      input.date,
      input.time
    )
  ) {
    throw new Error(
      'این ساعت دیگر در دسترس نیست. زمان دیگری انتخاب کنید.'
    )
  }

  const now =
    new Date().toISOString()

  const record:
    ConsultationBookingRecord = {
    id:
      createId(
        'booking'
      ),

    reference:
      createReference(),

    kind:
      'consultation_booking',

    client:
      createClientSnapshot(
        account
      ),

    lawyer:
      createLawyerSnapshot(
        lawyer
      ),

    category:
      input.category,

    caseStage:
      input.caseStage,

    opposingPartyName:
      normalizeOptionalText(
        input.opposingPartyName
      ),

    subject,

    description,

    offerId:
      input.offerId,

    consultationMode:
      input.consultationMode,

    consultationTitle:
      input.consultationTitle,

    durationMinutes:
      input.durationMinutes,

    priceToman:
      input.priceToman,

    date:
      input.date,

    dateLabel:
      input.dateLabel,

    time:
      input.time,

    status:
      'submitted',

    createdAt:
      now,

    updatedAt:
      now,

    history: [
      createStatusEvent(
        'submitted',
        'درخواست رزرو جلسه برای وکیل ارسال شد.'
      ),
    ],

    messages: [
      createSystemMessage(
        'درخواست رزرو ثبت شد و پس از بررسی وکیل وضعیت جلسه مشخص می‌شود.'
      ),
    ],
  }

  writeRecords([
    record,
    ...readRecords(),
  ])

  return record
}




export function appendClientRequestMessage(
  requestId:
    string,

  account:
    ClientPortalAccount,

  body:
    string
): ClientLawyerRequestRecord {
  const normalizedBody =
    body.trim()

  if (
    normalizedBody.length <
    2
  ) {
    throw new Error(
      'متن پیام را وارد کنید.'
    )
  }

  if (
    normalizedBody.length >
    1200
  ) {
    throw new Error(
      'پیام بیش از حد طولانی است.'
    )
  }

  const records =
    readRecords()

  const index =
    records.findIndex(
      (
        record
      ) =>
        record.id ===
          requestId &&
        record.client.id ===
          account.id
    )

  if (
    index ===
    -1
  ) {
    throw new Error(
      'درخواست پیدا نشد.'
    )
  }

  const current =
    records[
      index
    ]

  if (
    current.status ===
      'cancelled'
  ) {
    throw new Error(
      'امکان ارسال پیام برای درخواست لغوشده وجود ندارد.'
    )
  }

  const now =
    new Date().toISOString()

  const message:
    ClientRequestMessage = {
    id:
      createId(
        'message'
      ),

    authorType:
      'client',

    authorName:
      account.fullName,

    body:
      normalizedBody,

    createdAt:
      now,
  }

  const updated:
    ClientLawyerRequestRecord = {
    ...current,

    updatedAt:
      now,

    messages: [
      ...current.messages,
      message,
    ],
  }

  records[
    index
  ] =
    updated

  writeRecords(
    records
  )

  return updated
}



export function cancelClientLawyerRequest(
  requestId:
    string,

  clientId:
    string
): ClientLawyerRequestRecord {
  const records =
    readRecords()

  const index =
    records.findIndex(
      (
        record
      ) =>
        record.id ===
          requestId &&
        record.client.id ===
          clientId
    )

  if (
    index ===
    -1
  ) {
    throw new Error(
      'درخواست پیدا نشد.'
    )
  }

  const current =
    records[
      index
    ]

  if (
    current.status ===
      'cancelled'
  ) {
    return current
  }

  if (
    current.status ===
      'completed'
  ) {
    throw new Error(
      'درخواست انجام‌شده قابل لغو نیست.'
    )
  }

  const now =
    new Date().toISOString()

  const updated:
    ClientLawyerRequestRecord = {
    ...current,

    status:
      'cancelled',

    updatedAt:
      now,

    history: [
      ...current.history,

      createStatusEvent(
        'cancelled',
        'درخواست توسط موکل لغو شد.'
      ),
    ],

    messages: [
      ...current.messages,

      createSystemMessage(
        'این درخواست توسط موکل لغو شد.'
      ),
    ],
  }

  records[
    index
  ] =
    updated

  writeRecords(
    records
  )

  return updated
}


export function subscribeClientLawyerRequests(
  listener:
    () => void
): () => void {
  if (!isBrowser()) {
    return () => undefined
  }

  const handleInternal =
    () => {
      listener()
    }

  const handleStorage =
    (
      event:
        StorageEvent
    ) => {
      if (
        event.key ===
        STORAGE_KEY
      ) {
        listener()
      }
    }

  window.addEventListener(
    CHANGE_EVENT,
    handleInternal
  )

  window.addEventListener(
    'storage',
    handleStorage
  )

  return () => {
    window.removeEventListener(
      CHANGE_EVENT,
      handleInternal
    )

    window.removeEventListener(
      'storage',
      handleStorage
    )
  }
}