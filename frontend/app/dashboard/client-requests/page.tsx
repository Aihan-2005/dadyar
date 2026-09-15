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
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  XCircle,
} from 'lucide-react'

import {
  getLawyerClientInquiries,
  updateLawyerClientInquiry,
} from '@/services/client-lawyer-inquiry.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  ClientLawyerInquiryStatus,
  LawyerClientInquiry,
  LawyerInquiryDecisionInput,
} from '@/types/client-lawyer-inquiry'


type LawyerFilter =
  | 'ALL'
  | ClientLawyerInquiryStatus


const statusMeta:
  Record<
    ClientLawyerInquiryStatus,
    {
      label:
        string

      className:
        string
    }
  > = {
    SUBMITTED: {
      label:
        'جدید',

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
        'لغوشده توسط موکل',

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


export default function LawyerClientRequestsPage() {
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
    items,

    setItems,
  ] =
    useState<
      LawyerClientInquiry[]
    >([])

  const [
    filter,

    setFilter,
  ] =
    useState<LawyerFilter>(
      'ALL',
    )

  const [
    search,

    setSearch,
  ] =
    useState(
      '',
    )

  const [
    loading,

    setLoading,
  ] =
    useState(
      true,
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
    selectedId,

    setSelectedId,
  ] =
    useState<
      string | null
    >(
      null,
    )

  const [
    responseText,

    setResponseText,
  ] =
    useState(
      '',
    )

  const [
    action,

    setAction,
  ] =
    useState<
      LawyerInquiryDecisionInput['status'] |
      null
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

          const page =
            await getLawyerClientInquiries({
              ...(
                filter !==
                'ALL'
                  ? {
                      status:
                        filter,
                    }
                  : {}
              ),

              ...(
                search.trim()
                  ? {
                      search:
                        search.trim(),
                    }
                  : {}
              ),

              page:
                1,

              limit:
                100,
            })

          setItems(
            page.items,
          )
        } catch (
          caughtError:
            unknown
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت درخواست‌های موکلین ناموفق بود.',
          )
        } finally {
          setLoading(
            false,
          )
        }
      },

      [
        filter,

        hasHydrated,

        search,

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


  const selectedItem =
    useMemo(
      () =>
        items.find(
          (
            item,
          ) =>
            item.id ===
            selectedId,
        ) ??
        null,

      [
        items,

        selectedId,
      ],
    )


  useEffect(
    () => {
      setResponseText(
        selectedItem
          ?.lawyerResponse ??
          '',
      )
    },

    [
      selectedItem,
    ],
  )


  async function decide(
    status:
      LawyerInquiryDecisionInput['status'],
  ) {
    if (
      !selectedItem ||
      action
    ) {
      return
    }

    const response =
      responseText.trim()

    if (
      (
        status ===
          'ACCEPTED' ||
        status ===
          'REJECTED'
      ) &&
      !response
    ) {
      setError(
        'برای پذیرش یا رد درخواست، پاسخ وکیل را وارد کنید.',
      )

      return
    }

    try {
      setAction(
        status,
      )

      setError(
        null,
      )

      const updated =
        await updateLawyerClientInquiry(
          selectedItem.id,

          {
            status,

            ...(
              response
                ? {
                    response,
                  }
                : {}
            ),
          },
        )

      setItems(
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

      setResponseText(
        updated.lawyerResponse,
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'بروزرسانی درخواست ناموفق بود.',
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          size={28}
          className="animate-spin text-blue-600"
        />
      </div>
    )
  }


  if (
    !user ||
    user.role !==
      'LAWYER'
  ) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-black text-slate-900">
          دسترسی غیرمجاز
        </h1>

        <p className="mt-2 text-sm font-semibold text-slate-600">
          این بخش فقط برای حساب وکیل قابل دسترسی است.
        </p>
      </div>
    )
  }


  return (
    <div dir="rtl">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
            درخواست‌های موکلین
          </h1>

          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
            نام موکل و وضعیت درخواست مستقیماً از Backend دریافت می‌شود. با پذیرش درخواست، همان موکل به فهرست موکلین شما متصل می‌شود.
          </p>
        </div>

        <button
          type="button"
          disabled={
            loading
          }
          onClick={() =>
            void load()
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

      <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative block">
          <Search
            size={17}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={
              search
            }
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="جستجو در موضوع یا متن درخواست..."
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white pr-11 pl-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <select
          value={
            filter
          }
          onChange={(
            event,
          ) =>
            setFilter(
              event.target
                .value as LawyerFilter,
            )
          }
          className="h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="ALL">
            همه وضعیت‌ها
          </option>

          <option value="SUBMITTED">
            جدید
          </option>

          <option value="IN_REVIEW">
            در حال بررسی
          </option>

          <option value="ACCEPTED">
            پذیرفته‌شده
          </option>

          <option value="REJECTED">
            ردشده
          </option>

          <option value="CANCELLED">
            لغوشده
          </option>

          <option value="CLOSED">
            بسته‌شده
          </option>
        </select>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
          {error}
        </div>
      )}

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-3">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white">
              <Loader2
                size={28}
                className="animate-spin text-blue-600"
              />
            </div>
          ) : items.length ===
            0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <MessageSquareText
                size={34}
                className="mx-auto text-slate-400"
              />

              <p className="mt-3 font-black text-slate-700">
                درخواستی پیدا نشد.
              </p>
            </div>
          ) : (
            items.map(
              (
                item,
              ) => {
                const meta =
                  statusMeta[
                    item.status
                  ]

                return (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedId(
                        item.id,
                      )
                    }
                    className={`block w-full rounded-3xl border bg-white p-5 text-right transition hover:border-blue-300 hover:shadow-md ${
                      selectedId ===
                      item.id
                        ? 'border-blue-400 ring-4 ring-blue-100'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${meta.className}`}
                      >
                        {meta.label}
                      </span>

                      <span className="text-[11px] font-bold text-slate-400">
                        {formatDate(
                          item.createdAt,
                        )}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <UserRound
                        size={17}
                        className="text-blue-600"
                      />

                      <p className="font-black text-slate-900">
                        {item.client
                          .fullName ||
                          item.client
                            .phone ||
                          'موکل'}
                      </p>
                    </div>

                    <h2 className="mt-3 font-black text-slate-900">
                      {item.subject}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-7 text-slate-600">
                      {item.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                      {item.client
                        .phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone
                            size={13}
                          />

                          {
                            item.client
                              .phone
                          }
                        </span>
                      )}

                      {item.client
                        .email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail
                            size={13}
                          />

                          {
                            item.client
                              .email
                          }
                        </span>
                      )}
                    </div>

                    {item.lawyerClientId && (
                      <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                        این درخواست به یک موکل واقعی در CRM شما متصل شده است.
                      </div>
                    )}
                  </button>
                )
              },
            )
          )}
        </section>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          {!selectedItem ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <MessageSquareText
                size={32}
                className="mx-auto text-slate-400"
              />

              <p className="mt-3 text-sm font-black text-slate-700">
                یک درخواست را برای مشاهده جزئیات انتخاب کنید.
              </p>
            </div>
          ) : (
            <RequestDetail
              item={
                selectedItem
              }
              responseText={
                responseText
              }
              onResponseChange={
                setResponseText
              }
              action={
                action
              }
              onDecision={(
                status,
              ) =>
                void decide(
                  status,
                )
              }
            />
          )}
        </aside>
      </div>
    </div>
  )
}


