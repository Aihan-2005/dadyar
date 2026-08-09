import type {
  ClientFinanceSummary,
  FinanceCaseSource,
  FinancialStats,
} from './types'

import {
  getPaidAmount,
  getRemainingAmount,
} from './calculations'

import {
  parseFinanceDate,
} from '../utils/date'

import {
  clampPercentage,
  safePercentage,
  toFiniteNumber,
} from '../utils/number'

export type FinanceHealthLevel =
  | 'excellent'
  | 'good'
  | 'attention'
  | 'critical'

export type FinanceAgingBucketKey =
  | 'not-due'
  | '1-30'
  | '31-60'
  | '61-90'
  | '90-plus'
  | 'unscheduled'

export interface MonthlyCashflowPoint {
  monthKey: string
  label: string

  received: number
  expenses: number
  net: number

  paymentCount: number
  expenseCount: number
}

export interface FinanceMonthSnapshot {
  label: string

  received: number
  expenses: number
  net: number

  paymentCount: number
  expenseCount: number
}

export interface FinanceAgingBucket {
  key:
    FinanceAgingBucketKey

  label: string

  amount: number
  caseCount: number
  percentage: number
}

export interface FinanceRiskClient {
  clientId?: string
  clientName: string

  totalRemaining: number
  totalOverdue: number

  collectionRate: number
  overdueRatio: number

  riskScore: number

  level:
    | 'low'
    | 'medium'
    | 'high'
    | 'critical'
}

export interface FinanceDecisionInsight {
  id: string

  severity:
    | 'success'
    | 'info'
    | 'warning'
    | 'critical'

  title: string
  description: string

  amount?: number
  count?: number
}

export interface FinancePeriodAnalytics {
  healthScore: number

  healthLevel:
    FinanceHealthLevel

  monthlyCashflow:
    MonthlyCashflowPoint[]

  currentMonth:
    FinanceMonthSnapshot

  previousMonth:
    FinanceMonthSnapshot

  receivedChangePercent:
    number | null

  expenseChangePercent:
    number | null

  netChangePercent:
    number | null

  aging:
    FinanceAgingBucket[]

  upcoming7DaysAmount:
    number

  upcoming7DaysCases:
    number

  upcoming30DaysAmount:
    number

  upcoming30DaysCases:
    number

  riskClients:
    FinanceRiskClient[]

  topDebtorName?: string

  topDebtorAmount:
    number

  topDebtorShare:
    number

  unattributedReceivedAmount:
    number

  unattributedExpenseAmount:
    number

  insights:
    FinanceDecisionInsight[]
}

interface BuildInput {
  caseItems:
    FinanceCaseSource[]

  clients:
    ClientFinanceSummary[]

  stats:
    FinancialStats

  now?: Date
  monthCount?: number
}

interface DatedAmount {
  caseId: string
  amount: number
  date: Date
}

interface OutstandingAmount {
  caseId: string
  amount: number
  dueDate:
    Date | null
}

function startOfDay(
  value: Date
) {
  const result =
    new Date(
      value.getTime()
    )

  result.setHours(
    0,
    0,
    0,
    0
  )

  return result
}

function startOfMonth(
  value: Date
) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    1,
    0,
    0,
    0,
    0
  )
}

function addMonths(
  value: Date,
  months: number
) {
  return new Date(
    value.getFullYear(),
    value.getMonth() +
      months,
    1
  )
}

function monthKey(
  value: Date
) {
  return `${value.getFullYear()}-${String(
    value.getMonth() + 1
  ).padStart(
    2,
    '0'
  )}`
}

function monthLabel(
  value: Date
) {
  return new Intl.DateTimeFormat(
    'fa-IR-u-ca-persian',
    {
      month: 'short',
      year: 'numeric',
    }
  ).format(value)
}

function daysDifference(
  laterDate: Date,
  earlierDate: Date
) {
  return Math.floor(
    (
      startOfDay(
        laterDate
      ).getTime() -
      startOfDay(
        earlierDate
      ).getTime()
    ) /
      (
        24 *
        60 *
        60 *
        1000
      )
  )
}

