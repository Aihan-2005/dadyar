'use client'

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import Link from 'next/link'

import {
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Loader2,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import ClientAuthGateModal from '@/components/client-portal/ClientAuthGateModal'

import {
  getCurrentClientPortalAccount,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  ONLINE_CONTRACT_TEMPLATES,
  getOnlineContractTemplate,
} from '@/features/client-portal/data/contract-templates'

import type {
  CreateOnlineContractInput,
  OnlineContractPaymentMode,
  OnlineContractRecord,
  OnlineLegalContractTemplateKey,
} from '@/features/client-portal/types/contract'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'

import {
  formatDateInput,
  parseFinanceDate,
} from '@/features/finance/utils/date'

import {
  formatMoneyInput,
  normalizeDigits,
  toOptionalFiniteNumber,
} from '@/features/finance/utils/number'

import {
  createClientOnlineContract,
} from '@/services/online-contract.service'

export interface LawyerOnlineContractPanelProps {
  lawyer: ClientPortalLawyer
}

type ContractStage =
  | 'edit'
  | 'review'
  | 'submitted'

const PAYMENT_LABELS: Record<
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
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100'

const TEXTAREA_CLASS =
  'w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100'

function normalizeNationalId(
  value:
    string,
): string {
  return normalizeDigits(
    value,
  )
    .replace(
      /\D/g,
      '',
    )
    .slice(
      0,
      10,
    )
}

export default function LawyerOnlineContractPanel({
  lawyer,
}: LawyerOnlineContractPanelProps) {
  const defaultTemplate =
    ONLINE_CONTRACT_TEMPLATES[
      0
    ]

  const [
    stage,
    setStage,
  ] =
    useState<ContractStage>(
      'edit',
    )

  const [
    account,
    setAccount,
  ] =
    useState<ClientPortalAccount | null>(
      null,
    )

  const [
    templateKey,
    setTemplateKey,
  ] =
    useState<OnlineLegalContractTemplateKey>(
      defaultTemplate.key,
    )

  const [
    clientNationalId,
    setClientNationalId,
  ] =
    useState(
      '',
    )

  const [
    clientAddress,
    setClientAddress,
  ] =
    useState(
      '',
    )

  const [
    subject,
    setSubject,
  ] =
    useState(
      defaultTemplate.defaultSubject,
    )

  const [
    scope,
    setScope,
  ] =
    useState(
      defaultTemplate.defaultScope,
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
    startDate,
    setStartDate,
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
    reviewInput,
    setReviewInput,
  ] =
    useState<CreateOnlineContractInput | null>(
      null,
    )

  const [
    confirmDraft,
    setConfirmDraft,
  ] =
    useState(
      false,
    )

  const [
    submittedContract,
    setSubmittedContract,
  ] =
    useState<OnlineContractRecord | null>(
      null,
    )

  const [
    authOpen,
    setAuthOpen,
  ] =
    useState(
      false,
    )

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    )

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  const selectedTemplate =
    useMemo(
      () =>
        getOnlineContractTemplate(
          templateKey,
        ),

      [
        templateKey,
      ],
    )

  useEffect(
    () => {
      setAccount(
        getCurrentClientPortalAccount(),
      )

      setStage(
        'edit',
      )

      setTemplateKey(
        defaultTemplate.key,
      )

      setClientNationalId(
        '',
      )

      setClientAddress(
        '',
      )

      setSubject(
        defaultTemplate.defaultSubject,
      )

      setScope(
        defaultTemplate.defaultScope,
      )

      setFeeInput(
        '',
      )

      setPaymentMode(
        'full',
      )

      setPaymentDetails(
        '',
      )

      setStartDate(
        '',
      )

      setServicePeriod(
        '',
      )

      setAdditionalTerms(
        '',
      )

      setReviewInput(
        null,
      )

      setConfirmDraft(
        false,
      )

      setSubmittedContract(
        null,
      )

      setAuthOpen(
        false,
      )

      setSubmitting(
        false,
      )

      setError(
        null,
      )
    },
    [
      lawyer.id,
      defaultTemplate.key,
      defaultTemplate.defaultScope,
      defaultTemplate.defaultSubject,
    ],
  )

  const handleTemplateChange =
    (
      nextKey:
        OnlineLegalContractTemplateKey,
    ) => {
      const nextTemplate =
        getOnlineContractTemplate(
          nextKey,
        )

      setTemplateKey(
        nextKey,
      )

      setSubject(
        nextTemplate.defaultSubject,
      )

      setScope(
        nextTemplate.defaultScope,
      )

      setError(
        null,
      )
    }

  const buildInput =
    ():
      CreateOnlineContractInput |
      null => {
      setError(
        null,
      )

      const nationalId =
        normalizeNationalId(
          clientNationalId,
        )

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

      const feeToman =
        toOptionalFiniteNumber(
          feeInput,
        )

      const normalizedStartDate =
        formatDateInput(
          startDate,
        )

      const parsedStartDate =
        parseFinanceDate(
          normalizedStartDate,
        )

      if (
        !/^\d{10}$/.test(
          nationalId,
        )
      ) {
        setError(
          'کد ملی باید دقیقاً ۱۰ رقم باشد.',
        )

        return null
      }

      if (
        normalizedSubject.length <
        5
      ) {
        setError(
          'موضوع قرارداد را کامل‌تر وارد کنید.',
        )

        return null
      }

      if (
        normalizedScope.length <
        20
      ) {
        setError(
          'دامنه خدمات باید حداقل ۲۰ کاراکتر باشد.',
        )

        return null
      }

      if (
        !feeToman ||
        feeToman <=
          0
      ) {
        setError(
          'مبلغ حق‌الزحمه را وارد کنید.',
        )

        return null
      }

      if (
        !parsedStartDate
      ) {
        setError(
          'تاریخ شروع قرارداد معتبر نیست.',
        )

        return null
      }

      if (
        normalizedServicePeriod.length <
        3
      ) {
        setError(
          'مدت یا محدوده زمانی خدمات را مشخص کنید.',
        )

        return null
      }

      if (
        paymentMode !==
          'full' &&
        normalizedPaymentDetails.length <
          5
      ) {
        setError(
          'جزئیات پرداخت را تکمیل کنید.',
        )

        return null
      }

      return {
        lawyerId:
          lawyer.id,

        templateKey,

        nationalId,

        address:
          clientAddress.trim() ||
          undefined,

        subject:
          normalizedSubject,

        scope:
          normalizedScope,

        feeToman,

        paymentMode,

        paymentDetails:
          paymentMode ===
          'full'
            ? normalizedPaymentDetails ||
              'پرداخت کامل طبق توافق طرفین.'
            : normalizedPaymentDetails,

        startDate:
          normalizedStartDate,

        servicePeriod:
          normalizedServicePeriod,

        additionalTerms:
          normalizedAdditionalTerms ||
          undefined,
      }
    }

  const handleReview =
    () => {
      const input =
        buildInput()

      if (
        !input
      ) {
        return
      }

      setReviewInput(
        input,
      )

      setConfirmDraft(
        false,
      )

      setStage(
        'review',
      )
    }

  const submitContract =
    async (
      authenticatedAccount:
        ClientPortalAccount,
    ) => {
      if (
        !reviewInput ||
        submitting
      ) {
        return
      }

      setSubmitting(
        true,
      )

      setError(
        null,
      )

      try {
        const created =
          await createClientOnlineContract(
            reviewInput,
          )

        setAccount(
          authenticatedAccount,
        )

        setSubmittedContract(
          created,
        )

        setAuthOpen(
          false,
        )

        setStage(
          'submitted',
        )
      } catch (
        caughtError:
          unknown
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'ثبت قرارداد انجام نشد.',
        )
      } finally {
        setSubmitting(
          false,
        )
      }
    }

  const handleSubmit =
    async () => {
      if (
        !reviewInput
      ) {
        setStage(
          'edit',
        )

        return
      }

      if (
        !confirmDraft
      ) {
        setError(
          'برای ادامه، صحت اطلاعات قرارداد را تأیید کنید.',
        )

        return
      }

      const currentAccount =
        getCurrentClientPortalAccount()

      if (
        !currentAccount
      ) {
        setAuthOpen(
          true,
        )

        return
      }

      await submitContract(
        currentAccount,
      )
    }

  const handleNewContract =
    () => {
      setStage(
        'edit',
      )

      setReviewInput(
        null,
      )

      setSubmittedContract(
        null,
      )

      setConfirmDraft(
        false,
      )

      setClientNationalId(
        '',
      )

      setClientAddress(
        '',
      )

      setFeeInput(
        '',
      )

      setPaymentDetails(
        '',
      )

      setStartDate(
        '',
      )

      setServicePeriod(
        '',
      )

      setAdditionalTerms(
        '',
      )

      setError(
        null,
      )
    }

  if (
    stage ===
      'submitted' &&
    submittedContract
  ) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={24}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-emerald-700">
              قرارداد آنلاین ثبت شد
            </p>

            <h3 className="mt-1 text-lg font-black text-emerald-950">
              درخواست برای بررسی وکیل ارسال شد
            </h3>

            <p className="mt-2 text-sm font-semibold leading-7 text-emerald-900">
              شناسه قرارداد:
              {' '}
              <span
                dir="ltr"
                className="font-black"
              >
                {
                  submittedContract.reference
                }
              </span>
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/client-portal/contracts"
                className="inline-flex h-11 items-center rounded-xl bg-emerald-700 px-4 text-sm font-black text-white"
              >
                قراردادهای من
              </Link>

              <Link
                href={`/client-portal/contracts/${submittedContract.id}/document`}
                className="inline-flex h-11 items-center rounded-xl border border-emerald-300 bg-white px-4 text-sm font-black text-emerald-800"
              >
                مشاهده سند
              </Link>

              <button
                type="button"
                onClick={
                  handleNewContract
                }
                className="h-11 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-black text-emerald-800"
              >
                قرارداد جدید
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <FileText
              size={21}
            />
          </div>

          <div>
            <p className="text-xs font-black text-violet-700">
              قرارداد آنلاین
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              تنظیم قرارداد با
              {' '}
              {
                lawyer.fullName
              }
            </h2>

            <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
              اطلاعات هویتی حساب موکل و مشخصات وکیل هنگام ثبت توسط سرور بررسی و در قرارداد ذخیره می‌شوند.
            </p>
          </div>
        </div>

        {
          stage ===
          'edit'
            ? (
              <div className="mt-6 space-y-6">
                <Section
                  icon={
                    <FileText
                      size={18}
                    />
                  }
                  title="نوع و موضوع قرارداد"
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    {
                      ONLINE_CONTRACT_TEMPLATES.map(
                        (
                          template,
                        ) => (
                          <button
                            key={
                              template.key
                            }
                            type="button"
                            onClick={() =>
                              handleTemplateChange(
                                template.key,
                              )
                            }
                            className={`rounded-2xl border p-4 text-right transition ${
                              templateKey ===
                              template.key
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <p className="text-sm font-black text-slate-950">
                              {
                                template.title
                              }
                            </p>

                            <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">
                              {
                                template.shortDescription
                              }
                            </p>
                          </button>
                        ),
                      )
                    }
                  </div>

                  <div className="mt-4 grid gap-4">
                    <Field label="موضوع قرارداد">
                      <input
                        value={
                          subject
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
                        maxLength={
                          180
                        }
                        className={
                          INPUT_CLASS
                        }
                      />
                    </Field>

                    <Field label="دامنه خدمات">
                      <textarea
                        value={
                          scope
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
                        rows={
                          5
                        }
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

                <Section
                  icon={
                    <UserRound
                      size={18}
                    />
                  }
                  title="اطلاعات موکل"
                >
                  <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-bold leading-6 text-blue-800">
                    {
                      account
                        ? (
                          <>
                            قرارداد با حساب «
                            {
                              account.fullName ||
                              'موکل'
                            }
                            » و شماره
                            {' '}
                            <span dir="ltr">
                              {
                                account.phone
                              }
                            </span>
                            {' '}
                            ثبت می‌شود.
                          </>
                        )
                        : 'نام و شماره موبایل از حسابی که هنگام ثبت وارد آن می‌شوید خوانده می‌شود و از فرم قابل جعل نیست.'
                    }
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="کد ملی">
                      <input
                        value={
                          clientNationalId
                        }
                        onChange={(
                          event,
                        ) => {
                          setClientNationalId(
                            normalizeNationalId(
                              event.target.value,
                            ),
                          )

                          setError(
                            null,
                          )
                        }}
                        inputMode="numeric"
                        dir="ltr"
                        maxLength={
                          10
                        }
                        placeholder="0123456789"
                        className={
                          INPUT_CLASS
                        }
                      />
                    </Field>

                    <Field label="نشانی موکل (اختیاری)">
                      <input
                        value={
                          clientAddress
                        }
                        onChange={(
                          event,
                        ) => {
                          setClientAddress(
                            event.target.value,
                          )

                          setError(
                            null,
                          )
                        }}
                        maxLength={
                          500
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
                    <CircleDollarSign
                      size={18}
                    />
                  }
                  title="حق‌الزحمه و زمان‌بندی"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="حق‌الزحمه (تومان)">
                      <input
                        value={
                          feeInput
                        }
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
                        inputMode="numeric"
                        dir="ltr"
                        className={
                          INPUT_CLASS
                        }
                      />
                    </Field>

                    <Field label="روش پرداخت">
                      <select
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

                    <Field label="تاریخ شروع">
                      <input
                        value={
                          startDate
                        }
                        onChange={(
                          event,
                        ) => {
                          setStartDate(
                            formatDateInput(
                              event.target.value,
                            ),
                          )

                          setError(
                            null,
                          )
                        }}
                        dir="ltr"
                        placeholder="1405/07/01"
                        className={
                          INPUT_CLASS
                        }
                      />
                    </Field>

                    <Field label="مدت / محدوده زمانی خدمات">
                      <input
                        value={
                          servicePeriod
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
                        maxLength={
                          500
                        }
                        placeholder="مثلاً تا پایان مرحله بدوی"
                        className={
                          INPUT_CLASS
                        }
                      />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="جزئیات پرداخت">
                      <textarea
                        value={
                          paymentDetails
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
                        rows={
                          2
                        }
                        maxLength={
                          1000
                        }
                        placeholder={
                          paymentMode ===
                          'full'
                            ? 'اختیاری؛ در صورت خالی بودن متن پیش‌فرض درج می‌شود.'
                            : 'زمان و مبلغ هر مرحله یا قسط را مشخص کنید.'
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
                    <ShieldCheck
                      size={18}
                    />
                  }
                  title="شروط تکمیلی"
                >
                  <textarea
                    value={
                      additionalTerms
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
                    rows={
                      4
                    }
                    maxLength={
                      3000
                    }
                    placeholder="در صورت نیاز شروط یا توافق‌های تکمیلی را وارد کنید."
                    className={
                      TEXTAREA_CLASS
                    }
                  />
                </Section>

                {
                  error &&
                  (
                    <ErrorBox
                      message={
                        error
                      }
                    />
                  )
                }

                <button
                  type="button"
                  onClick={
                    handleReview
                  }
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  <FileText
                    size={18}
                  />

                  بررسی پیش‌نویس
                </button>
              </div>
            )
            : (
              reviewInput &&
              (
                <div className="mt-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black text-blue-700">
                      پیش‌نمایش قبل از ارسال
                    </p>

                    <h3 className="mt-2 text-lg font-black text-slate-950">
                      {
                        reviewInput.subject
                      }
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <ReviewItem
                        label="نوع قرارداد"
                        value={
                          selectedTemplate.title
                        }
                      />

                      <ReviewItem
                        label="وکیل"
                        value={
                          lawyer.fullName
                        }
                      />

                      <ReviewItem
                        label="حق‌الزحمه"
                        value={`${reviewInput.feeToman.toLocaleString(
                          'fa-IR',
                        )} تومان`}
                      />

                      <ReviewItem
                        label="روش پرداخت"
                        value={
                          PAYMENT_LABELS[
                            reviewInput.paymentMode
                          ]
                        }
                      />

                      <ReviewItem
                        label="تاریخ شروع"
                        value={
                          reviewInput.startDate
                        }
                      />

                      <ReviewItem
                        label="مدت خدمات"
                        value={
                          reviewInput.servicePeriod
                        }
                      />
                    </div>

                    <ReviewText
                      label="دامنه خدمات"
                      value={
                        reviewInput.scope
                      }
                    />

                    <ReviewText
                      label="شرایط پرداخت"
                      value={
                        reviewInput.paymentDetails
                      }
                    />

                    {
                      reviewInput.additionalTerms &&
                      (
                        <ReviewText
                          label="شروط تکمیلی"
                          value={
                            reviewInput.additionalTerms
                          }
                        />
                      )
                    }
                  </div>

                  <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <input
                      type="checkbox"
                      checked={
                        confirmDraft
                      }
                      onChange={(
                        event,
                      ) => {
                        setConfirmDraft(
                          event.target.checked,
                        )

                        setError(
                          null,
                        )
                      }}
                      className="mt-1 h-4 w-4"
                    />

                    <span className="text-sm font-bold leading-7 text-slate-700">
                      اطلاعات این پیش‌نویس را بررسی کردم و می‌خواهم آن را برای بررسی وکیل ارسال کنم.
                    </span>
                  </label>

                  {
                    error &&
                    (
                      <ErrorBox
                        message={
                          error
                        }
                      />
                    )
                  }

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={
                        submitting
                      }
                      onClick={() => {
                        void handleSubmit()
                      }}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {
                        submitting
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

                      ارسال برای وکیل
                    </button>

                    <button
                      type="button"
                      disabled={
                        submitting
                      }
                      onClick={() => {
                        setStage(
                          'edit',
                        )

                        setError(
                          null,
                        )
                      }}
                      className="h-12 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 disabled:opacity-60"
                    >
                      بازگشت و ویرایش
                    </button>
                  </div>
                </div>
              )
            )
        }
      </section>

      <ClientAuthGateModal
        open={
          authOpen
        }
        title="ورود برای ثبت قرارداد"
        onClose={() => {
          if (
            !submitting
          ) {
            setAuthOpen(
              false,
            )
          }
        }}
        onAuthenticated={(
          authenticatedAccount,
        ) => {
          setAccount(
            authenticatedAccount,
          )

          void submitContract(
            authenticatedAccount,
          )
        }}
      />
    </>
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
    <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-slate-900">
        <span className="text-blue-600">
          {
            icon
          }
        </span>

        <h3 className="font-black">
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
      <span className="mb-2 block text-xs font-black text-slate-600">
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

function ReviewItem({
  label,
  value,
}: {
  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-bold text-slate-500">
        {
          label
        }
      </p>

      <p className="mt-1.5 text-sm font-black text-slate-900">
        {
          value
        }
      </p>
    </div>
  )
}

function ReviewText({
  label,
  value,
}: {
  label:
    string

  value:
    string
}) {
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black text-slate-600">
        {
          label
        }
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-800">
        {
          value
        }
      </p>
    </div>
  )
}

function ErrorBox({
  message,
}: {
  message:
    string
}) {
  return (
    <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
      {
        message
      }
    </p>
  )
}
