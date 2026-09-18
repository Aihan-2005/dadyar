export interface SubscriptionPlan {
  id: string

  title: string

  description: string

  tier: string

  tags: string[]

  durationMonths: number

  price: number

  discountPercent: number

  features: string[]

  isActive: boolean

  sortOrder: number

  createdAt?: string

  updatedAt?: string
}


/*
|--------------------------------------------------------------------------
| Legacy auth compatibility
|--------------------------------------------------------------------------
|
| قبلاً پلن‌ها با keyهای ثابت مثل:
|
| trial
| monthly
| three_month
| six_month
|
| در Frontend تعریف می‌شدند.
|
| حالا source of truth خود Backend و MongoDB است و مقدار plan
| در URL در واقع ID پلن است.
|
| این alias فقط برای جلوگیری از شکستن componentهای قدیمی Auth است.
| از این به بعد SubscriptionPlanKey عملاً همان subscription plan id است.
|
|--------------------------------------------------------------------------
*/

export type SubscriptionPlanKey =
  string


const FEATURE_LABELS:
  Record<
    string,
    string
  > = {
    CASE_MANAGEMENT:
      'مدیریت پرونده‌ها',

    FINANCIAL_REPORTS:
      'گزارش‌های مالی',

    SCHEDULING:
      'زمان‌بندی و مدیریت قرارها',

    ONLINE_MEETINGS:
      'جلسات آنلاین',

    CLIENT_DIRECTORY_VISIBILITY:
      'نمایش در جستجوی وکلا',
  }


const TIER_LABELS:
  Record<
    string,
    string
  > = {
    BASIC:
      'پایه',

    STANDARD:
      'استاندارد',

    PREMIUM:
      'حرفه‌ای',
  }


const HIGHLIGHT_TAGS =
  new Set<string>([
    'پیشنهاد',
    'پیشنهادی',
    'ویژه',
    'محبوب',
    'recommended',
    'popular',
  ])


/*
|--------------------------------------------------------------------------
| Plan ID
|--------------------------------------------------------------------------
*/

export function isSubscriptionPlanId(
  value:
    string |
    null |
    undefined,
): value is string {
  if (
    typeof value !==
    'string'
  ) {
    return false
  }


  const normalized =
    value.trim()


  /*
   * SubscriptionPlanهای Backend روی MongoDB هستند.
   * بنابراین ObjectId باید دقیقاً 24 کاراکتر hexadecimal باشد.
   */
  return /^[a-f\d]{24}$/i.test(
    normalized,
  )
}


/*
|--------------------------------------------------------------------------
| Backward-compatible alias
|--------------------------------------------------------------------------
|
| login/register/forgot-password فعلی هنوز این تابع را import می‌کنند.
|
| به‌جای برگرداندن keyهای fake قدیمی، همان Mongo ObjectId را validate
| می‌کنیم.
|
|--------------------------------------------------------------------------
*/

export function isSubscriptionPlanKey(
  value:
    string |
    null |
    undefined,
): value is SubscriptionPlanKey {
  return isSubscriptionPlanId(
    value,
  )
}


/*
|--------------------------------------------------------------------------
| Legacy synchronous lookup
|--------------------------------------------------------------------------
|
| پلن‌ها دیگر داخل Frontend hard-code نیستند و از Backend می‌آیند.
| بنابراین lookup واقعی نمی‌تواند synchronous باشد.
|
| auth-form قدیمی فقط از getSubscriptionPlan برای نمایش title در banner
| استفاده می‌کند و برای logic خرید به آن وابسته نیست.
|
| برای جلوگیری از برگرداندن اطلاعات جعلی، این تابع عمداً undefined
| برمی‌گرداند.
|
| selectedPlanKey همچنان در sessionStorage حفظ می‌شود و Mongo ID واقعی
| از بین نمی‌رود.
|
| در مرحله اتصال purchase API، auth-form را مستقیماً به async service
| پلن متصل می‌کنیم و این compatibility function قابل حذف خواهد بود.
|
|--------------------------------------------------------------------------
*/

