'use client'

import {
  useMemo,
} from 'react'

import Link from 'next/link'

import {
  ArrowLeft,
  BriefcaseBusiness,
  CircleDollarSign,
  FilePenLine,
  FolderOpen,
} from 'lucide-react'

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
      () => {
        const activeCases =
          cases.filter(
            (caseItem) =>
              caseItem.status !==
              'archived'
          ).length

        const monthlyCases =
          cases.filter(
            (caseItem) =>
              isInCurrentMonth(
                caseItem.createdAt
              )
          ).length

        return {
          active: activeCases,
          monthly: monthlyCases,
        }
      },
      [cases]
    )

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}

        <header>
          <p className="text-sm font-black text-blue-700">
            مرکز مدیریت دادیار
          </p>

          <h1 className="mt-1 text-3xl font-black text-slate-950">
            داشبورد
          </h1>

          <p className="mt-2 text-base font-medium leading-7 text-slate-700">
            پرونده‌ها، وضعیت دفتر و گزارش
            مالی را از اینجا مدیریت کنید.
          </p>
        </header>

        {/* Quick Actions */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-950">
              دسترسی سریع
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-600">
              عملیات پراستفاده شما در دادیار
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* New Case */}

            <Link
              href="/dashboard/cases/new"
              className="group relative overflow-hidden rounded-[24px] border-2 border-blue-200 bg-white p-6 shadow-md shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100/80 transition group-hover:bg-blue-200/70" />

              <div className="relative flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-200 transition group-hover:scale-105">
                  <FilePenLine
                    className="text-white"
                    size={30}
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-950">
                    ثبت پرونده جدید
                  </h3>

                  <p className="mt-2 text-base font-semibold leading-7 text-slate-700">
                    ایجاد پرونده و ثبت
                    اطلاعات موکلین و امور
                    مالی
                  </p>
                </div>
              </div>

              <div className="relative mt-5 flex items-center gap-1 text-sm font-black text-blue-700">
                شروع ثبت پرونده

                <ArrowLeft
                  size={17}
                  className="transition group-hover:-translate-x-1"
                />
              </div>
            </Link>

            {/* Cases */}

            <Link
              href="/dashboard/cases"
              className="group relative overflow-hidden rounded-[24px] border-2 border-emerald-200 bg-white p-6 shadow-md shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-100"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-100/80 transition group-hover:bg-emerald-200/70" />

              <div className="relative flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 transition group-hover:scale-105">
                  <BriefcaseBusiness
                    className="text-white"
                    size={30}
                    strokeWidth={2}
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

              <div className="relative mt-5 flex items-center gap-1 text-sm font-black text-emerald-700">
                مشاهده پرونده‌ها

                <ArrowLeft
                  size={17}
                  className="transition group-hover:-translate-x-1"
                />
              </div>
            </Link>
          </div>
        </section>

        {/* Finance CTA */}

        <section>
          <Link
            href="/dashboard/finances"
            className="group relative block overflow-hidden rounded-[28px] border-2 border-blue-200 bg-gradient-to-l from-blue-100 via-white to-white p-6 shadow-lg shadow-blue-100/70 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl sm:p-8"
          >
            <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-blue-200/60 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-emerald-100/60 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-200 transition-transform duration-300 group-hover:scale-105">
                  <CircleDollarSign
                    size={31}
                    className="text-white"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-blue-300 bg-white px-3 py-1.5 text-xs font-black text-blue-800">
                      مرکز مالی دادیار
                    </span>

                    <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800">
                      گزارش هوشمند
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-black text-slate-950 sm:text-2xl">
                    وضعیت مالی پرونده‌ها را
                    یکجا ببین
                  </h2>

                  <p className="mt-3 max-w-2xl text-base font-medium leading-8 text-slate-700">
                    مبلغ قراردادها، وصولی‌ها،
                    مانده مطالبات، پرداخت‌های
                    معوق و وضعیت مالی موکلین
                    را در یک گزارش کامل بررسی
                    کنید.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      'وصولی‌ها',
                      'مطالبات',
                      'معوقات',
                      'گزارش موکلین',
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center">
                <span className="inline-flex h-13 items-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-black text-white shadow-md transition group-hover:bg-blue-700">
                  مشاهده گزارش مالی

                  <ArrowLeft
                    size={18}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* Overview */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-950">
              خلاصه وضعیت
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-600">
              نمای سریع از پرونده‌های شما
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                FilePenLine
              }
              color="text-emerald-700"
              bg="bg-emerald-100"
            />
          </div>
        </section>
      </div>
    </div>
  )
}