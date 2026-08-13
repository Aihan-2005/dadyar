'use client'

import {
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  useRouter,
} from 'next/navigation'

import {
  Eye,
  EyeOff,
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

            'شماره همراه باید با 09 شروع شود و ۱۱ رقم باشد'
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
              ['email'],

            message:
              'حداقل ایمیل یا شماره همراه را وارد کنید',
          })

          context.addIssue({
            code:
              'custom',

            path:
              ['phone'],

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

type AuthFormProps = {
  defaultTab?:
    | 'login'
    | 'register'

  userType?:
    | 'lawyer'
    | 'client'
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const inputClassName =
  'h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:font-medium placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 sm:h-14 sm:rounded-2xl sm:px-5 sm:text-base'

const labelClassName =
  'mb-1.5 block text-sm font-bold text-slate-800 sm:mb-2 sm:text-base'

const errorClassName =
  'mt-1 text-xs font-bold text-red-600 sm:mt-1.5 sm:text-sm'

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function AuthForm({
  defaultTab =
    'login',

  userType =
    'lawyer',
}: AuthFormProps) {
  const router =
    useRouter()

  /*
  |--------------------------------------------------------------------------
  | Auth Store
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

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

  const title =
    useMemo(
      () =>
        userType ===
        'lawyer'
          ? 'وکلا'
          : 'موکلین',
      [
        userType,
      ]
    )

  /*
  |--------------------------------------------------------------------------
  | Forms
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Tab
  |--------------------------------------------------------------------------
  */

  const changeTab =
    (
      tab:
        | 'login'
        | 'register'
    ) => {
      clearError()

      setActiveTab(
        tab
      )
    }

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

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

        router.replace(
          '/dashboard'
        )
      } catch {
        // Error is handled by store.
      }
    }

  /*
  |--------------------------------------------------------------------------
  | Register
  |--------------------------------------------------------------------------
  */

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

        router.replace(
          '/dashboard'
        )
      } catch {
        // Error is handled by store.
      }
    }

  const isLoginSubmitting =
    loginForm.formState
      .isSubmitting ||
    isLoading

  const isSignupSubmitting =
    signupForm.formState
      .isSubmitting ||
    isLoading

  const isRegister =
    activeTab ===
    'register'

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      dir="rtl"
      className="relative mx-auto h-full max-h-[760px] w-full max-w-6xl overflow-hidden rounded-[26px] border-2 border-slate-300 bg-white shadow-2xl shadow-slate-300/50 sm:rounded-[32px]"
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-2">
        {/* -----------------------------------------------------------
         * Brand Side
         * --------------------------------------------------------- */}

        <aside className="relative hidden overflow-hidden border-l border-slate-300 bg-gradient-to-br from-blue-100 via-slate-50 to-emerald-50 p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
          </div>

          <div className="relative z-10">
            <Link
              href="/launch"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
            >
              بازگشت به صفحه ورود
            </Link>
          </div>

          <div className="relative z-10">
            <span className="inline-flex rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-black text-blue-800">
              سامانه مدیریت هوشمند دادیار
            </span>

            <h1 className="mt-5 text-4xl font-black leading-[1.4] text-slate-950 xl:text-5xl">
              {isRegister
                ? `ساخت حساب ${title}`
                : `ورود ${title} به دادیار`}
            </h1>

            <p className="mt-4 max-w-md text-base font-semibold leading-8 text-slate-700">
              پرونده‌ها، موکلین،
              قراردادها و گزارش‌های مالی
              دفترتان را در یک محیط ساده،
              امن و یکپارچه مدیریت کنید.
            </p>
          </div>

          <div className="relative z-10 grid gap-2.5">
            {[
              'مدیریت پرونده‌ها و موکلین',
              'پیگیری اطلاعات و روند پرونده',
              'مدیریت و گزارش امور مالی',
            ].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm xl:text-base"
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

        {/* -----------------------------------------------------------
         * Form Side
         * --------------------------------------------------------- */}

        <section
          className={`relative flex h-full flex-col justify-center overflow-hidden ${
            isRegister
              ? 'p-3 sm:p-5 lg:p-6 xl:p-7'
              : 'p-5 sm:p-8 lg:p-10'
          }`}
        >
          {/* Mobile Header */}

          <div
            className={`flex items-center justify-between lg:hidden ${
              isRegister
                ? 'mb-2'
                : 'mb-5'
            }`}
          >
            <Link
              href="/launch"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 sm:text-sm"
            >
              بازگشت
            </Link>

            <span className="text-lg font-black text-slate-950 sm:text-xl">
              دادیار
            </span>
          </div>

          {/* Heading */}

          <div
            className={
              isRegister
                ? 'mb-3'
                : 'mb-6'
            }
          >
            <div
              className={`items-center justify-center rounded-2xl bg-blue-100 text-blue-700 ${
                isRegister
                  ? 'mb-2 hidden h-10 w-10 sm:flex'
                  : 'mb-3 flex h-12 w-12'
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
                  ? 'text-xl sm:text-2xl'
                  : 'text-2xl sm:text-3xl'
              }`}
            >
              {isRegister
                ? `ثبت‌نام ${title}`
                : `ورود ${title}`}
            </h2>

            <p
              className={`font-medium text-slate-700 ${
                isRegister
                  ? 'mt-1 text-xs leading-5 sm:text-sm'
                  : 'mt-2 text-sm leading-6 sm:text-base'
              }`}
            >
              {isRegister
                ? 'اطلاعات زیر را برای ساخت حساب تکمیل کنید.'
                : 'ایمیل یا شماره همراه و رمز عبور خود را وارد کنید.'}
            </p>
          </div>

          {/* Tabs */}

          <div
            className={`flex rounded-2xl border border-slate-300 bg-slate-100 p-1 ${
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
              className={`flex-1 rounded-xl px-3 font-black transition ${
                isRegister
                  ? 'py-2 text-sm'
                  : 'py-3 text-base'
              } ${
                activeTab ===
                'login'
                  ? 'bg-white text-blue-700 shadow-md ring-1 ring-slate-300'
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
              className={`flex-1 rounded-xl px-3 font-black transition ${
                isRegister
                  ? 'py-2 text-sm'
                  : 'py-3 text-base'
              } ${
                activeTab ===
                'register'
                  ? 'bg-white text-blue-700 shadow-md ring-1 ring-slate-300'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              ثبت‌نام
            </button>
          </div>

          {/* Error */}

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className={`rounded-xl border-2 border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700 ${
                isRegister
                  ? 'mb-2 py-2'
                  : 'mb-5 py-3'
              }`}
            >
              {error}
            </div>
          )}

          {/* ---------------------------------------------------------
           * Login Form
           * ------------------------------------------------------- */}

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
                  placeholder="example@gmail.com یا 09123456789"
                  disabled={
                    isLoginSubmitting
                  }
                  className={
                    inputClassName
                  }
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
                    placeholder="••••••••"
                    disabled={
                      isLoginSubmitting
                    }
                    className={`${inputClassName} pl-14`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowLoginPassword(
                        (current) =>
                          !current
                      )
                    }
                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 sm:left-3 sm:h-10 sm:w-10"
                    aria-label={
                      showLoginPassword
                        ? 'مخفی کردن رمز عبور'
                        : 'نمایش رمز عبور'
                    }
                  >
                    {showLoginPassword ? (
                      <EyeOff
                        size={21}
                      />
                    ) : (
                      <Eye
                        size={21}
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
                  isLoginSubmitting
                }
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 text-base font-black text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-16"
              >
                <LogIn
                  size={21}
                />

                {isLoginSubmitting
                  ? 'در حال ورود...'
                  : `ورود ${title}`}
              </button>
            </form>
          ) : (
            /*
            |--------------------------------------------------------------------------
            | Signup Form
            |--------------------------------------------------------------------------
            */

            <form
              onSubmit={
                signupForm.handleSubmit(
                  handleSignup
                )
              }
              className="space-y-2.5 sm:space-y-3"
              noValidate
            >
              {/* Name */}

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
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
                    placeholder="نام"
                    disabled={
                      isSignupSubmitting
                    }
                    className={
                      inputClassName
                    }
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
                    placeholder="نام خانوادگی"
                    disabled={
                      isSignupSubmitting
                    }
                    className={
                      inputClassName
                    }
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
                  placeholder="example@gmail.com"
                  disabled={
                    isSignupSubmitting
                  }
                  className={
                    inputClassName
                  }
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
                  placeholder="09123456789"
                  disabled={
                    isSignupSubmitting
                  }
                  className={
                    inputClassName
                  }
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
                    placeholder="حداقل ۶ کاراکتر"
                    disabled={
                      isSignupSubmitting
                    }
                    className={`${inputClassName} pl-14`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowSignupPassword(
                        (current) =>
                          !current
                      )
                    }
                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 sm:left-3 sm:h-10 sm:w-10"
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
            className={`text-center font-medium text-slate-700 ${
              isRegister
                ? 'mt-2 text-xs sm:text-sm'
                : 'mt-6 text-sm sm:text-base'
            }`}
          >
            {!isRegister ? (
              <>
                حساب کاربری نداری؟{' '}

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
                  className="font-black text-blue-700 transition hover:text-blue-800"
                >
                  ثبت‌نام کن
                </button>
              </>
            ) : (
              <>
                قبلاً حساب ساخته‌ای؟{' '}

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
                  className="font-black text-blue-700 transition hover:text-blue-800"
                >
                  وارد شو
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}