'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  CheckCircle2,
  Clock3,
  FileQuestion,
  MessageSquareText,
  PhoneCall,
  Send,
} from 'lucide-react'

import ClientAuthGateModal from '@/components/client-portal/ClientAuthGateModal'

import {
  getCurrentClientPortalAccount,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  createInitialLawyerRequest,
} from '@/features/client-portal/data/client-communication.repository'

import type {
  ClientCallbackWindow,
  ClientPreferredContactMethod,
  ClientRequestUrgency,
  InitialLawyerRequestRecord,
  LegalCaseStage,
  LegalMatterCategory,
} from '@/features/client-portal/types/communication'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'

import {
  CALLBACK_WINDOW_LABELS,
  CASE_STAGE_LABELS,
  CONTACT_METHOD_LABELS,
  LEGAL_CATEGORY_LABELS,
  REQUEST_URGENCY_LABELS,
} from '@/features/client-portal/utils/communication'

interface LawyerInquiryPanelProps {
  lawyer:
    ClientPortalLawyer
}

const INPUT_CLASS =
  'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

export default function LawyerInquiryPanel({
  lawyer,
}: LawyerInquiryPanelProps) {
  const [
    category,
    setCategory,
  ] =
    useState<LegalMatterCategory>(
      'other'
    )

  const [
    caseStage,
    setCaseStage,
  ] =
    useState<LegalCaseStage>(
      'pre_filing'
    )

  const [
    opposingPartyName,
    setOpposingPartyName,
  ] =
    useState('')

  const [
    urgency,
    setUrgency,
  ] =
    useState<ClientRequestUrgency>(
      'normal'
    )

  const [
    contactMethod,
    setContactMethod,
  ] =
    useState<ClientPreferredContactMethod>(
      'written_response'
    )

  const [
    callbackWindow,
    setCallbackWindow,
  ] =
    useState<ClientCallbackWindow>(
      'afternoon'
    )

  const [
    subject,
    setSubject,
  ] =
    useState('')

  const [
    description,
    setDescription,
  ] =
    useState('')

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    )

  const [
    authOpen,
    setAuthOpen,
  ] =
    useState(false)

  const [
    createdRequest,
    setCreatedRequest,
  ] =
    useState<InitialLawyerRequestRecord | null>(
      null
    )

  useEffect(() => {
    setCategory(
      'other'
    )

    setCaseStage(
      'pre_filing'
    )

    setOpposingPartyName(
      ''
    )

    setUrgency(
      'normal'
    )

    setContactMethod(
      'written_response'
    )

    setCallbackWindow(
      'afternoon'
    )

    setSubject(
      ''
    )

    setDescription(
      ''
    )

    setError(
      null
    )

    setAuthOpen(
      false
    )

    setCreatedRequest(
      null
    )
  }, [
    lawyer.id,
  ])

  const validate =
    (): boolean => {
      setError(
        null
      )

      if (
        subject.trim().length <
        5
      ) {
        setError(
          'موضوع درخواست را کامل‌تر وارد کنید.'
        )

        return false
      }

      if (
        description.trim().length <
        20
      ) {
        setError(
          'برای بررسی بهتر، شرح مسئله را حداقل در ۲۰ کاراکتر بنویسید.'
        )

        return false
      }

      return true
    }

  const completeSubmission =
    (
      account:
        ClientPortalAccount
    ) => {
      try {
        const created =
          createInitialLawyerRequest(
            account,
            lawyer,
            {
              category,

              caseStage,

              opposingPartyName:
                opposingPartyName.trim() ||
                undefined,

              urgency,

              preferredContactMethod:
                contactMethod,

              callbackWindow:
                contactMethod ===
                'phone_callback'
                  ? callbackWindow
                  : undefined,

              subject,

              description,
            }
          )

        setCreatedRequest(
          created
        )

        setAuthOpen(
          false
        )

        setError(
          null
        )
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'ثبت درخواست انجام نشد.'
        )
      }
    }

  const handleSubmit =
    () => {
      if (!validate()) {
        return
      }

      const account =
        getCurrentClientPortalAccount()

      if (!account) {
        setAuthOpen(
          true
        )

        return
      }

      completeSubmission(
        account
      )
    }

  if (createdRequest) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={25}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-emerald-950">
              درخواست برای وکیل ارسال شد
            </h3>

            <p className="mt-2 text-sm font-semibold leading-7 text-emerald-800">
              می‌توانید وضعیت بررسی و پیام‌های
              مربوط به این درخواست را از صفحه
              پیگیری مشاهده کنید.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SummaryItem
                label="کد پیگیری"
                value={
                  createdRequest.reference
                }
                dir="ltr"
              />

              <SummaryItem
                label="حوزه حقوقی"
                value={
                  LEGAL_CATEGORY_LABELS[
                    createdRequest.category
                  ]
                }
              />

              <SummaryItem
                label="روش پاسخ"
                value={
                  CONTACT_METHOD_LABELS[
                    createdRequest.preferredContactMethod
                  ]
                }
              />

              <SummaryItem
                label="اولویت"
                value={
                  REQUEST_URGENCY_LABELS[
                    createdRequest.urgency
                  ]
                }
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/client-portal/requests/${createdRequest.id}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-black text-white"
              >
                مشاهده و پیگیری
              </Link>

              <button
                type="button"
                onClick={() => {
                  setCreatedRequest(
                    null
                  )

                  setSubject(
                    ''
                  )

                  setDescription(
                    ''
                  )
                }}
                className="h-11 rounded-xl border border-emerald-300 bg-white px-5 text-sm font-black text-emerald-700"
              >
                درخواست جدید
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <FileQuestion
              size={21}
            />
          </div>

          <div>
            <p className="text-xs font-black text-blue-700">
              بررسی اولیه
            </p>

            <h3 className="mt-1 text-lg font-black text-slate-950">
              درخواست بررسی موضوع حقوقی
            </h3>

            <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
              اطلاعات اولیه موضوع را ثبت کنید
              تا وکیل قبل از ارتباط، دید
              دقیق‌تری نسبت به درخواست شما
              داشته باشد.
            </p>
          </div>
        </div>

        {!lawyer.acceptsNewClients && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
            این وکیل در حال حاضر پذیرش درخواست
            جدید ندارد.
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <SelectField
            label="حوزه حقوقی"
            value={
              category
            }
            onChange={(
              value
            ) =>
              setCategory(
                value as LegalMatterCategory
              )
            }
            options={
              LEGAL_CATEGORY_LABELS
            }
          />

          <SelectField
            label="مرحله فعلی"
            value={
              caseStage
            }
            onChange={(
              value
            ) =>
              setCaseStage(
                value as LegalCaseStage
              )
            }
            options={
              CASE_STAGE_LABELS
            }
          />

          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              طرف مقابل
            </span>

            <input
              value={
                opposingPartyName
              }
              onChange={(
                event
              ) =>
                setOpposingPartyName(
                  event.target.value.slice(
                    0,
                    120
                  )
                )
              }
              placeholder="نام شخص یا شرکت، در صورت وجود"
              className={
                INPUT_CLASS
              }
            />
          </label>

          <SelectField
            label="میزان فوریت"
            value={
              urgency
            }
            onChange={(
              value
            ) =>
              setUrgency(
                value as ClientRequestUrgency
              )
            }
            options={
              REQUEST_URGENCY_LABELS
            }
          />
        </div>

        <div className="mt-5">
          <p className="text-sm font-black text-slate-700">
            روش ارتباط ترجیحی
          </p>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                setContactMethod(
                  'written_response'
                )
              }
              className={`rounded-xl border p-4 text-right transition ${
                contactMethod ===
                'written_response'
                  ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100'
                  : 'border-slate-200 bg-white hover:border-blue-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquareText
                  size={18}
                  className="text-blue-600"
                />

                <span className="text-sm font-black">
                  پاسخ کتبی
                </span>
              </div>

              <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">
                موضوع برای وکیل ارسال می‌شود
                و ادامه گفتگو از طریق درخواست
                قابل پیگیری است.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setContactMethod(
                  'phone_callback'
                )
              }
              className={`rounded-xl border p-4 text-right transition ${
                contactMethod ===
                'phone_callback'
                  ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100'
                  : 'border-slate-200 bg-white hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <PhoneCall
                  size={18}
                  className="text-emerald-600"
                />

                <span className="text-sm font-black">
                  درخواست تماس
                </span>
              </div>

              <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">
                بازه مناسب تماس را مشخص کنید
                تا همراه درخواست برای وکیل
                ارسال شود.
              </p>
            </button>
          </div>
        </div>

        {contactMethod ===
          'phone_callback' && (
          <div className="mt-5">
            <p className="flex items-center gap-2 text-sm font-black text-slate-700">
              <Clock3
                size={17}
                className="text-emerald-600"
              />

              زمان مناسب تماس
            </p>

            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {(
                Object.entries(
                  CALLBACK_WINDOW_LABELS
                ) as Array<
                  [
                    ClientCallbackWindow,
                    string,
                  ]
                >
              ).map(
                (
                  [
                    value,
                    label,
                  ]
                ) => (
                  <button
                    key={
                      value
                    }
                    type="button"
                    onClick={() =>
                      setCallbackWindow(
                        value
                      )
                    }
                    className={`rounded-xl border px-3 py-3 text-sm font-black transition ${
                      callbackWindow ===
                      value
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-black text-slate-700">
            موضوع درخواست
          </span>

          <input
            value={
              subject
            }
            onChange={(
              event
            ) => {
              setSubject(
                event.target.value.slice(
                  0,
                  140
                )
              )

              setError(
                null
              )
            }}
            placeholder="مثلاً بررسی قرارداد خرید ملک"
            className={
              INPUT_CLASS
            }
          />
        </label>

        <label className="mt-4 block">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-black text-slate-700">
              شرح موضوع
            </span>

            <span className="text-[11px] font-semibold text-slate-400">
              {description.length.toLocaleString(
                'fa-IR'
              )}
              {' / '}
              ۱۵۰۰
            </span>
          </div>

          <textarea
            rows={5}
            value={
              description
            }
            onChange={(
              event
            ) => {
              setDescription(
                event.target.value.slice(
                  0,
                  1500
                )
              )

              setError(
                null
              )
            }}
            placeholder="شرح مختصری از اتفاق، وضعیت فعلی و چیزی که از وکیل انتظار دارید..."
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={
            !lawyer.acceptsNewClients
          }
          onClick={
            handleSubmit
          }
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Send
            size={18}
          />

          ارسال درخواست برای وکیل
        </button>
      </section>

      <ClientAuthGateModal
        open={
          authOpen
        }
        title="برای ارسال درخواست وارد شوید"
        onClose={() =>
          setAuthOpen(
            false
          )
        }
        onAuthenticated={
          completeSubmission
        }
      />
    </>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label:
    string

  value:
    string

  options:
    Record<
      string,
      string
    >

  onChange:
    (
      value:
        string
    ) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>

      <select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className={
          INPUT_CLASS
        }
      >
        {Object.entries(
          options
        ).map(
          (
            [
              optionValue,
              optionLabel,
            ]
          ) => (
            <option
              key={
                optionValue
              }
              value={
                optionValue
              }
            >
              {optionLabel}
            </option>
          )
        )}
      </select>
    </label>
  )
}

function SummaryItem({
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
    <div className="rounded-xl border border-emerald-200 bg-white p-3">
      <p className="text-[11px] font-bold text-emerald-700">
        {label}
      </p>

      <p
        dir={
          dir
        }
        className="mt-1.5 break-words text-sm font-black text-slate-900"
      >
        {value}
      </p>
    </div>
  )
}