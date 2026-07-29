'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAuthStore } from '@/store/auth.store'

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MOBILE_PATTERN =
  /^09\d{9}$/

function normalizeDigits(value: string): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩'

  return value
    .replace(/[۰-۹]/g, (digit) =>
      String(
        persianDigits.indexOf(digit),
      ),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String(
        arabicDigits.indexOf(digit),
      ),
    )
}

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(
      1,
      'ایمیل یا شماره همراه را وارد کنید',
    )
    .refine(
      (value) => {
        return (
          EMAIL_PATTERN.test(value) ||
          MOBILE_PATTERN.test(
            normalizeDigits(value),
          )
        )
      },
      'ایمیل یا شماره همراه معتبر نیست',
    ),

  password: z
    .string()
    .min(
      6,
      'رمز عبور باید حداقل ۶ کاراکتر باشد',
    ),
})

const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(
        2,
        'نام باید حداقل ۲ کاراکتر باشد',
      ),

    lastName: z
      .string()
      .trim()
      .min(
        2,
        'نام خانوادگی باید حداقل ۲ کاراکتر باشد',
      ),

    email: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === '' ||
          EMAIL_PATTERN.test(value),
        'ایمیل معتبر نیست',
      ),

    phone: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === '' ||
          MOBILE_PATTERN.test(
            normalizeDigits(value),
          ),
        'شماره همراه باید با 09 شروع شود و ۱۱ رقم باشد',
      ),

    password: z
      .string()
      .min(
        6,
        'رمز عبور باید حداقل ۶ کاراکتر باشد',
      ),
  })
  .superRefine((data, context) => {
    if (!data.email && !data.phone) {
      context.addIssue({
        code: 'custom',
        path: ['email'],
        message:
          'حداقل ایمیل یا شماره همراه را وارد کنید',
      })

      context.addIssue({
        code: 'custom',
        path: ['phone'],
        message:
          'حداقل ایمیل یا شماره همراه را وارد کنید',
      })
    }
  })

type LoginFormData =
  z.infer<typeof loginSchema>

type SignupFormData =
  z.infer<typeof signupSchema>

type AuthFormProps = {
  defaultTab?: 'login' | 'register'
  userType?: 'lawyer' | 'client'
}

const inputClassName =
  'h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60'

