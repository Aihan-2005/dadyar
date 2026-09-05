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

import ClientAuthGateModal from '@/components/client-portal/ClientAuthGateModal'

import {
  getCurrentClientPortalAccount,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import type {
  ClientPortalLawyer,
  LawyerConsultationMode,
} from '@/features/client-portal/types/lawyer'

import type {
  LawyerMarketplaceProfile,
} from '@/features/client-portal/types/marketplace'

interface LawyerBookingPanelProps {
  lawyer: ClientPortalLawyer
  profile: LawyerMarketplaceProfile
}

const MODE_LABELS:
  Record<
    LawyerConsultationMode,
    string
  > = {
    in_person: 'حضوری',
    phone: 'تلفنی',
    online: 'آنلاین',
  }

function formatPrice(
  value: number
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
    profile.consultationOffers[0]

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
        ?.durations[0]
        ?.minutes ??
        0
    )

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState('')

  const [
    selectedTime,
    setSelectedTime,
  ] =
    useState('')

  const [
    subject,
    setSubject,
  ] =
    useState('')

  const [
    description,
    setDescription,
  ] =
    useState('')

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    )

  const [
    submitted,
    setSubmitted,
  ] =
    useState(false)

  const [
    authOpen,
    setAuthOpen,
  ] =
    useState(false)

  useEffect(() => {
    const offer =
      profile.consultationOffers[0]

    setOfferId(
      offer?.id ??
        ''
    )

    setDurationMinutes(
      offer
        ?.durations[0]
        ?.minutes ??
        0
    )

    setSelectedDate('')
    setSelectedTime('')
    setSubject('')
    setDescription('')
    setError(null)
    setSubmitted(false)
    setAuthOpen(false)
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
      const offer =
        profile.consultationOffers.find(
          (item) =>
            item.id ===
            nextOfferId
        )

      setOfferId(
        nextOfferId
      )

      setDurationMinutes(
        offer
          ?.durations[0]
          ?.minutes ??
          0
      )

      setSelectedDate('')
      setSelectedTime('')
      setSubmitted(false)
      setError(null)
    }

  const validate =
    (): boolean => {
      setError(null)

      if (
        !selectedOffer ||
        !selectedDuration
      ) {
        setError(
          'نوع و مدت مشاوره را انتخاب کنید.'
        )

        return false
      }

      if (!selectedDate) {
        setError(
          'روز جلسه را انتخاب کنید.'
        )

        return false
      }

      if (!selectedTime) {
        setError(
          'ساعت جلسه را انتخاب کنید.'
        )

        return false
      }

      if (
        subject.trim().length <
        3
      ) {
        setError(
          'موضوع مشاوره را وارد کنید.'
        )

        return false
      }

      return true
    }

  const completeSubmission =
    (
      _account:
        ClientPortalAccount
    ) => {
      setAuthOpen(false)
      setSubmitted(true)
    }

  const handleSubmit =
    () => {
      if (!validate()) {
        return
      }

      const account =
        getCurrentClientPortalAccount()

      if (!account) {
        setAuthOpen(true)
        return
      }

      completeSubmission(
        account
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

          <div>
            <h3 className="font-black text-emerald-950">
              درخواست مشاوره ثبت شد
            </h3>

            <p className="mt-2 text-sm font-semibold text-emerald-800">
              {selectedOffer.title}
              {' '}
              با
              {' '}
              {lawyer.fullName}
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
                {selectedDay.label}
                {' - '}
                {selectedTime}
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
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <p className="text-xs font-black text-blue-700">
          رزرو مشاوره
        </p>

        <h3 className="mt-1 text-lg font-black">
          نوع ارتباط و زمان جلسه را انتخاب کنید
        </h3>

        <div className="mt-5">
          <p className="text-sm font-black text-slate-800">
            نوع مشاوره
          </p>

          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {profile.consultationOffers.map(
              (offer) => (
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
                  className={`rounded-xl border p-3 text-right ${
                    offer.id ===
                    offerId
                      ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100'
                      : 'border-slate-200 bg-white'
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

                    <span className="text-sm font-black">
                      {MODE_LABELS[
                        offer.mode
                      ]}
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                    {offer.description}
                  </p>
                </button>
              )
            )}
          </div>
        </div>

        {selectedOffer && (
          <div className="mt-5">
            <p className="text-sm font-black">
              مدت جلسه و قیمت
            </p>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {selectedOffer.durations.map(
                (duration) => (
                  <button
                    key={
                      duration.minutes
                    }
                    type="button"
                    onClick={() =>
                      setDurationMinutes(
                        duration.minutes
                      )
                    }
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                      duration.minutes ===
                      durationMinutes
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-black">
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
              )}
            </div>
          </div>
        )}

        <div className="mt-5">
          <p className="flex items-center gap-2 text-sm font-black">
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
                    setSelectedTime('')
                  }}
                  className={`rounded-xl border px-3 py-3 text-xs font-black ${
                    selectedDate ===
                    day.value
                      ? 'border-blue-400 bg-blue-50 text-blue-800'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {day.label}
                </button>
              )
            )}
          </div>
        </div>

        {selectedDay && (
          <div className="mt-5">
            <p className="text-sm font-black">
              ساعت شروع
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
                    onClick={() =>
                      setSelectedTime(
                        slot
                      )
                    }
                    className={`rounded-xl border px-4 py-2.5 text-sm font-black ${
                      selectedTime ===
                      slot
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {slot}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        <div className="mt-5">
          <label className="text-sm font-black">
            موضوع مشاوره
          </label>

          <input
            value={
              subject
            }
            onChange={(
              event
            ) =>
              setSubject(
                event.target.value
              )
            }
            maxLength={120}
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-black">
            توضیحات اولیه
          </label>

          <textarea
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
            maxLength={800}
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {selectedDuration && (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="text-sm font-black text-emerald-900">
              مبلغ
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
          <p className="mt-3 text-sm font-bold text-red-600">
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
          className="mt-5 h-12 w-full rounded-xl bg-blue-600 text-sm font-black text-white disabled:bg-slate-300"
        >
          ثبت درخواست مشاوره
        </button>
      </section>

      <ClientAuthGateModal
        open={
          authOpen
        }
        title="برای رزرو مشاوره وارد شوید"
        onClose={() =>
          setAuthOpen(
            false
          )
        }
        onAuthenticated={
          completeSubmission
        }
      />
    </>
  )
}