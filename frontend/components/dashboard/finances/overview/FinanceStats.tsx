import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  DollarSign,
  FileText,
  Percent,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { formatMoney } from '@/features/finance/utils/money'
import type { FinancialStats } from '@/types/finance'

interface FinanceStatsProps {
  stats: FinancialStats
}

interface StatCardConfig {
  title: string
  value: string
  description: string
  icon: LucideIcon
  iconClassName: string
  badge?: string
  badgeClassName?: string
  valueClassName?: string
}

export function FinanceStats({ stats }: FinanceStatsProps) {
  const cards: StatCardConfig[] = [
    {
      title: 'ارزش کل قراردادها',
      value: formatMoney(stats.totalRevenue),
      description: 'مجموع مبلغ قراردادهای ثبت‌شده',
      icon: DollarSign,
      iconClassName: 'bg-blue-50 text-blue-600',
      badge: 'کل',
      badgeClassName: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'مجموع دریافتی‌ها',
      value: formatMoney(stats.totalReceived),
      description: 'پرداخت‌های وصول‌شده از موکلین',
      icon: TrendingUp,
      iconClassName: 'bg-emerald-50 text-emerald-600',
      badge: `${stats.collectionRate.toLocaleString('fa-IR', {
        maximumFractionDigits: 1,
      })}٪ وصول`,
      badgeClassName: 'bg-emerald-50 text-emerald-700',
      valueClassName: 'text-emerald-700',
    },
    {
      title: 'مانده مطالبات',
      value: formatMoney(stats.totalRemaining),
      description: 'بخش پرداخت‌نشده قراردادها',
      icon: TrendingDown,
      iconClassName: 'bg-amber-50 text-amber-600',
      badge:
        stats.totalRemaining > 0
          ? 'نیازمند پیگیری'
          : 'تسویه‌شده',
      badgeClassName:
        stats.totalRemaining > 0
          ? 'bg-amber-50 text-amber-700'
          : 'bg-emerald-50 text-emerald-700',
      valueClassName: 'text-amber-700',
    },
    {
      title: 'مطالبات معوق',
      value: formatMoney(stats.totalOverdue),
      description: 'مطالباتی که از سررسید عبور کرده‌اند',
      icon: AlertCircle,
      iconClassName: 'bg-red-50 text-red-600',
      badge:
        stats.totalOverdue > 0
          ? 'اولویت بالا'
          : 'بدون معوق',
      badgeClassName:
        stats.totalOverdue > 0
          ? 'bg-red-50 text-red-700'
          : 'bg-emerald-50 text-emerald-700',
      valueClassName:
        stats.totalOverdue > 0
          ? 'text-red-700'
          : undefined,
    },
    {
      title: 'هزینه‌های ثبت‌شده',
      value: formatMoney(stats.totalExpenses),
      description: 'هزینه‌های مرتبط با پرونده‌ها',
      icon: Receipt,
      iconClassName: 'bg-orange-50 text-orange-600',
      badge: 'هزینه',
      badgeClassName: 'bg-orange-50 text-orange-700',
    },
    {
      title: 'خالص دریافتی',
      value: formatMoney(stats.netCollected),
      description: 'دریافتی‌ها پس از کسر هزینه‌های ثبت‌شده',
      icon: Wallet,
      iconClassName:
        stats.netCollected >= 0
          ? 'bg-teal-50 text-teal-600'
          : 'bg-red-50 text-red-600',
      badge: stats.netCollected >= 0 ? 'مثبت' : 'منفی',
      badgeClassName:
        stats.netCollected >= 0
          ? 'bg-teal-50 text-teal-700'
          : 'bg-red-50 text-red-700',
      valueClassName:
        stats.netCollected >= 0
          ? 'text-teal-700'
          : 'text-red-700',
    },
    {
      title: 'نرخ وصول',
      value: `${stats.collectionRate.toLocaleString('fa-IR', {
        maximumFractionDigits: 1,
      })}٪`,
      description: 'نسبت دریافتی به ارزش قراردادها',
      icon: Percent,
      iconClassName: 'bg-violet-50 text-violet-600',
      badge:
        stats.collectionRate >= 70
          ? 'مناسب'
          : 'قابل بهبود',
      badgeClassName:
        stats.collectionRate >= 70
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-violet-50 text-violet-700',
    },
    {
      title: 'قراردادهای فعال',
      value: stats.activeContracts.toLocaleString('fa-IR'),
      description: `${stats.clientCount.toLocaleString(
        'fa-IR'
      )} موکل دارای پرونده مالی`,
      icon: FileText,
      iconClassName: 'bg-indigo-50 text-indigo-600',
      badge: 'فعال',
      badgeClassName: 'bg-indigo-50 text-indigo-700',
    },
  ]

  return (
    <section
      aria-label="خلاصه شاخص‌های مالی"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <StatCard
          key={card.title}
          {...card}
        />
      ))}
    </section>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  badge,
  badgeClassName,
  valueClassName = 'text-zinc-900',
}: StatCardConfig) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-zinc-50 transition group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon size={21} />
        </div>

        {badge && (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              badgeClassName ?? 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <p className="text-xs font-medium text-zinc-500">
          {title}
        </p>

        <p
          className={`mt-2 break-words text-xl font-black leading-8 ${valueClassName}`}
        >
          {value}
        </p>

        <p className="mt-2 text-xs leading-5 text-zinc-400">
          {description}
        </p>
      </div>
    </article>
  )
}