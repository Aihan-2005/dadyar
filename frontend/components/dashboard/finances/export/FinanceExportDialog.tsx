

'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  AlertCircle,
  Check,
  FileSpreadsheet,
  FileText,
  Files,
  Search,
  Users,
  X,
} from 'lucide-react'

import type {
  ClientFinanceSummary,
  FinanceCaseSource,
} from '@/features/finance/domain/types'

import {
  buildFinanceExportReport,
  getFinanceClientKey,
} from '@/features/finance/export/report-data'

import type {
  FinanceExportFormat,
  FinanceExportScope,
} from '@/features/finance/export/types'

interface FinanceExportDialogProps {
  open: boolean

  onClose: () => void

  cases: FinanceCaseSource[]

  clients: ClientFinanceSummary[]
}

function normalizeSearch(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      'fa-IR'
    )
}

export function FinanceExportDialog({
  open,
  onClose,
  cases,
  clients,
}: FinanceExportDialogProps) {
  const [
    scope,
    setScope,
  ] = useState<FinanceExportScope>(
    'all-cases'
  )

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    selectedKeys,
    setSelectedKeys,
  ] = useState<
    Set<string>
  >(
    () =>
      new Set()
  )

  const [
    exporting,
    setExporting,
  ] = useState<
    FinanceExportFormat | null
  >(null)

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setError(null)
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.key ===
          'Escape' &&
          !exporting
        ) {
          onClose()
        }
      }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [
    exporting,
    onClose,
    open,
  ])

  const normalizedSearch =
    normalizeSearch(
      search
    )

  const visibleClients =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return clients
      }

      return clients.filter(
        (client) =>
          normalizeSearch(
            client.clientName
          ).includes(
            normalizedSearch
          )
      )
    }, [
      clients,
      normalizedSearch,
    ])

  const selectedCount =
    selectedKeys.size

  const canExport =
    scope !==
      'selected-clients' ||
    selectedCount > 0

  const setExportScope =
    (
      value:
        FinanceExportScope
    ) => {
      setScope(value)
      setError(null)
    }

  const toggleClient =
    (
      client:
        ClientFinanceSummary
    ) => {
      const key =
        getFinanceClientKey(
          client
        )

      setSelectedKeys(
        (current) => {
          const next =
            new Set(
              current
            )

          if (
            next.has(key)
          ) {
            next.delete(
              key
            )
          } else {
            next.add(
              key
            )
          }

          return next
        }
      )

      setError(null)
    }

  const allVisibleSelected =
    visibleClients.length >
      0 &&
    visibleClients.every(
      (client) =>
        selectedKeys.has(
          getFinanceClientKey(
            client
          )
        )
    )

  const toggleVisibleClients =
    () => {
      setSelectedKeys(
        (current) => {
          const next =
            new Set(
              current
            )

          if (
            allVisibleSelected
          ) {
            for (
              const client of
              visibleClients
            ) {
              next.delete(
                getFinanceClientKey(
                  client
                )
              )
            }
          } else {
            for (
              const client of
              visibleClients
            ) {
              next.add(
                getFinanceClientKey(
                  client
                )
              )
            }
          }

          return next
        }
      )
    }

  const handleExport =
    async (
      format:
        FinanceExportFormat
    ) => {
      if (!canExport) {
        setError(
          'حداقل یک موکل را انتخاب کنید.'
        )

        return
      }

      setError(null)

      setExporting(
        format
      )

      try {
        const report =
          buildFinanceExportReport({
            caseItems:
              cases,

            clients,

            selection: {
              scope,

              clientKeys: [
                ...selectedKeys,
              ],
            },
          })

        if (
          format ===
          'xlsx'
        ) {
          const {
            downloadFinanceExcel,
          } =
            await import(
              '@/features/finance/export/excel'
            )

          await downloadFinanceExcel(
            report
          )
        } else {
          const {
            downloadFinancePdf,
          } =
            await import(
              '@/features/finance/export/pdf'
            )

          await downloadFinancePdf(
            report
          )
        }
      } catch (
        exportError
      ) {
        setError(
          exportError instanceof
            Error
            ? exportError.message
            : 'ساخت فایل گزارش با خطا مواجه شد.'
        )
      } finally {
        setExporting(null)
      }
    }

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="finance-export-title"
    >
      <button
        type="button"
        aria-label="بستن پنجره"
        disabled={
          Boolean(
            exporting
          )
        }
        onClick={
          onClose
        }
        className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px]"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-5 sm:px-6">
          <div>
            <h2
              id="finance-export-title"
              className="text-xl font-black text-zinc-900"
            >
              خروجی گزارش مالی
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              محدوده گزارش را انتخاب کنید و سپس فایل Excel یا PDF بسازید.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              Boolean(
                exporting
              )
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
          >
            <X
              size={19}
            />
          </button>
        </header>

        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <ScopeCard
              active={
                scope ===
                'all-cases'
              }
              icon={
                Files
              }
              title="تمام پرونده‌ها"
              description={`${cases.length.toLocaleString(
                'fa-IR'
              )} پرونده، بدون دوبارشماری`}
              onClick={() =>
                setExportScope(
                  'all-cases'
                )
              }
            />

            <ScopeCard
              active={
                scope ===
                'all-clients'
              }
              icon={
                Users
              }
              title="تمام موکلین"
              description={`${clients.length.toLocaleString(
                'fa-IR'
              )} حساب مالی مستقل`}
              onClick={() =>
                setExportScope(
                  'all-clients'
                )
              }
            />

            <ScopeCard
              active={
                scope ===
                'selected-clients'
              }
              icon={
                Check
              }
              title="انتخاب موکل"
              description="یک یا چند موکل مشخص"
              onClick={() =>
                setExportScope(
                  'selected-clients'
                )
              }
            />
          </div>

          {scope ===
            'selected-clients' && (
            <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-200">
              <div className="border-b border-zinc-100 bg-zinc-50 p-4">
                <div className="relative">
                  <Search
                    size={
                      17
                    }
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    value={
                      search
                    }
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="جست‌وجوی نام موکل..."
                    className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-zinc-500">
                    {selectedCount.toLocaleString(
                      'fa-IR'
                    )}{' '}
                    موکل انتخاب شده
                  </p>

                  <button
                    type="button"
                    onClick={
                      toggleVisibleClients
                    }
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    {allVisibleSelected
                      ? 'لغو انتخاب نتایج'
                      : 'انتخاب همه نتایج'}
                  </button>
                </div>
              </div>

              <div className="max-h-72 divide-y divide-zinc-100 overflow-y-auto">
                {visibleClients.length ===
                0 ? (
                  <div className="p-8 text-center text-sm text-zinc-400">
                    موکلی پیدا نشد.
                  </div>
                ) : (
                  visibleClients.map(
                    (
                      client
                    ) => {
                      const key =
                        getFinanceClientKey(
                          client
                        )

                      const selected =
                        selectedKeys.has(
                          key
                        )

                      return (
                        <button
                          key={
                            key
                          }
                          type="button"
                          onClick={() =>
                            toggleClient(
                              client
                            )
                          }
                          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-right transition hover:bg-indigo-50/50"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-bold text-zinc-800">
                              {
                                client.clientName
                              }
                            </p>

                            <p className="mt-1 text-xs text-zinc-400">
                              {client.totalContracts.toLocaleString(
                                'fa-IR'
                              )}{' '}
                              پرونده · مانده{' '}
                              {client.totalRemaining.toLocaleString(
                                'fa-IR'
                              )}{' '}
                              ریال
                            </p>
                          </div>

                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                              selected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-zinc-300 bg-white text-transparent'
                            }`}
                          >
                            <Check
                              size={
                                15
                              }
                            />
                          </span>
                        </button>
                      )
                    }
                  )
                )}
              </div>
            </section>
          )}

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle
                size={
                  18
                }
                className="mt-0.5 shrink-0"
              />

              <p>
                {
                  error
                }
              </p>
            </div>
          )}
        </div>

        <footer className="grid gap-3 border-t border-zinc-100 bg-zinc-50/70 p-5 sm:grid-cols-2 sm:p-6">
          <button
            type="button"
            disabled={
              !canExport ||
              Boolean(
                exporting
              )
            }
            onClick={() =>
              void handleExport(
                'xlsx'
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet
              size={
                18
              }
            />

            {exporting ===
            'xlsx'
              ? 'در حال ساخت Excel...'
              : 'دانلود Excel'}
          </button>

          <button
            type="button"
            disabled={
              !canExport ||
              Boolean(
                exporting
              )
            }
            onClick={() =>
              void handleExport(
                'pdf'
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText
              size={
                18
              }
            />

            {exporting ===
            'pdf'
              ? 'در حال ساخت PDF...'
              : 'دانلود PDF'}
          </button>
        </footer>
      </div>
    </div>
  )
}

interface ScopeCardProps {
  active: boolean

  icon:
    typeof Files

  title: string
  description: string

  onClick: () => void
}

function ScopeCard({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: ScopeCardProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-2xl border p-4 text-right transition ${
        active
          ? 'border-indigo-400 bg-indigo-50 ring-4 ring-indigo-50'
          : 'border-zinc-200 bg-white hover:border-indigo-200 hover:bg-zinc-50'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          active
            ? 'bg-indigo-600 text-white'
            : 'bg-zinc-100 text-zinc-500'
        }`}
      >
        <Icon
          size={
            19
          }
        />
      </div>

      <p className="mt-4 font-black text-zinc-900">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-zinc-500">
        {description}
      </p>
    </button>
  )
}