'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  Archive,
  ArrowRight,
  FileText,
  Loader2,
  MessageCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react'

import {
  archiveClientPetition,
  getClientPetitions,
} from '@/services/client-petition.service'

import {
  cancelClientLawyerInquiry,
  getClientLawyerInquiries,
} from '@/services/client-lawyer-inquiry.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  ClientLawyerInquiry,
  ClientLawyerInquiryStatus,
} from '@/types/client-lawyer-inquiry'

import type {
  ClientPetition,
  ClientPetitionStatus,
} from '@/types/client-petition'


type RequestView =
  | 'all'
  | 'inquiries'
  | 'petitions'


type FeedItem =
  | {
      kind:
        'inquiry'

      createdAt:
        string

      item:
        ClientLawyerInquiry
    }
  | {
      kind:
        'petition'

      createdAt:
        string

      item:
        ClientPetition
    }


const inquiryStatusMeta:
  Record<
    ClientLawyerInquiryStatus,
    {
      label: string
      className: string
    }
  > = {
    SUBMITTED: {
      label:
        'ارسال‌شده',

      className:
        'border-blue-200 bg-blue-50 text-blue-700',
    },

    IN_REVIEW: {
      label:
        'در حال بررسی',

      className:
        'border-amber-200 bg-amber-50 text-amber-700',
    },

    ACCEPTED: {
      label:
        'پذیرفته‌شده',

      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    REJECTED: {
      label:
        'ردشده',

      className:
        'border-red-200 bg-red-50 text-red-700',
    },

    CANCELLED: {
      label:
        'لغوشده',

      className:
        'border-slate-200 bg-slate-100 text-slate-600',
    },

    CLOSED: {
      label:
        'بسته‌شده',

      className:
        'border-slate-300 bg-slate-100 text-slate-700',
    },
  }


const petitionStatusMeta:
  Record<
    ClientPetitionStatus,
    {
      label: string
      className: string
    }
  > = {
    DRAFT: {
      label:
        'پیش‌نویس',

      className:
        'border-slate-200 bg-slate-100 text-slate-700',
    },

    SUBMITTED: {
      label:
        'ارسال‌شده',

      className:
        'border-blue-200 bg-blue-50 text-blue-700',
    },

    ARCHIVED: {
      label:
        'بایگانی‌شده',

      className:
        'border-violet-200 bg-violet-50 text-violet-700',
    },
  }


function formatDate(
  value:
    string,
): string {
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


export default function ClientRequestsPage() {
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

  const [
    view,
    setView,
  ] =
    useState<RequestView>(
      'all',
    )

  const [
    inquiries,
    setInquiries,
  ] =
    useState<
      ClientLawyerInquiry[]
    >([])

  const [
    petitions,
    setPetitions,
  ] =
    useState<
      ClientPetition[]
    >([])

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
    >(null)

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null)


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
            inquiryPage,
            petitionPage,
          ] =
            await Promise.all([
              getClientLawyerInquiries({
                page:
                  1,

                limit:
                  100,
              }),

              getClientPetitions({
                page:
                  1,

                limit:
                  100,
              }),
            ])

          setInquiries(
            inquiryPage.items,
          )

          setPetitions(
            petitionPage.items,
          )
        } catch (
          caughtError:
            unknown
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت اطلاعات ناموفق بود.',
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
    },

    [
      load,
    ],
  )


  const feed =
    useMemo<
      FeedItem[]
    >(
      () => {
        const items:
          FeedItem[] = []

        if (
          view ===
            'all' ||
          view ===
            'inquiries'
        ) {
          items.push(
            ...inquiries.map(
              (
                item,
              ) => ({
                kind:
                  'inquiry' as const,

                createdAt:
                  item.createdAt,

                item,
              }),
            ),
          )
        }

        if (
          view ===
            'all' ||
          view ===
            'petitions'
        ) {
          items.push(
            ...petitions.map(
              (
                item,
              ) => ({
                kind:
                  'petition' as const,

                createdAt:
                  item.createdAt,

                item,
              }),
            ),
          )
        }

        return items.sort(
          (
            first,
            second,
          ) =>
            new Date(
              second.createdAt,
            ).getTime() -
            new Date(
              first.createdAt,
            ).getTime(),
        )
      },

      [
        inquiries,
        petitions,
        view,
      ],
    )


  async function handleCancelInquiry(
    inquiryId:
      string,
  ) {
    if (
      actionId
    ) {
      return
    }

    try {
      setActionId(
        inquiryId,
      )

      setError(
        null,
      )

      const updated =
        await cancelClientLawyerInquiry(
          inquiryId,
        )

      setInquiries(
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
          : 'لغو درخواست ناموفق بود.',
      )
    } finally {
      setActionId(
        null,
      )
    }
  }


  async function handleArchivePetition(
    petitionId:
      string,
  ) {
    if (
      actionId
    ) {
      return
    }

    try {
      setActionId(
        petitionId,
      )

      setError(
        null,
      )

      const updated =
        await archiveClientPetition(
          petitionId,
        )

      setPetitions(
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
          : 'بایگانی لایحه ناموفق بود.',
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
        title="برای مشاهده درخواست‌ها وارد شوید"
        description="درخواست‌ها و لوایح فقط برای صاحب حساب قابل مشاهده هستند."
        href="/login"
        action="ورود"
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
        description="برای مشاهده این بخش باید با حساب موکل وارد شوید."
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
              درخواست‌ها و لوایح من
            </h1>

            <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
              اطلاعات این صفحه مستقیماً از حساب شما در سرور دادیار دریافت می‌شود.
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
          <FilterButton
            active={
              view ===
              'all'
            }
            onClick={() =>
              setView(
                'all',
              )
            }
          >
            همه
          </FilterButton>

          <FilterButton
            active={
              view ===
              'inquiries'
            }
            onClick={() =>
              setView(
                'inquiries',
              )
            }
          >
            درخواست‌های بررسی
          </FilterButton>

          <FilterButton
            active={
              view ===
              'petitions'
            }
            onClick={() =>
              setView(
                'petitions',
              )
            }
          >
            لوایح
          </FilterButton>
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
        ) : feed.length ===
          0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-black text-slate-800">
              موردی برای نمایش وجود ندارد.
            </p>

            <Link
              href="/client-portal"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
            >
              مشاهده خدمات
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {feed.map(
              (
                feedItem,
              ) => {
                if (
                  feedItem.kind ===
                  'inquiry'
                ) {
                  const item =
                    feedItem.item

                  const status =
                    inquiryStatusMeta[
                      item.status
                    ]

                  const cancellable =
                    item.status ===
                      'SUBMITTED' ||
                    item.status ===
                      'IN_REVIEW'

                  return (
                    <article
                      key={`inquiry-${item.id}`}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <MessageCircle
                              size={19}
                              className="text-blue-600"
                            />

                            <span className="text-xs font-black text-blue-700">
                              درخواست بررسی
                            </span>

                            <StatusBadge
                              label={
                                status.label
                              }
                              className={
                                status.className
                              }
                            />
                          </div>

                          <h2 className="mt-3 text-lg font-black text-slate-950">
                            {item.subject}
                          </h2>

                          <p className="mt-1 text-sm font-bold text-slate-500">
                            وکیل:
                            {' '}
                            {item.lawyer.fullName ||
                              '—'}

                            {item.lawyer.specialization
                              ? ` • ${item.lawyer.specialization}`
                              : ''}
                          </p>
                        </div>

                        <time className="shrink-0 text-xs font-bold text-slate-400">
                          {formatDate(
                            item.createdAt,
                          )}
                        </time>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-700">
                        {item.description}
                      </p>

                      {item.lawyerResponse && (
                        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                          <p className="text-xs font-black text-emerald-700">
                            پاسخ وکیل
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-emerald-900">
                            {item.lawyerResponse}
                          </p>
                        </div>
                      )}

                      {cancellable && (
                        <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                          <button
                            type="button"
                            disabled={
                              actionId ===
                              item.id
                            }
                            onClick={() =>
                              void handleCancelInquiry(
                                item.id,
                              )
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                          >
                            {actionId ===
                            item.id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <XCircle
                                size={15}
                              />
                            )}

                            لغو درخواست
                          </button>
                        </div>
                      )}
                    </article>
                  )
                }

                const item =
                  feedItem.item

                const status =
                  petitionStatusMeta[
                    item.status
                  ]

                return (
                  <article
                    key={`petition-${item.id}`}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <FileText
                            size={19}
                            className="text-violet-600"
                          />

                          <span className="text-xs font-black text-violet-700">
                            لایحه
                          </span>

                          <StatusBadge
                            label={
                              status.label
                            }
                            className={
                              status.className
                            }
                          />
                        </div>

                        <h2 className="mt-3 text-lg font-black text-slate-950">
                          {item.title}
                        </h2>

                        <p className="mt-1 text-sm font-bold text-slate-500">
                          {item.subject ||
                            'بدون موضوع ثبت‌شده'}
                        </p>
                      </div>

                      <time className="shrink-0 text-xs font-bold text-slate-400">
                        {formatDate(
                          item.createdAt,
                        )}
                      </time>
                    </div>

                    {item.requestedRelief && (
                      <p className="mt-4 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-700">
                        {item.requestedRelief}
                      </p>
                    )}

                    {item.status ===
                      'SUBMITTED' && (
                      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          disabled={
                            actionId ===
                            item.id
                          }
                          onClick={() =>
                            void handleArchivePetition(
                              item.id,
                            )
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-xs font-black text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
                        >
                          {actionId ===
                          item.id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Archive
                              size={15}
                            />
                          )}

                          بایگانی
                        </button>
                      </div>
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


function PageLoader() {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-100"
    >
      <Loader2
        size={28}
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
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <h1 className="text-xl font-black text-slate-950">
          {title}
        </h1>

        <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
          {description}
        </p>

        <Link
          href={
            href
          }
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
        >
          {action}
        </Link>
      </section>
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
      className={`rounded-xl px-4 py-2 text-sm font-black transition ${
        active
          ? 'bg-slate-900 text-white'
          : 'border border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
      }`}
    >
      {children}
    </button>
  )
}


function StatusBadge({
  label,
  className,
}: {
  label:
    string

  className:
    string
}) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${className}`}
    >
      {label}
    </span>
  )
}