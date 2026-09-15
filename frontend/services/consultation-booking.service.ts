import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  ConsultationBooking,
  ConsultationBookingClient,
  ConsultationBookingStatus,
  ConsultationType,
  CreateConsultationBookingInput,
  LawyerBookingDecisionStatus,
  LawyerConsultationBooking,
} from '@/types/consultation-booking'


type ApiEnvelope<T> = {
  success: boolean
  data: T
  message?: string
}


type RawBookingClient = {
  id?: unknown
  fullName?: unknown
  phone?: unknown
  email?: unknown
  lawyerClientId?: unknown
}


type RawBooking = {
  id?: unknown
  _id?: unknown

  clientId?: unknown
  lawyerId?: unknown

  availabilityId?: unknown

  type?: unknown

  startsAt?: unknown
  endsAt?: unknown

  date?: unknown
  time?: unknown

  description?: unknown

  status?: unknown

  createdAt?: unknown
  updatedAt?: unknown

  client?: unknown
}


const CLIENT_BOOKINGS_ENDPOINT =
  '/client/bookings'

const LAWYER_BOOKINGS_ENDPOINT =
  '/lawyer/bookings'

const BOOKING_CHANGED_EVENT =
  'dadyar:consultation-booking:changed'


const CONSULTATION_TYPES:
  readonly ConsultationType[] = [
    'ONLINE',
    'PHONE',
    'IN_PERSON',
  ]


const BOOKING_STATUSES:
  readonly ConsultationBookingStatus[] = [
    'PENDING',
    'CONFIRMED',
    'REJECTED',
    'COMPLETED',
    'CANCELLED',
  ]


function isBrowser(): boolean {
  return typeof window !==
    'undefined'
}


function notifyBookingChanged(): void {
  if (
    !isBrowser()
  ) {
    return
  }

  window.dispatchEvent(
    new Event(
      BOOKING_CHANGED_EVENT,
    ),
  )
}


export function subscribeConsultationBookingChanges(
  listener:
    () => void,
): () => void {
  if (
    !isBrowser()
  ) {
    return () =>
      undefined
  }

  window.addEventListener(
    BOOKING_CHANGED_EVENT,

    listener,
  )

  return () => {
    window.removeEventListener(
      BOOKING_CHANGED_EVENT,

      listener,
    )
  }
}


function readString(
  value:
    unknown,
): string {
  return typeof value ===
    'string'
    ? value.trim()
    : ''
}


function readNullableString(
  value:
    unknown,
): string | null {
  const result =
    readString(
      value,
    )

  return result ||
    null
}


function readNullableDate(
  value:
    unknown,
): string | null {
  const raw =
    readString(
      value,
    )

  if (
    !raw
  ) {
    return null
  }

  const date =
    new Date(
      raw,
    )

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date.toISOString()
}


function readBooking(
  value:
    RawBooking,
): ConsultationBooking {
  const id =
    readString(
      value.id,
    ) ||
    readString(
      value._id,
    )

  const clientId =
    readString(
      value.clientId,
    )

  const lawyerId =
    readString(
      value.lawyerId,
    )

  const type =
    readString(
      value.type,
    ) as ConsultationType

  const status =
    readString(
      value.status,
    ) as ConsultationBookingStatus


  if (
    !id ||
    !clientId ||
    !lawyerId ||
    !CONSULTATION_TYPES.includes(
      type,
    ) ||
    !BOOKING_STATUSES.includes(
      status,
    )
  ) {
    throw new Error(
      'ساختار پاسخ رزرو مشاوره معتبر نیست.',
    )
  }


  return {
    id,

    clientId,

    lawyerId,

    availabilityId:
      readNullableString(
        value.availabilityId,
      ),

    type,

    startsAt:
      readNullableDate(
        value.startsAt,
      ),

    endsAt:
      readNullableDate(
        value.endsAt,
      ),

    date:
      readString(
        value.date,
      ),

    time:
      readString(
        value.time,
      ),

    description:
      readString(
        value.description,
      ),

    status,

    createdAt:
      readNullableDate(
        value.createdAt,
      ),

    updatedAt:
      readNullableDate(
        value.updatedAt,
      ),
  }
}


function readBookingClient(
  value:
    unknown,
): ConsultationBookingClient {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    throw new Error(
      'ساختار اطلاعات موکل رزرو معتبر نیست.',
    )
  }

  const client =
    value as RawBookingClient

  const id =
    readString(
      client.id,
    )

  if (
    !id
  ) {
    throw new Error(
      'ساختار اطلاعات موکل رزرو معتبر نیست.',
    )
  }

  return {
    id,

    fullName:
      readString(
        client.fullName,
      ),

    phone:
      readNullableString(
        client.phone,
      ),

    email:
      readNullableString(
        client.email,
      ),

    lawyerClientId:
      readNullableString(
        client.lawyerClientId,
      ),
  }
}


