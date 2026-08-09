
import type {
  ClientFinanceSummary,
  FinanceCaseSource,
  FinancialStats,
} from './types'

import {
  getNextDueDate,
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

export type AgingBucketKey =
  | 'not-due'
  | '1-30'
  | '31-60'
  | '61-90'
  | '90-plus'
  | 'unscheduled'

export interface AgingBucket {
  key: AgingBucketKey

  label: string

  amount: number

  caseCount: number

  percentage: number
}

export interface FinanceUpcomingDues {
  next7DaysAmount: number
  next7DaysCases: number

  next30DaysAmount: number
  next30DaysCases: number
}

export interface FinanceRiskClient {
  clientId?: string

  clientName: string

  totalFee: number
  totalPaid: number
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

export interface ReceivableConcentration {
  topClientShare: number
  top3ClientsShare: number

  topDebtorName?: string
  topDebtorAmount: number
}

export interface DataQualityMetrics {
  totalCases: number

  estimatedAllocationCases: number

  missingDueDateCases: number

  missingPaymentScheduleCases: number

  missingClientCases: number

  completenessScore: number
}

export interface FinanceActionInsight {
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

export interface FinancialAnalytics {
  healthScore: number

  healthLevel:
    FinanceHealthLevel

  collectionRate: number

  remainingRate: number

  overdueRate: number

  expenseRate: number

  aging: AgingBucket[]

  upcomingDues:
    FinanceUpcomingDues

  riskClients:
    FinanceRiskClient[]

  concentration:
    ReceivableConcentration

  dataQuality:
    DataQualityMetrics

  insights:
    FinanceActionInsight[]
}

interface BuildFinancialAnalyticsInput {
  caseItems:
    FinanceCaseSource[]

  clients:
    ClientFinanceSummary[]

  stats:
    FinancialStats

  now?: Date
}

interface OutstandingScheduleItem {
  caseId: string

  amount: number

  dueDate:
    Date | null
}



function startOfDay(
  value: Date
): Date {
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

function getDaysDifference(
  laterDate: Date,
  earlierDate: Date
): number {
  const millisecondsPerDay =
    24 *
    60 *
    60 *
    1000

  return Math.floor(
    (
      startOfDay(
        laterDate
      ).getTime() -
      startOfDay(
        earlierDate
      ).getTime()
    ) /
      millisecondsPerDay
  )
}


function getPaymentSchedule(
  caseItem:
    FinanceCaseSource
) {
  const cashPayments =
    caseItem.cashPayments
      ?.length
      ? caseItem.cashPayments
      : caseItem.installments ??
        []

  const cashSchedule =
    cashPayments.map(
      (payment) => ({
        amount:
          toFiniteNumber(
            payment.amount
          ),

        settled:
          Boolean(
            payment.isPaid
          ),

        dueDate:
          payment.dueDate ??
          payment.paymentDate,
      })
    )

  const nonCashSchedule =
    (
      caseItem.nonCashPayments ??
      []
    ).map(
      (payment) => ({
        amount:
          toFiniteNumber(
            payment.amount
          ),

        settled:
          Boolean(
            payment.isDelivered
          ),

        dueDate:
          payment.dueDate,
      })
    )

  return [
    ...cashSchedule,
    ...nonCashSchedule,
  ]
}


function getOutstandingSchedule(
  caseItem:
    FinanceCaseSource
): OutstandingScheduleItem[] {
  const remainingAmount =
    getRemainingAmount(
      caseItem
    )

  if (
    remainingAmount <= 0
  ) {
    return []
  }

  let remainingBudget =
    remainingAmount

  const result:
    OutstandingScheduleItem[] =
    []

  const unpaidPayments =
    getPaymentSchedule(
      caseItem
    )
      .filter(
        (payment) =>
          !payment.settled &&
          payment.amount >
            0
      )
      .sort(
        (
          first,
          second
        ) => {
          const firstDate =
            parseFinanceDate(
              first.dueDate
            )

          const secondDate =
            parseFinanceDate(
              second.dueDate
            )

          if (
            !firstDate &&
            !secondDate
          ) {
            return 0
          }

          if (!firstDate) {
            return 1
          }

          if (!secondDate) {
            return -1
          }

          return (
            firstDate.getTime() -
            secondDate.getTime()
          )
        }
      )

  for (
    const payment of
    unpaidPayments
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

    if (amount <= 0) {
      continue
    }

    result.push({
      caseId:
        caseItem.id,

      amount,

      dueDate:
        parseFinanceDate(
          payment.dueDate
        ),
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


function getAgingBucketKey(
  dueDate:
    Date | null,

  now: Date
): AgingBucketKey {
  if (!dueDate) {
    return 'unscheduled'
  }

  const daysOverdue =
    getDaysDifference(
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

function buildAgingBuckets(
  caseItems:
    FinanceCaseSource[],

  totalRemaining: number,

  now: Date
): AgingBucket[] {
  const definitions:
    Array<{
      key:
        AgingBucketKey

      label:
        string
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
          '۱ تا ۳۰ روز',
      },

      {
        key:
          '31-60',

        label:
          '۳۱ تا ۶۰ روز',
      },

      {
        key:
          '61-90',

        label:
          '۶۱ تا ۹۰ روز',
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

  const map =
    new Map<
      AgingBucketKey,
      {
        amount: number

        caseIds:
          Set<string>
      }
    >()

  for (
    const definition of
    definitions
  ) {
    map.set(
      definition.key,
      {
        amount: 0,

        caseIds:
          new Set(),
      }
    )
  }

  for (
    const caseItem of
    caseItems
  ) {
    const outstanding =
      getOutstandingSchedule(
        caseItem
      )

    for (
      const item of
      outstanding
    ) {
      const key =
        getAgingBucketKey(
          item.dueDate,
          now
        )

      const current =
        map.get(key)

      if (!current) {
        continue
      }

      current.amount +=
        item.amount

      current.caseIds.add(
        item.caseId
      )
    }
  }

  return definitions.map(
    (definition) => {
      const data =
        map.get(
          definition.key
        )!

      return {
        key:
          definition.key,

        label:
          definition.label,

        amount:
          data.amount,

        caseCount:
          data.caseIds.size,

        percentage:
          safePercentage(
            data.amount,
            totalRemaining
          ),
      }
    }
  )
}


function buildUpcomingDues(
  caseItems:
    FinanceCaseSource[],

  now: Date
): FinanceUpcomingDues {
  let next7DaysAmount =
    0

  let next30DaysAmount =
    0

  const next7CaseIds =
    new Set<string>()

  const next30CaseIds =
    new Set<string>()

  for (
    const caseItem of
    caseItems
  ) {
    const outstanding =
      getOutstandingSchedule(
        caseItem
      )

    for (
      const item of
      outstanding
    ) {
      if (!item.dueDate) {
        continue
      }

      const daysUntilDue =
        getDaysDifference(
          item.dueDate,
          now
        )

   
      if (
        daysUntilDue < 0
      ) {
        continue
      }

      if (
        daysUntilDue <=
        7
      ) {
        next7DaysAmount +=
          item.amount

        next7CaseIds.add(
          item.caseId
        )
      }

      if (
        daysUntilDue <=
        30
      ) {
        next30DaysAmount +=
          item.amount

        next30CaseIds.add(
          item.caseId
        )
      }
    }
  }

  return {
    next7DaysAmount,

    next7DaysCases:
      next7CaseIds.size,

    next30DaysAmount,

    next30DaysCases:
      next30CaseIds.size,
  }
}


function getRiskLevel(
  score: number
): FinanceRiskClient['level'] {
  if (score >= 80) {
    return 'critical'
  }

  if (score >= 60) {
    return 'high'
  }

  if (score >= 35) {
    return 'medium'
  }

  return 'low'
}

function buildRiskClients(
  clients:
    ClientFinanceSummary[]
): FinanceRiskClient[] {
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
      (
        client
      ): FinanceRiskClient => {
        const overdueRatio =
          safePercentage(
            client.totalOverdue,
            client.totalRemaining
          )

        const remainingWeight =
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
              remainingWeight *
                0.2
          )

        return {
          clientId:
            client.clientId,

          clientName:
            client.clientName,

          totalFee:
            client.totalFee,

          totalPaid:
            client.totalPaid,

          totalRemaining:
            client.totalRemaining,

          totalOverdue:
            client.totalOverdue,

          collectionRate:
            client.collectionRate,

          overdueRatio,

          riskScore,

          level:
            getRiskLevel(
              riskScore
            ),
        }
      }
    )
    .sort(
      (first, second) =>
        second.riskScore -
        first.riskScore
    )
}




function buildConcentration(
  clients:
    ClientFinanceSummary[]
): ReceivableConcentration {
  const totalRemaining =
    clients.reduce(
      (total, client) =>
        total +
        client.totalRemaining,
      0
    )

  const sorted =
    [...clients].sort(
      (first, second) =>
        second.totalRemaining -
        first.totalRemaining
    )

  const topClient =
    sorted[0]

  const top3Amount =
    sorted
      .slice(
        0,
        3
      )
      .reduce(
        (
          total,
          client
        ) =>
          total +
          client.totalRemaining,
        0
      )

  return {
    topClientShare:
      safePercentage(
        topClient
          ?.totalRemaining ??
          0,

        totalRemaining
      ),

    top3ClientsShare:
      safePercentage(
        top3Amount,
        totalRemaining
      ),

    topDebtorName:
      topClient
        ?.clientName,

    topDebtorAmount:
      topClient
        ?.totalRemaining ??
      0,
  }
}



function buildDataQuality(
  caseItems:
    FinanceCaseSource[],

  clients:
    ClientFinanceSummary[]
): DataQualityMetrics {
  const estimatedCaseIds =
    new Set<string>()

  for (
    const client of
    clients
  ) {
    for (
      const caseFinance of
      client.cases
    ) {
      if (
        caseFinance
          .allocationEstimated
      ) {
        estimatedCaseIds.add(
          caseFinance.caseId
        )
      }
    }
  }

  let missingDueDateCases =
    0

  let missingPaymentScheduleCases =
    0

  let missingClientCases =
    0

  for (
    const caseItem of
    caseItems
  ) {
    const remaining =
      getRemainingAmount(
        caseItem
      )

    if (
      remaining > 0 &&
      !getNextDueDate(
        caseItem
      )
    ) {
      missingDueDateCases +=
        1
    }

    const hasPaymentSchedule =
      getPaymentSchedule(
        caseItem
      ).some(
        (payment) =>
          !payment.settled &&
          payment.amount >
            0
      )

    if (
      remaining > 0 &&
      !hasPaymentSchedule
    ) {
      missingPaymentScheduleCases +=
        1
    }

    const hasClient =
      Boolean(
        caseItem.clientId ||
        caseItem.clientName ||
        caseItem.clients?.some(
          (client) =>
            client.clientId ||
            client.name
        )
      )

    if (!hasClient) {
      missingClientCases +=
        1
    }
  }

  const totalCases =
    caseItems.length

  const issueCount =
    estimatedCaseIds.size +
    missingDueDateCases +
    missingPaymentScheduleCases +
    missingClientCases

  const maximumIssues =
    Math.max(
      totalCases * 4,
      1
    )

  const completenessScore =
    clampPercentage(
      100 -
        (
          issueCount /
          maximumIssues
        ) *
          100
    )

  return {
    totalCases,

    estimatedAllocationCases:
      estimatedCaseIds.size,

    missingDueDateCases,

    missingPaymentScheduleCases,

    missingClientCases,

    completenessScore,
  }
}


function getHealthLevel(
  score: number
): FinanceHealthLevel {
  if (score >= 85) {
    return 'excellent'
  }

  if (score >= 70) {
    return 'good'
  }

  if (score >= 50) {
    return 'attention'
  }

  return 'critical'
}




function buildInsights({
  stats,
  overdueRate,
  upcomingDues,
  concentration,
  dataQuality,
  riskClients,
}: {
  stats:
    FinancialStats

  overdueRate:
    number

  upcomingDues:
    FinanceUpcomingDues

  concentration:
    ReceivableConcentration

  dataQuality:
    DataQualityMetrics

  riskClients:
    FinanceRiskClient[]
}): FinanceActionInsight[] {
  const insights:
    FinanceActionInsight[] =
    []

  if (
    stats.totalOverdue > 0
  ) {
    insights.push({
      id:
        'overdue',

      severity:
        overdueRate >= 40
          ? 'critical'
          : 'warning',

      title:
        'پیگیری مطالبات معوق',

      description:
        `${overdueRate.toLocaleString(
          'fa-IR',
          {
            maximumFractionDigits:
              1,
          }
        )}٪ از کل مطالبات باقی‌مانده وارد وضعیت معوق شده است.`,

      amount:
        stats.totalOverdue,
    })
  }

  if (
    upcomingDues.next7DaysAmount >
    0
  ) {
    insights.push({
      id:
        'next-seven-days',

      severity:
        'warning',

      title:
        'سررسیدهای ۷ روز آینده',

      description:
        `${upcomingDues.next7DaysCases.toLocaleString(
          'fa-IR'
        )} پرونده در هفت روز آینده سررسید مالی دارد.`,

      amount:
        upcomingDues.next7DaysAmount,

      count:
        upcomingDues.next7DaysCases,
    })
  }

  if (
    stats.collectionRate <
      50 &&
    stats.totalRevenue >
      0
  ) {
    insights.push({
      id:
        'low-collection',

      severity:
        'critical',

      title:
        'نرخ وصول پایین است',

      description:
        'کمتر از نیمی از ارزش قراردادها وصول شده است. بهتر است برنامه پیگیری وصول برای پرونده‌های با مانده بالا در اولویت قرار گیرد.',
    })
  } else if (
    stats.collectionRate <
      70 &&
    stats.totalRevenue >
      0
  ) {
    insights.push({
      id:
        'collection-attention',

      severity:
        'warning',

      title:
        'ظرفیت بهبود وصول',

      description:
        'نرخ وصول هنوز زیر ۷۰٪ است. تمرکز روی موکلین دارای مانده بالا می‌تواند جریان نقدی دفتر را بهبود دهد.',
    })
  }

  if (
    concentration.topClientShare >=
      50 &&
    concentration
      .topDebtorAmount >
      0
  ) {
    insights.push({
      id:
        'concentration',

      severity:
        'warning',

      title:
        'تمرکز بالای مطالبات',

      description:
        `بخش بزرگی از مطالبات دفتر مربوط به ${concentration.topDebtorName ?? 'یک موکل'} است. وابستگی وصول به یک بدهکار، ریسک جریان نقدی را افزایش می‌دهد.`,

      amount:
        concentration.topDebtorAmount,
    })
  }

  if (
    riskClients.some(
      (client) =>
        client.level ===
        'critical'
    )
  ) {
    const criticalCount =
      riskClients.filter(
        (client) =>
          client.level ===
          'critical'
      ).length

    insights.push({
      id:
        'critical-clients',

      severity:
        'critical',

      title:
        'موکلین با ریسک مالی بالا',

      description:
        `${criticalCount.toLocaleString(
          'fa-IR'
        )} موکل در سطح ریسک بحرانی قرار دارند و بهتر است در اولویت پیگیری قرار گیرند.`,

      count:
        criticalCount,
    })
  }

  if (
    dataQuality
      .estimatedAllocationCases >
    0
  ) {
    insights.push({
      id:
        'estimated-allocations',

      severity:
        'info',

      title:
        'سهم‌های تخمینی موکلین',

      description:
        `در ${dataQuality.estimatedAllocationCases.toLocaleString(
          'fa-IR'
        )} پرونده، سهم حق‌الوکاله موکلین به‌صورت تخمینی محاسبه شده است. بهتر است این پرونده‌ها اصلاح شوند.`,
    })
  }

  if (
    dataQuality
      .missingDueDateCases >
    0
  ) {
    insights.push({
      id:
        'missing-due-dates',

      severity:
        'info',

      title:
        'مطالبات بدون تاریخ سررسید',

      description:
        `${dataQuality.missingDueDateCases.toLocaleString(
          'fa-IR'
        )} پرونده دارای مانده مالی هستند ولی سررسید مشخص ندارند.`,
    })
  }

  if (
    insights.length ===
    0
  ) {
    insights.push({
      id:
        'healthy',

      severity:
        'success',

      title:
        'وضعیت مالی پایدار است',

      description:
        'در حال حاضر مورد بحرانی قابل توجهی در داده‌های مالی ثبت‌شده مشاهده نمی‌شود.',
    })
  }

  return insights
}



export function buildFinancialAnalytics({
  caseItems,
  clients,
  stats,
  now = new Date(),
}: BuildFinancialAnalyticsInput): FinancialAnalytics {
  const overdueRate =
    safePercentage(
      stats.totalOverdue,
      stats.totalRemaining
    )

  const remainingRate =
    safePercentage(
      stats.totalRemaining,
      stats.totalRevenue
    )

  const expenseRate =
    safePercentage(
      stats.totalExpenses,
      stats.totalReceived
    )

  const aging =
    buildAgingBuckets(
      caseItems,
      stats.totalRemaining,
      now
    )

  const upcomingDues =
    buildUpcomingDues(
      caseItems,
      now
    )

  const riskClients =
    buildRiskClients(
      clients
    )

  const concentration =
    buildConcentration(
      clients
    )

  const dataQuality =
    buildDataQuality(
      caseItems,
      clients
    )

    
  const healthScore =
    clampPercentage(
      stats.collectionRate *
        0.5 +
        (
          100 -
          overdueRate
        ) *
          0.3 +
        (
          100 -
          Math.min(
            expenseRate,
            100
          )
        ) *
          0.1 +
        dataQuality
          .completenessScore *
          0.1
    )

  const healthLevel =
    getHealthLevel(
      healthScore
    )

  const insights =
    buildInsights({
      stats,
      overdueRate,
      upcomingDues,
      concentration,
      dataQuality,
      riskClients,
    })

  return {
    healthScore,

    healthLevel,

    collectionRate:
      stats.collectionRate,

    remainingRate,

    overdueRate,

    expenseRate,

    aging,

    upcomingDues,

    riskClients,

    concentration,

    dataQuality,

    insights,
  }
}