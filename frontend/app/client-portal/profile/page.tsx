'use client'

import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import {
  getClientProfile,
  saveClientFullName,
} from '@/features/client-portal/data/client-profile.repository'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  ClientProfile,
} from '@/types/client-profile'


export default function ClientProfilePage() {
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
    profile,

    setProfile,
  ] =
    useState<ClientProfile | null>(
      null,
    )

  const [
    fullName,

    setFullName,
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
    saving,

    setSaving,
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
    success,

    setSuccess,
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
          !user ||
          user.role !==
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

          const result =
            await getClientProfile(
              user.id,
            )

          setProfile(
            result,
          )

          setFullName(
            result?.fullName ??
            '',
          )
        } catch (
          caughtError:
            unknown
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت پروفایل ناموفق بود.',
          )
        } finally {
          setLoading(
            false,
          )
        }
      },

      [
        hasHydrated,

        user,
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


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !user ||
      user.role !==
        'CLIENT' ||
      saving
    ) {
      return
    }

    const normalized =
      fullName.trim()

    if (
      normalized.length <
      3
    ) {
      setError(
        'نام و نام خانوادگی را کامل وارد کنید.',
      )

      return
    }

    try {
      setSaving(
        true,
      )

      setError(
        null,
      )

      setSuccess(
        null,
      )

      const updated =
        await saveClientFullName(
          user.id,

          normalized,
        )

      setProfile(
        updated,
      )

      setFullName(
        updated.fullName,
      )

      setSuccess(
        'پروفایل شما با موفقیت ذخیره شد.',
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'ذخیره پروفایل ناموفق بود.',
      )
    } finally {
      setSaving(
        false,
      )
    }
  }


  if (
    !hasHydrated ||
    loading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2
          size={30}
          className="animate-spin text-blue-600"
        />
      </main>
    )
  }


  if (
    !user
  ) {
    return (
      <AccessMessage
        title="برای مشاهده پروفایل وارد شوید"
        description="پروفایل موکل فقط برای صاحب حساب قابل مشاهده و ویرایش است."
        href="/client-login?returnTo=/client-portal/profile&mode=login"
        action="ورود موکل"
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
        description="مدیریت پروفایل موکل با حساب وکیل در دسترس نیست."
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
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href="/client-portal"
          className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-blue-700"
        >
          <ArrowRight
            size={18}
          />

          بازگشت به خدمات موکلین
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 bg-gradient-to-l from-blue-50 to-emerald-50 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                <UserRound
                  size={27}
                />
              </div>

              <div>
                <p className="text-xs font-black text-blue-700">
                  حساب موکل
                </p>

                <h1 className="mt-1 text-2xl font-black text-slate-950">
                  پروفایل من
                </h1>

                <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                  این نام در درخواست‌های بررسی و رزروهای مشاوره برای وکیل نمایش داده می‌شود.
                </p>
              </div>
            </div>
          </header>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                <CheckCircle2
                  size={18}
                />

                {success}
              </div>
            )}

            <form
              onSubmit={
                handleSubmit
              }
            >
              <label className="block">
                <span className="text-sm font-black text-slate-800">
                  نام و نام خانوادگی
                </span>

                <input
                  value={
                    fullName
                  }
                  onChange={(
                    event,
                  ) => {
                    setFullName(
                      event.target.value,
                    )

                    setError(
                      null,
                    )

                    setSuccess(
                      null,
                    )
                  }}
                  maxLength={200}
                  autoComplete="name"
                  placeholder="نام و نام خانوادگی"
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ReadOnlyField
                  icon={
                    Phone
                  }
                  label="شماره موبایل"
                  value={
                    profile?.phone ||
                    user.phone ||
                    'ثبت نشده'
                  }
                  ltr
                />

                <ReadOnlyField
                  icon={
                    Mail
                  }
                  label="ایمیل"
                  value={
                    profile?.email ||
                    user.email ||
                    'ثبت نشده'
                  }
                  ltr
                />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <p className="text-xs font-semibold leading-6 text-blue-800">
                  رمز ورود حساب شما در این صفحه نمایش داده نمی‌شود و وکیل نیز به رمز ورود حساب موکل دسترسی ندارد.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save
                      size={17}
                    />
                  )}

                  ذخیره تغییرات
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void load()
                  }
                  disabled={
                    loading ||
                    saving
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 disabled:opacity-60"
                >
                  <RefreshCw
                    size={17}
                  />

                  دریافت مجدد
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}


function ReadOnlyField({
  icon:
    Icon,

  label,

  value,

  ltr = false,
}: {
  icon:
    typeof Phone

  label:
    string

  value:
    string

  ltr?:
    boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
        <Icon
          size={15}
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
        className="mt-2 break-all text-sm font-black text-slate-800"
      >
        {value}
      </p>
    </div>
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
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <UserRound
          size={36}
          className="mx-auto text-blue-600"
        />

        <h1 className="mt-4 text-xl font-black text-slate-950">
          {title}
        </h1>

        <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
          {description}
        </p>

        <Link
          href={
            href
          }
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
        >
          {action}
        </Link>
      </div>
    </main>
  )
}