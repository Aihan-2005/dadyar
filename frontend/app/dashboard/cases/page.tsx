'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  useSearchParams,
} from 'next/navigation'

import {
  Filter,
  Plus,
  X,
} from 'lucide-react'

import {
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPageHeader'

import {
  useCasesStore,
} from '@/store/cases.store'

import {
  useSearchStore,
} from '@/store/search.store'

import type {
  Case,
} from '@/types/case'

function normalizeText(
  value:
    string | undefined
): string {
  return (
    value ??
    ''
  )
    .trim()
    .toLocaleLowerCase(
      'fa-IR'
    )
}

function getClientNames(
  caseItem:
    Case
): string[] {
  const names =
    (
      caseItem.clients ??
      []
    )
      .map(
        (client) =>
          client.name
            ?.trim()
      )
      .filter(
        (
          name
        ): name is string =>
          Boolean(name)
      )

  if (
    names.length >
    0
  ) {
    return names
  }

  return caseItem.clientName
    ? [
        caseItem.clientName,
      ]
    : []
}

function matchesClient(
  caseItem:
    Case,
  query:
    string
): boolean {
  const normalized =
    normalizeText(
      query
    )

  if (!normalized) {
    return true
  }

  return getClientNames(
    caseItem
  ).some(
    (name) =>
      normalizeText(
        name
      ).includes(
        normalized
      )
  )
}

function formatClients(
  caseItem:
    Case
): string {
  const names =
    getClientNames(
      caseItem
    )

  if (
    names.length ===
    0
  ) {
    return 'ثبت نشده'
  }

  if (
    names.length ===
    1
  ) {
    return names[0]
  }

  if (
    names.length ===
    2
  ) {
    return names.join(
      '، '
    )
  }

  return `${names
    .slice(0, 2)
    .join('، ')} و ${
    names.length - 2
  } موکل دیگر`
}

function getStatusBadge(
  status:
    string
) {
  const styles:
    Record<
      string,
      string
    > = {
      pending:
        'bg-amber-100 text-amber-800',

      'in-progress':
        'bg-blue-100 text-blue-800',

      in_progress:
        'bg-blue-100 text-blue-800',

      open:
        'bg-emerald-100 text-emerald-800',

      completed:
        'bg-green-100 text-green-800',

      closed:
        'bg-slate-200 text-slate-700',

      archived:
        'bg-slate-100 text-slate-700',
    }

  const labels:
    Record<
      string,
      string
    > = {
      pending:
        'در انتظار',

      'in-progress':
        'در حال انجام',

      in_progress:
        'در حال انجام',

      open:
        'باز',

      completed:
        'تکمیل شده',

      closed:
        'بسته شده',

      archived:
        'بایگانی شده',
    }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-black ${
        styles[status] ??
        'bg-slate-100 text-slate-700'
      }`}
    >
      {labels[status] ??
        status}
    </span>
  )
}

export default function CasesListPage() {
  const cases =
    useCasesStore(
      (state) =>
        state.cases
    )

  const searchParams =
    useSearchParams()

  const searchTerm =
    useSearchStore(
      (state) =>
        state.searchTerm
    )

  const setSearchTerm =
    useSearchStore(
      (state) =>
        state.setSearchTerm
    )

  const [
    showFilters,
    setShowFilters,
  ] =
    useState(false)

  const [
    filters,
    setFilters,
  ] =
    useState({
      title:
        '',

      clientName:
        '',

      fromDate:
        '',

      toDate:
        '',
    })

  useEffect(() => {
    setSearchTerm(
      searchParams.get(
        'search'
      ) ??
        ''
    )
  }, [
    searchParams,
    setSearchTerm,
  ])

  const filteredCases =
    useMemo(
      () => {
        const globalSearch =
          normalizeText(
            searchTerm
          )

        return cases.filter(
          (
            caseItem
          ) => {
            const matchesSearch =
              !globalSearch ||
              normalizeText(
                caseItem.title
              ).includes(
                globalSearch
              ) ||
              normalizeText(
                caseItem.caseNumber
              ).includes(
                globalSearch
              ) ||
              matchesClient(
                caseItem,
                globalSearch
              )

            const matchesTitle =
              !filters.title ||
              normalizeText(
                caseItem.title
              ).includes(
                normalizeText(
                  filters.title
                )
              )

            const matchesClientName =
              matchesClient(
                caseItem,
                filters.clientName
              )

            const createdAt =
              new Date(
                caseItem.createdAt
              )

            const matchesFrom =
              !filters.fromDate ||
              createdAt >=
                new Date(
                  filters.fromDate
                )

            const matchesTo =
              !filters.toDate ||
              createdAt <=
                new Date(
                  `${filters.toDate}T23:59:59.999`
                )

            return (
              matchesSearch &&
              matchesTitle &&
              matchesClientName &&
              matchesFrom &&
              matchesTo
            )
          }
        )
      },
      [
        cases,
        filters,
        searchTerm,
      ]
    )

  const clearFilters =
    () => {
      setFilters({
        title:
          '',

        clientName:
          '',

        fromDate:
          '',

        toDate:
          '',
      })
    }

  const hasFilters =
    Boolean(
      filters.title ||
        filters.clientName ||
        filters.fromDate ||
        filters.toDate
    )

  return (
    <div className="mx-auto max-w-7xl space-y-6">



      <DashboardPageHeader
        title="پرونده‌ها"
        description={`${filteredCases.length.toLocaleString(
          'fa-IR'
        )} پرونده از ${cases.length.toLocaleString(
          'fa-IR'
        )} پرونده`}
        actions={
          <div
            dir="rtl"
            className="flex w-full items-center gap-2 sm:w-auto"
          >

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (value) =>
                    !value
                )
              }
              className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-black transition sm:flex-none ${
                showFilters
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <Filter
                size={18}
              />

              فیلتر پیشرفته
            </button>

            <Link
              href="/dashboard/cases/new"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 sm:flex-none"
            >
              <Plus
                size={19}
              />

              پرونده جدید
            </Link>
          </div>
        }
      />


      {showFilters && (
        <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-950">
                فیلتر پرونده‌ها
              </h2>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                نتایج را براساس اطلاعات
                پرونده محدود کنید.
              </p>
            </div>

            <button
              type="button"
              onClick={
                clearFilters
              }
              disabled={
                !hasFilters
              }
              className="inline-flex items-center gap-1 text-sm font-black text-red-600 disabled:opacity-40"
            >
              <X
                size={16}
              />

              پاک کردن
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                عنوان پرونده
              </label>

              <input
                value={
                  filters.title
                }
                onChange={(
                  event
                ) =>
                  setFilters(
                    (
                      current
                    ) => ({
                      ...current,

                      title:
                        event.target
                          .value,
                    })
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="عنوان پرونده"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                نام موکل
              </label>

              <input
                value={
                  filters.clientName
                }
                onChange={(
                  event
                ) =>
                  setFilters(
                    (
                      current
                    ) => ({
                      ...current,

                      clientName:
                        event.target
                          .value,
                    })
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="نام موکل"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                از تاریخ
              </label>

              <input
                type="date"
                value={
                  filters.fromDate
                }
                onChange={(
                  event
                ) =>
                  setFilters(
                    (
                      current
                    ) => ({
                      ...current,

                      fromDate:
                        event.target
                          .value,
                    })
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                تا تاریخ
              </label>

              <input
                type="date"
                value={
                  filters.toDate
                }
                onChange={(
                  event
                ) =>
                  setFilters(
                    (
                      current
                    ) => ({
                      ...current,

                      toDate:
                        event.target
                          .value,
                    })
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700"
              />
            </div>
          </div>
        </section>
      )}




      {filteredCases.length ===
      0 ? (
        <div className="rounded-2xl border border-slate-300 bg-white py-14 text-center">
          <p className="font-bold text-slate-600">
            {cases.length ===
            0
              ? 'هنوز پرونده‌ای ثبت نشده است.'
              : 'پرونده‌ای مطابق فیلترها پیدا نشد.'}
          </p>

          {cases.length ===
          0 && (
            <Link
              href="/dashboard/cases/new"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
            >
              <Plus
                size={18}
              />

              ایجاد اولین پرونده
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCases.map(
            (
              caseItem
            ) => (
              <Link
                key={
                  caseItem.id
                }
                href={`/dashboard/cases/${caseItem.id}`}
                className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-black text-slate-950">
                        {
                          caseItem.title
                        }
                      </h2>

                      {getStatusBadge(
                        caseItem.status
                      )}
                    </div>

                    <p className="mt-3 font-semibold text-slate-700">
                      موکل:
                      {' '}
                      {formatClients(
                        caseItem
                      )}
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      شماره پرونده:
                      {' '}
                      {caseItem.caseNumber ||
                        'ثبت نشده'}
                    </p>

                    {caseItem.description && (
                      <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">
                        {
                          caseItem.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-sm font-medium text-slate-500">
                    <p>
                      ایجاد:
                      {' '}
                      {new Date(
                        caseItem.createdAt
                      ).toLocaleDateString(
                        'fa-IR'
                      )}
                    </p>

                    <p className="mt-1">
                      بروزرسانی:
                      {' '}
                      {new Date(
                        caseItem.updatedAt
                      ).toLocaleDateString(
                        'fa-IR'
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  )
}