function changePercent(
  current: number,
  previous: number
): number | null {
  if (previous === 0) {
    return current === 0
      ? 0
      : null
  }

  return (
    (
      current -
      previous
    ) /
    Math.abs(
      previous
    )
  ) * 100
}

function cashPayments(
  caseItem:
    FinanceCaseSource
) {
  return caseItem
    .cashPayments?.length
    ? caseItem.cashPayments
    : caseItem.installments ??
        []
}

function datedReceipts(
  caseItems:
    FinanceCaseSource[]
) {
  const items:
    DatedAmount[] = []

  let unattributedAmount =
    0

  for (
    const caseItem of
    caseItems
  ) {
    const payments =
      cashPayments(
        caseItem
      )

    for (
      const payment of
      payments
    ) {
      if (
        !payment.isPaid
      ) {
        continue
      }

      const amount =
        Math.max(
          toFiniteNumber(
            payment.amount
          ),
          0
        )

      if (
        amount <= 0
      ) {
        continue
      }

      const date =
        parseFinanceDate(
          payment.paidDate ??
            payment.paymentDate
        )

      if (!date) {
        unattributedAmount +=
          amount

        continue
      }

      items.push({
        caseId:
          caseItem.id,

        amount,
        date,
      })
    }

    const detailedPaid =
      payments.reduce(
        (
          sum,
          payment
        ) =>
          payment.isPaid
            ? sum +
              Math.max(
                toFiniteNumber(
                  payment.amount
                ),
                0
              )
            : sum,
        0
      )

    unattributedAmount +=
      Math.max(
        getPaidAmount(
          caseItem
        ) -
          detailedPaid,
        0
      )
  }

  return {
    items,
    unattributedAmount,
  }
}

function datedExpenses(
  caseItems:
    FinanceCaseSource[]
) {
  const items:
    DatedAmount[] = []

  let unattributedAmount =
    0

  for (
    const caseItem of
    caseItems
  ) {
    for (
      const expense of
      caseItem.expenses ??
      []
    ) {
      if (
        expense.isPaid ===
        false
      ) {
        continue
      }

      const amount =
        Math.max(
          toFiniteNumber(
            expense.amount
          ),
          0
        )

      if (
        amount <= 0
      ) {
        continue
      }

      const date =
        parseFinanceDate(
          expense.date
        )

      if (!date) {
        unattributedAmount +=
          amount

        continue
      }

      items.push({
        caseId:
          caseItem.id,

        amount,
        date,
      })
    }
  }

  return {
    items,
    unattributedAmount,
  }
}

function buildMonthlyCashflow(
  receipts:
    DatedAmount[],

  expenses:
    DatedAmount[],

  now: Date,

  monthCount: number
) {
  const count =
    Math.min(
      Math.max(
        monthCount,
        2
      ),
      24
    )

  const firstMonth =
    addMonths(
      startOfMonth(now),
      -(
        count - 1
      )
    )

  const points =
    Array.from(
      {
        length: count,
      },

      (
        _,
        index
      ) => {
        const date =
          addMonths(
            firstMonth,
            index
          )

        return {
          monthKey:
            monthKey(date),

          label:
            monthLabel(date),

          received: 0,
          expenses: 0,
          net: 0,

          paymentCount: 0,
          expenseCount: 0,
        } satisfies MonthlyCashflowPoint
      }
    )

  const map =
    new Map(
      points.map(
        (point) => [
          point.monthKey,
          point,
        ]
      )
    )

  for (
    const receipt of
    receipts
  ) {
    const point =
      map.get(
        monthKey(
          receipt.date
        )
      )

    if (!point) {
      continue
    }

    point.received +=
      receipt.amount

    point.paymentCount +=
      1
  }

  for (
    const expense of
    expenses
  ) {
    const point =
      map.get(
        monthKey(
          expense.date
        )
      )

    if (!point) {
      continue
    }

    point.expenses +=
      expense.amount

    point.expenseCount +=
      1
  }

  points.forEach(
    (point) => {
      point.net =
        point.received -
        point.expenses
    }
  )

  return points
}

