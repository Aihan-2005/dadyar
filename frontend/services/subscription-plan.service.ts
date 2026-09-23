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
  id?: unknown

  _id?: unknown

  title?: unknown

  description?: unknown

  tier?: unknown

  tags?: unknown

  durationDays?: unknown

  durationMonths?: unknown

  price?: unknown

  discountPercent?: unknown

  features?: unknown

  isActive?: unknown

  sortOrder?: unknown

  createdAt?: unknown

  updatedAt?: unknown
}


interface BackendSubscriptionSettings {
  trialDays?: unknown
}


export interface PublicSubscriptionSettings {
  trialDays: number
}


const SUBSCRIPTION_PLANS_ENDPOINT =
  '/subscription-plans'

const SUBSCRIPTION_SETTINGS_ENDPOINT =
  '/subscription-plans/settings'


 
const CACHE_TTL_MS =
  60_000


type TimedCache<T> = {
  value: T

  expiresAt: number
}


let plansCache:
  TimedCache<SubscriptionPlan[]> | null =
  null

let settingsCache:
  TimedCache<PublicSubscriptionSettings> | null =
  null


 
let plansRequest:
  Promise<SubscriptionPlan[]> | null =
  null

let settingsRequest:
  Promise<PublicSubscriptionSettings> | null =
  null


function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null
  )
}


function readString(
  value: unknown,
): string {
  return typeof value === 'string'
    ? value.trim()
    : ''
}


function readOptionalString(
  value: unknown,
): string | undefined {
  const normalized =
    readString(
      value,
    )

  return normalized ||
    undefined
}


function readNumber(
  value: unknown,
  fallback = 0,
): number {
  return (
    typeof value === 'number' &&
    Number.isFinite(
      value,
    )
  )
    ? value
    : fallback
}


