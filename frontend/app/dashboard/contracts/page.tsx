'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Send,
  UsersRound,
  XCircle,
} from 'lucide-react'

import OnlineContractReviewModal from '@/components/dashboard/contracts/OnlineContractReviewModal'

import {
  getMockOnlineContracts,
  subscribeMockOnlineContracts,
} from '@/features/client-portal/data/mock-online-contracts'

import type {
  OnlineContractRecord,
  OnlineContractStatus,
} from '@/features/client-portal/types/contract'

type StatusFilter =
  | 'all'
  | OnlineContractStatus

function getStatusMeta(
  status:
    OnlineContractStatus
) {
  switch (status) {
    case 'waiting_lawyer_review':
      return {
        label:
          'در انتظار بررسی شما',
        className:
          'border-amber-200 bg-amber-50 text-amber-700',
      }

    case 'waiting_client_approval':
      return {
        label:
          'در انتظار تأیید موکل',
        className:
          'border-blue-200 bg-blue-50 text-blue-700',
      }

    case 'waiting_lawyer_signature':
      return {
        label:
          'نیازمند تأیید نهایی',
        className:
          'border-violet-200 bg-violet-50 text-violet-700',
      }

    case 'completed':
      return {
        label:
          'تکمیل‌شده',
        className:
          'border-emerald-200 bg-emerald-50 text-emerald-700',
      }

    case 'rejected':
      return {
        label:
          'رد شده',
        className:
          'border-red-200 bg-red-50 text-red-700',
      }

    case 'cancelled':
      return {
        label:
          'لغوشده',
        className:
          'border-slate-200 bg-slate-100 text-slate-600',
      }
  }
}

