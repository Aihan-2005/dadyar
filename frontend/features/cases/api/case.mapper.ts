import type {
  Case,
  CaseClient,
  CaseStatus,
  CreateCasePayload,
  Expense,
  PaymentType,
} from '@/types/case'

import {
  parseFinanceDate,
} from '@/features/finance/utils/date'

import {
  normalizeDigits,
  toFiniteNumber,
} from '@/features/finance/utils/number'

import type {
  ApiBranchHistory,
  ApiCaseClientInput,
  ApiCasePaymentInput,
  ApiCasePaymentRecord,
  ApiCasePaymentType,
  ApiCaseRecord,
  ApiCaseState,
  ApiCourt,
  ApiCourtType,
  ApiCreateCaseRequest,
  ApiLawyerContactInput,
  ApiOpposingPartyInput,
  ApiRelatedPersonInput,
} from './types'



const UI_TO_API_COURT_TYPE:
  Record<
    string,
    ApiCourtType
  > = {
    'دادگاه عمومی':
      'GENERAL_COURT',

    'دادگاه انقلاب':
      'REVOLUTIONARY_COURT',

    'دادگاه کیفری':
      'CRIMINAL_COURT',

    'دادگاه خانواده':
      'FAMILY_COURT',

    'دادگاه اطفال':
      'JUVENILE_COURT',

    'دادگاه کار':
      'LABOR_COURT',

    'دادگاه اصناف':
      'GUILD_COURT',

    'دادگاه حقوقی':
      'CIVIL_COURT',

    'دادگاه تجدیدنظر':
      'APPEAL_COURT',
  }

const API_TO_UI_COURT_TYPE:
  Record<
    ApiCourtType,
    string
  > = {
    GENERAL_COURT:
      'دادگاه عمومی',

    REVOLUTIONARY_COURT:
      'دادگاه انقلاب',

    CRIMINAL_COURT:
      'دادگاه کیفری',

    FAMILY_COURT:
      'دادگاه خانواده',

    JUVENILE_COURT:
      'دادگاه اطفال',

    LABOR_COURT:
      'دادگاه کار',

    GUILD_COURT:
      'دادگاه اصناف',

    CIVIL_COURT:
      'دادگاه حقوقی',

    APPEAL_COURT:
      'دادگاه تجدیدنظر',
  }



function clean(
  value:
    unknown
): string {
  return typeof value ===
    'string'
    ? value.trim()
    : ''
}

function optionalText(
  value:
    unknown
): string | undefined {
  return (
    clean(value) ||
    undefined
  )
}

function normalizePhone(
  value:
    unknown
): string {
  return normalizeDigits(
    clean(value)
  )
    .replace(
      /[\s()-]/g,
      ''
    )
    .trim()
}

function normalizeNationalId(
  value:
    unknown
): string | undefined {
  const result =
    normalizeDigits(
      clean(value)
    ).trim()

  return (
    result ||
    undefined
  )
}

function normalizeIdentityText(
  value:
    unknown
): string {
  return clean(value)
    .toLocaleLowerCase(
      'fa-IR'
    )
}

function hasMeaningfulValue(
  values:
    Record<
      string,
      unknown
    >
): boolean {
  return Object.values(
    values
  ).some(
    (value) => {
      if (
        typeof value ===
        'boolean'
      ) {
        return value
      }

      if (
        typeof value ===
        'number'
      ) {
        return value !== 0
      }

      return (
        clean(value).length >
        0
      )
    }
  )
}


function toIsoDate(
  value:
    unknown,
  fieldLabel:
    string
): string | undefined {
  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ''
  ) {
    return undefined
  }

  const parsed =
    parseFinanceDate(
      value as
        | Date
        | string
        | undefined
    )

  if (!parsed) {
    throw new Error(
      `${fieldLabel} معتبر نیست.`
    )
  }

  return parsed.toISOString()
}

