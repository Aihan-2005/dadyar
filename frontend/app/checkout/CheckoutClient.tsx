'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  useSearchParams,
} from 'next/navigation'

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

import OrderSummary from '@/components/payment/OrderSummary'

import {
  formatSubscriptionDuration,
  getSubscriptionFeatureLabel,
  getSubscriptionPlanDiscountAmount,
  getSubscriptionPlanFinalPrice,
  isSubscriptionPlanId,
  type SubscriptionPlan,
} from '@/lib/subscription-plans'

import {
  getPublicSubscriptionPlan,
} from '@/services/subscription-plan.service'

export default function CheckoutClient() {
  const searchParams =
    useSearchParams()

  const planParam =
    searchParams.get(
      'plan',
    )

  const [
    plan,
    setPlan,
  ] =
    useState<SubscriptionPlan | null>(
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

  useEffect(
    () => {
      let active =
        true

      async function loadPlan() {
        try {
          setLoading(
            true,
          )

          setError(
            null,
          )

          if (
            !isSubscriptionPlanId(
              planParam,
            )
          ) {
            if (
              active
            ) {
              setPlan(
                null,
              )

              setError(
                'شناسه پلن انتخاب‌شده معتبر نیست.',
              )
            }

            return
          }

          const result =
            await getPublicSubscriptionPlan(
              planParam,
            )

          if (
            !active
          ) {
            return
          }

          if (
            !result
          ) {
            setPlan(
              null,
            )

            setError(
              'این پلن وجود ندارد یا دیگر فعال نیست.',
            )

            return
          }

          setPlan(
            result,
          )
        } catch (
          caughtError:
            unknown
        ) {
          if (
            active
          ) {
            setPlan(
              null,
            )

            setError(
              caughtError instanceof
                Error
                ? caughtError.message
                : 'دریافت اطلاعات پلن ناموفق بود.',
            )
          }
        } finally {
          if (
            active
          ) {
            setLoading(
              false,
            )
          }
        }
      }

      void loadPlan()

      return () => {
        active =
          false
      }
    },
    [
      planParam,
    ],
  )

  const finalPrice =
    useMemo(
      () =>
        plan
          ? getSubscriptionPlanFinalPrice(
              plan,
            )
          : 0,
      [
        plan,
      ],
    )

  const discountAmount =
    useMemo(
      () =>
        plan
          ? getSubscriptionPlanDiscountAmount(
              plan,
            )
          : 0,
      [
        plan,
      ],
    )

  if (
    loading
  ) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-100 px-4"
      >
        <div className="rounded-3xl border border-slate-200 bg-white px-10 py-8 text-center shadow-sm">
          <Loader2
            size={28}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-4 font-black text-slate-700">
            در حال دریافت اطلاعات پلن...
          </p>
        </div>
      </main>
    )
  }

  if (
    !plan
  ) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-100 px-4"
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-black text-slate-950">
            پلن انتخابی در دسترس نیست
          </h1>

          <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
            {error ??
              'ممکن است این پلن توسط مدیریت غیرفعال شده باشد.'}
          </p>

          <Link
            href="/#plans"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
          >
            <ArrowRight
              size={17}
            />

            بازگشت به پلن‌ها
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 py-10"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
        <section className="space-y-5">
          <OrderSummary
            title={
              plan.title
            }
            duration={
              formatSubscriptionDuration(
                plan.durationMonths,
              )
            }
            price={
              plan.price
            }
            discount={
              discountAmount
            }
          />

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-black text-slate-950">
              امکانات این پلن
            </h2>

            <ul className="mt-5 space-y-3">
              {plan.features.map(
                (feature) => (
                  <li
                    key={
                      feature
                    }
                    className="flex items-start gap-2 text-sm font-bold leading-7 text-slate-700"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-1 shrink-0 text-emerald-600"
                    />

                    {getSubscriptionFeatureLabel(
                      feature,
                    )}
                  </li>
                ),
              )}
            </ul>
          </div>
        </section>

        <section className="h-fit rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-black text-blue-700">
            تأیید سفارش
          </p>

          <h1 className="mt-2 text-2xl font-black text-slate-900">
            {plan.title}
          </h1>

          <p className="mt-4 leading-8 text-slate-600">
            اطلاعات قیمت و شرایط این پلن مستقیماً
            از تنظیمات ثبت‌شده توسط مدیریت دادیار
            دریافت شده است.
          </p>

          {plan.tags.length >
            0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {plan.tags.map(
                (tag) => (
                  <span
                    key={
                      tag
                    }
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-500">
                مبلغ نهایی
              </span>

              <strong className="text-xl font-black text-slate-950">
                {finalPrice ===
                0
                  ? 'رایگان'
                  : `${new Intl.NumberFormat(
                      'fa-IR',
                    ).format(
                      finalPrice,
                    )} تومان`}
              </strong>
            </div>
          </div>

          {/*
           * Backend فعلی فقط مدیریت SubscriptionPlan دارد.
           * هیچ purchase/order/payment endpoint واقعی در main وجود ندارد.
           *
           * بنابراین عمداً fake payment موفق تولید نمی‌کنیم.
           */}
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-black text-amber-800">
              مرحله پرداخت هنوز به API خرید متصل نشده است.
            </p>

            <p className="mt-2 text-xs font-semibold leading-6 text-amber-700">
              انتخاب پلن، قیمت، تخفیف و امکانات واقعی هستند؛
              برای ثبت خرید و پرداخت باید Backend endpoint
              مربوط به سفارش و پرداخت اضافه شود.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="mt-6 flex h-14 w-full cursor-not-allowed items-center justify-center rounded-2xl bg-slate-300 font-black text-slate-600"
          >
            پرداخت پس از اتصال API خرید فعال می‌شود
          </button>

          <Link
            href="/#plans"
            className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            انتخاب پلن دیگر
          </Link>
        </section>
      </div>
    </main>
  )
}