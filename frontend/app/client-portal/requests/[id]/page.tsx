'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  useParams,
  useRouter,
} from 'next/navigation'

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquareText,
  Phone,
  UserRound,
  XCircle,
} from 'lucide-react'

import {
  getCurrentClientPortalAccount,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  cancelClientLawyerRequest,
  getClientLawyerRequestById,
  subscribeClientLawyerRequests,
} from '@/features/client-portal/data/client-communication.repository'

import type {
  ClientLawyerRequestRecord,
} from '@/features/client-portal/types/communication'

import {
  CALLBACK_WINDOW_LABELS,
  CASE_STAGE_LABELS,
  CONSULTATION_MODE_LABELS,
  CONTACT_METHOD_LABELS,
  LEGAL_CATEGORY_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_URGENCY_LABELS,
  formatCommunicationDateTime,
  formatToman,
  getRequestStatusClassName,
} from '@/features/client-portal/utils/communication'

export default function ClientRequestDetailsPage() {
  const router =
    useRouter()

  const params =
    useParams<{
      id:
        string
    }>()

  const requestId =
    params.id

  const [
    account,
    setAccount,
  ] =
    useState<ClientPortalAccount | null>(
      null
    )

  const [
    record,
    setRecord,
  ] =
    useState<ClientLawyerRequestRecord | null>(
      null
    )

  const [
    ready,
    setReady,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    )

  useEffect(() => {
    const current =
      getCurrentClientPortalAccount()

    if (!current) {
      router.replace(
        `/client-login?returnTo=${encodeURIComponent(
          `/client-portal/requests/${requestId}`
        )}`
      )

      return
    }

    setAccount(
      current
    )

    const reload =
      () => {
        setRecord(
          getClientLawyerRequestById(
            requestId,
            current.id
          )
        )
      }

    reload()

    setReady(
      true
    )

    return subscribeClientLawyerRequests(
      reload
    )
  }, [
    requestId,
    router,
  ])

  const handleCancel =
    () => {
      if (
        !account ||
        !record
      ) {
        return
      }

      const confirmed =
        window.confirm(
          'این درخواست لغو شود؟'
        )

      if (!confirmed) {
        return
      }

      try {
        const updated =
          cancelClientLawyerRequest(
            record.id,
            account.id
          )

        setRecord(
          updated
        )

        setError(
          null
        )
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'لغو درخواست انجام نشد.'
        )
      }
    }

  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </main>
    )
  }

  if (
    !account ||
    !record
  ) {
    return (
      <main
        dir="rtl"
        className="flex min-h-dvh items-center justify-center bg-slate-100 px-4"
      >
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <MessageSquareText
            size={30}
            className="mx-auto text-slate-400"
          />

          <h1 className="mt-4 text-lg font-black">
            درخواست پیدا نشد
          </h1>

          <Link
            href="/client-portal/requests"
            className="mt-5 inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
          >
            بازگشت
          </Link>
        </section>
      </main>
    )
  }

  const cancellable =
    record.status ===
      'submitted' ||
    record.status ===
      'under_review'

  return (
    <main
      dir="rtl"
      className="min-h-dvh bg-slate-100 text-slate-950"
    >
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div>
            <p className="font-black">
              دادیار
            </p>

            <p className="text-xs font-semibold text-slate-500">
              پیگیری درخواست
            </p>
          </div>

          <Link
            href="/client-portal/requests"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-black text-slate-700"
          >
            <ArrowRight
              size={16}
            />

            درخواست‌ها
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${getRequestStatusClassName(
                      record.status
                    )}`}
                  >
                    {
                      REQUEST_STATUS_LABELS[
                        record.status
                      ]
                    }
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                    {record.kind ===
                    'consultation_booking'
                      ? 'رزرو مشاوره'
                      : 'بررسی اولیه'}
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-black">
                  {record.subject}
                </h1>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {record.lawyer.fullName}
                  {' — '}
                  {record.lawyer.title}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400">
                  کد پیگیری
                </p>

                <p
                  dir="ltr"
                  className="mt-1 text-sm font-black text-blue-700"
                >
                  {record.reference}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoItem
                label="حوزه حقوقی"
                value={
                  LEGAL_CATEGORY_LABELS[
                    record.category
                  ]
                }
              />

              <InfoItem
                label="مرحله پرونده"
                value={
                  CASE_STAGE_LABELS[
                    record.caseStage
                  ]
                }
              />

              {record.opposingPartyName && (
                <InfoItem
                  label="طرف مقابل"
                  value={
                    record.opposingPartyName
                  }
                />
              )}

              <InfoItem
                label="زمان ثبت"
                value={
                  formatCommunicationDateTime(
                    record.createdAt
                  )
                }
              />
            </div>

            {record.kind ===
            'consultation_booking' ? (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailRow
                    icon={
                      CalendarDays
                    }
                    label="تاریخ جلسه"
                    value={
                      record.dateLabel
                    }
                  />

                  <DetailRow
                    icon={
                      Clock3
                    }
                    label="ساعت"
                    value={
                      record.time
                    }
                  />

                  <DetailRow
                    icon={
                      UserRound
                    }
                    label="نوع مشاوره"
                    value={
                      CONSULTATION_MODE_LABELS[
                        record.consultationMode
                      ]
                    }
                  />

                  <DetailRow
                    icon={
                      CheckCircle2
                    }
                    label="مدت و مبلغ"
                    value={`${record.durationMinutes.toLocaleString(
                      'fa-IR'
                    )} دقیقه — ${formatToman(
                      record.priceToman
                    )}`}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label="روش ارتباط"
                    value={
                      CONTACT_METHOD_LABELS[
                        record.preferredContactMethod
                      ]
                    }
                  />

                  <InfoItem
                    label="فوریت"
                    value={
                      REQUEST_URGENCY_LABELS[
                        record.urgency
                      ]
                    }
                  />

                  {record.callbackWindow && (
                    <InfoItem
                      label="زمان مناسب تماس"
                      value={
                        CALLBACK_WINDOW_LABELS[
                          record.callbackWindow
                        ]
                      }
                    />
                  )}
                </div>
              </div>
            )}

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-black text-slate-500">
                شرح درخواست
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-8 text-slate-700">
                {record.description ||
                  'توضیح تکمیلی ثبت نشده است.'}
              </p>
            </div>
          </section>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}
        </div>

        {/* Sidebar */}

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-black">
              وکیل
            </p>

            <h2 className="mt-3 text-lg font-black">
              {record.lawyer.fullName}
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              {record.lawyer.title}
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="mt-1 shrink-0 text-blue-600"
                />

                <p className="text-xs font-semibold leading-6 text-slate-600">
                  {record.lawyer.officeAddress}
                </p>
              </div>

              <a
                href={`tel:${record.lawyer.phone}`}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-700"
              >
                <Phone
                  size={16}
                />

                تماس با دفتر
              </a>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-black">
              روند درخواست
            </p>

            <div className="mt-4 space-y-4">
              {record.history.map(
                (
                  event,
                  index
                ) => (
                  <div
                    key={
                      event.id
                    }
                    className="relative flex gap-3"
                  >
                    {index <
                      record.history.length -
                        1 && (
                      <div className="absolute right-[7px] top-5 h-[calc(100%+8px)] w-px bg-slate-200" />
                    )}

                    <span className="relative mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-blue-100 bg-blue-600" />

                    <div>
                      <p className="text-xs font-black text-slate-700">
                        {event.label}
                      </p>

                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        {formatCommunicationDateTime(
                          event.createdAt
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          {cancellable && (
            <button
              type="button"
              onClick={
                handleCancel
              }
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-black text-red-600"
            >
              <XCircle
                size={16}
              />

              لغو درخواست
            </button>
          )}
        </aside>
      </div>
    </main>
  )
}

function InfoItem({
  label,
  value,
}: {
  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-bold text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-black leading-6 text-slate-900">
        {value}
      </p>
    </div>
  )
}

function DetailRow({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    typeof CalendarDays

  label:
    string

  value:
    string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        size={16}
        className="mt-1 shrink-0 text-blue-600"
      />

      <div>
        <p className="text-[10px] font-bold text-blue-600">
          {label}
        </p>

        <p className="mt-1 text-sm font-black text-blue-950">
          {value}
        </p>
      </div>
    </div>
  )
}