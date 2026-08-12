

'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  AlertCircle,
  Loader2,
} from 'lucide-react'

import type {
  Client,
  CreateClientPayload,
} from '@/types/client'

import {
  useClientStore,
} from '@/store/client.store'

import {
  normalizeDigits,
} from '@/features/finance/utils/number'



interface Props {
  client?: Client

  onSuccess?: () => void

  onCancel: () => void
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



export function ClientForm({
  client,
  onSuccess,
  onCancel,
}: Props) {


  const addClient =
    useClientStore(
      (state) =>
        state.addClient
    )

  const updateClient =
    useClientStore(
      (state) =>
        state.updateClient
    )

  const isSaving =
    useClientStore(
      (state) =>
        state.isSaving
    )

  const error =
    useClientStore(
      (state) =>
        state.error
    )

  const clearError =
    useClientStore(
      (state) =>
        state.clearError
    )

 

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
    clearError()

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
        client.fullName ??
        '',

      phoneNumber:
        client.phoneNumber ??
        client.phone ??
        '',

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
    clearError,
  ])

 

  const updateField = <
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

    if (
      validationError
    ) {
      setValidationError(
        null
      )
    }

    if (error) {
      clearError()
    }
  }


  const validateForm =
    (): CreateClientPayload | null => {
      const fullName =
        form.fullName.trim()

      const phoneNumber =
        normalizeDigits(
          form.phoneNumber
        ).trim()

      const nationalId =
        normalizeDigits(
          form.nationalId ??
          ''
        ).trim()

      const landlineNumber =
        normalizeDigits(
          form.landlineNumber ??
          ''
        ).trim()

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

      if (!fullName) {
        setValidationError(
          'نام و نام خانوادگی موکل الزامی است.'
        )

        return null
      }

     
      if (
        !/^09\d{9}$/.test(
          phoneNumber
        )
      ) {
        setValidationError(
          'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.'
        )

        return null
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

        return null
      }

      return {
        fullName,

        phoneNumber,

        nationalId:
          nationalId ||
          undefined,

        landlineNumber:
          landlineNumber ||
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
      }
    }


  const handleSubmit =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault()

      if (isSaving) {
        return
      }

      clearError()

      setValidationError(
        null
      )

      const payload =
        validateForm()

      if (!payload) {
        return
      }

    
      if (client) {
        const updatedClient =
          await updateClient(
            client.id,
            payload
          )

        if (!updatedClient) {
          return
        }

        onSuccess?.()

        return
      }

     
      const createdClient =
        await addClient(
          payload
        )

      if (!createdClient) {
        return
      }

      onSuccess?.()
    }

 
  const handleCancel =
    () => {
      if (isSaving) {
        return
      }

      clearError()

      setValidationError(
        null
      )

      onCancel()
    }

  

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-5"
      noValidate
    >
      {(validationError ||
        error) && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p className="leading-6">
            {validationError ??
              error}
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="client-full-name"
          className={
            labelClass
          }
        >
          نام و نام خانوادگی

          <RequiredMark />
        </label>

        <input
          id="client-full-name"
          type="text"
          value={
            form.fullName
          }
          disabled={
            isSaving
          }
          onChange={(
            event
          ) =>
            updateField(
              'fullName',
              event.target
                .value
            )
          }
          placeholder="مثال: علی رضایی"
          autoComplete="name"
          className={
            inputClass
          }
        />
      </div>

    

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="client-phone"
            className={
              labelClass
            }
          >
            شماره موبایل

            <RequiredMark />
          </label>

          <input
            id="client-phone"
            type="tel"
            inputMode="numeric"
            dir="ltr"
            value={
              form.phoneNumber
            }
            disabled={
              isSaving
            }
            onChange={(
              event
            ) => {
              const value =
                normalizeDigits(
                  event.target
                    .value
                )
                  .replace(
                    /\D/g,
                    ''
                  )
                  .slice(
                    0,
                    11
                  )

              updateField(
                'phoneNumber',
                value
              )
            }}
            placeholder="09123456789"
            autoComplete="tel"
            className={`${inputClass} text-left`}
          />
        </div>

        <div>
          <label
            htmlFor="client-national-id"
            className={
              labelClass
            }
          >
            کد ملی
          </label>

          <input
            id="client-national-id"
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={
              form.nationalId ??
              ''
            }
            disabled={
              isSaving
            }
            onChange={(
              event
            ) => {
              const value =
                normalizeDigits(
                  event.target
                    .value
                )
                  .replace(
                    /\D/g,
                    ''
                  )
                  .slice(
                    0,
                    10
                  )

              updateField(
                'nationalId',
                value
              )
            }}
            placeholder="1234567890"
            className={`${inputClass} text-left`}
          />
        </div>
      </div>


      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="client-landline"
            className={
              labelClass
            }
          >
            تلفن ثابت
          </label>

          <input
            id="client-landline"
            type="tel"
            inputMode="numeric"
            dir="ltr"
            value={
              form.landlineNumber ??
              ''
            }
            disabled={
              isSaving
            }
            onChange={(
              event
            ) => {
              const value =
                normalizeDigits(
                  event.target
                    .value
                ).replace(
                  /[^\d]/g,
                  ''
                )

              updateField(
                'landlineNumber',
                value
              )
            }}
            placeholder="02112345678"
            className={`${inputClass} text-left`}
          />
        </div>

        <div>
          <label
            htmlFor="client-birth-date"
            className={
              labelClass
            }
          >
            تاریخ تولد
          </label>

          <input
            id="client-birth-date"
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={
              form.birthDate ??
              ''
            }
            disabled={
              isSaving
            }
            onChange={(
              event
            ) => {
              const value =
                normalizeDigits(
                  event.target
                    .value
                )
                  .replace(
                    /[^\d/]/g,
                    ''
                  )
                  .slice(
                    0,
                    10
                  )

              updateField(
                'birthDate',
                value
              )
            }}
            placeholder="1380/05/21"
            className={`${inputClass} text-left`}
          />

          <p className="mt-1.5 text-[11px] text-zinc-400">
            تاریخ را به صورت شمسی وارد کنید.
          </p>
        </div>
      </div>

     
      <div>
        <label
          htmlFor="client-representative"
          className={
            labelClass
          }
        >
          نماینده
        </label>

        <input
          id="client-representative"
          type="text"
          value={
            form.representative ??
            ''
          }
          disabled={
            isSaving
          }
          onChange={(
            event
          ) =>
            updateField(
              'representative',
              event.target
                .value
            )
          }
          placeholder="نام نماینده در صورت وجود"
          className={
            inputClass
          }
        />
      </div>


      <div>
        <label
          htmlFor="client-address"
          className={
            labelClass
          }
        >
          آدرس
        </label>

        <textarea
          id="client-address"
          rows={4}
          value={
            form.address ??
            ''
          }
          disabled={
            isSaving
          }
          onChange={(
            event
          ) =>
            updateField(
              'address',
              event.target
                .value
            )
          }
          placeholder="آدرس کامل موکل"
          className={`${inputClass} resize-none`}
        />
      </div>


      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-6 text-blue-700">
        سمت موکل در پرونده، شماره قرارداد و اطلاعات مرتبط با هر پرونده در بخش پرونده ثبت می‌شوند و جزو پروفایل ثابت موکل نیستند.
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row">
        <button
          type="submit"
          disabled={
            isSaving
          }
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving && (
            <Loader2
              size={17}
              className="animate-spin"
            />
          )}

          {isSaving
            ? 'در حال ذخیره...'
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
            handleCancel
          }
          className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          انصراف
        </button>
      </div>
    </form>
  )
}


function RequiredMark() {
  return (
    <span className="mr-1 text-red-500">
      *
    </span>
  )
}

const labelClass =
  'mb-2 block text-right text-sm font-medium text-zinc-700'

const inputClass =
  'w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-right text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500'