function toJalaliDate(
  value?:
    string
): string | undefined {
  if (!value) {
    return undefined
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return undefined
  }

  const parts =
    new Intl.DateTimeFormat(
      'en-US-u-ca-persian-nu-latn',
      {
        year:
          'numeric',

        month:
          '2-digit',

        day:
          '2-digit',
      }
    ).formatToParts(
      date
    )

  const year =
    parts.find(
      (part) =>
        part.type ===
        'year'
    )?.value

  const month =
    parts.find(
      (part) =>
        part.type ===
        'month'
    )?.value

  const day =
    parts.find(
      (part) =>
        part.type ===
        'day'
    )?.value

  if (
    !year ||
    !month ||
    !day
  ) {
    return undefined
  }

  return `${year}/${month}/${day}`
}


export function toApiCaseState(
  status?:
    CaseStatus
): ApiCaseState {
  switch (status) {
    case 'in-progress':
    case 'in_progress':
    case 'open':
      return 'IN_PROGRESS'

    case 'completed':
    case 'closed':
      return 'DONE'

    case 'archived':
      return 'ARCHIVED'

    case 'pending':
    default:
      return 'PENDING'
  }
}

export function fromApiCaseState(
  state:
    ApiCaseState
): CaseStatus {
  switch (state) {
    case 'IN_PROGRESS':
      return 'in-progress'

    case 'DONE':
      return 'completed'

    case 'ARCHIVED':
      return 'archived'

    case 'PENDING':
    default:
      return 'pending'
  }
}



export function toApiPaymentType(
  value?:
    PaymentType
): ApiCasePaymentType {
  switch (value) {
    case 'non-cash':
      return 'NON_CASH'

    case 'both':
      return 'BOTH'

    case 'cash':
    default:
      return 'CASH'
  }
}

export function fromApiPaymentType(
  value?:
    ApiCasePaymentType
): PaymentType {
  switch (value) {
    case 'NON_CASH':
      return 'non-cash'

    case 'BOTH':
      return 'both'

    case 'CASH':
    default:
      return 'cash'
  }
}



function toApiCourtType(
  value:
    unknown
): ApiCourtType | undefined {
  const courtType =
    clean(value)

  if (!courtType) {
    return undefined
  }

  const mapped =
    UI_TO_API_COURT_TYPE[
      courtType
    ]

  if (!mapped) {
    throw new Error(
      'نوع مرجع قضایی انتخاب‌شده توسط سرور پشتیبانی نمی‌شود.'
    )
  }

  return mapped
}



function mapBranchHistoryToApi(
  source:
    CreateCasePayload
): ApiBranchHistory[] {
  return (
    source.branchHistory ??
    []
  )
    .filter(
      (item) =>
        hasMeaningfulValue({
          province:
            item.province,

          city:
            item.city,

          branchNumber:
            item.branchNumber,

          archiveNumberBranch:
            item.archiveNumberBranch,

          date:
            item.date,

          isActive:
            item.isActive,
        })
    )
    .map(
      (
        item
      ): ApiBranchHistory => ({
        province:
          optionalText(
            item.province
          ),

        city:
          optionalText(
            item.city
          ),

        branchNumber:
          optionalText(
            item.branchNumber
          ),

        archiveNumberBranch:
          optionalText(
            item.archiveNumberBranch
          ),

        date:
          toIsoDate(
            item.date,
            'تاریخ سابقه شعبه'
          ),

        isActive:
          Boolean(
            item.isActive
          ),
      })
    )
}



function mapCourtToApi(
  source:
    CreateCasePayload
): ApiCourt | undefined {
  const province =
    clean(
      source
        .courtBranch
        ?.province ??
        source.province
    )

  const city =
    clean(
      source
        .courtBranch
        ?.city ??
        source.city
    )

  const branch =
    clean(
      source
        .courtBranch
        ?.currentBranchNumber ??
        source
          .courtBranch
          ?.branch ??
        source
          .courtBranch
          ?.branchNumber
    )

  const rawCourtType =
    source
      .courtBranch
      ?.courtType ??
    source.courtType

  const courtType =
    toApiCourtType(
      rawCourtType
    )

  const hasAnyCourtValue =
    Boolean(
      province ||
        city ||
        branch ||
        clean(
          rawCourtType
        )
    )

  if (!hasAnyCourtValue) {
    return undefined
  }

  
  if (
    !province ||
    !city ||
    !branch ||
    !courtType
  ) {
    throw new Error(
      'برای ثبت مرجع قضایی، نوع دادگاه، استان، شهر و شعبه را کامل وارد کنید.'
    )
  }

  return {
    type:
      courtType,

    province,

    city,

    branch,

    archiveNumberBranch:
      optionalText(
        source
          .courtBranch
          ?.archiveNumberBranch ??
        source.archiveNumberBranch
      ),
  }
}



