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
  UserRound,
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
  const loginHref = (
    returnTo:
      string,
  ) =>
    `/client-login?returnTo=${encodeURIComponent(
      returnTo,
    )}&mode=login`


  const protectedHref = (
    href:
      string,
  ) =>
    account
      ? href
      : loginHref(
          href,
        )


  const services:
    ServiceItem[] = [
      {
        title:
          'پروفایل من',

        description:
          'نام واقعی حساب موکل و اطلاعات هویتی قابل استفاده در درخواست‌ها را مدیریت کنید.',

        href:
          protectedHref(
            '/client-portal/profile',
          ),

        icon:
          UserRound,

        accent:
          'bg-indigo-50 text-indigo-700 border-indigo-100',
      },

      {
        title:
          'پیدا کردن وکیل',

        description:
          'فهرست وکلای منتشرشده در دادیار را ببینید و وکیل موردنظر خود را انتخاب کنید.',

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
          'موضوع حقوقی خود را برای وکیل ارسال کنید و پاسخ او را پیگیری کنید.',

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
          'از میان زمان‌های آزاد واقعی وکیل، جلسه آنلاین، تلفنی یا حضوری رزرو کنید.',

        href:
          '#lawyers',

        icon:
          CalendarDays,

        accent:
          'bg-emerald-50 text-emerald-700 border-emerald-100',
      },

      {
        title:
          'رزروهای من',

        description:
          'رزروهای ثبت‌شده، وضعیت تأیید یا رد و امکان لغو رزرو را مشاهده کنید.',

        href:
          protectedHref(
            '/client-portal/bookings',
          ),

        icon:
          CalendarDays,

        accent:
          'bg-teal-50 text-teal-700 border-teal-100',
      },

      {
        title:
          'قرارداد آنلاین',

        description:
          'ابتدا وکیل را انتخاب کنید، سپس پیش‌نویس قرارداد، حق‌الزحمه و شرایط خدمات را برای او ارسال کنید.',

        /*
         * ساخت قرارداد به lawyerId نیاز دارد.
         *
         * بنابراین entry point صحیح صفحه لیست قراردادها نیست.
         * کاربر باید ابتدا وکیل منتشرشده را انتخاب کند.
         */
        href:
          protectedHref(
            '/client-portal#lawyers',
          ),

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
          protectedHref(
            '/client-portal/petitions/new',
          ),

        icon:
          PenLine,

        accent:
          'bg-amber-50 text-amber-700 border-amber-100',
      },

      {
        title:
          'پیگیری درخواست‌ها',

        description:
          'وضعیت درخواست‌های بررسی و پاسخ‌های ثبت‌شده توسط وکیل را یکجا مشاهده کنید.',

        href:
          protectedHref(
            '/client-portal/requests',
          ),

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
          پروفایل، انتخاب وکیل، ارسال درخواست، رزرو مشاوره، قرارداد آنلاین و پیگیری خدمات از همین بخش در دسترس هستند.
        </p>
      </div>


      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {
          services.map(
            (
              service,
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
                    {
                      service.title
                    }
                  </h3>

                  <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">
                    {
                      service.description
                    }
                  </p>
                </Link>
              )
            },
          )
        }
      </div>
    </section>
  )
}