function outstandingSchedule(
  caseItem:
    FinanceCaseSource
): OutstandingAmount[] {
  const remaining =
    getRemainingAmount(
      caseItem
    )

  if (
    remaining <= 0
  ) {
    return []
  }

  let remainingBudget =
    remaining

  const result:
    OutstandingAmount[] =
    []

  const unpaid =
    cashPayments(
      caseItem
    )
      .filter(
        (payment) =>
          !payment.isPaid &&
          toFiniteNumber(
            payment.amount
          ) > 0
      )
      .map(
        (payment) => ({
          amount:
            Math.max(
              toFiniteNumber(
                payment.amount
              ),
              0
            ),

          dueDate:
            parseFinanceDate(
              payment.dueDate ??
                payment.paymentDate
            ),
        })
      )
      .sort(
        (a, b) => {
          if (
            !a.dueDate &&
            !b.dueDate
          ) {
            return 0
          }

          if (
            !a.dueDate
          ) {
            return 1
          }

          if (
            !b.dueDate
          ) {
            return -1
          }

          return (
            a.dueDate.getTime() -
            b.dueDate.getTime()
          )
        }
      )

  for (
    const payment of
    unpaid
  ) {
    if (
      remainingBudget <=
      0
    ) {
      break
    }

    const amount =
      Math.min(
        payment.amount,
        remainingBudget
      )

    result.push({
      caseId:
        caseItem.id,

      amount,

      dueDate:
        payment.dueDate,
    })

    remainingBudget -=
      amount
  }

  if (
    remainingBudget > 0
  ) {
    result.push({
      caseId:
        caseItem.id,

      amount:
        remainingBudget,

      dueDate:
        parseFinanceDate(
          caseItem.dueDate
        ),
    })
  }

  return result
}

function agingKey(
  dueDate:
    Date | null,

  now: Date
): FinanceAgingBucketKey {
  if (!dueDate) {
    return 'unscheduled'
  }

  const daysOverdue =
    daysDifference(
      now,
      dueDate
    )

  if (
    daysOverdue <= 0
  ) {
    return 'not-due'
  }

  if (
    daysOverdue <= 30
  ) {
    return '1-30'
  }

  if (
    daysOverdue <= 60
  ) {
    return '31-60'
  }

  if (
    daysOverdue <= 90
  ) {
    return '61-90'
  }

  return '90-plus'
}

function buildAging(
  caseItems:
    FinanceCaseSource[],

  totalRemaining:
    number,

  now: Date
) {
  const definitions:
    Array<{
      key:
        FinanceAgingBucketKey

      label: string
    }> = [
      {
        key:
          'not-due',

        label:
          'سررسید نشده',
      },

      {
        key:
          '1-30',

        label:
          '۱ تا ۳۰ روز معوق',
      },

      {
        key:
          '31-60',

        label:
          '۳۱ تا ۶۰ روز معوق',
      },

      {
        key:
          '61-90',

        label:
          '۶۱ تا ۹۰ روز معوق',
      },

      {
        key:
          '90-plus',

        label:
          'بیش از ۹۰ روز',
      },

      {
        key:
          'unscheduled',

        label:
          'بدون سررسید',
      },
    ]

  const buckets =
    new Map<
      FinanceAgingBucketKey,
      {
        amount: number

        caseIds:
          Set<string>
      }
    >()

  definitions.forEach(
    (item) =>
      buckets.set(
        item.key,
        {
          amount: 0,

          caseIds:
            new Set(),
        }
      )
  )

  for (
    const caseItem of
    caseItems
  ) {
    for (
      const item of
      outstandingSchedule(
        caseItem
      )
    ) {
      const bucket =
        buckets.get(
          agingKey(
            item.dueDate,
            now
          )
        )!

      bucket.amount +=
        item.amount

      bucket.caseIds.add(
        item.caseId
      )
    }
  }

  return definitions.map(
    (definition) => {
      const bucket =
        buckets.get(
          definition.key
        )!

      return {
        ...definition,

        amount:
          bucket.amount,

        caseCount:
          bucket.caseIds.size,

        percentage:
          safePercentage(
            bucket.amount,
            totalRemaining
          ),
      }
    }
  )
}

