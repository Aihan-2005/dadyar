'use client'

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

import {
  useAuthStore,
} from '@/store/auth.store'

import {
  useCasesStore,
} from '@/store/cases.store'

import {
  useClientStore,
} from '@/store/client.store'

import AppLoadingScreen from '@/components/ui/AppLoadingScreen'

interface DashboardDataBootstrapProps {
  children:
    ReactNode
}

export function DashboardDataBootstrap({
  children,
}: DashboardDataBootstrapProps) {


  const user =
    useAuthStore(
      (state) =>
        state.user
    )

 

  const fetchCases =
    useCasesStore(
      (state) =>
        state.fetchCases
    )

  const resetCases =
    useCasesStore(
      (state) =>
        state.resetCases
    )

  const casesError =
    useCasesStore(
      (state) =>
        state.error
    )

 

  const resetClients =
    useClientStore(
      (state) =>
        state.reset
    )

  

  const [
    readyUserId,
    setReadyUserId,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    isBootstrapping,
    setIsBootstrapping,
  ] =
    useState(
      false
    )

 
  useEffect(() => {
    const userId =
      user?.id

    if (!userId) {
      setReadyUserId(
        null
      )

      return
    }

    let cancelled =
      false

    resetCases()
    resetClients()

    setReadyUserId(
      null
    )

    setIsBootstrapping(
      true
    )

    const bootstrap =
      async () => {
        await fetchCases({
          force:
            true,
        })

        if (cancelled) {
          return
        }

        setReadyUserId(
          userId
        )

        setIsBootstrapping(
          false
        )
      }

    void bootstrap()

    return () => {
      cancelled =
        true
    }
  }, [
    user?.id,
    fetchCases,
    resetCases,
    resetClients,
  ])

  

  const handleRetry =
    useCallback(
      async () => {
        const userId =
          user?.id

        if (!userId) {
          return
        }

        setReadyUserId(
          null
        )

        setIsBootstrapping(
          true
        )

        await fetchCases({
          force:
            true,
        })

        setReadyUserId(
          userId
        )

        setIsBootstrapping(
          false
        )
      },
      [
        user?.id,
        fetchCases,
      ]
    )

  if (!user?.id) {
    return null
  }

  

  if (
    isBootstrapping ||
    readyUserId !==
      user.id
  ) {
    return (
      <AppLoadingScreen
        title="پنل شما در حال آماده‌سازی است..."
        description="پرونده‌ها و اطلاعات حساب شما از سرور دریافت می‌شوند"
      />
    )
  }

 

  if (casesError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-lg rounded-[28px] border-2 border-red-200 bg-white p-7 text-center shadow-xl shadow-slate-200/70">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle
              size={27}
              className="text-red-600"
            />
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-950">
            دریافت اطلاعات ناموفق بود
          </h2>

          <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
            {casesError}
          </p>

          <button
            type="button"
            onClick={() => {
              void handleRetry()
            }}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-700"
          >
            <RefreshCw
              size={18}
            />

            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
    </>
  )
}