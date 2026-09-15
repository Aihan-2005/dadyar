'use client'

import {
  type FormEvent,
  useState,
} from 'react'

import Link from 'next/link'

import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Send,
} from 'lucide-react'

import ClientProfileRequirement from '@/components/client-portal/ClientProfileRequirement'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'

import {
  createClientLawyerInquiry,
} from '@/services/client-lawyer-inquiry.service'

import {
  useAuthStore,
} from '@/store/auth.store'


interface LawyerInquiryPanelProps {
  lawyer:
    ClientPortalLawyer
}


export default function LawyerInquiryPanel({
  lawyer,
}: LawyerInquiryPanelProps) {
  const user =
    useAuthStore(
      (
        state,
      ) =>
        state.user,
    )

  const hasHydrated =
    useAuthStore(
      (
        state,
      ) =>
        state.hasHydrated,
    )


  if (
    !hasHydrated
  ) {
    return (
      <PanelLoader />
    )
  }


  if (
    !user
  ) {
    return (
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
        <MessageCircle
          size={30}
          className="mx-auto text-blue-600"
        />

        <h3 className="mt-3 font-black text-slate-900">
          برای ارسال درخواست وارد شوید
        </h3>

        <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
          درخواست بررسی به نام حساب موکل شما ثبت می‌شود.
        </p>

        <Link
          href="/client-login?returnTo=/client-portal&mode=login"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
        >
          ورود به حساب موکل
        </Link>
      </section>
    )
  }


  if (
    user.role !==
    'CLIENT'
  ) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold leading-7 text-amber-800">
        ارسال درخواست بررسی فقط برای حساب موکل فعال است.
      </section>
    )
  }


  return (
    <ClientProfileRequirement
      title="برای ارسال درخواست، پروفایل را کامل کنید"
      description="وکیل نام واقعی ثبت‌شده در پروفایل موکل را همراه درخواست مشاهده خواهد کرد."
    >
      <ReadyInquiryForm
        lawyer={
          lawyer
        }
      />
    </ClientProfileRequirement>
  )
}


function ReadyInquiryForm({
  lawyer,
}: {
  lawyer:
    ClientPortalLawyer
}) {
  const [
    subject,

    setSubject,
  ] =
    useState(
      '',
    )

  const [
    description,

    setDescription,
  ] =
    useState(
      '',
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
    useState<
      string | null
    >(
      null,
    )

  const [
    createdInquiryId,

    setCreatedInquiryId,
  ] =
    useState<
      string | null
    >(
      null,
    )


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      submitting
    ) {
      return
    }

    const normalizedSubject =
      subject.trim()

    const normalizedDescription =
      description.trim()


    if (
      !normalizedSubject
    ) {
      setError(
        'موضوع درخواست را وارد کنید.',
      )

      return
    }


    if (
      !normalizedDescription
    ) {
      setError(
        'شرح درخواست را وارد کنید.',
      )

      return
    }


    if (
      normalizedSubject.length >
      200
    ) {
      setError(
        'موضوع درخواست نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد.',
      )

      return
    }


    if (
      normalizedDescription.length >
      5000
    ) {
      setError(
        'شرح درخواست نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد.',
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

      const inquiry =
        await createClientLawyerInquiry({
          lawyerId:
            lawyer.id,

          subject:
            normalizedSubject,

          description:
            normalizedDescription,
        })

      setCreatedInquiryId(
        inquiry.id,
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'ثبت درخواست بررسی ناموفق بود.',
      )
    } finally {
      setSubmitting(
        false,
      )
    }
  }


  if (
    createdInquiryId
  ) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2
          size={34}
          className="mx-auto text-emerald-600"
        />

        <h3 className="mt-3 text-lg font-black text-emerald-900">
          درخواست شما ثبت شد
        </h3>

        <p className="mt-2 text-sm font-semibold leading-7 text-emerald-800">
          درخواست بررسی برای{' '}
          {lawyer.fullName}{' '}
          ثبت شد. اگر وکیل آن را بپذیرد، ارتباط واقعی شما با همان وکیل ایجاد می‌شود.
        </p>

        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/client-portal/requests"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-black text-white"
          >
            مشاهده درخواست‌های من
          </Link>

          <button
            type="button"
            onClick={() => {
              setCreatedInquiryId(
                null,
              )

              setSubject(
                '',
              )

              setDescription(
                '',
              )

              setError(
                null,
              )
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-300 bg-white px-5 text-sm font-black text-emerald-700"
          >
            ثبت درخواست دیگر
          </button>
        </div>
      </section>
    )
  }


  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-5"
    >
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-black text-blue-900">
          درخواست بررسی برای{' '}
          {lawyer.fullName}
        </p>

        <p className="mt-1 text-xs font-semibold leading-6 text-blue-700">
          این درخواست مستقیم روی سرور برای همین وکیل ثبت می‌شود.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
          {error}
        </div>
      )}

      <label className="block">
        <span className="text-sm font-black text-slate-800">
          موضوع درخواست
        </span>

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
          maxLength={200}
          placeholder="مثلاً بررسی قرارداد خرید ملک"
          className="mt-2 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="text-sm font-black text-slate-800">
          شرح مسئله
        </span>

        <textarea
          value={
            description
          }
          onChange={(
            event,
          ) => {
            setDescription(
              event.target.value,
            )

            setError(
              null,
            )
          }}
          maxLength={5000}
          rows={8}
          placeholder="موضوع، اتفاقات مهم و سوال اصلی خود را توضیح دهید..."
          className="mt-2 w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <span className="mt-1 block text-left text-[11px] font-bold text-slate-400">
          {description.length.toLocaleString(
            'fa-IR',
          )}{' '}
          / ۵۰۰۰
        </span>
      </label>

      <button
        type="submit"
        disabled={
          submitting
        }
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

        ارسال درخواست بررسی
      </button>
    </form>
  )
}


function PanelLoader() {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <Loader2
        size={24}
        className="animate-spin text-blue-600"
      />
    </div>
  )
}