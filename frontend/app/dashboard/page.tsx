'use client'

import {
  useMemo,
} from 'react'

import Link from 'next/link'

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarRange,
  CircleDollarSign,
  FilePenLine,
  FolderOpen,
} from 'lucide-react'

import {
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPageHeader'

import {
  StatsCard,
} from '@/components/dashboard/StatsCard'

import {
  useCasesStore,
} from '@/store/cases.store'

import {
  isInCurrentMonth,
} from '@/utils/date-helpers'

export default function DashboardPage() {
  const cases =
    useCasesStore(
      (state) =>
        state.cases
    )

  const stats =
    useMemo(
      () => ({
        active:
          cases.filter(
            (caseItem) =>
              caseItem.status !==
              'archived'
          ).length,

        monthly:
          cases.filter(
            (caseItem) =>
              isInCurrentMonth(
                caseItem.createdAt
              )
          ).length,
      }),
      [cases]
    )

  return (
    <div className="mx-auto max-w-7xl space-y-8">
     

      <DashboardPageHeader
        eyebrow="مرکز مدیریت دادیار"
        title="داشبورد"
        description="پرونده‌ها، وضعیت دفتر و گزارش‌های مهم را از اینجا مدیریت کنید."
      />




      <section>
        <div className="mb-4">
          <h2 className="text-xl font-black text-slate-950">
            دسترسی سریع
          </h2>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            عملیات پراستفاده شما در دادیار
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* New Case */}

          <Link
            href="/dashboard/cases/new"
            className="group relative overflow-hidden rounded-[24px] border border-blue-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg"
          >
            {/* Much softer circle */}

            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100/40 opacity-60 blur-[1px]" />

            <div className="relative flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-200">
                <FilePenLine
                  size={29}
                  className="text-white"
                />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-950">
                  ثبت پرونده جدید
                </h3>

                <p className="mt-2 text-base font-semibold leading-7 text-slate-700">
                  ایجاد پرونده و ثبت
                  اطلاعات موکلین و امور
                  مرتبط
                </p>
              </div>
            </div>

            <div className="relative mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-700">
              شروع ثبت پرونده

              <ArrowLeft
                size={17}
              />
            </div>
          </Link>


          <Link
            href="/dashboard/cases"
            className="group relative overflow-hidden rounded-[24px] border border-emerald-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-100/35 opacity-60 blur-[1px]" />

            <div className="relative flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-200">
                <BriefcaseBusiness
                  size={29}
                  className="text-white"
                />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-950">
                  پرونده‌های من
                </h3>

                <p className="mt-2 text-base font-semibold leading-7 text-slate-700">
                  مشاهده، جست‌وجو و مدیریت
                  همه پرونده‌های ثبت‌شده
                </p>
              </div>
            </div>

            <div className="relative mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700">
              مشاهده پرونده‌ها

              <ArrowLeft
                size={17}
              />
            </div>
          </Link>
        </div>
      </section>



      <section>
        <Link
          href="/dashboard/finances"
          className="group relative block overflow-hidden rounded-[28px] border border-cyan-200 bg-gradient-to-l from-cyan-50 via-blue-50 to-white p-6 shadow-md shadow-cyan-100/60 transition hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl sm:p-8"
        >
          <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-cyan-200/30 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-200">
                <CircleDollarSign
                  size={31}
                  className="text-white"
                />
              </div>

              <div>
                <span className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-black text-cyan-800">
                  مرکز مالی دادیار
                </span>

                <h2 className="mt-4 text-xl font-black text-slate-950 sm:text-2xl">
                  وضعیت مالی پرونده‌ها را
                  یکجا ببین
                </h2>

                <p className="mt-3 max-w-2xl text-base font-semibold leading-8 text-slate-700">
                  قراردادها، وصولی‌ها،
                  مطالبات و وضعیت مالی
                  پرونده‌ها را در یک گزارش
                  منظم بررسی کنید.
                </p>
              </div>
            </div>


            <span className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-cyan-600 to-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-cyan-200 transition group-hover:from-cyan-700 group-hover:to-blue-700">
              مشاهده گزارش مالی

              <ArrowLeft
                size={18}
              />
            </span>
          </div>
        </Link>
      </section>


      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-black text-slate-950">
            خلاصه وضعیت
          </h2>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            نمای سریع از وضعیت پرونده‌های
            شما
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StatsCard
            label="پرونده‌های فعال"
            value={
              stats.active
            }
            icon={
              FolderOpen
            }
            color="text-blue-700"
            bg="bg-blue-100"
            href="/dashboard/cases?filter=active"
          />

          <StatsCard
            label="پرونده‌های ماه جاری"
            value={
              stats.monthly
            }
            icon={
              CalendarRange
            }
            color="text-emerald-700"
            bg="bg-emerald-100"
          />
        </div>
      </section>
    </div>
  )
}