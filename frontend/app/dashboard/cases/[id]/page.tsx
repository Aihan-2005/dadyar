'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Edit,
  Trash2,
} from 'lucide-react'

import { useCasesStore } from '@/store/cases.store'

type CaseDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

type DateValue = Date | string | undefined | null

const moneyFormatter = new Intl.NumberFormat('fa-IR', {
  maximumFractionDigits: 0,
})

function toNumber(value: unknown): number {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return 0
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const normalizedValue = String(value)
    .replace(/[٬,]/g, '')
    .trim()

  const numericValue = Number(normalizedValue)

  return Number.isFinite(numericValue)
    ? numericValue
    : 0
}

function formatMoney(value: unknown): string {
  return moneyFormatter.format(toNumber(value))
}

function formatDate(value: DateValue): string {
  if (!value) {
    return 'ثبت نشده'
  }

  const date = value instanceof Date
    ? value
    : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'تاریخ نامعتبر'
  }

  return date.toLocaleDateString('fa-IR')
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'در انتظار',
    'in-progress': 'در حال انجام',
    in_progress: 'در حال انجام',
    open: 'باز',
    completed: 'تکمیل شده',
    closed: 'بسته شده',
    archived: 'بایگانی شده',
  }

  return labels[status] ?? status
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    in_progress: 'bg-blue-100 text-blue-700',
    open: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-green-100 text-green-700',
    closed: 'bg-zinc-200 text-zinc-700',
    archived: 'bg-zinc-100 text-zinc-700',
  }

  return (
    colors[status] ??
    'bg-zinc-100 text-zinc-700'
  )
}

function getPaymentTypeLabel(
  paymentType: string | undefined,
  hasInstallments: boolean,
): string {
  if (paymentType === 'cash') {
    return 'نقدی'
  }

  if (paymentType === 'both') {
    return hasInstallments
      ? 'ترکیبی نقدی و اقساطی'
      : 'ترکیبی'
  }

  if (paymentType === 'non-cash') {
    return hasInstallments
      ? 'اقساطی / غیرنقدی'
      : 'غیرنقدی'
  }

  if (hasInstallments) {
    return 'اقساطی'
  }

  return 'ثبت نشده'
}

