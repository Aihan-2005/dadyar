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
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Laptop,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  RefreshCw,
  UserRound,
  XCircle,
} from 'lucide-react'

import {
  getLawyerConsultationBookings,
  subscribeConsultationBookingChanges,
  updateLawyerConsultationBookingStatus,
} from '@/services/consultation-booking.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  ConsultationBookingStatus,
  ConsultationType,
  LawyerBookingDecisionStatus,
  LawyerConsultationBooking,
} from '@/types/consultation-booking'


type BookingFilter =
  | 'ALL'
  | ConsultationBookingStatus


const STATUS_META:
  Record<
    ConsultationBookingStatus,
    {
      label: string
      className: string
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
        'لغو شده توسط موکل',

      className:
        'border-slate-200 bg-slate-100 text-slate-600',
    },
  }


const TYPE_META:
  Record<
    ConsultationType,
    {
      label: string
      icon: LucideIcon
    }
  > = {
    ONLINE: {
      label:
        'آنلاین',

      icon:
        Laptop,
    },

    PHONE: {
      label:
        'تلفنی',

      icon:
        Phone,
    },

    IN_PERSON: {
      label:
        'حضوری',

      icon:
        MapPin,
    },
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

  return Number.isNaN(
    date.getTime(),
  )
    ? value
    : new Intl.DateTimeFormat(
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
    LawyerConsultationBooking,
): {
  date: string
  time: string
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


export default function LawyerClientBookingsPage() {
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
    useState<LawyerConsultationBooking[]>(
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
    action,

    setAction,
  ] =
    useState<{
      id: string

      status:
        LawyerBookingDecisionStatus
    } | null>(
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
            'LAWYER'
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

          setBookings(
            await getLawyerConsultationBookings(),
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


  const stats =
    useMemo(
      () => ({
        total:
          bookings.length,

        pending:
          bookings.filter(
            (
              booking,
            ) =>
              booking.status ===
              'PENDING',
          ).length,

        confirmed:
          bookings.filter(
            (
              booking,
            ) =>
              booking.status ===
              'CONFIRMED',
          ).length,

        completed:
          bookings.filter(
            (
              booking,
            ) =>
              booking.status ===
              'COMPLETED',
          ).length,
      }),

      [
        bookings,
      ],
    )


  async function decide(
    booking:
      LawyerConsultationBooking,

    status:
      LawyerBookingDecisionStatus,
  ) {
    if (
      action
    ) {
      return
    }

    try {
      setAction({
        id:
          booking.id,

        status,
      })

      setError(
        null,
      )

      const updated =
        await updateLawyerConsultationBookingStatus(
          booking.id,

          status,
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
          : 'بروزرسانی وضعیت رزرو ناموفق بود.',
      )
    } finally {
      setAction(
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
    !user ||
    user.role !==
      'LAWYER'
  ) {
    return (
      <div
        dir="rtl"
        className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <CalendarDays
          size={36}
          className="mx-auto text-slate-400"
        />

        <h1 className="mt-4 text-xl font-black text-slate-950">
          دسترسی غیرمجاز
        </h1>

        <p className="mt-2 text-sm font-semibold text-slate-600">
          مدیریت رزروهای مشاوره فقط برای حساب وکیل قابل دسترسی است.
        </p>
      </div>
    )
  }


  return (
    <div dir="rtl">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
            رزروهای مشاوره
          </h1>

          <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
            رزروها همراه با هویت واقعی موکل نمایش داده می‌شوند. اگر موکل قبلاً به CRM شما متصل شده باشد، وضعیت اتصال هم مشخص است.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/availability"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-black text-white"
          >
            مدیریت زمان‌های آزاد
          </Link>

          <button
            type="button"
            disabled={
              loading
            }
            onClick={() =>
              void load()
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 disabled:opacity-60"
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
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="همه رزروها"
          value={
            stats.total
          }
        />

        <StatCard
          label="در انتظار"
          value={
            stats.pending
          }
        />

        <StatCard
          label="تأیید شده"
          value={
            stats.confirmed
          }
        />

        <StatCard
          label="انجام شده"
          value={
            stats.completed
          }
        />
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
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
        <div className="mt-7 flex min-h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Loader2
            size={30}
            className="animate-spin text-blue-600"
          />
        </div>
      ) : visibleBookings.length ===
        0 ? (
        <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <CalendarDays
            size={36}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 text-lg font-black text-slate-800">
            رزروی برای نمایش وجود ندارد
          </h2>
        </div>
      ) : (
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {visibleBookings.map(
            (
              booking,
            ) => (
              <BookingCard
                key={
                  booking.id
                }
                booking={
                  booking
                }
                action={
                  action
                }
                onDecision={
                  decide
                }
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}


function BookingCard({
  booking,

  action,

  onDecision,
}: {
  booking:
    LawyerConsultationBooking

  action: {
    id: string

    status:
      LawyerBookingDecisionStatus
  } | null

  onDecision:
    (
      booking:
        LawyerConsultationBooking,

      status:
        LawyerBookingDecisionStatus,
    ) => void
}) {
  const status =
    STATUS_META[
      booking.status
    ]

  const type =
    TYPE_META[
      booking.type
    ]

  const TypeIcon =
    type.icon

  const canDecide =
    booking.status ===
    'PENDING'

  const canComplete =
    booking.status ===
    'CONFIRMED'

  const busy =
    action?.id ===
    booking.id

  const appointment =
    getAppointmentDisplay(
      booking,
    )

  const clientLabel =
    booking.client.fullName ||
    booking.client.phone ||
    booking.client.email ||
    'نام موکل ثبت نشده'


  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${status.className}`}
        >
          {status.label}
        </span>

        <span className="text-[11px] font-bold text-slate-400">
          ثبت:{' '}
          {formatCreatedAt(
            booking.createdAt,
          )}
        </span>
      </div>

      <section className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <UserRound
                size={20}
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black text-blue-600">
                موکل
              </p>

              <h3 className="mt-1 truncate text-base font-black text-slate-950">
                {clientLabel}
              </h3>
            </div>
          </div>

          {booking.client.lawyerClientId && (
            <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
              متصل به CRM
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ClientContactItem
            icon={
              Phone
            }
            label="شماره تماس"
            value={
              booking.client.phone ||
              'ثبت نشده'
            }
          />

          <ClientContactItem
            icon={
              Mail
            }
            label="ایمیل"
            value={
              booking.client.email ||
              'ثبت نشده'
            }
          />
        </div>

        {booking.client.lawyerClientId && (
          <Link
            href="/dashboard/customers"
            className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-[11px] font-black text-white"
          >
            <ExternalLink
              size={14}
            />

            مشاهده در بخش موکلین
          </Link>
        )}
      </section>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
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
            TypeIcon
          }
          label="نوع مشاوره"
          value={
            type.label
          }
        />
      </div>

      {booking.description && (
        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-500">
            <MessageSquareText
              size={15}
            />

            توضیحات موکل
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-700">
            {booking.description}
          </p>
        </div>
      )}

      {canDecide && (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <ActionButton
            loading={
              busy &&
              action?.status ===
                'CONFIRMED'
            }
            disabled={
              Boolean(
                action,
              )
            }
            icon={
              CheckCircle2
            }
            onClick={() =>
              onDecision(
                booking,

                'CONFIRMED',
              )
            }
            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            تأیید رزرو
          </ActionButton>

          <ActionButton
            loading={
              busy &&
              action?.status ===
                'REJECTED'
            }
            disabled={
              Boolean(
                action,
              )
            }
            icon={
              XCircle
            }
            onClick={() =>
              onDecision(
                booking,

                'REJECTED',
              )
            }
            className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          >
            رد رزرو
          </ActionButton>
        </div>
      )}

      {canComplete && (
        <ActionButton
          loading={
            busy &&
            action?.status ===
              'COMPLETED'
          }
          disabled={
            Boolean(
              action,
            )
          }
          icon={
            CheckCircle2
          }
          onClick={() =>
            onDecision(
              booking,

              'COMPLETED',
            )
          }
          className="mt-5 w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
        >
          ثبت جلسه به‌عنوان انجام‌شده
        </ActionButton>
      )}
    </article>
  )
}


function ClientContactItem({
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
    <div className="rounded-xl bg-white px-3 py-2.5">
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500">
        <Icon
          size={13}
          className="text-blue-600"
        />

        {label}
      </div>

      <p
        dir={
          label ===
            'ایمیل'
            ? 'ltr'
            : undefined
        }
        className="mt-1 break-all text-xs font-black text-slate-800"
      >
        {value}
      </p>
    </div>
  )
}


function FilterButton({
  active,

  onClick,

  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
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


function StatCard({
  label,

  value,
}: {
  label: string
  value: number
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-black text-slate-600">
        {label}
      </div>

      <p className="mt-3 text-2xl font-black text-slate-950">
        {value.toLocaleString(
          'fa-IR',
        )}
      </p>
    </article>
  )
}


function InfoItem({
  icon:
    Icon,

  label,

  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
        <Icon
          size={14}
          className="text-blue-600"
        />

        {label}
      </div>

      <p className="mt-1 text-xs font-black leading-6 text-slate-800">
        {value}
      </p>
    </div>
  )
}


function ActionButton({
  loading,

  disabled,

  icon:
    Icon,

  onClick,

  className,

  children,
}: {
  loading: boolean
  disabled: boolean
  icon: LucideIcon
  onClick: () => void
  className: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <Loader2
          size={16}
          className="animate-spin"
        />
      ) : (
        <Icon
          size={16}
        />
      )}

      {children}
    </button>
  )
}


function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2
        size={30}
        className="animate-spin text-blue-600"
      />
    </div>
  )
}

