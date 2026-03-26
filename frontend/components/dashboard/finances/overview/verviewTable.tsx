'use client'

import type { ClientFinanceSummary } from '@/types/finance'
import { AlertCircle, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  clients: ClientFinanceSummary[]
}

export function OverviewTable({ clients }: Props) {
  if (clients.length === 0) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <p>هیچ اطلاعات مالی یافت نشد</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <Th align="right">نام موکل</Th>
            <Th>مبلغ قرارداد</Th>
            <Th>پرداختی‌ها</Th>
            <Th>مانده</Th>
            <Th>معوق</Th>
            <Th>عملیات</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {clients.map((client) => {
            const pct =
              client.totalFee > 0
                ? (client.totalPaid / client.totalFee) * 100
                : 0

            return (
              <tr
                key={client.clientName}
                className="hover:bg-zinc-50 transition-colors"
              >
                {/* نام موکل */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                      {client.clientName[0]}
                    </div>
                    <span className="font-medium text-zinc-900">
                      {client.clientName}
                    </span>
                  </div>
                </td>

                {/* مبلغ قرارداد */}
                <td className="px-6 py-4 text-center font-medium text-zinc-900">
                  {client.totalFee.toLocaleString('fa-IR')} ت
                </td>

                {/* پرداختی‌ها */}
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-medium text-emerald-600">
                      {client.totalPaid.toLocaleString('fa-IR')} ت
                    </span>
                    <div className="w-24 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </td>

                {/* مانده */}
                <td className="px-6 py-4 text-center font-medium text-amber-600">
                  {client.totalRemaining > 0
                    ? `${client.totalRemaining.toLocaleString('fa-IR')} ت`
                    : <span className="text-zinc-400">-</span>}
                </td>

                {/* معوق */}
                <td className="px-6 py-4 text-center">
                  {client.totalOverdue > 0 ? (
                    <div className="inline-flex items-center gap-1 text-red-600">
                      <AlertCircle size={14} />
                      <span className="font-medium">
                        {client.totalOverdue.toLocaleString('fa-IR')} ت
                      </span>
                    </div>
                  ) : (
                    <span className="text-zinc-400">-</span>
                  )}
                </td>

                {/* عملیات */}
                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/dashboard/finances/clients?client=${encodeURIComponent(client.clientName)}`}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    جزئیات
                    <ChevronLeft size={15} />
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
