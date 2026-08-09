import {
  buildCaseFinance,
} from '../domain/selectors'

import {
  safePercentage,
} from '../utils/number'

import type {
  ClientFinanceSummary,
  FinanceCaseSource,
  FinancePaymentStatus,
} from '../domain/types'

import type {
  FinanceExportReport,
  FinanceExportRow,
  FinanceExportSelection,
  FinanceExportSummary,
} from './types'

interface BuildFinanceExportReportInput {
  caseItems: FinanceCaseSource[]
  clients: ClientFinanceSummary[]
  selection: FinanceExportSelection
}

const UNKNOWN_CLIENT =
  'موکل نامشخص'

export function getFinanceClientKey(
  client: Pick<
    ClientFinanceSummary,
    'clientId' | 'clientName'
  >
): string {
  if (client.clientId?.trim()) {
    return `id:${client.clientId.trim()}`
  }

  return `name:${client.clientName
    .trim()
    .toLocaleLowerCase('fa-IR')}`
}

function getCaseClientNames(
  caseItem: FinanceCaseSource
): string[] {
  const names = new Set<string>()

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

  if (names.size === 0) {
    names.add(UNKNOWN_CLIENT)
  }

  return [...names]
}

function createAllCaseRows(
  caseItems: FinanceCaseSource[]
): FinanceExportRow[] {
  return caseItems.map(
    (caseItem) => {
      const finance =
        buildCaseFinance(caseItem)

      return {
        rowKind: 'case',

        caseId:
          finance.caseId,

        caseNumber:
          finance.caseNumber,

        caseTitle:
          finance.caseTitle,

        clientName:
          getCaseClientNames(
            caseItem
          ).join('، '),

        contractAmount:
          finance.totalFee,

        clientShareAmount:
          undefined,

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

        allocationEstimated:
          false,
      }
    }
  )
}

function createClientRows(
  clients: ClientFinanceSummary[]
): FinanceExportRow[] {
  return clients.flatMap(
    (client) =>
      client.cases.map(
        (caseFinance) => ({
          rowKind:
            'client-share' as const,

          caseId:
            caseFinance.caseId,

          caseNumber:
            caseFinance.caseNumber,

          caseTitle:
            caseFinance.caseTitle,

          clientName:
            client.clientName,

          contractAmount:
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

          dueDate:
            caseFinance.dueDate,

          lastPaymentDate:
            caseFinance.lastPaymentDate,

          allocationEstimated:
            Boolean(
              caseFinance
                .allocationEstimated
            ),
        })
      )
  )
}

function buildSummary(
  rows: FinanceExportRow[],
  clientCount: number
): FinanceExportSummary {
  const totals =
    rows.reduce(
      (result, row) => {
        const reportAmount =
          row.rowKind ===
          'client-share'
            ? row.clientShareAmount ??
              0
            : row.contractAmount

        result.totalFee +=
          reportAmount

        result.totalPaid +=
          row.paidAmount

        result.totalRemaining +=
          row.remainingAmount

        result.totalOverdue +=
          row.overdueAmount

        result.totalExpenses +=
          row.expensesAmount

        return result
      },
      {
        totalFee: 0,
        totalPaid: 0,
        totalRemaining: 0,
        totalOverdue: 0,
        totalExpenses: 0,
      }
    )

  const uniqueCases =
    new Set(
      rows.map(
        (row) =>
          row.caseId
      )
    )

  return {
    ...totals,

    netCollected:
      totals.totalPaid -
      totals.totalExpenses,

    collectionRate:
      safePercentage(
        totals.totalPaid,
        totals.totalFee
      ),

    caseCount:
      uniqueCases.size,

    clientCount,
  }
}

function countUniqueCaseClients(
  caseItems: FinanceCaseSource[]
): number {
  const keys =
    new Set<string>()

  for (
    const caseItem of
    caseItems
  ) {
    for (
      const client of
      caseItem.clients ?? []
    ) {
      if (client.clientId?.trim()) {
        keys.add(
          `id:${client.clientId.trim()}`
        )

        continue
      }

      if (client.name?.trim()) {
        keys.add(
          `name:${client.name
            .trim()
            .toLocaleLowerCase(
              'fa-IR'
            )}`
        )
      }
    }

    if (
      !caseItem.clients?.length &&
      caseItem.clientName?.trim()
    ) {
      keys.add(
        `legacy:${caseItem.clientName
          .trim()
          .toLocaleLowerCase(
            'fa-IR'
          )}`
      )
    }
  }

  return keys.size
}

function getDateSuffix(): string {
  return new Date()
    .toISOString()
    .slice(0, 10)
}

export function buildFinanceExportReport({
  caseItems,
  clients,
  selection,
}: BuildFinanceExportReportInput): FinanceExportReport {
  if (
    selection.scope ===
    'all-cases'
  ) {
    const rows =
      createAllCaseRows(
        caseItems
      )

    return {
      title:
        'گزارش مالی کل پرونده‌ها',

      scopeLabel:
        'تمام پرونده‌ها',

      amountLabel:
        'ارزش کل قراردادها',

      generatedAt:
        new Date().toISOString(),

      fileBaseName:
        `dadyar-finance-all-cases-${getDateSuffix()}`,

      summary:
        buildSummary(
          rows,
          countUniqueCaseClients(
            caseItems
          )
        ),

      rows,

      selectedClientNames: [],
    }
  }

  const selectedClients =
    selection.scope ===
    'all-clients'
      ? clients
      : clients.filter(
          (client) =>
            selection.clientKeys.includes(
              getFinanceClientKey(
                client
              )
            )
        )

  if (
    selection.scope ===
      'selected-clients' &&
    selectedClients.length === 0
  ) {
    throw new Error(
      'حداقل یک موکل را برای گزارش انتخاب کنید.'
    )
  }

  const rows =
    createClientRows(
      selectedClients
    )

  const isAllClients =
    selection.scope ===
    'all-clients'

  return {
    title:
      isAllClients
        ? 'گزارش مالی تمام موکلین'
        : 'گزارش مالی موکلین انتخاب‌شده',

    scopeLabel:
      isAllClients
        ? 'تمام موکلین'
        : `${selectedClients.length.toLocaleString(
            'fa-IR'
          )} موکل انتخاب‌شده`,

    amountLabel:
      'مجموع سهم حق‌الوکاله',

    generatedAt:
      new Date().toISOString(),

    fileBaseName:
      isAllClients
        ? `dadyar-finance-all-clients-${getDateSuffix()}`
        : `dadyar-finance-selected-clients-${getDateSuffix()}`,

    summary:
      buildSummary(
        rows,
        selectedClients.length
      ),

    rows,

    selectedClientNames:
      selectedClients.map(
        (client) =>
          client.clientName
      ),
  }
}

export function getFinanceStatusLabel(
  status: FinancePaymentStatus
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
      return 'پرداخت‌نشده'
  }
}