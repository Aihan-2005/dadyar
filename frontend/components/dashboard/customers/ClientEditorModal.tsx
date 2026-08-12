'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'

import type {
  Client,
  CreateClientPayload,
} from '@/types/client'

import {
  getClientAge,
  isClientMinor,
} from '@/features/clients/utils/client-date'

import {
  normalizeDigits,
} from '@/features/finance/utils/number'

interface Props {
  open: boolean

  client?:
    Client

  isSaving:
    boolean

  error?:
    string | null

  onClose:
    () => void

  onSubmit: (
    payload:
      CreateClientPayload
  ) => Promise<void>
}

const EMPTY_FORM:
  CreateClientPayload = {
    fullName: '',

    phoneNumber: '',

    nationalId: '',

    landlineNumber: '',

    birthDate: '',

    representative: '',

    address: '',
  }

export function ClientEditorModal({
  open,
  client,
  isSaving,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [
    form,
    setForm,
  ] =
    useState<CreateClientPayload>({
      ...EMPTY_FORM,
    })

  const [
    validationError,
    setValidationError,
  ] =
    useState<string | null>(
      null
    )

  useEffect(() => {
    if (!open) {
      return
    }

    setValidationError(
      null
    )

    if (!client) {
      setForm({
        ...EMPTY_FORM,
      })

      return
    }

    setForm({
      fullName:
        client.fullName,

      phoneNumber:
        client.phoneNumber,

      nationalId:
        client.nationalId ??
        '',

      landlineNumber:
        client.landlineNumber ??
        '',

      birthDate:
        client.birthDate ??
        '',

      representative:
        client.representative ??
        '',

      address:
        client.address ??
        '',
    })
  }, [
    client,
    open,
  ])

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.key ===
            'Escape' &&
          !isSaving
        ) {
          onClose()
        }
      }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
  }, [
    isSaving,
    onClose,
    open,
  ])

  if (!open) {
    return null
  }

  const age =
    getClientAge(
      form.birthDate
    )

  const minor =
    isClientMinor(
      form.birthDate
    )

  const update = <
    K extends keyof CreateClientPayload,
  >(
    key: K,
    value:
      CreateClientPayload[K]
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

    setValidationError(
      null
    )
  }

  const handleSubmit =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault()

      const fullName =
        form.fullName.trim()

      const phone =
        normalizeDigits(
          form.phoneNumber
        ).trim()

      const nationalId =
        normalizeDigits(
          form.nationalId ??
          ''
        ).trim()

      if (!fullName) {
        setValidationError(
          'نام و نام خانوادگی موکل الزامی است.'
        )

        return
      }

      if (
        !/^09\d{9}$/.test(
          phone
        )
      ) {
        setValidationError(
          'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.'
        )

        return
      }

      if (
        nationalId &&
        !/^\d{10}$/.test(
          nationalId
        )
      ) {
        setValidationError(
          'کد ملی باید دقیقاً ۱۰ رقم باشد.'
        )

        return
      }

      await onSubmit({
        fullName,

        phoneNumber:
          phone,

        nationalId:
          nationalId ||
          undefined,

        landlineNumber:
          normalizeDigits(
            form.landlineNumber ??
            ''
          ).trim() ||
          undefined,

        birthDate:
          normalizeDigits(
            form.birthDate ??
            ''
          ).trim() ||
          undefined,

        representative:
          form.representative
            ?.trim() ||
          undefined,

        address:
          form.address
            ?.trim() ||
          undefined,
      })
    }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={
        isSaving
          ? undefined
          : onClose
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-editor-title"
        className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-100 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2
              id="client-editor-title"
              className="text-lg font-black text-zinc-900"
            >
              {client
                ? 'ویرایش موکل'
                : 'افزودن موکل جدید'}
            </h2>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              اطلاعات این فرم مستقیماً در حساب کاربری شما در سرور ذخیره می‌شود.
            </p>
          </div>

          <button
            type="button"
            aria-label="بستن"
            disabled={
              isSaving
            }
            onClick={
              onClose
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-50"
          >
            <X
              size={19}
            />
          </button>
        </header>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6 p-5 sm:p-7"
        >
          {(validationError ||
            error) && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>
                {validationError ??
                  error}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="نام و نام خانوادگی"
              required
            >
              <input
                required
                value={
                  form.fullName
                }
                onChange={(
                  event
                ) =>
                  update(
                    'fullName',
                    event.target
                      .value
                  )
                }
                placeholder="مثال: علی رضایی"
                className={inputClass}
              />
            </Field>

            <Field
              label="شماره موبایل"
              required
            >
              <input
                required
                value={
                  form.phoneNumber
                }
                onChange={(
                  event
                ) =>
                  update(
                    'phoneNumber',
                    normalizeDigits(
                      event.target
                        .value
                    ).slice(
                      0,
                      11
                    )
                  )
                }
                inputMode="tel"
                dir="ltr"
                placeholder="09123456789"
                className={inputClass}
              />
            </Field>

            <Field label="کد ملی">
              <input
                value={
                  form.nationalId ??
                  ''
                }
                onChange={(
                  event
                ) =>
                  update(
                    'nationalId',
                    normalizeDigits(
                      event.target
                        .value
                    ).slice(
                      0,
                      10
                    )
                  )
                }
                inputMode="numeric"
                dir="ltr"
                placeholder="1234567890"
                className={inputClass}
              />
            </Field>

            <Field label="شماره تماس ثابت">
              <input
                value={
                  form.landlineNumber ??
                  ''
                }
                onChange={(
                  event
                ) =>
                  update(
                    'landlineNumber',
                    normalizeDigits(
                      event.target
                        .value
                    )
                  )
                }
                inputMode="tel"
                dir="ltr"
                placeholder="02112345678"
                className={inputClass}
              />
            </Field>

            <Field label="تاریخ تولد شمسی">
              <input
                value={
                  form.birthDate ??
                  ''
                }
                onChange={(
                  event
                ) =>
                  update(
                    'birthDate',
                    normalizeDigits(
                      event.target
                        .value
                    )
                  )
                }
                inputMode="numeric"
                dir="ltr"
                placeholder="1384/09/09"
                className={inputClass}
              />

              {age !== null && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={
                      minor
                        ? 'font-bold text-red-600'
                        : 'font-medium text-emerald-700'
                    }
                  >
                    سن محاسبه‌شده:{' '}
                    {age.toLocaleString(
                      'fa-IR'
                    )}{' '}
                    سال
                  </span>

                  {minor && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 font-bold text-red-600">
                      زیر سن قانونی
                    </span>
                  )}
                </div>
              )}
            </Field>

            <Field label="نماینده">
              <input
                value={
                  form.representative ??
                  ''
                }
                onChange={(
                  event
                ) =>
                  update(
                    'representative',
                    event.target
                      .value
                  )
                }
                placeholder="در صورت وجود"
                className={inputClass}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="آدرس">
                <textarea
                  rows={4}
                  value={
                    form.address ??
                    ''
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      'address',
                      event.target
                        .value
                    )
                  }
                  placeholder="آدرس موکل..."
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-6 text-blue-700">
            «سمت در پرونده» مانند خواهان یا خوانده هنگام اتصال موکل به پرونده ثبت می‌شود و جزو پروفایل ثابت موکل نیست.
          </div>

          <footer className="flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row">
            <button
              type="submit"
              disabled={
                isSaving
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {isSaving
                ? 'در حال ذخیره در سرور...'
                : client
                  ? 'ذخیره تغییرات'
                  : 'ثبت موکل'}
            </button>

            <button
              type="button"
              disabled={
                isSaving
              }
              onClick={
                onClose
              }
              className="rounded-xl border border-zinc-200 px-5 py-3 font-bold text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              انصراف
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string

  required?: boolean

  children:
    React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-800">
        {label}

        {required && (
          <span className="mr-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'