function readStringArray(
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
            typeof item === 'string',
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


function readPlanId(
  plan:
    BackendSubscriptionPlan,
): string {
  const directId =
    readString(
      plan.id,
    )

  if (
    directId
  ) {
    return directId
  }


  if (
    typeof plan._id ===
      'string'
  ) {
    return plan._id.trim()
  }


  if (
    plan._id !==
      null &&
    plan._id !==
      undefined
  ) {
    return String(
      plan._id,
    ).trim()
  }


  return ''
}


function resolveDurationDays(
  plan:
    BackendSubscriptionPlan,
): number {
  const durationDays =
    readNumber(
      plan.durationDays,
    )


  if (
    durationDays >
    0
  ) {
    return Math.max(
      1,
      Math.round(
        durationDays,
      ),
    )
  }


   
  const durationMonths =
    readNumber(
      plan.durationMonths,
    )


  if (
    durationMonths >
    0
  ) {
    return Math.max(
      1,
      Math.round(
        durationMonths *
          30,
      ),
    )
  }


  throw new Error(
    'مدت پلن دریافت‌شده از سرور معتبر نیست.',
  )
}


function mapSubscriptionPlan(
  raw:
    BackendSubscriptionPlan,
): SubscriptionPlan {
  const id =
    readPlanId(
      raw,
    )


  if (
    !isSubscriptionPlanId(
      id,
    )
  ) {
    throw new Error(
      'شناسه پلن دریافت‌شده از سرور معتبر نیست.',
    )
  }


  const title =
    readString(
      raw.title,
    )


  const tier =
    readString(
      raw.tier,
    )


  const durationDays =
    resolveDurationDays(
      raw,
    )


  const price =
    readNumber(
      raw.price,
      Number.NaN,
    )


  const discountPercent =
    readNumber(
      raw.discountPercent,
      Number.NaN,
    )


  if (
    !title ||
    !tier
  ) {
    throw new Error(
      'اطلاعات پلن دریافت‌شده از سرور ناقص است.',
    )
  }


  if (
    !Number.isSafeInteger(
      price,
    ) ||
    price <
      0
  ) {
    throw new Error(
      'قیمت پلن دریافت‌شده از سرور معتبر نیست.',
    )
  }


  if (
    !Number.isFinite(
      discountPercent,
    ) ||
    discountPercent <
      0 ||
    discountPercent >
      100
  ) {
    throw new Error(
      'درصد تخفیف پلن دریافت‌شده از سرور معتبر نیست.',
    )
  }


  return {
    id,

    title,

    description:
      readString(
        raw.description,
      ),

    tier,

    tags:
      readStringArray(
        raw.tags,
      ),

   
    durationDays,

    
    durationMonths:
      durationDays /
      30,

    price:
      Math.round(
        price,
      ),

    discountPercent:
      Math.round(
        discountPercent,
      ),

    features:
      readStringArray(
        raw.features,
      ),

    isActive:
      raw.isActive ===
      true,

    sortOrder:
      Math.max(
        0,
        Math.round(
          readNumber(
            raw.sortOrder,
          ),
        ),
      ),

    createdAt:
      readOptionalString(
        raw.createdAt,
      ),

    updatedAt:
      readOptionalString(
        raw.updatedAt,
      ),
  }
}


function unwrapEnvelope<T>(
  response:
    ApiEnvelope<T>,

  fallbackMessage:
    string,
): T {
  if (
    response.success !==
    true
  ) {
    throw new Error(
      response.message ||
      fallbackMessage,
    )
  }


  return response.data
}


function getFreshCache<T>(
  cache:
    TimedCache<T> | null,
): T | null {
  if (
    !cache ||
    cache.expiresAt <=
      Date.now()
  ) {
    return null
  }


  return cache.value
}


function cacheValue<T>(
  value:
    T,
): TimedCache<T> {
  return {
    value,

    expiresAt:
      Date.now() +
      CACHE_TTL_MS,
  }
}

 
export function getCachedPublicSubscriptionPlans():
  SubscriptionPlan[] | null {
  return getFreshCache(
    plansCache,
  )
}

 
export function getCachedPublicSubscriptionPlan(
  planId:
    string |
    null |
    undefined,
): SubscriptionPlan | null {
  if (
    !isSubscriptionPlanId(
      planId,
    )
  ) {
    return null
  }


  return (
    getFreshCache(
      plansCache,
    )?.find(
      (
        plan,
      ) =>
        plan.id ===
        planId.trim(),
    ) ??
    null
  )
}


export function getCachedPublicSubscriptionSettings():
  PublicSubscriptionSettings | null {
  return getFreshCache(
    settingsCache,
  )
}
 
async function requestPublicPlans():
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


    const data =
      unwrapEnvelope(
        response.data,

        'دریافت پلن‌های اشتراکی ناموفق بود.',
      )


    if (
      !Array.isArray(
        data,
      )
    ) {
      throw new Error(
        'ساختار پاسخ لیست پلن‌ها معتبر نیست.',
      )
    }


    return data
      .map(
        mapSubscriptionPlan,
      )
      .filter(
        (
          plan,
        ) =>
          plan.isActive,
      )
      .sort(
        (
          a,
          b,
        ) =>
          a.sortOrder -
          b.sortOrder,
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



export async function getPublicSubscriptionPlans(
  options: {
    force?: boolean
  } = {},
): Promise<SubscriptionPlan[]> {
  if (
    !options.force
  ) {
    const cached =
      getFreshCache(
        plansCache,
      )


    if (
      cached
    ) {
      return cached
    }


    
    if (
      plansRequest
    ) {
      return plansRequest
    }
  }


  const request =
    requestPublicPlans()
      .then(
        (
          plans,
        ) => {
          plansCache =
            cacheValue(
              plans,
            )

          return plans
        },
      )


  plansRequest =
    request


  try {
    return await request
  } finally {
    if (
      plansRequest ===
      request
    ) {
      plansRequest =
        null
    }
  }
}




export async function getPublicSubscriptionPlan(
  planId:
    string,
): Promise<SubscriptionPlan | null> {
  const normalizedId =
    planId.trim()


  if (
    !isSubscriptionPlanId(
      normalizedId,
    )
  ) {
    return null
  }


  const cachedPlans =
    getFreshCache(
      plansCache,
    )


  const cachedPlan =
    cachedPlans?.find(
      (
        plan,
      ) =>
        plan.id ===
        normalizedId,
    )


  if (
    cachedPlan
  ) {
    return cachedPlan
  }



  
  if (
    plansRequest
  ) {
    try {
      const plans =
        await plansRequest


      const plan =
        plans.find(
          (
            item,
          ) =>
            item.id ===
            normalizedId,
        )


      if (
        plan
      ) {
        return plan
      }
    } catch {

      
    }
  }


  try {
    const response =
      await api.get<
        ApiEnvelope<
          BackendSubscriptionPlan
        >
      >(
        `${SUBSCRIPTION_PLANS_ENDPOINT}/${encodeURIComponent(
          normalizedId,
        )}`,
      )


    const raw =
      unwrapEnvelope(
        response.data,

        'دریافت اطلاعات پلن ناموفق بود.',
      )


    if (
      !isRecord(
        raw,
      )
    ) {
      throw new Error(
        'ساختار پاسخ پلن معتبر نیست.',
      )
    }


    const plan =
      mapSubscriptionPlan(
        raw,
      )


    if (
      !plan.isActive
    ) {
      return null
    }


  
    
    const existing =
      getFreshCache(
        plansCache,
      ) ??
      []


    const merged = [
      ...existing.filter(
        (
          item,
        ) =>
          item.id !==
          plan.id,
      ),

      plan,
    ].sort(
      (
        a,
        b,
      ) =>
        a.sortOrder -
        b.sortOrder,
    )


    plansCache =
      cacheValue(
        merged,
      )


    return plan
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



async function requestPublicSettings():
  Promise<PublicSubscriptionSettings> {
  try {
    const response =
      await api.get<
        ApiEnvelope<
          BackendSubscriptionSettings
        >
      >(
        SUBSCRIPTION_SETTINGS_ENDPOINT,
      )


    const data =
      unwrapEnvelope(
        response.data,

        'دریافت تنظیمات دوره رایگان ناموفق بود.',
      )


    if (
      !isRecord(
        data,
      )
    ) {
      throw new Error(
        'ساختار پاسخ تنظیمات اشتراک معتبر نیست.',
      )
    }


    const trialDays =
      readNumber(
        data.trialDays,
        Number.NaN,
      )


    if (
      !Number.isInteger(
        trialDays,
      ) ||
      trialDays <
        1 ||
      trialDays >
        365
    ) {
      throw new Error(
        'مدت دوره رایگان دریافت‌شده از سرور معتبر نیست.',
      )
    }


    return {
      trialDays,
    }
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت تنظیمات دوره رایگان ناموفق بود.',
      ),
    )
  }
}



export async function getPublicSubscriptionSettings(
  options: {
    force?: boolean
  } = {},
): Promise<PublicSubscriptionSettings> {
  if (
    !options.force
  ) {
    const cached =
      getFreshCache(
        settingsCache,
      )


    if (
      cached
    ) {
      return cached
    }


    if (
      settingsRequest
    ) {
      return settingsRequest
    }
  }


  const request =
    requestPublicSettings()
      .then(
        (
          settings,
        ) => {
          settingsCache =
            cacheValue(
              settings,
            )

          return settings
        },
      )


  settingsRequest =
    request


  try {
    return await request
  } finally {
    if (
      settingsRequest ===
      request
    ) {
      settingsRequest =
        null
    }
  }
}




export function invalidatePublicSubscriptionPlanCache():
  void {
  plansCache =
    null

  settingsCache =
    null
}