import Link from 'next/link'

import {
  ArrowLeft,
  BriefcaseBusiness,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

export default function LaunchPage() {
  return (
    <main
      dir="rtl"
      className="relative h-dvh overflow-hidden bg-slate-100 text-slate-950"
    >



      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-48 h-[520px] w-[520px] rounded-full bg-blue-300/30 blur-[110px]" />

        <div className="absolute -bottom-48 -left-40 h-[480px] w-[480px] rounded-full bg-emerald-200/25 blur-[110px]" />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.08) 1px, transparent 1px)',

            backgroundSize:
              '48px 48px',
          }}
        />
      </div>



      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-black text-white shadow-md shadow-blue-200">
              د
            </div>

            <div>
              <p className="text-lg font-black text-slate-950">
                دادیار
              </p>

              <p className="hidden text-xs font-semibold text-slate-600 sm:block">
                مدیریت هوشمند امور حقوقی
              </p>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
            <ShieldCheck
              size={15}
            />

            ورود امن
          </div>
        </div>
      </header>



      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center justify-center px-4 pb-4 pt-20 sm:px-6">
        <div className="w-full max-w-4xl">
          {/* Hero */}

          <div className="text-center">
            <span className="inline-flex rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-xs font-black text-blue-800 sm:text-sm">
              به دادیار خوش آمدید
            </span>

            <h1 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              نوع حساب خود را انتخاب کنید
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-700 sm:text-base">
              برای ورود به فضای مخصوص خود،
              یکی از گزینه‌های زیر را انتخاب
              کنید.
            </p>
          </div>

          {/* Cards */}

          <div className="mx-auto mt-7 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {/* Lawyer */}

            <Link
              href="/login"
              className="group rounded-[26px] border border-blue-200 bg-white p-5 shadow-md shadow-slate-300/30 transition duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl sm:p-6"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                <BriefcaseBusiness
                  size={27}
                />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950 sm:text-2xl">
                ورود وکلا
              </h2>

              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600 sm:text-base">
                مدیریت پرونده‌ها، موکلین،
                گزارش مالی و امور دفتر وکالت
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-700">
                ورود به پنل وکیل

                <ArrowLeft
                  size={17}
                />
              </div>
            </Link>

            {/* Client */}

            <Link
              href="/client-login"
              className="group rounded-[26px] border border-emerald-200 bg-white p-5 shadow-md shadow-slate-300/30 transition duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl sm:p-6"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-500 group-hover:text-white">
                <UserRound
                  size={27}
                />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950 sm:text-2xl">
                ورود موکلین
              </h2>

              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600 sm:text-base">
                پیدا کردن وکیل مناسب،
                مشاهده اطلاعات و برقراری
                ارتباط با وکلا
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700">
                ورود به پنل موکل

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