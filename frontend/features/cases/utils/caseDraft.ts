

export const CASE_DRAFT_KEY =
  'new_case_draft'

const CASE_DRAFT_VERSION = 2

interface CaseDraftEnvelope<T> {
  version: number
  savedAt: string
  data: T
}

function canUseLocalStorage(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.localStorage !==
      'undefined'
  )
}

/**
 * ذخیره Draft ساخت پرونده.
 *
 * عمداً throw نمی‌کند؛ پر شدن localStorage یا محدودیت مرورگر
 * نباید باعث از بین رفتن flow ثبت پرونده شود.
 */
export function saveCaseDraft<T>(
  data: T,
): void {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    const payload:
      CaseDraftEnvelope<T> = {
        version:
          CASE_DRAFT_VERSION,

        savedAt:
          new Date().toISOString(),

        data,
      }

    window.localStorage.setItem(
      CASE_DRAFT_KEY,
      JSON.stringify(payload),
    )
  } catch {
    // Draft یک قابلیت کمکی است و خطای storage نباید submit فرم را متوقف کند.
  }
}

/**
 * Draft ذخیره‌شده را می‌خواند.
 *
 * برای سازگاری با نسخه قبلی، اگر localStorage مستقیماً خود فرم
 * را ذخیره کرده باشد نیز همان داده برگردانده می‌شود.
 */
export function loadCaseDraft<T =
  unknown>(): T | null {
  if (!canUseLocalStorage()) {
    return null
  }

  let value: string | null = null

  try {
    value =
      window.localStorage.getItem(
        CASE_DRAFT_KEY,
      )
  } catch {
    return null
  }

  if (!value) {
    return null
  }

  try {
    const parsed:
      unknown =
      JSON.parse(value)

    if (
      parsed &&
      typeof parsed === 'object' &&
      'data' in parsed &&
      'version' in parsed
    ) {
      return (
        parsed as
          CaseDraftEnvelope<T>
      ).data
    }

    /**
     * فرمت قدیمی:
     * localStorage.setItem(key, JSON.stringify(formData))
     */
    return parsed as T
  } catch {
    /**
     * Draft خراب را حذف می‌کنیم تا در ورودهای بعدی
     * دوباره باعث خطای restore نشود.
     */
    try {
      window.localStorage.removeItem(
        CASE_DRAFT_KEY,
      )
    } catch {
      // ignore storage cleanup errors
    }

    return null
  }
}

/**
 * حذف Draft فقط بعد از ثبت موفق پرونده یا اقدام صریح کاربر.
 */
export function clearCaseDraft(): void {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    window.localStorage.removeItem(
      CASE_DRAFT_KEY,
    )
  } catch {
    // ignore storage errors
  }
}