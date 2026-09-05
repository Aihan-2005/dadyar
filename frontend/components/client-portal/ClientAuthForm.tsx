'use client'

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  Loader2,
  LogIn,
  UserPlus,
} from 'lucide-react'

import {
  loginClientPortalAccount,
  normalizeClientPhone,
  registerClientPortalAccount,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

export type ClientAuthMode =
  | 'login'
  | 'register'

interface ClientAuthFormProps {
  initialMode?: ClientAuthMode

  onAuthenticated:
    (
      account: ClientPortalAccount
    ) => void
}

export default function ClientAuthForm({
  initialMode = 'login',
  onAuthenticated,
}: ClientAuthFormProps) {
  const [
    mode,
    setMode,
  ] =
    useState<ClientAuthMode>(
      initialMode
    )

  const [
    fullName,
    setFullName,
  ] =
    useState('')

  const [
    phone,
    setPhone,
  ] =
    useState('')

  const [
    password,
    setPassword,
  ] =
    useState('')

  const [
    confirmPassword,
    setConfirmPassword,
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
    submitting,
    setSubmitting,
  ] =
    useState(false)

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  const changeMode =
    (
      nextMode:
        ClientAuthMode
    ) => {
      if (submitting) {
        return
      }

      setMode(nextMode)
      setError(null)
      setPassword('')
      setConfirmPassword('')
    }

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault()

      if (submitting) {
        return
      }

      setError(null)
      setSubmitting(true)

      try {
        if (
          mode ===
          'register'
        ) {
          if (
            password !==
            confirmPassword
          ) {
            throw new Error(
              'تکرار رمز عبور با رمز عبور یکسان نیست.'
            )
          }

          const account =
            await registerClientPortalAccount({
              fullName,
              phone,
              password,
            })

          onAuthenticated(
            account
          )

          return
        }

        const account =
          await loginClientPortalAccount({
            phone,
            password,
          })

        onAuthenticated(
          account
        )
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'خطایی رخ داد. دوباره تلاش کنید.'
        )
      } finally {
        setSubmitting(false)
      }
    }

  return (
    <div>
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() =>
            changeMode(
              'login'
            )
          }
          className={`h-10 rounded-lg text-sm font-black transition ${
            mode === 'login'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ورود
        </button>

        <button
          type="button"
          onClick={() =>
            changeMode(
              'register'
            )
          }
          className={`h-10 rounded-lg text-sm font-black transition ${
            mode ===
            'register'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ثبت‌نام
        </button>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-5 space-y-4"
        noValidate
      >
        {mode ===
          'register' && (
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              نام و نام خانوادگی
            </span>

            <input
              value={
                fullName
              }
              onChange={(
                event
              ) => {
                setFullName(
                  event.target.value
                )

                setError(null)
              }}
              autoComplete="name"
              placeholder="مثلاً علی رضایی"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-black text-slate-700">
            شماره موبایل
          </span>

          <input
            value={
              phone
            }
            onChange={(
              event
            ) => {
              setPhone(
                normalizeClientPhone(
                  event.target.value
                )
              )

              setError(null)
            }}
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="09123456789"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-left text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-black text-slate-700">
            رمز عبور
          </span>

          <input
            type="password"
            value={
              password
            }
            onChange={(
              event
            ) => {
              setPassword(
                event.target.value
              )

              setError(null)
            }}
            autoComplete={
              mode ===
              'login'
                ? 'current-password'
                : 'new-password'
            }
            dir="ltr"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-left text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        {mode ===
          'register' && (
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              تکرار رمز عبور
            </span>

            <input
              type="password"
              value={
                confirmPassword
              }
              onChange={(
                event
              ) => {
                setConfirmPassword(
                  event.target.value
                )

                setError(null)
              }}
              autoComplete="new-password"
              dir="ltr"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-left text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
        )}

        <div
          className="min-h-6"
          aria-live="polite"
        >
          {error && (
            <p className="text-sm font-bold text-red-600">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            submitting
          }
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-black text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
            mode ===
            'register'
              ? 'bg-gradient-to-l from-emerald-500 to-teal-600 shadow-emerald-100 hover:from-emerald-600 hover:to-teal-700'
              : 'bg-gradient-to-l from-blue-600 to-blue-700 shadow-blue-100 hover:from-blue-700 hover:to-blue-800'
          }`}
        >
          {submitting ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : mode ===
            'register' ? (
            <UserPlus
              size={18}
            />
          ) : (
            <LogIn
              size={18}
            />
          )}

          {submitting
            ? 'لطفاً صبر کنید...'
            : mode ===
                'register'
              ? 'ایجاد حساب'
              : 'ورود به حساب'}
        </button>
      </form>
    </div>
  )
}