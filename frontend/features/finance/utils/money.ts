import type {
  FinanceDisplayUnit,
} from '../domain/types'

import {
  toFiniteNumber,
} from './number'

interface FormatMoneyOptions {
  sourceUnit?: FinanceDisplayUnit
  displayUnit?: FinanceDisplayUnit
  locale?: string
  withUnit?: boolean
  maximumFractionDigits?: number
}

export function convertMoneyUnit(
  amount: number,
  sourceUnit: FinanceDisplayUnit,
  targetUnit: FinanceDisplayUnit
): number {
  const safeAmount =
    toFiniteNumber(amount)

  if (
    sourceUnit === targetUnit
  ) {
    return safeAmount
  }

  return sourceUnit === 'rial'
    ? safeAmount / 10
    : safeAmount * 10
}

export function formatMoney(
  amount: number,
  {
    sourceUnit = 'rial',
    displayUnit = sourceUnit,
    locale = 'fa-IR',
    withUnit = true,
    maximumFractionDigits = 0,
  }: FormatMoneyOptions = {}
): string {
  const displayAmount =
    convertMoneyUnit(
      amount,
      sourceUnit,
      displayUnit
    )

  const formatted =
    new Intl.NumberFormat(
      locale,
      {
        maximumFractionDigits,
      }
    ).format(displayAmount)

  if (!withUnit) {
    return formatted
  }

  const unit =
    displayUnit === 'toman'
      ? 'تومان'
      : 'ریال'

  return `${formatted} ${unit}`
}