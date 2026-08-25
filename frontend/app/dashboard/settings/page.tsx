'use client'

import { useState } from 'react'

import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from 'lucide-react'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  changePassword,
  getChangePasswordErrorMessage,
} from '@/features/auth/api/change-password.api'

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'رمز عبور فعلی را وارد کنید.'),

    newPassword: z
      .string()
      .min(8, 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد.')
      .max(128, 'رمز عبور بیش از حد طولانی است.'),

    confirmPassword: z
      .string()
      .min(1, 'تکرار رمز عبور را وارد کنید.'),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      path: ['confirmPassword'],
      message: 'رمز عبور جدید و تکرار آن یکسان نیستند.',
    },
  )
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      path: ['newPassword'],
      message: 'رمز عبور جدید نباید با رمز فعلی یکسان باشد.',
    },
  )

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

const INPUT_CLASS =
  'h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 pr-11 text-right text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-700 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100'

const LABEL_CLASS =
  'mb-1.5 block text-right text-sm font-medium text-zinc-700'

const ERROR_CLASS =
  'mt-1.5 text-xs font-medium text-red-600'

  export default function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: ChangePasswordFormData) {
    setApiError(null)
    setSuccessMessage(null)
    setIsSaving(true)

    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      reset()
      setSuccessMessage('رمز عبور شما با موفقیت تغییر کرد.')
    } catch (error: unknown) {
      setApiError(getChangePasswordErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">تنظیمات</h1>

        <p className="mt-1 text-sm text-zinc-500">
          حساب کاربری و امنیت ورود خود را مدیریت کنید.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      {apiError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {apiError}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="flex items-center gap-2 font-bold text-zinc-900">
          <KeyRound size={18} />
          تغییر رمز عبور
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          برای تغییر رمز عبور، ابتدا رمز فعلی خود را تأیید کنید.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
          noValidate
        >
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className={LABEL_CLASS}>
              رمز عبور فعلی
            </label>

            <div className="relative">
              <input
                id="currentPassword"
                {...register('currentPassword')}
                type={showCurrentPassword ? 'text' : 'password'}
                dir="ltr"
                autoComplete="current-password"
                disabled={isSaving}
                className={INPUT_CLASS}
              />

              <button
                type="button"
                onClick={() => setShowCurrentPassword((current) => !current)}
                className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100"
                aria-label={showCurrentPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.currentPassword && (
              <p className={ERROR_CLASS}>{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className={LABEL_CLASS}>
              رمز عبور جدید
            </label>

            <div className="relative">
              <input
                id="newPassword"
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                dir="ltr"
                autoComplete="new-password"
                disabled={isSaving}
                placeholder="حداقل ۸ کاراکتر"
                className={INPUT_CLASS}
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((current) => !current)}
                className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100"
                aria-label={showNewPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.newPassword && (
              <p className={ERROR_CLASS}>{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className={LABEL_CLASS}>
              تکرار رمز عبور جدید
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                dir="ltr"
                autoComplete="new-password"
                disabled={isSaving}
                placeholder="تکرار رمز عبور جدید"
                className={INPUT_CLASS}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100"
                aria-label={showConfirmPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className={ERROR_CLASS}>{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                ذخیره رمز عبور جدید
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  )
}