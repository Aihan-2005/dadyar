'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPageHeader'


import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Edit2,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from 'lucide-react'

import {
  ClientDetailsModal,
} from '@/components/dashboard/customers/ClientDetailsModal'

import {
  ClientEditorModal,
} from '@/components/dashboard/customers/ClientEditorModal'

import {
  useClientStore,
} from '@/store/client.store'

import type {
  Client,
  CreateClientPayload,
} from '@/types/client'

import {
  isClientMinor,
} from '@/features/clients/utils/client-date'

const PAGE_SIZE =
  20

export default function CustomersPage() {
  const clients =
    useClientStore(
      (state) =>
        state.clients
    )

  const pagination =
    useClientStore(
      (state) =>
        state.pagination
    )

  const isLoading =
    useClientStore(
      (state) =>
        state.isLoading
    )

  const isSaving =
    useClientStore(
      (state) =>
        state.isSaving
    )

  const error =
    useClientStore(
      (state) =>
        state.error
    )

  const migrationReport =
    useClientStore(
      (state) =>
        state.migrationReport
    )

  const fetchClients =
    useClientStore(
      (state) =>
        state.fetchClients
    )

  const addClient =
    useClientStore(
      (state) =>
        state.addClient
    )

  const updateClient =
    useClientStore(
      (state) =>
        state.updateClient
    )

  const migrateLegacyClients =
    useClientStore(
      (state) =>
        state.migrateLegacyClients
    )

  const clearError =
    useClientStore(
      (state) =>
        state.clearError
    )

  const clearMigrationReport =
    useClientStore(
      (state) =>
        state.clearMigrationReport
    )

  const [
    ready,
    setReady,
  ] =
    useState(false)

  const [
    search,
    setSearch,
  ] =
    useState('')

  const [
    page,
    setPage,
  ] =
    useState(1)

  const [
    editorOpen,
    setEditorOpen,
  ] =
    useState(false)

  const [
    editingClient,
    setEditingClient,
  ] =
    useState<Client | undefined>()

  const [
    viewingClient,
    setViewingClient,
  ] =
    useState<Client | null>(
      null
    )


  useEffect(() => {
    let cancelled =
      false

    const initialize =
      async () => {
        await migrateLegacyClients()

        if (
          !cancelled
        ) {
          setReady(
            true
          )
        }
      }

    void initialize()

    return () => {
      cancelled =
        true
    }
  }, [
    migrateLegacyClients,
  ])

  useEffect(() => {
    if (!ready) {
      return
    }

    const timeoutId =
      window.setTimeout(
        () => {
          void fetchClients({
            search,

            page,

            limit:
              PAGE_SIZE,

            force:
              true,
          })
        },
        300
      )

    return () =>
      window.clearTimeout(
        timeoutId
      )
  }, [
    fetchClients,
    page,
    ready,
    search,
  ])



  useEffect(() => {
    setPage(1)
  }, [
    search,
  ])

  const pageStats =
    useMemo(
      () => {
        const minors =
          clients.filter(
            (client) =>
              isClientMinor(
                client.birthDate
              )
          ).length

        const withNationalId =
          clients.filter(
            (client) =>
              Boolean(
                client.nationalId
              )
          ).length

        const completeProfiles =
          clients.filter(
            (client) =>
              Boolean(
                client.fullName &&
                  client.phoneNumber &&
                  client.nationalId &&
                  client.address
              )
          ).length

        return {
          minors,

          withNationalId,

          completeProfiles,
        }
      },
      [
        clients,
      ]
    )

  const openCreate =
    () => {
      clearError()

      setEditingClient(
        undefined
      )

      setEditorOpen(
        true
      )
    }

  const openEdit =
    (
      client:
        Client
    ) => {
      clearError()

      setEditingClient(
        client
      )

      setEditorOpen(
        true
      )
    }

  const closeEditor =
    () => {
      if (
        isSaving
      ) {
        return
      }

      setEditorOpen(
        false
      )

      setEditingClient(
        undefined
      )

      clearError()
    }

  const handleSubmit =
    async (
      payload:
        CreateClientPayload
    ) => {
      const result =
        editingClient
          ? await updateClient(
              editingClient.id,
              payload
            )
          : await addClient(
              payload
            )

      if (!result) {
        return
      }

      closeEditor()

     
      await fetchClients({
        search,

        page:
          editingClient
            ? page
            : 1,

        limit:
          PAGE_SIZE,

        force:
          true,
      })

      if (!editingClient) {
        setPage(1)
      }
    }

  const refresh =
    () => {
      void fetchClients({
        search,

        page,

        limit:
          PAGE_SIZE,

        force:
          true,
      })
    }

  const hasPrevious =
    pagination.page >
    1

  const hasNext =
    pagination.page <
    pagination.totalPages

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-zinc-50 pb-20"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-sm">
              <Users
                size={23}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-zinc-900 sm:text-2xl">
                  موکلین
                </h1>

              
              </div>

              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                مدیریت اطلاعات موکلین ذخیره‌شده در دیتابیس
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                refresh
              }
              disabled={
                isLoading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  isLoading
                    ? 'animate-spin'
                    : ''
                }
              />

              بروزرسانی
            </button>

            <button
              type="button"
              onClick={
                openCreate
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              <Plus
                size={18}
              />

              افزودن موکل
            </button>
          </div>
        </header>

        {migrationReport &&
          migrationReport.detected >
            0 && (
            <MigrationBanner
              report={
                migrationReport
              }
              onClose={
                clearMigrationReport
              }
            />
          )}

        {error &&
          !editorOpen && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-start gap-2 text-sm text-red-700">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p>
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  clearError
                }
                className="text-red-400 hover:text-red-700"
              >
                <X
                  size={17}
                />
              </button>
            </div>
          )}

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="جست‌وجو بر اساس نام، کد ملی، موبایل یا تلفن ثابت..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
            />

            {search && (
              <button
                type="button"
                aria-label="پاک‌کردن جست‌وجو"
                onClick={() =>
                  setSearch('')
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                <X
                  size={17}
                />
              </button>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="کل موکلین"
            value={
              pagination.total
            }
            className="text-zinc-900"
          />

          <StatCard
            label="نمایش داده‌شده"
            value={
              clients.length
            }
            className="text-blue-600"
          />

          <StatCard
            label="دارای کد ملی"
            value={
              pageStats.withNationalId
            }
            className="text-emerald-600"
          />

          <StatCard
            label="زیر سن در این صفحه"
            value={
              pageStats.minors
            }
            className="text-red-600"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {isLoading &&
          clients.length ===
            0 ? (
            <LoadingState />
          ) : clients.length ===
            0 ? (
            <EmptyState
              hasSearch={
                Boolean(
                  search.trim()
                )
              }
              onAdd={
                openCreate
              }
            />
          ) : (
            <>
              <div className="grid gap-4 p-4 lg:hidden">
                {clients.map(
                  (client) => (
                    <ClientMobileCard
                      key={
                        client.id
                      }
                      client={
                        client
                      }
                      onView={
                        setViewingClient
                      }
                      onEdit={
                        openEdit
                      }
                    />
                  )
                )}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px]">
                  <thead className="border-b border-zinc-200 bg-zinc-50">
                    <tr>
                      <Th>
                        نام موکل
                      </Th>

                      <Th>
                        کد ملی
                      </Th>

                      <Th>
                        موبایل
                      </Th>

                      <Th>
                        تلفن ثابت
                      </Th>

                      <Th>
                        تاریخ تولد
                      </Th>

                      <Th>
                        نماینده
                      </Th>

                      <Th center>
                        عملیات
                      </Th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {clients.map(
                      (
                        client
                      ) => (
                        <ClientTableRow
                          key={
                            client.id
                          }
                          client={
                            client
                          }
                          onView={
                            setViewingClient
                          }
                          onEdit={
                            openEdit
                          }
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                pagination={
                  pagination
                }
                isLoading={
                  isLoading
                }
                hasPrevious={
                  hasPrevious
                }
                hasNext={
                  hasNext
                }
                onPrevious={() =>
                  setPage(
                    (
                      current
                    ) =>
                      Math.max(
                        current -
                          1,
                        1
                      )
                  )
                }
                onNext={() =>
                  setPage(
                    (
                      current
                    ) =>
                      current +
                      1
                  )
                }
              />
            </>
          )}
        </section>
      </div>

      <ClientDetailsModal
        client={
          viewingClient
        }
        onClose={() =>
          setViewingClient(
            null
          )
        }
        onEdit={
          openEdit
        }
      />

      <ClientEditorModal
        open={
          editorOpen
        }
        client={
          editingClient
        }
        isSaving={
          isSaving
        }
        error={
          editorOpen
            ? error
            : null
        }
        onClose={
          closeEditor
        }
        onSubmit={
          handleSubmit
        }
      />
    </div>
  )
}

function ClientTableRow({
  client,
  onView,
  onEdit,
}: {
  client:
    Client

  onView: (
    client:
      Client
  ) => void

  onEdit: (
    client:
      Client
  ) => void
}) {
  const minor =
    isClientMinor(
      client.birthDate
    )

  return (
    <tr className="transition hover:bg-zinc-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            name={
              client.fullName
            }
          />

          <div>
            <p className="font-bold text-zinc-900">
              {client.fullName}
            </p>

            {minor && (
              <p className="mt-0.5 text-[11px] font-bold text-red-600">
                زیر سن قانونی
              </p>
            )}
          </div>
        </div>
      </td>

      <Td ltr>
        {client.nationalId ??
          '—'}
      </Td>

      <Td ltr>
        {client.phoneNumber}
      </Td>

      <Td ltr>
        {client.landlineNumber ??
          '—'}
      </Td>

      <Td ltr>
        {client.birthDate ??
          '—'}
      </Td>

      <Td>
        {client.representative ??
          '—'}
      </Td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            title="مشاهده"
            onClick={() =>
              onView(
                client
              )
            }
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
          >
            <Eye
              size={18}
            />
          </button>

          <button
            type="button"
            title="ویرایش"
            onClick={() =>
              onEdit(
                client
              )
            }
            className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
          >
            <Edit2
              size={18}
            />
          </button>
        </div>
      </td>
    </tr>
  )
}

function ClientMobileCard({
  client,
  onView,
  onEdit,
}: {
  client:
    Client

  onView: (
    client:
      Client
  ) => void

  onEdit: (
    client:
      Client
  ) => void
}) {
  const minor =
    isClientMinor(
      client.birthDate
    )

  return (
    <article className="rounded-xl border border-zinc-200 p-4">
      <div className="flex items-start gap-3">
        <Avatar
          name={
            client.fullName
          }
          large
        />

        <div className="min-w-0 flex-1">
          <p className="truncate font-black text-zinc-900">
            {client.fullName}
          </p>

          <p
            dir="ltr"
            className="mt-1 text-right font-mono text-xs text-zinc-500"
          >
            {client.phoneNumber}
          </p>

          {minor && (
            <span className="mt-2 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
              زیر سن قانونی
            </span>
          )}
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() =>
              onView(
                client
              )
            }
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
          >
            <Eye
              size={17}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              onEdit(
                client
              )
            }
            className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
          >
            <Edit2
              size={17}
            />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <MiniDetail
          label="کد ملی"
          value={
            client.nationalId ??
            '—'
          }
          ltr
        />

        <MiniDetail
          label="تلفن ثابت"
          value={
            client.landlineNumber ??
            '—'
          }
          ltr
        />
      </div>
    </article>
  )
}

