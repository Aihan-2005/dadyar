


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

import { useCasesStore } from '@/store/cases.store'
import { useAuthStore } from '@/store/auth.store'
import {
  useClientStore,
  type Client,
} from '@/store/client.store'
import type { CreateCasePayload } from '@/types/case'

import {
  parseFinanceDate,
} from '@/features/finance/utils/date'
import {
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
  representative:
    optionalTextSchema,
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
  nationalId: optionalTextSchema,
  role: optionalTextSchema,
  description: optionalTextSchema,
})

const paymentSchema = z.object({
  amount: optionalNumberSchema,
  isPaid: z
    .boolean()
    .optional()
    .default(false),
  paymentDate: optionalTextSchema,
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

  status: z.enum([
    'pending',
    'in-progress',
    'completed',
    'archived',
  ]),

  clients: z
    .array(clientSchema)
    .optional(),

  opposingParties: z
    .array(opposingPartySchema)
    .optional(),

  caseNumber: optionalTextSchema,

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
})

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


type AuthUserWithArchive = {
  id: string
  archiveNumberOffice?: string
  archiveNumberLawyer?: string
}

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
    client.firstName,
    client.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  return (
    fullName ||
    client.name ||
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
  const router = useRouter()

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

  const clearCaseError =
    useCasesStore(
      (state) =>
        state.clearError
    )

  const user =
    useAuthStore(
      (state) =>
        state.user
    )

  const savedClients =
    useClientStore(
      (state) =>
        state.clients
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

  defaultValues: {
    title: '',

    status: 'pending',

    paymentType: 'cash',

    caseNumber: '',

    cashPayments: [],

    clients: [
      {
        clientId: '',
        name: '',
        phone: '',
        nationalId: '',
        role: '',
        representative: '',
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

  const watchCashPayments =
    watch(
      'cashPayments'
    ) ?? []

  const watchBranchHistory =
    watch(
      'branchHistory'
    ) ?? []

  const watchExpenses =
    watch(
      'expenses'
    ) ?? []

  const watchedPaymentType =
    watch(
      'paymentType'
    ) ?? 'cash'

  const effectivePaymentType =
    watchedPaymentType ||
    paymentType

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
      .map(
        (location, index) => ({
          location,
          index,
        })
      )
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


      const expensesTotal =
  watchExpenses.reduce<number>(
    (total, expense) => {
      return (
        total +
        toFiniteNumber(
          expense.amount,
        )
      )
    },
    0,
  )

const contractAmount =
  toFiniteNumber(
    watch('contractAmount'),
  )

const relevantPayments =
  effectivePaymentType ===
  'non-cash'
    ? []
    : watchCashPayments

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
          payment.amount,
        )
      )
    },
    0,
  )

const totalCash =
  relevantPayments.reduce<number>(
    (total, payment) => {
      return (
        total +
        toFiniteNumber(
          payment.amount,
        )
      )
    },
    0,
  )

const today = new Date()

today.setHours(
  0,
  0,
  0,
  0,
)

const overdueTotal =
  relevantPayments.reduce<number>(
    (total, payment) => {
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
          paymentDate,
        )

      if (!parsedDueDate) {
        return total
      }

      /*
       * یک Date جدید می‌سازیم تا مقدار بازگشتی
       * parseFinanceDate را mutate نکنیم.
       */
      const dueDate =
        new Date(
          parsedDueDate.getTime(),
        )

      dueDate.setHours(
        0,
        0,
        0,
        0,
      )

      const isOverdue =
        dueDate.getTime() <
        today.getTime()

      if (!isOverdue) {
        return total
      }

      return (
        total +
        toFiniteNumber(
          payment.amount,
        )
      )
    },
    0,
  )

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
    if (!user?.id) {
      return
    }

    clearCaseError()

    const authUser =
      user as AuthUserWithArchive

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

          role:
            cleanText(
              client.role
            ) || undefined,

          representative:
            cleanText(
              client.representative
            ) || undefined,
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
            .map(
              (payment) => ({
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
              })
            )
            .filter(
              (payment) =>
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
          ) || undefined,

        lawyerId:
          authUser.id,

        archiveNumberOffice:
          authUser
            .archiveNumberOffice,

        archiveNumberLawyer:
          authUser
            .archiveNumberLawyer,

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
      return
    }

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
            <label className="block text-sm font-medium text-zinc-900 mb-2">شماره پرونده</label>
            <input
              {...register('caseNumber')}
              type="text"
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="شماره پرونده"
              dir="ltr"
            />
          </div>
        </div>

        {/* شعبه دادگاه */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-green-100 pb-3 mb-4">شعبه دادگاه</h2>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 space-y-6">
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
                      <div className="px-4 py-3 text-zinc-500">نتیجه‌ای یافت نشد؛ متن تایپ‌شده ذخیره می‌شود.</div>
                    )}
                  </div>
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
                <label className="block text-sm font-medium text-green-800 mb-2">شهر</label>
                <input
                  type="text"
                  value={activeCourtLocation?.city || ''}
                  onChange={(event) => updateActiveCourtLocationField('city', event.target.value)}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="نام شهر"
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
                <label className="block text-sm font-medium text-green-800 mb-2">شماره بایگانی در شعبه دادگاه</label>
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
    role: '',
    representative: '',
  })
}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      <Plus size={16} />
      افزودن موکل
    </button>
  </div>

  <div className="grid gap-4">
    {clientFields.map((field, index) => (
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
            value={(watch(`clients.${index}.clientId` as any) as string) || ''}
            onChange={(e) => fillClientFromSavedList(index, e.target.value)}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">ورود دستی اطلاعات موکل</option>

            {savedClients.map((client: any) => (
              <option key={client.id} value={client.id}>
                {getSavedClientFullName(client)}
                {client.nationalId ? ` - ${client.nationalId}` : ''}
                {client.phoneNumber ? ` - ${client.phoneNumber}` : ''}
              </option>
            ))}
          </select>

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
              کد ملی/شناسه ملی
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
              سمت
            </label>
            <input
              {...register(`clients.${index}.role` as const)}
              type="text"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="مثلا خواهان"
            />
          </div>

          <div>
            <label className="text-xs text-blue-700 font-medium block mb-1">
              نماینده
            </label>
            <input
              {...register(`clients.${index}.representative` as const)}
              type="text"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="نام نماینده"
            />
          </div>
        </div>
      </div>
    ))}
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
          role: '',
          birthDate: '',
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
      <p className="text-sm text-zinc-500">هیچ طرف مقابلی اضافه نشده است</p>
    </div>
  )}

  <div className="grid gap-4">
    {opposingPartyFields.map((field, index) => {
      const birthDateValue = watch(`opposingParties.${index}.birthDate` as const)
      const underLegalAge = isUnderLegalAge(birthDateValue)

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
                کد ملی/شناسه ملی
              </label>
              <input
                {...register(`opposingParties.${index}.nationalId` as const)}
                type="text"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-white"
                placeholder="کد یا شناسه"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-700 font-medium block mb-1">
                سمت
              </label>
              <input
                {...register(`opposingParties.${index}.role` as const)}
                type="text"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-white"
                placeholder="مثلا خوانده"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-700 font-medium block mb-1">
                تاریخ تولد
              </label>
              <input
                {...register(`opposingParties.${index}.birthDate` as const)}
                type="text"
                className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 bg-white ${
                  underLegalAge
                    ? 'border border-red-400 focus:ring-red-500'
                    : 'border border-zinc-200 focus:ring-zinc-500'
                }`}
                placeholder="مثال: 1384/09/09"
                dir="ltr"
              />

              {underLegalAge && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  زیر سن قانونی
                </p>
              )}
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
            <h2 className="text-lg font-semibold text-zinc-800">وکلای همکار / سرپرست</h2>
            <button
              type="button"
              onClick={() => appendCoLawyer({ name: '', phone: '', licenseNumber: '', licenseExpiry: '', licenseIssuePlace: '' })}
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
                      {...register(`coLawyers.${index}.licenseExpiry` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="1405/12/29"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">حوزه وکالت</label>
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
              onClick={() => appendOpposingLawyer({ name: '', phone: '', licenseNumber: '', licenseExpiry: '', licenseIssuePlace: '' })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> افزودن وکیل طرف مقابل
            </button>
          </div>

          {opposingLawyerFields.length === 0 && (
            <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-6 text-center">
              <p className="text-sm text-blue-600">هیچ وکیل طرف مقابلی اضافه نشده</p>
            </div>
          )}

          <div className="grid gap-4">
            {opposingLawyerFields.map((field, index) => (
              <div key={field.id} className="bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
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
                    <label className="text-xs text-blue-700 font-medium block mb-1">نام و نام خانوادگی</label>
                    <input
                      {...register(`opposingLawyers.${index}.name` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="نام وکیل"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 font-medium block mb-1">شماره موبایل</label>
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
                      {...register(`opposingLawyers.${index}.licenseExpiry` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="1405/12/29"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1"> حوزه وکالت</label>
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
      <p className="text-sm text-green-600">هیچ فرد دیگری اضافه نشده</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
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
              سمت
            </label>
            <input
              {...register(`otherPersons.${index}.role` as const)}
              type="text"
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="مثلا شاهد، کارشناس، نماینده"
            />
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
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="font-medium text-green-800 text-lg">پرداخت‌های نقدی</h3>

        <button
          type="button"
          onClick={() =>
            appendCashPayment({
              amount: undefined,
              isPaid: false,
              paymentDate: '',
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-green-700 font-medium block mb-1">
                  مبلغ (ریال)
                </label>
                <input
                  {...register(`cashPayments.${index}.amount` as const, {
                    setValueAs: setOptionalNumberValue,
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
                  تاریخ پرداخت (شمسی)
                </label>
                <input
                  type="text"
                  {...register(`cashPayments.${index}.paymentDate` as const)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="1403/12/15"
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-amber-700 block mb-1">عنوان هزینه</label>
                    <input
                      {...register(`expenses.${index}.title` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="مثال: هزینه ارسال مدارک"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-amber-700 block mb-1">موضوع/توضیح هزینه</label>
                    <input
                      {...register(`expenses.${index}.description` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="مثال: پست پیشتاز"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-amber-700 block mb-1">مبلغ (ریال)</label>
                    <input
                      {...register(`expenses.${index}.amount` as const, {
                        setValueAs: setOptionalNumberValue,
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
                      {...register(`expenses.${index}.date` as const)}
                      type="text"
                      dir="ltr"
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="1403/11/01"
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

        {/* توضیحات */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-gray-100 pb-3">توضیحات</h2>
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
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 font-medium text-lg shadow-lg"
          >
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره پرونده'}
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
