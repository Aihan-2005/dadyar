'use client'

import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Loader2,
  Send,
  UserRound,
  X,
  XCircle,
} from 'lucide-react'

import type {
  OnlineContractPaymentMode,
  OnlineContractRecord,
} from '@/features/client-portal/types/contract'

import {
  formatMoneyInput,
  toOptionalFiniteNumber,
} from '@/features/finance/utils/number'

import {
  rejectLawyerOnlineContract,
  reviewLawyerOnlineContract,
  signLawyerOnlineContract,
} from '@/services/online-contract.service'


interface OnlineContractReviewModalProps {
  contract:
    OnlineContractRecord |
    null

  onClose:
    () => void

  onUpdated:
    () =>
      void |
      Promise<void>
}


type PendingAction =
  | 'review'
  | 'reject'
  | 'sign'
  | null


const INPUT_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'


const TEXTAREA_CLASS =
  'w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'


function getStatusLabel(
  status:
    OnlineContractRecord['status'],
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


function formatAuditDate(
  value:
    string,
): string {
  const date =
    new Date(
      value,
    )


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—'
  }


  return new Intl.DateTimeFormat(
    'fa-IR',

    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    },
  ).format(
    date,
  )
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
      '',
    )


  const [
    scope,
    setScope,
  ] =
    useState(
      '',
    )


  const [
    feeInput,
    setFeeInput,
  ] =
    useState(
      '',
    )


  const [
    paymentMode,
    setPaymentMode,
  ] =
    useState<OnlineContractPaymentMode>(
      'full',
    )


  const [
    paymentDetails,
    setPaymentDetails,
  ] =
    useState(
      '',
    )


  const [
    servicePeriod,
    setServicePeriod,
  ] =
    useState(
      '',
    )


  const [
    additionalTerms,
    setAdditionalTerms,
  ] =
    useState(
      '',
    )


  const [
    rejectionReason,
    setRejectionReason,
  ] =
    useState(
      '',
    )


  const [
    showReject,
    setShowReject,
  ] =
    useState(
      false,
    )


  const [
    confirmFinal,
    setConfirmFinal,
  ] =
    useState(
      false,
    )


  const [
    pendingAction,
    setPendingAction,
  ] =
    useState<PendingAction>(
      null,
    )


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )


  useEffect(
    () => {
      if (
        !contract
      ) {
        return
      }


      setSubject(
        contract.draft.subject,
      )


      setScope(
        contract.draft.scope,
      )


      setFeeInput(
        formatMoneyInput(
          contract.draft.feeToman,
        ),
      )


      setPaymentMode(
        contract.draft.paymentMode,
      )


      setPaymentDetails(
        contract.draft.paymentDetails,
      )


      setServicePeriod(
        contract.draft.servicePeriod,
      )


      setAdditionalTerms(
        contract.draft.additionalTerms ??
          '',
      )


      setRejectionReason(
        '',
      )


      setShowReject(
        false,
      )


      setConfirmFinal(
        false,
      )


      setPendingAction(
        null,
      )


      setError(
        null,
      )
    },

    [
      contract,
    ],
  )


  useEffect(
    () => {
      if (
        !contract
      ) {
        return
      }


      const previousOverflow =
        document.body.style.overflow


      const handleKeyDown =
        (
          event:
            KeyboardEvent,
        ) => {
          if (
            event.key ===
              'Escape' &&
            !pendingAction
          ) {
            onClose()
          }
        }


      document.body.style.overflow =
        'hidden'


      window.addEventListener(
        'keydown',

        handleKeyDown,
      )


      return () => {
        document.body.style.overflow =
          previousOverflow


        window.removeEventListener(
          'keydown',

          handleKeyDown,
        )
      }
    },

    [
      contract,
      onClose,
      pendingAction,
    ],
  )


  if (
    !contract
  ) {
    return null
  }


  const editable =
    contract.status ===
    'waiting_lawyer_review'


  const canFinalSign =
    contract.status ===
    'waiting_lawyer_signature'


  const busy =
    pendingAction !==
    null


  const handleReview =
    async () => {
      if (
        !editable ||
        busy
      ) {
        return
      }


      const normalizedSubject =
        subject.trim()


      const normalizedScope =
        scope.trim()


      const normalizedPaymentDetails =
        paymentDetails.trim()


      const normalizedServicePeriod =
        servicePeriod.trim()


      const normalizedAdditionalTerms =
        additionalTerms.trim()


      const fee =
        toOptionalFiniteNumber(
          feeInput,
        )


      if (
        normalizedSubject.length <
        5
      ) {
        setError(
          'موضوع قرارداد را کامل کنید.',
        )

        return
      }


      if (
        normalizedScope.length <
        20
      ) {
        setError(
          'دامنه خدمات باید حداقل ۲۰ کاراکتر باشد.',
        )

        return
      }


      if (
        !fee ||
        fee <=
          0
      ) {
        setError(
          'مبلغ قرارداد معتبر نیست.',
        )

        return
      }


      if (
        normalizedServicePeriod.length <
        3
      ) {
        setError(
          'مدت خدمات را مشخص کنید.',
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
          'جزئیات پرداخت را کامل وارد کنید.',
        )

        return
      }


      setPendingAction(
        'review',
      )


      setError(
        null,
      )


      try {
        await reviewLawyerOnlineContract(
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
              normalizedAdditionalTerms ||
              undefined,
          },
        )


        await onUpdated()


        onClose()
      } catch (
        caughtError:
          unknown
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'خطا در ثبت بررسی قرارداد.',
        )
      } finally {
        setPendingAction(
          null,
        )
      }
    }


  const handleReject =
    async () => {
      if (
        !editable ||
        busy
      ) {
        return
      }


      const reason =
        rejectionReason.trim()


      if (
        reason.length <
        5
      ) {
        setError(
          'دلیل رد قرارداد را کامل وارد کنید.',
        )

        return
      }


      setPendingAction(
        'reject',
      )


      setError(
        null,
      )


      try {
        await rejectLawyerOnlineContract(
          contract.id,

          reason,
        )


        await onUpdated()


        onClose()
      } catch (
        caughtError:
          unknown
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'خطا در رد قرارداد.',
        )
      } finally {
        setPendingAction(
          null,
        )
      }
    }


  const handleFinalConfirmation =
    async () => {
      if (
        !canFinalSign ||
        busy
      ) {
        return
      }


      if (
        !confirmFinal
      ) {
        setError(
          'تأیید نهایی قرارداد را انتخاب کنید.',
        )

        return
      }


      setPendingAction(
        'sign',
      )


      setError(
        null,
      )


      try {
        await signLawyerOnlineContract(
          contract.id,
        )


        await onUpdated()


        onClose()
      } catch (
        caughtError:
          unknown
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'خطا در تکمیل قرارداد.',
        )
      } finally {
        setPendingAction(
          null,
        )
      }
    }


  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={() => {
        if (
          !busy
        ) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="online-contract-review-title"
        onMouseDown={(
          event,
        ) => {
          event.stopPropagation()
        }}
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

            <h2
              id="online-contract-review-title"
              className="mt-1 text-xl font-black text-slate-950"
            >
              بررسی قرارداد
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              نسخه
              {' '}
              {
                contract.version.toLocaleString(
                  'fa-IR',
                )
              }

              {' • '}

              {
                getStatusLabel(
                  contract.status,
                )
              }
            </p>
          </div>


          <button
            type="button"
            disabled={
              busy
            }
            onClick={
              onClose
            }
            aria-label="بستن"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X
              size={20}
            />
          </button>
        </header>


        <div className="p-5 sm:p-6">
          {
            contract.clientFeedback &&
            (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black text-amber-700">
                  درخواست اصلاح موکل
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-amber-900">
                  {
                    contract.clientFeedback
                  }
                </p>
              </div>
            )
          }


          <Section
            icon={
              <UserRound
                size={18}
              />
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
                label="موبایل"
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
                  contract.draft.lawyer.licenseNumber ||
                  '—'
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


          <Section
            icon={
              <FileText
                size={18}
              />
            }
            title="موضوع و دامنه خدمات"
          >
            <Field label="موضوع قرارداد">
              <input
                disabled={
                  !editable ||
                  busy
                }
                value={
                  subject
                }
                maxLength={
                  180
                }
                onChange={(
                  event,
                ) => {
                  setSubject(
                    event.target.value,
                  )

                  setError(
                    null,
                  )
                }}
                className={
                  INPUT_CLASS
                }
              />
            </Field>


            <div className="mt-3">
              <Field label="دامنه خدمات">
                <textarea
                  disabled={
                    !editable ||
                    busy
                  }
                  rows={
                    5
                  }
                  value={
                    scope
                  }
                  maxLength={
                    1600
                  }
                  onChange={(
                    event,
                  ) => {
                    setScope(
                      event.target.value,
                    )

                    setError(
                      null,
                    )
                  }}
                  className={
                    TEXTAREA_CLASS
                  }
                />
              </Field>
            </div>
          </Section>


          <Section
            icon={
              <CircleDollarSign
                size={18}
              />
            }
            title="شرایط مالی"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="حق‌الزحمه">
                <input
                  disabled={
                    !editable ||
                    busy
                  }
                  value={
                    feeInput
                  }
                  inputMode="numeric"
                  dir="ltr"
                  onChange={(
                    event,
                  ) => {
                    setFeeInput(
                      formatMoneyInput(
                        event.target.value,
                      ),
                    )

                    setError(
                      null,
                    )
                  }}
                  className={
                    INPUT_CLASS
                  }
                />
              </Field>


              <Field label="روش پرداخت">
                <select
                  disabled={
                    !editable ||
                    busy
                  }
                  value={
                    paymentMode
                  }
                  onChange={(
                    event,
                  ) => {
                    setPaymentMode(
                      event.target.value as OnlineContractPaymentMode,
                    )

                    setError(
                      null,
                    )
                  }}
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
                    !editable ||
                    busy
                  }
                  rows={
                    2
                  }
                  value={
                    paymentDetails
                  }
                  maxLength={
                    1000
                  }
                  onChange={(
                    event,
                  ) => {
                    setPaymentDetails(
                      event.target.value,
                    )

                    setError(
                      null,
                    )
                  }}
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
                    !editable ||
                    busy
                  }
                  value={
                    servicePeriod
                  }
                  maxLength={
                    500
                  }
                  onChange={(
                    event,
                  ) => {
                    setServicePeriod(
                      event.target.value,
                    )

                    setError(
                      null,
                    )
                  }}
                  className={
                    INPUT_CLASS
                  }
                />
              </Field>
            </div>
          </Section>


          <Section
            icon={
              <CheckCircle2
                size={18}
              />
            }
            title="شروط تکمیلی"
          >
            <textarea
              disabled={
                !editable ||
                busy
              }
              rows={
                3
              }
              value={
                additionalTerms
              }
              maxLength={
                3000
              }
              onChange={(
                event,
              ) => {
                setAdditionalTerms(
                  event.target.value,
                )

                setError(
                  null,
                )
              }}
              className={
                TEXTAREA_CLASS
              }
            />
          </Section>


          <Section
            icon={
              <Clock3
                size={18}
              />
            }
            title="تاریخچه قرارداد"
          >
            <div className="space-y-3">
              {
                [
                  ...contract.auditTrail,
                ]
                  .reverse()
                  .map(
                    (
                      event,
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

                        <p className="mt-1 text-[11px] text-slate-400">
                          {
                            formatAuditDate(
                              event.createdAt,
                            )
                          }
                        </p>
                      </div>
                    ),
                  )
              }
            </div>
          </Section>


          {
            contract.status ===
              'rejected' &&
            contract.rejectionReason &&
            (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle
                    size={18}
                  />

                  <p className="font-black">
                    قرارداد رد شده است
                  </p>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-red-900">
                  {
                    contract.rejectionReason
                  }
                </p>
              </div>
            )
          }


          {
            error &&
            (
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
                {
                  error
                }
              </p>
            )
          }


          {
            editable &&
            (
              <>
                {
                  !showReject
                    ? (
                      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                        <button
                          type="button"
                          disabled={
                            busy
                          }
                          onClick={() => {
                            void handleReview()
                          }}
                          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {
                            pendingAction ===
                            'review'
                              ? (
                                <Loader2
                                  size={18}
                                  className="animate-spin"
                                />
                              )
                              : (
                                <Send
                                  size={18}
                                />
                              )
                          }

                          ارسال نسخه برای موکل
                        </button>


                        <button
                          type="button"
                          disabled={
                            busy
                          }
                          onClick={() => {
                            setShowReject(
                              true,
                            )

                            setError(
                              null,
                            )
                          }}
                          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle
                            size={18}
                          />

                          رد قرارداد
                        </button>
                      </div>
                    )
                    : (
                      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertTriangle
                            size={18}
                          />

                          <p className="font-black">
                            رد قرارداد
                          </p>
                        </div>


                        <textarea
                          rows={
                            3
                          }
                          disabled={
                            busy
                          }
                          value={
                            rejectionReason
                          }
                          maxLength={
                            2000
                          }
                          onChange={(
                            event,
                          ) => {
                            setRejectionReason(
                              event.target.value,
                            )

                            setError(
                              null,
                            )
                          }}
                          placeholder="دلیل رد قرارداد..."
                          className="mt-3 w-full resize-none rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:opacity-60"
                        />


                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={
                              busy
                            }
                            onClick={() => {
                              void handleReject()
                            }}
                            className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {
                              pendingAction ===
                              'reject'
                                ? (
                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />
                                )
                                : (
                                  <XCircle
                                    size={17}
                                  />
                                )
                            }

                            رد قرارداد
                          </button>


                          <button
                            type="button"
                            disabled={
                              busy
                            }
                            onClick={() => {
                              setShowReject(
                                false,
                              )

                              setRejectionReason(
                                '',
                              )

                              setError(
                                null,
                              )
                            }}
                            className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black disabled:opacity-60"
                          >
                            انصراف
                          </button>
                        </div>
                      </div>
                    )
                }
              </>
            )
          }


          {
            canFinalSign &&
            (
              <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    disabled={
                      busy
                    }
                    checked={
                      confirmFinal
                    }
                    onChange={(
                      event,
                    ) => {
                      setConfirmFinal(
                        event.target.checked,
                      )

                      setError(
                        null,
                      )
                    }}
                    className="mt-1 h-4 w-4 accent-violet-600"
                  />

                  <span className="text-sm font-semibold leading-6 text-violet-900">
                    نسخه تأییدشده توسط موکل را بررسی کرده‌ام و تأیید نهایی می‌کنم.
                  </span>
                </label>


                <button
                  type="button"
                  disabled={
                    busy
                  }
                  onClick={() => {
                    void handleFinalConfirmation()
                  }}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {
                    pendingAction ===
                    'sign'
                      ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      )
                      : (
                        <CheckCircle2
                          size={18}
                        />
                      )
                  }

                  تأیید نهایی و تکمیل قرارداد
                </button>
              </div>
            )
          }


          {
            contract.status ===
            'completed' &&
            (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-800">
                قرارداد با موفقیت تکمیل شده است.
              </div>
            )
          }
        </div>
      </section>
    </div>
  )
}


function Section({
  icon,
  title,
  children,
}: {
  icon:
    ReactNode

  title:
    string

  children:
    ReactNode
}) {
  return (
    <section className="mt-6 border-t border-slate-200 pt-5 first:mt-0 first:border-0 first:pt-0">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-blue-600">
          {
            icon
          }
        </span>

        <h3 className="font-black text-slate-900">
          {
            title
          }
        </h3>
      </div>

      {
        children
      }
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
    ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {
          label
        }
      </span>

      {
        children
      }
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
    | 'ltr'
    | 'rtl'
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-bold text-slate-500">
        {
          label
        }
      </p>

      <p
        dir={
          dir
        }
        className="mt-1.5 text-sm font-black leading-6 text-slate-900"
      >
        {
          value ||
          '—'
        }
      </p>
    </div>
  )
}