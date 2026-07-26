import type { DateValue } from '../domain/types'
import { normalizeDigits } from './number'

const div = (a: number, b: number) => ~~(a / b)
const mod = (a: number, b: number) => a - ~~(a / b) * b

function jalCal(jy: number) {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060,
    2097, 2192, 2262, 2324, 2394, 2456, 3178,
  ]
  const gy = jy + 621
  let leapJ = -14
  let jp = breaks[0]
  let jump = 0

  if (jy < jp || jy >= breaks[breaks.length - 1]) {
    throw new Error('Invalid Jalali year')
  }

  for (let i = 1; i < breaks.length; i += 1) {
    const jm = breaks[i]
    jump = jm - jp
    if (jy < jm) break
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }

  let n = jy - jp
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150
  const march = 20 + leapJ - leapG

  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33
  }

  let leap = mod(mod(n + 1, 33) - 1, 4)
  if (leap === -1) leap = 4

  return { leap, gy, march }
}

function gregorianToJdn(gy: number, gm: number, gd: number): number {
  let dayNumber =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408

  dayNumber =
    dayNumber - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752

  return dayNumber
}

function jdnToGregorian(jdn: number) {
  let j = 4 * jdn + 139361631
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  const i = div(mod(j, 1461), 4) * 5 + 308
  const gd = div(mod(i, 153), 5) + 1
  const gm = mod(div(i, 153), 12) + 1
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6)

  return { gy, gm, gd }
}

function jalaliToJdn(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy)
  return (
    gregorianToJdn(r.gy, 3, r.march) +
    (jm - 1) * 31 -
    div(jm, 7) * (jm - 7) +
    jd -
    1
  )
}

function jalaliToGregorian(jy: number, jm: number, jd: number) {
  return jdnToGregorian(jalaliToJdn(jy, jm, jd))
}

function fromDateParts(year: number, month: number, day: number): Date | null {
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null

  try {
    if (year >= 1200 && year < 1700) {
      const { gy, gm, gd } = jalaliToGregorian(year, month, day)
      const date = new Date(gy, gm - 1, gd)
      return Number.isNaN(date.getTime()) ? null : date
    }

    if (year >= 1700) {
      const date = new Date(year, month - 1, day)
      return Number.isNaN(date.getTime()) ? null : date
    }
  } catch {
    return null
  }

  return null
}

export function parseFinanceDate(value: DateValue): Date | null {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const normalized = normalizeDigits(value.trim())
  if (!normalized) return null

  const simpleDate = normalized.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/)
  if (simpleDate) {
    return fromDateParts(
      Number(simpleDate[1]),
      Number(simpleDate[2]),
      Number(simpleDate[3])
    )
  }

  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function toIsoDate(value: DateValue): string | undefined {
  const parsed = parseFinanceDate(value)
  return parsed?.toISOString()
}

export function isPastDate(value: DateValue, now = new Date()): boolean {
  const parsed = parseFinanceDate(value)
  return Boolean(parsed && parsed.getTime() < now.getTime())
}
