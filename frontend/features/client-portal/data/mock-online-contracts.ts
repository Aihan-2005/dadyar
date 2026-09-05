import type {
  LawyerContractReviewInput,
  OnlineContractActor,
  OnlineContractAuditAction,
  OnlineContractAuditEvent,
  OnlineContractDraft,
  OnlineContractRecord,
  OnlineContractVersion,
} from '@/features/client-portal/types/contract'

/*
|--------------------------------------------------------------------------
| Storage
|--------------------------------------------------------------------------
*/

const STORAGE_KEY =
  'dadyar:online-contracts:v2'

const CLIENT_CONTRACT_IDS_KEY =
  'dadyar:client-contract-ids:v1'

const CHANGE_EVENT =
  'dadyar:online-contracts:changed'

/*
|--------------------------------------------------------------------------
| Browser
|--------------------------------------------------------------------------
*/

function isBrowser(): boolean {
  return (
    typeof window !==
    'undefined'
  )
}

/*
|--------------------------------------------------------------------------
| IDs
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Audit
|--------------------------------------------------------------------------
*/

function createAuditEvent(
  action:
    OnlineContractAuditAction,

  actor:
    OnlineContractActor,

  label:
    string
): OnlineContractAuditEvent {
  return {
    id:
      createId(
        'audit'
      ),

    action,

    actor,

    label,

    createdAt:
      new Date().toISOString(),
  }
}

/*
|--------------------------------------------------------------------------
| Client Ownership
|--------------------------------------------------------------------------
*/

function readClientContractIds():
  string[] {
  if (!isBrowser()) {
    return []
  }

  const stored =
    window.sessionStorage.getItem(
      CLIENT_CONTRACT_IDS_KEY
    )

  if (!stored) {
    return []
  }

  try {
    const parsed:
      unknown =
      JSON.parse(
        stored
      )

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return []
    }

    return parsed.filter(
      (
        item
      ): item is string =>
        typeof item ===
        'string'
    )
  } catch {
    return []
  }
}

function rememberClientContract(
  contractId:
    string
): void {
  if (!isBrowser()) {
    return
  }

  const ids =
    readClientContractIds()

  if (
    ids.includes(
      contractId
    )
  ) {
    return
  }

  window.sessionStorage.setItem(
    CLIENT_CONTRACT_IDS_KEY,

    JSON.stringify([
      contractId,
      ...ids,
    ])
  )
}

/*
|--------------------------------------------------------------------------
| Seed
|--------------------------------------------------------------------------
*/

