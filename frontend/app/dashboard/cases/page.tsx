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
  useCasesStore,
} from '@/store/cases.store'

import {
  useSearchStore,
} from '@/store/search.store'

import type {
  Case,
} from '@/types/case'


function normalizeSearchText(
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

function getCaseClientNames(
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

  const legacyName =
    caseItem
      .clientName
      ?.trim()

  return legacyName
    ? [
        legacyName,
      ]
    : []
}

function matchesClientName(
  caseItem:
    Case,

  query:
    string
): boolean {
  const normalizedQuery =
    normalizeSearchText(
      query
    )

  if (!normalizedQuery) {
    return true
  }

  return getCaseClientNames(
    caseItem
  ).some(
    (name) =>
      normalizeSearchText(
        name
      ).includes(
        normalizedQuery
      )
  )
}

function formatCaseClients(
  caseItem:
    Case
): string {
  const names =
    getCaseClientNames(
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

  const visibleNames =
    names.slice(
      0,
      2
    )

  const remaining =
    names.length -
    visibleNames.length

  return remaining >
    0
    ? `${visibleNames.join(
        '، '
      )} و ${remaining.toLocaleString(
        'fa-IR'
      )} موکل دیگر`
    : visibleNames.join(
        '، '
      )
}

function isValidDate(
  value:
    string
): boolean {
  const timestamp =
    new Date(
      value
    ).getTime()

  return !Number.isNaN(
    timestamp
  )
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
        'bg-amber-100 text-amber-700',

      'in-progress':
        'bg-blue-100 text-blue-700',

      in_progress:
        'bg-blue-100 text-blue-700',

      open:
        'bg-emerald-100 text-emerald-700',

      completed:
        'bg-green-100 text-green-700',

      closed:
        'bg-zinc-200 text-zinc-700',

      archived:
        'bg-zinc-100 text-zinc-700',
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
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        styles[
          status
        ] ??
        'bg-zinc-100 text-zinc-700'
      }`}
    >
      {labels[
        status
      ] ??
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

  const {
    searchTerm,
    setSearchTerm,
  } =
    useSearchStore()

  useEffect(() => {
    const urlSearch =
      searchParams.get(
        'search'
      ) ??
      ''

    setSearchTerm(
      urlSearch
    )
  }, [
    searchParams,
    setSearchTerm,
  ])

 
  const [
    showFilters,
    setShowFilters,
  ] =
    useState(
      false
    )

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

  

  const filteredCases =
    useMemo(
      () => {
        const normalizedSearch =
          normalizeSearchText(
            searchTerm
          )

        const normalizedTitleFilter =
          normalizeSearchText(
            filters.title
          )

        return cases.filter(
          (
            caseItem
          ) => {
          

            const matchesSearch =
              !normalizedSearch ||
              normalizeSearchText(
                caseItem.title
              ).includes(
                normalizedSearch
              ) ||
              normalizeSearchText(
                caseItem.caseNumber
              ).includes(
                normalizedSearch
              ) ||
              matchesClientName(
                caseItem,
                normalizedSearch
              )

           
            const matchesTitle =
              !normalizedTitleFilter ||
              normalizeSearchText(
                caseItem.title
              ).includes(
                normalizedTitleFilter
              )

          

            const matchesClient =
              matchesClientName(
                caseItem,
                filters.clientName
              )

          
            const createdAt =
              new Date(
                caseItem.createdAt
              )

            const matchesFromDate =
              !filters.fromDate ||
              !isValidDate(
                filters.fromDate
              ) ||
              createdAt >=
                new Date(
                  filters.fromDate
                )

            const matchesToDate =
              !filters.toDate ||
              !isValidDate(
                filters.toDate
              ) ||
              createdAt <=
                new Date(
                  `${filters.toDate}T23:59:59.999`
                )

            return (
              matchesSearch &&
              matchesTitle &&
              matchesClient &&
              matchesFromDate &&
              matchesToDate
            )
          }
        )
      },
      [
        cases,
        searchTerm,
        filters,
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
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            پرونده‌ها
          </h1>

          <p className="mt-1 text-zinc-600">
            {filteredCases.length.toLocaleString(
              'fa-IR'
            )}{' '}
            پرونده از{' '}
            {cases.length.toLocaleString(
              'fa-IR'
            )}{' '}
            پرونده یافت شد

            {searchTerm && (
              <span>
                {' '}
                برای «
                {searchTerm}
                »
              </span>
            )}
          </p>
        </div>

        <Link
          href="/dashboard/cases/new"
          className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-800"
        >
          <Plus
            size={20}
          />

          <span>
            پرونده جدید
          </span>
        </Link>
      </div>


      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            setShowFilters(
              (
                current
              ) =>
                !current
            )
          }
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
            showFilters
              ? 'border-zinc-900 bg-zinc-900 text-white'
              : 'border-zinc-200 text-black hover:bg-slate-100'
          }`}
        >
          <Filter
            size={20}
          />

          <span>
            فیلتر پیشرفته
          </span>
        </button>
      </div>


      {showFilters && (
        <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900">
              فیلترها
            </h3>

            <button
              type="button"
              onClick={
                clearFilters
              }
              disabled={
                !hasFilters
              }
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X
                size={16}
              />

              پاک کردن همه
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                عنوان پرونده
              </label>

              <input
                type="text"
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
                placeholder="مثال: پرونده ملکی"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>


            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                نام موکل
              </label>

              <input
                type="text"
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
                placeholder="مثال: علی رضایی"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>


            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
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
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>


            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
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
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>


          {hasFilters && (
            <div className="flex flex-wrap gap-2 border-t pt-3">
              <span className="text-sm text-zinc-600">
                فیلترهای فعال:
              </span>

              {filters.title && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-sm text-blue-700">
                  عنوان:{' '}
                  {
                    filters.title
                  }

                  <button
                    type="button"
                    onClick={() =>
                      setFilters(
                        (
                          current
                        ) => ({
                          ...current,

                          title:
                            '',
                        })
                      )
                    }
                    className="hover:text-blue-900"
                  >
                    <X
                      size={14}
                    />
                  </button>
                </span>
              )}

              {filters.clientName && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-sm text-blue-700">
                  موکل:{' '}
                  {
                    filters.clientName
                  }

                  <button
                    type="button"
                    onClick={() =>
                      setFilters(
                        (
                          current
                        ) => ({
                          ...current,

                          clientName:
                            '',
                        })
                      )
                    }
                    className="hover:text-blue-900"
                  >
                    <X
                      size={14}
                    />
                  </button>
                </span>
              )}

              {filters.fromDate && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-sm text-blue-700">
                  از:{' '}
                  {new Date(
                    filters.fromDate
                  ).toLocaleDateString(
                    'fa-IR'
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setFilters(
                        (
                          current
                        ) => ({
                          ...current,

                          fromDate:
                            '',
                        })
                      )
                    }
                    className="hover:text-blue-900"
                  >
                    <X
                      size={14}
                    />
                  </button>
                </span>
              )}

              {filters.toDate && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-sm text-blue-700">
                  تا:{' '}
                  {new Date(
                    filters.toDate
                  ).toLocaleDateString(
                    'fa-IR'
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setFilters(
                        (
                          current
                        ) => ({
                          ...current,

                          toDate:
                            '',
                        })
                      )
                    }
                    className="hover:text-blue-900"
                  >
                    <X
                      size={14}
                    />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}


      {filteredCases.length ===
      0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white py-12 text-center">
          <p className="text-zinc-600">
            {cases.length ===
            0
              ? 'هیچ پرونده‌ای ثبت نشده است.'
              : 'پرونده‌ای با معیارهای انتخاب‌شده پیدا نشد.'}
          </p>

          {cases.length ===
          0 ? (
            <Link
              href="/dashboard/cases/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-800"
            >
              <Plus
                size={20}
              />

              <span>
                ایجاد اولین پرونده
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-800"
            >
              پاک کردن فیلترها
            </button>
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
                className="rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-900"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {
                          caseItem.title
                        }
                      </h3>

                      {getStatusBadge(
                        caseItem.status
                      )}
                    </div>

                    <p className="mb-2 text-zinc-600">
                      موکل:{' '}
                      {formatCaseClients(
                        caseItem
                      )}
                    </p>

                    <p className="text-sm text-zinc-500">
                      شماره پرونده:{' '}
                      {caseItem.caseNumber ||
                        'ثبت نشده'}
                    </p>

                    {caseItem.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                        {
                          caseItem.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right text-sm text-zinc-500 sm:text-left">
                    <p>
                      ایجاد:{' '}
                      {new Date(
                        caseItem.createdAt
                      ).toLocaleDateString(
                        'fa-IR'
                      )}
                    </p>

                    <p className="mt-1">
                      آخرین بروزرسانی:{' '}
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