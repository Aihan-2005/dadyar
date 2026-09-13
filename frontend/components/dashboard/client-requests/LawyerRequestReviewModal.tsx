'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  UserRound,
  X,
  XCircle,
} from 'lucide-react'

import {
  getLawyerRequestApiErrorMessage,
  updateLawyerRequestStatusApi,
} from '@/features/dashboard/client-requests/api/lawyer-request.api'

import type {
  ClientLawyerRequestRecord,
} from '@/features/client-portal/types/communication'

import {
  CALLBACK_WINDOW_LABELS,
  CASE_STAGE_LABELS,
  CONSULTATION_MODE_LABELS,
  CONTACT_METHOD_LABELS,
  LEGAL_CATEGORY_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_URGENCY_LABELS,
  formatCommunicationDateTime,
  formatToman,
  getRequestStatusClassName,
} from '@/features/client-portal/utils/communication'

interface LawyerRequestReviewModalProps {
  request: ClientLawyerRequestRecord | null
  onClose: () => void
  onUpdated: () => void
}

export default function LawyerRequestReviewModal({
  request,
  onClose,
  onUpdated,
}: LawyerRequestReviewModalProps) {
  const [record, setRecord] =
    useState<ClientLawyerRequestRecord | null>(request)

  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setRecord(request)
    setError(null)

    if (request && request.status === 'submitted') {
      updateLawyerRequestStatusApi(request.id, 'under_review')
        .then((updated) => {
          setRecord(updated)
          onUpdated()
        })
        .catch(() => {
          // اگر تغییر خودکار به under_review شکست بخورد، مودال همچنان با
          // وضعیت فعلی قابل استفاده است؛ کاربر می‌تواند دستی تلاش کند.
        })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id])

  if (!record) {
    return null
  }

  const runAction = async (
    action: () => Promise<ClientLawyerRequestRecord>,
    confirmMessage?: string
  ) => {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return
    }

    setBusy(true)
    setError(null)

    try {
      const updated = await action()
      setRecord(updated)
      onUpdated()
    } catch (caughtError) {
      setError(
        getLawyerRequestApiErrorMessage(
          caughtError,
          'عملیات انجام نشد.'
        )
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"
      dir="rtl"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-black ${getRequestStatusClassName(record.status)}`}
              >
                {REQUEST_STATUS_LABELS[record.status]}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                {record.kind === 'consultation_booking'
                  ? 'رزرو مشاوره'
                  : 'بررسی اولیه'}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-black">{record.subject}</h2>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              {record.client.fullName} — {record.client.phone}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBox
              label="حوزه حقوقی"
              value={LEGAL_CATEGORY_LABELS[record.category]}
            />

            <InfoBox
              label="مرحله پرونده"
              value={CASE_STAGE_LABELS[record.caseStage]}
            />

            {record.opposingPartyName && (
              <InfoBox
                label="طرف مقابل"
                value={record.opposingPartyName}
              />
            )}

            <InfoBox
              label="زمان ثبت"
              value={formatCommunicationDateTime(record.createdAt)}
            />
          </div>

          {record.kind === 'consultation_booking' ? (
            <div className="mt-4 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:grid-cols-2">
              <DetailRow
                icon={CalendarDays}
                label="تاریخ جلسه"
                value={record.dateLabel}
              />

              <DetailRow icon={Clock3} label="ساعت" value={record.time} />

              <DetailRow
                icon={UserRound}
                label="نوع مشاوره"
                value={CONSULTATION_MODE_LABELS[record.consultationMode]}
              />

              <DetailRow
                icon={CheckCircle2}
                label="مدت و مبلغ"
                value={`${record.durationMinutes.toLocaleString('fa-IR')} دقیقه — ${formatToman(record.priceToman)}`}
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:grid-cols-2">
              <InfoBox
                label="روش ارتباط"
                value={CONTACT_METHOD_LABELS[record.preferredContactMethod]}
              />

              <InfoBox
                label="فوریت"
                value={REQUEST_URGENCY_LABELS[record.urgency]}
              />

              {record.callbackWindow && (
                <InfoBox
                  label="زمان مناسب تماس"
                  value={CALLBACK_WINDOW_LABELS[record.callbackWindow]}
                />
              )}
            </div>
          )}

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-black text-slate-500">شرح درخواست</p>

            <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-8 text-slate-700">
              {record.description || 'توضیح تکمیلی ثبت نشده است.'}
            </p>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 p-5">
          {record.status === 'under_review' && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  runAction(() =>
                    updateLawyerRequestStatusApi(record.id, 'confirmed')
                  )
                }
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white disabled:opacity-60"
              >
                <CheckCircle2 size={17} />
                تأیید درخواست
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  runAction(
                    () =>
                      updateLawyerRequestStatusApi(record.id, 'declined'),
                    'این درخواست رد شود؟'
                  )
                }
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-black text-red-600 disabled:opacity-60"
              >
                <XCircle size={17} />
                رد درخواست
              </button>
            </>
          )}

          {record.status === 'confirmed' && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                runAction(() =>
                  updateLawyerRequestStatusApi(record.id, 'completed')
                )
              }
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-black text-white disabled:opacity-60"
            >
              <CheckCircle2 size={17} />
              علامت‌گذاری به‌عنوان انجام‌شده
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-bold text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-black leading-6 text-slate-900">
        {value}
      </p>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="mt-1 shrink-0 text-blue-600" />
      <div>
        <p className="text-[10px] font-bold text-blue-600">{label}</p>
        <p className="mt-1 text-sm font-black text-blue-950">{value}</p>
      </div>
    </div>
  )
}