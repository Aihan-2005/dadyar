'use client'

import {
  use,
  useEffect,
  useMemo,
} from 'react'

import Link from 'next/link'

import {
  useRouter,
} from 'next/navigation'

import {
  AlertCircle,
  ArrowRight,
  Edit,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react'

import {
  useCasesStore,
} from '@/store/cases.store'


type CaseDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

type DateValue =
  | Date
  | string
  | undefined
  | null



const moneyFormatter =
  new Intl.NumberFormat(
    'fa-IR',
    {
      maximumFractionDigits:
        0,
    }
  )

function toNumber(
  value:
    unknown
): number {
  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ''
  ) {
    return 0
  }

  if (
    typeof value ===
    'number'
  ) {
    return Number.isFinite(
      value
    )
      ? value
      : 0
  }

  const normalizedValue =
    String(
      value
    )
      .replace(
        /[٬,]/g,
        ''
      )
      .trim()

  const numericValue =
    Number(
      normalizedValue
    )

  return Number.isFinite(
    numericValue
  )
    ? numericValue
    : 0
}

function formatMoney(
  value:
    unknown
): string {
  return moneyFormatter.format(
    toNumber(
      value
    )
  )
}



function isJalaliDateString(
  value:
    string
): boolean {
  return /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(
    value.trim()
  )
}

function formatDate(
  value:
    DateValue
): string {
  if (!value) {
    return 'ثبت نشده'
  }

  
  if (
    typeof value ===
      'string' &&
    isJalaliDateString(
      value
    )
  ) {
    return value
  }

  const date =
    value instanceof Date
      ? value
      : new Date(
          value
        )

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'تاریخ نامعتبر'
  }

  return date.toLocaleDateString(
    'fa-IR'
  )
}


function getStatusLabel(
  status:
    string
): string {
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
    labels[
      status
    ] ??
    status
  )
}

function getStatusColor(
  status:
    string
): string {
  const colors:
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

  return (
    colors[
      status
    ] ??
    'bg-zinc-100 text-zinc-700'
  )
}



function getPaymentTypeLabel(
  paymentType:
    string | undefined
): string {
  switch (
    paymentType
  ) {
    case 'cash':
      return 'نقدی'

    case 'both':
      return 'ترکیبی'

    case 'non-cash':
      return 'غیرنقدی'

    default:
      return 'ثبت نشده'
  }
}



