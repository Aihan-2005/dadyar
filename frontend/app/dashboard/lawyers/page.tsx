'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Filter,
  Loader2,
  Scale,
  Search,
  Star,
  Users,
  X,
} from 'lucide-react'

import {
  useSearchParams,
} from 'next/navigation'

import {
  PublicLawyerCard,
} from '@/components/lawyers/PublicLawyerCard'

import {
  getPublicLawyers,
  getPublicLawyerSpecializations,
} from '@/services/public-lawyer.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  PublicLawyer,
} from '@/types/public-lawyer'

export default function ClientLawyersPage() {
  const user =
    useAuthStore(
      (state) =>
        state.user,
    )

  const searchParams =
    useSearchParams()

  const initialSearch =
    searchParams.get(
      'search',
    ) ?? ''

  const [
    search,
    setSearch,
  ] = useState(
    initialSearch,
  )

  const [
    specialization,
    setSpecialization,
  ] =
    useState('ALL')

  const [
    featuredOnly,
    setFeaturedOnly,
  ] = useState(false)

  const [
    lawyers,
    setLawyers,
  ] =
    useState<
      PublicLawyer[]
    >([])

  const [
    specializations,
    setSpecializations,
  ] =
    useState<
      string[]
    >([])

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

    getPublicLawyerSpecializations()
      .then((items) => {
        if (active) {
          setSpecializations(
            items,
          )
        }
      })
      .catch(() => {
        if (active) {
          setSpecializations(
            [],
          )
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const timeout =
      window.setTimeout(
        () => {
          setLoading(true)

          setError(null)

          getPublicLawyers({
            search:
              search.trim() ||
              undefined,

            specialization,

            featuredOnly,
          })
            .then(
              (items) => {
                if (active) {
                  setLawyers(
                    items,
                  )
                }
              },
            )
            .catch(
              (err) => {
                if (active) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : 'دریافت لیست وکلا ناموفق بود.',
                  )
                }
              },
            )
            .finally(
              () => {
                if (active) {
                  setLoading(
                    false,
                  )
                }
              },
            )
        },
        250,
      )

    return () => {
      active = false

      window.clearTimeout(
        timeout,
      )
    }
  }, [
    search,
    specialization,
    featuredOnly,
  ])

  const hasFilters =
    Boolean(
      search.trim(),
    ) ||
    specialization !==
      'ALL' ||
    featuredOnly

  const featuredCount =
    useMemo(
      () =>
        lawyers.filter(
          (lawyer) =>
            lawyer.isFeatured,
        ).length,
      [lawyers],
    )

  function clearFilters() {
    setSearch('')
    setSpecialization(
      'ALL',
    )
    setFeaturedOnly(
      false,
    )
  }

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-7xl space-y-6 pb-12"
    >
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-l from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-blue-100 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-blue-100">
            <Scale
              size={21}
            />

            <span className="text-sm font-bold">
              وکلای دادیار
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-black sm:text-3xl">
            انتخاب وکیل مناسب
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-8 text-blue-50">
            {user?.firstName
              ? `${user.firstName} عزیز، `
              : ''}
            از میان وکلای تأییدشده
            دادیار، وکیل متناسب با
            موضوع حقوقی خود را پیدا
            کنید.
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            <Users
              size={18}
            />

            وکلای قابل نمایش
          </div>

          <p className="mt-2 text-2xl font-black text-zinc-950">
            {new Intl.NumberFormat(
              'fa-IR',
            ).format(
              lawyers.length,
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            <Star
              size={18}
              className="text-amber-500"
            />

            وکلای ویژه
          </div>

          <p className="mt-2 text-2xl font-black text-zinc-950">
            {new Intl.NumberFormat(
              'fa-IR',
            ).format(
              featuredCount,
            )}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter
            size={18}
            className="text-zinc-500"
          />

          <h2 className="font-black text-zinc-900">
            جستجو و فیلتر
          </h2>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="نام، تخصص، شهر یا مهارت..."
              className="h-11 w-full rounded-xl border border-zinc-300 pr-10 pl-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={
              specialization
            }
            onChange={(
              event,
            ) =>
              setSpecialization(
                event.target
                  .value,
              )
            }
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              همه تخصص‌ها
            </option>

            {specializations.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ),
            )}
          </select>

          <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-bold text-zinc-700">
            <input
              type="checkbox"
              checked={
                featuredOnly
              }
              onChange={(
                event,
              ) =>
                setFeaturedOnly(
                  event.target
                    .checked,
                )
              }
              className="h-4 w-4 accent-blue-600"
            />

            <Star
              size={16}
              className="text-amber-500"
            />

            فقط ویژه
          </label>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={
              clearFilters
            }
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline"
          >
            <X
              size={14}
            />

            حذف همه فیلترها
          </button>
        )}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2
              size={20}
              className="animate-spin"
            />

            در حال دریافت وکلا...
          </div>
        </div>
      ) : lawyers.length ===
        0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Scale
            size={42}
            className="mx-auto text-zinc-300"
          />

          <h2 className="mt-4 font-black text-zinc-800">
            وکیلی پیدا نشد
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            فیلترهای جستجو را تغییر
            دهید.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {lawyers.map(
            (lawyer) => (
              <PublicLawyerCard
                key={
                  lawyer.id
                }
                lawyer={
                  lawyer
                }
              />
            ),
          )}
        </section>
      )}
    </div>
  )
}
