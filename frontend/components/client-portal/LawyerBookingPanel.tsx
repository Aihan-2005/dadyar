'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Video,
} from 'lucide-react'

import type {
  ClientPortalLawyer,
  LawyerConsultationMode,
} from '@/features/client-portal/types/lawyer'

import type {
  LawyerMarketplaceProfile,
} from '@/features/client-portal/types/marketplace'

interface LawyerBookingPanelProps {
  lawyer:
    ClientPortalLawyer

  profile:
    LawyerMarketplaceProfile
}

const MODE_LABELS:
  Record<
    LawyerConsultationMode,
    string
  > = {
    in_person:
      'حضوری',

    phone:
      'تلفنی',

    online:
      'آنلاین',
  }

function formatPrice(
  value:
    number
): string {
  return value.toLocaleString(
    'fa-IR'
  )
}

export default function LawyerBookingPanel({
  lawyer,
  profile,
}: LawyerBookingPanelProps) {
  const firstOffer =
    profile.consultationOffers[
      0
    ]

  const [
    offerId,
    setOfferId,
  ] =
    useState(
      firstOffer?.id ??
        ''
    )

  const [
    durationMinutes,
    setDurationMinutes,
  ] =
    useState(
      firstOffer
        ?.durations[
          0
        ]
        ?.minutes ??
        0
    )

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState(
      ''
    )

  const [
    selectedTime,
    setSelectedTime,
  ] =
    useState(
      ''
    )

  const [
    subject,
    setSubject,
  ] =
    useState(
      ''
    )

  const [
    description,
    setDescription,
  ] =
    useState(
      ''
    )

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    submitted,
    setSubmitted,
  ] =
    useState(
      false
    )

  useEffect(() => {
    const nextOffer =
      profile.consultationOffers[
        0
      ]

    setOfferId(
      nextOffer?.id ??
        ''
    )

    setDurationMinutes(
      nextOffer
        ?.durations[
          0
        ]
        ?.minutes ??
        0
    )

    setSelectedDate(
      ''
    )

    setSelectedTime(
      ''
    )

    setSubject(
      ''
    )

    setDescription(
      ''
    )

    setError(
      null
    )

    setSubmitted(
      false
    )
  }, [
    lawyer.id,
    profile,
  ])

  const selectedOffer =
    useMemo(
      () =>
        profile.consultationOffers.find(
          (offer) =>
            offer.id ===
            offerId
        ) ??
        null,
      [
        offerId,
        profile.consultationOffers,
      ]
    )

  const selectedDuration =
    useMemo(
      () =>
        selectedOffer?.durations.find(
          (duration) =>
            duration.minutes ===
            durationMinutes
        ) ??
        null,
      [
        durationMinutes,
        selectedOffer,
      ]
    )

  const selectedDay =
    profile.availability.find(
      (day) =>
        day.value ===
        selectedDate
    )

  const selectOffer =
    (
      nextOfferId:
        string
    ) => {
      const nextOffer =
        profile.consultationOffers.find(
          (offer) =>
            offer.id ===
            nextOfferId
        )

      setOfferId(
        nextOfferId
      )

      setDurationMinutes(
        nextOffer
          ?.durations[
            0
          ]
          ?.minutes ??
          0
      )

      setSelectedDate(
        ''
      )

      setSelectedTime(
        ''
      )

      setError(
        null
      )

      setSubmitted(
        false
      )
    }

  const handleSubmit =
    () => {
      setError(
        null
      )

      if (
        !selectedOffer ||
        !selectedDuration
      ) {
        setError(
          'نوع و مدت مشاوره را انتخاب کنید.'
        )

        return
      }

      if (
        !selectedDate
      ) {
        setError(
          'روز جلسه را انتخاب کنید.'
        )

        return
      }

      if (
        !selectedTime
      ) {
        setError(
          'ساعت جلسه را انتخاب کنید.'
        )

        return
      }

      if (
        subject.trim().length <
        3
      ) {
        setError(
          'موضوع مشاوره را وارد کنید.'
        )

        return
      }

      setSubmitted(
        true
      )
    }

  if (
    submitted &&
    selectedOffer &&
    selectedDuration &&
    selectedDay
  ) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={24}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div className="min-w-0">
            <h3 className="font-black text-emerald-950">
              درخواست مشاوره آزمایشی ثبت شد
            </h3>

            <p className="mt-2 text-sm font-semibold leading-7 text-emerald-800">
              {
                selectedOffer.title
              }
              {' '}
              با
              {' '}
              {
                lawyer.fullName
              }
            </p>

            <div className="mt-4 grid gap-2 text-sm font-bold text-emerald-900 sm:grid-cols-2">
              <p>
                مدت:
                {' '}
                {selectedDuration.minutes.toLocaleString(
                  'fa-IR'
                )}
                {' '}
                دقیقه
              </p>

              <p>
                زمان:
                {' '}
                {
                  selectedDay.label
                }
                {' - '}
                {
                  selectedTime
                }
              </p>

              <p className="sm:col-span-2">
                مبلغ:
                {' '}
                {formatPrice(
                  selectedDuration.priceToman
                )}
                {' '}
                تومان
              </p>
            </div>

            <p className="mt-4 text-xs font-semibold leading-6 text-emerald-700">
              فعلاً این درخواست فقط Mock
              است و هیچ پرداخت یا رزروی در
              Backend انجام نمی‌شود.
            </p>

            <button
              type="button"
              onClick={() =>
                setSubmitted(
                  false
                )
              }
              className="mt-4 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-black text-emerald-700"
            >
              ویرایش درخواست
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div>
        <p className="text-xs font-black text-blue-700">
          رزرو مشاوره
        </p>

        <h3 className="mt-1 text-lg font-black text-slate-950">
          نوع ارتباط و زمان جلسه را انتخاب کنید
        </h3>

        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
          قبل از ثبت درخواست، مدت جلسه،
          زمان و مبلغ نهایی به‌صورت شفاف
          مشخص می‌شود.
        </p>
      </div>

      {/* Type */}

      <div className="mt-5">
        <p className="text-sm font-black text-slate-800">
          نوع مشاوره
        </p>

        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {profile.consultationOffers.map(
            (offer) => {
              const selected =
                offer.id ===
                offerId

              return (
                <button
                  key={
                    offer.id
                  }
                  type="button"
                  onClick={() =>
                    selectOffer(
                      offer.id
                    )
                  }
                  className={`rounded-xl border p-3 text-right transition ${
                    selected
                      ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {offer.mode ===
                    'phone' ? (
                      <Phone
                        size={17}
                        className="text-blue-600"
                      />
                    ) : offer.mode ===
                      'online' ? (
                      <Video
                        size={17}
                        className="text-blue-600"
                      />
                    ) : (
                      <MapPin
                        size={17}
                        className="text-blue-600"
                      />
                    )}

                    <span className="text-sm font-black text-slate-900">
                      {
                        MODE_LABELS[
                          offer.mode
                        ]
                      }
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                    {
                      offer.description
                    }
                  </p>
                </button>
              )
            }
          )}
        </div>
      </div>

      {/* Duration */}

      {selectedOffer && (
        <div className="mt-5">
          <p className="text-sm font-black text-slate-800">
            مدت جلسه و قیمت
          </p>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {selectedOffer.durations.map(
              (duration) => {
                const selected =
                  duration.minutes ===
                  durationMinutes

                return (
                  <button
                    key={
                      duration.minutes
                    }
                    type="button"
                    onClick={() => {
                      setDurationMinutes(
                        duration.minutes
                      )

                      setError(
                        null
                      )
                    }}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-right transition ${
                      selected
                        ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-black text-slate-800">
                      <Clock
                        size={16}
                      />

                      {duration.minutes.toLocaleString(
                        'fa-IR'
                      )}
                      {' '}
                      دقیقه
                    </span>

                    <span className="text-sm font-black text-emerald-700">
                      {formatPrice(
                        duration.priceToman
                      )}
                      {' '}
                      تومان
                    </span>
                  </button>
                )
              }
            )}
          </div>
        </div>
      )}

      {/* Date */}

      <div className="mt-5">
        <p className="flex items-center gap-2 text-sm font-black text-slate-800">
          <CalendarDays
            size={17}
            className="text-blue-600"
          />

          روز جلسه
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {profile.availability.map(
            (day) => (
              <button
                key={
                  day.value
                }
                type="button"
                onClick={() => {
                  setSelectedDate(
                    day.value
                  )

                  setSelectedTime(
                    ''
                  )

                  setError(
                    null
                  )
                }}
                className={`rounded-xl border px-3 py-3 text-xs font-black transition ${
                  selectedDate ===
                  day.value
                    ? 'border-blue-400 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {
                  day.label
                }
              </button>
            )
          )}
        </div>
      </div>

      {/* Time */}

      {selectedDay && (
        <div className="mt-5">
          <p className="text-sm font-black text-slate-800">
            ساعت شروع جلسه
          </p>

          <div
            dir="ltr"
            className="mt-2 flex flex-wrap gap-2"
          >
            {selectedDay.slots.map(
              (slot) => (
                <button
                  key={
                    slot
                  }
                  type="button"
                  onClick={() => {
                    setSelectedTime(
                      slot
                    )

                    setError(
                      null
                    )
                  }}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-black transition ${
                    selectedTime ===
                    slot
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {
                    slot
                  }
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Subject */}

      <div className="mt-5">
        <label
          htmlFor="consultation-subject"
          className="text-sm font-black text-slate-800"
        >
          موضوع مشاوره
        </label>

        <input
          id="consultation-subject"
          value={
            subject
          }
          onChange={(
            event
          ) => {
            setSubject(
              event.target.value
            )

            setError(
              null
            )
          }}
          maxLength={
            120
          }
          placeholder="مثلاً بررسی قرارداد خرید ملک"
          className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {/* Description */}

      <div className="mt-4">
        <label
          htmlFor="consultation-description"
          className="text-sm font-black text-slate-800"
        >
          توضیحات اولیه
        </label>

        <textarea
          id="consultation-description"
          rows={3}
          value={
            description
          }
          onChange={(
            event
          ) =>
            setDescription(
              event.target.value
            )
          }
          maxLength={
            800
          }
          placeholder="در صورت نیاز، خلاصه‌ای از موضوع یا سوال خود را بنویسید..."
          className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {selectedDuration && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="text-sm font-black text-emerald-900">
            مبلغ قابل پرداخت
          </span>

          <span className="text-lg font-black text-emerald-700">
            {formatPrice(
              selectedDuration.priceToman
            )}
            {' '}
            تومان
          </span>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 text-sm font-bold text-red-600"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={
          !lawyer.acceptsNewClients
        }
        onClick={
          handleSubmit
        }
        className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-sm font-black text-white shadow-md shadow-blue-100 transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
      >
        {lawyer.acceptsNewClients
          ? 'ثبت درخواست مشاوره'
          : 'پذیرش موکل جدید غیرفعال است'}
      </button>
    </section>
  )
}