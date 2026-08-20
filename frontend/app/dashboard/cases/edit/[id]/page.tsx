'use client'

import { use, useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCasesStore } from '@/store/cases.store'
import { useRouter } from 'next/navigation'
import { ArrowRight, Plus, X, ChevronDown, Users, UserX } from 'lucide-react'
import Link from 'next/link'
import {
  useClientStore,
  type Client,
} from '@/store/client.store'

import type {
  UpdateCasePayload,
} from '@/types/case'

import {
  formatDateInput,
  parseFinanceDate,
} from '@/features/finance/utils/date'

import {
  formatMoneyInput,
  normalizeDigits,
  toFiniteNumber,
  toOptionalFiniteNumber,
} from '@/features/finance/utils/number'

type EditCasePageProps = {
  params: Promise<{ id: string }>
}

const PROVINCES = [
  'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'خوزستان', 'آذربایجان شرقی',
  'مازندران', 'کرمان', 'گیلان', 'آذربایجان غربی', 'همدان', 'کرمانشاه',
  'مرکزی', 'لرستان', 'قزوین', 'سمنان', 'یزد', 'اردبیل', 'زنجان',
  'کردستان', 'بوشهر', 'قم', 'هرمزگان', 'چهارمحال و بختیاری', 'ایلام',
  'کهگیلویه و بویراحمد', 'گلستان', 'خراسان شمالی', 'خراسان جنوبی',
  'البرز', 'سیستان و بلوچستان',
]

const COURT_TYPES = [
  'دادگاه عمومی',
  'دادگاه انقلاب',
  'دادگاه کیفری',
  'دادگاه خانواده',
  'دادگاه اطفال',
  'دادگاه کار',
  'دادگاه اصناف',
  'دادگاه حقوقی',
  'دادگاه تجدیدنظر',
]

const optionalTextSchema = z.string().trim().optional()

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => !value || /^09\d{9}$/.test(value), {
    message: 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود',
  })
  .optional()

const optionalNumberSchema = z.preprocess(
  (value) =>
    toOptionalFiniteNumber(value),
  z
    .number()
    .min(
      0,
      'مبلغ نمی‌تواند منفی باشد'
    )
    .optional()
)

const lawyerSchema = z.object({
  name: optionalTextSchema,
  phone: optionalPhoneSchema,
  nationalId: optionalTextSchema,
  birthDate: optionalTextSchema,
  role: optionalTextSchema,
  licenseNumber: optionalTextSchema,
  licenseExpiry: optionalTextSchema,
  licenseIssuePlace: optionalTextSchema,
})

const clientSchema = z.object({
  clientId: optionalTextSchema,
  name: optionalTextSchema,
  phone: optionalPhoneSchema,
  nationalId: optionalTextSchema,
  birthDate: optionalTextSchema,
  role: optionalTextSchema,
  representative: optionalTextSchema,
  feeShareAmount: optionalNumberSchema,
})

const opposingPartySchema = z.object({
  name: optionalTextSchema,
  phone: optionalPhoneSchema,
  nationalId: optionalTextSchema,
  role: optionalTextSchema,
  birthDate: optionalTextSchema,
  description: optionalTextSchema,
})

const otherPersonSchema = z.object({
  name: optionalTextSchema,
  phone: optionalPhoneSchema,
  nationalId: optionalTextSchema,
  birthDate: optionalTextSchema,
  role: optionalTextSchema,
  description: optionalTextSchema,
})

const paymentSchema = z.object({

  paymentId:
    optionalTextSchema,

  clientId:
    optionalTextSchema,

  clientName:
    optionalTextSchema,

  amount:
    optionalNumberSchema,

  isPaid:
    z
      .boolean()
      .optional(),

  paymentDate:
    optionalTextSchema,

  paymentDescription:
    optionalTextSchema,
})

const branchHistorySchema = z.object({
  province: optionalTextSchema,
  city: optionalTextSchema,
  branchNumber: optionalTextSchema,
  archiveNumberBranch: optionalTextSchema,
  date: optionalTextSchema,
  isActive: z.boolean(),
})

const expenseSchema = z.object({

  expenseId:
    optionalTextSchema,

  title:
    optionalTextSchema,

  amount:
    optionalNumberSchema,

  date:
    optionalTextSchema,

  description:
    optionalTextSchema,

  isPaid:
    z
      .boolean()
      .optional(),
})

const caseSchema = z.object({
  title: z.string().trim().min(1, 'عنوان پرونده الزامی است'),
  status: z.enum(['pending', 'in-progress', 'completed', 'archived']),
  clients: z.array(clientSchema).optional(),
  opposingParties: z.array(opposingPartySchema).optional(),
  caseNumber: z
    .string()
    .trim()
    .min(
      1,
      'شماره پرونده الزامی است'
    ),

  archiveNumberOffice:
    optionalTextSchema,

  archiveNumberBranch:
    optionalTextSchema,
  province: optionalTextSchema,
  city: optionalTextSchema,
  courtType: optionalTextSchema,
  courtBranch: optionalTextSchema,
  branchHistory: z.array(branchHistorySchema).optional(),
  coLawyers: z.array(lawyerSchema).optional(),
  opposingLawyers: z.array(lawyerSchema).optional(),
  description: optionalTextSchema,
  paymentType: z.enum(['cash', 'non-cash', 'both']).default('cash'),
  cashPayments: z.array(paymentSchema).optional(),
  nonCashDescription: optionalTextSchema,
  estimatedPrice: optionalNumberSchema,
  contractAmount: optionalNumberSchema,
  remainingAmount: optionalNumberSchema,
  overdueAmount: optionalNumberSchema,
  expenses: z.array(expenseSchema).optional(),
  otherPersons: z.array(otherPersonSchema).optional(),
}).superRefine((data, context) => {
  const clients = (data.clients ?? [])
    .map((client, index) => ({
      ...client,
      index,
      identity: client.clientId?.trim() || client.name?.trim() || '',
      share: toFiniteNumber(client.feeShareAmount),
    }))
    .filter((client) => Boolean(client.identity))

  const contractAmount = toFiniteNumber(data.contractAmount)

  if (clients.length > 1 && contractAmount > 0) {
    clients.forEach((client) => {
      if (client.share <= 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['clients', client.index, 'feeShareAmount'],
          message: 'سهم حق‌الوکاله این موکل را وارد کنید',
        })
      }
    })

    const totalShares = clients.reduce((sum, client) => sum + client.share, 0)

    if (totalShares !== contractAmount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contractAmount'],
        message: 'مجموع سهم موکلین باید دقیقاً برابر مبلغ کل قرارداد باشد',
      })
    }
  }

  const requiresClientForPayment = clients.length > 1 && data.paymentType !== 'non-cash'

  if (!requiresClientForPayment) {
    return
  }

  const validClientKeys = new Set(clients.map((client) => client.identity))
  const scheduledByClient = new Map<string, number>()

    ; (data.cashPayments ?? []).forEach((payment, index) => {
      const amount = toFiniteNumber(payment.amount)

      if (amount <= 0) {
        return
      }

      const paymentClientKey = payment.clientId?.trim() || payment.clientName?.trim() || ''

      if (!paymentClientKey) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cashPayments', index, 'clientId'],
          message: 'موکل مرتبط با این پرداخت را مشخص کنید',
        })
        return
      }

      if (!validClientKeys.has(paymentClientKey)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cashPayments', index, 'clientId'],
          message: 'موکل انتخاب‌شده در پرونده وجود ندارد',
        })
        return
      }

      scheduledByClient.set(paymentClientKey, (scheduledByClient.get(paymentClientKey) ?? 0) + amount)
    })

  clients.forEach((client) => {
    const scheduled = scheduledByClient.get(client.identity) ?? 0

    if (scheduled > client.share) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clients', client.index, 'feeShareAmount'],
        message: 'مجموع اقساط این موکل از سهم حق‌الوکاله او بیشتر است',
      })
    }
  })
})


type CaseFormInput =
  z.input<typeof caseSchema>

type CaseFormData =
  z.output<typeof caseSchema>


type CaseFormContext =
  Record<string, never>

type BranchHistoryItem =
  z.output<typeof branchHistorySchema>

type CourtLocationField =
  | 'province'
  | 'city'
  | 'branchNumber'
  | 'archiveNumberBranch'



function cleanText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return String(value)
  }

  return ''
}



function hasText(value: unknown): boolean {
  return cleanText(value).length > 0
}

const getSavedClientFullName = (client: Client): string => {
  return client.fullName?.trim() || ''
}



const hasCourtLocationValue = (location?: Partial<BranchHistoryItem>) => {
  if (!location) return false

  return Boolean(
    hasText(location.province) ||
    hasText(location.city) ||
    hasText(location.branchNumber) ||
    hasText(location.archiveNumberBranch)
  )
}


const normalizePaymentType = (value: unknown): 'cash' | 'non-cash' | 'both' => {
  if (value === 'both') return 'both'
  if (value === 'non-cash' || value === 'installment') return 'non-cash'

  return 'cash'
}



type UnknownRecord = Record<string, unknown>

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}


/**
 * یک مقدار ناشناخته را فقط درصورتی به آرایه objectها
 * تبدیل می‌کند که واقعاً آرایه باشد.
 */
function toRecordArray(
  value: unknown,
): UnknownRecord[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(isRecord)
}

/**
 * statusهای قدیمی یا نامعتبر را به یکی از statusهای
 * معتبر فرم تبدیل می‌کند.
 */
