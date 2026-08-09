'use client'

import {
  useState,
} from 'react'

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Gauge,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'

import type {
  FinanceDecisionInsight,
  FinancePeriodAnalytics,
  FinanceRiskClient,
} from '@/features/finance/domain/period-analytics'

import {
  formatMoney,
} from '@/features/finance/utils/money'

interface Props {
  analytics:
    FinancePeriodAnalytics
}

type TabKey =
  | 'management'
  | 'cashflow'
  | 'aging'
  | 'risk'

export function FinancialDecisionCenter({
  analytics,
}: Props) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<TabKey>(
      'management'
    )

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <header className="border-b border-zinc-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Gauge
                size={21}
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-zinc-900">
                مرکز تحلیل و تصمیم‌گیری مالی
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                جریان نقدی، سن مطالبات، ریسک موکلین و پیشنهاد اقدامات بعدی
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
              'management'
            }
            onClick={() =>
              setActiveTab(
                'management'
              )
            }
          >
            خلاصه مدیریتی
          </TabButton>

          <TabButton
            active={
              activeTab ===
              'cashflow'
            }
            onClick={() =>
              setActiveTab(
                'cashflow'
              )
            }
          >
            جریان نقدی
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
        </div>
      </header>

      <div className="p-5 sm:p-6">
        {activeTab ===
          'management' && (
          <ManagementTab
            analytics={
              analytics
            }
          />
        )}

        {activeTab ===
          'cashflow' && (
          <CashflowTab
            analytics={
              analytics
            }
          />
        )}

        {activeTab ===
          'aging' && (
          <AgingTab
            analytics={
              analytics
            }
          />
        )}

        {activeTab ===
          'risk' && (
          <RiskTab
            analytics={
              analytics
            }
          />
        )}
      </div>
    </section>
  )
}

