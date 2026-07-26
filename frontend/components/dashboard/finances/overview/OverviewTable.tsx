

'use client'

import {
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'

import { formatMoney } from '@/features/finance/utils/money'
import type { ClientFinanceSummary } from '@/types/finance'

interface OverviewTableProps {
  clients: ClientFinanceSummary[]
}

type ClientFilter =
  | 'all'
  | 'overdue'
  | 'debtor'
  | 'settled'

type ClientSort =
  | 'overdue'
  | 'remaining'
  | 'paid'
  | 'contract'
  | 'name'

export function OverviewTable({
  clients,
}: OverviewTableProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ClientFilter>('all')
  const [sort, setSort] = useState<ClientSort>('overdue')

  const visibleClients = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase('fa-IR')

    const filtered = clients.filter((client) => {
      const matchesQuery = normalizedQuery
        ? client.clientName
            .toLocaleLowerCase('fa-IR')
            .includes(normalizedQuery)
        : true

      if (!matchesQuery) {
        return false
      }

      switch (filter) {
        case 'overdue':
          return client.totalOverdue > 0

        case 'debtor':
          return client.totalRemaining > 0

        case 'settled':
          return (
            client.totalFee > 0 &&
            client.totalRemaining <= 0
          )

        default:
          return true
      }
    })

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'remaining':
          return b.totalRemaining - a.totalRemaining

        case 'paid':
          return b.totalPaid - a.totalPaid

        case 'contract':
          return b.totalFee - a.totalFee

        case 'name':
          return a.clientName.localeCompare(
            b.clientName,
            'fa'
          )

        case 'overdue':
        default:
          if (b.totalOverdue !== a.totalOverdue) {
            return b.totalOverdue - a.totalOverdue
          }

          return b.totalRemaining - a.totalRemaining
      }
    })
  }, [clients, filter, query, sort])

  const overdueCount = clients.filter(
    (client) => client.totalOverdue > 0
  ).length

  const debtorCount = clients.filter(
    (client) => client.totalRemaining > 0
  ).length

  const hasActiveFilters =
    query.trim().length > 0 || filter !== 'all'

  const clearFilters = () => {
    setQuery('')
    setFilter('all')
    setSort('overdue')
  }

  return (
    <div>
      <div className="border-b border-zinc-100 bg-zinc-50/60 p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="search"
              value={query}
              onChange={(
                event: ChangeEvent<HTMLInputElement>
              ) => setQuery(event.target.value)}
              placeholder="جست‌وجوی نام موکل..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-10 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="پاک‌کردن جست‌وجو"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto">
            <label className="relative">
              <span className="sr-only">
                فیلتر وضعیت موکل
              </span>

              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <select
                value={filter}
                onChange={(
                  event: ChangeEvent<HTMLSelectElement>
                ) =>
                  setFilter(
                    event.target.value as ClientFilter
                  )
                }
                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pl-8 pr-9 text-sm font-medium text-zinc-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:min-w-44"
              >
                <option value="all">
                  همه موکلین
                </option>

                <option value="overdue">
                  دارای معوق
                </option>

                <option value="debtor">
                  دارای مانده
                </option>

                <option value="settled">
                  تسویه‌شده
                </option>
              </select>
            </label>

            <label>
              <span className="sr-only">
                مرتب‌سازی موکلین
              </span>

              <select
                value={sort}
                onChange={(
                  event: ChangeEvent<HTMLSelectElement>
                ) =>
                  setSort(
                    event.target.value as ClientSort
                  )
                }
                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:min-w-44"
              >
                <option value="overdue">
                  بیشترین معوق
                </option>

                <option value="remaining">
                  بیشترین مانده
                </option>

                <option value="paid">
                  بیشترین دریافتی
                </option>

                <option value="contract">
                  بیشترین قرارداد
                </option>

                <option value="name">
                  نام موکل
                </option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-zinc-500">
            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200">
              {visibleClients.length.toLocaleString('fa-IR')}{' '}
              نتیجه
            </span>

            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-100">
              {debtorCount.toLocaleString('fa-IR')} بدهکار
            </span>

            <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700 ring-1 ring-red-100">
              {overdueCount.toLocaleString('fa-IR')} معوق
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              حذف فیلترها
            </button>
          )}
        </div>
      </div>

      {visibleClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            <Search size={24} />
          </div>

          <p className="mt-4 font-bold text-zinc-700">
            نتیجه‌ای پیدا نشد
          </p>

          <p className="mt-1 text-sm text-zinc-400">
            عبارت جست‌وجو یا فیلتر انتخاب‌شده را تغییر
            دهید.
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              نمایش همه موکلین
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1120px] text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <TableHead align="right">
                    موکل
                  </TableHead>

                  <TableHead>
                    قراردادها
                  </TableHead>

                  <TableHead>
                    ارزش قرارداد
                  </TableHead>

                  <TableHead>
                    دریافتی
                  </TableHead>

                  <TableHead>
                    هزینه‌ها
                  </TableHead>

                  <TableHead>
                    مانده
                  </TableHead>

                  <TableHead>
                    معوق
                  </TableHead>

                  <TableHead>
                    عملیات
                  </TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {visibleClients.map((client, index) => (
                  <ClientDesktopRow
                    key={
                      client.clientId ??
                      `${client.clientName}-${index}`
                    }
                    client={client}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-zinc-100 lg:hidden">
            {visibleClients.map((client, index) => (
              <ClientMobileCard
                key={
                  client.clientId ??
                  `${client.clientName}-${index}`
                }
                client={client}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ClientDesktopRow({
  client,
}: {
  client: ClientFinanceSummary
}) {
  const status = getClientStatus(client)
  const initial = client.clientName.trim()[0] || '؟'
  const detailsHref = getClientDetailsHref(client)

  const collectionRate = clampPercentage(
    client.collectionRate
  )

  return (
    <tr className="transition hover:bg-indigo-50/40">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">
            {initial}
          </div>

          <div className="min-w-0">
            <p className="truncate font-bold text-zinc-900">
              {client.clientName}
            </p>

            <ClientStatusBadge status={status} />
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
          {client.totalContracts.toLocaleString('fa-IR')}
        </span>
      </td>

      <td className="px-6 py-4 text-center font-semibold text-zinc-800">
        {formatMoney(client.totalFee)}
      </td>

      <td className="px-6 py-4 text-center">
        <div className="mx-auto flex w-28 flex-col items-center gap-1.5">
          <span className="font-bold text-emerald-700">
            {formatMoney(client.totalPaid)}
          </span>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${collectionRate}%` }}
            />
          </div>

          <span className="text-[11px] text-zinc-400">
            {client.collectionRate.toLocaleString('fa-IR', {
              maximumFractionDigits: 1,
            })}
            ٪
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-center font-medium text-orange-700">
        {client.totalExpenses > 0 ? (
          formatMoney(client.totalExpenses)
        ) : (
          <span className="text-zinc-300">—</span>
        )}
      </td>

      <td className="px-6 py-4 text-center font-bold text-amber-700">
        {client.totalRemaining > 0 ? (
          formatMoney(client.totalRemaining)
        ) : (
          <span className="text-zinc-300">—</span>
        )}
      </td>

      <td className="px-6 py-4 text-center">
        {client.totalOverdue > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 font-bold text-red-700">
            <AlertCircle size={14} />
            {formatMoney(client.totalOverdue)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <CheckCircle2 size={15} />
            بدون معوق
          </span>
        )}
      </td>

      <td className="px-6 py-4 text-center">
        <Link
          href={detailsHref}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 font-bold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-800"
        >
          جزئیات
          <ChevronLeft size={15} />
        </Link>
      </td>
    </tr>
  )
}

function ClientMobileCard({
  client,
}: {
  client: ClientFinanceSummary
}) {
  const status = getClientStatus(client)
  const initial = client.clientName.trim()[0] || '؟'

  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-black text-indigo-700">
            {initial}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-bold text-zinc-900">
              {client.clientName}
            </h3>

            <div className="mt-1">
              <ClientStatusBadge status={status} />
            </div>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
          {client.totalContracts.toLocaleString('fa-IR')}{' '}
          قرارداد
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <MobileMetric
          label="ارزش قرارداد"
          value={formatMoney(client.totalFee)}
        />

        <MobileMetric
          label="دریافتی"
          value={formatMoney(client.totalPaid)}
          valueClassName="text-emerald-700"
        />

        <MobileMetric
          label="مانده"
          value={formatMoney(client.totalRemaining)}
          valueClassName="text-amber-700"
        />

        <MobileMetric
          label="معوق"
          value={formatMoney(client.totalOverdue)}
          valueClassName={
            client.totalOverdue > 0
              ? 'text-red-700'
              : 'text-emerald-700'
          }
        />
      </dl>

      <Link
        href={getClientDetailsHref(client)}
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
      >
        مشاهده جزئیات مالی
        <ChevronLeft size={16} />
      </Link>
    </article>
  )
}

function MobileMetric({
  label,
  value,
  valueClassName = 'text-zinc-800',
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3">
      <dt className="text-xs text-zinc-400">
        {label}
      </dt>

      <dd
        className={`mt-1 font-bold leading-6 ${valueClassName}`}
      >
        {value}
      </dd>
    </div>
  )
}

function ClientStatusBadge({
  status,
}: {
  status: ReturnType<typeof getClientStatus>
}) {
  const styles = {
    overdue: 'bg-red-50 text-red-700',
    debtor: 'bg-amber-50 text-amber-700',
    settled: 'bg-emerald-50 text-emerald-700',
    noContract: 'bg-zinc-100 text-zinc-600',
  } as const

  const labels = {
    overdue: 'دارای معوق',
    debtor: 'دارای مانده',
    settled: 'تسویه‌شده',
    noContract: 'بدون مبلغ قرارداد',
  } as const

  return (
    <span
      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

function TableHead({
  children,
  align = 'center',
}: {
  children: ReactNode
  align?: 'right' | 'center'
}) {
  const alignClassName =
    align === 'right'
      ? 'text-right'
      : 'text-center'

  return (
    <th
      scope="col"
      className={`px-6 py-3.5 text-xs font-bold tracking-wide text-zinc-500 ${alignClassName}`}
    >
      {children}
    </th>
  )
}

function getClientStatus(
  client: ClientFinanceSummary
) {
  if (client.totalOverdue > 0) {
    return 'overdue' as const
  }

  if (client.totalRemaining > 0) {
    return 'debtor' as const
  }

  if (client.totalFee > 0) {
    return 'settled' as const
  }

  return 'noContract' as const
}

function getClientDetailsHref(
  client: ClientFinanceSummary
): string {
  return `/dashboard/finances/clients?client=${encodeURIComponent(
    client.clientName
  )}`
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(Math.max(value, 0), 100)
}