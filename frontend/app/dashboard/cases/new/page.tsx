'use client'
import { useEffect } from "react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCasesStore } from '@/store/cases.store'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'
import { ArrowRight, Plus, X, ChevronDown, Users, UserX } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useFieldArray } from 'react-hook-form'

const PROVINCES = [
  'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'خوزستان', 'آذربایجان شرقی',
  'مازندران', 'کرمان', 'گیلان', 'آذربایجان غربی', 'همدان', 'کرمانشاه',
  'مرکزی', 'لرستان', 'قزوین', 'سمنان', 'یزد', 'اردبیل', 'زنجان',
  'کردستان', 'بوشهر', 'قم', 'هرمزگان', 'چهارمحال و بختیاری', 'ایلام',
  'کهگیلویه و بویراحمد', 'گلستان', 'خراسان شمالی', 'خراسان جنوبی',
  'البرز', 'سیستان و بلوچستان'
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
  'دادگاه تجدیدنظر'
]

const lawyerSchema = z.object({
  name: z.string().min(1, 'نام الزامی است'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود'),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  licenseIssuePlace: z.string().optional(),
})

const clientSchema = z.object({
  name: z.string().min(1, 'نام موکل الزامی است'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود'),
  nationalId: z.string().optional(),
  role: z.string().optional(),
})

const opposingPartySchema = z.object({
  name: z.string().min(1, 'نام طرف مقابل الزامی است'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود').optional().or(z.literal('')),
  nationalId: z.string().optional(),
  description: z.string().optional(),
})

const paymentSchema = z.object({
  amount: z.number().min(0, 'مبلغ باید بیشتر از ۰ باشد'),
  isPaid: z.boolean(),
  paymentDate: z.string().optional(),
})

const branchHistorySchema = z.object({
  branchNumber: z.string().min(1, ' شعبه الزامی است'),
  date: z.string().optional(),
  isActive: z.boolean(),
})

const caseSchema = z.object({
  title: z.string().min(1, 'عنوان پرونده الزامی است'),
  clients: z.array(clientSchema).min(1, 'حداقل یک موکل الزامی است'),
  opposingParties: z.array(opposingPartySchema).optional(),
  caseNumber: z.string().regex(/^\d{18}$/, 'شماره پرونده باید دقیقاً ۱۸ رقم باشد'),
  archiveNumberBranch: z.string().regex(/^\d{7}$/, 'شماره بایگانی شعبه باید دقیقاً 7 رقم باشد').optional().or(z.literal('')),
  province: z.string().optional(),
  city: z.string().optional(),
  courtType: z.string().optional(),
  courtBranch: z.string().optional(),
  branchHistory: z.array(branchHistorySchema).min(1, 'حداقل یک شعبه الزامی است'),
  coLawyers: z.array(lawyerSchema).optional(),
  opposingLawyers: z.array(lawyerSchema).optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'archived']),
  description: z.string().optional(),
  paymentType: z.enum(['cash', 'non-cash']),
  cashPayments: z.array(paymentSchema).optional(),
  nonCashDescription: z.string().optional(),
  contractAmount: z.string().optional(),
  remainingAmount: z.string().optional(),
  overdueAmount: z.string().optional(),
})

type CaseFormData = z.infer<typeof caseSchema>

export default function NewCasePage() {
  const router = useRouter()
  const addCase = useCasesStore((s) => s.addCase)
  const user = useAuthStore((s) => s.user)

  const [paymentType, setPaymentType] = useState<'cash' | 'non-cash'>('cash')
  const [isCourtTypeDropdownOpen, setIsCourtTypeDropdownOpen] = useState(false)
  const [courtTypeInput, setCourtTypeInput] = useState('')
  const [filteredCourtTypes, setFilteredCourtTypes] = useState(COURT_TYPES)
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      status: 'pending',
      paymentType: 'cash',
      cashPayments: [],
      clients: [{ name: '', phone: '', nationalId: '', role: '' }],
      opposingParties: [],
      coLawyers: [],
      opposingLawyers: [],
      branchHistory: [{ branchNumber: '', date: '', isActive: true }],
      nonCashDescription: '',
      contractAmount: '',
      remainingAmount: '',
      overdueAmount: '',
    },
  })

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

  const { fields: branchHistoryFields, append: appendBranchHistory, remove: removeBranchHistory } = useFieldArray({
    control,
    name: 'branchHistory',
  })

  const watchCashPayments = watch('cashPayments') || []
  const watchBranchHistory = watch('branchHistory') || []
  

  const handleCourtTypeInputChange = (value: string) => {
    setCourtTypeInput(value)
    setValue('courtType', value)
    const filtered = COURT_TYPES.filter(type =>
      type.includes(value)
    )
    setFilteredCourtTypes(filtered)
    setIsCourtTypeDropdownOpen(true)
  }

  const selectCourtType = (courtType: string) => {
    setCourtTypeInput(courtType)
    setValue('courtType', courtType)
    setIsCourtTypeDropdownOpen(false)
  }

  const onSubmit = async (data: CaseFormData) => {
    if (!user?.id) return
    
    const formattedCashPayments = data.cashPayments?.map((p) => ({
      ...p,
      paymentDate: p.paymentDate || undefined,
    }))
    
    addCase({
      ...data,
      lawyerId: user.id,
      archiveNumberOffice: (user as any).archiveNumberOffice,
      archiveNumberLawyer: (user as any).archiveNumberLawyer,
      courtBranch: data.courtBranch
        ? {
            province: data.province || '',
            city: data.city || '',
            courtType: data.courtType || '',
            branch: data.courtBranch,
            currentBranchNumber: activeBranch,
            branchHistory: data.branchHistory,
          }
        : undefined,
      cashPayments: data.paymentType === 'cash' ? formattedCashPayments : [],
      totalAmount: data.paymentType === 'cash' ? totalCash : 0,
    } as any)
    router.push('/dashboard/cases')
  }
  const {
  fields: expenseFields,
  append: appendExpense,
  remove: removeExpense,
} = useFieldArray({
  name: 'expenses',
  control,
})
const {
  fields: otherPersonFields,
  append: appendOtherPerson,
  remove: removeOtherPerson,
} = useFieldArray({
  control,
  name: 'otherPersons',
})
const watchExpenses = watch('expenses') || [];
const expensesTotal = watchExpenses.reduce((sum, item) => {
  return sum + (Number(item.amount) || 0);
}, 0);

