'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ArrowRight,
  Copy,
  FileText,
  LogIn,
  PenLine,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

import {
  getCurrentClientPortalAccount,
  subscribeClientPortalAuth,
  type ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  deleteClientPetition,
  getClientPetitions,
  subscribeClientPetitions,
} from '@/features/client-portal/data/client-petition.repository'

import type {
  ClientPetitionRecord,
  ClientPetitionStatus,
} from '@/features/client-portal/types/petition'

import {
  PETITION_STATUS_LABELS,
  buildPetitionText,
  formatPetitionDateTime,
  getPetitionStatusClassName,
  getPetitionTemplate,
  petitionRecordToDraft,
} from '@/features/client-portal/utils/petition'

type StatusFilter =
  | 'all'
  | ClientPetitionStatus

export default function ClientPetitionsPage() {
  const [
    account,
    setAccount,
  ] =
    useState<ClientPortalAccount | null>(
      null
    )

  const [
    records,
    setRecords,
  ] =
    useState<ClientPetitionRecord[]>(
      []
    )

  const [
    search,
    setSearch,
  ] =
    useState(
      ''
    )

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      'all'
    )

  const [
    copiedId,
    setCopiedId,
  ] =
    useState<string | null>(
      null
    )

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    )

  useEffect(() => {
    const refresh =
      () => {
        const current =
          getCurrentClientPortalAccount()

        setAccount(
          current
        )

        setRecords(
          current
            ? getClientPetitions(
                current.id
              )
            : []
        )
      }

    refresh()

    const unsubscribeAuth =
      subscribeClientPortalAuth(
        refresh
      )

    const unsubscribePetitions =
      subscribeClientPetitions(
        refresh
      )

    return () => {
      unsubscribeAuth()
      unsubscribePetitions()
    }
  }, [])

  const filteredRecords =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLocaleLowerCase(
              'fa-IR'
            )

        return records.filter(
          (
            record
          ) => {
            if (
              statusFilter !==
                'all' &&
              record.status !==
                statusFilter
            ) {
              return false
            }

            if (
              !normalizedSearch
            ) {
              return true
            }

            const haystack = [
              record.reference,
              record.subject,
              record.authorityName,
              record.caseNumber ??
                '',
            ]
              .join(
                ' '
              )
              .toLocaleLowerCase(
                'fa-IR'
              )

            return haystack.includes(
              normalizedSearch
            )
          }
        )
      },
      [
        records,
        search,
        statusFilter,
      ]
    )

  const readyCount =
    records.filter(
      (
        record
      ) =>
        record.status ===
        'ready'
    ).length

  const draftCount =
    records.length -
    readyCount

  const handleCopy =
    async (
      record:
        ClientPetitionRecord
    ) => {
      try {
        const text =
          buildPetitionText(
            petitionRecordToDraft(
              record
            )
          )

        await navigator.clipboard.writeText(
          text
        )

        setCopiedId(
          record.id
        )

        window.setTimeout(
          () =>
            setCopiedId(
              null
            ),
          1500
        )
      } catch {
        setError(
          'کپی متن انجام نشد.'
        )
      }
    }

  const handleDelete =
    (
      record:
        ClientPetitionRecord
    ) => {
      if (!account) {
        return
      }

      const confirmed =
        window.confirm(
          `لایحه «${record.subject}» حذف شود؟`
        )

      if (!confirmed) {
        return
      }

      try {
        deleteClientPetition(
          record.id,
          account.id
        )

        setError(
          null
        )
      } catch (
        caughtError
      ) {
        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : 'حذف لایحه انجام نشد.'
        )
      }
    }

  return (
    <main
      dir="rtl"
      className="min-h-dvh bg-slate-100 text-slate-950"
    >
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <div>
            <p className="font-black">
              دادیار
            </p>

            <p className="text-xs font-semibold text-slate-500">
              لوایح موکل
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/client-portal/petitions/new"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white"
            >
              <Plus
                size={16}
              />

              لایحه جدید
            </Link>

            <Link
              href="/client-portal"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-black text-slate-700"
            >
              <ArrowRight
                size={16}
              />

              بخش موکلین
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <section className="rounded-[26px] border border-slate-200 bg-gradient-to-l from-amber-50 via-white to-blue-50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <PenLine
                size={23}
              />
            </div>

            <div>
              <p className="text-sm font-black text-amber-700">
                تنظیم و مدیریت لایحه
              </p>

              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                لوایح من
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                پیش‌نویس‌های خود را مدیریت
                کنید، متن را ادامه دهید و
                نسخه‌های آماده بررسی را
                جدا نگه دارید.
              </p>
            </div>
          </div>
        </section>

        {!account ? (
          <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6 text-center">
            <LogIn
              size={28}
              className="mx-auto text-blue-600"
            />

            <h2 className="mt-4 text-lg font-black">
              لوایح ذخیره‌شده بعد از ورود نمایش داده می‌شوند
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm font-semibold leading-7 text-slate-500">
              می‌توانید بدون ورود تنظیم یک
              لایحه جدید را شروع کنید. برای
              ذخیره و مدیریت نسخه‌های شخصی،
              وارد حساب موکل شوید.
            </p>

            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Link
                href="/client-portal/petitions/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
              >
                <FileText
                  size={17}
                />

                شروع تنظیم لایحه
              </Link>

              <Link
                href="/client-login?returnTo=/client-portal/petitions&mode=login"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700"
              >
                ورود به حساب موکل
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-5 grid grid-cols-3 gap-3">
              <Stat
                label="کل لوایح"
                value={
                  records.length
                }
              />

              <Stat
                label="پیش‌نویس"
                value={
                  draftCount
                }
              />

              <Stat
                label="آماده بررسی"
                value={
                  readyCount
                }
              />
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative">
                  <Search
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={
                      search
                    }
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="جستجو بر اساس موضوع، شماره پرونده یا کد..."
                    className="h-11 w-full rounded-xl border border-slate-300 pr-11 pl-3 text-sm font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setStatusFilter(
                      event.target
                        .value as StatusFilter
                    )
                  }
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black outline-none"
                >
                  <option value="all">
                    همه وضعیت‌ها
                  </option>

                  <option value="draft">
                    پیش‌نویس
                  </option>

                  <option value="ready">
                    آماده بررسی
                  </option>
                </select>
              </div>
            </section>

            {error && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </p>
            )}

            {filteredRecords.length >
            0 ? (
              <section className="mt-5 grid gap-4 lg:grid-cols-2">
                {filteredRecords.map(
                  (
                    record
                  ) => (
                    <article
                      key={
                        record.id
                      }
                      className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${getPetitionStatusClassName(
                              record.status
                            )}`}
                          >
                            {
                              PETITION_STATUS_LABELS[
                                record.status
                              ]
                            }
                          </span>

                          <h2 className="mt-3 text-lg font-black">
                            {record.subject}
                          </h2>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {
                              getPetitionTemplate(
                                record.templateKey
                              ).title
                            }
                          </p>
                        </div>

                        <div className="text-left">
                          <p className="text-[10px] font-bold text-slate-400">
                            کد
                          </p>

                          <p
                            dir="ltr"
                            className="mt-1 text-xs font-black text-blue-700"
                          >
                            {record.reference}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Info
                          label="مرجع"
                          value={
                            record.authorityName
                          }
                        />

                        <Info
                          label="شماره پرونده"
                          value={
                            record.caseNumber ||
                            '—'
                          }
                        />
                      </div>

                      <p className="mt-4 line-clamp-3 text-sm font-semibold leading-7 text-slate-600">
                        {record.facts}
                      </p>

                      <p className="mt-4 text-[11px] font-semibold text-slate-400">
                        آخرین تغییر:
                        {' '}
                        {formatPetitionDateTime(
                          record.updatedAt
                        )}
                        {' • '}
                        نسخه
                        {' '}
                        {record.version.toLocaleString(
                          'fa-IR'
                        )}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                        <Link
                          href={`/client-portal/petitions/${record.id}`}
                          className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-xs font-black text-white"
                        >
                          باز کردن و ویرایش
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            void handleCopy(
                              record
                            )
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-black text-slate-700"
                        >
                          <Copy
                            size={15}
                          />

                          {copiedId ===
                          record.id
                            ? 'کپی شد'
                            : 'کپی متن'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              record
                            )
                          }
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-black text-red-600"
                        >
                          <Trash2
                            size={15}
                          />

                          حذف
                        </button>
                      </div>
                    </article>
                  )
                )}
              </section>
            ) : (
              <section className="mt-5 rounded-[22px] border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
                <PenLine
                  size={28}
                  className="mx-auto text-slate-400"
                />

                <h2 className="mt-4 text-lg font-black">
                  لایحه‌ای پیدا نشد
                </h2>

                <Link
                  href="/client-portal/petitions/new"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
                >
                  <Plus
                    size={17}
                  />

                  تنظیم لایحه جدید
                </Link>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function Stat({
  label,
  value,
}: {
  label:
    string

  value:
    number
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black">
        {value.toLocaleString(
          'fa-IR'
        )}
      </p>
    </div>
  )
}

function Info({
  label,
  value,
}: {
  label:
    string

  value:
    string
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 line-clamp-2 text-xs font-black leading-6 text-slate-800">
        {value}
      </p>
    </div>
  )
}