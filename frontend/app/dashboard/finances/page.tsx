'use client'

import { useCasesStore } from '@/store/cases.store'
import { TrendingUp, Users, AlertCircle, FileText } from 'lucide-react'
import { useMemo } from 'react'
import { FinanceStats } from '@/components/dashboard/finances/overview/FinanceStats'
import { FinancialSummary } from '@/components/dashboard/finances/overview/FinancialSummary'
import { OverviewTable } from '@/components/dashboard/finances/overview/OverviewTable'
import type {
  ClientFinanceSummary,
  FinancialStats as Stats,
} from '@/types/finance'
import Link from 'next/link'

export default function FinancesPage() {
  const cases = useCasesStore((s) => s.cases)

  const stats = useMemo<Stats>(() => {
    const totalRevenue = cases.reduce((sum, c) => sum + (c.totalFee || 0), 0)
    const totalReceived = cases.reduce(
      (sum, c) => sum + (c.paidAmount || 0),
      0
    )
    const totalRemaining = totalRevenue - totalReceived
    const now = new Date()

    const totalOverdue = cases.reduce((sum, c) => {
      if (c.dueDate && new Date(c.dueDate) < now) {
        const debt = (c.totalFee || 0) - (c.paidAmount || 0)
        return sum + (debt > 0 ? debt : 0)
      }
      return sum
    }, 0)

    const uniqueClients = new Set(cases.map((c) => c.clientName)).size
    const activeContracts = cases.filter((c) => c.status !== 'archived').length

    return {
      totalRevenue,
      totalReceived,
      totalRemaining,
      totalOverdue,
      clientCount: uniqueClients,
      activeContracts,
    }
  }, [cases])

  const clientSummaries = useMemo<ClientFinanceSummary[]>(() => {
    const grouped = new Map<string, ClientFinanceSummary>()
    const now = new Date()

    cases.forEach((c) => {
      const clientName = c.clientName
      const isOverdue = !!(c.dueDate && new Date(c.dueDate) < now)
      const remaining = (c.totalFee || 0) - (c.paidAmount || 0)
      const overdueAmount = isOverdue && remaining > 0 ? remaining : 0

      if (!grouped.has(clientName)) {
        grouped.set(clientName, {
          clientName,
          totalContracts: 0,
          totalFee: 0,
          totalPaid: 0,
          totalRemaining: 0,
          totalOverdue: 0,
          cases: [],
        })
      }

      const summary = grouped.get(clientName)!
      summary.totalContracts++
      summary.totalFee += c.totalFee || 0
      summary.totalPaid += c.paidAmount || 0
      summary.totalRemaining += remaining > 0 ? remaining : 0
      summary.totalOverdue += overdueAmount

      summary.cases.push({
        caseId: c.id,
        caseNumber: c.caseNumber,
        caseTitle: c.title,
        clientName: c.clientName,
        totalFee: c.totalFee || 0,
        paidAmount: c.paidAmount || 0,
        remainingDebt: remaining,
        overdueAmount,
        lastPaymentDate: c.lastPaymentDate?.toISOString(),
        dueDate: c.dueDate?.toISOString(),
        status: isOverdue
          ? 'overdue'
          : remaining <= 0
          ? 'paid'
          : (c.paidAmount || 0) > 0
          ? 'partial'
          : 'unpaid',
      })
    })

    return Array.from(grouped.values()).sort(
      (a, b) => b.totalRemaining - a.totalRemaining
    )
  }, [cases])

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">

        {/* ───── Header ───── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">گزارش مالی</h1>
              <p className="text-sm text-zinc-500">
                مدیریت و پیگیری مالی پرونده‌ها
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex gap-3">
            <Link
              href="/dashboard/finances/clients"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Users size={16} />
              حساب موکلین
            </Link>
            <Link
              href="/dashboard/cases?filter=overdue"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <AlertCircle size={16} />
              معوقات
            </Link>
          </div>
        </div>

        {/* ───── Stats Cards ───── */}
        <FinanceStats stats={stats} />

        {/* ───── Financial Summary Chart ───── */}
        <FinancialSummary stats={stats} />

        {/* ───── Overview Table ───── */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center gap-2">
            <FileText className="text-indigo-600" size={20} />
            <div>
              <h2 className="text-lg font-bold text-zinc-900">گزارش کلی موکلین</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                نام موکل | مبلغ قرارداد | پرداختی‌ها | مانده | معوق
              </p>
            </div>
          </div>
          <OverviewTable clients={clientSummaries} />
        </div>

      </div>
    </div>
  )
}
