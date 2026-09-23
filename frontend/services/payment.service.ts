import axios from 'axios'

import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import {
  isSubscriptionPlanId,
} from '@/lib/subscription-plans'

import type {
  CreateSubscriptionPaymentResult,
  LawyerPayment,
  PaymentFulfillmentStatus,
  PaymentStatus,
} from '@/features/payment/types'


interface ApiEnvelope<T> {
  success:
    boolean

  data:
    T

  message?:
    string
}


interface BackendCreatePaymentResult {
  paymentId?:
    unknown

  redirectUrl?:
    unknown

  amount?:
    unknown

  currency?:
    unknown
}


interface BackendPayment {
  id?:
    unknown

  _id?:
    unknown

  plan?:
    unknown

  amount?:
    unknown

  currency?:
    unknown

  status?:
    unknown

  fulfillmentStatus?:
    unknown

  referenceId?:
    unknown

  cardPan?:
    unknown

  paidAt?:
    unknown

  cancelledAt?:
    unknown

  failedAt?:
    unknown

  reversedAt?:
    unknown

  createdAt?:
    unknown
}


const PAYMENT_ENDPOINT =
  '/payments'


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
    ? value.trim()
    : ''
}


function readNullableString(
  value:
    unknown,
): string | null {
  const normalized =
    readString(
      value,
    )

  return normalized ||
    null
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


function readPaymentStatus(
  value:
    unknown,
): PaymentStatus {
  switch (
    value
  ) {
    case 'PENDING':
    case 'PAID':
    case 'FAILED':
    case 'CANCELLED':
    case 'REVERSED':
      return value

    default:
      throw new Error(
        'وضعیت پرداخت دریافت‌شده از سرور معتبر نیست.',
      )
  }
}


function readFulfillmentStatus(
  value:
    unknown,
): PaymentFulfillmentStatus {
  switch (
    value
  ) {
    case 'PENDING':
    case 'FULFILLED':
    case 'REQUIRES_ACTION':
    case 'NOT_APPLICABLE':
      return value

    default:
      throw new Error(
        'وضعیت فعال‌سازی اشتراک معتبر نیست.',
      )
  }
}


function isMongoId(
  value:
    string,
): boolean {
  return /^[a-f\d]{24}$/i.test(
    value,
  )
}


function normalizeZarinPalRedirectUrl(
  value:
    unknown,
): string {
  const raw =
    readString(
      value,
    )

  if (
    !raw
  ) {
    throw new Error(
      'آدرس درگاه پرداخت از سرور دریافت نشد.',
    )
  }


  let url:
    URL

  try {
    url =
      new URL(
        raw,
      )
  } catch {
    throw new Error(
      'آدرس درگاه پرداخت معتبر نیست.',
    )
  }


  if (
    url.protocol !==
      'https:'
  ) {
    throw new Error(
      'ارتباط با درگاه پرداخت امن نیست.',
    )
  }


  const hostname =
    url.hostname
      .toLowerCase()


  const isZarinPalHost =
    hostname ===
      'zarinpal.com' ||
    hostname.endsWith(
      '.zarinpal.com',
    )


  if (
    !isZarinPalHost
  ) {
    throw new Error(
      'آدرس درگاه پرداخت مورد تأیید نیست.',
    )
  }


  return url.toString()
}


function extractBackendCode(
  error:
    unknown,
): string | null {
  if (
    !axios.isAxiosError(
      error,
    )
  ) {
    return null
  }


  const data =
    error.response
      ?.data

  if (
    !isRecord(
      data,
    )
  ) {
    return null
  }


  return readNullableString(
    data.code,
  )
}


export function getPaymentErrorMessage(
  error:
    unknown,
): string {
  const code =
    extractBackendCode(
      error,
    )


  switch (
    code
  ) {
    case 'LAWYER_SUBSCRIPTION_ALREADY_ACTIVE':
      return 'در حال حاضر اشتراک فعالی دارید. خرید پلن جدید پس از پایان اشتراک فعلی امکان‌پذیر است.'

    case 'PAYMENT_CHECKOUT_ALREADY_PENDING':
      return 'یک پرداخت در انتظار برای پلن دیگری دارید. ابتدا وضعیت پرداخت قبلی باید مشخص شود.'

    case 'PAYMENT_CHECKOUT_INITIALIZING':
      return 'درخواست پرداخت قبلی هنوز در حال آماده‌سازی است. چند لحظه دیگر دوباره تلاش کنید.'

    case 'PAYMENT_AMOUNT_TOO_LOW':
      return 'مبلغ این پلن برای ایجاد پرداخت معتبر نیست.'

    case 'PAYMENT_PROVIDER_REQUEST_FAILED':
      return 'ارتباط با درگاه زرین‌پال برقرار نشد. دوباره تلاش کنید.'

    case 'ACTIVE_SUBSCRIPTION_REQUIRED':
      return 'برای انجام این عملیات وضعیت اشتراک شما معتبر نیست.'

    default:
      return getApiErrorMessage(
        error,
        'ایجاد پرداخت ناموفق بود.',
      )
  }
}


function mapCreatePaymentResult(
  value:
    BackendCreatePaymentResult,
): CreateSubscriptionPaymentResult {
  const paymentId =
    readString(
      value.paymentId,
    )


  if (
    !isMongoId(
      paymentId,
    )
  ) {
    throw new Error(
      'شناسه پرداخت دریافت‌شده از سرور معتبر نیست.',
    )
  }


  const amount =
    readNumber(
      value.amount,
      -1,
    )


  if (
    !Number.isSafeInteger(
      amount,
    ) ||
    amount <
      0
  ) {
    throw new Error(
      'مبلغ پرداخت دریافت‌شده از سرور معتبر نیست.',
    )
  }


  const currency =
    readString(
      value.currency,
    )


  if (
    !currency
  ) {
    throw new Error(
      'واحد پول پرداخت از سرور دریافت نشد.',
    )
  }


  return {
    paymentId,

    redirectUrl:
      normalizeZarinPalRedirectUrl(
        value.redirectUrl,
      ),

    amount,

    currency,
  }
}


function mapPayment(
  raw:
    BackendPayment,
): LawyerPayment {
  const id =
    readString(
      raw.id ??
      raw._id,
    )


  if (
    !isMongoId(
      id,
    )
  ) {
    throw new Error(
      'شناسه پرداخت معتبر نیست.',
    )
  }


  if (
    !isRecord(
      raw.plan,
    )
  ) {
    throw new Error(
      'اطلاعات پلن پرداخت معتبر نیست.',
    )
  }


  const planId =
    readString(
      raw.plan.id,
    )


  const title =
    readString(
      raw.plan.title,
    )


  if (
    !planId ||
    !title
  ) {
    throw new Error(
      'اطلاعات پلن پرداخت ناقص است.',
    )
  }


  const durationMonthsValue =
    readNumber(
      raw.plan.durationMonths,
      Number.NaN,
    )


  return {
    id,

    plan: {
      id:
        planId,

      title,

      tier:
        readString(
          raw.plan.tier,
        ),

      durationMonths:
        Number.isFinite(
          durationMonthsValue,
        )
          ? durationMonthsValue
          : null,
    },

    amount:
      Math.max(
        0,
        Math.round(
          readNumber(
            raw.amount,
          ),
        ),
      ),

    currency:
      readString(
        raw.currency,
      ),

    status:
      readPaymentStatus(
        raw.status,
      ),

    fulfillmentStatus:
      readFulfillmentStatus(
        raw.fulfillmentStatus,
      ),

    referenceId:
      readNullableString(
        raw.referenceId,
      ),

    cardPan:
      readNullableString(
        raw.cardPan,
      ),

    paidAt:
      readNullableString(
        raw.paidAt,
      ),

    cancelledAt:
      readNullableString(
        raw.cancelledAt,
      ),

    failedAt:
      readNullableString(
        raw.failedAt,
      ),

    reversedAt:
      readNullableString(
        raw.reversedAt,
      ),

    createdAt:
      readString(
        raw.createdAt,
      ),
  }
}


export function isPaymentId(
  value:
    string |
    null |
    undefined,
): value is string {
  return (
    typeof value ===
      'string' &&
    isMongoId(
      value.trim(),
    )
  )
}


export async function createSubscriptionPayment(
  planId:
    string,
): Promise<CreateSubscriptionPaymentResult> {
  const normalizedPlanId =
    planId.trim()


  if (
    !isSubscriptionPlanId(
      normalizedPlanId,
    )
  ) {
    throw new Error(
      'شناسه پلن انتخاب‌شده معتبر نیست.',
    )
  }


  try {
  
    const response =
      await api.post<
        ApiEnvelope<BackendCreatePaymentResult>
      >(
        `${PAYMENT_ENDPOINT}/subscriptions`,

        {
          planId:
            normalizedPlanId,
        },
      )


    if (
      response.data.success !==
      true
    ) {
      throw new Error(
        response.data.message ||
        'ایجاد پرداخت ناموفق بود.',
      )
    }


    return mapCreatePaymentResult(
      response.data.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getPaymentErrorMessage(
        error,
      ),
    )
  }
}


export async function getMyPayment(
  paymentId:
    string,
): Promise<LawyerPayment> {
  const normalizedId =
    paymentId.trim()


  if (
    !isPaymentId(
      normalizedId,
    )
  ) {
    throw new Error(
      'شناسه پرداخت معتبر نیست.',
    )
  }


  try {
    const response =
      await api.get<
        ApiEnvelope<BackendPayment>
      >(
        `${PAYMENT_ENDPOINT}/${encodeURIComponent(
          normalizedId,
        )}`,
      )


    if (
      response.data.success !==
      true
    ) {
      throw new Error(
        response.data.message ||
        'دریافت نتیجه پرداخت ناموفق بود.',
      )
    }


    return mapPayment(
      response.data.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,
        'دریافت نتیجه پرداخت ناموفق بود.',
      ),
    )
  }
}

 
export async function createPayment(
  payload: {
    planId:
      string

    amount?:
      number

    coupon?:
      string

    referral?:
      string
  },
): Promise<CreateSubscriptionPaymentResult> {
  return createSubscriptionPayment(
    payload.planId,
  )
}