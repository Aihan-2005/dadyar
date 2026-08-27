'use client'

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import Link from 'next/link'

import {
  useRouter,
} from 'next/navigation'

import type {
  LucideIcon,
} from 'lucide-react'

import {
  BriefcaseBusiness,
  ChevronDown,
  Filter,
  LogOut,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  X,
} from 'lucide-react'

import LawyerCard from '@/components/client-portal/LawyerCard'

import LawyerContactModal from '@/components/client-portal/LawyerContactModal'

import {
  MOCK_LAWYERS,
} from '@/features/client-portal/data/mock-lawyers'

import {
  filterLawyers,
  getLawyerCities,
  getLawyerSpecialties,
} from '@/features/client-portal/utils/lawyer-filters'

import type {
  ClientPortalLawyer,
  LawyerDirectoryFilters,
} from '@/features/client-portal/types/lawyer'

import {
  clearTemporaryClientSession,
  hasValidTemporaryClientSession,
} from '@/features/client-portal/auth/client-session'



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
  const router =
    useRouter()

 
    


  const [
    isReady,
    setIsReady,
  ] =
    useState(
      false
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
      false
    )

  
    


  const [
    selectedLawyer,
    setSelectedLawyer,
  ] =
    useState<
      ClientPortalLawyer | null
    >(
      null
    )

  

  useEffect(() => {
    if (
      !hasValidTemporaryClientSession()
    ) {
      router.replace(
        '/client-login'
      )

      return
    }

    setIsReady(
      true
    )
  }, [
    router,
  ])

  


  const cities =
    useMemo(
      () =>
        getLawyerCities(
          MOCK_LAWYERS
        ),
      []
    )

  const specialties =
    useMemo(
      () =>
        getLawyerSpecialties(
          MOCK_LAWYERS
        ),
      []
    )

  
    

  const lawyers =
    useMemo(
      () =>
        filterLawyers(
          MOCK_LAWYERS,
          filters
        ),
      [
        filters,
      ]
    )

    


  const acceptingCount =
    useMemo(
      () =>
        MOCK_LAWYERS.filter(
          (
            lawyer
          ) =>
            lawyer.acceptsNewClients
        ).length,
      []
    )

  
    

  const activeFilterCount =
    [
      filters.city,

      filters.specialty,

      filters.consultationMode !==
        'all'
        ? filters.consultationMode
        : '',

      filters.acceptsNewClientsOnly
        ? 'accepting'
        : '',
    ].filter(
      Boolean
    ).length

  
    

  const updateFilter = <
    K extends keyof LawyerDirectoryFilters,
  >(
    key:
      K,

    value:
      LawyerDirectoryFilters[K]
  ) => {
    setFilters(
      (
        current
      ) => ({
        ...current,

        [key]:
          value,
      })
    )
  }

  
  

  const resetFilters =
    () => {
      setFilters({
        ...DEFAULT_FILTERS,
      })
    }

  
    


  const handleLogout =
    () => {
      clearTemporaryClientSession()

      router.replace(
        '/client-login'
      )
    }


    


  if (!isReady) {
    return (
      <main
        dir="rtl"
        className="flex h-dvh items-center justify-center overflow-hidden bg-slate-100"
      >
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-black text-white shadow-lg shadow-emerald-200">
            د
          </div>

          <p className="mt-4 text-sm font-bold text-slate-600">
            در حال آماده‌سازی پنل موکلین...
          </p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main
        dir="rtl"
        className="min-h-dvh bg-slate-100 text-slate-950"
      >
        


        <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Brand */}

            <Link
              href="/client-portal"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-black text-white shadow-md shadow-emerald-200">
                د
              </div>

              <div>
                <p className="font-black text-slate-950">
                  دادیار
                </p>

                <p className="text-xs font-semibold text-slate-500">
                  پنل موکلین
                </p>
              </div>
            </Link>

            {/* Beta */}

            <div className="hidden items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 md:flex">
              <ShieldCheck
                size={15}
              />

              نسخه آزمایشی
            </div>

            {/* Logout */}

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-black text-red-600 transition hover:bg-red-100"
            >
              <LogOut
                size={17}
              />

              <span className="hidden sm:inline">
                خروج
              </span>
            </button>
          </div>
        </header>



        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
            



          <section className="relative overflow-hidden rounded-[28px] border border-blue-200 bg-gradient-to-l from-blue-50 via-white to-emerald-50 p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

              <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-emerald-200/25 blur-3xl" />
            </div>

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-black text-blue-700">
                <UsersRound
                  size={15}
                />

                دایرکتوری وکلای دادیار
              </span>

              <h1 className="mt-4 max-w-3xl text-3xl font-black leading-[1.4] text-slate-950 sm:text-4xl">
                وکیل مناسب پرونده‌ات را
                {' '}

                <span className="text-blue-700">
                  راحت‌تر پیدا کن
                </span>
              </h1>

              <p className="mt-3 max-w-3xl text-sm font-semibold leading-8 text-slate-600 sm:text-base">
                وکلا را براساس شهر، حوزه
                تخصصی و روش مشاوره فیلتر کن،
                پروفایل آن‌ها را ببین و برای
                برقراری ارتباط با وکیل مورد
                نظر اقدام کن.
              </p>

              {/* Search */}

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
                      event
                    ) =>
                      updateFilter(
                        'search',
                        event.target.value
                      )
                    }
                    type="search"
                    placeholder="نام وکیل، تخصص یا شهر را جست‌وجو کنید..."
                    className="h-14 w-full rounded-2xl border border-slate-300 bg-white pr-12 pl-4 text-sm font-bold text-slate-950 shadow-sm outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-base"
                  />
                </div>
              </div>
            </div>
          </section>




          <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="وکلای موجود"
              value={
                MOCK_LAWYERS.length
              }
              icon={
                UsersRound
              }
            />

            <StatCard
              label="شهرهای فعال"
              value={
                cities.length
              }
              icon={
                MapPin
              }
            />

            <StatCard
              label="حوزه تخصصی"
              value={
                specialties.length
              }
              icon={
                BriefcaseBusiness
              }
            />

            <StatCard
              label="پذیرش فعال"
              value={
                acceptingCount
              }
              icon={
                ShieldCheck
              }
            />
          </section>
          



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
                    cities={
                      cities
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
              {/* Top */}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                    وکلای پیشنهادی
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {
                      lawyers.length.toLocaleString(
                        'fa-IR'
                      )
                    }
                    {' '}
                    نتیجه پیدا شد
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile Filter */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowMobileFilters(
                        true
                      )
                    }
                    className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 shadow-sm lg:hidden"
                  >
                    <SlidersHorizontal
                      size={17}
                    />

                    فیلتر

                    {activeFilterCount >
                      0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-black text-white">
                        {
                          activeFilterCount.toLocaleString(
                            'fa-IR'
                          )
                        }
                      </span>
                    )}
                  </button>

                  {/* Sort */}

                  <div className="relative">
                    <select
                      value={
                        filters.sort
                      }
                      onChange={(
                        event
                      ) =>
                        updateFilter(
                          'sort',

                          event.target
                            .value as LawyerDirectoryFilters['sort']
                        )
                      }
                      className="h-11 appearance-none rounded-xl border border-slate-300 bg-white pr-4 pl-10 text-sm font-black text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="recommended">
                        پیشنهادی
                      </option>

                      <option value="rating">
                        بالاترین امتیاز
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

              {/* Active Filters */}

              {activeFilterCount >
                0 && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-xs font-bold text-blue-800 sm:text-sm">
                    {
                      activeFilterCount.toLocaleString(
                        'fa-IR'
                      )
                    }
                    {' '}
                    فیلتر فعال است
                  </p>

                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-black text-blue-700"
                  >
                    <RotateCcw
                      size={14}
                    />

                    پاک کردن
                  </button>
                </div>
              )}

              {/* Lawyers */}

              {lawyers.length >
              0 ? (
                <div className="mt-5 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {lawyers.map(
                    (
                      lawyer
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
                    )
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
          

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <div>
                <p className="text-sm font-black text-amber-900">
                  اطلاعات این صفحه فعلاً آزمایشی است
                </p>

                <p className="mt-1 text-xs font-semibold leading-6 text-amber-800">
                  نام‌ها، شماره تماس‌ها،
                  امتیازها و اطلاعات وکلا
                  Mock هستند. بعد از تکمیل
                  Backend، همین رابط به
                  اطلاعات واقعی وکلا متصل
                  می‌شود.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      


      {showMobileFilters && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[90] flex items-end bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onMouseDown={() =>
            setShowMobileFilters(
              false
            )
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="فیلتر وکلا"
            onMouseDown={(
              event
            ) => {
              event.stopPropagation()
            }}
            className="max-h-[88dvh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
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
                aria-label="بستن فیلترها"
                onClick={() =>
                  setShowMobileFilters(
                    false
                  )
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
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
                cities={
                  cities
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
                  false
                )
              }
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-sm font-black text-white"
            >
              نمایش
              {' '}
              {
                lawyers.length.toLocaleString(
                  'fa-IR'
                )
              }
              {' '}
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
            null
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

          <h3 className="font-black text-slate-950">
            فیلتر وکلا
          </h3>
        </div>

        <p className="mt-1 text-xs font-semibold text-slate-500">
          نتایج را دقیق‌تر کنید
        </p>

        {activeCount >
          0 && (
          <p className="mt-1 text-xs font-black text-blue-600">
            {
              activeCount.toLocaleString(
                'fa-IR'
              )
            }
            {' '}
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
          className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-slate-500 transition hover:text-red-600"
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
  cities,
  specialties,
  updateFilter,
}: {
  filters:
    LawyerDirectoryFilters

  cities:
    string[]

  specialties:
    string[]

  updateFilter: <
    K extends keyof LawyerDirectoryFilters,
  >(
    key:
      K,

    value:
      LawyerDirectoryFilters[K]
  ) => void
}) {
  return (
    <>
      {/* City */}

      <FilterField label="شهر">
        <div className="relative">
          <select
            value={
              filters.city
            }
            onChange={(
              event
            ) =>
              updateFilter(
                'city',
                event.target.value
              )
            }
            className={
              filterSelectClass
            }
          >
            <option value="">
              همه شهرها
            </option>

            {cities.map(
              (
                city
              ) => (
                <option
                  key={
                    city
                  }
                  value={
                    city
                  }
                >
                  {city}
                </option>
              )
            )}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </FilterField>

      {/* Specialty */}

      <FilterField label="حوزه تخصصی">
        <div className="relative">
          <select
            value={
              filters.specialty
            }
            onChange={(
              event
            ) =>
              updateFilter(
                'specialty',
                event.target.value
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
                specialty
              ) => (
                <option
                  key={
                    specialty
                  }
                  value={
                    specialty
                  }
                >
                  {
                    specialty
                  }
                </option>
              )
            )}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </FilterField>

      {/* Consultation */}

      <FilterField label="نوع مشاوره">
        <div className="relative">
          <select
            value={
              filters.consultationMode
            }
            onChange={(
              event
            ) =>
              updateFilter(
                'consultationMode',

                event.target
                  .value as LawyerDirectoryFilters['consultationMode']
              )
            }
            className={
              filterSelectClass
            }
          >
            <option value="all">
              همه روش‌ها
            </option>

            <option value="in_person">
              حضوری
            </option>

            <option value="phone">
              تلفنی
            </option>

            <option value="online">
              آنلاین
            </option>
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </FilterField>

      {/* Accepting */}

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/40">
        <input
          type="checkbox"
          checked={
            filters.acceptsNewClientsOnly
          }
          onChange={(
            event
          ) =>
            updateFilter(
              'acceptsNewClientsOnly',
              event.target.checked
            )
          }
          className="mt-0.5 h-4 w-4 accent-blue-600"
        />

        <div>
          <p className="text-sm font-black text-slate-800">
            فقط پذیرش فعال
          </p>

          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
            فقط وکلایی که در حال حاضر
            موکل جدید می‌پذیرند
          </p>
        </div>
      </label>
    </>
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
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Search
          size={25}
        />
      </div>

      <h3 className="mt-4 text-lg font-black text-slate-950">
        وکیلی با این مشخصات پیدا نشد
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-7 text-slate-500">
        عبارت جست‌وجو یا فیلترها را تغییر
        بده و دوباره امتحان کن.
      </p>

      <button
        type="button"
        onClick={
          onReset
        }
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
      >
        <RotateCcw
          size={17}
        />

        حذف همه فیلترها
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
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2 text-xs font-black text-slate-600 sm:text-sm">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon
            size={16}
          />
        </div>

        <span>
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
        {
          value.toLocaleString(
            'fa-IR'
          )
        }
      </p>
    </article>
  )
}





const filterSelectClass =
  'h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white pr-3 pl-9 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'