function readLawyerBooking(
  value:
    RawBooking,
): LawyerConsultationBooking {
  return {
    ...readBooking(
      value,
    ),

    client:
      readBookingClient(
        value.client,
      ),
  }
}


function readItem(
  payload:
    ApiEnvelope<RawBooking>,
): ConsultationBooking {
  if (
    payload.success !==
      true ||
    !payload.data
  ) {
    throw new Error(
      'ساختار پاسخ رزرو مشاوره معتبر نیست.',
    )
  }

  return readBooking(
    payload.data,
  )
}


function readLawyerItem(
  payload:
    ApiEnvelope<RawBooking>,
): LawyerConsultationBooking {
  if (
    payload.success !==
      true ||
    !payload.data
  ) {
    throw new Error(
      'ساختار پاسخ رزرو مشاوره معتبر نیست.',
    )
  }

  return readLawyerBooking(
    payload.data,
  )
}


function readList(
  payload:
    ApiEnvelope<RawBooking[]>,
): ConsultationBooking[] {
  if (
    payload.success !==
      true ||
    !Array.isArray(
      payload.data,
    )
  ) {
    throw new Error(
      'ساختار پاسخ فهرست رزروها معتبر نیست.',
    )
  }

  return payload.data.map(
    readBooking,
  )
}


function readLawyerList(
  payload:
    ApiEnvelope<RawBooking[]>,
): LawyerConsultationBooking[] {
  if (
    payload.success !==
      true ||
    !Array.isArray(
      payload.data,
    )
  ) {
    throw new Error(
      'ساختار پاسخ فهرست رزروهای وکیل معتبر نیست.',
    )
  }

  return payload.data.map(
    readLawyerBooking,
  )
}


export async function createClientConsultationBooking(
  input:
    CreateConsultationBookingInput,
): Promise<ConsultationBooking> {
  try {
    const response =
      await api.post<
        ApiEnvelope<RawBooking>
      >(
        CLIENT_BOOKINGS_ENDPOINT,

        {
          lawyerId:
            input.lawyerId,

          availabilityId:
            input.availabilityId,

          type:
            input.type,

          ...(input.description?.trim()
            ? {
                description:
                  input.description.trim(),
              }
            : {}),
        },
      )

    const result =
      readItem(
        response.data,
      )

    notifyBookingChanged()

    return result
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'ثبت رزرو مشاوره ناموفق بود.',
      ),
    )
  }
}


export async function getClientConsultationBookings(): Promise<
  ConsultationBooking[]
> {
  try {
    const response =
      await api.get<
        ApiEnvelope<RawBooking[]>
      >(
        CLIENT_BOOKINGS_ENDPOINT,
      )

    return readList(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت رزروهای مشاوره ناموفق بود.',
      ),
    )
  }
}


export async function cancelClientConsultationBooking(
  bookingId:
    string,
): Promise<ConsultationBooking> {
  try {
    const response =
      await api.patch<
        ApiEnvelope<RawBooking>
      >(
        `${CLIENT_BOOKINGS_ENDPOINT}/${encodeURIComponent(
          bookingId,
        )}/cancel`,
      )

    const result =
      readItem(
        response.data,
      )

    notifyBookingChanged()

    return result
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'لغو رزرو مشاوره ناموفق بود.',
      ),
    )
  }
}


export async function getLawyerConsultationBookings(): Promise<
  LawyerConsultationBooking[]
> {
  try {
    const response =
      await api.get<
        ApiEnvelope<RawBooking[]>
      >(
        LAWYER_BOOKINGS_ENDPOINT,
      )

    return readLawyerList(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت رزروهای وکیل ناموفق بود.',
      ),
    )
  }
}


export async function updateLawyerConsultationBookingStatus(
  bookingId:
    string,

  status:
    LawyerBookingDecisionStatus,
): Promise<LawyerConsultationBooking> {
  try {
    const response =
      await api.patch<
        ApiEnvelope<RawBooking>
      >(
        `${LAWYER_BOOKINGS_ENDPOINT}/${encodeURIComponent(
          bookingId,
        )}/status`,

        {
          status,
        },
      )

    const result =
      readLawyerItem(
        response.data,
      )

    notifyBookingChanged()

    return result
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'بروزرسانی وضعیت رزرو ناموفق بود.',
      ),
    )
  }
}
