

'use client'

import {
  Edit,
  FileText,
  MapPin,
  Phone,
  Trash2,
  UserRound,
} from 'lucide-react'

import type {
  Client,
} from '@/types/client'

import {
  useCasesStore,
} from '@/store/cases.store'

interface Props {
  client: Client

  onEdit: (
    client: Client
  ) => void

  onDelete: (
    id: string
  ) => void
}



function normalizeText(
  value?: string | null
): string {
  return (
    value
      ?.trim()
      .toLocaleLowerCase(
        'fa-IR'
      ) ??
    ''
  )
}

function normalizePhone(
  value?: string | null
): string {
  return (
    value
      ?.replace(
        /[\s()-]/g,
        ''
      )
      .trim() ??
    ''
  )
}

export function ClientCard({
  client,
  onEdit,
  onDelete,
}: Props) {
  const cases =
    useCasesStore(
      (state) =>
        state.cases
    )

  

  const legacyCaseIds =
    new Set(
      client.caseIds ??
      []
    )

  const normalizedPhone =
    normalizePhone(
      client.phoneNumber ??
        client.phone
    )

  const normalizedName =
    normalizeText(
      client.fullName
    )

  const clientCases =
    cases.filter(
      (caseItem) => {
  
        const matchedByClientId =
          caseItem.clients?.some(
            (
              caseClient
            ) =>
              Boolean(
                caseClient.clientId &&
                  caseClient.clientId ===
                    client.id
              )
          ) ??
          false

        if (
          matchedByClientId
        ) {
          return true
        }

        
        if (
          caseItem.clientId ===
          client.id
        ) {
          return true
        }

     
        if (
          legacyCaseIds.has(
            caseItem.id
          )
        ) {
          return true
        }

      

        if (
          normalizedPhone
        ) {
          const matchedByPhone =
            caseItem.clients?.some(
              (
                caseClient
              ) =>
                normalizePhone(
                  caseClient.phone
                ) ===
                normalizedPhone
            ) ??
            false

          if (
            matchedByPhone
          ) {
            return true
          }

          if (
            normalizePhone(
              caseItem.clientPhone
            ) ===
            normalizedPhone
          ) {
            return true
          }
        }

       
        if (
          normalizedName
        ) {
          const matchedByName =
            caseItem.clients?.some(
              (
                caseClient
              ) =>
                normalizeText(
                  caseClient.name
                ) ===
                normalizedName
            ) ??
            false

          if (
            matchedByName
          ) {
            return true
          }

          if (
            normalizeText(
              caseItem.clientName
            ) ===
            normalizedName
          ) {
            return true
          }
        }

        return false
      }
    )

  const initials =
    getClientInitials(
      client.fullName
    )

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-lg">
      

      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 font-black text-white">
            {initials}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-zinc-900">
              {client.fullName}
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              کد ملی:{' '}

              <span
                dir="ltr"
                className="font-mono"
              >
                {client.nationalId ||
                  'ثبت نشده'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            title="ویرایش موکل"
            aria-label={`ویرایش ${client.fullName}`}
            onClick={() =>
              onEdit(
                client
              )
            }
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit
              size={16}
            />
          </button>

       
          <button
            type="button"
            title="حذف موکل"
            aria-label={`حذف ${client.fullName}`}
            onClick={() =>
              onDelete(
                client.id
              )
            }
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2
              size={16}
            />
          </button>
        </div>
      </div>


      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Phone
            size={14}
            className="shrink-0 text-zinc-400"
          />

          <span
            dir="ltr"
            className="font-mono"
          >
            {client.phoneNumber ||
              client.phone ||
              '—'}
          </span>
        </div>

        {client.landlineNumber && (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Phone
              size={14}
              className="shrink-0 text-zinc-400"
            />

            <span
              dir="ltr"
              className="font-mono"
            >
              {client.landlineNumber}
            </span>
          </div>
        )}

        {client.representative && (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <UserRound
              size={14}
              className="shrink-0 text-zinc-400"
            />

            <span className="truncate">
              نماینده:{' '}
              {client.representative}
            </span>
          </div>
        )}

        {client.address && (
          <div className="flex items-start gap-2 text-sm text-zinc-600">
            <MapPin
              size={14}
              className="mt-0.5 shrink-0 text-zinc-400"
            />

            <span className="line-clamp-2 leading-6">
              {client.address}
            </span>
          </div>
        )}
      </div>


      <div className="border-t border-zinc-100 pt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText
              size={14}
              className="text-zinc-400"
            />

            <span className="text-xs font-medium text-zinc-500">
              پرونده‌های مرتبط
            </span>
          </div>

          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-600">
            {clientCases.length.toLocaleString(
              'fa-IR'
            )}
          </span>
        </div>

        {clientCases.length >
        0 ? (
          <div className="space-y-1.5">
            {clientCases
              .slice(
                0,
                3
              )
              .map(
                (
                  caseItem
                ) => (
                  <div
                    key={
                      caseItem.id
                    }
                    className="rounded-lg bg-zinc-50 px-3 py-2"
                  >
                    <p className="truncate text-xs font-semibold text-zinc-700">
                      {caseItem.title}
                    </p>

                    {caseItem.caseNumber && (
                      <p className="mt-1 text-[10px] text-zinc-400">
                        شماره پرونده:{' '}

                        <span
                          dir="ltr"
                          className="font-mono"
                        >
                          {caseItem.caseNumber}
                        </span>
                      </p>
                    )}
                  </div>
                )
              )}

            {clientCases.length >
              3 && (
              <p className="mt-1 text-xs text-zinc-400">
                و{' '}

                {(
                  clientCases.length -
                  3
                ).toLocaleString(
                  'fa-IR'
                )}{' '}

                پرونده دیگر...
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">
            هنوز پرونده‌ای برای این موکل ثبت نشده است.
          </p>
        )}
      </div>
    </article>
  )
}



function getClientInitials(
  fullName: string
): string {
  const parts =
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  if (
    parts.length === 0
  ) {
    return 'م'
  }

  const first =
    parts[0]?.[0] ??
    ''

  const last =
    parts.length >
    1
      ? parts[
          parts.length -
            1
        ]?.[0] ??
        ''
      : ''

  return (
    `${first}${last}` ||
    'م'
  )
}