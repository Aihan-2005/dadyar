'use client'

import {
  useEffect,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

import {
  useAuthStore,
} from '@/store/auth.store'

import AppLoadingScreen from '@/components/ui/AppLoadingScreen'

export default function AuthGuard({
  children,
}: {
  children:
    React.ReactNode
}) {
  const router =
    useRouter()

  const user =
    useAuthStore(
      (state) =>
        state.user
    )

  const hasHydrated =
    useAuthStore(
      (state) =>
        state.hasHydrated
    )

  const isInitialized =
    useAuthStore(
      (state) =>
        state.isInitialized
    )

  const isSessionChecking =
    useAuthStore(
      (state) =>
        state.isSessionChecking
    )

  const initialize =
    useAuthStore(
      (state) =>
        state.initialize
    )

  

  useEffect(() => {
    if (
      hasHydrated &&
      !isInitialized &&
      !isSessionChecking
    ) {
      void initialize()
    }
  }, [
    hasHydrated,
    initialize,
    isInitialized,
    isSessionChecking,
  ])

  

  useEffect(() => {
    if (
      hasHydrated &&
      isInitialized &&
      !user
    ) {
      router.replace(
        '/login'
      )
    }
  }, [
    hasHydrated,
    isInitialized,
    router,
    user,
  ])


  if (
    !hasHydrated ||
    !isInitialized ||
    isSessionChecking ||
    !user
  ) {
    return (
      <AppLoadingScreen
        title="در حال بررسی حساب شما..."
        description="در حال برقراری ارتباط امن و آماده‌سازی پنل دادیار"
      />
    )
  }

  return (
    <>
      {children}
    </>
  )
}
