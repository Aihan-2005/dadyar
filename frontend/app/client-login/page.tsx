import Link from 'next/link'

export default function ClientLoginComingSoonPage() {
  return (
    <main
      dir="rtl"
      className="relative flex h-dvh items-center justify-center overflow-hidden bg-slate-50 px-5 text-slate-900"
    >
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-40 h-[460px] w-[460px] rounded-full bg-blue-200/40 blur-[100px]" />

        <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-sky-100/70 blur-[100px]" />
      </div>

      {/* Card */}

      <section className="relative z-10 w-full max-w-xl rounded-[32px] border border-slate-200 bg-white/90 p-8 text-center shadow-xl shadow-slate-200/50 backdrop-blur sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-3xl">
          👤
        </div>

        <span className="mt-6 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
          در حال توسعه
        </span>

        <h1 className="mt-5 text-3xl font-black text-slate-950">
          پنل موکلین
        </h1>

        <p className="mt-4 text-xl font-black text-blue-600">
          به‌زودی...
        </p>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
          پنل اختصاصی موکلین دادیار در حال
          توسعه است. به‌زودی امکان مشاهده
          وضعیت پرونده‌ها و اطلاعات مرتبط
          برای موکلین فراهم خواهد شد.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/launch"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            بازگشت
          </Link>

          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ورود وکلا
          </Link>
        </div>
      </section>
    </main>
  )
}