function normalizeCaseStatus(
  value: unknown,
): CaseFormData['status'] {
  switch (value) {
    case 'pending':
    case 'in-progress':
    case 'completed':
    case 'archived':
      return value

    default:
      return 'pending'
  }
}

/**
 * مقدار ورودی مبلغ ممکن است string یا number باشد.
 * Zod هنگام submit آن را به number تبدیل خواهد کرد.
 */
function normalizeNumberInput(
  value: unknown,
): string | number | undefined {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value
  }

  if (typeof value === 'string') {
    const normalizedValue =
      value.trim()

    return normalizedValue.length > 0
      ? normalizedValue
      : undefined
  }

  return undefined
}

function createEmptyClient():
  NonNullable<
    CaseFormInput['clients']
  >[number] {
  return {
    clientId: '',
    name: '',
    phone: '',
    nationalId: '',
    birthDate: '',
    role: '',
    representative: '',
    feeShareAmount: undefined,
  }
}

function normalizeClients(
  value: unknown,
): NonNullable<
  CaseFormInput['clients']
> {
  return toRecordArray(value).map(
    (client) => ({
      clientId: cleanText(client.clientId),
      name: cleanText(client.name),
      phone: cleanText(client.phone),

      nationalId: cleanText(
        client.nationalId,
      ),

      birthDate: cleanText(
        client.birthDate,
      ),

      role: cleanText(client.role),

      representative:
        getFirstTextValue(
          client.representative,
          client.role,
        ),

      feeShareAmount:
        formatMoneyInput(
          client.feeShareAmount as
            | string
            | number
            | undefined
        ) || undefined,
    }),
  )
}

function normalizeOpposingParties(
  value: unknown,
): NonNullable<
  CaseFormInput['opposingParties']
> {
  return toRecordArray(value).map(
    (party) => ({
      name: cleanText(party.name),
      phone: cleanText(party.phone),

      nationalId: cleanText(
        party.nationalId,
      ),

      role: cleanText(party.role),

      birthDate: cleanText(
        party.birthDate,
      ),

      description: cleanText(
        party.description,
      ),
    }),
  )
}

function normalizeLawyers(
  value: unknown,
): NonNullable<
  CaseFormInput['coLawyers']
> {
  return toRecordArray(value).map(
    (lawyer) => ({
      name: cleanText(lawyer.name),
      phone: cleanText(lawyer.phone),

      nationalId: cleanText(
        lawyer.nationalId,
      ),

      birthDate: cleanText(
        lawyer.birthDate,
      ),

      role: cleanText(
        lawyer.role,
      ),

      licenseNumber: cleanText(
        lawyer.licenseNumber,
      ),

      licenseExpiry: cleanText(
        lawyer.licenseExpiry,
      ),

      licenseIssuePlace: cleanText(
        lawyer.licenseIssuePlace,
      ),
    }),
  )
}

function normalizeOtherPersons(
  value: unknown,
): NonNullable<
  CaseFormInput['otherPersons']
> {
  return toRecordArray(value).map(
    (person) => ({
      name: cleanText(person.name),
      phone: cleanText(person.phone),

      nationalId: cleanText(
        person.nationalId,
      ),

      birthDate: cleanText(
        person.birthDate,
      ),

      role: cleanText(person.role),

      description: cleanText(
        person.description,
      ),
    }),
  )
}

function normalizePayments(
  value:
    unknown
): NonNullable<
  CaseFormInput['cashPayments']
> {
  return toRecordArray(
    value
  ).map(
    (
      payment
    ) => ({

      paymentId:
        cleanText(
          payment.id ??
          payment.paymentId
        ),

      clientId:
        cleanText(
          payment.clientId
        ),

      clientName:
        cleanText(
          payment.clientName
        ),

      amount:
        formatMoneyInput(
          payment.amount as
            | string
            | number
            | undefined
        ) || undefined,

      isPaid:
        payment.isPaid ===
        true,

      paymentDate:
        cleanText(
          payment.paymentDate
        ),

      paymentDescription:
        cleanText(
          payment.paymentDescription ??
          payment.description
        ),
    })
  )
}




function normalizeExpenses(
  value:
    unknown
): NonNullable<
  CaseFormInput['expenses']
> {
  return toRecordArray(
    value
  ).map(
    (
      expense
    ) => ({

      expenseId:
        cleanText(
          expense.id ??
          expense.expenseId
        ),

      title:
        cleanText(
          expense.title
        ),

      amount:
        formatMoneyInput(
          expense.amount as
            | string
            | number
            | undefined
        ) || undefined,

      date:
        cleanText(
          expense.date
        ),

      description:
        cleanText(
          expense.description
        ),

      isPaid:
        expense.isPaid ===
        true,
    })
  )
}






function getFirstTextValue(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (typeof value !== 'string') {
      continue
    }

    const normalizedValue = value.trim()

    if (normalizedValue.length > 0) {
      return normalizedValue
    }
  }

  return ''
}

function getCourtBranchObject(
  caseItem: unknown,
): UnknownRecord | undefined {
  if (!isRecord(caseItem)) {
    return undefined
  }

  if (!isRecord(caseItem.courtBranch)) {
    return undefined
  }

  return caseItem.courtBranch
}

function normalizeBranchHistory(
  caseItem: unknown,
): BranchHistoryItem[] {
  const caseRecord: UnknownRecord =
    isRecord(caseItem)
      ? caseItem
      : {}

  const courtBranch =
    getCourtBranchObject(caseItem)

  const courtBranchHistory =
    courtBranch?.branchHistory

  const caseBranchHistory =
    caseRecord.branchHistory

  const rawHistory: unknown[] =
    Array.isArray(courtBranchHistory)
      ? courtBranchHistory
      : Array.isArray(caseBranchHistory)
        ? caseBranchHistory
        : []

  const normalizedHistory: BranchHistoryItem[] =
    rawHistory.map(
      (
        rawItem: unknown,
        index: number,
      ): BranchHistoryItem => {
        const item: UnknownRecord =
          isRecord(rawItem)
            ? rawItem
            : {}

        const isFirstItem = index === 0

        return {
          province: getFirstTextValue(
            item.province,
            isFirstItem
              ? courtBranch?.province
              : undefined,
            isFirstItem
              ? caseRecord.province
              : undefined,
          ),

          city: getFirstTextValue(
            item.city,
            isFirstItem
              ? courtBranch?.city
              : undefined,
            isFirstItem
              ? caseRecord.city
              : undefined,
          ),

          branchNumber: getFirstTextValue(
            item.branchNumber,
            item.branch,
            item.courtBranch,
          ),

          archiveNumberBranch:
            getFirstTextValue(
              item.archiveNumberBranch,
              isFirstItem
                ? courtBranch
                  ?.archiveNumberBranch
                : undefined,
              isFirstItem
                ? caseRecord
                  .archiveNumberBranch
                : undefined,
            ),

          date: getFirstTextValue(
            item.date,
          ),

          isActive:
            item.isActive === true,
        }
      },
    )

  const cleanedHistory: BranchHistoryItem[] =
    normalizedHistory.filter(
      (
        item: BranchHistoryItem,
      ): boolean => {
        return hasCourtLocationValue(item)
      },
    )


  if (cleanedHistory.length === 0) {
    const rawCourtBranch =
      caseRecord.courtBranch

    return [
      {
        province: getFirstTextValue(
          courtBranch?.province,
          caseRecord.province,
        ),

        city: getFirstTextValue(
          courtBranch?.city,
          caseRecord.city,
        ),

        branchNumber: getFirstTextValue(
          courtBranch
            ?.currentBranchNumber,
          courtBranch?.branch,

          typeof rawCourtBranch ===
            'string'
            ? rawCourtBranch
            : undefined,
        ),

        archiveNumberBranch:
          getFirstTextValue(
            courtBranch
              ?.archiveNumberBranch,
            caseRecord
              .archiveNumberBranch,
          ),

        date: '',

        isActive: true,
      },
    ]
  }

  const hasActiveLocation =
    cleanedHistory.some(
      (
        item: BranchHistoryItem,
      ): boolean => {
        return item.isActive === true
      },
    )


  if (!hasActiveLocation) {
    const lastIndex =
      cleanedHistory.length - 1

    return cleanedHistory.map(
      (
        item: BranchHistoryItem,
        index: number,
      ): BranchHistoryItem => ({
        ...item,
        isActive: index === lastIndex,
      }),
    )
  }

  return cleanedHistory
}

