'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import Link from 'next/link'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  Filter,
  ListChecks,
  Loader2,
  LogIn,
  LogOut,
  PenLine,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  UsersRound,
  X,
} from 'lucide-react'

import ClientServiceHub from '@/components/client-portal/ClientServiceHub'

import LawyerCard from '@/components/client-portal/LawyerCard'

import LawyerContactModal from '@/components/client-portal/LawyerContactModal'

import {
  clearClientPortalSession,
  getCurrentClientPortalAccount,
  hydrateCurrentClientPortalAccount,
  subscribeClientPortalAuth,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  mapPublicLawyerToClientPortalLawyer,
} from '@/features/client-portal/data/public-lawyer.mapper'

import type {
  ClientPortalLawyer,
  LawyerDirectoryFilters,
} from '@/features/client-portal/types/lawyer'

import {
  filterLawyers,
  getLawyerSpecialties,
} from '@/features/client-portal/utils/lawyer-filters'

import {
  getPublicLawyers,
} from '@/services/public-lawyer.service'


const DEFAULT_FILTERS:
  LawyerDirectoryFilters = {
    search:
      '',

    city:
      '',

    specialty:
      '',

    consultationMode:
      'all',

    acceptsNewClientsOnly:
      false,

    sort:
      'recommended',
  }


export default function ClientPortalPage() {
  const [
    account,

    setAccount,
  ] =
    useState<ClientPortalAccount | null>(
      null,
    )

  const [
    directoryLawyers,

    setDirectoryLawyers,
  ] =
    useState<
      ClientPortalLawyer[]
    >([])

  const [
    directoryLoading,

    setDirectoryLoading,
  ] =
    useState(
      true,
    )

  const [
    directoryError,

    setDirectoryError,
  ] =
    useState<
      string | null
    >(
      null,
    )

  const [
    filters,

    setFilters,
  ] =
    useState<LawyerDirectoryFilters>({
      ...DEFAULT_FILTERS,
    })

  const [
    showMobileFilters,

    setShowMobileFilters,
  ] =
    useState(
      false,
    )

  const [
    selectedLawyer,

    setSelectedLawyer,
  ] =
    useState<ClientPortalLawyer | null>(
      null,
    )


  /*
   * Auth از Zustand می‌آید،
   * fullName از ClientProfile Backend.
   */
  useEffect(
    () => {
      let active =
        true

      const refreshFromCache =
        () => {
          if (
            !active
          ) {
            return
          }

          setAccount(
            getCurrentClientPortalAccount(),
          )
        }

      refreshFromCache()

      void hydrateCurrentClientPortalAccount()
        .then(
          (
            nextAccount,
          ) => {
            if (
              active
            ) {
              setAccount(
                nextAccount,
              )
            }
          },
        )
        .catch(
          () => {
            /*
             * خطای Profile نباید صفحه را
             * از کار بیندازد.
             *
             * موقع ارسال Inquiry دوباره
             * profile بررسی می‌شود.
             */
          },
        )

      const unsubscribe =
        subscribeClientPortalAuth(
          refreshFromCache,
        )

      return () => {
        active =
          false

        unsubscribe()
      }
    },

    [],
  )


  const loadDirectory =
    useCallback(
      async () => {
        try {
          setDirectoryLoading(
            true,
          )

          setDirectoryError(
            null,
          )

          const publicLawyers =
            await getPublicLawyers()

          setDirectoryLawyers(
            publicLawyers.map(
              mapPublicLawyerToClientPortalLawyer,
            ),
          )
        } catch (
          caughtError:
            unknown
        ) {
          setDirectoryError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت فهرست وکلا ناموفق بود.',
          )
        } finally {
          setDirectoryLoading(
            false,
          )
        }
      },

      [],
    )


  /*
   * Backend فعلی Directory را فقط
   * برای role=CLIENT باز کرده.
   *
   * بنابراین Guest درخواست API نمی‌زند.
   */
