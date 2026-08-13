'use client'

import {
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react'

interface AppLoadingScreenProps {
  title?: string

  description?: string
}

export default function AppLoadingScreen({
  title =
    'در حال آماده‌سازی دادیار...',

  description =
    'چند لحظه تا ورود به پنل مدیریت شما',
}: AppLoadingScreenProps) {
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center overflow-hidden bg-slate-100 px-4"
    >
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-40 h-[460px] w-[460px] rounded-full bg-blue-300/30 blur-[110px]" />

        <div className="absolute -bottom-44 -left-32 h-[440px] w-[440px] rounded-full bg-emerald-200/25 blur-[110px]" />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.07) 1px, transparent 1px)',

            backgroundSize:
              '46px 46px',
          }}
        />
      </div>

      {/* Loading Card */}

      <div className="relative z-10 w-full max-w-sm rounded-[30px] border-2 border-slate-200 bg-white p-7 text-center shadow-2xl shadow-slate-300/50 sm:p-9">
        {/* Logo */}

        <div className="relative mx-auto h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-[26px] bg-blue-300/30" />

          <div className="relative flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-blue-500 to-blue-700 text-3xl font-black text-white shadow-xl shadow-blue-200">
            د
          </div>
        </div>

        {/* Brand */}

        <h1 className="mt-5 text-2xl font-black text-slate-950">
          دادیار
        </h1>

        <div className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
          <ShieldCheck
            size={14}
          />

          اتصال امن
        </div>

        {/* Loader */}

        <div className="mt-7 flex justify-center">
          <LoaderCircle
            size={32}
            strokeWidth={2.5}
            className="animate-spin text-blue-600"
          />
        </div>

        <p className="mt-4 text-base font-black text-slate-900">
          {title}
        </p>

        <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-6 text-slate-600">
          {description}
        </p>

        {/* Progress */}

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-l from-blue-500 to-blue-700" />
        </div>
      </div>
    </div>
  )
}