function findPaymentClient(
  payment: {
    clientId?: string
    clientName?: string
  },

  clients:
    CaseClient[]
): CaseClient | undefined {
  const paymentClientId =
    clean(
      payment.clientId
    )

  if (
    paymentClientId
  ) {
    return clients.find(
      (client) =>
        clean(
          client.clientId
        ) ===
        paymentClientId
    )
  }

  const paymentClientName =
    normalizeIdentityText(
      payment.clientName
    )

  if (
    paymentClientName
  ) {
    return clients.find(
      (client) =>
        normalizeIdentityText(
          client.name
        ) ===
        paymentClientName
    )
  }

  if (
    clients.length ===
    1
  ) {
    return clients[0]
  }

  return undefined
}


function getClientPayments(
  client:
    CaseClient,

  clients:
    CaseClient[],

  source:
    CreateCasePayload
): ApiCasePaymentInput[] {
  const paymentType =
    source.paymentType ??
    'cash'

  if (
    paymentType ===
    'non-cash'
  ) {
    return []
  }

  const payments =
    (
      source.cashPayments ??
      []
    ).filter(
      (payment) =>
        toFiniteNumber(
          payment.amount
        ) > 0
    )

  return payments
    .filter(
      (payment) =>
        findPaymentClient(
          payment,
          clients
        ) === client
    )
    .map(
      (
        payment
      ): ApiCasePaymentInput => ({
        paymentId:
          optionalText(
            payment.id
          ),

        method:
          'CASH',

        amount:
          toFiniteNumber(
            payment.amount
          ),

        description:
          optionalText(
            payment.paymentDescription
          ),

        dueDate:
          toIsoDate(
            payment.paymentDate ??
              payment.dueDate,
            'تاریخ پرداخت'
          ),

        isPaid:
          Boolean(
            payment.isPaid
          ),
      })
    )
}



function mapClientsToApi(
  source:
    CreateCasePayload,

  contractAmount:
    number
): ApiCaseClientInput[] {
  const clients =
    (
      source.clients ??
      []
    ).filter(
      (client) =>
        Boolean(
          clean(
            client.clientId
          ) ||
            clean(
              client.name
            ) ||
            clean(
              client.phone
            )
        )
    )

  if (
    clients.length ===
    0
  ) {
    throw new Error(
      'حداقل یک موکل برای پرونده الزامی است.'
    )
  }

  
  if (
    clients.length >
      1 &&
    source.paymentType !==
      'non-cash'
  ) {
    for (
      const payment of
      source.cashPayments ??
      []
    ) {
      if (
        toFiniteNumber(
          payment.amount
        ) <= 0
      ) {
        continue
      }

      if (
        !findPaymentClient(
          payment,
          clients
        )
      ) {
        throw new Error(
          'موکل مرتبط با یکی از پرداخت‌ها مشخص نشده است.'
        )
      }
    }
  }

  const shares =
    clients.map(
      (client) =>
        toFiniteNumber(
          client.feeShareAmount
        )
    )

  
  if (
    clients.length ===
      1 &&
    shares[0] ===
      0 &&
    contractAmount >
      0
  ) {
    shares[0] =
      contractAmount
  }

  const totalShares =
    shares.reduce(
      (
        total,
        share
      ) =>
        total +
        share,
      0
    )

  if (
    totalShares !==
    contractAmount
  ) {
    throw new Error(
      'مجموع سهم حق‌الوکاله موکلین باید دقیقاً برابر مبلغ قرارداد باشد.'
    )
  }

  return clients.map(
    (
      client,
      index
    ) => {
      const clientId =
        clean(
          client.clientId
        )

      const payments =
        getClientPayments(
          client,
          clients,
          source
        )

      const common = {
        assignedAmount:
          shares[
            index
          ],

        birthDate:
          toIsoDate(
            client.birthDate,
            'تاریخ تولد موکل'
          ),

        role:
          optionalText(
            client.role
          ),

        represent:
          optionalText(
            client.representative
          ),

        payments,
      }

     

      if (clientId) {
        return {
          clientId,

          ...common,
        }
      }

     

      const fullName =
        clean(
          client.name
        )

      const phone =
        normalizePhone(
          client.phone
        )

      if (!fullName) {
        throw new Error(
          'نام موکل جدید الزامی است.'
        )
      }

      if (
        !/^09\d{9}$/.test(
          phone
        )
      ) {
        throw new Error(
          `شماره موبایل موکل «${fullName}» معتبر نیست.`
        )
      }

      const nationalId =
        normalizeNationalId(
          client.nationalId
        )

      if (
        nationalId &&
        !/^\d{10}$/.test(
          nationalId
        )
      ) {
        throw new Error(
          `کد ملی موکل «${fullName}» باید ۱۰ رقم باشد.`
        )
      }

      return {
        fullName,

        phone,

        nationalId,

        ...common,
      }
    }
  )
}



