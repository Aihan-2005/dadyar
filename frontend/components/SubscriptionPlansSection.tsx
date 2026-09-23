'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  CheckCircle2,
  Gift,
  Loader2,
  RefreshCcw,
} from 'lucide-react'

import {
  formatSubscriptionDuration,
  formatSubscriptionPrice,
  getSubscriptionFeatureLabel,
  getSubscriptionPlanFinalPrice,
  getSubscriptionTierLabel,
  isSubscriptionPlanHighlighted,
  type SubscriptionPlan,
} from '@/lib/subscription-plans'

import {
  getPublicSubscriptionPlans,
  getPublicSubscriptionSettings,
} from '@/services/subscription-plan.service'


export default function SubscriptionPlansSection() {
  const [
    plans,
    setPlans,
  ] =
    useState<
      SubscriptionPlan[]
    >([])

  const [
    trialDays,
    setTrialDays,
  ] =
    useState<number | null>(
      null,
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )


  const loadPlans =
    useCallback(
      async () => {
        try {
          setLoading(
            true,
          )

          setError(
            null,
          )

          const [
            plansResult,
            settingsResult,
          ] =
            await Promise.allSettled([
              getPublicSubscriptionPlans(),
              getPublicSubscriptionSettings(),
            ])

          if (
            plansResult.status ===
            'rejected'
          ) {
            throw plansResult.reason
          }

          setPlans(
            plansResult.value,
          )

          setTrialDays(
            settingsResult.status ===
              'fulfilled'
              ? settingsResult
                  .value
                  ?.trialDays ??
                null
              : null,
          )
        } catch (
          caughtError:
            unknown
        ) {
          setPlans([])

          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت پلن‌ها ناموفق بود.',
          )
        } finally {
          setLoading(
            false,
          )
        }
      },

      [],
    )


  useEffect(
    () => {
      void loadPlans()
    },

    [
      loadPlans,
    ],
  )


  return (
    <section
      id="plans"
      className="scroll-mt-20 bg-slate-200/60 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black text-blue-700">
            پلن‌های پنل وکلا
          </p>

          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            پلن مناسب دفترت را انتخاب کن
          </h2>

          <p className="mt-4 text-base font-medium leading-8 text-slate-700">
            پلن مورد نیاز خود را بر اساس مدت، امکانات و هزینه انتخاب کنید.
          </p>
        </div>


        {
          trialDays !==
            null &&
          (
            <div className="mx-auto mt-8 max-w-4xl rounded-[24px] border border-emerald-200 bg-gradient-to-l from-emerald-50 to-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Gift
                    size={23}
                  />
                </div>

                <div>
                  <p className="text-lg font-black text-slate-950">
                    شروع کار با
                    {' '}
                    {
                      new Intl.NumberFormat(
                        'fa-IR',
                      ).format(
                        trialDays,
                      )
                    }
                    {' '}
                    روز استفاده رایگان
                  </p>

                  <p className="mt-1 text-sm font-semibold leading-7 text-slate-600">
                    اگر برای اولین بار به‌عنوان وکیل در دادیار ثبت‌نام می‌کنید، دوره رایگان شما از زمان ساخت حساب فعال می‌شود و برای شروع نیازی به خرید فوری پلن ندارید.
                  </p>
                </div>
              </div>
            </div>
          )
        }


        {
          loading
            ? (
              <div className="mt-10 flex min-h-64 items-center justify-center rounded-[28px] border border-slate-300 bg-white">
                <div className="text-center">
                  <Loader2
                    size={28}
                    className="mx-auto animate-spin text-blue-600"
                  />

                  <p className="mt-3 text-sm font-black text-slate-600">
                    در حال دریافت پلن‌ها...
                  </p>
                </div>
              </div>
            )
            : error
              ? (
                <div className="mx-auto mt-10 max-w-xl rounded-[24px] border border-red-200 bg-red-50 p-6 text-center">
                  <p className="text-sm font-bold leading-7 text-red-700">
                    {
                      error
                    }
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      void loadPlans()
                    }}
                    className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white"
                  >
                    <RefreshCcw
                      size={16}
                    />

                    تلاش دوباره
                  </button>
                </div>
              )
              : plans.length ===
                0
                ? (
                  <div className="mx-auto mt-10 max-w-xl rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
                    <p className="font-black text-slate-800">
                      در حال حاضر پلن فعالی وجود ندارد.
                    </p>
                  </div>
                )
                : (
                  <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {
                      plans.map(
                        (
                          plan,
                        ) => (
                          <SubscriptionPlanCard
                            key={
                              plan.id
                            }
                            plan={
                              plan
                            }
                          />
                        ),
                      )
                    }
                  </div>
                )
        }
      </div>
    </section>
  )
}


function SubscriptionPlanCard({
  plan,
}: {
  plan:
    SubscriptionPlan
}) {
  const highlighted =
    isSubscriptionPlanHighlighted(
      plan,
    )

  const finalPrice =
    getSubscriptionPlanFinalPrice(
      plan,
    )

  const hasDiscount =
    plan.discountPercent >
      0 &&
    finalPrice <
      plan.price


  return (
    <article
      className={`relative flex min-h-[500px] flex-col rounded-[30px] border p-6 transition hover:-translate-y-1 hover:shadow-xl ${
        highlighted
          ? 'border-blue-400 bg-gradient-to-b from-blue-50 to-white shadow-lg shadow-blue-200/50'
          : 'border-slate-300 bg-white shadow-sm'
      }`}
    >
      {
        highlighted &&
        (
          <span className="absolute -top-3 right-6 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-black text-white">
            پیشنهاد دادیار
          </span>
        )
      }

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {
            getSubscriptionTierLabel(
              plan.tier,
            )
          }
        </span>

        {
          plan.tags.map(
            (
              tag,
            ) => (
              <span
                key={
                  tag
                }
                className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600"
              >
                {
                  tag
                }
              </span>
            ),
          )
        }
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        {
          plan.title
        }
      </h3>

      <p className="mt-3 min-h-[56px] text-sm font-medium leading-7 text-slate-700">
        {
          plan.description
        }
      </p>

      <div className="my-6 border-y border-slate-200 py-5">
        {
          hasDiscount &&
          (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400 line-through">
                {
                  formatSubscriptionPrice(
                    plan.price,
                  )
                }
              </span>

              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-600">
                {
                  new Intl.NumberFormat(
                    'fa-IR',
                  ).format(
                    plan.discountPercent,
                  )
                }
                ٪ تخفیف
              </span>
            </div>
          )
        }

        <p className="text-2xl font-black text-slate-950">
          {
            formatSubscriptionPrice(
              finalPrice,
            )
          }
        </p>

        <p className="mt-3 text-sm font-black text-blue-700">
          مدت:
          {' '}
          {
            formatSubscriptionDuration(
              plan,
            )
          }
        </p>
      </div>

      <ul className="flex-1 space-y-3">
        {
          plan.features.map(
            (
              feature,
            ) => (
              <li
                key={
                  feature
                }
                className="flex items-start gap-3 text-sm font-bold leading-6 text-slate-700"
              >
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                {
                  getSubscriptionFeatureLabel(
                    feature,
                  )
                }
              </li>
            ),
          )
        }
      </ul>

      <Link
        href={`/checkout?plan=${encodeURIComponent(
          plan.id,
        )}`}
        className={`mt-8 flex h-14 items-center justify-center rounded-2xl text-base font-black transition ${
          highlighted
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        انتخاب پلن
      </Link>
    </article>
  )
}