export default function EditCasePage({ params }: EditCasePageProps) {
  const {
    id,
  } =
    use(
      params
    )

  const router =
    useRouter()



  const getCaseById =
    useCasesStore(
      (state) =>
        state.getCaseById
    )

  const updateCase =
    useCasesStore(
      (state) =>
        state.updateCase
    )

  const fetchCaseById =
    useCasesStore(
      (state) =>
        state.fetchCaseById
    )

  const isCaseLoading =
    useCasesStore(
      (state) =>
        state.isLoading
    )

  const isCaseSaving =
    useCasesStore(
      (state) =>
        state.isSaving
    )

  const caseError =
    useCasesStore(
      (state) =>
        state.error
    )

  const clearCaseError =
    useCasesStore(
      (state) =>
        state.clearError
    )



  const savedClients =
    useClientStore(
      (state) =>
        state.clients
    )

  const fetchAllClients =
    useClientStore(
      (state) =>
        state.fetchAllClients
    )

  const isClientsLoading =
    useClientStore(
      (state) =>
        state.isLoading
    )

  const clientsError =
    useClientStore(
      (state) =>
        state.error
    )
  //   const caseItem = getCaseById(id)

  // const courtBranchData =
  //   getCourtBranchObject(caseItem)

  // const initialBranchHistory =
  //   normalizeBranchHistory(caseItem)

  // const activeInitialCourtLocation =
  //   initialBranchHistory.find(
  //     (
  //       location: BranchHistoryItem,
  //     ): boolean =>
  //       location.isActive === true,
  //   ) ?? initialBranchHistory[0]

  // const initialPaymentType =
  //   normalizePaymentType(
  //     caseItem?.paymentType,
  //   )

  // const initialCourtType =
  //   getFirstTextValue(
  //     courtBranchData?.courtType,
  //     caseItem?.courtType,
  //   )



  // const [paymentType, setPaymentType] = useState<'cash' | 'non-cash' | 'both'>(initialPaymentType)
  // const [isCourtTypeDropdownOpen, setIsCourtTypeDropdownOpen] = useState(false)
  // const [courtTypeInput, setCourtTypeInput] = useState(initialCourtType)
  // const [filteredCourtTypes, setFilteredCourtTypes] = useState(COURT_TYPES)
  // const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false)


  useEffect(() => {
    void fetchAllClients()
  }, [
    fetchAllClients,
  ])

  useEffect(() => {
    if (
      getCaseById(id)
    ) {
      setDidRequestCase(true)
      return
    }

    let isMounted = true

    void fetchCaseById(id)
      .finally(() => {
        if (isMounted) {
          setDidRequestCase(true)
        }
      })

    return () => {
      isMounted = false
    }
  }, [
    fetchCaseById,
    getCaseById,
    id,
  ])

  const caseItem =
    getCaseById(id)

  const caseRecord: UnknownRecord =
    isRecord(caseItem)
      ? caseItem
      : {}

  const courtBranchData =
    getCourtBranchObject(caseItem)

  const initialBranchHistory =
    normalizeBranchHistory(caseItem)

  const activeInitialCourtLocation =
    initialBranchHistory.find(
      (
        location: BranchHistoryItem,
      ): boolean =>
        location.isActive === true,
    ) ?? initialBranchHistory[0]

  const initialPaymentType =
    normalizePaymentType(
      caseRecord.paymentType,
    )

  const initialCourtType =
    getFirstTextValue(
      courtBranchData?.courtType,
      caseRecord.courtType,
    )

  const normalizedClients =
    normalizeClients(
      caseRecord.clients,
    )

  /**
   * تمام مقدارهای اولیه فرم را قبل از ارسال به
   * React Hook Form نرمال می‌کنیم.
   */
  const formDefaultValues:
    CaseFormInput = {
    title: cleanText(
      caseRecord.title,
    ),

    status: normalizeCaseStatus(
      caseRecord.status,
    ),

    paymentType:
      initialPaymentType,

    caseNumber: cleanText(
      caseRecord.caseNumber,
    ),

    archiveNumberOffice:
      getFirstTextValue(
        caseRecord.archiveNumberOffice,
        caseRecord.archiveNumberLawyer,
      ),

    cashPayments:
      normalizePayments(
        caseRecord.cashPayments,
      ),

    clients:
      normalizedClients.length > 0
        ? normalizedClients
        : [createEmptyClient()],

    opposingParties:
      normalizeOpposingParties(
        caseRecord.opposingParties,
      ),

    coLawyers:
      normalizeLawyers(
        caseRecord.coLawyers,
      ),

    opposingLawyers:
      normalizeLawyers(
        caseRecord.opposingLawyers,
      ),

    branchHistory:
      initialBranchHistory,

    province:
      activeInitialCourtLocation
        ?.province ?? '',

    city:
      activeInitialCourtLocation
        ?.city ?? '',

    courtType:
      initialCourtType,

    courtBranch:
      activeInitialCourtLocation
        ?.branchNumber ?? '',

    archiveNumberBranch:
      activeInitialCourtLocation
        ?.archiveNumberBranch ??
      '',

    nonCashDescription:
      getFirstTextValue(
        caseRecord.nonCashDescription,

        /**
         * پشتیبانی موقت از نام قدیمی این فیلد.
         */
        caseRecord.installmentDescription,
      ),

    contractAmount:
      formatMoneyInput(
        caseRecord.contractAmount as
          | string
          | number
          | undefined
      ) || undefined,

    remainingAmount:
      toFiniteNumber(
        caseRecord.remainingAmount,
      ) || undefined,

    overdueAmount:
      toFiniteNumber(
        caseRecord.overdueAmount,
      ) || undefined,

    estimatedPrice:
      formatMoneyInput(
        caseRecord.estimatedPrice as
          | string
          | number
          | undefined
      ) || undefined,

    expenses:
      normalizeExpenses(
        caseRecord.expenses,
      ),

    otherPersons:
      normalizeOtherPersons(
        caseRecord.otherPersons,
      ),

    description:
      cleanText(
        caseRecord.description,
      ),
  }

  const [
    didRequestCase,
    setDidRequestCase,
  ] = useState(
    Boolean(caseItem)
  )

  const [
    paymentType,
    setPaymentType,
  ] = useState<
    CaseFormData['paymentType']
  >(initialPaymentType)

  const [
    isCourtTypeDropdownOpen,
    setIsCourtTypeDropdownOpen,
  ] = useState(false)

  const [
    courtTypeInput,
    setCourtTypeInput,
  ] = useState(initialCourtType)

  const [
    filteredCourtTypes,
    setFilteredCourtTypes,
  ] = useState<string[]>(
    COURT_TYPES,
  )

  const [
    isBranchDropdownOpen,
    setIsBranchDropdownOpen,
  ] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<
    CaseFormInput,
    CaseFormContext,
    CaseFormData
  >({
    resolver:
      zodResolver(caseSchema),

    shouldUnregister:
      false,

    defaultValues:
      formDefaultValues,

    mode: 'onSubmit',

    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (!caseItem) {
      return
    }

    reset(
      formDefaultValues,
      {
        keepDefaultValues: false,
      }
    )

    setPaymentType(
      initialPaymentType
    )

    setCourtTypeInput(
      initialCourtType
    )

    setFilteredCourtTypes(
      COURT_TYPES
    )
  }, [
    caseItem,
    reset,
  ])



  const { fields: cashPaymentFields, append: appendCashPayment, remove: removeCashPayment } = useFieldArray({
    control,
    name: 'cashPayments',
  })

  const { fields: clientFields, append: appendClient, remove: removeClient } = useFieldArray({
    control,
    name: 'clients',
  })

  const { fields: opposingPartyFields, append: appendOpposingParty, remove: removeOpposingParty } = useFieldArray({
    control,
    name: 'opposingParties',
  })

  const { fields: coLawyerFields, append: appendCoLawyer, remove: removeCoLawyer } = useFieldArray({
    control,
    name: 'coLawyers',
  })

  const { fields: opposingLawyerFields, append: appendOpposingLawyer, remove: removeOpposingLawyer } = useFieldArray({
    control,
    name: 'opposingLawyers',
  })

  const { append: appendBranchHistory } = useFieldArray({
    control,
    name: 'branchHistory',
  })

  const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({
    control,
    name: 'expenses',
  })

  const { fields: otherPersonFields, append: appendOtherPerson, remove: removeOtherPerson } = useFieldArray({
    control,
    name: 'otherPersons',
  })

  const watchCashPayments = watch('cashPayments') || []
  const watchBranchHistory = watch('branchHistory') || []
  const watchExpenses = watch('expenses') || []
  const watchClients = watch('clients') || []

  const contractAmount = toFiniteNumber(watch('contractAmount'))

  const activeClients = watchClients
    .map((client, index) => ({
      index,
      clientId: client.clientId?.trim() || undefined,
      clientName: client.name?.trim() || '',
      feeShareAmount: toFiniteNumber(client.feeShareAmount),
    }))
    .filter((client) => Boolean(client.clientId || client.clientName))

  const getClientOptionValue = (client: { clientId?: string; clientName: string }): string => {
    if (client.clientId) {
      return `id:${client.clientId}`
    }
    return `name:${client.clientName}`
  }

  const allocatedFeeTotal = activeClients.reduce<number>(
    (total, client) => total + client.feeShareAmount,
    0
  )

  const unallocatedFeeAmount = contractAmount - allocatedFeeTotal

  const splitFeeEqually = () => {
    if (activeClients.length === 0 || contractAmount <= 0) {
      return
    }

    const baseAmount = Math.floor(contractAmount / activeClients.length)
    let assignedAmount = 0

    activeClients.forEach((client, position) => {
      const isLastClient = position === activeClients.length - 1
      const clientShare = isLastClient ? contractAmount - assignedAmount : baseAmount
      assignedAmount += clientShare

      setValue(
        `clients.${client.index}.feeShareAmount`,
        formatMoneyInput(clientShare),
        {
        shouldDirty: true,
          shouldValidate: true,
        }
      )
    })
  }
  const activeCourtLocationIndex = watchBranchHistory.findIndex((location) => location.isActive)
  const activeCourtLocation =
    activeCourtLocationIndex >= 0 ? watchBranchHistory[activeCourtLocationIndex] : undefined
  const activeBranch = activeCourtLocation?.branchNumber || ''
  const courtLocationHistory = watchBranchHistory
    .map((location, index) => ({ location, index }))
    .filter(({ location, index }) => index !== activeCourtLocationIndex && hasCourtLocationValue(location))

  const expensesTotal =
    watchExpenses.reduce(
      (sum, item) =>
        sum +
        toFiniteNumber(
          item.amount
        ),
      0
    )

  const today = new Date()
  today.setHours(
    0,
    0,
    0,
    0
  )

  const totalPaid =
    watchCashPayments.reduce(
      (sum, payment) => {
        if (payment.isPaid) {
          return (
            sum +
            toFiniteNumber(
              payment.amount
            )
          )
        }

        return sum
      },
      0
    )

  const overdueTotal =
    watchCashPayments.reduce(
      (sum, payment) => {
        if (
          payment.isPaid ||
          !payment.paymentDate
        ) {
          return sum
        }

        const payDate =
          parseFinanceDate(
            payment.paymentDate
          )

        if (!payDate) {
          return sum
        }

        const normalizedPayDate =
          new Date(
            payDate.getTime()
          )

        normalizedPayDate.setHours(
          0,
          0,
          0,
          0
        )

        if (
          normalizedPayDate.getTime() <
          today.getTime()
        ) {
          return (
            sum +
            toFiniteNumber(
              payment.amount
            )
          )
        }

        return sum
      },
      0
    )

  const totalCash =
    watchCashPayments.reduce(
      (sum, payment) =>
        sum +
        toFiniteNumber(
          payment.amount
        ),
      0
    )

  useEffect(() => {
    const remaining = Math.max(contractAmount - totalPaid, 0)

    setValue('remainingAmount', remaining)
    setValue('overdueAmount', overdueTotal)
  }, [contractAmount, totalPaid, overdueTotal, setValue])

  const singleClientIndex = activeClients.length === 1 ? activeClients[0].index : null

  const singleClientCurrentShare =
    activeClients.length === 1 ? activeClients[0].feeShareAmount : null

  useEffect(() => {
    if (singleClientIndex === null) {
      return
    }

    if (singleClientCurrentShare === contractAmount) {
      return
    }

    setValue(
      `clients.${singleClientIndex}.feeShareAmount`,
      formatMoneyInput(
        contractAmount
      ),
      {
        shouldDirty: false,
        shouldValidate: false,
      }
    )
  }, [contractAmount, setValue, singleClientCurrentShare, singleClientIndex])

  const setOptionalNumberValue = (
    value: unknown
  ) =>
    toOptionalFiniteNumber(
      value
    )

  const fillClientFromSavedList = (index: number, savedClientId: string) => {
    setValue(`clients.${index}.clientId`, savedClientId, { shouldDirty: true })

    if (!savedClientId) {
      setValue(`clients.${index}.name`, '')
      setValue(`clients.${index}.phone`, '')
      setValue(`clients.${index}.nationalId`, '')
      setValue(`clients.${index}.birthDate`, '')
      setValue(`clients.${index}.role`, '')
      setValue(`clients.${index}.representative`, '')
      return
    }

    const selectedClient = savedClients.find((client) => client.id === savedClientId)
    if (!selectedClient) return

    setValue(`clients.${index}.name`, getSavedClientFullName(selectedClient), { shouldDirty: true })
    setValue(`clients.${index}.phone`, selectedClient.phoneNumber || selectedClient.phone || '', { shouldDirty: true })
    setValue(`clients.${index}.nationalId`, selectedClient.nationalId || '', { shouldDirty: true })
    setValue(`clients.${index}.birthDate`, selectedClient.birthDate || '', { shouldDirty: true })
    setValue(`clients.${index}.role`, selectedClient.role || '', { shouldDirty: true })
    setValue(
      `clients.${index}.representative`,
      selectedClient.representative ||
        selectedClient.role ||
        '',
      { shouldDirty: true }
    )
  }

  const getCurrentJalaliDateParts = () => {
    const parts = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date())

    const year = Number(normalizeDigits(parts.find((part) => part.type === 'year')?.value || '0'))
    const month = Number(normalizeDigits(parts.find((part) => part.type === 'month')?.value || '0'))
    const day = Number(normalizeDigits(parts.find((part) => part.type === 'day')?.value || '0'))

    return { year, month, day }
  }

  const getJalaliAge = (birthDate?: string) => {
    if (!birthDate) return null

    const normalizedBirthDate = normalizeDigits(birthDate.trim())
    const match = normalizedBirthDate.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/)

    if (!match) return null

    const birthYear = Number(match[1])
    const birthMonth = Number(match[2])
    const birthDay = Number(match[3])

    if (!birthYear || !birthMonth || !birthDay) return null

    const todayJalali = getCurrentJalaliDateParts()
    let age = todayJalali.year - birthYear

    if (todayJalali.month < birthMonth || (todayJalali.month === birthMonth && todayJalali.day < birthDay)) {
      age -= 1
    }

    return age
  }

  const isUnderLegalAge = (birthDate?: string) => {
    const age = getJalaliAge(birthDate)
    return age !== null && age < 18
  }

  const handleCourtTypeInputChange = (value: string) => {
    setCourtTypeInput(value)
    setValue('courtType', value, { shouldDirty: true })
    setFilteredCourtTypes(COURT_TYPES.filter((type) => type.includes(value)))
    setIsCourtTypeDropdownOpen(true)
  }

  const selectCourtType = (courtType: string) => {
    setCourtTypeInput(courtType)
    setValue('courtType', courtType, { shouldDirty: true })
    setIsCourtTypeDropdownOpen(false)
  }

  const updateActiveCourtLocationField = (fieldName: CourtLocationField, value: string) => {
    if (activeCourtLocationIndex === -1) return

    if (fieldName === 'province') {
      setValue(`branchHistory.${activeCourtLocationIndex}.province`, value, { shouldDirty: true })
      setValue('province', value, { shouldDirty: true })
    }

    if (fieldName === 'city') {
      setValue(`branchHistory.${activeCourtLocationIndex}.city`, value, { shouldDirty: true })
      setValue('city', value, { shouldDirty: true })
    }

    if (fieldName === 'branchNumber') {
      setValue(`branchHistory.${activeCourtLocationIndex}.branchNumber`, value, { shouldDirty: true })
      setValue('courtBranch', value, { shouldDirty: true })
    }

    if (fieldName === 'archiveNumberBranch') {
      setValue(`branchHistory.${activeCourtLocationIndex}.archiveNumberBranch`, value, {
        shouldDirty: true,
      })
      setValue('archiveNumberBranch', value, { shouldDirty: true })
    }
  }

  const activateCourtLocation = (index: number) => {
    watchBranchHistory.forEach((_, itemIndex) => {
      setValue(`branchHistory.${itemIndex}.isActive`, itemIndex === index, { shouldDirty: true })
    })

    const selected = watchBranchHistory[index]
    setValue('province', selected?.province || '', { shouldDirty: true })
    setValue('city', selected?.city || '', { shouldDirty: true })
    setValue('courtBranch', selected?.branchNumber || '', { shouldDirty: true })
    setValue('archiveNumberBranch', selected?.archiveNumberBranch || '', { shouldDirty: true })
    setIsBranchDropdownOpen(false)
  }

  const startNewCourtLocation = () => {
    if (activeCourtLocationIndex !== -1) {
      setValue(`branchHistory.${activeCourtLocationIndex}.isActive`, false, { shouldDirty: true })

      if (!watchBranchHistory[activeCourtLocationIndex]?.date) {
        setValue(`branchHistory.${activeCourtLocationIndex}.date`, new Date().toLocaleDateString('fa-IR'), {
          shouldDirty: true,
        })
      }
    }

    appendBranchHistory({
      province: '',
      city: '',
      branchNumber: '',
      archiveNumberBranch: '',
      date: '',
      isActive: true,
    })

    setValue('province', '', { shouldDirty: true })
    setValue('city', '', { shouldDirty: true })
    setValue('courtBranch', '', { shouldDirty: true })
    setValue('archiveNumberBranch', '', { shouldDirty: true })
    setIsBranchDropdownOpen(false)
  }

  if (!caseItem) {
    if (
      isCaseLoading ||
      !didRequestCase
    ) {
      return (
        <div className="max-w-2xl mx-auto text-center py-12 text-zinc-600">
          در حال دریافت اطلاعات پرونده...
        </div>
      )
    }

    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-zinc-900">پرونده یافت نشد</h1>
        <Link
          href="/dashboard/cases"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg"
        >
          بازگشت به لیست
        </Link>
      </div>
    )
  }

  const onSubmit = async (data: CaseFormData) => {
    const cleanedClients =
      (
        data.clients ??
        []
      )
        .map(
          (
            client
          ) => ({
            clientId:
              cleanText(
                client.clientId
              ) ||
              undefined,

            name:
              cleanText(
                client.name
              ),

            phone:
              cleanText(
                client.phone
              ),

            nationalId:
              cleanText(
                client.nationalId
              ),

            birthDate:
              cleanText(
                client.birthDate
              ) ||
              undefined,

            role:
              cleanText(
                client.role
              ),

            representative:
              cleanText(
                client.representative
              ),


            feeShareAmount:
              toFiniteNumber(
                client.feeShareAmount
              ),
          })
        )
        .filter(
          (
            client
          ) =>
            Boolean(
              client.clientId ||
              client.name ||
              client.phone
            )
        )

    const cleanedOpposingParties = (data.opposingParties || [])
      .map((party) => ({
        name: cleanText(party.name),
        phone: cleanText(party.phone),
        nationalId: cleanText(party.nationalId),
        role: cleanText(party.role),
        birthDate: cleanText(party.birthDate),
        description: cleanText(party.description),
      }))
      .filter((party) => Object.values(party).some(Boolean))

    const cleanedOtherPersons = (data.otherPersons || [])
      .map((person) => ({
        name: cleanText(person.name),
        phone: cleanText(person.phone),
        nationalId: cleanText(person.nationalId),
        birthDate: cleanText(person.birthDate),
        role: cleanText(person.role),
        description: cleanText(person.description),
      }))
      .filter((person) => Object.values(person).some(Boolean))

    const cleanLawyers = (lawyers?: CaseFormData['coLawyers']) =>
      (lawyers || [])
        .map((lawyer) => ({
          name: cleanText(lawyer.name),
          phone: cleanText(lawyer.phone),
          nationalId: cleanText(lawyer.nationalId),
          birthDate: cleanText(lawyer.birthDate),
          role: cleanText(lawyer.role),
          licenseNumber: cleanText(lawyer.licenseNumber),
          licenseExpiry: cleanText(lawyer.licenseExpiry),
          licenseIssuePlace: cleanText(lawyer.licenseIssuePlace),
        }))
        .filter((lawyer) => Object.values(lawyer).some(Boolean))

    const cleanedBranchHistory = (data.branchHistory || [])
      .map((location) => ({
        province: cleanText(location.province),
        city: cleanText(location.city),
        branchNumber: cleanText(location.branchNumber),
        archiveNumberBranch: cleanText(location.archiveNumberBranch),
        date: cleanText(location.date),
        isActive: Boolean(location.isActive),
      }))
      .filter(hasCourtLocationValue)

    const activeCourtLocationForSubmit =
      cleanedBranchHistory.find((location) => location.isActive) ||
      cleanedBranchHistory[cleanedBranchHistory.length - 1]


    const formattedCashPayments =
      (
        data.cashPayments ??
        []
      )
        .map(
          (
            payment
          ) => ({

            id:
              cleanText(
                payment.paymentId
              ) ||
              undefined,

            clientId:
              cleanText(
                payment.clientId
              ) ||
              undefined,

            clientName:
              cleanText(
                payment.clientName
              ) ||
              undefined,

            amount:
              toFiniteNumber(
                payment.amount
              ),

            isPaid:
              Boolean(
                payment.isPaid
              ),

            paymentDate:
              cleanText(
                payment.paymentDate
              ) ||
              undefined,

            paymentDescription:
              cleanText(
                payment.paymentDescription
              ) ||
              undefined,
          })
        )
        .filter(
          (
            payment
          ) =>
            payment.amount >
            0 ||
            payment.isPaid ||
            Boolean(
              payment.paymentDate
            )
        )



    const cleanedExpenses =
      (
        data.expenses ??
        []
      )
        .map(
          (
            expense
          ) => ({

            id:
              cleanText(
                expense.expenseId
              ) ||
              undefined,

            title:
              cleanText(
                expense.title
              ),

            description:
              cleanText(
                expense.description
              ),

            amount:
              toFiniteNumber(
                expense.amount
              ),

            date:
              cleanText(
                expense.date
              ),

            isPaid:
              Boolean(
                expense.isPaid
              ),
          })
        )
        .filter(
          (
            expense
          ) =>
            Boolean(
              expense.id
            ) ||
            Boolean(
              expense.title
            ) ||
            Boolean(
              expense.description
            ) ||
            expense.amount >
            0 ||
            Boolean(
              expense.date
            ) ||
            expense.isPaid
        )

    const effectivePaymentType =
      data.paymentType ||
      paymentType ||
      'cash'

    const activeCourtType =
      cleanText(
        data.courtType ||
        courtTypeInput
      )

    const hasCourtBranchData =
      hasCourtLocationValue(
        activeCourtLocationForSubmit
      )



    const payload:
      UpdateCasePayload = {
      title:
        cleanText(
          data.title
        ),

      status:
        data.status,

      caseNumber:
        cleanText(
          data.caseNumber
        ),

      archiveNumberOffice:
        cleanText(
          data.archiveNumberOffice
        ) ||
        undefined,

      clients:
        cleanedClients,

      opposingParties:
        cleanedOpposingParties,

      otherPersons:
        cleanedOtherPersons,

      coLawyers:
        cleanLawyers(
          data.coLawyers
        ),

      opposingLawyers:
        cleanLawyers(
          data.opposingLawyers
        ),

      branchHistory:
        cleanedBranchHistory,

      province:
        activeCourtLocationForSubmit
          ?.province ||
        '',

      city:
        activeCourtLocationForSubmit
          ?.city ||
        '',

      courtType:
        activeCourtType,

      archiveNumberBranch:
        activeCourtLocationForSubmit
          ?.archiveNumberBranch ||
        '',

      courtBranch:
        hasCourtBranchData
          ? {
            province:
              activeCourtLocationForSubmit
                ?.province ||
              '',

            city:
              activeCourtLocationForSubmit
                ?.city ||
              '',

            courtType:
              activeCourtType,

            branch:
              activeCourtLocationForSubmit
                ?.branchNumber ||
              '',

            currentBranchNumber:
              activeCourtLocationForSubmit
                ?.branchNumber ||
              '',

            archiveNumberBranch:
              activeCourtLocationForSubmit
                ?.archiveNumberBranch ||
              '',

            branchHistory:
              cleanedBranchHistory,
          }
          : undefined,

      paymentType:
        effectivePaymentType,

      contractAmount:
        toFiniteNumber(
          data.contractAmount
        ),

      cashPayments:
        effectivePaymentType ===
          'cash' ||
          effectivePaymentType ===
          'both'
          ? formattedCashPayments
          : [],

      expenses:
        cleanedExpenses,

      nonCashDescription:
        effectivePaymentType ===
          'cash'
          ? ''
          : cleanText(
              data.nonCashDescription
            ),

      estimatedPrice:
        effectivePaymentType ===
          'cash'
          ? undefined
          : toFiniteNumber(
              data.estimatedPrice
            ) || undefined,

      description:
        cleanText(
          data.description
        ),
    }



    clearCaseError()

    const updatedCase =
      await updateCase(
        id,
        payload
      )


    if (!updatedCase) {
      return
    }

    router.push(
      `/dashboard/cases/${updatedCase.id}`
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/cases/${id}`} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">ویرایش پرونده</h1>
          <p className="text-sm sm:text-base text-zinc-600 mt-1">اطلاعات پرونده را ویرایش کنید</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg border text-zinc-900 border-zinc-200 p-4 sm:p-6 space-y-8"
      >
        {caseError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          >
            {caseError}
          </div>
        )}
        <input type="hidden" {...register('courtType')} />
        <input type="hidden" {...register('province')} />
        <input type="hidden" {...register('city')} />
        <input type="hidden" {...register('courtBranch')} />
        <input type="hidden" {...register('archiveNumberBranch')} />

        {/* اطلاعات پایه */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-blue-100 pb-3 mb-4">اطلاعات پایه</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">عنوان پرونده *</label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="مثال: پرونده طلاق"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">وضعیت *</label>
            <select
              {...register('status')}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">در انتظار</option>
              <option value="in-progress">در حال انجام</option>
              <option value="completed">تکمیل شده</option>
              <option value="archived">راکد شده</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              شماره بایگانی دفتر وکیل
            </label>

            <input
              {...register(
                'archiveNumberOffice'
              )}
              type="text"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="شماره بایگانی داخلی دفتر"
              dir="ltr"
            />
          </div>
        </div>

        {/* مشخصات پرونده */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-green-100 pb-3 mb-4">مشخصات پرونده</h2>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-green-800 mb-2">نوع دادگاه</label>
                <div className="relative">
                  <input
                    type="text"
                    value={courtTypeInput}
                    onChange={(event) => handleCourtTypeInputChange(event.target.value)}
                    onFocus={() => setIsCourtTypeDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsCourtTypeDropdownOpen(false), 200)}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="تایپ کنید یا انتخاب کنید"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCourtTypeDropdownOpen((prev) => !prev)}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                  >
                    <ChevronDown size={20} className="text-green-500" />
                  </button>

                  {isCourtTypeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-green-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
                      {filteredCourtTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => selectCourtType(type)}
                          className="w-full text-right px-4 py-3 hover:bg-green-50 border-b border-green-100 last:border-b-0"
                        >
                          {type}
                        </button>
                      ))}
                      {filteredCourtTypes.length === 0 && (
                        <div className="px-4 py-3 text-zinc-500">
                          نتیجه‌ای یافت نشد؛ متن تایپ‌شده ذخیره می‌شود.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  شماره پرونده *
                </label>
                <input
                  {...register('caseNumber')}
                  type="text"
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="مثال: 1405/125"
                  dir="ltr"
                />
                {errors.caseNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.caseNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">استان</label>
                <select
                  value={activeCourtLocation?.province || ''}
                  onChange={(event) => updateActiveCourtLocationField('province', event.target.value)}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">انتخاب استان</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">شهر / بخش</label>
                <input
                  type="text"
                  value={activeCourtLocation?.city || ''}
                  onChange={(event) => updateActiveCourtLocationField('city', event.target.value)}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="نام شهر / بخش"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-green-800 mb-2">شعبه</label>
                <div className="relative">
                  <input
                    type="text"
                    value={activeBranch}
                    onFocus={() => {
                      if (courtLocationHistory.length > 0) setIsBranchDropdownOpen(true)
                    }}
                    onBlur={() => setTimeout(() => setIsBranchDropdownOpen(false), 200)}
                    onChange={(event) => updateActiveCourtLocationField('branchNumber', event.target.value)}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="شماره یا نام شعبه"
                  />
                  {courtLocationHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsBranchDropdownOpen((prev) => !prev)}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <ChevronDown size={20} className="text-green-500" />
                    </button>
                  )}

                  {isBranchDropdownOpen && courtLocationHistory.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-green-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-green-200 bg-green-50">
                        <p className="text-xs text-green-700 font-medium">تاریخچه اطلاعات شعبه</p>
                      </div>
                      {courtLocationHistory
                        .slice()
                        .reverse()
                        .map(({ location, index }) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => activateCourtLocation(index)}
                            className="w-full text-right px-4 py-3 hover:bg-green-50 border-b border-green-100 last:border-b-0"
                          >
                            <span className="block text-sm text-zinc-800">
                              {location.province || 'استان نامشخص'} / {location.city || 'شهر نامشخص'} / شعبه{' '}
                              {location.branchNumber || 'ثبت نشده'}
                            </span>
                            <span className="block text-xs text-green-600 mt-1">
                              بایگانی: {location.archiveNumberBranch || 'ثبت نشده'} - {location.date || 'تاریخ ثبت نشده'}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">شماره بایگانی شعبه</label>
                <input
                  type="text"
                  value={activeCourtLocation?.archiveNumberBranch || ''}
                  onChange={(event) => updateActiveCourtLocationField('archiveNumberBranch', event.target.value)}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="شماره بایگانی"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="rounded-lg bg-green-100/70 border border-green-200 p-3 text-xs text-green-800 leading-6">
              استان، شهر، شعبه و شماره بایگانی به صورت یک رکورد واحد ذخیره می‌شوند. برای تغییر این چهار مورد، دکمه زیر را بزنید تا همه با هم در یک رکورد جدید ثبت شوند.
            </div>

            {hasCourtLocationValue(activeCourtLocation) && (
              <button
                type="button"
                onClick={startNewCourtLocation}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                تغییر اطلاعات شعبه
              </button>
            )}

            {courtLocationHistory.length > 0 && (
              <div className="p-3 bg-green-100 rounded-lg">
                <p className="text-green-700 font-medium text-xs">تعداد تغییرات اطلاعات شعبه: {courtLocationHistory.length}</p>
                <p className="text-green-600 text-xs mt-1">شعبه فعلی: {activeBranch || 'ثبت نشده'}</p>
              </div>
            )}
          </div>
        </div>

        {/* موکلین */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              <h2 className="text-lg font-semibold text-zinc-800">موکلین</h2>
            </div>

            <button
              type="button"
              onClick={() =>
                appendClient({
                  clientId: '',
                  name: '',
                  phone: '',
                  nationalId: '',
                  birthDate: '',
                  role: '',
                  representative: '',
                  feeShareAmount: undefined,
                })
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              افزودن موکل
            </button>
          </div>

          <div className="grid gap-4">
            {clientFields.map((field, index) => {
              const clientBirthDate =
                watch(
                  `clients.${index}.birthDate` as const
                )

              const clientUnderLegalAge =
                isUnderLegalAge(
                  clientBirthDate
                )

              return (
                <div
                  key={field.id}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      موکل {index + 1}
                    </h3>

                    {clientFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeClient(index)
                        }
                        className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-blue-700 font-medium block mb-1">
                      انتخاب از موکلین ثبت‌شده
                    </label>

                    <select
                      value={
                        (
                          watch(
                            `clients.${index}.clientId` as const
                          ) as string
                        ) || ''
                      }
                      disabled={
                        isClientsLoading
                      }
                      onChange={(event) =>
                        fillClientFromSavedList(
                          index,
                          event.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-zinc-100 disabled:cursor-wait"
                    >
                      <option value="">
                        {isClientsLoading
                          ? 'در حال دریافت موکلین از سرور...'
                          : 'ورود دستی اطلاعات موکل'}
                      </option>

                      {savedClients.map(
                        (client) => (
                          <option
                            key={client.id}
                            value={client.id}
                          >
                            {
                              getSavedClientFullName(
                                client
                              )
                            }

                            {client.nationalId
                              ? ` - ${client.nationalId}`
                              : ''}

                            {client.phoneNumber
                              ? ` - ${client.phoneNumber}`
                              : ''}
                          </option>
                        )
                      )}
                    </select>

                    {clientsError && (
                      <p className="mt-1 text-xs text-red-600">
                        {clientsError}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-blue-500">
                      می‌توانید موکل ثبت‌شده را انتخاب کنید یا اطلاعات را دستی وارد کنید.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                    <div>
                      <label className="text-xs text-blue-700 font-medium block mb-1">
                        نام شخص حقیقی/حقوقی
                      </label>
                      <input
                        {...register(
                          `clients.${index}.name` as const
                        )}
                        type="text"
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="نام شخص"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-blue-700 font-medium block mb-1">
                        شماره موبایل
                      </label>
                      <input
                        {...register(
                          `clients.${index}.phone` as const
                        )}
                        type="text"
                        maxLength={11}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="09123456789"
                        dir="ltr"
                      />

                      {errors.clients?.[index]?.phone && (
                        <p className="mt-1 text-xs text-red-600">
                          {
                            errors.clients[
                              index
                            ]?.phone?.message
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-blue-700 font-medium block mb-1">
                        کد ملی / شناسه ملی
                      </label>
                      <input
                        {...register(
                          `clients.${index}.nationalId` as const
                        )}
                        type="text"
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="کد یا شناسه"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-blue-700 font-medium block mb-1">
                        تاریخ تولد
                      </label>
                      <input
                        {...register(
                          `clients.${index}.birthDate` as const,
                          {
                            onChange:
                              (event) => {
                                event.target.value =
                                  formatDateInput(
                                    event.target.value
                                  )
                              },
                          }
                        )}
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 bg-white ${
                          clientUnderLegalAge
                            ? 'border border-amber-400 focus:ring-amber-500'
                            : 'border border-blue-200 focus:ring-blue-500'
                        }`}
                        placeholder="1404/05/20"
                        dir="ltr"
                      />

                      {clientUnderLegalAge && (
                        <p className="mt-1 text-xs font-medium text-amber-600">
                          این شخص زیر ۱۸ سال است
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-blue-700 font-medium block mb-1">
                        سمت / نماینده
                      </label>
                      <input
                        {...register(
                          `clients.${index}.representative` as const
                        )}
                        type="text"
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="سمت یا نام نماینده"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* طرف مقابل */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserX className="text-zinc-600" size={20} />
              <h2 className="text-lg font-semibold text-zinc-800">
                طرف مقابل
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                appendOpposingParty({
                  name: '',
                  phone: '',
                  nationalId: '',
                  birthDate: '',
                  role: '',
                  description: '',
                })
              }
              className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              افزودن طرف مقابل
            </button>
          </div>

          {opposingPartyFields.length === 0 && (
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-xl p-6 text-center">
              <UserX
                className="mx-auto text-zinc-400 mb-2"
                size={32}
              />
              <p className="text-sm text-zinc-500">
                هیچ طرف مقابلی اضافه نشده است
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {opposingPartyFields.map(
              (field, index) => {
                const birthDateValue =
                  watch(
                    `opposingParties.${index}.birthDate` as const
                  )

                const underLegalAge =
                  isUnderLegalAge(
                    birthDateValue
                  )

                return (
                  <div
                    key={field.id}
                    className="bg-gradient-to-r from-zinc-50 to-slate-50 border border-zinc-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-zinc-800">
                        طرف مقابل {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          removeOpposingParty(
                            index
                          )
                        }
                        className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-zinc-700 font-medium block mb-1">
                          نام شخص حقیقی/حقوقی
                        </label>
                        <input
                          {...register(
                            `opposingParties.${index}.name` as const
                          )}
                          type="text"
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-white"
                          placeholder="نام طرف مقابل"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-700 font-medium block mb-1">
                          شماره موبایل
                        </label>
                        <input
                          {...register(
                            `opposingParties.${index}.phone` as const
                          )}
                          type="text"
                          maxLength={11}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-white"
                          placeholder="09123456789"
                          dir="ltr"
                        />

                        {errors.opposingParties?.[
                          index
                        ]?.phone && (
                          <p className="mt-1 text-xs text-red-600">
                            {
                              errors.opposingParties[
                                index
                              ]?.phone?.message
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-zinc-700 font-medium block mb-1">
                          کد ملی / شناسنامه
                        </label>
                        <input
                          {...register(
                            `opposingParties.${index}.nationalId` as const
                          )}
                          type="text"
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-white"
                          placeholder="کد ملی یا شماره شناسنامه"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-700 font-medium block mb-1">
                          تاریخ تولد
                        </label>
                        <input
                          {...register(
                            `opposingParties.${index}.birthDate` as const,
                            {
                              onChange:
                                (event) => {
                                  event.target.value =
                                    formatDateInput(
                                      event.target.value
                                    )
                                },
                            }
                          )}
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 bg-white ${
                            underLegalAge
                              ? 'border border-amber-400 focus:ring-amber-500'
                              : 'border border-zinc-200 focus:ring-zinc-500'
                          }`}
                          placeholder="1404/05/20"
                          dir="ltr"
                        />

                        {underLegalAge && (
                          <p className="mt-1 text-xs font-medium text-amber-600">
                            این شخص زیر ۱۸ سال است
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-zinc-700 font-medium block mb-1">
                          سمت / نماینده
                        </label>
                        <input
                          {...register(
                            `opposingParties.${index}.role` as const
                          )}
                          type="text"
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-white"
                          placeholder="سمت یا نام نماینده"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-700 font-medium block mb-1">
                        توضیحات
                      </label>
                      <textarea
                        {...register(
                          `opposingParties.${index}.description` as const
                        )}
                        rows={2}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-white resize-none"
                        placeholder="توضیحات مربوط به طرف مقابل..."
                      />
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </div>

        {/* وکلای همکار */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-purple-100 pb-3">
            <h2 className="text-lg font-semibold text-zinc-800">وکلای همکار</h2>
            <button
              type="button"
              onClick={() =>
                appendCoLawyer({
                  name: '',
                  phone: '',
                  nationalId: '',
                  birthDate: '',
                  role: '',
                  licenseNumber: '',
                  licenseExpiry: '',
                  licenseIssuePlace: '',
                })
              }
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> افزودن وکیل همکار
            </button>
          </div>

          {coLawyerFields.length === 0 && (
            <div className="bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl p-6 text-center">
              <p className="text-sm text-purple-600">هیچ وکیل همکاری اضافه نشده</p>
            </div>
          )}

          <div className="grid gap-4">
            {coLawyerFields.map((field, index) => (
              <div key={field.id} className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-purple-800">وکیل همکار {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeCoLawyer(index)}
                    className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">نام و نام خانوادگی</label>
                    <input
                      {...register(`coLawyers.${index}.name` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="نام وکیل"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">شماره موبایل</label>
                    <input
                      {...register(`coLawyers.${index}.phone` as const)}
                      type="text"
                      maxLength={11}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="09123456789"
                      dir="ltr"
                    />
                    {errors.coLawyers?.[index]?.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.coLawyers[index]?.phone?.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">کد ملی</label>
                    <input
                      {...register(`coLawyers.${index}.nationalId` as const)}
                      type="text"
                      inputMode="numeric"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="کد ملی"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">تاریخ تولد</label>
                    <input
                      {...register(`coLawyers.${index}.birthDate` as const, {
                        onChange: (event) => {
                          event.target.value =
                            formatDateInput(
                              event.target.value
                            )
                        },
                      })}
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="1404/05/20"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">شماره پروانه</label>
                    <input
                      {...register(`coLawyers.${index}.licenseNumber` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="شماره پروانه"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">تاریخ اعتبار پروانه</label>
                    <input
                      {...register(`coLawyers.${index}.licenseExpiry` as const, {
                        onChange: (event) => {
                          event.target.value =
                            formatDateInput(
                              event.target.value
                            )
                        },
                      })}
                      type="text"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="1405/12/29"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">محل صدور پروانه</label>
                    <input
                      {...register(`coLawyers.${index}.licenseIssuePlace` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="مثال: کانون وکلای تهران"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* وکلای طرف مقابل */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-orange-100 pb-3">
            <h2 className="text-lg font-semibold text-zinc-800">وکلای طرف مقابل</h2>
            <button
              type="button"
              onClick={() =>
                appendOpposingLawyer({
                  name: '',
                  phone: '',
                  nationalId: '',
                  birthDate: '',
                  role: '',
                  licenseNumber: '',
                  licenseExpiry: '',
                  licenseIssuePlace: '',
                })
              }
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> افزودن وکیل طرف مقابل
            </button>
          </div>

          {opposingLawyerFields.length === 0 && (
            <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl p-6 text-center">
              <p className="text-sm text-orange-600">هیچ وکیل طرف مقابلی اضافه نشده</p>
            </div>
          )}

          <div className="grid gap-4">
            {opposingLawyerFields.map((field, index) => (
              <div key={field.id} className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-orange-800">وکیل طرف مقابل {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeOpposingLawyer(index)}
                    className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">نام و نام خانوادگی</label>
                    <input
                      {...register(`opposingLawyers.${index}.name` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="نام وکیل"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">شماره موبایل</label>
                    <input
                      {...register(`opposingLawyers.${index}.phone` as const)}
                      type="text"
                      maxLength={11}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="09123456789"
                      dir="ltr"
                    />
                    {errors.opposingLawyers?.[index]?.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.opposingLawyers[index]?.phone?.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">کد ملی</label>
                    <input
                      {...register(`opposingLawyers.${index}.nationalId` as const)}
                      type="text"
                      inputMode="numeric"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="کد ملی"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">تاریخ تولد</label>
                    <input
                      {...register(`opposingLawyers.${index}.birthDate` as const, {
                        onChange: (event) => {
                          event.target.value =
                            formatDateInput(
                              event.target.value
                            )
                        },
                      })}
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="1404/05/20"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">شماره پروانه</label>
                    <input
                      {...register(`opposingLawyers.${index}.licenseNumber` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="شماره پروانه"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">تاریخ اعتبار پروانه</label>
                    <input
                      {...register(`opposingLawyers.${index}.licenseExpiry` as const, {
                        onChange: (event) => {
                          event.target.value =
                            formatDateInput(
                              event.target.value
                            )
                        },
                      })}
                      type="text"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="1405/12/29"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">محل صدور پروانه</label>
                    <input
                      {...register(`opposingLawyers.${index}.licenseIssuePlace` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="مثال: کانون وکلای تهران"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* سایر اشخاص */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-green-100 pb-3">
            <h2 className="text-lg font-semibold text-zinc-800">سایر اشخاص</h2>
            <button
              type="button"
              onClick={() =>
                appendOtherPerson({
                  name: '',
                  phone: '',
                  nationalId: '',
                  birthDate: '',
                  role: '',
                  description: '',
                })
              }
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> افزودن سایر اشخاص
            </button>
          </div>

          {otherPersonFields.length === 0 && (
            <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-xl p-6 text-center">
              <p className="text-sm text-green-600">هیچ فرد دیگری اضافه نشده</p>
            </div>
          )}

          <div className="grid gap-4">
            {otherPersonFields.map((field, index) => (
              <div key={field.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-green-800">سایر اشخاص {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeOtherPerson(index)}
                    className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-green-700 font-medium block mb-1">نام و نام خانوادگی</label>
                    <input
                      {...register(`otherPersons.${index}.name` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      placeholder="نام فرد"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-green-700 font-medium block mb-1">شماره موبایل</label>
                    <input
                      {...register(`otherPersons.${index}.phone` as const)}
                      type="text"
                      maxLength={11}
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      placeholder="09123456789"
                      dir="ltr"
                    />
                    {errors.otherPersons?.[index]?.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.otherPersons[index]?.phone?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-green-700 font-medium block mb-1">سمت</label>
                    <input
                      {...register(`otherPersons.${index}.role` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      placeholder="مثلا شاهد، کارشناس، نماینده"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-green-700 font-medium block mb-1">کد ملی</label>
                    <input
                      {...register(`otherPersons.${index}.nationalId` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      placeholder="کد ملی"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-green-700 font-medium block mb-1">تاریخ تولد</label>
                    <input
                      {...register(`otherPersons.${index}.birthDate` as const, {
                        onChange: (event) => {
                          event.target.value =
                            formatDateInput(
                              event.target.value
                            )
                        },
                      })}
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      placeholder="1404/05/20"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-green-700 font-medium block mb-1">توضیحات</label>
                  <textarea
                    {...register(`otherPersons.${index}.description` as const)}
                    rows={3}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none bg-white"
                    placeholder="جزئیات و توضیحات فرد..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* اطلاعات مالی */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-green-100 pb-3 mb-4">حق الوکاله</h2>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-2">مبلغ نقدی قرارداد (ریال)</label>
                <input
                  {...register('contractAmount', {
                    setValueAs: setOptionalNumberValue,
                    onChange: (event) => {
                      event.target.value =
                        formatMoneyInput(
                          event.target.value
                        )
                    },
                  })}
                  type="text"
                  inputMode="numeric"
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="مثال: 50000000"
                  dir="ltr"
                />

                {errors.contractAmount && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.contractAmount.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-2">مبلغ مانده قرارداد (ریال)</label>
                <input
                  value={Number(watch('remainingAmount') || 0).toLocaleString()}
                  readOnly
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg bg-emerald-50"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-2">مبلغ معوق (ریال)</label>
                <input
                  value={Number(watch('overdueAmount') || 0).toLocaleString()}
                  readOnly
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg bg-emerald-50"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
          {activeClients.length > 1 && (
            <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-violet-900">تقسیم حق‌الوکاله بین موکلین</h3>
                  <p className="mt-1 text-sm leading-6 text-violet-700">
                    سهم هر موکل را مشخص کنید. مجموع سهم‌ها باید دقیقاً برابر مبلغ کل قرارداد باشد.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={splitFeeEqually}
                  disabled={contractAmount <= 0}
                  className="shrink-0 rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  تقسیم مساوی
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {activeClients.map((client) => (
                  <div
                    key={client.clientId ?? `${client.clientName}-${client.index}`}
                    className="grid grid-cols-1 items-center gap-3 rounded-xl border border-violet-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,260px)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-zinc-900">
                        {client.clientName || `موکل ${client.index + 1}`}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">سهم این موکل از مبلغ کل قرارداد</p>
                    </div>

                    <div>
                      <div className="relative">
                        <input
                          {...register(`clients.${client.index}.feeShareAmount`, {
                            setValueAs: setOptionalNumberValue,
                            onChange: (event) => {
                              event.target.value =
                                formatMoneyInput(
                                  event.target.value
                                )
                            },
                          })}
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          dir="ltr"
                          className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 pl-14 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                        />
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                          ریال
                        </span>
                      </div>

                      {errors.clients?.[client.index]?.feeShareAmount && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.clients[client.index]?.feeShareAmount?.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-white p-3 ring-1 ring-violet-100">
                  <p className="text-xs text-zinc-500">مبلغ کل قرارداد</p>
                  <p className="mt-1 font-black text-zinc-900">
                    {contractAmount.toLocaleString('fa-IR')} ریال
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3 ring-1 ring-violet-100">
                  <p className="text-xs text-zinc-500">مجموع سهم‌های ثبت‌شده</p>
                  <p className="mt-1 font-black text-violet-700">
                    {allocatedFeeTotal.toLocaleString('fa-IR')} ریال
                  </p>
                </div>

                <div
                  className={`rounded-lg p-3 ring-1 ${unallocatedFeeAmount === 0 ? 'bg-emerald-50 ring-emerald-200' : 'bg-red-50 ring-red-200'
                    }`}
                >
                  <p className="text-xs text-zinc-500">اختلاف با مبلغ قرارداد</p>
                  <p
                    className={`mt-1 font-black ${unallocatedFeeAmount === 0 ? 'text-emerald-700' : 'text-red-700'
                      }`}
                  >
                    {Math.abs(unallocatedFeeAmount).toLocaleString('fa-IR')} ریال
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-900">نوع قرارداد</label>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200 cursor-pointer">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentType === 'cash'}
                  {...register('paymentType')}
                  onChange={() => {
                    setPaymentType('cash')
                    setValue('paymentType', 'cash')
                  }}
                  className="text-green-600"
                />
                <span className="text-green-800 font-medium">نقدی</span>
              </label>

              <label className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 cursor-pointer">
                <input
                  type="radio"
                  value="non-cash"
                  checked={paymentType === 'non-cash'}
                  {...register('paymentType')}
                  onChange={() => {
                    setPaymentType('non-cash')
                    setValue('paymentType', 'non-cash')
                  }}
                  className="text-blue-600"
                />
                <span className="text-blue-800 font-medium">غیر نقدی</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  const nextValue = paymentType === 'both' ? 'cash' : 'both'
                  setPaymentType(nextValue)
                  setValue('paymentType', nextValue)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${paymentType === 'both'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                  }`}
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold ${paymentType === 'both'
                    ? 'bg-white text-emerald-600 border-white'
                    : 'bg-white text-transparent border-emerald-400'
                    }`}
                >
                  ✓
                </span>
                نقدی و غیر نقدی
              </button>
            </div>
          </div>

          {(paymentType === 'cash' || paymentType === 'both') && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="font-medium text-green-800 text-lg">پرداخت‌های نقدی</h3>
                <button
                  type="button"
                  onClick={() =>
                    appendCashPayment({
                      paymentId:
                        '',
                      clientId:
                        '',
                      clientName:
                        '',
                      amount:
                        undefined,
                      isPaid:
                        false,
                      paymentDate:
                        '',
                      paymentDescription:
                        '',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <Plus size={16} /> افزودن پرداخت
                </button>
              </div>

              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-green-800 font-bold text-lg">مجموع پرداخت‌ها: {totalCash.toLocaleString()} ریال</p>
              </div>

              <div className="space-y-4">
                {cashPaymentFields.map((field, index) => (
                  <div key={field.id} className="bg-white border border-green-300 rounded-lg p-4">
                    <input
                      type="hidden"
                      {...register(
                        `cashPayments.${index}.paymentId` as const
                      )}
                    />
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-green-800">پرداخت {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeCashPayment(index)}
                        className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {activeClients.length > 1 && (
                      <div className="mb-3">
                        <label className="mb-1 block text-xs font-medium text-green-700">
                          موکل مرتبط
                        </label>

                        <select
                          value={
                            watch(`cashPayments.${index}.clientId`)
                              ? `id:${watch(`cashPayments.${index}.clientId`)}`
                              : watch(`cashPayments.${index}.clientName`)
                                ? `name:${watch(`cashPayments.${index}.clientName`)}`
                                : ''
                          }
                          onChange={(event) => {
                            const selectedValue = event.target.value

                            const selectedClient = activeClients.find(
                              (client) => getClientOptionValue(client) === selectedValue
                            )

                            setValue(`cashPayments.${index}.clientId`, selectedClient?.clientId ?? '', {
                              shouldDirty: true,
                              shouldValidate: true,
                            })

                            setValue(`cashPayments.${index}.clientName`, selectedClient?.clientName ?? '', {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }}
                          className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">انتخاب موکل</option>

                          {activeClients.map((client) => (
                            <option
                              key={client.clientId ?? `${client.clientName}-${client.index}`}
                              value={getClientOptionValue(client)}
                            >
                              {client.clientName || `موکل ${client.index + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-green-700 font-medium block mb-1">مبلغ (ریال)</label>
                        <input
                          {...register(`cashPayments.${index}.amount` as const, {
                            setValueAs: setOptionalNumberValue,
                            onChange: (event) => {
                              event.target.value =
                                formatMoneyInput(
                                  event.target.value
                                )
                            },
                          })}
                          type="text"
                          inputMode="numeric"
                          className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-medium block mb-1">تاریخ پرداخت (شمسی)</label>
                        <input
                          type="text"
                          {...register(`cashPayments.${index}.paymentDate` as const, {
                            onChange: (event) => {
                              event.target.value =
                                formatDateInput(
                                  event.target.value
                                )
                            },
                          })}
                          inputMode="numeric"
                          maxLength={10}
                          className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="1404/05/20"
                          dir="ltr"
                        />
                      </div>
                      <div className="flex items-center justify-center">
                        <label className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg cursor-pointer">
                          <input type="checkbox" {...register(`cashPayments.${index}.isPaid` as const)} className="text-green-600" />
                          <span className="text-sm text-green-800 font-medium">پرداخت شده</span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs text-green-700 font-medium block mb-1">
                        توضیح
                      </label>
                      <textarea
                        {...register(`cashPayments.${index}.paymentDescription` as const)}
                        rows={2}
                        className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        placeholder="توضیح مربوط به این پرداخت..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(paymentType === 'non-cash' || paymentType === 'both') && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 space-y-4">
              <h3 className="font-medium text-blue-800 text-lg">توضیحات پرداخت غیر نقدی</h3>
              <p className="text-sm text-blue-600">
                در صورتی که پرداخت به صورت غیر نقدی مثل زمین، ملک، خودرو و ... انجام می‌شود، جزئیات را وارد کنید.
              </p>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  حدود قیمت (ریال)
                </label>
                <input
                  {...register('estimatedPrice', {
                    setValueAs: setOptionalNumberValue,
                    onChange: (event) => {
                      event.target.value =
                        formatMoneyInput(
                          event.target.value
                        )
                    },
                  })}
                  type="text"
                  inputMode="numeric"
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="مثال: 1,000,000,000"
                  dir="ltr"
                />
              </div>

              <textarea
                {...register('nonCashDescription')}
                rows={6}
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="مثال: یک قطعه زمین به مساحت 200 متر مربع واقع در تهران، خیابان ولیعصر، پلاک ثبتی 12345"
              />
            </div>
          )}
        </div>
        {/* هزینه‌ها */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-medium text-amber-800 text-lg">هزینه‌ها</h3>

            <button
              type="button"
              onClick={() => appendExpense({ title: '', description: '', amount: undefined, date: '', isPaid: false })}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
            >
              <Plus size={16} /> افزودن هزینه
            </button>
          </div>

          <p className="text-sm text-amber-700">این بخش برای ثبت هزینه‌های جانبی وکیل است و ارتباطی با حق‌الوکاله ندارد.</p>

          <div className="bg-amber-100 p-4 rounded-lg">
            <p className="text-amber-800 font-bold text-lg">مجموع هزینه‌ها: {expensesTotal?.toLocaleString() || 0} ریال</p>
          </div>

          <div className="space-y-4">
            {expenseFields.map((field, index) => (
              <div key={field.id} className="bg-white border border-amber-300 rounded-lg p-4">
                <input
                  type="hidden"
                  {...register(
                    `expenses.${index}.expenseId` as const
                  )}
                />
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-amber-800">هزینه {index + 1}</h4>

                  <button
                    type="button"
                    onClick={() => removeExpense(index)}
                    className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-amber-700 block mb-1">
                      عنوان هزینه / توضیحات
                    </label>
                    <input
                      {...register(`expenses.${index}.title` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="مثال: هزینه ارسال مدارک - پست پیشتاز"
                    />
                    <input
                      type="hidden"
                      {...register(`expenses.${index}.description` as const)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-amber-700 block mb-1">مبلغ (ریال)</label>
                    <input
                      {...register(`expenses.${index}.amount` as const, {
                        setValueAs: setOptionalNumberValue,
                        onChange: (event) => {
                          event.target.value =
                            formatMoneyInput(
                              event.target.value
                            )
                        },
                      })}
                      type="text"
                      inputMode="numeric"
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="0"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-amber-700 block mb-1">تاریخ هزینه (شمسی)</label>
                    <input
                      {...register(`expenses.${index}.date` as const, {
                        onChange: (event) => {
                          event.target.value =
                            formatDateInput(
                              event.target.value
                            )
                        },
                      })}
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      dir="ltr"
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="1404/05/20"
                    />
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <label className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <input type="checkbox" {...register(`expenses.${index}.isPaid` as const)} className="text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">پرداخت شده</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* توضیحات کلی */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-gray-100 pb-3">توضیحات کلی</h2>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="جزئیات و توضیحات پرونده..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-zinc-200">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              isCaseSaving
            }
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
          >
            {isSubmitting ||
              isCaseSaving
              ? 'در حال ذخیره در سرور...'
              : 'ذخیره تغییرات'}
          </button>
          <Link
            href={`/dashboard/cases/${id}`}
            className="px-6 py-3 border-2 border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors text-center font-medium text-lg"
          >
            انصراف
          </Link>
        </div>
      </form>
    </div>
  )
}