'use client'

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  useRouter,
} from 'next/navigation'

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Save,
  Send,
} from 'lucide-react'

import {
  createClientPetition,
  submitClientPetition,
  updateClientPetition,
} from '@/services/client-petition.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  CreateClientPetitionInput,
} from '@/types/client-petition'


interface PetitionFormState {
  title: string

  caseNumber: string

  court: string

  subject: string

  facts: string

  arguments: string

  evidenceText: string

  requestedRelief: string
}


const INITIAL_FORM:
  PetitionFormState = {
    title: '',

    caseNumber: '',

    court: '',

    subject: '',

    facts: '',

    arguments: '',

    evidenceText: '',

    requestedRelief: '',
  }


function parseEvidence(
  value: string,
): string[] {
  return Array.from(
    new Set(
      value
        .split(
          /\r?\n/,
        )
        .map(
          (item) =>
            item.trim(),
        )
        .filter(Boolean),
    ),
  )
}


function buildPayload(
  form:
    PetitionFormState,
): CreateClientPetitionInput {
  return {
    title:
      form.title.trim(),

    ...(form.caseNumber.trim()
      ? {
          caseNumber:
            form.caseNumber.trim(),
        }
      : {}),

    ...(form.court.trim()
      ? {
          court:
            form.court.trim(),
        }
      : {}),

    ...(form.subject.trim()
      ? {
          subject:
            form.subject.trim(),
        }
      : {}),

    ...(form.facts.trim()
      ? {
          facts:
            form.facts.trim(),
        }
      : {}),

    ...(form.arguments.trim()
      ? {
          arguments:
            form.arguments.trim(),
        }
      : {}),

    evidence:
      parseEvidence(
        form.evidenceText,
      ),

    ...(form.requestedRelief.trim()
      ? {
          requestedRelief:
            form.requestedRelief.trim(),
        }
      : {}),
  }
}


function validateDraft(
  form:
    PetitionFormState,
): string | null {
  if (
    !form.title.trim()
  ) {
    return 'عنوان لایحه را وارد کنید.'
  }

  if (
    form.title.trim().length >
    200
  ) {
    return 'عنوان لایحه بیش از حد مجاز است.'
  }

  const evidence =
    parseEvidence(
      form.evidenceText,
    )

  if (
    evidence.length >
    20
  ) {
    return 'حداکثر ۲۰ مورد مستندات قابل ثبت است.'
  }

  return null
}


function validateForSubmit(
  form:
    PetitionFormState,
): string | null {
  const draftError =
    validateDraft(
      form,
    )

  if (draftError) {
    return draftError
  }

  if (
    !form.subject.trim()
  ) {
    return 'موضوع لایحه را وارد کنید.'
  }

  if (
    !form.facts.trim()
  ) {
    return 'شرح موضوع و وقایع را وارد کنید.'
  }

  if (
    !form.requestedRelief.trim()
  ) {
    return 'درخواست نهایی لایحه را وارد کنید.'
  }

  return null
}


