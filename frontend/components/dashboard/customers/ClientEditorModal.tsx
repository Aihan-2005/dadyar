'use client'

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'

import {
  AlertCircle,
  KeyRound,
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
  open:
    boolean

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
    fullName:
      '',

    phoneNumber:
      '',

    nationalId:
      '',

    personalPassword:
      '',

    birthDate:
      '',

    representative:
      '',

    address:
      '',

    description:
      '',
  }

 
const PERSONAL_PASSWORD_MIN_LENGTH =
  6

const PERSONAL_PASSWORD_MAX_LENGTH =
  64

const ADDRESS_MAX_LENGTH =
  500

const DESCRIPTION_MAX_LENGTH =
  1000

 

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
    useState<
      string | null
    >(
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

      personalPassword:
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

      description:
        client.description ??
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

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
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
    key:
      K,

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
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault()

      setValidationError(
        null
      )

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

      const personalPassword =
        form.personalPassword
          ?.trim() ??
        ''

      const birthDate =
        normalizeDigits(
          form.birthDate ??
            ''
        ).trim()

      const representative =
        form.representative
          ?.trim() ??
        ''

      const address =
        form.address
          ?.trim() ??
        ''

      const description =
        form.description
          ?.trim() ??
        ''

      

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

  

      if (
        personalPassword &&
        personalPassword.length <
          PERSONAL_PASSWORD_MIN_LENGTH
      ) {
        setValidationError(
          `رمز شخصی در صورت تعیین باید حداقل ${PERSONAL_PASSWORD_MIN_LENGTH.toLocaleString(
            'fa-IR'
          )} کاراکتر باشد.`
        )

        return
      }

      if (
        personalPassword.length >
        PERSONAL_PASSWORD_MAX_LENGTH
      ) {
        setValidationError(
          `رمز شخصی نمی‌تواند بیشتر از ${PERSONAL_PASSWORD_MAX_LENGTH.toLocaleString(
            'fa-IR'
          )} کاراکتر باشد.`
        )

        return
      }

      

      if (
        address.length >
        ADDRESS_MAX_LENGTH
      ) {
        setValidationError(
          `آدرس نمی‌تواند بیشتر از ${ADDRESS_MAX_LENGTH.toLocaleString(
            'fa-IR'
          )} کاراکتر باشد.`
        )

        return
      }

     

      if (
        description.length >
        DESCRIPTION_MAX_LENGTH
      ) {
        setValidationError(
          `توضیحات نمی‌تواند بیشتر از ${DESCRIPTION_MAX_LENGTH.toLocaleString(
            'fa-IR'
          )} کاراکتر باشد.`
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

        personalPassword:
          personalPassword ||
          undefined,

        birthDate:
          birthDate ||
          undefined,

        representative:
          representative ||
          undefined,

        address:
          address ||
          undefined,

        description:
          description ||
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
        ) => {
          event.stopPropagation()
        }}
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

            <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
              اطلاعات این فرم در پروفایل
              موکل ذخیره می‌شود.
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
          {/* Error */}

          {(validationError ||
            error) && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
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

          {/* Fields */}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Full Name */}

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
                    event.target.value
                  )
                }
                autoComplete="name"
                placeholder="مثال: علی رضایی"
                className={
                  inputClass
                }
              />
            </Field>

            {/* Mobile */}

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
                      event.target.value
                    ).slice(
                      0,
                      11
                    )
                  )
                }
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                placeholder="09123456789"
                className={
                  inputClass
                }
              />
            </Field>

            {/* National ID */}

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
                      event.target.value
                    ).slice(
                      0,
                      10
                    )
                  )
                }
                inputMode="numeric"
                dir="ltr"
                placeholder="1234567890"
                className={
                  inputClass
                }
              />
            </Field>

            {/* Personal Password */}

            <Field
              label="رمز شخصی"
              hint={
                client
                  ? 'اختیاری؛ فقط برای تغییر رمز مقدار وارد کنید.'
                  : 'اطلاعات شخصی موکل'
              }
            >
              <input
                value={
                  form.personalPassword ??
                  ''
                }
                onChange={(
                  event
                ) =>
                  update(
                    'personalPassword',
                    event.target.value
                  )
                }
                type="password"
                dir="ltr"
                autoComplete="new-password"
                maxLength={
                  PERSONAL_PASSWORD_MAX_LENGTH
                }
                placeholder="اختیاری"
                className={
                  inputClass
                }
              />
            </Field>

            {/* Birth Date */}

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
                      event.target.value
                    )
                  )
                }
                inputMode="numeric"
                dir="ltr"
                placeholder="1384/09/09"
                className={
                  inputClass
                }
              />

              {age !==
                null && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={
                      minor
                        ? 'font-bold text-red-600'
                        : 'font-medium text-emerald-700'
                    }
                  >
                    سن محاسبه‌شده:
                    {' '}
                    {age.toLocaleString(
                      'fa-IR'
                    )}
                    {' '}
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

            {/* Representative */}

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
                    event.target.value
                  )
                }
                placeholder="در صورت وجود"
                className={
                  inputClass
                }
              />
            </Field>

            {/* Address */}

            <div className="sm:col-span-2">
              <Field
                label="آدرس"
                hint={`${(
                  form.address?.length ??
                  0
                ).toLocaleString(
                  'fa-IR'
                )} / ${ADDRESS_MAX_LENGTH.toLocaleString(
                  'fa-IR'
                )}`}
              >
                <textarea
                  rows={2}
                  maxLength={
                    ADDRESS_MAX_LENGTH
                  }
                  value={
                    form.address ??
                    ''
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      'address',
                      event.target.value
                    )
                  }
                  placeholder="آدرس موکل..."
                  className={`${textareaClass} min-h-[76px]`}
                />
              </Field>
            </div>

            {/* Description */}

            <div className="sm:col-span-2">
              <Field
                label="توضیحات"
                hint={`${(
                  form.description
                    ?.length ??
                  0
                ).toLocaleString(
                  'fa-IR'
                )} / ${DESCRIPTION_MAX_LENGTH.toLocaleString(
                  'fa-IR'
                )}`}
              >
                <textarea
                  rows={3}
                  maxLength={
                    DESCRIPTION_MAX_LENGTH
                  }
                  value={
                    form.description ??
                    ''
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      'description',
                      event.target.value
                    )
                  }
                  placeholder="توضیحات تکمیلی درباره موکل..."
                  className={`${textareaClass} min-h-[92px]`}
                />
              </Field>
            </div>
          </div>

          {/* Password Info */}

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <KeyRound
                size={18}
                className="mt-0.5 shrink-0 text-blue-700"
              />

              <p className="text-xs font-medium leading-6 text-blue-800">
                تعیین رمز شخصی اختیاری است.
                در صورت تعیین، رمز فقط برای
                احراز هویت موکل استفاده
                می‌شود و مقدار اصلی آن بعد
                از ذخیره از سرور برنمی‌گردد.
              </p>
            </div>
          </div>

          {/* Case Role Info */}

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-medium leading-6 text-indigo-700">
            «سمت در پرونده» مانند خواهان یا
            خوانده هنگام اتصال موکل به
            پرونده ثبت می‌شود و جزو پروفایل
            ثابت موکل نیست.
          </div>

          {/* Footer */}

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
        <span className="text-sm font-medium text-zinc-800">
          {label}

          {required && (
            <span className="mr-1 text-red-500">
              *
            </span>
          )}
        </span>

        {hint && (
          <span className="text-[11px] font-medium text-zinc-400">
            {hint}
          </span>
        )}
      </div>

      {children}
    </label>
  )
}

 

const inputClass =
  'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'

const textareaClass =
  'w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'