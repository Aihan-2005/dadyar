
'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  AlertCircle,
  BriefcaseBusiness,
  Check,
  FileSpreadsheet,
  FileText,
  Gauge,
  Users,
  X,
} from 'lucide-react'

import type {
  FinanceCaseSource,
  FinanceOverview,
} from '@/features/finance/domain/types'

import type {
  FinancePeriodAnalytics,
} from '@/features/finance/domain/period-analytics'

import type {
  FinanceReportFilters,
} from '@/features/finance/domain/filters'

import {
  buildFinanceExportReport,
} from '@/features/finance/export/report-data'

import type {
  FinanceExportMode,
} from '@/features/finance/export/types'

import {
  formatMoney,
} from '@/features/finance/utils/money'

interface Props {
  open: boolean

  onClose: () => void

  sourceCaseCount: number

  caseItems:
    FinanceCaseSource[]

  overview:
    FinanceOverview

  analytics:
    FinancePeriodAnalytics

  filters:
    FinanceReportFilters
}

export function FinanceExportDialog({
  open,
  onClose,
  sourceCaseCount,
  caseItems,
  overview,
  analytics,
  filters,
}: Props) {
  const [
    mode,
    setMode,
  ] =
    useState<FinanceExportMode>(
      'management'
    )

  const [
    exporting,
    setExporting,
  ] =
    useState<
      'pdf' |
      'xlsx' |
      null
    >(null)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    )

  const report =
    useMemo(
      () =>
        buildFinanceExportReport({
          mode,

          sourceCaseCount,

          caseItems,

          overview,

          analytics,

          filters,
        }),

      [
        mode,
        sourceCaseCount,
        caseItems,
        overview,
        analytics,
        filters,
      ]
    )

  useEffect(() => {
    if (!open) {
      return
    }

    setError(null)

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
    open,
    exporting,
    onClose,
  ])

  const handleExport =
    async (
      format:
        'pdf' |
        'xlsx'
    ) => {
      setError(null)

      setExporting(
        format
      )

      try {
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="finance-export-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="بستن"
        onClick={
          onClose
        }
        disabled={
          Boolean(
            exporting
          )
        }
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]"
      />

      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-5 sm:px-6">
          <div>
            <h2
              id="finance-export-title"
              className="text-xl font-black text-zinc-900"
            >
              خروجی گزارش مالی
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              خروجی دقیقاً براساس فیلترهای فعال صفحه ساخته می‌شود.
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
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-800"
          >
            <X
              size={19}
            />
          </button>
        </header>

        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <ModeCard
              active={
                mode ===
                'management'
              }
              icon={
                Gauge
              }
              title="گزارش مدیریتی"
              description="KPI، جریان نقدی، Aging، پیشنهاد اقدام و جزئیات"
              onClick={() =>
                setMode(
                  'management'
                )
              }
            />

            <ModeCard
              active={
                mode ===
                'cases'
              }
              icon={
                BriefcaseBusiness
              }
              title="پرونده‌محور"
              description="یک ردیف برای هر پرونده بدون دوبارشماری"
              onClick={() =>
                setMode(
                  'cases'
                )
              }
            />

            <ModeCard
              active={
                mode ===
                'clients'
              }
              icon={
                Users
              }
              title="موکل‌محور"
              description="سهم مالی مستقل هر موکل حتی در پرونده مشترک"
              onClick={() =>
                setMode(
                  'clients'
                )
              }
            />
          </div>

          <section className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            <p className="text-xs font-black text-indigo-900">
              محدوده خروجی
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {report.filterLabels.map(
                (
                  label,
                  index
                ) => (
                  <span
                    key={`${label}-${index}`}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100"
                  >
                    {label}
                  </span>
                )
              )}
            </div>
          </section>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <PreviewMetric
              title="پرونده"
              value={
                report.filteredCaseCount.toLocaleString(
                  'fa-IR'
                )
              }
            />

            <PreviewMetric
              title="موکل"
              value={
                report.stats.clientCount.toLocaleString(
                  'fa-IR'
                )
              }
            />

            <PreviewMetric
              title="دریافتی"
              value={
                formatMoney(
                  report.stats.totalReceived
                )
              }
            />

            <PreviewMetric
              title="مانده"
              value={
                formatMoney(
                  report.stats.totalRemaining
                )
              }
            />
          </div>

          <ReportPreview
            report={
              report
            }
          />

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              {error}
            </div>
          )}
        </div>

        <footer className="grid gap-3 border-t border-zinc-100 bg-zinc-50/70 p-5 sm:grid-cols-2 sm:p-6">
          <button
            type="button"
            disabled={
              Boolean(
                exporting
              )
            }
            onClick={() =>
              void handleExport(
                'xlsx'
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet
              size={18}
            />

            {exporting ===
            'xlsx'
              ? 'در حال ساخت Excel...'
              : 'دانلود Excel'}
          </button>

          <button
            type="button"
            disabled={
              Boolean(
                exporting
              )
            }
            onClick={() =>
              void handleExport(
                'pdf'
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText
              size={18}
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

function ReportPreview({
  report,
}: {
  report:
    ReturnType<
      typeof buildFinanceExportReport
    >
}) {
  if (
    report.mode ===
    'clients'
  ) {
    return (
      <PreviewBox
        title="پیش‌نمایش موکلین"
      >
        {report.clientRows
          .slice(
            0,
            5
          )
          .map(
            (row) => (
              <PreviewRow
                key={
                  row.clientId ??
                  row.clientName
                }
                title={
                  row.clientName
                }
                description={`${row.caseCount.toLocaleString(
                  'fa-IR'
                )} پرونده`}
                value={
                  formatMoney(
                    row.totalRemaining
                  )
                }
              />
            )
          )}
      </PreviewBox>
    )
  }

  if (
    report.mode ===
    'cases'
  ) {
    return (
      <PreviewBox
        title="پیش‌نمایش پرونده‌ها"
      >
        {report.caseRows
          .slice(
            0,
            5
          )
          .map(
            (row) => (
              <PreviewRow
                key={
                  row.caseId
                }
                title={
                  row.caseTitle
                }
                description={
                  row.clientNames
                }
                value={
                  formatMoney(
                    row.remainingAmount
                  )
                }
              />
            )
          )}
      </PreviewBox>
    )
  }

  return (
    <PreviewBox
      title="پیشنهادهای مدیریتی"
    >
      {report.insights
        .slice(
          0,
          5
        )
        .map(
          (insight) => (
            <PreviewRow
              key={
                insight.id
              }
              title={
                insight.title
              }
              description={
                insight.description
              }
              value={
                insight.amount !==
                undefined
                  ? formatMoney(
                      insight.amount
                    )
                  : undefined
              }
            />
          )
        )}
    </PreviewBox>
  )
}

function ModeCard({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active:
    boolean

  icon:
    typeof Gauge

  title:
    string

  description:
    string

  onClick:
    () => void
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-2xl border p-4 text-right transition ${
        active
          ? 'border-indigo-400 bg-indigo-50 ring-4 ring-indigo-50'
          : 'border-zinc-200 hover:border-indigo-200 hover:bg-zinc-50'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          active
            ? 'bg-indigo-600 text-white'
            : 'bg-zinc-100 text-zinc-500'
        }`}
      >
        {active ? (
          <Check
            size={18}
          />
        ) : (
          <Icon
            size={18}
          />
        )}
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

function PreviewMetric({
  title,
  value,
}: {
  title:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-[11px] text-zinc-500">
        {title}
      </p>

      <p className="mt-1 break-words text-sm font-black text-zinc-900">
        {value}
      </p>
    </div>
  )
}

function PreviewBox({
  title,
  children,
}: {
  title:
    string

  children:
    React.ReactNode
}) {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-zinc-200">
      <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3">
        <h3 className="text-sm font-black text-zinc-800">
          {title}
        </h3>
      </div>

      <div className="divide-y divide-zinc-100">
        {children}
      </div>
    </section>
  )
}

function PreviewRow({
  title,
  description,
  value,
}: {
  title:
    string

  description:
    string

  value?:
    string
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-zinc-800">
          {title}
        </p>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
          {description}
        </p>
      </div>

      {value && (
        <p className="shrink-0 text-xs font-black text-zinc-700">
          {value}
        </p>
      )}
    </div>
  )
}