function mapOpposingPartiesToApi(
  source:
    CreateCasePayload
): ApiOpposingPartyInput[] {
  return (
    source.opposingParties ??
    []
  )
    .filter(
      (party) =>
        hasMeaningfulValue(
          party as unknown as
            Record<
              string,
              unknown
            >
        )
    )
    .map(
      (
        party
      ): ApiOpposingPartyInput => {
        const fullName =
          clean(
            party.name
          )

        if (!fullName) {
          throw new Error(
            'نام طرف مقابل را کامل وارد کنید.'
          )
        }

        return {
          fullName,

          phone:
            optionalText(
              normalizeDigits(
                clean(
                  party.phone
                )
              )
            ),

          nationalId:
            normalizeNationalId(
              party.nationalId
            ),

          role:
            optionalText(
              party.role
            ),

          birthDate:
            toIsoDate(
              party.birthDate,
              'تاریخ تولد طرف مقابل'
            ),

          description:
            optionalText(
              party.description
            ),
        }
      }
    )
}



function mapLawyersToApi(
  lawyers:
    CreateCasePayload['coLawyers'],
  label:
    string
): ApiLawyerContactInput[] {
  return (
    lawyers ??
    []
  )
    .filter(
      (lawyer) =>
        hasMeaningfulValue(
          lawyer as unknown as
            Record<
              string,
              unknown
            >
        )
    )
    .map(
      (
        lawyer
      ): ApiLawyerContactInput => {
        const fullName =
          clean(
            lawyer.name
          )

        const phone =
          normalizeDigits(
            clean(
              lawyer.phone
            )
          )

        if (
          !fullName ||
          !phone
        ) {
          throw new Error(
            `نام و شماره تماس ${label} را کامل وارد کنید.`
          )
        }

        return {
          fullName,

          phone,

          nationalId:
            normalizeNationalId(
              lawyer.nationalId
            ),

          birthDate:
            toIsoDate(
              lawyer.birthDate,
              `تاریخ تولد ${label}`
            ),

          barLicenseNumber:
            optionalText(
              lawyer.licenseNumber
            ),

          licenseExpiresAt:
            toIsoDate(
              lawyer.licenseExpiry,
              `تاریخ اعتبار پروانه ${label}`
            ),

          licensePlaceOfIssue:
            optionalText(
              lawyer.licenseIssuePlace
            ),
        }
      }
    )
}



function mapRelatedPeopleToApi(
  source:
    CreateCasePayload
): ApiRelatedPersonInput[] {
  return (
    source.otherPersons ??
    []
  )
    .filter(
      (person) =>
        hasMeaningfulValue(
          person as unknown as
            Record<
              string,
              unknown
            >
        )
    )
    .map(
      (
        person
      ): ApiRelatedPersonInput => {
        const fullName =
          clean(
            person.name
          )

        const phone =
          normalizeDigits(
            clean(
              person.phone
            )
          )

        if (
          !fullName ||
          !phone
        ) {
          throw new Error(
            'نام و شماره تماس شخص مرتبط را کامل وارد کنید.'
          )
        }

        return {
          fullName,

          phone,

          nationalId:
            normalizeNationalId(
              person.nationalId
            ),

          birthDate:
            toIsoDate(
              person.birthDate,
              'تاریخ تولد شخص مرتبط'
            ),

          role:
            optionalText(
              person.role
            ),

          description:
            optionalText(
              person.description
            ),
        }
      }
    )
}


