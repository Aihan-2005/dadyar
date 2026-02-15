'use client'

import { useCasesStore } from '@/store/cases.store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { use, useState, useEffect } from 'react'
type CaseStatus = 'pending' | 'in-progress' | 'completed' | 'archived'

type EditCasePageProps = {
  params: Promise<{
    id: string
  }>
}

export default function EditCasePage({ params }: EditCasePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const getCaseById = useCasesStore((s) => s.getCaseById)
  const updateCase = useCasesStore((s) => s.updateCase)
  
  const caseItem = getCaseById(id)
  
  const [formData, setFormData] = useState({
    title: '',
    caseNumber: '',
    clientName: '',
    status: 'pending'as CaseStatus,
    description: '',
  })

  useEffect(() => {
    if (caseItem) {
      setFormData({
        title: caseItem.title,
        caseNumber: caseItem.caseNumber,
        clientName: caseItem.clientName,
        status: caseItem.status as CaseStatus,
        description: caseItem.description || '',
      })
    }
  }, [caseItem])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCase(id, formData)
    router.push(`/dashboard/cases/${id}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-zinc-200 text-zinc-700  p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              عنوان پرونده
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              شماره پرونده
            </label>
            <input
              type="text"
              name="caseNumber"
              value={formData.caseNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              نام موکل
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              وضعیت
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">در انتظار</option>
              <option value="in-progress">در حال انجام</option>
              <option value="completed">تکمیل شده</option>
              <option value="archived">بایگانی شده</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              توضیحات
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ذخیره تغییرات
          </button>
          <Link
            href={`/dashboard/cases/${id}`}
            className="px-6 py-2 border border-zinc-300  text-black rounded-lg hover:bg-zinc-50 transition-colors"
          >
            انصراف
          </Link>
        </div>
      </form>
    </div>
  )
}