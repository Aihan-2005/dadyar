import Link from 'next/link'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  ArrowLeft,
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  ListChecks,
  MessageSquareText,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'

import PublicSupportButton from '@/components/PublicSupportButton'

import {
  SUBSCRIPTION_PLANS,
} from '@/lib/subscription-plans'

const ENAMAD_TRUST_URL =
  'https://trustseal.enamad.ir/?id=7376893&Code=uH3VOp3psQMSH68g6tAzZdSSAafAkvAW'

interface FeatureItem {
  icon:
    LucideIcon

  title:
    string

  description:
    string
}

interface ClientServiceItem
  extends FeatureItem {
  href:
    string
}

const officeFeatures:
  FeatureItem[] = [
    {
      icon:
        BriefcaseBusiness,

      title:
        'مدیریت پرونده‌ها',

      description:
        'ثبت و مدیریت اطلاعات پرونده، طرفین، شعبه، روند رسیدگی و جزئیات مرتبط در یک ساختار منظم.',
    },

    {
      icon:
        UsersRound,

      title:
        'مدیریت موکلین',

      description:
        'اطلاعات موکلین را یک‌بار ثبت کنید و در پرونده‌ها و فرآیندهای مرتبط استفاده کنید.',
    },

    {
      icon:
        CircleDollarSign,

      title:
        'مدیریت مالی',

      description:
        'حق‌الوکاله، پرداخت‌ها، مطالبات، هزینه‌ها و وضعیت مالی پرونده‌ها را کنترل کنید.',
    },

    {
      icon:
        BellRing,

      title:
        'پیگیری امور دفتر',

      description:
        'یادداشت‌ها، پیگیری‌ها و اطلاعات ضروری روزمره دفتر را در محیطی یکپارچه نگه دارید.',
    },
  ]

