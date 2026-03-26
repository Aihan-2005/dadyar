'use client'

import { useCasesStore } from '@/store/cases.store'
import { Clock, FileText, User } from 'lucide-react'
import Link from 'next/link'
import { formatJalaliDate } from '@/utils/date-helpers'

export default function PendingCasesPage() {
  const cases = useCasesStore((s) => s.cases)
  const pendingCases = cases.filter((c) => c.status === 'pending')

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Clock className="text-amber-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            پرونده‌های در انتظار بررسی
          </h1>
        </div>
        <p className="text-sm text-zinc-500">
          پرونده‌هایی که قرارداد بسته شده ولی هنوز شروع نشده‌اند
        </p>
      </div>

      {pendingCases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
          <Clock size={48} className="mx-auto mb-4 text-zinc-300" />
          <p className="text-zinc-400">پرونده‌ای در انتظار بررسی نیست</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingCases.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/cases/${c.id}`}
              className="bg-white rounded-2xl border border-amber-100 p-5 hover:shadow-lg hover:border-amber-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={18} className="text-amber-600" />
                    <h3 className="font-bold text-zinc-900">{c.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {c.clientName}
                    </span>
                    <span>شماره پرونده: {c.caseNumber}</span>
                    <span>تاریخ ثبت: {formatJalaliDate(c.createdAt)}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                  در انتظار
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
