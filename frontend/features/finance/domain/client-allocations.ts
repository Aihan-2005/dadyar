import type {
  CaseFinance,
  FinanceCaseSource,
  FinancePaymentSource,
  ResolvedClientAllocation,
} from './types'

import {
  getContractAmount,
  getExpensesAmount,
} from './calculations'

import {
  parseFinanceDate,
} from '../utils/date'

import {
  safePercentage,
  toFiniteNumber,
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

function getClientKey(
  clientId?: string,
  clientName?: string
): string {
  if (clientId?.trim()) {
    return `id:${clientId.trim()}`
  }

  return `name:${normalizeClientName(
    clientName
  ).toLocaleLowerCase('fa-IR')}`
}

function splitIntegerAmount(
  amount: number,
  ratios: number[]
): number[] {
  const safeAmount = Math.max(
    Math.round(amount),
    0
  )

  if (ratios.length === 0) {
    return []
  }

  if (ratios.length === 1) {
    return [safeAmount]
  }

  const ratioTotal =
    ratios.reduce(
      (sum, ratio) =>
        sum +
        Math.max(ratio, 0),
      0
    )

  const normalizedRatios =
    ratioTotal > 0
      ? ratios.map(
          (ratio) =>
            Math.max(ratio, 0) /
            ratioTotal
        )
      : ratios.map(
          () =>
            1 / ratios.length
        )

  let assignedAmount = 0

  return normalizedRatios.map(
    (ratio, index) => {
      const isLast =
        index ===
        normalizedRatios.length - 1

      if (isLast) {
        return (
          safeAmount -
          assignedAmount
        )
      }

      const part =
        Math.floor(
          safeAmount * ratio
        )

      assignedAmount += part

      return part
    }
  )
}


export function resolveClientAllocations(
  caseItem: FinanceCaseSource
): ResolvedClientAllocation[] {
  const uniqueClients =
    new Map<
      string,
      {
        clientId?: string
        clientName: string
        explicitShare: number
      }
    >()

  for (
    const client of
    caseItem.clients ?? []
  ) {
    if (
      !client.clientId?.trim() &&
      !client.name?.trim()
    ) {
      continue
    }

    const clientName =
      normalizeClientName(
        client.name
      )

    const key =
      getClientKey(
        client.clientId,
        clientName
      )

    if (
      !uniqueClients.has(key)
    ) {
      uniqueClients.set(
        key,
        {
          clientId:
            client.clientId
              ?.trim() ||
            undefined,

          clientName,

          explicitShare:
            Math.max(
              toFiniteNumber(
                client.feeShareAmount
              ),
              0
            ),
        }
      )
    }
  }

  
  if (
    uniqueClients.size === 0
  ) {
    const fallbackName =
      normalizeClientName(
        caseItem.clientName
      )

    uniqueClients.set(
      getClientKey(
        caseItem.clientId,
        fallbackName
      ),
      {
        clientId:
          caseItem.clientId
            ?.trim() ||
          undefined,

        clientName:
          fallbackName,

        explicitShare: 0,
      }
    )
  }

  const clients = [
    ...uniqueClients.values(),
  ]

  const contractAmount =
    getContractAmount(caseItem)

  const explicitTotal =
    clients.reduce(
      (sum, client) =>
        sum +
        client.explicitShare,
      0
    )

  const clientsWithoutShare =
    clients.filter(
      (client) =>
        client.explicitShare <= 0
    )

  let amounts: number[]

  let estimatedIndexes =
    new Set<number>()

  if (clients.length === 1) {
    amounts = [
      clients[0].explicitShare >
      0
        ? clients[0]
            .explicitShare
        : contractAmount,
    ]

    if (
      clients[0].explicitShare <=
      0
    ) {
      estimatedIndexes.add(0)
    }
  } else if (
    explicitTotal <= 0
  ) {
    amounts =
      splitIntegerAmount(
        contractAmount,
        clients.map(() => 1)
      )

    estimatedIndexes =
      new Set(
        clients.map(
          (_, index) => index
        )
      )
  } else {
    const remainingAmount =
      Math.max(
        contractAmount -
          explicitTotal,
        0
      )

    const fallbackParts =
      splitIntegerAmount(
        remainingAmount,
        clientsWithoutShare.map(
          () => 1
        )
      )

    let fallbackIndex = 0

    amounts =
      clients.map(
        (client, index) => {
          if (
            client.explicitShare >
            0
          ) {
            return client
              .explicitShare
          }

          estimatedIndexes.add(
            index
          )

          const amount =
            fallbackParts[
              fallbackIndex
            ] ?? 0

          fallbackIndex += 1

          return amount
        }
      )
  }

  const allocationTotal =
    amounts.reduce(
      (sum, amount) =>
        sum + amount,
      0
    )

  const ratios =
    allocationTotal > 0
      ? amounts.map(
          (amount) =>
            amount /
            allocationTotal
        )
      : amounts.map(
          () =>
            1 /
            Math.max(
              amounts.length,
              1
            )
        )

  return clients.map(
    (client, index) => ({
      clientId:
        client.clientId,

      clientName:
        client.clientName,

      feeAmount:
        amounts[index] ?? 0,

      ratio:
        ratios[index] ?? 0,

      isEstimated:
        estimatedIndexes.has(
          index
        ),
    })
  )
}

function getCasePayments(
  caseItem: FinanceCaseSource
): FinancePaymentSource[] {
  const cashOrInstallments =
    caseItem.cashPayments?.length
      ? caseItem.cashPayments
      : caseItem.installments ??
        []

  const nonCashPayments:
    FinancePaymentSource[] =
    (
      caseItem.nonCashPayments ??
      []
    ).map((payment) => ({
      id: payment.id,

      clientId:
        payment.clientId,

      clientName:
        payment.clientName,

      amount:
        payment.amount,

      isPaid:
        payment.isDelivered,

      dueDate:
        payment.dueDate,

      paidDate:
        payment.deliveredDate,
    }))

  return [
    ...cashOrInstallments,
    ...nonCashPayments,
  ]
}

function getPaymentClientKey(
  payment:
    FinancePaymentSource
): string | undefined {
  if (
    !payment.clientId?.trim() &&
    !payment.clientName?.trim()
  ) {
    return undefined
  }

  return getClientKey(
    payment.clientId,
    payment.clientName
  )
}


function splitPaymentAmount(
  payment:
    FinancePaymentSource,

  allocations:
    ResolvedClientAllocation[]
): number[] {
  const amount = Math.max(
    toFiniteNumber(
      payment.amount
    ),
    0
  )

  const paymentKey =
    getPaymentClientKey(
      payment
    )

  const matchingIndex =
    paymentKey
      ? allocations.findIndex(
          (allocation) =>
            getClientKey(
              allocation.clientId,
              allocation.clientName
            ) === paymentKey
        )
      : -1

  if (matchingIndex >= 0) {
    return allocations.map(
      (_, index) =>
        index === matchingIndex
          ? amount
          : 0
    )
  }

  return splitIntegerAmount(
    amount,
    allocations.map(
      (allocation) =>
        allocation.ratio
    )
  )
}

function getRelevantDate(
  payments:
    FinancePaymentSource[],

  allocationIndex: number,

  allocations:
    ResolvedClientAllocation[],

  mode: 'due' | 'paid'
): string | undefined {
  const dates =
    payments
      .filter((payment) =>
        mode === 'paid'
          ? payment.isPaid
          : !payment.isPaid
      )
      .filter(
        (payment) =>
          splitPaymentAmount(
            payment,
            allocations
          )[allocationIndex] >
          0
      )
      .map((payment) =>
        parseFinanceDate(
          mode === 'paid'
            ? payment.paidDate ??
                payment.paymentDate
            : payment.dueDate ??
                payment.paymentDate
        )
      )
      .filter(
        (
          date
        ): date is Date =>
          Boolean(date)
      )
      .sort(
        (first, second) =>
          mode === 'paid'
            ? second.getTime() -
              first.getTime()
            : first.getTime() -
              second.getTime()
      )

  return dates[0]
    ?.toISOString()
}


export function buildClientCaseFinances(
  caseItem: FinanceCaseSource,
  now = new Date()
): CaseFinance[] {
  const allocations =
    resolveClientAllocations(
      caseItem
    )

  const payments =
    getCasePayments(
      caseItem
    )

  const paymentSplits =
    payments.map((payment) =>
      splitPaymentAmount(
        payment,
        allocations
      )
    )

  const expensesAmount =
    getExpensesAmount(
      caseItem.expenses
    )


  const expenseSplits =
    splitIntegerAmount(
      expensesAmount,
      allocations.map(
        (allocation) =>
          allocation.ratio
      )
    )

  const caseContractAmount =
    getContractAmount(
      caseItem
    )

  return allocations.map(
    (
      allocation,
      allocationIndex
    ) => {
      let paidAmount = 0
      let overdueAmount = 0

      payments.forEach(
        (
          payment,
          paymentIndex
        ) => {
          const attributedAmount =
            paymentSplits[
              paymentIndex
            ]?.[
              allocationIndex
            ] ?? 0

          if (
            attributedAmount <= 0
          ) {
            return
          }

          if (
            payment.isPaid
          ) {
            paidAmount +=
              attributedAmount

            return
          }

          const dueDate =
            parseFinanceDate(
              payment.dueDate ??
                payment.paymentDate
            )

          if (
            dueDate &&
            dueDate.getTime() <
              now.getTime()
          ) {
            overdueAmount +=
              attributedAmount
          }
        }
      )

      const remainingDebt =
        Math.max(
          allocation.feeAmount -
            paidAmount,
          0
        )

      overdueAmount =
        Math.min(
          overdueAmount,
          remainingDebt
        )

      const status =
        remainingDebt <= 0 &&
        allocation.feeAmount > 0
          ? 'paid'
          : overdueAmount > 0
            ? 'overdue'
            : paidAmount > 0
              ? 'partial'
              : 'unpaid'

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

        clientId:
          allocation.clientId,

        clientName:
          allocation.clientName,

        totalFee:
          allocation.feeAmount,

        paidAmount,

        remainingDebt,
        overdueAmount,

        expensesAmount:
          expenseSplits[
            allocationIndex
          ] ?? 0,

        lastPaymentDate:
          getRelevantDate(
            payments,
            allocationIndex,
            allocations,
            'paid'
          ),

        dueDate:
          getRelevantDate(
            payments,
            allocationIndex,
            allocations,
            'due'
          ),

        status,

        collectionRate:
          safePercentage(
            paidAmount,
            allocation.feeAmount
          ),

        caseContractAmount,

        allocationEstimated:
          allocation.isEstimated,
      }
    }
  )
}