'use client'

import {
  useState,
} from 'react'

import Link from 'next/link'

import {
  useRouter,
} from 'next/navigation'

import {
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  ShieldCheck,
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

import {
  useAuthStore,
} from '@/store/auth.store'

import {
  getSubscriptionPlan,
  type SubscriptionPlanKey,
} from '@/lib/subscription-plans'



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
      z
        .string()
        .min(
          6,
          'رمز عبور باید حداقل ۶ کاراکتر باشد'
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
          ),

      lastName:
        z
          .string()
          .trim()
          .min(
            2,
            'نام خانوادگی باید حداقل ۲ کاراکتر باشد'
          ),

      email:
        z
          .string()
          .trim()
          .refine(
            (value) =>
              value ===
                '' ||
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
              value ===
                '' ||
              MOBILE_PATTERN.test(
                normalizeDigits(
                  value
                )
              ),

            'شماره همراه معتبر نیست'
          ),

      password:
        z
          .string()
          .min(
            6,
            'رمز عبور باید حداقل ۶ کاراکتر باشد'
          ),
    })
    .superRefine(
      (
        data,
        context
      ) => {
        if (
          !data.email &&
          !data.phone
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

type SignupFormData =
  z.infer<
    typeof signupSchema
  >

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

  const error =
    useAuthStore(
      (state) =>
        state.error
    )

  const clearError =
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
    showLoginPassword,
    setShowLoginPassword,
  ] =
    useState(
      false
    )

  const [
    showSignupPassword,
    setShowSignupPassword,
  ] =
    useState(
      false
    )

  

  const selectedPlan =
    selectedPlanKey
      ? getSubscriptionPlan(
          selectedPlanKey
        )
      : undefined

  

  const title =
    userType ===
    'lawyer'
      ? 'وکلا'
      : 'موکلین'

 

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

 

  const changeTab =
    (
      tab:
        'login' | 'register'
    ) => {
      clearError()

      setActiveTab(
        tab
      )
    }

 

  const handleLogin =
    async (
      data:
        LoginFormData
    ) => {
      clearError()

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
       
      }
    }

  

  const handleSignup =
    async (
      data:
        SignupFormData
    ) => {
      clearError()

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
    
      }
    }

  
  const isRegister =
    activeTab ===
    'register'

  const isLoginSubmitting =
    loginForm.formState
      .isSubmitting ||
    isLoading

  const isSignupSubmitting =
    signupForm.formState
      .isSubmitting ||
    isLoading

  const backHref =
    selectedPlanKey
      ? `/launch?plan=${selectedPlanKey}`
      : '/launch'

  const forgotPasswordHref =
    selectedPlanKey
      ? `/forgot-password?plan=${selectedPlanKey}`
      : '/forgot-password'

   
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

          {/* Back */}

          <Link
            href={backHref}
            className="relative z-10 w-fit rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
          >
            بازگشت
          </Link>

          {/* Copy */}

          <div className="relative z-10">
            <span className="rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-black text-blue-800">
              سامانه مدیریت هوشمند دادیار
            </span>

            <h1 className="mt-7 text-4xl font-black leading-[1.4] text-slate-950 xl:text-5xl">
              {isRegister
                ? `ساخت حساب ${title}`
                : `ورود ${title} به دادیار`}
            </h1>

            <p className="mt-5 max-w-md text-base font-semibold leading-8 text-slate-700">
              پرونده‌ها، موکلین، قراردادها
              و گزارش‌های مالی دفترتان را
              در یک محیط یکپارچه مدیریت
              کنید.
            </p>
          </div>

          {/* Features */}

          <div className="relative z-10 grid gap-2.5">
            {[
              'مدیریت پرونده‌ها و موکلین',
              'مدیریت اطلاعات مالی',
              'پیگیری امور دفتر',
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

        {/* ==========================================================
         * Form Side
         * ======================================================== */}

        <section
          className={`relative flex h-full min-h-0 flex-col justify-center overflow-hidden ${
            isRegister
              ? 'p-3 sm:p-5 lg:p-6'
              : 'p-5 sm:p-8 lg:p-10'
          }`}
        >
 
          <div
            className={`flex items-center justify-between lg:hidden ${
              isRegister
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
  


          <div
            className={
              isRegister
                ? 'mb-3'
                : 'mb-6'
            }
          >
            <div
              className={`flex items-center justify-center rounded-2xl bg-blue-100 text-blue-700 ${
                isRegister
                  ? 'mb-5 h-10 w-10'
                  : 'mb-5 h-12 w-12'
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
              className={`font-black text-slate-950 ${
                isRegister
                  ? 'text-2xl'
                  : 'text-2xl sm:text-3xl'
              }`}
            >
              {isRegister
                ? `ثبت‌نام ${title}`
                : `ورود ${title}`}
            </h2>

            <p
              className={`font-semibold text-slate-700 ${
                isRegister
                  ? 'mt-1 text-xs sm:text-sm'
                  : 'mt-2 text-sm sm:text-base'
              }`}
            >
              {isRegister
                ? 'اطلاعات زیر را برای ساخت حساب تکمیل کنید.'
                : 'ایمیل یا شماره همراه و رمز عبور خود را وارد کنید.'}
            </p>
          </div>


          {selectedPlan && (
            <div
              className={`rounded-xl border border-blue-200 bg-blue-50 px-3 font-bold text-blue-800 ${
                isRegister
                  ? 'mb-2 py-1.5 text-xs'
                  : 'mb-4 py-2.5 text-sm'
              }`}
            >
              پلن انتخابی:
              {' '}
              {
                selectedPlan.title
              }
            </div>
          )}



          <div
            className={`flex rounded-2xl border border-slate-200 bg-slate-100 p-1 ${
              isRegister
                ? 'mb-3'
                : 'mb-6'
            }`}
          >
            <button
              type="button"
              onClick={() =>
                changeTab(
                  'login'
                )
              }
              disabled={
                isLoading
              }
              className={`flex-1 rounded-xl px-3 font-black transition disabled:opacity-60 ${
                isRegister
                  ? 'py-2 text-sm'
                  : 'py-3 text-base'
              } ${
                activeTab ===
                'login'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
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
              disabled={
                isLoading
              }
              className={`flex-1 rounded-xl px-3 font-black transition disabled:opacity-60 ${
                isRegister
                  ? 'py-2 text-sm'
                  : 'py-3 text-base'
              } ${
                activeTab ===
                'register'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              ثبت‌نام
            </button>
          </div>




          {error && (
            <div
              role="alert"
              className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
            >
              {error}
            </div>
          )}





          {!isRegister ? (
            <form
              onSubmit={
                loginForm.handleSubmit(
                  handleLogin
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
                        clearError,
                    }
                  )}
                  type="text"
                  dir="ltr"
                  autoComplete="username"
                  disabled={
                    isLoginSubmitting
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

              {/* Password */}

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-black text-slate-800 sm:text-base"
                  >
                    رمز عبور
                  </label>

                  <Link
                    href={
                      forgotPasswordHref
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 transition hover:text-blue-800 sm:text-sm"
                  >
                    <KeyRound
                      size={15}
                    />

                    رمز عبور را فراموش کرده‌اید؟
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="login-password"
                    {...loginForm.register(
                      'password',
                      {
                        onChange:
                          clearError,
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
                      isLoginSubmitting
                    }
                    className={`${inputClassName} pr-14`}
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowLoginPassword(
                        (value) =>
                          !value
                      )
                    }
                    disabled={
                      isLoginSubmitting
                    }
                    className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 disabled:opacity-50"
                    aria-label={
                      showLoginPassword
                        ? 'مخفی کردن رمز عبور'
                        : 'نمایش رمز عبور'
                    }
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

              {/* Login Button */}

              <button
                type="submit"
                disabled={
                  isLoginSubmitting
                }
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 text-base font-black text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn
                  size={20}
                />

                {isLoginSubmitting
                  ? 'در حال ورود...'
                  : `ورود ${title}`}
              </button>
            </form>
          ) : (
            



            <form
              onSubmit={
                signupForm.handleSubmit(
                  handleSignup
                )
              }
              className="space-y-2.5 sm:space-y-3"
              noValidate
            >
              {/* Names */}

              <div className="grid grid-cols-2 gap-2.5">
                <div className="min-w-0">
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
                          clearError,
                      }
                    )}
                    type="text"
                    autoComplete="given-name"
                    disabled={
                      isSignupSubmitting
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

                <div className="min-w-0">
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
                          clearError,
                      }
                    )}
                    type="text"
                    autoComplete="family-name"
                    disabled={
                      isSignupSubmitting
                    }
                    className={
                      inputClassName
                    }
                    placeholder="نام خانوادگی"
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
                        clearError,
                    }
                  )}
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  disabled={
                    isSignupSubmitting
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
                        clearError,
                    }
                  )}
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  autoComplete="tel"
                  disabled={
                    isSignupSubmitting
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
                </label>

                <div className="relative">
                  <input
                    id="signup-password"
                    {...signupForm.register(
                      'password',
                      {
                        onChange:
                          clearError,
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
                      isSignupSubmitting
                    }
                    className={`${inputClassName} pr-14`}
                    placeholder="حداقل ۶ کاراکتر"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowSignupPassword(
                        (value) =>
                          !value
                      )
                    }
                    disabled={
                      isSignupSubmitting
                    }
                    className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 disabled:opacity-50"
                    aria-label={
                      showSignupPassword
                        ? 'مخفی کردن رمز عبور'
                        : 'نمایش رمز عبور'
                    }
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
                  isSignupSubmitting
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:rounded-2xl sm:text-base"
              >
                <UserPlus
                  size={20}
                />

                {isSignupSubmitting
                  ? 'در حال ثبت‌نام...'
                  : `ثبت‌نام ${title}`}
              </button>
            </form>
          )}




          <div
            className={`text-center font-semibold text-slate-700 ${
              isRegister
                ? 'mt-2 text-xs sm:text-sm'
                : 'mt-6 text-sm sm:text-base'
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
              disabled={
                isLoading
              }
              className="font-black text-blue-700 transition hover:text-blue-800 disabled:opacity-50"
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