export default function CaseDetailPage({
  params,
}: CaseDetailPageProps) {
  const { id } = use(params)

  const router = useRouter()

  const [isDeleting, setIsDeleting] =
    useState(false)

  const getCaseById = useCasesStore(
    (state) => state.getCaseById,
  )

  const deleteCase = useCasesStore(
    (state) => state.deleteCase,
  )

  const caseItem = getCaseById(id)

  if (!caseItem) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">
          پرونده یافت نشد
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          ممکن است پرونده حذف شده باشد یا شناسه آن
          معتبر نباشد.
        </p>

        <Link
          href="/dashboard/cases"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-800"
        >
          <ArrowRight size={18} />
          بازگشت به لیست
        </Link>
      </div>
    )
  }

  const installments =
    caseItem.installments ?? []

  const cashPayments =
    caseItem.cashPayments ?? []

  const hasInstallments =
    installments.length > 0

  const paidInstallments =
    installments.reduce(
      (total, installment) => {
        if (installment.isPaid !== true) {
          return total
        }

        return (
          total +
          toNumber(installment.amount)
        )
      },
      0,
    )

  const unpaidInstallments =
    installments.reduce(
      (total, installment) => {
        if (installment.isPaid === true) {
          return total
        }

        return (
          total +
          toNumber(installment.amount)
        )
      },
      0,
    )

  const paidCashPayments =
    cashPayments.reduce(
      (total, payment) => {
        if (payment.isPaid !== true) {
          return total
        }

        return (
          total +
          toNumber(payment.amount)
        )
      },
      0,
    )

  const displayTotalAmount = toNumber(
    caseItem.totalAmount ??
      caseItem.totalFee ??
      caseItem.contractAmount,
  )

  const totalPaid = hasInstallments
    ? paidInstallments
    : caseItem.paidAmount !==
        undefined
      ? toNumber(caseItem.paidAmount)
      : paidCashPayments

  const totalRemaining = hasInstallments
    ? unpaidInstallments
    : caseItem.remainingAmount !==
        undefined
      ? toNumber(
          caseItem.remainingAmount,
        )
      : Math.max(
          displayTotalAmount -
            totalPaid,
          0,
        )

  const paymentTypeLabel =
    getPaymentTypeLabel(
      caseItem.paymentType,
      hasInstallments,
    )

  const handleDelete = async () => {
    const shouldDelete =
      window.confirm(
        'آیا از حذف این پرونده اطمینان دارید؟',
      )

    if (!shouldDelete || isDeleting) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteCase(id)

      router.replace(
        '/dashboard/cases',
      )
    } catch (error: unknown) {
      console.error(
        'Failed to delete case:',
        error,
      )

      window.alert(
        'حذف پرونده ناموفق بود. دوباره تلاش کنید.',
      )

      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/cases"
            aria-label="بازگشت به لیست پرونده‌ها"
            className="rounded-lg p-2 transition-colors hover:bg-zinc-100"
          >
            <ArrowRight size={20} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {caseItem.title}
            </h1>

            <p className="mt-1 text-zinc-600">
              شماره پرونده:{' '}
              {caseItem.caseNumber ||
                'ثبت نشده'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/cases/edit/${id}`,
              )
            }
            className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
          >
            <Edit size={18} />
            <span>ویرایش</span>
          </button>

          <button
            type="button"
            onClick={() => {
              void handleDelete()
            }}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={18} />

            <span>
              {isDeleting
                ? 'در حال حذف...'
                : 'حذف'}
            </span>
          </button>
        </div>
      </div>

      {/* Main information */}
      <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        {/* Basic information */}
        <section className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            اطلاعات پایه
          </h2>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="mb-1 text-sm text-zinc-600">
                موکل
              </dt>

              <dd className="font-medium text-zinc-900">
                {caseItem.clientName ||
                  'ثبت نشده'}
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-sm text-zinc-600">
                وضعیت
              </dt>

              <dd>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                    caseItem.status,
                  )}`}
                >
                  {getStatusLabel(
                    caseItem.status,
                  )}
                </span>
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-sm text-zinc-600">
                تاریخ ایجاد
              </dt>

              <dd className="font-medium text-zinc-900">
                {formatDate(
                  caseItem.createdAt,
                )}
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-sm text-zinc-600">
                آخرین به‌روزرسانی
              </dt>

              <dd className="font-medium text-zinc-900">
                {formatDate(
                  caseItem.updatedAt,
                )}
              </dd>
            </div>
          </dl>
        </section>

        {/* Financial information */}
        <section className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            اطلاعات مالی
          </h2>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="mb-1 text-sm text-zinc-600">
                مبلغ قرارداد
              </dt>

              <dd className="text-lg font-bold text-zinc-900">
                {formatMoney(
                  displayTotalAmount,
                )}{' '}
                تومان
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-sm text-zinc-600">
                نحوه پرداخت
              </dt>

              <dd className="font-medium text-zinc-900">
                {paymentTypeLabel}
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-sm text-zinc-600">
                پرداخت شده
              </dt>

              <dd className="text-lg font-bold text-green-700">
                {formatMoney(totalPaid)}{' '}
                تومان
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-sm text-zinc-600">
                باقی‌مانده
              </dt>

              <dd className="text-lg font-bold text-amber-700">
                {formatMoney(
                  totalRemaining,
                )}{' '}
                تومان
              </dd>
            </div>
          </dl>
        </section>

        {/* File numbers */}
        <section className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            شماره‌های پرونده
          </h2>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {caseItem.archiveNumberOffice && (
              <div>
                <dt className="mb-1 text-sm text-zinc-600">
                  شماره بایگانی دفتر
                </dt>

                <dd className="font-mono font-medium text-zinc-900">
                  {
                    caseItem.archiveNumberOffice
                  }
                </dd>
              </div>
            )}

            {caseItem.archiveNumberLawyer && (
              <div>
                <dt className="mb-1 text-sm text-zinc-600">
                  شماره بایگانی وکیل
                </dt>

                <dd className="font-mono font-medium text-zinc-900">
                  {
                    caseItem.archiveNumberLawyer
                  }
                </dd>
              </div>
            )}

            {caseItem.archiveNumberBranch && (
              <div>
                <dt className="mb-1 text-sm text-zinc-600">
                  شماره بایگانی شعبه
                </dt>

                <dd className="font-mono font-medium text-zinc-900">
                  {
                    caseItem.archiveNumberBranch
                  }
                </dd>
              </div>
            )}

            {caseItem.courtBranch &&
              (caseItem.courtBranch
                .branchNumber ||
                caseItem.courtBranch
                  .courtName) && (
                <div className="sm:col-span-2">
                  <dt className="mb-1 text-sm text-zinc-600">
                    شعبه دادگاه
                  </dt>

                  <dd className="font-medium text-zinc-900">
                    {caseItem.courtBranch
                      .branchNumber && (
                      <>
                        شعبه{' '}
                        {
                          caseItem
                            .courtBranch
                            .branchNumber
                        }
                      </>
                    )}

                    {caseItem.courtBranch
                      .branchNumber &&
                      caseItem.courtBranch
                        .courtName &&
                      ' — '}

                    {caseItem.courtBranch
                      .courtName ?? ''}

                    {caseItem.courtBranch
                      .city &&
                      ` (${caseItem.courtBranch.city})`}
                  </dd>
                </div>
              )}
          </dl>

          {!caseItem.archiveNumberOffice &&
            !caseItem.archiveNumberLawyer &&
            !caseItem.archiveNumberBranch &&
            !caseItem.courtBranch && (
              <p className="text-sm text-zinc-500">
                اطلاعاتی ثبت نشده است.
              </p>
            )}
        </section>

        {/* Co-lawyers */}
        {(caseItem.coLawyerName ||
          caseItem.coLawyerInCase) && (
          <section className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">
              وکلای همراه
            </h2>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {caseItem.coLawyerName && (
                <div>
                  <dt className="mb-1 text-sm text-zinc-600">
                    وکیل هم‌رزم
                  </dt>

                  <dd className="font-medium text-zinc-900">
                    {
                      caseItem.coLawyerName
                    }
                  </dd>
                </div>
              )}

              {caseItem.coLawyerInCase && (
                <div>
                  <dt className="mb-1 text-sm text-zinc-600">
                    وکیل همراه پرونده
                  </dt>

                  <dd className="font-medium text-zinc-900">
                    {
                      caseItem
                        .coLawyerInCase
                    }
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Description */}
        {caseItem.description && (
          <section className="p-6">
            <h2 className="mb-2 text-sm font-medium text-zinc-600">
              توضیحات
            </h2>

            <p className="whitespace-pre-wrap text-zinc-900">
              {caseItem.description}
            </p>
          </section>
        )}
      </div>

      {/* Installments */}
      {hasInstallments && (
        <section className="rounded-lg border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              برنامه پرداخت اقساط
            </h2>

            <span className="text-sm text-zinc-500">
              {installments.length.toLocaleString(
                'fa-IR',
              )}{' '}
              قسط
            </span>
          </div>

          <div className="space-y-2">
            {installments.map(
              (installment, index) => {
                const installmentAmount =
                  toNumber(
                    installment.amount,
                  )

                const installmentKey =
                  installment.id ??
                  `${index}-${String(
                    installment.dueDate ??
                      installmentAmount,
                  )}`

                return (
                  <div
                    key={installmentKey}
                    className="flex flex-col gap-3 rounded-lg bg-zinc-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-medium text-zinc-900">
                          قسط{' '}
                          {(
                            index + 1
                          ).toLocaleString(
                            'fa-IR',
                          )}
                        </span>

                        <span className="text-zinc-700">
                          {formatMoney(
                            installmentAmount,
                          )}{' '}
                          تومان
                        </span>
                      </div>

                      {installment.dueDate && (
                        <p className="mt-1 text-sm text-zinc-500">
                          سررسید:{' '}
                          {formatDate(
                            installment.dueDate,
                          )}
                        </p>
                      )}
                    </div>

                    <span
                      className={`w-fit rounded-full px-2 py-1 text-xs ${
                        installment.isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {installment.isPaid
                        ? 'پرداخت شده'
                        : 'پرداخت نشده'}
                    </span>
                  </div>
                )
              },
            )}
          </div>
        </section>
      )}
    </div>
  )
}