function createSeedContracts():
  OnlineContractRecord[] {
  const now =
    Date.now()

  const firstDate =
    new Date(
      now -
        2 *
          60 *
          60 *
          1000
    ).toISOString()

  const secondDate =
    new Date(
      now -
        26 *
          60 *
          60 *
          1000
    ).toISOString()

  const revisedDate =
    new Date(
      now -
        20 *
          60 *
          60 *
          1000
    ).toISOString()

  const firstDraft:
    OnlineContractDraft = {
      templateKey:
        'case_legal_services',

      client: {
        fullName:
          'علی رضایی',

        phone:
          '09121234567',

        nationalId:
          '0012345678',

        address:
          'تهران',
      },

      lawyer: {
        id:
          'lawyer-mock-001',

        fullName:
          'آرمان نادری',

        title:
          'وکیل پایه یک دادگستری',

        licenseNumber:
          'MOCK-1001',

        barAssociation:
          'کانون وکلای دادگستری مرکز',

        city:
          'تهران',
      },

      subject:
        'پیگیری پرونده ملکی',

      scope:
        'بررسی اسناد ملک، ارائه مشاوره حقوقی، بررسی وضعیت پرونده و انجام خدمات حقوقی مورد توافق در مرحله بدوی.',

      feeToman:
        18_000_000,

      paymentMode:
        'staged',

      paymentDetails:
        '۵۰٪ در شروع و ۵۰٪ پس از پایان مرحله بدوی.',

      startDate:
        '1405/06/15',

      servicePeriod:
        'تا پایان مرحله بدوی',

      additionalTerms:
        'هزینه‌های کارشناسی و دادرسی جدا از حق‌الزحمه است.',
    }

  const initialSecondDraft:
    OnlineContractDraft = {
      templateKey:
        'legal_consultation',

      client: {
        fullName:
          'مریم حسینی',

        phone:
          '09123334455',

        nationalId:
          '1234567890',

        address:
          'کرج',
      },

      lawyer: {
        id:
          'lawyer-mock-003',

        fullName:
          'امیرحسین کریمی',

        title:
          'وکیل دادگستری',

        licenseNumber:
          'MOCK-1003',

        barAssociation:
          'کانون وکلای دادگستری البرز',

        city:
          'کرج',
      },

      subject:
        'مشاوره درباره چک',

      scope:
        'بررسی وضعیت حقوقی چک و ارائه نظر اولیه درباره روش‌های مطالبه وجه.',

      feeToman:
        900_000,

      paymentMode:
        'full',

      paymentDetails:
        'پرداخت کامل قبل از جلسه.',

      startDate:
        '1405/06/12',

      servicePeriod:
        'یک جلسه مشاوره',
    }

  const revisedSecondDraft:
    OnlineContractDraft = {
      ...initialSecondDraft,

      subject:
        'مشاوره حقوقی درباره چک',

      scope:
        'بررسی اسناد و اطلاعات مرتبط با چک و ارائه نظر حقوقی درباره روش‌های قانونی مطالبه وجه.',

      feeToman:
        1_200_000,

      paymentDetails:
        'پرداخت کامل قبل از جلسه مشاوره.',

      servicePeriod:
        'یک جلسه مشاوره و بررسی اولیه مدارک',
    }

  return [
    {
      id:
        'contract-seed-001',

      reference:
        'DY-DEMO-1001',

      version:
        1,

      status:
        'waiting_lawyer_review',

      draft:
        firstDraft,

      versions: [
        {
          version:
            1,

          draft:
            firstDraft,

          createdBy:
            'client',

          createdAt:
            firstDate,

          summary:
            'نسخه اولیه موکل',
        },
      ],

      createdAt:
        firstDate,

      updatedAt:
        firstDate,

      auditTrail: [
        {
          id:
            'audit-seed-001',

          action:
            'created_by_client',

          actor:
            'client',

          label:
            'قرارداد برای بررسی وکیل ارسال شد.',

          createdAt:
            firstDate,
        },
      ],
    },

    {
      id:
        'contract-seed-002',

      reference:
        'DY-DEMO-1002',

      version:
        2,

      status:
        'waiting_client_approval',

      draft:
        revisedSecondDraft,

      versions: [
        {
          version:
            1,

          draft:
            initialSecondDraft,

          createdBy:
            'client',

          createdAt:
            secondDate,

          summary:
            'نسخه اولیه موکل',
        },

        {
          version:
            2,

          draft:
            revisedSecondDraft,

          createdBy:
            'lawyer',

          createdAt:
            revisedDate,

          summary:
            'نسخه بررسی‌شده توسط وکیل',
        },
      ],

      createdAt:
        secondDate,

      updatedAt:
        revisedDate,

      auditTrail: [
        {
          id:
            'audit-seed-002-1',

          action:
            'created_by_client',

          actor:
            'client',

          label:
            'قرارداد برای بررسی وکیل ارسال شد.',

          createdAt:
            secondDate,
        },

        {
          id:
            'audit-seed-002-2',

          action:
            'reviewed_by_lawyer',

          actor:
            'lawyer',

          label:
            'قرارداد توسط وکیل بررسی شد.',

          createdAt:
            revisedDate,
        },

        {
          id:
            'audit-seed-002-3',

          action:
            'sent_to_client',

          actor:
            'lawyer',

          label:
            'نسخه ۲ برای تأیید موکل ارسال شد.',

          createdAt:
            revisedDate,
        },
      ],
    },
  ]
}

/*
|--------------------------------------------------------------------------
| Parse
|--------------------------------------------------------------------------
*/

function parseContracts(
  raw:
    string | null
): OnlineContractRecord[] {
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

    return parsed as OnlineContractRecord[]
  } catch {
    return []
  }
}

/*
|--------------------------------------------------------------------------
| Sort
|--------------------------------------------------------------------------
*/

