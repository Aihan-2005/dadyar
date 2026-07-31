import type {
  CaseFinance,
  ClientFinanceSummary,
  FinanceCaseSource,
  FinanceOverview,
  FinancialStats,
} from './types'

import {
  getCollectionRate,
  getContractAmount,
  getExpensesAmount,
  getFinancePaymentStatus,
  getLastPaymentDate,
  getNextDueDate,
  getOverdueAmount,
  getPaidAmount,
  getRemainingAmount,
} from './calculations'

import {
  buildClientCaseFinances,
} from './client-allocations'

import {
  safePercentage,
} from '../utils/number'

const UNKNOWN_CLIENT =
  'موکل نامشخص'

function normalizeClientName(
  value?: string
): string {
  return (
    value?.trim() ||
    UNKNOWN_CLIENT
  )
}

function getPrimaryClient(
  caseItem:
    FinanceCaseSource
) {
  const firstClient =
    caseItem.clients?.find(
      (client) =>
        client.name?.trim()
    )

  return {
    clientId:
      caseItem.clientId ??
      firstClient?.clientId,

    clientName:
      normalizeClientName(
        caseItem.clientName ??
          firstClient?.name
      ),
  }
}

function getClientGroupKey(
  clientId:
    string | undefined,

  clientName: string
): string {
  return clientId
    ? `id:${clientId}`
    : `name:${clientName
        .trim()
        .toLocaleLowerCase(
          'fa-IR'
        )}`
}

function isActiveContract(
  status?: string
): boolean {
  return ![
    'archived',
    'closed',
    'completed',
  ].includes(status ?? '')
}


export function buildCaseFinance(
  caseItem:
    FinanceCaseSource,

  now = new Date()
): CaseFinance {
  const {
    clientId,
    clientName,
  } = getPrimaryClient(
    caseItem
  )

  return {
    caseId:
      caseItem.id,

    caseNumber:
      caseItem.caseNumber
        ?.trim() ||
      'بدون شماره',

    caseTitle:
      caseItem.title
        ?.trim() ||
      'پرونده بدون عنوان',

    clientId,
    clientName,

    totalFee:
      getContractAmount(
        caseItem
      ),

    paidAmount:
      getPaidAmount(
        caseItem
      ),

    remainingDebt:
      getRemainingAmount(
        caseItem
      ),

    overdueAmount:
      getOverdueAmount(
        caseItem,
        now
      ),

    expensesAmount:
      getExpensesAmount(
        caseItem.expenses
      ),

    lastPaymentDate:
      getLastPaymentDate(
        caseItem
      ),

    dueDate:
      getNextDueDate(
        caseItem
      ),

    status:
      getFinancePaymentStatus(
        caseItem,
        now
      ),

    collectionRate:
      getCollectionRate(
        caseItem
      ),
  }
}

export function buildClientFinanceSummaries(
  caseItems:
    FinanceCaseSource[],

  now = new Date()
): ClientFinanceSummary[] {
  const grouped =
    new Map<
      string,
      ClientFinanceSummary
    >()

  for (
    const caseItem of
    caseItems
  ) {
    const clientCases =
      buildClientCaseFinances(
        caseItem,
        now
      )

    for (
      const clientCaseFinance of
      clientCases
    ) {
      const key =
        getClientGroupKey(
          clientCaseFinance
            .clientId,

          clientCaseFinance
            .clientName
        )

      const current =
        grouped.get(key) ?? {
          clientId:
            clientCaseFinance
              .clientId,

          clientName:
            clientCaseFinance
              .clientName,

          totalContracts: 0,

          totalFee: 0,
          totalPaid: 0,
          totalRemaining: 0,
          totalOverdue: 0,
          totalExpenses: 0,

          collectionRate: 0,

          estimatedAllocationCases:
            0,

          cases: [],
        }

      current.totalContracts +=
        1

      current.totalFee +=
        clientCaseFinance
          .totalFee

      current.totalPaid +=
        clientCaseFinance
          .paidAmount

      current.totalRemaining +=
        clientCaseFinance
          .remainingDebt

      current.totalOverdue +=
        clientCaseFinance
          .overdueAmount

      current.totalExpenses +=
        clientCaseFinance
          .expensesAmount

      if (
        clientCaseFinance
          .allocationEstimated
      ) {
        current
          .estimatedAllocationCases +=
          1
      }

      current.cases.push(
        clientCaseFinance
      )

      current.collectionRate =
        safePercentage(
          current.totalPaid,
          current.totalFee
        )

      grouped.set(
        key,
        current
      )
    }
  }

  return [
    ...grouped.values(),
  ].sort(
    (first, second) => {
      if (
        second.totalOverdue !==
        first.totalOverdue
      ) {
        return (
          second.totalOverdue -
          first.totalOverdue
        )
      }

      return (
        second.totalRemaining -
        first.totalRemaining
      )
    }
  )
}

export function buildFinancialStats(
  caseItems:
    FinanceCaseSource[],

  clients:
    ClientFinanceSummary[] =
      buildClientFinanceSummaries(
        caseItems
      ),

  now = new Date()
): FinancialStats {
  const caseFinances =
    caseItems.map(
      (caseItem) =>
        buildCaseFinance(
          caseItem,
          now
        )
    )

  const totals =
    caseFinances.reduce(
      (
        result,
        caseFinance
      ) => ({
        totalRevenue:
          result.totalRevenue +
          caseFinance.totalFee,

        totalReceived:
          result.totalReceived +
          caseFinance.paidAmount,

        totalRemaining:
          result.totalRemaining +
          caseFinance
            .remainingDebt,

        totalOverdue:
          result.totalOverdue +
          caseFinance
            .overdueAmount,

        totalExpenses:
          result.totalExpenses +
          caseFinance
            .expensesAmount,
      }),
      {
        totalRevenue: 0,
        totalReceived: 0,
        totalRemaining: 0,
        totalOverdue: 0,
        totalExpenses: 0,
      }
    )

  return {
    ...totals,

    netCollected:
      totals.totalReceived -
      totals.totalExpenses,

    collectionRate:
      safePercentage(
        totals.totalReceived,
        totals.totalRevenue
      ),

    clientCount:
      clients.length,

    activeContracts:
      caseItems.filter(
        (caseItem) =>
          isActiveContract(
            caseItem.status
          )
      ).length,
  }
}

export function buildFinanceOverview(
  caseItems:
    FinanceCaseSource[],

  now = new Date()
): FinanceOverview {
  const cases =
    caseItems.map(
      (caseItem) =>
        buildCaseFinance(
          caseItem,
          now
        )
    )

  const clients =
    buildClientFinanceSummaries(
      caseItems,
      now
    )

  const stats =
    buildFinancialStats(
      caseItems,
      clients,
      now
    )

  return {
    stats,
    clients,
    cases,
  }
}