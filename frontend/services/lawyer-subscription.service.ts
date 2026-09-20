import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  LawyerSubscription,
  LawyerSubscriptionActivationSource,
  LawyerSubscriptionPlanSnapshot,
  LawyerSubscriptionStatus,
} from '@/types/lawyer-subscription'


interface ApiEnvelope<T> {
  success:
    boolean

  data:
    T

  message?:
    string
}


interface BackendLawyerSubscription {
  _id?:
    unknown

  id?:
    unknown

  lawyerId?:
    unknown

  planId?:
    unknown

  planSnapshot?:
    unknown

  startsAt?:
    unknown

  endsAt?:
    unknown

  cancelledAt?:
    unknown

  activationSource?:
    unknown

  activatedByUserId?:
    unknown

  createdAt?:
    unknown

  updatedAt?:
    unknown

  status?:
    unknown
}


const CURRENT_SUBSCRIPTION_ENDPOINT =
  '/lawyer-subscriptions/current'


function isRecord(
  value:
    unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      'object' &&
    value !==
      null
  )
}


function readString(
  value:
    unknown,
): string {
  return typeof value ===
    'string'
    ? value
    : ''
}


function readNullableString(
  value:
    unknown,
): string | null {
  return typeof value ===
    'string'
    ? value
    : null
}


function readObjectId(
  value:
    unknown,
): string {
  if (
    typeof value ===
    'string'
  ) {
    return value
  }


  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return ''
  }


  return String(
    value,
  )
}


function readNumber(
  value:
    unknown,

  fallback =
    0,
): number {
  return (
    typeof value ===
      'number' &&
    Number.isFinite(
      value,
    )
  )
    ? value
    : fallback
}


function readStringArray(
  value:
    unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return []
  }


  return Array.from(
    new Set(
      value
        .filter(
          (
            item,
          ): item is string =>
            typeof item ===
            'string',
        )
        .map(
          (
            item,
          ) =>
            item.trim(),
        )
        .filter(
          Boolean,
        ),
    ),
  )
}


function readStatus(
  value:
    unknown,
): LawyerSubscriptionStatus {
  switch (
    value
  ) {
    case 'ACTIVE':
    case 'EXPIRED':
    case 'CANCELLED':
      return value

    default:
      throw new Error(
        'وضعیت اشتراک دریافت‌شده از سرور معتبر نیست.',
      )
  }
}


function readActivationSource(
  value:
    unknown,
): LawyerSubscriptionActivationSource {
  switch (
    value
  ) {
    case 'ADMIN':
    case 'PAYMENT':
      return value

    default:
      throw new Error(
        'منبع فعال‌سازی اشتراک دریافت‌شده از سرور معتبر نیست.',
      )
  }
}


function mapPlanSnapshot(
  value:
    unknown,
): LawyerSubscriptionPlanSnapshot {
  if (
    !isRecord(
      value,
    )
  ) {
    throw new Error(
      'اطلاعات پلن اشتراک معتبر نیست.',
    )
  }


  return {
    title:
      readString(
        value.title,
      ),

    description:
      readString(
        value.description,
      ),

    tier:
      readString(
        value.tier,
      ),

    tags:
      readStringArray(
        value.tags,
      ),

    durationMonths:
      readNumber(
        value.durationMonths,
      ),

    price:
      readNumber(
        value.price,
      ),

    discountPercent:
      readNumber(
        value.discountPercent,
      ),

    features:
      readStringArray(
        value.features,
      ),
  }
}


function mapSubscription(
  value:
    BackendLawyerSubscription,
): LawyerSubscription {
  const id =
    readObjectId(
      value._id ??
      value.id,
    )


  if (
    !id
  ) {
    throw new Error(
      'سرور شناسه اشتراک معتبر برنگرداند.',
    )
  }


  return {
    id,

    lawyerId:
      readObjectId(
        value.lawyerId,
      ),

    planId:
      readObjectId(
        value.planId,
      ),

    planSnapshot:
      mapPlanSnapshot(
        value.planSnapshot,
      ),

    startsAt:
      readString(
        value.startsAt,
      ),

    endsAt:
      readString(
        value.endsAt,
      ),

    cancelledAt:
      readNullableString(
        value.cancelledAt,
      ),

    activationSource:
      readActivationSource(
        value.activationSource,
      ),

    activatedByUserId:
      readNullableString(
        value.activatedByUserId,
      ),

    createdAt:
      readString(
        value.createdAt,
      ),

    updatedAt:
      readString(
        value.updatedAt,
      ),

    status:
      readStatus(
        value.status,
      ),
  }
}


export async function getCurrentLawyerSubscription():
  Promise<LawyerSubscription | null> {
  try {
    const response =
      await api.get<
        ApiEnvelope<
          BackendLawyerSubscription |
          null
        >
      >(
        CURRENT_SUBSCRIPTION_ENDPOINT,
      )


    if (
      response.data.success !==
      true
    ) {
      throw new Error(
        response.data.message ||
        'دریافت اشتراک فعلی ناموفق بود.',
      )
    }


    if (
      response.data.data ===
      null
    ) {
      return null
    }


    return mapSubscription(
      response.data.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,
        'دریافت وضعیت اشتراک ناموفق بود.',
      ),
    )
  }
  }