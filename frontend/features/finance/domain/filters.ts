import type {
  ClientFinanceSummary,
  FinanceCaseSource,
  FinancePaymentStatus,
} from './types'

import {
  buildCaseFinance,
} from './selectors'

import {
  parseFinanceDate,
} from '../utils/date'

export type FinancePeriodPreset =
  | 'all'
  | 'this-month'
  | 'last-month'
  | 'last-90-days'
  | 'this-year'
  | 'custom'

export type FinanceCasePaymentFilter =
  | 'all'
  | FinancePaymentStatus

export interface FinanceReportFilters {
  query: string

  periodPreset:
    FinancePeriodPreset

  fromDate?: string
  toDate?: string

  paymentStatus:
    FinanceCasePaymentFilter

  selectedCaseIds: string[]
  selectedClientKeys: string[]
}

export interface FinanceResolvedDateRange {
  from?: Date
  to?: Date
}

export const DEFAULT_FINANCE_REPORT_FILTERS: FinanceReportFilters =
  {
    query: '',

    periodPreset:
      'all',

    fromDate: '',
    toDate: '',

    paymentStatus:
      'all',

    selectedCaseIds: [],
    selectedClientKeys: [],
  }

function startOfDay(
  value: Date
) {
  const result =
    new Date(
      value.getTime()
    )

  result.setHours(
    0,
    0,
    0,
    0
  )

  return result
}

function endOfDay(
  value: Date
) {
  const result =
    new Date(
      value.getTime()
    )

  result.setHours(
    23,
    59,
    59,
    999
  )

  return result
}

function startOfMonth(
  value: Date
) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    1,
    0,
    0,
    0,
    0
  )
}

function endOfMonth(
  value: Date
) {
  return new Date(
    value.getFullYear(),
    value.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )
}

function addDays(
  value: Date,
  days: number
) {
  const result =
    new Date(
      value.getTime()
    )

  result.setDate(
    result.getDate() +
      days
  )

  return result
}

function addMonths(
  value: Date,
  months: number
) {
  return new Date(
    value.getFullYear(),
    value.getMonth() +
      months,
    1
  )
}

export function resolveFinanceDateRange(
  filters:
    FinanceReportFilters,

  now = new Date()
): FinanceResolvedDateRange {
  switch (
    filters.periodPreset
  ) {
    case 'this-month':
      return {
        from:
          startOfMonth(now),

        to:
          endOfMonth(now),
      }

    case 'last-month': {
      const previous =
        addMonths(
          startOfMonth(now),
          -1
        )

      return {
        from:
          startOfMonth(
            previous
          ),

        to:
          endOfMonth(
            previous
          ),
      }
    }

    case 'last-90-days':
      return {
        from:
          startOfDay(
            addDays(
              now,
              -89
            )
          ),

        to:
          endOfDay(now),
      }

    case 'this-year':
      return {
        from:
          new Date(
            now.getFullYear(),
            0,
            1,
            0,
            0,
            0,
            0
          ),

        to:
          endOfDay(now),
      }

    case 'custom': {
      const rawFrom =
        parseFinanceDate(
          filters.fromDate
        )

      const rawTo =
        parseFinanceDate(
          filters.toDate
        )

      if (
        rawFrom &&
        rawTo &&
        rawFrom.getTime() >
          rawTo.getTime()
      ) {
        return {
          from:
            startOfDay(
              rawTo
            ),

          to:
            endOfDay(
              rawFrom
            ),
        }
      }

      return {
        from:
          rawFrom
            ? startOfDay(
                rawFrom
              )
            : undefined,

        to:
          rawTo
            ? endOfDay(
                rawTo
              )
            : undefined,
      }
    }

    default:
      return {}
  }
}

export function getFinanceClientKey(
  client: Pick<
    ClientFinanceSummary,
    'clientId' | 'clientName'
  >
) {
  if (
    client.clientId?.trim()
  ) {
    return `id:${client.clientId.trim()}`
  }

  return `name:${client.clientName
    .trim()
    .toLocaleLowerCase(
      'fa-IR'
    )}`
}

