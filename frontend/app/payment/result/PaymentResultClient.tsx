'use client'

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

import type {
  LawyerPayment,
  PaymentStatus,
} from '@/features/payment/types'

import {
  getMyPayment,
  isPaymentId,
} from '@/services/payment.service'

import {
  useAuthStore,
} from '@/store/auth.store'

const dateTimeFormatter =
  new Intl.DateTimeFormat(
    'fa-IR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  )

const numberFormatter =
  new Intl.NumberFormat(
    'fa-IR',
  )

function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return '—'
  }

  const date =
    new Date(value)

  return Number.isNaN(
    date.getTime(),
  )
    ? '—'
    : dateTimeFormatter.format(
        date,
      )
}

function formatPaymentAmount(
  amount: number,
  currency: string,
): string {
  const formatted =
    numberFormatter.format(
      amount,
    )

  if (
    currency ===
    'IRR'
  ) {
    return `${formatted} ریال`
  }

  return `${formatted} ${currency}`
}

function getPaymentStatusLabel(
  status: PaymentStatus,
): string {
  switch (status) {
    case 'PENDING':
      return 'در انتظار'

    case 'PAID':
      return 'پرداخت‌شده'

    case 'FAILED':
      return 'ناموفق'

    case 'CANCELLED':
      return 'لغوشده'

    case 'REVERSED':
      return 'برگشت‌خورده'
  }
}

function getStoredPaymentId():
  string | null {
  if (
    typeof window ===
    'undefined'
  ) {
    return null
  }

  const value =
    window.sessionStorage.getItem(
      'dadyar:last-payment-id',
    )

  return isPaymentId(
    value,
  )
    ? value.trim()
    : null
}

function clearStoredPayment(
  paymentId: string,
): void {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  if (
    window.sessionStorage.getItem(
      'dadyar:last-payment-id',
    ) === paymentId
  ) {
    window.sessionStorage.removeItem(
      'dadyar:last-payment-id',
    )

    window.sessionStorage.removeItem(
      'dadyar:last-payment-plan',
    )
  }
}

