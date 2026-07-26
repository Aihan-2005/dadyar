'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  FileText,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react'

import { FinanceStats } from '@/components/dashboard/finances/overview/FinanceStats'
import { FinancialSummary } from '@/components/dashboard/finances/overview/FinancialSummary'
import { OverviewTable } from '@/components/dashboard/finances/overview/OverviewTable'
import {
  FinanceEmptyState,
  FinanceErrorState,
  FinanceOverviewSkeleton,
  FinanceStaleDataNotice,
} from '@/components/dashboard/finances/overview/FinancePageStates'
import { buildFinanceOverview } from './../../../features/finance/domain/selectors'
import { useCasesStore } from '@/store/cases.store'

export default function FinancesPage() {
  const cases = useCasesStore((state) => state.cases)
  const isLoading = useCasesStore((state) => state.isLoading)
  const error = useCasesStore((state) => state.error)
  const fetchCases = useCasesStore((state) => state.fetchCases)
  const clearError = useCasesStore((state) => state.clearError)

  const [hasRequestedData, setHasRequestedData] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

  const overview = useMemo(() => buildFinanceOverview(cases), [cases])
  const hasData = overview.cases.length > 0

  const refreshData = useCallback(async () => {
    setHasRequestedData(true)
    clearError()

    await fetchCases()

    if (!useCasesStore.getState().error) {
      setLastUpdatedAt(new Date())
    }
  }, [clearError, fetchCases])

  useEffect(() => {
    void refreshData()
  }, [refreshData])

  const showInitialLoading =
    !hasData && (!hasRequestedData || isLoading)

  const updatedAtLabel = lastUpdatedAt
    ? lastUpdatedAt.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 md:p-8">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200/70">
              <TrendingUp
                className="text-white"
                size={24}
              />
            </div>

            <div>
              <h1 className="text-2xl font-black text-zinc-900">
                گزارش مالی
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                مدیریت قراردادها، وصولی‌ها، مطالبات و هزینه‌های
                پرونده‌ها
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void refreshData()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={isLoading ? 'animate-spin' : undefined}
              />

              {isLoading
                ? 'در حال بروزرسانی'
                : 'بروزرسانی اطلاعات'}
            </button>

            <Link
              href="/dashboard/finances/clients"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Users size={16} />
              حساب موکلین
            </Link>

            <Link
              href="/dashboard/cases?filter=overdue"
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <AlertCircle size={16} />
              مطالبات معوق
            </Link>
          </div>
        </header>

        <div className="flex min-h-5 items-center justify-end text-xs text-zinc-400">
          {updatedAtLabel && !isLoading
            ? `آخرین بروزرسانی: ${updatedAtLabel}`
            : isLoading && hasData
              ? 'در حال همگام‌سازی با سرور...'
              : null}
        </div>

        {error && hasData && (
          <FinanceStaleDataNotice
            message={error}
            isRetrying={isLoading}
            onRetry={() => void refreshData()}
          />
        )}

        {showInitialLoading ? (
          <FinanceOverviewSkeleton />
        ) : error && !hasData ? (
          <FinanceErrorState
            message={error}
            isRetrying={isLoading}
            onRetry={() => void refreshData()}
          />
        ) : !hasData ? (
          <FinanceEmptyState />
        ) : (
          <>
            <FinanceStats stats={overview.stats} />

            <FinancialSummary stats={overview.stats} />

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-zinc-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">
                      وضعیت مالی موکلین
                    </h2>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      جست‌وجو، فیلتر و اولویت‌بندی مطالبات هر موکل
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                  {overview.clients.length.toLocaleString('fa-IR')}{' '}
                  موکل
                </span>
              </div>

              <OverviewTable clients={overview.clients} />
            </section>
          </>
        )}
      </div>
    </div>
  )
}