function RequestDetail({
  item,

  responseText,

  onResponseChange,

  action,

  onDecision,
}: {
  item:
    LawyerClientInquiry

  responseText:
    string

  onResponseChange:
    (
      value:
        string,
    ) => void

  action:
    LawyerInquiryDecisionInput['status'] |
    null

  onDecision:
    (
      status:
        LawyerInquiryDecisionInput['status'],
    ) => void
}) {
  const meta =
    statusMeta[
      item.status
    ]

  const canStartReview =
    item.status ===
    'SUBMITTED'

  const canDecide =
    item.status ===
      'SUBMITTED' ||
    item.status ===
      'IN_REVIEW'

  const canClose =
    item.status ===
      'ACCEPTED' ||
    item.status ===
      'REJECTED'

  const terminal =
    item.status ===
      'CANCELLED' ||
    item.status ===
      'CLOSED'


  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${meta.className}`}
        >
          {meta.label}
        </span>

        <span className="text-[11px] font-bold text-slate-400">
          {formatDate(
            item.createdAt,
          )}
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <UserRound
            size={18}
            className="text-blue-700"
          />

          <p className="font-black text-blue-950">
            {item.client
              .fullName ||
              'نام موکل ثبت نشده'}
          </p>
        </div>

        <div className="mt-3 grid gap-2 text-xs font-bold text-blue-800">
          <p>
            شماره تماس:{' '}
            {item.client
              .phone ||
              'ثبت نشده'}
          </p>

          <p>
            ایمیل:{' '}
            {item.client
              .email ||
              'ثبت نشده'}
          </p>
        </div>
      </div>

      {item.lawyerClientId && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>
              <p className="text-sm font-black text-emerald-900">
                ارتباط وکیل و موکل ایجاد شده است
              </p>

              <p className="mt-1 text-xs font-semibold leading-6 text-emerald-700">
                این درخواست به رکورد واقعی موکل در بخش موکلین متصل شده است.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/customers"
            className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-xs font-black text-white"
          >
            مشاهده بخش موکلین
          </Link>
        </div>
      )}

      <h2 className="mt-4 text-xl font-black text-slate-950">
        {item.subject}
      </h2>

      <p className="mt-4 whitespace-pre-wrap text-sm font-medium leading-8 text-slate-700">
        {item.description}
      </p>

      {!terminal && (
        <label className="mt-5 block">
          <span className="text-sm font-black text-slate-800">
            پاسخ وکیل
          </span>

          <textarea
            value={
              responseText
            }
            onChange={(
              event,
            ) =>
              onResponseChange(
                event.target.value,
              )
            }
            maxLength={5000}
            rows={7}
            placeholder="پاسخ یا توضیح خود را برای موکل وارد کنید..."
            className="mt-2 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
      )}

      {item.lawyerResponse &&
        terminal && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black text-slate-500">
            پاسخ ثبت‌شده
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-800">
            {item.lawyerResponse}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {canStartReview && (
          <DecisionButton
            loading={
              action ===
              'IN_REVIEW'
            }
            disabled={
              Boolean(
                action,
              )
            }
            onClick={() =>
              onDecision(
                'IN_REVIEW',
              )
            }
            className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            icon={
              Clock3
            }
          >
            شروع بررسی
          </DecisionButton>
        )}

        {canDecide && (
          <>
            <DecisionButton
              loading={
                action ===
                'ACCEPTED'
              }
              disabled={
                Boolean(
                  action,
                )
              }
              onClick={() =>
                onDecision(
                  'ACCEPTED',
                )
              }
              className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              icon={
                CheckCircle2
              }
            >
              پذیرش و اتصال موکل
            </DecisionButton>

            <DecisionButton
              loading={
                action ===
                'REJECTED'
              }
              disabled={
                Boolean(
                  action,
                )
              }
              onClick={() =>
                onDecision(
                  'REJECTED',
                )
              }
              className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              icon={
                XCircle
              }
            >
              رد درخواست
            </DecisionButton>
          </>
        )}

        {canClose && (
          <DecisionButton
            loading={
              action ===
              'CLOSED'
            }
            disabled={
              Boolean(
                action,
              )
            }
            onClick={() =>
              onDecision(
                'CLOSED',
              )
            }
            className="border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
            icon={
              CheckCircle2
            }
          >
            بستن درخواست
          </DecisionButton>
        )}
      </div>
    </div>
  )
}


function DecisionButton({
  loading,

  disabled,

  onClick,

  className,

  icon:
    Icon,

  children,
}: {
  loading:
    boolean

  disabled:
    boolean

  onClick:
    () => void

  className:
    string

  icon:
    LucideIcon

  children:
    React.ReactNode
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