function getCaseClientKeys(
  caseItem:
    FinanceCaseSource
) {
  const keys =
    new Set<string>()

  for (
    const client of
    caseItem.clients ?? []
  ) {
    if (
      client.clientId?.trim()
    ) {
      keys.add(
        `id:${client.clientId.trim()}`
      )
    }

    if (
      client.name?.trim()
    ) {
      keys.add(
        `name:${client.name
          .trim()
          .toLocaleLowerCase(
            'fa-IR'
          )}`
      )
    }
  }

  if (
    caseItem.clientId?.trim()
  ) {
    keys.add(
      `id:${caseItem.clientId.trim()}`
    )
  }

  if (
    caseItem.clientName?.trim()
  ) {
    keys.add(
      `name:${caseItem.clientName
        .trim()
        .toLocaleLowerCase(
          'fa-IR'
        )}`
    )
  }

  return keys
}

function normalizeSearch(
  value: string
) {
  return value
    .trim()
    .toLocaleLowerCase(
      'fa-IR'
    )
}

function matchesQuery(
  caseItem:
    FinanceCaseSource,

  query: string
) {
  const normalized =
    normalizeSearch(
      query
    )

  if (!normalized) {
    return true
  }

  const values = [
    caseItem.title,
    caseItem.caseNumber,
    caseItem.clientName,

    ...(
      caseItem.clients ??
      []
    ).map(
      (client) =>
        client.name
    ),
  ]

  return values.some(
    (value) =>
      normalizeSearch(
        value ?? ''
      ).includes(
        normalized
      )
  )
}

function matchesDateRange(
  caseItem:
    FinanceCaseSource,

  range:
    FinanceResolvedDateRange
) {
  if (
    !range.from &&
    !range.to
  ) {
    return true
  }

  const createdAt =
    parseFinanceDate(
      caseItem.createdAt
    )

  if (!createdAt) {
    return false
  }

  if (
    range.from &&
    createdAt.getTime() <
      range.from.getTime()
  ) {
    return false
  }

  if (
    range.to &&
    createdAt.getTime() >
      range.to.getTime()
  ) {
    return false
  }

  return true
}

function matchesClients(
  caseItem:
    FinanceCaseSource,

  selectedClientKeys:
    string[]
) {
  if (
    selectedClientKeys.length ===
    0
  ) {
    return true
  }

  const keys =
    getCaseClientKeys(
      caseItem
    )

  return selectedClientKeys.some(
    (key) =>
      keys.has(key)
  )
}

export function applyFinanceReportFilters(
  caseItems:
    FinanceCaseSource[],

  filters:
    FinanceReportFilters,

  now = new Date()
) {
  const range =
    resolveFinanceDateRange(
      filters,
      now
    )

  const selectedCaseIds =
    new Set(
      filters.selectedCaseIds
    )

  return caseItems.filter(
    (caseItem) => {
      if (
        selectedCaseIds.size >
          0 &&
        !selectedCaseIds.has(
          caseItem.id
        )
      ) {
        return false
      }

      if (
        !matchesClients(
          caseItem,
          filters.selectedClientKeys
        )
      ) {
        return false
      }

      if (
        !matchesQuery(
          caseItem,
          filters.query
        )
      ) {
        return false
      }

      if (
        !matchesDateRange(
          caseItem,
          range
        )
      ) {
        return false
      }

      if (
        filters.paymentStatus !==
        'all'
      ) {
        if (
          buildCaseFinance(
            caseItem,
            now
          ).status !==
          filters.paymentStatus
        ) {
          return false
        }
      }

      return true
    }
  )
}

export function countFinanceActiveFilters(
  filters:
    FinanceReportFilters
) {
  let count = 0

  if (
    filters.query.trim()
  ) {
    count += 1
  }

  if (
    filters.periodPreset !==
    'all'
  ) {
    count += 1
  }

  if (
    filters.paymentStatus !==
    'all'
  ) {
    count += 1
  }

  if (
    filters.selectedCaseIds.length >
    0
  ) {
    count += 1
  }

  if (
    filters.selectedClientKeys.length >
    0
  ) {
    count += 1
  }

  return count
}