'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  Phone,
  Star,
  X,
} from 'lucide-react'

import type {
  ClientPortalLawyer,
  LawyerConsultationMode,
} from '@/features/client-portal/types/lawyer'




interface LawyerContactModalProps {
  lawyer:
    ClientPortalLawyer | null

  onClose:
    () => void
}




const CONSULTATION_LABELS:
  Record<
    LawyerConsultationMode,
    string
  > = {
    in_person:
      'مشاوره حضوری',

    phone:
      'مشاوره تلفنی',

    online:
      'مشاوره آنلاین',
  }


  


export default function LawyerContactModal({
  lawyer,
  onClose,
}: LawyerContactModalProps) {
  const [
    copied,
    setCopied,
  ] =
    useState(
      false
    )

  const [
    requestSubmitted,
    setRequestSubmitted,
  ] =
    useState(
      false
    )

 
    

  useEffect(() => {
    setCopied(
      false
    )

    setRequestSubmitted(
      false
    )
  }, [
    lawyer?.id,
  ])


  


  useEffect(() => {
    if (!lawyer) {
      return
    }

    const handleKeyDown =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.key ===
          'Escape'
        ) {
          onClose()
        }
      }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [
    lawyer,
    onClose,
  ])

  if (!lawyer) {
    return null
  }

  
  


  const handleCopyPhone =
    async () => {
      try {
        await navigator.clipboard.writeText(
          lawyer.phone
        )

        setCopied(
          true
        )

        window.setTimeout(
          () => {
            setCopied(
              false
            )
          },
          2000
        )
      } catch {
        setCopied(
          false
        )
      }
    }


    


  const handleMockRequest =
    () => {
      setRequestSubmitted(
        true
      )
    }

  
    


  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={
        onClose
      }
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lawyer-contact-title"
        onMouseDown={(
          event
        ) => {
          event.stopPropagation()
        }}
        className="max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
      >
        



        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black text-blue-700">
              پروفایل وکیل
            </p>

            <h2
              id="lawyer-contact-title"
              className="mt-1 text-xl font-black text-slate-950"
            >
              اطلاعات و راه ارتباط
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="بستن"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X
              size={20}
            />
          </button>
        </header>

        <div className="p-5 sm:p-6">
            



          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100 text-lg font-black text-blue-800">
              {
                lawyer.avatarInitials
              }
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-slate-950">
                  {
                    lawyer.fullName
                  }
                </h3>

                {lawyer.verified && (
                  <BadgeCheck
                    size={19}
                    className="text-blue-600"
                  />
                )}
              </div>

              <p className="mt-1 text-sm font-bold text-slate-600">
                {
                  lawyer.title
                }
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-sm font-black text-amber-700">
                <Star
                  size={16}
                  fill="currentColor"
                />

                {
                  lawyer.rating.toLocaleString(
                    'fa-IR',
                    {
                      minimumFractionDigits:
                        1,

                      maximumFractionDigits:
                        1,
                    }
                  )
                }

                <span className="font-medium text-slate-500">
                  از
                  {' '}
                  {
                    lawyer.reviewCount.toLocaleString(
                      'fa-IR'
                    )
                  }
                  {' '}
                  نظر آزمایشی
                </span>
              </div>
            </div>
          </div>




          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-900">
              درباره وکیل
            </p>

            <p className="mt-2 text-sm font-medium leading-7 text-slate-600">
              {
                lawyer.bio
              }
            </p>
          </div>




          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoItem
              icon={
                MapPin
              }
              label="موقعیت دفتر"
              value={
                lawyer.officeAddress
              }
            />

            <InfoItem
              icon={
                Building2
              }
              label="کانون وکلا"
              value={
                lawyer.barAssociation
              }
            />

            <InfoItem
              icon={
                Clock
              }
              label="زمان تقریبی پاسخ"
              value={
                lawyer.responseTimeLabel
              }
            />

            <InfoItem
              icon={
                BadgeCheck
              }
              label="شماره پروانه"
              value={
                lawyer.licenseNumber
              }
            />
          </div>

         



          <div className="mt-5">
            <p className="text-sm font-black text-slate-900">
              حوزه‌های فعالیت
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {lawyer.specialties.map(
                (
                  specialty
                ) => (
                  <span
                    key={
                      specialty
                    }
                    className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100"
                  >
                    {
                      specialty
                    }
                  </span>
                )
              )}
            </div>
          </div>




          <div className="mt-5">
            <p className="text-sm font-black text-slate-900">
              شیوه‌های مشاوره
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {lawyer.consultationModes.map(
                (
                  mode
                ) => (
                  <span
                    key={
                      mode
                    }
                    className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
                  >
                    {
                      CONSULTATION_LABELS[
                        mode
                      ]
                    }
                  </span>
                )
              )}
            </div>
          </div>


          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-500">
              شماره تماس آزمایشی
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div
                dir="ltr"
                className="text-lg font-black text-slate-950"
              >
                {
                  lawyer.phone
                }
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleCopyPhone()
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                {copied ? (
                  <>
                    <CheckCircle2
                      size={17}
                      className="text-emerald-600"
                    />

                    کپی شد
                  </>
                ) : (
                  <>
                    <Copy
                      size={17}
                    />

                    کپی شماره
                  </>
                )}
              </button>
            </div>
          </div>




          {requestSubmitted ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-black text-emerald-900">
                    درخواست آزمایشی ثبت شد
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-6 text-emerald-700">
                    فعلاً این درخواست فقط
                    برای تکمیل رابط کاربری
                    است و به Backend ارسال
                    نمی‌شود.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={
                !lawyer.acceptsNewClients
              }
              onClick={
                handleMockRequest
              }
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 text-sm font-black text-white shadow-md shadow-emerald-100 transition hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <Phone
                size={18}
              />

              {lawyer.acceptsNewClients
                ? 'ثبت درخواست ارتباط'
                : 'پذیرش موکل جدید غیرفعال است'}
            </button>
          )}

          <p className="mt-4 text-center text-[11px] font-semibold leading-5 text-slate-400">
            اطلاعات این صفحه فعلاً آزمایشی
            است و برای توسعه رابط کاربری
            نمایش داده می‌شود.
          </p>
        </div>
      </section>
    </div>
  )
}



function InfoItem({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    typeof MapPin

  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Icon
          size={15}
          className="text-blue-600"
        />

        {label}
      </div>

      <p className="mt-2 text-sm font-black leading-6 text-slate-800">
        {value}
      </p>
    </div>
  )
}