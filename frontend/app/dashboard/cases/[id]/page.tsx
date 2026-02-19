'use client'

import { useCasesStore } from '@/store/cases.store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Edit, Trash2 } from 'lucide-react'
import { use } from 'react'

type CaseDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const getCaseById = useCasesStore((s) => s.getCaseById)
  const deleteCase = useCasesStore((s) => s.deleteCase)

  const caseItem = getCaseById(id)

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

  const handleDelete = () => {
    if (confirm('آیا از حذف این پرونده اطمینان دارید؟')) {
      deleteCase(id)
      router.push('/dashboard/cases')
    }
  }

  const handleEdit = () => {
    router.push(`/dashboard/cases/edit/${id}`)
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'در انتظار',
      'in-progress': 'در حال انجام',
      completed: 'تکمیل شده',
      archived: 'بایگانی شده',
    }
    return labels[status as keyof typeof labels]
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      archived: 'bg-zinc-100 text-zinc-700',
    }
    return colors[status as keyof typeof colors]
  }


  const totalPaid = caseItem.installments?.filter(i => i.isPaid).reduce((sum, i) => sum + i.amount, 0) || 0
  const totalRemaining = caseItem.installments?.filter(i => !i.isPaid).reduce((sum, i) => sum + i.amount, 0) || 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/cases"
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{caseItem.title}</h1>
            <p className="text-zinc-600 mt-1">شماره پرونده: {caseItem.caseNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}  
            className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit size={18} />
            <span>ویرایش</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={18} />
            <span>حذف</span>
          </button>
        </div>
      </div>

 
      <div className="bg-white rounded-lg border border-zinc-200 divide-y divide-zinc-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">اطلاعات پرونده</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-zinc-600 mb-1">موکل</dt>
              <dd className="font-medium text-zinc-900">{caseItem.clientName}</dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-600 mb-1">وضعیت</dt>
              <dd>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseItem.status)}`}>
                  {getStatusLabel(caseItem.status)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-600 mb-1">تاریخ ایجاد</dt>
              <dd className="font-medium text-zinc-900">
                {new Date(caseItem.createdAt).toLocaleDateString('fa-IR')}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-600 mb-1">آخرین بروزرسانی</dt>
              <dd className="font-medium text-zinc-900">
                {new Date(caseItem.updatedAt).toLocaleDateString('fa-IR')}
              </dd>
            </div>
          </dl>
        </div>

        {caseItem.description && (
          <div className="p-6">
            <h3 className="text-sm font-medium text-zinc-600 mb-2">توضیحات</h3>
            <p className="text-zinc-900 whitespace-pre-wrap">{caseItem.description}</p>
          </div>
        )}
      </div>

      {caseItem.totalAmount > 0 && (
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4"> اطلاعات مالی</h2>
          
          <div className="mb-4">
            <p className="text-sm text-zinc-600">مبلغ کل پرونده</p>
            <p className="text-2xl font-bold text-zinc-900">
              {caseItem.totalAmount?.toLocaleString()} تومان
            </p>
          </div>

          <div className="mb-4 text-zinc-600">
            <p className="text-sm text-zinc-600">نحوه دریافت</p>
            <p className="font-medium">
              {caseItem.paymentType === 'cash' ? 'نقدی (یکجا)' : 'قسطی'}
            </p>
          </div>

       
          {caseItem.paymentType === 'installment' && caseItem.installments && caseItem.installments.length > 0 && (
            <div>
              <p className="text-sm text-zinc-600 mb-2">برنامه پرداخت</p>
              <div className="space-y-2">
                {caseItem.installments.map((inst, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
                    <div>
                      <span className="font-medium">قسط {index + 1}</span>
                      <span className="mr-4 text-zinc-600">{inst.amount.toLocaleString()} تومان</span>
                      {inst.dueDate && (
                        <span className="mr-4 text-sm text-zinc-500">
                          سررسید: {new Date(inst.dueDate).toLocaleDateString('fa-IR')}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      inst.isPaid 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inst.isPaid ? 'پرداخت شده' : 'پرداخت نشده'}
                    </span>
                  </div>
                ))}
                
              
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    پرداخت شده: {totalPaid.toLocaleString()} تومان
                  </p>
                  <p className="text-sm text-amber-700">
                    باقی‌مانده: {totalRemaining.toLocaleString()} تومان
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}