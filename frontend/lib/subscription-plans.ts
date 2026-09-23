export interface SubscriptionPlan {
  id:
    string

  title:
    string

  description:
    string

  tier:
    string

  tags:
    string[]
 
  durationDays:
    number

 
  durationMonths:
    number

  price:
    number

  discountPercent:
    number

  features:
    string[]

  isActive:
    boolean

  sortOrder:
    number

  createdAt?:
    string

  updatedAt?:
    string
}


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
      'زمان‌بندی و رزرو',

    ONLINE_MEETINGS:
      'جلسات آنلاین',

    CLIENT_DIRECTORY_VISIBILITY:
      'نمایش در فهرست وکلا',
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


export function isSubscriptionPlanId(
  value:
    string |
    null |
    undefined,
): value is string {
  return (
    typeof value ===
      'string' &&
    /^[a-f\d]{24}$/i.test(
      value.trim(),
    )
  )
}


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

 
export function getSubscriptionPlan(
  _key:
    SubscriptionPlanKey,
):
  | SubscriptionPlan
  | undefined {
  return undefined
}


export function getSubscriptionFeatureLabel(
  code:
    string,
): string {
  const normalized =
    code.trim()

  return (
    FEATURE_LABELS[
      normalized
    ] ??
    normalized
  )
}


export function getSubscriptionTierLabel(
  tier:
    string,
): string {
  const normalized =
    tier.trim()

  return (
    TIER_LABELS[
      normalized
    ] ??
    normalized
  )
}


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
        plan.price,
      ),
    )

  const discount =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          plan.discountPercent,
        ),
      ),
    )

  return Math.max(
    0,
    Math.round(
      price *
        (
          1 -
          discount /
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
  return Math.max(
    0,

    plan.price -
      getSubscriptionPlanFinalPrice(
        plan,
      ),
  )
}


export function formatSubscriptionPrice(
  value:
    number,
): string {
  const normalized =
    Math.max(
      0,
      Math.round(
        value,
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
  input:
    | SubscriptionPlan
    | number,
): string {
  const durationDays =
    typeof input ===
      'number'
      ? Math.max(
          1,
          Math.round(
            input *
              30,
          ),
        )
      : Math.max(
          1,
          Math.round(
            input.durationDays,
          ),
        )

  if (
    durationDays %
      30 ===
    0
  ) {
    return `${new Intl.NumberFormat(
      'fa-IR',
    ).format(
      durationDays /
        30,
    )} ماه`
  }

  if (
    durationDays %
      7 ===
    0
  ) {
    return `${new Intl.NumberFormat(
      'fa-IR',
    ).format(
      durationDays /
        7,
    )} هفته`
  }

  return `${new Intl.NumberFormat(
    'fa-IR',
  ).format(
    durationDays,
  )} روز`
}


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
    ) =>
      HIGHLIGHT_TAGS.has(
        tag
          .trim()
          .toLocaleLowerCase(
            'fa-IR',
          ),
      ),
  )
}