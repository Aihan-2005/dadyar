'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCasesStore, CaseStatus } from '@/store/cases.store'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const caseSchema = z.object({
  title: z.string().min(1, 'عنوان پرونده الزامی است'),
  clientName: z.string().min(1, 'نام موکل الزامی است'),
  caseNumber: z.string().min(1, 'شماره پرونده الزامی است'),
  status: z.enum(['pending', 'in-progress', 'completed', 'archived']),
  description: z.string().optional(),
})

type CaseFormData = z.infer<typeof caseSchema>

export default function NewCasePage() {
  const router = useRouter()
  const addCase = useCasesStore((s) => s.addCase)
  const user = useAuthStore((s) => s.user)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      status: 'pending',
    },
  })

  const onSubmit = async (data: CaseFormData) => {
    if (!user?.id) return

    addCase({
      ...data,
      lawyerId: user.id,
    })

    router.push('/dashboard/cases')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/cases"
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">پرونده جدید</h1>
          <p className="text-zinc-600 mt-1">اطلاعات پرونده را وارد کنید</p>
        </div>
      </div>

    
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border text-zinc-900 border-zinc-200 p-6 space-y-6">
        {/* عنوان */}
        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-2">
            عنوان پرونده *
          </label>
          <input
            {...register('title')}
            type="text"
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="مثال: پرونده طلاق"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* نام موکل */}
        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-2">
            نام موکل *
          </label>
          <input
            {...register('clientName')}
            type="text"
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="نام و نام خانوادگی موکل"
          />
          {errors.clientName && (
            <p className="mt-1 text-sm text-red-600">{errors.clientName.message}</p>
          )}
        </div>

        {/* شماره پرونده */}
        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-2">
            شماره پرونده *
          </label>
          <input
            {...register('caseNumber')}
            type="text"
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="مثال: 1234567890"
          />
          {errors.caseNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.caseNumber.message}</p>
          )}
        </div>

        {/* وضعیت */}
        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-2">
            وضعیت *
          </label>
          <select
            {...register('status')}
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="pending">در انتظار</option>
            <option value="in-progress">در حال انجام</option>
            <option value="completed">تکمیل شده</option>
            <option value="archived">بایگانی شده</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* توضیحات */}
        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-2">
            توضیحات
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
            placeholder="جزئیات و توضیحات پرونده..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* دکمه‌ها */}
        <div className="flex gap-3 pt-4 border-t border-zinc-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره پرونده'}
          </button>
          <Link
            href="/dashboard/cases"
            className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            انصراف
          </Link>
        </div>
      </form>
    </div>
  )
}
