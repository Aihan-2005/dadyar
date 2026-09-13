'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, LogIn, ShieldCheck, UserPlus } from 'lucide-react'

import OtpCodeInput from '@/components/forms/OtpCodeInput'
import { useAuthStore } from '@/store/auth.store'
import { getApiErrorMessage } from '@/lib/api'
import {
  clientSignup,
  requestClientSignupOtp,
} from '@/features/client-portal/auth/client-auth-api'
import { saveClientFullName } from '@/features/client-portal/data/client-profile.repository'
import {
  getCurrentClientPortalAccount,
  normalizeClientPhone,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

export type ClientAuthMode = 'login' | 'register'

type RegisterStep = 'details' | 'otp'

interface ClientAuthFormProps {
  initialMode?: ClientAuthMode
  onAuthenticated: (account: ClientPortalAccount) => void
}

export default function ClientAuthForm({
  initialMode = 'login',
  onAuthenticated,
}: ClientAuthFormProps) {
  const [mode, setMode] = useState<ClientAuthMode>(initialMode)
  const [registerStep, setRegisterStep] = useState<RegisterStep>('details')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const changeMode = (nextMode: ClientAuthMode) => {
    if (submitting) return
    setMode(nextMode)
    setRegisterStep('details')
    setError(null)
    setPassword('')
    setConfirmPassword('')
    setOtpCode('')
  }

  const startCooldown = (seconds: number) => {
    setResendCooldown(seconds)
    const interval = window.setInterval(() => {
      setResendCooldown((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          return 0
        }
        return current - 1
      })
    }, 1000)
  }

  const handleRequestOtp = async () => {
    setError(null)

    if (fullName.trim().length < 3) {
      setError('نام و نام خانوادگی را کامل وارد کنید.')
      return
    }

    if (!/^09\d{9}$/.test(phone)) {
      setError('شماره موبایل معتبر وارد کنید.')
      return
    }

    if (password.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد.')
      return
    }

    if (password !== confirmPassword) {
      setError('تکرار رمز عبور با رمز عبور یکسان نیست.')
      return
    }

    setSubmitting(true)

    try {
      const result = await requestClientSignupOtp(phone)
      setRegisterStep('otp')
      startCooldown(result.resendAfter)
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'ارسال کد تأیید انجام نشد.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError(null)

    if (otpCode.length !== 6) {
      setError('کد ۶ رقمی را کامل وارد کنید.')
      return
    }

    setSubmitting(true)

    try {
      await clientSignup({ phone, password, code: otpCode })

      const account = getCurrentClientPortalAccount()

      if (!account) {
        throw new Error('ثبت‌نام انجام شد اما دریافت اطلاعات حساب ناموفق بود.')
      }

      await saveClientFullName(account.id, fullName.trim())

      onAuthenticated({ ...account, fullName: fullName.trim() })
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'ثبت‌نام انجام نشد.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogin = async () => {
    setError(null)

    if (!/^09\d{9}$/.test(phone)) {
      setError('شماره موبایل معتبر وارد کنید.')
      return
    }

    if (!password) {
      setError('رمز عبور را وارد کنید.')
      return
    }

    setSubmitting(true)

    try {
      await useAuthStore.getState().login({ phone, password })

      const account = getCurrentClientPortalAccount()

      if (!account) {
        throw new Error('ورود انجام شد اما دریافت اطلاعات حساب ناموفق بود.')
      }

      onAuthenticated(account)
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'ورود به حساب کاربری ناموفق بود.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    if (mode === 'login') {
      void handleLogin()
      return
    }

    if (registerStep === 'details') {
      void handleRequestOtp()
      return
    }

    void handleVerifyOtp()
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const result = await requestClientSignupOtp(phone)
      startCooldown(result.resendAfter)
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'ارسال دوباره‌ی کد انجام نشد.'))
    } finally {
      setSubmitting(false)
    }
  }

  const showOtpStep = mode === 'register' && registerStep === 'otp'

  return (
    <div>
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => changeMode('login')}
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
          onClick={() => changeMode('register')}
          className={`h-10 rounded-lg text-sm font-black transition ${
            mode === 'register'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ثبت‌نام
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        {showOtpStep ? (
          <>
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
              کد تأیید به شماره{' '}
              <span dir="ltr" className="font-black">
                {phone}
              </span>{' '}
              پیامک شد.
            </div>

            <OtpCodeInput value={otpCode} onChange={setOtpCode} disabled={submitting} />

            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resendCooldown > 0 || submitting}
              className="text-xs font-black text-blue-700 disabled:text-slate-400"
            >
              {resendCooldown > 0
                ? `ارسال دوباره تا ${resendCooldown.toLocaleString('fa-IR')} ثانیه دیگر`
                : 'ارسال دوباره‌ی کد'}
            </button>

            <button
              type="button"
              onClick={() => setRegisterStep('details')}
              disabled={submitting}
              className="mr-3 text-xs font-black text-slate-500"
            >
              ویرایش اطلاعات
            </button>
          </>
        ) : (
          <>
            {mode === 'register' && (
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  نام و نام خانوادگی
                </span>

                <input
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value)
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
                value={phone}
                onChange={(event) => {
                  setPhone(normalizeClientPhone(event.target.value))
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
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError(null)
                }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                dir="ltr"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-left text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            {mode === 'register' && (
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  تکرار رمز عبور
                </span>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    setError(null)
                  }}
                  autoComplete="new-password"
                  dir="ltr"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-left text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            )}
          </>
        )}

        <div className="min-h-6" aria-live="polite">
          {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-black text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
            mode === 'register'
              ? 'bg-gradient-to-l from-emerald-500 to-teal-600 shadow-emerald-100 hover:from-emerald-600 hover:to-teal-700'
              : 'bg-gradient-to-l from-blue-600 to-blue-700 shadow-blue-100 hover:from-blue-700 hover:to-blue-800'
          }`}
        >
          {submitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : showOtpStep ? (
            <ShieldCheck size={18} />
          ) : mode === 'register' ? (
            <UserPlus size={18} />
          ) : (
            <LogIn size={18} />
          )}

          {submitting
            ? 'لطفاً صبر کنید...'
            : showOtpStep
              ? 'تأیید و ایجاد حساب'
              : mode === 'register'
                ? 'ادامه'
                : 'ورود به حساب'}
        </button>
      </form>
    </div>
  )
}