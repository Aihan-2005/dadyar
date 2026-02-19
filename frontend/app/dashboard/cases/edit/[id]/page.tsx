'use client'

import { useCasesStore } from '@/store/cases.store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Minus } from 'lucide-react'
import { use, useState, useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

type CaseStatus = 'pending' | 'in-progress' | 'completed' | 'archived'

type EditCasePageProps = {
  params: Promise<{
    id: string
  }>
}


const installmentSchema = z.object({
  amount: z.number().min(0, 'مبلغ قسط باید بیشتر از ۰ باشد'),
  isPaid: z.boolean(),
  dueDate: z.string().optional(),
})

const caseSchema = z.object({
  title: z.string().min(1, 'عنوان پرونده الزامی است'),
  caseNumber: z.string().min(1, 'شماره پرونده الزامی است'),
  clientName: z.string().min(1, 'نام موکل الزامی است'),
  status: z.enum(['pending', 'in-progress', 'completed', 'archived']),
  description: z.string().optional(),
  totalAmount: z.number().min(0, 'مبلغ کل پرونده الزامی است'),
  paymentType: z.enum(['cash', 'installment']),
  installments: z.array(installmentSchema).optional(),
})

type CaseFormData = z.infer<typeof caseSchema>

export default function EditCasePage({ params }: EditCasePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const getCaseById = useCasesStore((s) => s.getCaseById)
  const updateCase = useCasesStore((s) => s.updateCase)
  
  const caseItem = getCaseById(id)
  const [paymentType, setPaymentType] = useState<'cash' | 'installment'>('cash')
  
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
      title: caseItem?.title || '',
      caseNumber: caseItem?.caseNumber || '',
      clientName: caseItem?.clientName || '',
      status: caseItem?.status || 'pending',
      description: caseItem?.description || '',
      totalAmount: caseItem?.totalAmount || 0,
      paymentType: caseItem?.paymentType || 'cash',
      installments: caseItem?.installments?.map(inst => ({
        ...inst,
        dueDate: inst.dueDate ? new Date(inst.dueDate).toISOString().split('T')[0] : undefined
      })) || [{ amount: 0, isPaid: false }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'installments',
  })

  useEffect(() => {
    if (caseItem) {
      setPaymentType(caseItem.paymentType || 'cash')
    }
  }, [caseItem])

  const watchTotalAmount = watch('totalAmount')
  const watchInstallments = watch('installments') || []

  const totalInstallments = watchInstallments.reduce((sum, inst) => sum + (inst.amount || 0), 0)
  const remainingAmount = (watchTotalAmount || 0) - totalInstallments

  if (!caseItem) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-zinc-900">پرونده یافت نشد</h1>
        <Link
          href="/dashboard/cases"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          بازگشت به لیست
        </Link>
      </div>
    )
  }

  const onSubmit = async (data: CaseFormData) => {
    const formattedInstallments = data.installments?.map(inst => ({
      ...inst,
      dueDate: inst.dueDate ? new Date(inst.dueDate) : undefined
    }))

    const updatedData = {
      ...data,
      installments: data.paymentType === 'cash' ? [] : formattedInstallments,
    }

    updateCase(id, updatedData)
    router.push(`/dashboard/cases/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/dashboard/cases/${id}`}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">ویرایش پرونده</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border border-zinc-200 text-zinc-700 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              عنوان پرونده
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              شماره پرونده
            </label>
            <input
              type="text"
              {...register('caseNumber')}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.caseNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.caseNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              نام موکل
            </label>
            <input
              type="text"
              {...register('clientName')}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.clientName && (
              <p className="mt-1 text-sm text-red-600">{errors.clientName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              وضعیت
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">در انتظار</option>
              <option value="in-progress">در حال انجام</option>
              <option value="completed">تکمیل شده</option>
              <option value="archived">بایگانی شده</option>
            </select>
          </div>

          <div className="border-t border-zinc-200 pt-4">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4"> اطلاعات مالی</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                مبلغ کل پرونده (تومان) *
              </label>
              <input
                type="number"
                {...register('totalAmount', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: 100000000"
              />
              {errors.totalAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.totalAmount.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                نحوه دریافت *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="cash"
                    {...register('paymentType')}
                    onChange={(e) => {
                      setPaymentType('cash')
                      setValue('paymentType', 'cash')
                    }}
                  />
                  <span>یکجا (نقدی)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="installment"
                    {...register('paymentType')}
                    onChange={(e) => {
                      setPaymentType('installment')
                      setValue('paymentType', 'installment')
                    }}
                  />
                  <span>قسطی</span>
                </label>
              </div>
            </div>

            {paymentType === 'installment' && (
              <div className="border-t border-zinc-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-zinc-900">برنامه پرداخت اقساط</h4>
                  <button
                    type="button"
                    onClick={() => append({ amount: 0, isPaid: false })}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Plus size={16} />
                    افزودن قسط
                  </button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
                  <p>مبلغ کل: {watchTotalAmount?.toLocaleString() || 0} تومان</p>
                  <p>مجموع اقساط: {totalInstallments.toLocaleString()} تومان</p>
                  <p className={remainingAmount !== 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                    باقی‌مانده: {remainingAmount.toLocaleString()} تومان
                  </p>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 bg-zinc-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <label className="text-xs text-zinc-600 block mb-1">
                          قسط {index + 1}
                        </label>
                        <input
                          type="number"
                          {...register(`installments.${index}.amount` as const, { valueAsNumber: true })}
                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg"
                          placeholder="مبلغ قسط"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-zinc-600 block mb-1">
                          سررسید (اختیاری)
                        </label>
                        <input
                          type="date"
                          {...register(`installments.${index}.dueDate` as const)}
                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg"
                        />
                      </div>
                      <div className="flex items-center mt-6">
                        <input
                          type="checkbox"
                          {...register(`installments.${index}.isPaid` as const)}
                          className="ml-2"
                        />
                        <span className="text-sm">پرداخت شده</span>
                      </div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Minus size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {remainingAmount !== 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ مجموع اقساط ({totalInstallments.toLocaleString()}) 
                    باید برابر با مبلغ کل ({watchTotalAmount?.toLocaleString()}) باشد
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              توضیحات
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || (paymentType === 'installment' && remainingAmount !== 0)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
          <Link
            href={`/dashboard/cases/${id}`}
            className="px-6 py-2 border border-zinc-300 text-black rounded-lg hover:bg-zinc-50 transition-colors"
          >
            انصراف
          </Link>
        </div>
      </form>
    </div>
  )
}