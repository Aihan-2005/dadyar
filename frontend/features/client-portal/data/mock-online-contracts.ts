import type {
  LawyerContractReviewInput,
  OnlineContractActor,
  OnlineContractAuditAction,
  OnlineContractAuditEvent,
  OnlineContractDraft,
  OnlineContractRecord,
} from '@/features/client-portal/types/contract'




const STORAGE_KEY =
  'dadyar:mock-online-contracts:v1'

const CHANGE_EVENT =
  'dadyar:mock-online-contracts:changed'


  

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




function createSeedContracts():
  OnlineContractRecord[] {
  const now =
    Date.now()

  const firstCreatedAt =
    new Date(
      now -
        2 *
          60 *
          60 *
          1000
    ).toISOString()

  const secondCreatedAt =
    new Date(
      now -
        26 *
          60 *
          60 *
          1000
    ).toISOString()

  const secondUpdatedAt =
    new Date(
      now -
        20 *
          60 *
          60 *
          1000
    ).toISOString()

  return [

    

    {
      id:
        'mock-contract-seed-001',

      reference:
        'DY-DEMO-1001',

      version:
        1,

      status:
        'waiting_lawyer_review',

      createdAt:
        firstCreatedAt,

      updatedAt:
        firstCreatedAt,

      draft: {
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
      },

      auditTrail: [
        {
          id:
            'seed-audit-001',

          action:
            'created_by_client',

          actor:
            'client',

          label:
            'پیش‌نویس قرارداد توسط موکل برای بررسی وکیل ارسال شد.',

          createdAt:
            firstCreatedAt,
        },
      ],
    },


    

    {
      id:
        'mock-contract-seed-002',

      reference:
        'DY-DEMO-1002',

      version:
        2,

      status:
        'waiting_client_approval',

      createdAt:
        secondCreatedAt,

      updatedAt:
        secondUpdatedAt,

      draft: {
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
          'مشاوره حقوقی درباره چک',

        scope:
          'بررسی اسناد و اطلاعات مرتبط با چک و ارائه نظر حقوقی درباره روش‌های قانونی مطالبه وجه.',

        feeToman:
          1_200_000,

        paymentMode:
          'full',

        paymentDetails:
          'پرداخت کامل قبل از جلسه مشاوره.',

        startDate:
          '1405/06/12',

        servicePeriod:
          'یک جلسه مشاوره و بررسی اولیه مدارک',
      },

      auditTrail: [
        {
          id:
            'seed-audit-002-1',

          action:
            'created_by_client',

          actor:
            'client',

          label:
            'درخواست قرارداد توسط موکل ثبت شد.',

          createdAt:
            secondCreatedAt,
        },

        {
          id:
            'seed-audit-002-2',

          action:
            'reviewed_by_lawyer',

          actor:
            'lawyer',

          label:
            'قرارداد توسط وکیل بررسی شد.',

          createdAt:
            secondUpdatedAt,
        },

        {
          id:
            'seed-audit-002-3',

          action:
            'sent_to_client',

          actor:
            'lawyer',

          label:
            'نسخه ۲ قرارداد برای تأیید موکل ارسال شد.',

          createdAt:
            secondUpdatedAt,
        },
      ],
    },
  ]
}




function parseStoredContracts(
  value:
    string | null
): OnlineContractRecord[] {
  if (!value) {
    return []
  }

  try {
    const parsed:
      unknown =
      JSON.parse(
        value
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
    parseStoredContracts(
      stored
    )
  )
}




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



export function createMockOnlineContract(
  draft:
    OnlineContractDraft
): OnlineContractRecord {
  if (!isBrowser()) {
    throw new Error(
      'Mock contract storage is only available in the browser.'
    )
  }

  const now =
    new Date().toISOString()

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

      createdAt:
        now,

      updatedAt:
        now,

      auditTrail: [
        createAuditEvent(
          'created_by_client',

          'client',

          'پیش‌نویس قرارداد توسط موکل برای بررسی وکیل ارسال شد.'
        ),
      ],
    }

  const contracts =
    getMockOnlineContracts()

  writeContracts([
    contract,
    ...contracts,
  ])

  return contract
}


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
      'این قرارداد در وضعیت قابل بررسی توسط وکیل نیست.'
    )
  }

  const normalizedSubject =
    input.subject.trim()

  const normalizedScope =
    input.scope.trim()

  const normalizedPaymentDetails =
    input.paymentDetails.trim()

  const normalizedServicePeriod =
    input.servicePeriod.trim()

 
    

  if (
    normalizedSubject.length <
    5
  ) {
    throw new Error(
      'موضوع قرارداد معتبر نیست.'
    )
  }

  if (
    normalizedScope.length <
    20
  ) {
    throw new Error(
      'دامنه خدمات قرارداد معتبر نیست.'
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
    normalizedServicePeriod.length <
    3
  ) {
    throw new Error(
      'مدت ارائه خدمات معتبر نیست.'
    )
  }

  if (
    input.paymentMode !==
      'full' &&
    normalizedPaymentDetails.length <
      5
  ) {
    throw new Error(
      'جزئیات پرداخت باید تکمیل شود.'
    )
  }

  const nextVersion =
    current.version +
    1

  const now =
    new Date().toISOString()

  const updated:
    OnlineContractRecord = {
      ...current,

      version:
        nextVersion,

      status:
        'waiting_client_approval',

      updatedAt:
        now,

      rejectionReason:
        undefined,

      draft: {
        ...current.draft,

        subject:
          normalizedSubject,

        scope:
          normalizedScope,

        feeToman:
          input.feeToman,

        paymentMode:
          input.paymentMode,

        paymentDetails:
          input.paymentMode ===
          'full'
            ? normalizedPaymentDetails ||
              'پرداخت کامل طبق توافق طرفین.'
            : normalizedPaymentDetails,

        servicePeriod:
          normalizedServicePeriod,

        additionalTerms:
          input.additionalTerms?.trim() ||
          undefined,
      },

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
          )} برای بررسی و تأیید موکل ارسال شد.`
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
      'این قرارداد در وضعیت قابل رد شدن توسط وکیل نیست.'
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

  const now =
    new Date().toISOString()

  const updated:
    OnlineContractRecord = {
      ...current,

      status:
        'rejected',

      rejectionReason:
        normalizedReason,

      updatedAt:
        now,

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

  const handleLocalChange =
    () => {
      listener()
    }

  window.addEventListener(
    'storage',
    handleStorage
  )

  window.addEventListener(
    CHANGE_EVENT,
    handleLocalChange
  )

  return () => {
    window.removeEventListener(
      'storage',
      handleStorage
    )

    window.removeEventListener(
      CHANGE_EVENT,
      handleLocalChange
    )
  }
}