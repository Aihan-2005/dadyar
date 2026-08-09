import type {
  FinanceCaseSource,
  FinanceOverview,
  FinancePaymentStatus,
} from '../domain/types'

import type {
  FinancePeriodAnalytics,
} from '../domain/period-analytics'

import type {
  FinanceReportFilters,
} from '../domain/filters'

import {
  buildCaseFinance,
} from '../domain/selectors'

import type {
  FinanceCaseExportRow,
  FinanceClientCaseExportRow,
  FinanceClientExportRow,
  FinanceExportMode,
  FinanceExportReport,
} from './types'

interface BuildFinanceExportReportInput {
  mode: FinanceExportMode

  sourceCaseCount: number

  caseItems:
    FinanceCaseSource[]

  overview:
    FinanceOverview

  analytics:
    FinancePeriodAnalytics

  filters:
    FinanceReportFilters
}

const PERIOD_LABELS:
  Record<
    FinanceReportFilters['periodPreset'],
    string
  > = {
    all:
      'همه زمان‌ها',

    'this-month':
      'این ماه',

    'last-month':
      'ماه قبل',

    'last-90-days':
      '۹۰ روز اخیر',

    'this-year':
      'سال جاری',

    custom:
      'بازه سفارشی',
  }

const STATUS_LABELS:
  Record<
    FinanceReportFilters['paymentStatus'],
    string
  > = {
    all:
      'همه وضعیت‌ها',

    paid:
      'تسویه‌شده',

    partial:
      'پرداخت جزئی',

    unpaid:
      'بدون پرداخت',

    overdue:
      'معوق',
  }

export function getFinanceStatusLabel(
  status:
    FinancePaymentStatus
): string {
  switch (status) {
    case 'paid':
      return 'تسویه‌شده'

    case 'partial':
      return 'پرداخت جزئی'

    case 'overdue':
      return 'معوق'

    case 'unpaid':
    default:
      return 'بدون پرداخت'
  }
}

function buildFilterLabels(
  filters:
    FinanceReportFilters
): string[] {
  const result: string[] =
    []

  if (
    filters.query.trim()
  ) {
    result.push(
      `جست‌وجو: ${filters.query.trim()}`
    )
  }

  if (
    filters.periodPreset !==
    'all'
  ) {
    if (
      filters.periodPreset ===
      'custom'
    ) {
      const from =
        filters.fromDate?.trim()

      const to =
        filters.toDate?.trim()

      if (
        from ||
        to
      ) {
        result.push(
          `بازه: ${from || 'ابتدا'} تا ${to || 'امروز'}`
        )
      } else {
        result.push(
          PERIOD_LABELS.custom
        )
      }
    } else {
      result.push(
        PERIOD_LABELS[
          filters.periodPreset
        ]
      )
    }
  }

  if (
    filters.paymentStatus !==
    'all'
  ) {
    result.push(
      `وضعیت: ${
        STATUS_LABELS[
          filters.paymentStatus
        ]
      }`
    )
  }

  if (
    filters.selectedCaseIds
      .length > 0
  ) {
    result.push(
      `${filters.selectedCaseIds.length.toLocaleString(
        'fa-IR'
      )} پرونده انتخاب‌شده`
    )
  }

  if (
    filters.selectedClientKeys
      .length > 0
  ) {
    result.push(
      `${filters.selectedClientKeys.length.toLocaleString(
        'fa-IR'
      )} موکل انتخاب‌شده`
    )
  }

  if (
    result.length === 0
  ) {
    result.push(
      'بدون فیلتر — تمام اطلاعات'
    )
  }

  return result
}

function getCaseClientNames(
  caseItem:
    FinanceCaseSource
): string {
  const names =
    new Set<string>()

  for (
    const client of
    caseItem.clients ?? []
  ) {
    const name =
      client.name?.trim()

    if (name) {
      names.add(name)
    }
  }

  if (
    names.size === 0 &&
    caseItem.clientName?.trim()
  ) {
    names.add(
      caseItem.clientName.trim()
    )
  }

  if (
    names.size === 0
  ) {
    return 'موکل نامشخص'
  }

  return [
    ...names,
  ].join('، ')
}