function buildUpcoming(
  caseItems:
    FinanceCaseSource[],

  now: Date
) {
  let next7Amount = 0
  let next30Amount = 0

  const next7Cases =
    new Set<string>()

  const next30Cases =
    new Set<string>()

  for (
    const caseItem of
    caseItems
  ) {
    for (
      const item of
      outstandingSchedule(
        caseItem
      )
    ) {
      if (
        !item.dueDate
      ) {
        continue
      }

      const days =
        daysDifference(
          item.dueDate,
          now
        )

      if (
        days < 0
      ) {
        continue
      }

      if (
        days <= 7
      ) {
        next7Amount +=
          item.amount

        next7Cases.add(
          item.caseId
        )
      }

      if (
        days <= 30
      ) {
        next30Amount +=
          item.amount

        next30Cases.add(
          item.caseId
        )
      }
    }
  }

  return {
    next7Amount,

    next7Cases:
      next7Cases.size,

    next30Amount,

    next30Cases:
      next30Cases.size,
  }
}

function riskLevel(
  score: number
): FinanceRiskClient['level'] {
  if (
    score >= 80
  ) {
    return 'critical'
  }

  if (
    score >= 60
  ) {
    return 'high'
  }

  if (
    score >= 35
  ) {
    return 'medium'
  }

  return 'low'
}

function buildRiskClients(
  clients:
    ClientFinanceSummary[]
) {
  const maxRemaining =
    Math.max(
      ...clients.map(
        (client) =>
          client.totalRemaining
      ),
      1
    )

  return clients
    .filter(
      (client) =>
        client.totalRemaining >
        0
    )
    .map(
      (client) => {
        const overdueRatio =
          safePercentage(
            client.totalOverdue,
            client.totalRemaining
          )

        const sizeScore =
          safePercentage(
            client.totalRemaining,
            maxRemaining
          )

        const riskScore =
          clampPercentage(
            overdueRatio *
              0.5 +
              (
                100 -
                client.collectionRate
              ) *
                0.3 +
              sizeScore *
                0.2
          )

        return {
          clientId:
            client.clientId,

          clientName:
            client.clientName,

          totalRemaining:
            client.totalRemaining,

          totalOverdue:
            client.totalOverdue,

          collectionRate:
            client.collectionRate,

          overdueRatio,

          riskScore,

          level:
            riskLevel(
              riskScore
            ),
        } satisfies FinanceRiskClient
      }
    )
    .sort(
      (a, b) =>
        b.riskScore -
        a.riskScore
    )
}

function healthLevel(
  score: number
): FinanceHealthLevel {
  if (
    score >= 85
  ) {
    return 'excellent'
  }

  if (
    score >= 70
  ) {
    return 'good'
  }

  if (
    score >= 50
  ) {
    return 'attention'
  }

  return 'critical'
}

