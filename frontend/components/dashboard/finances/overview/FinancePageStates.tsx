import Link from 'next/link'

import {

  AlertCircle,

  FilePlus2,

  RefreshCw,

} from 'lucide-react'



interface RetryStateProps {

  message: string

  isRetrying: boolean

  onRetry: () => void

}



export function FinanceOverviewSkeleton() {

  return (

    <div

      aria-label="در حال بارگذاری گزارش مالی"

      className="space-y-6"

    >

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {Array.from({ length: 8 }).map((_, index) => (

          <div

            key={index}

            className="h-44 animate-pulse rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"

          >

            <div className="flex items-start justify-between">

              <div className="h-11 w-11 rounded-xl bg-zinc-100" />

              <div className="h-6 w-16 rounded-full bg-zinc-100" />

            </div>



            <div className="mt-5 h-3 w-24 rounded bg-zinc-100" />

            <div className="mt-3 h-7 w-36 rounded bg-zinc-100" />

            <div className="mt-3 h-3 w-full rounded bg-zinc-100" />

          </div>

        ))}

      </div>



      <div className="grid min-h-80 animate-pulse gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm xl:grid-cols-[280px_minmax(0,1fr)]">

        <div className="flex items-center justify-center rounded-2xl bg-zinc-50">

          <div className="h-44 w-44 rounded-full bg-zinc-100" />

        </div>



        <div className="space-y-6 py-4">

          {Array.from({ length: 4 }).map((_, index) => (

            <div key={index}>

              <div className="mb-3 h-4 w-1/3 rounded bg-zinc-100" />

              <div className="h-2.5 w-full rounded-full bg-zinc-100" />

            </div>

          ))}

        </div>

      </div>



      <div className="h-72 animate-pulse rounded-2xl border border-zinc-200 bg-white shadow-sm">

        <div className="h-20 border-b border-zinc-100 bg-zinc-50/50" />



        <div className="space-y-4 p-6">

          {Array.from({ length: 4 }).map((_, index) => (

            <div

              key={index}

              className="h-10 rounded bg-zinc-100"

            />

          ))}

        </div>

      </div>

    </div>

  )

}



export function FinanceErrorState({

  message,

  isRetrying,

  onRetry,

}: RetryStateProps) {

  return (

    <div className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center shadow-sm">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">

        <AlertCircle size={28} />

      </div>



      <h2 className="mt-5 text-lg font-black text-zinc-900">

        دریافت اطلاعات مالی ناموفق بود

      </h2>



      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">

        {message}

      </p>



      <button

        type="button"

        onClick={onRetry}

        disabled={isRetrying}

        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"

      >

        <RefreshCw

          size={16}

          className={isRetrying ? 'animate-spin' : undefined}

        />



        {isRetrying

          ? 'در حال تلاش مجدد'

          : 'تلاش مجدد'}

      </button>

    </div>

  )

}



export function FinanceEmptyState() {

  return (

    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center shadow-sm">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

        <FilePlus2 size={28} />

      </div>



      <h2 className="mt-5 text-lg font-black text-zinc-900">

        هنوز اطلاعات مالی ثبت نشده است

      </h2>



      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">

        برای ساخت اولین گزارش، یک پرونده همراه با مبلغ قرارداد

        و اطلاعات پرداخت ثبت کنید.

      </p>



      <Link

        href="/dashboard/cases/new"

        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"

      >

        <FilePlus2 size={16} />

        ثبت پرونده جدید

      </Link>

    </div>

  )

}



export function FinanceStaleDataNotice({

  message,

  isRetrying,

  onRetry,

}: RetryStateProps) {

  return (

    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex items-start gap-2 text-sm text-amber-800">

        <AlertCircle

          size={18}

          className="mt-0.5 shrink-0"

        />



        <p>

          داده‌های ذخیره‌شده نمایش داده می‌شوند، اما بروزرسانی

          از سرور انجام نشد: {message}

        </p>

      </div>



      <button

        type="button"

        onClick={onRetry}

        disabled={isRetrying}

        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100 disabled:opacity-60"

      >

        <RefreshCw

          size={14}

          className={isRetrying ? 'animate-spin' : undefined}

        />



        تلاش مجدد

      </button>

    </div>

  )

}