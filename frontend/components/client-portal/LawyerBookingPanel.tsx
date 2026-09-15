'use client'

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Laptop,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  RotateCcw,
} from 'lucide-react'

import ClientProfileRequirement from '@/components/client-portal/ClientProfileRequirement'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'

import {
  createClientConsultationBooking,
} from '@/services/consultation-booking.service'

import {
  getClientLawyerAvailability,
} from '@/services/lawyer-availability.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  ConsultationBooking,
  ConsultationType,
} from '@/types/consultation-booking'

import type {
  LawyerAvailability,
} from '@/types/lawyer-availability'


interface LawyerBookingPanelProps {
  lawyer:
    ClientPortalLawyer
}


const CONSULTATION_TYPE_OPTIONS:
  Array<{
    value:
      ConsultationType

    label:
      string

    description:
      string

    icon:
      typeof Laptop
  }> = [
    {
      value:
        'ONLINE',

      label:
        'مشاوره آنلاین',

      description:
        'جلسه آنلاین در زمان آزاد ثبت‌شده توسط وکیل.',

      icon:
        Laptop,
    },

    {
      value:
        'PHONE',

      label:
        'مشاوره تلفنی',

      description:
        'تماس تلفنی در بازه‌ای که وکیل فعال کرده است.',

      icon:
        Phone,
    },

    {
      value:
        'IN_PERSON',

      label:
        'مشاوره حضوری',

      description:
        'جلسه حضوری در یکی از زمان‌های آزاد وکیل.',

      icon:
        MapPin,
    },
  ]


function addDays(
  date:
    Date,

  days:
    number,
): Date {
  return new Date(
    date.getTime() +
      days *
        24 *
        60 *
        60 *
        1000,
  )
}


function formatDayLabel(
  iso:
    string,
): string {
  return new Intl.DateTimeFormat(
    'fa-IR',

    {
      weekday:
        'long',

      day:
        'numeric',

      month:
        'long',
    },
  ).format(
    new Date(
      iso,
    ),
  )
}


function formatTime(
  iso:
    string,
): string {
  return new Intl.DateTimeFormat(
    'fa-IR',

    {
      hour:
        '2-digit',

      minute:
        '2-digit',

      hour12:
        false,
    },
  ).format(
    new Date(
      iso,
    ),
  )
}


function formatDuration(
  startsAt:
    string,

  endsAt:
    string,
): string {
  const minutes =
    Math.max(
      0,

      Math.round(
        (
          new Date(
            endsAt,
          ).getTime() -
          new Date(
            startsAt,
          ).getTime()
        ) /
          60_000,
      ),
    )

  return `${minutes.toLocaleString(
    'fa-IR',
  )} دقیقه`
}


function getLocalDayKey(
  iso:
    string,
): string {
  const date =
    new Date(
      iso,
    )

  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() +
        1,
    ).padStart(
      2,

      '0',
    )

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,

      '0',
    )

  return `${year}-${month}-${day}`
}


