'use client'

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import Link from 'next/link'

import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Printer,
  Save,
  ShieldCheck,
} from 'lucide-react'

import ClientAuthGateModal from '@/components/client-portal/ClientAuthGateModal'

import {
  getCurrentClientPortalAccount,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  clearGuestPetitionDraft,
  readGuestPetitionDraft,
  saveClientPetition,
  saveGuestPetitionDraft,
} from '@/features/client-portal/data/client-petition.repository'

import type {
  ClientPetitionDraft,
  ClientPetitionRecord,
  ClientPetitionStatus,
  PetitionPartyRole,
  PetitionTemplateKey,
} from '@/features/client-portal/types/petition'

import {
  PETITION_PARTY_ROLE_LABELS,
  PETITION_STATUS_LABELS,
  PETITION_TEMPLATES,
  buildPetitionText,
  createEmptyPetitionDraft,
  formatPetitionDateTime,
  getPetitionTemplate,
  petitionRecordToDraft,
  validatePetitionStep,
} from '@/features/client-portal/utils/petition'

interface PetitionComposerProps {
  initialRecord?:
    ClientPetitionRecord | null

  onSaved?:
    (
      record:
        ClientPetitionRecord
    ) => void
}

interface PetitionFormState
  extends Omit<
    ClientPetitionDraft,
    'evidence'
  > {
  evidenceText:
    string
}

type PendingAction =
  | 'preview'
  | 'save-draft'
  | 'save-ready'
  | null

const INPUT_CLASS =
  'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

const TEXTAREA_CLASS =
  'w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

const STEP_LABELS = [
  'نوع و مرجع',
  'پرونده و طرفین',
  'متن لایحه',
  'پیش‌نمایش',
] as const

function draftToForm(
  draft:
    ClientPetitionDraft
): PetitionFormState {
  return {
    ...draft,

    evidenceText:
      draft.evidence.join(
        '\n'
      ),
  }
}

function formToDraft(
  form:
    PetitionFormState
): ClientPetitionDraft {
  return {
    templateKey:
      form.templateKey,

    authorityName:
      form.authorityName,

    branch:
      form.branch,

    caseNumber:
      form.caseNumber,

    archiveNumber:
      form.archiveNumber,

    authorFullName:
      form.authorFullName,

    authorRole:
      form.authorRole,

    opposingPartyName:
      form.opposingPartyName,

    subject:
      form.subject,

    facts:
      form.facts,

    legalArguments:
      form.legalArguments,

    evidence:
      form.evidenceText
        .split(
          '\n'
        )
        .map(
          (
            item
          ) =>
            item.trim()
        )
        .filter(
          Boolean
        ),

    request:
      form.request,

    closingNotes:
      form.closingNotes,
  }
}

