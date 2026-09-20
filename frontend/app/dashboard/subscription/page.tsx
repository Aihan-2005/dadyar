'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Loader2,
  Package,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import {
  getRemainingSubscriptionDays,
  getSubscriptionFeatureLabel,
  getSubscriptionFinalPrice,
  getSubscriptionTierLabel,
} from '@/lib/lawyer-subscription'

import {
  getCurrentLawyerSubscription,
} from '@/services/lawyer-subscription.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  LawyerSubscription,
} from '@/types/lawyer-subscription'


function formatDateTime(
  value:
    string,
): string {
  if (
    !value
  ) {
    return '—'
  }


  const date =
    new Date(
      value,
    )


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—'
  }


  return new Intl.DateTimeFormat(
    'fa-IR',

    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    },
  ).format(
    date,
  )
}


function formatNumber(
  value:
    number,
): string {
  return new Intl.NumberFormat(
    'fa-IR',
  ).format(
    value,
  )
}


function formatPrice(
  value:
    number,
): string {
  if (
    value ===
    0
  ) {
    return 'رایگان'
  }


  return `${formatNumber(
    value,
  )} تومان`
}


export default function SubscriptionPage() {
  const user =
    useAuthStore(
      (
        state,
      ) =>
        state.user,
    )


  const isLawyer =
    user?.role ===
    'LAWYER'


  const [
    subscription,
    setSubscription,
  ] =
    useState<LawyerSubscription | null>(
      null,
    )


  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    )


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false,
    )


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )


  const loadSubscription =
    useCallback(
      async (
        initial =
          false,
      ) => {
        if (
          !isLawyer
        ) {
          setLoading(
            false,
          )

          return
        }


        try {
          if (
            initial
          ) {
            setLoading(
              true,
            )
          } else {
            setRefreshing(
              true,
            )
          }


          setError(
            null,
          )


          const result =
            await getCurrentLawyerSubscription()


          setSubscription(
            result,
          )
        } catch (
          caughtError:
            unknown
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت اشتراک فعلی ناموفق بود.',
          )
        } finally {
          setLoading(
            false,
          )

          setRefreshing(
            false,
          )
        }
      },

      [
        isLawyer,
      ],
    )


  useEffect(
    () => {
      void loadSubscription(
        true,
      )
    },

    [
      loadSubscription,
    ],
  )


  const remainingDays =
    useMemo(
      () =>
        subscription
          ? getRemainingSubscriptionDays(
              subscription,
            )
          : 0,

      [
        subscription,
      ],
    )


  const finalPrice =
    useMemo(
      () =>
        subscription
          ? getSubscriptionFinalPrice(
              subscription,
            )
          : 0,

      [
        subscription,
      ],
    )


  if (
    !isLawyer &&
    user
  ) {
    return (
      <div
        dir="rtl"
        className="mx-auto max-w-3xl"
      >
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <CreditCard
            size={32}
            className="mx-auto text-amber-600"
          />

          <h1 className="mt-4 text-xl font-black text-slate-950">
            بخش اشتراک مخصوص وکلا است
          </h1>

          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
            حساب فعلی شما از نوع وکیل نیست.
          </p>
        </div>
      </div>
    )
  }


  if (
    loading
  ) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[420px] items-center justify-center"
      >
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-4 text-sm font-black text-slate-600">
            در حال دریافت وضعیت اشتراک...
          </p>
        </div>
      </div>
    )
  }


  return (
    <div
      dir="rtl"
      className="mx-auto max-w-6xl space-y-6 pb-12"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-blue-700">
            <CreditCard
              size={22}
            />

            <span className="text-xs font-black">
              مدیریت اشتراک
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-black text-slate-950">
            اشتراک من
          </h1>

          <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">
            وضعیت اشتراک و قابلیت‌های فعال حساب وکالت شما.
          </p>
        </div>


        <button
          type="button"
          disabled={
            refreshing
          }
          onClick={() => {
            void loadSubscription()
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw
            size={17}
            className={
              refreshing
                ? 'animate-spin'
                : ''
            }
          />

          بروزرسانی وضعیت
        </button>
      </div>


      {
        error &&
        (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-7 text-red-700">
            {
              error
            }
          </div>
        )
      }


      {
        !subscription
          ? (
            <NoActiveSubscription />
          )
          : (
            <>
              <section className="overflow-hidden rounded-[28px] border border-emerald-200 bg-gradient-to-l from-emerald-50 via-white to-blue-50 shadow-sm">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">
                          <CheckCircle2
                            size={15}
                          />

                          اشتراک فعال
                        </span>

                        <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">
                          {
                            getSubscriptionTierLabel(
                              subscription
                                .planSnapshot
                                .tier,
                            )
                          }
                        </span>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                          {
                            subscription.activationSource ===
                            'PAYMENT'
                              ? 'فعال‌شده از طریق خرید'
                              : 'فعال‌شده توسط مدیریت'
                          }
                        </span>
                      </div>


                      <h2 className="mt-5 text-3xl font-black text-slate-950">
                        {
                          subscription
                            .planSnapshot
                            .title
                        }
                      </h2>


                      <p className="mt-3 max-w-3xl text-sm font-semibold leading-8 text-slate-600">
                        {
                          subscription
                            .planSnapshot
                            .description
                        }
                      </p>
                    </div>


                    <div className="rounded-2xl border border-white bg-white/80 p-4 text-center shadow-sm backdrop-blur">
                      <p className="text-xs font-black text-slate-400">
                        زمان باقی‌مانده
                      </p>

                      <p className="mt-2 text-3xl font-black text-emerald-700">
                        {
                          formatNumber(
                            remainingDays,
                          )
                        }
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-500">
                        روز
                      </p>
                    </div>
                  </div>
                </div>
              </section>


              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                  icon={
                    Clock3
                  }
                  label="شروع اشتراک"
                  value={
                    formatDateTime(
                      subscription.startsAt,
                    )
                  }
                />

                <InfoCard
                  icon={
                    CalendarClock
                  }
                  label="پایان اشتراک"
                  value={
                    formatDateTime(
                      subscription.endsAt,
                    )
                  }
                />

                <InfoCard
                  icon={
                    Package
                  }
                  label="مدت پلن"
                  value={`${formatNumber(
                    subscription
                      .planSnapshot
                      .durationMonths,
                  )} ماه`}
                />

                <InfoCard
                  icon={
                    CircleDollarSign
                  }
                  label="مبلغ نهایی پلن"
                  value={
                    formatPrice(
                      finalPrice,
                    )
                  }
                />
              </section>


              <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <ShieldCheck
                      size={21}
                    />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-950">
                      قابلیت‌های فعال این اشتراک
                    </h2>

                    <p className="mt-1 text-sm font-semibold leading-7 text-slate-500">
                      Backend این featureها را داخل Snapshot اشتراک ذخیره کرده؛ بنابراین تغییرات آینده پلن، اشتراک فعلی شما را تغییر نمی‌دهد.
                    </p>
                  </div>
                </div>


                {
                  subscription
                    .planSnapshot
                    .features
                    .length >
                  0
                    ? (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {
                          subscription
                            .planSnapshot
                            .features
                            .map(
                              (
                                feature,
                              ) => (
                                <div
                                  key={
                                    feature
                                  }
                                  className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"
                                >
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                    <CheckCircle2
                                      size={18}
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-800">
                                      {
                                        getSubscriptionFeatureLabel(
                                          feature,
                                        )
                                      }
                                    </p>

                                    <p
                                      dir="ltr"
                                      className="mt-1 truncate text-right text-[10px] font-bold text-slate-400"
                                    >
                                      {
                                        feature
                                      }
                                    </p>
                                  </div>
                                </div>
                              ),
                            )
                        }
                      </div>
                    )
                    : (
                      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                        هیچ feature مشخصی برای این اشتراک ثبت نشده است.
                      </div>
                    )
                }
              </section>


              {
                subscription
                  .planSnapshot
                  .tags
                  .length >
                0 &&
                (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-black text-slate-500">
                      برچسب‌های پلن
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {
                        subscription
                          .planSnapshot
                          .tags
                          .map(
                            (
                              tag,
                            ) => (
                              <span
                                key={
                                  tag
                                }
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
                  </section>
                )
              }
            </>
          )
      }
    </div>
  )
}


function NoActiveSubscription() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-amber-200 bg-white shadow-sm">
      <div className="p-7 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
          <Sparkles
            size={29}
          />
        </div>

        <h2 className="mt-5 text-2xl font-black text-slate-950">
          اشتراک فعالی ندارید
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-8 text-slate-600">
          در حال حاضر Backend اشتراک فعالی برای این حساب وکیل برنگردانده است. پلن‌های فعال را می‌توانید در صفحه اصلی مشاهده کنید.
        </p>

        <Link
          href="/#plans"
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-700"
        >
          <Package
            size={18}
          />

          مشاهده پلن‌ها
        </Link>
      </div>
    </section>
  )
}


function InfoCard({
  icon:
    Icon,

  label,

  value,
}: {
  icon:
    typeof Clock3

  label:
    string

  value:
    string
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
        <Icon
          size={17}
          className="text-blue-600"
        />

        {
          label
        }
      </div>

      <p className="mt-3 text-sm font-black leading-7 text-slate-900">
        {
          value
        }
      </p>
    </article>
  )
}