function buildInsights(
  args: {
    stats:
      FinancialStats

    riskClients:
      FinanceRiskClient[]

    upcoming:
      ReturnType<
        typeof buildUpcoming
      >

    currentMonth:
      FinanceMonthSnapshot

    previousMonth:
      FinanceMonthSnapshot

    topDebtorName?:
      string

    topDebtorAmount:
      number

    topDebtorShare:
      number

    unattributedReceivedAmount:
      number

    unattributedExpenseAmount:
      number
  }
) {
  const insights:
    FinanceDecisionInsight[] =
    []

  const overdueShare =
    safePercentage(
      args.stats.totalOverdue,
      args.stats.totalRemaining
    )

  if (
    args.stats.totalOverdue >
    0
  ) {
    insights.push({
      id:
        'overdue-follow-up',

      severity:
        overdueShare >= 40
          ? 'critical'
          : 'warning',

      title:
        'پیگیری مطالبات معوق',

      description:
        `${overdueShare.toLocaleString(
          'fa-IR',
          {
            maximumFractionDigits:
              1,
          }
        )}٪ از مانده مطالبات در وضعیت معوق قرار دارد.`,

      amount:
        args.stats
          .totalOverdue,
    })
  }

  if (
    args.upcoming
      .next7Amount > 0
  ) {
    insights.push({
      id:
        'next-seven-days',

      severity:
        'warning',

      title:
        'سررسیدهای نزدیک',

      description:
        `${args.upcoming.next7Cases.toLocaleString(
          'fa-IR'
        )} پرونده در ۷ روز آینده سررسید مالی دارند.`,

      amount:
        args.upcoming
          .next7Amount,

      count:
        args.upcoming
          .next7Cases,
    })
  }

  const criticalCount =
    args.riskClients.filter(
      (client) =>
        client.level ===
        'critical'
    ).length

  if (
    criticalCount > 0
  ) {
    insights.push({
      id:
        'critical-clients',

      severity:
        'critical',

      title:
        'موکلین با ریسک بحرانی',

      description:
        `${criticalCount.toLocaleString(
          'fa-IR'
        )} موکل در اولویت پیگیری مالی هستند.`,

      count:
        criticalCount,
    })
  }

  if (
    args.topDebtorShare >=
      50 &&
    args.topDebtorAmount >
      0
  ) {
    insights.push({
      id:
        'receivable-concentration',

      severity:
        'warning',

      title:
        'تمرکز بالای مطالبات',

      description:
        `${args.topDebtorShare.toLocaleString(
          'fa-IR',
          {
            maximumFractionDigits:
              1,
          }
        )}٪ از مانده مطالبات مربوط به ${args.topDebtorName ?? 'یک موکل'} است.`,

      amount:
        args.topDebtorAmount,
    })
  }

  if (
    args.currentMonth.net <
    0
  ) {
    insights.push({
      id:
        'negative-month-net',

      severity:
        'critical',

      title:
        'جریان نقدی ماه جاری منفی است',

      description:
        'هزینه‌های دارای تاریخ ماه جاری از دریافتی‌های دارای تاریخ بیشتر شده‌اند.',

      amount:
        Math.abs(
          args.currentMonth.net
        ),
    })
  } else if (
    args.previousMonth
      .received > 0 &&
    args.currentMonth
      .received <
      args.previousMonth
        .received *
        0.7
  ) {
    insights.push({
      id:
        'collection-drop',

      severity:
        'warning',

      title:
        'افت دریافتی نسبت به ماه قبل',

      description:
        'دریافتی ثبت‌شده ماه جاری نسبت به ماه قبل کاهش معناداری داشته است.',
    })
  }

  if (
    args.unattributedReceivedAmount >
      0 ||
    args.unattributedExpenseAmount >
      0
  ) {
    insights.push({
      id:
        'missing-transaction-dates',

      severity:
        'info',

      title:
        'تراکنش‌های بدون تاریخ دقیق',

      description:
        'بخشی از مبالغ تاریخ قابل استفاده ندارند و در نمودار ماهانه وارد نشده‌اند.',

      amount:
        args.unattributedReceivedAmount +
        args.unattributedExpenseAmount,
    })
  }

  if (
    insights.length ===
    0
  ) {
    insights.push({
      id:
        'stable-finance',

      severity:
        'success',

      title:
        'وضعیت مالی پایدار است',

      description:
        'در محدوده فعلی گزارش، هشدار مالی مهمی شناسایی نشده است.',
    })
  }

  return insights
}

