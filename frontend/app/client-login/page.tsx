'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  useRouter,
} from 'next/navigation'

import {
  ArrowRight,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import ClientAuthForm, {
  type ClientAuthMode,
} from '@/components/client-portal/ClientAuthForm'

import {
  getCurrentClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

function sanitizeReturnTo(
  value: string | null
): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//')
  ) {
    return '/client-portal'
  }

  return value
}

export default function ClientLoginPage() {
  const router =
    useRouter()

  const [
    ready,
    setReady,
  ] =
    useState(false)

  const [
    returnTo,
    setReturnTo,
  ] =
    useState(
      '/client-portal'
    )

  const [
    initialMode,
    setInitialMode,
  ] =
    useState<ClientAuthMode>(
      'login'
    )

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      )

    const nextReturnTo =
      sanitizeReturnTo(
        params.get(
          'returnTo'
        )
      )

    const mode:
      ClientAuthMode =
      params.get('mode') ===
      'register'
        ? 'register'
        : 'login'

    setReturnTo(
      nextReturnTo
    )

    setInitialMode(
      mode
    )

    if (
      getCurrentClientPortalAccount()
    ) {
      router.replace(
        nextReturnTo
      )

      return
    }

    setReady(true)
  }, [
    router,
  ])

  if (!ready) {
    return (
      <main
        dir="rtl"
        className="flex min-h-dvh items-center justify-center bg-slate-100"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </main>
    )
  }

  return (
    <main
      dir="rtl"
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-100 px-4 py-8"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-300/25 blur-[110px]" />

        <div className="absolute -bottom-44 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-200/25 blur-[110px]" />
      </div>

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl shadow-slate-300/50 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden border-l border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-9 lg:flex lg:flex-col lg:justify-between">
          <Link
            href="/client-portal"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm"
          >
            <ArrowRight
              size={17}
            />

            مشاهده وکلا
          </Link>

          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
              <UserRound
                size={27}
              />
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.4] text-slate-950">
              حساب موکل دادیار
            </h1>

            <p className="mt-4 max-w-md text-base font-semibold leading-8 text-slate-700">
              با ورود به حساب، رزرو مشاوره،
              ثبت نظر و مدیریت قراردادهای
              حقوقی در دسترس شما قرار
              می‌گیرد.
            </p>
          </div>

          <div className="space-y-3">
            <Benefit
              icon={
                Search
              }
              text="جست‌وجو و انتخاب وکیل مناسب"
            />

            <Benefit
              icon={
                ShieldCheck
              }
              text="مدیریت درخواست‌ها و قراردادها"
            />
          </div>
        </aside>

        <div className="p-5 sm:p-8 lg:p-10">
          <div className="mb-7 flex items-center justify-between lg:hidden">
            <Link
              href="/client-portal"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-black text-slate-700"
            >
              <ArrowRight
                size={15}
              />

              مشاهده وکلا
            </Link>

            <span className="font-black text-slate-950">
              دادیار
            </span>
          </div>

          <p className="text-sm font-black text-blue-700">
            حساب کاربری
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
            ورود یا ثبت‌نام
          </h2>

          <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
            مشاهده وکلا بدون ورود امکان‌پذیر
            است. برای استفاده از خدمات،
            حساب کاربری لازم است.
          </p>

          <div className="mt-7">
            <ClientAuthForm
              key={
                initialMode
              }
              initialMode={
                initialMode
              }
              onAuthenticated={() =>
                router.replace(
                  returnTo
                )
              }
            />
          </div>
        </div>
      </section>
    </main>
  )
}

function Benefit({
  icon:
    Icon,
  text,
}: {
  icon:
    typeof Search

  text:
    string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon
          size={17}
        />
      </div>

      <p className="text-sm font-bold text-slate-700">
        {text}
      </p>
    </div>
  )
}