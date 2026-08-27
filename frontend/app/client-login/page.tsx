'use client'

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import Link from 'next/link'

import {
  useRouter,
} from 'next/navigation'

import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import {
  createTemporaryClientSession,
  hasValidTemporaryClientSession,
  validateTemporaryClientPassword,
} from '@/features/client-portal/auth/client-session'


export default function ClientLoginPage() {
  const router =
    useRouter()

  const [
    password,
    setPassword,
  ] =
    useState(
      ''
    )

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(
      false
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
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false
    )

  const [
    isCheckingSession,
    setIsCheckingSession,
  ] =
    useState(
      true
    )

 
  useEffect(() => {
    if (
      hasValidTemporaryClientSession()
    ) {
      router.replace(
        '/client-portal'
      )

      return
    }

    setIsCheckingSession(
      false
    )
  }, [
    router,
  ])

 

  const handleSubmit =
    (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault()

      if (
        isSubmitting
      ) {
        return
      }

      setError(
        null
      )

      const normalizedPassword =
        password.trim()

      if (
        !normalizedPassword
      ) {
        setError(
          'رمز ورود را وارد کنید.'
        )

        return
      }

      setIsSubmitting(
        true
      )

   
      window.setTimeout(
        () => {
          if (
            !validateTemporaryClientPassword(
              normalizedPassword
            )
          ) {
            setError(
              'رمز ورود صحیح نیست.'
            )

            setIsSubmitting(
              false
            )

            return
          }

          createTemporaryClientSession()

          router.replace(
            '/client-portal'
          )
        },
        350
      )
    }

 

  if (
    isCheckingSession
  ) {
    return (
      <main
        dir="rtl"
        className="flex h-dvh items-center justify-center overflow-hidden bg-slate-100"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-200">
            د
          </div>

          <p className="text-sm font-bold text-slate-600">
            در حال آماده‌سازی پنل موکل...
          </p>
        </div>
      </main>
    )
  }



  return (
    <main
      dir="rtl"
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-100 px-3 py-4 text-slate-950 sm:px-6"
    >


      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-48 h-[540px] w-[540px] rounded-full bg-blue-300/30 blur-[110px]" />

        <div className="absolute -bottom-48 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-200/25 blur-[110px]" />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.08) 1px, transparent 1px)',

            backgroundSize:
              '48px 48px',
          }}
        />
      </div>



      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl shadow-slate-300/50 lg:grid-cols-[0.9fr_1.1fr]">



        <aside className="relative hidden overflow-hidden border-l border-slate-200 bg-gradient-to-br from-emerald-50 via-slate-50 to-blue-100 p-9 lg:flex lg:min-h-[570px] lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-300/25 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
          </div>

          <Link
            href="/launch"
            className="relative z-10 inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
          >
            <ArrowRight
              size={17}
            />

            بازگشت
          </Link>

          <div className="relative z-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
              <UserRound
                size={28}
              />
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.4] text-slate-950">
              پنل اختصاصی موکلین
            </h1>

            <p className="mt-4 max-w-md text-base font-semibold leading-8 text-slate-700">
              فضایی ساده برای پیدا کردن
              وکیل، مشاهده اطلاعات حرفه‌ای
              و برقراری ارتباط با وکیل مورد
              نظر.
            </p>
          </div>

          <div className="relative z-10 space-y-2.5">
            {[
              'جست‌وجوی وکلای دادیار',
              'فیلتر بر اساس تخصص و موقعیت',
              'مشاهده اطلاعات و راه‌های ارتباطی',
            ].map(
              (
                item
              ) => (
                <div
                  key={
                    item
                  }
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-bold text-slate-700"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
                    ✓
                  </span>

                  {item}
                </div>
              )
            )}
          </div>
        </aside>



        <div className="flex min-h-[520px] flex-col justify-center p-5 sm:p-8 lg:p-10">

          <div className="mb-7 flex items-center justify-between lg:hidden">
            <Link
              href="/launch"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
            >
              <ArrowRight
                size={15}
              />

              بازگشت
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                د
              </div>

              <span className="font-black text-slate-950">
                دادیار
              </span>
            </div>
          </div>


          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <LockKeyhole
              size={24}
            />
          </div>


          <h2 className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
            ورود موکلین
          </h2>

          <p className="mt-3 max-w-lg text-sm font-semibold leading-7 text-slate-600 sm:text-base">
            برای ورود به نسخه آزمایشی پنل
            موکلین، رمز ورود را وارد کنید.
          </p>


          <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-blue-700"
              />

              <div>
                <p className="text-sm font-black text-blue-900">
                  نسخه آزمایشی پنل موکلین
                </p>

                <p className="mt-1 text-xs font-semibold leading-6 text-blue-800">
                  در این مرحله ورود به‌صورت
                  موقت از سمت فرانت‌اند
                  انجام می‌شود. اتصال حساب
                  واقعی موکل در مرحله
                  Backend اضافه خواهد شد.
                </p>
              </div>
            </div>
          </div>


          <form
            onSubmit={
              handleSubmit
            }
            className="mt-6"
            noValidate
          >
            <label
              htmlFor="client-password"
              className="mb-2 block text-sm font-black text-slate-800 sm:text-base"
            >
              رمز ورود
            </label>

            <div className="relative">
              <input
                id="client-password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={
                  password
                }
                onChange={(
                  event
                ) => {
                  setPassword(
                    event.target.value
                  )

                  if (
                    error
                  ) {
                    setError(
                      null
                    )
                  }
                }}
                disabled={
                  isSubmitting
                }
                autoFocus
                autoComplete="off"
                dir="ltr"
                placeholder="رمز ورود پنل موکلین"
                className={`h-14 w-full rounded-2xl border bg-white px-4 pr-14 text-base font-bold text-slate-950 outline-none transition placeholder:font-medium placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                  error
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                disabled={
                  isSubmitting
                }
                aria-label={
                  showPassword
                    ? 'مخفی کردن رمز'
                    : 'نمایش رمز'
                }
                className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff
                    size={20}
                  />
                ) : (
                  <Eye
                    size={20}
                  />
                )}
              </button>
            </div>

            {/* Error */}

            <div
              className="min-h-8 pt-1.5"
              aria-live="polite"
            >
              {error && (
                <p className="text-sm font-bold text-red-600">
                  {error}
                </p>
              )}
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 px-5 text-base font-black text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
            >
              <KeyRound
                size={20}
              />

              {isSubmitting
                ? 'در حال ورود...'
                : 'ورود به پنل موکلین'}
            </button>
          </form>

          {/* Lawyer */}

          <div className="mt-6 border-t border-slate-200 pt-5 text-center">
            <p className="text-sm font-semibold text-slate-600">
              وکیل هستید؟
              {' '}

              <Link
                href="/login"
                className="font-black text-blue-700 transition hover:text-blue-800"
              >
                ورود به پنل وکلا
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