function getConsultationTypeLabel(
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


export default function LawyerBookingPanel({
  lawyer,
}: LawyerBookingPanelProps) {
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


  if (
    !hasHydrated
  ) {
    return (
      <PanelLoader />
    )
  }


  if (
    !user ||
    user.role !==
      'CLIENT'
  ) {
    return (
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
        <CalendarDays
          size={30}
          className="mx-auto text-blue-600"
        />

        <h3 className="mt-3 font-black text-slate-900">
          برای رزرو مشاوره وارد شوید
        </h3>

        <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
          زمان‌های آزاد وکیل و ثبت رزرو فقط برای حساب موکل در دسترس هستند.
        </p>

        <Link
          href="/client-login?returnTo=/client-portal&mode=login"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
        >
          ورود موکل
        </Link>
      </section>
    )
  }


  return (
    <ClientProfileRequirement
      title="برای رزرو مشاوره، پروفایل را کامل کنید"
      description="نام واقعی شما همراه رزرو برای وکیل نمایش داده می‌شود."
    >
      <ReadyBookingPanel
        lawyer={
          lawyer
        }
      />
    </ClientProfileRequirement>
  )
}


function ReadyBookingPanel({
  lawyer,
}: {
  lawyer:
    ClientPortalLawyer
}) {
  const [
    consultationType,

    setConsultationType,
  ] =
    useState<ConsultationType>(
      'ONLINE',
    )

  const [
    slots,

    setSlots,
  ] =
    useState<LawyerAvailability[]>(
      [],
    )

  const [
    selectedAvailabilityId,

    setSelectedAvailabilityId,
  ] =
    useState(
      '',
    )

  const [
    description,

    setDescription,
  ] =
    useState(
      '',
    )

  const [
    loadingSlots,

    setLoadingSlots,
  ] =
    useState(
      false,
    )

  const [
    submitting,

    setSubmitting,
  ] =
    useState(
      false,
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

  const [
    createdBooking,

    setCreatedBooking,
  ] =
    useState<ConsultationBooking | null>(
      null,
    )


  const loadSlots =
    useCallback(
      async () => {
        try {
          setLoadingSlots(
            true,
          )

          setError(
            null,
          )

          const now =
            new Date()

          const result =
            await getClientLawyerAvailability(
              lawyer.id,

              {
                from:
                  now.toISOString(),

                to:
                  addDays(
                    now,

                    60,
                  ).toISOString(),

                type:
                  consultationType,
              },
            )

          setSlots(
            result,
          )

          setSelectedAvailabilityId(
            (
              current,
            ) =>
              result.some(
                (
                  slot,
                ) =>
                  slot.id ===
                  current,
              )
                ? current
                : '',
          )
        } catch (
          caughtError:
            unknown
        ) {
          setSlots(
            [],
          )

          setSelectedAvailabilityId(
            '',
          )

          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت زمان‌های آزاد وکیل ناموفق بود.',
          )
        } finally {
          setLoadingSlots(
            false,
          )
        }
      },

      [
        consultationType,

        lawyer.id,
      ],
    )


  useEffect(
    () => {
      void loadSlots()
    },

    [
      loadSlots,
    ],
  )


  const slotsByDay =
    useMemo(
      () => {
        const groups =
          new Map<
            string,
            LawyerAvailability[]
          >()

        for (
          const slot of
            slots
        ) {
          const key =
            getLocalDayKey(
              slot.startsAt,
            )

          const current =
            groups.get(
              key,
            ) ??
            []

          current.push(
            slot,
          )

          groups.set(
            key,

            current,
          )
        }

        return Array.from(
          groups.entries(),
        )
      },

      [
        slots,
      ],
    )


  const selectedSlot =
    useMemo(
      () =>
        slots.find(
          (
            slot,
          ) =>
            slot.id ===
            selectedAvailabilityId,
        ) ??
        null,

      [
        selectedAvailabilityId,

        slots,
      ],
    )


  function resetForm() {
    setDescription(
      '',
    )

    setCreatedBooking(
      null,
    )

    setSelectedAvailabilityId(
      '',
    )

    setError(
      null,
    )

    void loadSlots()
  }


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      submitting
    ) {
      return
    }

    if (
      !selectedSlot
    ) {
      setError(
        'یکی از زمان‌های آزاد وکیل را انتخاب کنید.',
      )

      return
    }

    const normalizedDescription =
      description.trim()

    if (
      normalizedDescription.length >
      3000
    ) {
      setError(
        'توضیحات رزرو نمی‌تواند بیشتر از ۳۰۰۰ کاراکتر باشد.',
      )

      return
    }

    try {
      setSubmitting(
        true,
      )

      setError(
        null,
      )

      const booking =
        await createClientConsultationBooking({
          lawyerId:
            lawyer.id,

          availabilityId:
            selectedSlot.id,

          type:
            consultationType,

          ...(normalizedDescription
            ? {
                description:
                  normalizedDescription,
              }
            : {}),
        })

      setCreatedBooking(
        booking,
      )

      setSlots(
        (
          current,
        ) =>
          current.filter(
            (
              slot,
            ) =>
              slot.id !==
              selectedSlot.id,
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
          : 'ثبت رزرو مشاوره ناموفق بود.',
      )

      void loadSlots()
    } finally {
      setSubmitting(
        false,
      )
    }
  }


  if (
    createdBooking
  ) {
    const start =
      createdBooking.startsAt ??
      null

    const end =
      createdBooking.endsAt ??
      null

    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={28}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-emerald-950">
              درخواست رزرو ثبت شد
            </h3>

            <p className="mt-2 text-sm font-semibold leading-7 text-emerald-800">
              این زمان برای شما قفل شده و تا زمان لغو یا رد درخواست برای موکل دیگری قابل رزرو نیست.
            </p>

            {start && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <SummaryItem
                  label="روز"
                  value={
                    formatDayLabel(
                      start,
                    )
                  }
                />

                <SummaryItem
                  label="ساعت"
                  value={
                    end
                      ? `${formatTime(
                          start,
                        )} تا ${formatTime(
                          end,
                        )}`
                      : formatTime(
                          start,
                        )
                  }
                />

                <SummaryItem
                  label="نوع مشاوره"
                  value={
                    getConsultationTypeLabel(
                      createdBooking.type,
                    )
                  }
                />

                <SummaryItem
                  label="وضعیت"
                  value="در انتظار بررسی وکیل"
                />
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/client-portal/bookings"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-black text-white"
              >
                مشاهده رزروهای من
              </Link>

              <button
                type="button"
                onClick={
                  resetForm
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-5 text-sm font-black text-emerald-700"
              >
                <RotateCcw
                  size={16}
                />

                رزرو جدید
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }


  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-5"
    >
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-black text-blue-950">
          رزرو مشاوره با{' '}
          {lawyer.fullName}
        </p>

        <p className="mt-1 text-xs font-semibold leading-6 text-blue-700">
          فقط زمان‌های واقعی ثبت‌شده توسط وکیل نمایش داده می‌شوند.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
          {error}
        </div>
      )}

      <fieldset>
        <legend className="text-sm font-black text-slate-800">
          نوع مشاوره
        </legend>

        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {CONSULTATION_TYPE_OPTIONS.map(
            (
              option,
            ) => {
              const Icon =
                option.icon

              const active =
                consultationType ===
                option.value

              return (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  onClick={() => {
                    setConsultationType(
                      option.value,
                    )

                    setSelectedAvailabilityId(
                      '',
                    )

                    setError(
                      null,
                    )
                  }}
                  className={`rounded-2xl border p-4 text-right transition ${
                    active
                      ? 'border-blue-400 bg-blue-50 ring-4 ring-blue-100'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      active
                        ? 'text-blue-700'
                        : 'text-slate-500'
                    }
                  />

                  <p className="mt-3 text-sm font-black text-slate-900">
                    {option.label}
                  </p>

                  <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">
                    {option.description}
                  </p>
                </button>
              )
            },
          )}
        </div>
      </fieldset>

      <section>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-800">
              زمان‌های آزاد
            </h3>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              یکی از بازه‌های ثبت‌شده توسط وکیل را انتخاب کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadSlots()
            }
            disabled={
              loadingSlots
            }
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-black text-slate-600 disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={
                loadingSlots
                  ? 'animate-spin'
                  : ''
              }
            />

            بروزرسانی
          </button>
        </div>

        {loadingSlots ? (
          <div className="mt-3 flex min-h-36 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <Loader2
              size={23}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : slotsByDay.length ===
          0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <CalendarDays
              size={28}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-sm font-black text-slate-700">
              برای این نوع مشاوره زمان آزادی ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="mt-3 max-h-[360px] space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {slotsByDay.map(
              ([
                dayKey,

                daySlots,
              ]) => (
                <div
                  key={
                    dayKey
                  }
                >
                  <p className="px-1 text-xs font-black text-slate-600">
                    {formatDayLabel(
                      daySlots[0].startsAt,
                    )}
                  </p>

                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {daySlots.map(
                      (
                        slot,
                      ) => {
                        const active =
                          selectedAvailabilityId ===
                          slot.id

                        return (
                          <button
                            key={
                              slot.id
                            }
                            type="button"
                            onClick={() => {
                              setSelectedAvailabilityId(
                                slot.id,
                              )

                              setError(
                                null,
                              )
                            }}
                            className={`rounded-xl border px-3 py-3 text-right transition ${
                              active
                                ? 'border-emerald-400 bg-emerald-50 ring-4 ring-emerald-100'
                                : 'border-slate-200 bg-white hover:border-emerald-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                dir="ltr"
                                className="text-sm font-black text-slate-900"
                              >
                                {formatTime(
                                  slot.startsAt,
                                )}{' '}
                                -{' '}
                                {formatTime(
                                  slot.endsAt,
                                )}
                              </span>

                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">
                                {formatDuration(
                                  slot.startsAt,

                                  slot.endsAt,
                                )}
                              </span>
                            </div>

                            {slot.note && (
                              <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-5 text-slate-500">
                                {slot.note}
                              </p>
                            )}
                          </button>
                        )
                      },
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {selectedSlot && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-black text-emerald-700">
            زمان انتخاب‌شده
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-black text-emerald-950">
            <span className="inline-flex items-center gap-2">
              <CalendarDays
                size={16}
              />

              {formatDayLabel(
                selectedSlot.startsAt,
              )}
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock3
                size={16}
              />

              <span dir="ltr">
                {formatTime(
                  selectedSlot.startsAt,
                )}{' '}
                -{' '}
                {formatTime(
                  selectedSlot.endsAt,
                )}
              </span>
            </span>
          </div>
        </div>
      )}

      <label className="block">
        <span className="text-sm font-black text-slate-800">
          توضیحات برای وکیل
        </span>

        <textarea
          value={
            description
          }
          onChange={(
            event,
          ) => {
            setDescription(
              event.target.value,
            )

            setError(
              null,
            )
          }}
          maxLength={3000}
          rows={5}
          placeholder="موضوع جلسه و نکاتی که بهتر است وکیل قبل از مشاوره بداند..."
          className="mt-2 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <span className="mt-1 block text-left text-[11px] font-bold text-slate-400">
          {description.length.toLocaleString(
            'fa-IR',
          )}{' '}
          / ۳۰۰۰
        </span>
      </label>

      <button
        type="submit"
        disabled={
          submitting ||
          loadingSlots ||
          !selectedSlot
        }
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <Loader2
            size={18}
            className="animate-spin"
          />
        ) : (
          <CalendarDays
            size={18}
          />
        )}

        ثبت درخواست رزرو این زمان
      </button>
    </form>
  )
}


function SummaryItem({
  label,

  value,
}: {
  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2.5">
      <p className="text-[10px] font-black text-emerald-700">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  )
}


function PanelLoader() {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <Loader2
        size={24}
        className="animate-spin text-blue-600"
      />
    </div>
  )
}