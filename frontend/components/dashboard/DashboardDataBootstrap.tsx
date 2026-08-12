'use client'

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  AlertCircle,
  Loader2,
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2
            size={28}
            className="animate-spin text-zinc-700"
          />

          <div>
            <p className="text-sm font-medium text-zinc-800">
              در حال دریافت اطلاعات از سرور...
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              پرونده‌های حساب شما از پایگاه داده دریافت می‌شوند.
            </p>
          </div>
        </div>
      </div>
    )
  }

 

  if (casesError) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center">
        <div className="w-full rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertCircle
              size={24}
              className="text-red-600"
            />
          </div>

          <h2 className="mt-4 text-lg font-bold text-zinc-900">
            دریافت اطلاعات Dashboard ناموفق بود
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {casesError}
          </p>

          <button
            type="button"
            onClick={() => {
              void handleRetry()
            }}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <RefreshCw
              size={17}
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