export default function CaseDetailPage({
  params,
}: CaseDetailPageProps) {
  const {
    id,
  } =
    use(
      params
    )

  const router =
    useRouter()

  

  const getCaseById =
    useCasesStore(
      (state) =>
        state.getCaseById
    )

  const fetchCaseById =
    useCasesStore(
      (state) =>
        state.fetchCaseById
    )

  const deleteCase =
    useCasesStore(
      (state) =>
        state.deleteCase
    )

  const isLoading =
    useCasesStore(
      (state) =>
        state.isLoading
    )

  const isDeleting =
    useCasesStore(
      (state) =>
        state.isDeleting
    )

  const caseError =
    useCasesStore(
      (state) =>
        state.error
    )

  const clearError =
    useCasesStore(
      (state) =>
        state.clearError
    )

  

  const caseItem =
    getCaseById(
      id
    )

  

  useEffect(() => {
    clearError()

    void fetchCaseById(
      id
    )
  }, [
    id,
    fetchCaseById,
    clearError,
  ])

 

  const clients =
    useMemo(
      () =>
        caseItem
          ?.clients ??
        [],
      [
        caseItem
          ?.clients,
      ]
    )

  const installments =
    useMemo(
      () =>
        caseItem
          ?.installments ??
        [],
      [
        caseItem
          ?.installments,
      ]
    )

  const cashPayments =
    useMemo(
      () =>
        caseItem
          ?.cashPayments ??
        [],
      [
        caseItem
          ?.cashPayments,
      ]
    )

  const nonCashPayments =
    useMemo(
      () =>
        caseItem
          ?.nonCashPayments ??
        [],
      [
        caseItem
          ?.nonCashPayments,
      ]
    )

  const expenses =
    useMemo(
      () =>
        caseItem
          ?.expenses ??
        [],
      [
        caseItem
          ?.expenses,
      ]
    )

 

  const financial =
    useMemo(
      () => {
        if (
          !caseItem
        ) {
          return {
            total:
              0,

            paid:
              0,

            remaining:
              0,

            overdue:
              0,
          }
        }

        const total =
          toNumber(
            caseItem
              .contractAmount ??
              caseItem
                .totalFee ??
              caseItem
                .totalAmount
          )

       
        const paid =
          caseItem
            .paidAmount !==
          undefined
            ? toNumber(
                caseItem
                  .paidAmount
              )
            : installments.reduce(
                (
                  sum,
                  item
                ) =>
                  item.isPaid
                    ? sum +
                      toNumber(
                        item.amount
                      )
                    : sum,
                0
              )

        const remaining =
          caseItem
            .remainingAmount !==
          undefined
            ? toNumber(
                caseItem
                  .remainingAmount
              )
            : Math.max(
                total -
                  paid,
                0
              )

        const overdue =
          toNumber(
            caseItem
              .overdueAmount
          )

        return {
          total,
          paid,
          remaining,
          overdue,
        }
      },
      [
        caseItem,
        installments,
      ]
    )

  

  const handleRefresh =
    async () => {
      clearError()

      await fetchCaseById(
        id
      )
    }



  const handleDelete =
    async () => {
      if (
        isDeleting
      ) {
        return
      }

      const shouldDelete =
        window.confirm(
          'آیا از حذف این پرونده اطمینان دارید؟'
        )

      if (
        !shouldDelete
      ) {
        return
      }

      clearError()

      try {
        
        await deleteCase(
          id
        )

        router.replace(
          '/dashboard/cases'
        )
      } catch {
       
      }
    }

  
  if (
    !caseItem &&
    isLoading
  ) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2
            size={30}
            className="animate-spin text-zinc-700"
          />

          <div>
            <p className="font-medium text-zinc-900">
              در حال دریافت پرونده...
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              اطلاعات از سرور دریافت می‌شود.
            </p>
          </div>
        </div>
      </div>
    )
  }

  

  if (
    !caseItem
  ) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertCircle
              size={24}
              className="text-red-600"
            />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-zinc-900">
            پرونده یافت نشد
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {caseError ||
              'ممکن است پرونده حذف شده باشد یا شناسه آن معتبر نباشد.'}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                void handleRefresh()
              }}
              disabled={
                isLoading
              }
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw
                  size={17}
                />
              )}

              تلاش مجدد
            </button>

            <Link
              href="/dashboard/cases"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <ArrowRight
                size={18}
              />

              بازگشت به لیست
            </Link>
          </div>
        </div>
      </div>
    )
  }

  

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {caseError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            {caseError}
          </div>

          <button
            type="button"
            onClick={
              clearError
            }
            className="shrink-0 font-medium"
          >
            بستن
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/dashboard/cases"
            aria-label="بازگشت به لیست پرونده‌ها"
            className="mt-1 rounded-lg p-2 transition-colors hover:bg-zinc-100"
          >
            <ArrowRight
              size={20}
            />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900">
                {
                  caseItem.title
                }
              </h1>

              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                  caseItem.status
                )}`}
              >
                {getStatusLabel(
                  caseItem.status
                )}
              </span>
            </div>

            <p className="mt-2 text-zinc-600">
              شماره پرونده:{' '}
              <span
                dir="ltr"
                className="font-medium text-zinc-900"
              >
                {caseItem.caseNumber ||
                  'ثبت نشده'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() => {
              void handleRefresh()
            }}
            disabled={
              isLoading
            }
            className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <RefreshCw
                size={18}
              />
            )}

            <span>
              بروزرسانی
            </span>
          </button>


          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/cases/edit/${id}`
              )
            }
            className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
          >
            <Edit
              size={18}
            />

            <span>
              ویرایش
            </span>
          </button>


          <button
            type="button"
            onClick={() => {
              void handleDelete()
            }}
            disabled={
              isDeleting
            }
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={18}
              />
            )}

            <span>
              {isDeleting
                ? 'در حال حذف...'
                : 'حذف'}
            </span>
          </button>
        </div>
      </div>


      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-zinc-900">
          اطلاعات پایه
        </h2>

        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="mb-1 text-sm text-zinc-500">
              وضعیت
            </dt>

            <dd className="font-medium text-zinc-900">
              {getStatusLabel(
                caseItem.status
              )}
            </dd>
          </div>

          <div>
            <dt className="mb-1 text-sm text-zinc-500">
              تاریخ ایجاد
            </dt>

            <dd className="font-medium text-zinc-900">
              {formatDate(
                caseItem.createdAt
              )}
            </dd>
          </div>

          <div>
            <dt className="mb-1 text-sm text-zinc-500">
              آخرین بروزرسانی
            </dt>

            <dd className="font-medium text-zinc-900">
              {formatDate(
                caseItem.updatedAt
              )}
            </dd>
          </div>

          <div>
            <dt className="mb-1 text-sm text-zinc-500">
              نوع پرداخت
            </dt>

            <dd className="font-medium text-zinc-900">
              {getPaymentTypeLabel(
                caseItem.paymentType
              )}
            </dd>
          </div>
        </dl>
      </section>

      {/* -------------------------------------------------------------
       * Clients
       * ----------------------------------------------------------- */}

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            موکلین پرونده
          </h2>

          <span className="text-sm text-zinc-500">
            {clients.length.toLocaleString(
              'fa-IR'
            )}{' '}
            موکل
          </span>
        </div>

        {clients.length ===
        0 ? (
          <p className="text-sm text-zinc-500">
            موکلی برای این پرونده ثبت نشده است.
          </p>
        ) : (
          <div className="space-y-3">
            {clients.map(
              (
                client,
                index
              ) => (
                <div
                  key={
                    client.clientId ??
                    `${client.name}-${index}`
                  }
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {client.name ||
                          `موکل ${(
                            index +
                            1
                          ).toLocaleString(
                            'fa-IR'
                          )}`}
                      </p>

                      <div className="mt-2 space-y-1 text-sm text-zinc-600">
                        {client.phone && (
                          <p>
                            موبایل:{' '}
                            <span
                              dir="ltr"
                              className="font-medium text-zinc-800"
                            >
                              {
                                client.phone
                              }
                            </span>
                          </p>
                        )}

                        {client.nationalId && (
                          <p>
                            کد ملی:{' '}
                            <span
                              dir="ltr"
                              className="font-medium text-zinc-800"
                            >
                              {
                                client.nationalId
                              }
                            </span>
                          </p>
                        )}

                        {client.role && (
                          <p>
                            سمت در پرونده:{' '}
                            <span className="font-medium text-zinc-800">
                              {
                                client.role
                              }
                            </span>
                          </p>
                        )}

                        {client.representative && (
                          <p>
                            نماینده:{' '}
                            <span className="font-medium text-zinc-800">
                              {
                                client.representative
                              }
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
                      <p className="text-zinc-500">
                        سهم حق‌الوکاله
                      </p>

                      <p className="mt-1 font-bold text-zinc-900">
                        {formatMoney(
                          client.feeShareAmount
                        )}{' '}
                        تومان
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>


      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-zinc-900">
          خلاصه مالی
        </h2>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-zinc-50 p-4">
            <dt className="text-sm text-zinc-500">
              مبلغ قرارداد
            </dt>

            <dd className="mt-2 text-xl font-bold text-zinc-900">
              {formatMoney(
                financial.total
              )}{' '}
              <span className="text-sm font-normal">
                تومان
              </span>
            </dd>
          </div>

          <div className="rounded-xl bg-green-50 p-4">
            <dt className="text-sm text-green-700">
              پرداخت‌شده
            </dt>

            <dd className="mt-2 text-xl font-bold text-green-700">
              {formatMoney(
                financial.paid
              )}{' '}
              <span className="text-sm font-normal">
                تومان
              </span>
            </dd>
          </div>

          <div className="rounded-xl bg-amber-50 p-4">
            <dt className="text-sm text-amber-700">
              باقی‌مانده
            </dt>

            <dd className="mt-2 text-xl font-bold text-amber-700">
              {formatMoney(
                financial.remaining
              )}{' '}
              <span className="text-sm font-normal">
                تومان
              </span>
            </dd>
          </div>

          <div className="rounded-xl bg-red-50 p-4">
            <dt className="text-sm text-red-700">
              معوق
            </dt>

            <dd className="mt-2 text-xl font-bold text-red-700">
              {formatMoney(
                financial.overdue
              )}{' '}
              <span className="text-sm font-normal">
                تومان
              </span>
            </dd>
          </div>
        </dl>
      </section>


      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            پرداخت‌ها و اقساط
          </h2>

          <span className="text-sm text-zinc-500">
            {installments.length.toLocaleString(
              'fa-IR'
            )}{' '}
            مورد
          </span>
        </div>

        {installments.length ===
        0 ? (
          <p className="text-sm text-zinc-500">
            پرداختی برای این پرونده ثبت نشده است.
          </p>
        ) : (
          <div className="space-y-3">
            {installments.map(
              (
                payment,
                index
              ) => {
                const clientName =
                  payment.clientName ||
                  clients.find(
                    (client) =>
                      client.clientId ===
                      payment.clientId
                  )?.name

                return (
                  <div
                    key={
                      payment.id ??
                      `${index}-${payment.clientId ?? ''}`
                    }
                    className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-zinc-900">
                          پرداخت{' '}
                          {(
                            index +
                            1
                          ).toLocaleString(
                            'fa-IR'
                          )}
                        </p>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            payment.isPaid
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {payment.isPaid
                            ? 'پرداخت شده'
                            : 'پرداخت نشده'}
                        </span>
                      </div>

                      {clientName && (
                        <p className="mt-2 text-sm text-zinc-600">
                          موکل:{' '}
                          <span className="font-medium text-zinc-800">
                            {
                              clientName
                            }
                          </span>
                        </p>
                      )}

                      {(payment.dueDate ||
                        payment.paymentDate) && (
                        <p className="mt-1 text-sm text-zinc-500">
                          سررسید:{' '}
                          {formatDate(
                            payment.dueDate ??
                              payment.paymentDate
                          )}
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 text-lg font-bold text-zinc-900">
                      {formatMoney(
                        payment.amount
                      )}{' '}
                      <span className="text-sm font-normal text-zinc-500">
                        تومان
                      </span>
                    </p>
                  </div>
                )
              }
            )}
          </div>
        )}


        {cashPayments.length >
          0 && (
          <p className="mt-4 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
            {
              cashPayments.length
            }{' '}
            پرداخت نقدی ثبت شده است.
          </p>
        )}


        {nonCashPayments.length >
          0 && (
          <div className="mt-5 border-t border-zinc-100 pt-5">
            <h3 className="mb-3 font-medium text-zinc-900">
              پرداخت‌های غیرنقدی
            </h3>

            <div className="space-y-2">
              {nonCashPayments.map(
                (
                  payment,
                  index
                ) => (
                  <div
                    key={
                      payment.id ??
                      index
                    }
                    className="rounded-lg bg-zinc-50 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-zinc-900">
                        {payment.description ||
                          'پرداخت غیرنقدی'}
                      </p>

                      <p className="font-bold text-zinc-800">
                        {formatMoney(
                          payment.amount
                        )}{' '}
                        تومان
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </section>


      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            هزینه‌های پرونده
          </h2>

          <span className="text-sm text-zinc-500">
            {expenses.length.toLocaleString(
              'fa-IR'
            )}{' '}
            مورد
          </span>
        </div>

        {expenses.length ===
        0 ? (
          <p className="text-sm text-zinc-500">
            هزینه‌ای برای این پرونده ثبت نشده است.
          </p>
        ) : (
          <div className="space-y-3">
            {expenses.map(
              (
                expense,
                index
              ) => (
                <div
                  key={
                    expense.id ??
                    `${expense.title}-${index}`
                  }
                  className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-zinc-900">
                        {expense.title ||
                          `هزینه ${(
                            index +
                            1
                          ).toLocaleString(
                            'fa-IR'
                          )}`}
                      </p>

                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          expense.isPaid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {expense.isPaid
                          ? 'پرداخت شده'
                          : 'پرداخت نشده'}
                      </span>
                    </div>

                    {expense.date && (
                      <p className="mt-2 text-sm text-zinc-500">
                        تاریخ:{' '}
                        {formatDate(
                          expense.date
                        )}
                      </p>
                    )}

                    {expense.description && (
                      <p className="mt-1 text-sm text-zinc-600">
                        {
                          expense.description
                        }
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 text-lg font-bold text-zinc-900">
                    {formatMoney(
                      expense.amount
                    )}{' '}
                    <span className="text-sm font-normal text-zinc-500">
                      تومان
                    </span>
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </section>


      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-zinc-900">
          اطلاعات مرجع قضایی
        </h2>

        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="mb-1 text-sm text-zinc-500">
              استان
            </dt>

            <dd className="font-medium text-zinc-900">
              {caseItem.province ||
                'ثبت نشده'}
            </dd>
          </div>

          <div>
            <dt className="mb-1 text-sm text-zinc-500">
              شهر/بخش
            </dt>

            <dd className="font-medium text-zinc-900">
              {caseItem.city ||
                'ثبت نشده'}
            </dd>
          </div>

          <div>
            <dt className="mb-1 text-sm text-zinc-500">
              نوع دادگاه
            </dt>

            <dd className="font-medium text-zinc-900">
              {caseItem.courtType ||
                'ثبت نشده'}
            </dd>
          </div>

          <div>
            <dt className="mb-1 text-sm text-zinc-500">
              شماره بایگانی شعبه
            </dt>

            <dd
              dir="ltr"
              className="font-medium text-zinc-900"
            >
              {caseItem.archiveNumberBranch ||
                'ثبت نشده'}
            </dd>
          </div>
        </dl>

        {caseItem.branchHistory &&
          caseItem.branchHistory.length >
            0 && (
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-zinc-800">
                سوابق شعب
              </h3>

              <div className="space-y-2">
                {caseItem.branchHistory.map(
                  (
                    branch,
                    index
                  ) => (
                    <div
                      key={`${index}-${branch.branchNumber ?? ''}`}
                      className="rounded-lg bg-zinc-50 p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {branch.province && (
                          <span>
                            {
                              branch.province
                            }
                          </span>
                        )}

                        {branch.city && (
                          <span>
                            {
                              branch.city
                            }
                          </span>
                        )}

                        {branch.branchNumber && (
                          <span>
                            شعبه{' '}
                            {
                              branch.branchNumber
                            }
                          </span>
                        )}

                        {branch.isActive && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                            شعبه فعال
                          </span>
                        )}
                      </div>

                      {branch.date && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {formatDate(
                            branch.date
                          )}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
      </section>


      {caseItem.opposingParties &&
        caseItem.opposingParties.length >
          0 && (
          <section className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-zinc-900">
              طرف‌های مقابل
            </h2>

            <div className="space-y-3">
              {caseItem.opposingParties.map(
                (
                  party,
                  index
                ) => (
                  <div
                    key={`${party.name}-${index}`}
                    className="rounded-lg bg-zinc-50 p-4"
                  >
                    <p className="font-medium text-zinc-900">
                      {party.name ||
                        'بدون نام'}
                    </p>

                    <div className="mt-2 space-y-1 text-sm text-zinc-600">
                      {party.phone && (
                        <p>
                          تماس:{' '}
                          <span dir="ltr">
                            {
                              party.phone
                            }
                          </span>
                        </p>
                      )}

                      {party.role && (
                        <p>
                          سمت:{' '}
                          {
                            party.role
                          }
                        </p>
                      )}

                      {party.nationalId && (
                        <p>
                          کد ملی:{' '}
                          <span dir="ltr">
                            {
                              party.nationalId
                            }
                          </span>
                        </p>
                      )}

                      {party.description && (
                        <p>
                          {
                            party.description
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

      {caseItem.coLawyers &&
        caseItem.coLawyers.length >
          0 && (
          <section className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-zinc-900">
              وکلای همکار
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {caseItem.coLawyers.map(
                (
                  lawyer,
                  index
                ) => (
                  <div
                    key={`${lawyer.name}-${index}`}
                    className="rounded-lg bg-zinc-50 p-4"
                  >
                    <p className="font-medium text-zinc-900">
                      {lawyer.name ||
                        'بدون نام'}
                    </p>

                    {lawyer.phone && (
                      <p className="mt-2 text-sm text-zinc-600">
                        <span dir="ltr">
                          {
                            lawyer.phone
                          }
                        </span>
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </section>
        )}


      {caseItem.description && (
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">
            توضیحات
          </h2>

          <p className="whitespace-pre-wrap leading-8 text-zinc-700">
            {
              caseItem.description
            }
          </p>
        </section>
      )}
    </div>
  )
}