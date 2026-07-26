import type {
  FinanceCaseSource,
  FinanceExpenseSource,
  FinancePaymentSource,
  FinancePaymentStatus,
} from './types'
import { isPastDate, parseFinanceDate, toIsoDate } from '../utils/date'
import { safePercentage, toFiniteNumber } from '../utils/number'

function getPayments(caseItem: FinanceCaseSource): FinancePaymentSource[] {
  return caseItem.cashPayments?.length
    ? caseItem.cashPayments
    : caseItem.installments ?? []
}

function getPaymentDueDate(payment: FinancePaymentSource) {
  return payment.dueDate ?? payment.paymentDate
}

function getPaymentPaidDate(payment: FinancePaymentSource) {
  return payment.paidDate ?? (payment.isPaid ? payment.paymentDate : undefined)
}

export function getContractAmount(caseItem: FinanceCaseSource): number {
  const candidates = [
    caseItem.contractAmount,
    caseItem.totalFee,
    caseItem.totalAmount,
  ]

  for (const candidate of candidates) {
    const amount = toFiniteNumber(candidate)
    if (amount > 0) return amount
  }

  return getPayments(caseItem).reduce(
    (sum, payment) => sum + toFiniteNumber(payment.amount),
    0
  )
}

export function getPaidAmount(caseItem: FinanceCaseSource): number {
  const explicitPaidAmount = toFiniteNumber(caseItem.paidAmount)
  if (explicitPaidAmount > 0) return explicitPaidAmount

  return getPayments(caseItem).reduce((sum, payment) => {
    if (!payment.isPaid) return sum
    return sum + toFiniteNumber(payment.amount)
  }, 0)
}

export function getRemainingAmount(caseItem: FinanceCaseSource): number {
  const contractAmount = getContractAmount(caseItem)
  const paidAmount = getPaidAmount(caseItem)

  if (contractAmount > 0) {
    return Math.max(contractAmount - paidAmount, 0)
  }

  return Math.max(toFiniteNumber(caseItem.remainingAmount), 0)
}

export function getExpensesAmount(expenses?: FinanceExpenseSource[]): number {
  return (expenses ?? []).reduce(
    (sum, expense) => sum + toFiniteNumber(expense.amount),
    0
  )
}

export function getNextDueDate(caseItem: FinanceCaseSource): string | undefined {
  const unpaidDueDates = getPayments(caseItem)
    .filter((payment) => !payment.isPaid)
    .map((payment) => parseFinanceDate(getPaymentDueDate(payment)))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => a.getTime() - b.getTime())

  return unpaidDueDates[0]?.toISOString() ?? toIsoDate(caseItem.dueDate)
}

export function getLastPaymentDate(caseItem: FinanceCaseSource): string | undefined {
  const paidDates = getPayments(caseItem)
    .filter((payment) => payment.isPaid)
    .map((payment) => parseFinanceDate(getPaymentPaidDate(payment)))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())

  return paidDates[0]?.toISOString() ?? toIsoDate(caseItem.lastPaymentDate)
}

export function getOverdueAmount(
  caseItem: FinanceCaseSource,
  now = new Date()
): number {
  const explicitOverdueAmount = toFiniteNumber(caseItem.overdueAmount)
  if (explicitOverdueAmount > 0) return explicitOverdueAmount

  const overdueInstallments = getPayments(caseItem).reduce((sum, payment) => {
    if (payment.isPaid || !isPastDate(getPaymentDueDate(payment), now)) return sum
    return sum + toFiniteNumber(payment.amount)
  }, 0)

  if (overdueInstallments > 0) return overdueInstallments

  return isPastDate(caseItem.dueDate, now) ? getRemainingAmount(caseItem) : 0
}

export function getFinancePaymentStatus(
  caseItem: FinanceCaseSource,
  now = new Date()
): FinancePaymentStatus {
  const contractAmount = getContractAmount(caseItem)
  const paidAmount = getPaidAmount(caseItem)
  const remainingAmount = getRemainingAmount(caseItem)
  const overdueAmount = getOverdueAmount(caseItem, now)

  if (overdueAmount > 0) return 'overdue'
  if (contractAmount > 0 && remainingAmount <= 0) return 'paid'
  if (paidAmount > 0) return 'partial'
  return 'unpaid'
}

export function getCollectionRate(caseItem: FinanceCaseSource): number {
  return safePercentage(getPaidAmount(caseItem), getContractAmount(caseItem))
}