export default function NewClientPetitionPage() {
  const router =
    useRouter()

  const user =
    useAuthStore(
      (state) =>
        state.user,
    )

  const hasHydrated =
    useAuthStore(
      (state) =>
        state.hasHydrated,
    )

  const [
    form,
    setForm,
  ] =
    useState<PetitionFormState>(
      INITIAL_FORM,
    )

  const [
    petitionId,
    setPetitionId,
  ] =
    useState<
      string | null
    >(null)

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false)

  const [
    submitted,
    setSubmitted,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null)

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<
      string | null
    >(null)


  useEffect(() => {
    if (
      !hasHydrated
    ) {
      return
    }

    if (!user) {
      router.replace(
        '/login',
      )
    }
  }, [
    hasHydrated,
    router,
    user,
  ])


  const evidenceCount =
    useMemo(
      () =>
        parseEvidence(
          form.evidenceText,
        ).length,

      [
        form.evidenceText,
      ],
    )


  const busy =
    saving ||
    submitting


  function updateField<
    Key extends keyof PetitionFormState,
  >(
    key: Key,

    value:
      PetitionFormState[Key],
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,

        [key]:
          value,
      }),
    )

    if (error) {
      setError(
        null,
      )
    }

    if (
      successMessage
    ) {
      setSuccessMessage(
        null,
      )
    }
  }


  async function saveDraft(): Promise<string> {
    const validationError =
      validateDraft(
        form,
      )

    if (
      validationError
    ) {
      throw new Error(
        validationError,
      )
    }

    const payload =
      buildPayload(
        form,
      )

    if (
      petitionId
    ) {
      const updated =
        await updateClientPetition(
          petitionId,

          payload,
        )

      return updated.id
    }

    const created =
      await createClientPetition(
        payload,
      )

    setPetitionId(
      created.id,
    )

    return created.id
  }


  async function handleSaveDraft(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      busy ||
      submitted
    ) {
      return
    }

    try {
      setSaving(
        true,
      )

      setError(
        null,
      )

      setSuccessMessage(
        null,
      )

      await saveDraft()

      setSuccessMessage(
        'پیش‌نویس لایحه با موفقیت روی سرور ذخیره شد.',
      )
    } catch (
      caughtError: unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'ذخیره پیش‌نویس ناموفق بود.',
      )
    } finally {
      setSaving(
        false,
      )
    }
  }


  async function handleSubmitPetition() {
    if (
      busy ||
      submitted
    ) {
      return
    }

    const validationError =
      validateForSubmit(
        form,
      )

    if (
      validationError
    ) {
      setError(
        validationError,
      )

      return
    }

    try {
      setSubmitting(
        true,
      )

      setError(
        null,
      )

      setSuccessMessage(
        null,
      )

      const id =
        await saveDraft()

      await submitClientPetition(
        id,
      )

      setSubmitted(
        true,
      )

      setSuccessMessage(
        'لایحه با موفقیت ثبت و ارسال شد.',
      )
    } catch (
      caughtError: unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'ارسال لایحه ناموفق بود.',
      )
    } finally {
      setSubmitting(
        false,
      )
    }
  }


  if (
    !hasHydrated
  ) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-100"
      >
        <Loader2
          size={28}
          className="animate-spin text-blue-600"
        />
      </main>
    )
  }


  if (!user) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-100"
      >
        <Loader2
          size={28}
          className="animate-spin text-blue-600"
        />
      </main>
    )
  }


  if (
    user.role !==
    'CLIENT'
  ) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-100 px-4"
      >
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <h1 className="text-xl font-black text-slate-950">
            دسترسی غیرمجاز
          </h1>

          <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
            تنظیم لایحه در این بخش فقط برای حساب موکل فعال است.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
          >
            بازگشت به داشبورد
          </Link>
        </section>
      </main>
    )
  }


  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 py-8 sm:py-12"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/client-portal"
            className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-blue-700"
          >
            <ArrowRight
              size={18}
            />

            بازگشت به خدمات موکلین
          </Link>

          {petitionId && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
              {submitted
                ? 'لایحه ارسال شده'
                : 'پیش‌نویس روی سرور ذخیره شده'}
            </span>
          )}
        </div>


        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <header className="border-b border-slate-200 bg-gradient-to-l from-blue-700 to-indigo-700 p-6 text-white sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <FileText
                  size={25}
                />
              </div>

              <div>
                <h1 className="text-2xl font-black sm:text-3xl">
                  تنظیم لایحه
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-blue-100">
                  اطلاعات این فرم مستقیماً در حساب شما روی سرور دادیار ذخیره می‌شود و دیگر وابسته به LocalStorage یا داده آزمایشی نیست.
                </p>
              </div>
            </div>
          </header>


          <form
            onSubmit={
              handleSaveDraft
            }
            className="space-y-7 p-5 sm:p-8"
          >
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
                {error}
              </div>
            )}


            {successMessage && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                <CheckCircle2
                  size={18}
                />

                {successMessage}
              </div>
            )}


            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="عنوان لایحه"
                required
              >
                <input
                  value={
                    form.title
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'title',

                      event.target.value,
                    )
                  }
                  disabled={
                    submitted
                  }
                  maxLength={
                    200
                  }
                  placeholder="مثلاً لایحه دفاعیه پرونده مطالبه وجه"
                  className={
                    inputClassName
                  }
                />
              </Field>


              <Field
                label="شماره پرونده"
                hint="اختیاری"
              >
                <input
                  value={
                    form.caseNumber
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'caseNumber',

                      event.target.value,
                    )
                  }
                  disabled={
                    submitted
                  }
                  maxLength={
                    100
                  }
                  placeholder="شماره پرونده یا کلاسه"
                  className={
                    inputClassName
                  }
                />
              </Field>


              <Field
                label="مرجع رسیدگی / شعبه"
                hint="اختیاری"
              >
                <input
                  value={
                    form.court
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'court',

                      event.target.value,
                    )
                  }
                  disabled={
                    submitted
                  }
                  maxLength={
                    200
                  }
                  placeholder="مثلاً شعبه ۱۲ دادگاه حقوقی تهران"
                  className={
                    inputClassName
                  }
                />
              </Field>


              <Field
                label="موضوع لایحه"
                required
              >
                <input
                  value={
                    form.subject
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'subject',

                      event.target.value,
                    )
                  }
                  disabled={
                    submitted
                  }
                  maxLength={
                    500
                  }
                  placeholder="موضوع اصلی لایحه"
                  className={
                    inputClassName
                  }
                />
              </Field>
            </div>


            <Field
              label="شرح موضوع و وقایع"
              required
              hint="شرح دقیق و به ترتیب زمانی"
            >
              <textarea
                value={
                  form.facts
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'facts',

                    event.target.value,
                  )
                }
                disabled={
                  submitted
                }
                maxLength={
                  10_000
                }
                rows={8}
                placeholder="شرح اتفاقات، سوابق پرونده و نکات مؤثر را وارد کنید..."
                className={
                  textareaClassName
                }
              />
            </Field>


            <Field
              label="دفاعیات و استدلال‌ها"
              hint="اختیاری"
            >
              <textarea
                value={
                  form.arguments
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'arguments',

                    event.target.value,
                  )
                }
                disabled={
                  submitted
                }
                maxLength={
                  15_000
                }
                rows={8}
                placeholder="دفاعیات، استدلال‌ها و نکات حقوقی موردنظر را وارد کنید..."
                className={
                  textareaClassName
                }
              />
            </Field>


            <Field
              label="مستندات و مدارک"
              hint={`هر مدرک در یک خط — ${evidenceCount.toLocaleString(
                'fa-IR',
              )} از ۲۰`}
            >
              <textarea
                value={
                  form.evidenceText
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'evidenceText',

                    event.target.value,
                  )
                }
                disabled={
                  submitted
                }
                rows={6}
                placeholder={
                  'قرارداد مورخ ...\nرسید پرداخت ...\nپیام یا مکاتبه ...'
                }
                className={
                  textareaClassName
                }
              />
            </Field>


            <Field
              label="درخواست نهایی"
              required
            >
              <textarea
                value={
                  form.requestedRelief
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'requestedRelief',

                    event.target.value,
                  )
                }
                disabled={
                  submitted
                }
                maxLength={
                  5_000
                }
                rows={5}
                placeholder="در پایان از مرجع رسیدگی دقیقاً چه درخواستی دارید؟"
                className={
                  textareaClassName
                }
              />
            </Field>


            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={
                  busy ||
                  submitted
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 text-sm font-black text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save
                    size={18}
                  />
                )}

                ذخیره پیش‌نویس
              </button>


              <button
                type="button"
                disabled={
                  busy ||
                  submitted
                }
                onClick={() =>
                  void handleSubmitPetition()
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Send
                    size={18}
                  />
                )}

                ثبت و ارسال لایحه
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}


const inputClassName =
  'h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'


const textareaClassName =
  'w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'


function Field({
  label,
  hint,
  required = false,
  children,
}: {
  label: string

  hint?: string

  required?: boolean

  children:
    React.ReactNode
}) {
  return (
    <label className="block">
      <span className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-800">
        {label}

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}

        {hint && (
          <span className="text-xs font-semibold text-slate-400">
            {hint}
          </span>
        )}
      </span>

      <div className="mt-2">
        {children}
      </div>
    </label>
  )
}