function sortContracts(
  contracts:
    OnlineContractRecord[]
): OnlineContractRecord[] {
  return [
    ...contracts,
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

/*
|--------------------------------------------------------------------------
| Notify
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Write
|--------------------------------------------------------------------------
*/

function writeContracts(
  contracts:
    OnlineContractRecord[]
): void {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(
    STORAGE_KEY,

    JSON.stringify(
      contracts
    )
  )

  notifyChanged()
}

/*
|--------------------------------------------------------------------------
| Get All
|--------------------------------------------------------------------------
*/

export function getMockOnlineContracts():
  OnlineContractRecord[] {
  if (!isBrowser()) {
    return []
  }

  const stored =
    window.localStorage.getItem(
      STORAGE_KEY
    )

  if (!stored) {
    const seeded =
      createSeedContracts()

    window.localStorage.setItem(
      STORAGE_KEY,

      JSON.stringify(
        seeded
      )
    )

    return sortContracts(
      seeded
    )
  }

  return sortContracts(
    parseContracts(
      stored
    )
  )
}

/*
|--------------------------------------------------------------------------
| Client Contracts
|--------------------------------------------------------------------------
*/

export function getMockClientOnlineContracts():
  OnlineContractRecord[] {
  const ids =
    new Set(
      readClientContractIds()
    )

  return getMockOnlineContracts().filter(
    (
      contract
    ) =>
      ids.has(
        contract.id
      )
  )
}

/*
|--------------------------------------------------------------------------
| Get
|--------------------------------------------------------------------------
*/

export function getMockOnlineContractById(
  contractId:
    string
): OnlineContractRecord | null {
  return (
    getMockOnlineContracts().find(
      (
        contract
      ) =>
        contract.id ===
        contractId
    ) ??
    null
  )
}

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export function createMockOnlineContract(
  draft:
    OnlineContractDraft
): OnlineContractRecord {
  const now =
    new Date().toISOString()

  const version:
    OnlineContractVersion = {
      version:
        1,

      draft,

      createdBy:
        'client',

      createdAt:
        now,

      summary:
        'نسخه اولیه موکل',
    }

  const contract:
    OnlineContractRecord = {
      id:
        createId(
          'contract'
        ),

      reference:
        createReference(),

      version:
        1,

      status:
        'waiting_lawyer_review',

      draft,

      versions: [
        version,
      ],

      createdAt:
        now,

      updatedAt:
        now,

      auditTrail: [
        createAuditEvent(
          'created_by_client',

          'client',

          'قرارداد برای بررسی وکیل ارسال شد.'
        ),
      ],
    }

  const contracts =
    getMockOnlineContracts()

  writeContracts([
    contract,
    ...contracts,
  ])

  rememberClientContract(
    contract.id
  )

  return contract
}

/*
|--------------------------------------------------------------------------
| Lawyer Review
|--------------------------------------------------------------------------
*/

export function reviewMockOnlineContract(
  contractId:
    string,

  input:
    LawyerContractReviewInput
): OnlineContractRecord {
  const contracts =
    getMockOnlineContracts()

  const index =
    contracts.findIndex(
      (
        contract
      ) =>
        contract.id ===
        contractId
    )

  if (
    index ===
    -1
  ) {
    throw new Error(
      'قرارداد پیدا نشد.'
    )
  }

  const current =
    contracts[
      index
    ]

  if (
    current.status !==
    'waiting_lawyer_review'
  ) {
    throw new Error(
      'این قرارداد در وضعیت قابل بررسی نیست.'
    )
  }

  const subject =
    input.subject.trim()

  const scope =
    input.scope.trim()

  const servicePeriod =
    input.servicePeriod.trim()

  const paymentDetails =
    input.paymentDetails.trim()

  if (
    subject.length <
    5
  ) {
    throw new Error(
      'موضوع قرارداد کامل نیست.'
    )
  }

  if (
    scope.length <
    20
  ) {
    throw new Error(
      'دامنه خدمات کامل نیست.'
    )
  }

  if (
    !Number.isFinite(
      input.feeToman
    ) ||
    input.feeToman <=
      0
  ) {
    throw new Error(
      'مبلغ قرارداد معتبر نیست.'
    )
  }

  if (
    servicePeriod.length <
    3
  ) {
    throw new Error(
      'مدت ارائه خدمات را مشخص کنید.'
    )
  }

  if (
    input.paymentMode !==
      'full' &&
    paymentDetails.length <
      5
  ) {
    throw new Error(
      'جزئیات پرداخت را تکمیل کنید.'
    )
  }

  const nextVersion =
    current.version +
    1

  const now =
    new Date().toISOString()

  const nextDraft:
    OnlineContractDraft = {
      ...current.draft,

      subject,

      scope,

      feeToman:
        input.feeToman,

      paymentMode:
        input.paymentMode,

      paymentDetails:
        input.paymentMode ===
        'full'
          ? paymentDetails ||
            'پرداخت کامل طبق توافق طرفین.'
          : paymentDetails,

      servicePeriod,

      additionalTerms:
        input.additionalTerms?.trim() ||
        undefined,
    }

  const newVersion:
    OnlineContractVersion = {
      version:
        nextVersion,

      draft:
        nextDraft,

      createdBy:
        'lawyer',

      createdAt:
        now,

      summary:
        'نسخه بررسی‌شده توسط وکیل',
    }

  const updated:
    OnlineContractRecord = {
      ...current,

      version:
        nextVersion,

      status:
        'waiting_client_approval',

      draft:
        nextDraft,

      versions: [
        ...current.versions,
        newVersion,
      ],

      clientFeedback:
        undefined,

      rejectionReason:
        undefined,

      updatedAt:
        now,

      auditTrail: [
        ...current.auditTrail,

        createAuditEvent(
          'reviewed_by_lawyer',

          'lawyer',

          'قرارداد توسط وکیل بررسی شد.'
        ),

        createAuditEvent(
          'updated_by_lawyer',

          'lawyer',

          `نسخه ${nextVersion.toLocaleString(
            'fa-IR'
          )} قرارداد ایجاد شد.`
        ),

        createAuditEvent(
          'sent_to_client',

          'lawyer',

          `نسخه ${nextVersion.toLocaleString(
            'fa-IR'
          )} برای تأیید موکل ارسال شد.`
        ),
      ],
    }

  contracts[
    index
  ] =
    updated

  writeContracts(
    contracts
  )

  return updated
}

/*
|--------------------------------------------------------------------------
| Client Approval
|--------------------------------------------------------------------------
*/

export function approveMockOnlineContractByClient(
  contractId:
    string
): OnlineContractRecord {
  const contracts =
    getMockOnlineContracts()

  const index =
    contracts.findIndex(
      (
        contract
      ) =>
        contract.id ===
        contractId
    )

  if (
    index ===
    -1
  ) {
    throw new Error(
      'قرارداد پیدا نشد.'
    )
  }

  const current =
    contracts[
      index
    ]

  if (
    current.status !==
    'waiting_client_approval'
  ) {
    throw new Error(
      'این نسخه در وضعیت قابل تأیید نیست.'
    )
  }

  const updated:
    OnlineContractRecord = {
      ...current,

      status:
        'waiting_lawyer_signature',

      updatedAt:
        new Date().toISOString(),

      clientFeedback:
        undefined,

      auditTrail: [
        ...current.auditTrail,

        createAuditEvent(
          'approved_by_client',

          'client',

          `نسخه ${current.version.toLocaleString(
            'fa-IR'
          )} توسط موکل تأیید شد.`
        ),
      ],
    }

  contracts[
    index
  ] =
    updated

  writeContracts(
    contracts
  )

  return updated
}

/*
|--------------------------------------------------------------------------
| Client Requests Changes
|--------------------------------------------------------------------------
*/

export function requestMockOnlineContractChanges(
  contractId:
    string,

  feedback:
    string
): OnlineContractRecord {
  const contracts =
    getMockOnlineContracts()

  const index =
    contracts.findIndex(
      (
        contract
      ) =>
        contract.id ===
        contractId
    )

  if (
    index ===
    -1
  ) {
    throw new Error(
      'قرارداد پیدا نشد.'
    )
  }

  const current =
    contracts[
      index
    ]

  if (
    current.status !==
    'waiting_client_approval'
  ) {
    throw new Error(
      'در این مرحله امکان درخواست اصلاح وجود ندارد.'
    )
  }

  const normalizedFeedback =
    feedback.trim()

  if (
    normalizedFeedback.length <
    5
  ) {
    throw new Error(
      'توضیح مورد نیاز برای اصلاح را کامل وارد کنید.'
    )
  }

  const updated:
    OnlineContractRecord = {
      ...current,

      status:
        'waiting_lawyer_review',

      clientFeedback:
        normalizedFeedback,

      updatedAt:
        new Date().toISOString(),

      auditTrail: [
        ...current.auditTrail,

        createAuditEvent(
          'changes_requested_by_client',

          'client',

          `موکل درخواست اصلاح قرارداد را ثبت کرد: ${normalizedFeedback}`
        ),
      ],
    }

  contracts[
    index
  ] =
    updated

  writeContracts(
    contracts
  )

  return updated
}

/*
|--------------------------------------------------------------------------
| Lawyer Final Confirmation
|--------------------------------------------------------------------------
*/

export function signMockOnlineContractByLawyer(
  contractId:
    string
): OnlineContractRecord {
  const contracts =
    getMockOnlineContracts()

  const index =
    contracts.findIndex(
      (
        contract
      ) =>
        contract.id ===
        contractId
    )

  if (
    index ===
    -1
  ) {
    throw new Error(
      'قرارداد پیدا نشد.'
    )
  }

  const current =
    contracts[
      index
    ]

  if (
    current.status !==
    'waiting_lawyer_signature'
  ) {
    throw new Error(
      'این قرارداد در وضعیت قابل تأیید نهایی نیست.'
    )
  }

  const now =
    new Date().toISOString()

  const updated:
    OnlineContractRecord = {
      ...current,

      status:
        'completed',

      completedAt:
        now,

      updatedAt:
        now,

      auditTrail: [
        ...current.auditTrail,

        createAuditEvent(
          'signed_by_lawyer',

          'lawyer',

          `نسخه ${current.version.toLocaleString(
            'fa-IR'
          )} توسط وکیل تأیید نهایی شد و قرارداد تکمیل شد.`
        ),
      ],
    }

  contracts[
    index
  ] =
    updated

  writeContracts(
    contracts
  )

  return updated
}



export function rejectMockOnlineContract(
  contractId:
    string,

  reason:
    string
): OnlineContractRecord {
  const contracts =
    getMockOnlineContracts()

  const index =
    contracts.findIndex(
      (
        contract
      ) =>
        contract.id ===
        contractId
    )

  if (
    index ===
    -1
  ) {
    throw new Error(
      'قرارداد پیدا نشد.'
    )
  }

  const current =
    contracts[
      index
    ]

  if (
    current.status !==
    'waiting_lawyer_review'
  ) {
    throw new Error(
      'این قرارداد در وضعیت قابل رد شدن نیست.'
    )
  }

  const normalizedReason =
    reason.trim()

  if (
    normalizedReason.length <
    5
  ) {
    throw new Error(
      'دلیل رد قرارداد را کامل وارد کنید.'
    )
  }

  const updated:
    OnlineContractRecord = {
      ...current,

      status:
        'rejected',

      rejectionReason:
        normalizedReason,

      updatedAt:
        new Date().toISOString(),

      auditTrail: [
        ...current.auditTrail,

        createAuditEvent(
          'rejected_by_lawyer',

          'lawyer',

          `قرارداد توسط وکیل رد شد: ${normalizedReason}`
        ),
      ],
    }

  contracts[
    index
  ] =
    updated

  writeContracts(
    contracts
  )

  return updated
}



export function subscribeMockOnlineContracts(
  listener:
    () => void
): () => void {
  if (!isBrowser()) {
    return () => undefined
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

  const handleLocal =
    () => {
      listener()
    }

  window.addEventListener(
    'storage',
    handleStorage
  )

  window.addEventListener(
    CHANGE_EVENT,
    handleLocal
  )

  return () => {
    window.removeEventListener(
      'storage',
      handleStorage
    )

    window.removeEventListener(
      CHANGE_EVENT,
      handleLocal
    )
  }
}