

'use client'

import {
  useState,
} from 'react'

import {
  AlertCircle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Database,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

import type {
  FinancialStats,
} from '@/types/finance'

import type {
  FinancialAnalytics,
  FinanceActionInsight,
  FinanceRiskClient,
} from '@/features/finance/domain/analytics'

import {
  formatMoney,
} from '@/features/finance/utils/money'

interface FinancialSummaryProps {
  stats:
    FinancialStats

  analytics:
    FinancialAnalytics
}

type AnalysisTab =
  | 'overview'
  | 'aging'
  | 'risk'
  | 'quality'

function money(
  amount: number
): string {
  return formatMoney(
    amount,
    {
      sourceUnit:
        'rial',

      displayUnit:
        'rial',
    }
  )
}

export function FinancialSummary({
  stats,
  analytics,
}: FinancialSummaryProps) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<AnalysisTab>(
      'overview'
    )

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <header className="border-b border-zinc-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3
                size={
                  21
                }
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-zinc-900">
                تحلیل وضعیت مالی
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                تحلیل مدیریتی وصول، معوقات، سررسیدها و ریسک مالی موکلین
              </p>
            </div>
          </div>

          <HealthBadge
            score={
              analytics.healthScore
            }
            level={
              analytics.healthLevel
            }
          />
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          <TabButton
            active={
              activeTab ===
              'overview'
            }
            onClick={() =>
              setActiveTab(
                'overview'
              )
            }
          >
            خلاصه مدیریتی
          </TabButton>

          <TabButton
            active={
              activeTab ===
              'aging'
            }
            onClick={() =>
              setActiveTab(
                'aging'
              )
            }
          >
            سن مطالبات
          </TabButton>

          <TabButton
            active={
              activeTab ===
              'risk'
            }
            onClick={() =>
              setActiveTab(
                'risk'
              )
            }
          >
            ریسک موکلین
          </TabButton>

          <TabButton
            active={
              activeTab ===
              'quality'
            }
            onClick={() =>
              setActiveTab(
                'quality'
              )
            }
          >
            کیفیت داده
          </TabButton>
        </div>
      </header>

      <div className="p-5 sm:p-6">
        {activeTab ===
          'overview' && (
          <OverviewAnalysis
            stats={
              stats
            }
            analytics={
              analytics
            }
          />
        )}

        {activeTab ===
          'aging' && (
          <AgingAnalysis
            analytics={
              analytics
            }
          />
        )}

        {activeTab ===
          'risk' && (
          <RiskAnalysis
            analytics={
              analytics
            }
          />
        )}

        {activeTab ===
          'quality' && (
          <QualityAnalysis
            analytics={
              analytics
            }
          />
        )}
      </div>
    </section>
  )
}



