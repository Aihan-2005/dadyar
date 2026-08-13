import Link from 'next/link'



type Plan = {
  key: string
  title: string
  price: string
  period: string
  description: string
  action: string
  href?: string
  popular?: boolean
  features: string[]
}



const plans: Plan[] = [
  {
    key: 'free',
    title: 'رایگان (تستی)',
    price: '۰',
    period: '۵ روز',
    description:
      'برای آشنایی کامل با امکانات دادیار و تجربه محیط سامانه.',
    action: 'شروع دوره رایگان',
    href: '/launch',
    popular: false,
    features: [
      'مدیریت پرونده‌ها',
      'مدیریت موکلین',
      'گزارش مالی',
    ],
  },
  {
    key: '3m',
    title: 'اشتراک ۳ ماهه',
    price: '۴۵۰,۰۰۰',
    period: '۳ ماه',
    description:
      'انتخاب مناسب برای شروع استفاده حرفه‌ای از دادیار.',
    action: 'به‌زودی',
    popular: false,
    features: [
      'مدیریت نامحدود پرونده',
      'مدیریت امور مالی',
      'یادآورها و پیگیری‌ها',
    ],
  },
  {
    key: '6m',
    title: 'اشتراک ۶ ماهه',
    price: '۸۰۰,۰۰۰',
    period: '۶ ماه',
    description:
      'گزینه اقتصادی برای استفاده مستمر و مدیریت دفتر وکالت.',
    action: 'به‌زودی',
    popular: true,
    features: [
      'تمام امکانات دادیار',
      'گزارش‌های مالی',
      'مدیریت حرفه‌ای موکلین',
    ],
  },
  {
    key: '12m',
    title: 'اشتراک یک ساله',
    price: '۱,۴۰۰,۰۰۰',
    period: '۱۲ ماه',
    description:
      'بیشترین صرفه اقتصادی برای استفاده بلندمدت.',
    action: 'به‌زودی',
    popular: false,
    features: [
      'دسترسی کامل یک‌ساله',
      'تمام امکانات حرفه‌ای',
      'بیشترین صرفه اقتصادی',
    ],
  },
]



export default function PricingPage() {
  return (
    <main
      dir="rtl"
      className="relative h-dvh overflow-hidden bg-slate-100 text-slate-950"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-44 h-[500px] w-[500px] rounded-full bg-blue-300/30 blur-[110px]" />

        <div className="absolute -bottom-44 -left-32 h-[470px] w-[470px] rounded-full bg-cyan-200/30 blur-[110px]" />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.08) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-3 py-3 sm:px-5 sm:py-4 lg:px-7 lg:py-5">
        

        <header className="flex shrink-0 items-center justify-between">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-2.5 sm:gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-lg font-black text-white shadow-md shadow-blue-200 sm:h-11 sm:w-11 sm:rounded-2xl">
              د
            </div>

            <div className="min-w-0">
              <p className="text-lg font-black text-slate-950 sm:text-xl">
                دادیار
              </p>

              <p className="hidden text-xs font-semibold text-slate-600 sm:block">
                دستیار مدیریت دفتر وکالت
              </p>
            </div>
          </Link>

          <Link
            href="/launch"
            className="flex h-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-xs font-black text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:h-11 sm:px-4 sm:text-sm"
          >
            ورود به دادیار
          </Link>
        </header>



        <section className="mx-auto shrink-0 py-4 text-center sm:py-5 lg:py-6">
          <span className="inline-flex rounded-full border border-blue-300 bg-blue-100 px-3 py-1.5 text-xs font-black text-blue-800 sm:px-4 sm:py-2 sm:text-sm">
            شروع ساده، مدیریت حرفه‌ای
          </span>

          <h1 className="mt-3 text-2xl font-black leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
            به دادیار خوش آمدید
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-xs font-semibold leading-6 text-slate-700 sm:mt-3 sm:text-sm lg:text-base lg:leading-7">
            پلن مناسب خود را انتخاب کنید و
            پرونده‌ها، موکلین و امور مالی
            دفترتان را در یک محیط یکپارچه
            مدیریت کنید.
          </p>
        </section>


        <section className="min-h-0 flex-1">

          <div className="flex h-full gap-3 overflow-x-auto overflow-y-hidden pb-2 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0">
            {plans.map((plan) => (
              <article
                key={plan.key}
                className={`relative flex h-full min-w-[260px] max-w-[300px] flex-col rounded-[22px] border-2 p-4 shadow-md transition duration-300 sm:min-w-[290px] sm:max-w-[320px] sm:p-5 lg:min-w-0 lg:max-w-none lg:rounded-[26px] lg:p-5 ${
                  plan.popular
                    ? 'border-blue-400 bg-blue-50 shadow-blue-200/60'
                    : 'border-slate-300 bg-white shadow-slate-300/40 hover:border-blue-300'
                }`}
              >

                {plan.popular && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black text-white shadow-md sm:text-xs">
                    پیشنهاد دادیار
                  </span>
                )}


                <div className="shrink-0">
                  <h2 className="text-lg font-black text-slate-950 sm:text-xl">
                    {plan.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-xs font-semibold leading-6 text-slate-700 sm:text-sm">
                    {plan.description}
                  </p>
                </div>


                <div className="my-3 shrink-0 border-y border-slate-200 py-3 sm:my-4">
                  <div className="flex flex-wrap items-end gap-1.5">
                    <span className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      {plan.price}
                    </span>

                    <span className="pb-0.5 text-xs font-bold text-slate-600 sm:text-sm">
                      تومان
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-black text-blue-700 sm:text-sm">
                    مدت اشتراک: {plan.period}
                  </p>
                </div>

                {/* Features */}

                <ul className="flex-1 space-y-2">
                  {plan.features.map(
                    (feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-xs font-bold text-slate-700 sm:text-sm"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700 sm:h-6 sm:w-6 sm:text-xs">
                          ✓
                        </span>

                        <span>
                          {feature}
                        </span>
                      </li>
                    )
                  )}
                </ul>

                {/* CTA */}

                <div className="mt-4 shrink-0">
                  {plan.href ? (
                    <Link
                      href={plan.href}
                      className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl sm:min-h-16 sm:text-base"
                    >
                      {plan.action}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex min-h-14 w-full cursor-not-allowed items-center justify-center rounded-2xl border-2 border-slate-300 bg-slate-200 px-4 py-3.5 text-sm font-black text-slate-500 sm:min-h-16 sm:text-base"
                    >
                      {plan.action}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>


        <footer className="shrink-0 pt-2 text-center text-[10px] font-semibold text-slate-500 sm:pt-3 sm:text-xs">
          © ۱۴۰۵ دادیار — مدیریت ساده‌تر دفتر وکالت
        </footer>
      </div>
    </main>
  )
}