import Link from 'next/link'

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  PenLine,
  Search,
  UserRound,
} from 'lucide-react'

export default function LaunchPage() {
  return (
    <main
      dir="rtl"
      className="relative min-h-dvh overflow-hidden bg-slate-100 text-slate-950"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-48 h-[520px] w-[520px] rounded-full bg-blue-300/30 blur-[110px]" />

        <div className="absolute -bottom-48 -left-40 h-[480px] w-[480px] rounded-full bg-emerald-200/25 blur-[110px]" />
      </div>

      <header className="relative z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-black text-white shadow-md shadow-blue-200">
              د
            </div>

            <div>
              <p className="text-lg font-black">
                دادیار
              </p>

              <p className="hidden text-xs font-semibold text-slate-600 sm:block">
                مدیریت هوشمند امور حقوقی
              </p>
            </div>
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-76px)] max-w-6xl items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-5xl">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-xs font-black text-blue-800 sm:text-sm">
              به دادیار خوش آمدید
            </span>

            <h1 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">
              مسیر مورد نظر خود را انتخاب کنید
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
              دادیار هم ابزار مدیریت دفتر
              وکالت است و هم مسیر یکپارچه‌ای
              برای دریافت و مدیریت خدمات
              حقوقی موکلین.
            </p>
          </div>

          <div className="mx-auto mt-8 grid gap-5 lg:grid-cols-2">
            <Link
              href="/login"
              className="group rounded-[28px] border border-blue-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                <BriefcaseBusiness
                  size={27}
                />
              </div>

              <h2 className="mt-5 text-xl font-black sm:text-2xl">
                پنل وکلا
              </h2>

              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                مدیریت پرونده‌ها، موکلین،
                امور مالی، قراردادها،
                پیگیری‌ها و جریان کاری دفتر
                وکالت.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-700">
                ورود به پنل وکیل

                <ArrowLeft
                  size={17}
                />
              </div>
            </Link>

            <Link
              href="/client-portal"
              className="group rounded-[28px] border border-emerald-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-500 group-hover:text-white">
                <UserRound
                  size={27}
                />
              </div>

              <h2 className="mt-5 text-xl font-black sm:text-2xl">
                خدمات موکلین
              </h2>

              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                وکیل پیدا کنید، درخواست بررسی
                بفرستید، مشاوره رزرو کنید،
                قرارداد آنلاین داشته باشید و
                لایحه خود را تنظیم کنید.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Feature
                  icon={
                    Search
                  }
                  label="انتخاب وکیل"
                />

                <Feature
                  icon={
                    CalendarDays
                  }
                  label="رزرو مشاوره"
                />

                <Feature
                  icon={
                    FileText
                  }
                  label="قرارداد آنلاین"
                />

                <Feature
                  icon={
                    PenLine
                  }
                  label="تنظیم لایحه"
                />
              </div>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700">
                ورود به بخش موکلین

                <ArrowLeft
                  size={17}
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

function Feature({
  icon:
    Icon,
  label,
}: {
  icon:
    typeof Search

  label:
    string
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-black text-slate-600">
      <Icon
        size={15}
        className="text-emerald-600"
      />

      {label}
    </div>
  )
}