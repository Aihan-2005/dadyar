'use client'

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Save,
  UserRound,
} from 'lucide-react'

import {
  getClientProfile,
  saveClientFullName,
} from '@/features/client-portal/data/client-profile.repository'

import {
  useAuthStore,
} from '@/store/auth.store'


type ProfileState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'missing'
  | 'error'


interface ClientProfileRequirementProps {
  children:
    ReactNode

  title?:
    string

  description?:
    string
}


export default function ClientProfileRequirement({
  children,

  title =
    'پروفایل موکل را کامل کنید',

  description =
    'برای ادامه، نام و نام خانوادگی واقعی شما باید در حساب دادیار ثبت شده باشد.',
}: ClientProfileRequirementProps) {
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
    useState<ProfileState>(
      'idle',
    )

  const [
    fullName,

    setFullName,
  ] =
    useState(
      '',
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
    saving,

    setSaving,
  ] =
    useState(
      false,
    )


  const load =
    useCallback(
      async () => {
        if (
          !hasHydrated ||
          !user ||
          user.role !==
            'CLIENT'
        ) {
          setState(
            'idle',
          )

          return
        }

        try {
          setState(
            'loading',
          )

          setError(
            null,
          )

          const profile =
            await getClientProfile(
              user.id,
            )

          if (
            profile?.fullName?.trim()
          ) {
            setFullName(
              profile.fullName.trim(),
            )

            setState(
              'ready',
            )

            return
          }

          setFullName(
            '',
          )

          setState(
            'missing',
          )
        } catch (
          caughtError:
            unknown
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'دریافت پروفایل موکل ناموفق بود.',
          )

          setState(
            'error',
          )
        }
      },

      [
        hasHydrated,

        user,
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


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !user ||
      user.role !==
        'CLIENT' ||
      saving
    ) {
      return
    }

    const normalized =
      fullName.trim()

    if (
      normalized.length <
      3
    ) {
      setError(
        'نام و نام خانوادگی را کامل وارد کنید.',
      )

      return
    }

    try {
      setSaving(
        true,
      )

      setError(
        null,
      )

      const profile =
        await saveClientFullName(
          user.id,

          normalized,
        )

      setFullName(
        profile.fullName,
      )

      setState(
        'ready',
      )
    } catch (
      caughtError:
        unknown
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'ذخیره پروفایل موکل ناموفق بود.',
      )
    } finally {
      setSaving(
        false,
      )
    }
  }


  if (
    !hasHydrated ||
    state ===
      'loading'
  ) {
    return (
      <div className="flex min-h-44 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader2
          size={24}
          className="animate-spin text-blue-600"
        />
      </div>
    )
  }


  if (
    !user ||
    user.role !==
      'CLIENT'
  ) {
    return (
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
        <UserRound
          size={30}
          className="mx-auto text-blue-600"
        />

        <h3 className="mt-3 font-black text-slate-900">
          برای ادامه وارد حساب موکل شوید
        </h3>

        <Link
          href="/client-login?returnTo=/client-portal&mode=login"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
        >
          ورود موکل
        </Link>
      </section>
    )
  }


  if (
    state ===
    'error'
  ) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
        <AlertCircle
          size={28}
          className="mx-auto text-red-600"
        />

        <p className="mt-3 text-sm font-bold leading-7 text-red-700">
          {error ||
            'دریافت پروفایل موکل ناموفق بود.'}
        </p>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-xs font-black text-red-700"
        >
          <RefreshCw
            size={15}
          />

          تلاش دوباره
        </button>
      </section>
    )
  }


  if (
    state ===
    'missing'
  ) {
    return (
      <form
        onSubmit={
          handleSubmit
        }
        className="rounded-2xl border border-blue-200 bg-blue-50 p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
            <UserRound
              size={21}
            />
          </div>

          <div>
            <h3 className="font-black text-slate-950">
              {title}
            </h3>

            <p className="mt-1 text-xs font-semibold leading-6 text-slate-600">
              {description}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold leading-6 text-red-700">
            {error}
          </div>
        )}

        <label className="mt-5 block">
          <span className="text-xs font-black text-slate-700">
            نام و نام خانوادگی
          </span>

          <input
            value={
              fullName
            }
            onChange={(
              event,
            ) => {
              setFullName(
                event.target.value,
              )

              setError(
                null,
              )
            }}
            autoComplete="name"
            maxLength={200}
            placeholder="مثلاً علی رضایی"
            className="mt-2 h-11 w-full rounded-xl border border-blue-200 bg-white px-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <button
          type="submit"
          disabled={
            saving
          }
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white disabled:opacity-60"
        >
          {saving ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Save
              size={17}
            />
          )}

          ذخیره و ادامه
        </button>
      </form>
    )
  }


  if (
    state !==
    'ready'
  ) {
    return null
  }


  return (
    <>
      {children}
    </>
  )
}