


'use client'

import {
  CalendarRange,
  Check,
  FolderOpen,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react'

import type {
  ClientFinanceSummary,
  FinanceCaseSource,
} from '@/features/finance/domain/types'

import {
  countFinanceActiveFilters,
  DEFAULT_FINANCE_REPORT_FILTERS,
  getFinanceClientKey,
  type FinanceReportFilters,
} from '@/features/finance/domain/filters'

interface FinanceReportFiltersProps {
  filters:
    FinanceReportFilters

  onChange: (
    filters:
      FinanceReportFilters
  ) => void

  cases:
    FinanceCaseSource[]

  clients:
    ClientFinanceSummary[]

  resultCount: number
}

export function FinanceReportFilters({
  filters,
  onChange,
  cases,
  clients,
  resultCount,
}: FinanceReportFiltersProps) {
  const activeFilterCount =
    countFinanceActiveFilters(
      filters
    )

  const update = <
    K extends keyof FinanceReportFilters,
  >(
    key: K,
    value:
      FinanceReportFilters[K]
  ) => {
    onChange({
      ...filters,
      [key]: value,
    })
  }

  const toggleCase = (
    caseId: string
  ) => {
    const selected =
      new Set(
        filters.selectedCaseIds
      )

    if (
      selected.has(caseId)
    ) {
      selected.delete(caseId)
    } else {
      selected.add(caseId)
    }

    update(
      'selectedCaseIds',
      [...selected]
    )
  }

  const toggleClient = (
    client:
      ClientFinanceSummary
  ) => {
    const key =
      getFinanceClientKey(
        client
      )

    const selected =
      new Set(
        filters.selectedClientKeys
      )

    if (
      selected.has(key)
    ) {
      selected.delete(key)
    } else {
      selected.add(key)
    }

    update(
      'selectedClientKeys',
      [...selected]
    )
  }

  const reset = () => {
    onChange({
      ...DEFAULT_FINANCE_REPORT_FILTERS,
    })
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <SlidersHorizontal
              size={19}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-black text-zinc-900">
                فیلتر گزارش مالی
              </h2>

              {activeFilterCount >
                0 && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                  {activeFilterCount.toLocaleString(
                    'fa-IR'
                  )}{' '}
                  فیلتر فعال
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-zinc-500">
              {resultCount.toLocaleString(
                'fa-IR'
              )}{' '}
              پرونده در گزارش فعلی
            </p>
          </div>
        </div>

        {activeFilterCount >
          0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
          >
            <RotateCcw
              size={14}
            />
            پاک‌کردن فیلترها
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <div className="relative xl:col-span-2">
          <Search
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            value={
              filters.query
            }
            onChange={(
              event
            ) =>
              update(
                'query',
                event
                  .target
                  .value
              )
            }
            placeholder="جست‌وجوی موکل، عنوان یا شماره پرونده..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />

          {filters.query && (
            <button
              type="button"
              aria-label="پاک‌کردن جست‌وجو"
              onClick={() =>
                update(
                  'query',
                  ''
                )
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X
                size={16}
              />
            </button>
          )}
        </div>

        <select
          value={
            filters.periodPreset
          }
          onChange={(
            event
          ) =>
            update(
              'periodPreset',
              event
                .target
                .value as FinanceReportFilters['periodPreset']
            )
          }
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
        >
          <option value="all">
            همه زمان‌ها
          </option>

          <option value="this-month">
            پرونده‌های این ماه
          </option>

          <option value="last-month">
            پرونده‌های ماه قبل
          </option>

          <option value="last-90-days">
            ۹۰ روز اخیر
          </option>

          <option value="this-year">
            سال جاری
          </option>

          <option value="custom">
            بازه سفارشی
          </option>
        </select>

        <select
          value={
            filters.paymentStatus
          }
          onChange={(
            event
          ) =>
            update(
              'paymentStatus',
              event
                .target
                .value as FinanceReportFilters['paymentStatus']
            )
          }
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
        >
          <option value="all">
            همه وضعیت‌های مالی
          </option>

          <option value="overdue">
            فقط معوق
          </option>

          <option value="partial">
            پرداخت جزئی
          </option>

          <option value="unpaid">
            بدون پرداخت
          </option>

          <option value="paid">
            تسویه‌شده
          </option>
        </select>
      </div>

      {filters.periodPreset ===
        'custom' && (
        <div className="mt-3 grid gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 sm:grid-cols-2">
          <DateInput
            label="از تاریخ"
            value={
              filters.fromDate ??
              ''
            }
            onChange={(
              value
            ) =>
              update(
                'fromDate',
                value
              )
            }
          />

          <DateInput
            label="تا تاریخ"
            value={
              filters.toDate ??
              ''
            }
            onChange={(
              value
            ) =>
              update(
                'toDate',
                value
              )
            }
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <SelectionDetails
          icon={
            FolderOpen
          }
          title="انتخاب پرونده‌ها"
          selectedCount={
            filters
              .selectedCaseIds
              .length
          }
        >
          <div className="max-h-72 divide-y divide-zinc-100 overflow-y-auto">
            {cases.map(
              (
                caseItem
              ) => {
                const checked =
                  filters.selectedCaseIds.includes(
                    caseItem.id
                  )

                return (
                  <button
                    key={
                      caseItem.id
                    }
                    type="button"
                    onClick={() =>
                      toggleCase(
                        caseItem.id
                      )
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right transition hover:bg-zinc-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-zinc-800">
                        {caseItem.title?.trim() ||
                          'پرونده بدون عنوان'}
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        {caseItem.caseNumber?.trim() ||
                          'بدون شماره'}
                      </p>
                    </div>

                    <CheckBox
                      checked={
                        checked
                      }
                    />
                  </button>
                )
              }
            )}
          </div>

          {filters
            .selectedCaseIds
            .length >
            0 && (
            <SelectionFooter
              label="لغو انتخاب پرونده‌ها"
              onClick={() =>
                update(
                  'selectedCaseIds',
                  []
                )
              }
            />
          )}
        </SelectionDetails>

        <SelectionDetails
          icon={Users}
          title="انتخاب موکلین"
          selectedCount={
            filters
              .selectedClientKeys
              .length
          }
        >
          <div className="max-h-72 divide-y divide-zinc-100 overflow-y-auto">
            {clients.map(
              (
                client
              ) => {
                const key =
                  getFinanceClientKey(
                    client
                  )

                const checked =
                  filters.selectedClientKeys.includes(
                    key
                  )

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      toggleClient(
                        client
                      )
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right transition hover:bg-zinc-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-zinc-800">
                        {client.clientName}
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        {client.totalContracts.toLocaleString(
                          'fa-IR'
                        )}{' '}
                        پرونده
                      </p>
                    </div>

                    <CheckBox
                      checked={
                        checked
                      }
                    />
                  </button>
                )
              }
            )}
          </div>

          {filters
            .selectedClientKeys
            .length >
            0 && (
            <SelectionFooter
              label="لغو انتخاب موکلین"
              onClick={() =>
                update(
                  'selectedClientKeys',
                  []
                )
              }
            />
          )}
        </SelectionDetails>
      </div>

      <p className="mt-3 flex items-center gap-2 text-[11px] leading-5 text-zinc-400">
        <CalendarRange
          size={13}
          className="shrink-0"
        />

        فیلتر زمانی، پرونده‌ها را براساس تاریخ ثبت پرونده محدود می‌کند؛ نمودار جریان نقدی داخل همان مجموعه، براساس تاریخ واقعی پرداخت و هزینه ساخته می‌شود.
      </p>
    </section>
  )
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string

  value: string

  onChange: (
    value: string
  ) => void
}) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-bold text-zinc-600">
        {label}
      </span>

      <input
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event
              .target
              .value
          )
        }
        placeholder="1405/05/01"
        dir="ltr"
        className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </label>
  )
}

function SelectionDetails({
  icon: Icon,
  title,
  selectedCount,
  children,
}: {
  icon:
    typeof Users

  title: string

  selectedCount:
    number

  children:
    React.ReactNode
}) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
        <Icon
          size={15}
        />

        {title}

        {selectedCount >
          0 && (
          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] text-white">
            {selectedCount.toLocaleString(
              'fa-IR'
            )}
          </span>
        )}
      </summary>

      <div className="absolute right-0 z-30 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        {children}
      </div>
    </details>
  )
}

function CheckBox({
  checked,
}: {
  checked: boolean
}) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
        checked
          ? 'border-indigo-600 bg-indigo-600 text-white'
          : 'border-zinc-300 bg-white text-transparent'
      }`}
    >
      <Check
        size={14}
      />
    </span>
  )
}

function SelectionFooter({
  label,
  onClick,
}: {
  label: string

  onClick:
    () => void
}) {
  return (
    <div className="border-t border-zinc-100 bg-zinc-50 p-3">
      <button
        type="button"
        onClick={
          onClick
        }
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 transition hover:bg-zinc-100"
      >
        {label}
      </button>
    </div>
  )
}