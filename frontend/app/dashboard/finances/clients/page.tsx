'use client'

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  useSearchParams,
} from 'next/navigation'

import {
  AlertTriangle,
  ArrowRight,
  Users,
} from 'lucide-react'

import {
  ClientSearchBar,
} from '@/components/dashboard/finances/clients/ClientSearchBar'

import {
  ClientFinanceTable,
} from '@/components/dashboard/finances/clients/ClientFinanceTable'

import {
  ClientDetailTable,
} from '@/components/dashboard/finances/clients/ClientDetailTable'

import {
  buildClientFinanceSummaries,
} from '@/features/finance/domain/selectors'

import {
  useCasesStore,
} from '@/store/cases.store'

function normalizeSearchValue(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      'fa-IR'
    )
}

function ClientsPageContent() {
  const cases =
    useCasesStore(
      (state) =>
        state.cases
    )

  const hasHydrated =
    useCasesStore(
      (state) =>
        state.hasHydrated
    )

  const hasLoaded =
    useCasesStore(
      (state) =>
        state.hasLoaded
    )

  const fetchCases =
    useCasesStore(
      (state) =>
        state.fetchCases
    )

  const searchParams =
    useSearchParams()

  const [
    searchTerm,
    setSearchTerm,
  ] = useState(
    searchParams.get(
      'client'
    ) ?? ''
  )

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    void fetchCases()
  }, [
    fetchCases,
    hasHydrated,
  ])

  const clientSummaries =
    useMemo(
      () =>
        buildClientFinanceSummaries(
          cases
        ),
      [cases]
    )

  const normalizedSearch =
    normalizeSearchValue(
      searchTerm
    )

  const filteredClients =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return clientSummaries
      }

      return clientSummaries.filter(
        (client) =>
          normalizeSearchValue(
            client.clientName
          ).includes(
            normalizedSearch
          )
      )
    }, [
      clientSummaries,
      normalizedSearch,
    ])

  const selectedClient =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return null
      }

      const exactMatch =
        clientSummaries.find(
          (client) =>
            normalizeSearchValue(
              client.clientName
            ) ===
            normalizedSearch
        )

      if (exactMatch) {
        return exactMatch
      }

      return (
        clientSummaries.find(
          (client) =>
            normalizeSearchValue(
              client.clientName
            ).includes(
              normalizedSearch
            )
        ) ?? null
      )
    }, [
      clientSummaries,
      normalizedSearch,
    ])

  const estimatedCasesCount =
    clientSummaries.reduce(
      (sum, client) =>
        sum +
        client
          .estimatedAllocationCases,
      0
    )

  const isLoading =
    !hasHydrated ||
    (!hasLoaded &&
      cases.length === 0)

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 md:p-8">
        <header className="flex items-center gap-4">
          <Link
            href="/dashboard/finances"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white transition-colors hover:bg-zinc-50"
          >
            <ArrowRight
              size={18}
              className="text-zinc-600"
            />
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Users
                className="text-white"
                size={20}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                حساب موکلین
              </h1>

              <p className="text-sm text-zinc-500">
                مشاهده سهم حق‌الوکاله، پرداختی و بدهی مستقل هر موکل
              </p>
            </div>
          </div>
        </header>

        {estimatedCasesCount >
          0 && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-bold">
                برخی سهم‌ها تخمینی هستند
              </p>

              <p className="mt-1 leading-6">
                در{' '}
                {estimatedCasesCount.toLocaleString(
                  'fa-IR'
                )}{' '}
                مورد از پرونده‌های قدیمی، سهم موکل صریح ثبت نشده است و سیستم مبلغ را موقتاً به‌صورت مساوی تقسیم کرده است.
              </p>
            </div>
          </div>
        )}

        <ClientSearchBar
          value={searchTerm}
          onChange={
            setSearchTerm
          }
          totalCount={
            clientSummaries.length
          }
          filteredCount={
            filteredClients.length
          }
        />

        {isLoading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-sm text-zinc-500 shadow-sm">
            در حال آماده‌سازی حساب موکلین...
          </div>
        ) : selectedClient ? (
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-bold text-zinc-900">
                جزئیات مالی{' '}
                {
                  selectedClient.clientName
                }
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                سهم این موکل از هر پرونده به‌صورت مستقل نمایش داده می‌شود.
              </p>
            </div>

            <ClientDetailTable
              cases={
                selectedClient.cases
              }
            />
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-bold text-zinc-900">
                فهرست حساب موکلین
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                برای مشاهده جزئیات، روی ردیف هر موکل کلیک کنید.
              </p>
            </div>

            <ClientFinanceTable
              clients={
                filteredClients
              }
              onSelectClient={
                setSearchTerm
              }
            />
          </section>
        )}
      </div>
    </div>
  )
}

function ClientsPageFallback() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-zinc-200 bg-white p-12 text-center text-sm text-zinc-500 shadow-sm">
        در حال بارگذاری حساب موکلین...
      </div>
    </div>
  )
}

export default function ClientsPage() {
  return (
    <Suspense
      fallback={
        <ClientsPageFallback />
      }
    >
      <ClientsPageContent />
    </Suspense>
  )
}