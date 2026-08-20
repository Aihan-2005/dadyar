const PERSIAN_DIGITS =
  '۰۱۲۳۴۵۶۷۸۹'

const ARABIC_DIGITS =
  '٠١٢٣٤٥٦٧٨٩'

const MONEY_SEPARATOR_PATTERN =
  /[٬,\s]/g

const MONEY_LABEL_PATTERN =
  /ریال|تومان|ت/g

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

/**
 * رشته مبلغ را به مقدار عددی خام تبدیل می‌کند.
 *
 * مثال‌ها:
 * ۱,۲۰۰,۰۰۰ تومان -> 1200000
 * 1٬200٬000 -> 1200000
 */
export function normalizeMoneyValue(
  value: string,
): string {
  return normalizeDigits(
    value,
  )
    .replace(
      MONEY_SEPARATOR_PATTERN,
      '',
    )
    .replace(
      MONEY_LABEL_PATTERN,
      '',
    )
    .trim()
}

/**
 * مخصوص input مبلغ است.
 * فقط ارقام را نگه می‌دارد و برای نمایش سه‌رقمی جدا می‌کند.
 *
 * نکته: با string کار می‌کند تا برای اعداد بزرگ در زمان تایپ
 * دچار خطای precision جاوااسکریپت نشویم.
 */
export function formatMoneyInput(
  value:
    | string
    | number
    | null
    | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return ''
  }

  const normalized =
    normalizeMoneyValue(
      String(value),
    )
      .replace(
        /[^\d]/g,
        '',
      )

  if (!normalized) {
    return ''
  }

  const withoutLeadingZeros =
    normalized.replace(
      /^0+(?=\d)/,
      '',
    )

  return withoutLeadingZeros.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ',',
  )
}

/**
 * formatter عمومی برای نمایش مبلغ.
 */
export function formatMoney(
  value: unknown,
): string {
  const amount =
    toFiniteNumber(
      value,
    )

  return Math.trunc(
    amount,
  ).toLocaleString(
    'en-US',
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
    return Number.isFinite(
      value,
    )
      ? value
      : 0
  }

  if (typeof value !== 'string') {
    return 0
  }

  const normalized =
    normalizeMoneyValue(
      value,
    )

  if (!normalized) {
    return 0
  }

  const parsed =
    Number(normalized)

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0
}

/**
 * تفاوتش با toFiniteNumber این است که ورودی خالی را undefined برمی‌گرداند.
 * برای react-hook-form و فیلدهای اختیاری مناسب‌تر است.
 */
export function toOptionalFiniteNumber(
  value: unknown,
): number | undefined {
  if (
    value === null ||
    value === undefined
  ) {
    return undefined
  }

  if (
    typeof value === 'string' &&
    normalizeMoneyValue(
      value,
    ) === ''
  ) {
    return undefined
  }

  const result =
    toFiniteNumber(
      value,
    )

  return Number.isFinite(
    result,
  )
    ? result
    : undefined
}

export function clampPercentage(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0
  }

  return Math.min(
    Math.max(
      value,
      0,
    ),
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