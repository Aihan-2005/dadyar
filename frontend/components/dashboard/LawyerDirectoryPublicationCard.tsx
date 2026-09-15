'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'

import {
  getLawyerDirectoryPublicationState,
  setLawyerDirectoryVisibility,
  subscribeLawyerProfileChanges,
} from '@/services/lawyer.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  LawyerDirectoryBlockedReason,
  LawyerDirectoryPublicationState,
} from '@/types/lawyer'


function formatPublishedAt(
  value:
    string | null,
): string {
  if (
    !value
  ) {
    return '—'
  }


  const date =
    new Date(
      value,
    )


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }


  return new Intl.DateTimeFormat(
    'fa-IR',

    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    },
  ).format(
    date,
  )
}


function getBlockedMessage(
  reason:
    LawyerDirectoryBlockedReason | null,
): string | null {
  switch (
    reason
  ) {
    case 'LAWYER_SUSPENDED':
      return 'حساب حرفه‌ای شما تعلیق شده است و تا رفع تعلیق امکان انتشار پروفایل وجود ندارد.'

    case 'LAWYER_REJECTED':
      return 'این حساب در وضعیت ردشده قرار دارد و امکان انتشار پروفایل وجود ندارد.'

    case 'ACCOUNT_NOT_ACTIVE':
      return 'حساب کاربری شما فعال نیست و در حال حاضر امکان انتشار پروفایل وجود ندارد.'

    default:
      return null
  }
}


export default function LawyerDirectoryPublicationCard() {
  const user =
    useAuthStore(
      (
        state,
      ) =>
        state.user,
    )


  const hasHydrated =
    useAuthStore(
      (
        state,
      ) =>
        state.hasHydrated,
    )


  const [
    state,
    setState,
  ] =
    useState<LawyerDirectoryPublicationState | null>(
      null,
    )


  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    )


  const [
    changing,
    setChanging,
  ] =
    useState(
      false,
    )


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )


  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null,
    )


  const load =
    useCallback(
      async () => {
        if (
          !hasHydrated ||
          user?.role !==
            'LAWYER'
        ) {
          return
        }


        try {
          setLoading(
            true,
          )

          setError(
            null,
          )


          const result =
            await getLawyerDirectoryPublicationState()


          setState(
            result,
          )
        } catch (
          caughtError:
            unknown
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت وضعیت انتشار پروفایل ناموفق بود.',
          )
        } finally {
          setLoading(
            false,
          )
        }
      },

      [
        hasHydrated,
        user?.role,
      ],
    )


  useEffect(
    () => {
      void load()
    },

    [
      load,
    ],
  )


  /*
   * هر بار پروفایل در همان صفحه Save شود،
   * وضعیت completeness دوباره دریافت می‌شود.
   */
  useEffect(
    () =>
      subscribeLawyerProfileChanges(
        () => {
          setSuccess(
            null,
          )

          void load()
        },
      ),

    [
      load,
    ],
  )


  async function toggleVisibility() {
    if (
      !state ||
      changing
    ) {
      return
    }


    const nextVisible =
      !state.isVisible


    try {
      setChanging(
        true,
      )

      setError(
        null,
      )

      setSuccess(
        null,
      )


      const updated =
        await setLawyerDirectoryVisibility(
          nextVisible,
        )


      setState(
        updated,
      )


      setSuccess(
        nextVisible
          ? 'پروفایل شما در بخش موکلین منتشر شد.'
          : 'پروفایل شما از بخش موکلین حذف شد.',
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'تغییر وضعیت انتشار پروفایل ناموفق بود.',
      )

      void load()
    } finally {
      setChanging(
        false,
      )
    }
  }


  if (
    !hasHydrated ||
    user?.role !==
      'LAWYER'
  ) {
    return null
  }


  const blockedMessage =
    getBlockedMessage(
      state?.blockedReason ??
      null,
    )


  return (
    <section
      dir="rtl"
      className="mx-auto mb-6 max-w-7xl overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-l from-blue-50 via-white to-emerald-50 shadow-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-blue-700">
              <Sparkles
                size={19}
              />

              <span className="text-xs font-black">
                نمایش پروفایل برای موکلین
              </span>
            </div>

            <h2 className="mt-2 text-xl font-black text-slate-950">
              {state?.isVisible
                ? 'پروفایل شما در بخش موکلین نمایش داده می‌شود'
                : 'پس از تکمیل پروفایل، خودتان آن را منتشر کنید'}
            </h2>

            <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
              اطلاعاتی که در پروفایل وکیل ذخیره می‌کنید، بعد از انتشار همان اطلاعاتی هستند که موکل در کارت و پروفایل شما می‌بیند. تغییرات معتبر بعدی نیز مستقیم روی همان اطلاعات اعمال می‌شوند.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            disabled={
              loading ||
              changing
            }
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            />

            بروزرسانی وضعیت
          </button>
        </div>

        {loading ? (
          <div className="mt-5 flex min-h-24 items-center justify-center rounded-2xl border border-slate-200 bg-white/80">
            <Loader2
              size={22}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
            {error}
          </div>
        ) : state ? (
          <div className="mt-5 space-y-4">
            {success && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                <CheckCircle2
                  size={18}
                />

                {success}
              </div>
            )}

            {blockedMessage && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-7 text-red-700">
                <ShieldAlert
                  size={20}
                  className="mt-1 shrink-0"
                />

                {blockedMessage}
              </div>
            )}

            {state.isVisible ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Eye
                        size={18}
                      />

                      <p className="text-sm font-black">
                        پروفایل منتشر شده است
                      </p>
                    </div>

                    <p className="mt-2 text-xs font-semibold leading-6 text-emerald-800">
                      تاریخ انتشار:{' '}
                      {formatPublishedAt(
                        state.publishedAt,
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void toggleVisibility()
                    }
                    disabled={
                      changing
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-xs font-black text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {changing ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <EyeOff
                        size={16}
                      />
                    )}

                    حذف از بخش موکلین
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 sm:p-5">
                {state.profileComplete ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle2
                          size={18}
                        />

                        <p className="text-sm font-black">
                          پروفایل برای انتشار آماده است
                        </p>
                      </div>

                      <p className="mt-2 text-xs font-semibold leading-6 text-slate-600">
                        با تأیید شما، پروفایل بلافاصله در فهرست وکلای بخش موکلین قرار می‌گیرد.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void toggleVisibility()
                      }
                      disabled={
                        changing ||
                        !state.canPublish
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {changing ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Eye
                          size={16}
                        />
                      )}

                      تأیید و نمایش در بخش موکلین
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      برای فعال‌شدن دکمه انتشار، این موارد را کامل کنید:
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {state.missingFields.map(
                        (
                          field,
                        ) => (
                          <span
                            key={
                              field.key
                            }
                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-black text-amber-800"
                          >
                            {field.label}
                          </span>
                        ),
                      )}
                    </div>

                    <button
                      type="button"
                      disabled
                      className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-300 px-5 text-xs font-black text-slate-600"
                    >
                      <Eye
                        size={16}
                      />

                      ابتدا پروفایل را کامل کنید
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}