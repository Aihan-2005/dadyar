export const SUBSCRIPTION_PLAN_KEYS = [
  'trial',
  'monthly',
  'three_month',
  'six_month',
] as const


export type SubscriptionPlanKey =
  (typeof SUBSCRIPTION_PLAN_KEYS)[number]



export interface SubscriptionPlan {

  key: SubscriptionPlanKey

  title: string

  price: number

  priceLabel: string

  duration: string

  description: string

  features: readonly string[]

  popular: boolean

}



export const SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = [

  {
    key: 'trial',

    title: 'دوره آزمایشی',

    price: 0,

    priceLabel: 'رایگان',

    duration: '۱۴ روز',

    description:
      'تجربه کامل امکانات دادیار قبل از خرید اشتراک.',

    features: [
      'مدیریت پرونده‌ها',
      'مدیریت موکلین',
      'گزارش مالی',
      'مدیریت امور دفتر',
    ],

    popular: false,
  },


  {
    key: 'monthly',

    title: 'اشتراک یک ماهه',

    price: 250000,

    priceLabel:
      '۲۵۰,۰۰۰ تومان',

    duration:
      '۱ ماه',

    description:
      'شروع حرفه‌ای مدیریت دفتر وکالت.',

    features: [
      'مدیریت پرونده‌ها',
      'مدیریت موکلین',
      'گزارش مالی',
      'پشتیبانی',
    ],

    popular: false,
  },


  {
    key: 'three_month',

    title:
      'اشتراک سه ماهه',

    price:
      650000,

    priceLabel:
      '۶۵۰,۰۰۰ تومان',

    duration:
      '۳ ماه',

    description:
      'مناسب استفاده مستمر و حرفه‌ای.',

    features:[
      'تمام امکانات یک ماهه',
      'مدیریت قراردادها',
      'یادآورها',
      'امکانات حرفه‌ای',
    ],

    popular:false,
  },


  {
    key:'six_month',

    title:
      'اشتراک شش ماهه',

    price:
      1100000,

    priceLabel:
      '۱,۱۰۰,۰۰۰ تومان',

    duration:
      '۶ ماه',

    description:
      'بهترین انتخاب برای دفاتر فعال.',

    features:[
      'تمام امکانات دادیار',
      'گزارش‌های پیشرفته',
      'اولویت پشتیبانی',
      'امکانات آینده',
    ],

    popular:true,
  },

]





export function getSubscriptionPlan(
  key: SubscriptionPlanKey
){

  return SUBSCRIPTION_PLANS.find(
    plan =>
      plan.key === key
  )

}





export function isSubscriptionPlanKey(
  value:string | null | undefined
): value is SubscriptionPlanKey {


  return Boolean(

    value &&

    SUBSCRIPTION_PLAN_KEYS.includes(
      value as SubscriptionPlanKey
    )

  )

}



