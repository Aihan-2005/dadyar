import type {
  ClientCallbackWindow,
  ClientLawyerRequestStatus,
  ClientPreferredContactMethod,
  ClientRequestUrgency,
  LegalCaseStage,
  LegalMatterCategory,
} from '@/features/client-portal/types/communication'

import type {
  LawyerConsultationMode,
} from '@/features/client-portal/types/lawyer'

export const LEGAL_CATEGORY_LABELS:
  Record<
    LegalMatterCategory,
    string
  > = {
    family:
      'خانواده',

    criminal:
      'کیفری',

    property:
      'ملکی',

    contracts:
      'قراردادها',

    company:
      'شرکت‌ها و تجاری',

    labor:
      'کار و تأمین اجتماعی',

    inheritance:
      'ارث و انحصار وراثت',

    financial:
      'مطالبات و امور مالی',

    other:
      'سایر',
  }

export const CASE_STAGE_LABELS:
  Record<
    LegalCaseStage,
    string
  > = {
    pre_filing:
      'هنوز پرونده تشکیل نشده',

    filed:
      'پرونده تشکیل شده',

    hearing:
      'در مرحله رسیدگی',

    appeal:
      'تجدیدنظر / اعتراض',

    enforcement:
      'اجرای حکم',

    other:
      'سایر',
  }

export const REQUEST_URGENCY_LABELS:
  Record<
    ClientRequestUrgency,
    string
  > = {
    normal:
      'عادی',

    soon:
      'نیاز به پاسخ سریع',

    urgent:
      'فوری',
  }

export const CONTACT_METHOD_LABELS:
  Record<
    ClientPreferredContactMethod,
    string
  > = {
    written_response:
      'پاسخ کتبی',

    phone_callback:
      'درخواست تماس',
  }

export const CALLBACK_WINDOW_LABELS:
  Record<
    ClientCallbackWindow,
    string
  > = {
    morning:
      'صبح، ۹ تا ۱۲',

    afternoon:
      'ظهر، ۱۲ تا ۱۷',

    evening:
      'عصر، ۱۷ تا ۲۰',
  }

export const CONSULTATION_MODE_LABELS:
  Record<
    LawyerConsultationMode,
    string
  > = {
    in_person:
      'حضوری',

    phone:
      'تلفنی',

    online:
      'آنلاین',
  }

export const REQUEST_STATUS_LABELS:
  Record<
    ClientLawyerRequestStatus,
    string
  > = {
    submitted:
      'ارسال شده',

    under_review:
      'در حال بررسی',

    confirmed:
      'تأیید شده',

    completed:
      'انجام شده',

    cancelled:
      'لغو شده',
  }

export function getRequestStatusClassName(
  status:
    ClientLawyerRequestStatus
): string {
  switch (status) {
    case 'submitted':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'under_review':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'confirmed':
      return 'border-violet-200 bg-violet-50 text-violet-700'

    case 'completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'cancelled':
      return 'border-slate-200 bg-slate-100 text-slate-500'
  }
}

export function formatToman(
  value:
    number
): string {
  return `${value.toLocaleString(
    'fa-IR'
  )} تومان`
}

export function formatCommunicationDateTime(
  value:
    string
): string {
  const date =
    new Date(
      value
    )

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'fa-IR',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    }
  ).format(
    date
  )
}