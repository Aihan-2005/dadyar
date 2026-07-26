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
import { safePercentage } from '../utils/number'

const UNKNOWN_CLIENT = 'موکل نامشخص'

function normalizeClientName(value?: string): string {
  return value?.trim() || UNKNOWN_CLIENT
}

function getPrimaryClient(caseItem: FinanceCaseSource) {
  const firstClient = caseItem.clients?.find((client) => client.name?.trim())

  return {
    clientId: caseItem.clientId ?? firstClient?.clientId,
    clientName: normalizeClientName(caseItem.clientName ?? firstClient?.name),
  }
}

function getClientGroupKey(clientId: string | undefined, clientName: string): string {
  return clientId ? `id:${clientId}` : `name:${clientName.trim().toLowerCase()}`
}

function isActiveContract(status?: string): boolean {
  return !['archived', 'closed', 'completed'].includes(status ?? '')
}

export function buildCaseFinance(
  caseItem: FinanceCaseSource,
  now = new Date()
): CaseFinance {
  const { clientId, clientName } = getPrimaryClient(caseItem)

  return {
    caseId: caseItem.id,
    caseNumber: caseItem.caseNumber?.trim() || 'بدون شماره',
    caseTitle: caseItem.title?.trim() || 'پرونده بدون عنوان',
    clientId,
    clientName,
    totalFee: getContractAmount(caseItem),
    paidAmount: getPaidAmount(caseItem),
    remainingDebt: getRemainingAmount(caseItem),
    overdueAmount: getOverdueAmount(caseItem, now),
    expensesAmount: getExpensesAmount(caseItem.expenses),
    lastPaymentDate: getLastPaymentDate(caseItem),
    dueDate: getNextDueDate(caseItem),
    status: getFinancePaymentStatus(caseItem, now),
    collectionRate: getCollectionRate(caseItem),
  }
}

export function buildClientFinanceSummaries(
  caseItems: FinanceCaseSource[],
  now = new Date()
): ClientFinanceSummary[] {
  const grouped = new Map<string, ClientFinanceSummary>()

  for (const caseItem of caseItems) {
    const caseFinance = buildCaseFinance(caseItem, now)
    const key = getClientGroupKey(caseFinance.clientId, caseFinance.clientName)
    const current = grouped.get(key) ?? {
      clientId: caseFinance.clientId,
      clientName: caseFinance.clientName,
      totalContracts: 0,
      totalFee: 0,
      totalPaid: 0,
      totalRemaining: 0,
      totalOverdue: 0,
      totalExpenses: 0,
      collectionRate: 0,
      cases: [],
    }

    current.totalContracts += 1
    current.totalFee += caseFinance.totalFee
    current.totalPaid += caseFinance.paidAmount
    current.totalRemaining += caseFinance.remainingDebt
    current.totalOverdue += caseFinance.overdueAmount
    current.totalExpenses += caseFinance.expensesAmount
    current.cases.push(caseFinance)
    current.collectionRate = safePercentage(current.totalPaid, current.totalFee)

    grouped.set(key, current)
  }

  return [...grouped.values()].sort((a, b) => {
    if (b.totalOverdue !== a.totalOverdue) return b.totalOverdue - a.totalOverdue
    return b.totalRemaining - a.totalRemaining
  })
}

export function buildFinancialStats(
  caseItems: FinanceCaseSource[],
  clients: ClientFinanceSummary[] = buildClientFinanceSummaries(caseItems)
): FinancialStats {
  const totals = clients.reduce(
    (result, client) => ({
      totalRevenue: result.totalRevenue + client.totalFee,
      totalReceived: result.totalReceived + client.totalPaid,
      totalRemaining: result.totalRemaining + client.totalRemaining,
      totalOverdue: result.totalOverdue + client.totalOverdue,
      totalExpenses: result.totalExpenses + client.totalExpenses,
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
    netCollected: totals.totalReceived - totals.totalExpenses,
    collectionRate: safePercentage(totals.totalReceived, totals.totalRevenue),
    clientCount: clients.length,
    activeContracts: caseItems.filter((caseItem) => isActiveContract(caseItem.status)).length,
  }
}

export function buildFinanceOverview(
  caseItems: FinanceCaseSource[],
  now = new Date()
): FinanceOverview {
  const cases = caseItems.map((caseItem) => buildCaseFinance(caseItem, now))
  const clients = buildClientFinanceSummaries(caseItems, now)
  const stats = buildFinancialStats(caseItems, clients)

  return { stats, clients, cases }
}
