import type { FinancialStats } from '@/types/finance'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  FileText,
} from 'lucide-react'

interface Props {
  stats: FinancialStats
}

export function FinanceStats({ stats }: Props) {
  const collectionRate =
    stats.totalRevenue > 0
      ? (stats.totalReceived / stats.totalRevenue) * 100
      : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

      {/* کل درآمد */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">کل</span>
        </div>
        <p className="text-xs opacity-80 mb-1">کل مبلغ قراردادها</p>
        <p className="text-2xl font-bold leading-tight">
          {stats.totalRevenue.toLocaleString('fa-IR')}
          <span className="text-sm font-normal mr-1 opacity-80">ت</span>
        </p>
      </div>

      {/* دریافتی‌ها */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {collectionRate.toFixed(0)}%
          </span>
        </div>
        <p className="text-xs opacity-80 mb-1">مجموع پرداختی‌ها</p>
        <p className="text-2xl font-bold leading-tight">
          {stats.totalReceived.toLocaleString('fa-IR')}
          <span className="text-sm font-normal mr-1 opacity-80">ت</span>
        </p>
      </div>

      {/* مانده */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <TrendingDown size={20} />
          </div>
        </div>
        <p className="text-xs opacity-80 mb-1">مانده طلب</p>
        <p className="text-2xl font-bold leading-tight">
          {stats.totalRemaining.toLocaleString('fa-IR')}
          <span className="text-sm font-normal mr-1 opacity-80">ت</span>
        </p>
      </div>

      {/* معوقات */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">فوری</span>
        </div>
        <p className="text-xs opacity-80 mb-1">معوقات</p>
        <p className="text-2xl font-bold leading-tight">
          {stats.totalOverdue.toLocaleString('fa-IR')}
          <span className="text-sm font-normal mr-1 opacity-80">ت</span>
        </p>
      </div>

      {/* تعداد موکلین */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Users className="text-indigo-600" size={20} />
          </div>
        </div>
        <p className="text-xs text-zinc-500 mb-1">تعداد موکلین</p>
        <p className="text-2xl font-bold text-zinc-900">{stats.clientCount}</p>
      </div>

      {/* قراردادهای فعال */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <FileText className="text-purple-600" size={20} />
          </div>
        </div>
        <p className="text-xs text-zinc-500 mb-1">قراردادهای فعال</p>
        <p className="text-2xl font-bold text-zinc-900">
          {stats.activeContracts}
        </p>
      </div>

    </div>
  )
}
