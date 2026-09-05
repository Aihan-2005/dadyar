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
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  Languages,
  LockKeyhole,
  MapPin,
  Phone,
  Star,
  X,
} from 'lucide-react'

import LawyerBookingPanel from '@/components/client-portal/LawyerBookingPanel'
import LawyerOnlineContractPanel from '@/components/client-portal/LawyerOnlineContractPanel'
import LawyerReviewsPanel from '@/components/client-portal/LawyerReviewsPanel'
import ClientAuthGateModal from '@/components/client-portal/ClientAuthGateModal'

import {
  getMockLawyerMarketplaceProfile,
} from '@/features/client-portal/data/mock-lawyer-marketplace'

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
    ClientPortalLawyer | null

  onClose:
    () => void
}

export default function LawyerContactModal({
  lawyer,
  onClose,
}: LawyerContactModalProps) {
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
    setCopied(false)
    setAuthOpen(false)
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
          event.key ===
          'Escape' &&
        !authOpen
        ) {
          onClose()
        }
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
    authOpen,
  ])

  if (!lawyer) {
    return null
  }

  const marketplaceProfile =
    getMockLawyerMarketplaceProfile(
      lawyer.id
    )

  const handleCopyPhone =
    async () => {
      if (!account) {
        setAuthOpen(true)
        return
      }

      try {
        await navigator.clipboard.writeText(
          lawyer.phone
        )

        setCopied(true)

        window.setTimeout(
          () =>
            setCopied(false),
          2000
        )
      } catch {
        setCopied(false)
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
          onMouseDown={(
            event
          ) =>
            event.stopPropagation()
          }
          className="max-h-[96dvh] w-full max-w-4xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
        >
          <header className="sticky top-0 z-20 flex items-start justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-6">
            <div>
              <p className="text-xs font-black text-blue-700">
                پروفایل وکیل
              </p>

              <h2 className="mt-1 text-xl font-black">
                اطلاعات، مشاوره، قرارداد و نظرات
              </h2>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X
                size={20}
              />
            </button>
          </header>

          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100 text-lg font-black text-blue-800">
                {lawyer.avatarInitials}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black sm:text-2xl">
                    {lawyer.fullName}
                  </h3>

                  {lawyer.verified && (
                    <BadgeCheck
                      size={20}
                      className="text-blue-600"
                    />
                  )}
                </div>

                <p className="mt-1 text-sm font-bold text-slate-600">
                  {lawyer.title}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Star
                    size={16}
                    fill="currentColor"
                    className="text-amber-500"
                  />

                  <span className="text-sm font-black text-amber-700">
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
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black">
                درباره وکیل
              </p>

              <p className="mt-2 text-sm font-medium leading-7 text-slate-600">
                {lawyer.bio}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  BadgeCheck
                }
                label="شماره پروانه"
                value={
                  lawyer.licenseNumber
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
                label="شهر"
                value={`${lawyer.city}، ${lawyer.province}`}
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-black">
                حوزه‌های فعالیت
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {lawyer.specialties.map(
                  (specialty) => (
                    <span
                      key={
                        specialty
                      }
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100"
                    >
                      {specialty}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Phone
                  size={15}
                  className="text-blue-600"
                />

                شماره تماس
              </div>

              {account ? (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div
                    dir="ltr"
                    className="text-lg font-black"
                  >
                    {lawyer.phone}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void handleCopyPhone()
                    }}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-black text-slate-700"
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
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setAuthOpen(
                      true
                    )
                  }
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-black text-blue-700"
                >
                  <LockKeyhole
                    size={17}
                  />

                  ورود برای مشاهده شماره تماس
                </button>
              )}
            </div>

            <div className="mt-6">
              <LawyerBookingPanel
                lawyer={
                  lawyer
                }
                profile={
                  marketplaceProfile
                }
              />
            </div>

            <div className="mt-6">
              <LawyerOnlineContractPanel
                lawyer={
                  lawyer
                }
              />
            </div>

            <div className="mt-6">
              <LawyerReviewsPanel
                lawyer={
                  lawyer
                }
                profile={
                  marketplaceProfile
                }
              />
            </div>
          </div>
        </section>
      </div>

      <ClientAuthGateModal
        open={
          authOpen
        }
        title="مشاهده اطلاعات تماس"
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

function InfoItem({
  icon:
    Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
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