// مبالغ قرارداد و پرداخت‌ها
const contractAmount = Number(watch('contractAmount')) || 0

const cashPayments = watch('cashPayments') || []
 const activeBranch =
  watchBranchHistory.find((b) => b.isActive)?.branchNumber || ''

// تبدیل تاریخ شمسی به میلادی ساده
const jalaliToDate = (jalali: string) => {
  if (!jalali) return null
  const parts = jalali.split('/')
  if (parts.length !== 3) return null

  const jy = Number(parts[0])
  const jm = Number(parts[1])
  const jd = Number(parts[2])

  if (!jy || !jm || !jd) return null

  // تبدیل تقریبی برای مقایسه
  const gy = jy - 621
  return new Date(gy, jm - 1, jd)
}

const today = new Date()


// مجموع پرداخت‌های انجام شده
const totalPaid = watchCashPayments.reduce((sum, p) => {
  if (p.isPaid) {
    return sum + (Number(p.amount) || 0)
  }
  return sum
}, 0)

// مجموع معوق‌ها
const overdueTotal = watchCashPayments.reduce((sum, p) => {
  if (!p.isPaid && p.paymentDate) {
    const payDate = jalaliToDate(p.paymentDate)

    if (payDate && payDate < today) {
      return sum + (Number(p.amount) || 0)
    }
  }

  return sum
}, 0)

// مجموع کل پرداخت‌ها برای نمایش
const totalCash = watchCashPayments.reduce((sum, p) => {
  return sum + (Number(p.amount) || 0)
}, 0)

