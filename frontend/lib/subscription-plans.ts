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


  
    
  return /^[a-f\d]{24}$/i.test(
    normalized,
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

