'use client'

import { useCasesStore } from '@/store/cases.store'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'

export default function CasesListPage() {
  const cases = useCasesStore((s) => s.cases)

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      archived: 'bg-zinc-100 text-zinc-700',
    }
    const labels = {
      pending: 'در انتظار',
      'in-progress': 'در حال انجام',
      completed: 'تکمیل شده',
      archived: 'بایگانی شده',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">پرونده‌ها</h1>
          <p className="text-zinc-600 mt-1">{cases.length} پرونده یافت شد</p>
        </div>
        <Link
          href="/dashboard/cases/new"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Plus size={20} />
          <span>پرونده جدید</span>
        </Link>
      </div>

      {/* جستجو و فیلتر */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            placeholder="جستجوی پرونده..."
            className="w-full pr-10 pl-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
          <Filter size={20} />
          <span>فیلتر</span>
        </button>
      </div>

      {/* لیست پرونده‌ها */}
      {cases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
          <p className="text-zinc-600">هیچ پرونده‌ای یافت نشد</p>
          <Link
            href="/dashboard/cases/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Plus size={20} />
            <span>ایجاد اولین پرونده</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((caseItem) => (
            <Link
              key={caseItem.id}
              href={`/dashboard/cases/${caseItem.id}`}
              className="p-6 bg-white rounded-lg border border-zinc-200 hover:border-zinc-900 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {caseItem.title}
                    </h3>
                    {getStatusBadge(caseItem.status)}
                  </div>
                  <p className="text-zinc-600 mb-2">
                    موکل: {caseItem.clientName}
                  </p>
                  <p className="text-sm text-zinc-500">
                    شماره پرونده: {caseItem.caseNumber}
                  </p>
                  {caseItem.description && (
                    <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
                      {caseItem.description}
                    </p>
                  )}
                </div>
                <div className="text-left text-sm text-zinc-500">
                  <p>ایجاد: {new Date(caseItem.createdAt).toLocaleDateString('fa-IR')}</p>
                  <p className="mt-1">
                    آخرین بروزرسانی: {new Date(caseItem.updatedAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
