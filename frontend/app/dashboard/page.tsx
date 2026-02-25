'use client'

import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'
import { FilePlus2, FolderKanban, Clock, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      {/* Header Greeting */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {user?.firstName?.[0] ?? 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight leading-none">
              سلام،{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {user?.firstName} {user?.lastName}
              </span>{' '}
              👋
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              به پنل مدیریت پرونده‌ها خوش آمدید
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
        دسترسی سریع
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <Link
          href="/dashboard/cases/new"
          className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300"
        >
          {/* Decorative blob */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 rounded-xl bg-blue-500 shadow-md shadow-blue-200 group-hover:shadow-blue-300 group-hover:scale-105 transition-all duration-300">
              <FilePlus2 className="text-white" size={22} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 mb-0.5">
                ثبت پرونده جدید
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                ایجاد و ثبت اطلاعات پرونده تازه
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 left-5 text-[10px] font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide">
            شروع کن ←
          </div>
        </Link>

        <Link
          href="/dashboard/cases"
          className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300"
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-300" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 rounded-xl bg-emerald-500 shadow-md shadow-emerald-200 group-hover:shadow-emerald-300 group-hover:scale-105 transition-all duration-300">
              <FolderKanban className="text-white" size={22} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 mb-0.5">
                لیست پرونده‌ها
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                مشاهده و مدیریت همه پرونده‌های ثبت‌شده
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 left-5 text-[10px] font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide">
            مشاهده ←
          </div>
        </Link>
      </div>

      {/* Stats Row */}
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
        خلاصه وضعیت
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'پرونده‌های فعال',
            value: '۱۲',
            icon: <FolderKanban size={18} />,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'ثبت‌شده این هفته',
            value: '۴',
            icon: <FilePlus2 size={18} />,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'در انتظار بررسی',
            value: '۷',
            icon: <Clock size={18} />,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'نرخ تکمیل',
            value: '۸۳٪',
            icon: <TrendingUp size={18} />,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.bg} ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-extrabold text-zinc-900 leading-none mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