useEffect(
  () => {
    void loadDirectory()
  },

  [
    loadDirectory,
  ],
)


  const specialties =
    useMemo(
      () =>
        getLawyerSpecialties(
          directoryLawyers,
        ),

      [
        directoryLawyers,
      ],
    )


  const lawyers =
    useMemo(
      () =>
        filterLawyers(
          directoryLawyers,

          filters,
        ),

      [
        directoryLawyers,

        filters,
      ],
    )


  const licensedCount =
    useMemo(
      () =>
        directoryLawyers.filter(
          (
            lawyer,
          ) =>
            Boolean(
              lawyer.licenseNumber,
            ),
        ).length,

      [
        directoryLawyers,
      ],
    )


  const activeFilterCount =
    filters.specialty
      ? 1
      : 0


  const updateFilter = <
    K extends keyof LawyerDirectoryFilters,
  >(
    key:
      K,

    value:
      LawyerDirectoryFilters[K],
  ) => {
    setFilters(
      (
        current,
      ) => ({
        ...current,

        [key]:
          value,
      }),
    )
  }


  const resetFilters =
    () => {
      setFilters({
        ...DEFAULT_FILTERS,
      })
    }


  return (
    <>
      <main
        dir="rtl"
        className="min-h-dvh bg-slate-100 text-slate-950"
      >
        <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <Link
              href="/client-portal"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 font-black text-white shadow-md shadow-emerald-200">
                د
              </div>

              <div>
                <p className="font-black">
                  دادیار
                </p>

                <p className="text-xs font-semibold text-slate-500">
                  خدمات موکلین
                </p>
              </div>
            </Link>

            {account ? (
              <div className="flex items-center gap-2">
                <div className="hidden text-left lg:block">
                  <p className="text-[10px] font-bold text-slate-500">
                    حساب موکل
                  </p>

                  <p className="text-xs font-black text-slate-800">
                    {account.fullName ||
                      account.phone ||
                      'موکل دادیار'}
                  </p>
                </div>

                <Link
                  href="/client-portal/requests"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 sm:w-auto sm:px-3"
                  title="درخواست‌های من"
                >
                  <ListChecks
                    size={16}
                  />

                  <span className="mr-2 hidden xl:inline">
                    درخواست‌ها
                  </span>
                </Link>

                <Link
                  href="/client-portal/petitions"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 sm:w-auto sm:px-3"
                  title="لوایح من"
                >
                  <PenLine
                    size={16}
                  />

                  <span className="mr-2 hidden xl:inline">
                    لوایح
                  </span>
                </Link>

                <Link
                  href="/client-portal/contracts"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 sm:w-auto sm:px-3"
                  title="قراردادهای من"
                >
                  <FileText
                    size={16}
                  />

                  <span className="mr-2 hidden xl:inline">
                    قراردادها
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={
                    clearClientPortalSession
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="خروج"
                >
                  <LogOut
                    size={17}
                  />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/client-login?returnTo=/client-portal&mode=login"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black text-slate-700"
                >
                  <LogIn
                    size={16}
                  />

                  ورود
                </Link>

                <Link
                  href="/client-login?returnTo=/client-portal&mode=register"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-black text-white"
                >
                  <UserPlus
                    size={16}
                  />

                  <span className="hidden sm:inline">
                    ثبت‌نام
                  </span>
                </Link>
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
          <ClientServiceHub
            account={
              account
            }
          />

          <section
            id="lawyers"
            className="relative mt-6 scroll-mt-24 overflow-hidden rounded-[28px] border border-blue-200 bg-gradient-to-l from-blue-50 via-white to-emerald-50 p-6 shadow-sm sm:p-8 lg:p-10"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

              <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-emerald-200/25 blur-3xl" />
            </div>

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-black text-blue-700">
                <UsersRound
                  size={15}
                />

                وکلای منتشرشده در دادیار
              </span>

              <h1 className="mt-4 max-w-3xl text-3xl font-black leading-[1.4] sm:text-4xl">
                وکیل موردنظرت را انتخاب کن و{' '}
                <span className="text-blue-700">
                  مستقیم درخواست بفرست
                </span>
              </h1>

            
            

              <div className="mt-7 max-w-3xl">
                <div className="relative">
                  <Search
                    size={21}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                    <input
                      value={
                        filters.search
                      }
                      onChange={(
                        event,
                      ) =>
                        updateFilter(
                          'search',

                          event.target.value,
                        )
                      }
                      type="search"
                      placeholder="نام وکیل، تخصص، شماره پروانه یا نشانی..."
                      className="h-14 w-full rounded-2xl border border-slate-300 bg-white pr-12 pl-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 sm:text-base"
                    />
                </div>
              </div>
            </div>
          </section>

          
            <>
              <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  label="وکلای منتشرشده"
                  value={
                    directoryLawyers.length
                  }
                  icon={
                    UsersRound
                  }
                />

                <StatCard
                  label="حوزه‌های تخصصی"
                  value={
                    specialties.length
                  }
                  icon={
                    BriefcaseBusiness
                  }
                />

                <StatCard
                  label="پروانه ثبت‌شده"
                  value={
                    licensedCount
                  }
                  icon={
                    ShieldCheck
                  }
                />

                <StatCard
                  label="قابل ارسال درخواست"
                  value={
                    directoryLawyers.length
                  }
                  icon={
                    ListChecks
                  }
                />
              </section>

              {directoryError && (
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {directoryError}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      void loadDirectory()
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-xs font-black text-red-700"
                  >
                    <RefreshCw
                      size={15}
                    />

                    تلاش دوباره
                  </button>
                </div>
              )}

              <div className="mt-7 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="hidden lg:block">
                  <div className="sticky top-24 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                    <FilterHeader
                      activeCount={
                        activeFilterCount
                      }
                      onReset={
                        resetFilters
                      }
                    />

                    <div className="mt-5 space-y-5">
                      <LawyerFilterFields
                        filters={
                          filters
                        }
                        specialties={
                          specialties
                        }
                        updateFilter={
                          updateFilter
                        }
                      />
                    </div>
                  </div>
                </aside>

                <section className="min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black sm:text-2xl">
                        انتخاب وکیل
                      </h2>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {lawyers.length.toLocaleString(
                          'fa-IR',
                        )}{' '}
                        نتیجه
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setShowMobileFilters(
                            true,
                          )
                        }
                        className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 lg:hidden"
                      >
                        <SlidersHorizontal
                          size={17}
                        />

                        فیلتر

                        {activeFilterCount >
                          0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
                            {activeFilterCount.toLocaleString(
                              'fa-IR',
                            )}
                          </span>
                        )}
                      </button>

                      <div className="relative">
                        <select
                          value={
                            filters.sort
                          }
                          onChange={(
                            event,
                          ) =>
                            updateFilter(
                              'sort',

                              event.target.value as LawyerDirectoryFilters['sort'],
                            )
                          }
                          className="h-11 appearance-none rounded-xl border border-slate-300 bg-white pr-4 pl-10 text-sm font-black text-slate-700 outline-none focus:border-blue-500"
                        >
                          <option value="recommended">
                            ترتیب دادیار
                          </option>

                          <option value="experience">
                            بیشترین سابقه
                          </option>
                        </select>

                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  {directoryLoading ? (
                    <div className="mt-5 flex min-h-72 items-center justify-center rounded-[24px] border border-slate-200 bg-white">
                      <Loader2
                        size={30}
                        className="animate-spin text-blue-600"
                      />
                    </div>
                  ) : lawyers.length >
                    0 ? (
                    <div className="mt-5 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {lawyers.map(
                        (
                          lawyer,
                        ) => (
                          <LawyerCard
                            key={
                              lawyer.id
                            }
                            lawyer={
                              lawyer
                            }
                            onContact={
                              setSelectedLawyer
                            }
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      onReset={
                        resetFilters
                      }
                    />
                  )}
                </section>
              </div>
            </>
          
        </div>
      </main>

      {showMobileFilters && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[90] flex items-end bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onMouseDown={() =>
            setShowMobileFilters(
              false,
            )
          }
        >
          <section
            onMouseDown={(
              event,
            ) =>
              event.stopPropagation()
            }
            className="max-h-[88dvh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <FilterHeader
                activeCount={
                  activeFilterCount
                }
                onReset={
                  resetFilters
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowMobileFilters(
                    false,
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100"
              >
                <X
                  size={19}
                />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <LawyerFilterFields
                filters={
                  filters
                }
                specialties={
                  specialties
                }
                updateFilter={
                  updateFilter
                }
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setShowMobileFilters(
                  false,
                )
              }
              className="mt-6 h-12 w-full rounded-xl bg-blue-600 text-sm font-black text-white"
            >
              نمایش{' '}
              {lawyers.length.toLocaleString(
                'fa-IR',
              )}{' '}
              نتیجه
            </button>
          </section>
        </div>
      )}

      <LawyerContactModal
        lawyer={
          selectedLawyer
        }
        onClose={() =>
          setSelectedLawyer(
            null,
          )
        }
      />
    </>
  )
}


function FilterHeader({
  activeCount,

  onReset,
}: {
  activeCount:
    number

  onReset:
    () => void
}) {
  return (
    <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <Filter
            size={18}
            className="text-blue-600"
          />

          <h3 className="font-black">
            فیلتر وکلا
          </h3>
        </div>

        {activeCount >
          0 && (
          <p className="mt-1 text-xs font-black text-blue-600">
            {activeCount.toLocaleString(
              'fa-IR',
            )}{' '}
            فیلتر فعال
          </p>
        )}
      </div>

      {activeCount >
        0 && (
        <button
          type="button"
          onClick={
            onReset
          }
          className="inline-flex items-center gap-1 text-xs font-black text-slate-500"
        >
          <RotateCcw
            size={14}
          />

          پاک کردن
        </button>
      )}
    </div>
  )
}


function LawyerFilterFields({
  filters,

  specialties,

  updateFilter,
}: {
  filters:
    LawyerDirectoryFilters

  specialties:
    string[]

  updateFilter: <
    K extends keyof LawyerDirectoryFilters,
  >(
    key:
      K,

    value:
      LawyerDirectoryFilters[K],
  ) => void
}) {
  return (
    <FilterField label="حوزه تخصصی">
      <select
        value={
          filters.specialty
        }
        onChange={(
          event,
        ) =>
          updateFilter(
            'specialty',

            event.target.value,
          )
        }
        className={
          filterSelectClass
        }
      >
        <option value="">
          همه تخصص‌ها
        </option>

        {specialties.map(
          (
            specialty,
          ) => (
            <option
              key={
                specialty
              }
              value={
                specialty
              }
            >
              {specialty}
            </option>
          ),
        )}
      </select>
    </FilterField>
  )
}


function FilterField({
  label,

  children,
}: {
  label:
    string

  children:
    ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      {children}
    </div>
  )
}


function EmptyState({
  onReset,
}: {
  onReset:
    () => void
}) {
  return (
    <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
      <Search
        size={25}
        className="mx-auto text-slate-400"
      />

      <h3 className="mt-4 text-lg font-black">
        وکیلی پیدا نشد
      </h3>

      <button
        type="button"
        onClick={
          onReset
        }
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
      >
        <RotateCcw
          size={17}
        />

        حذف فیلترها
      </button>
    </div>
  )
}


function StatCard({
  label,

  value,

  icon:
    Icon,
}: {
  label:
    string

  value:
    number

  icon:
    LucideIcon
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black text-slate-600">
        <Icon
          size={16}
          className="text-blue-600"
        />

        {label}
      </div>

      <p className="mt-3 text-2xl font-black">
        {value.toLocaleString(
          'fa-IR',
        )}
      </p>
    </article>
  )
}


const filterSelectClass =
  'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

