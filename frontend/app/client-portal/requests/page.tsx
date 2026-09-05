'use client'

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import Link from 'next/link'

import {
  useRouter,
} from 'next/navigation'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  FileQuestion,
  FileText,
  MessageSquareText,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react'

import {
  getCurrentClientPortalAccount,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  cancelClientLawyerRequest,
  getClientLawyerRequests,
  subscribeClientLawyerRequests,
} from '@/features/client-portal/data/client-communication.repository'

import type {
  ClientLawyerRequestKind,
  ClientLawyerRequestRecord,
  ClientLawyerRequestStatus,
} from '@/features/client-portal/types/communication'

import {
  CONSULTATION_MODE_LABELS,
  CONTACT_METHOD_LABELS,
  LEGAL_CATEGORY_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_URGENCY_LABELS,
  formatCommunicationDateTime,
  formatToman,
  getRequestStatusClassName,
} from '@/features/client-portal/utils/communication'

type KindFilter =
  | 'all'
  | ClientLawyerRequestKind

type StatusFilter =
  | 'all'
  | ClientLawyerRequestStatus

export default function ClientRequestsPage() {
  const router =
    useRouter()

  const [
    account,
    setAccount,
  ] =
    useState<ClientPortalAccount | null>(
      null
    )

  const [
    records,
    setRecords,
  ] =
    useState<ClientLawyerRequestRecord[]>(
      []
    )

  const [
    ready,
    setReady,
  ] =
    useState(false)

  const [
    kindFilter,
    setKindFilter,
  ] =
    useState<KindFilter>(
      'all'
    )

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      'all'
    )

  const [
    search,
    setSearch,
  ] =
    useState('')

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
        '/client-login?returnTo=/client-portal/requests'
      )

      return
    }

    setAccount(
      current
    )

    const reload =
      () => {
        setRecords(
          getClientLawyerRequests(
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
    router,
  ])

  const filteredRecords =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLocaleLowerCase(
              'fa-IR'
            )

        return records.filter(
          (
            record
          ) => {
            if (
              kindFilter !==
                'all' &&
              record.kind !==
                kindFilter
            ) {
              return false
            }

            if (
              statusFilter !==
                'all' &&
              record.status !==
                statusFilter
            ) {
              return false
            }

            if (
              !normalizedSearch
            ) {
              return true
            }

            const haystack = [
              record.reference,
              record.subject,
              record.lawyer.fullName,
              record.description,
            ]
              .join(' ')
              .toLocaleLowerCase(
                'fa-IR'
              )

            return haystack.includes(
              normalizedSearch
            )
          }
        )
      },
      [
        kindFilter,
        records,
        search,
        statusFilter,
      ]
    )

  const activeCount =
    records.filter(
      (
        record
      ) =>
        record.status !==
          'cancelled' &&
        record.status !==
          'completed'
    ).length

  const bookingCount =
    records.filter(
      (
        record
      ) =>
        record.kind ===
        'consultation_booking'
    ).length

  const inquiryCount =
    records.filter(
      (
        record
      ) =>
        record.kind ===
        'initial_request'
    ).length

  const reload =
    () => {
      if (!account) {
        return
      }

      setRecords(
        getClientLawyerRequests(
          account.id
        )
      )
    }

  const handleCancel =
    (
      record:
        ClientLawyerRequestRecord
    ) => {
      if (!account) {
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
        cancelClientLawyerRequest(
          record.id,
          account.id
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

  if (
    !ready ||
    !account
  ) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </main>
    )
  }

  return (
    <main
      dir="rtl"
      className="min-h-dvh bg-slate-100 text-slate-950"
    >
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <div>
            <p className="font-black">
              دادیار
            </p>

            <p className="text-xs font-semibold text-slate-500">
              {account.fullName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/client-portal/contracts"
              className="hidden h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-black text-slate-700 sm:inline-flex"
            >
              <FileText
                size={15}
              />

              قراردادهای من
            </Link>

            <Link
              href="/client-portal"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-black text-slate-700"
            >
              <ArrowRight
                size={16}
              />

              وکلا
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <section className="rounded-[26px] border border-slate-200 bg-gradient-to-l from-blue-50 via-white to-emerald-50 p-6 sm:p-8">
          <p className="text-sm font-black text-blue-700">
            پیگیری ارتباطات
          </p>

          <h1 className="mt-1 text-2xl font-black sm:text-3xl">
            درخواست‌های من
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
            درخواست‌های بررسی، رزروهای مشاوره
            و پیام‌های مرتبط با هر درخواست را
            از این بخش مدیریت کنید.
          </p>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="کل درخواست‌ها"
            value={
              records.length
            }
            icon={
              MessageSquareText
            }
          />

          <StatCard
            label="در حال پیگیری"
            value={
              activeCount
            }
            icon={
              Clock3
            }
          />

          <StatCard
            label="بررسی اولیه"
            value={
              inquiryCount
            }
            icon={
              FileQuestion
            }
          />

          <StatCard
            label="رزرو مشاوره"
            value={
              bookingCount
            }
            icon={
              CalendarDays
            }
          />
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto]">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="جستجو بر اساس وکیل، موضوع یا کد پیگیری..."
                className="h-11 w-full rounded-xl border border-slate-300 pr-11 pl-3 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={
                kindFilter
              }
              onChange={(
                event
              ) =>
                setKindFilter(
                  event.target
                    .value as KindFilter
                )
              }
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black outline-none"
            >
              <option value="all">
                همه خدمات
              </option>

              <option value="initial_request">
                بررسی اولیه
              </option>

              <option value="consultation_booking">
                رزرو مشاوره
              </option>
            </select>

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter
                )
              }
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black outline-none"
            >
              <option value="all">
                همه وضعیت‌ها
              </option>

              {(
                Object.entries(
                  REQUEST_STATUS_LABELS
                ) as Array<
                  [
                    ClientLawyerRequestStatus,
                    string,
                  ]
                >
              ).map(
                (
                  [
                    value,
                    label,
                  ]
                ) => (
                  <option
                    key={
                      value
                    }
                    value={
                      value
                    }
                  >
                    {label}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={
                reload
              }
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-black text-slate-700"
            >
              <RefreshCw
                size={16}
              />

              بروزرسانی
            </button>
          </div>
        </section>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        )}

        {filteredRecords.length >
        0 ? (
          <section className="mt-5 space-y-4">
            {filteredRecords.map(
              (
                record
              ) => (
                <RequestCard
                  key={
                    record.id
                  }
                  record={
                    record
                  }
                  onCancel={() =>
                    handleCancel(
                      record
                    )
                  }
                />
              )
            )}
          </section>
        ) : (
          <section className="mt-5 rounded-[22px] border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <MessageSquareText
              size={30}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-lg font-black">
              درخواستی پیدا نشد
            </h2>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              از پروفایل هر وکیل می‌توانید
              درخواست بررسی یا رزرو مشاوره
              ایجاد کنید.
            </p>

            <Link
              href="/client-portal"
              className="mt-5 inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
            >
              مشاهده وکلا
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}

function RequestCard({
  record,
  onCancel,
}: {
  record:
    ClientLawyerRequestRecord

  onCancel:
    () => void
}) {
  const cancellable =
    record.status ===
      'submitted' ||
    record.status ===
      'under_review'

  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${getRequestStatusClassName(
                record.status
              )}`}
            >
              {
                REQUEST_STATUS_LABELS[
                  record.status
                ]
              }
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">
              {record.kind ===
              'consultation_booking'
                ? 'رزرو مشاوره'
                : 'بررسی اولیه'}
            </span>
          </div>

          <h2 className="mt-3 text-lg font-black">
            {record.subject}
          </h2>

          <p className="mt-1 text-sm font-semibold text-slate-500">
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

      {record.kind ===
      'consultation_booking' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoBox
            label="نوع"
            value={
              CONSULTATION_MODE_LABELS[
                record.consultationMode
              ]
            }
          />

          <InfoBox
            label="تاریخ"
            value={
              record.dateLabel
            }
          />

          <InfoBox
            label="ساعت"
            value={
              record.time
            }
          />

          <InfoBox
            label="مبلغ"
            value={
              formatToman(
                record.priceToman
              )
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <InfoBox
            label="حوزه"
            value={
              LEGAL_CATEGORY_LABELS[
                record.category
              ]
            }
          />

          <InfoBox
            label="روش ارتباط"
            value={
              CONTACT_METHOD_LABELS[
                record.preferredContactMethod
              ]
            }
          />

          <InfoBox
            label="فوریت"
            value={
              REQUEST_URGENCY_LABELS[
                record.urgency
              ]
            }
          />
        </div>
      )}

      <p className="mt-4 line-clamp-2 text-sm font-semibold leading-7 text-slate-600">
        {record.description}
      </p>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-slate-400">
          {formatCommunicationDateTime(
            record.createdAt
          )}
        </p>

        <div className="flex gap-2">
          {cancellable && (
            <button
              type="button"
              onClick={
                onCancel
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-600"
            >
              <XCircle
                size={15}
              />

              لغو
            </button>
          )}

          <Link
            href={`/client-portal/requests/${record.id}`}
            className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-xs font-black text-white"
          >
            جزئیات و پیام‌ها
          </Link>
        </div>
      </div>
    </article>
  )
}

function InfoBox({
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
      <p className="text-[10px] font-bold text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon:
    Icon,
}: {
  label:
    string

  value:
    number

  icon:
    LucideIcon
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-black text-slate-600">
        <Icon
          size={16}
          className="text-blue-600"
        />

        {label}
      </div>

      <p className="mt-3 text-2xl font-black">
        {value.toLocaleString(
          'fa-IR'
        )}
      </p>
    </article>
  )
}