function mapExpensesToApi(
  expenses?:
    Expense[]
) {
  return (
    expenses ??
    []
  )
    .filter(
      (expense) =>
        hasMeaningfulValue(
          expense as unknown as
            Record<
              string,
              unknown
            >
        )
    )
    .map(
      (
        expense
      ) => {
        const title =
          clean(
            expense.title
          )

        if (!title) {
          throw new Error(
            'عنوان هزینه پرونده الزامی است.'
          )
        }

        return {
          expenseId:
            optionalText(
              expense.id
            ),

          title,

          amount:
            toFiniteNumber(
              expense.amount
            ),

          description:
            optionalText(
              expense.description
            ),

          expenseDate:
            toIsoDate(
              expense.date,
              'تاریخ هزینه'
            ),

          isPaid:
            Boolean(
              expense.isPaid
            ),
        }
      }
    )
}



export function toCreateCaseApiRequest(
  source:
    CreateCasePayload
): ApiCreateCaseRequest {
  const title =
    clean(
      source.title
    )

  const caseNumber =
    clean(
      source.caseNumber
    )

  if (!title) {
    throw new Error(
      'عنوان پرونده الزامی است.'
    )
  }

  if (!caseNumber) {
    throw new Error(
      'شماره پرونده الزامی است.'
    )
  }

  const contractAmount =
    toFiniteNumber(
      source.contractAmount ??
        source.totalFee
    )

  const paymentType =
    toApiPaymentType(
      source.paymentType
    )

  return {
    title,

    caseNumber,

    archiveNumberOffice:
      optionalText(
        source.archiveNumberOffice
      ),

    value:
      contractAmount,

    state:
      toApiCaseState(
        source.status
      ),

    description:
      optionalText(
        source.description
      ),

    paymentType,

    nonCashDescription:
      paymentType ===
      'CASH'
        ? undefined
        : optionalText(
            source
              .nonCashDescription
          ),

    estimatedPrice:
      paymentType ===
      'CASH'
        ? undefined
        : toFiniteNumber(
            source.estimatedPrice
          ) || undefined,

    court:
      mapCourtToApi(
        source
      ),

    branchHistory:
      mapBranchHistoryToApi(
        source
      ),

    clients:
      mapClientsToApi(
        source,
        contractAmount
      ),

    expenses:
      mapExpensesToApi(
        source.expenses
      ),

    opposingParties:
      mapOpposingPartiesToApi(
        source
      ),

    assistantLawyers:
      mapLawyersToApi(
        source.coLawyers,
        'وکیل همکار'
      ),

    opposingLawyers:
      mapLawyersToApi(
        source.opposingLawyers,
        'وکیل طرف مقابل'
      ),

    relatedPeople:
      mapRelatedPeopleToApi(
        source
      ),
  }
}


function flattenPayments(
  source:
    ApiCaseRecord
): Array<{
  clientId: string
  clientName: string
  payment: ApiCasePaymentRecord
}> {
  return (source.clients ?? []).flatMap(
    (client) =>
      client.payments.map(
        (payment) => ({
          clientId:
            client.clientId,

          clientName:
            client.fullName,

          payment,
        })
      )
  )
}

function getFirstDate(
  values:
    Array<
      string | undefined
    >
): string | undefined {
  return values
    .filter(
      (
        value
      ): value is string =>
        Boolean(value)
    )
    .sort(
      (
        first,
        second
      ) =>
        new Date(
          first
        ).getTime() -
        new Date(
          second
        ).getTime()
    )[0]
}

function getLastDate(
  values:
    Array<
      string | undefined
    >
): string | undefined {
  return values
    .filter(
      (
        value
      ): value is string =>
        Boolean(value)
    )
    .sort(
      (
        first,
        second
      ) =>
        new Date(
          second
        ).getTime() -
        new Date(
          first
        ).getTime()
    )[0]
}



