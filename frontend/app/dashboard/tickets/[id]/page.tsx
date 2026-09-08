'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Paperclip, Send, Lock } from 'lucide-react'

import {
  addTicketMessageApi,
  closeTicketApi,
  fetchTicketByIdApi,
  fetchTicketMessagesApi,
  getTicketApiErrorMessage,
} from '@/features/tickets/api/ticket.api'
import type { Ticket, TicketMessage } from '@/types/ticket'

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
  closed: 'bg-red-50 text-red-600',
}

const TYPE_LABELS: Record<string, string> = {
  bug: 'باگ',
  suggestion: 'پیشنهاد',
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate)

  const datePart = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)

  const timePart = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  return `${datePart}، ${timePart}`
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const ticketId = params.id

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [replyText, setReplyText] = useState('')
  const [replyFile, setReplyFile] = useState<File | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const [isClosing, setIsClosing] = useState(false)
  const [closeError, setCloseError] = useState<string | null>(null)

  const loadTicket = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const [ticketData, messagesData] = await Promise.all([
        fetchTicketByIdApi(ticketId),
        fetchTicketMessagesApi(ticketId),
      ])

      setTicket(ticketData)
      setMessages(messagesData)
    } catch (error) {
      setLoadError(getTicketApiErrorMessage(error, 'دریافت تیکت با خطا مواجه شد.'))
    } finally {
      setIsLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    loadTicket()
  }, [loadTicket])

const [fileError, setFileError] = useState<string | null>(null)

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = event.target.files?.[0] ?? null

  if (selectedFile && selectedFile.size > MAX_ATTACHMENT_SIZE_BYTES) {
    setFileError('حجم فایل بیشتر از حد مجاز (۲ مگابایت) است.')
    setReplyFile(null)
    event.target.value = ''
    return
  }

  setFileError(null)
  setReplyFile(selectedFile)
}

  const handleClose = async () => {
    setIsClosing(true)
    setCloseError(null)

    try {
      const updatedTicket = await closeTicketApi(ticketId)
      setTicket(updatedTicket)
    } catch (error) {
      setCloseError(getTicketApiErrorMessage(error, 'بستن تیکت با خطا مواجه شد.'))
    } finally {
      setIsClosing(false)
    }
  }

  const handleSendReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!replyText.trim()) return

    setIsSending(true)
    setSendError(null)

    try {
      const newMessage = await addTicketMessageApi(ticketId, {
        message: replyText,
        attachment: replyFile,
      })

      setMessages((current) => [...current, newMessage])
      setReplyText('')
      setReplyFile(null)

         const refreshedTicket = await fetchTicketByIdApi(ticketId)
      setTicket(refreshedTicket)
    } catch (error) {
      setSendError(getTicketApiErrorMessage(error, 'ارسال پیام با خطا مواجه شد.'))
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-slate-400">در حال بارگذاری تیکت...</div>
  }

  if (loadError || !ticket) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {loadError ?? 'تیکت پیدا نشد.'}
      </div>
    )
  }

  const isClosed = ticket.status === 'closed'
  const MAX_ATTACHMENT_SIZE_BYTES = 2 * 1024 * 1024
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() => router.push('/dashboard/tickets/list')}
        className="flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowRight size={16} />
        بازگشت به لیست تیکت‌ها
      </button>

      {/* هدر تیکت */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {ticket.type && (
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {TYPE_LABELS[ticket.type] ?? ticket.type}
            </span>
          )}

          <span
            className={`rounded-lg px-3 py-1 text-xs font-bold ${STATUS_STYLES[ticket.status]}`}
          >
            {STATUS_LABELS[ticket.status]}
          </span>

          {!isClosed && (
            <button
              type="button"
              onClick={handleClose}
              disabled={isClosing}
              className="mr-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isClosing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Lock size={14} />
              )}
              بستن تیکت
            </button>
          )}
        </div>

        <h1 className="text-lg font-black text-slate-900">{ticket.title}</h1>

        {closeError && (
          <p className="mt-2 text-xs font-medium text-red-600">{closeError}</p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50/60 px-4 py-3">
            <p className="text-xs text-slate-400">تعداد پیام‌ها</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{messages.length} پیام</p>
          </div>

          <div className="rounded-xl bg-slate-50/60 px-4 py-3">
            <p className="text-xs text-slate-400">آخرین به‌روزرسانی</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{formatDate(ticket.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* رشته‌ی پیام‌ها */}
      <div className="space-y-4">
        {messages.map((message) => {
          const isFromLawyer = message.senderType === 'LAWYER'

          return (
            <div
              key={message.id}
              className={`flex ${isFromLawyer ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl border p-4 text-sm leading-7 ${
                  isFromLawyer
                    ? 'border-slate-200 bg-white text-slate-700'
                    : 'border-blue-100 bg-blue-50 text-blue-900'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-400">
                    {isFromLawyer ? 'شما' : 'پشتیبانی'}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(message.createdAt)}</span>
                </div>

                <p>{message.message}</p>

                {message.attachmentId && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Paperclip size={13} />
                    فایل پیوست
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* باکس پاسخ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        {isClosed && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            این تیکت بسته شده است. با ارسال پیام جدید، تیکت دوباره در صف بررسی قرار می‌گیرد.
          </div>
        )}

        <form onSubmit={handleSendReply} className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">پاسخ شما</label>
              <span className="text-xs text-slate-400">{replyText.length} کاراکتر</span>
            </div>

            <textarea
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              rows={4}
              required
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              placeholder="پاسخ، اطلاعات تکمیلی یا فایل مورد نیاز را اینجا ارسال کنید."
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="reply-file"
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-blue-600"
            >
              <Paperclip size={16} />
              {replyFile ? replyFile.name : 'پیوست فایل'}
            </label>
                {fileError && (
            <p className="mt-1 text-xs font-medium text-red-600">{fileError}</p>
                )}
            <input
              id="reply-file"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx,.pdf,.doc,.docx,.zip,.rar"
            />

            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              ارسال پیام
            </button>
          </div>

          {sendError && <p className="text-xs font-medium text-red-600">{sendError}</p>}

          <p className="text-xs text-slate-400">
            پیام‌های جدید به‌صورت خودکار هر ۳۰ ثانیه بررسی می‌شوند.
          </p>
        </form>
      </div>
    </div>
  )
}   