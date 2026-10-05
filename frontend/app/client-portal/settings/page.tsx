'use client'

import {
  useEffect,
  useRef,
} from 'react'

import Link from 'next/link'

import { useRouter } from 'next/navigation'

import {
  ArrowRight,
  LogOut,
} from 'lucide-react'

import ChangePasswordForm from '@/components/settings/ChangePasswordForm'

import AppLoadingScreen from '@/components/ui/AppLoadingScreen'

import {
  clearClientPortalSession,
} from '@/features/client-portal/auth/client-session'

import { useAuthStore } from '@/store/auth.store'

export default function ClientSettingsPage() {
  const router = useRouter()

  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const isInitialized = useAuthStore((state) => state.isInitialized)
  const isSessionChecking = useAuthStore((state) => state.isSessionChecking)
  const initialize = useAuthStore((state) => state.initialize)

  const isLoggingOut = useRef(false)

  useEffect(() => {
    if (hasHydrated && !isInitialized && !isSessionChecking) {
      void initialize()
    }
  }, [hasHydrated, initialize, isInitialized, isSessionChecking])

  useEffect(() => {
    if (
      !hasHydrated ||
      !isInitialized ||
      isSessionChecking ||
      isLoggingOut.current
    ) {
      return
    }

    if (!user) {
      router.replace(
        '/client-login?returnTo=/client-portal/settings&mode=login',
      )

      return
    }

    if (user.role !== 'CLIENT') {
      router.replace('/dashboard/settings')
    }
  }, [hasHydrated, isInitialized, isSessionChecking, router, user])

  function handleLogout() {
    isLoggingOut.current = true

    clearClientPortalSession()

    router.replace('/client-portal')
  }

  if (
    !hasHydrated ||
    !isInitialized ||
    isSessionChecking ||
    !user ||
    user.role !== 'CLIENT'
  ) {
    return (
      <AppLoadingScreen
        title="در حال بررسی حساب شما..."
        description="لطفاً چند لحظه صبر کنید"
      />
    )
  }

  return (
    <main
      dir="rtl"
      className="min-h-dvh bg-slate-100 text-slate-950"
    >
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <Link
            href="/client-portal"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 font-black text-white shadow-md shadow-emerald-200">
              د
            </div>

            <div>
              <p className="font-black">دادیار</p>

              <p className="text-xs font-semibold text-slate-500">
                خدمات موکلین
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/client-portal"
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowRight size={16} />

              <span className="hidden sm:inline">
                بازگشت به پورتال
              </span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              aria-label="خروج"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-xl font-black">تنظیمات</h1>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            حساب کاربری و امنیت ورود خود را مدیریت کنید.
          </p>
        </div>

        <ChangePasswordForm />
      </div>
    </main>
  )
}