export default function OnlineContractsPage() {
  const [
    contracts,
    setContracts,
  ] =
    useState<OnlineContractRecord[]>(
      []
    )

  const [
    search,
    setSearch,
  ] =
    useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      'all'
    )

  const [
    selectedContract,
    setSelectedContract,
  ] =
    useState<OnlineContractRecord | null>(
      null
    )

  const reload =
    () => {
      setContracts(
        getMockOnlineContracts()
      )
    }

  useEffect(() => {
    reload()

    return subscribeMockOnlineContracts(
      reload
    )
  }, [])

  const stats =
    useMemo(
      () => ({
        total:
          contracts.length,

        actions:
          contracts.filter(
            (contract) =>
              contract.status ===
                'waiting_lawyer_review' ||
              contract.status ===
                'waiting_lawyer_signature'
          ).length,

        waitingClient:
          contracts.filter(
            (contract) =>
              contract.status ===
              'waiting_client_approval'
          ).length,

        completed:
          contracts.filter(
            (contract) =>
              contract.status ===
              'completed'
          ).length,
      }),
      [contracts]
    )

  const filtered =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLocaleLowerCase(
              'fa-IR'
            )

        return contracts.filter(
          (contract) => {
            if (
              statusFilter !==
                'all' &&
              contract.status !==
                statusFilter
            ) {
              return false
            }

            if (!query) {
              return true
            }

            return [
              contract.reference,
              contract.draft.client.fullName,
              contract.draft.client.phone,
              contract.draft.subject,
            ]
              .join(' ')
              .toLocaleLowerCase(
                'fa-IR'
              )
              .includes(query)
          }
        )
      },
      [
        contracts,
        search,
        statusFilter,
      ]
    )

  return (
    <>
      <div
        dir="rtl"
        className="mx-auto max-w-7xl"
      >
        <section className="rounded-[26px] border border-slate-200 bg-gradient-to-l from-blue-50 via-white to-violet-50 p-6 sm:p-7">
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-sm font-black text-blue-700">
                قراردادهای آنلاین
              </p>

              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                مدیریت قراردادها
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-600">
                بررسی درخواست‌ها، اصلاح
                قرارداد و مدیریت مراحل تأیید.
              </p>
            </div>

            <button
              type="button"
              onClick={
                reload
              }
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700"
            >
              <RefreshCw
                size={17}
              />

              بروزرسانی
            </button>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="کل قراردادها"
            value={
              stats.total
            }
            icon={
              FileText
            }
          />

          <Stat
            label="نیازمند اقدام"
            value={
              stats.actions
            }
            icon={
              Clock3
            }
          />

          <Stat
            label="منتظر موکل"
            value={
              stats.waitingClient
            }
            icon={
              Send
            }
          />

          <Stat
            label="تکمیل‌شده"
            value={
              stats.completed
            }
            icon={
              CheckCircle2
            }
          />
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="نام موکل، موبایل، موضوع یا شناسه..."
                className="h-12 w-full rounded-xl border border-slate-300 pr-11 pl-4 text-sm font-bold outline-none"
              />
            </div>

            <div className="relative">
              <Filter
                size={17}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter
                  )
                }
                className="h-12 w-full rounded-xl border border-slate-300 bg-white pr-11 pl-4 text-sm font-black"
              >
                <option value="all">
                  همه وضعیت‌ها
                </option>

                <option value="waiting_lawyer_review">
                  نیازمند بررسی
                </option>

                <option value="waiting_client_approval">
                  منتظر موکل
                </option>

                <option value="waiting_lawyer_signature">
                  نیازمند تأیید نهایی
                </option>

                <option value="completed">
                  تکمیل‌شده
                </option>

                <option value="rejected">
                  رد شده
                </option>
              </select>
            </div>
          </div>
        </section>

        <section className="mt-6">
          {filtered.length >
          0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {filtered.map(
                (contract) => {
                  const status =
                    getStatusMeta(
                      contract.status
                    )

                  return (
                    <article
                      key={
                        contract.id
                      }
                      className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              dir="ltr"
                              className="text-xs font-black text-blue-700"
                            >
                              {contract.reference}
                            </p>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <h2 className="mt-2 text-lg font-black">
                            {contract.draft.subject}
                          </h2>
                        </div>

                        <div className="rounded-xl bg-emerald-50 px-3 py-2">
                          <p className="text-[10px] font-bold text-emerald-700">
                            حق‌الزحمه
                          </p>

                          <p className="mt-1 text-sm font-black text-emerald-800">
                            {contract.draft.feeToman.toLocaleString(
                              'fa-IR'
                            )}
                            {' '}
                            تومان
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <UsersRound
                            size={14}
                          />

                          موکل
                        </div>

                        <p className="mt-1.5 text-sm font-black">
                          {contract.draft.client.fullName}
                        </p>
                      </div>

                      {contract.clientFeedback && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                          <p className="text-xs font-black text-amber-700">
                            درخواست اصلاح موکل
                          </p>

                          <p className="mt-1 text-xs font-semibold text-amber-900">
                            {contract.clientFeedback}
                          </p>
                        </div>
                      )}

                      {contract.status ===
                        'rejected' &&
                        contract.rejectionReason && (
                        <div className="mt-3 flex gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
                          <XCircle
                            size={16}
                            className="text-red-600"
                          />

                          <p className="text-xs font-semibold text-red-700">
                            {contract.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedContract(
                              contract
                            )
                          }
                          className="h-10 rounded-xl bg-slate-900 text-sm font-black text-white"
                        >
                          {contract.status ===
                          'waiting_lawyer_review'
                            ? 'بررسی قرارداد'
                            : contract.status ===
                                'waiting_lawyer_signature'
                              ? 'تأیید نهایی'
                              : 'مشاهده'}
                        </button>

                        <Link
                          href={`/dashboard/contracts/${contract.id}/document`}
                          className="flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-sm font-black text-blue-700"
                        >
                          سند قرارداد
                        </Link>
                      </div>
                    </article>
                  )
                }
              )}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-slate-300 bg-white py-14 text-center">
              <FileText
                size={26}
                className="mx-auto text-slate-400"
              />

              <p className="mt-4 font-black">
                قراردادی پیدا نشد
              </p>
            </div>
          )}
        </section>
      </div>

      <OnlineContractReviewModal
        contract={
          selectedContract
        }
        onClose={() =>
          setSelectedContract(
            null
          )
        }
        onUpdated={() => {
          reload()
          setSelectedContract(
            null
          )
        }}
      />
    </>
  )
}

function Stat({
  label,
  value,
  icon:
    Icon,
}: {
  label: string
  value: number
  icon: LucideIcon
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-black text-slate-600">
        <Icon
          size={16}
          className="text-blue-600"
        />

        {label}
      </div>

      <p className="mt-3 text-2xl font-black">
        {value.toLocaleString(
          'fa-IR'
        )}
      </p>
    </article>
  )
}