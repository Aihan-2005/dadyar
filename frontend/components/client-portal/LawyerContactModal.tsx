'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Languages,
  ListChecks,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Star,
  X,
} from 'lucide-react'

import ClientAuthGateModal from '@/components/client-portal/ClientAuthGateModal'
import LawyerBookingPanel from '@/components/client-portal/LawyerBookingPanel'
import LawyerInquiryPanel from '@/components/client-portal/LawyerInquiryPanel'
import LawyerOnlineContractPanel from '@/components/client-portal/LawyerOnlineContractPanel'
import LawyerReviewsPanel from '@/components/client-portal/LawyerReviewsPanel'

import {
  getCurrentClientPortalAccount,
  subscribeClientPortalAuth,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  getMockLawyerMarketplaceProfile,
} from '@/features/client-portal/data/mock-lawyer-marketplace'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'

interface LawyerContactModalProps {
  lawyer:
    ClientPortalLawyer | null

  onClose:
    () => void
}

type LawyerProfileTab =
  | 'overview'
  | 'inquiry'
  | 'booking'
  | 'contract'
  | 'reviews'

export default function LawyerContactModal({
  lawyer,
  onClose,
}: LawyerContactModalProps) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<LawyerProfileTab>(
      'overview'
    )

  const [
    copied,
    setCopied,
  ] =
    useState(false)

  const [
    account,
    setAccount,
  ] =
    useState<ClientPortalAccount | null>(
      null
    )

  const [
    authOpen,
    setAuthOpen,
  ] =
    useState(false)

  const lawyerId =
    lawyer?.id

  const marketplaceProfile =
    useMemo(
      () =>
        lawyerId
          ? getMockLawyerMarketplaceProfile(
              lawyerId
            )
          : null,
      [
        lawyerId,
      ]
    )

  useEffect(() => {
    const refresh =
      () => {
        setAccount(
          getCurrentClientPortalAccount()
        )
      }

    refresh()

    return subscribeClientPortalAuth(
      refresh
    )
  }, [])

  useEffect(() => {
    setActiveTab(
      'overview'
    )

    setCopied(
      false
    )

    setAuthOpen(
      false
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

    const handleKeyDown =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.key !==
          'Escape'
        ) {
          return
        }

        if (
          document.querySelector(
            '[data-client-auth-gate="true"]'
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
      handleKeyDown
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [
    lawyer,
    onClose,
  ])

  if (
    !lawyer ||
    !marketplaceProfile
  ) {
    return null
  }

  const handleCopyPhone =
    async () => {
      if (!account) {
        setAuthOpen(
          true
        )

        return
      }

      try {
        await navigator.clipboard.writeText(
          lawyer.phone
        )

        setCopied(
          true
        )

        window.setTimeout(
          () =>
            setCopied(
              false
            ),
          1800
        )
      } catch {
        setCopied(
          false
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
            event
          ) =>
            event.stopPropagation()
          }
          className="flex max-h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
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
                    {' • '}
                    {lawyer.city}
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

            <div className="overflow-x-auto px-4 sm:px-6">
              <div className="flex min-w-max gap-1 pb-3">
                <TabButton
                  active={
                    activeTab ===
                    'overview'
                  }
                  icon={
                    BadgeCheck
                  }
                  onClick={() =>
                    setActiveTab(
                      'overview'
                    )
                  }
                >
                  پروفایل
                </TabButton>

                <TabButton
                  active={
                    activeTab ===
                    'inquiry'
                  }
                  icon={
                    MessageCircle
                  }
                  onClick={() =>
                    setActiveTab(
                      'inquiry'
                    )
                  }
                >
                  درخواست بررسی
                </TabButton>

                <TabButton
                  active={
                    activeTab ===
                    'booking'
                  }
                  icon={
                    Clock3
                  }
                  onClick={() =>
                    setActiveTab(
                      'booking'
                    )
                  }
                >
                  رزرو مشاوره
                </TabButton>

                <TabButton
                  active={
                    activeTab ===
                    'contract'
                  }
                  icon={
                    FileText
                  }
                  onClick={() =>
                    setActiveTab(
                      'contract'
                    )
                  }
                >
                  قرارداد
                </TabButton>

                <TabButton
                  active={
                    activeTab ===
                    'reviews'
                  }
                  icon={
                    Star
                  }
                  onClick={() =>
                    setActiveTab(
                      'reviews'
                    )
                  }
                >
                  نظرات
                </TabButton>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {account && (
              <div className="mb-5 flex justify-end">
                <Link
                  href="/client-portal/requests"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  <ListChecks
                    size={16}
                  />

                  درخواست‌های من
                </Link>
              </div>
            )}

            {activeTab ===
              'overview' && (
              <OverviewTab
                lawyer={
                  lawyer
                }
                account={
                  account
                }
                copied={
                  copied
                }
                onRequireAuth={() =>
                  setAuthOpen(
                    true
                  )
                }
                onCopyPhone={
                  handleCopyPhone
                }
                onGoInquiry={() =>
                  setActiveTab(
                    'inquiry'
                  )
                }
                onGoBooking={() =>
                  setActiveTab(
                    'booking'
                  )
                }
              />
            )}

            {activeTab ===
              'inquiry' && (
              <LawyerInquiryPanel
                lawyer={
                  lawyer
                }
              />
            )}

            {activeTab ===
              'booking' && (
              <LawyerBookingPanel
                lawyer={
                  lawyer
                }
                profile={
                  marketplaceProfile
                }
              />
            )}

            {activeTab ===
              'contract' && (
              <LawyerOnlineContractPanel
                lawyer={
                  lawyer
                }
              />
            )}

            {activeTab ===
              'reviews' && (
              <LawyerReviewsPanel
                lawyer={
                  lawyer
                }
                profile={
                  marketplaceProfile
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
        title="برای مشاهده اطلاعات تماس وارد شوید"
        onClose={() =>
          setAuthOpen(
            false
          )
        }
        onAuthenticated={(
          authenticatedAccount
        ) => {
          setAccount(
            authenticatedAccount
          )

          setAuthOpen(
            false
          )
        }}
      />
    </>
  )
}

function OverviewTab({
  lawyer,
  account,
  copied,
  onRequireAuth,
  onCopyPhone,
  onGoInquiry,
  onGoBooking,
}: {
  lawyer:
    ClientPortalLawyer

  account:
    ClientPortalAccount | null

  copied:
    boolean

  onRequireAuth:
    () => void

  onCopyPhone:
    () => void

  onGoInquiry:
    () => void

  onGoBooking:
    () => void
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-emerald-100 text-xl font-black text-blue-800">
            {lawyer.avatarInitials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-black">
                {lawyer.fullName}
              </h3>

              {lawyer.verified && (
                <BadgeCheck
                  size={21}
                  className="text-blue-600"
                />
              )}
            </div>

            <p className="mt-1 text-sm font-bold text-slate-600">
              {lawyer.title}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-black text-amber-700">
                <Star
                  size={16}
                  fill="currentColor"
                />

                {lawyer.rating.toLocaleString(
                  'fa-IR',
                  {
                    minimumFractionDigits:
                      1,

                    maximumFractionDigits:
                      1,
                  }
                )}
              </span>

              <span className="text-xs font-semibold text-slate-500">
                {lawyer.reviewCount.toLocaleString(
                  'fa-IR'
                )}
                {' '}
                نظر
              </span>

              <span className="text-xs font-semibold text-slate-500">
                {lawyer.yearsExperience.toLocaleString(
                  'fa-IR'
                )}
                {' '}
                سال سابقه
              </span>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl bg-slate-50 p-5">
          <h4 className="font-black">
            درباره وکیل
          </h4>

          <p className="mt-2 text-sm font-medium leading-8 text-slate-600">
            {lawyer.bio}
          </p>
        </section>

        <section className="mt-5">
          <h4 className="text-sm font-black">
            حوزه‌های فعالیت
          </h4>

          <div className="mt-2 flex flex-wrap gap-2">
            {lawyer.specialties.map(
              (
                specialty
              ) => (
                <span
                  key={
                    specialty
                  }
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                >
                  {specialty}
                </span>
              )
            )}
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            icon={
              MapPin
            }
            label="نشانی دفتر"
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
              BadgeCheck
            }
            label="شماره پروانه"
            value={
              lawyer.licenseNumber
            }
          />

          <InfoItem
            icon={
              Clock3
            }
            label="زمان پاسخ"
            value={
              lawyer.responseTimeLabel
            }
          />

          <InfoItem
            icon={
              Languages
            }
            label="زبان‌ها"
            value={
              lawyer.languages.join(
                '، '
              )
            }
          />

          <InfoItem
            icon={
              MapPin
            }
            label="موقعیت"
            value={`${lawyer.city}، ${lawyer.province}`}
          />
        </section>
      </div>

      <aside>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-black">
            شروع ارتباط
          </p>

          <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">
            می‌توانید ابتدا درخواست بررسی
            بفرستید یا برای یک زمان مشخص
            مشاوره رزرو کنید.
          </p>

          <button
            type="button"
            disabled={
              !lawyer.acceptsNewClients
            }
            onClick={
              onGoInquiry
            }
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white disabled:bg-slate-300"
          >
            <MessageCircle
              size={17}
            />

            درخواست بررسی
          </button>

          <button
            type="button"
            disabled={
              !lawyer.acceptsNewClients
            }
            onClick={
              onGoBooking
            }
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-700 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Clock3
              size={17}
            />

            رزرو مشاوره
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Phone
              size={15}
              className="text-blue-600"
            />

            شماره تماس
          </div>

          {account ? (
            <>
              <p
                dir="ltr"
                className="mt-3 text-right text-lg font-black"
              >
                {lawyer.phone}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${lawyer.phone}`}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-black text-white"
                >
                  <PhoneCall
                    size={15}
                  />

                  تماس
                </a>

                <button
                  type="button"
                  onClick={
                    onCopyPhone
                  }
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 text-xs font-black text-slate-700"
                >
                  {copied ? (
                    <>
                      <CheckCircle2
                        size={15}
                        className="text-emerald-600"
                      />

                      کپی شد
                    </>
                  ) : (
                    <>
                      <Copy
                        size={15}
                      />

                      کپی
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={
                onRequireAuth
              }
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-xs font-black text-blue-700"
            >
              <LockKeyhole
                size={16}
              />

              ورود برای مشاهده شماره
            </button>
          )}
        </div>

        <div
          className={`mt-4 rounded-2xl border p-4 ${
            lawyer.acceptsNewClients
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-amber-200 bg-amber-50'
          }`}
        >
          <p
            className={`text-sm font-black ${
              lawyer.acceptsNewClients
                ? 'text-emerald-800'
                : 'text-amber-800'
            }`}
          >
            {lawyer.acceptsNewClients
              ? 'پذیرش موکل جدید فعال است'
              : 'در حال حاضر پذیرش جدید ندارد'}
          </p>
        </div>
      </aside>
    </div>
  )
}

function TabButton({
  active,
  icon:
    Icon,
  onClick,
  children,
}: {
  active:
    boolean

  icon:
    LucideIcon

  onClick:
    () => void

  children:
    string
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-black transition ${
        active
          ? 'bg-slate-900 text-white'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon
        size={15}
      />

      {children}
    </button>
  )
}

function InfoItem({
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