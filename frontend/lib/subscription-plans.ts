export type SubscriptionPlanKey =
  | 'free'
  | '3m'
  | '6m'
  | '12m'

export type SubscriptionPlan = {
  key:
    SubscriptionPlanKey

  title:
    string

  shortTitle:
    string

  price:
    string

  period:
    string

  description:
    string

  action:
    string

  popular:
    boolean

  features:
    string[]
}

export const SUBSCRIPTION_PLANS:
  readonly SubscriptionPlan[] = [
    {
      key:
        'free',

      title:
        'رایگان (تستی)',

      shortTitle:
        'دوره رایگان',

      price:
        '۰',

      period:
        '۵ روز',

      description:
        'برای آشنایی با محیط دادیار و تجربه امکانات اصلی سامانه.',

      action:
        'شروع دوره رایگان',

      popular:
        false,

      features: [
        'مدیریت پرونده‌ها',
        'مدیریت موکلین',
        'گزارش مالی',
      ],
    },

    {
      key:
        '3m',

      title:
        'اشتراک ۳ ماهه',

      shortTitle:
        'پلن ۳ ماهه',

      price:
        '۴۵۰,۰۰۰',

      period:
        '۳ ماه',

      description:
        'انتخاب مناسب برای شروع استفاده حرفه‌ای از دادیار.',

      action:
        'انتخاب این پلن',

      popular:
        false,

      features: [
        'مدیریت نامحدود پرونده',
        'مدیریت امور مالی',
        'پیگیری اطلاعات دفتر',
      ],
    },

    {
      key:
        '6m',

      title:
        'اشتراک ۶ ماهه',

      shortTitle:
        'پلن ۶ ماهه',

      price:
        '۸۰۰,۰۰۰',

      period:
        '۶ ماه',

      description:
        'گزینه اقتصادی برای استفاده مستمر و مدیریت حرفه‌ای دفتر.',

      action:
        'انتخاب این پلن',

      popular:
        true,

      features: [
        'تمام امکانات دادیار',
        'گزارش‌های مالی',
        'مدیریت حرفه‌ای موکلین',
      ],
    },

    {
      key:
        '12m',

      title:
        'اشتراک یک ساله',

      shortTitle:
        'پلن یک ساله',

      price:
        '۱,۴۰۰,۰۰۰',

      period:
        '۱۲ ماه',

      description:
        'بیشترین صرفه اقتصادی برای استفاده بلندمدت از دادیار.',

      action:
        'انتخاب این پلن',

      popular:
        false,

      features: [
        'دسترسی کامل یک‌ساله',
        'تمام امکانات حرفه‌ای',
        'بیشترین صرفه اقتصادی',
      ],
    },
  ]

export function isSubscriptionPlanKey(
  value:
    unknown
): value is SubscriptionPlanKey {
  return SUBSCRIPTION_PLANS.some(
    (plan) =>
      plan.key ===
      value
  )
}

export function getSubscriptionPlan(
  key:
    SubscriptionPlanKey
): SubscriptionPlan {
  const plan =
    SUBSCRIPTION_PLANS.find(
      (item) =>
        item.key ===
        key
    )

  if (!plan) {
    throw new Error(
      `Unknown subscription plan: ${key}`
    )
  }

  return plan
}

