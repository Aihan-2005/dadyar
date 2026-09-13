'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ArrowLeft,
  FilePlus2,
  FolderKanban,
  Scale,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'

import {
  PublicLawyerCard,
} from '@/components/lawyers/PublicLawyerCard'

import {
  StatsCard,
} from '@/components/dashboard/StatsCard'

import {
  getPublicLawyers,
} from '@/services/public-lawyer.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import {
  useCasesStore,
} from '@/store/cases.store'

import {
  isInCurrentMonth,
} from '@/utils/date-helpers'

import type {
  PublicLawyer,
} from '@/types/public-lawyer'

export default function DashboardPage() {
  const user =
    useAuthStore(
      (state) =>
        state.user,
    )

  if (
    user?.role ===
    'CLIENT'
  ) {
    return (
      <ClientDashboard />
    )
  }

  return (
    <LawyerDashboard />
  )
}

function ClientDashboard() {
  const user =
    useAuthStore(
      (state) =>
        state.user,
    )

  const [
    featuredLawyers,
    setFeaturedLawyers,
  ] =
    useState<
      PublicLawyer[]
    >([])

  const [
    totalLawyers,
    setTotalLawyers,
  ] = useState(0)

  useEffect(() => {
    let active = true

    Promise.all([
      getPublicLawyers(),

      getPublicLawyers({
        featuredOnly:
          true,
      }),
    ])
      .then(
        ([
          all,
          featured,
        ]) => {
          if (!active) {
            return
          }

          setTotalLawyers(
            all.length,
          )

          setFeaturedLawyers(
            featured.slice(
              0,
              3,
            ),
          )
        },
      )
      .catch(() => {
        if (active) {
          setTotalLawyers(
            0,
          )

          setFeaturedLawyers(
            [],
          )
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-7xl space-y-8 pb-12"
    >
      <section className="overflow-hidden rounded-3xl bg-gradient-to-l from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-blue-100 sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-blue-100">
            خوش آمدید
          </p>

          <h1 className="mt-2 text-2xl font-black sm:text-3xl">
            {user?.firstName
              ? `${
                  user.firstName
                } عزیز، `
              : ''}
            وکیل مناسب خود را پیدا
            کنید
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-8 text-blue-50">
            وکلای تأییدشده دادیار را
            بر اساس تخصص بررسی کنید و
            اطلاعات حرفه‌ای آن‌ها را
            ببینید.
          </p>

          <Link
            href="/dashboard/lawyers"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-blue-700 transition hover:bg-blue-50"
          >
            <Scale
              size={18}
            />

            مشاهده همه وکلا

            <ArrowLeft
              size={16}
            />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            <Users
              size={19}
              className="text-blue-600"
            />

            وکلای قابل انتخاب
          </div>

          <p className="mt-3 text-3xl font-black text-zinc-950">
            {new Intl.NumberFormat(
              'fa-IR',
            ).format(
              totalLawyers,
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            <Star
              size={19}
              className="text-amber-500"
            />

            وکلای ویژه
          </div>

          <p className="mt-3 text-3xl font-black text-zinc-950">
            {new Intl.NumberFormat(
              'fa-IR',
            ).format(
              featuredLawyers.length,
            )}
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-zinc-950">
              وکلای ویژه
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              تعدادی از وکلای منتخب
              دادیار
            </p>
          </div>

          <Link
            href="/dashboard/lawyers"
            className="text-sm font-bold text-blue-700 hover:underline"
          >
            مشاهده همه
          </Link>
        </div>

        {featuredLawyers.length >
        0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredLawyers.map(
              (lawyer) => (
                <PublicLawyerCard
                  key={
                    lawyer.id
                  }
                  lawyer={
                    lawyer
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
            در حال حاضر وکیل ویژه‌ای
            برای نمایش وجود ندارد.
          </div>
        )}
      </section>
    </div>
  )
}

function LawyerDashboard() {
  const cases =
    useCasesStore(
      (state) =>
        state.cases,
    )

  const stats =
    useMemo(() => {
      const activeCases =
        cases.filter(
          (item) =>
            item.status !==
            'archived',
        ).length

      const monthlyCases =
        cases.filter(
          (item) =>
            isInCurrentMonth(
              item.createdAt,
            ),
        ).length

      return {
        active:
          activeCases,

        monthly:
          monthlyCases,
      }
    }, [cases])

  return (
    <div className="min-h-screen bg-zinc-50 p-2 sm:p-6">
      <p className="mb-4 text-2xl font-semibold uppercase tracking-widest text-black">
        داشبورد
      </p>

      <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Link
          href="/dashboard/cases/new"
          className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-50 transition-colors group-hover:bg-blue-100" />

          <div className="relative flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-blue-500 p-3 shadow-md shadow-blue-200">
              <FilePlus2
                className="text-white"
                size={22}
              />
            </div>

            <div>
              <h3 className="mb-0.5 text-base font-bold text-zinc-900">
                ثبت پرونده جدید
              </h3>

              <p className="text-blue-950">
                ایجاد و ثبت اطلاعات
                پرونده تازه
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/cases"
          className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-lg"
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-50 transition-colors group-hover:bg-emerald-100" />

          <div className="relative flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-emerald-500 p-3 shadow-md shadow-emerald-200">
              <FolderKanban
                className="text-white"
                size={22}
              />
            </div>

            <div>
              <h3 className="mb-0.5 text-base font-bold text-zinc-900">
                لیست پرونده‌ها
              </h3>

              <p className="text-green-950">
                مشاهده و مدیریت همه
                پرونده‌های ثبت‌شده
              </p>
            </div>
          </div>
        </Link>
      </div>

      <p className="mb-4 text-2xl font-semibold uppercase tracking-widest text-slate-950">
        خلاصه وضعیت
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsCard
          label="پرونده‌های فعال"
          value={
            stats.active
          }
          icon={
            FolderKanban
          }
          color="text-blue-600"
          bg="bg-blue-50"
          href="/dashboard/cases?filter=active"
        />

        <StatsCard
          label="پرونده‌های ماه جاری"
          value={
            stats.monthly
          }
          icon={
            FilePlus2
          }
          color="text-emerald-600"
          bg="bg-emerald-50"
        />

        <StatsCard
          label="گزارش مالی"
          value="مشاهده"
          icon={
            TrendingUp
          }
          color="text-indigo-600"
          bg="bg-indigo-50"
          href="/dashboard/finances"
        />
      </div>
    </div>
  )
}