function buildCaseRows(
  caseItems:
    FinanceCaseSource[]
): FinanceCaseExportRow[] {
  return caseItems.map(
    (caseItem) => {
      const finance =
        buildCaseFinance(
          caseItem
        )

      return {
        caseId:
          finance.caseId,

        caseNumber:
          finance.caseNumber,

        caseTitle:
          finance.caseTitle,

        clientNames:
          getCaseClientNames(
            caseItem
          ),

        contractAmount:
          finance.totalFee,

        paidAmount:
          finance.paidAmount,

        remainingAmount:
          finance.remainingDebt,

        overdueAmount:
          finance.overdueAmount,

        expensesAmount:
          finance.expensesAmount,

        collectionRate:
          finance.collectionRate,

        status:
          finance.status,

        dueDate:
          finance.dueDate,

        lastPaymentDate:
          finance.lastPaymentDate,
      }
    }
  )
}

function buildClientRows(
  overview:
    FinanceOverview
): FinanceClientExportRow[] {
  return overview.clients.map(
    (client) => ({
      clientId:
        client.clientId,

      clientName:
        client.clientName,

      caseCount:
        client.totalContracts,

      totalFee:
        client.totalFee,

      totalPaid:
        client.totalPaid,

      totalRemaining:
        client.totalRemaining,

      totalOverdue:
        client.totalOverdue,

      totalExpenses:
        client.totalExpenses,

      collectionRate:
        client.collectionRate,

      estimatedAllocationCases:
        client.estimatedAllocationCases,
    })
  )
}

function buildClientCaseRows(
  overview:
    FinanceOverview
): FinanceClientCaseExportRow[] {
  return overview.clients.flatMap(
    (client) =>
      client.cases.map(
        (
          caseFinance
        ): FinanceClientCaseExportRow => ({
          caseId:
            caseFinance.caseId,

          caseNumber:
            caseFinance.caseNumber,

          caseTitle:
            caseFinance.caseTitle,

          clientId:
            client.clientId,

          clientName:
            client.clientName,

          caseContractAmount:
            caseFinance
              .caseContractAmount ??
            caseFinance.totalFee,

          clientShareAmount:
            caseFinance.totalFee,

          paidAmount:
            caseFinance.paidAmount,

          remainingAmount:
            caseFinance.remainingDebt,

          overdueAmount:
            caseFinance.overdueAmount,

          expensesAmount:
            caseFinance.expensesAmount,

          collectionRate:
            caseFinance.collectionRate,

          status:
            caseFinance.status,

          allocationEstimated:
            Boolean(
              caseFinance
                .allocationEstimated
            ),

          dueDate:
            caseFinance.dueDate,

          lastPaymentDate:
            caseFinance
              .lastPaymentDate,
        })
      )
  )
}

function getTitle(
  mode:
    FinanceExportMode
): string {
  switch (mode) {
    case 'management':
      return 'گزارش مدیریتی مالی'

    case 'clients':
      return 'گزارش مالی موکلین'

    case 'cases':
    default:
      return 'گزارش مالی پرونده‌ها'
  }
}

function getFileMode(
  mode:
    FinanceExportMode
): string {
  switch (mode) {
    case 'management':
      return 'management'

    case 'clients':
      return 'clients'

    default:
      return 'cases'
  }
}

export function buildFinanceExportReport({
  mode,
  sourceCaseCount,
  caseItems,
  overview,
  analytics,
  filters,
}: BuildFinanceExportReportInput): FinanceExportReport {
  const generatedAt =
    new Date().toISOString()

  const dateSuffix =
    generatedAt.slice(
      0,
      10
    )

  return {
    mode,

    title:
      getTitle(mode),

    generatedAt,

    fileBaseName:
      `dadyar-finance-${getFileMode(
        mode
      )}-${dateSuffix}`,

    sourceCaseCount,

    filteredCaseCount:
      caseItems.length,

    filterLabels:
      buildFilterLabels(
        filters
      ),

    stats:
      overview.stats,

    caseRows:
      buildCaseRows(
        caseItems
      ),

    clientRows:
      buildClientRows(
        overview
      ),

    clientCaseRows:
      buildClientCaseRows(
        overview
      ),

    cashflow:
      analytics.monthlyCashflow,

    aging:
      analytics.aging,

    insights:
      analytics.insights,
  }
}