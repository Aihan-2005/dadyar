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
  success:
    boolean

  data:
    T

  message?:
    string
}


interface BackendSubscriptionPlan {
  _id?:
    unknown

  id?:
    unknown

  title?:
    unknown

  description?:
    unknown

  tier?:
    unknown

  tags?:
    unknown

  durationDays?:
    unknown

  durationMonths?:
    unknown

  price?:
    unknown

  discountPercent?:
    unknown

  features?:
    unknown

  isActive?:
    unknown

  sortOrder?:
    unknown

  createdAt?:
    unknown

  updatedAt?:
    unknown
}


interface BackendSubscriptionSettings {
  trialDays?:
    unknown
}


export interface PublicSubscriptionSettings {
  trialDays:
    number
}


const SUBSCRIPTION_PLANS_ENDPOINT =
  '/subscription-plans'

const SUBSCRIPTION_SETTINGS_ENDPOINT =
  '/subscription-plans/settings'


function stringValue(
  value:
    unknown,
): string {
  return typeof value ===
    'string'
    ? value.trim()
    : ''
}


function numberValue(
  value:
    unknown,

  fallback:
    number,
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


function stringArray(
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


function resolveId(
  plan:
    BackendSubscriptionPlan,
): string {
  return (
    stringValue(
      plan.id,
    ) ||
    stringValue(
      plan._id,
    )
  )
}


function resolveDurationDays(
  plan:
    BackendSubscriptionPlan,
): number {
  const days =
    numberValue(
      plan.durationDays,
      0,
    )

  if (
    days >
    0
  ) {
    return Math.round(
      days,
    )
  }

  const months =
    numberValue(
      plan.durationMonths,
      0,
    )

  return Math.max(
    1,
    Math.round(
      months *
        30,
    ),
  )
}


function mapPlan(
  raw:
    BackendSubscriptionPlan,
): SubscriptionPlan {
  const durationDays =
    resolveDurationDays(
      raw,
    )

  return {
    id:
      resolveId(
        raw,
      ),

    title:
      stringValue(
        raw.title,
      ),

    description:
      stringValue(
        raw.description,
      ),

    tier:
      stringValue(
        raw.tier,
      ),

    tags:
      stringArray(
        raw.tags,
      ),

    durationDays,

    durationMonths:
      durationDays /
      30,

    price:
      Math.max(
        0,
        Math.round(
          numberValue(
            raw.price,
            0,
          ),
        ),
      ),

    discountPercent:
      Math.min(
        100,
        Math.max(
          0,
          Math.round(
            numberValue(
              raw.discountPercent,
              0,
            ),
          ),
        ),
      ),

    features:
      stringArray(
        raw.features,
      ),

    isActive:
      raw.isActive ===
      true,

    sortOrder:
      Math.max(
        0,
        Math.round(
          numberValue(
            raw.sortOrder,
            0,
          ),
        ),
      ),

    createdAt:
      stringValue(
        raw.createdAt,
      ) ||
      undefined,

    updatedAt:
      stringValue(
        raw.updatedAt,
      ) ||
      undefined,
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

    if (
      response.data.success !==
        true ||
      !Array.isArray(
        response.data.data,
      )
    ) {
      throw new Error(
        'ساختار پاسخ پلن‌ها معتبر نیست.',
      )
    }

    return response.data.data
      .map(
        mapPlan,
      )
      .filter(
        (
          plan,
        ) =>
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
    error:
      unknown
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
  id:
    string,
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

    if (
      response.data.success !==
      true
    ) {
      throw new Error(
        response.data.message ||
        'دریافت پلن ناموفق بود.',
      )
    }

    const plan =
      mapPlan(
        response.data.data,
      )

    return plan.isActive
      ? plan
      : null
  } catch (
    error:
      unknown
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
        'دریافت اطلاعات پلن ناموفق بود.',
      ),
    )
  }
}


 
export async function getPublicSubscriptionSettings():
  Promise<PublicSubscriptionSettings | null> {
  try {
    const response =
      await api.get<
        ApiEnvelope<BackendSubscriptionSettings>
      >(
        SUBSCRIPTION_SETTINGS_ENDPOINT,
      )

    const trialDays =
      numberValue(
        response.data.data
          ?.trialDays,
        0,
      )

    if (
      response.data.success !==
        true ||
      !Number.isInteger(
        trialDays,
      ) ||
      trialDays <
        1
    ) {
      return null
    }

    return {
      trialDays,
    }
  } catch (
    error:
      unknown
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

    return null
  }
}