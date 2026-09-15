'use client'

import {
  useEffect,
  useState,
} from 'react'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  BadgeCheck,
  CalendarDays,
  BriefcaseBusiness,
  Check,
  Copy,
  Languages,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  X,
} from 'lucide-react'

import ClientAuthGateModal from '@/components/client-portal/ClientAuthGateModal'
import LawyerInquiryPanel from '@/components/client-portal/LawyerInquiryPanel'
import LawyerBookingPanel from '@/components/client-portal/LawyerBookingPanel'

import {
  getCurrentClientPortalAccount,
  subscribeClientPortalAuth,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'


interface LawyerContactModalProps {
  lawyer: ClientPortalLawyer | null
  onClose: () => void
}


type LawyerProfileTab =
  | 'overview'
  | 'inquiry'
  | 'booking'


export default function LawyerContactModal({
  lawyer,
  onClose,
}: LawyerContactModalProps) {
  const [
    activeTab,
    setActiveTab,
  ] = useState<LawyerProfileTab>(
    'overview',
  )

  const [
    copied,
    setCopied,
  ] = useState(false)

  const [
    account,
    setAccount,
  ] = useState<ClientPortalAccount | null>(
    null,
  )

  const [
    authOpen,
    setAuthOpen,
  ] = useState(false)


  useEffect(() => {
    const refresh = () => {
      setAccount(
        getCurrentClientPortalAccount(),
      )
    }

    refresh()

    return subscribeClientPortalAuth(
      refresh,
    )
  }, [])


  useEffect(() => {
    setActiveTab(
      'overview',
    )

    setCopied(
      false,
    )

    setAuthOpen(
      false,
    )
  }, [
    lawyer?.id,
  ])


  useEffect(() => {
    if (!lawyer) {
      return
    }

    const previousOverflow =
      document.body.style.overflow

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key !== 'Escape'
      ) {
        return
      }

      if (
        document.querySelector(
          '[data-client-auth-gate="true"]',
        )
      ) {
        return
      }

      onClose()
    }

    document.body.style.overflow =
      'hidden'

    window.addEventListener(
      'keydown',

      handleKeyDown,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',

        handleKeyDown,
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
      if (!account) {
        setAuthOpen(
          true,
        )

        return
      }

      if (!lawyer.phone) {
        return
      }

      try {
        await navigator.clipboard.writeText(
          lawyer.phone,
        )

        setCopied(
          true,
        )

        window.setTimeout(
          () =>
            setCopied(
              false,
            ),
          1800,
        )
      } catch {
        setCopied(
          false,
        )
      }
    }


  const openProtectedTab = (
    tab:
      Exclude<
        LawyerProfileTab,
        'overview'
      >,
  ) => {
    if (!account) {
      setAuthOpen(
        true,
      )

      return
    }

    setActiveTab(
      tab,
    )
  }


  const openInquiry =
    () =>
      openProtectedTab(
        'inquiry',
      )


  const openBooking =
    () =>
      openProtectedTab(
        'booking',
      )


  return (
    <>
      <div
        dir="rtl"
        className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        onMouseDown={
          onClose
        }
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="lawyer-profile-title"
          onMouseDown={(
            event,
          ) =>
            event.stopPropagation()
          }
          className="flex max-h-[96dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
        >
          <header className="shrink-0 border-b border-slate-200 bg-white">
            <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100 text-sm font-black text-blue-800">
                  {lawyer.avatarInitials}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="lawyer-profile-title"
                      className="truncate text-lg font-black text-slate-950 sm:text-xl"
                    >
                      {lawyer.fullName}
                    </h2>

                    {lawyer.verified && (
                      <BadgeCheck
                        size={18}
                        className="text-blue-600"
                      />
                    )}
                  </div>

                  <p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">
                    {lawyer.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  onClose
                }
                aria-label="بستن"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
              >
                <X
                  size={20}
                />
              </button>
            </div>

            <div className="flex gap-1 px-4 pb-3 sm:px-6">
              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    'overview',
                  )
                }
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black transition ${
                  activeTab ===
                  'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BadgeCheck
                  size={16}
                />

                پروفایل
              </button>

              <button
                type="button"
                onClick={
                  openInquiry
                }
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black transition ${
                  activeTab ===
                  'inquiry'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MessageCircle
                  size={16}
                />

                درخواست بررسی
              </button>

              <button
                type="button"
                onClick={
                  openBooking
                }
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black transition ${
                  activeTab ===
                  'booking'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CalendarDays
                  size={16}
                />

                رزرو مشاوره
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {activeTab ===
            'overview' ? (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoCard
                    icon={
                      BriefcaseBusiness
                    }
                    label="سابقه"
                    value={
                      lawyer.yearsExperience >
                      0
                        ? `${lawyer.yearsExperience.toLocaleString(
                            'fa-IR',
                          )} سال`
                        : 'ثبت نشده'
                    }
                  />

                  <InfoCard
                    icon={
                      Scale
                    }
                    label="شماره پروانه"
                    value={
                      lawyer.licenseNumber ||
                      'ثبت نشده'
                    }
                  />

                  <InfoCard
                    icon={
                      MapPin
                    }
                    label="نشانی دفتر"
                    value={
                      lawyer.officeAddress ||
                      'ثبت نشده'
                    }
                  />
                </div>

                {lawyer.specialties.length >
                  0 && (
                  <section className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-black text-slate-500">
                      حوزه‌های فعالیت
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {lawyer.specialties.map(
                        (
                          specialty,
                        ) => (
                          <span
                            key={
                              specialty
                            }
                            className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                          >
                            {specialty}
                          </span>
                        ),
                      )}
                    </div>
                  </section>
                )}

                {lawyer.languages.length >
                  0 && (
                  <section className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                      <Languages
                        size={16}
                      />

                      زبان‌ها
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {lawyer.languages.join(
                        '، ',
                      )}
                    </p>
                  </section>
                )}

                {lawyer.bio && (
                  <section className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-black text-slate-500">
                      درباره وکیل
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-8 text-slate-700">
                      {lawyer.bio}
                    </p>
                  </section>
                )}

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <button
                    type="button"
                    onClick={
                      openInquiry
                    }
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    <MessageCircle
                      size={18}
                    />

                    ارسال درخواست بررسی
                  </button>

                  <button
                    type="button"
                    onClick={
                      openBooking
                    }
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700"
                  >
                    <CalendarDays
                      size={18}
                    />

                    رزرو مشاوره
                  </button>

                  <button
                    type="button"
                    disabled={
                      !lawyer.phone
                    }
                    onClick={() =>
                      void handleCopyPhone()
                    }
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copied ? (
                      <Check
                        size={18}
                      />
                    ) : account ? (
                      <Copy
                        size={18}
                      />
                    ) : (
                      <Phone
                        size={18}
                      />
                    )}

                    {copied
                      ? 'کپی شد'
                      : account
                        ? 'کپی شماره تماس'
                        : 'ورود برای مشاهده تماس'}
                  </button>
                </div>
              </div>
            ) : activeTab ===
              'inquiry' ? (
              <LawyerInquiryPanel
                lawyer={
                  lawyer
                }
              />
            ) : (
              <LawyerBookingPanel
                lawyer={
                  lawyer
                }
              />
            )}
          </div>
        </section>
      </div>

      <ClientAuthGateModal
        open={
          authOpen
        }
        title="برای ارتباط با وکیل وارد شوید"
        onClose={() =>
          setAuthOpen(
            false,
          )
        }
        onAuthenticated={(
          nextAccount,
        ) => {
          setAccount(
            nextAccount,
          )

          setAuthOpen(
            false,
          )

          setActiveTab(
            'inquiry',
          )
        }}
      />
    </>
  )
}


function InfoCard({
  icon:
    Icon,

  label,

  value,
}: {
  icon:
    LucideIcon

  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
        <Icon
          size={16}
          className="text-blue-600"
        />

        {label}
      </div>

      <p className="mt-2 text-sm font-black leading-7 text-slate-800">
        {value}
      </p>
    </div>
  )
}
