'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  MapPin,
  Phone,
  Send,
  Video,
} from 'lucide-react'

import ClientAuthGateModal from '@/components/client-portal/ClientAuthGateModal'

import {
  getCurrentClientPortalAccount,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  createConsultationBooking,
  isConsultationSlotReserved,
  subscribeClientLawyerRequests,
} from '@/features/client-portal/data/client-communication.repository'

import type {
  ConsultationBookingRecord,
  LegalCaseStage,
  LegalMatterCategory,
} from '@/features/client-portal/types/communication'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'

import type {
  LawyerMarketplaceProfile,
} from '@/features/client-portal/types/marketplace'

import {
  CASE_STAGE_LABELS,
  CONSULTATION_MODE_LABELS,
  LEGAL_CATEGORY_LABELS,
  formatToman,
} from '@/features/client-portal/utils/communication'

interface LawyerBookingPanelProps {
  lawyer:
    ClientPortalLawyer

  profile:
    LawyerMarketplaceProfile
}

type BookingStage =
  | 'form'
  | 'review'
  | 'submitted'

const INPUT_CLASS =
  'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

export default function LawyerBookingPanel({
  lawyer,
  profile,
}: LawyerBookingPanelProps) {
  const firstOffer =
    profile.consultationOffers[0]

  const [
    stage,
    setStage,
  ] =
    useState<BookingStage>(
      'form'
    )

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
    category,
    setCategory,
  ] =
    useState<LegalMatterCategory>(
      'other'
    )

  const [
    caseStage,
    setCaseStage,
  ] =
    useState<LegalCaseStage>(
      'pre_filing'
    )

  const [
    opposingPartyName,
    setOpposingPartyName,
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
    authOpen,
    setAuthOpen,
  ] =
    useState(false)

  const [
    submittedBooking,
    setSubmittedBooking,
  ] =
    useState<ConsultationBookingRecord | null>(
      null
    )

  const [
    availabilityRevision,
    setAvailabilityRevision,
  ] =
    useState(0)

  useEffect(() => {
    const offer =
      profile.consultationOffers[0]

    setStage(
      'form'
    )

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

    setSelectedDate(
      ''
    )

    setSelectedTime(
      ''
    )

    setCategory(
      'other'
    )

    setCaseStage(
      'pre_filing'
    )

    setOpposingPartyName(
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

    setAuthOpen(
      false
    )

    setSubmittedBooking(
      null
    )
  }, [
    lawyer.id,
    profile.lawyerId,
  ])

  useEffect(
    () =>
      subscribeClientLawyerRequests(
        () =>
          setAvailabilityRevision(
            (
              current
            ) =>
              current +
              1
          )
      ),
    []
  )

  const selectedOffer =
    useMemo(
      () =>
        profile.consultationOffers.find(
          (
            offer
          ) =>
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
          (
            duration
          ) =>
            duration.minutes ===
            durationMinutes
        ) ??
        null,
      [
        durationMinutes,
        selectedOffer,
      ]
    )

  const availability =
    useMemo(
      () =>
        profile.availability.map(
          (
            day
          ) => ({
            ...day,

            slots:
              day.slots.map(
                (
                  time
                ) => ({
                  time,

                  reserved:
                    isConsultationSlotReserved(
                      lawyer.id,
                      day.value,
                      time
                    ),
                })
              ),
          })
        ),
      [
        availabilityRevision,
        lawyer.id,
        profile.availability,
      ]
    )

  const selectedDay =
    availability.find(
      (
        day
      ) =>
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
          (
            offer
          ) =>
            offer.id ===
            nextOfferId
        )

      setOfferId(
        nextOfferId
      )

      setDurationMinutes(
        nextOffer
          ?.durations[0]
          ?.minutes ??
          0
      )

      setSelectedDate(
        ''
      )

      setSelectedTime(
        ''
      )

      setStage(
        'form'
      )

      setError(
        null
      )
    }

  const validate =
    (): boolean => {
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

        return false
      }

      if (
        !selectedDate ||
        !selectedDay
      ) {
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
        isConsultationSlotReserved(
          lawyer.id,
          selectedDate,
          selectedTime
        )
      ) {
        setError(
          'این ساعت دیگر در دسترس نیست.'
        )

        setSelectedTime(
          ''
        )

        return false
      }

      if (
        subject.trim().length <
        5
      ) {
        setError(
          'موضوع مشاوره را کامل‌تر وارد کنید.'
        )

        return false
      }

      return true
    }

  const handleReview =
    () => {
      if (!validate()) {
        return
      }

      setStage(
        'review'
      )
    }

  const completeSubmission =
    (
      account:
        ClientPortalAccount
    ) => {
      if (
        !selectedOffer ||
        !selectedDuration ||
        !selectedDay ||
        !selectedTime
      ) {
        setError(
          'اطلاعات جلسه کامل نیست.'
        )

        setStage(
          'form'
        )

        return
      }

      try {
        const created =
          createConsultationBooking(
            account,
            lawyer,
            {
              category,

              caseStage,

              opposingPartyName:
                opposingPartyName.trim() ||
                undefined,

              offerId:
                selectedOffer.id,

              consultationMode:
                selectedOffer.mode,

              consultationTitle:
                selectedOffer.title,

              durationMinutes:
                selectedDuration.minutes,

              priceToman:
                selectedDuration.priceToman,

              date:
                selectedDay.value,

              dateLabel:
                selectedDay.label,

              time:
                selectedTime,

              subject,

              description,
            }
          )

        setSubmittedBooking(
          created
        )

        setAuthOpen(
          false
        )

        setError(
          null
        )

        setStage(
          'submitted'
        )
      } catch (
        caughtError
      ) {
        setStage(
          'form'
        )

        setSelectedTime(
          ''
        )

        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'ثبت رزرو انجام نشد.'
        )
      }
    }

  const handleFinalSubmit =
    () => {
      if (!validate()) {
        setStage(
          'form'
        )

        return
      }

      const account =
        getCurrentClientPortalAccount()

      if (!account) {
        setAuthOpen(
          true
        )

        return
      }

      completeSubmission(
        account
      )
    }

  if (
    stage ===
      'submitted' &&
    submittedBooking
  ) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={25}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-emerald-950">
              درخواست رزرو ثبت شد
            </h3>

            <p className="mt-2 text-sm font-semibold leading-7 text-emerald-800">
              درخواست جلسه برای
              {' '}
              {lawyer.fullName}
              {' '}
              ارسال شد و از صفحه پیگیری قابل
              مشاهده است.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SummaryItem
                label="کد پیگیری"
                value={
                  submittedBooking.reference
                }
                dir="ltr"
              />

              <SummaryItem
                label="نوع جلسه"
                value={
                  CONSULTATION_MODE_LABELS[
                    submittedBooking.consultationMode
                  ]
                }
              />

              <SummaryItem
                label="زمان"
                value={`${submittedBooking.dateLabel} - ${submittedBooking.time}`}
              />

              <SummaryItem
                label="هزینه"
                value={
                  formatToman(
                    submittedBooking.priceToman
                  )
                }
              />
            </div>

            <Link
              href={`/client-portal/requests/${submittedBooking.id}`}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-black text-white"
            >
              مشاهده جزئیات رزرو
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (
    stage ===
      'review' &&
    selectedOffer &&
    selectedDuration &&
    selectedDay &&
    selectedTime
  ) {
    return (
      <>
        <section className="rounded-2xl border border-blue-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-black text-blue-700">
                تأیید اطلاعات
              </p>

              <h3 className="mt-1 text-lg font-black text-slate-950">
                جزئیات جلسه را بررسی کنید
              </h3>
            </div>

            <button
              type="button"
              onClick={() =>
                setStage(
                  'form'
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-xs font-black text-slate-700"
            >
              <ArrowRight
                size={15}
              />

              ویرایش
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ReviewItem
              label="وکیل"
              value={
                lawyer.fullName
              }
            />

            <ReviewItem
              label="نوع مشاوره"
              value={
                selectedOffer.title
              }
            />

            <ReviewItem
              label="مدت"
              value={`${selectedDuration.minutes.toLocaleString(
                'fa-IR'
              )} دقیقه`}
            />

            <ReviewItem
              label="زمان"
              value={`${selectedDay.label} - ${selectedTime}`}
            />

            <ReviewItem
              label="حوزه حقوقی"
              value={
                LEGAL_CATEGORY_LABELS[
                  category
                ]
              }
            />

            <ReviewItem
              label="مبلغ"
              value={
                formatToman(
                  selectedDuration.priceToman
                )
              }
            />
          </div>

          {selectedOffer.mode ===
            'in_person' && (
            <ModeInfo
              icon={
                MapPin
              }
              title="جلسه حضوری"
            >
              {lawyer.officeAddress}
            </ModeInfo>
          )}

          {selectedOffer.mode ===
            'phone' && (
            <ModeInfo
              icon={
                Phone
              }
              title="جلسه تلفنی"
            >
              شماره موبایل حساب موکل برای
              هماهنگی جلسه استفاده می‌شود.
            </ModeInfo>
          )}

          {selectedOffer.mode ===
            'online' && (
            <ModeInfo
              icon={
                Video
              }
              title="جلسه آنلاین"
            >
              اطلاعات ورود به جلسه پس از
              تأیید نهایی رزرو قابل مشاهده
              خواهد بود.
            </ModeInfo>
          )}

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500">
              موضوع جلسه
            </p>

            <p className="mt-2 text-sm font-black text-slate-900">
              {subject}
            </p>

            {description.trim() && (
              <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-600">
                {description}
              </p>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={
              handleFinalSubmit
            }
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white transition hover:bg-blue-700"
          >
            <Send
              size={18}
            />

            ثبت درخواست رزرو
          </button>
        </section>

        <ClientAuthGateModal
          open={
            authOpen
          }
          title="برای ثبت رزرو وارد شوید"
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

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <p className="text-xs font-black text-blue-700">
          رزرو مشاوره
        </p>

        <h3 className="mt-1 text-lg font-black text-slate-950">
          نوع ارتباط و زمان جلسه را انتخاب
          کنید
        </h3>

        <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
          رزرو پس از بررسی و تأیید وکیل قطعی
          خواهد شد.
        </p>

        <div className="mt-5">
          <p className="text-sm font-black text-slate-800">
            نوع مشاوره
          </p>

          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {profile.consultationOffers.map(
              (
                offer
              ) => (
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
                    offer.id ===
                    offerId
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
                        className="text-violet-600"
                      />
                    ) : (
                      <MapPin
                        size={17}
                        className="text-emerald-600"
                      />
                    )}

                    <span className="text-sm font-black">
                      {
                        CONSULTATION_MODE_LABELS[
                          offer.mode
                        ]
                      }
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
            <p className="flex items-center gap-2 text-sm font-black">
              <CircleDollarSign
                size={17}
                className="text-emerald-600"
              />

              مدت و مبلغ جلسه
            </p>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {selectedOffer.durations.map(
                (
                  duration
                ) => (
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
                        ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-black">
                      <Clock3
                        size={16}
                      />

                      {duration.minutes.toLocaleString(
                        'fa-IR'
                      )}
                      {' '}
                      دقیقه
                    </span>

                    <span className="text-sm font-black text-emerald-700">
                      {formatToman(
                        duration.priceToman
                      )}
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
            {availability.map(
              (
                day
              ) => (
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
                (
                  slot
                ) => (
                  <button
                    key={
                      slot.time
                    }
                    type="button"
                    disabled={
                      slot.reserved
                    }
                    onClick={() => {
                      setSelectedTime(
                        slot.time
                      )

                      setError(
                        null
                      )
                    }}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-black ${
                      slot.reserved
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'
                        : selectedTime ===
                            slot.time
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {slot.time}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SelectField
            label="حوزه حقوقی"
            value={
              category
            }
            options={
              LEGAL_CATEGORY_LABELS
            }
            onChange={(
              value
            ) =>
              setCategory(
                value as LegalMatterCategory
              )
            }
          />

          <SelectField
            label="مرحله پرونده"
            value={
              caseStage
            }
            options={
              CASE_STAGE_LABELS
            }
            onChange={(
              value
            ) =>
              setCaseStage(
                value as LegalCaseStage
              )
            }
          />

          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              طرف مقابل
            </span>

            <input
              value={
                opposingPartyName
              }
              onChange={(
                event
              ) =>
                setOpposingPartyName(
                  event.target.value.slice(
                    0,
                    120
                  )
                )
              }
              placeholder="اختیاری"
              className={
                INPUT_CLASS
              }
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              موضوع جلسه
            </span>

            <input
              value={
                subject
              }
              onChange={(
                event
              ) => {
                setSubject(
                  event.target.value.slice(
                    0,
                    140
                  )
                )

                setError(
                  null
                )
              }}
              placeholder="موضوع اصلی مشاوره"
              className={
                INPUT_CLASS
              }
            />
          </label>
        </div>

        <label className="mt-4 block">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-black text-slate-700">
              توضیحات پیش از جلسه
            </span>

            <span className="text-[11px] text-slate-400">
              {description.length.toLocaleString(
                'fa-IR'
              )}
              {' / '}
              ۱۰۰۰
            </span>
          </div>

          <textarea
            rows={4}
            value={
              description
            }
            onChange={(
              event
            ) =>
              setDescription(
                event.target.value.slice(
                  0,
                  1000
                )
              )
            }
            placeholder="اطلاعاتی که بهتر است وکیل پیش از جلسه بداند..."
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        {selectedDuration && (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="text-sm font-black text-emerald-900">
              مبلغ جلسه
            </span>

            <span className="text-lg font-black text-emerald-700">
              {formatToman(
                selectedDuration.priceToman
              )}
            </span>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
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
            handleReview
          }
          className="mt-5 h-12 w-full rounded-xl bg-blue-600 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          بررسی اطلاعات رزرو
        </button>
      </section>

      <ClientAuthGateModal
        open={
          authOpen
        }
        title="برای ثبت رزرو وارد شوید"
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

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label:
    string

  value:
    string

  options:
    Record<
      string,
      string
    >

  onChange:
    (
      value:
        string
    ) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>

      <select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className={
          INPUT_CLASS
        }
      >
        {Object.entries(
          options
        ).map(
          (
            [
              optionValue,
              optionLabel,
            ]
          ) => (
            <option
              key={
                optionValue
              }
              value={
                optionValue
              }
            >
              {optionLabel}
            </option>
          )
        )}
      </select>
    </label>
  )
}

function ModeInfo({
  icon:
    Icon,
  title,
  children,
}: {
  icon:
    typeof MapPin

  title:
    string

  children:
    React.ReactNode
}) {
  return (
    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
      <div className="flex items-center gap-2 text-sm font-black text-blue-900">
        <Icon
          size={17}
        />

        {title}
      </div>

      <p className="mt-2 text-sm font-semibold leading-7 text-blue-800">
        {children}
      </p>
    </div>
  )
}

function ReviewItem({
  label,
  value,
}: {
  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-bold text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-black leading-6 text-slate-900">
        {value}
      </p>
    </div>
  )
}

function SummaryItem({
  label,
  value,
  dir,
}: {
  label:
    string

  value:
    string

  dir?:
    'rtl' | 'ltr'
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-3">
      <p className="text-[11px] font-bold text-emerald-700">
        {label}
      </p>

      <p
        dir={
          dir
        }
        className="mt-1.5 break-words text-sm font-black text-slate-900"
      >
        {value}
      </p>
    </div>
  )
}