export function fromApiCase(
  source:
    ApiCaseRecord
): Case {
  const allPayments =
    flattenPayments(
      source
    )

  const cashPayments =
    allPayments
      .filter(
        ({ payment }) =>
          payment.method ===
          'CASH'
      )
      .map(
        ({
          clientId,
          clientName,
          payment,
        }) => ({
          id:
            payment.paymentId,

          clientId,

          clientName,

          amount:
            payment.amount,

          isPaid:
            payment.isPaid,

          paymentDate:
            toJalaliDate(
              payment.dueDate
            ),

          paymentDescription:
            payment.description,

          dueDate:
            payment.dueDate,
        })
      )

  const installments =
    allPayments.map(
      ({
        clientId,
        clientName,
        payment,
      }) => ({
        id:
          payment.paymentId,

        clientId,

        clientName,

        amount:
          payment.amount,

        isPaid:
          payment.isPaid,

        paymentDate:
          toJalaliDate(
            payment.dueDate
          ),

        description:
          payment.description,

        dueDate:
          payment.dueDate,
      })
    )

  const nonCashPayments =
    allPayments
      .filter(
        ({ payment }) =>
          payment.method ===
          'NON_CASH'
      )
      .map(
        ({
          clientId,
          clientName,
          payment,
        }) => ({
          id:
            payment.paymentId,

          clientId,

          clientName,

          description:
            payment.description,

          amount:
            payment.amount,

          dueDate:
            payment.dueDate,

          deliveredDate:
            payment.isPaid
              ? payment.dueDate
              : undefined,

          isDelivered:
            payment.isPaid,
        })
      )

  const clients =
    (source.clients ?? []).map(
      (client) => ({
        clientId:
          client.clientId,

        name:
          client.fullName,

        phone:
          client.phone,

        nationalId:
          client.nationalId,

        birthDate:
          toJalaliDate(
            client.birthDate
          ),

        role:
          client.role,

        representative:
          client.represent,

        feeShareAmount:
          client.assignedAmount,
      })
    )

  const paidAmount =
    allPayments.reduce(
      (
        total,
        {
          payment,
        }
      ) =>
        payment.isPaid
          ? total +
            payment.amount
          : total,
      0
    )

  const remainingAmount =
    Math.max(
      source.value -
        paidAmount,
      0
    )

  const now =
    Date.now()

  const overdueAmount =
    allPayments.reduce(
      (
        total,
        {
          payment,
        }
      ) => {
        if (
          payment.isPaid ||
          !payment.dueDate
        ) {
          return total
        }

        const dueDate =
          new Date(
            payment.dueDate
          )

        if (
          Number.isNaN(
            dueDate.getTime()
          ) ||
          dueDate.getTime() >=
            now
        ) {
          return total
        }

        return (
          total +
          payment.amount
        )
      },
      0
    )

  const activeBranch =
    (
      source.branchHistory ??
      []
    ).find(
      (item) =>
        item.isActive
    )

  const courtType =
    source.court
      ? API_TO_UI_COURT_TYPE[
          source.court
            .type
        ]
      : undefined

  const primaryClient =
    clients[0]

  return {
    id:
      source._id,

    title:
      source.title,

    status:
      fromApiCaseState(
        source.state
      ),

    createdAt:
      source.createdAt,

    updatedAt:
      source.updatedAt,

    closedAt:
      source.state ===
      'DONE'
        ? source.updatedAt
        : undefined,

    caseNumber:
      source.caseNumber,

    archiveNumberOffice:
      source.archiveNumberOffice,

    description:
      source.description,

    clients,

    clientId:
      primaryClient
        ?.clientId,

    clientName:
      primaryClient
        ?.name,

    clientPhone:
      primaryClient
        ?.phone,

    opposingParties:
      (source.opposingParties ?? []).map(
        (party) => ({
          name:
            party.fullName,

          phone:
            party.phone,

          nationalId:
            party.nationalId,

          role:
            party.role,

          birthDate:
            toJalaliDate(
              party.birthDate
            ),

          description:
            party.description,
        })
      ),

    coLawyers:
      (source.assistantLawyers ?? []).map(
        (lawyer) => ({
          name:
            lawyer.fullName,

          phone:
            lawyer.phone,

          nationalId:
            lawyer.nationalId,

          birthDate:
            toJalaliDate(
              lawyer.birthDate
            ),

          licenseNumber:
            lawyer.barLicenseNumber,

          licenseExpiry:
            toJalaliDate(
              lawyer.licenseExpiresAt
            ),

          licenseIssuePlace:
            lawyer.licensePlaceOfIssue,
        })
      ),

    opposingLawyers:
      (source.opposingLawyers ?? []).map(
        (lawyer) => ({
          name:
            lawyer.fullName,

          phone:
            lawyer.phone,

          nationalId:
            lawyer.nationalId,

          birthDate:
            toJalaliDate(
              lawyer.birthDate
            ),

          licenseNumber:
            lawyer.barLicenseNumber,

          licenseExpiry:
            toJalaliDate(
              lawyer.licenseExpiresAt
            ),

          licenseIssuePlace:
            lawyer.licensePlaceOfIssue,
        })
      ),

    otherPersons:
      (source.relatedPeople ?? []).map(
        (person) => ({
          name:
            person.fullName,

          phone:
            person.phone,

          nationalId:
            person.nationalId,

          birthDate:
            toJalaliDate(
              person.birthDate
            ),

          role:
            person.role,

          description:
            person.description,
        })
      ),

    province:
      source.court
        ?.province ??
      activeBranch
        ?.province,

    city:
      source.court
        ?.city ??
      activeBranch
        ?.city,

    courtType,

    courtBranch:
      source.court
        ? {
            province:
              source.court
                .province,

            city:
              source.court
                .city,

            courtType,

            branch:
              source.court
                .branch,

            currentBranchNumber:
              source.court
                .branch,

            archiveNumberBranch:
              source.court
                .archiveNumberBranch ??
              activeBranch
                ?.archiveNumberBranch,

            branchHistory:
              (
                source.branchHistory ??
                []
              ).map(
                (item) => ({
                  province:
                    item.province,

                  city:
                    item.city,

                  branchNumber:
                    item.branchNumber,

                  archiveNumberBranch:
                    item.archiveNumberBranch,

                  date:
                    toJalaliDate(
                      item.date
                    ),

                  isActive:
                    item.isActive,
                })
              ),
          }
        : undefined,

    archiveNumberBranch:
      source.court
        ?.archiveNumberBranch ??
      activeBranch
        ?.archiveNumberBranch,

    branchHistory:
      (
        source.branchHistory ??
        []
      ).map(
        (item) => ({
          province:
            item.province,

          city:
            item.city,

          branchNumber:
            item.branchNumber,

          archiveNumberBranch:
            item.archiveNumberBranch,

          date:
            toJalaliDate(
              item.date
            ),

          isActive:
            item.isActive,
        })
      ),

    paymentType:
      fromApiPaymentType(
        source.paymentType
      ),

    contractAmount:
      source.value,

    totalFee:
      source.value,

   
    totalAmount:
      source.value,

    paidAmount,

    remainingAmount,

    overdueAmount,

    dueDate:
      getFirstDate(
        allPayments
          .filter(
            ({ payment }) =>
              !payment.isPaid
          )
          .map(
            ({ payment }) =>
              payment.dueDate
          )
      ),

    lastPaymentDate:
      getLastDate(
        allPayments
          .filter(
            ({ payment }) =>
              payment.isPaid
          )
          .map(
            ({ payment }) =>
              payment.dueDate
          )
      ),

    cashPayments,

    installments,

    nonCashPayments,

    expenses:
      (source.expenses ?? []).map(
        (expense) => ({
          id:
            expense.expenseId,

          title:
            expense.title,

          amount:
            expense.amount,

          date:
            toJalaliDate(
              expense.expenseDate
            ),

          description:
            expense.description,

          isPaid:
            expense.isPaid,
        })
      ),

    nonCashDescription:
      source.nonCashDescription ??
      '',

    estimatedPrice:
      source.estimatedPrice,
  }
}