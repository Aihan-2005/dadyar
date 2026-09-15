'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Phone,
  RefreshCw,
  XCircle,
} from 'lucide-react'

import {
  cancelClientConsultationBooking,
  getClientConsultationBookings,
  subscribeConsultationBookingChanges,
} from '@/services/consultation-booking.service'

import {
  getPublicLawyers,
} from '@/services/public-lawyer.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  ConsultationBooking,
  ConsultationBookingStatus,
  ConsultationType,
} from '@/types/consultation-booking'

import type {
  PublicLawyer,
} from '@/types/public-lawyer'


type BookingFilter =
  | 'ALL'
  | ConsultationBookingStatus


const statusMeta:
  Record<
    ConsultationBookingStatus,

    {
      label:
        string

      className:
        string
    }
  > = {
    PENDING: {
      label:
        'در انتظار بررسی',

      className:
        'border-amber-200 bg-amber-50 text-amber-700',
    },

    CONFIRMED: {
      label:
        'تأیید شده',

      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    REJECTED: {
      label:
        'رد شده',

      className:
        'border-red-200 bg-red-50 text-red-700',
    },

    COMPLETED: {
      label:
        'انجام شده',

      className:
        'border-blue-200 bg-blue-50 text-blue-700',
    },

    CANCELLED: {
      label:
        'لغو شده',

      className:
        'border-slate-200 bg-slate-100 text-slate-600',
    },
  }


function consultationTypeLabel(
  type:
    ConsultationType,
): string {
  switch (
    type
  ) {
    case 'ONLINE':
      return 'آنلاین'

    case 'PHONE':
      return 'تلفنی'

    case 'IN_PERSON':
      return 'حضوری'
  }
}


function formatCreatedAt(
  value:
    string | null,
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
    return value
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


function getAppointmentDisplay(
  booking:
    ConsultationBooking,
): {
  date:
    string

  time:
    string
} {
  if (
    booking.startsAt
  ) {
    const start =
      new Date(
        booking.startsAt,
      )

    const end =
      booking.endsAt
        ? new Date(
            booking.endsAt,
          )
        : null

    const timeFormatter =
      new Intl.DateTimeFormat(
        'fa-IR',

        {
          hour:
            '2-digit',

          minute:
            '2-digit',

          hour12:
            false,
        },
      )

    return {
      date:
        new Intl.DateTimeFormat(
          'fa-IR',

          {
            dateStyle:
              'full',
          },
        ).format(
          start,
        ),

      time:
        end
          ? `${timeFormatter.format(
              start,
            )} تا ${timeFormatter.format(
              end,
            )}`
          : timeFormatter.format(
              start,
            ),
    }
  }

  return {
    date:
      booking.date ||
      '—',

    time:
      booking.time ||
      '—',
  }
}


export default function ClientBookingsPage() {
  const user =
    useAuthStore(
      (
        state,
      ) =>
        state.user,
    )

  const hasHydrated =
    useAuthStore(
      (
        state,
      ) =>
        state.hasHydrated,
    )

  const [
    bookings,

    setBookings,
  ] =
    useState<ConsultationBooking[]>(
      [],
    )

  const [
    lawyers,

    setLawyers,
  ] =
    useState<PublicLawyer[]>(
      [],
    )

  const [
    filter,

    setFilter,
  ] =
    useState<BookingFilter>(
      'ALL',
    )

  const [
    loading,

    setLoading,
  ] =
    useState(
      true,
    )

  const [
    actionId,

    setActionId,
  ] =
    useState<
      string | null
    >(
      null,
    )

  const [
    error,

    setError,
  ] =
    useState<
      string | null
    >(
      null,
    )


  const load =
    useCallback(
      async () => {
        if (
          !hasHydrated ||
          user?.role !==
            'CLIENT'
        ) {
          return
        }

        try {
          setLoading(
            true,
          )

          setError(
            null,
          )

          const [
            bookingsResult,

            lawyersResult,
          ] =
            await Promise.allSettled([
              getClientConsultationBookings(),

              getPublicLawyers(),
            ])

          if (
            bookingsResult.status ===
            'rejected'
          ) {
            throw bookingsResult.reason
          }

          setBookings(
            bookingsResult.value,
          )

          setLawyers(
            lawyersResult.status ===
              'fulfilled'
              ? lawyersResult.value
              : [],
          )
        } catch (
          caughtError:
            unknown
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت رزروهای مشاوره ناموفق بود.',
          )
        } finally {
          setLoading(
            false,
          )
        }
      },

      [
        hasHydrated,

        user?.role,
      ],
    )


  useEffect(
    () => {
      void load()

      const unsubscribe =
        subscribeConsultationBookingChanges(
          () => {
            void load()
          },
        )

      return unsubscribe
    },

    [
      load,
    ],
  )


  const lawyersById =
    useMemo(
      () =>
        new Map(
          lawyers.map(
            (
              lawyer,
            ) => [
              lawyer.id,

              lawyer,
            ],
          ),
        ),

      [
        lawyers,
      ],
    )


  const visibleBookings =
    useMemo(
      () =>
        filter ===
        'ALL'
          ? bookings
          : bookings.filter(
              (
                booking,
              ) =>
                booking.status ===
                filter,
            ),

      [
        bookings,

        filter,
      ],
    )


  async function handleCancel(
    bookingId:
      string,
  ) {
    if (
      actionId
    ) {
      return
    }

    try {
      setActionId(
        bookingId,
      )

      setError(
        null,
      )

      const updated =
        await cancelClientConsultationBooking(
          bookingId,
        )

      setBookings(
        (
          current,
        ) =>
          current.map(
            (
              item,
            ) =>
              item.id ===
              updated.id
                ? updated
                : item,
          ),
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'لغو رزرو ناموفق بود.',
      )
    } finally {
      setActionId(
        null,
      )
    }
  }


  if (
    !hasHydrated
  ) {
    return (
      <PageLoader />
    )
  }


  if (
    !user
  ) {
    return (
      <AccessMessage
        title="برای مشاهده رزروها وارد شوید"
        description="رزروهای مشاوره فقط برای صاحب حساب قابل مشاهده هستند."
        href="/client-login?returnTo=/client-portal/bookings&mode=login"
        action="ورود موکل"
      />
    )
  }


  if (
    user.role !==
    'CLIENT'
  ) {
    return (
      <AccessMessage
        title="این صفحه مخصوص موکل است"
        description="برای مشاهده رزروهای مشاوره باید با حساب موکل وارد شوید."
        href="/dashboard"
        action="بازگشت به داشبورد"
      />
    )
  }


  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 py-8 sm:py-12"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/client-portal"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-blue-700"
            >
              <ArrowRight
                size={18}
              />

              بازگشت به خدمات موکلین
            </Link>

            <h1 className="mt-4 text-3xl font-black text-slate-950">
              رزروهای مشاوره من
            </h1>

            <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
              زمان‌های رزروشده از slot واقعی وکیل دریافت می‌شوند و تغییر وضعیت آن‌ها مستقیماً از Backend خوانده می‌شود.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            disabled={
              loading
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            />

            بروزرسانی
          </button>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {([
            [
              'ALL',

              'همه',
            ],

            [
              'PENDING',

              'در انتظار',
            ],

            [
              'CONFIRMED',

              'تأیید شده',
            ],

            [
              'COMPLETED',

              'انجام شده',
            ],

            [
              'REJECTED',

              'رد شده',
            ],

            [
              'CANCELLED',

              'لغو شده',
            ],
          ] as Array<[
            BookingFilter,

            string,
          ]>).map(
            ([
              value,

              label,
            ]) => (
              <FilterButton
                key={
                  value
                }
                active={
                  filter ===
                  value
                }
                onClick={() =>
                  setFilter(
                    value,
                  )
                }
              >
                {label}
              </FilterButton>
            ),
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <Loader2
              size={28}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : visibleBookings.length ===
          0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <CalendarDays
              size={34}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 font-black text-slate-800">
              رزروی برای نمایش وجود ندارد.
            </p>

            <Link
              href="/client-portal#lawyers"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
            >
              انتخاب وکیل
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {visibleBookings.map(
              (
                booking,
              ) => {
                const status =
                  statusMeta[
                    booking.status
                  ]

                const lawyer =
                  lawyersById.get(
                    booking.lawyerId,
                  )

                const cancellable =
                  booking.status ===
                    'PENDING' ||
                  booking.status ===
                    'CONFIRMED'

                const appointment =
                  getAppointmentDisplay(
                    booking,
                  )

                return (
                  <article
                    key={
                      booking.id
                    }
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${status.className}`}
                      >
                        {status.label}
                      </span>

                      <span className="text-[11px] font-bold text-slate-400">
                        {formatCreatedAt(
                          booking.createdAt,
                        )}
                      </span>
                    </div>

                    <h2 className="mt-4 text-lg font-black text-slate-950">
                      {lawyer?.fullName ||
                        'وکیل دادیار'}
                    </h2>

                    <p className="mt-1 text-sm font-bold text-slate-500">
                      {lawyer?.specialization ||
                        'مشاوره حقوقی'}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <InfoItem
                        icon={
                          CalendarDays
                        }
                        label="تاریخ"
                        value={
                          appointment.date
                        }
                      />

                      <InfoItem
                        icon={
                          Clock3
                        }
                        label="ساعت"
                        value={
                          appointment.time
                        }
                      />

                      <InfoItem
                        icon={
                          Phone
                        }
                        label="نوع"
                        value={
                          consultationTypeLabel(
                            booking.type,
                          )
                        }
                      />

                      <InfoItem
                        icon={
                          CheckCircle2
                        }
                        label="وضعیت"
                        value={
                          status.label
                        }
                      />
                    </div>

                    {booking.description && (
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-black text-slate-500">
                          توضیحات
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-700">
                          {booking.description}
                        </p>
                      </div>
                    )}

                    {cancellable && (
                      <button
                        type="button"
                        disabled={
                          actionId ===
                          booking.id
                        }
                        onClick={() =>
                          void handleCancel(
                            booking.id,
                          )
                        }
                        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        {actionId ===
                        booking.id ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <XCircle
                            size={15}
                          />
                        )}

                        لغو رزرو
                      </button>
                    )}
                  </article>
                )
              },
            )}
          </div>
        )}
      </div>
    </main>
  )
}


function FilterButton({
  active,

  onClick,

  children,
}: {
  active:
    boolean

  onClick:
    () => void

  children:
    React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`h-10 rounded-xl border px-4 text-xs font-black transition ${
        active
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
      }`}
    >
      {children}
    </button>
  )
}


function InfoItem({
  icon:
    Icon,

  label,

  value,
}: {
  icon:
    LucideIcon

  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
        <Icon
          size={14}
          className="text-blue-600"
        />

        {label}
      </div>

      <p className="mt-1 text-sm font-black leading-6 text-slate-800">
        {value}
      </p>
    </div>
  )
}


function PageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <Loader2
        size={30}
        className="animate-spin text-blue-600"
      />
    </main>
  )
}


function AccessMessage({
  title,

  description,

  href,

  action,
}: {
  title:
    string

  description:
    string

  href:
    string

  action:
    string
}) {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-100 px-4"
    >
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CalendarDays
          size={36}
          className="mx-auto text-blue-600"
        />

        <h1 className="mt-4 text-xl font-black text-slate-950">
          {title}
        </h1>

        <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
          {description}
        </p>

        <Link
          href={
            href
          }
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
        >
          {action}
        </Link>
      </div>
    </main>
  )
}