useEffect(() => {
  const remaining = Math.max(contractAmount - totalPaid, 0)

  setValue('remainingAmount', remaining.toString())
  setValue('overdueAmount', overdueTotal.toString())

}, [contractAmount, totalPaid, overdueTotal, setValue])



  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/cases"
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
        >
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
              شماره پرونده * <span className="text-xs text-zinc-500">(۱۸ رقم)</span>
            </label>
            <input
              {...register('caseNumber')}
              type="text"
              maxLength={18}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="مثال: 140312345678901234"
              dir="ltr"
            />
            {errors.caseNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.caseNumber.message}</p>
            )}
          </div>
        </div>

        {/* شعبه دادگاه - منتقل شده به بالا */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-green-100 pb-3 mb-4">شعبه دادگاه</h2>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-green-800 mb-2">نوع دادگاه *</label>
              <div className="relative">
                <input
                  type="text"
                  value={courtTypeInput}
                  onChange={(e) => handleCourtTypeInputChange(e.target.value)}
                  onFocus={() => setIsCourtTypeDropdownOpen(true)}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="انتخاب کنید..."
                />
                <button
                  type="button"
                  onClick={() => setIsCourtTypeDropdownOpen(!isCourtTypeDropdownOpen)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                >
                  <ChevronDown size={20} className="text-green-400" />
                </button>
                
                {isCourtTypeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-green-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
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
                      <div className="px-4 py-3 text-green-500">نتیجه‌ای یافت نشد</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">استان *</label>
                <select
                  {...register('province')}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">انتخاب استان</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">شهر</label>
                <input
                  {...register('city')}
                  type="text"
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="نام شهر"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-green-800 mb-2"> شعبه *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={activeBranch}
                    onFocus={() => {
                      if (watchBranchHistory.filter(b => b.branchNumber && !b.isActive).length > 0) {
                        setIsBranchDropdownOpen(true)
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setIsBranchDropdownOpen(false), 200)
                    }}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const activeIndex = watchBranchHistory.findIndex(b => b.isActive);
                      
                      if (activeIndex !== -1) {
                        setValue(`branchHistory.${activeIndex}.branchNumber`, newValue);
                      }
                    }}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder=" شعبه"
                  />
                  {watchBranchHistory.filter(b => b.branchNumber && !b.isActive).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    >
                      <ChevronDown size={20} className="text-green-400" />
                    </button>
                  )}

                  {isBranchDropdownOpen && watchBranchHistory.filter(b => b.branchNumber && !b.isActive).length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-green-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      <div className="p-2 border-b border-green-200 bg-green-50">
                        <p className="text-xs text-green-700 font-medium">تاریخچه شعبه‌ها</p>
                      </div>
                      {watchBranchHistory
                        .map((branch, index) => ({ branch, index }))
                        .filter(({ branch }) => branch.branchNumber && !branch.isActive)
                        .reverse()
                        .map(({ branch, index }) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              const currentActiveIndex = watchBranchHistory.findIndex(b => b.isActive);
                              if (currentActiveIndex !== -1) {
                                setValue(`branchHistory.${currentActiveIndex}.isActive`, false);
                                if (!watchBranchHistory[currentActiveIndex].date) {
                                  setValue(`branchHistory.${currentActiveIndex}.date`, new Date().toLocaleDateString('fa-IR'));
                                }
                              }
                              
                              setValue(`branchHistory.${index}.isActive`, true);
                              setIsBranchDropdownOpen(false);
                            }}
                            className="w-full text-right px-4 py-3 hover:bg-green-50 border-b border-green-100 last:border-b-0 flex justify-between items-center"
                          >
                            <span>شعبه {branch.branchNumber}</span>
                            <span className="text-xs text-green-600">{branch.date || 'تاریخ ثبت نشده'}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                
                {activeBranch && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentActiveIndex = watchBranchHistory.findIndex(b => b.isActive);
                      if (currentActiveIndex !== -1) {
                        setValue(`branchHistory.${currentActiveIndex}.isActive`, false);
                        setValue(`branchHistory.${currentActiveIndex}.date`, new Date().toLocaleDateString('fa-IR'));
                      }
                      
                      appendBranchHistory({
                        branchNumber: '',
                        date: '',
                        isActive: true
                      });
                    }}
                    className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    تغییر شعبه
                  </button>
                )}
                
                {watchBranchHistory.filter(b => b.branchNumber && !b.isActive).length > 0 && (
                  <div className="mt-2 p-3 bg-green-100 rounded-lg">
                    <p className="text-green-700 font-medium text-xs">
                      تعداد تغییرات شعبه: {watchBranchHistory.filter(b => b.branchNumber).length - 1}
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                      شعبه فعلی: {activeBranch}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-800 mb-2">
                شماره بایگانی در شعبه دادگاه <span className="text-xs text-green-600">(7 رقم)</span>
              </label>
              <input
                {...register('archiveNumberBranch')}
                type="text"
                maxLength={7}
                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="شماره بایگانی در شعبه دادگاه"
                dir="ltr"
              />
              {errors.archiveNumberBranch && (
                <p className="mt-1 text-sm text-red-600">{errors.archiveNumberBranch.message}</p>
              )}
            </div>
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
              onClick={() => appendClient({ name: '', phone: '', nationalId: '', role: '' })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> افزودن موکل
            </button>
          </div>

          <div className="grid gap-4">
            {clientFields.map((field, index) => (
              <div
                key={field.id}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-blue-800">موکل {index + 1}</h3>
                  {clientFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeClient(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-blue-700 font-medium block mb-1">نام و نام خانوادگی *</label>
                    <input
                      {...register(`clients.${index}.name` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="نام کامل موکل"
                    />
                    {errors.clients?.[index]?.name && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.clients[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 font-medium block mb-1">شماره موبایل *</label>
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
                    <label className="text-xs text-blue-700 font-medium block mb-1">کد ملی</label>
                    <input
                      {...register(`clients.${index}.nationalId` as const)}
                      type="text"
                      maxLength={10}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="1234567890"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 font-medium block mb-1">سمت</label>
                    <input
                      {...register(`clients.${index}.role` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="مثلا خواهان"
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
              <UserX className="text-red-600" size={20} />
              <h2 className="text-lg font-semibold text-zinc-800">طرف مقابل</h2>
            </div>
            <button
              type="button"
              onClick={() => appendOpposingParty({ name: '', phone: '', nationalId: '', description: '' })}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> افزودن طرف مقابل
            </button>
          </div>

          {opposingPartyFields.length === 0 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <UserX className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-500">هیچ طرف مقابلی اضافه نشده است</p>
            </div>
          )}

          <div className="grid gap-4">
            {opposingPartyFields.map((field, index) => (
              <div
                key={field.id}
                className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-red-800">طرف مقابل {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeOpposingParty(index)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-red-700 font-medium block mb-1">نام و نام خانوادگی *</label>
                    <input
                      {...register(`opposingParties.${index}.name` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                      placeholder="نام طرف مقابل"
                    />
                    {errors.opposingParties?.[index]?.name && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.opposingParties[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-red-700 font-medium block mb-1">شماره موبایل</label>
                    <input
                      {...register(`opposingParties.${index}.phone` as const)}
                      type="text"
                      maxLength={11}
                      className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
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
                    <label className="text-xs text-red-700 font-medium block mb-1">کد ملی</label>
                    <input
                      {...register(`opposingParties.${index}.nationalId` as const)}
                      type="text"
                      maxLength={10}
                      className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                      placeholder="1234567890"
                      dir="ltr"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-red-700 font-medium block mb-1">توضیحات</label>
                  <textarea
                    {...register(`opposingParties.${index}.description` as const)}
                    rows={2}
                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white resize-none"
                    placeholder="توضیحات مربوط به طرف مقابل..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* وکلای همکار */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-purple-100 pb-3">
            <h2 className="text-lg font-semibold text-zinc-800">وکلای همکار</h2>
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
              <div
                key={field.id}
                className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-purple-800">وکیل همکار {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeCoLawyer(index)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">نام و نام خانوادگی *</label>
                    <input
                      {...register(`coLawyers.${index}.name` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="نام وکیل"
                    />
                    {errors.coLawyers?.[index]?.name && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.coLawyers[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">شماره موبایل *</label>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">شماره پروانه (اختیاری)</label>
                    <input
                      {...register(`coLawyers.${index}.licenseNumber` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="شماره پروانه"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">تاریخ اعتبار پروانه (اختیاری)</label>
                    <input
                      {...register(`coLawyers.${index}.licenseExpiry` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="1405/12/29"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-700 font-medium block mb-1">محل صدور پروانه (اختیاری)</label>
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
              <div
                key={field.id}
                className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-orange-800">وکیل طرف مقابل {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeOpposingLawyer(index)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">نام و نام خانوادگی *</label>
                    <input
                      {...register(`opposingLawyers.${index}.name` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="نام وکیل"
                    />
                    {errors.opposingLawyers?.[index]?.name && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.opposingLawyers[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">شماره موبایل *</label>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">شماره پروانه (اختیاری)</label>
                    <input
                      {...register(`opposingLawyers.${index}.licenseNumber` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="شماره پروانه"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">تاریخ اعتبار پروانه (اختیاری)</label>
                    <input
                      {...register(`opposingLawyers.${index}.licenseExpiry` as const)}
                      type="text"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="1405/12/29"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-orange-700 font-medium block mb-1">محل صدور پروانه (اختیاری)</label>
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
      onClick={() => appendOtherPerson({ name: '', phone: '', description: '' })}
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
      <div
        key={field.id}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-green-800">سایر اشخاص {index + 1}</h3>
          <button
            type="button"
            onClick={() => removeOtherPerson(index)}
            className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-green-700 font-medium block mb-1">نام و نام خانوادگی *</label>
            <input
              {...register(`otherPersons.${index}.name` as const)}
              type="text"
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="نام فرد"
            />
            {errors.otherPersons?.[index]?.name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.otherPersons[index]?.name?.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-green-700 font-medium block mb-1">شماره موبایل *</label>
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
        </div>

        <div>
          <label className="text-xs text-green-700 font-medium block mb-1">توضیحات (اختیاری)</label>
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

{/* توضیحات کلی پرونده */}
<div className="space-y-4">
  <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-gray-100 pb-3">توضیحات کلی پرونده</h2>
  <textarea
    {...register('description')}
    rows={4}
    className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
    placeholder="جزئیات و توضیحات کلی پرونده..."
  />
</div>


        {/* اطلاعات مالی */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 border-b-2 border-green-100 pb-3 mb-4">اطلاعات مالی</h2>

          {/* باکس‌های مبالغ */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-2">مبلغ نقدی قرارداد (ریال)</label>
                <input
                  {...register('contractAmount')}
                  type="text"
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="مثال: 50000000"
                  dir="ltr"
                />
              </div>
             <div>
  <label className="block text-sm font-medium text-emerald-800 mb-2">
    مبلغ مانده قرارداد (ریال)
  </label>
 <input
  value={Number(watch("remainingAmount") || 0).toLocaleString()}
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
  value={Number(watch("overdueAmount") || 0).toLocaleString()}
  readOnly
  className="w-full px-4 py-3 border border-emerald-300 rounded-lg bg-emerald-50"
  dir="ltr"
/>
</div>

            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">نوع قرارداد *</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <input
                  type="radio"
                  value="cash"
                  {...register('paymentType')}
                  onChange={() => {
                    setPaymentType('cash')
                    setValue('paymentType', 'cash')
                  }}
                  className="text-green-600"
                />
                <span className="text-green-800 font-medium">نقدی</span>
              </label>
              <label className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <input
                  type="radio"
                  value="non-cash"
                  {...register('paymentType')}
                  onChange={() => {
                    setPaymentType('non-cash')
                    setValue('paymentType', 'non-cash')
                  }}
                  className="text-blue-600"
                />
                <span className="text-blue-800 font-medium">غیر نقدی</span>
              </label>
            </div>
          </div>

          {/* پرداخت نقدی */}
          {paymentType === 'cash' && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="font-medium text-green-800 text-lg">پرداخت‌های نقدی</h3>
                <button
                  type="button"
                  onClick={() => appendCashPayment({ amount: 0, isPaid: false })}
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
                  <div
                    key={field.id}
                    className="bg-white border border-green-300 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-green-800">پرداخت {index + 1}</h4>
                      {cashPaymentFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCashPayment(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-green-700 font-medium block mb-1">مبلغ (ریال) *</label>
                        <input
                          {...register(`cashPayments.${index}.amount` as const, {
                            valueAsNumber: true,
                          })}
                          type="text"
                          className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-medium block mb-1">تاریخ پرداخت (شمسی)</label>
                        <input
                          type="text"
                          {...register(`cashPayments.${index}.paymentDate` as const)}
                          className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="1403/12/15"
                          dir="ltr"
                        />
                      </div>
                      <div className="flex items-center justify-center">
                        <label className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                          <input
                            type="checkbox"
                            {...register(`cashPayments.${index}.isPaid` as const)}
                            className="text-green-600"
                          />
                          <span className="text-sm text-green-800 font-medium">پرداخت شده</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* پرداخت غیر نقدی */}
          {paymentType === 'non-cash' && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 space-y-4">
              <h3 className="font-medium text-blue-800 text-lg">توضیحات پرداخت غیر نقدی</h3>
              <p className="text-sm text-blue-600">
                در صورتی که پرداخت به صورت غیر نقدی (مثل زمین، ملک، خودرو و ...) انجام می‌شود، جزئیات را وارد کنید.
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
        {/* بخش هزینه ها */}
<div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 space-y-4 mt-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
    <h3 className="font-medium text-amber-800 text-lg">هزینه‌ها</h3>

    <button
      type="button"
      onClick={() =>
        appendExpense({
          title: '',
          description: '',
          amount: 0,
          date: '',
          isPaid: false,
        })
      }
      className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
    >
      <Plus size={16} /> افزودن هزینه
    </button>
  </div>

  <p className="text-sm text-amber-700">
    این بخش برای ثبت هزینه‌های جانبی وکیل است و ارتباطی با حق‌الوکاله ندارد.
  </p>

  <div className="bg-amber-100 p-4 rounded-lg">
    <p className="text-amber-800 font-bold text-lg">
      مجموع هزینه‌ها: {expensesTotal?.toLocaleString() || 0} ریال
    </p>
  </div>

  <div className="space-y-4">
    {expenseFields.map((field, index) => (
      <div
        key={field.id}
        className="bg-white border border-amber-300 rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-amber-800">
            هزینه {index + 1}
          </h4>

          {expenseFields.length > 1 && (
            <button
              type="button"
              onClick={() => removeExpense(index)}
              className="p-1 text-red-600 hover:bg-red-100 rounded-lg"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* عنوان هزینه */}
          <div>
            <label className="text-xs font-medium text-amber-700 block mb-1">
              عنوان هزینه *
            </label>
            <input
              {...register(`expenses.${index}.title` as const)}
              type="text"
              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="مثال: هزینه ارسال مدارک"
            />
          </div>

          {/* موضوع هزینه */}
          <div>
            <label className="text-xs font-medium text-amber-700 block mb-1">
              موضوع/توضیح هزینه
            </label>
            <input
              {...register(`expenses.${index}.description` as const)}
              type="text"
              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="مثال: پست پیشتاز"
            />
          </div>

          {/* مبلغ */}
          <div>
            <label className="text-xs font-medium text-amber-700 block mb-1">
              مبلغ (ریال) *
            </label>
            <input
              {...register(`expenses.${index}.amount` as const, {
                valueAsNumber: true,
              })}
              type="text"
              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="0"
            />
          </div>

          {/* تاریخ */}
          <div>
            <label className="text-xs font-medium text-amber-700 block mb-1">
              تاریخ هزینه (شمسی)
            </label>
            <input
              {...register(`expenses.${index}.date` as const)}
              type="text"
              dir="ltr"
              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="1403/11/01"
            />
          </div>
        </div>

        {/* وضعیت پرداخت */}
        <div className="mt-3 flex justify-end">
          <label className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            <input
              type="checkbox"
              {...register(`expenses.${index}.isPaid` as const)}
              className="text-amber-600"
            />
            <span className="text-sm font-medium text-amber-800">
              پرداخت شده
            </span>
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
