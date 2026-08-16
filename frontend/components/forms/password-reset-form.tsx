'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'

import {
  useForm,
} from 'react-hook-form'

import {
  z,
} from 'zod'

import {
  zodResolver,
} from '@hookform/resolvers/zod'

import OtpCodeInput from '@/components/forms/OtpCodeInput'

import {
  PASSWORD_RESET_OTP_LENGTH,
  confirmPasswordReset,
  getPasswordResetErrorMessage,
  requestPasswordReset,
  resendPasswordResetOtp,
  verifyPasswordResetOtp,
  type PasswordResetChallenge,
} from '@/features/auth/api/password-reset.api'

import type {
  SubscriptionPlanKey,
} from '@/lib/subscription-plans'

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MOBILE_PATTERN =
  /^09\d{9}$/

function normalizeDigits(
  value:
    string
): string {
  const persianDigits =
    '۰۱۲۳۴۵۶۷۸۹'

  const arabicDigits =
    '٠١٢٣٤٥٦٧٨٩'

  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          persianDigits.indexOf(
            digit
          )
        )
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          arabicDigits.indexOf(
            digit
          )
        )
    )
}

const requestSchema =
  z.object({
    identifier:
      z
        .string()
        .trim()
        .min(
          1,
          'ایمیل یا شماره همراه را وارد کنید.'
        )
        .refine(
          (value) =>
            EMAIL_PATTERN.test(
              value
            ) ||
            MOBILE_PATTERN.test(
              normalizeDigits(
                value
              )
            ),

          'ایمیل یا شماره همراه معتبر نیست.'
        ),
  })

const passwordSchema =
  z
    .object({
      password:
        z
          .string()
          .min(
            8,
            'رمز عبور جدید باید حداقل ۸ کاراکتر باشد.'
          )
          .max(
            128,
            'رمز عبور بیش از حد طولانی است.'
          ),

      confirmPassword:
        z
          .string()
          .min(
            1,
            'تکرار رمز عبور را وارد کنید.'
          ),
    })
    .refine(
      (data) =>
        data.password ===
        data.confirmPassword,

      {
        path: [
          'confirmPassword',
        ],

        message:
          'رمز عبور و تکرار آن یکسان نیستند.',
      }
    )

type RequestFormData =
  z.infer<
    typeof requestSchema
  >

type PasswordFormData =
  z.infer<
    typeof passwordSchema
  >

type PasswordResetStage =
  | 'request'
  | 'verify'
  | 'reset'
  | 'success'

