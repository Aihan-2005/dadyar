'use client'

import type { CaseFinance } from '@/types/finance'
import {
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { formatJalaliDate } from '@/utils/date-helpers'

interface Props {
  cases: CaseFinance[]
}

export function ClientDetailTable({ cases }: Props) {
  if (cases.length === 0) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <FileText size={40} className="mx-auto mb-3 text-zinc-300" />
        <p>هیچ قراردادی یافت نشد</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <Th align="right">شماره قرارداد</Th>
            <Th align="right">موضوع قرارداد</Th>
            <Th>مبلغ قرارداد</Th>
            <Th>پرداختی‌ها</Th>
            <Th>مانده</Th>
            <Th>معوق</Th>
            <Th>وضعیت</Th>
            <Th>عملیات</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {cases.map((item) => {
            const pct =
              item.totalFee > 0
                ? (item.paidAmount / item.totalFee) * 100
                : 0

            return (
              <tr
                key={item.caseId}
                className="hover:bg-zinc-50 transition-colors"
              >
                {/* شماره قرارداد */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-indigo-600" />
                    </div>
                    <span className="font-medium text-zinc-900 font-mono">
                      {item.caseNumber}
                    </span>
                  </div>
                </td>

                {/* موضوع */}
                <td className="px-6 py-4 max-w-[200px]">
                  <p className="font-medium text-zinc-900 truncate">
                    {item.caseTitle}
                  </p>
                  {item.lastPaymentDate && (
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                      <Calendar size={11} />
                      آخرین پرداخت: {formatJalaliDate(item.lastPaymentDate)}
                    </p>
                  )}
                </td>

                {/* مبلغ */}
                <td className="px-6 py-4 text-center font-medium text-zinc-900">
                  {item.totalFee.toLocaleString('fa-IR')} ت
                </td>

                {/* پرداختی‌ها */}
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-medium text-emerald-600">
                      {item.paidAmount.toLocaleString('fa-IR')} ت
                    </span>
                    <div className="w-20 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400">{pct.toFixed(0)}%</span>
                  </div>
                </td>

                {/* مانده */}
                <td className="px-6 py-4 text-center font-medium text-amber-600">
                  {item.remainingDebt > 0
                    ? `${item.remainingDebt.toLocaleString('fa-IR')} ت`
                    : <span className="text-zinc-400">-</span>}
                </td>

                {/* معوق */}
                <td className="px-6 py-4 text-center">
                  {item.overdueAmount > 0 ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-medium text-red-600">
                        {item.overdueAmount.toLocaleString('fa-IR')} ت
                      </span>
                      {item.dueDate && (
                        <span className="text-xs text-zinc-400">
                          سررسید: {formatJalaliDate(item.dueDate)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-zinc-400">-</span>
                  )}
                </td>

                {/* وضعیت */}
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={item.status} />
                </td>

                {/* عملیات */}
                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/dashboard/cases/${item.caseId}`}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    مشاهده
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }: { status: CaseFinance['status'] }) {
  switch (status) {
    case 'paid':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          <CheckCircle size={11} />
          تسویه شده
        </span>
      )
    case 'partial':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <Clock size={11} />
          جزئی
        </span>
      )
    case 'overdue':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertCircle size={11} />
          معوق
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
          <Clock size={11} />
          پرداخت نشده
        </span>
      )
  }
}

function Th({
  children,
  align = 'center',
}: {
  children: React.ReactNode
  align?: 'right' | 'center'
}) {
  return (
    <th
      className={`px-6 py-3.5 text-${align} text-xs font-semibold text-zinc-500 uppercase tracking-wider`}
    >
      {children}
    </th>
  )
}
