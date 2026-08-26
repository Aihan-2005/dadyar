'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Paperclip, Send, HelpCircle, Check } from 'lucide-react'

import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { createTicketApi, getTicketApiErrorMessage } from '@/features/tickets/api/ticket.api'
import type { TicketPurpose } from '@/types/ticket'
const FAQ_ITEMS = [
  {
    id: 'change-password',
    question: 'چطور می‌توانم رمز عبورم را تغییر دهم؟',
    answer:
      'برای تغییر رمز عبور، به بخش تنظیمات پروفایل بروید و روی گزینه «تغییر رمز عبور» کلیک کنید. سپس رمز فعلی و رمز جدید خود را وارد کنید.',
  },
  {
    id: 'add-client-to-case',
    question: 'چطور در ثبت یک پرونده جدید موکل به آن اضافه کنم؟',
    answer:
      'در فرم ثبت پرونده جدید، بخش «موکلین» را باز کنید و با دکمه «افزودن موکل» می‌توانید موکل جدید وارد کنید یا از لیست موکلین ثبت‌شده انتخاب کنید.',
  },
  {
    id: 'reminders-notifications',
    question:
      'چطور برای کارها و پیگیری‌ها یادآوری تنظیم کنم و نوتیفیکیشن بگیرم؟',
    answer:
      'از بخش «یادداشت‌ها و اعلان‌ها» می‌توانید یادآوری جدید بسازید و تاریخ و زمان مورد نظر را برای آن مشخص کنید تا در زمان مقرر به شما یادآوری شود.',
  },
  {
    id: 'financial-reports',
    question:
      'چطور درآمدها، هزینه‌ها و گزارش‌های مالی دفتر را مدیریت کنم؟',
    answer:
      'در بخش «امور مالی» می‌توانید پرداخت‌ها، هزینه‌ها و گزارش‌های مالی مربوط به هر پرونده و کل دفتر خود را ثبت و پیگیری کنید.',
  },
  {
    id: 'data-security',
    question:
      'اطلاعات پرونده‌ها و موکلین من در دادیار چطور نگهداری و محافظت می‌شود؟',
    answer:
      'اطلاعات شما به‌صورت رمزنگاری‌شده و با استانداردهای امنیتی روی سرورهای امن نگهداری می‌شود و تنها خودتان به آن‌ها دسترسی دارید.',
  },
]

const PURPOSE_OPTIONS = [
  { value: 'bug', label: 'باگ (خطا یا مشکل)' },
  { value: 'suggestion', label: 'پیشنهاد' },
] as const

type Purpose = (typeof PURPOSE_OPTIONS)[number]['value']

export default function TicketsPage() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [purpose, setPurpose] = useState<Purpose | ''>('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [isPurposeOpen, setIsPurposeOpen] = useState(false)
  const purposeRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (purposeRef.current && !purposeRef.current.contains(event.target as Node)) {
        setIsPurposeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleFaq = (id: string) => {
    setOpenFaqId((current) => (current === id ? null : id))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null)
  }

  const resetForm = () => {
    setTitle('')
    setPurpose('')
    setDescription('')
    setFile(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!purpose) return

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      await createTicketApi({ title, purpose, description, attachment: file })
      setSubmitSuccess(true)
      resetForm()
    } catch (error) {
      setSubmitError(getTicketApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPurposeLabel = PURPOSE_OPTIONS.find((option) => option.value === purpose)?.label
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <DashboardPageHeader
        title="سوالات و پیشنهادات (تیکت)"
        description="پاسخ سوالات رایج را ببینید یا برای ما تیکت جدید ثبت کنید"
      />

      {/* بخش سوالات متداول */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <HelpCircle size={20} />
          </div>

          <h2 className="text-base font-black text-slate-900">
            سوالات متداول
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openFaqId === item.id

            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  className="flex w-full items-center justify-between gap-3 px-6 py-4 text-right transition-colors hover:bg-slate-50"
                >
                  <span className="text-sm font-bold text-slate-800">
                    {item.question}
                  </span>

                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="min-h-0 bg-slate-50/60 px-6 pb-5 pt-1 text-sm leading-7 text-slate-500">
                    {item.answer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* فرم ثبت تیکت */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 sm:p-8">
        <h2 className="mb-6 border-b border-slate-100 pb-4 text-base font-black text-slate-900">
          ثبت تیکت جدید
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              عنوان
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              placeholder="عنوان تیکت را وارد کنید"
            />
          </div>

          <div ref={purposeRef} className="relative">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              هدف
            </label>

            <button
              type="button"
              onClick={() => setIsPurposeOpen((current) => !current)}
              className={`flex w-full items-center justify-between rounded-xl border bg-slate-50/60 px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                isPurposeOpen
                  ? 'border-blue-500 bg-white'
                  : 'border-slate-200'
              } ${selectedPurposeLabel ? 'text-slate-800' : 'text-slate-400'}`}
            >
              {selectedPurposeLabel ?? 'انتخاب کنید'}

              <ChevronDown
                size={16}
                className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                  isPurposeOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {/* select مخفی برای حفظ اعتبارسنجی و رفتار فرم */}
            <select
              value={purpose}
              onChange={(event) => setPurpose(event.target.value as Purpose)}
              required
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-0 w-0 opacity-0"
            >
              <option value="" disabled>
                انتخاب کنید
              </option>
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div
              className={`absolute z-10 mt-2 w-full origin-top overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/80 transition-all duration-200 ease-out ${
                isPurposeOpen
                  ? 'scale-100 opacity-100'
                  : 'pointer-events-none scale-95 opacity-0'
              }`}
            >
              {PURPOSE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setPurpose(option.value)
                    setIsPurposeOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-right text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  {option.label}

                  {purpose === option.value && (
                    <Check size={15} className="text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              توضیحات
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              placeholder="توضیحات خود را بنویسید..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              پیوست فایل (اختیاری)
            </label>

            <label
              htmlFor="ticket-file"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-4 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600"
            >
              <Paperclip size={18} />

              {file ? file.name : 'برای انتخاب فایل کلیک کنید'}
            </label>

            <input
              id="ticket-file"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx,.pdf,.doc,.docx,.zip,.rar"
            />

            <p className="mt-2 text-xs text-slate-400">
              فایل‌های قابل قبول: jpg، png، pdf، doc، docx، xls، xlsx، zip، rar
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-black text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
          >
            <Send size={17} />
            ثبت تیکت
          </button>
        </form>
      </div>
    </div>
  )
}