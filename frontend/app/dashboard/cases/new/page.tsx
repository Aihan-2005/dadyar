'use client'

import { useEffect, useState } from 'react'
import {
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  ChevronDown,
  Plus,
  Users,
  UserX,
  X,
} from 'lucide-react'

import {
saveCaseDraft,
loadCaseDraft,
clearCaseDraft
}
from '@/features/cases/utils/caseDraft'

import { useCasesStore } from '@/store/cases.store'
import {
  useClientStore,
  type Client,
} from '@/store/client.store'
import type { CreateCasePayload } from '@/types/case'

import {
  formatDateInput,
  parseFinanceDate,
} from '@/features/finance/utils/date'
import {
  formatMoneyInput,
  normalizeDigits,
  toFiniteNumber,
} from '@/features/finance/utils/number'

const PROVINCES = [
  'تهران',
  'اصفهان',
  'فارس',
  'خراسان رضوی',
  'خوزستان',
  'آذربایجان شرقی',
  'مازندران',
  'کرمان',
  'گیلان',
  'آذربایجان غربی',
  'همدان',
  'کرمانشاه',
  'مرکزی',
  'لرستان',
  'قزوین',
  'سمنان',
  'یزد',
  'اردبیل',
  'زنجان',
  'کردستان',
  'بوشهر',
  'قم',
  'هرمزگان',
  'چهارمحال و بختیاری',
  'ایلام',
  'کهگیلویه و بویراحمد',
  'گلستان',
  'خراسان شمالی',
  'خراسان جنوبی',
  'البرز',
  'سیستان و بلوچستان',
] as const

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
] as const

const optionalTextSchema = z
  .string()
  .trim()
  .optional()

const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return undefined
    }

    return normalizeDigits(
      String(value)
    ).trim()
  },
  z
    .string()
    .refine(
      (value) =>
        !value ||
        /^09\d{9}$/.test(value),
      {
        message:
          'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود',
      }
    )
    .optional()
)

const preprocessOptionalNumber = (
  value: unknown
): unknown => {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return undefined
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? value
      : undefined
  }

  const normalized = normalizeDigits(
    String(value)
  )
    .replace(/[٬,\s]/g, '')
    .replace(/ریال|تومان|ت/g, '')
    .trim()

  if (!normalized) {
    return undefined
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed)
    ? parsed
    : value
}

const optionalNumberSchema = z.preprocess(
  preprocessOptionalNumber,
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
  nationalId:
optionalTextSchema,

birthDate:
optionalTextSchema,

role:
optionalTextSchema,
  licenseNumber: optionalTextSchema,
  licenseExpiry: optionalTextSchema,
  licenseIssuePlace:
    optionalTextSchema,
})

const clientSchema = z.object({
  clientId: optionalTextSchema,
  name: optionalTextSchema,
  phone: optionalPhoneSchema,
  nationalId: optionalTextSchema,
  role: optionalTextSchema,
  birthDate:
optionalTextSchema,
  representative:
    optionalTextSchema,

    feeShareAmount:
        optionalNumberSchema,
})

const opposingPartySchema = z.object({
  name: optionalTextSchema,
  phone: optionalPhoneSchema,
  role: optionalTextSchema,
  birthDate: optionalTextSchema,
  nationalId: optionalTextSchema,
  description: optionalTextSchema,
})

const otherPersonSchema = z.object({
  name: optionalTextSchema,
  phone: optionalPhoneSchema,
birthDate:
optionalTextSchema,
  nationalId: optionalTextSchema,
  role: optionalTextSchema,
  description: optionalTextSchema,
})



const paymentSchema = z.object({
    clientId:
    optionalTextSchema,

  clientName:
    optionalTextSchema,
  amount: optionalNumberSchema,
  isPaid: z
    .boolean()
    .optional()
    .default(false),
  paymentDate: optionalTextSchema,
  paymentDescription:
    optionalTextSchema,
})



const branchHistorySchema =
  z.object({
    province: optionalTextSchema,
    city: optionalTextSchema,
    branchNumber:
      optionalTextSchema,
    archiveNumberBranch:
      optionalTextSchema,
    date: optionalTextSchema,
    isActive: z.boolean(),
  })

const expenseSchema = z.object({
  title: optionalTextSchema,
  amount: optionalNumberSchema,
  date: optionalTextSchema,
  description: optionalTextSchema,
  isPaid: z
    .boolean()
    .optional()
    .default(false),
})

const caseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      1,
      'عنوان پرونده الزامی است'
    ),

  status: z
    .enum([
      'pending',
      'in-progress',
      'completed',
      'archived',
    ])
    .default('pending'),

  clients: z
    .array(clientSchema)
    .optional(),

  opposingParties: z
    .array(opposingPartySchema)
    .optional(),

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

  branchHistory: z
    .array(branchHistorySchema)
    .optional(),

  coLawyers: z
    .array(lawyerSchema)
    .optional(),

  opposingLawyers: z
    .array(lawyerSchema)
    .optional(),

  description: optionalTextSchema,

  paymentType: z
    .enum([
      'cash',
      'non-cash',
      'both',
    ])
    .optional(),

  cashPayments: z
    .array(paymentSchema)
    .optional(),

  nonCashDescription:
    optionalTextSchema,

  estimatedPrice:
    optionalNumberSchema,

  contractAmount:
    optionalNumberSchema,

  remainingAmount:
    optionalNumberSchema,

  overdueAmount:
    optionalNumberSchema,

  expenses: z
    .array(expenseSchema)
    .optional(),

 


  otherPersons: z
    .array(otherPersonSchema)
    .optional(),
}).superRefine(
  (data, context) => {
    /*
     * در ثبت پرونده جدید فقط سه ورودی اجباری هستند:
     * 1) عنوان پرونده
     * 2) شماره پرونده
     * 3) حداقل یک موکل
     *
     * سایر بخش‌ها اختیاری هستند و نباید به خاطر خالی بودن
     * جلوی ثبت پرونده را بگیرند.
     */
    const hasAtLeastOneClient =
      (data.clients ?? []).some(
        (client) =>
          Boolean(
            client.clientId?.trim() ||
              client.name?.trim()
          )
      )

    if (!hasAtLeastOneClient) {
      context.addIssue({
        code:
          z.ZodIssueCode.custom,
        path: ['clients'],
        message:
          'حداقل یک موکل برای ثبت پرونده الزامی است',
      })
    }
  }
)

type CaseFormInput =
  z.input<typeof caseSchema>


type CaseFormData =
  z.output<typeof caseSchema>

type BranchHistoryItem =
  z.output<typeof branchHistorySchema>

type CourtLocationField =
  | 'province'
  | 'city'
  | 'branchNumber'
  | 'archiveNumberBranch'




const cleanText = (
  value?: string | null
): string =>
  (value ?? '').trim()

const hasText = (
  value?: string | null
): boolean =>
  cleanText(value).length > 0

const hasCourtLocationValue = (
  location?:
    Partial<BranchHistoryItem>
): boolean => {
  if (!location) {
    return false
  }

  return Boolean(
    hasText(location.province) ||
      hasText(location.city) ||
      hasText(
        location.branchNumber
      ) ||
      hasText(
        location.archiveNumberBranch
      )
  )
}

const hasMeaningfulValue = (
  values: Record<
    string,
    unknown
  >
): boolean => {
  return Object.values(
    values
  ).some((value) => {
    if (typeof value === 'boolean') {
      return value
    }

    if (typeof value === 'number') {
      return value > 0
    }

    return Boolean(
      cleanText(
        value === undefined ||
          value === null
          ? ''
          : String(value)
      )
    )
  })
}

