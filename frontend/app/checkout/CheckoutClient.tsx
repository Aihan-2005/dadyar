'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  ShieldCheck,
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
  getCurrentLawyerSubscription,
} from '@/services/lawyer-subscription.service'

import {
  createSubscriptionPayment,
} from '@/services/payment.service'

import {
  getCachedPublicSubscriptionPlan,
  getPublicSubscriptionPlan,
} from '@/services/subscription-plan.service'

import { useAuthStore } from '@/store/auth.store'

import type {
  LawyerSubscription,
} from '@/types/lawyer-subscription'

const priceFormatter =
  new Intl.NumberFormat('fa-IR')

const dateFormatter =
  new Intl.DateTimeFormat(
    'fa-IR',
    {
      dateStyle: 'medium',
    },
  )

function formatDate(
  value: string,
): string {
  const date =
    new Date(value)

  return Number.isNaN(
    date.getTime(),
  )
    ? '—'
    : dateFormatter.format(
        date,
      )
}

function formatPrice(
  value: number,
): string {
  return value === 0
    ? 'رایگان'
    : `${priceFormatter.format(
        value,
      )} تومان`
}

export default function CheckoutClient() {
  const searchParams =
    useSearchParams()

  const planParam =
    searchParams.get(
      'plan',
    )

  const user =
    useAuthStore(
      (state) =>
        state.user,
    )

  const hasHydrated =
    useAuthStore(
      (state) =>
        state.hasHydrated,
    )

  const isInitialized =
    useAuthStore(
      (state) =>
        state.isInitialized,
    )

  const isSessionChecking =
    useAuthStore(
      (state) =>
        state.isSessionChecking,
    )

  const initialize =
    useAuthStore(
      (state) =>
        state.initialize,
    )

  const cachedPlan =
    useMemo(
      () =>
        getCachedPublicSubscriptionPlan(
          planParam,
        ),
      [planParam],
    )

  const [
    plan,
    setPlan,
  ] =
    useState<SubscriptionPlan | null>(
      cachedPlan,
    )

  const [
    loading,
    setLoading,
  ] =
    useState(
      !cachedPlan,
    )

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    currentSubscription,
    setCurrentSubscription,
  ] =
    useState<LawyerSubscription | null>(
      null,
    )

  const [
    subscriptionLoading,
    setSubscriptionLoading,
  ] =
    useState(false)

  const [
    subscriptionChecked,
    setSubscriptionChecked,
  ] =
    useState(false)

  const [
    paymentError,
    setPaymentError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    paying,
    setPaying,
  ] =
    useState(false)

  useEffect(() => {
    if (
      hasHydrated &&
      !isInitialized &&
      !isSessionChecking
    ) {
      void initialize()
    }
  }, [
    hasHydrated,
    initialize,
    isInitialized,
    isSessionChecking,
  ])

  useEffect(() => {
    let cancelled =
      false

    async function loadPlan() {
      setError(null)

      if (
        !isSubscriptionPlanId(
          planParam,
        )
      ) {
        if (!cancelled) {
          setPlan(null)

          setError(
            'شناسه پلن انتخاب‌شده معتبر نیست.',
          )

          setLoading(false)
        }

        return
      }

      const cached =
        getCachedPublicSubscriptionPlan(
          planParam,
        )

      if (cached) {
        setPlan(cached)
        setLoading(false)

        return
      }

      try {
        setLoading(true)

        const result =
          await getPublicSubscriptionPlan(
            planParam,
          )

        if (cancelled) {
          return
        }

        if (!result) {
          setPlan(null)

          setError(
            'این پلن وجود ندارد یا دیگر فعال نیست.',
          )

          return
        }

        setPlan(result)
      } catch (
        caughtError: unknown
      ) {
        if (!cancelled) {
          setPlan(null)

          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت اطلاعات پلن ناموفق بود.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadPlan()

    return () => {
      cancelled =
        true
    }
  }, [planParam])

  const loadCurrentSubscription =
    useCallback(
      async () => {
        if (
          !user ||
          user.role !==
            'LAWYER'
        ) {
          setCurrentSubscription(
            null,
          )

          setSubscriptionChecked(
            true,
          )

          return
        }

        try {
          setSubscriptionLoading(
            true,
          )

          setSubscriptionChecked(
            false,
          )

          setPaymentError(
            null,
          )

          const subscription =
            await getCurrentLawyerSubscription()

          setCurrentSubscription(
            subscription,
          )
        } catch (
          caughtError: unknown
        ) {
          setCurrentSubscription(
            null,
          )

          setPaymentError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'بررسی وضعیت اشتراک ناموفق بود.',
          )
        } finally {
          setSubscriptionLoading(
            false,
          )

          setSubscriptionChecked(
            true,
          )
        }
      },
      [user],
    )

  useEffect(() => {
    if (
      !hasHydrated ||
      !isInitialized ||
      isSessionChecking
    ) {
      return
    }

    void loadCurrentSubscription()
  }, [
    hasHydrated,
    isInitialized,
    isSessionChecking,
    loadCurrentSubscription,
  ])

  const finalPrice =
    useMemo(
      () =>
        plan
          ? getSubscriptionPlanFinalPrice(
              plan,
            )
          : 0,
      [plan],
    )

  const discountAmount =
    useMemo(
      () =>
        plan
          ? getSubscriptionPlanDiscountAmount(
              plan,
            )
          : 0,
      [plan],
    )

  const authLoading =
    !hasHydrated ||
    !isInitialized ||
    isSessionChecking

  const canPay =
    Boolean(plan) &&
    !authLoading &&
    !subscriptionLoading &&
    subscriptionChecked &&
    user?.role ===
      'LAWYER' &&
    !currentSubscription &&
    finalPrice > 0 &&
    !paying

  const handlePayment =
    async () => {
      if (
        !plan ||
        paying
      ) {
        return
      }

      setPaymentError(null)

      if (!user) {
        setPaymentError(
          'برای خرید پلن ابتدا وارد حساب وکیل شوید.',
        )

        return
      }

      if (
        user.role !==
        'LAWYER'
      ) {
        setPaymentError(
          'خرید اشتراک پنل فقط برای حساب وکیل امکان‌پذیر است.',
        )

        return
      }

      if (
        !subscriptionChecked ||
        subscriptionLoading
      ) {
        setPaymentError(
          'وضعیت اشتراک شما هنوز در حال بررسی است.',
        )

        return
      }

      if (
        currentSubscription
      ) {
        setPaymentError(
          'در حال حاضر اشتراک فعالی دارید. خرید پلن جدید پس از پایان اشتراک فعلی امکان‌پذیر است.',
        )

        return
      }

      if (
        finalPrice <= 0
      ) {
        setPaymentError(
          'این پلن نیاز به پرداخت ندارد.',
        )

        return
      }

      try {
        setPaying(true)

        const payment =
          await createSubscriptionPayment(
            plan.id,
          )
          const expectedAmountRial =
  finalPrice *
  10

if (
  payment.currency !==
    'IRR' ||
  payment.amount !==
    expectedAmountRial
) {
  throw new Error(
    'مبلغ ایجادشده برای پرداخت با مبلغ سفارش مطابقت ندارد. لطفاً دوباره تلاش کنید.',
  )
}

        window.sessionStorage.setItem(
          'dadyar:last-payment-id',
          payment.paymentId,
        )

        window.sessionStorage.setItem(
          'dadyar:last-payment-plan',
          plan.id,
        )

        
        window.location.assign(
          payment.redirectUrl,
        )
      } catch (
        caughtError: unknown
      ) {
        setPaymentError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'ایجاد پرداخت ناموفق بود.',
        )

        setPaying(false)
      }
    }

  if (loading) {
    return (
      <CheckoutLoading />
    )
  }

  if (!plan) {
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
            {
              error ??
              'ممکن است این پلن توسط مدیریت غیرفعال شده باشد.'
            }
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
                plan,
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
              {
                plan.features.map(
                  (feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm font-bold leading-7 text-slate-700"
                    >
                      <CheckCircle2
                        size={18}
                        className="mt-1 shrink-0 text-emerald-600"
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
          </div>
        </section>

        <section className="h-fit rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-black text-blue-700">
            تأیید سفارش
          </p>

          <h1 className="mt-2 text-2xl font-black text-slate-900">
            {
              plan.title
            }
          </h1>

          <p className="mt-4 leading-8 text-slate-600">
            پس از تأیید، به درگاه امن زرین‌پال منتقل می‌شوید.
            فعال‌سازی اشتراک فقط پس از تأیید موفق پرداخت توسط
            سرور انجام می‌شود.
          </p>

          {
            plan.tags.length >
              0 &&
            (
              <div className="mt-5 flex flex-wrap gap-2">
                {
                  plan.tags.map(
                    (tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"
                      >
                        {
                          tag
                        }
                      </span>
                    ),
                  )
                }
              </div>
            )
          }

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-500">
                مبلغ نهایی
              </span>

              <strong className="text-xl font-black text-slate-950">
                {
                  formatPrice(
                    finalPrice,
                  )
                }
              </strong>
            </div>
          </div>

          {
            authLoading &&
            (
              <StatusBox tone="blue">
                <Loader2
                  size={18}
                  className="shrink-0 animate-spin text-blue-600"
                />

                <p className="text-sm font-bold text-blue-800">
                  در حال بررسی حساب شما...
                </p>
              </StatusBox>
            )
          }

          {
            !authLoading &&
            !user &&
            (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-black text-amber-900">
                  برای خرید این پلن ابتدا وارد حساب وکیل شوید.
                </p>

                <p className="mt-2 text-xs font-semibold leading-6 text-amber-700">
                  اگر هنوز حساب ندارید، با ثبت‌نام دوره رایگان
                  اولیه شما فعال می‌شود و نیازی به خرید فوری پلن
                  ندارید.
                </p>

                <Link
                  href={`/login?plan=${encodeURIComponent(
                    plan.id,
                  )}`}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-amber-700 px-4 text-xs font-black text-white"
                >
                  <LockKeyhole
                    size={15}
                  />

                  ورود به حساب
                </Link>
              </div>
            )
          }

          {
            !authLoading &&
            user &&
            user.role !==
              'LAWYER' &&
            (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-800">
                پلن‌های اشتراکی این بخش فقط برای حساب وکیل قابل
                خرید هستند.
              </div>
            )
          }

          {
            !authLoading &&
            user?.role ===
              'LAWYER' &&
            subscriptionLoading &&
            (
              <StatusBox tone="neutral">
                <Loader2
                  size={18}
                  className="animate-spin text-blue-600"
                />

                <span className="text-sm font-bold text-slate-600">
                  در حال بررسی اشتراک فعلی...
                </span>
              </StatusBox>
            )
          }

          {
            !subscriptionLoading &&
            currentSubscription &&
            (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-700"
                  />

                  <div>
                    <p className="text-sm font-black text-emerald-900">
                      شما در حال حاضر اشتراک فعال دارید
                    </p>

                    <p className="mt-2 text-xs font-semibold leading-6 text-emerald-700">
                      {
                        currentSubscription
                          .planSnapshot
                          .title
                      }
                      {' تا '}
                      {
                        formatDate(
                          currentSubscription.endsAt,
                        )
                      }
                      {' فعال است.'}
                    </p>

                    <p className="mt-1 text-xs font-semibold leading-6 text-emerald-700">
                      خرید پلن جدید پس از پایان اشتراک فعلی امکان‌پذیر
                      است.
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          {
            paymentError &&
            (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-7 text-red-700">
                {
                  paymentError
                }
              </div>
            )
          }

          {
            user?.role ===
              'LAWYER' &&
            (
              <button
                type="button"
                disabled={
                  !canPay
                }
                onClick={() =>
                  void handlePayment()
                }
                className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                {
                  paying
                    ? (
                      <>
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />

                        در حال اتصال به زرین‌پال...
                      </>
                    )
                    : (
                      <>
                        <CreditCard
                          size={19}
                        />

                        پرداخت با زرین‌پال
                      </>
                    )
                }
              </button>
            )
          }

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400">
            <ShieldCheck
              size={14}
            />

            اطلاعات پرداخت توسط درگاه زرین‌پال پردازش می‌شود.
          </div>

          <Link
            href="/#plans"
            className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            انتخاب پلن دیگر
          </Link>
        </section>
      </div>
    </main>
  )
}

function CheckoutLoading() {
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

function StatusBox({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'blue' | 'neutral'
}) {
  const className =
    tone === 'blue'
      ? 'border-blue-200 bg-blue-50'
      : 'border-slate-200 bg-slate-50'

  return (
    <div
      className={`mt-5 flex items-center gap-3 rounded-2xl border p-4 ${className}`}
    >
      {children}
    </div>
  )
}