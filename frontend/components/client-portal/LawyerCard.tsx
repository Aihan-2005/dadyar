import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock,
  MapPin,
  MessageCircle,
  Star,
} from 'lucide-react'

import type {
  ClientPortalLawyer,
  LawyerConsultationMode,
} from '@/features/client-portal/types/lawyer'

import {
  getMinimumConsultationPrice,
} from '@/features/client-portal/data/mock-lawyer-marketplace'

interface LawyerCardProps {
  lawyer:
    ClientPortalLawyer

  onContact:
    (
      lawyer:
        ClientPortalLawyer
    ) => void
}

const CONSULTATION_LABELS:
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

export default function LawyerCard({
  lawyer,
  onContact,
}: LawyerCardProps) {
  const minimumPrice =
    getMinimumConsultationPrice(
      lawyer.id
    )

  return (
    <article className="group flex h-full flex-col rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/70 sm:p-6">
      {/* Header */}

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100 text-base font-black text-blue-800 ring-1 ring-blue-100 sm:h-16 sm:w-16">
          {
            lawyer.avatarInitials
          }
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-black text-slate-950">
              {
                lawyer.fullName
              }
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
            {
              lawyer.title
            }
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
              <Star
                size={15}
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
                (
                {
                  lawyer.reviewCount.toLocaleString(
                    'fa-IR'
                  )
                }
                {' '}
                نظر)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* City / Experience */}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <MapPin
              size={15}
              className="text-blue-600"
            />

            شهر
          </div>

          <p className="mt-1 text-sm font-black text-slate-900">
            {
              lawyer.city
            }
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

          <p className="mt-1 text-sm font-black text-slate-900">
            {lawyer.yearsExperience.toLocaleString(
              'fa-IR'
            )}
            {' '}
            سال
          </p>
        </div>
      </div>

      {/* Specialties */}

      <div className="mt-5">
        <p className="text-xs font-black text-slate-500">
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
                className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700"
              >
                {
                  specialty
                }
              </span>
            )
          )}
        </div>
      </div>

      {/* Bio */}

      <p className="mt-4 line-clamp-3 text-sm font-medium leading-7 text-slate-600">
        {
          lawyer.bio
        }
      </p>

      {/* Consultation Modes */}

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap gap-2">
          {lawyer.consultationModes.map(
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
                  CONSULTATION_LABELS[
                    mode
                  ]
                }
              </span>
            )
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Clock
            size={14}
          />

          {
            lawyer.responseTimeLabel
          }
        </div>
      </div>

      {/* Price */}

      {minimumPrice !==
        null && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
          <span className="text-xs font-black text-emerald-800">
            شروع مشاوره از
          </span>

          <span className="text-sm font-black text-emerald-700">
            {minimumPrice.toLocaleString(
              'fa-IR'
            )}
            {' '}
            تومان
          </span>
        </div>
      )}

      {/* Availability */}

      <div className="mt-3">
        {lawyer.acceptsNewClients ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
            پذیرش موکل جدید دارد
          </div>
        ) : (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
            در حال حاضر پذیرش جدید ندارد
          </div>
        )}
      </div>

      {/* CTA */}

      <button
        type="button"
        onClick={() =>
          onContact(
            lawyer
          )
        }
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-sm font-black text-white shadow-md shadow-blue-100 transition hover:from-blue-700 hover:to-blue-800"
      >
        <MessageCircle
          size={18}
        />

        پروفایل، رزرو و نظرات
      </button>
    </article>
  )
}