function OverviewAnalysis({
  stats,
  analytics,
}: FinancialSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
        <HealthScoreCard
          analytics={
            analytics
          }
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            title="نرخ وصول"
            value={`${analytics.collectionRate.toLocaleString(
              'fa-IR',
              {
                maximumFractionDigits:
                  1,
              }
            )}٪`}
            description="از کل ارزش قراردادها"
            icon={
              TrendingUp
            }
            tone="green"
          />

          <MetricCard
            title="نسبت مانده"
            value={`${analytics.remainingRate.toLocaleString(
              'fa-IR',
              {
                maximumFractionDigits:
                  1,
              }
            )}٪`}
            description="از ارزش قراردادها"
            icon={
              CircleDollarSign
            }
            tone="amber"
          />

          <MetricCard
            title="شدت معوقات"
            value={`${analytics.overdueRate.toLocaleString(
              'fa-IR',
              {
                maximumFractionDigits:
                  1,
              }
            )}٪`}
            description="از مطالبات باقی‌مانده"
            icon={
              AlertCircle
            }
            tone="red"
          />

          <MetricCard
            title="نسبت هزینه"
            value={`${analytics.expenseRate.toLocaleString(
              'fa-IR',
              {
                maximumFractionDigits:
                  1,
              }
            )}٪`}
            description="نسبت هزینه به دریافتی"
            icon={
              BarChart3
            }
            tone="violet"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingCard
          title="سررسید ۷ روز آینده"
          amount={
            analytics
              .upcomingDues
              .next7DaysAmount
          }
          count={
            analytics
              .upcomingDues
              .next7DaysCases
          }
          urgent
        />

        <UpcomingCard
          title="سررسید ۳۰ روز آینده"
          amount={
            analytics
              .upcomingDues
              .next30DaysAmount
          }
          count={
            analytics
              .upcomingDues
              .next30DaysCases
          }
        />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles
            size={
              18
            }
            className="text-indigo-600"
          />

          <h3 className="font-black text-zinc-900">
            اقدامات پیشنهادی
          </h3>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {analytics.insights.map(
            (
              insight
            ) => (
              <InsightCard
                key={
                  insight.id
                }
                insight={
                  insight
                }
              />
            )
          )}
        </div>
      </div>

      {stats.totalRemaining >
        0 && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-zinc-800">
                مطالبات قابل وصول
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                مجموع مانده‌ای که هنوز از موکلین دریافت نشده است.
              </p>
            </div>

            <p className="text-lg font-black text-amber-700">
              {money(
                stats.totalRemaining
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}



function AgingAnalysis({
  analytics,
}: {
  analytics:
    FinancialAnalytics
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-zinc-900">
          سن مطالبات
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          هرچه یک طلب مدت بیشتری از سررسیدش گذشته باشد، ریسک وصول آن بیشتر می‌شود.
        </p>
      </div>

      <div className="space-y-4">
        {analytics.aging.map(
          (
            bucket
          ) => (
            <div
              key={
                bucket.key
              }
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-bold text-zinc-700">
                    {
                      bucket.label
                    }
                  </span>

                  <span className="mr-2 text-xs text-zinc-400">
                    {bucket.caseCount.toLocaleString(
                      'fa-IR'
                    )}{' '}
                    پرونده
                  </span>
                </div>

                <div className="text-left">
                  <p className="text-sm font-black text-zinc-800">
                    {money(
                      bucket.amount
                    )}
                  </p>

                  <p className="text-[11px] text-zinc-400">
                    {bucket.percentage.toLocaleString(
                      'fa-IR',
                      {
                        maximumFractionDigits:
                          1,
                      }
                    )}
                    ٪
                  </p>
                </div>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={
                    getAgingBarClass(
                      bucket.key
                    )
                  }
                  style={{
                    width:
                      `${Math.min(
                        bucket.percentage,
                        100
                      )}%`,
                  }}
                />
              </div>
            </div>
          )
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <UpcomingCard
          title="تا ۷ روز آینده"
          amount={
            analytics
              .upcomingDues
              .next7DaysAmount
          }
          count={
            analytics
              .upcomingDues
              .next7DaysCases
          }
          urgent
        />

        <UpcomingCard
          title="تا ۳۰ روز آینده"
          amount={
            analytics
              .upcomingDues
              .next30DaysAmount
          }
          count={
            analytics
              .upcomingDues
              .next30DaysCases
          }
        />
      </div>
    </div>
  )
}


function RiskAnalysis({
  analytics,
}: {
  analytics:
    FinancialAnalytics
}) {
  const riskClients =
    analytics.riskClients.slice(
      0,
      8
    )

  if (
    riskClients.length ===
    0
  ) {
    return (
      <div className="py-12 text-center">
        <CheckCircle2
          size={
            42
          }
          className="mx-auto text-emerald-500"
        />

        <h3 className="mt-4 font-black text-zinc-900">
          موکل پرریسکی وجود ندارد
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          در اطلاعات فعلی، هیچ موکلی با مانده بدهی ثبت نشده است.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-black text-zinc-900">
          موکلین نیازمند پیگیری
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          امتیاز ریسک براساس شدت معوق، نرخ وصول و اندازه بدهی محاسبه می‌شود.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-bold text-zinc-500">
                موکل
              </th>

              <th className="px-4 py-3 text-center text-xs font-bold text-zinc-500">
                مانده
              </th>

              <th className="px-4 py-3 text-center text-xs font-bold text-zinc-500">
                معوق
              </th>

              <th className="px-4 py-3 text-center text-xs font-bold text-zinc-500">
                وصول
              </th>

              <th className="px-4 py-3 text-center text-xs font-bold text-zinc-500">
                ریسک
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {riskClients.map(
              (
                client
              ) => (
                <RiskClientRow
                  key={
                    client.clientId ??
                    client.clientName
                  }
                  client={
                    client
                  }
                />
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


function QualityAnalysis({
  analytics,
}: {
  analytics:
    FinancialAnalytics
}) {
  const quality =
    analytics.dataQuality

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center">
          <Database
            size={
              28
            }
            className="mx-auto text-indigo-600"
          />

          <p className="mt-3 text-xs font-bold text-indigo-700">
            کیفیت اطلاعات مالی
          </p>

          <p className="mt-2 text-4xl font-black text-indigo-900">
            {quality.completenessScore.toLocaleString(
              'fa-IR',
              {
                maximumFractionDigits:
                  0,
              }
            )}
            ٪
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <QualityCard
            title="سهم تخمینی"
            value={
              quality.estimatedAllocationCases
            }
          />

          <QualityCard
            title="بدون سررسید"
            value={
              quality.missingDueDateCases
            }
          />

          <QualityCard
            title="بدون برنامه پرداخت"
            value={
              quality.missingPaymentScheduleCases
            }
          />

          <QualityCard
            title="بدون موکل"
            value={
              quality.missingClientCases
            }
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-5">
        <div className="flex items-center gap-2">
          <Users
            size={
              19
            }
            className="text-violet-600"
          />

          <h3 className="font-black text-zinc-900">
            تمرکز مطالبات
          </h3>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <QualityMetric
            label="سهم بزرگ‌ترین بدهکار"
            value={`${analytics.concentration.topClientShare.toLocaleString(
              'fa-IR',
              {
                maximumFractionDigits:
                  1,
              }
            )}٪`}
          />

          <QualityMetric
            label="سهم ۳ بدهکار اول"
            value={`${analytics.concentration.top3ClientsShare.toLocaleString(
              'fa-IR',
              {
                maximumFractionDigits:
                  1,
              }
            )}٪`}
          />

          <QualityMetric
            label="بزرگ‌ترین بدهکار"
            value={
              analytics
                .concentration
                .topDebtorName ??
              '—'
            }
          />
        </div>

        {analytics
          .concentration
          .topDebtorAmount >
          0 && (
          <p className="mt-4 text-sm text-zinc-500">
            مانده بزرگ‌ترین بدهکار:{' '}
            <strong className="text-zinc-800">
              {money(
                analytics
                  .concentration
                  .topDebtorAmount
              )}
            </strong>
          </p>
        )}
      </div>
    </div>
  )
}



function HealthScoreCard({
  analytics,
}: {
  analytics:
    FinancialAnalytics
}) {
  const score =
    analytics.healthScore

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-center">
      <div
        className="flex h-36 w-36 items-center justify-center rounded-full p-3"
        style={{
          background:
            `conic-gradient(#4f46e5 ${score * 3.6}deg, #e4e4e7 0deg)`,
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white shadow-inner">
          <span className="text-3xl font-black text-zinc-900">
            {score.toLocaleString(
              'fa-IR',
              {
                maximumFractionDigits:
                  0,
              }
            )}
          </span>

          <span className="text-xs text-zinc-400">
            از ۱۰۰
          </span>
        </div>
      </div>

      <p className="mt-4 font-black text-zinc-900">
        سلامت مالی دفتر
      </p>

      <p className="mt-1 text-xs leading-5 text-zinc-500">
        ترکیبی از وصول، معوقات، هزینه‌ها و کیفیت اطلاعات
      </p>
    </div>
  )
}

function HealthBadge({
  score,
  level,
}: {
  score: number

  level:
    FinancialAnalytics['healthLevel']
}) {
  const config = {
    excellent: {
      label:
        'عالی',

      className:
        'bg-emerald-50 text-emerald-700 ring-emerald-200',
    },

    good: {
      label:
        'خوب',

      className:
        'bg-blue-50 text-blue-700 ring-blue-200',
    },

    attention: {
      label:
        'نیازمند توجه',

      className:
        'bg-amber-50 text-amber-700 ring-amber-200',
    },

    critical: {
      label:
        'بحرانی',

      className:
        'bg-red-50 text-red-700 ring-red-200',
    },
  } as const

  const selected =
    config[level]

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${selected.className}`}
    >
      امتیاز{' '}
      {score.toLocaleString(
        'fa-IR',
        {
          maximumFractionDigits:
            0,
        }
      )}
      /۱۰۰ ·{' '}
      {selected.label}
    </span>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active:
    boolean

  onClick:
    () => void

  children:
    React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`shrink-0 rounded-lg px-4 py-2 text-sm font-bold transition ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
      }`}
    >
      {children}
    </button>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title:
    string

  value:
    string

  description:
    string

  icon:
    typeof TrendingUp

  tone:
    'green'
    | 'amber'
    | 'red'
    | 'violet'
}) {
  const classes = {
    green:
      'bg-emerald-50 text-emerald-600',

    amber:
      'bg-amber-50 text-amber-600',

    red:
      'bg-red-50 text-red-600',

    violet:
      'bg-violet-50 text-violet-600',
  } as const

  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${classes[tone]}`}
      >
        <Icon
          size={
            17
          }
        />
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-black text-zinc-900">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-zinc-400">
        {description}
      </p>
    </div>
  )
}

function UpcomingCard({
  title,
  amount,
  count,
  urgent = false,
}: {
  title:
    string

  amount:
    number

  count:
    number

  urgent?:
    boolean
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        urgent
          ? 'border-amber-200 bg-amber-50'
          : 'border-blue-200 bg-blue-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-zinc-800">
            {title}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {count.toLocaleString(
              'fa-IR'
            )}{' '}
            پرونده
          </p>
        </div>

        <CalendarClock
          size={
            20
          }
          className={
            urgent
              ? 'text-amber-600'
              : 'text-blue-600'
          }
        />
      </div>

      <p className="mt-4 text-lg font-black text-zinc-900">
        {money(
          amount
        )}
      </p>
    </div>
  )
}

function InsightCard({
  insight,
}: {
  insight:
    FinanceActionInsight
}) {
  const classes = {
    success: {
      wrapper:
        'border-emerald-200 bg-emerald-50',

      icon:
        'text-emerald-600',
    },

    info: {
      wrapper:
        'border-blue-200 bg-blue-50',

      icon:
        'text-blue-600',
    },

    warning: {
      wrapper:
        'border-amber-200 bg-amber-50',

      icon:
        'text-amber-600',
    },

    critical: {
      wrapper:
        'border-red-200 bg-red-50',

      icon:
        'text-red-600',
    },
  } as const

  const style =
    classes[
      insight.severity
    ]

  return (
    <article
      className={`rounded-xl border p-4 ${style.wrapper}`}
    >
      <div className="flex items-start gap-3">
        <ShieldAlert
          size={
            19
          }
          className={`mt-0.5 shrink-0 ${style.icon}`}
        />

        <div>
          <h4 className="font-black text-zinc-900">
            {
              insight.title
            }
          </h4>

          <p className="mt-1 text-xs leading-6 text-zinc-600">
            {
              insight.description
            }
          </p>

          {insight.amount !==
            undefined && (
            <p className="mt-2 text-sm font-black text-zinc-800">
              {money(
                insight.amount
              )}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

function RiskClientRow({
  client,
}: {
  client:
    FinanceRiskClient
}) {
  const riskClass =
    {
      low:
        'bg-emerald-50 text-emerald-700',

      medium:
        'bg-amber-50 text-amber-700',

      high:
        'bg-orange-50 text-orange-700',

      critical:
        'bg-red-50 text-red-700',
    }[
      client.level
    ]

  return (
    <tr className="hover:bg-zinc-50">
      <td className="px-4 py-4 font-bold text-zinc-900">
        {
          client.clientName
        }
      </td>

      <td className="px-4 py-4 text-center font-semibold text-amber-700">
        {money(
          client.totalRemaining
        )}
      </td>

      <td className="px-4 py-4 text-center font-semibold text-red-700">
        {money(
          client.totalOverdue
        )}
      </td>

      <td className="px-4 py-4 text-center">
        {client.collectionRate.toLocaleString(
          'fa-IR',
          {
            maximumFractionDigits:
              0,
          }
        )}
        ٪
      </td>

      <td className="px-4 py-4 text-center">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${riskClass}`}
        >
          {client.riskScore.toLocaleString(
            'fa-IR',
            {
              maximumFractionDigits:
                0,
            }
          )}
          /۱۰۰
        </span>
      </td>
    </tr>
  )
}

function QualityCard({
  title,
  value,
}: {
  title:
    string

  value:
    number
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black text-zinc-900">
        {value.toLocaleString(
          'fa-IR'
        )}
      </p>

      <p className="mt-1 text-[11px] text-zinc-400">
        پرونده
      </p>
    </div>
  )
}

function QualityMetric({
  label,
  value,
}: {
  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-2 font-black text-zinc-900">
        {value}
      </p>
    </div>
  )
}

function getAgingBarClass(
  key:
    FinancialAnalytics['aging'][number]['key']
): string {
  switch (key) {
    case 'not-due':
      return 'h-full rounded-full bg-blue-500 transition-all'

    case '1-30':
      return 'h-full rounded-full bg-amber-400 transition-all'

    case '31-60':
      return 'h-full rounded-full bg-orange-500 transition-all'

    case '61-90':
      return 'h-full rounded-full bg-red-500 transition-all'

    case '90-plus':
      return 'h-full rounded-full bg-red-700 transition-all'

    case 'unscheduled':
    default:
      return 'h-full rounded-full bg-zinc-400 transition-all'
  }
}