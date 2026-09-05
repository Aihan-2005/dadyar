'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

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

/*
|--------------------------------------------------------------------------
| Filter
|--------------------------------------------------------------------------
*/

type StatusFilter =
  | 'all'
  | OnlineContractStatus


  

function getStatusMeta(
  status:
    OnlineContractStatus
): {
  label:
    string

  className:
    string
} {
  switch (
    status
  ) {
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
          'در انتظار امضای شما',

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
    useState<
      OnlineContractRecord | null
    >(
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
      () => {
        const waitingReview =
          contracts.filter(
            (
              contract
            ) =>
              contract.status ===
              'waiting_lawyer_review'
          ).length

        const waitingClient =
          contracts.filter(
            (
              contract
            ) =>
              contract.status ===
              'waiting_client_approval'
          ).length

        const completed =
          contracts.filter(
            (
              contract
            ) =>
              contract.status ===
              'completed'
          ).length

        return {
          total:
            contracts.length,

          waitingReview,

          waitingClient,

          completed,
        }
      },
      [
        contracts,
      ]
    )

    

  const filteredContracts =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLocaleLowerCase(
              'fa-IR'
            )

        return contracts.filter(
          (
            contract
          ) => {
            if (
              statusFilter !==
                'all' &&
              contract.status !==
                statusFilter
            ) {
              return false
            }

            if (
              !normalizedSearch
            ) {
              return true
            }

            const searchable =
              [
                contract.reference,

                contract.draft.client.fullName,

                contract.draft.client.phone,

                contract.draft.client.nationalId,

                contract.draft.subject,

                contract.draft.lawyer.fullName,
              ]
                .join(
                  ' '
                )
                .toLocaleLowerCase(
                  'fa-IR'
                )

            return searchable.includes(
              normalizedSearch
            )
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
        

        <section className="rounded-[26px] border border-slate-200 bg-gradient-to-l from-blue-50 via-white to-violet-50 p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-blue-700">
                قراردادهای آنلاین
              </p>

              <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                مدیریت درخواست‌های قرارداد
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                پیش‌نویس‌های ارسال‌شده توسط
                موکل را بررسی کن، شرایط را
                نهایی کن و نسخه جدید را برای
                تأیید موکل ارسال کن.
              </p>
            </div>

            <button
              type="button"
              onClick={
                reload
              }
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw
                size={17}
              />

              بروزرسانی
            </button>
          </div>
        </section>



        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold leading-6 text-amber-800">
            این بخش فعلاً برای توسعه
            Frontend است. قراردادها در
            LocalStorage مرورگر ذخیره
            می‌شوند و اطلاعات این محیط
            نباید اطلاعات واقعی یا حساس
            موکل باشند.
          </p>
        </div>



        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="کل قراردادها"
            value={
              stats.total
            }
            icon={
              FileText
            }
          />

          <StatCard
            label="نیازمند بررسی"
            value={
              stats.waitingReview
            }
            icon={
              Clock3
            }
            attention={
              stats.waitingReview >
              0
            }
          />

          <StatCard
            label="منتظر موکل"
            value={
              stats.waitingClient
            }
            icon={
              Send
            }
          />

          <StatCard
            label="تکمیل‌شده"
            value={
              stats.completed
            }
            icon={
              CheckCircle2
            }
          />
        </section>



        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
            {/* Search */}

            <div className="relative">
              <Search
                size={19}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                placeholder="جستجو بر اساس نام موکل، موبایل، کد ملی، موضوع یا شناسه قرارداد..."
                className="h-12 w-full rounded-xl border border-slate-300 bg-white pr-11 pl-4 text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Status */}

            <div className="relative">
              <Filter
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white pr-11 pl-4 text-sm font-black text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">
                  همه وضعیت‌ها
                </option>

                <option value="waiting_lawyer_review">
                  در انتظار بررسی وکیل
                </option>

                <option value="waiting_client_approval">
                  در انتظار تأیید موکل
                </option>

                <option value="waiting_lawyer_signature">
                  در انتظار امضای وکیل
                </option>

                <option value="completed">
                  تکمیل‌شده
                </option>

                <option value="rejected">
                  رد شده
                </option>

                <option value="cancelled">
                  لغوشده
                </option>
              </select>
            </div>
          </div>
        </section>



        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                درخواست‌ها
              </h2>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                {
                  filteredContracts.length.toLocaleString(
                    'fa-IR'
                  )
                }
                {' '}
                نتیجه
              </p>
            </div>
          </div>

          {filteredContracts.length >
          0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredContracts.map(
                (
                  contract
                ) => (
                  <ContractCard
                    key={
                      contract.id
                    }
                    contract={
                      contract
                    }
                    onOpen={() =>
                      setSelectedContract(
                        contract
                      )
                    }
                  />
                )
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      </div>

      {/* Modal */}

      <OnlineContractReviewModal
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




function ContractCard({
  contract,
  onOpen,
}: {
  contract:
    OnlineContractRecord

  onOpen:
    () => void
}) {
  const status =
    getStatusMeta(
      contract.status
    )

  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      {/* Top */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              dir="ltr"
              className="text-xs font-black text-blue-700"
            >
              {
                contract.reference
              }
            </p>

            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${status.className}`}
            >
              {
                status.label
              }
            </span>
          </div>

          <h3 className="mt-2 text-lg font-black text-slate-950">
            {
              contract.draft.subject
            }
          </h3>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            نسخه
            {' '}
            {
              contract.version.toLocaleString(
                'fa-IR'
              )
            }
          </p>
        </div>

        <div className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-left">
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

      {/* Client */}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <UsersRound
              size={14}
              className="text-blue-600"
            />

            موکل
          </div>

          <p className="mt-1.5 text-sm font-black text-slate-900">
            {
              contract.draft.client.fullName
            }
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-500">
            شماره تماس
          </p>

          <p
            dir="ltr"
            className="mt-1.5 text-right text-sm font-black text-slate-900"
          >
            {
              contract.draft.client.phone
            }
          </p>
        </div>
      </div>

      {/* Description */}

      <p className="mt-4 line-clamp-2 text-sm font-medium leading-7 text-slate-600">
        {
          contract.draft.scope
        }
      </p>

      {/* Footer */}

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-slate-400">
          آخرین تغییر:
          {' '}
          {new Intl.DateTimeFormat(
            'fa-IR',
            {
              dateStyle:
                'medium',

              timeStyle:
                'short',
            }
          ).format(
            new Date(
              contract.updatedAt
            )
          )}
        </p>

        <button
          type="button"
          onClick={
            onOpen
          }
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-slate-800"
        >
          {contract.status ===
          'waiting_lawyer_review'
            ? 'بررسی قرارداد'
            : 'مشاهده قرارداد'}
        </button>
      </div>

      {/* Rejected */}

      {contract.status ===
        'rejected' &&
        contract.rejectionReason && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
          <XCircle
            size={16}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <p className="text-xs font-semibold leading-6 text-red-700">
            {
              contract.rejectionReason
            }
          </p>
        </div>
      )}
    </article>
  )
}



function StatCard({
  label,
  value,
  icon:
    Icon,
  attention =
    false,
}: {
  label:
    string

  value:
    number

  icon:
    typeof FileText

  attention?:
    boolean
}) {
  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${
        attention
          ? 'border-amber-300'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-black text-slate-600 sm:text-sm">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            attention
              ? 'bg-amber-100 text-amber-700'
              : 'bg-blue-50 text-blue-600'
          }`}
        >
          <Icon
            size={16}
          />
        </div>

        {
          label
        }
      </div>

      <p className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
        {
          value.toLocaleString(
            'fa-IR'
          )
        }
      </p>
    </article>
  )
}




function EmptyState() {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <FileText
          size={25}
        />
      </div>

      <h3 className="mt-4 text-lg font-black text-slate-950">
        قراردادی پیدا نشد
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-7 text-slate-500">
        عبارت جستجو یا فیلتر وضعیت را تغییر
        بده.
      </p>
    </div>
  )
}