export function buildFinancePeriodAnalytics({
  caseItems,
  clients,
  stats,
  now = new Date(),
  monthCount = 6,
}: BuildInput): FinancePeriodAnalytics {
  const receipts =
    datedReceipts(
      caseItems
    )

  const expenses =
    datedExpenses(
      caseItems
    )

  const monthlyCashflow =
    buildMonthlyCashflow(
      receipts.items,
      expenses.items,
      now,
      monthCount
    )

  const fallbackPoint:
    MonthlyCashflowPoint = {
      monthKey: '',
      label: '',

      received: 0,
      expenses: 0,
      net: 0,

      paymentCount: 0,
      expenseCount: 0,
    }

  const currentPoint =
    monthlyCashflow.at(
      -1
    ) ?? fallbackPoint

  const previousPoint =
    monthlyCashflow.at(
      -2
    ) ?? fallbackPoint

  const currentMonth:
    FinanceMonthSnapshot = {
      label:
        currentPoint.label,

      received:
        currentPoint.received,

      expenses:
        currentPoint.expenses,

      net:
        currentPoint.net,

      paymentCount:
        currentPoint
          .paymentCount,

      expenseCount:
        currentPoint
          .expenseCount,
    }

  const previousMonth:
    FinanceMonthSnapshot = {
      label:
        previousPoint.label,

      received:
        previousPoint.received,

      expenses:
        previousPoint.expenses,

      net:
        previousPoint.net,

      paymentCount:
        previousPoint
          .paymentCount,

      expenseCount:
        previousPoint
          .expenseCount,
    }

  const aging =
    buildAging(
      caseItems,
      stats.totalRemaining,
      now
    )

  const upcoming =
    buildUpcoming(
      caseItems,
      now
    )

  const riskClients =
    buildRiskClients(
      clients
    )

  const debtors =
    [...clients]
      .filter(
        (client) =>
          client.totalRemaining >
          0
      )
      .sort(
        (a, b) =>
          b.totalRemaining -
          a.totalRemaining
      )

  const topDebtor =
    debtors[0]

  const topDebtorAmount =
    topDebtor
      ?.totalRemaining ??
    0

  const topDebtorShare =
    safePercentage(
      topDebtorAmount,
      stats.totalRemaining
    )

  const overdueShare =
    safePercentage(
      stats.totalOverdue,
      stats.totalRemaining
    )

  const expenseShare =
    safePercentage(
      stats.totalExpenses,
      stats.totalReceived
    )

  const confidencePenalty =
    Math.min(
      20,

      safePercentage(
        receipts.unattributedAmount +
          expenses.unattributedAmount,

        Math.max(
          stats.totalReceived +
            stats.totalExpenses,
          1
        )
      ) *
        0.2
    )

  const healthScore =
    clampPercentage(
      stats.collectionRate *
        0.5 +
        (
          100 -
          overdueShare
        ) *
          0.3 +
        (
          100 -
          Math.min(
            expenseShare,
            100
          )
        ) *
          0.2 -
        confidencePenalty
    )

  const insights =
    buildInsights({
      stats,
      riskClients,
      upcoming,

      currentMonth,
      previousMonth,

      topDebtorName:
        topDebtor
          ?.clientName,

      topDebtorAmount,
      topDebtorShare,

      unattributedReceivedAmount:
        receipts.unattributedAmount,

      unattributedExpenseAmount:
        expenses.unattributedAmount,
    })

  return {
    healthScore,

    healthLevel:
      healthLevel(
        healthScore
      ),

    monthlyCashflow,

    currentMonth,
    previousMonth,

    receivedChangePercent:
      changePercent(
        currentMonth.received,
        previousMonth.received
      ),

    expenseChangePercent:
      changePercent(
        currentMonth.expenses,
        previousMonth.expenses
      ),

    netChangePercent:
      changePercent(
        currentMonth.net,
        previousMonth.net
      ),

    aging,

    upcoming7DaysAmount:
      upcoming.next7Amount,

    upcoming7DaysCases:
      upcoming.next7Cases,

    upcoming30DaysAmount:
      upcoming.next30Amount,

    upcoming30DaysCases:
      upcoming.next30Cases,

    riskClients,

    topDebtorName:
      topDebtor
        ?.clientName,

    topDebtorAmount,
    topDebtorShare,

    unattributedReceivedAmount:
      receipts.unattributedAmount,

    unattributedExpenseAmount:
      expenses.unattributedAmount,

    insights,
  }
}