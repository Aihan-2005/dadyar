'use client'

import {
  useEffect,
  useState,
} from 'react'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Send,
  UserRound,
  X,
  XCircle,
} from 'lucide-react'

import {
  rejectMockOnlineContract,
  reviewMockOnlineContract,
  signMockOnlineContractByLawyer,
} from '@/features/client-portal/data/mock-online-contracts'

import type {
  OnlineContractPaymentMode,
  OnlineContractRecord,
} from '@/features/client-portal/types/contract'

import {
  formatMoneyInput,
  toOptionalFiniteNumber,
} from '@/features/finance/utils/number'

interface OnlineContractReviewModalProps {
  contract:
    OnlineContractRecord | null

  onClose:
    () => void

  onUpdated:
    () => void
}

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition disabled:bg-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

const TEXTAREA_CLASS =
  'w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-900 outline-none transition disabled:bg-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

function getStatusLabel(
  status:
    OnlineContractRecord['status']
): string {
  switch (
    status
  ) {
    case 'waiting_lawyer_review':
      return 'در انتظار بررسی شما'

    case 'waiting_client_approval':
      return 'در انتظار تأیید موکل'

    case 'waiting_lawyer_signature':
      return 'نیازمند تأیید نهایی شما'

    case 'completed':
      return 'تکمیل‌شده'

    case 'rejected':
      return 'رد شده'

    case 'cancelled':
      return 'لغوشده'
  }
}

