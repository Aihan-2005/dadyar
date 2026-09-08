'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MessageSquareText } from 'lucide-react'

import { fetchTicketsApi, getTicketApiErrorMessage } from '@/features/tickets/api/ticket.api'
import type { Ticket } from '@/types/ticket'

const STATUS_LABELS: Record<Ticket['status'], string> = {
  open: 'باز',
  'in-progress': 'در حال بررسی',
  'waiting-for-lawyer': 'منتظر پاسخ شما',
  resolved: 'حل شده',
  closed: 'بسته شده',
}

const STATUS_STYLES: Record<Ticket['status'], string> = {
  open: 'bg-blue-50 text-blue-600',
  'in-progress': 'bg-amber-50 text-amber-600',
  'waiting-for-lawyer': 'bg-purple-50 text-purple-600',
  resolved: 'bg-emerald-50 text-emerald-600',
  closed: 'bg-slate-100 text-slate-500',
}

export default function TicketsListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    fetchTicketsApi()
      .then((data) => {
        if (isMounted) setTickets(data)
      })
      .catch((err) => {
        if (isMounted) setError(getTicketApiErrorMessage(err, 'دریافت لیست تیکت‌ها ناموفق بود.'))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-slate-400">در حال بارگذاری تیکت‌ها...</div>
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (tickets.length === 0) {
    return <div className="py-10 text-center text-sm text-slate-400">هنوز تیکتی ثبت نکرده‌اید.</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/dashboard/tickets"
        className="flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowRight size={16} />
        بازگشت به ثبت تیکت جدید
      </Link>

      {isLoading && (
        <div className="py-10 text-center text-sm text-slate-400">در حال بارگذاری تیکت‌ها...</div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && tickets.length === 0 && (
        <div className="py-10 text-center text-sm text-slate-400">هنوز تیکتی ثبت نکرده‌اید.</div>
      )}

      {!isLoading && !error && tickets.length > 0 && (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/tickets/${ticket.id}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <MessageSquareText size={18} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-800">{ticket.title}</span>
              </div>

              <span
                className={`rounded-lg px-3 py-1 text-xs font-bold ${STATUS_STYLES[ticket.status]}`}
              >
                {STATUS_LABELS[ticket.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
