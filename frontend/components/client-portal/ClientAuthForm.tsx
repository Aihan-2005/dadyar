'use client'

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  KeyRound,
  Loader2,
  LogIn,
  MessageSquareText,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'

import OtpCodeInput from '@/components/forms/OtpCodeInput'

import {
  clientOtpLogin,
  clientPasswordLogin,
  clientSignup,
  getClientAuthApiErrorMessage,
  requestClientLoginOtp,
} from '@/features/client-portal/auth/client-auth-api'

import {
  getCurrentClientPortalAccount,
  hydrateCurrentClientPortalAccount,
  normalizeClientPhone,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  saveClientFullName,
  stageClientFullName,
} from '@/features/client-portal/data/client-profile.repository'


export type ClientAuthMode =
  | 'login'
  | 'register'


type ClientLoginMethod =
  | 'password'
  | 'otp'


type OtpLoginStep =
  | 'request'
  | 'verify'


interface ClientAuthFormProps {
  initialMode?:
    ClientAuthMode

  onAuthenticated:
    (
      account:
        ClientPortalAccount,
    ) => void
}


const PHONE_PATTERN =
  /^09\d{9}$/


export default function ClientAuthForm({
  initialMode = 'login',

  onAuthenticated,
}: ClientAuthFormProps) {
  const [
    mode,
    setMode,
  ] =
    useState<ClientAuthMode>(
      initialMode,
    )


  const [
    loginMethod,
    setLoginMethod,
  ] =
    useState<ClientLoginMethod>(
      'password',
    )


  const [
    otpStep,
    setOtpStep,
  ] =
    useState<OtpLoginStep>(
      'request',
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
    otpCode,
    setOtpCode,
  ] =
    useState('')


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false)


  const [
    resendCooldown,
    setResendCooldown,
  ] =
    useState(0)



    
  useEffect(
    () => {
      if (
        resendCooldown <=
        0
      ) {
        return
      }


      const timer =
        window.setTimeout(
          () => {
            setResendCooldown(
              (
                current,
              ) =>
                Math.max(
                  0,

                  current -
                    1,
                ),
            )
          },

          1000,
        )


      return () => {
        window.clearTimeout(
          timer,
        )
      }
    },

    [
      resendCooldown,
    ],
  )


  function clearTransientState(): void {
    setError(
      null,
    )

    setPassword(
      '',
    )

    setConfirmPassword(
      '',
    )

    setOtpCode(
      '',
    )

    setOtpStep(
      'request',
    )

    setResendCooldown(
      0,
    )
  }


  function changeMode(
    nextMode:
      ClientAuthMode,
  ): void {
    if (
      submitting
    ) {
      return
    }


    setMode(
      nextMode,
    )

    setLoginMethod(
      'password',
    )

    clearTransientState()
  }


  function changeLoginMethod(
    nextMethod:
      ClientLoginMethod,
  ): void {
    if (
      submitting ||
      loginMethod ===
        nextMethod
    ) {
      return
    }


    setLoginMethod(
      nextMethod,
    )

    setError(
      null,
    )

    setPassword(
      '',
    )

    setOtpCode(
      '',
    )

    setOtpStep(
      'request',
    )

    setResendCooldown(
      0,
    )
  }


  function validatePhone(): boolean {
    if (
      !PHONE_PATTERN.test(
        phone,
      )
    ) {
      setError(
        'شماره موبایل معتبر وارد کنید.',
      )

      return false
    }


    return true
  }



  
  async function resolveLoggedInAccount():
    Promise<ClientPortalAccount> {
    const currentAccount =
      getCurrentClientPortalAccount()


    if (
      !currentAccount
    ) {
      throw new Error(
        'ورود انجام شد اما حساب موکل در نشست فعلی پیدا نشد.',
      )
    }


    try {
      return (
        await hydrateCurrentClientPortalAccount()
      ) ??
        currentAccount
    } catch {
      return currentAccount
    }
  }


 
  
  async function handleRegister():
    Promise<void> {
    setError(
      null,
    )


    const normalizedFullName =
      fullName.trim()


    if (
      normalizedFullName.length <
      3
    ) {
      setError(
        'نام و نام خانوادگی را کامل وارد کنید.',
      )

      return
    }


    if (
      !validatePhone()
    ) {
      return
    }


    if (
      password.length <
      8
    ) {
      setError(
        'رمز عبور باید حداقل ۸ کاراکتر باشد.',
      )

      return
    }


    if (
      password !==
      confirmPassword
    ) {
      setError(
        'تکرار رمز عبور با رمز عبور یکسان نیست.',
      )

      return
    }


    setSubmitting(
      true,
    )


    try {
   
      
      await clientSignup({
        phone,

        password,
      })


      const account =
        getCurrentClientPortalAccount()


      if (
        !account
      ) {
        throw new Error(
          'حساب ایجاد شد اما نشست موکل در دسترس نیست.',
        )
      }


      
      stageClientFullName(
        account.id,

        normalizedFullName,
      )


      try {
        await saveClientFullName(
          account.id,

          normalizedFullName,
        )
      } catch {
     
        
      }


      onAuthenticated({
        ...account,

        fullName:
          normalizedFullName,
      })
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        getClientAuthApiErrorMessage(
          caughtError,

          'ثبت‌نام موکل انجام نشد.',
        ),
      )
    } finally {
      setSubmitting(
        false,
      )
    }
  }


  async function handlePasswordLogin():
    Promise<void> {
    setError(
      null,
    )


    if (
      !validatePhone()
    ) {
      return
    }


    if (
      !password
    ) {
      setError(
        'رمز عبور را وارد کنید.',
      )

      return
    }


    setSubmitting(
      true,
    )


    try {
      await clientPasswordLogin({
        phone,

        password,
      })


      onAuthenticated(
        await resolveLoggedInAccount(),
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        getClientAuthApiErrorMessage(
          caughtError,

          'ورود با رمز عبور ناموفق بود.',
        ),
      )
    } finally {
      setSubmitting(
        false,
      )
    }
  }


  async function requestOtp():
    Promise<void> {
    setError(
      null,
    )


    if (
      !validatePhone()
    ) {
      return
    }


    setSubmitting(
      true,
    )


    try {
      const result =
        await requestClientLoginOtp(
          phone,
        )


      setOtpStep(
        'verify',
      )

      setOtpCode(
        '',
      )

      setResendCooldown(
        Math.max(
          0,

          Math.floor(
            result.resendAfter,
          ),
        ),
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        getClientAuthApiErrorMessage(
          caughtError,

          'ارسال کد ورود انجام نشد.',
        ),
      )
    } finally {
      setSubmitting(
        false,
      )
    }
  }


  async function handleOtpLogin():
    Promise<void> {
    setError(
      null,
    )


    if (
      !validatePhone()
    ) {
      return
    }


    if (
      otpCode.length !==
      6
    ) {
      setError(
        'کد ۶ رقمی را کامل وارد کنید.',
      )

      return
    }


    setSubmitting(
      true,
    )


    try {
      await clientOtpLogin({
        phone,

        code:
          otpCode,
      })


      onAuthenticated(
        await resolveLoggedInAccount(),
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        getClientAuthApiErrorMessage(
          caughtError,

          'ورود با کد یک‌بارمصرف ناموفق بود.',
        ),
      )
    } finally {
      setSubmitting(
        false,
      )
    }
  }


  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault()


    if (
      submitting
    ) {
      return
    }


    if (
      mode ===
      'register'
    ) {
      void handleRegister()

      return
    }


    if (
      loginMethod ===
      'password'
    ) {
      void handlePasswordLogin()

      return
    }


    if (
      otpStep ===
      'request'
    ) {
      void requestOtp()

      return
    }


    void handleOtpLogin()
  }


  async function handleResendOtp():
    Promise<void> {
    if (
      resendCooldown >
        0 ||
      submitting
    ) {
      return
    }


    await requestOtp()
  }


  const showOtpVerification =
    mode ===
      'login' &&
    loginMethod ===
      'otp' &&
    otpStep ===
      'verify'


  return (
    <div>
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() =>
            changeMode(
              'login',
            )
          }
          disabled={
            submitting
          }
          className={`h-10 rounded-lg text-sm font-black transition disabled:opacity-60 ${
            mode ===
            'login'
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
              'register',
            )
          }
          disabled={
            submitting
          }
          className={`h-10 rounded-lg text-sm font-black transition disabled:opacity-60 ${
            mode ===
            'register'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ثبت‌نام
        </button>
      </div>

      {mode ===
        'login' && (
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-1.5">
          <button
            type="button"
            onClick={() =>
              changeLoginMethod(
                'password',
              )
            }
            disabled={
              submitting
            }
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-black transition disabled:opacity-60 ${
              loginMethod ===
              'password'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <KeyRound
              size={15}
            />

            رمز عبور
          </button>

          <button
            type="button"
            onClick={() =>
              changeLoginMethod(
                'otp',
              )
            }
            disabled={
              submitting
            }
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-black transition disabled:opacity-60 ${
              loginMethod ===
              'otp'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <MessageSquareText
              size={15}
            />

            کد یک‌بارمصرف
          </button>
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-5 space-y-4"
        noValidate
      >
        {showOtpVerification ? (
          <>
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold leading-7 text-blue-800">
              کد ورود برای شماره{' '}
              <span
                dir="ltr"
                className="font-black"
              >
                {phone}
              </span>{' '}
              ارسال شد.
            </div>

            <OtpCodeInput
              value={
                otpCode
              }
              onChange={(
                value,
              ) => {
                setOtpCode(
                  value,
                )

                setError(
                  null,
                )
              }}
              disabled={
                submitting
              }
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  void handleResendOtp()
                }
                disabled={
                  resendCooldown >
                    0 ||
                  submitting
                }
                className="text-xs font-black text-blue-700 disabled:text-slate-400"
              >
                {resendCooldown >
                0
                  ? `ارسال دوباره تا ${resendCooldown.toLocaleString(
                      'fa-IR',
                    )} ثانیه دیگر`
                  : 'ارسال دوباره کد'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpStep(
                    'request',
                  )

                  setOtpCode(
                    '',
                  )

                  setError(
                    null,
                  )
                }}
                disabled={
                  submitting
                }
                className="text-xs font-black text-slate-500 disabled:opacity-60"
              >
                تغییر شماره موبایل
              </button>
            </div>
          </>
        ) : (
          <>
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
                    event,
                  ) => {
                    setFullName(
                      event.target.value,
                    )

                    setError(
                      null,
                    )
                  }}
                  autoComplete="name"
                  placeholder="مثلاً علی رضایی"
                  disabled={
                    submitting
                  }
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
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
                  event,
                ) => {
                  setPhone(
                    normalizeClientPhone(
                      event.target.value,
                    ),
                  )

                  setError(
                    null,
                  )
                }}
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                placeholder="09123456789"
                disabled={
                  submitting
                }
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-left text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </label>

            {(mode ===
              'register' ||
              loginMethod ===
                'password') && (
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
                    event,
                  ) => {
                    setPassword(
                      event.target.value,
                    )

                    setError(
                      null,
                    )
                  }}
                  autoComplete={
                    mode ===
                    'login'
                      ? 'current-password'
                      : 'new-password'
                  }
                  dir="ltr"
                  disabled={
                    submitting
                  }
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-left text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </label>
            )}

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
                    event,
                  ) => {
                    setConfirmPassword(
                      event.target.value,
                    )

                    setError(
                      null,
                    )
                  }}
                  autoComplete="new-password"
                  dir="ltr"
                  disabled={
                    submitting
                  }
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-left text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </label>
            )}

            {mode ===
              'register' && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold leading-6 text-emerald-800">
                بعد از ثبت اطلاعات، حساب شما همان لحظه ساخته می‌شود و وارد بخش موکلین می‌شوید. برای ثبت‌نام نیازی به کد تأیید نیست.
              </div>
            )}

            {mode ===
              'login' &&
              loginMethod ===
                'otp' && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-bold leading-6 text-blue-800">
                کد یک‌بارمصرف فقط برای ورود است. با اولین ورود موفق از این روش، مالکیت شماره موبایل حساب نیز تأیید می‌شود.
              </div>
            )}
          </>
        )}

        <div
          className="min-h-6"
          aria-live="polite"
        >
          {error && (
            <p className="text-sm font-bold leading-6 text-red-600">
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
          ) : loginMethod ===
            'otp' ? (
            <ShieldCheck
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
              ? 'ثبت‌نام و ورود'
              : loginMethod ===
                  'password'
                ? 'ورود با رمز عبور'
                : showOtpVerification
                  ? 'تأیید کد و ورود'
                  : 'ارسال کد ورود'}
        </button>
      </form>
    </div>
  )
}