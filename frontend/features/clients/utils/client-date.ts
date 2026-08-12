import {
  parseFinanceDate,
} from '@/features/finance/utils/date'

export function getClientAge(
  birthDate?: string
): number | null {
  if (!birthDate) {
    return null
  }

  const birth =
    parseFinanceDate(
      birthDate
    )

  if (!birth) {
    return null
  }

  const today =
    new Date()

  let age =
    today.getFullYear() -
    birth.getFullYear()

  const monthDifference =
    today.getMonth() -
    birth.getMonth()

  if (
    monthDifference < 0 ||
    (
      monthDifference ===
        0 &&
      today.getDate() <
        birth.getDate()
    )
  ) {
    age -= 1
  }

  return age
}

export function isClientMinor(
  birthDate?: string
): boolean {
  const age =
    getClientAge(
      birthDate
    )

  return (
    age !== null &&
    age < 18
  )
}