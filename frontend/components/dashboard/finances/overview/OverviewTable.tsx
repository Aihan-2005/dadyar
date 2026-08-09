
'use client'

import Link from 'next/link'

import {
  AlertCircle,
  ChevronLeft,
  CircleCheck,
  Receipt,
} from 'lucide-react'

import type {
  ClientFinanceSummary,
} from '@/types/finance'

import {
  formatMoney,
} from '@/features/finance/utils/money'

interface OverviewTableProps {
  clients:
    ClientFinanceSummary[]
}

export function OverviewTable({
  clients,
}: OverviewTableProps) {
  if (
    clients.length === 0
  ) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <p>
          هیچ اطلاعات مالی یافت نشد
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1050px] text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <Th align="right">
                نام موکل
              </Th>

              <Th>
                سهم قرارداد
              </Th>

              <Th>
                پرداختی
              </Th>

              <Th>
                مانده
              </Th>

              <Th>
                معوق
              </Th>

              <Th>
                هزینه
              </Th>

              <Th>
                نرخ وصول
              </Th>

              <Th>
                وضعیت
              </Th>

              <Th>
                عملیات
              </Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {clients.map(
              (
                client
              ) => (
                <ClientRow
                  key={
                    client.clientId ??
                    client.clientName
                  }
                  client={
                    client
                  }
                />
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-zinc-100 lg:hidden">
        {clients.map(
          (
            client
          ) => (
            <ClientMobileCard
              key={
                client.clientId ??
                client.clientName
              }
              client={
                client
              }
            />
          )
        )}
      </div>
    </>
  )
}

function ClientRow({
  client,
}: {
  client:
    ClientFinanceSummary
}) {
  const initial =
    client.clientName
      ?.trim()?.[0] ||
    '؟'

  const collectionRate =
    Math.min(
      Math.max(
        client.collectionRate,
        0
      ),
      100
    )

  const isSettled =
    client.totalRemaining <=
    0

  return (
    <tr className="transition-colors hover:bg-zinc-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">
            {initial}
          </div>

          <div className="min-w-0">
            <p className="truncate font-bold text-zinc-900">
              {client.clientName}
            </p>

            <p className="mt-0.5 text-[11px] text-zinc-400">
              {client.totalContracts.toLocaleString(
                'fa-IR'
              )}{' '}
              پرونده
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-center font-semibold text-zinc-900">
        {formatMoney(
          client.totalFee
        )}
      </td>

      <td className="px-4 py-4 text-center font-semibold text-emerald-700">
        {formatMoney(
          client.totalPaid
        )}
      </td>

      <td className="px-4 py-4 text-center font-semibold text-amber-700">
        {client.totalRemaining >
        0
          ? formatMoney(
              client.totalRemaining
            )
          : '—'}
      </td>

      <td className="px-4 py-4 text-center">
        {client.totalOverdue >
        0 ? (
          <span className="inline-flex items-center gap-1 font-bold text-red-700">
            <AlertCircle
              size={14}
            />

            {formatMoney(
              client.totalOverdue
            )}
          </span>
        ) : (
          <span className="text-zinc-400">
            —
          </span>
        )}
      </td>

      <td className="px-4 py-4 text-center text-zinc-700">
        <span className="inline-flex items-center gap-1">
          <Receipt
            size={14}
          />

          {formatMoney(
            client.totalExpenses
          )}
        </span>
      </td>

      <td className="px-4 py-4 text-center">
        <div className="mx-auto w-24">
          <div className="mb-1 flex items-center justify-between text-[10px] text-zinc-400">
            <span>
              وصول
            </span>

            <span>
              {collectionRate.toLocaleString(
                'fa-IR',
                {
                  maximumFractionDigits:
                    0,
                }
              )}
              ٪
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width:
                  `${collectionRate}%`,
              }}
            />
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-center">
        {isSettled ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <CircleCheck
              size={13}
            />

            تسویه
          </span>
        ) : client.totalOverdue >
          0 ? (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
            معوق
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            بدهکار
          </span>
        )}

        {client.estimatedAllocationCases >
          0 && (
          <p className="mt-1 text-[10px] font-medium text-violet-600">
            {client.estimatedAllocationCases.toLocaleString(
              'fa-IR'
            )}{' '}
            سهم تخمینی
          </p>
        )}
      </td>

      <td className="px-4 py-4 text-center">
        <Link
          href={`/dashboard/finances/clients?client=${encodeURIComponent(
            client.clientName
          )}`}
          className="inline-flex items-center gap-1 font-bold text-indigo-600 transition hover:text-indigo-800"
        >
          جزئیات

          <ChevronLeft
            size={15}
          />
        </Link>
      </td>
    </tr>
  )
}

function ClientMobileCard({
  client,
}: {
  client:
    ClientFinanceSummary
}) {
  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-zinc-900">
            {client.clientName}
          </h3>

          <p className="mt-1 text-xs text-zinc-400">
            {client.totalContracts.toLocaleString(
              'fa-IR'
            )}{' '}
            پرونده · وصول{' '}

            {client.collectionRate.toLocaleString(
              'fa-IR',
              {
                maximumFractionDigits:
                  0,
              }
            )}
            ٪
          </p>
        </div>

        <Link
          href={`/dashboard/finances/clients?client=${encodeURIComponent(
            client.clientName
          )}`}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700"
        >
          جزئیات

          <ChevronLeft
            size={14}
          />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MobileMetric
          label="سهم قرارداد"
          value={
            formatMoney(
              client.totalFee
            )
          }
        />

        <MobileMetric
          label="پرداختی"
          value={
            formatMoney(
              client.totalPaid
            )
          }
          className="text-emerald-700"
        />

        <MobileMetric
          label="مانده"
          value={
            formatMoney(
              client.totalRemaining
            )
          }
          className="text-amber-700"
        />

        <MobileMetric
          label="معوق"
          value={
            formatMoney(
              client.totalOverdue
            )
          }
          className="text-red-700"
        />
      </div>
    </article>
  )
}

function MobileMetric({
  label,
  value,
  className =
    'text-zinc-900',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3">
      <p className="text-[11px] text-zinc-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-black ${className}`}
      >
        {value}
      </p>
    </div>
  )
}

function Th({
  children,
  align = 'center',
}: {
  children:
    React.ReactNode

  align?:
    | 'right'
    | 'center'
}) {
  const alignClass =
    align === 'right'
      ? 'text-right'
      : 'text-center'

  return (
    <th
      className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 ${alignClass}`}
    >
      {children}
    </th>
  )
}