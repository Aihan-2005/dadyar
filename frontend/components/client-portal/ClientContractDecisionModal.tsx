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
  History,
  MessageSquareText,
  Send,
  X,
} from 'lucide-react'

import {
  approveMockOnlineContractByClient,
  requestMockOnlineContractChanges,
} from '@/features/client-portal/data/mock-online-contracts'

import type {
  OnlineContractDraft,
  OnlineContractRecord,
} from '@/features/client-portal/types/contract'

interface ClientContractDecisionModalProps {
  contract:
    OnlineContractRecord | null

  onClose:
    () => void

  onUpdated:
    () => void
}

function formatDateTime(
  value:
    string
): string {
  return new Intl.DateTimeFormat(
    'fa-IR',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    }
  ).format(
    new Date(
      value
    )
  )
}

function statusLabel(
  contract:
    OnlineContractRecord
): string {
  switch (
    contract.status
  ) {
    case 'waiting_lawyer_review':
      return 'در انتظار بررسی وکیل'

    case 'waiting_client_approval':
      return 'نیازمند تأیید شما'

    case 'waiting_lawyer_signature':
      return 'در انتظار تأیید نهایی وکیل'

    case 'completed':
      return 'تکمیل‌شده'

    case 'rejected':
      return 'رد شده'

    case 'cancelled':
      return 'لغوشده'
  }
}