export function getSubscriptionPlan(
  key:
    SubscriptionPlanKey,
):
  | SubscriptionPlan
  | undefined {
  if (
    !isSubscriptionPlanId(
      key,
    )
  ) {
    return undefined
  }


  return undefined
}


/*
|--------------------------------------------------------------------------
| Feature labels
|--------------------------------------------------------------------------
*/

export function getSubscriptionFeatureLabel(
  code:
    string,
): string {
  const normalized =
    code.trim()


  if (
    !normalized
  ) {
    return ''
  }


  return (
    FEATURE_LABELS[
      normalized
    ] ??
    normalized
  )
}


/*
|--------------------------------------------------------------------------
| Tier labels
|--------------------------------------------------------------------------
*/

export function getSubscriptionTierLabel(
  tier:
    string,
): string {
  const normalized =
    tier.trim()


  if (
    !normalized
  ) {
    return ''
  }


  return (
    TIER_LABELS[
      normalized
    ] ??
    normalized
  )
}


/*
|--------------------------------------------------------------------------
| Pricing
|--------------------------------------------------------------------------
*/

export function getSubscriptionPlanFinalPrice(
  plan:
    Pick<
      SubscriptionPlan,
      | 'price'
      | 'discountPercent'
    >,
): number {
  const price =
    Math.max(
      0,

      Math.round(
        Number.isFinite(
          plan.price,
        )
          ? plan.price
          : 0,
      ),
    )


  const discountPercent =
    Math.min(
      100,

      Math.max(
        0,

        Math.round(
          Number.isFinite(
            plan.discountPercent,
          )
            ? plan.discountPercent
            : 0,
        ),
      ),
    )


  if (
    discountPercent ===
    0
  ) {
    return price
  }


  return Math.max(
    0,

    Math.round(
      price *
        (
          1 -
          discountPercent /
            100
        ),
    ),
  )
}


export function getSubscriptionPlanDiscountAmount(
  plan:
    Pick<
      SubscriptionPlan,
      | 'price'
      | 'discountPercent'
    >,
): number {
  const price =
    Math.max(
      0,

      Math.round(
        Number.isFinite(
          plan.price,
        )
          ? plan.price
          : 0,
      ),
    )


  return Math.max(
    0,

    price -
      getSubscriptionPlanFinalPrice(
        plan,
      ),
  )
}


/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

export function formatSubscriptionPrice(
  value:
    number,
): string {
  const normalized =
    Math.max(
      0,

      Math.round(
        Number.isFinite(
          value,
        )
          ? value
          : 0,
      ),
    )


  if (
    normalized ===
    0
  ) {
    return 'رایگان'
  }


  return `${new Intl.NumberFormat(
    'fa-IR',
  ).format(
    normalized,
  )} تومان`
}


export function formatSubscriptionDuration(
  durationMonths:
    number,
): string {
  const normalized =
    Math.max(
      1,

      Math.round(
        Number.isFinite(
          durationMonths,
        )
          ? durationMonths
          : 1,
      ),
    )


  return `${new Intl.NumberFormat(
    'fa-IR',
  ).format(
    normalized,
  )} ماه`
}


/*
|--------------------------------------------------------------------------
| Highlighting
|--------------------------------------------------------------------------
|
| Backend فعلاً فیلد dedicated مثل isPopular ندارد.
| برای نمایش badge می‌توان از tagهای واقعی ثبت‌شده توسط Admin استفاده کرد.
|
|--------------------------------------------------------------------------
*/

export function isSubscriptionPlanHighlighted(
  plan:
    Pick<
      SubscriptionPlan,
      'tags'
    >,
): boolean {
  return plan.tags.some(
    (
      tag,
    ) => {
      const normalized =
        tag
          .trim()
          .toLocaleLowerCase(
            'fa-IR',
          )


      return HIGHLIGHT_TAGS.has(
        normalized,
      )
    },
  )
}

