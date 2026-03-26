import type { FinancialStats } from '@/types/finance'
import { PieChart } from 'lucide-react'

interface Props {
  stats: FinancialStats
}

export function FinancialSummary({ stats }: Props) {
  const receivedPct =
    stats.totalRevenue > 0
      ? (stats.totalReceived / stats.totalRevenue) * 100
      : 0
  const remainingPct = 100 - receivedPct
  const overduePct =
    stats.totalRevenue > 0
      ? (stats.totalOverdue / stats.totalRevenue) * 100
      : 0

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="text-indigo-600" size={20} />
        <h2 className="text-lg font-bold text-zinc-900">وضعیت مالی کلی</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* Progress Bars */}
        <div className="space-y-5">
          <ProgressRow
            label="پرداختی‌ها"
            percentage={receivedPct}
            amount={stats.totalReceived}
            colorClass="bg-gradient-to-l from-emerald-500 to-emerald-600"
            textColorClass="text-emerald-600"
          />
          <ProgressRow
            label="مانده طلب"
            percentage={remainingPct}
            amount={stats.totalRemaining}
            colorClass="bg-gradient-to-l from-amber-500 to-amber-600"
            textColorClass="text-amber-600"
          />
          {stats.totalOverdue > 0 && (
            <ProgressRow
              label="معوقات"
              percentage={overduePct}
              amount={stats.totalOverdue}
              colorClass="bg-gradient-to-l from-red-500 to-red-600"
              textColorClass="text-red-600"
            />
          )}
        </div>

        {/* Summary Mini Cards */}
        <div className="grid grid-cols-2 gap-3">
          <MiniCard
            label="نرخ وصولی"
            value={`${receivedPct.toFixed(0)}%`}
            bg="bg-emerald-50"
            border="border-emerald-100"
            textColor="text-emerald-600"
          />
          <MiniCard
            label="میانگین مانده / موکل"
            value={
              stats.clientCount > 0
                ? `${(stats.totalRemaining / stats.clientCount).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ت`
                : '۰'
            }
            bg="bg-amber-50"
            border="border-amber-100"
            textColor="text-amber-600"
          />
          <MiniCard
            label="میانگین قرارداد"
            value={
              stats.activeContracts > 0
                ? `${(stats.totalRevenue / stats.activeContracts).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ت`
                : '۰'
            }
            bg="bg-indigo-50"
            border="border-indigo-100"
            textColor="text-indigo-600"
          />
          <MiniCard
            label="موکلین فعال"
            value={String(stats.clientCount)}
            bg="bg-purple-50"
            border="border-purple-100"
            textColor="text-purple-600"
          />
        </div>

      </div>
    </div>
  )
}

/* ── helpers ── */

function ProgressRow({
  label,
  percentage,
  amount,
  colorClass,
  textColorClass,
}: {
  label: string
  percentage: number
  amount: number
  colorClass: string
  textColorClass: string
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-zinc-700 font-medium">{label}</span>
        <span className={`font-bold ${textColorClass}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-zinc-100 rounded-full h-3.5 overflow-hidden">
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-zinc-400 mt-1">
        {amount.toLocaleString('fa-IR')} تومان
      </p>
    </div>
  )
}

function MiniCard({
  label,
  value,
  bg,
  border,
  textColor,
}: {
  label: string
  value: string
  bg: string
  border: string
  textColor: string
}) {
  return (
    <div className={`${bg} rounded-xl p-4 border ${border}`}>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${textColor}`}>{value}</p>
    </div>
  )
}
