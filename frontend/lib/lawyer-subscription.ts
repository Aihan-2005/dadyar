import type {
  LawyerSubscription,
  LawyerSubscriptionFeatureCode,
} from '@/types/lawyer-subscription'


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
      'نمایش در فهرست وکلای بخش موکلین',
  }


const TIER_LABELS:
  Record<
    string,
    string
  > = {
    TRIAL:
      'دوره رایگان',

    BASIC:
      'پایه',

    STANDARD:
      'استاندارد',

    PREMIUM:
      'حرفه‌ای',
  }


export function getSubscriptionFeatureLabel(
  code:
    LawyerSubscriptionFeatureCode,
): string {
  const normalized =
    code.trim()


  if (
    !normalized
  ) {
    return 'قابلیت نامشخص'
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
    return 'نامشخص'
  }


  return (
    TIER_LABELS[
      normalized
    ] ??
    normalized
  )
}


export function formatLawyerSubscriptionDuration(
  subscription:
    LawyerSubscription,
): string {
  const durationDays =
    Math.max(
      1,
      Math.round(
        subscription
          .planSnapshot
          .durationDays,
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


export function hasSubscriptionFeature(
  subscription:
    LawyerSubscription | null,

  feature:
    LawyerSubscriptionFeatureCode,
): boolean {
  if (
    !subscription ||
    subscription.status !==
      'ACTIVE'
  ) {
    return false
  }


  return subscription
    .planSnapshot
    .features
    .includes(
      feature,
    )
}


export function getSubscriptionFinalPrice(
  subscription:
    LawyerSubscription,
): number {
  const price =
    Math.max(
      0,

      Math.round(
        subscription
          .planSnapshot
          .price,
      ),
    )


  const discountPercent =
    Math.min(
      100,

      Math.max(
        0,

        Math.round(
          subscription
            .planSnapshot
            .discountPercent,
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


export function getRemainingSubscriptionDays(
  subscription:
    LawyerSubscription,
): number {
  if (
    subscription.status !==
      'ACTIVE'
  ) {
    return 0
  }


  const endsAt =
    new Date(
      subscription.endsAt,
    )


  if (
    Number.isNaN(
      endsAt.getTime(),
    )
  ) {
    return 0
  }


  const remainingMs =
    endsAt.getTime() -
    Date.now()


  if (
    remainingMs <=
    0
  ) {
    return 0
  }


  return Math.ceil(
    remainingMs /
      (
        24 *
        60 *
        60 *
        1000
      ),
  )
}