export default function PetitionComposer({
  initialRecord = null,
  onSaved,
}: PetitionComposerProps) {
  const initialDraft =
    initialRecord
      ? petitionRecordToDraft(
          initialRecord
        )
      : createEmptyPetitionDraft()

  const [
    form,
    setForm,
  ] =
    useState<PetitionFormState>(
      () =>
        draftToForm(
          initialDraft
        )
    )

  const [
    step,
    setStep,
  ] =
    useState<
      1 | 2 | 3 | 4
    >(
      1
    )

  const [
    hydrated,
    setHydrated,
  ] =
    useState(
      Boolean(
        initialRecord
      )
    )

  const [
    recordId,
    setRecordId,
  ] =
    useState<string | undefined>(
      initialRecord?.id
    )

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
    useState(
      false
    )

  const [
    pendingAction,
    setPendingAction,
  ] =
    useState<PendingAction>(
      null
    )

  const [
    savedRecord,
    setSavedRecord,
  ] =
    useState<ClientPetitionRecord | null>(
      initialRecord
    )

  const [
    copied,
    setCopied,
  ] =
    useState(
      false
    )

  useEffect(() => {
    if (initialRecord) {
      setForm(
        draftToForm(
          petitionRecordToDraft(
            initialRecord
          )
        )
      )

      setRecordId(
        initialRecord.id
      )

      setSavedRecord(
        initialRecord
      )

      setHydrated(
        true
      )

      return
    }

    const guestDraft =
      readGuestPetitionDraft()

    if (guestDraft) {
      setForm(
        draftToForm(
          guestDraft
        )
      )
    }

    setHydrated(
      true
    )
  }, [
    initialRecord,
  ])

  useEffect(() => {
    if (
      !hydrated ||
      recordId
    ) {
      return
    }

    const timeout =
      window.setTimeout(
        () => {
          saveGuestPetitionDraft(
            formToDraft(
              form
            )
          )
        },
        350
      )

    return () => {
      window.clearTimeout(
        timeout
      )
    }
  }, [
    form,
    hydrated,
    recordId,
  ])

  const draft =
    useMemo(
      () =>
        formToDraft(
          form
        ),
      [
        form,
      ]
    )

  const selectedTemplate =
    useMemo(
      () =>
        getPetitionTemplate(
          form.templateKey
        ),
      [
        form.templateKey,
      ]
    )

  const previewText =
    useMemo(
      () =>
        buildPetitionText(
          draft
        ),
      [
        draft,
      ]
    )

  const updateField = <
    K extends keyof PetitionFormState,
  >(
    key:
      K,

    value:
      PetitionFormState[K]
  ) => {
    setForm(
      (
        current
      ) => ({
        ...current,
        [key]:
          value,
      })
    )

    setError(
      null
    )

    setSavedRecord(
      null
    )
  }

  const handleTemplateChange =
    (
      nextKey:
        PetitionTemplateKey
    ) => {
      const previousTemplate =
        getPetitionTemplate(
          form.templateKey
        )

      const nextTemplate =
        getPetitionTemplate(
          nextKey
        )

      setForm(
        (
          current
        ) => ({
          ...current,

          templateKey:
            nextKey,

          subject:
            !current.subject.trim() ||
            current.subject ===
              previousTemplate.subjectPlaceholder
              ? ''
              : current.subject,
        })
      )

      setError(
        null
      )

      setSavedRecord(
        null
      )

      void nextTemplate
    }

  const validateStep =
    (
      targetStep:
        1 | 2 | 3 | 4
    ): boolean => {
      const errors =
        validatePetitionStep(
          draft,
          targetStep
        )

      if (
        errors.length >
        0
      ) {
        setError(
          errors[0]
        )

        return false
      }

      setError(
        null
      )

      return true
    }

  const goNext =
    () => {
      if (
        step ===
        4
      ) {
        return
      }

      if (
        !validateStep(
          step
        )
      ) {
        return
      }

      if (
        step ===
        3
      ) {
        const account =
          getCurrentClientPortalAccount()

        if (!account) {
          setPendingAction(
            'preview'
          )

          setAuthOpen(
            true
          )

          return
        }
      }

      setStep(
        (
          current
        ) =>
          Math.min(
            current +
              1,
            4
          ) as
            | 1
            | 2
            | 3
            | 4
      )
    }

  const goBack =
    () => {
      setStep(
        (
          current
        ) =>
          Math.max(
            current -
              1,
            1
          ) as
            | 1
            | 2
            | 3
            | 4
      )

      setError(
        null
      )
    }

  const persist =
    (
      account:
        ClientPortalAccount,

      status:
        ClientPetitionStatus
    ) => {
      if (
        !validateStep(
          4
        )
      ) {
        return
      }

      try {
        const saved =
          saveClientPetition(
            account,
            draft,
            status,
            recordId
          )

        setRecordId(
          saved.id
        )

        setSavedRecord(
          saved
        )

        clearGuestPetitionDraft()

        setError(
          null
        )

        setAuthOpen(
          false
        )

        setPendingAction(
          null
        )

        onSaved?.(
          saved
        )
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'ذخیره لایحه انجام نشد.'
        )
      }
    }

  const handleSave =
    (
      status:
        ClientPetitionStatus
    ) => {
      const account =
        getCurrentClientPortalAccount()

      if (!account) {
        setPendingAction(
          status ===
          'ready'
            ? 'save-ready'
            : 'save-draft'
        )

        setAuthOpen(
          true
        )

        return
      }

      persist(
        account,
        status
      )
    }

  const handleAuthenticated =
    (
      account:
        ClientPortalAccount
    ) => {
      if (
        pendingAction ===
        'preview'
      ) {
        setAuthOpen(
          false
        )

        setPendingAction(
          null
        )

        setStep(
          4
        )

        return
      }

      if (
        pendingAction ===
        'save-ready'
      ) {
        persist(
          account,
          'ready'
        )

        return
      }

      if (
        pendingAction ===
        'save-draft'
      ) {
        persist(
          account,
          'draft'
        )

        return
      }

      setAuthOpen(
        false
      )
    }

  const handleCopy =
    async () => {
      try {
        if (
          navigator.clipboard
        ) {
          await navigator.clipboard.writeText(
            previewText
          )
        } else {
          const textarea =
            document.createElement(
              'textarea'
            )

          textarea.value =
            previewText

          textarea.style.position =
            'fixed'

          textarea.style.opacity =
            '0'

          document.body.appendChild(
            textarea
          )

          textarea.select()

          document.execCommand(
            'copy'
          )

          textarea.remove()
        }

        setCopied(
          true
        )

        window.setTimeout(
          () =>
            setCopied(
              false
            ),
          1800
        )
      } catch {
        setError(
          'کپی متن انجام نشد.'
        )
      }
    }

  const handlePrint =
    () => {
      const printWindow =
        window.open(
          '',
          '_blank',
          'width=900,height=750'
        )

      if (!printWindow) {
        setError(
          'مرورگر اجازه باز کردن صفحه چاپ را نداد.'
        )

        return
      }

      printWindow.opener =
        null

      printWindow.document.write(`
        <!doctype html>
        <html lang="fa" dir="rtl">
          <head>
            <meta charset="utf-8" />
            <title>لایحه - دادیار</title>
            <style>
              body {
                direction: rtl;
                font-family: Tahoma, Arial, sans-serif;
                margin: 48px;
                color: #0f172a;
                line-height: 2.1;
              }

              pre {
                white-space: pre-wrap;
                word-break: break-word;
                font-family: inherit;
                font-size: 14px;
              }

              @media print {
                body {
                  margin: 20mm;
                }
              }
            </style>
          </head>

          <body>
            <pre id="petition-content"></pre>
          </body>
        </html>
      `)

      printWindow.document.close()

      const content =
        printWindow.document.getElementById(
          'petition-content'
        )

      if (content) {
        content.textContent =
          previewText
      }

      printWindow.focus()

      window.setTimeout(
        () => {
          printWindow.print()
        },
        200
      )
    }

  return (
    <>
      <section
        dir="rtl"
        className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"
      >
        <header className="border-b border-slate-200 bg-gradient-to-l from-blue-50 via-white to-emerald-50 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <FileText
                size={23}
              />
            </div>

            <div>
              <p className="text-xs font-black text-blue-700">
                تنظیم لایحه
              </p>

              <h1 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                پیش‌نویس لایحه خود را مرحله‌به‌مرحله آماده کنید
              </h1>

              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                اطلاعات پرونده، شرح موضوع،
                دفاعیات، مستندات و درخواست
                نهایی را وارد کنید تا متن
                یکپارچه لایحه ساخته شود.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STEP_LABELS.map(
              (
                label,
                index
              ) => {
                const stepNumber =
                  (
                    index +
                    1
                  ) as
                    | 1
                    | 2
                    | 3
                    | 4

                const active =
                  step ===
                  stepNumber

                const completed =
                  step >
                  stepNumber

                return (
                  <div
                    key={
                      label
                    }
                    className={`rounded-xl border px-3 py-3 ${
                      active
                        ? 'border-blue-400 bg-blue-50'
                        : completed
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${
                          active
                            ? 'bg-blue-600 text-white'
                            : completed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2
                            size={14}
                          />
                        ) : (
                          stepNumber.toLocaleString(
                            'fa-IR'
                          )
                        )}
                      </span>

                      <span className="text-xs font-black text-slate-700">
                        {label}
                      </span>
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </header>

        <div className="p-5 sm:p-7">
          {savedRecord && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-black text-emerald-950">
                    لایحه ذخیره شد
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-6 text-emerald-700">
                    کد:
                    {' '}
                    <span dir="ltr">
                      {savedRecord.reference}
                    </span>
                    {' • '}
                    {
                      PETITION_STATUS_LABELS[
                        savedRecord.status
                      ]
                    }
                    {' • '}
                    {formatPetitionDateTime(
                      savedRecord.updatedAt
                    )}
                  </p>

                  <Link
                    href="/client-portal/petitions"
                    className="mt-3 inline-flex text-xs font-black text-emerald-800 underline underline-offset-4"
                  >
                    مشاهده لوایح من
                  </Link>
                </div>
              </div>
            </div>
          )}

          {step ===
            1 && (
            <div>
              <SectionTitle
                title="نوع لایحه"
                description="قالبی را انتخاب کنید که بیشترین تطابق را با موضوع شما دارد."
              />

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {PETITION_TEMPLATES.map(
                  (
                    template
                  ) => {
                    const active =
                      template.key ===
                      form.templateKey

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
                        className={`rounded-2xl border p-4 text-right transition ${
                          active
                            ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100'
                            : 'border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white'
                        }`}
                      >
                        <p className="text-sm font-black text-slate-900">
                          {template.title}
                        </p>

                        <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">
                          {template.description}
                        </p>
                      </button>
                    )
                  }
                )}
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <FormField
                  label="مرجع قضایی / مرجع رسیدگی"
                  required
                >
                  <input
                    value={
                      form.authorityName
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'authorityName',
                        event.target.value.slice(
                          0,
                          180
                        )
                      )
                    }
                    placeholder="مثلاً دادگاه عمومی حقوقی تهران"
                    className={
                      INPUT_CLASS
                    }
                  />
                </FormField>

                <FormField label="شعبه">
                  <input
                    value={
                      form.branch
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'branch',
                        event.target.value.slice(
                          0,
                          100
                        )
                      )
                    }
                    placeholder="مثلاً شعبه ۲۵"
                    className={
                      INPUT_CLASS
                    }
                  />
                </FormField>
              </div>
            </div>
          )}

          {step ===
            2 && (
            <div>
              <SectionTitle
                title="مشخصات پرونده و طرفین"
                description="اطلاعاتی را وارد کنید که برای شناسایی پرونده و تنظیم‌کننده لایحه لازم است."
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField label="شماره پرونده">
                  <input
                    value={
                      form.caseNumber ??
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'caseNumber',
                        event.target.value.slice(
                          0,
                          80
                        )
                      )
                    }
                    dir="ltr"
                    placeholder="شماره پرونده"
                    className={
                      INPUT_CLASS
                    }
                  />
                </FormField>

                <FormField label="شماره بایگانی شعبه">
                  <input
                    value={
                      form.archiveNumber ??
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'archiveNumber',
                        event.target.value.slice(
                          0,
                          80
                        )
                      )
                    }
                    dir="ltr"
                    placeholder="شماره بایگانی"
                    className={
                      INPUT_CLASS
                    }
                  />
                </FormField>

                <FormField
                  label="نام و نام خانوادگی تنظیم‌کننده"
                  required
                >
                  <input
                    value={
                      form.authorFullName
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'authorFullName',
                        event.target.value.slice(
                          0,
                          120
                        )
                      )
                    }
                    placeholder="نام و نام خانوادگی"
                    className={
                      INPUT_CLASS
                    }
                  />
                </FormField>

                <FormField
                  label="سمت در پرونده"
                  required
                >
                  <select
                    value={
                      form.authorRole
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'authorRole',
                        event.target
                          .value as PetitionPartyRole
                      )
                    }
                    className={
                      INPUT_CLASS
                    }
                  >
                    {(
                      Object.entries(
                        PETITION_PARTY_ROLE_LABELS
                      ) as Array<
                        [
                          PetitionPartyRole,
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
                        <option
                          key={
                            value
                          }
                          value={
                            value
                          }
                        >
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </FormField>

                <FormField label="طرف مقابل">
                  <input
                    value={
                      form.opposingPartyName ??
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'opposingPartyName',
                        event.target.value.slice(
                          0,
                          140
                        )
                      )
                    }
                    placeholder="نام شخص یا شرکت"
                    className={
                      INPUT_CLASS
                    }
                  />
                </FormField>

                <FormField
                  label="موضوع لایحه"
                  required
                >
                  <input
                    value={
                      form.subject
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'subject',
                        event.target.value.slice(
                          0,
                          220
                        )
                      )
                    }
                    placeholder={
                      selectedTemplate.subjectPlaceholder
                    }
                    className={
                      INPUT_CLASS
                    }
                  />
                </FormField>
              </div>
            </div>
          )}

          {step ===
            3 && (
            <div>
              <SectionTitle
                title="متن و مستندات"
                description="مطالب را به صورت دقیق و تفکیک‌شده وارد کنید تا متن نهایی منظم باقی بماند."
              />

              <div className="mt-5 space-y-5">
                <FormField
                  label="شرح موضوع و اتفاقات"
                  required
                  hint={
                    selectedTemplate.factsHint
                  }
                >
                  <textarea
                    rows={7}
                    value={
                      form.facts
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'facts',
                        event.target.value.slice(
                          0,
                          5000
                        )
                      )
                    }
                    placeholder="شرح موضوع را با ترتیب روشن وارد کنید..."
                    className={
                      TEXTAREA_CLASS
                    }
                  />
                </FormField>

                <FormField
                  label="توضیحات و دفاعیات"
                  hint="اختیاری"
                >
                  <textarea
                    rows={6}
                    value={
                      form.legalArguments ??
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'legalArguments',
                        event.target.value.slice(
                          0,
                          5000
                        )
                      )
                    }
                    placeholder="دفاعیات، توضیحات یا پاسخ‌های خود را وارد کنید..."
                    className={
                      TEXTAREA_CLASS
                    }
                  />
                </FormField>

                <FormField
                  label="دلایل و مستندات"
                  hint="هر مورد را در یک خط جدا وارد کنید"
                >
                  <textarea
                    rows={5}
                    value={
                      form.evidenceText
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'evidenceText',
                        event.target.value.slice(
                          0,
                          3000
                        )
                      )
                    }
                    placeholder={
                      'مثلاً:\nقرارداد مورخ ...\nرسید پرداخت\nاظهارنامه'
                    }
                    className={
                      TEXTAREA_CLASS
                    }
                  />
                </FormField>

                <FormField
                  label="درخواست نهایی"
                  required
                  hint={
                    selectedTemplate.requestHint
                  }
                >
                  <textarea
                    rows={4}
                    value={
                      form.request
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'request',
                        event.target.value.slice(
                          0,
                          2500
                        )
                      )
                    }
                    placeholder="درخواست نهایی خود را روشن و مشخص بنویسید..."
                    className={
                      TEXTAREA_CLASS
                    }
                  />
                </FormField>

                <FormField
                  label="توضیحات پایانی"
                  hint="اختیاری"
                >
                  <textarea
                    rows={3}
                    value={
                      form.closingNotes ??
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'closingNotes',
                        event.target.value.slice(
                          0,
                          1500
                        )
                      )
                    }
                    placeholder="در صورت نیاز توضیح پایانی اضافه کنید..."
                    className={
                      TEXTAREA_CLASS
                    }
                  />
                </FormField>
              </div>
            </div>
          )}

          {step ===
            4 && (
            <div>
              <SectionTitle
                title="پیش‌نمایش لایحه"
                description="متن نهایی را مرور کنید و در صورت نیاز به مراحل قبل برگردید و اصلاحات لازم را انجام دهید."
              />

              <div className="mt-5 rounded-2xl border border-slate-300 bg-slate-50 p-4 sm:p-6">
                <pre className="whitespace-pre-wrap break-words font-sans text-sm font-medium leading-8 text-slate-800">
                  {previewText}
                </pre>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  type="button"
                  onClick={
                    handleCopy
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-black text-slate-700"
                >
                  {copied ? (
                    <CheckCircle2
                      size={17}
                      className="text-emerald-600"
                    />
                  ) : (
                    <Copy
                      size={17}
                    />
                  )}

                  {copied
                    ? 'کپی شد'
                    : 'کپی متن'}
                </button>

                <button
                  type="button"
                  onClick={
                    handlePrint
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-black text-slate-700"
                >
                  <Printer
                    size={17}
                  />

                  چاپ
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSave(
                      'draft'
                    )
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-sm font-black text-amber-700"
                >
                  <Save
                    size={17}
                  />

                  ذخیره پیش‌نویس
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSave(
                      'ready'
                    )
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white"
                >
                  <ShieldCheck
                    size={17}
                  />

                  آماده بررسی
                </button>
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
            >
              {error}
            </p>
          )}

          <div className="mt-7 flex items-center justify-between border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={
                goBack
              }
              disabled={
                step ===
                1
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight
                size={17}
              />

              مرحله قبل
            </button>

            {step <
              4 && (
              <button
                type="button"
                onClick={
                  goNext
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
              >
                {step ===
                3
                  ? 'ساخت پیش‌نمایش'
                  : 'مرحله بعد'}

                <ChevronLeft
                  size={17}
                />
              </button>
            )}

            {step ===
              4 && (
              <button
                type="button"
                onClick={() =>
                  setStep(
                    3
                  )
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-black text-white"
              >
                <ArrowRight
                  size={17}
                />

                ویرایش متن
              </button>
            )}
          </div>
        </div>
      </section>

      <ClientAuthGateModal
        open={
          authOpen
        }
        title="برای ادامه تنظیم لایحه وارد شوید"
        onClose={() => {
          setAuthOpen(
            false
          )

          setPendingAction(
            null
          )
        }}
        onAuthenticated={
          handleAuthenticated
        }
      />
    </>
  )
}

function SectionTitle({
  title,
  description,
}: {
  title:
    string

  description:
    string
}) {
  return (
    <div>
      <h2 className="text-lg font-black text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-sm font-semibold leading-7 text-slate-500">
        {description}
      </p>
    </div>
  )
}

function FormField({
  label,
  required = false,
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
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="text-sm font-black text-slate-700">
          {label}

          {required && (
            <span className="mr-1 text-red-500">
              *
            </span>
          )}
        </span>

        {hint && (
          <span className="max-w-[60%] text-left text-[11px] font-semibold leading-5 text-slate-400">
            {hint}
          </span>
        )}
      </div>

      {children}
    </label>
  )
}