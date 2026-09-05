'use client'

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import {
  ONLINE_CONTRACT_TEMPLATES,
  getOnlineContractTemplate,
} from '@/features/client-portal/data/mock-contract-templates'

import {
  createMockOnlineContract,
} from '@/features/client-portal/data/mock-online-contracts'

import type {
  OnlineContractDraft,
  OnlineContractPaymentMode,
  OnlineContractRecord,
  OnlineLegalContractTemplateKey,
} from '@/features/client-portal/types/contract'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'

import {
  formatMoneyInput,
  normalizeDigits,
  toOptionalFiniteNumber,
} from '@/features/finance/utils/number'

import {
  formatDateInput,
  parseFinanceDate,
} from '@/features/finance/utils/date'

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

interface LawyerOnlineContractPanelProps {
  lawyer:
    ClientPortalLawyer
}

type ContractStage =
  | 'edit'
  | 'review'
  | 'submitted'

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

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
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

const TEXTAREA_CLASS =
  'w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

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
      'edit'
    )

  const [
    templateKey,
    setTemplateKey,
  ] =
    useState<OnlineLegalContractTemplateKey>(
      defaultTemplate.key
    )

  /*
  |--------------------------------------------------------------------------
  | Client Fields
  |--------------------------------------------------------------------------
  */

  const [
    clientFullName,
    setClientFullName,
  ] =
    useState(
      ''
    )

  const [
    clientPhone,
    setClientPhone,
  ] =
    useState(
      ''
    )

  const [
    clientNationalId,
    setClientNationalId,
  ] =
    useState(
      ''
    )

  const [
    clientAddress,
    setClientAddress,
  ] =
    useState(
      ''
    )

  /*
  |--------------------------------------------------------------------------
  | Contract Fields
  |--------------------------------------------------------------------------
  */

  const [
    subject,
    setSubject,
  ] =
    useState(
      defaultTemplate.defaultSubject
    )

  const [
    scope,
    setScope,
  ] =
    useState(
      defaultTemplate.defaultScope
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
    startDate,
    setStartDate,
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

  /*
  |--------------------------------------------------------------------------
  | Review
  |--------------------------------------------------------------------------
  */

  const [
    reviewDraft,
    setReviewDraft,
  ] =
    useState<
      OnlineContractDraft | null
    >(
      null
    )

  const [
    confirmDraft,
    setConfirmDraft,
  ] =
    useState(
      false
    )

  const [
    confirmElectronicDelivery,
    setConfirmElectronicDelivery,
  ] =
    useState(
      false
    )

  const [
    submittedContract,
    setSubmittedContract,
  ] =
    useState<
      OnlineContractRecord | null
    >(
      null
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

  /*
  |--------------------------------------------------------------------------
  | Template
  |--------------------------------------------------------------------------
  */

  const selectedTemplate =
    useMemo(
      () =>
        getOnlineContractTemplate(
          templateKey
        ),
      [
        templateKey,
      ]
    )

  /*
  |--------------------------------------------------------------------------
  | Reset On Lawyer Change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setStage(
      'edit'
    )

    setTemplateKey(
      defaultTemplate.key
    )

    setClientFullName(
      ''
    )

    setClientPhone(
      ''
    )

    setClientNationalId(
      ''
    )

    setClientAddress(
      ''
    )

    setSubject(
      defaultTemplate.defaultSubject
    )

    setScope(
      defaultTemplate.defaultScope
    )

    setFeeInput(
      ''
    )

    setPaymentMode(
      'full'
    )

    setPaymentDetails(
      ''
    )

    setStartDate(
      ''
    )

    setServicePeriod(
      ''
    )

    setAdditionalTerms(
      ''
    )

    setReviewDraft(
      null
    )

    setConfirmDraft(
      false
    )

    setConfirmElectronicDelivery(
      false
    )

    setSubmittedContract(
      null
    )

    setError(
      null
    )
  }, [
    defaultTemplate.defaultScope,
    defaultTemplate.defaultSubject,
    defaultTemplate.key,
    lawyer.id,
  ])

  /*
  |--------------------------------------------------------------------------
  | Template Change
  |--------------------------------------------------------------------------
  */

  const handleTemplateChange =
    (
      nextKey:
        OnlineLegalContractTemplateKey
    ) => {
      const template =
        getOnlineContractTemplate(
          nextKey
        )

      setTemplateKey(
        nextKey
      )

      setSubject(
        template.defaultSubject
      )

      setScope(
        template.defaultScope
      )

      setError(
        null
      )
    }

  /*
  |--------------------------------------------------------------------------
  | Build Draft
  |--------------------------------------------------------------------------
  */

  const buildDraft =
    ():
      | OnlineContractDraft
      | null => {
      const fullName =
        clientFullName.trim()

      const phone =
        normalizeDigits(
          clientPhone
        ).trim()

      const nationalId =
        normalizeDigits(
          clientNationalId
        ).trim()

      const normalizedSubject =
        subject.trim()

      const normalizedScope =
        scope.trim()

      const feeToman =
        toOptionalFiniteNumber(
          feeInput
        )

      const normalizedStartDate =
        formatDateInput(
          startDate
        )

      const parsedStartDate =
        parseFinanceDate(
          normalizedStartDate
        )

      const normalizedServicePeriod =
        servicePeriod.trim()

      const normalizedPaymentDetails =
        paymentDetails.trim()

      /*
      |--------------------------------------------------------------------------
      | Validation
      |--------------------------------------------------------------------------
      */

      if (
        fullName.length <
        3
      ) {
        setError(
          'نام و نام خانوادگی موکل را کامل وارد کنید.'
        )

        return null
      }

      if (
        !/^09\d{9}$/.test(
          phone
        )
      ) {
        setError(
          'شماره موبایل موکل باید ۱۱ رقم و با ۰۹ شروع شود.'
        )

        return null
      }

      if (
        !/^\d{10}$/.test(
          nationalId
        )
      ) {
        setError(
          'کد ملی موکل باید دقیقاً ۱۰ رقم باشد.'
        )

        return null
      }

      if (
        normalizedSubject.length <
        5
      ) {
        setError(
          'موضوع قرارداد را دقیق‌تر وارد کنید.'
        )

        return null
      }

      if (
        normalizedScope.length <
        20
      ) {
        setError(
          'دامنه خدمات قرارداد باید حداقل ۲۰ کاراکتر باشد.'
        )

        return null
      }

      if (
        !feeToman ||
        feeToman <=
          0
      ) {
        setError(
          'مبلغ حق‌الزحمه را وارد کنید.'
        )

        return null
      }

      if (
        !parsedStartDate
      ) {
        setError(
          'تاریخ شروع قرارداد معتبر نیست.'
        )

        return null
      }

      if (
        normalizedServicePeriod.length <
        3
      ) {
        setError(
          'مدت یا محدوده زمانی ارائه خدمات را مشخص کنید.'
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
          'جزئیات پرداخت مرحله‌ای یا اقساطی را وارد کنید.'
        )

        return null
      }

      return {
        templateKey,

        client: {
          fullName,

          phone,

          nationalId,

          address:
            clientAddress.trim() ||
            undefined,
        },

        lawyer: {
          id:
            lawyer.id,

          fullName:
            lawyer.fullName,

          title:
            lawyer.title,

          licenseNumber:
            lawyer.licenseNumber,

          barAssociation:
            lawyer.barAssociation,

          city:
            lawyer.city,
        },

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
          additionalTerms.trim() ||
          undefined,
      }
    }

  /*
  |--------------------------------------------------------------------------
  | Review
  |--------------------------------------------------------------------------
  */

  const handleReview =
    () => {
      setError(
        null
      )

      const draft =
        buildDraft()

      if (!draft) {
        return
      }

      setReviewDraft(
        draft
      )

      setConfirmDraft(
        false
      )

      setConfirmElectronicDelivery(
        false
      )

      setStage(
        'review'
      )
    }

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmitToLawyer =
    () => {
      setError(
        null
      )

      if (!reviewDraft) {
        setStage(
          'edit'
        )

        return
      }

      if (!confirmDraft) {
        setError(
          'لطفاً صحت اطلاعات پیش‌نویس را تأیید کنید.'
        )

        return
      }

      if (
        !confirmElectronicDelivery
      ) {
        setError(
          'برای ادامه، ارسال الکترونیکی پیش‌نویس برای وکیل را تأیید کنید.'
        )

        return
      }

      const created =
        createMockOnlineContract(
          reviewDraft
        )

      setSubmittedContract(
        created
      )

      setStage(
        'submitted'
      )
    }

  /*
  |--------------------------------------------------------------------------
  | Start New
  |--------------------------------------------------------------------------
  */

  const handleNewContract =
    () => {
      setStage(
        'edit'
      )

      setReviewDraft(
        null
      )

      setSubmittedContract(
        null
      )

      setConfirmDraft(
        false
      )

      setConfirmElectronicDelivery(
        false
      )

      setError(
        null
      )
    }

  /*
  |--------------------------------------------------------------------------
  | Submitted
  |--------------------------------------------------------------------------
  */

  if (
    stage ===
      'submitted' &&
    submittedContract
  ) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={24}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-emerald-700">
              قرارداد آنلاین
            </p>

            <h3 className="mt-1 text-lg font-black text-emerald-950">
              پیش‌نویس برای وکیل ارسال شد
            </h3>

            <p className="mt-2 text-sm font-semibold leading-7 text-emerald-800">
              قرارداد هنوز نهایی یا
              امضاشده نیست. وکیل باید
              اطلاعات، مبلغ و شرایط آن را
              بررسی کند.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ReceiptItem
                label="شناسه قرارداد"
                value={
                  submittedContract.reference
                }
                dir="ltr"
              />

              <ReceiptItem
                label="نسخه"
                value={
                  submittedContract.version.toLocaleString(
                    'fa-IR'
                  )
                }
              />

              <ReceiptItem
                label="وکیل"
                value={
                  submittedContract.draft.lawyer.fullName
                }
              />

              <ReceiptItem
                label="وضعیت"
                value="در انتظار بررسی وکیل"
              />

              <ReceiptItem
                label="موضوع"
                value={
                  submittedContract.draft.subject
                }
              />

              <ReceiptItem
                label="مبلغ پیشنهادی"
                value={`${submittedContract.draft.feeToman.toLocaleString(
                  'fa-IR'
                )} تومان`}
              />
            </div>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs font-semibold leading-6 text-blue-800">
                اگر وکیل تغییری در متن یا
                مبلغ ایجاد کند، نسخه جدید
                قرارداد باید دوباره توسط
                موکل بررسی و تأیید شود.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleNewContract
              }
              className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
            >
              <FileText
                size={17}
              />

              پیش‌نویس جدید
            </button>
          </div>
        </div>
      </section>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Review Stage
  |--------------------------------------------------------------------------
  */

  if (
    stage ===
      'review' &&
    reviewDraft
  ) {
    return (
      <section className="rounded-2xl border border-blue-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black text-blue-700">
              مرحله بررسی
            </p>

            <h3 className="mt-1 text-lg font-black text-slate-950">
              پیش‌نمایش درخواست قرارداد
            </h3>

            <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">
              این نسخه هنوز قرارداد نهایی
              نیست و ابتدا برای بررسی وکیل
              ارسال می‌شود.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setStage(
                'edit'
              )

              setError(
                null
              )
            }}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-black text-slate-700"
          >
            <ArrowRight
              size={15}
            />

            ویرایش
          </button>
        </div>

        <ContractSection title="طرفین قرارداد">
          <div className="grid gap-3 sm:grid-cols-2">
            <PreviewItem
              label="موکل"
              value={
                reviewDraft.client.fullName
              }
            />

            <PreviewItem
              label="شماره موبایل"
              value={
                reviewDraft.client.phone
              }
              dir="ltr"
            />

            <PreviewItem
              label="کد ملی"
              value={
                reviewDraft.client.nationalId
              }
              dir="ltr"
            />

            <PreviewItem
              label="وکیل"
              value={
                reviewDraft.lawyer.fullName
              }
            />
          </div>
        </ContractSection>

        <ContractSection title="موضوع و خدمات">
          <PreviewParagraph
            label="موضوع"
            value={
              reviewDraft.subject
            }
          />

          <PreviewParagraph
            label="دامنه خدمات"
            value={
              reviewDraft.scope
            }
          />
        </ContractSection>

        <ContractSection title="مالی و زمانی">
          <div className="grid gap-3 sm:grid-cols-2">
            <PreviewItem
              label="حق‌الزحمه پیشنهادی"
              value={`${reviewDraft.feeToman.toLocaleString(
                'fa-IR'
              )} تومان`}
            />

            <PreviewItem
              label="روش پرداخت"
              value={
                PAYMENT_LABELS[
                  reviewDraft.paymentMode
                ]
              }
            />

            <PreviewItem
              label="تاریخ شروع"
              value={
                reviewDraft.startDate
              }
              dir="ltr"
            />

            <PreviewItem
              label="مدت خدمات"
              value={
                reviewDraft.servicePeriod
              }
            />
          </div>

          <PreviewParagraph
            label="جزئیات پرداخت"
            value={
              reviewDraft.paymentDetails
            }
          />
        </ContractSection>

        <ContractSection title="تعهدات و شروط">
          <ClauseList
            title="تعهدات وکیل"
            items={
              selectedTemplate.lawyerObligations
            }
          />

          <ClauseList
            title="تعهدات موکل"
            items={
              selectedTemplate.clientObligations
            }
          />

          <ClauseList
            title="شروط عمومی"
            items={
              selectedTemplate.standardTerms
            }
          />

          {reviewDraft.additionalTerms && (
            <PreviewParagraph
              label="شروط تکمیلی"
              value={
                reviewDraft.additionalTerms
              }
            />
          )}
        </ContractSection>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <p className="text-xs font-semibold leading-6 text-amber-800">
              تأیید این مرحله فقط به معنی
              ارسال پیش‌نویس برای بررسی
              وکیل است و امضای الکترونیکی
              محسوب نمی‌شود.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <input
              type="checkbox"
              checked={
                confirmDraft
              }
              onChange={(
                event
              ) => {
                setConfirmDraft(
                  event.target.checked
                )

                setError(
                  null
                )
              }}
              className="mt-1 h-4 w-4 accent-blue-600"
            />

            <span className="text-sm font-semibold leading-6 text-slate-700">
              اطلاعات واردشده و مبلغ
              پیشنهادی را بررسی کرده‌ام.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <input
              type="checkbox"
              checked={
                confirmElectronicDelivery
              }
              onChange={(
                event
              ) => {
                setConfirmElectronicDelivery(
                  event.target.checked
                )

                setError(
                  null
                )
              }}
              className="mt-1 h-4 w-4 accent-blue-600"
            />

            <span className="text-sm font-semibold leading-6 text-slate-700">
              با ارسال الکترونیکی این
              پیش‌نویس برای بررسی وکیل
              موافقم.
            </span>
          </label>
        </div>

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
          onClick={
            handleSubmitToLawyer
          }
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 px-4 text-sm font-black text-white shadow-md shadow-emerald-100 transition hover:from-emerald-600 hover:to-teal-700"
        >
          <Send
            size={18}
          />

          ارسال پیش‌نویس برای وکیل
        </button>
      </section>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Edit Stage
  |--------------------------------------------------------------------------
  */

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <FileText
            size={21}
          />
        </div>

        <div>
          <p className="text-xs font-black text-violet-700">
            قرارداد آنلاین
          </p>

          <h3 className="mt-1 text-lg font-black text-slate-950">
            درخواست قرارداد خدمات حقوقی
          </h3>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            پیش‌نویس اولیه را تکمیل کنید تا
            وکیل آن را بررسی و نسخه نهایی
            پیشنهادی را برای شما ارسال کند.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-violet-700"
          />

          <p className="text-xs font-semibold leading-6 text-violet-800">
            این بخش فعلاً آزمایشی است و
            اطلاعات داخل مرورگر ذخیره
            می‌شوند. اطلاعات واقعی و حساس
            در نسخه Production نباید در
            LocalStorage ذخیره شوند.
          </p>
        </div>
      </div>

      {/* Template */}

      <div className="mt-5">
        <p className="text-sm font-black text-slate-800">
          نوع قرارداد
        </p>

        <div className="mt-2 grid gap-2 lg:grid-cols-3">
          {ONLINE_CONTRACT_TEMPLATES.map(
            (
              template
            ) => {
              const active =
                template.key ===
                templateKey

              return (
                <button
                  key={
                    template.key
                  }
                  type="button"
                  onClick={() =>
                    handleTemplateChange(
                      template.key
                    )
                  }
                  className={`rounded-xl border p-3 text-right transition ${
                    active
                      ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-100'
                      : 'border-slate-200 bg-white hover:border-violet-200'
                  }`}
                >
                  <p className="text-sm font-black text-slate-900">
                    {
                      template.title
                    }
                  </p>

                  <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">
                    {
                      template.shortDescription
                    }
                  </p>
                </button>
              )
            }
          )}
        </div>
      </div>

      <FormSection
        icon={
          UserRound
        }
        title="مشخصات موکل"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            label="نام و نام خانوادگی"
            required
          >
            <input
              value={
                clientFullName
              }
              onChange={(
                event
              ) => {
                setClientFullName(
                  event.target.value
                )

                setError(
                  null
                )
              }}
              placeholder="مثال: علی رضایی"
              className={
                INPUT_CLASS
              }
            />
          </FormField>

          <FormField
            label="شماره موبایل"
            required
          >
            <input
              value={
                clientPhone
              }
              onChange={(
                event
              ) => {
                setClientPhone(
                  normalizeDigits(
                    event.target.value
                  )
                    .replace(
                      /\D/g,
                      ''
                    )
                    .slice(
                      0,
                      11
                    )
                )

                setError(
                  null
                )
              }}
              inputMode="tel"
              dir="ltr"
              placeholder="09123456789"
              className={
                INPUT_CLASS
              }
            />
          </FormField>

          <FormField
            label="کد ملی"
            required
          >
            <input
              value={
                clientNationalId
              }
              onChange={(
                event
              ) => {
                setClientNationalId(
                  normalizeDigits(
                    event.target.value
                  )
                    .replace(
                      /\D/g,
                      ''
                    )
                    .slice(
                      0,
                      10
                    )
                )

                setError(
                  null
                )
              }}
              inputMode="numeric"
              dir="ltr"
              placeholder="1234567890"
              className={
                INPUT_CLASS
              }
            />
          </FormField>

          <FormField label="نشانی">
            <input
              value={
                clientAddress
              }
              onChange={(
                event
              ) =>
                setClientAddress(
                  event.target.value
                )
              }
              maxLength={
                300
              }
              placeholder="اختیاری"
              className={
                INPUT_CLASS
              }
            />
          </FormField>
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">
            وکیل طرف قرارداد
          </p>

          <p className="mt-1 text-sm font-black text-slate-900">
            {
              lawyer.fullName
            }
            {' — '}
            {
              lawyer.title
            }
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            شماره پروانه:
            {' '}
            {
              lawyer.licenseNumber
            }
            {' • '}
            {
              lawyer.barAssociation
            }
          </p>
        </div>
      </FormSection>

      <FormSection
        icon={
          FileText
        }
        title="موضوع و دامنه خدمات"
      >
        <FormField
          label="موضوع قرارداد"
          required
        >
          <input
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
        </FormField>

        <div className="mt-3">
          <FormField
            label="دامنه خدمات"
            required
          >
            <textarea
              rows={4}
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
          </FormField>
        </div>
      </FormSection>

      <FormSection
        icon={
          CircleDollarSign
        }
        title="حق‌الزحمه و پرداخت"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            label="مبلغ پیشنهادی حق‌الزحمه"
            required
          >
            <div className="relative">
              <input
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
                placeholder="5,000,000"
                className={`${INPUT_CLASS} pl-20`}
              />

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">
                تومان
              </span>
            </div>
          </FormField>

          <FormField
            label="تاریخ شروع پیشنهادی"
            required
          >
            <input
              value={
                startDate
              }
              onChange={(
                event
              ) => {
                setStartDate(
                  formatDateInput(
                    event.target.value
                  )
                )

                setError(
                  null
                )
              }}
              inputMode="numeric"
              dir="ltr"
              placeholder="1405/06/15"
              className={
                INPUT_CLASS
              }
            />
          </FormField>
        </div>

        <div className="mt-4">
          <p className="text-sm font-black text-slate-800">
            روش پرداخت پیشنهادی
          </p>

          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {(
              [
                'full',
                'staged',
                'installments',
              ] as const
            ).map(
              (
                mode
              ) => (
                <button
                  key={
                    mode
                  }
                  type="button"
                  onClick={() => {
                    setPaymentMode(
                      mode
                    )

                    setError(
                      null
                    )
                  }}
                  className={`rounded-xl border px-3 py-3 text-sm font-black transition ${
                    paymentMode ===
                    mode
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {
                    PAYMENT_LABELS[
                      mode
                    ]
                  }
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-3">
          <FormField
            label="جزئیات پرداخت"
            hint={
              paymentMode ===
              'full'
                ? 'اختیاری'
                : 'برای پرداخت مرحله‌ای/اقساطی الزامی'
            }
          >
            <textarea
              rows={2}
              value={
                paymentDetails
              }
              onChange={(
                event
              ) => {
                setPaymentDetails(
                  event.target.value
                )

                setError(
                  null
                )
              }}
              maxLength={
                600
              }
              placeholder={
                paymentMode ===
                'full'
                  ? 'مثلاً پرداخت کامل در زمان توافق'
                  : 'مثلاً ۵۰٪ در شروع و ۵۰٪ پس از مرحله اول'
              }
              className={
                TEXTAREA_CLASS
              }
            />
          </FormField>
        </div>

        <div className="mt-3">
          <FormField
            label="مدت / محدوده زمانی خدمات"
            required
          >
            <input
              value={
                servicePeriod
              }
              onChange={(
                event
              ) => {
                setServicePeriod(
                  event.target.value
                )

                setError(
                  null
                )
              }}
              maxLength={
                180
              }
              placeholder="مثلاً تا پایان مرحله بدوی"
              className={
                INPUT_CLASS
              }
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        icon={
          ShieldCheck
        }
        title="شروط تکمیلی"
      >
        <textarea
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
          maxLength={
            1200
          }
          placeholder="در صورت نیاز شرط یا توضیح تکمیلی را وارد کنید..."
          className={
            TEXTAREA_CLASS
          }
        />

        <div className="mt-3">
          <p className="text-xs font-black text-slate-500">
            شروط استاندارد قالب:
          </p>

          <ul className="mt-2 space-y-2">
            {selectedTemplate.standardTerms.map(
              (
                term
              ) => (
                <li
                  key={
                    term
                  }
                  className="flex items-start gap-2 text-xs font-semibold leading-6 text-slate-600"
                >
                  <CheckCircle2
                    size={14}
                    className="mt-1 shrink-0 text-emerald-600"
                  />

                  {term}
                </li>
              )
            )}
          </ul>
        </div>
      </FormSection>

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
        onClick={
          handleReview
        }
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-violet-600 to-blue-600 px-4 text-sm font-black text-white shadow-md shadow-violet-100 transition hover:from-violet-700 hover:to-blue-700"
      >
        <FileText
          size={18}
        />

        بررسی پیش‌نویس
      </button>
    </section>
  )
}

/*
|--------------------------------------------------------------------------
| Shared Components
|--------------------------------------------------------------------------
*/

function FormSection({
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
    ReactNode
}) {
  return (
    <div className="mt-6 border-t border-slate-200 pt-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon
          size={18}
          className="text-blue-600"
        />

        <h4 className="font-black text-slate-900">
          {title}
        </h4>
      </div>

      {children}
    </div>
  )
}

function FormField({
  label,
  required =
    false,
  hint,
  children,
}: {
  label:
    string

  required?:
    boolean

  hint?:
    string

  children:
    ReactNode
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">
          {label}

          {required && (
            <span className="mr-1 text-red-500">
              *
            </span>
          )}
        </span>

        {hint && (
          <span className="text-[11px] font-semibold text-slate-400">
            {hint}
          </span>
        )}
      </div>

      {children}
    </label>
  )
}

function ContractSection({
  title,
  children,
}: {
  title:
    string

  children:
    ReactNode
}) {
  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <h4 className="mb-3 font-black text-slate-900">
        {title}
      </h4>

      {children}
    </div>
  )
}

function PreviewItem({
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

function PreviewParagraph({
  label,
  value,
}: {
  label:
    string

  value:
    string
}) {
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
      <p className="text-xs font-black text-slate-600">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-800">
        {value}
      </p>
    </div>
  )
}

function ClauseList({
  title,
  items,
}: {
  title:
    string

  items:
    string[]
}) {
  return (
    <div className="mt-4">
      <p className="text-sm font-black text-slate-800">
        {title}
      </p>

      <ol className="mt-2 space-y-2">
        {items.map(
          (
            item,
            index
          ) => (
            <li
              key={
                item
              }
              className="flex items-start gap-2 text-sm font-semibold leading-7 text-slate-700"
            >
              <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                {(
                  index +
                  1
                ).toLocaleString(
                  'fa-IR'
                )}
              </span>

              <span>
                {item}
              </span>
            </li>
          )
        )}
      </ol>
    </div>
  )
}

function ReceiptItem({
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
    <div className="rounded-xl border border-emerald-200 bg-white/80 p-3">
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