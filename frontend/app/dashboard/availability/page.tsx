'use client'

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Edit3,
  Laptop,
  Loader2,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react'

import {
  createLawyerAvailability,
  deleteLawyerAvailability,
  getLawyerAvailability,
  updateLawyerAvailability,
} from '@/services/lawyer-availability.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import type {
  ConsultationType,
} from '@/types/consultation-booking'

import type {
  LawyerAvailability,
} from '@/types/lawyer-availability'


const CONSULTATION_OPTIONS:
  Array<{
    value:
      ConsultationType

    label:
      string

    icon:
      typeof Laptop
  }> = [
    {
      value:
        'ONLINE',

      label:
        'آنلاین',

      icon:
        Laptop,
    },

    {
      value:
        'PHONE',

      label:
        'تلفنی',

      icon:
        Phone,
    },

    {
      value:
        'IN_PERSON',

      label:
        'حضوری',

      icon:
        MapPin,
    },
  ]


function addDays(
  date:
    Date,

  days:
    number,
): Date {
  return new Date(
    date.getTime() +
      days *
        24 *
        60 *
        60 *
        1000,
  )
}


function toLocalDateTimeInput(
  iso:
    string,
): string {
  const date =
    new Date(
      iso,
    )

  const pad = (
    value:
      number,
  ) =>
    String(
      value,
    ).padStart(
      2,

      '0',
    )

  return `${date.getFullYear()}-${pad(
    date.getMonth() +
      1,
  )}-${pad(
    date.getDate(),
  )}T${pad(
    date.getHours(),
  )}:${pad(
    date.getMinutes(),
  )}`
}


function toIso(
  value:
    string,
): string {
  const date =
    new Date(
      value,
    )

  if (
    !value ||
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new Error(
      'تاریخ یا ساعت واردشده معتبر نیست.',
    )
  }

  return date.toISOString()
}


function formatFullDate(
  iso:
    string,
): string {
  const date =
    new Date(
      iso,
    )

  return new Intl.DateTimeFormat(
    'fa-IR',

    {
      dateStyle:
        'full',
    },
  ).format(
    date,
  )
}


function formatTime(
  iso:
    string,
): string {
  return new Intl.DateTimeFormat(
    'fa-IR',

    {
      hour:
        '2-digit',

      minute:
        '2-digit',

      hour12:
        false,
    },
  ).format(
    new Date(
      iso,
    ),
  )
}


function durationMinutes(
  startsAt:
    string,

  endsAt:
    string,
): number {
  return Math.round(
    (
      new Date(
        endsAt,
      ).getTime() -
      new Date(
        startsAt,
      ).getTime()
    ) /
      60_000,
  )
}


function nextDefaultStart(): Date {
  const date =
    new Date()

  date.setSeconds(
    0,

    0,
  )

  const minutes =
    date.getMinutes()

  if (
    minutes === 0
  ) {
    date.setHours(
      date.getHours() +
        1,
    )
  } else if (
    minutes <=
    30
  ) {
    date.setMinutes(
      30,
    )
  } else {
    date.setHours(
      date.getHours() +
        1,
    )

    date.setMinutes(
      0,
    )
  }

  return date
}


function createInitialForm() {
  const start =
    nextDefaultStart()

  const end =
    new Date(
      start.getTime() +
        30 *
          60_000,
    )

  return {
    startsAt:
      toLocalDateTimeInput(
        start.toISOString(),
      ),

    endsAt:
      toLocalDateTimeInput(
        end.toISOString(),
      ),

    consultationTypes:
      [
        'ONLINE',
      ] as ConsultationType[],

    note:
      '',

    isActive:
      true,
  }
}


