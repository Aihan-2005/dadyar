'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

import Link from 'next/link'

import {
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  UserPlus,
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
  useAuthStore,
} from '@/store/auth.store'

import {
  completeOtpAuthentication,
} from '@/features/auth/auth-session'

import {
  LOGIN_OTP_LENGTH,
  getLoginOtpErrorMessage,
  requestLoginOtp,
  resendLoginOtp,
  verifyLoginOtp,
  type LoginOtpChallenge,
} from '@/features/auth/api/otp-login.api'

import {
  getSubscriptionPlan,
  type SubscriptionPlanKey,
} from '@/lib/subscription-plans'

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MOBILE_PATTERN =
  /^09\d{9}$/

const SIGNUP_PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_BYTES = 72

function normalizeDigits(
  value: string
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

function getUtf8ByteLength(
  value: string
): number {
  return new TextEncoder()
    .encode(value)
    .byteLength
}



const loginSchema =
  z.object({
    identifier:
      z
        .string()
        .trim()
        .min(
          1,
          'ایمیل یا شماره همراه را وارد کنید'
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

          'ایمیل یا شماره همراه معتبر نیست'
        ),

    password:
      z.string()
        .min(
          1,
          'رمز عبور را وارد کنید'
        )
        .refine(
          (value) =>
            getUtf8ByteLength(
              value
            ) <=
            PASSWORD_MAX_BYTES,
          'رمز عبور نباید بیشتر از ۷۲ بایت باشد'
        ),
  })




const otpIdentifierSchema =
  z.object({
    identifier:
      z
        .string()
        .trim()
        .min(
          1,
          'ایمیل یا شماره همراه را وارد کنید'
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

          'ایمیل یا شماره همراه معتبر نیست'
        ),
  })

const signupSchema =
  z
    .object({
      firstName:
        z
          .string()
          .trim()
          .min(
            2,
            'نام باید حداقل ۲ کاراکتر باشد'
          )
          .max(
            100,
            'نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد'
          ),

      lastName:
        z
          .string()
          .trim()
          .min(
            2,
            'نام خانوادگی باید حداقل ۲ کاراکتر باشد'
          )
          .max(
            100,
            'نام خانوادگی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد'
          ),

      email:
        z
          .string()
          .trim()
          .refine(
            (value) =>
              value === '' ||
              EMAIL_PATTERN.test(
                value
              ),

            'ایمیل معتبر نیست'
          ),

      phone:
        z
          .string()
          .trim()
          .refine(
            (value) =>
              value === '' ||
              MOBILE_PATTERN.test(
                normalizeDigits(
                  value
                )
              ),

            'شماره همراه باید با 09 شروع شود و 11 رقم باشد'
          ),

      password:
        z
          .string()
          .min(
            SIGNUP_PASSWORD_MIN_LENGTH,
            'رمز عبور باید حداقل ۸ کاراکتر باشد'
          )
          .refine(
            (value) =>
              getUtf8ByteLength(
                value
              ) <=
              PASSWORD_MAX_BYTES,
            'رمز عبور نباید بیشتر از ۷۲ بایت باشد'
          ),
    })
    .superRefine(
      (
        data,
        context
      ) => {
        const email =
          data.email.trim()

        const phone =
          normalizeDigits(
            data.phone
          ).trim()

        if (
          !email &&
          !phone
        ) {
          context.addIssue({
            code:
              'custom',

            path:
              [
                'email',
              ],

            message:
              'حداقل ایمیل یا شماره همراه را وارد کنید',
          })
        }
      }
    )


type LoginFormData =
  z.infer<
    typeof loginSchema
  >

type OtpIdentifierFormData =
  z.infer<
    typeof otpIdentifierSchema
  >

type SignupFormData =
  z.infer<
    typeof signupSchema
  >

type LoginMethod =
  | 'password'
  | 'otp'

interface AuthFormProps {
  defaultTab?:
  'login' | 'register'

  userType?:
  'lawyer' | 'client'

  selectedPlanKey?:
  SubscriptionPlanKey
}




const inputClassName =
  'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 sm:h-14 sm:rounded-2xl sm:text-base'

const labelClassName =
  'mb-1.5 block text-sm font-black text-slate-800 sm:text-base'

const errorClassName =
  'mt-1 text-xs font-bold text-red-600 sm:text-sm'




function formatCountdown(
  seconds:
    number
): string {
  const minutes =
    Math.floor(
      seconds /
      60
    )

  const remaining =
    seconds %
    60

  return `${minutes
    .toString()
    .padStart(
      2,
      '0'
    )}:${remaining
      .toString()
      .padStart(
        2,
        '0'
      )}`
}





export default function AuthForm({
  defaultTab =
  'login',

  userType =
  'lawyer',

  selectedPlanKey,
}: AuthFormProps) {
  const router =
    useRouter()

 




  const login =
    useAuthStore(
      (state) =>
        state.login
    )

  const signup =
    useAuthStore(
      (state) =>
        state.signup
    )

  const isLoading =
    useAuthStore(
      (state) =>
        state.isLoading
    )

  const authError =
    useAuthStore(
      (state) =>
        state.error
    )

  const clearAuthError =
    useAuthStore(
      (state) =>
        state.clearError
    )




  const [
    activeTab,
    setActiveTab,
  ] =
    useState<
      'login' | 'register'
    >(
      defaultTab
    )

 
    


  const [
    loginMethod,
    setLoginMethod,
  ] =
    useState<LoginMethod>(
      'password'
    )





  const [
    showLoginPassword,
    setShowLoginPassword,
  ] =
    useState(false)

  const [
    showSignupPassword,
    setShowSignupPassword,
  ] =
    useState(false)





  const [
    otpChallenge,
    setOtpChallenge,
  ] =
    useState<
      LoginOtpChallenge | null
    >(
      null
    )

  const [
    otpCode,
    setOtpCode,
  ] =
    useState(
      ''
    )

  const [
    otpLoading,
    setOtpLoading,
  ] =
    useState(false)

  const [
    otpError,
    setOtpError,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    otpExpiresIn,
    setOtpExpiresIn,
  ] =
    useState(
      0
    )

  const [
    resendSeconds,
    setResendSeconds,
  ] =
    useState(
      0
    )

 



  const selectedPlan =
    selectedPlanKey
      ? getSubscriptionPlan(
        selectedPlanKey
      )
      : undefined





  const loginForm =
    useForm<LoginFormData>({
      resolver:
        zodResolver(
          loginSchema
        ),

      defaultValues: {
        identifier:
          '',

        password:
          '',
      },
    })

  const otpIdentifierForm =
    useForm<OtpIdentifierFormData>({
      resolver:
        zodResolver(
          otpIdentifierSchema
        ),

      defaultValues: {
        identifier:
          '',
      },
    })

  const signupForm =
    useForm<SignupFormData>({
      resolver:
        zodResolver(
          signupSchema
        ),

      defaultValues: {
        firstName:
          '',

        lastName:
          '',

        email:
          '',

        phone:
          '',

        password:
          '',
      },
    })




  useEffect(() => {
    if (
      !otpChallenge
    ) {
      return
    }

    const timer =
      window.setInterval(
        () => {
          setOtpExpiresIn(
            (current) =>
              Math.max(
                current -
                1,
                0
              )
          )

          setResendSeconds(
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
        timer
      )
    }
  }, [
    otpChallenge,
  ])

 




  const userTitle =
    userType ===
      'lawyer'
      ? 'وکلا'
      : 'موکلین'

  const isRegister =
    activeTab ===
    'register'

  const backHref =
    selectedPlanKey
      ? `/launch?plan=${selectedPlanKey}`
      : '/launch'

  const rememberSelectedPlan =
    () => {
      if (
        !selectedPlanKey ||
        typeof window ===
        'undefined'
      ) {
        return
      }

      window.sessionStorage.setItem(
        'dadyar:selected-subscription-plan',
        selectedPlanKey
      )
    }

  




  const resetOtpFlow =
    () => {
      setOtpChallenge(
        null
      )

      setOtpCode(
        ''
      )

      setOtpError(
        null
      )

      setOtpExpiresIn(
        0
      )

      setResendSeconds(
        0
      )
    }






  const changeTab =
    (
      tab:
        'login' | 'register'
    ) => {
      clearAuthError()
      setOtpError(null)

      setActiveTab(
        tab
      )

      if (
        tab ===
        'register'
      ) {
        resetOtpFlow()
      }
    }

 




  const changeLoginMethod =
    (
      method:
        LoginMethod
    ) => {
      clearAuthError()
      setOtpError(null)

      setLoginMethod(
        method
      )

      if (
        method ===
        'password'
      ) {
        resetOtpFlow()
      }
    }

 




  const handlePasswordLogin =
    async (
      data:
        LoginFormData
    ) => {
      clearAuthError()

      try {
        await login({
          identifier:
            data.identifier,

          password:
            data.password,
        })

        rememberSelectedPlan()

        router.replace(
          '/dashboard'
        )
      } catch {
        // auth.store exposes error.
      }
    }

  


  const handleSignup =
    async (
      data:
        SignupFormData
    ) => {
      clearAuthError()

      try {
        await signup({
          firstName:
            data.firstName,

          lastName:
            data.lastName,

          password:
            data.password,

          ...(data.email
            ? {
              email:
                data.email
                  .trim()
                  .toLowerCase(),
            }
            : {}),

          ...(data.phone
            ? {
              phone:
                normalizeDigits(
                  data.phone
                ).trim(),
            }
            : {}),
        })

        rememberSelectedPlan()

        router.replace(
          '/dashboard'
        )
      } catch {
        // auth.store exposes error.
      }
    }

  



  const handleRequestOtp =
    async (
      data:
        OtpIdentifierFormData
    ) => {
      setOtpError(
        null
      )

      setOtpLoading(
        true
      )

      try {
        const challenge =
          await requestLoginOtp(
            data.identifier
          )

        setOtpChallenge(
          challenge
        )

        setOtpCode(
          ''
        )

        setOtpExpiresIn(
          challenge.expiresIn
        )

        setResendSeconds(
          challenge.resendAfter
        )
      } catch (
      error:
        unknown
      ) {
        setOtpError(
          getLoginOtpErrorMessage(
            error,
            'ارسال کد ورود ناموفق بود.'
          )
        )
      } finally {
        setOtpLoading(
          false
        )
      }
    }

  



  const handleVerifyOtp =
    async () => {
      if (
        !otpChallenge
      ) {
        return
      }

      if (
        otpCode.length !==
        LOGIN_OTP_LENGTH
      ) {
        setOtpError(
          `کد ${LOGIN_OTP_LENGTH.toLocaleString(
            'fa-IR'
          )} رقمی را کامل وارد کنید.`
        )

        return
      }

      setOtpError(
        null
      )

      setOtpLoading(
        true
      )

      try {
        const session =
          await verifyLoginOtp(
            otpChallenge.challengeId,
            otpCode
          )

        completeOtpAuthentication(
          session
        )

        rememberSelectedPlan()

        resetOtpFlow()

        router.replace(
          '/dashboard'
        )
      } catch (
      error:
        unknown
      ) {
        setOtpError(
          getLoginOtpErrorMessage(
            error,
            'کد ورود اشتباه یا منقضی شده است.'
          )
        )
      } finally {
        setOtpLoading(
          false
        )
      }
    }

 



  const handleResendOtp =
    async () => {
      if (
        !otpChallenge ||
        resendSeconds >
        0
      ) {
        return
      }

      setOtpError(
        null
      )

      setOtpLoading(
        true
      )

      try {
        const challenge =
          await resendLoginOtp(
            otpChallenge.challengeId
          )

        setOtpChallenge(
          challenge
        )

        setOtpCode(
          ''
        )

        setOtpExpiresIn(
          challenge.expiresIn
        )

        setResendSeconds(
          challenge.resendAfter
        )
      } catch (
      error:
        unknown
      ) {
        setOtpError(
          getLoginOtpErrorMessage(
            error,
            'ارسال مجدد کد ورود ناموفق بود.'
          )
        )
      } finally {
        setOtpLoading(
          false
        )
      }
    }



  const passwordLoginLoading =
    loginForm.formState
      .isSubmitting ||
    isLoading

  const signupLoading =
    signupForm.formState
      .isSubmitting ||
    isLoading

  


  return (
    <div
      dir="rtl"
      className="relative mx-auto h-[calc(100dvh-1rem)] max-h-[760px] w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-300/50 sm:h-[calc(100dvh-2rem)] sm:rounded-[32px]"
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-2">



        <aside className="relative hidden overflow-hidden border-l border-slate-200 bg-gradient-to-br from-blue-100 via-slate-50 to-emerald-50 p-9 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-300/25 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />
          </div>

          <Link
            href={backHref}
            className="relative z-10 w-fit rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:text-blue-700"
          >
            بازگشت
          </Link>

          <div className="relative z-10">
            <span className="rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-black text-blue-800">
              سامانه مدیریت هوشمند دادیار
            </span>

            <h1 className="mt-7 text-4xl font-black leading-[1.4] text-slate-950 xl:text-5xl">
              {isRegister
                ? `ساخت حساب ${userTitle}`
                : `ورود ${userTitle} به دادیار`}
            </h1>

            <p className="mt-5 max-w-md text-base font-semibold leading-8 text-slate-700">
              با رمز عبور یا کد یک‌بارمصرف
              وارد حساب خود شوید و دفترتان
              را مدیریت کنید.
            </p>
          </div>

          <div className="relative z-10 grid gap-2.5">
            {[
              'ورود امن با رمز عبور',
              'ورود سریع با کد یک‌بارمصرف',
              'مدیریت پرونده‌ها و امور مالی',
            ].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-bold text-slate-700"
                >
                  <span className="ml-2 text-emerald-600">
                    ✓
                  </span>

                  {item}
                </div>
              )
            )}
          </div>
        </aside>




        <section
          className={`relative flex h-full min-h-0 flex-col justify-center overflow-hidden ${isRegister
              ? 'p-3 sm:p-5 lg:p-6'
              : 'p-5 sm:p-8 lg:p-10'
            }`}
        >
          {/* Mobile */}

          <div
            className={`flex items-center justify-between lg:hidden ${isRegister
                ? 'mb-2'
                : 'mb-5'
              }`}
          >
            <Link
              href={backHref}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
            >
              بازگشت
            </Link>

            <span className="text-lg font-black text-slate-950">
              دادیار
            </span>
          </div>

          {/* Heading */}

          <div
            className={
              isRegister
                ? 'mb-3'
                : 'mb-5'
            }
          >
            <div
              className={`flex items-center justify-center rounded-2xl bg-blue-100 text-blue-700 ${isRegister
                  ? 'mb-5 h-10 w-10'
                  : 'mb-4 h-12 w-12'
                }`}
            >
              <ShieldCheck
                size={
                  isRegister
                    ? 22
                    : 26
                }
              />
            </div>

            <h2
              className={`font-black text-slate-950 ${isRegister
                  ? 'text-2xl'
                  : 'text-2xl sm:text-3xl'
                }`}
            >
              {isRegister
                ? `ثبت‌نام ${userTitle}`
                : `ورود ${userTitle}`}
            </h2>

            <p
              className={`font-semibold text-slate-700 ${isRegister
                  ? 'mt-1 text-xs sm:text-sm'
                  : 'mt-2 text-sm sm:text-base'
                }`}
            >
              {isRegister
                ? 'اطلاعات زیر را برای ساخت حساب تکمیل کنید.'
                : 'روش ورود دلخواه خود را انتخاب کنید.'}
            </p>
          </div>

          {/* Selected Plan */}

          {selectedPlan && (
            <div
              className={`rounded-xl border border-blue-200 bg-blue-50 px-3 font-bold text-blue-800 ${isRegister
                  ? 'mb-2 py-1.5 text-xs'
                  : 'mb-3 py-2 text-sm'
                }`}
            >
              پلن انتخابی:
              {' '}
              {
                selectedPlan.title
              }
            </div>
          )}

          {/* Main Auth Tabs */}

          <div
            className={`flex rounded-2xl border border-slate-200 bg-slate-100 p-1 ${isRegister
                ? 'mb-3'
                : 'mb-4'
              }`}
          >
            <button
              type="button"
              onClick={() =>
                changeTab(
                  'login'
                )
              }
              className={`flex-1 rounded-xl px-3 font-black transition ${isRegister
                  ? 'py-2 text-sm'
                  : 'py-3 text-base'
                } ${activeTab ===
                  'login'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600'
                }`}
            >
              ورود
            </button>

            <button
              type="button"
              onClick={() =>
                changeTab(
                  'register'
                )
              }
              className={`flex-1 rounded-xl px-3 font-black transition ${isRegister
                  ? 'py-2 text-sm'
                  : 'py-3 text-base'
                } ${activeTab ===
                  'register'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600'
                }`}
            >
              ثبت‌نام
            </button>
          </div>


          {!isRegister && (
            <>
              {/* Login Method */}

              <div className="mb-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    changeLoginMethod(
                      'password'
                    )
                  }
                  className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-black transition ${loginMethod ===
                      'password'
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <LockKeyhole
                    size={17}
                  />

                  ورود با رمز
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeLoginMethod(
                      'otp'
                    )
                  }
                  className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-black transition ${loginMethod ===
                      'otp'
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <Smartphone
                    size={17}
                  />

                  کد یک‌بارمصرف
                </button>
              </div>

              {/* Password Error */}

              {loginMethod ===
                'password' &&
                authError && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                    {authError}
                  </div>
                )}

              {/* OTP Error */}

              {loginMethod ===
                'otp' &&
                otpError && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                    {otpError}
                  </div>
                )}


              {loginMethod ===
                'password' ? (
                <form
                  onSubmit={
                    loginForm.handleSubmit(
                      handlePasswordLogin
                    )
                  }
                  className="space-y-5"
                  noValidate
                >
                  <div>
                    <label
                      htmlFor="login-identifier"
                      className={
                        labelClassName
                      }
                    >
                      ایمیل یا شماره همراه
                    </label>

                    <input
                      id="login-identifier"
                      {...loginForm.register(
                        'identifier',
                        {
                          onChange:
                            clearAuthError,
                        }
                      )}
                      dir="ltr"
                      autoComplete="username"
                      disabled={
                        passwordLoginLoading
                      }
                      className={
                        inputClassName
                      }
                      placeholder="example@gmail.com یا 09123456789"
                    />

                    {loginForm
                      .formState
                      .errors
                      .identifier && (
                        <p
                          className={
                            errorClassName
                          }
                        >
                          {
                            loginForm
                              .formState
                              .errors
                              .identifier
                              .message
                          }
                        </p>
                      )}
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className={
                        labelClassName
                      }
                    >
                      رمز عبور
                    </label>

                    <div className="relative">
                      <input
                        id="login-password"
                        {...loginForm.register(
                          'password',
                          {
                            onChange:
                              clearAuthError,
                          }
                        )}
                        type={
                          showLoginPassword
                            ? 'text'
                            : 'password'
                        }
                        dir="ltr"
                        autoComplete="current-password"
                        disabled={
                          passwordLoginLoading
                        }
                        className={`${inputClassName} pr-14`}
                        placeholder="••••••••"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowLoginPassword(
                            (current) =>
                              !current
                          )
                        }
                        className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-700"
                      >
                        {showLoginPassword ? (
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

                    {loginForm
                      .formState
                      .errors
                      .password && (
                        <p
                          className={
                            errorClassName
                          }
                        >
                          {
                            loginForm
                              .formState
                              .errors
                              .password
                              .message
                          }
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      passwordLoginLoading
                    }
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 text-base font-black text-white shadow-lg shadow-blue-200 transition disabled:opacity-60"
                  >
                    <LogIn
                      size={20}
                    />

                    {passwordLoginLoading
                      ? 'در حال ورود...'
                      : `ورود ${userTitle}`}
                  </button>
                </form>
              ) : (


                

                <>
                  {!otpChallenge ? (
                    <form
                      onSubmit={
                        otpIdentifierForm.handleSubmit(
                          handleRequestOtp
                        )
                      }
                      className="space-y-5"
                      noValidate
                    >
                      <div>
                        <label
                          htmlFor="otp-identifier"
                          className={
                            labelClassName
                          }
                        >
                          ایمیل یا شماره همراه
                        </label>

                        <input
                          id="otp-identifier"
                          {...otpIdentifierForm.register(
                            'identifier',
                            {
                              onChange:
                                () =>
                                  setOtpError(
                                    null
                                  ),
                            }
                          )}
                          dir="ltr"
                          autoComplete="username"
                          disabled={
                            otpLoading
                          }
                          className={
                            inputClassName
                          }
                          placeholder="example@gmail.com یا 09123456789"
                        />

                        {otpIdentifierForm
                          .formState
                          .errors
                          .identifier && (
                            <p
                              className={
                                errorClassName
                              }
                            >
                              {
                                otpIdentifierForm
                                  .formState
                                  .errors
                                  .identifier
                                  .message
                              }
                            </p>
                          )}
                      </div>

                      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                        <div className="flex items-start gap-3">
                          <MailCheck
                            size={19}
                            className="mt-0.5 shrink-0 text-blue-700"
                          />

                          <p className="text-sm font-semibold leading-6 text-slate-700">
                            یک کد یک‌بارمصرف
                            برای شما ارسال
                            می‌شود و بدون نیاز
                            به رمز عبور وارد
                            حساب خواهید شد.
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={
                          otpLoading
                        }
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 text-base font-black text-white shadow-lg shadow-blue-200 transition disabled:opacity-60"
                      >
                        {otpLoading ? (
                          <>
                            <LoaderCircle
                              size={20}
                              className="animate-spin"
                            />

                            در حال ارسال...
                          </>
                        ) : (
                          <>
                            <Smartphone
                              size={20}
                            />

                            دریافت کد ورود
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div>
                      <div className="text-center">
                        <h3 className="text-xl font-black text-slate-950">
                          کد ورود را وارد کنید
                        </h3>

                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                          کد به
                          {' '}
                          <span
                            dir="ltr"
                            className="font-black text-slate-900"
                          >
                            {
                              otpChallenge.destination
                            }
                          </span>
                          {' '}
                          ارسال شده است.
                        </p>
                      </div>

                      <div className="mt-6">
                        <OtpCodeInput
                          value={
                            otpCode
                          }
                          onChange={(
                            value
                          ) => {
                            setOtpCode(
                              value
                            )

                            setOtpError(
                              null
                            )
                          }}
                          length={
                            LOGIN_OTP_LENGTH
                          }
                          disabled={
                            otpLoading
                          }
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-500 sm:text-sm">
                          {otpExpiresIn >
                            0
                            ? `اعتبار کد: ${formatCountdown(
                              otpExpiresIn
                            )}`
                            : 'کد منقضی شده است'}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            void handleResendOtp()
                          }}
                          disabled={
                            otpLoading ||
                            resendSeconds >
                            0
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 disabled:text-slate-400 sm:text-sm"
                        >
                          <RefreshCw
                            size={15}
                            className={
                              otpLoading
                                ? 'animate-spin'
                                : ''
                            }
                          />

                          {resendSeconds >
                            0
                            ? `ارسال مجدد ${formatCountdown(
                              resendSeconds
                            )}`
                            : 'ارسال مجدد'}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          void handleVerifyOtp()
                        }}
                        disabled={
                          otpLoading ||
                          otpCode.length !==
                          LOGIN_OTP_LENGTH
                        }
                        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 text-base font-black text-white shadow-lg shadow-blue-200 transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {otpLoading ? (
                          <>
                            <LoaderCircle
                              size={20}
                              className="animate-spin"
                            />

                            در حال ورود...
                          </>
                        ) : (
                          <>
                            <KeyRound
                              size={20}
                            />

                            ورود با کد
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={
                          resetOtpFlow
                        }
                        disabled={
                          otpLoading
                        }
                        className="mt-3 w-full text-center text-sm font-black text-slate-600 transition hover:text-blue-700"
                      >
                        تغییر ایمیل یا شماره همراه
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}


          {isRegister && (
            <>
              {authError && (
                <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  {authError}
                </div>
              )}

              <form
                onSubmit={
                  signupForm.handleSubmit(
                    handleSignup
                  )
                }
                className="space-y-2.5 sm:space-y-3"
                noValidate
              >
                <div className="grid grid-cols-2 gap-2.5">
                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="signup-first-name"
                      className={
                        labelClassName
                      }
                    >
                      نام
                    </label>

                    <input
                      id="signup-first-name"
                      {...signupForm.register(
                        'firstName',
                        {
                          onChange:
                            clearAuthError,
                        }
                      )}
                      autoComplete="given-name"
                      disabled={
                        signupLoading
                      }
                      className={
                        inputClassName
                      }
                      placeholder="نام"
                    />
                    {signupForm
                      .formState
                      .errors
                      .firstName && (
                        <p
                          className={
                            errorClassName
                          }
                        >
                          {
                            signupForm
                              .formState
                              .errors
                              .firstName
                              .message
                          }
                        </p>
                      )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="signup-last-name"
                      className={
                        labelClassName
                      }
                    >
                      نام خانوادگی
                    </label>

                    <input
                      id="signup-last-name"
                      {...signupForm.register(
                        'lastName',
                        {
                          onChange:
                            clearAuthError,
                        }
                      )}
                      autoComplete="family-name"
                      disabled={
                        signupLoading
                      }
                      className={
                        inputClassName
                      } placeholder="نام خانوادگی"
                    />

                    {signupForm
                      .formState
                      .errors
                      .lastName && (
                        <p
                          className={
                            errorClassName
                          }
                        >
                          {
                            signupForm
                              .formState
                              .errors
                              .lastName
                              .message
                          }
                        </p>
                      )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="signup-email"
                    className={
                      labelClassName
                    }
                  >
                    ایمیل
                  </label>

                  <input
                    id="signup-email"
                    {...signupForm.register(
                      'email',
                      {
                        onChange:
                          clearAuthError,
                      }
                    )}
                    dir="ltr"
                    type="email" autoComplete="email"
                    disabled={
                      signupLoading
                    }
                    className={
                      inputClassName
                    }
                    placeholder="example@gmail.com"
                  />

                  {signupForm
                    .formState
                    .errors
                    .email && (
                      <p
                        className={
                          errorClassName
                        }
                      >
                        {
                          signupForm
                            .formState
                            .errors
                            .email
                            .message
                        }
                      </p>
                    )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="signup-phone"
                    className={
                      labelClassName
                    }
                  >
                    شماره همراه
                  </label>

                  <input
                    id="signup-phone"
                    {...signupForm.register(
                      'phone',
                      {
                        onChange:
                          clearAuthError,
                      }
                    )}
                    dir="ltr"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    disabled={
                      signupLoading
                    }
                    className={
                      inputClassName
                    }
                    placeholder="09123456789"
                  />

                  {signupForm
                    .formState
                    .errors
                    .phone && (
                      <p
                        className={
                          errorClassName
                        }
                      >
                        {
                          signupForm
                            .formState
                            .errors
                            .phone
                            .message
                        }
                      </p>
                    )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="signup-password"
                    className={
                      labelClassName
                    }
                  >
                    رمز عبور
                  </label> <div className="relative">
                    <input
                      id="signup-password"
                      {...signupForm.register(
                        'password',
                        {
                          onChange:
                            clearAuthError,
                        }
                      )}
                      type={
                        showSignupPassword
                          ? 'text'
                          : 'password'
                      }
                      dir="ltr"
                      autoComplete="new-password"
                      disabled={
                        signupLoading
                      }
                      className={`${inputClassName} pr-14`}
                      placeholder="حداقل ۸ کاراکتر"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowSignupPassword(
                          (current) =>
                            !current
                        )
                      }
                      disabled={
                        signupLoading
                      }
                      aria-label={
                        showSignupPassword
                          ? 'مخفی کردن رمز عبور'
                          : 'نمایش رمز عبور'
                      }
                      className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showSignupPassword ? (
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

                  {signupForm
                    .formState
                    .errors
                    .password && (
                      <p
                        className={
                          errorClassName
                        }
                      >
                        {
                          signupForm
                            .formState
                            .errors
                            .password
                            .message
                        }
                      </p>
                    )}
                </div>

                <button
                  type="submit"
                  disabled={
                    signupLoading
                  }
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-sm font-black text-white shadow-lg shadow-blue-200 transition disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:rounded-2xl sm:text-base"
                >
                  {signupLoading ? (
                    <>
                      <LoaderCircle
                        size={20}
                        className="animate-spin"
                      />

                      در حال ثبت‌نام...
                    </>
                  ) : (
                    <>
                      <UserPlus
                        size={20}
                      />
                      {`ثبت‌نام ${userTitle}`}
                    </>
                  )}
                </button>
              </form>
            </>
          )}





          <div
            className={`text-center font-semibold text-slate-700 ${isRegister
                ? 'mt-2 text-xs sm:text-sm'
                : 'mt-5 text-sm sm:text-base'
              }`}
          >
            {isRegister
              ? 'قبلاً حساب ساخته‌اید؟ '
              : 'حساب کاربری ندارید؟ '}

            <button
              type="button"
              onClick={() =>
                changeTab(
                  isRegister
                    ? 'login'
                    : 'register'
                )
              }
              className="font-black text-blue-700 transition hover:text-blue-800"
            >
              {isRegister
                ? 'وارد شوید'
                : 'ثبت‌نام کنید'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}