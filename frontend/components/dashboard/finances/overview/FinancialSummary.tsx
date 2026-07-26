

import {
  AlertCircle,
  PieChart,
  Receipt,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { safePercentage } from '@/features/finance/utils/number'
import { formatMoney } from '@/features/finance/utils/money'
import type { FinancialStats } from '@/types/finance'

interface FinancialSummaryProps {
  stats: FinancialStats
}

export function FinancialSummary({
  stats,
}: FinancialSummaryProps) {
  const collectionRate = clampPercentage(stats.collectionRate)

  const remainingRate = safePercentage(
    stats.totalRemaining,
    stats.totalRevenue
  )

  const overdueShare = safePercentage(
    stats.totalOverdue,
    stats.totalRemaining
  )

  const expenseShare = safePercentage(
    stats.totalExpenses,
    stats.totalReceived
  )

  const averageRemainingPerClient =
    stats.clientCount > 0
      ? stats.totalRemaining / stats.clientCount
      : 0

  const averageContract =
    stats.activeContracts > 0
      ? stats.totalRevenue / stats.activeContracts
      : 0

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <PieChart size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              تحلیل وضعیت مالی
            </h2>

            <p className="mt-0.5 text-xs text-zinc-500">
              نمای مدیریتی از وصول، مطالبات، معوقات و هزینه‌ها
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
          {stats.activeContracts.toLocaleString('fa-IR')} قرارداد
          فعال
        </span>
      </div>

      <div className="mt-7 grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50/70 p-6 text-center">
          <div
            className="flex h-44 w-44 items-center justify-center rounded-full p-4"
            style={{
              background: `conic-gradient(
                #10b981 ${collectionRate * 3.6}deg,
                #e4e4e7 0deg
              )`,
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <span className="text-3xl font-black text-zinc-900">
                {collectionRate.toLocaleString('fa-IR', {
                  maximumFractionDigits: 1,
                })}
                ٪
              </span>

              <span className="mt-1 text-xs font-medium text-zinc-500">
                نرخ وصول
              </span>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-zinc-600">
            از مجموع {formatMoney(stats.totalRevenue)} قرارداد،
            تاکنون{' '}
            <strong className="font-bold text-emerald-700">
              {formatMoney(stats.totalReceived)}
            </strong>{' '}
            وصول شده است.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-5">
            <ProgressRow
              label="وصول‌شده از ارزش قراردادها"
              percentage={collectionRate}
              amount={stats.totalReceived}
              icon={TrendingUp}
              barClassName="bg-emerald-500"
              iconClassName="bg-emerald-50 text-emerald-600"
              percentageClassName="text-emerald-700"
            />

            <ProgressRow
              label="مانده مطالبات از ارزش قراردادها"
              percentage={remainingRate}
              amount={stats.totalRemaining}
              icon={TrendingDown}
              barClassName="bg-amber-500"
              iconClassName="bg-amber-50 text-amber-600"
              percentageClassName="text-amber-700"
            />

            <ProgressRow
              label="سهم معوقات از کل مطالبات"
              percentage={overdueShare}
              amount={stats.totalOverdue}
              icon={AlertCircle}
              barClassName="bg-red-500"
              iconClassName="bg-red-50 text-red-600"
              percentageClassName="text-red-700"
            />

            <ProgressRow
              label="سهم هزینه‌ها از دریافتی‌ها"
              percentage={expenseShare}
              amount={stats.totalExpenses}
              icon={Receipt}
              barClassName="bg-orange-500"
              iconClassName="bg-orange-50 text-orange-600"
              percentageClassName="text-orange-700"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MiniMetric
              label="خالص دریافتی"
              value={formatMoney(stats.netCollected)}
              valueClassName={
                stats.netCollected >= 0
                  ? 'text-teal-700'
                  : 'text-red-700'
              }
            />

            <MiniMetric
              label="میانگین مبلغ قرارداد"
              value={formatMoney(averageContract)}
              valueClassName="text-indigo-700"
            />

            <MiniMetric
              label="میانگین طلب هر موکل"
              value={formatMoney(averageRemainingPerClient)}
              valueClassName="text-amber-700"
            />

            <MiniMetric
              label="موکلین دارای پرونده"
              value={stats.clientCount.toLocaleString('fa-IR')}
              valueClassName="text-violet-700"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

interface ProgressRowProps {
  label: string
  percentage: number
  amount: number
  icon: typeof TrendingUp
  barClassName: string
  iconClassName: string
  percentageClassName: string
}

function ProgressRow({
  label,
  percentage,
  amount,
  icon: Icon,
  barClassName,
  iconClassName,
  percentageClassName,
}: ProgressRowProps) {
  const safeValue = clampPercentage(percentage)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
          >
            <Icon size={16} />
          </span>

          <span className="truncate text-sm font-semibold text-zinc-700">
            {label}
          </span>
        </div>

        <span
          className={`text-sm font-black ${percentageClassName}`}
        >
          {percentage.toLocaleString('fa-IR', {
            maximumFractionDigits: 1,
          })}
          ٪
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${barClassName}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>

      <p className="mt-1.5 text-xs text-zinc-400">
        {formatMoney(amount)}
      </p>
    </div>
  )
}

function MiniMetric({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName: string
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
      <p className="text-xs font-medium text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 text-base font-black leading-7 ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  )
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(Math.max(value, 0), 100)
}