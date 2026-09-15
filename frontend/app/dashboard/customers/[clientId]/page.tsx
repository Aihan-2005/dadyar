'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  useParams,
} from 'next/navigation'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  FileText,
  Hash,
  Home,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'

import {
  fetchClientByIdApi,
  getClientApiErrorMessage,
} from '@/features/clients/api/client.api'

import {
  getClientAge,
  isClientMinor,
} from '@/features/clients/utils/client-date'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  Client,
} from '@/types/client'


function formatDateTime(
  value:
    string | undefined,
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


export default function CustomerDetailsPage() {
  const params =
    useParams<{
      clientId:
        string
    }>()

  const clientId =
    typeof params.clientId ===
      'string'
      ? params.clientId.trim()
      : ''

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
    client,

    setClient,
  ] =
    useState<Client | null>(
      null,
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

        if (
          !clientId
        ) {
          setClient(
            null,
          )

          setError(
            'شناسه موکل معتبر نیست.',
          )

          setLoading(
            false,
          )

          return
        }

        try {
          setLoading(
            true,
          )

          setError(
            null,
          )

          const result =
            await fetchClientByIdApi(
              clientId,
            )

          setClient(
            result,
          )
        } catch (
          caughtError:
            unknown
        ) {
          setClient(
            null,
          )

          setError(
            getClientApiErrorMessage(
              caughtError,

              'دریافت اطلاعات موکل ناموفق بود.',
            ),
          )
        } finally {
          setLoading(
            false,
          )
        }
      },

      [
        clientId,
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
      <AccessDenied />
    )
  }


  if (
    loading
  ) {
    return (
      <PageLoader />
    )
  }


  if (
    error ||
    !client
  ) {
    return (
      <div
        dir="rtl"
        className="mx-auto max-w-3xl"
      >
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-blue-700"
        >
          <ArrowRight
            size={18}
          />

          بازگشت به موکلین
        </Link>

        <section className="mt-6 rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle
            size={38}
            className="mx-auto text-red-500"
          />

          <h1 className="mt-4 text-xl font-black text-slate-950">
            اطلاعات موکل در دسترس نیست
          </h1>

          <p className="mt-2 text-sm font-semibold leading-7 text-red-700">
            {error ||
              'موکل موردنظر پیدا نشد.'}
          </p>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700"
          >
            <RefreshCw
              size={16}
            />

            تلاش دوباره
          </button>
        </section>
      </div>
    )
  }


  const age =
    getClientAge(
      client.birthDate,
    )

  const minor =
    isClientMinor(
      client.birthDate,
    )

  const initials =
    getInitials(
      client.fullName,
    )


  return (
    <div
      dir="rtl"
      className="mx-auto max-w-6xl space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-blue-700"
        >
          <ArrowRight
            size={18}
          />

          بازگشت به موکلین
        </Link>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          disabled={
            loading
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
        >
          <RefreshCw
            size={15}
            className={
              loading
                ? 'animate-spin'
                : ''
            }
          />

          بروزرسانی اطلاعات
        </button>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-gradient-to-l from-blue-50 via-white to-emerald-50 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-xl font-black text-white shadow-lg shadow-blue-100">
                {initials}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
                    {client.fullName}
                  </h1>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                    موکل CRM
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  پرونده اطلاعاتی اختصاصی این موکل در دفتر شما
                </p>
              </div>
            </div>

            {client.phoneNumber && (
              <a
                href={`tel:${client.phoneNumber}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
              >
                <Phone
                  size={17}
                />

                تماس با موکل
              </a>
            )}
          </div>
        </header>

        <div className="space-y-6 p-5 sm:p-8">
          {minor && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-black text-red-800">
                  موکل زیر سن قانونی است
                </p>

                <p className="mt-1 text-xs font-semibold leading-6 text-red-700">
                  هنگام ثبت قرارداد، پرونده یا تصمیم حقوقی، اطلاعات نماینده قانونی را نیز بررسی کنید.
                </p>
              </div>
            </div>
          )}

          <section>
            <SectionTitle
              icon={
                UserRound
              }
              title="اطلاعات هویتی و تماس"
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard
                icon={
                  Phone
                }
                label="شماره موبایل"
                value={
                  client.phoneNumber
                }
                ltr
              />

              <InfoCard
                icon={
                  Hash
                }
                label="کد ملی"
                value={
                  client.nationalId
                }
                ltr
              />

              <InfoCard
                icon={
                  Phone
                }
                label="تلفن ثابت"
                value={
                  client.landlineNumber
                }
                ltr
              />

              <InfoCard
                icon={
                  CalendarDays
                }
                label="تاریخ تولد"
                value={
                  client.birthDate
                }
                ltr
              />

              <InfoCard
                icon={
                  UserRound
                }
                label="سن"
                value={
                  age !==
                  null
                    ? `${age.toLocaleString(
                        'fa-IR',
                      )} سال`
                    : undefined
                }
              />

              <InfoCard
                icon={
                  UsersRound
                }
                label="نماینده / ولی"
                value={
                  client.representative
                }
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <SectionTitle
                icon={
                  MapPin
                }
                title="نشانی"
              />

              <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-8 text-slate-700">
                {client.address ||
                  'نشانی برای این موکل ثبت نشده است.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <SectionTitle
                icon={
                  FileText
                }
                title="توضیحات CRM"
              />

              <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-8 text-slate-700">
                {client.description ||
                  'توضیحی برای این موکل ثبت نشده است.'}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-indigo-600"
              />

              <div>
                <p className="text-sm font-black text-indigo-950">
                  امنیت حساب موکل
                </p>

                <p className="mt-1 text-xs font-semibold leading-6 text-indigo-800">
                  این صفحه فقط اطلاعات CRM متعلق به دفتر شما را نمایش می‌دهد. رمز ورود حساب موکل در این صفحه نمایش داده نمی‌شود. رمز شخصی موجود در CRM نیز همان قابلیت مستقل دفتر وکیل است و ارتباطی با رمز ورود حساب موکل ندارد.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <MetaCard
              icon={
                Home
              }
              label="ایجاد رکورد"
              value={
                formatDateTime(
                  client.createdAt,
                )
              }
            />

            <MetaCard
              icon={
                RefreshCw
              }
              label="آخرین بروزرسانی"
              value={
                formatDateTime(
                  client.updatedAt,
                )
              }
            />
          </section>
        </div>
      </section>
    </div>
  )
}


function SectionTitle({
  icon:
    Icon,

  title,
}: {
  icon:
    LucideIcon

  title:
    string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon
        size={18}
        className="text-blue-600"
      />

      <h2 className="text-sm font-black text-slate-900">
        {title}
      </h2>
    </div>
  )
}


function InfoCard({
  icon:
    Icon,

  label,

  value,

  ltr = false,
}: {
  icon:
    LucideIcon

  label:
    string

  value?:
    string

  ltr?:
    boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-[11px] font-black text-slate-500">
        <Icon
          size={14}
          className="text-blue-600"
        />

        {label}
      </div>

      <p
        dir={
          ltr
            ? 'ltr'
            : undefined
        }
        className={`mt-2 break-all text-sm font-black text-slate-900 ${
          ltr
            ? 'text-right'
            : ''
        }`}
      >
        {value ||
          '—'}
      </p>
    </div>
  )
}


function MetaCard({
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-[11px] font-black text-slate-500">
        <Icon
          size={14}
        />

        {label}
      </div>

      <p className="mt-2 text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
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


function AccessDenied() {
  return (
    <div
      dir="rtl"
      className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"
    >
      <ShieldCheck
        size={36}
        className="mx-auto text-slate-400"
      />

      <h1 className="mt-4 text-xl font-black text-slate-950">
        دسترسی غیرمجاز
      </h1>

      <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
        جزئیات CRM موکل فقط برای حساب وکیل قابل مشاهده است.
      </p>
    </div>
  )
}


function getInitials(
  fullName:
    string,
): string {
  const parts =
    fullName
      .trim()
      .split(/\s+/)
      .filter(
        Boolean,
      )

  if (
    parts.length ===
    0
  ) {
    return 'م'
  }

  if (
    parts.length ===
    1
  ) {
    return parts[0]
      .slice(
        0,
        2,
      )
  }

  return `${parts[0][0] ?? ''}${
    parts[
      parts.length -
        1
    ][0] ?? ''
  }`
}