const getSavedClientFullName = (
  client: Client
): string => {
  const fullName = [
  client.fullName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  return (
    fullName ||
    client.fullName ||
    ''
  )
}

const getCurrentJalaliDateParts =
  () => {
    const parts =
      new Intl.DateTimeFormat(
        'en-US-u-ca-persian-nu-latn',
        {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        }
      ).formatToParts(
        new Date()
      )

    return {
      year: Number(
        parts.find(
          (part) =>
            part.type === 'year'
        )?.value ?? 0
      ),

      month: Number(
        parts.find(
          (part) =>
            part.type === 'month'
        )?.value ?? 0
      ),

      day: Number(
        parts.find(
          (part) =>
            part.type === 'day'
        )?.value ?? 0
      ),
    }
  }

const getJalaliAge = (
  birthDate?: string
): number | null => {
  if (!birthDate) {
    return null
  }

  const normalized =
    normalizeDigits(
      birthDate.trim()
    )

  const match =
    normalized.match(
      /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/
    )

  if (!match) {
    return null
  }

  const birthYear = Number(
    match[1]
  )

  const birthMonth = Number(
    match[2]
  )

  const birthDay = Number(
    match[3]
  )

  if (
    !birthYear ||
    birthMonth < 1 ||
    birthMonth > 12 ||
    birthDay < 1 ||
    birthDay > 31
  ) {
    return null
  }

  const today =
    getCurrentJalaliDateParts()

  let age =
    today.year - birthYear

  const birthdayNotPassed =
    today.month < birthMonth ||
    (today.month ===
      birthMonth &&
      today.day < birthDay)

  if (birthdayNotPassed) {
    age -= 1
  }

  return age
}

const isUnderLegalAge = (
  birthDate?: string
): boolean => {
  const age =
    getJalaliAge(birthDate)

  return (
    age !== null &&
    age < 18
  )
}

const getFirstDate = (
  values: Array<
    Date | null
  >
): Date | undefined => {
  return values
    .filter(
      (date): date is Date =>
        Boolean(date)
    )
    .sort(
      (first, second) =>
        first.getTime() -
        second.getTime()
    )[0]
}

const getLastDate = (
  values: Array<
    Date | null
  >
): Date | undefined => {
  return values
    .filter(
      (date): date is Date =>
        Boolean(date)
    )
    .sort(
      (first, second) =>
        second.getTime() -
        first.getTime()
    )[0]
}

export default function NewCasePage() {

  const router =
  useRouter()



const addCase =
  useCasesStore(
    (state) =>
      state.addCase
  )

const caseError =
  useCasesStore(
    (state) =>
      state.error
  )

const isCaseSaving =
  useCasesStore(
    (state) =>
      state.isSaving
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
    const fetchSavedClients =
  useClientStore(
    (state) =>
      state.fetchClients
  )

  const [
    paymentType,
    setPaymentType,
  ] = useState<
    | 'cash'
    | 'non-cash'
    | 'both'
  >('cash')

  const [
    isCourtTypeDropdownOpen,
    setIsCourtTypeDropdownOpen,
  ] = useState(false)

  const [
    courtTypeInput,
    setCourtTypeInput,
  ] = useState('')

  const [
    filteredCourtTypes,
    setFilteredCourtTypes,
  ] = useState<
    readonly string[]
  >(COURT_TYPES)

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
  any,
  CaseFormData
>({
  resolver: zodResolver(caseSchema),
   
  shouldUnregister:false,


  defaultValues: {
    title: '',

    status: 'pending',

    paymentType: 'cash',

    caseNumber: '',

    archiveNumberOffice: '',

    cashPayments: [],

    clients: [
      {
        clientId: '',
        name: '',
        phone: '',
        nationalId: '',
        birthDate: '',
        role: '',
        representative: '',
          feeShareAmount:
                  undefined,
      },
    ],

    opposingParties: [],

    coLawyers: [],

    opposingLawyers: [],

    branchHistory: [
      {
        province: '',
        city: '',
        branchNumber: '',
        archiveNumberBranch: '',
        date: '',
        isActive: true,
      },
    ],

    province: '',

    city: '',

    courtType: '',

    courtBranch: '',

    archiveNumberBranch: '',

    nonCashDescription: '',

    estimatedPrice: undefined,

    contractAmount: undefined,

    remainingAmount: undefined,

    overdueAmount: undefined,

    expenses: [],

    otherPersons: [],

    description: '',
  },

  mode: 'onSubmit',

  reValidateMode: 'onChange',
})



useEffect(() => {
  void fetchAllClients()
}, [
  fetchAllClients,
])

useEffect(() => {
  const draft =
    loadCaseDraft() as
      | Partial<CaseFormInput>
      | null

  if (!draft) {
    return
  }

  reset(
    draft as CaseFormInput,
    {
      keepDefaultValues: true,
    }
  )

  if (draft.paymentType) {
    setPaymentType(
      draft.paymentType
    )
  }

  if (
    typeof draft.courtType ===
    'string'
  ) {
    setCourtTypeInput(
      draft.courtType
    )

    setFilteredCourtTypes(
      COURT_TYPES.filter(
        (type) =>
          type.includes(
            draft.courtType as string
          )
      )
    )
  }
}, [
  reset,
])

useEffect(() => {
  const subscription =
    watch((values) => {
      saveCaseDraft(values)
    })

  return () => {
    subscription.unsubscribe()
  }
}, [
  watch,
])


  const {
    fields:
      cashPaymentFields,

    append:
      appendCashPayment,

    remove:
      removeCashPayment,
  } = useFieldArray({
    control,
    name: 'cashPayments',
  })

  const {
    fields: clientFields,
    append: appendClient,
    remove: removeClient,
  } = useFieldArray({
    control,
    name: 'clients',
  })

  const {
    fields:
      opposingPartyFields,

    append:
      appendOpposingParty,

    remove:
      removeOpposingParty,
  } = useFieldArray({
    control,
    name: 'opposingParties',
  })

  const {
    fields:
      coLawyerFields,

    append:
      appendCoLawyer,

    remove:
      removeCoLawyer,
  } = useFieldArray({
    control,
    name: 'coLawyers',
  })

  const {
    fields:
      opposingLawyerFields,

    append:
      appendOpposingLawyer,

    remove:
      removeOpposingLawyer,
  } = useFieldArray({
    control,
    name: 'opposingLawyers',
  })

  const {
    append:
      appendBranchHistory,
  } = useFieldArray({
    control,
    name: 'branchHistory',
  })

  const {
    fields: expenseFields,
    append: appendExpense,
    remove: removeExpense,
  } = useFieldArray({
    control,
    name: 'expenses',
  })

  const {
    fields:
      otherPersonFields,

    append:
      appendOtherPerson,

    remove:
      removeOtherPerson,
  } = useFieldArray({
    control,
    name: 'otherPersons',
  })
type WatchedCashPayment = {
  clientId?: string
  clientName?: string
  amount?: unknown
  isPaid?: boolean
  paymentDate?: string
  paymentDescription?: string
}

type WatchedClient = {
  clientId?: string
  name?: string
  feeShareAmount?: unknown
  birthDate?: string
}

const watchCashPayments =
  (watch('cashPayments') ??
    []) as WatchedCashPayment[]

const watchClients =
  (watch('clients') ??
    []) as WatchedClient[]

const watchBranchHistory =
  watch('branchHistory') ?? []

const watchExpenses =
  watch('expenses') ?? []

const watchedPaymentType =
  watch('paymentType') ?? 'cash'

const effectivePaymentType =
  watchedPaymentType || paymentType

/*
|--------------------------------------------------------------------------
| مبلغ کل قرارداد
|--------------------------------------------------------------------------
|
| این متغیر باید قبل از محاسبات سهم موکلین تعریف شود.
|
*/

const contractAmount =
  toFiniteNumber(
    watch('contractAmount')
  )

/*
|--------------------------------------------------------------------------
| موکلین معتبر و فعال پرونده
|--------------------------------------------------------------------------
*/

const activeClients =
  watchClients
    .map((client, index) => ({
      index,

      clientId:
        client.clientId?.trim() ||
        undefined,

      clientName:
        client.name?.trim() || '',

      feeShareAmount:
        toFiniteNumber(
          client.feeShareAmount
        ),
    }))
    .filter((client) =>
      Boolean(
        client.clientId ||
          client.clientName
      )
    )

/*
|--------------------------------------------------------------------------
| مقدار Option مربوط به هر موکل
|--------------------------------------------------------------------------
*/

const getClientOptionValue = (
  client: {
    clientId?: string
    clientName: string
  }
): string => {
  if (client.clientId) {
    return `id:${client.clientId}`
  }

  return `name:${client.clientName}`
}

/*
|--------------------------------------------------------------------------
| محاسبه سهم حق‌الوکاله موکلین
|--------------------------------------------------------------------------
*/

const allocatedFeeTotal =
  activeClients.reduce<number>(
    (total, client) =>
      total +
      client.feeShareAmount,
    0
  )

const unallocatedFeeAmount =
  contractAmount -
  allocatedFeeTotal

/*
|--------------------------------------------------------------------------
| تقسیم مساوی حق‌الوکاله
|--------------------------------------------------------------------------
*/

const splitFeeEqually = () => {
  if (
    activeClients.length === 0 ||
    contractAmount <= 0
  ) {
    return
  }

  const baseAmount =
    Math.floor(
      contractAmount /
        activeClients.length
    )

  let assignedAmount = 0

  activeClients.forEach(
    (client, position) => {
      const isLastClient =
        position ===
        activeClients.length - 1

      /*
       * باقیمانده ناشی از تقسیم عدد صحیح به موکل آخر می‌رسد
       * تا مجموع سهم‌ها دقیقاً برابر مبلغ قرارداد باشد.
       */
      const clientShare =
        isLastClient
          ? contractAmount -
            assignedAmount
          : baseAmount

      assignedAmount +=
        clientShare

      setValue(
        `clients.${client.index}.feeShareAmount`,
        formatMoneyInput(
          clientShare
        ),
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      )
    }
  )
}

/*
|--------------------------------------------------------------------------
| موقعیت و شعبه فعال پرونده
|--------------------------------------------------------------------------
*/

const activeCourtLocationIndex =
  watchBranchHistory.findIndex(
    (location) =>
      location.isActive
  )

const activeCourtLocation =
  activeCourtLocationIndex >= 0
    ? watchBranchHistory[
        activeCourtLocationIndex
      ]
    : undefined

const activeBranch =
  activeCourtLocation
    ?.branchNumber ?? ''

const courtLocationHistory =
  watchBranchHistory
    .map((location, index) => ({
      location,
      index,
    }))
    .filter(
      ({
        location,
        index,
      }) =>
        index !==
          activeCourtLocationIndex &&
        hasCourtLocationValue(
          location
        )
    )

/*
|--------------------------------------------------------------------------
| مجموع هزینه‌های پرونده
|--------------------------------------------------------------------------
*/

const expensesTotal =
  watchExpenses.reduce<number>(
    (total, expense) =>
      total +
      toFiniteNumber(
        expense.amount
      ),
    0
  )

/*
|--------------------------------------------------------------------------
| پرداخت‌های قابل محاسبه
|--------------------------------------------------------------------------
|
| حالت cash:
| پرداخت‌های نقدی محاسبه می‌شوند.
|
| حالت both:
| پرداخت‌های نقدی نیز محاسبه می‌شوند.
|
| حالت non-cash:
| آرایه پرداخت‌های نقدی وارد محاسبات نمی‌شود.
|
*/

const relevantPayments:
  WatchedCashPayment[] =
  effectivePaymentType ===
  'non-cash'
    ? []
    : watchCashPayments

/*
|--------------------------------------------------------------------------
| مجموع مبالغ پرداخت‌شده
|--------------------------------------------------------------------------
*/

const totalPaid =
  relevantPayments.reduce<number>(
    (total, payment) => {
      if (
        payment.isPaid !== true
      ) {
        return total
      }

      return (
        total +
        toFiniteNumber(
          payment.amount
        )
      )
    },
    0
  )

/*
|--------------------------------------------------------------------------
| مجموع کل پرداخت‌ها و اقساط ثبت‌شده
|--------------------------------------------------------------------------
*/

const totalCash =
  relevantPayments.reduce<number>(
    (total, payment) =>
      total +
      toFiniteNumber(
        payment.amount
      ),
    0
  )

/*
|--------------------------------------------------------------------------
| تاریخ امروز برای تشخیص مطالبات معوق
|--------------------------------------------------------------------------
*/

const today = new Date()

today.setHours(
  0,
  0,
  0,
  0
)

/*
|--------------------------------------------------------------------------
| مجموع مطالبات معوق
|--------------------------------------------------------------------------
*/

const overdueTotal =
  relevantPayments.reduce<number>(
    (total, payment) => {
      /*
       * پرداخت انجام‌شده دیگر معوق نیست.
       */
      if (
        payment.isPaid === true
      ) {
        return total
      }

      const paymentDate =
        typeof payment.paymentDate ===
        'string'
          ? payment.paymentDate.trim()
          : ''

      if (!paymentDate) {
        return total
      }

      const parsedDueDate =
        parseFinanceDate(
          paymentDate
        )

      if (!parsedDueDate) {
        return total
      }

      /*
       * یک Date مستقل می‌سازیم تا مقدار اصلی تغییر نکند.
       */
      const dueDate =
        new Date(
          parsedDueDate.getTime()
        )

      dueDate.setHours(
        0,
        0,
        0,
        0
      )

      if (
        dueDate.getTime() >=
        today.getTime()
      ) {
        return total
      }

      return (
        total +
        toFiniteNumber(
          payment.amount
        )
      )
    },
    0
  )


useEffect(() => {
  void fetchSavedClients({
    page: 1,

    limit: 100,

    force: true,
  })
}, [
  fetchSavedClients,
])

useEffect(() => {
  const remainingAmount =
    Math.max(
      contractAmount -
        totalPaid,
      0
    )

  setValue(
    'remainingAmount',
    remainingAmount,
    {
      shouldDirty: false,
      shouldValidate: false,
    }
  )

  setValue(
    'overdueAmount',
    overdueTotal,
    {
      shouldDirty: false,
      shouldValidate: false,
    }
  )
}, [
  contractAmount,
  totalPaid,
  overdueTotal,
  setValue,
])

/*
|--------------------------------------------------------------------------
| تخصیص خودکار کل مبلغ قرارداد به موکل تک‌نفره
|--------------------------------------------------------------------------
*/

const singleClientIndex =
  activeClients.length === 1
    ? activeClients[0].index
    : null

const singleClientCurrentShare =
  activeClients.length === 1
    ? activeClients[0]
        .feeShareAmount
    : null

useEffect(() => {
  if (
    singleClientIndex === null
  ) {
    return
  }

  /*
   * جلوگیری از setValue و Render اضافه.
   */
  if (
    singleClientCurrentShare ===
    contractAmount
  ) {
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
}, [
  contractAmount,
  setValue,
  singleClientCurrentShare,
  singleClientIndex,
])







  const setOptionalNumberValue = (
    value: unknown
  ): number | undefined => {
    const processed =
      preprocessOptionalNumber(
        value
      )

    return typeof processed ===
      'number'
      ? processed
      : undefined
  }

  const fillClientFromSavedList = (
    index: number,
    savedClientId: string
  ) => {
    setValue(
      `clients.${index}.clientId`,
      savedClientId,
      {
        shouldDirty: true,
      }
    )

    if (!savedClientId) {
      setValue(
        `clients.${index}.name`,
        ''
      )

      setValue(
        `clients.${index}.phone`,
        ''
      )

      setValue(
        `clients.${index}.nationalId`,
        ''
      )

      
      setValue(
        `clients.${index}.birthDate`,
        ''
      )

      setValue(
        `clients.${index}.role`,
        ''
      )

      setValue(
        `clients.${index}.representative`,
        ''
      )

      return
    }

    const selectedClient =
      savedClients.find(
        (client) =>
          client.id ===
          savedClientId
      )

    if (!selectedClient) {
      return
    }

    setValue(
      `clients.${index}.name`,
      getSavedClientFullName(
        selectedClient
      ),
      {
        shouldDirty: true,
      }
    )

    setValue(
      `clients.${index}.phone`,
      selectedClient
        .phoneNumber ||
        selectedClient.phone ||
        '',
      {
        shouldDirty: true,
      }
    )

    setValue(
      `clients.${index}.nationalId`,
      selectedClient
        .nationalId || '',
      {
        shouldDirty: true,
      }
    )

    setValue(
      `clients.${index}.role`,
      selectedClient.role ||
        '',
      {
        shouldDirty: true,
      }
    )

    setValue(
      `clients.${index}.representative`,
      selectedClient
        .representative || '',
      {
        shouldDirty: true,
      }
    )
  }

  const handleCourtTypeInputChange =
    (value: string) => {
      setCourtTypeInput(
        value
      )

      setValue(
        'courtType',
        value,
        {
          shouldDirty: true,
        }
      )

      setFilteredCourtTypes(
        COURT_TYPES.filter(
          (type) =>
            type.includes(value)
        )
      )

      setIsCourtTypeDropdownOpen(
        true
      )
    }

  const selectCourtType = (
    courtType: string
  ) => {
    setCourtTypeInput(
      courtType
    )

    setValue(
      'courtType',
      courtType,
      {
        shouldDirty: true,
      }
    )

    setIsCourtTypeDropdownOpen(
      false
    )
  }

  const updateActiveCourtLocationField =
    (
      fieldName:
        CourtLocationField,

      value: string
    ) => {
      if (
        activeCourtLocationIndex ===
        -1
      ) {
        return
      }

      setValue(
        `branchHistory.${activeCourtLocationIndex}.${fieldName}`,
        value,
        {
          shouldDirty: true,
        }
      )

      if (
        fieldName ===
        'province'
      ) {
        setValue(
          'province',
          value,
          {
            shouldDirty: true,
          }
        )
      }

      if (
        fieldName === 'city'
      ) {
        setValue(
          'city',
          value,
          {
            shouldDirty: true,
          }
        )
      }

      if (
        fieldName ===
        'branchNumber'
      ) {
        setValue(
          'courtBranch',
          value,
          {
            shouldDirty: true,
          }
        )
      }

      if (
        fieldName ===
        'archiveNumberBranch'
      ) {
        setValue(
          'archiveNumberBranch',
          value,
          {
            shouldDirty: true,
          }
        )
      }
    }

  const activateCourtLocation = (
    index: number
  ) => {
    watchBranchHistory.forEach(
      (_, itemIndex) => {
        setValue(
          `branchHistory.${itemIndex}.isActive`,
          itemIndex === index,
          {
            shouldDirty: true,
          }
        )
      }
    )

    const selected =
      watchBranchHistory[index]

    setValue(
      'province',
      selected?.province ??
        '',
      {
        shouldDirty: true,
      }
    )

    setValue(
      'city',
      selected?.city ?? '',
      {
        shouldDirty: true,
      }
    )

    setValue(
      'courtBranch',
      selected?.branchNumber ??
        '',
      {
        shouldDirty: true,
      }
    )

    setValue(
      'archiveNumberBranch',
      selected
        ?.archiveNumberBranch ??
        '',
      {
        shouldDirty: true,
      }
    )

    setIsBranchDropdownOpen(
      false
    )
  }

  const startNewCourtLocation =
    () => {
      if (
        activeCourtLocationIndex !==
        -1
      ) {
        setValue(
          `branchHistory.${activeCourtLocationIndex}.isActive`,
          false,
          {
            shouldDirty: true,
          }
        )

        if (
          !watchBranchHistory[
            activeCourtLocationIndex
          ]?.date
        ) {
          setValue(
            `branchHistory.${activeCourtLocationIndex}.date`,

            new Intl.DateTimeFormat(
              'fa-IR-u-ca-persian'
            ).format(
              new Date()
            ),

            {
              shouldDirty: true,
            }
          )
        }
      }

      appendBranchHistory({
        province: '',
        city: '',
        branchNumber: '',
        archiveNumberBranch:
          '',
        date: '',
        isActive: true,
      })

      setValue(
        'province',
        '',
        {
          shouldDirty: true,
        }
      )

      setValue(
        'city',
        '',
        {
          shouldDirty: true,
        }
      )

      setValue(
        'courtBranch',
        '',
        {
          shouldDirty: true,
        }
      )

      setValue(
        'archiveNumberBranch',
        '',
        {
          shouldDirty: true,
        }
      )

      setIsBranchDropdownOpen(
        false
      )
    }

 const onSubmit = async (
  data: CaseFormData
) => {
  clearCaseError()
  saveCaseDraft(data)

  const cleanedClients =
      (data.clients ?? [])
        .map((client) => ({
          clientId:
            cleanText(
              client.clientId
            ) || undefined,

          name:
            cleanText(
              client.name
            ) || undefined,

          phone:
            cleanText(
              client.phone
            ) || undefined,

          nationalId:
            cleanText(
              client.nationalId
            ) || undefined,

          
          birthDate:
            cleanText(
              client.birthDate
            ) || undefined,

          role:
            cleanText(
              client.role
            ) || undefined,

          representative:
            cleanText(
              client.representative
            ) || undefined,
              feeShareAmount:
          toFiniteNumber(
            client
              .feeShareAmount
        ),
        }))
        .filter((client) =>
          hasMeaningfulValue(
            client
          )
        )

    const cleanedOpposingParties =
      (
        data.opposingParties ??
        []
      )
        .map((party) => ({
          name:
            cleanText(
              party.name
            ) || undefined,

          phone:
            cleanText(
              party.phone
            ) || undefined,

          nationalId:
            cleanText(
              party.nationalId
            ) || undefined,

          role:
            cleanText(
              party.role
            ) || undefined,

          birthDate:
            cleanText(
              party.birthDate
            ) || undefined,

          description:
            cleanText(
              party.description
            ) || undefined,
        }))
        .filter((party) =>
          hasMeaningfulValue(
            party
          )
        )

    const cleanedOtherPersons =
      (
        data.otherPersons ??
        []
      )
        .map((person) => ({
          name:
            cleanText(
              person.name
            ) || undefined,

          phone:
            cleanText(
              person.phone
            ) || undefined,

          nationalId:
            cleanText(
              person.nationalId
            ) || undefined,

          
          birthDate:
            cleanText(
              person.birthDate
            ) || undefined,

          role:
            cleanText(
              person.role
            ) || undefined,

          description:
            cleanText(
              person.description
            ) || undefined,
        }))
        .filter((person) =>
          hasMeaningfulValue(
            person
          )
        )

    const cleanLawyers = (
      lawyers?:
        CaseFormData['coLawyers']
    ) => {
      return (
        lawyers ?? []
      )
        .map((lawyer) => ({
          name:
            cleanText(
              lawyer.name
            ) || undefined,

          phone:
            cleanText(
              lawyer.phone
            ) || undefined,

          
          nationalId:
            cleanText(
              lawyer.nationalId
            ) || undefined,

          birthDate:
            cleanText(
              lawyer.birthDate
            ) || undefined,

          role:
            cleanText(
              lawyer.role
            ) || undefined,

          licenseNumber:
            cleanText(
              lawyer.licenseNumber
            ) || undefined,

          licenseExpiry:
            cleanText(
              lawyer.licenseExpiry
            ) || undefined,

          licenseIssuePlace:
            cleanText(
              lawyer.licenseIssuePlace
            ) || undefined,
        }))
        .filter((lawyer) =>
          hasMeaningfulValue(
            lawyer
          )
        )
    }

    const cleanedBranchHistory =
      (
        data.branchHistory ??
        []
      )
        .map((location) => ({
          province:
            cleanText(
              location.province
            ) || undefined,

          city:
            cleanText(
              location.city
            ) || undefined,

          branchNumber:
            cleanText(
              location.branchNumber
            ) || undefined,

          archiveNumberBranch:
            cleanText(
              location.archiveNumberBranch
            ) || undefined,

          date:
            cleanText(
              location.date
            ) || undefined,

          isActive:
            Boolean(
              location.isActive
            ),
        }))
        .filter(
          hasCourtLocationValue
        )

    const activeCourtLocationForSubmit =
      cleanedBranchHistory.find(
        (location) =>
          location.isActive
      ) ??
      cleanedBranchHistory[
        cleanedBranchHistory.length -
          1
      ]

    const selectedPaymentType =
      data.paymentType ??
      paymentType ??
      'cash'

const formattedCashPayments =
  selectedPaymentType ===
  'non-cash'
    ? []
    : (
        data.cashPayments ??
        []
      )
        .map((payment) => {
          const requestedClientId =
            cleanText(
              payment.clientId
            )

          const requestedClientName =
            cleanText(
              payment.clientName
            )

          const matchedClient =
            cleanedClients.find(
              (client) =>
                requestedClientId
                  ? client.clientId ===
                    requestedClientId
                  : client.name ===
                    requestedClientName
            )

          const onlyClient =
            cleanedClients.length ===
            1
              ? cleanedClients[0]
              : undefined

          const paymentClient =
            matchedClient ??
            onlyClient

          return {
            clientId:
              paymentClient
                ?.clientId,

            clientName:
              paymentClient
                ?.name,

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
                payment
                  .paymentDate
              ) || undefined,

            paymentDescription:
              cleanText(
                payment
                  .paymentDescription
              ) || undefined,
          }
        })
        .filter(
          (payment) =>
            payment.amount > 0 ||
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
        .map((expense) => ({
          title:
            cleanText(
              expense.title
            ) || undefined,

          description:
            cleanText(
              expense.description
            ) || undefined,

          amount:
            toFiniteNumber(
              expense.amount
            ),

          date:
            cleanText(
              expense.date
            ) || undefined,

          isPaid:
            Boolean(
              expense.isPaid
            ),
        }))
        .filter((expense) =>
          hasMeaningfulValue(
            expense
          )
        )

    const normalizedContractAmount =
      toFiniteNumber(
        data.contractAmount
      )

    const scheduledCashAmount =
      formattedCashPayments.reduce(
        (sum, payment) =>
          sum +
          payment.amount,
        0
      )

    const paidAmount =
      formattedCashPayments.reduce(
        (sum, payment) =>
          payment.isPaid
            ? sum +
              payment.amount
            : sum,
        0
      )

    const remainingAmount =
      Math.max(
        normalizedContractAmount -
          paidAmount,
        0
      )

    const startOfToday =
      new Date()

    startOfToday.setHours(
      0,
      0,
      0,
      0
    )

    const overdueAmount =
      formattedCashPayments.reduce(
        (sum, payment) => {
          if (
            payment.isPaid ||
            !payment.paymentDate
          ) {
            return sum
          }

          const dueDate =
            parseFinanceDate(
              payment.paymentDate
            )

          if (
            !dueDate ||
            dueDate.getTime() >=
              startOfToday.getTime()
          ) {
            return sum
          }

          return (
            sum +
            payment.amount
          )
        },
        0
      )

    const firstDueDate =
      getFirstDate(
        formattedCashPayments
          .filter(
            (payment) =>
              !payment.isPaid &&
              Boolean(
                payment.paymentDate
              )
          )
          .map((payment) =>
            parseFinanceDate(
              payment.paymentDate
            )
          )
      )

    const lastPaymentDate =
      getLastDate(
        formattedCashPayments
          .filter(
            (payment) =>
              payment.isPaid &&
              Boolean(
                payment.paymentDate
              )
          )
          .map((payment) =>
            parseFinanceDate(
              payment.paymentDate
            )
          )
      )

    const primaryClient =
      cleanedClients.find(
        (client) =>
          Boolean(
            client.clientId
          )
      ) ??
      cleanedClients.find(
        (client) =>
          Boolean(client.name)
      )

    const activeCourtType =
      cleanText(
        data.courtType ||
          courtTypeInput
      )

    const hasCourtBranchData =
      hasCourtLocationValue(
        activeCourtLocationForSubmit
      )

    const payload: CreateCasePayload =
      {
        title:
          cleanText(
            data.title
          ),

        status: data.status,

        caseNumber:
  cleanText(
    data.caseNumber
  ),

        archiveNumberOffice:
          cleanText(
            data.archiveNumberOffice
          ) || undefined,

clients:
  cleanedClients,

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
            ?.province,

        city:
          activeCourtLocationForSubmit
            ?.city,

        courtType:
          activeCourtType ||
          undefined,

        archiveNumberBranch:
          activeCourtLocationForSubmit
            ?.archiveNumberBranch,

        courtBranch:
          hasCourtBranchData
            ? {
                province:
                  activeCourtLocationForSubmit
                    ?.province,

                city:
                  activeCourtLocationForSubmit
                    ?.city,

                courtType:
                  activeCourtType ||
                  undefined,

                branch:
                  activeCourtLocationForSubmit
                    ?.branchNumber,

                currentBranchNumber:
                  activeCourtLocationForSubmit
                    ?.branchNumber,

                archiveNumberBranch:
                  activeCourtLocationForSubmit
                    ?.archiveNumberBranch,

                branchHistory:
                  cleanedBranchHistory,
              }
            : undefined,

        paymentType:
          selectedPaymentType,

        cashPayments:
          formattedCashPayments,

        expenses:
          cleanedExpenses,

        nonCashDescription:
          selectedPaymentType ===
          'cash'
            ? ''
            : cleanText(
                data.nonCashDescription
              ),

        estimatedPrice:
          selectedPaymentType ===
          'cash'
            ? undefined
            : toFiniteNumber(
                data.estimatedPrice
              ) || undefined,


        description:
          cleanText(
            data.description
          ) || undefined,

        contractAmount:
          normalizedContractAmount >
          0
            ? String(
                normalizedContractAmount
              )
            : '',

        totalFee:
          normalizedContractAmount,

        totalAmount:
          scheduledCashAmount,

        paidAmount,

        remainingAmount,

        overdueAmount:
          String(
            overdueAmount
          ),

        dueDate:
          firstDueDate
            ?.toISOString(),

        lastPaymentDate:
          lastPaymentDate
            ?.toISOString(),
      }

    const createdCase =
      await addCase(payload)

    if (!createdCase) {
      saveCaseDraft(data)
      return
    }

    clearCaseDraft()

    router.push(
      '/dashboard/cases'
    )

    router.refresh()
  }






  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cases" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">پرونده جدید</h1>
          <p className="text-sm sm:text-base text-zinc-600 mt-1">اطلاعات پرونده را وارد کنید</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg border text-zinc-900 border-zinc-200 p-4 sm:p-6 space-y-8"
      >
        <input type="hidden" {...register('courtType')} />
        <input type="hidden" {...register('province')} />
        <input type="hidden" {...register('city')} />
        <input type="hidden" {...register('courtBranch')} />
        <input type="hidden" {...register('archiveNumberBranch')} />

        {/* اطلاعات پایه */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-blue-100 pb-3 mb-4">
            اطلاعات پایه
          </h2>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              عنوان پرونده *
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="مثال: پرونده طلاق"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              وضعیت
            </label>
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
              {...register('archiveNumberOffice')}
              type="text"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="مثال: 1405/125"
              dir="ltr"
            />
          </div>
        </div>

        {/* مشخصات پرونده */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-green-100 pb-3 mb-4">
            مشخصات پرونده
          </h2>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-green-800 mb-2">
                  نوع دادگاه
                </label>

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
                    aria-label="باز کردن فهرست نوع دادگاه"
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
                  placeholder="شماره پرونده"
                  dir="ltr"
                />
                {errors.caseNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.caseNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  استان
                </label>
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
                <label className="block text-sm font-medium text-green-800 mb-2">
                  شهر / بخش
                </label>
                <input
                  type="text"
                  value={activeCourtLocation?.city || ''}
                  onChange={(event) => updateActiveCourtLocationField('city', event.target.value)}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="نام شهر / بخش"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-green-800 mb-2">
                  شعبه
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={activeBranch}
                    onFocus={() => {
                      if (courtLocationHistory.length > 0) {
                        setIsBranchDropdownOpen(true)
                      }
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
                      aria-label="نمایش تاریخچه شعبه"
                    >
                      <ChevronDown size={20} className="text-green-500" />
                    </button>
                  )}

                  {isBranchDropdownOpen && courtLocationHistory.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-green-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-green-200 bg-green-50">
                        <p className="text-xs text-green-700 font-medium">
                          تاریخچه اطلاعات شعبه
                        </p>
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
                              {location.province || 'استان نامشخص'} /{' '}
                              {location.city || 'شهر نامشخص'} / شعبه{' '}
                              {location.branchNumber || 'ثبت نشده'}
                            </span>
                            <span className="block text-xs text-green-600 mt-1">
                              بایگانی: {location.archiveNumberBranch || 'ثبت نشده'} -{' '}
                              {location.date || 'تاریخ ثبت نشده'}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  شماره بایگانی شعبه
                </label>
                <input
                  type="text"
                  value={activeCourtLocation?.archiveNumberBranch || ''}
                  onChange={(event) => updateActiveCourtLocationField('archiveNumberBranch', event.target.value)}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="شماره بایگانی شعبه"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="rounded-lg bg-green-100/70 border border-green-200 p-3 text-xs text-green-800 leading-6">
              استان، شهر / بخش، شعبه و شماره بایگانی شعبه به‌صورت یک رکورد واحد ذخیره می‌شوند.
              برای تغییر این اطلاعات، دکمه زیر را بزنید تا رکورد جدید ثبت شود.
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
                <p className="text-green-700 font-medium text-xs">
                  تعداد تغییرات اطلاعات شعبه: {courtLocationHistory.length}
                </p>
                <p className="text-green-600 text-xs mt-1">
                  شعبه فعلی: {activeBranch || 'ثبت نشده'}
                </p>
              </div>
            )}
          </div>
        </div>

       {/* موکلین */}
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Users className="text-blue-600" size={20} />
      <h2 className="text-lg font-semibold text-zinc-800">
        موکلین *
      </h2>
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

  {errors.clients?.message && (
    <p className="text-sm font-medium text-red-600">
      {errors.clients.message}
    </p>
  )}

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
                onClick={() => removeClient(index)}
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
              disabled={isClientsLoading}
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

              {savedClients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {getSavedClientFullName(client)}
                  {client.nationalId
                    ? ` - ${client.nationalId}`
                    : ''}
                  {client.phoneNumber
                    ? ` - ${client.phoneNumber}`
                    : ''}
                </option>
              ))}
            </select>

            {clientsError ? (
              <p className="mt-1 text-xs font-medium text-red-600">
                {clientsError}
              </p>
            ) : (
              <p className="mt-1 text-xs text-blue-500">
                {savedClients.length > 0
                  ? `${savedClients.length.toLocaleString(
                      'fa-IR'
                    )} موکل از سرور دریافت شده است.`
                  : isClientsLoading
                    ? 'در حال دریافت اطلاعات از سرور...'
                    : 'می‌توانید اطلاعات موکل را به‌صورت دستی وارد کنید.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-blue-700 font-medium block mb-1">
                نام شخص حقیقی/حقوقی
              </label>
              <input
                {...register(`clients.${index}.name` as const)}
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
                {...register(`clients.${index}.phone` as const)}
                type="text"
                maxLength={11}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="09123456789"
                dir="ltr"
              />

              {errors.clients?.[index]?.phone && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.clients[index]?.phone?.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-blue-700 font-medium block mb-1">
                کد ملی / شناسه ملی
              </label>
              <input
                {...register(`clients.${index}.nationalId` as const)}
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
                    setValueAs: (value) =>
                      formatDateInput(
                        String(value ?? '')
                      ),
                    onChange: (event) => {
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
                {...register(`clients.${index}.representative` as const)}
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
      <h2 className="text-lg font-semibold text-zinc-800">طرف مقابل</h2>
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
      <UserX className="mx-auto text-zinc-400 mb-2" size={32} />
      <p className="text-sm text-zinc-500">
        هیچ طرف مقابلی اضافه نشده است
      </p>
    </div>
  )}

  <div className="grid gap-4">
    {opposingPartyFields.map((field, index) => {
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
            <h3 className="text-sm font-medium text-zinc-700">
              طرف مقابل {index + 1}
            </h3>

            <button
              type="button"
              onClick={() => removeOpposingParty(index)}
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
                {...register(`opposingParties.${index}.name` as const)}
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
                {...register(`opposingParties.${index}.phone` as const)}
                type="text"
                maxLength={11}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-white"
                placeholder="09123456789"
                dir="ltr"
              />

              {errors.opposingParties?.[index]?.phone && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.opposingParties[index]?.phone?.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-zinc-700 font-medium block mb-1">
                کد ملی / شناسنامه
              </label>
              <input
                {...register(`opposingParties.${index}.nationalId` as const)}
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
                    setValueAs: (value) =>
                      formatDateInput(
                        String(value ?? '')
                      ),
                    onChange: (event) => {
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
                {...register(`opposingParties.${index}.role` as const)}
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
              {...register(`opposingParties.${index}.description` as const)}
              rows={2}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-white resize-none"
              placeholder="توضیحات مربوط به طرف مقابل..."
            />
          </div>
        </div>
      )
    })}
  </div>
</div>

        {/* وکلای همکار */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-purple-100 pb-3">
            <h2 className="text-lg font-semibold text-zinc-800">
              وکلای همکار / سرپرست
            </h2>
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
              <Plus size={16} />
              افزودن وکیل همکار
            </button>
          </div>

          {coLawyerFields.length === 0 && (
            <div className="bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl p-6 text-center">
              <p className="text-sm text-purple-600">
                هیچ وکیل همکاری اضافه نشده
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {coLawyerFields.map((field, index) => (
              <div
                key={field.id}
                className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-purple-800">
                    وکیل همکار {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeCoLawyer(index)}
                    className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">
                      نام و نام خانوادگی
                    </label>
                    <input
                      {...register(`coLawyers.${index}.name` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="نام وکیل"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">
                      شماره موبایل
                    </label>
                    <input
                      {...register(`coLawyers.${index}.phone` as const)}
                      type="text"
                      maxLength={11}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="09123456789"
                      dir="ltr"
                    />
                    {errors.coLawyers?.[index]?.phone && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.coLawyers[index]?.phone?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">
                      کد ملی
                    </label>
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
                    <label className="text-xs text-purple-700 font-medium block mb-1">
                      تاریخ تولد
                    </label>
                    <input
                      {...register(
                        `coLawyers.${index}.birthDate` as const,
                        {
                          setValueAs: (value) =>
                            formatDateInput(
                              String(value ?? '')
                            ),
                          onChange: (event) => {
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
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="1404/05/20"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">
                      شماره پروانه
                    </label>
                    <input
                      {...register(`coLawyers.${index}.licenseNumber` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="شماره پروانه"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">
                      تاریخ اعتبار پروانه
                    </label>
                    <input
                      {...register(
                        `coLawyers.${index}.licenseExpiry` as const,
                        {
                          setValueAs: (value) =>
                            formatDateInput(
                              String(value ?? '')
                            ),
                          onChange: (event) => {
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
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="1405/12/29"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">
                      حوزه وکالت
                    </label>
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
            <h2 className="text-lg font-semibold text-zinc-800">
              وکلای طرف مقابل
            </h2>
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
              <Plus size={16} />
              افزودن وکیل طرف مقابل
            </button>
          </div>

          {opposingLawyerFields.length === 0 && (
            <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl p-6 text-center">
              <p className="text-sm text-orange-600">
                هیچ وکیل طرف مقابلی اضافه نشده
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {opposingLawyerFields.map((field, index) => (
              <div
                key={field.id}
                className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    وکیل طرف مقابل {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeOpposingLawyer(index)}
                    className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">
                      نام و نام خانوادگی
                    </label>
                    <input
                      {...register(`opposingLawyers.${index}.name` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="نام وکیل"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">
                      شماره موبایل
                    </label>
                    <input
                      {...register(`opposingLawyers.${index}.phone` as const)}
                      type="text"
                      maxLength={11}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="09123456789"
                      dir="ltr"
                    />
                    {errors.opposingLawyers?.[index]?.phone && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.opposingLawyers[index]?.phone?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">
                      کد ملی
                    </label>
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
                    <label className="text-xs text-orange-700 font-medium block mb-1">
                      تاریخ تولد
                    </label>
                    <input
                      {...register(
                        `opposingLawyers.${index}.birthDate` as const,
                        {
                          setValueAs: (value) =>
                            formatDateInput(
                              String(value ?? '')
                            ),
                          onChange: (event) => {
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
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="1404/05/20"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">
                      شماره پروانه
                    </label>
                    <input
                      {...register(`opposingLawyers.${index}.licenseNumber` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="شماره پروانه"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">
                      تاریخ اعتبار پروانه
                    </label>
                    <input
                      {...register(
                        `opposingLawyers.${index}.licenseExpiry` as const,
                        {
                          setValueAs: (value) =>
                            formatDateInput(
                              String(value ?? '')
                            ),
                          onChange: (event) => {
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
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="1405/12/29"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">
                      حوزه وکالت
                    </label>
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
      <Plus size={16} />
      افزودن سایر اشخاص
    </button>
  </div>

  {otherPersonFields.length === 0 && (
    <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-xl p-6 text-center">
      <p className="text-sm text-green-600">
        هیچ فرد دیگری اضافه نشده
      </p>
    </div>
  )}

  <div className="grid gap-4">
    {otherPersonFields.map((field, index) => (
      <div
        key={field.id}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-green-800">
            سایر اشخاص {index + 1}
          </h3>

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
            <label className="text-xs text-green-700 font-medium block mb-1">
              نام و نام خانوادگی
            </label>
            <input
              {...register(`otherPersons.${index}.name` as const)}
              type="text"
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="نام فرد"
            />
          </div>

          <div>
            <label className="text-xs text-green-700 font-medium block mb-1">
              شماره موبایل
            </label>
            <input
              {...register(`otherPersons.${index}.phone` as const)}
              type="text"
              maxLength={11}
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="09123456789"
              dir="ltr"
            />

            {errors.otherPersons?.[index]?.phone && (
              <p className="mt-1 text-xs text-red-600">
                {errors.otherPersons[index]?.phone?.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-green-700 font-medium block mb-1">
              کد ملی
            </label>
            <input
              {...register(`otherPersons.${index}.nationalId` as const)}
              type="text"
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="کد ملی"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-xs text-green-700 font-medium block mb-1">
              تاریخ تولد
            </label>
            <input
              {...register(
                `otherPersons.${index}.birthDate` as const,
                {
                  setValueAs: (value) =>
                    formatDateInput(
                      String(value ?? '')
                    ),
                  onChange: (event) => {
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
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="1404/05/20"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-xs text-green-700 font-medium block mb-1">
              سمت
            </label>
            <input
              {...register(`otherPersons.${index}.role` as const)}
              type="text"
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="مثلا شاهد، کارشناس، نماینده"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-green-700 font-medium block mb-1">
            توضیحات
          </label>
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
  <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-green-100 pb-3 mb-4">
    حق الوکاله
  </h2>

  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-emerald-800 mb-2">
          مبلغ نقدی قرارداد (ریال)
        </label>
        <input
  {...register('contractAmount', {
    setValueAs:
      setOptionalNumberValue,
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
  placeholder="مثال: 50,000,000"
  dir="ltr"
/>

{errors.contractAmount && (
  <p className="mt-1 text-xs text-red-600">
    {errors.contractAmount.message}
  </p>
)}
      </div>

      <div>
        <label className="block text-sm font-medium text-emerald-800 mb-2">
          مبلغ مانده قرارداد (ریال)
        </label>
        <input
          value={Number(watch('remainingAmount') || 0).toLocaleString()}
          readOnly
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg bg-emerald-50"
          dir="ltr"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-emerald-800 mb-2">
          مبلغ معوق (ریال)
        </label>
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
        <h3 className="font-bold text-violet-900">
          تقسیم حق‌الوکاله بین موکلین
        </h3>

        <p className="mt-1 text-sm leading-6 text-violet-700">
          سهم هر موکل را مشخص کنید. مجموع سهم‌ها باید دقیقاً برابر مبلغ کل قرارداد باشد.
        </p>
      </div>

      <button
        type="button"
        onClick={
          splitFeeEqually
        }
        disabled={
          contractAmount <= 0
        }
        className="shrink-0 rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        تقسیم مساوی
      </button>
    </div>

    <div className="mt-5 grid gap-3">
      {activeClients.map(
        (client) => (
          <div
            key={
              client.clientId ??
              `${client.clientName}-${client.index}`
            }
            className="grid grid-cols-1 items-center gap-3 rounded-xl border border-violet-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,260px)]"
          >
            <div className="min-w-0">
              <p className="truncate font-bold text-zinc-900">
                {client.clientName ||
                  `موکل ${client.index + 1}`}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                سهم این موکل از مبلغ کل قرارداد
              </p>
            </div>

            <div>
              <div className="relative">
                <input
                  {...register(
                    `clients.${client.index}.feeShareAmount`,
                    {
                      setValueAs:
                        setOptionalNumberValue,
                      onChange: (event) => {
                        event.target.value =
                          formatMoneyInput(
                            event.target.value
                          )
                      },
                    }
                  )}
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

              {errors.clients?.[
                client.index
              ]?.feeShareAmount && (
                <p className="mt-1 text-xs text-red-600">
                  {
                    errors.clients[
                      client.index
                    ]?.feeShareAmount
                      ?.message
                  }
                </p>
              )}
            </div>
          </div>
        )
      )}
    </div>

    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-lg bg-white p-3 ring-1 ring-violet-100">
        <p className="text-xs text-zinc-500">
          مبلغ کل قرارداد
        </p>

        <p className="mt-1 font-black text-zinc-900">
          {contractAmount.toLocaleString(
            'fa-IR'
          )}{' '}
          ریال
        </p>
      </div>

      <div className="rounded-lg bg-white p-3 ring-1 ring-violet-100">
        <p className="text-xs text-zinc-500">
          مجموع سهم‌های ثبت‌شده
        </p>

        <p className="mt-1 font-black text-violet-700">
          {allocatedFeeTotal.toLocaleString(
            'fa-IR'
          )}{' '}
          ریال
        </p>
      </div>

      <div
        className={`rounded-lg p-3 ring-1 ${
          unallocatedFeeAmount ===
          0
            ? 'bg-emerald-50 ring-emerald-200'
            : 'bg-red-50 ring-red-200'
        }`}
      >
        <p className="text-xs text-zinc-500">
          اختلاف با مبلغ قرارداد
        </p>

        <p
          className={`mt-1 font-black ${
            unallocatedFeeAmount ===
            0
              ? 'text-emerald-700'
              : 'text-red-700'
          }`}
        >
          {Math.abs(
            unallocatedFeeAmount
          ).toLocaleString(
            'fa-IR'
          )}{' '}
          ریال
        </p>
      </div>
    </div>
  </div>
)}




  <div className="space-y-3">
    <label className="block text-sm font-medium text-zinc-900">
      نوع قرارداد
    </label>

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
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
          paymentType === 'both'
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
        }`}
      >
        <span
          className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold ${
            paymentType === 'both'
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
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="font-medium text-green-800 text-lg">پرداخت‌های نقدی</h3>

        <button
          type="button"
          onClick={() =>
            appendCashPayment({
                clientId: '',
                clientName: '',
                amount: undefined,
                isPaid: false,
                paymentDate: '',
                paymentDescription: '',
            })
          }
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          <Plus size={16} />
          افزودن پرداخت
        </button>
      </div>

      <div className="bg-green-100 p-4 rounded-lg">
        <p className="text-green-800 font-bold text-lg">
          مجموع پرداخت‌ها: {totalCash.toLocaleString()} ریال
        </p>
      </div>

      <div className="space-y-4">
        {cashPaymentFields.map((field, index) => (
          <div
            key={field.id}
            className="bg-white border border-green-300 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-green-800">
                پرداخت {index + 1}
              </h4>

              <button
                type="button"
                onClick={() => removeCashPayment(index)}
                className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {activeClients.length > 1 && (
  <div>
    <label className="mb-1 block text-xs font-medium text-green-700">
      موکل مرتبط
    </label>

    <select
      value={
        watch(
          `cashPayments.${index}.clientId`
        )
          ? `id:${watch(
              `cashPayments.${index}.clientId`
            )}`
          : watch(
                `cashPayments.${index}.clientName`
              )
            ? `name:${watch(
                `cashPayments.${index}.clientName`
              )}`
            : ''
      }
      onChange={(event) => {
        const selectedValue =
          event.target.value

        const selectedClient =
          activeClients.find(
            (client) =>
              getClientOptionValue(
                client
              ) ===
              selectedValue
          )

        setValue(
          `cashPayments.${index}.clientId`,
          selectedClient
            ?.clientId ?? '',
          {
            shouldDirty: true,
            shouldValidate: true,
          }
        )

        setValue(
          `cashPayments.${index}.clientName`,
          selectedClient
            ?.clientName ?? '',
          {
            shouldDirty: true,
            shouldValidate: true,
          }
        )
      }}
      className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500"
    >
      <option value="">
        انتخاب موکل
      </option>

      {activeClients.map(
        (client) => (
          <option
            key={
              client.clientId ??
              `${client.clientName}-${client.index}`
            }
            value={
              getClientOptionValue(
                client
              )
            }
          >
            {client.clientName ||
              `موکل ${client.index + 1}`}
          </option>
        )
      )}
    </select>

    {errors.cashPayments?.[
      index
    ]?.clientId && (
      <p className="mt-1 text-xs text-red-600">
        {
          errors.cashPayments[
            index
          ]?.clientId
            ?.message
        }
      </p>
    )}
  </div>
)}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
              <div>
                <label className="text-xs text-green-700 font-medium block mb-1">
                  مبلغ (ریال)
                </label>
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
                <label className="text-xs text-green-700 font-medium block mb-1">
                            تاریخ پرداخت یا سررسید (شمسی)

                </label>
                <input
                  type="text"
                  {...register(`cashPayments.${index}.paymentDate` as const, {
                    setValueAs: (value) =>
                      formatDateInput(
                        String(value ?? '')
                      ),
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
                  <input
                    type="checkbox"
                    {...register(`cashPayments.${index}.isPaid` as const)}
                    className="text-green-600"
                  />
                  <span className="text-sm text-green-800 font-medium">
                    پرداخت شده
                  </span>
                </label>
              </div>

            </div>

            <div className="mt-3">
              <label className="text-xs text-green-700 font-medium block mb-1">
                توضیح
              </label>
              <textarea
                {...register(
                  `cashPayments.${index}.paymentDescription` as const
                )}
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
      <h3 className="font-medium text-blue-800 text-lg">
        توضیحات پرداخت غیر نقدی
      </h3>

      <p className="text-sm text-blue-600">
        در صورتی که پرداخت به صورت غیر نقدی مثل زمین، ملک، خودرو و ... انجام می‌شود، جزئیات را وارد کنید.
      </p>

      <div>
        <label className="block text-sm font-medium text-blue-800 mb-2">
          حدود قیمت (ریال)
        </label>
        <input
          {...register('estimatedPrice', {
            setValueAs:
              setOptionalNumberValue,
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
        <p className="mt-1 text-xs text-blue-600">
          ارزش تقریبی مال یا تعهد غیرنقدی را برای گزارش مالی وارد کنید.
        </p>
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
                        setValueAs: (value) =>
                          formatDateInput(
                            String(value ?? '')
                          ),
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
        {caseError && (
  <div
    role="alert"
    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
  >
    {caseError}
  </div>
)}

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
    : 'ذخیره پرونده'}
</button>
          <Link
            href="/dashboard/cases"
            className="px-6 py-3 border-2 border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors text-center font-medium text-lg"
          >
            انصراف
          </Link>
        </div>
      </form>
    </div>
  )
}