export default function LawyerAvailabilityPage() {
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
    items,

    setItems,
  ] =
    useState<LawyerAvailability[]>(
      [],
    )

  const [
    loading,

    setLoading,
  ] =
    useState(
      true,
    )

  const [
    error,

    setError,
  ] =
    useState<
      string | null
    >(
      null,
    )

  const [
    success,

    setSuccess,
  ] =
    useState<
      string | null
    >(
      null,
    )

  const [
    editingId,

    setEditingId,
  ] =
    useState<
      string | null
    >(
      null,
    )

  const [
    form,

    setForm,
  ] =
    useState(
      createInitialForm,
    )

  const [
    saving,

    setSaving,
  ] =
    useState(
      false,
    )

  const [
    deletingId,

    setDeletingId,
  ] =
    useState<
      string | null
    >(
      null,
    )

  const [
    togglingId,

    setTogglingId,
  ] =
    useState<
      string | null
    >(
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

          const from =
            new Date()

          const result =
            await getLawyerAvailability({
              from:
                from.toISOString(),

              to:
                addDays(
                  from,

                  180,
                ).toISOString(),

              includeInactive:
                true,
            })

          setItems(
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
              : 'دریافت زمان‌های آزاد ناموفق بود.',
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


  const stats =
    useMemo(
      () => ({
        total:
          items.length,

        active:
          items.filter(
            (
              item,
            ) =>
              item.isActive &&
              !item.isReserved,
          ).length,

        reserved:
          items.filter(
            (
              item,
            ) =>
              item.isReserved,
          ).length,

        inactive:
          items.filter(
            (
              item,
            ) =>
              !item.isActive &&
              !item.isReserved,
          ).length,
      }),

      [
        items,
      ],
    )


  function resetEditor() {
    setEditingId(
      null,
    )

    setForm(
      createInitialForm(),
    )
  }


  function editItem(
    item:
      LawyerAvailability,
  ) {
    if (
      item.isReserved
    ) {
      return
    }

    setEditingId(
      item.id,
    )

    setForm({
      startsAt:
        toLocalDateTimeInput(
          item.startsAt,
        ),

      endsAt:
        toLocalDateTimeInput(
          item.endsAt,
        ),

      consultationTypes:
        [
          ...item.consultationTypes,
        ],

      note:
        item.note,

      isActive:
        item.isActive,
    })

    setError(
      null,
    )

    setSuccess(
      null,
    )

    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    })
  }


  function toggleConsultationType(
    type:
      ConsultationType,
  ) {
    setForm(
      (
        current,
      ) => {
        const exists =
          current.consultationTypes.includes(
            type,
          )

        if (
          exists
        ) {
          if (
            current.consultationTypes.length ===
            1
          ) {
            return current
          }

          return {
            ...current,

            consultationTypes:
              current.consultationTypes.filter(
                (
                  item,
                ) =>
                  item !==
                  type,
              ),
          }
        }

        return {
          ...current,

          consultationTypes: [
            ...current.consultationTypes,

            type,
          ],
        }
      },
    )
  }


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      saving
    ) {
      return
    }

    try {
      setSaving(
        true,
      )

      setError(
        null,
      )

      setSuccess(
        null,
      )

      const startsAt =
        toIso(
          form.startsAt,
        )

      const endsAt =
        toIso(
          form.endsAt,
        )

      const startDate =
        new Date(
          startsAt,
        )

      const endDate =
        new Date(
          endsAt,
        )

      const minutes =
        (
          endDate.getTime() -
          startDate.getTime()
        ) /
        60_000

      if (
        startDate.getTime() <=
        Date.now()
      ) {
        throw new Error(
          'زمان شروع باید در آینده باشد.',
        )
      }

      if (
        minutes <
          15 ||
        minutes >
          180
      ) {
        throw new Error(
          'مدت زمان مشاوره باید بین ۱۵ تا ۱۸۰ دقیقه باشد.',
        )
      }

      if (
        form.consultationTypes.length ===
        0
      ) {
        throw new Error(
          'حداقل یک نوع مشاوره را انتخاب کنید.',
        )
      }

      if (
        editingId
      ) {
        const updated =
          await updateLawyerAvailability(
            editingId,

            {
              startsAt,

              endsAt,

              consultationTypes:
                form.consultationTypes,

              note:
                form.note.trim(),

              isActive:
                form.isActive,
            },
          )

        setItems(
          (
            current,
          ) =>
            current
              .map(
                (
                  item,
                ) =>
                  item.id ===
                  updated.id
                    ? updated
                    : item,
              )
              .sort(
                (
                  first,

                  second,
                ) =>
                  new Date(
                    first.startsAt,
                  ).getTime() -
                  new Date(
                    second.startsAt,
                  ).getTime(),
              ),
        )

        setSuccess(
          'زمان مشاوره با موفقیت ویرایش شد.',
        )
      } else {
        const created =
          await createLawyerAvailability({
            startsAt,

            endsAt,

            consultationTypes:
              form.consultationTypes,

            note:
              form.note.trim(),

            isActive:
              form.isActive,
          })

        setItems(
          (
            current,
          ) =>
            [
              ...current,

              created,
            ].sort(
              (
                first,

                second,
              ) =>
                new Date(
                  first.startsAt,
                ).getTime() -
                new Date(
                  second.startsAt,
                ).getTime(),
            ),
        )

        setSuccess(
          'زمان آزاد جدید ثبت شد.',
        )
      }

      resetEditor()
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'ثبت زمان آزاد ناموفق بود.',
      )
    } finally {
      setSaving(
        false,
      )
    }
  }


  async function handleDelete(
    item:
      LawyerAvailability,
  ) {
    if (
      item.isReserved ||
      deletingId
    ) {
      return
    }

    try {
      setDeletingId(
        item.id,
      )

      setError(
        null,
      )

      setSuccess(
        null,
      )

      await deleteLawyerAvailability(
        item.id,
      )

      setItems(
        (
          current,
        ) =>
          current.filter(
            (
              candidate,
            ) =>
              candidate.id !==
              item.id,
          ),
      )

      if (
        editingId ===
        item.id
      ) {
        resetEditor()
      }

      setSuccess(
        'زمان مشاوره حذف شد.',
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'حذف زمان مشاوره ناموفق بود.',
      )
    } finally {
      setDeletingId(
        null,
      )
    }
  }


  async function handleToggleActive(
    item:
      LawyerAvailability,
  ) {
    if (
      item.isReserved ||
      togglingId
    ) {
      return
    }

    try {
      setTogglingId(
        item.id,
      )

      setError(
        null,
      )

      setSuccess(
        null,
      )

      const updated =
        await updateLawyerAvailability(
          item.id,

          {
            isActive:
              !item.isActive,
          },
        )

      setItems(
        (
          current,
        ) =>
          current.map(
            (
              candidate,
            ) =>
              candidate.id ===
              updated.id
                ? updated
                : candidate,
          ),
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'تغییر وضعیت زمان مشاوره ناموفق بود.',
      )
    } finally {
      setTogglingId(
        null,
      )
    }
  }


  if (
    !hasHydrated
  ) {
    return (
      <PageLoader />
    )
  }


  if (
    !user ||
    user.role !==
      'LAWYER'
  ) {
    return (
      <div
        dir="rtl"
        className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <CalendarClock
          size={36}
          className="mx-auto text-slate-400"
        />

        <h1 className="mt-4 text-xl font-black text-slate-950">
          دسترسی غیرمجاز
        </h1>

        <p className="mt-2 text-sm font-semibold text-slate-600">
          مدیریت زمان‌های آزاد فقط برای حساب وکیل فعال است.
        </p>
      </div>
    )
  }


  return (
    <div dir="rtl">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
            زمان‌های آزاد مشاوره
          </h1>

          <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
            بازه‌هایی را ثبت کنید که موکل بتواند برای مشاوره انتخاب کند. زمان رزروشده قفل می‌شود و تا لغو یا رد رزرو قابل ویرایش و حذف نیست.
          </p>
        </div>

        <button
          type="button"
          disabled={
            loading
          }
          onClick={() =>
            void load()
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? 'animate-spin'
                : ''
            }
          />

          بروزرسانی
        </button>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="همه زمان‌ها"
          value={
            stats.total
          }
        />

        <StatCard
          label="آزاد و فعال"
          value={
            stats.active
          }
        />

        <StatCard
          label="رزروشده"
          value={
            stats.reserved
          }
        />

        <StatCard
          label="غیرفعال"
          value={
            stats.inactive
          }
        />
      </section>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-7 text-emerald-700">
          {success}
        </div>
      )}

      <div className="mt-7 grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <section className="xl:sticky xl:top-24 xl:self-start">
          <form
            onSubmit={
              handleSubmit
            }
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-blue-600">
                  {editingId
                    ? 'ویرایش بازه'
                    : 'بازه جدید'}
                </p>

                <h2 className="mt-1 text-lg font-black text-slate-950">
                  {editingId
                    ? 'ویرایش زمان مشاوره'
                    : 'ثبت زمان آزاد'}
                </h2>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    resetEditor
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                  aria-label="لغو ویرایش"
                >
                  <X
                    size={18}
                  />
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-4">
              <label>
                <span className="text-xs font-black text-slate-700">
                  شروع
                </span>

                <input
                  type="datetime-local"
                  value={
                    form.startsAt
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        startsAt:
                          event.target.value,
                      }),
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label>
                <span className="text-xs font-black text-slate-700">
                  پایان
                </span>

                <input
                  type="datetime-local"
                  value={
                    form.endsAt
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        endsAt:
                          event.target.value,
                      }),
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </div>

            <fieldset className="mt-5">
              <legend className="text-xs font-black text-slate-700">
                نوع‌های مجاز برای این بازه
              </legend>

              <div className="mt-2 grid grid-cols-3 gap-2">
                {CONSULTATION_OPTIONS.map(
                  (
                    option,
                  ) => {
                    const Icon =
                      option.icon

                    const active =
                      form.consultationTypes.includes(
                        option.value,
                      )

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() =>
                          toggleConsultationType(
                            option.value,
                          )
                        }
                        className={`rounded-xl border px-2 py-3 text-center text-[11px] font-black transition ${
                          active
                            ? 'border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                            : 'border-slate-200 bg-white text-slate-500'
                        }`}
                      >
                        <Icon
                          size={17}
                          className="mx-auto"
                        />

                        <span className="mt-1 block">
                          {option.label}
                        </span>
                      </button>
                    )
                  },
                )}
              </div>
            </fieldset>

            <label className="mt-5 block">
              <span className="text-xs font-black text-slate-700">
                یادداشت اختیاری
              </span>

              <textarea
                value={
                  form.note
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      note:
                        event.target.value,
                    }),
                  )
                }
                maxLength={1000}
                rows={4}
                placeholder="مثلاً جلسه آنلاین ۳۰ دقیقه‌ای..."
                className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-black text-slate-800">
                  قابل رزرو برای موکل
                </p>

                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  در حالت غیرفعال این بازه برای موکل نمایش داده نمی‌شود.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  form.isActive
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      isActive:
                        event.target.checked,
                    }),
                  )
                }
                className="h-5 w-5 accent-blue-600"
              />
            </label>

            <button
              type="submit"
              disabled={
                saving
              }
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : editingId ? (
                <Save
                  size={17}
                />
              ) : (
                <Plus
                  size={17}
                />
              )}

              {editingId
                ? 'ذخیره تغییرات'
                : 'ثبت زمان آزاد'}
            </button>
          </form>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-950">
              برنامه ثبت‌شده
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              تا ۱۸۰ روز آینده
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white">
              <Loader2
                size={28}
                className="animate-spin text-blue-600"
              />
            </div>
          ) : items.length ===
            0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <CalendarClock
                size={36}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-4 font-black text-slate-800">
                هنوز زمان آزادی ثبت نکرده‌اید
              </h3>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(
                (
                  item,
                ) => (
                  <AvailabilityCard
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                    deleting={
                      deletingId ===
                      item.id
                    }
                    toggling={
                      togglingId ===
                      item.id
                    }
                    onEdit={() =>
                      editItem(
                        item,
                      )
                    }
                    onDelete={() =>
                      void handleDelete(
                        item,
                      )
                    }
                    onToggleActive={() =>
                      void handleToggleActive(
                        item,
                      )
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}


function AvailabilityCard({
  item,

  deleting,

  toggling,

  onEdit,

  onDelete,

  onToggleActive,
}: {
  item:
    LawyerAvailability

  deleting:
    boolean

  toggling:
    boolean

  onEdit:
    () => void

  onDelete:
    () => void

  onToggleActive:
    () => void
}) {
  const minutes =
    durationMinutes(
      item.startsAt,

      item.endsAt,
    )

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {item.isReserved ? (
              <StatusBadge className="border-violet-200 bg-violet-50 text-violet-700">
                رزروشده
              </StatusBadge>
            ) : item.isActive ? (
              <StatusBadge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                آزاد و فعال
              </StatusBadge>
            ) : (
              <StatusBadge className="border-slate-200 bg-slate-100 text-slate-600">
                غیرفعال
              </StatusBadge>
            )}

            <span className="text-[11px] font-bold text-slate-400">
              {minutes.toLocaleString(
                'fa-IR',
              )}{' '}
              دقیقه
            </span>
          </div>

          <h3 className="mt-3 font-black text-slate-950">
            {formatFullDate(
              item.startsAt,
            )}
          </h3>

          <p
            dir="ltr"
            className="mt-2 text-lg font-black text-blue-700"
          >
            {formatTime(
              item.startsAt,
            )}{' '}
            -{' '}
            {formatTime(
              item.endsAt,
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!item.isReserved && (
            <>
              <button
                type="button"
                onClick={
                  onEdit
                }
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 text-[11px] font-black text-blue-700"
              >
                <Edit3
                  size={14}
                />

                ویرایش
              </button>

              <button
                type="button"
                onClick={
                  onToggleActive
                }
                disabled={
                  toggling
                }
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-600 disabled:opacity-60"
              >
                {toggling ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCircle2
                    size={14}
                  />
                )}

                {item.isActive
                  ? 'غیرفعال'
                  : 'فعال'}
              </button>

              <button
                type="button"
                onClick={
                  onDelete
                }
                disabled={
                  deleting
                }
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-[11px] font-black text-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2
                    size={14}
                  />
                )}

                حذف
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.consultationTypes.map(
          (
            type,
          ) => (
            <span
              key={
                type
              }
              className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700"
            >
              {type ===
              'ONLINE'
                ? 'آنلاین'
                : type ===
                    'PHONE'
                  ? 'تلفنی'
                  : 'حضوری'}
            </span>
          ),
        )}
      </div>

      {item.note && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-medium leading-7 text-slate-600">
          {item.note}
        </div>
      )}

      {item.isReserved && (
        <p className="mt-4 text-xs font-bold leading-6 text-violet-700">
          این بازه به یک رزرو متصل است و تا زمان لغو یا رد رزرو قابل ویرایش یا حذف نیست.
        </p>
      )}
    </article>
  )
}


function StatusBadge({
  className,

  children,
}: {
  className:
    string

  children:
    React.ReactNode
}) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${className}`}
    >
      {children}
    </span>
  )
}


function StatCard({
  label,

  value,
}: {
  label:
    string

  value:
    number
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black text-slate-600">
        <Clock3
          size={16}
          className="text-blue-600"
        />

        {label}
      </div>

      <p className="mt-3 text-2xl font-black text-slate-950">
        {value.toLocaleString(
          'fa-IR',
        )}
      </p>
    </article>
  )
}


function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2
        size={30}
        className="animate-spin text-blue-600"
      />
    </div>
  )
}