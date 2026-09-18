import axios from 'axios'

import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import {
  isSubscriptionPlanId,
  type SubscriptionPlan,
} from '@/lib/subscription-plans'

interface ApiEnvelope<T> {
  success: boolean

  data: T

  message?: string
}

interface BackendSubscriptionPlan {
  _id?: unknown

  id?: unknown

  title?: unknown

  description?: unknown

  tier?: unknown

  tags?: unknown

  durationMonths?: unknown

  price?: unknown

  discountPercent?: unknown

  features?: unknown

  isActive?: unknown

  sortOrder?: unknown

  createdAt?: unknown

  updatedAt?: unknown
}

const SUBSCRIPTION_PLANS_ENDPOINT =
  '/subscription-plans'

function normalizeString(
  value: unknown,
): string {
  return typeof value ===
    'string'
    ? value.trim()
    : ''
}

function normalizeOptionalString(
  value: unknown,
): string | undefined {
  const normalized =
    normalizeString(
      value,
    )

  return normalized ||
    undefined
}

function normalizeStringArray(
  value: unknown,
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
          (item) =>
            item.trim(),
        )
        .filter(Boolean),
    ),
  )
}

function normalizeNumber(
  value: unknown,
  fallback: number,
): number {
  if (
    typeof value !==
      'number' ||
    !Number.isFinite(
      value,
    )
  ) {
    return fallback
  }

  return value
}

function resolveId(
  value:
    BackendSubscriptionPlan,
): string {
  if (
    typeof value.id ===
      'string'
  ) {
    return value.id.trim()
  }

  if (
    typeof value._id ===
      'string'
  ) {
    return value._id.trim()
  }

  return ''
}

function normalizePlan(
  value:
    BackendSubscriptionPlan,
): SubscriptionPlan {
  const durationMonths =
    Math.max(
      1,
      Math.round(
        normalizeNumber(
          value.durationMonths,
          1,
        ),
      ),
    )

  const price =
    Math.max(
      0,
      Math.round(
        normalizeNumber(
          value.price,
          0,
        ),
      ),
    )

  const discountPercent =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          normalizeNumber(
            value.discountPercent,
            0,
          ),
        ),
      ),
    )

  const sortOrder =
    Math.max(
      0,
      Math.round(
        normalizeNumber(
          value.sortOrder,
          0,
        ),
      ),
    )

  return {
    id:
      resolveId(
        value,
      ),

    title:
      normalizeString(
        value.title,
      ),

    description:
      normalizeString(
        value.description,
      ),

    tier:
      normalizeString(
        value.tier,
      ),

    tags:
      normalizeStringArray(
        value.tags,
      ),

    durationMonths,

    price,

    discountPercent,

    features:
      normalizeStringArray(
        value.features,
      ),

    isActive:
      value.isActive ===
      true,

    sortOrder,

    createdAt:
      normalizeOptionalString(
        value.createdAt,
      ),

    updatedAt:
      normalizeOptionalString(
        value.updatedAt,
      ),
  }
}

function assertListResponse(
  payload:
    ApiEnvelope<
      BackendSubscriptionPlan[]
    >,
): void {
  if (
    payload.success !==
      true ||
    !Array.isArray(
      payload.data,
    )
  ) {
    throw new Error(
      'ساختار پاسخ پلن‌های اشتراکی معتبر نیست.',
    )
  }
}

function assertItemResponse(
  payload:
    ApiEnvelope<BackendSubscriptionPlan>,
): void {
  if (
    payload.success !==
      true ||
    !payload.data ||
    typeof payload.data !==
      'object'
  ) {
    throw new Error(
      'ساختار پاسخ پلن اشتراکی معتبر نیست.',
    )
  }
}

export async function getPublicSubscriptionPlans():
  Promise<SubscriptionPlan[]> {
  try {
    const response =
      await api.get<
        ApiEnvelope<
          BackendSubscriptionPlan[]
        >
      >(
        SUBSCRIPTION_PLANS_ENDPOINT,
      )

    assertListResponse(
      response.data,
    )

    return response.data.data
      .map(
        normalizePlan,
      )
      .filter(
        (plan) =>
          Boolean(
            plan.id &&
            plan.title &&
            plan.isActive,
          ),
      )
      .sort(
        (
          first,
          second,
        ) =>
          first.sortOrder -
            second.sortOrder ||
          first.price -
            second.price,
      )
  } catch (
    error: unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,
        'دریافت پلن‌های اشتراکی ناموفق بود.',
      ),
    )
  }
}

export async function getPublicSubscriptionPlan(
  id: string,
): Promise<SubscriptionPlan | null> {
  const planId =
    id.trim()

  if (
    !isSubscriptionPlanId(
      planId,
    )
  ) {
    return null
  }

  try {
    const response =
      await api.get<
        ApiEnvelope<BackendSubscriptionPlan>
      >(
        `${SUBSCRIPTION_PLANS_ENDPOINT}/${encodeURIComponent(
          planId,
        )}`,
      )

    assertItemResponse(
      response.data,
    )

    const plan =
      normalizePlan(
        response.data.data,
      )

    if (
      !plan.id ||
      !plan.isActive
    ) {
      return null
    }

    return plan
  } catch (
    error: unknown
  ) {
    if (
      axios.isAxiosError(
        error,
      ) &&
      error.response?.status ===
        404
    ) {
      return null
    }

    throw new Error(
      getApiErrorMessage(
        error,
        'دریافت اطلاعات پلن اشتراکی ناموفق بود.',
      ),
    )
  }
}


