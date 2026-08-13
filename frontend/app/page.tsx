import Link from 'next/link'

const plans = [
  {
    key: 'free',
    title: 'رایگان (تستی)',
    price: '۰',
    period: '۵ روز',
    description:
      'برای آشنایی کامل با امکانات دادیار و تجربه محیط سامانه.',
    action:
      'شروع دوره رایگان',
    href:
      '/launch',
    features: [
      'مدیریت پرونده‌ها',
      'مدیریت موکلین',
      'گزارش مالی',
    ],
  },
  {
    key: '3m',
    title:
      'اشتراک ۳ ماهه',
    price:
      '۴۵۰,۰۰۰',
    period:
      '۳ ماه',
    description:
      'انتخاب مناسب برای شروع استفاده حرفه‌ای از دادیار.',
    action:
      'به‌زودی',
    features: [
      'مدیریت نامحدود پرونده',
      'مدیریت امور مالی',
      'یادآورها و پیگیری‌ها',
    ],
  },
  {
    key: '6m',
    title:
      'اشتراک ۶ ماهه',
    price:
      '۸۰۰,۰۰۰',
    period:
      '۶ ماه',
    description:
      'گزینه اقتصادی برای استفاده مستمر و مدیریت دفتر وکالت.',
    action:
      'به‌زودی',
    popular:
      true,
    features: [
      'تمام امکانات دادیار',
      'گزارش‌های مالی',
      'مدیریت حرفه‌ای موکلین',
    ],
  },
  {
    key: '12m',
    title:
      'اشتراک یک ساله',
    price:
      '۱,۴۰۰,۰۰۰',
    period:
      '۱۲ ماه',
    description:
      'بیشترین صرفه اقتصادی برای استفاده بلندمدت.',
    action:
      'به‌زودی',
    features: [
      'دسترسی کامل یک‌ساله',
      'تمام امکانات حرفه‌ای',
      'بیشترین صرفه اقتصادی',
    ],
  },
] as const

export default function PricingPage() {
  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-950"
    >
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-44 h-[520px] w-[520px] rounded-full bg-blue-300/30 blur-[110px]" />

        <div className="absolute -bottom-48 -left-32 h-[500px] w-[500px] rounded-full bg-cyan-200/30 blur-[110px]" />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.08) 1px, transparent 1px)',

            backgroundSize:
              '44px 44px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}

        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-xl font-black text-white shadow-lg shadow-blue-200">
              د
            </div>

            <div>
              <p className="text-xl font-black text-slate-950">
                دادیار
              </p>

              <p className="mt-0.5 text-xs font-medium text-slate-600">
                دستیار مدیریت دفتر وکالت
              </p>
            </div>
          </Link>

          <Link
            href="/launch"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            ورود به دادیار
          </Link>
        </header>

        {/* Hero */}

        <section className="mx-auto mb-13 mt-8 max-w-3xl text-center sm:mt-14">
          <span className="inline-flex rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-bold text-blue-800">
            شروع ساده، مدیریت حرفه‌ای
          </span>

          <h1 className="mt-5 text-3xl font-black leading-tight text-slate-950 sm:text-4xl md:text-5xl">
            به دادیار خوش آمدید
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-slate-700">
            برای شروع استفاده از دادیار،
            پلن مناسب خود را انتخاب کنید و
            پرونده‌ها، موکلین و امور مالی
            دفترتان را در یک محیط یکپارچه
            مدیریت کنید.
          </p>
        </section>

        {/* Plans */}

        <section className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map(
            (plan) => (
              <article
                key={
                  plan.key
                }
                className={`relative flex min-w-0 flex-col rounded-[28px] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  plan.popular
                    ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-200/60'
                    : 'border-slate-300 bg-white shadow-md shadow-slate-300/40 hover:border-blue-300'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-black text-white shadow-md">
                    پیشنهاد دادیار
                  </span>
                )}

                <div className="mb-5">
                  <h2 className="text-xl font-black text-slate-950">
                    {
                      plan.title
                    }
                  </h2>

                  <p className="mt-3 min-h-[56px] text-sm font-medium leading-7 text-slate-700">
                    {
                      plan.description
                    }
                  </p>
                </div>

                <div className="mb-6 border-b border-slate-200 pb-5">
                  <div className="flex flex-wrap items-end gap-2">
                    <span className="text-3xl font-black tracking-tight text-slate-950">
                      {
                        plan.price
                      }
                    </span>

                    <span className="pb-1 text-sm font-semibold text-slate-600">
                      تومان
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold text-blue-700">
                    مدت اشتراک:{' '}
                    {
                      plan.period
                    }
                  </p>
                </div>

                <ul className="mb-7 flex-1 space-y-3">
                  {plan.features.map(
                    (
                      feature
                    ) => (
                      <li
                        key={
                          feature
                        }
                        className="flex items-center gap-2.5 text-sm font-semibold text-slate-700"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
                          ✓
                        </span>

                        <span>
                          {
                            feature
                          }
                        </span>
                      </li>
                    )
                  )}
                </ul>

                {/* CTA */}

                {plan.href ? (
                  <Link
                    href={
                      plan.href
                    }
                    className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 px-5 py-4 text-base font-black text-white shadow-lg shadow-blue-200 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl active:translate-y-0"
                  >
                    {
                      plan.action
                    }
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex min-h-16 w-full cursor-not-allowed items-center justify-center rounded-2xl border-2 border-slate-300 bg-slate-200 px-5 py-4 text-base font-black text-slate-500"
                  >
                    {
                      plan.action
                    }
                  </button>
                )}
              </article>
            )
          )}
        </section>

        <footer className="pt-8 text-center text-sm font-medium text-slate-500">
          © ۱۴۰۵ دادیار — مدیریت ساده‌تر
          دفتر وکالت
        </footer>
      </div>
    </main>
  )
}