interface PasswordResetFormProps {
  selectedPlanKey?:
    SubscriptionPlanKey
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const inputClassName =
  'h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100'

const labelClassName =
  'mb-2 block text-sm font-black text-slate-800 sm:text-base'

const errorClassName =
  'mt-1.5 text-sm font-bold text-red-600'

/*
|--------------------------------------------------------------------------
| Timer
|--------------------------------------------------------------------------
*/

function formatCountdown(
  seconds:
    number
): string {
  const minutes =
    Math.floor(
      seconds /
        60
    )

  const remainingSeconds =
    seconds %
    60

  return `${minutes
    .toString()
    .padStart(
      2,
      '0'
    )}:${remainingSeconds
    .toString()
    .padStart(
      2,
      '0'
    )}`
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function PasswordResetForm({
  selectedPlanKey,
}: PasswordResetFormProps) {
  const [
    stage,
    setStage,
  ] =
    useState<PasswordResetStage>(
      'request'
    )

  const [
    challenge,
    setChallenge,
  ] =
    useState<
      PasswordResetChallenge | null
    >(
      null
    )

  /*
   * resetToken intentionally stays only in memory.
   */
  const [
    resetToken,
    setResetToken,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    otp,
    setOtp,
  ] =
    useState(
      ''
    )

  const [
    resendSeconds,
    setResendSeconds,
  ] =
    useState(
      0
    )

  const [
    otpExpiresIn,
    setOtpExpiresIn,
  ] =
    useState(
      0
    )

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(
      false
    )

  const [
    apiError,
    setApiError,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(
      false
    )

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(
      false
    )

  /*
  |--------------------------------------------------------------------------
  | Forms
  |--------------------------------------------------------------------------
  */

  const requestForm =
    useForm<RequestFormData>({
      resolver:
        zodResolver(
          requestSchema
        ),

      defaultValues: {
        identifier:
          '',
      },
    })

  const passwordForm =
    useForm<PasswordFormData>({
      resolver:
        zodResolver(
          passwordSchema
        ),

      defaultValues: {
        password:
          '',

        confirmPassword:
          '',
      },
    })

  /*
  |--------------------------------------------------------------------------
  | Links
  |--------------------------------------------------------------------------
  */

  const loginHref =
    selectedPlanKey
      ? `/login?plan=${selectedPlanKey}`
      : '/login'

  /*
  |--------------------------------------------------------------------------
  | Countdown
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      stage !==
      'verify'
    ) {
      return
    }

    const intervalId =
      window.setInterval(
        () => {
          setResendSeconds(
            (current) =>
              Math.max(
                current -
                  1,
                0
              )
          )

          setOtpExpiresIn(
            (current) =>
              Math.max(
                current -
                  1,
                0
              )
          )
        },
        1000
      )

    return () => {
      window.clearInterval(
        intervalId
      )
    }
  }, [
    stage,
  ])

  /*
  |--------------------------------------------------------------------------
  | Step
  |--------------------------------------------------------------------------
  */

  const step =
    useMemo(
      () => {
        switch (
          stage
        ) {
          case 'request':
            return 1

          case 'verify':
            return 2

          case 'reset':
          case 'success':
            return 3
        }
      },
      [
        stage,
      ]
    )

  /*
  |--------------------------------------------------------------------------
  | Request OTP
  |--------------------------------------------------------------------------
  */

  const handleRequest =
    async (
      data:
        RequestFormData
    ) => {
      setApiError(
        null
      )

      setActionLoading(
        true
      )

      try {
        const result =
          await requestPasswordReset(
            {
              identifier:
                data.identifier,
            }
          )

        setChallenge(
          result
        )

        setOtp(
          ''
        )

        setResendSeconds(
          result.resendAfter
        )

        setOtpExpiresIn(
          result.expiresIn
        )

        setStage(
          'verify'
        )
      } catch (
        error:
          unknown
      ) {
        setApiError(
          getPasswordResetErrorMessage(
            error,
            'ارسال کد تأیید ناموفق بود.'
          )
        )
      } finally {
        setActionLoading(
          false
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | Verify OTP
  |--------------------------------------------------------------------------
  */

  const handleVerify =
    async () => {
      if (
        !challenge
      ) {
        setApiError(
          'درخواست بازیابی رمز معتبر نیست. دوباره شروع کنید.'
        )

        setStage(
          'request'
        )

        return
      }

      if (
        otp.length !==
        PASSWORD_RESET_OTP_LENGTH
      ) {
        setApiError(
          `کد ${PASSWORD_RESET_OTP_LENGTH.toLocaleString(
            'fa-IR'
          )} رقمی را کامل وارد کنید.`
        )

        return
      }

      setApiError(
        null
      )

      setActionLoading(
        true
      )

      try {
        const result =
          await verifyPasswordResetOtp(
            {
              challengeId:
                challenge.challengeId,

              otp,
            }
          )

        setResetToken(
          result.resetToken
        )

        /*
         * OTP is no longer needed after successful verification.
         */
        setOtp(
          ''
        )

        setStage(
          'reset'
        )
      } catch (
        error:
          unknown
      ) {
        setApiError(
          getPasswordResetErrorMessage(
            error,
            'کد تأیید معتبر نیست یا منقضی شده است.'
          )
        )
      } finally {
        setActionLoading(
          false
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | Resend OTP
  |--------------------------------------------------------------------------
  */

  const handleResend =
    async () => {
      if (
        !challenge ||
        resendSeconds >
          0
      ) {
        return
      }

      setApiError(
        null
      )

      setActionLoading(
        true
      )

      try {
        const result =
          await resendPasswordResetOtp(
            {
              challengeId:
                challenge.challengeId,
            }
          )

        /*
         * challengeId can rotate after resend.
         */
        setChallenge(
          result
        )

        setOtp(
          ''
        )

        setResendSeconds(
          result.resendAfter
        )

        setOtpExpiresIn(
          result.expiresIn
        )
      } catch (
        error:
          unknown
      ) {
        setApiError(
          getPasswordResetErrorMessage(
            error,
            'ارسال مجدد کد تأیید ناموفق بود.'
          )
        )
      } finally {
        setActionLoading(
          false
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | Confirm Password
  |--------------------------------------------------------------------------
  */

  const handleConfirmPassword =
    async (
      data:
        PasswordFormData
    ) => {
      if (
        !resetToken
      ) {
        setApiError(
          'اعتبار تغییر رمز پایان یافته است. دوباره درخواست کد بدهید.'
        )

        setStage(
          'request'
        )

        return
      }

      setApiError(
        null
      )

      setActionLoading(
        true
      )

      try {
        await confirmPasswordReset(
          {
            resetToken,

            newPassword:
              data.password,
          }
        )

        /*
         * Clear sensitive in-memory value immediately.
         */
        setResetToken(
          null
        )

        passwordForm.reset()

        setStage(
          'success'
        )
      } catch (
        error:
          unknown
      ) {
        setApiError(
          getPasswordResetErrorMessage(
            error,
            'تغییر رمز عبور ناموفق بود.'
          )
        )
      } finally {
        setActionLoading(
          false
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | Restart
  |--------------------------------------------------------------------------
  */

  const restartFlow =
    () => {
      setStage(
        'request'
      )

      setChallenge(
        null
      )

      setResetToken(
        null
      )

      setOtp(
        ''
      )

      setResendSeconds(
        0
      )

      setOtpExpiresIn(
        0
      )

      setApiError(
        null
      )
    }

  /*
  |--------------------------------------------------------------------------
  | Success
  |--------------------------------------------------------------------------
  */

  if (
    stage ===
    'success'
  ) {
    return (
      <div
        dir="rtl"
        className="mx-auto w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-7 text-center shadow-2xl shadow-slate-300/50 sm:p-9"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-100 text-emerald-700">
          <CheckCircle2
            size={32}
          />
        </div>

        <h1 className="mt-5 text-2xl font-black text-slate-950">
          رمز عبور تغییر کرد
        </h1>

        <p className="mt-3 text-sm font-semibold leading-7 text-slate-600 sm:text-base">
          رمز عبور جدید با موفقیت ثبت شد.
          حالا می‌توانید با رمز جدید وارد
          حساب دادیار شوید.
        </p>

        <Link
          href={loginHref}
          className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 text-base font-black text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-blue-800"
        >
          ورود به حساب
        </Link>
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      dir="rtl"
      className="relative mx-auto h-[calc(100dvh-1rem)] max-h-[760px] w-full max-w-5xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl shadow-slate-300/50 sm:h-[calc(100dvh-2rem)]"
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ==========================================================
         * Brand
         * ======================================================== */}

        <aside className="relative hidden overflow-hidden border-l border-slate-200 bg-gradient-to-br from-blue-100 via-slate-50 to-emerald-50 p-9 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-300/25 blur-3xl" />

            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />
          </div>

          <Link
            href={loginHref}
            className="relative z-10 inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:text-blue-700"
          >
            <ArrowRight
              size={17}
            />

            بازگشت به ورود
          </Link>

          <div className="relative z-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <KeyRound
                size={28}
              />
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.4] text-slate-950">
              بازیابی امن رمز عبور
            </h1>

            <p className="mt-5 text-base font-semibold leading-8 text-slate-700">
              برای تغییر رمز عبور، ابتدا
              هویت شما با یک کد یک‌بار مصرف
              تأیید می‌شود.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4">
              <MailCheck
                size={21}
                className="shrink-0 text-blue-700"
              />

              <p className="text-sm font-bold text-slate-700">
                دریافت کد تأیید یک‌بار مصرف
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4">
              <ShieldCheck
                size={21}
                className="shrink-0 text-emerald-700"
              />

              <p className="text-sm font-bold text-slate-700">
                Reset Token فقط بعد از OTP
                معتبر صادر می‌شود
              </p>
            </div>
          </div>
        </aside>

        {/* ==========================================================
         * Form
         * ======================================================== */}

        <section className="flex h-full min-h-0 flex-col justify-center overflow-hidden p-5 sm:p-8 lg:p-10">
          {/* Mobile */}

          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link
              href={loginHref}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
            >
              <ArrowRight
                size={15}
              />

              ورود
            </Link>

            <span className="text-lg font-black text-slate-950">
              دادیار
            </span>
          </div>

          {/* Steps */}

          <div className="mb-6 flex items-center gap-2">
            {[
              {
                number:
                  1,

                title:
                  'ارسال کد',
              },

              {
                number:
                  2,

                title:
                  'تأیید OTP',
              },

              {
                number:
                  3,

                title:
                  'رمز جدید',
              },
            ].map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    item.number
                  }
                  className="flex min-w-0 flex-1 items-center"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        step >=
                        item.number
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {
                        item.number
                      }
                    </span>

                    <span
                      className={`hidden truncate text-xs font-black sm:block ${
                        step >=
                        item.number
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {
                        item.title
                      }
                    </span>
                  </div>

                  {index <
                    2 && (
                    <div
                      className={`mx-2 h-px flex-1 ${
                        step >
                        item.number
                          ? 'bg-blue-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>

          {/* API Error */}

          {apiError && (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700"
            >
              {apiError}
            </div>
          )}

          {/* ========================================================
           * STEP 1 — Identifier
           * ====================================================== */}

          {stage ===
            'request' && (
            <>
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <KeyRound
                    size={24}
                  />
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
                  فراموشی رمز عبور
                </h2>

                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600 sm:text-base">
                  ایمیل یا شماره همراهی که
                  با آن در دادیار ثبت‌نام
                  کرده‌اید وارد کنید.
                </p>
              </div>

              <form
                onSubmit={
                  requestForm.handleSubmit(
                    handleRequest
                  )
                }
                className="mt-7"
                noValidate
              >
                <label
                  htmlFor="reset-identifier"
                  className={
                    labelClassName
                  }
                >
                  ایمیل یا شماره همراه
                </label>

                <input
                  id="reset-identifier"
                  {...requestForm.register(
                    'identifier',
                    {
                      onChange:
                        () =>
                          setApiError(
                            null
                          ),
                    }
                  )}
                  type="text"
                  dir="ltr"
                  autoComplete="username"
                  disabled={
                    actionLoading
                  }
                  placeholder="example@gmail.com یا 09123456789"
                  className={
                    inputClassName
                  }
                />

                {requestForm
                  .formState
                  .errors
                  .identifier && (
                  <p
                    className={
                      errorClassName
                    }
                  >
                    {
                      requestForm
                        .formState
                        .errors
                        .identifier
                        .message
                    }
                  </p>
                )}

                <button
                  type="submit"
                  disabled={
                    actionLoading
                  }
                  className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 text-base font-black text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <LoaderCircle
                        size={20}
                        className="animate-spin"
                      />

                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      دریافت کد تأیید

                      <MailCheck
                        size={20}
                      />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ========================================================
           * STEP 2 — OTP
           * ====================================================== */}

          {stage ===
            'verify' &&
            challenge && (
            <>
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <MailCheck
                    size={24}
                  />
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
                  کد تأیید را وارد کنید
                </h2>

                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600 sm:text-base">
                  کد یک‌بار مصرف به
                  {' '}
                  <span
                    dir="ltr"
                    className="font-black text-slate-900"
                  >
                    {
                      challenge.destination
                    }
                  </span>
                  {' '}
                  ارسال شده است.
                </p>
              </div>

              <div className="mt-7">
                <OtpCodeInput
                  value={
                    otp
                  }
                  onChange={(
                    value
                  ) => {
                    setOtp(
                      value
                    )

                    setApiError(
                      null
                    )
                  }}
                  length={
                    PASSWORD_RESET_OTP_LENGTH
                  }
                  disabled={
                    actionLoading
                  }
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-500">
                    {otpExpiresIn >
                    0
                      ? `اعتبار کد: ${formatCountdown(
                          otpExpiresIn
                        )}`
                      : 'زمان اعتبار کد به پایان رسیده است.'}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      void handleResend()
                    }}
                    disabled={
                      actionLoading ||
                      resendSeconds >
                        0
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-black text-blue-700 transition disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        actionLoading
                          ? 'animate-spin'
                          : ''
                      }
                    />

                    {resendSeconds >
                    0
                      ? `ارسال مجدد تا ${formatCountdown(
                          resendSeconds
                        )}`
                      : 'ارسال مجدد کد'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void handleVerify()
                  }}
                  disabled={
                    actionLoading ||
                    otp.length !==
                      PASSWORD_RESET_OTP_LENGTH
                  }
                  className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 text-base font-black text-white shadow-lg shadow-blue-200 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <LoaderCircle
                        size={20}
                        className="animate-spin"
                      />

                      در حال بررسی...
                    </>
                  ) : (
                    <>
                      تأیید کد

                      <ShieldCheck
                        size={20}
                      />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    restartFlow
                  }
                  disabled={
                    actionLoading
                  }
                  className="mt-4 w-full text-center text-sm font-black text-slate-600 transition hover:text-blue-700"
                >
                  تغییر ایمیل یا شماره همراه
                </button>
              </div>
            </>
          )}

          {/* ========================================================
           * STEP 3 — New Password
           * ====================================================== */}

          {stage ===
            'reset' && (
            <>
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck
                    size={24}
                  />
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
                  رمز عبور جدید
                </h2>

                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600 sm:text-base">
                  یک رمز عبور جدید و امن
                  برای حساب خود تعیین کنید.
                </p>
              </div>

              <form
                onSubmit={
                  passwordForm.handleSubmit(
                    handleConfirmPassword
                  )
                }
                className="mt-6 space-y-4"
                noValidate
              >
                {/* Password */}

                <div>
                  <label
                    htmlFor="new-password"
                    className={
                      labelClassName
                    }
                  >
                    رمز عبور جدید
                  </label>

                  <div className="relative">
                    <input
                      id="new-password"
                      {...passwordForm.register(
                        'password',
                        {
                          onChange:
                            () =>
                              setApiError(
                                null
                              ),
                        }
                      )}
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      dir="ltr"
                      autoComplete="new-password"
                      disabled={
                        actionLoading
                      }
                      placeholder="حداقل ۸ کاراکتر"
                      className={`${inputClassName} pr-14`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                      className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-blue-700"
                      aria-label={
                        showPassword
                          ? 'مخفی کردن رمز'
                          : 'نمایش رمز'
                      }
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

                  {passwordForm
                    .formState
                    .errors
                    .password && (
                    <p
                      className={
                        errorClassName
                      }
                    >
                      {
                        passwordForm
                          .formState
                          .errors
                          .password
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Confirm */}

                <div>
                  <label
                    htmlFor="confirm-password"
                    className={
                      labelClassName
                    }
                  >
                    تکرار رمز عبور
                  </label>

                  <div className="relative">
                    <input
                      id="confirm-password"
                      {...passwordForm.register(
                        'confirmPassword',
                        {
                          onChange:
                            () =>
                              setApiError(
                                null
                              ),
                        }
                      )}
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      dir="ltr"
                      autoComplete="new-password"
                      disabled={
                        actionLoading
                      }
                      placeholder="تکرار رمز عبور"
                      className={`${inputClassName} pr-14`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) =>
                            !current
                        )
                      }
                      className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-blue-700"
                      aria-label={
                        showConfirmPassword
                          ? 'مخفی کردن رمز'
                          : 'نمایش رمز'
                      }
                    >
                      {showConfirmPassword ? (
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

                  {passwordForm
                    .formState
                    .errors
                    .confirmPassword && (
                    <p
                      className={
                        errorClassName
                      }
                    >
                      {
                        passwordForm
                          .formState
                          .errors
                          .confirmPassword
                          .message
                      }
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    actionLoading
                  }
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-600 text-base font-black text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <LoaderCircle
                        size={20}
                        className="animate-spin"
                      />

                      در حال تغییر رمز...
                    </>
                  ) : (
                    <>
                      ثبت رمز عبور جدید

                      <CheckCircle2
                        size={20}
                      />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}