export default function OnlineContractReviewModal({
  contract,
  onClose,
  onUpdated,
}: OnlineContractReviewModalProps) {
  const [
    subject,
    setSubject,
  ] =
    useState(
      ''
    )

  const [
    scope,
    setScope,
  ] =
    useState(
      ''
    )

  const [
    feeInput,
    setFeeInput,
  ] =
    useState(
      ''
    )

  const [
    paymentMode,
    setPaymentMode,
  ] =
    useState<OnlineContractPaymentMode>(
      'full'
    )

  const [
    paymentDetails,
    setPaymentDetails,
  ] =
    useState(
      ''
    )

  const [
    servicePeriod,
    setServicePeriod,
  ] =
    useState(
      ''
    )

  const [
    additionalTerms,
    setAdditionalTerms,
  ] =
    useState(
      ''
    )

  const [
    rejectionReason,
    setRejectionReason,
  ] =
    useState(
      ''
    )

  const [
    showReject,
    setShowReject,
  ] =
    useState(
      false
    )

  const [
    confirmFinal,
    setConfirmFinal,
  ] =
    useState(
      false
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
    if (!contract) {
      return
    }

    setSubject(
      contract.draft.subject
    )

    setScope(
      contract.draft.scope
    )

    setFeeInput(
      formatMoneyInput(
        contract.draft.feeToman
      )
    )

    setPaymentMode(
      contract.draft.paymentMode
    )

    setPaymentDetails(
      contract.draft.paymentDetails
    )

    setServicePeriod(
      contract.draft.servicePeriod
    )

    setAdditionalTerms(
      contract.draft.additionalTerms ??
        ''
    )

    setRejectionReason(
      ''
    )

    setShowReject(
      false
    )

    setConfirmFinal(
      false
    )

    setError(
      null
    )
  }, [
    contract,
  ])

  if (!contract) {
    return null
  }

  const editable =
    contract.status ===
    'waiting_lawyer_review'

  const handleReview =
    () => {
      const fee =
        toOptionalFiniteNumber(
          feeInput
        )

      if (
        subject.trim().length <
        5
      ) {
        setError(
          'موضوع قرارداد را کامل کنید.'
        )

        return
      }

      if (
        scope.trim().length <
        20
      ) {
        setError(
          'دامنه خدمات را کامل کنید.'
        )

        return
      }

      if (
        !fee ||
        fee <=
          0
      ) {
        setError(
          'مبلغ قرارداد معتبر نیست.'
        )

        return
      }

      try {
        reviewMockOnlineContract(
          contract.id,

          {
            subject:
              subject.trim(),

            scope:
              scope.trim(),

            feeToman:
              fee,

            paymentMode,

            paymentDetails:
              paymentDetails.trim(),

            servicePeriod:
              servicePeriod.trim(),

            additionalTerms:
              additionalTerms.trim() ||
              undefined,
          }
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
            : 'خطا در ثبت قرارداد.'
        )
      }
    }

  const handleReject =
    () => {
      try {
        rejectMockOnlineContract(
          contract.id,
          rejectionReason
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
            : 'خطا در رد قرارداد.'
        )
      }
    }

  const handleFinalConfirmation =
    () => {
      if (!confirmFinal) {
        setError(
          'تأیید نهایی قرارداد را انتخاب کنید.'
        )

        return
      }

      try {
        signMockOnlineContractByLawyer(
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
            : 'خطا در تکمیل قرارداد.'
        )
      }
    }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 sm:items-center sm:p-4"
      onMouseDown={
        onClose
      }
    >
      <section
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
              بررسی قرارداد
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
                getStatusLabel(
                  contract.status
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
          {contract.clientFeedback && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-black text-amber-700">
                درخواست اصلاح موکل
              </p>

              <p className="mt-2 text-sm font-semibold leading-7 text-amber-900">
                {
                  contract.clientFeedback
                }
              </p>
            </div>
          )}

          <Section
            icon={
              UserRound
            }
            title="طرفین قرارداد"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Info
                label="موکل"
                value={
                  contract.draft.client.fullName
                }
              />

              <Info
                label="موبایل"
                value={
                  contract.draft.client.phone
                }
              />

              <Info
                label="کد ملی"
                value={
                  contract.draft.client.nationalId
                }
              />
            </div>
          </Section>

          <Section
            icon={
              FileText
            }
            title="موضوع و دامنه خدمات"
          >
            <Field label="موضوع قرارداد">
              <input
                disabled={
                  !editable
                }
                value={
                  subject
                }
                onChange={(
                  event
                ) =>
                  setSubject(
                    event.target.value
                  )
                }
                className={
                  INPUT_CLASS
                }
              />
            </Field>

            <div className="mt-3">
              <Field label="دامنه خدمات">
                <textarea
                  disabled={
                    !editable
                  }
                  rows={5}
                  value={
                    scope
                  }
                  onChange={(
                    event
                  ) =>
                    setScope(
                      event.target.value
                    )
                  }
                  className={
                    TEXTAREA_CLASS
                  }
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={
              CircleDollarSign
            }
            title="شرایط مالی"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="حق‌الزحمه">
                <input
                  disabled={
                    !editable
                  }
                  value={
                    feeInput
                  }
                  onChange={(
                    event
                  ) =>
                    setFeeInput(
                      formatMoneyInput(
                        event.target.value
                      )
                    )
                  }
                  dir="ltr"
                  className={
                    INPUT_CLASS
                  }
                />
              </Field>

              <Field label="روش پرداخت">
                <select
                  disabled={
                    !editable
                  }
                  value={
                    paymentMode
                  }
                  onChange={(
                    event
                  ) =>
                    setPaymentMode(
                      event.target
                        .value as OnlineContractPaymentMode
                    )
                  }
                  className={
                    INPUT_CLASS
                  }
                >
                  <option value="full">
                    پرداخت کامل
                  </option>

                  <option value="staged">
                    پرداخت مرحله‌ای
                  </option>

                  <option value="installments">
                    پرداخت اقساطی
                  </option>
                </select>
              </Field>
            </div>

            <div className="mt-3">
              <Field label="جزئیات پرداخت">
                <textarea
                  disabled={
                    !editable
                  }
                  rows={2}
                  value={
                    paymentDetails
                  }
                  onChange={(
                    event
                  ) =>
                    setPaymentDetails(
                      event.target.value
                    )
                  }
                  className={
                    TEXTAREA_CLASS
                  }
                />
              </Field>
            </div>

            <div className="mt-3">
              <Field label="مدت خدمات">
                <input
                  disabled={
                    !editable
                  }
                  value={
                    servicePeriod
                  }
                  onChange={(
                    event
                  ) =>
                    setServicePeriod(
                      event.target.value
                    )
                  }
                  className={
                    INPUT_CLASS
                  }
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={
              CheckCircle2
            }
            title="شروط تکمیلی"
          >
            <textarea
              disabled={
                !editable
              }
              rows={3}
              value={
                additionalTerms
              }
              onChange={(
                event
              ) =>
                setAdditionalTerms(
                  event.target.value
                )
              }
              className={
                TEXTAREA_CLASS
              }
            />
          </Section>

          <Section
            icon={
              Clock3
            }
            title="تاریخچه قرارداد"
          >
            <div className="space-y-3">
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
                      <p className="text-sm font-bold text-slate-800">
                        {
                          event.label
                        }
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
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
                            event.createdAt
                          )
                        )}
                      </p>
                    </div>
                  )
                )}
            </div>
          </Section>

          {error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          {editable && (
            <>
              {!showReject ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button
                    type="button"
                    onClick={
                      handleReview
                    }
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
                  >
                    <Send
                      size={18}
                    />

                    ارسال نسخه برای موکل
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowReject(
                        true
                      )
                    }
                    className="flex h-12 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-red-600"
                  >
                    <XCircle
                      size={18}
                    />

                    رد قرارداد
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                  <textarea
                    rows={3}
                    value={
                      rejectionReason
                    }
                    onChange={(
                      event
                    ) =>
                      setRejectionReason(
                        event.target.value
                      )
                    }
                    placeholder="دلیل رد قرارداد..."
                    className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm"
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={
                        handleReject
                      }
                      className="h-11 rounded-xl bg-red-600 px-5 text-sm font-black text-white"
                    >
                      رد قرارداد
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowReject(
                          false
                        )
                      }
                      className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {contract.status ===
            'waiting_lawyer_signature' && (
            <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    confirmFinal
                  }
                  onChange={(
                    event
                  ) =>
                    setConfirmFinal(
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-violet-600"
                />

                <span className="text-sm font-semibold leading-6 text-violet-900">
                  نسخه تأییدشده توسط موکل را
                  بررسی کرده‌ام و تأیید نهایی
                  می‌کنم.
                </span>
              </label>

              <button
                type="button"
                onClick={
                  handleFinalConfirmation
                }
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-black text-white"
              >
                <CheckCircle2
                  size={18}
                />

                تأیید نهایی و تکمیل قرارداد
              </button>
            </div>
          )}

          {contract.status ===
            'completed' && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-800">
              قرارداد با موفقیت تکمیل شده است.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function Section({
  icon:
    Icon,
  title,
  children,
}: {
  icon:
    LucideIcon

  title:
    string

  children:
    React.ReactNode
}) {
  return (
    <section className="mt-6 border-t border-slate-200 pt-5 first:mt-0 first:border-0 first:pt-0">
      <div className="mb-4 flex items-center gap-2">
        <Icon
          size={18}
          className="text-blue-600"
        />

        <h3 className="font-black text-slate-900">
          {title}
        </h3>
      </div>

      {children}
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label:
    string

  children:
    React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>

      {children}
    </label>
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
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-bold text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  )
}