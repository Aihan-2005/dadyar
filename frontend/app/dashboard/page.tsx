// 'use client'

// import { useCasesStore } from '@/store/cases.store'
// import Link from 'next/link'
// import { FilePlus2, FolderKanban, TrendingUp } from 'lucide-react'
// import { StatsCard } from '@/components/dashboard/StatsCard'
// import { useMemo } from 'react'
// import { isInCurrentMonth } from '@/utils/date-helpers'

// export default function DashboardPage() {
//   const cases = useCasesStore((s) => s.cases)

//   // محاسبه آمار
//   const stats = useMemo(() => {
//     const activeCases = cases.filter((c) => c.status !== 'closed').length
//     const monthlyCases = cases.filter((c) => isInCurrentMonth(c.createdAt)).length
    
//     // محاسبه کل بدهی‌ها
//     const totalDebt = cases.reduce((sum, c) => {
//       const debt = (c.totalFee || 0) - (c.paidAmount || 0)
//       return sum + (debt > 0 ? debt : 0)
//     }, 0)

//     return {
//       active: activeCases,
//       monthly: monthlyCases,
//       debt: totalDebt,
//     }
//   }, [cases])

//   return (
//     <div className="min-h-screen bg-zinc-50 p-8">
//       {/* Quick Actions */}
//       <p className="text-2xl font-semibold uppercase tracking-widest text-black mb-4">
//         دسترسی سریع
//       </p>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
//         <Link
//           href="/dashboard/cases/new"
//           className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300"
//         >
//           <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300" />
//           <div className="relative flex items-start gap-4">
//             <div className="flex-shrink-0 p-3 rounded-xl bg-blue-500 shadow-md shadow-blue-200 group-hover:shadow-blue-300 group-hover:scale-105 transition-all duration-300">
//               <FilePlus2 className="text-white" size={22} strokeWidth={2} />
//             </div>
//             <div>
//               <h3 className="text-base font-bold text-zinc-900 mb-0.5">
//                 ثبت پرونده جدید
//               </h3>
//               <p className="text-1xl text-blue-950 leading-relaxed">
//                 ایجاد و ثبت اطلاعات پرونده تازه
//               </p>
//             </div>
//           </div>
//           <div className="absolute bottom-4 left-5 text-[10px] font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide">
//             شروع کن ←
//           </div>
//         </Link>

//         <Link
//           href="/dashboard/cases"
//           className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300"
//         >
//           <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-300" />
//           <div className="relative flex items-start gap-4">
//             <div className="flex-shrink-0 p-3 rounded-xl bg-emerald-500 shadow-md shadow-emerald-200 group-hover:shadow-emerald-300 group-hover:scale-105 transition-all duration-300">
//               <FolderKanban className="text-white" size={22} strokeWidth={2} />
//             </div>
//             <div>
//               <h3 className="text-base font-bold text-zinc-900 mb-0.5">
//                 لیست پرونده‌ها
//               </h3>
//               <p className="text-1xl text-green-950 leading-relaxed">
//                 مشاهده و مدیریت همه پرونده‌های ثبت‌شده
//               </p>
//             </div>
//           </div>
//           <div className="absolute bottom-4 left-5 text-[10px] font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide">
//             مشاهده ←
//           </div>
//         </Link>
//       </div>

//       {/* Stats */}
//       <p className="text-2xl font-semibold uppercase tracking-widest text-slate-950 mb-4">
//         خلاصه وضعیت
//       </p>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <StatsCard
//           label="پرونده‌های فعال"
//           value={stats.active}
//           icon={FolderKanban}
//           color="text-blue-600"
//           bg="bg-blue-50"
//           href="/dashboard/cases?filter=active"
//         />
//         <StatsCard
//           label="پرونده‌های ماه جاری"
//           value={stats.monthly}
//           icon={FilePlus2}
//           color="text-emerald-600"
//           bg="bg-emerald-50"
//         />
//         <StatsCard
//           label="گزارش مالی"
//           value={`${stats.debt.toLocaleString('fa-IR')}ت`}
//           icon={TrendingUp}
//           color="text-indigo-600"
//           bg="bg-indigo-50"
//           href="/dashboard/finances"
//         />
//       </div>
//     </div>
//   )
// }
'use client'

import { useCasesStore } from '@/store/cases.store'
import Link from 'next/link'
import { FilePlus2, FolderKanban, TrendingUp } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { useMemo } from 'react'
import { isInCurrentMonth } from '@/utils/date-helpers'

export default function DashboardPage() {
  const cases = useCasesStore((s) => s.cases)

  // محاسبه آمار
  const stats = useMemo(() => {
    const activeCases = cases.filter((c) => c.status !== 'closed').length
    const monthlyCases = cases.filter((c) => isInCurrentMonth(c.createdAt)).length
    
    // محاسبه کل مانده طلب
    const totalRemaining = cases.reduce((sum, c) => {
      const remaining = (c.totalFee || 0) - (c.paidAmount || 0)
      return sum + (remaining > 0 ? remaining : 0)
    }, 0)

    return {
      active: activeCases,
      monthly: monthlyCases,
      remaining: totalRemaining,
    }
  }, [cases])

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      {/* Quick Actions */}
      <p className="text-2xl font-semibold uppercase tracking-widest text-black mb-4">
        دسترسی سریع
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <Link
          href="/dashboard/cases/new"
          className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300"
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 rounded-xl bg-blue-500 shadow-md shadow-blue-200 group-hover:shadow-blue-300 group-hover:scale-105 transition-all duration-300">
              <FilePlus2 className="text-white" size={22} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 mb-0.5">
                ثبت پرونده جدید
              </h3>
              <p className="text-1xl text-blue-950 leading-relaxed">
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
              <p className="text-1xl text-green-950 leading-relaxed">
                مشاهده و مدیریت همه پرونده‌های ثبت‌شده
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 left-5 text-[10px] font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide">
            مشاهده ←
          </div>
        </Link>
      </div>

      {/* Stats */}
      <p className="text-2xl font-semibold uppercase tracking-widest text-slate-950 mb-4">
        خلاصه وضعیت
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="پرونده‌های فعال"
          value={stats.active}
          icon={FolderKanban}
          color="text-blue-600"
          bg="bg-blue-50"
          href="/dashboard/cases?filter=active"
        />
        <StatsCard
          label="پرونده‌های ماه جاری"
          value={stats.monthly}
          icon={FilePlus2}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatsCard
          label="مانده طلب"
          value={`${stats.remaining.toLocaleString('fa-IR')} ت`}
          icon={TrendingUp}
          color="text-indigo-600"
          bg="bg-indigo-50"
          href="/dashboard/finances"
        />
      </div>
    </div>
  )
}
