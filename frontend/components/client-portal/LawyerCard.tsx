import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  FileText,
  MapPin,
  MessageCircle,
  Star,
} from 'lucide-react'

import {
  getMinimumConsultationPrice,
  getMockLawyerMarketplaceProfile,
} from '@/features/client-portal/data/mock-lawyer-marketplace'

import type {
  ClientPortalLawyer,
  LawyerConsultationMode,
} from '@/features/client-portal/types/lawyer'

import {
  CONSULTATION_MODE_LABELS,
  formatToman,
} from '@/features/client-portal/utils/communication'

interface LawyerCardProps {
  lawyer:
    ClientPortalLawyer

  onContact:
    (
      lawyer:
        ClientPortalLawyer
    ) => void
}

export default function LawyerCard({
  lawyer,
  onContact,
}: LawyerCardProps) {
  const marketplaceProfile =
    getMockLawyerMarketplaceProfile(
      lawyer.id
    )

  const minimumPrice =
    getMinimumConsultationPrice(
      lawyer.id
    )

  const nextAvailability =
    marketplaceProfile.availability[0]

  const visibleSpecialties =
    lawyer.specialties.slice(
      0,
      3
    )

  const remainingSpecialties =
    Math.max(
      0,
      lawyer.specialties.length -
        visibleSpecialties.length
    )

  return (
    <article className="group flex h-full flex-col rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/70 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100 text-base font-black text-blue-800 ring-1 ring-blue-100 sm:h-16 sm:w-16">
          {lawyer.avatarInitials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-black text-slate-950">
              {lawyer.fullName}
            </h2>

            {lawyer.verified && (
              <BadgeCheck
                size={18}
                className="shrink-0 text-blue-600"
                aria-label="پروفایل تأیید شده"
              />
            )}
          </div>

          <p className="mt-1 text-sm font-bold text-slate-600">
            {lawyer.title}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700">
              <Star
                size={15}
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
              (
              {lawyer.reviewCount.toLocaleString(
                'fa-IR'
              )}
              {' '}
              نظر)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <MapPin
              size={15}
              className="text-blue-600"
            />

            شهر
          </div>

          <p className="mt-1 text-sm font-black">
            {lawyer.city}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <BriefcaseBusiness
              size={15}
              className="text-emerald-600"
            />

            سابقه
          </div>

          <p className="mt-1 text-sm font-black">
            {lawyer.yearsExperience.toLocaleString(
              'fa-IR'
            )}
            {' '}
            سال
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-black text-slate-500">
          حوزه‌های فعالیت
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {visibleSpecialties.map(
            (
              specialty
            ) => (
              <span
                key={
                  specialty
                }
                className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700"
              >
                {specialty}
              </span>
            )
          )}

          {remainingSpecialties >
            0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
              +
              {remainingSpecialties.toLocaleString(
                'fa-IR'
              )}
            </span>
          )}
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm font-medium leading-7 text-slate-600">
        {lawyer.bio}
      </p>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap gap-2">
          {(
            lawyer.consultationModes as LawyerConsultationMode[]
          ).map(
            (
              mode
            ) => (
              <span
                key={
                  mode
                }
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700"
              >
                {
                  CONSULTATION_MODE_LABELS[
                    mode
                  ]
                }
              </span>
            )
          )}
        </div>
      </div>

      {lawyer.acceptsNewClients &&
        nextAvailability && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
          <CalendarClock
            size={16}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div>
            <p className="text-[10px] font-bold text-blue-600">
              نزدیک‌ترین زمان
            </p>

            <p className="mt-1 text-xs font-black text-blue-900">
              {nextAvailability.label}

              {nextAvailability.slots[0] && (
                <>
                  {' • '}
                  {nextAvailability.slots[0]}
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {minimumPrice !==
        null && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
          <span className="text-xs font-black text-emerald-800">
            شروع مشاوره از
          </span>

          <span className="text-sm font-black text-emerald-700">
            {formatToman(
              minimumPrice
            )}
          </span>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2.5 text-xs font-black text-violet-700">
        <FileText
          size={15}
        />

        قرارداد آنلاین
      </div>

      <div className="mt-3">
        <div
          className={`rounded-xl border px-3 py-2 text-xs font-black ${
            lawyer.acceptsNewClients
              ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
              : 'border-amber-100 bg-amber-50 text-amber-700'
          }`}
        >
          {lawyer.acceptsNewClients
            ? 'پذیرش موکل جدید دارد'
            : 'در حال حاضر پذیرش جدید ندارد'}
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          onContact(
            lawyer
          )
        }
        className="mt-auto pt-5"
      >
        <span className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 px-4 text-sm font-black text-white shadow-md shadow-blue-100 transition hover:from-blue-700 hover:to-blue-800">
          <MessageCircle
            size={18}
          />

          پروفایل و ارتباط با وکیل
        </span>
      </button>
    </article>
  )
}