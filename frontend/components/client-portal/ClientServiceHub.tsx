import Link from 'next/link'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  CalendarDays,
  FileText,
  ListChecks,
  MessageSquareText,
  PenLine,
  UsersRound,
} from 'lucide-react'

import type {
  ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

interface ClientServiceHubProps {
  account:
    ClientPortalAccount | null
}

interface ServiceItem {
  title:
    string

  description:
    string

  href:
    string

  icon:
    LucideIcon

  accent:
    string
}

export default function ClientServiceHub({
  account,
}: ClientServiceHubProps) {
  const requestsHref =
    account
      ? '/client-portal/requests'
      : '/client-login?returnTo=/client-portal/requests&mode=login'

  const services:
    ServiceItem[] = [
      {
        title:
          'پیدا کردن وکیل',

        description:
          'جستجو و مقایسه وکلا بر اساس تخصص، شهر، سابقه، شیوه مشاوره و نظرات.',

        href:
          '#lawyers',

        icon:
          UsersRound,

        accent:
          'bg-blue-50 text-blue-700 border-blue-100',
      },

      {
        title:
          'درخواست بررسی',

        description:
          'موضوع حقوقی خود را برای وکیل ارسال کنید و ادامه ارتباط را پیگیری کنید.',

        href:
          '#lawyers',

        icon:
          MessageSquareText,

        accent:
          'bg-cyan-50 text-cyan-700 border-cyan-100',
      },

      {
        title:
          'رزرو مشاوره',

        description:
          'مشاوره حضوری، تلفنی یا آنلاین را با زمان و مدت مشخص انتخاب کنید.',

        href:
          '#lawyers',

        icon:
          CalendarDays,

        accent:
          'bg-emerald-50 text-emerald-700 border-emerald-100',
      },

      {
        title:
          'قرارداد آنلاین',

        description:
          'شرایط خدمات حقوقی و حق‌الزحمه را با وکیل در قالب قرارداد مدیریت کنید.',

        href:
          '#lawyers',

        icon:
          FileText,

        accent:
          'bg-violet-50 text-violet-700 border-violet-100',
      },

      {
        title:
          'تنظیم لایحه',

        description:
          'اطلاعات پرونده، دفاعیات و مستندات را وارد کرده و پیش‌نویس منظم بسازید.',

        href:
          '/client-portal/petitions/new',

        icon:
          PenLine,

        accent:
          'bg-amber-50 text-amber-700 border-amber-100',
      },

      {
        title:
          'پیگیری درخواست‌ها',

        description:
          'وضعیت درخواست‌های بررسی، رزروها و پیام‌های مرتبط را یکجا مشاهده کنید.',

        href:
          requestsHref,

        icon:
          ListChecks,

        accent:
          'bg-slate-100 text-slate-700 border-slate-200',
      },
    ]

  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-black text-emerald-700">
          خدمات موکلین
        </p>

        <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
          برای هر مرحله از کار حقوقی، مسیر مشخص داشته باشید
        </h2>

        <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
          از پیدا کردن وکیل و رزرو مشاوره تا
          قرارداد، پیگیری درخواست و تنظیم
          لایحه، همه مسیرها از همین بخش در
          دسترس هستند.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(
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
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${service.accent}`}
                >
                  <Icon
                    size={19}
                  />
                </div>

                <h3 className="mt-3 text-sm font-black text-slate-900">
                  {service.title}
                </h3>

                <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">
                  {service.description}
                </p>
              </Link>
            )
          }
        )}
      </div>
    </section>
  )
}