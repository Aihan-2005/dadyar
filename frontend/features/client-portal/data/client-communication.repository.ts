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
      'completed'||
      current.status === 'declined'
  ) {
    throw new Error('این درخواست قابل لغو نیست.') 
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
export function getAllLawyerRequests(): ClientLawyerRequestRecord[] {
  return sortRecords(readRecords())
}

export function getLawyerRequestById(
  requestId: string
): ClientLawyerRequestRecord | null {
  return readRecords().find((record) => record.id === requestId) ?? null
}

function transitionLawyerRequestStatus(
  requestId: string,
  status: ClientLawyerRequestStatus,
  label: string
): ClientLawyerRequestRecord {
  const records = readRecords()

  const index = records.findIndex(
    (record) => record.id === requestId
  )

  if (index === -1) {
    throw new Error('درخواست پیدا نشد.')
  }

  const current = records[index]

  if (current.status === status) {
    return current
  }

  if (
    current.status === 'completed' ||
    current.status === 'cancelled' ||
     current.status === 'declined'
  ) {
    throw new Error('این درخواست بسته شده و قابل تغییر نیست.')
  }

  const now = new Date().toISOString()

  const updated: ClientLawyerRequestRecord = {
    ...current,
    status,
    updatedAt: now,
    history: [
      ...current.history,
      createStatusEvent(status, label),
    ],
    messages: [
      ...current.messages,
      createSystemMessage(label),
    ],
  }

  records[index] = updated
  writeRecords(records)

  return updated
}

export function markLawyerRequestUnderReview(
  requestId: string
): ClientLawyerRequestRecord {
  return transitionLawyerRequestStatus(
    requestId,
    'under_review',
    'درخواست توسط وکیل بررسی شد.'
  )
}

export function confirmLawyerRequest(
  requestId: string
): ClientLawyerRequestRecord {
  return transitionLawyerRequestStatus(
    requestId,
    'confirmed',
    'درخواست توسط وکیل تأیید شد.'
  )
}

export function completeLawyerRequest(
  requestId: string
): ClientLawyerRequestRecord {
  return transitionLawyerRequestStatus(
    requestId,
    'completed',
    'این درخواست به اتمام رسید.'
  )
}

export function declineLawyerRequest(
  requestId: string
): ClientLawyerRequestRecord {
  return transitionLawyerRequestStatus(
    requestId,
    'declined',
    'درخواست توسط وکیل رد شد.'
  )
}

export function appendLawyerRequestMessage(
  requestId: string,
  body: string
): ClientLawyerRequestRecord {
  const normalizedBody = body.trim()

  if (normalizedBody.length < 2) {
    throw new Error('متن پیام را وارد کنید.')
  }

  if (normalizedBody.length > 1200) {
    throw new Error('پیام بیش از حد طولانی است.')
  }

  const records = readRecords()

  const index = records.findIndex(
    (record) => record.id === requestId
  )

  if (index === -1) {
    throw new Error('درخواست پیدا نشد.')
  }

  const current = records[index]

  if (current.status === 'cancelled') {
    throw new Error(
      'امکان ارسال پیام برای درخواست لغوشده وجود ندارد.'
    )
  }

  const now = new Date().toISOString()

  const message: ClientRequestMessage = {
    id: createId('message'),
    authorType: 'lawyer',
    authorName: current.lawyer.fullName,
    body: normalizedBody,
    createdAt: now,
  }

  const updated: ClientLawyerRequestRecord = {
    ...current,
    updatedAt: now,
    messages: [...current.messages, message],
  }

  records[index] = updated
  writeRecords(records)

  return updated
}
export function seedMockLawyerRequestsIfEmpty(): void {
  if (!isBrowser()) {
    return
  }

  const existing = readRecords()

  if (existing.length > 0) {
    return
  }

  const now = Date.now()

  const iso = (offsetMinutes: number) =>
    new Date(now - offsetMinutes * 60_000).toISOString()

  const mockLawyer = {
    id: 'lawyer-mock-1',
    fullName: 'دکتر علی رضایی',
    title: 'وکیل پایه یک دادگستری',
    city: 'تهران',
    province: 'تهران',
    phone: '02188889999',
    officeAddress: 'تهران، خیابان ولیعصر، پلاک ۱۲۰',
    licenseNumber: '12345',
  }

  const mockClients = [
    { id: 'client-mock-1', fullName: 'سارا احمدی', phone: '09121234567' },
    { id: 'client-mock-2', fullName: 'محمد کریمی', phone: '09359876543' },
    { id: 'client-mock-3', fullName: 'نگار حسینی', phone: '09151112233' },
  ]

  const records: ClientLawyerRequestRecord[] = [
    {
      id: 'request-mock-1',
      reference: 'DY-MOCK-0001',
      kind: 'initial_request',
      client: mockClients[0],
      lawyer: mockLawyer,
      category: 'contracts',
      caseStage: 'pre_filing',
      opposingPartyName: 'شرکت آریا تجارت',
      subject: 'بررسی قرارداد خرید ملک',
      description:
        'با سلام، قصد خرید یک واحد آپارتمان دارم و متن قرارداد مبایعه‌نامه رو دریافت کرده‌ام. می‌خواستم قبل از امضا، بندهای مربوط به تحویل و ضمانت رو بررسی کنید.',
      preferredContactMethod: 'written_response',
      urgency: 'soon',
      status: 'submitted',
      createdAt: iso(60),
      updatedAt: iso(60),
      history: [
        {
          id: 'status-mock-1',
          status: 'submitted',
          label: 'درخواست برای بررسی وکیل ارسال شد.',
          createdAt: iso(60),
        },
      ],
      messages: [
        {
          id: 'message-mock-1',
          authorType: 'system',
          authorName: 'دادیار',
          body: 'درخواست شما ثبت شد و در انتظار بررسی وکیل است.',
          createdAt: iso(60),
        },
      ],
    },

    {
      id: 'request-mock-2',
      reference: 'DY-MOCK-0002',
      kind: 'initial_request',
      client: mockClients[1],
      lawyer: mockLawyer,
      category: 'labor',
      caseStage: 'filed',
      subject: 'اخراج ناعادلانه از شرکت',
      description:
        'کارفرما بدون اطلاع قبلی و بدون پرداخت حقوق معوقه من رو اخراج کرده. پرونده در اداره کار مطرح شده و نیاز به مشاوره برای مرحله بعد دارم.',
      preferredContactMethod: 'phone_callback',
      callbackWindow: 'afternoon',
      urgency: 'urgent',
      status: 'under_review',
      createdAt: iso(240),
      updatedAt: iso(180),
      history: [
        {
          id: 'status-mock-2a',
          status: 'submitted',
          label: 'درخواست برای بررسی وکیل ارسال شد.',
          createdAt: iso(240),
        },
        {
          id: 'status-mock-2b',
          status: 'under_review',
          label: 'درخواست توسط وکیل بررسی شد.',
          createdAt: iso(180),
        },
      ],
      messages: [
        {
          id: 'message-mock-2a',
          authorType: 'system',
          authorName: 'دادیار',
          body: 'درخواست شما ثبت شد و در انتظار بررسی وکیل است.',
          createdAt: iso(240),
        },
        {
          id: 'message-mock-2b',
          authorType: 'lawyer',
          authorName: mockLawyer.fullName,
          body: 'سلام، پرونده شما رو بررسی می‌کنم و امروز باهاتون تماس می‌گیرم.',
          createdAt: iso(175),
        },
      ],
    },

    {
      id: 'request-mock-3',
      reference: 'DY-MOCK-0003',
      kind: 'consultation_booking',
      client: mockClients[2],
      lawyer: mockLawyer,
      category: 'family',
      caseStage: 'pre_filing',
      subject: 'مشاوره تنظیم قرارداد طلاق توافقی',
      description:
        'برای تنظیم قرارداد طلاق توافقی نیاز به مشاوره حضوری دارم.',
      offerId: 'offer-mock-1',
      consultationMode: 'in_person',
      consultationTitle: 'مشاوره حضوری ۳۰ دقیقه‌ای',
      durationMinutes: 30,
      priceToman: 500000,
      date: '2026-09-10',
      dateLabel: '۱۹ شهریور ۱۴۰۵',
      time: '11:00',
      status: 'confirmed',
      createdAt: iso(1440),
      updatedAt: iso(600),
      history: [
        {
          id: 'status-mock-3a',
          status: 'submitted',
          label: 'درخواست رزرو جلسه برای وکیل ارسال شد.',
          createdAt: iso(1440),
        },
        {
          id: 'status-mock-3b',
          status: 'under_review',
          label: 'درخواست توسط وکیل بررسی شد.',
          createdAt: iso(900),
        },
        {
          id: 'status-mock-3c',
          status: 'confirmed',
          label: 'درخواست توسط وکیل تأیید شد.',
          createdAt: iso(600),
        },
      ],
      messages: [
        {
          id: 'message-mock-3a',
          authorType: 'system',
          authorName: 'دادیار',
          body: 'درخواست رزرو ثبت شد و پس از بررسی وکیل وضعیت جلسه مشخص می‌شود.',
          createdAt: iso(1440),
        },
        {
          id: 'message-mock-3b',
          authorType: 'lawyer',
          authorName: mockLawyer.fullName,
          body: 'جلسه شما تأیید شد، منتظرتون هستم.',
          createdAt: iso(600),
        },
      ],
    },
  ]

  writeRecords(records)
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