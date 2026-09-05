'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  useRouter,
} from 'next/navigation'

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Search,
} from 'lucide-react'

import ClientContractDecisionModal from '@/components/client-portal/ClientContractDecisionModal'

import {
  getMockClientOnlineContracts,
  subscribeMockOnlineContracts,
} from '@/features/client-portal/data/mock-online-contracts'

import {
  hasValidTemporaryClientSession,
} from '@/features/client-portal/auth/client-session'

import type {
  OnlineContractRecord,
  OnlineContractStatus,
} from '@/features/client-portal/types/contract'

function getStatusMeta(
  status:
    OnlineContractStatus
) {
  switch (
    status
  ) {
    case 'waiting_lawyer_review':
      return {
        label:
          'در انتظار بررسی وکیل',

        className:
          'border-amber-200 bg-amber-50 text-amber-700',
      }

    case 'waiting_client_approval':
      return {
        label:
          'نیازمند تأیید شما',

        className:
          'border-blue-200 bg-blue-50 text-blue-700',
      }

    case 'waiting_lawyer_signature':
      return {
        label:
          'در انتظار تأیید نهایی وکیل',

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

export default function ClientContractsPage() {
  const router =
    useRouter()

  const [
    ready,
    setReady,
  ] =
    useState(
      false
    )

  const [
    contracts,
    setContracts,
  ] =
    useState<
      OnlineContractRecord[]
    >(
      []
    )

  const [
    search,
    setSearch,
  ] =
    useState(
      ''
    )

  const [
    selectedContract,
    setSelectedContract,
  ] =
    useState<
      OnlineContractRecord | null
    >(
      null
    )

  const reload =
    () => {
      setContracts(
        getMockClientOnlineContracts()
      )
    }

  useEffect(() => {
    if (
      !hasValidTemporaryClientSession()
    ) {
      router.replace(
        '/client-login'
      )

      return
    }

    setReady(
      true
    )

    reload()

    return subscribeMockOnlineContracts(
      reload
    )
  }, [
    router,
  ])

  const filtered =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLocaleLowerCase(
              'fa-IR'
            )

        if (!query) {
          return contracts
        }

        return contracts.filter(
          (
            contract
          ) =>
            [
              contract.reference,
              contract.draft.subject,
              contract.draft.lawyer.fullName,
            ]
              .join(
                ' '
              )
              .toLocaleLowerCase(
                'fa-IR'
              )
              .includes(
                query
              )
        )
      },
      [
        contracts,
        search,
      ]
    )

  if (!ready) {
    return (
      <main
        dir="rtl"
        className="flex min-h-dvh items-center justify-center bg-slate-100"
      >
        <p className="font-bold text-slate-600">
          در حال بارگذاری...
        </p>
      </main>
    )
  }

  return (
    <>
      <main
        dir="rtl"
        className="min-h-dvh bg-slate-100"
      >
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="font-black text-slate-950">
                دادیار
              </p>

              <p className="text-xs font-semibold text-slate-500">
                قراردادهای من
              </p>
            </div>

            <Link
              href="/client-portal"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700"
            >
              <ArrowRight
                size={17}
              />

              بازگشت به وکلا
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-[26px] border border-slate-200 bg-gradient-to-l from-blue-50 via-white to-violet-50 p-6">
            <p className="text-sm font-black text-blue-700">
              قراردادهای آنلاین
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
              قراردادهای من
            </h1>

            <p className="mt-2 text-sm font-semibold text-slate-600">
              وضعیت قراردادها و نسخه‌های
              ارسال‌شده توسط وکیل را از این
              بخش بررسی کنید.
            </p>
          </section>

          <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label="کل قراردادها"
              value={
                contracts.length
              }
              icon={
                FileText
              }
            />

            <Stat
              label="نیازمند تأیید"
              value={
                contracts.filter(
                  (
                    item
                  ) =>
                    item.status ===
                    'waiting_client_approval'
                ).length
              }
              icon={
                Clock3
              }
            />

            <Stat
              label="تکمیل‌شده"
              value={
                contracts.filter(
                  (
                    item
                  ) =>
                    item.status ===
                    'completed'
                ).length
              }
              icon={
                CheckCircle2
              }
            />
          </section>

          <section className="mt-5 flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="relative flex-1">
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
                placeholder="جستجو در قراردادها..."
                className="h-11 w-full rounded-xl border border-slate-300 pr-11 pl-4 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={
                reload
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600"
            >
              <RefreshCw
                size={17}
              />
            </button>
          </section>

          {filtered.length >
          0 ? (
            <section className="mt-5 grid gap-4 lg:grid-cols-2">
              {filtered.map(
                (
                  contract
                ) => {
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
                          <p
                            dir="ltr"
                            className="text-right text-xs font-black text-blue-700"
                          >
                            {
                              contract.reference
                            }
                          </p>

                          <h2 className="mt-2 text-lg font-black text-slate-950">
                            {
                              contract.draft.subject
                            }
                          </h2>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {
                              contract.draft.lawyer.fullName
                            }
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${status.className}`}
                        >
                          {
                            status.label
                          }
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
                        <span className="text-xs font-bold text-emerald-700">
                          حق‌الزحمه
                        </span>

                        <span className="text-sm font-black text-emerald-800">
                          {contract.draft.feeToman.toLocaleString(
                            'fa-IR'
                          )}
                          {' '}
                          تومان
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedContract(
                            contract
                          )
                        }
                        className="mt-4 h-11 w-full rounded-xl bg-slate-900 text-sm font-black text-white"
                      >
                        {contract.status ===
                        'waiting_client_approval'
                          ? 'بررسی و تأیید'
                          : 'مشاهده قرارداد'}
                      </button>
                    </article>
                  )
                }
              )}
            </section>
          ) : (
            <section className="mt-5 rounded-[22px] border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <FileText
                size={28}
                className="mx-auto text-slate-400"
              />

              <h2 className="mt-4 text-lg font-black text-slate-950">
                قراردادی وجود ندارد
              </h2>

              <Link
                href="/client-portal"
                className="mt-5 inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
              >
                مشاهده وکلا
              </Link>
            </section>
          )}
        </div>
      </main>

      <ClientContractDecisionModal
        contract={
          selectedContract
        }
        onClose={() =>
          setSelectedContract(
            null
          )
        }
        onUpdated={
          reload
        }
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
  label:
    string

  value:
    number

  icon:
    typeof FileText
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

      <p className="mt-3 text-2xl font-black text-slate-950">
        {
          value.toLocaleString(
            'fa-IR'
          )
        }
      </p>
    </article>
  )
}