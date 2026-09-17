'use client'

import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  FileText,
  GraduationCap,
  Languages,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  X,
} from 'lucide-react'

import ClientAuthGateModal from '@/components/client-portal/ClientAuthGateModal'
import LawyerBookingPanel from '@/components/client-portal/LawyerBookingPanel'
import LawyerInquiryPanel from '@/components/client-portal/LawyerInquiryPanel'
import LawyerOnlineContractPanel from '@/components/client-portal/LawyerOnlineContractPanel'

import {
  getCurrentClientPortalAccount,
  subscribeClientPortalAuth,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'


interface LawyerContactModalProps {
  lawyer:
    ClientPortalLawyer |
    null

  onClose:
    () => void
}


type LawyerProfileTab =
  | 'overview'
  | 'inquiry'
  | 'booking'
  | 'contract'


type ProtectedLawyerTab =
  Exclude<
    LawyerProfileTab,
    'overview'
  >


type TabTone =
  | 'blue'
  | 'green'
  | 'violet'


const ACTIVE_TAB_CLASS:
  Record<
    TabTone,
    string
  > = {
    blue:
      'bg-blue-600 text-white',

    green:
      'bg-emerald-600 text-white',

    violet:
      'bg-violet-600 text-white',
  }


export default function LawyerContactModal({
  lawyer,
  onClose,
}: LawyerContactModalProps) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<LawyerProfileTab>(
      'overview',
    )


  const [
    pendingProtectedTab,
    setPendingProtectedTab,
  ] =
    useState<ProtectedLawyerTab | null>(
      null,
    )


  const [
    copied,
    setCopied,
  ] =
    useState(
      false,
    )


  const [
    account,
    setAccount,
  ] =
    useState<ClientPortalAccount | null>(
      null,
    )


  const [
    authOpen,
    setAuthOpen,
  ] =
    useState(
      false,
    )


  useEffect(
    () => {
      const refresh =
        () => {
          setAccount(
            getCurrentClientPortalAccount(),
          )
        }


      refresh()


      return subscribeClientPortalAuth(
        refresh,
      )
    },

    [],
  )


  useEffect(
    () => {
      setActiveTab(
        'overview',
      )

      setPendingProtectedTab(
        null,
      )

      setCopied(
        false,
      )

      setAuthOpen(
        false,
      )
    },

    [
      lawyer?.id,
    ],
  )


  useEffect(
    () => {
      if (
        !lawyer
      ) {
        return
      }


      const previousOverflow =
        document.body.style.overflow


      const handleKeyDown = (
        event:
          KeyboardEvent,
      ) => {
        if (
          event.key !==
          'Escape'
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
    },

    [
      lawyer,
      onClose,
    ],
  )


  if (
    !lawyer
  ) {
    return null
  }


  async function handleCopyPhone() {
    if (
      !account
    ) {
      /*
       * ورود برای مشاهده شماره تلفن
       * نباید بعد از احراز هویت کاربر را
       * به tab دیگری منتقل کند.
       */
      setPendingProtectedTab(
        null,
      )

      setAuthOpen(
        true,
      )

      return
    }


    const phone =
      lawyer?.phone


    if (
      !phone
    ) {
      return
    }


    try {
      await navigator.clipboard.writeText(
        phone,
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


  function openProtectedTab(
    tab:
      ProtectedLawyerTab,
  ) {
    if (
      !account
    ) {
      setPendingProtectedTab(
        tab,
      )

      setAuthOpen(
        true,
      )

      return
    }


    setPendingProtectedTab(
      null,
    )

    setActiveTab(
      tab,
    )
  }


  function handleAuthClose() {
    setAuthOpen(
      false,
    )

    setPendingProtectedTab(
      null,
    )
  }


  function handleAuthenticated(
    nextAccount:
      ClientPortalAccount,
  ) {
    const requestedTab =
      pendingProtectedTab


    setAccount(
      nextAccount,
    )

    setAuthOpen(
      false,
    )

    setPendingProtectedTab(
      null,
    )


    /*
     * فقط زمانی tab را تغییر می‌دهیم که
     * login برای ورود به همان tab درخواست شده باشد.
     *
     * مثلاً login برای دیدن شماره تلفن نباید
     * کاربر را به inquiry ببرد.
     */
    if (
      requestedTab
    ) {
      setActiveTab(
        requestedTab,
      )
    }
  }


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
                  {
                    lawyer.avatarInitials
                  }
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="lawyer-profile-title"
                      className="truncate text-lg font-black text-slate-950 sm:text-xl"
                    >
                      {
                        lawyer.fullName
                      }
                    </h2>

                    {
                      lawyer.verified &&
                      (
                        <BadgeCheck
                          size={18}
                          className="text-blue-600"
                        />
                      )
                    }
                  </div>

                  <p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">
                    {
                      lawyer.title
                    }
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


            {/*
             * overflow-x-auto برای موبایل:
             * چهار سرویس داریم و نباید tabها بشکنند.
             */}
            <div className="overflow-x-auto px-4 pb-3 sm:px-6">
              <div className="flex min-w-max gap-1">
                <TabButton
                  active={
                    activeTab ===
                    'overview'
                  }
                  onClick={() => {
                    setActiveTab(
                      'overview',
                    )

                    setPendingProtectedTab(
                      null,
                    )
                  }}
                  icon={
                    BadgeCheck
                  }
                  label="پروفایل"
                  tone="blue"
                />


                <TabButton
                  active={
                    activeTab ===
                    'inquiry'
                  }
                  onClick={() =>
                    openProtectedTab(
                      'inquiry',
                    )
                  }
                  icon={
                    MessageCircle
                  }
                  label="درخواست بررسی"
                  tone="blue"
                />


                <TabButton
                  active={
                    activeTab ===
                    'booking'
                  }
                  onClick={() =>
                    openProtectedTab(
                      'booking',
                    )
                  }
                  icon={
                    CalendarDays
                  }
                  label="رزرو مشاوره"
                  tone="green"
                />


                <TabButton
                  active={
                    activeTab ===
                    'contract'
                  }
                  onClick={() =>
                    openProtectedTab(
                      'contract',
                    )
                  }
                  icon={
                    FileText
                  }
                  label="قرارداد آنلاین"
                  tone="violet"
                />
              </div>
            </div>
          </header>


          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {
              activeTab ===
              'overview'
                ? (
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


                    {
                      lawyer.bio &&
                      (
                        <ProfileSection title="درباره وکیل">
                          <p className="whitespace-pre-wrap text-sm font-medium leading-8 text-slate-700">
                            {
                              lawyer.bio
                            }
                          </p>
                        </ProfileSection>
                      )
                    }


                    {
                      lawyer.specialties.length >
                      0 &&
                      (
                        <ProfileSection title="حوزه‌های فعالیت">
                          <div className="flex flex-wrap gap-2">
                            {
                              lawyer.specialties.map(
                                (
                                  specialty,
                                ) => (
                                  <span
                                    key={
                                      specialty
                                    }
                                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                                  >
                                    {
                                      specialty
                                    }
                                  </span>
                                ),
                              )
                            }
                          </div>
                        </ProfileSection>
                      )
                    }


                    {
                      lawyer.education.length >
                      0 &&
                      (
                        <ProfileSection
                          title="سوابق تحصیلی"
                          icon={
                            <GraduationCap
                              size={16}
                            />
                          }
                        >
                          <div className="space-y-3">
                            {
                              lawyer.education.map(
                                (
                                  item,
                                ) => (
                                  <div
                                    key={
                                      item.id
                                    }
                                    className="rounded-xl bg-slate-50 p-3"
                                  >
                                    <p className="text-sm font-black text-slate-800">
                                      {
                                        [
                                          item.degree,
                                          item.field,
                                        ]
                                          .filter(
                                            Boolean,
                                          )
                                          .join(
                                            ' - ',
                                          ) ||
                                        'سابقه تحصیلی'
                                      }
                                    </p>

                                    {
                                      item.university &&
                                      (
                                        <p className="mt-1 text-xs font-semibold text-slate-600">
                                          {
                                            item.university
                                          }
                                        </p>
                                      )
                                    }

                                    {
                                      item.year &&
                                      (
                                        <p className="mt-1 text-[11px] font-bold text-slate-400">
                                          {
                                            item.year
                                          }
                                        </p>
                                      )
                                    }
                                  </div>
                                ),
                              )
                            }
                          </div>
                        </ProfileSection>
                      )
                    }


                    {
                      lawyer.experience.length >
                      0 &&
                      (
                        <ProfileSection
                          title="سوابق کاری"
                          icon={
                            <BriefcaseBusiness
                              size={16}
                            />
                          }
                        >
                          <div className="space-y-3">
                            {
                              lawyer.experience.map(
                                (
                                  item,
                                ) => (
                                  <div
                                    key={
                                      item.id
                                    }
                                    className="rounded-xl bg-slate-50 p-3"
                                  >
                                    <p className="text-sm font-black text-slate-800">
                                      {
                                        item.title
                                      }
                                    </p>

                                    {
                                      item.company &&
                                      (
                                        <p className="mt-1 text-xs font-semibold text-slate-600">
                                          {
                                            item.company
                                          }
                                        </p>
                                      )
                                    }

                                    {
                                      (
                                        item.startYear ||
                                        item.endYear
                                      ) &&
                                      (
                                        <p className="mt-1 text-[11px] font-bold text-slate-400">
                                          {
                                            item.startYear
                                          }

                                          {
                                            item.endYear
                                              ? ` تا ${item.endYear}`
                                              : ''
                                          }
                                        </p>
                                      )
                                    }

                                    {
                                      item.description &&
                                      (
                                        <p className="mt-2 whitespace-pre-wrap text-xs font-medium leading-6 text-slate-600">
                                          {
                                            item.description
                                          }
                                        </p>
                                      )
                                    }
                                  </div>
                                ),
                              )
                            }
                          </div>
                        </ProfileSection>
                      )
                    }


                    {
                      lawyer.languages.length >
                      0 &&
                      (
                        <ProfileSection
                          title="زبان‌ها"
                          icon={
                            <Languages
                              size={16}
                            />
                          }
                        >
                          <p className="text-sm font-semibold text-slate-700">
                            {
                              lawyer.languages.join(
                                '، ',
                              )
                            }
                          </p>
                        </ProfileSection>
                      )
                    }


                    {
                      lawyer.website &&
                      (
                        <ProfileSection title="وب‌سایت">
                          <a
                            href={
                              lawyer.website
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-black text-blue-700 hover:underline"
                          >
                            <ExternalLink
                              size={15}
                            />

                            مشاهده وب‌سایت وکیل
                          </a>
                        </ProfileSection>
                      )
                    }


                    {/*
                     * اینجا نقطه‌ای بود که flow قرارداد قطع شده بود.
                     * حالا قرارداد آنلاین دقیقاً کنار inquiry/booking
                     * از همان وکیل انتخاب‌شده شروع می‌شود.
                     */}
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      <button
                        type="button"
                        onClick={() =>
                          openProtectedTab(
                            'inquiry',
                          )
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
                        onClick={() =>
                          openProtectedTab(
                            'booking',
                          )
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
                        onClick={() =>
                          openProtectedTab(
                            'contract',
                          )
                        }
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black text-white transition hover:bg-violet-700"
                      >
                        <FileText
                          size={18}
                        />

                        قرارداد آنلاین
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
                        {
                          copied
                            ? (
                              <Check
                                size={18}
                              />
                            )
                            : account
                              ? (
                                <Copy
                                  size={18}
                                />
                              )
                              : (
                                <Phone
                                  size={18}
                                />
                              )
                        }

                        {
                          copied
                            ? 'کپی شد'
                            : account
                              ? 'کپی شماره تماس'
                              : 'ورود برای مشاهده تماس'
                        }
                      </button>
                    </div>
                  </div>
                )
                : activeTab ===
                  'inquiry'
                  ? (
                    <LawyerInquiryPanel
                      lawyer={
                        lawyer
                      }
                    />
                  )
                  : activeTab ===
                    'booking'
                    ? (
                      <LawyerBookingPanel
                        lawyer={
                          lawyer
                        }
                      />
                    )
                    : (
                      <LawyerOnlineContractPanel
                        lawyer={
                          lawyer
                        }
                      />
                    )
            }
          </div>
        </section>
      </div>


      <ClientAuthGateModal
        open={
          authOpen
        }
        title={
          pendingProtectedTab ===
          'contract'
            ? 'برای تنظیم قرارداد آنلاین وارد شوید'
            : pendingProtectedTab ===
                'booking'
              ? 'برای رزرو مشاوره وارد شوید'
              : pendingProtectedTab ===
                  'inquiry'
                ? 'برای ارسال درخواست وارد شوید'
                : 'برای مشاهده اطلاعات تماس وارد شوید'
        }
        onClose={
          handleAuthClose
        }
        onAuthenticated={
          handleAuthenticated
        }
      />
    </>
  )
}


function TabButton({
  active,
  onClick,
  icon:
    Icon,
  label,
  tone =
    'blue',
}: {
  active:
    boolean

  onClick:
    () => void

  icon:
    LucideIcon

  label:
    string

  tone?:
    TabTone
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-black transition ${
        active
          ? ACTIVE_TAB_CLASS[
              tone
            ]
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      <Icon
        size={16}
      />

      {
        label
      }
    </button>
  )
}


function ProfileSection({
  title,
  icon,
  children,
}: {
  title:
    string

  icon?:
    ReactNode

  children:
    ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
        {
          icon
        }

        {
          title
        }
      </div>

      <div className="mt-3">
        {
          children
        }
      </div>
    </section>
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

        {
          label
        }
      </div>

      <p className="mt-2 text-sm font-black leading-7 text-slate-800">
        {
          value
        }
      </p>
    </div>
  )
}