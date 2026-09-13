'use client'

import Link from 'next/link'

import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  MapPin,
  Star,
} from 'lucide-react'

import type {
  PublicLawyer,
} from '@/types/public-lawyer'

interface PublicLawyerCardProps {
  lawyer: PublicLawyer
}

export function PublicLawyerCard({
  lawyer,
}: PublicLawyerCardProps) {
  const initials =
    `${lawyer.firstName?.[0] ?? ''}${
      lawyer.lastName?.[0] ?? ''
    }`.trim() || 'و'

  return (
    <article
      dir="rtl"
      className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
    >
      {lawyer.isFeatured && (
        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            <Star
              size={13}
              className="fill-amber-400 text-amber-400"
            />

            وکیل ویژه
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-xl font-black text-white shadow-md shadow-blue-100">
          {initials}
        </div>

        <div className="min-w-0 pt-1">
          <h2 className="truncate text-lg font-black text-zinc-950">
            {lawyer.fullName}
          </h2>

          <p className="mt-1 text-sm font-bold text-blue-700">
            {
              lawyer.specialization
            }
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm text-zinc-600">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness
            size={16}
            className="text-zinc-400"
          />

          <span>
            {new Intl.NumberFormat(
              'fa-IR',
            ).format(
              lawyer.yearsOfExperience,
            )}{' '}
            سال سابقه
          </span>
        </div>

        {lawyer.address && (
          <div className="flex items-center gap-2">
            <MapPin
              size={16}
              className="text-zinc-400"
            />

            <span>
              {lawyer.address}
            </span>
          </div>
        )}

        {lawyer.licenseNumber && (
          <div className="flex items-center gap-2">
            <Award
              size={16}
              className="text-zinc-400"
            />

            <span>
              شماره پروانه:{' '}
              {
                lawyer.licenseNumber
              }
            </span>
          </div>
        )}
      </div>

      {lawyer.bio && (
        <p className="mt-4 line-clamp-2 text-sm leading-7 text-zinc-500">
          {lawyer.bio}
        </p>
      )}

      {lawyer.skills.length >
        0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {lawyer.skills
            .slice(
              0,
              3,
            )
            .map(
              (skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-600"
                >
                  {skill}
                </span>
              ),
            )}
        </div>
      )}

      <div className="mt-5 border-t border-zinc-100 pt-4">
        <Link
          href={`/dashboard/lawyers/${lawyer.id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-black text-blue-700 transition hover:bg-blue-600 hover:text-white"
        >
          مشاهده پروفایل وکیل

          <ArrowLeft
            size={16}
          />
        </Link>
      </div>
    </article>
  )
}