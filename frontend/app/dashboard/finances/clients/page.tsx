'use client'

import { useCasesStore } from '@/store/cases.store'
import { useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Users, ArrowRight } from 'lucide-react'
import { ClientSearchBar } from '@/components/dashboard/finances/clients/ClientSearchBar'
import { ClientFinanceTable } from '@/components/dashboard/finances/clients/ClientFinanceTable'
import { ClientDetailTable } from '@/components/dashboard/finances/clients/ClientDetailTable'
import type { ClientFinanceSummary } from '@/types/finance'
import Link from 'next/link'

function ClientsPageContent() {
  const cases = useCasesStore((s) => s.cases)
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('client') || ''
  )

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
        lastPaymentDate: c.lastPaymentDate,
        dueDate: c.dueDate,
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

  // موکل انتخاب‌شده از سرچ
  const selectedClient = useMemo(() => {
    if (!searchTerm.trim()) return null
    return (
      clientSummaries.find((c) =>
        c.clientName.includes(searchTerm.trim())
      ) || null
    )
  }, [clientSummaries, searchTerm])

  // فیلتر جدول اصلی
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clientSummaries
    return clientSummaries.filter((c) =>
      c.clientName.includes(searchTerm.trim())
    )
  }, [clientSummaries, searchTerm])

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">

        {/* ───── Header ───── */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/finances"
            className="w-9 h-9 rounded-lg border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 transition-colors"
          >
            <ArrowRight size={18} className="text-zinc-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">حساب موکلین</h1>
              <p className="text-sm text-zinc-500">
                جستجو و مشاهده وضعیت مالی هر موکل
              </p>
            </div>
          </div>
        </div>

        {/* ───── Search ───── */}
        <ClientSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          totalCount={clientSummaries.length}
          filteredCount={filteredClients.length}
        />

        {/* ───── نمایش جزئیات موکل خاص ───── */}
        {selectedClient && searchTerm.trim() && (
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 bg-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    {selectedClient.clientName}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {selectedClient.totalContracts} قرارداد ·{' '}
                    شماره قرارداد | موضوع | مبلغ | پرداختی‌ها | مانده | معوق
                  </p>
                </div>
                {/* خلاصه مالی موکل */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-zinc-500 text-xs">مبلغ کل</p>
                    <p className="font-bold text-zinc-900">
                      {selectedClient.totalFee.toLocaleString('fa-IR')} ت
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-500 text-xs">پرداختی</p>
                    <p className="font-bold text-emerald-600">
                      {selectedClient.totalPaid.toLocaleString('fa-IR')} ت
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-500 text-xs">مانده</p>
                    <p className="font-bold text-amber-600">
                      {selectedClient.totalRemaining.toLocaleString('fa-IR')} ت
                    </p>
                  </div>
                  {selectedClient.totalOverdue > 0 && (
                    <div className="text-center">
                      <p className="text-zinc-500 text-xs">معوق</p>
                      <p className="font-bold text-red-600">
                        {selectedClient.totalOverdue.toLocaleString('fa-IR')} ت
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <ClientDetailTable cases={selectedClient.cases} />
          </div>
        )}

        {/* ───── جدول کلی موکلین ───── */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">لیست موکلین</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              نام موکل | مبلغ قرارداد | پرداختی‌ها | مانده | معوق
            </p>
          </div>
          <ClientFinanceTable
            clients={filteredClients}
            onSelectClient={setSearchTerm}
          />
        </div>

      </div>
    </div>
  )
}

export default function ClientsPage() {
  return (
    <Suspense>
      <ClientsPageContent />
    </Suspense>
  )
}