function Pagination({
  pagination,
  isLoading,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: {
  pagination: {
    page: number
    totalPages: number
    total: number
  }

  isLoading:
    boolean

  hasPrevious:
    boolean

  hasNext:
    boolean

  onPrevious:
    () => void

  onNext:
    () => void
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-zinc-100 bg-zinc-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-zinc-500">
        صفحه{' '}

        {pagination.page.toLocaleString(
          'fa-IR'
        )}{' '}

        از{' '}

        {Math.max(
          pagination.totalPages,
          1
        ).toLocaleString(
          'fa-IR'
        )}

        {' · '}

        {pagination.total.toLocaleString(
          'fa-IR'
        )}{' '}

        موکل
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={
            !hasPrevious ||
            isLoading
          }
          onClick={
            onPrevious
          }
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight
            size={15}
          />

          قبلی
        </button>

        <button
          type="button"
          disabled={
            !hasNext ||
            isLoading
          }
          onClick={
            onNext
          }
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          بعدی

          <ChevronLeft
            size={15}
          />
        </button>
      </div>
    </div>
  )
}

function MigrationBanner({
  report,
  onClose,
}: {
  report: {
    detected: number
    created: number
    alreadyExists: number
    failed: number
    completed: boolean
  }

  onClose:
    () => void
}) {
  const successful =
    report.completed

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 ${
        successful
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {successful ? (
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
        ) : (
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-amber-600"
          />
        )}

        <div>
          <p className="text-sm font-black text-zinc-900">
            انتقال موکل‌های قدیمی
          </p>

          <p className="mt-1 text-xs leading-6 text-zinc-600">
            {report.detected.toLocaleString(
              'fa-IR'
            )}{' '}
            رکورد محلی پیدا شد؛{' '}

            {report.created.toLocaleString(
              'fa-IR'
            )}{' '}
            مورد به دیتابیس منتقل شد و{' '}

            {report.alreadyExists.toLocaleString(
              'fa-IR'
            )}{' '}
            مورد از قبل در دیتابیس وجود داشت.

            {report.failed >
              0 &&
              ` ${report.failed.toLocaleString(
                'fa-IR'
              )} مورد نیازمند بررسی است و LocalStorage هنوز پاک نشده.`}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={
          onClose
        }
        className="text-zinc-400 hover:text-zinc-700"
      >
        <X
          size={17}
        />
      </button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-zinc-500">
      <Loader2
        size={28}
        className="animate-spin"
      />

      <p className="text-sm">
        در حال دریافت موکلین از سرور...
      </p>
    </div>
  )
}

function EmptyState({
  hasSearch,
  onAdd,
}: {
  hasSearch:
    boolean

  onAdd:
    () => void
}) {
  return (
    <div className="px-6 py-16 text-center">
      <Users
        size={48}
        className="mx-auto text-zinc-200"
      />

      <h2 className="mt-4 font-black text-zinc-900">
        {hasSearch
          ? 'موکلی با این مشخصات پیدا نشد'
          : 'هنوز موکلی ثبت نشده است'}
      </h2>

      {!hasSearch && (
        <button
          type="button"
          onClick={
            onAdd
          }
          className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800"
        >
          ثبت اولین موکل
        </button>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string

  value: number

  className: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs text-zinc-500 sm:text-sm">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-black sm:text-3xl ${className}`}
      >
        {value.toLocaleString(
          'fa-IR'
        )}
      </p>
    </div>
  )
}

function Avatar({
  name,
  large = false,
}: {
  name: string

  large?: boolean
}) {
  const parts =
    name
      .trim()
      .split(/\s+/)

  const first =
    parts[0]?.[0] ??
    ''

  const last =
    parts.length > 1
      ? parts.at(-1)?.[0] ??
        ''
      : ''

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 font-black text-white ${
        large
          ? 'h-12 w-12'
          : 'h-9 w-9 text-xs'
      }`}
    >
      {`${first}${last}` ||
        'م'}
    </div>
  )
}

function MiniDetail({
  label,
  value,
  ltr = false,
}: {
  label: string
  value: string
  ltr?: boolean
}) {
  return (
    <div className="rounded-lg bg-zinc-50 p-2.5">
      <p className="text-[10px] text-zinc-400">
        {label}
      </p>

      <p
        dir={
          ltr
            ? 'ltr'
            : undefined
        }
        className={`mt-1 font-semibold text-zinc-700 ${
          ltr
            ? 'text-right font-mono'
            : ''
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function Th({
  children,
  center = false,
}: {
  children:
    React.ReactNode

  center?: boolean
}) {
  return (
    <th
      className={`px-5 py-4 text-sm font-semibold text-zinc-600 ${
        center
          ? 'text-center'
          : 'text-right'
      }`}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  ltr = false,
}: {
  children:
    React.ReactNode

  ltr?: boolean
}) {
  return (
    <td
      dir={
        ltr
          ? 'ltr'
          : undefined
      }
      className={`px-5 py-4 text-sm text-zinc-600 ${
        ltr
          ? 'text-right font-mono'
          : ''
      }`}
    >
      {children}
    </td>
  )
}