export default function PaymentResultClient() {
  const params =
    useSearchParams()

  const queryPaymentId =
    params.get(
      'paymentId',
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

  const [
    payment,
    setPayment,
  ] =
    useState<LawyerPayment | null>(
      null,
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

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

  const loadPayment =
    useCallback(
      async (
        initial = false,
      ) => {
        const paymentId =
          isPaymentId(
            queryPaymentId,
          )
            ? queryPaymentId.trim()
            : getStoredPaymentId()

        if (!paymentId) {
          setPayment(null)

          setError(
            'شناسه پرداخت معتبر نیست.',
          )

          setLoading(false)

          return
        }

        if (
          !user ||
          user.role !==
            'LAWYER'
        ) {
          setLoading(false)

          return
        }

        try {
          if (initial) {
            setLoading(true)
          } else {
            setRefreshing(true)
          }

          setError(null)

          const result =
            await getMyPayment(
              paymentId,
            )

          setPayment(
            result,
          )

          const isTerminal =
            result.status !==
              'PENDING' &&
            !(
              result.status ===
                'PAID' &&
              result
                .fulfillmentStatus ===
                'PENDING'
            )

          if (
            isTerminal
          ) {
            clearStoredPayment(
              paymentId,
            )
          }
        } catch (
          caughtError: unknown
        ) {
          setPayment(null)

          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت نتیجه پرداخت ناموفق بود.',
          )
        } finally {
          setLoading(false)
          setRefreshing(false)
        }
      },
      [
        queryPaymentId,
        user,
      ],
    )

  useEffect(() => {
    if (
      !hasHydrated ||
      !isInitialized ||
      isSessionChecking
    ) {
      return
    }

    void loadPayment(true)
  }, [
    hasHydrated,
    isInitialized,
    isSessionChecking,
    loadPayment,
  ])

  if (
    !hasHydrated ||
    !isInitialized ||
    isSessionChecking ||
    loading
  ) {
    return (
      <ResultLoading />
    )
  }

  if (!user) {
    return (
      <ResultShell>
        <AlertTriangle
          size={40}
          className="mx-auto text-amber-600"
        />

        <h1 className="mt-4 text-2xl font-black text-slate-950">
          برای مشاهده نتیجه وارد شوید
        </h1>

        <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
          نتیجه پرداخت فقط برای صاحب همان حساب قابل مشاهده است.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
        >
          ورود به حساب
        </Link>
      </ResultShell>
    )
  }

  if (
    user.role !==
    'LAWYER'
  ) {
    return (
      <ResultShell>
        <XCircle
          size={40}
          className="mx-auto text-red-600"
        />

        <h1 className="mt-4 text-xl font-black">
          این پرداخت متعلق به پنل وکلا است
        </h1>
      </ResultShell>
    )
  }

  if (
    error ||
    !payment
  ) {
    return (
      <ResultShell>
        <AlertTriangle
          size={40}
          className="mx-auto text-amber-600"
        />

        <h1 className="mt-4 text-xl font-black text-slate-950">
          نتیجه پرداخت دریافت نشد
        </h1>

        <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
          {
            error ??
            'امکان دریافت اطلاعات این پرداخت وجود ندارد.'
          }
        </p>

        <button
          type="button"
          disabled={refreshing}
          onClick={() =>
            void loadPayment()
          }
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white disabled:opacity-60"
        >
          <RefreshCcw
            size={16}
            className={
              refreshing
                ? 'animate-spin'
                : ''
            }
          />

          تلاش دوباره
        </button>
      </ResultShell>
    )
  }

  const fulfilled =
    payment.status ===
      'PAID' &&
    payment.fulfillmentStatus ===
      'FULFILLED'

  const requiresAction =
    payment.status ===
      'PAID' &&
    payment.fulfillmentStatus ===
      'REQUIRES_ACTION'

  const pending =
    payment.status ===
      'PENDING' ||
    (
      payment.status ===
        'PAID' &&
      payment.fulfillmentStatus ===
        'PENDING'
    )

  const failed =
    [
      'FAILED',
      'CANCELLED',
      'REVERSED',
    ].includes(
      payment.status,
    )

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10"
    >
      <div className="w-full max-w-xl rounded-[30px] border border-slate-200 bg-white p-7 shadow-lg sm:p-9">
        {
          fulfilled &&
          <FulfilledHeader />
        }

        {
          requiresAction &&
          <RequiresActionHeader />
        }

        {
          pending &&
          <PendingHeader />
        }

        {
          failed &&
          (
            <FailedHeader
              status={
                payment.status
              }
            />
          )
        }

        {
          !fulfilled &&
          !requiresAction &&
          !pending &&
          !failed &&
          <UnknownHeader />
        }

        <div className="mt-7 space-y-3 rounded-2xl bg-slate-50 p-5">
          <ResultRow
            label="پلن"
            value={
              payment.plan.title
            }
          />

          <ResultRow
            label="مبلغ"
            value={
              formatPaymentAmount(
                payment.amount,
                payment.currency,
              )
            }
          />

          <ResultRow
            label="وضعیت"
            value={
              getPaymentStatusLabel(
                payment.status,
              )
            }
          />

          <ResultRow
            label="شناسه پرداخت"
            value={
              payment.id
            }
            ltr
          />

          {
            payment.referenceId &&
            (
              <ResultRow
                label="شماره پیگیری"
                value={
                  payment.referenceId
                }
                ltr
              />
            )
          }

          {
            payment.cardPan &&
            (
              <ResultRow
                label="کارت"
                value={
                  payment.cardPan
                }
                ltr
              />
            )
          }

          <ResultRow
            label="زمان ایجاد"
            value={
              formatDateTime(
                payment.createdAt,
              )
            }
          />

          {
            payment.paidAt &&
            (
              <ResultRow
                label="زمان پرداخت"
                value={
                  formatDateTime(
                    payment.paidAt,
                  )
                }
              />
            )
          }
        </div>

        {
          pending &&
          (
            <button
              type="button"
              disabled={
                refreshing
              }
              onClick={() =>
                void loadPayment()
              }
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-black text-blue-700 disabled:opacity-60"
            >
              <RefreshCcw
                size={16}
                className={
                  refreshing
                    ? 'animate-spin'
                    : ''
                }
              />

              بروزرسانی وضعیت
            </button>
          )
        }

        {
          fulfilled &&
          (
            <Link
              href="/dashboard/subscription"
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white"
            >
              <ShieldCheck
                size={17}
              />

              مشاهده اشتراک من
            </Link>
          )
        }

        {
          requiresAction &&
          (
            <Link
              href="/dashboard/tickets"
              className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-amber-600 text-sm font-black text-white"
            >
              ارتباط با پشتیبانی
            </Link>
          )
        }

        {
          !fulfilled &&
          !requiresAction &&
          !pending &&
          (
            <Link
              href="/#plans"
              className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white"
            >
              بازگشت به پلن‌ها
            </Link>
          )
        }
      </div>
    </main>
  )
}

