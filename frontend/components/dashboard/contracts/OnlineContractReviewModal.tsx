'use client'

import {
  useEffect,
  useState,
} from 'react'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  AlertTriangle,
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




const PAYMENT_LABELS:
  Record<
    OnlineContractPaymentMode,
    string
  > = {
    full:
      'پرداخت کامل',

    staged:
      'پرداخت مرحله‌ای',

    installments:
      'پرداخت اقساطی',
  }

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

const TEXTAREA_CLASS =
  'w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'


  

function getStatusLabel(
  status:
    OnlineContractRecord['status']
): string {
  switch (
    status
  ) {
    case 'waiting_lawyer_review':
      return 'در انتظار بررسی وکیل'

    case 'waiting_client_approval':
      return 'در انتظار تأیید موکل'

    case 'waiting_lawyer_signature':
      return 'در انتظار امضای وکیل'

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

    setError(
      null
    )
  }, [
    contract,
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

  if (!contract) {
    return null
  }

  const editable =
    contract.status ===
    'waiting_lawyer_review'


    

  const handleSendToClient =
    () => {
      setError(
        null
      )

      const normalizedSubject =
        subject.trim()

      const normalizedScope =
        scope.trim()

      const normalizedPaymentDetails =
        paymentDetails.trim()

      const normalizedServicePeriod =
        servicePeriod.trim()

      const fee =
        toOptionalFiniteNumber(
          feeInput
        )

      if (
        normalizedSubject.length <
        5
      ) {
        setError(
          'موضوع قرارداد را کامل وارد کنید.'
        )

        return
      }

      if (
        normalizedScope.length <
        20
      ) {
        setError(
          'دامنه خدمات باید حداقل ۲۰ کاراکتر باشد.'
        )

        return
      }

      if (
        !fee ||
        fee <=
          0
      ) {
        setError(
          'حق‌الزحمه معتبر وارد کنید.'
        )

        return
      }

      if (
        paymentMode !==
          'full' &&
        normalizedPaymentDetails.length <
          5
      ) {
        setError(
          'جزئیات پرداخت را تکمیل کنید.'
        )

        return
      }

      if (
        normalizedServicePeriod.length <
        3
      ) {
        setError(
          'مدت ارائه خدمات را مشخص کنید.'
        )

        return
      }

      try {
        reviewMockOnlineContract(
          contract.id,

          {
            subject:
              normalizedSubject,

            scope:
              normalizedScope,

            feeToman:
              fee,

            paymentMode,

            paymentDetails:
              paymentMode ===
              'full'
                ? normalizedPaymentDetails ||
                  'پرداخت کامل طبق توافق طرفین.'
                : normalizedPaymentDetails,

            servicePeriod:
              normalizedServicePeriod,

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
            : 'خطا در ثبت بررسی قرارداد.'
        )
      }
    }


    

  const handleReject =
    () => {
      setError(
        null
      )

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

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

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
        aria-labelledby="contract-review-title"
        onMouseDown={(
          event
        ) => {
          event.stopPropagation()
        }}
        className="max-h-[96dvh] w-full max-w-4xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
      >
        {/* Header */}

        <header className="sticky top-0 z-20 flex items-start justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div>
            <p className="text-xs font-black text-blue-700">
              {
                contract.reference
              }
            </p>

            <h2
              id="contract-review-title"
              className="mt-1 text-xl font-black text-slate-950"
            >
              بررسی قرارداد آنلاین
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
            aria-label="بستن"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          >
            <X
              size={20}
            />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          {/* ========================================================
           * Parties
           * ====================================================== */}

          <Section
            icon={
              UserRound
            }
            title="طرفین قرارداد"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info
                label="موکل"
                value={
                  contract.draft.client.fullName
                }
              />

              <Info
                label="موبایل موکل"
                value={
                  contract.draft.client.phone
                }
                dir="ltr"
              />

              <Info
                label="کد ملی"
                value={
                  contract.draft.client.nationalId
                }
                dir="ltr"
              />

              <Info
                label="وکیل"
                value={
                  contract.draft.lawyer.fullName
                }
              />

              <Info
                label="شماره پروانه"
                value={
                  contract.draft.lawyer.licenseNumber
                }
              />

              <Info
                label="تاریخ شروع"
                value={
                  contract.draft.startDate
                }
                dir="ltr"
              />
            </div>
          </Section>

          {/* ========================================================
           * Contract
           * ====================================================== */}

          <Section
            icon={
              FileText
            }
            title="متن و دامنه قرارداد"
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
                ) => {
                  setSubject(
                    event.target.value
                  )

                  setError(
                    null
                  )
                }}
                maxLength={
                  180
                }
                className={
                  INPUT_CLASS
                }
              />
            </Field>

            <div className="mt-4">
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
                  ) => {
                    setScope(
                      event.target.value
                    )

                    setError(
                      null
                    )
                  }}
                  maxLength={
                    1600
                  }
                  className={
                    TEXTAREA_CLASS
                  }
                />
              </Field>
            </div>
          </Section>

          {/* ========================================================
           * Finance
           * ====================================================== */}

          <Section
            icon={
              CircleDollarSign
            }
            title="حق‌الزحمه و شرایط پرداخت"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="حق‌الزحمه">
                <div className="relative">
                  <input
                    disabled={
                      !editable
                    }
                    value={
                      feeInput
                    }
                    onChange={(
                      event
                    ) => {
                      setFeeInput(
                        formatMoneyInput(
                          event.target.value
                        )
                      )

                      setError(
                        null
                      )
                    }}
                    inputMode="numeric"
                    dir="ltr"
                    className={`${INPUT_CLASS} pl-20`}
                  />

                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">
                    تومان
                  </span>
                </div>
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

            <div className="mt-4">
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

            <div className="mt-4">
              <Field label="مدت / محدوده زمانی خدمات">
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

          {/* Extra Terms */}

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
              placeholder="در صورت نیاز..."
              className={
                TEXTAREA_CLASS
              }
            />
          </Section>

          {/* ========================================================
           * Audit Trail
           * ====================================================== */}

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
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />

                      <div>
                        <p className="text-sm font-bold leading-6 text-slate-800">
                          {
                            event.label
                          }
                        </p>

                        <p className="mt-1 text-[11px] font-semibold text-slate-400">
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
                    </div>
                  )
                )}
            </div>
          </Section>

          {/* Error */}

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
            >
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              {error}
            </div>
          )}

          {/* ========================================================
           * Actions
           * ====================================================== */}

          {editable && (
            <>
              {!showReject ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button
                    type="button"
                    onClick={
                      handleSendToClient
                    }
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 px-5 text-sm font-black text-white shadow-md shadow-blue-100 transition hover:from-blue-700 hover:to-blue-800"
                  >
                    <Send
                      size={18}
                    />

                    تأیید و ارسال نسخه جدید برای موکل
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowReject(
                        true
                      )
                    }
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-red-600 transition hover:bg-red-100"
                  >
                    <XCircle
                      size={18}
                    />

                    رد قرارداد
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-black text-red-900">
                    دلیل رد قرارداد
                  </p>

                  <textarea
                    rows={3}
                    value={
                      rejectionReason
                    }
                    onChange={(
                      event
                    ) => {
                      setRejectionReason(
                        event.target.value
                      )

                      setError(
                        null
                      )
                    }}
                    placeholder="دلیل رد یا توضیح مورد نیاز برای موکل..."
                    className="mt-3 w-full resize-none rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-900 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
                  />

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={
                        handleReject
                      }
                      className="h-11 rounded-xl bg-red-600 px-5 text-sm font-black text-white hover:bg-red-700"
                    >
                      تأیید رد قرارداد
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowReject(
                          false
                        )

                        setError(
                          null
                        )
                      }}
                      className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!editable && (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
              این قرارداد از مرحله بررسی
              وکیل عبور کرده است و در حال
              حاضر امکان ویرایش آن از این
              مرحله وجود ندارد.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Shared
|--------------------------------------------------------------------------
*/

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
    <section className="mt-6 border-t border-slate-200 pt-5 first:mt-0 first:border-t-0 first:pt-0">
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
  dir,
}: {
  label:
    string

  value:
    string

  dir?:
    'rtl' | 'ltr'
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-bold text-slate-500">
        {label}
      </p>

      <p
        dir={
          dir
        }
        className="mt-1.5 text-sm font-black leading-6 text-slate-900"
      >
        {value}
      </p>
    </div>
  )
}