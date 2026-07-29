const PERSIAN_DIGITS =
  '۰۱۲۳۴۵۶۷۸۹'

const ARABIC_DIGITS =
  '٠١٢٣٤٥٦٧٨٩'


export function normalizeDigits(
  value: string,
): string {
  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          PERSIAN_DIGITS.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          ARABIC_DIGITS.indexOf(
            digit,
          ),
        ),
    )
}


export function toFiniteNumber(
  value: unknown,
): number {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 0
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? value
      : 0
  }

  if (typeof value !== 'string') {
    return 0
  }

  const normalized =
    normalizeDigits(value)
      .replace(/[٬,\s]/g, '')
      .replace(
        /ریال|تومان|ت/g,
        '',
      )
      .trim()

  if (!normalized) {
    return 0
  }

  const parsed =
    Number(normalized)

  return Number.isFinite(parsed)
    ? parsed
    : 0
}

export function clampPercentage(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(
    Math.max(value, 0),
    100,
  )
}

export function safePercentage(
  part: number,
  total: number,
): number {
  if (total <= 0) {
    return 0
  }

  return clampPercentage(
    (part / total) * 100,
  )
}