export default function ClientContractDecisionModal({
  contract,
  onClose,
  onUpdated,
}: ClientContractDecisionModalProps) {
  const [
    requestChanges,
    setRequestChanges,
  ] =
    useState(
      false
    )

  const [
    feedback,
    setFeedback,
  ] =
    useState(
      ''
    )

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    )

  useEffect(() => {
    setRequestChanges(
      false
    )

    setFeedback(
      ''
    )

    setError(
      null
    )
  }, [
    contract?.id,
    contract?.version,
  ])

  useEffect(() => {
    if (!contract) {
      return
    }

    const previousOverflow =
      document.body.style.overflow

    const handleKeyDown =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.key ===
          'Escape'
        ) {
          onClose()
        }
      }

    document.body.style.overflow =
      'hidden'

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [
    contract,
    onClose,
  ])

  const previousVersion =
    useMemo(
      () => {
        if (
          !contract ||
          contract.versions.length <
            2
        ) {
          return null
        }

        return contract.versions[
          contract.versions.length -
            2
        ]
      },
      [
        contract,
      ]
    )

  if (!contract) {
    return null
  }

  const canApprove =
    contract.status ===
    'waiting_client_approval'

  const handleApprove =
    () => {
      try {
        approveMockOnlineContractByClient(
          contract.id
        )

        onUpdated()

        onClose()
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'خطا در تأیید قرارداد.'
        )
      }
    }

  const handleRequestChanges =
    () => {
      try {
        requestMockOnlineContractChanges(
          contract.id,
          feedback
        )

        onUpdated()

        onClose()
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'خطا در ثبت درخواست اصلاح.'
        )
      }
    }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={
        onClose
      }
    >
      <section
        role="dialog"
        aria-modal="true"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        className="max-h-[96dvh] w-full max-w-4xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
      >
        <header className="sticky top-0 z-20 flex items-start justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p
              dir="ltr"
              className="text-right text-xs font-black text-blue-700"
            >
              {
                contract.reference
              }
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              قرارداد آنلاین
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              نسخه
              {' '}
              {
                contract.version.toLocaleString(
                  'fa-IR'
                )
              }
              {' • '}
              {
                statusLabel(
                  contract
                )
              }
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X
              size={20}
            />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          <section>
            <div className="flex items-center gap-2">
              <FileText
                size={18}
                className="text-blue-600"
              />

              <h3 className="font-black text-slate-900">
                اطلاعات قرارداد
              </h3>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info
                label="وکیل"
                value={
                  contract.draft.lawyer.fullName
                }
              />

              <Info
                label="موضوع"
                value={
                  contract.draft.subject
                }
              />

              <Info
                label="حق‌الزحمه"
                value={`${contract.draft.feeToman.toLocaleString(
                  'fa-IR'
                )} تومان`}
              />

              <Info
                label="تاریخ شروع"
                value={
                  contract.draft.startDate
                }
              />

              <Info
                label="مدت خدمات"
                value={
                  contract.draft.servicePeriod
                }
              />

              <Info
                label="نسخه"
                value={
                  contract.version.toLocaleString(
                    'fa-IR'
                  )
                }
              />
            </div>

            <TextBox
              label="دامنه خدمات"
              value={
                contract.draft.scope
              }
            />

            <TextBox
              label="شرایط پرداخت"
              value={
                contract.draft.paymentDetails
              }
            />

            {contract.draft.additionalTerms && (
              <TextBox
                label="شروط تکمیلی"
                value={
                  contract.draft.additionalTerms
                }
              />
            )}
          </section>

          {previousVersion && (
            <section className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-center gap-2">
                <History
                  size={18}
                  className="text-violet-600"
                />

                <h3 className="font-black text-slate-900">
                  تغییرات نسخه جدید
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                <ContractChanges
                  previous={
                    previousVersion.draft
                  }
                  current={
                    contract.draft
                  }
                />
              </div>
            </section>
          )}

          <section className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2">
              <Clock3
                size={18}
                className="text-blue-600"
              />

              <h3 className="font-black text-slate-900">
                تاریخچه
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {[...
                contract.auditTrail,
              ]
                .reverse()
                .map(
                  (
                    event
                  ) => (
                    <div
                      key={
                        event.id
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-bold leading-6 text-slate-800">
                        {
                          event.label
                        }
                      </p>

                      <p className="mt-1 text-[11px] font-semibold text-slate-400">
                        {
                          formatDateTime(
                            event.createdAt
                          )
                        }
                      </p>
                    </div>
                  )
                )}
            </div>
          </section>

          {error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          {canApprove && (
            <div className="mt-6">
              {!requestChanges ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={
                      handleApprove
                    }
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700"
                  >
                    <CheckCircle2
                      size={18}
                    />

                    تأیید نسخه قرارداد
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRequestChanges(
                        true
                      )
                    }
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-black text-amber-700"
                  >
                    <MessageSquareText
                      size={18}
                    />

                    درخواست اصلاح
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <label className="text-sm font-black text-amber-900">
                    موارد مورد نیاز برای اصلاح
                  </label>

                  <textarea
                    rows={4}
                    value={
                      feedback
                    }
                    onChange={(
                      event
                    ) => {
                      setFeedback(
                        event.target.value
                      )

                      setError(
                        null
                      )
                    }}
                    className="mt-3 w-full resize-none rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={
                        handleRequestChanges
                      }
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-black text-white"
                    >
                      <Send
                        size={16}
                      />

                      ارسال درخواست اصلاح
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setRequestChanges(
                          false
                        )
                      }
                      className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {contract.status ===
            'completed' && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={20}
                  className="text-emerald-600"
                />

                <p className="font-black text-emerald-900">
                  قرارداد تکمیل شده است
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function Info({
  label,
  value,
}: {
  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-bold text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-black leading-6 text-slate-900">
        {value}
      </p>
    </div>
  )
}

function TextBox({
  label,
  value,
}: {
  label:
    string

  value:
    string
}) {
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black text-slate-600">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-800">
        {value}
      </p>
    </div>
  )
}

function ContractChanges({
  previous,
  current,
}: {
  previous:
    OnlineContractDraft

  current:
    OnlineContractDraft
}) {
  const changes: Array<{
    label:
      string

    before:
      string

    after:
      string
  }> = []

  if (
    previous.subject !==
    current.subject
  ) {
    changes.push({
      label:
        'موضوع قرارداد',

      before:
        previous.subject,

      after:
        current.subject,
    })
  }

  if (
    previous.scope !==
    current.scope
  ) {
    changes.push({
      label:
        'دامنه خدمات',

      before:
        previous.scope,

      after:
        current.scope,
    })
  }

  if (
    previous.feeToman !==
    current.feeToman
  ) {
    changes.push({
      label:
        'حق‌الزحمه',

      before:
        `${previous.feeToman.toLocaleString(
          'fa-IR'
        )} تومان`,

      after:
        `${current.feeToman.toLocaleString(
          'fa-IR'
        )} تومان`,
    })
  }

  if (
    previous.paymentDetails !==
    current.paymentDetails
  ) {
    changes.push({
      label:
        'شرایط پرداخت',

      before:
        previous.paymentDetails,

      after:
        current.paymentDetails,
    })
  }

  if (
    previous.servicePeriod !==
    current.servicePeriod
  ) {
    changes.push({
      label:
        'مدت خدمات',

      before:
        previous.servicePeriod,

      after:
        current.servicePeriod,
    })
  }

  if (
    (
      previous.additionalTerms ??
      ''
    ) !==
    (
      current.additionalTerms ??
      ''
    )
  ) {
    changes.push({
      label:
        'شروط تکمیلی',

      before:
        previous.additionalTerms ||
        '—',

      after:
        current.additionalTerms ||
        '—',
    })
  }

  if (
    changes.length ===
    0
  ) {
    return (
      <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
        تغییری در محتوای اصلی قرارداد
        ایجاد نشده است.
      </p>
    )
  }

  return (
    <>
      {changes.map(
        (
          change
        ) => (
          <div
            key={
              change.label
            }
            className="rounded-xl border border-violet-100 bg-violet-50/50 p-4"
          >
            <p className="text-sm font-black text-violet-900">
              {
                change.label
              }
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <p className="text-[10px] font-black text-slate-400">
                  نسخه قبل
                </p>

                <p className="mt-1 text-xs font-semibold leading-6 text-slate-600">
                  {
                    change.before
                  }
                </p>
              </div>

              <div className="rounded-lg border border-violet-200 bg-white p-3">
                <p className="text-[10px] font-black text-violet-600">
                  نسخه جدید
                </p>

                <p className="mt-1 text-xs font-bold leading-6 text-slate-800">
                  {
                    change.after
                  }
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </>
  )
}