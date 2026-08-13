
import Link from 'next/link'

import {
  ArrowLeft,
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'

import {
  SUBSCRIPTION_PLANS,
} from '@/lib/subscription-plans'

const features = [
  {
    icon:
      BriefcaseBusiness,

    title:
      'مدیریت پرونده‌ها',

    description:
      'ثبت، دسته‌بندی، جست‌وجو و مدیریت اطلاعات پرونده‌ها در یک محیط یکپارچه.',
  },

  {
    icon:
      UsersRound,

    title:
      'مدیریت موکلین',

    description:
      'اطلاعات موکلین را یک‌بار ثبت کنید و در پرونده‌های مرتبط استفاده کنید.',
  },

  {
    icon:
      CircleDollarSign,

    title:
      'مدیریت مالی',

    description:
      'حق‌الوکاله، پرداخت‌ها، مطالبات، هزینه‌ها و گزارش مالی را کنترل کنید.',
  },

  {
    icon:
      BellRing,

    title:
      'یادداشت و پیگیری',

    description:
      'یادآوری‌ها و نکات مهم مربوط به امور روزانه دفتر را یکجا نگه دارید.',
  },
]

export default function HomePage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 text-slate-950"
    >

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-100/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
                مدیریت هوشمند دفتر وکالت
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-700 md:flex">
            <a
              href="#features"
              className="transition hover:text-blue-700"
            >
              امکانات
            </a>

            <a
              href="#workflow"
              className="transition hover:text-blue-700"
            >
              نحوه کار
            </a>

            <a
              href="#plans"
              className="transition hover:text-blue-700"
            >
              پلن‌ها
            </a>
          </nav>

          <Link
            href="/launch"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            ورود به دادیار
          </Link>
        </div>
      </header>


      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-52 -top-52 h-[650px] w-[650px] rounded-full bg-blue-300/30 blur-[120px]" />

          <div className="absolute -bottom-60 -left-52 h-[600px] w-[600px] rounded-full bg-emerald-200/20 blur-[120px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          {/* Copy */}

          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-black text-blue-800">
              <Sparkles
                size={17}
              />

              دستیار مدیریت حرفه‌ای دفتر وکالت
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.35] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              پرونده‌ها و امور دفترت را
              <span className="text-blue-700">
                {' '}
                ساده‌تر و دقیق‌تر{' '}
              </span>
              مدیریت کن
            </h1>

            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-700 sm:text-lg sm:leading-9">
              دادیار یک محیط یکپارچه برای
              مدیریت پرونده‌ها، موکلین،
              اطلاعات مالی و پیگیری امور
              دفتر وکالت است؛ بدون پراکندگی
              اطلاعات بین چند ابزار مختلف.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#plans"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 px-7 text-base font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                مشاهده پلن‌ها

                <ArrowLeft
                  size={19}
                />
              </a>

              <Link
                href="/launch"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-7 text-base font-black text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                ورود به سامانه
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
              {[
                'مدیریت متمرکز',
                'طراحی ساده',
                'اطلاعات تفکیک‌شده',
              ].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-emerald-600"
                    />

                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Preview */}

          <div className="relative">
            <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-blue-200/50 to-emerald-100/30 blur-2xl" />

            <div className="relative overflow-hidden rounded-[30px] border border-slate-300 bg-white p-5 shadow-2xl shadow-slate-300/50 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                <div>
                  <p className="text-sm font-black text-blue-700">
                    پنل دادیار
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    مدیریت دفتر در یک نگاه
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <ShieldCheck
                    size={25}
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  {
                    title:
                      'پرونده‌ها',

                    value:
                      'مدیریت کامل',

                    bg:
                      'bg-blue-50',

                    text:
                      'text-blue-700',
                  },

                  {
                    title:
                      'موکلین',

                    value:
                      'یکپارچه',

                    bg:
                      'bg-emerald-50',

                    text:
                      'text-emerald-700',
                  },

                  {
                    title:
                      'گزارش مالی',

                    value:
                      'شفاف',

                    bg:
                      'bg-cyan-50',

                    text:
                      'text-cyan-700',
                  },

                  {
                    title:
                      'پیگیری‌ها',

                    value:
                      'منظم',

                    bg:
                      'bg-amber-50',

                    text:
                      'text-amber-700',
                  },
                ].map(
                  (item) => (
                    <div
                      key={
                        item.title
                      }
                      className={`rounded-2xl border border-slate-200 p-4 ${item.bg}`}
                    >
                      <p className="text-sm font-bold text-slate-700">
                        {item.title}
                      </p>

                      <p className={`mt-2 text-lg font-black ${item.text}`}>
                        {item.value}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


      <section
        id="features"
        className="border-y border-slate-200 bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black text-blue-700">
              امکانات دادیار
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
              ابزارهای اصلی دفتر، کنار هم
            </h2>

            <p className="mt-4 text-base font-medium leading-8 text-slate-700">
              به‌جای نگهداری اطلاعات در چند
              محل، داده‌های اصلی پرونده و
              موکل را در یک محیط مدیریت
              کنید.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(
              ({
                icon:
                  Icon,
                title,
                description,
              }) => (
                <article
                  key={title}
                  className="rounded-[24px] border border-slate-300 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <Icon
                      size={24}
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-950">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm font-medium leading-7 text-slate-700">
                    {description}
                  </p>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-black text-blue-700">
              شروع کار
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-950">
              در سه مرحله وارد دادیار شوید
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                number:
                  '۱',

                title:
                  'پلن را انتخاب کنید',

                description:
                  'پلن متناسب با نیاز دفتر خود را از بخش پایین انتخاب کنید.',
              },

              {
                number:
                  '۲',

                title:
                  'حساب وکیل را ایجاد کنید',

                description:
                  'وارد حساب فعلی شوید یا حساب جدید خود را بسازید.',
              },

              {
                number:
                  '۳',

                title:
                  'مدیریت را شروع کنید',

                description:
                  'پرونده و موکل ثبت کنید و اطلاعات دفتر را در پنل مدیریت کنید.',
              },
            ].map(
              (step) => (
                <article
                  key={
                    step.number
                  }
                  className="rounded-[24px] border border-slate-300 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                    {step.number}
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm font-medium leading-7 text-slate-700">
                    {
                      step.description
                    }
                  </p>
                </article>
              )
            )}
          </div>
        </div>
      </section>


      <section
        id="plans"
        className="border-t border-slate-200 bg-slate-200/60 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black text-blue-700">
              پلن‌های دادیار
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
              پلن مناسب دفترت را انتخاب کن
            </h2>

            <p className="mt-4 text-base font-medium leading-8 text-slate-700">
              بعد از انتخاب پلن، انتخاب شما
              تا صفحه ورود یا ثبت‌نام وکیل
              حفظ می‌شود.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SUBSCRIPTION_PLANS.map(
              (plan) => (
                <article
                  key={
                    plan.key
                  }
                  className={`relative flex flex-col rounded-[28px] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    plan.popular
                      ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-200/70'
                      : 'border-slate-300 bg-white shadow-md shadow-slate-300/40'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 right-6 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-black text-white shadow-md">
                      پیشنهاد دادیار
                    </span>
                  )}

                  <h3 className="text-xl font-black text-slate-950">
                    {
                      plan.title
                    }
                  </h3>

                  <p className="mt-3 min-h-[56px] text-sm font-medium leading-7 text-slate-700">
                    {
                      plan.description
                    }
                  </p>

                  <div className="my-5 border-y border-slate-200 py-5">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-slate-950">
                        {
                          plan.price
                        }
                      </span>

                      <span className="pb-1 text-sm font-bold text-slate-600">
                        تومان
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-black text-blue-700">
                      {plan.period}
                    </p>
                  </div>

                  <ul className="flex-1 space-y-3">
                    {plan.features.map(
                      (
                        feature
                      ) => (
                        <li
                          key={
                            feature
                          }
                          className="flex items-center gap-2.5 text-sm font-bold text-slate-700"
                        >
                          <CheckCircle2
                            size={19}
                            className="shrink-0 text-emerald-600"
                          />

                          {feature}
                        </li>
                      )
                    )}
                  </ul>

                  <Link
                    href={`/launch?plan=${plan.key}`}
                    className={`mt-7 flex min-h-16 w-full items-center justify-center rounded-2xl px-4 py-4 text-base font-black transition ${
                      plan.popular
                        ? 'bg-gradient-to-l from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-blue-800'
                        : 'border border-slate-300 bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {plan.action}
                  </Link>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-300 bg-slate-900 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-lg font-black">
              دادیار
            </p>

            <p className="mt-1 text-sm font-medium text-slate-300">
              مدیریت ساده‌تر دفتر وکالت
            </p>
          </div>

          <p className="text-sm text-slate-400">
            © ۱۴۰۵ دادیار
          </p>
        </div>
      </footer>
    </main>
  )
}