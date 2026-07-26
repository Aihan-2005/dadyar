import type { FinanceDisplayUnit } from '../domain/types'
import { toFiniteNumber } from './number'

interface FormatMoneyOptions {
  /** Unit of the provided amount. Defaults to the current frontend convention. */
  sourceUnit?: FinanceDisplayUnit
  /** Unit shown to the user. No conversion happens unless this differs. */
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
  const safeAmount = toFiniteNumber(amount)
  if (sourceUnit === targetUnit) return safeAmount
  return sourceUnit === 'rial' ? safeAmount / 10 : safeAmount * 10
}

/**
 * Formats money without making an implicit rial/toman assumption.
 * During the frontend migration both units remain explicit at the boundary.
 */
export function formatMoney(
  amount: number,
  {
    sourceUnit = 'toman',
    displayUnit = sourceUnit,
    locale = 'fa-IR',
    withUnit = true,
    maximumFractionDigits = 0,
  }: FormatMoneyOptions = {}
): string {
  const displayAmount = convertMoneyUnit(amount, sourceUnit, displayUnit)
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits,
  }).format(displayAmount)

  if (!withUnit) return formatted
  return `${formatted} ${displayUnit === 'toman' ? 'تومان' : 'ریال'}`
}
