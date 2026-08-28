export type SubscriptionPlanKey =
  | 'free'
  | '1m'
  | '3m'
  | '6m'

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
        'دوره آزمایشی رایگان',

      shortTitle:
        'رایگان',

      price:
        '۰',

      period:
        '۱۴ روز',

      description:
        'دو هفته فرصت برای تجربه دادیار و بررسی امکانات اصلی سامانه بدون پرداخت هزینه.',

      action:
        'شروع ۱۴ روز رایگان',

      popular:
        false,

      features: [
        '۱۴ روز دسترسی رایگان',
        'مدیریت پرونده‌ها و موکلین',
        'مدیریت امور مالی',
        'بدون نیاز به پرداخت اولیه',
      ],
    },

    {
      key:
        '1m',

      title:
        'اشتراک ۱ ماهه',

      shortTitle:
        'پلن ۱ ماهه',

      price:
        '۲۹۹,۰۰۰',

      period:
        '۱ ماه',

      description:
        'برای وکلایی که می‌خواهند دادیار را بدون تعهد بلندمدت وارد جریان کاری دفتر کنند.',

      action:
        'انتخاب پلن ۱ ماهه',

      popular:
        false,

      features: [
        'دسترسی کامل به امکانات دادیار',
        'مدیریت نامحدود پرونده‌ها',
        'مدیریت موکلین',
        'گزارش و کنترل امور مالی',
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
        '۷۹۹,۰۰۰',

      period:
        '۳ ماه',

      description:
        'انتخاب متعادل برای استفاده مستمر از دادیار با هزینه کمتر نسبت به تمدید ماهانه.',

      action:
        'انتخاب پلن ۳ ماهه',

      popular:
        true,

      features: [
        'تمام امکانات پلن ماهانه',
        'حدود ۱۱٪ صرفه‌جویی',
        'مدیریت حرفه‌ای پرونده و موکل',
        'گزارش‌های مالی و مدیریتی',
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
        '۱,۳۹۹,۰۰۰',

      period:
        '۶ ماه',

      description:
        'اقتصادی‌ترین انتخاب فعلی دادیار برای دفاتری که استفاده بلندمدت و مستمر دارند.',

      action:
        'انتخاب پلن ۶ ماهه',

      popular:
        false,

      features: [
        'تمام امکانات حرفه‌ای دادیار',
        'حدود ۲۲٪ صرفه‌جویی',
        'دسترسی کامل به مدیریت مالی',
        'شش ماه استفاده بدون نیاز به تمدید',
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