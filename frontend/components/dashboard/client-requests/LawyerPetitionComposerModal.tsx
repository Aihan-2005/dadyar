'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Printer,
  Save,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'

import {
  deletePetitionApi,
  getPetitionApiErrorMessage,
  savePetitionApi,
} from '@/features/dashboard/petitions/api/petition.api'

import { fetchClientsApi } from '@/features/clients/api/client.api'
import type { Client } from '@/types/client'

import type {
  LawyerPetitionDraft,
  LawyerPetitionRecord,
} from '@/features/dashboard/petitions/types'

import type {
  ClientPetitionStatus,
  PetitionPartyRole,
  PetitionTemplateKey,
} from '@/features/client-portal/types/petition'

import {
  PETITION_PARTY_ROLE_LABELS,
  PETITION_STATUS_LABELS,
  PETITION_TEMPLATES,
  buildPetitionText,
  getPetitionStatusClassName,
} from '@/features/client-portal/utils/petition'

interface LawyerPetitionComposerModalProps {
  petition: LawyerPetitionRecord | null
  creating: boolean
  onClose: () => void
  onUpdated: () => void
}

const INPUT_CLASS =
  'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

const TEXTAREA_CLASS =
  'w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

function createEmptyDraft(): LawyerPetitionDraft {
  return {
    clientId: '',
    clientName: '',
    templateKey: 'defense',
    authorityName: '',
    branch: '',
    caseNumber: '',
    archiveNumber: '',
    authorFullName: '',
    authorRole: 'plaintiff',
    opposingPartyName: '',
    subject: '',
    facts: '',
    legalArguments: '',
    evidence: [],
    request: '',
    closingNotes: '',
  }
}

function recordToDraft(record: LawyerPetitionRecord): LawyerPetitionDraft {
  return {
    clientId: record.clientId,
    clientName: record.clientName,
    templateKey: record.templateKey,
    authorityName: record.authorityName,
    branch: record.branch,
    caseNumber: record.caseNumber,
    archiveNumber: record.archiveNumber,
    authorFullName: record.authorFullName,
    authorRole: record.authorRole,
    opposingPartyName: record.opposingPartyName,
    subject: record.subject,
    facts: record.facts,
    legalArguments: record.legalArguments,
    evidence: record.evidence,
    request: record.request,
    closingNotes: record.closingNotes,
  }
}

