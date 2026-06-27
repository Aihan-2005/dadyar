'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
})

const registerSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  phone: z
    .string()
    .min(11, 'شماره همراه معتبر نیست')
    .max(11, 'شماره همراه معتبر نیست')
    .regex(/^09\d{9}$/, 'شماره همراه باید با 09 شروع شود'),
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

type AuthFormProps = {
  defaultTab?: 'login' | 'register'
  userType?: 'lawyer' | 'client'
}

export default function AuthForm({
  defaultTab = 'login',
  userType = 'lawyer',
}: AuthFormProps) {
  const router = useRouter()

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  // const login = useAuthStore((s) => s.login)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)

  const title = useMemo(() => {
    return userType === 'lawyer' ? 'وکلا' : 'موکلین'
  }, [userType])

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

// const handleLogin = async (data: LoginFormData) => {
//   await new Promise((r) => setTimeout(r, 800))

//   useAuthStore.setState({
//     user: {
//       id: '1',
//       firstName: title === 'وکلا' ? 'وکیل' : 'موکل',
//       lastName: 'دادیار',
//       email: data.email,
//       role: userType,
//     },
//     token: 'mock-token',
//     error: null,
//     isLoading: false,
//   })

//   router.push('/dashboard')
// }
const handleLogin = async (data: LoginFormData) => {
  try {
        await login(data) 
    router.push('/dashboard')
  } catch (error) {
        console.error("Login failed", error)
  }
}


// const handleRegister = async (data: RegisterFormData) => {
//   await new Promise((r) => setTimeout(r, 800))

//   useAuthStore.setState({
//     user: {
//       id: crypto.randomUUID(),
//       firstName: data.firstName,
//       lastName: data.lastName,
//       email: data.email,
//       phone: data.phone,
//       role: userType,
//     },
//     token: 'mock-token',
//     error: null,
//     isLoading: false,
//   })

//   router.push('/dashboard')
// }
const handleRegister = async (data: RegisterFormData) => {
  try {
        await register({ ...data, role: userType })
    router.push('/dashboard')
  } catch (error) {
    console.error("Register failed", error)
  }
}



  return (
    <div
      dir="rtl"
      className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-[0_0_80px_-20px_rgba(59,130,246,0.25)] backdrop-blur-xl"
    >
      <div className="grid min-h-[680px] grid-cols-1 lg:grid-cols-2">
        {/* Right Side / Intro */}
        <div className="relative hidden lg:flex flex-col justify-between border-l border-white/10 bg-gradient-to-br from-blue-600/20 via-indigo-500/10 to-purple-600/20 p-10">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[-80px] right-[-60px] h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
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
              با دادیار پرونده‌ها، قراردادها، امور مالی و یادآورها را در یک پنل
              یکپارچه و مدرن مدیریت کن.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-4 text-sm text-zinc-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              ✓ مدیریت پرونده‌ها و موکلین
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              ✓ یادآوری هوشمند جلسات و پیگیری‌ها
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              ✓ مدیریت مالی و قراردادهای مرحله‌ای
            </div>
          </div>
        </div>

        {/* Left Side / Form */}
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
                onClick={() => setActiveTab('login')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ورود
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
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
                ? `برای ورود ${title}، اطلاعات حساب خود را وارد کنید.`
                : `برای شروع، اطلاعات اولیه خود را کامل کنید.`}
            </p>
          </div>

          {activeTab === 'login' ? (
            <form
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  ایمیل
                </label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  placeholder="example@gmail.com"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/[0.06]"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-2 text-sm text-red-400">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  رمز عبور
                </label>
                <input
                  {...loginForm.register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/[0.06]"
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-2 text-sm text-red-400">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginForm.formState.isSubmitting
                  ? 'در حال ورود...'
                  : `ورود ${title}`}
              </button>
            </form>
          ) : (
            <form
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    نام
                  </label>
                  <input
                    {...registerForm.register('firstName')}
                    type="text"
                    placeholder="نام"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/[0.06]"
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="mt-2 text-sm text-red-400">
                      {registerForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-300">
                    نام خانوادگی
                  </label>
                  <input
                    {...registerForm.register('lastName')}
                    type="text"
                    placeholder="نام خانوادگی"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/[0.06]"
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="mt-2 text-sm text-red-400">
                      {registerForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  شماره همراه
                </label>
                <input
                  {...registerForm.register('phone')}
                  type="text"
                  dir="ltr"
                  placeholder="09123456789"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/[0.06]"
                />
                {registerForm.formState.errors.phone && (
                  <p className="mt-2 text-sm text-red-400">
                    {registerForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  ایمیل
                </label>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  placeholder="example@gmail.com"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/[0.06]"
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-2 text-sm text-red-400">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  رمز عبور
                </label>
                <input
                  {...registerForm.register('password')}
                  type="password"
                  placeholder="حداقل ۶ کاراکتر"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/[0.06]"
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-2 text-sm text-red-400">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registerForm.formState.isSubmitting
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
                  onClick={() => setActiveTab('register')}
                  className="font-bold text-blue-400 hover:text-blue-300"
                >
                  ثبت‌نام کن
                </button>
              </>
            ) : (
              <>
                قبلاً حساب ساخته‌ای؟{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="font-bold text-blue-400 hover:text-blue-300"
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
