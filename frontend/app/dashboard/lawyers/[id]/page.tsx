'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Globe,
  Languages,
  Mail,
  MapPin,
  Phone,
  Scale,
  Star,
  UserRound,
} from 'lucide-react'

import {
  useParams,
} from 'next/navigation'

import {
  getPublicLawyerById,
} from '@/services/public-lawyer.service'

import type {
  PublicLawyer,
} from '@/types/public-lawyer'

export default function PublicLawyerDetailsPage() {
  const {
    id,
  } = useParams<{
    id: string
  }>()

  const [
    lawyer,
    setLawyer,
  ] =
    useState<
      PublicLawyer | null
    >(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError(null)

    getPublicLawyerById(
      id,
    )
      .then((result) => {
        if (!active) {
          return
        }

        if (!result) {
          setError(
            'وکیل موردنظر پیدا نشد.',
          )

          return
        }

        setLawyer(
          result,
        )
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'دریافت اطلاعات وکیل ناموفق بود.',
          )
        }
      })
      .finally(() => {
        if (active) {
          setLoading(
            false,
          )
        }
      })

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[400px] items-center justify-center text-sm text-zinc-500"
      >
        در حال دریافت اطلاعات
        وکیل...
      </div>
    )
  }

  if (
    error ||
    !lawyer
  ) {
    return (
      <div
        dir="rtl"
        className="mx-auto max-w-3xl"
      >
        <Link
          href="/dashboard/lawyers"
          className="inline-flex items-center gap-1 text-sm font-bold text-blue-700"
        >
          <ArrowRight
            size={16}
          />

          بازگشت به وکلا
        </Link>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-700">
          {error ??
            'وکیل پیدا نشد.'}
        </div>
      </div>
    )
  }

  const initials =
    `${lawyer.firstName?.[0] ?? ''}${
      lawyer.lastName?.[0] ?? ''
    }`.trim() || 'و'

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-5xl space-y-6 pb-12"
    >
      <Link
        href="/dashboard/lawyers"
        className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:underline"
      >
        <ArrowRight
          size={16}
        />

        بازگشت به لیست وکلا
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-l from-blue-800 via-blue-600 to-indigo-600" />

        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-zinc-900 text-3xl font-black text-white shadow-lg">
              {initials}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-zinc-950">
                  {
                    lawyer.fullName
                  }
                </h1>

                {lawyer.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    <Star
                      size={13}
                      className="fill-amber-400"
                    />

                    ویژه
                  </span>
                )}
              </div>

              <p className="mt-2 font-bold text-blue-700">
                {
                  lawyer.specialization
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <UserRound
                size={19}
                className="text-blue-600"
              />

              <h2 className="font-black text-zinc-900">
                معرفی وکیل
              </h2>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-zinc-600">
              {lawyer.bio ||
                'اطلاعات معرفی ثبت نشده است.'}
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Scale
                size={19}
                className="text-blue-600"
              />

              <h2 className="font-black text-zinc-900">
                حوزه‌های تخصص
              </h2>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {lawyer.skills.length >
              0 ? (
                lawyer.skills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                    >
                      {skill}
                    </span>
                  ),
                )
              ) : (
                <span className="text-sm text-zinc-400">
                  موردی ثبت نشده است.
                </span>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Languages
                size={19}
                className="text-blue-600"
              />

              <h2 className="font-black text-zinc-900">
                زبان‌ها
              </h2>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {lawyer.languages.length >
              0 ? (
                lawyer.languages.map(
                  (language) => (
                    <span
                      key={
                        language
                      }
                      className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-700"
                    >
                      {language}
                    </span>
                  ),
                )
              ) : (
                <span className="text-sm text-zinc-400">
                  موردی ثبت نشده است.
                </span>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="font-black text-zinc-900">
              اطلاعات حرفه‌ای
            </h2>

            <div className="mt-4 space-y-4">
              <InfoRow
                icon={
                  <BriefcaseBusiness
                    size={17}
                  />
                }
                label="سابقه فعالیت"
                value={`${new Intl.NumberFormat(
                  'fa-IR',
                ).format(
                  lawyer.yearsOfExperience,
                )} سال`}
              />

              <InfoRow
                icon={
                  <Award
                    size={17}
                  />
                }
                label="شماره پروانه"
                value={
                  lawyer.licenseNumber ||
                  '—'
                }
              />

              <InfoRow
                icon={
                  <MapPin
                    size={17}
                  />
                }
                label="موقعیت"
                value={
                  lawyer.address ||
                  '—'
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="font-black text-zinc-900">
              راه‌های ارتباطی
            </h2>

            <div className="mt-4 space-y-2">
              {lawyer.phone && (
                <a
                  dir="ltr"
                  href={`tel:${lawyer.phone}`}
                  className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-3 text-sm font-bold text-zinc-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <span>
                    {
                      lawyer.phone
                    }
                  </span>

                  <Phone
                    size={17}
                  />
                </a>
              )}

              {lawyer.email && (
                <a
                  dir="ltr"
                  href={`mailto:${lawyer.email}`}
                  className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-3 text-sm font-bold text-zinc-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="truncate">
                    {
                      lawyer.email
                    }
                  </span>

                  <Mail
                    size={17}
                    className="shrink-0"
                  />
                </a>
              )}

              {lawyer.website && (
                <a
                  dir="ltr"
                  href={
                    lawyer.website.startsWith(
                      'http',
                    )
                      ? lawyer.website
                      : `https://${lawyer.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-3 text-sm font-bold text-zinc-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="truncate">
                    وب‌سایت
                  </span>

                  <Globe
                    size={17}
                  />
                </a>
              )}

              {!lawyer.phone &&
                !lawyer.email &&
                !lawyer.website && (
                  <p className="text-sm text-zinc-400">
                    اطلاعات تماس ثبت
                    نشده است.
                  </p>
                )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode

  label: string

  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-zinc-400">
        {icon}
      </span>

      <div>
        <p className="text-xs font-bold text-zinc-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-black text-zinc-800">
          {value}
        </p>
      </div>
    </div>
  )
}

