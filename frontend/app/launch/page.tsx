import Link from 'next/link'

export default function LaunchPage() {
  return (
    <main
      dir="rtl"
      className="relative h-dvh overflow-hidden bg-slate-100 text-slate-950"
    >
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-52 h-[560px] w-[560px] rounded-full bg-blue-300/35 blur-[110px]" />

        <div className="absolute -bottom-52 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-200/25 blur-[110px]" />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Header */}

      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-lg font-black text-white shadow-md shadow-blue-200">
              د
            </div>

            <div>
              <p className="text-lg font-black text-slate-950">
                دادیار
              </p>

              <p className="text-xs font-semibold text-slate-600">
                مدیریت هوشمند دفتر وکالت
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            مشاهده پلن‌ها
          </Link>
        </div>
      </header>

      {/* Content */}

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center justify-center px-4 pb-4 pt-20 sm:px-8 sm:pb-6">
        <div className="w-full max-w-4xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-bold text-blue-800 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />

            نسل جدید مدیریت پرونده‌های حقوقی
          </div>

          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-black leading-[1.3] tracking-tight text-slate-950 sm:mt-6 sm:text-5xl lg:text-6xl">
            پرونده‌هات رو
            <span className="mx-2 text-blue-700">
              هوشمند
            </span>
            مدیریت کن
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-slate-700 sm:text-lg">
            ثبت پرونده، مدیریت موکلین،
            پیگیری امور مالی و کنترل اطلاعات
            دفتر وکالت؛ همه در یک پنل ساده و
            یکپارچه.
          </p>

          {/* Login cards */}

          <div className="mx-auto mt-7 grid max-w-3xl grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5">
            {/* Lawyer */}

            <Link
              href="/login"
              className="group rounded-[26px] border-2 border-blue-200 bg-white p-5 text-right shadow-md shadow-slate-300/40 transition duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-200/50 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl shadow-inner">
                  ⚖️
                </div>

                <span className="text-sm font-black text-blue-700 transition group-hover:-translate-x-1">
                  ورود ←
                </span>
              </div>

              <h2 className="mt-4 text-xl font-black text-slate-950 sm:text-2xl">
                ورود وکلا
              </h2>

              <p className="mt-2 text-sm font-semibold leading-7 text-slate-700 sm:text-base">
                ورود یا ثبت‌نام و دسترسی به
                پنل مدیریت دفتر وکالت
              </p>
            </Link>

            {/* Client */}

            <Link
              href="/client-login"
              className="group rounded-[26px] border-2 border-emerald-200 bg-white p-5 text-right shadow-md shadow-slate-300/40 transition duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-200/50 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl shadow-inner">
                  👤
                </div>

                <span className="text-sm font-black text-emerald-700 transition group-hover:-translate-x-1">
                  مشاهده ←
                </span>
              </div>

              <h2 className="mt-4 text-xl font-black text-slate-950 sm:text-2xl">
                ورود موکلین
              </h2>

              <p className="mt-2 text-sm font-semibold leading-7 text-slate-700 sm:text-base">
                مشاهده وضعیت و اطلاعات
                پرونده‌ها در پنل اختصاصی
                موکل
              </p>
            </Link>
          </div>

          {/* Feature badges */}

          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2 sm:mt-7">
            {[
              'مدیریت پرونده',
              'مدیریت موکلین',
              'گزارش مالی',
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm sm:text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}