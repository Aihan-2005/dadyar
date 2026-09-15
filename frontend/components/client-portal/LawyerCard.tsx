import {
  BadgeCheck,
  BriefcaseBusiness,
  Languages,
  MapPin,
  MessageCircle,
  Scale,
} from 'lucide-react'

import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'


interface LawyerCardProps {
  lawyer:
    ClientPortalLawyer

  onContact:
    (
      lawyer:
        ClientPortalLawyer,
    ) => void
}


export default function LawyerCard({
  lawyer,

  onContact,
}: LawyerCardProps) {
  const visibleSpecialties =
    lawyer.specialties.slice(
      0,

      3,
    )

  const remainingSpecialties =
    Math.max(
      0,

      lawyer.specialties.length -
        visibleSpecialties.length,
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
                aria-label="وکیل فعال و منتشرشده"
              />
            )}
          </div>

          <p className="mt-1 text-sm font-bold text-slate-600">
            {lawyer.title}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <BriefcaseBusiness
              size={15}
              className="text-emerald-600"
            />

            سابقه
          </div>

          <p className="mt-1 text-sm font-black">
            {lawyer.yearsExperience >
            0
              ? `${lawyer.yearsExperience.toLocaleString(
                  'fa-IR',
                )} سال`
              : 'ثبت نشده'}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <Scale
              size={15}
              className="text-blue-600"
            />

            شماره پروانه
          </div>

          <p className="mt-1 truncate text-sm font-black">
            {lawyer.licenseNumber ||
              'ثبت نشده'}
          </p>
        </div>
      </div>

      {lawyer.officeAddress && (
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
          <div className="flex items-start gap-2 text-xs font-bold leading-6 text-slate-600">
            <MapPin
              size={15}
              className="mt-1 shrink-0 text-blue-600"
            />

            <span className="line-clamp-2">
              {lawyer.officeAddress}
            </span>
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="text-xs font-black text-slate-500">
          حوزه‌های فعالیت
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {visibleSpecialties.length >
          0 ? (
            <>
              {visibleSpecialties.map(
                (
                  specialty,
                ) => (
                  <span
                    key={
                      specialty
                    }
                    className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700"
                  >
                    {specialty}
                  </span>
                ),
              )}

              {remainingSpecialties >
                0 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                  +
                  {remainingSpecialties.toLocaleString(
                    'fa-IR',
                  )}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-semibold text-slate-400">
              تخصصی ثبت نشده است.
            </span>
          )}
        </div>
      </div>

      {lawyer.languages.length >
        0 && (
        <div className="mt-4 flex items-start gap-2 text-xs font-semibold leading-6 text-slate-500">
          <Languages
            size={15}
            className="mt-0.5 shrink-0"
          />

          <span>
            {lawyer.languages.join(
              '، ',
            )}
          </span>
        </div>
      )}

      {lawyer.bio && (
        <p className="mt-4 line-clamp-3 text-sm font-medium leading-7 text-slate-600">
          {lawyer.bio}
        </p>
      )}

      <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
        امکان ارسال درخواست بررسی برای این وکیل فعال است.
      </div>

      <button
        type="button"
        onClick={() =>
          onContact(
          lawyer,
          )
        }
        className="mt-auto pt-5"
      >
        <span className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 px-4 text-sm font-black text-white shadow-md shadow-blue-100 transition hover:from-blue-700 hover:to-blue-800">
          <MessageCircle
            size={18}
          />

          پروفایل و ارسال درخواست
        </span>
      </button>
    </article>
  )
}