const clientServices:
  ClientServiceItem[] = [
    {
      icon:
        Search,

      title:
        'پیدا کردن وکیل',

      description:
        'وکلا را بر اساس تخصص، شهر، سابقه، روش مشاوره و نظرات مقایسه و انتخاب کنید.',

      href:
        '/client-portal#lawyers',
    },

    {
      icon:
        MessageSquareText,

      title:
        'درخواست بررسی',

      description:
        'موضوع حقوقی را برای وکیل ارسال کنید و ادامه گفتگو و وضعیت درخواست را پیگیری کنید.',

      href:
        '/client-portal#lawyers',
    },

    {
      icon:
        CalendarDays,

      title:
        'رزرو مشاوره',

      description:
        'مشاوره حضوری، تلفنی یا آنلاین را با مدت، هزینه، روز و ساعت مشخص انتخاب کنید.',

      href:
        '/client-portal#lawyers',
    },

    {
      icon:
        FileText,

      title:
        'قرارداد آنلاین',

      description:
        'شرایط خدمات حقوقی، محدوده همکاری و حق‌الزحمه را در قالب قرارداد مدیریت کنید.',

      href:
        '/client-portal#lawyers',
    },

    {
      icon:
        PenLine,

      title:
        'تنظیم لایحه',

      description:
        'اطلاعات پرونده، شرح موضوع، دفاعیات، مستندات و درخواست خود را در قالب یک پیش‌نویس منظم آماده کنید.',

      href:
        '/client-portal/petitions/new',
    },

    {
      icon:
        ListChecks,

      title:
        'پیگیری درخواست‌ها',

      description:
        'رزروها، درخواست‌های بررسی، وضعیت ارتباط و پیام‌های مرتبط را از یک صفحه دنبال کنید.',

      href:
        '/client-portal/requests',
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
              <p className="text-lg font-black">
                دادیار
              </p>

              <p className="hidden text-xs font-semibold text-slate-600 sm:block">
                پلتفرم یکپارچه امور حقوقی
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-700 lg:flex">
            <a
              href="#lawyers"
              className="transition hover:text-blue-700"
            >
              برای وکلا
            </a>

            <a
              href="#clients"
              className="transition hover:text-blue-700"
            >
              برای موکلین
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
            ورود و شروع
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-52 -top-52 h-[650px] w-[650px] rounded-full bg-blue-300/30 blur-[120px]" />

          <div className="absolute -bottom-60 -left-52 h-[600px] w-[600px] rounded-full bg-emerald-200/25 blur-[120px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-black text-blue-800">
              <Sparkles
                size={17}
              />

              برای وکلا و موکلین
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.35] tracking-tight sm:text-5xl lg:text-6xl">
              مدیریت و دریافت خدمات حقوقی،
              {' '}

              <span className="text-blue-700">
                ساده‌تر و یکپارچه‌تر
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-700 sm:text-lg sm:leading-9">
              دادیار برای وکلا ابزار مدیریت
              پرونده، موکل، مالی و قرارداد
              فراهم می‌کند و برای موکلین مسیر
              انتخاب وکیل، ارتباط، رزرو
              مشاوره، قرارداد آنلاین، پیگیری
              درخواست و تنظیم لایحه را کنار
              هم قرار می‌دهد.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/client-portal"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 px-7 text-base font-black text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                خدمات موکلین

                <ArrowLeft
                  size={19}
                />
              </Link>

              <Link
                href="/launch"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-7 text-base font-black text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                ورود به دادیار
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
              {[
                'انتخاب وکیل',
                'رزرو و پیگیری',
                'قرارداد آنلاین',
                'تنظیم لایحه',
                'مدیریت دفتر وکالت',
              ].map(
                (
                  item
                ) => (
                  <span
                    key={
                      item
                    }
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

          <div className="relative">
            <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-blue-200/50 to-emerald-100/40 blur-2xl" />

            <div className="relative overflow-hidden rounded-[30px] border border-slate-300 bg-white p-5 shadow-2xl shadow-slate-300/50 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                <div>
                  <p className="text-sm font-black text-blue-700">
                    دادیار
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    دو مسیر، یک پلتفرم
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <ShieldCheck
                    size={25}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-black text-blue-700">
                    پنل وکلا
                  </p>

                  <ul className="mt-3 space-y-2">
                    {[
                      'پرونده و موکل',
                      'مدیریت مالی',
                      'قراردادها',
                      'پیگیری امور دفتر',
                    ].map(
                      (
                        item
                      ) => (
                        <li
                          key={
                            item
                          }
                          className="flex items-center gap-2 text-xs font-bold text-slate-700"
                        >
                          <CheckCircle2
                            size={15}
                            className="text-blue-600"
                          />

                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-black text-emerald-700">
                    بخش موکلین
                  </p>

                  <ul className="mt-3 space-y-2">
                    {[
                      'انتخاب وکیل',
                      'رزرو مشاوره',
                      'قرارداد آنلاین',
                      'تنظیم لایحه',
                    ].map(
                      (
                        item
                      ) => (
                        <li
                          key={
                            item
                          }
                          className="flex items-center gap-2 text-xs font-bold text-slate-700"
                        >
                          <CheckCircle2
                            size={15}
                            className="text-emerald-600"
                          />

                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="lawyers"
        className="scroll-mt-20 border-y border-slate-200 bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black text-blue-700">
              برای وکلا
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              ابزارهای اصلی دفتر، کنار هم
            </h2>

            <p className="mt-4 text-base font-medium leading-8 text-slate-700">
              پرونده‌ها، موکلین، وضعیت مالی و
              فرآیندهای روزانه دفتر را از یک
              محیط منظم مدیریت کنید.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {officeFeatures.map(
              (
                feature
              ) => (
                <FeatureCard
                  key={
                    feature.title
                  }
                  feature={
                    feature
                  }
                />
              )
            )}
          </div>
        </div>
      </section>

      <section
        id="clients"
        className="scroll-mt-20 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-black text-emerald-700">
                برای موکلین
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                از پیدا کردن وکیل تا تنظیم لایحه
              </h2>

              <p className="mt-4 text-base font-medium leading-8 text-slate-700">
                بدون ورود می‌توانید وکلا و
                خدمات را مشاهده کنید. هنگام
                ثبت درخواست، رزرو، قرارداد یا
                ذخیره اطلاعات شخصی، حساب موکل
                وارد جریان می‌شود.
              </p>
            </div>

            <Link
              href="/client-portal"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white"
            >
              ورود به بخش موکلین

              <ArrowLeft
                size={17}
              />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clientServices.map(
              (
                service
              ) => {
                const Icon =
                  service.icon

                return (
                  <Link
                    key={
                      service.title
                    }
                    href={
                      service.href
                    }
                    className="group rounded-[24px] border border-slate-300 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                      <Icon
                        size={23}
                      />
                    </div>

                    <h3 className="mt-5 text-lg font-black">
                      {service.title}
                    </h3>

                    <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                      {service.description}
                    </p>

                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-emerald-700">
                      مشاهده

                      <ArrowLeft
                        size={14}
                      />
                    </span>
                  </Link>
                )
              }
            )}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="border-y border-slate-200 bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-black text-blue-700">
              شروع کار
            </p>

            <h2 className="mt-2 text-3xl font-black">
              مسیر مناسب خود را انتخاب کنید
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[26px] border border-blue-200 bg-blue-50 p-6 sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <BriefcaseBusiness
                  size={23}
                />
              </div>

              <h3 className="mt-5 text-xl font-black">
                اگر وکیل هستید
              </h3>

              <ol className="mt-5 space-y-4">
                <WorkflowStep
                  number="۱"
                  text="پلن مورد نیاز دفتر را انتخاب کنید."
                />

                <WorkflowStep
                  number="۲"
                  text="وارد حساب وکیل شوید یا حساب جدید بسازید."
                />

                <WorkflowStep
                  number="۳"
                  text="پرونده‌ها، موکلین و امور دفتر را مدیریت کنید."
                />
              </ol>

              <Link
                href="/launch"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
              >
                ورود وکلا

                <ArrowLeft
                  size={16}
                />
              </Link>
            </article>

            <article className="rounded-[26px] border border-emerald-200 bg-emerald-50 p-6 sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <UsersRound
                  size={23}
                />
              </div>

              <h3 className="mt-5 text-xl font-black">
                اگر موکل هستید
              </h3>

              <ol className="mt-5 space-y-4">
                <WorkflowStep
                  number="۱"
                  text="بدون ورود، وکلا و خدمات موجود را بررسی کنید."
                />

                <WorkflowStep
                  number="۲"
                  text="خدمت مورد نظر مانند مشاوره، قرارداد یا تنظیم لایحه را شروع کنید."
                />

                <WorkflowStep
                  number="۳"
                  text="برای ثبت و پیگیری عملیات شخصی، وارد حساب موکل شوید."
                />
              </ol>

              <Link
                href="/client-portal"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white"
              >
                خدمات موکلین

                <ArrowLeft
                  size={16}
                />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section
        id="plans"
        className="bg-slate-200/60 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black text-blue-700">
              پلن‌های پنل وکلا
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              پلن مناسب دفترت را انتخاب کن
            </h2>

            <p className="mt-4 text-base font-medium leading-8 text-slate-700">
              بعد از انتخاب پلن، انتخاب شما تا
              صفحه ورود یا ثبت‌نام وکیل حفظ
              می‌شود.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SUBSCRIPTION_PLANS.map(
              (
                plan
              ) => (
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

                  <h3 className="text-xl font-black">
                    {plan.title}
                  </h3>

                  <p className="mt-3 min-h-[56px] text-sm font-medium leading-7 text-slate-700">
                    {plan.description}
                  </p>

                  <div className="my-5 border-y border-slate-200 py-5">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black">
                        {plan.price}
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

      <footer className="border-t border-slate-700 bg-slate-900 py-8 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div>
              <p className="text-lg font-black">
                دادیار
              </p>

              <p className="mt-1 text-sm font-medium text-slate-300">
                مدیریت دفتر و خدمات حقوقی موکلین
              </p>

              <p className="mt-4 text-xs font-medium text-slate-500">
                © ۱۴۰۵ دادیار — تمامی حقوق محفوظ است.
              </p>
            </div>

            <a
              href={
                ENAMAD_TRUST_URL
              }
              target="_blank"
              rel="noopener"
              referrerPolicy="origin"
              aria-label="مشاهده و بررسی اعتبار نماد اعتماد الکترونیکی دادیار در سایت رسمی اینماد"
              title="بررسی اعتبار نماد اعتماد الکترونیکی دادیار"
              className="group flex w-full items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 p-3 transition hover:border-emerald-500/60 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 sm:w-[270px]"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/15 to-blue-500/15">
                <svg
                  viewBox="0 0 64 64"
                  width="44"
                  height="44"
                  role="img"
                  aria-label="نشان بررسی نماد اعتماد الکترونیکی"
                >
                  <path
                    d="M32 5L51 12V28C51 41.2 43.1 52.9 32 58C20.9 52.9 13 41.2 13 28V12L32 5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-emerald-400"
                  />

                  <path
                    d="M22 31L28.5 37.5L42 23"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-300"
                  />
                </svg>
              </span>

              <span className="min-w-0 text-right">
                <span className="block text-sm font-black">
                  نماد اعتماد الکترونیکی
                </span>

                <span className="mt-1 block text-xs font-semibold leading-5 text-slate-400 transition group-hover:text-slate-300">
                  مشاهده و بررسی اعتبار در سایت رسمی اینماد
                </span>

                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-black text-emerald-400">
                  بررسی اعتبار
                  {' '}
                  ←
                </span>
              </span>
            </a>
          </div>
        </div>
      </footer>

      <PublicSupportButton />
    </main>
  )
}

function FeatureCard({
  feature,
}: {
  feature:
    FeatureItem
}) {
  const Icon =
    feature.icon

  return (
    <article className="rounded-[24px] border border-slate-300 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        <Icon
          size={24}
        />
      </div>

      <h3 className="mt-5 text-lg font-black">
        {feature.title}
      </h3>

      <p className="mt-3 text-sm font-medium leading-7 text-slate-700">
        {feature.description}
      </p>
    </article>
  )
}

function WorkflowStep({
  number,
  text,
}: {
  number:
    string

  text:
    string
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-slate-800">
        {number}
      </span>

      <p className="pt-0.5 text-sm font-bold leading-6 text-slate-700">
        {text}
      </p>
    </li>
  )
}