function ResultLoading() {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-100 px-4"
    >
      <div className="text-center">
        <Loader2
          size={30}
          className="mx-auto animate-spin text-blue-600"
        />

        <p className="mt-4 font-black text-slate-700">
          در حال بررسی نتیجه پرداخت...
        </p>
      </div>
    </main>
  )
}

function FulfilledHeader() {
  return (
    <>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
        <CheckCircle2
          size={32}
        />
      </div>

      <h1 className="mt-5 text-center text-2xl font-black text-slate-950">
        پرداخت با موفقیت انجام شد
      </h1>

      <p className="mt-3 text-center text-sm font-semibold leading-7 text-slate-600">
        پرداخت توسط درگاه تأیید شده و اشتراک شما با موفقیت فعال
        شده است.
      </p>
    </>
  )
}

function RequiresActionHeader() {
  return (
    <>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
        <AlertTriangle
          size={32}
        />
      </div>

      <h1 className="mt-5 text-center text-2xl font-black text-slate-950">
        پرداخت موفق است؛ فعال‌سازی نیاز به بررسی دارد
      </h1>

      <p className="mt-3 text-center text-sm font-semibold leading-7 text-amber-700">
        وجه پرداخت شده است. دوباره پرداخت نکنید. فعال‌سازی اشتراک
        نیاز به بررسی سیستم یا مدیریت دارد.
      </p>
    </>
  )
}

function PendingHeader() {
  return (
    <>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-700">
        <Clock3
          size={32}
        />
      </div>

      <h1 className="mt-5 text-center text-2xl font-black text-slate-950">
        وضعیت پرداخت در حال بررسی است
      </h1>

      <p className="mt-3 text-center text-sm font-semibold leading-7 text-slate-600">
        هنوز نتیجه نهایی برای این پرداخت ثبت نشده است. تا مشخص‌شدن
        وضعیت، پرداخت جدیدی ایجاد نکنید.
      </p>
    </>
  )
}

function FailedHeader({
  status,
}: {
  status: PaymentStatus
}) {
  return (
    <>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-100 text-red-700">
        <XCircle
          size={32}
        />
      </div>

      <h1 className="mt-5 text-center text-2xl font-black text-slate-950">
        پرداخت نهایی نشده است
      </h1>

      <p className="mt-3 text-center text-sm font-semibold leading-7 text-slate-600">
        وضعیت تراکنش «
        {
          getPaymentStatusLabel(
            status,
          )
        }
        » ثبت شده است.
      </p>
    </>
  )
}

function UnknownHeader() {
  return (
    <>
      <AlertTriangle
        size={40}
        className="mx-auto text-amber-600"
      />

      <h1 className="mt-4 text-center text-xl font-black text-slate-950">
        وضعیت پرداخت نیاز به بررسی دارد
      </h1>
    </>
  )
}

function ResultShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-100 px-4"
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        {children}
      </div>
    </main>
  )
}

function ResultRow({
  label,
  value,
  ltr = false,
}: {
  label: string
  value: string
  ltr?: boolean
}) {
  return (
    <div className="flex flex-col justify-between gap-1 border-b border-slate-200 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center">
      <span className="text-xs font-bold text-slate-500">
        {label}
      </span>

      <strong
        dir={
          ltr
            ? 'ltr'
            : undefined
        }
        className="break-all text-sm font-black text-slate-900"
      >
        {value}
      </strong>
    </div>
  )
}