export default function LawyerPetitionComposerModal({
  petition,
  creating,
  onClose,
  onUpdated,
}: LawyerPetitionComposerModalProps) {
  const [draft, setDraft] = useState<LawyerPetitionDraft>(createEmptyDraft())
  const [evidenceText, setEvidenceText] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // --- جستجوی زنده‌ی موکل ---
  const [clientQuery, setClientQuery] = useState('')
  const [clientResults, setClientResults] = useState<Client[]>([])
  const [clientSearchOpen, setClientSearchOpen] = useState(false)
  const [clientSearchLoading, setClientSearchLoading] = useState(false)
  const clientSearchDebounce = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const open = creating || Boolean(petition)

  useEffect(() => {
    if (petition) {
      const nextDraft = recordToDraft(petition)
      setDraft(nextDraft)
      setEvidenceText(nextDraft.evidence.join('\n'))
      setClientQuery(nextDraft.clientName)
    } else if (creating) {
      setDraft(createEmptyDraft())
      setEvidenceText('')
      setClientQuery('')
    }

    setShowPreview(false)
    setError(null)
    setClientSearchOpen(false)
    setClientResults([])
  }, [petition, creating])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (clientSearchDebounce.current) {
      clearTimeout(clientSearchDebounce.current)
    }

    const query = clientQuery.trim()

    if (!clientSearchOpen || query.length < 2) {
      setClientResults([])
      setClientSearchLoading(false)
      return
    }

    setClientSearchLoading(true)

    clientSearchDebounce.current = setTimeout(async () => {
      try {
        const result = await fetchClientsApi({ search: query, limit: 8 })
        setClientResults(result.items)
      } catch {
        setClientResults([])
      } finally {
        setClientSearchLoading(false)
      }
    }, 350)

    return () => {
      if (clientSearchDebounce.current) {
        clearTimeout(clientSearchDebounce.current)
      }
    }
  }, [clientQuery, clientSearchOpen])

  const previewText = useMemo(
    () =>
      buildPetitionText({
        ...draft,
        evidence: evidenceText
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    [draft, evidenceText]
  )

  if (!open) {
    return null
  }

  const updateField = <K extends keyof LawyerPetitionDraft>(
    key: K,
    value: LawyerPetitionDraft[K]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setError(null)
  }

  const handleSelectClient = (client: Client) => {
    updateField('clientId', client.id)
    updateField('clientName', client.fullName)
    setClientQuery(client.fullName)
    setClientSearchOpen(false)
    setClientResults([])
  }

  const buildFinalDraft = (): LawyerPetitionDraft => ({
    ...draft,
    evidence: evidenceText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
  })

  const handleSave = async (status: ClientPetitionStatus) => {
    setError(null)

    if (!draft.clientId) {
      setError('یک موکل را از لیست انتخاب کنید.')
      return
    }

    setBusy(true)

    try {
      await savePetitionApi(buildFinalDraft(), status, petition?.id)
      onUpdated()
      onClose()
    } catch (caughtError) {
      setError(
        getPetitionApiErrorMessage(caughtError, 'ذخیره لایحه انجام نشد.')
      )
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!petition) return

    const confirmed = window.confirm('این لایحه حذف شود؟')
    if (!confirmed) return

    setBusy(true)
    setError(null)

    try {
      await deletePetitionApi(petition.id)
      onUpdated()
      onClose()
    } catch (caughtError) {
      setError(
        getPetitionApiErrorMessage(caughtError, 'حذف لایحه انجام نشد.')
      )
    } finally {
      setBusy(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('کپی متن انجام نشد.')
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=750')

    if (!printWindow) {
      setError('مرورگر اجازه باز کردن صفحه چاپ را نداد.')
      return
    }

    printWindow.opener = null

    printWindow.document.write(`
      <!doctype html>
      <html lang="fa" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>لایحه - دادیار</title>
          <style>
            body {
              direction: rtl;
              font-family: Tahoma, Arial, sans-serif;
              margin: 48px;
              color: #0f172a;
              line-height: 2.1;
            }
            pre {
              white-space: pre-wrap;
              word-break: break-word;
              font-family: inherit;
              font-size: 14px;
            }
            @media print {
              body { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <pre id="petition-content"></pre>
        </body>
      </html>
    `)

    printWindow.document.close()

    const content = printWindow.document.getElementById('petition-content')
    if (content) {
      content.textContent = previewText
    }

    printWindow.focus()
    window.setTimeout(() => printWindow.print(), 200)
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[96dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <FileText size={17} />
              </div>

              <h2 className="text-lg font-black text-slate-950">
                {petition ? 'ویرایش لایحه' : 'لایحه جدید'}
              </h2>

              {petition && (
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${getPetitionStatusClassName(petition.status)}`}
                >
                  {PETITION_STATUS_LABELS[petition.status]}
                </span>
              )}
            </div>

            {petition && (
              <p dir="ltr" className="mt-1 text-right text-xs font-black text-blue-700">
                {petition.reference}
                {' — '}
                نسخه {petition.version.toLocaleString('fa-IR')}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {!showPreview ? (
            <div className="space-y-4">
              <div className="relative">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  موکل
                </span>

                <div className="relative">
                  <Search
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={clientQuery}
                    onChange={(event) => {
                      setClientQuery(event.target.value)
                      setClientSearchOpen(true)

                      if (draft.clientId) {
                        updateField('clientId', '')
                        updateField('clientName', '')
                      }
                    }}
                    onFocus={() => setClientSearchOpen(true)}
                    placeholder="جستجو بر اساس نام یا شماره موبایل موکل..."
                    className={`${INPUT_CLASS} pr-11`}
                  />

                  {clientSearchLoading && (
                    <Loader2
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
                    />
                  )}
                </div>

                {clientSearchOpen && clientQuery.trim().length >= 2 && (
                  <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    {clientSearchLoading ? (
                      <p className="px-4 py-3 text-xs font-semibold text-slate-400">
                        در حال جستجو...
                      </p>
                    ) : clientResults.length > 0 ? (
                      clientResults.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-right transition hover:bg-slate-50"
                        >
                          <UserRound size={16} className="shrink-0 text-blue-600" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-black text-slate-800">
                              {client.fullName}
                            </span>
                            <span dir="ltr" className="block text-right text-xs text-slate-400">
                              {client.phoneNumber}
                            </span>
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-xs font-semibold text-slate-400">
                        موکلی پیدا نشد.
                      </p>
                    )}
                  </div>
                )}

                {draft.clientId && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={14} />
                    موکل انتخاب‌شده: {draft.clientName}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    نوع لایحه
                  </span>

                  <select
                    value={draft.templateKey}
                    onChange={(event) =>
                      updateField('templateKey', event.target.value as PetitionTemplateKey)
                    }
                    className={INPUT_CLASS}
                  >
                    {PETITION_TEMPLATES.map((template) => (
                      <option key={template.key} value={template.key}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    سمت موکل در پرونده
                  </span>

                  <select
                    value={draft.authorRole}
                    onChange={(event) =>
                      updateField('authorRole', event.target.value as PetitionPartyRole)
                    }
                    className={INPUT_CLASS}
                  >
                    {Object.entries(PETITION_PARTY_ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    مرجع قضایی / مرجع رسیدگی
                  </span>

                  <input
                    value={draft.authorityName}
                    onChange={(event) => updateField('authorityName', event.target.value)}
                    placeholder="مثلاً دادگاه عمومی حقوقی تهران"
                    className={INPUT_CLASS}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    شعبه
                  </span>

                  <input
                    value={draft.branch}
                    onChange={(event) => updateField('branch', event.target.value)}
                    placeholder="مثلاً شعبه ۲۵"
                    className={INPUT_CLASS}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    شماره پرونده
                  </span>

                  <input
                    value={draft.caseNumber ?? ''}
                    onChange={(event) => updateField('caseNumber', event.target.value)}
                    dir="ltr"
                    placeholder="اختیاری"
                    className={INPUT_CLASS}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    شماره بایگانی شعبه
                  </span>

                  <input
                    value={draft.archiveNumber ?? ''}
                    onChange={(event) => updateField('archiveNumber', event.target.value)}
                    dir="ltr"
                    placeholder="اختیاری"
                    className={INPUT_CLASS}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    نام و نام خانوادگی تنظیم‌کننده
                  </span>

                  <input
                    value={draft.authorFullName}
                    onChange={(event) => updateField('authorFullName', event.target.value)}
                    placeholder="معمولاً همان نام موکل"
                    className={INPUT_CLASS}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    طرف مقابل
                  </span>

                  <input
                    value={draft.opposingPartyName ?? ''}
                    onChange={(event) => updateField('opposingPartyName', event.target.value)}
                    placeholder="اختیاری"
                    className={INPUT_CLASS}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  موضوع لایحه
                </span>

                <input
                  value={draft.subject}
                  onChange={(event) => updateField('subject', event.target.value)}
                  placeholder="موضوع مختصر لایحه"
                  className={INPUT_CLASS}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  شرح موضوع و اتفاقات
                </span>

                <textarea
                  rows={6}
                  value={draft.facts}
                  onChange={(event) => updateField('facts', event.target.value)}
                  placeholder="شرح موضوع را با ترتیب روشن وارد کنید..."
                  className={TEXTAREA_CLASS}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  توضیحات و دفاعیات
                </span>

                <textarea
                  rows={4}
                  value={draft.legalArguments ?? ''}
                  onChange={(event) => updateField('legalArguments', event.target.value)}
                  placeholder="اختیاری"
                  className={TEXTAREA_CLASS}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  دلایل و مستندات (هر مورد در یک خط)
                </span>

                <textarea
                  rows={4}
                  value={evidenceText}
                  onChange={(event) => setEvidenceText(event.target.value)}
                  placeholder={'مثلاً:\nقرارداد مورخ ...\nرسید پرداخت'}
                  className={TEXTAREA_CLASS}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  درخواست نهایی
                </span>

                <textarea
                  rows={3}
                  value={draft.request}
                  onChange={(event) => updateField('request', event.target.value)}
                  placeholder="درخواست نهایی را روشن بنویسید..."
                  className={TEXTAREA_CLASS}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  توضیحات پایانی
                </span>

                <textarea
                  rows={2}
                  value={draft.closingNotes ?? ''}
                  onChange={(event) => updateField('closingNotes', event.target.value)}
                  placeholder="اختیاری"
                  className={TEXTAREA_CLASS}
                />
              </label>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4 sm:p-6">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm font-medium leading-8 text-slate-800">
                {previewText}
              </pre>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={() => setShowPreview((current) => !current)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700"
          >
            {showPreview ? 'بازگشت به ویرایش' : 'پیش‌نمایش متن'}
          </button>

          {showPreview && (
            <>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700"
              >
                {copied ? <CheckCircle2 size={17} className="text-emerald-600" /> : <Copy size={17} />}
                {copied ? 'کپی شد' : 'کپی متن'}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700"
              >
                <Printer size={17} />
                چاپ
              </button>
            </>
          )}

          <div className="flex-1" />

          {petition && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleDelete()}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-600 disabled:opacity-60"
            >
              حذف
            </button>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSave('draft')}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-black text-amber-700 disabled:opacity-60"
          >
            <Save size={16} />
            ذخیره پیش‌نویس
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSave('ready')}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white disabled:opacity-60"
          >
            <ShieldCheck size={16} />
            آماده نهایی
          </button>
        </div>
      </section>
    </div>
  )
}