export default function AuthForm({
  defaultTab = 'login',
  userType = 'lawyer',
}: AuthFormProps) {
  const router = useRouter()

  const login = useAuthStore(
    (state) => state.login,
  )

  const signup = useAuthStore(
    (state) => state.signup,
  )

  const isLoading = useAuthStore(
    (state) => state.isLoading,
  )

  const error = useAuthStore(
    (state) => state.error,
  )

  const clearError = useAuthStore(
    (state) => state.clearError,
  )

  const [activeTab, setActiveTab] =
    useState<'login' | 'register'>(
      defaultTab,
    )

  const title = useMemo(
    () =>
      userType === 'lawyer'
        ? 'وکلا'
        : 'موکلین',
    [userType],
  )

  const loginForm =
    useForm<LoginFormData>({
      resolver:
        zodResolver(loginSchema),

      defaultValues: {
        identifier: '',
        password: '',
      },
    })

  const signupForm =
    useForm<SignupFormData>({
      resolver:
        zodResolver(signupSchema),

      defaultValues: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
      },
    })

  const changeTab = (
    tab: 'login' | 'register',
  ) => {
    clearError()
    setActiveTab(tab)
  }

  const handleLogin = async (
    data: LoginFormData,
  ) => {
    clearError()

    try {
      await login({
        identifier: data.identifier,
        password: data.password,
      })

      router.replace('/dashboard')
    } catch {
      // خطا از store نمایش داده می‌شود.
    }
  }

  const handleSignup = async (
    data: SignupFormData,
  ) => {
    clearError()

    try {
      await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,

        ...(data.email
          ? {
              email: data.email
                .trim()
                .toLowerCase(),
            }
          : {}),

        ...(data.phone
          ? {
              phone: normalizeDigits(
                data.phone,
              ).trim(),
            }
          : {}),
      })

      router.replace('/dashboard')
    } catch {
      // خطا از store نمایش داده می‌شود.
    }
  }

  const isLoginSubmitting =
    loginForm.formState.isSubmitting ||
    isLoading

  const isSignupSubmitting =
    signupForm.formState.isSubmitting ||
    isLoading

  return (
    <div
      dir="rtl"
      className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-[0_0_80px_-20px_rgba(59,130,246,0.25)] backdrop-blur-xl"
    >
      <div className="grid min-h-[680px] grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between border-l border-white/10 bg-gradient-to-br from-blue-600/20 via-indigo-500/10 to-purple-600/20 p-10 lg:flex">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute right-[-60px] top-[-80px] h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="absolute bottom-[-100px] left-[-70px] h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
          </div>

          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/15"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>

          <div className="relative z-10">
            <span className="mb-4 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1 text-xs text-blue-300">
              سامانه مدیریت هوشمند دادیار
            </span>

            <h1 className="mb-5 text-4xl font-black leading-tight text-white">
              {activeTab === 'login'
                ? `ورود ${title} به پنل دادیار`
                : `ثبت‌نام ${title} در دادیار`}
            </h1>

            <p className="max-w-md text-sm leading-7 text-zinc-300">
              با دادیار پرونده‌ها،
              قراردادها، امور مالی و
              یادآورها را در یک پنل
              یکپارچه مدیریت کن.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-4 text-sm text-zinc-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              ✓ مدیریت پرونده‌ها و
              موکلین
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              ✓ یادآوری جلسات و
              پیگیری‌ها
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              ✓ مدیریت مالی و
              قراردادها
            </div>
          </div>
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08]"
            >
              بازگشت
            </Link>
          </div>

          <div className="mb-8">
            <div className="mb-6 flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() =>
                  changeTab('login')
                }
                disabled={isLoading}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ورود
              </button>

              <button
                type="button"
                onClick={() =>
                  changeTab('register')
                }
                disabled={isLoading}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ثبت‌نام
              </button>
            </div>

            <p className="mt-2 text-sm text-zinc-400">
              {activeTab === 'login'
                ? 'با ایمیل یا شماره همراه وارد شوید.'
                : 'حداقل یکی از ایمیل یا شماره همراه الزامی است.'}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
            >
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form
              onSubmit={loginForm.handleSubmit(
                handleLogin,
              )}
              className="space-y-5"
              noValidate
            >
              <div>
                <label
                  htmlFor="login-identifier"
                  className="mb-2 block text-sm text-zinc-300"
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
                    },
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

                {loginForm.formState
                  .errors.identifier && (
                  <p className="mt-2 text-sm text-red-400">
                    {
                      loginForm
                        .formState.errors
                        .identifier
                        .message
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm text-zinc-300"
                >
                  رمز عبور
                </label>

                <input
                  id="login-password"
                  {...loginForm.register(
                    'password',
                    {
                      onChange:
                        clearError,
                    },
                  )}
                  type="password"
                  dir="ltr"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={
                    isLoginSubmitting
                  }
                  className={
                    inputClassName
                  }
                />

                {loginForm.formState
                  .errors.password && (
                  <p className="mt-2 text-sm text-red-400">
                    {
                      loginForm
                        .formState.errors
                        .password.message
                    }
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isLoginSubmitting
                }
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {isLoginSubmitting
                  ? 'در حال ورود...'
                  : `ورود ${title}`}
              </button>
            </form>
          ) : (
            <form
              onSubmit={signupForm.handleSubmit(
                handleSignup,
              )}
              className="space-y-5"
              noValidate
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="signup-first-name"
                    className="mb-2 block text-sm text-zinc-300"
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
                      },
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

                  {signupForm.formState
                    .errors.firstName && (
                    <p className="mt-2 text-sm text-red-400">
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

                <div>
                  <label
                    htmlFor="signup-last-name"
                    className="mb-2 block text-sm text-zinc-300"
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
                      },
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

                  {signupForm.formState
                    .errors.lastName && (
                    <p className="mt-2 text-sm text-red-400">
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

              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-2 block text-sm text-zinc-300"
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
                    },
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

                {signupForm.formState
                  .errors.email && (
                  <p className="mt-2 text-sm text-red-400">
                    {
                      signupForm
                        .formState.errors
                        .email.message
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="signup-phone"
                  className="mb-2 block text-sm text-zinc-300"
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
                    },
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

                {signupForm.formState
                  .errors.phone && (
                  <p className="mt-2 text-sm text-red-400">
                    {
                      signupForm
                        .formState.errors
                        .phone.message
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="mb-2 block text-sm text-zinc-300"
                >
                  رمز عبور
                </label>

                <input
                  id="signup-password"
                  {...signupForm.register(
                    'password',
                    {
                      onChange:
                        clearError,
                    },
                  )}
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder="حداقل ۶ کاراکتر"
                  disabled={
                    isSignupSubmitting
                  }
                  className={
                    inputClassName
                  }
                />

                {signupForm.formState
                  .errors.password && (
                  <p className="mt-2 text-sm text-red-400">
                    {
                      signupForm
                        .formState.errors
                        .password.message
                    }
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isSignupSubmitting
                }
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {isSignupSubmitting
                  ? 'در حال ثبت‌نام...'
                  : `ثبت‌نام ${title}`}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-zinc-500">
            {activeTab === 'login' ? (
              <>
                حساب کاربری نداری؟{' '}

                <button
                  type="button"
                  onClick={() =>
                    changeTab(
                      'register',
                    )
                  }
                  disabled={isLoading}
                  className="font-bold text-blue-400 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
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
                    changeTab('login')
                  }
                  disabled={isLoading}
                  className="font-bold text-blue-400 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  وارد شو
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}