function ManagementTab({
  analytics,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <HealthCard
          analytics={
            analytics
          }
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ComparisonCard
            title="دریافتی ماه جاری"
            value={
              analytics
                .currentMonth
                .received
            }
            change={
              analytics
                .receivedChangePercent
            }
            icon={
              TrendingUp
            }
            positiveIsGood
          />

          <ComparisonCard
            title="هزینه ماه جاری"
            value={
              analytics
                .currentMonth
                .expenses
            }
            change={
              analytics
                .expenseChangePercent
            }
            icon={
              TrendingDown
            }
            positiveIsGood={
              false
            }
          />

          <ComparisonCard
            title="خالص ماه جاری"
            value={
              analytics
                .currentMonth
                .net
            }
            change={
              analytics
                .netChangePercent
            }
            icon={
              Wallet
            }
            positiveIsGood
          />

          <InfoCard
            title="سررسید ۷ روز آینده"
            value={
              formatMoney(
                analytics
                  .upcoming7DaysAmount
              )
            }
            description={`${analytics.upcoming7DaysCases.toLocaleString(
              'fa-IR'
            )} پرونده`}
            icon={
              CalendarClock
            }
            tone="amber"
          />

          <InfoCard
            title="بزرگ‌ترین بدهکار"
            value={
              analytics
                .topDebtorName ??
              '—'
            }
            description={
              analytics
                .topDebtorAmount >
              0
                ? `${formatMoney(
                    analytics
                      .topDebtorAmount
                  )} مانده`
                : 'بدهی فعالی ثبت نشده'
            }
            icon={
              Users
            }
            tone="violet"
          />

          <InfoCard
            title="تمرکز بزرگ‌ترین بدهکار"
            value={`${analytics.topDebtorShare.toLocaleString(
              'fa-IR',
              {
                maximumFractionDigits:
                  1,
              }
            )}٪`}
            description="از کل مانده مطالبات"
            icon={
              CircleDollarSign
            }
            tone="red"
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles
            size={18}
            className="text-indigo-600"
          />

          <h3 className="font-black text-zinc-900">
            پیشنهاد اقدام
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

      {(analytics
        .unattributedReceivedAmount >
        0 ||
        analytics
          .unattributedExpenseAmount >
          0) && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>
              <p className="text-sm font-black text-blue-900">
                بخشی از جریان نقدی تاریخ دقیق ندارد
              </p>

              <p className="mt-1 text-xs leading-6 text-blue-700">
                دریافتی بدون تاریخ:{' '}

                <strong>
                  {formatMoney(
                    analytics
                      .unattributedReceivedAmount
                  )}
                </strong>

                {' · '}

                هزینه بدون تاریخ:{' '}

                <strong>
                  {formatMoney(
                    analytics
                      .unattributedExpenseAmount
                  )}
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CashflowTab({
  analytics,
}: Props) {
  const maxAmount =
    Math.max(
      ...analytics.monthlyCashflow.flatMap(
        (point) => [
          point.received,
          point.expenses,
        ]
      ),
      1
    )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SmallMetric
          label="دریافتی این ماه"
          value={
            formatMoney(
              analytics
                .currentMonth
                .received
            )
          }
          sub={`${analytics.currentMonth.paymentCount.toLocaleString(
            'fa-IR'
          )} پرداخت دارای تاریخ`}
        />

        <SmallMetric
          label="هزینه این ماه"
          value={
            formatMoney(
              analytics
                .currentMonth
                .expenses
            )
          }
          sub={`${analytics.currentMonth.expenseCount.toLocaleString(
            'fa-IR'
          )} هزینه دارای تاریخ`}
        />

        <SmallMetric
          label="خالص این ماه"
          value={
            formatMoney(
              analytics
                .currentMonth
                .net
            )
          }
          sub={
            analytics
              .currentMonth
              .net >= 0
              ? 'جریان نقدی مثبت'
              : 'جریان نقدی منفی'
          }
        />

        <SmallMetric
          label="دریافتی ماه قبل"
          value={
            formatMoney(
              analytics
                .previousMonth
                .received
            )
          }
          sub={
            analytics
              .previousMonth
              .label ||
            'ماه قبل'
          }
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-black text-zinc-900">
              جریان نقدی ماهانه
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              فقط پرداخت‌ها و هزینه‌هایی که تاریخ معتبر دارند در نمودار قرار می‌گیرند.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <Legend
              className="bg-emerald-500"
              label="دریافتی"
            />

            <Legend
              className="bg-orange-400"
              label="هزینه"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="flex min-w-[680px] items-end gap-3">
            {analytics.monthlyCashflow.map(
              (
                point
              ) => (
                <div
                  key={
                    point.monthKey
                  }
                  className="flex min-w-24 flex-1 flex-col items-center"
                >
                  <div className="mb-2 text-center">
                    <p className="text-[11px] font-bold text-zinc-700">
                      {formatMoney(
                        point.net
                      )}
                    </p>

                    <p className="text-[10px] text-zinc-400">
                      خالص
                    </p>
                  </div>

                  <div className="flex h-44 w-full items-end justify-center gap-2 rounded-xl bg-zinc-50 px-3 pt-3">
                    <Bar
                      value={
                        point.received
                      }
                      max={
                        maxAmount
                      }
                      className="bg-emerald-500"
                      title={`دریافتی ${formatMoney(
                        point.received
                      )}`}
                    />

                    <Bar
                      value={
                        point.expenses
                      }
                      max={
                        maxAmount
                      }
                      className="bg-orange-400"
                      title={`هزینه ${formatMoney(
                        point.expenses
                      )}`}
                    />
                  </div>

                  <p className="mt-2 text-xs font-bold text-zinc-600">
                    {point.label}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AgingTab({
  analytics,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoCard
          title="سررسید ۷ روز آینده"
          value={
            formatMoney(
              analytics
                .upcoming7DaysAmount
            )
          }
          description={`${analytics.upcoming7DaysCases.toLocaleString(
            'fa-IR'
          )} پرونده`}
          icon={
            CalendarClock
          }
          tone="amber"
        />

        <InfoCard
          title="سررسید ۳۰ روز آینده"
          value={
            formatMoney(
              analytics
                .upcoming30DaysAmount
            )
          }
          description={`${analytics.upcoming30DaysCases.toLocaleString(
            'fa-IR'
          )} پرونده`}
          icon={
            CalendarClock
          }
          tone="blue"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-zinc-200 p-4 sm:p-5">
        <div>
          <h3 className="font-black text-zinc-900">
            سن مطالبات
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            مطالبات براساس فاصله از تاریخ سررسید دسته‌بندی می‌شوند.
          </p>
        </div>

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
                    {bucket.label}
                  </span>

                  <span className="mr-2 text-[11px] text-zinc-400">
                    {bucket.caseCount.toLocaleString(
                      'fa-IR'
                    )}{' '}
                    پرونده
                  </span>
                </div>

                <div className="text-left">
                  <p className="text-sm font-black text-zinc-800">
                    {formatMoney(
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
                    getAgingClass(
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
    </div>
  )
}

function RiskTab({
  analytics,
}: Props) {
  if (
    analytics
      .riskClients
      .length === 0
  ) {
    return (
      <div className="py-12 text-center">
        <CheckCircle2
          size={42}
          className="mx-auto text-emerald-500"
        />

        <h3 className="mt-4 font-black text-zinc-900">
          موکل پرریسکی وجود ندارد
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          هیچ موکلی با مانده بدهی فعال شناسایی نشده است.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-black text-zinc-900">
          اولویت‌بندی پیگیری موکلین
        </h3>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          امتیاز ریسک از شدت معوق، نرخ وصول و اندازه مانده بدهی ساخته می‌شود و ابزار مدیریتی است.
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
                نرخ وصول
              </th>

              <th className="px-4 py-3 text-center text-xs font-bold text-zinc-500">
                امتیاز ریسک
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {analytics.riskClients
              .slice(
                0,
                10
              )
              .map(
                (
                  client
                ) => (
                  <RiskRow
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

function HealthCard({
  analytics,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-center">
      <div
        className="flex h-36 w-36 items-center justify-center rounded-full p-3"
        style={{
          background:
            `conic-gradient(#4f46e5 ${analytics.healthScore * 3.6}deg, #e4e4e7 0deg)`,
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white shadow-inner">
          <span className="text-3xl font-black text-zinc-900">
            {analytics.healthScore.toLocaleString(
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
        سلامت مالی
      </p>

      <p className="mt-1 text-xs leading-5 text-zinc-500">
        ترکیبی از وصول، معوقات، هزینه‌ها و کیفیت تاریخ تراکنش‌ها
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
    FinancePeriodAnalytics['healthLevel']
}) {
  const config = {
    excellent: [
      'عالی',
      'bg-emerald-50 text-emerald-700 ring-emerald-200',
    ],

    good: [
      'خوب',
      'bg-blue-50 text-blue-700 ring-blue-200',
    ],

    attention: [
      'نیازمند توجه',
      'bg-amber-50 text-amber-700 ring-amber-200',
    ],

    critical: [
      'بحرانی',
      'bg-red-50 text-red-700 ring-red-200',
    ],
  } as const

  const [
    label,
    className,
  ] =
    config[level]

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${className}`}
    >
      امتیاز{' '}

      {score.toLocaleString(
        'fa-IR',
        {
          maximumFractionDigits:
            0,
        }
      )}
      /۱۰۰ · {label}
    </span>
  )
}

function ComparisonCard({
  title,
  value,
  change,
  icon: Icon,
  positiveIsGood,
}: {
  title: string
  value: number

  change:
    number | null

  icon:
    typeof TrendingUp

  positiveIsGood:
    boolean
}) {
  const isPositive =
    change !== null &&
    change >= 0

  const good =
    change === null
      ? true
      : positiveIsGood
        ? isPositive
        : !isPositive

  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
          <Icon
            size={17}
          />
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold ${
            change === null
              ? 'bg-zinc-100 text-zinc-500'
              : good
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
          }`}
        >
          {change === null
            ? 'بدون مبنا'
            : `${change >= 0 ? '+' : ''}${change.toLocaleString(
                'fa-IR',
                {
                  maximumFractionDigits:
                    1,
                }
              )}٪`}
        </span>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-black text-zinc-900">
        {formatMoney(
          value
        )}
      </p>

      <p className="mt-1 text-[11px] text-zinc-400">
        مقایسه با ماه قبل
      </p>
    </div>
  )
}

function InfoCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  description: string

  icon:
    typeof Users

  tone:
    | 'amber'
    | 'blue'
    | 'violet'
    | 'red'
}) {
  const classes = {
    amber:
      'bg-amber-50 text-amber-600',

    blue:
      'bg-blue-50 text-blue-600',

    violet:
      'bg-violet-50 text-violet-600',

    red:
      'bg-red-50 text-red-600',
  } as const

  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${classes[tone]}`}
      >
        <Icon
          size={17}
        />
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        {title}
      </p>

      <p className="mt-1 break-words text-lg font-black text-zinc-900">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-zinc-400">
        {description}
      </p>
    </div>
  )
}

function InsightCard({
  insight,
}: {
  insight:
    FinanceDecisionInsight
}) {
  const style = {
    success: [
      'border-emerald-200 bg-emerald-50',
      'text-emerald-600',
    ],

    info: [
      'border-blue-200 bg-blue-50',
      'text-blue-600',
    ],

    warning: [
      'border-amber-200 bg-amber-50',
      'text-amber-600',
    ],

    critical: [
      'border-red-200 bg-red-50',
      'text-red-600',
    ],
  } as const

  const [
    wrapper,
    icon,
  ] =
    style[
      insight.severity
    ]

  return (
    <article
      className={`rounded-xl border p-4 ${wrapper}`}
    >
      <div className="flex items-start gap-3">
        <ShieldAlert
          size={19}
          className={`mt-0.5 shrink-0 ${icon}`}
        />

        <div>
          <h4 className="font-black text-zinc-900">
            {insight.title}
          </h4>

          <p className="mt-1 text-xs leading-6 text-zinc-600">
            {insight.description}
          </p>

          {insight.amount !==
            undefined && (
            <p className="mt-2 text-sm font-black text-zinc-800">
              {formatMoney(
                insight.amount
              )}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

function SmallMetric({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-zinc-900">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-zinc-400">
        {sub}
      </p>
    </div>
  )
}

function Legend({
  className,
  label,
}: {
  className: string
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-2.5 w-2.5 rounded-full ${className}`}
      />

      {label}
    </span>
  )
}

function Bar({
  value,
  max,
  className,
  title,
}: {
  value: number
  max: number
  className: string
  title: string
}) {
  const height =
    value <= 0
      ? 0
      : Math.max(
          5,
          Math.min(
            100,
            (
              value /
              max
            ) *
              100
          )
        )

  return (
    <div
      title={title}
      className={`w-7 rounded-t-lg ${className}`}
      style={{
        height:
          `${height}%`,
      }}
    />
  )
}

function RiskRow({
  client,
}: {
  client:
    FinanceRiskClient
}) {
  const riskClass = {
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
        {client.clientName}
      </td>

      <td className="px-4 py-4 text-center font-semibold text-amber-700">
        {formatMoney(
          client.totalRemaining
        )}
      </td>

      <td className="px-4 py-4 text-center font-semibold text-red-700">
        {formatMoney(
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

function getAgingClass(
  key:
    FinancePeriodAnalytics['aging'][number]['key']
) {
  switch (key) {
    case 'not-due':
      return 'h-full rounded-full bg-blue-500'

    case '1-30':
      return 'h-full rounded-full bg-amber-400'

    case '31-60':
      return 'h-full rounded-full bg-orange-500'

    case '61-90':
      return 'h-full rounded-full bg-red-500'

    case '90-plus':
      return 'h-full rounded-full bg-red-700'

    default:
      return 'h-full rounded-full bg-zinc-400'
  }
}