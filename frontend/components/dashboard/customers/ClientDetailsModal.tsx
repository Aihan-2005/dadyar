


'use client'
import {
  Edit2,
  User,
  X,
} from 'lucide-react'

import type {
  Client,
} from '@/types/client'

import {
  getClientAge,
  isClientMinor,
} from '@/features/clients/utils/client-date'

interface Props {
  client:
    Client | null

  onClose:
    () => void

  onEdit: (
    client:
      Client
  ) => void
}

export function ClientDetailsModal({
  client,
  onClose,
  onEdit,
}: Props) {
  if (!client) {
    return null
  }

  const age =
    getClientAge(
      client.birthDate
    )

  const minor =
    isClientMinor(
      client.birthDate
    )

  const initials =
    getInitials(
      client.fullName
    )

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={
        onClose
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-5 py-4 sm:px-6">
          <h2 className="text-lg font-black text-zinc-900">
            جزئیات موکل
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-800"
          >
            <X
              size={19}
            />
          </button>
        </header>

        <div className="space-y-6 p-5 sm:p-7">
          <div className="flex flex-col items-center gap-4 border-b border-zinc-100 pb-6 text-center sm:flex-row sm:text-right">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-black text-white shadow-lg">
              {initials}
            </div>

            <div>
              <h3 className="text-2xl font-black text-zinc-900">
                {client.fullName}
              </h3>

              <p
                dir="ltr"
                className="mt-1 font-mono text-sm text-zinc-500"
              >
                {client.phoneNumber}
              </p>
            </div>
          </div>

          {minor && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              این موکل زیر سن قانونی است.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailCard
              label="کد ملی"
              value={
                client.nationalId
              }
              ltr
            />

            <DetailCard
              label="شماره موبایل"
              value={
                client.phoneNumber
              }
              ltr
            />

            <DetailCard
              label="تلفن ثابت"
              value={
                client.landlineNumber
              }
              ltr
            />

            <DetailCard
              label="تاریخ تولد"
              value={
                client.birthDate
              }
              ltr
            />

            <DetailCard
              label="سن"
              value={
                age !== null
                  ? `${age.toLocaleString(
                      'fa-IR'
                    )} سال`
                  : undefined
              }
            />

            <DetailCard
              label="نماینده"
              value={
                client.representative
              }
            />
          </div>

          {client.address && (
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-[11px] font-medium text-zinc-400">
                آدرس
              </p>

              <p className="mt-2 text-sm leading-7 text-zinc-700">
                {client.address}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex items-start gap-3">
              <User
                size={18}
                className="mt-0.5 shrink-0 text-indigo-600"
              />

              <p className="text-xs leading-6 text-indigo-700">
                ارتباط این موکل با پرونده‌ها بعداً از خود Caseها محاسبه می‌شود؛ اطلاعات پرونده داخل سند Client ذخیره نمی‌شود.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                onClose()
                onEdit(
                  client
                )
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              <Edit2
                size={17}
              />

              ویرایش اطلاعات
            </button>

            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailCard({
  label,
  value,
  ltr = false,
}: {
  label: string

  value?: string

  ltr?: boolean
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <p className="text-[11px] font-medium text-zinc-400">
        {label}
      </p>

      <p
        dir={
          ltr
            ? 'ltr'
            : undefined
        }
        className={`mt-1.5 font-semibold text-zinc-900 ${
          ltr
            ? 'text-right font-mono'
            : ''
        }`}
      >
        {value ||
          '—'}
      </p>
    </div>
  )
}

function getInitials(
  fullName: string
): string {
  const parts =
    fullName
      .trim()
      .split(/\s+/)

  if (
    parts.length ===
    0
  ) {
    return 'م'
  }

  const first =
    parts[0]?.[0] ??
    ''

  const last =
    parts.length > 1
      ? parts.at(-1)?.[0] ??
        ''
      : ''

  return (
    `${first}${last}` ||
    'م'
  )
}