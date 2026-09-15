import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  ConsultationType,
} from '@/types/consultation-booking'

import type {
  CreateLawyerAvailabilityInput,
  LawyerAvailability,
  LawyerAvailabilityListParams,
  UpdateLawyerAvailabilityInput,
} from '@/types/lawyer-availability'


type ApiEnvelope<T> = {
  success: boolean
  data: T
  message?: string
}


type RawAvailability = {
  id?: unknown
  _id?: unknown
  lawyerId?: unknown
  startsAt?: unknown
  endsAt?: unknown
  consultationTypes?: unknown
  note?: unknown
  isActive?: unknown
  isReserved?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}


const LAWYER_AVAILABILITY_ENDPOINT =
  '/lawyer/availability'


const CONSULTATION_TYPES:
  readonly ConsultationType[] = [
    'ONLINE',
    'PHONE',
    'IN_PERSON',
  ]


function readString(
  value: unknown,
): string {
  return typeof value === 'string'
    ? value.trim()
    : ''
}


function readDateString(
  value: unknown,
): string {
  const raw =
    readString(
      value,
    )

  const date =
    new Date(
      raw,
    )

  if (
    !raw ||
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new Error(
      'ساختار زمان آزاد وکیل معتبر نیست.',
    )
  }

  return date.toISOString()
}


function readConsultationTypes(
  value: unknown,
): ConsultationType[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    throw new Error(
      'ساختار نوع مشاوره معتبر نیست.',
    )
  }

  const result =
    value.filter(
      (
        item,
      ): item is ConsultationType =>
        typeof item ===
          'string' &&
        CONSULTATION_TYPES.includes(
          item as ConsultationType,
        ),
    )

  if (
    result.length !==
    value.length
  ) {
    throw new Error(
      'ساختار نوع مشاوره معتبر نیست.',
    )
  }

  return result
}


function readAvailability(
  value: RawAvailability,
): LawyerAvailability {
  const id =
    readString(
      value.id,
    ) ||
    readString(
      value._id,
    )

  const lawyerId =
    readString(
      value.lawyerId,
    )

  if (
    !id ||
    !lawyerId ||
    typeof value.isActive !==
      'boolean' ||
    typeof value.isReserved !==
      'boolean'
  ) {
    throw new Error(
      'ساختار پاسخ زمان آزاد وکیل معتبر نیست.',
    )
  }

  return {
    id,

    lawyerId,

    startsAt:
      readDateString(
        value.startsAt,
      ),

    endsAt:
      readDateString(
        value.endsAt,
      ),

    consultationTypes:
      readConsultationTypes(
        value.consultationTypes,
      ),

    note:
      readString(
        value.note,
      ),

    isActive:
      value.isActive,

    isReserved:
      value.isReserved,

    createdAt:
      readDateString(
        value.createdAt,
      ),

    updatedAt:
      readDateString(
        value.updatedAt,
      ),
  }
}


function readItem(
  payload:
    ApiEnvelope<RawAvailability>,
): LawyerAvailability {
  if (
    payload.success !==
      true ||
    !payload.data
  ) {
    throw new Error(
      'ساختار پاسخ زمان آزاد وکیل معتبر نیست.',
    )
  }

  return readAvailability(
    payload.data,
  )
}


function readList(
  payload:
    ApiEnvelope<RawAvailability[]>,
): LawyerAvailability[] {
  if (
    payload.success !==
      true ||
    !Array.isArray(
      payload.data,
    )
  ) {
    throw new Error(
      'ساختار پاسخ زمان‌های آزاد وکیل معتبر نیست.',
    )
  }

  return payload.data.map(
    readAvailability,
  )
}


function buildParams(
  params:
    LawyerAvailabilityListParams,
) {
  return {
    ...(params.from
      ? {
          from:
            params.from,
        }
      : {}),

    ...(params.to
      ? {
          to:
            params.to,
        }
      : {}),

    ...(params.type
      ? {
          type:
            params.type,
        }
      : {}),

    ...(params.includeInactive !==
    undefined
      ? {
          includeInactive:
            String(
              params.includeInactive,
            ),
        }
      : {}),
  }
}


export async function getLawyerAvailability(
  params:
    LawyerAvailabilityListParams = {},
): Promise<LawyerAvailability[]> {
  try {
    const response =
      await api.get<
        ApiEnvelope<RawAvailability[]>
      >(
        LAWYER_AVAILABILITY_ENDPOINT,

        {
          params:
            buildParams(
              params,
            ),
        },
      )

    return readList(
      response.data,
    )
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت زمان‌های آزاد ناموفق بود.',
      ),
    )
  }
}


export async function getClientLawyerAvailability(
  lawyerId: string,

  params:
    LawyerAvailabilityListParams = {},
): Promise<LawyerAvailability[]> {
  try {
    const response =
      await api.get<
        ApiEnvelope<RawAvailability[]>
      >(
        `/client/lawyers/${encodeURIComponent(
          lawyerId,
        )}/availability`,

        {
          params:
            buildParams({
              ...params,

              includeInactive:
                undefined,
            }),
        },
      )

    return readList(
      response.data,
    )
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت زمان‌های آزاد وکیل ناموفق بود.',
      ),
    )
  }
}


export async function createLawyerAvailability(
  input:
    CreateLawyerAvailabilityInput,
): Promise<LawyerAvailability> {
  try {
    const response =
      await api.post<
        ApiEnvelope<RawAvailability>
      >(
        LAWYER_AVAILABILITY_ENDPOINT,

        {
          startsAt:
            input.startsAt,

          endsAt:
            input.endsAt,

          consultationTypes:
            input.consultationTypes,

          ...(input.note?.trim()
            ? {
                note:
                  input.note.trim(),
              }
            : {}),

          isActive:
            input.isActive ??
            true,
        },
      )

    return readItem(
      response.data,
    )
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'ثبت زمان آزاد ناموفق بود.',
      ),
    )
  }
}


export async function updateLawyerAvailability(
  availabilityId: string,

  input:
    UpdateLawyerAvailabilityInput,
): Promise<LawyerAvailability> {
  try {
    const response =
      await api.patch<
        ApiEnvelope<RawAvailability>
      >(
        `${LAWYER_AVAILABILITY_ENDPOINT}/${encodeURIComponent(
          availabilityId,
        )}`,

        input,
      )

    return readItem(
      response.data,
    )
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'ویرایش زمان آزاد ناموفق بود.',
      ),
    )
  }
}


export async function deleteLawyerAvailability(
  availabilityId: string,
): Promise<string> {
  try {
    const response =
      await api.delete<
        ApiEnvelope<{
          id?: unknown
        }>
      >(
        `${LAWYER_AVAILABILITY_ENDPOINT}/${encodeURIComponent(
          availabilityId,
        )}`,
      )

    const id =
      readString(
        response.data.data?.id,
      )

    if (
      response.data.success !==
        true ||
      !id
    ) {
      throw new Error(
        'ساختار پاسخ حذف زمان آزاد معتبر نیست.',
      )
    }

    return id
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'حذف زمان آزاد ناموفق بود.',
      ),
    )
  }
}
