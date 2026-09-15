import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  ClientLawyerInquiry,
  ClientLawyerInquiryListParams,
  ClientLawyerInquiryPage,
  ClientLawyerInquiryPagination,
  CreateClientLawyerInquiryInput,
  LawyerClientInquiry,
  LawyerInquiryDecisionInput,
} from '@/types/client-lawyer-inquiry'


type ApiEnvelope<T> = {
  success: boolean

  data: T

  message?: string
}


type ListEnvelope<T> = {
  success: boolean

  data: T[]

  pagination:
    ClientLawyerInquiryPagination

  message?: string
}


const CLIENT_INQUIRIES_ENDPOINT =
  '/client/lawyer-inquiries'


const LAWYER_INQUIRIES_ENDPOINT =
  '/lawyer/client-inquiries'


function buildListParams(
  params:
    ClientLawyerInquiryListParams,
) {
  const search =
    params.search?.trim()

  return {
    ...(params.status
      ? {
          status:
            params.status,
        }
      : {}),

    ...(search
      ? {
          search,
        }
      : {}),

    page:
      Math.max(
        params.page ??
          1,

        1,
      ),

    limit:
      Math.min(
        Math.max(
          params.limit ??
            20,

          1,
        ),

        100,
      ),
  }
}


function readItem<T>(
  payload:
    ApiEnvelope<T>,

  fallbackMessage:
    string,
): T {
  if (
    payload.success !==
      true ||
    !payload.data
  ) {
    throw new Error(
      fallbackMessage,
    )
  }

  return payload.data
}


function readPage<T>(
  payload:
    ListEnvelope<T>,

  fallbackMessage:
    string,
): ClientLawyerInquiryPage<T> {
  if (
    payload.success !==
      true ||
    !Array.isArray(
      payload.data,
    ) ||
    !payload.pagination
  ) {
    throw new Error(
      fallbackMessage,
    )
  }

  return {
    items:
      payload.data,

    pagination:
      payload.pagination,
  }
}


export async function createClientLawyerInquiry(
  input:
    CreateClientLawyerInquiryInput,
): Promise<ClientLawyerInquiry> {
  try {
    const response =
      await api.post<
        ApiEnvelope<ClientLawyerInquiry>
      >(
        CLIENT_INQUIRIES_ENDPOINT,

        input,
      )

    return readItem(
      response.data,

      'ساختار پاسخ ثبت درخواست بررسی معتبر نیست.',
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'ثبت درخواست بررسی ناموفق بود.',
      ),
    )
  }
}


export async function getClientLawyerInquiries(
  params:
    ClientLawyerInquiryListParams = {},
): Promise<
  ClientLawyerInquiryPage<ClientLawyerInquiry>
> {
  try {
    const response =
      await api.get<
        ListEnvelope<ClientLawyerInquiry>
      >(
        CLIENT_INQUIRIES_ENDPOINT,

        {
          params:
            buildListParams(
              params,
            ),
        },
      )

    return readPage(
      response.data,

      'ساختار پاسخ درخواست‌های بررسی معتبر نیست.',
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت درخواست‌های بررسی ناموفق بود.',
      ),
    )
  }
}


export async function getClientLawyerInquiryById(
  inquiryId:
    string,
): Promise<ClientLawyerInquiry> {
  try {
    const response =
      await api.get<
        ApiEnvelope<ClientLawyerInquiry>
      >(
        `${CLIENT_INQUIRIES_ENDPOINT}/${encodeURIComponent(
          inquiryId,
        )}`,
      )

    return readItem(
      response.data,

      'ساختار پاسخ درخواست بررسی معتبر نیست.',
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت درخواست بررسی ناموفق بود.',
      ),
    )
  }
}


export async function cancelClientLawyerInquiry(
  inquiryId:
    string,
): Promise<ClientLawyerInquiry> {
  try {
    const response =
      await api.post<
        ApiEnvelope<ClientLawyerInquiry>
      >(
        `${CLIENT_INQUIRIES_ENDPOINT}/${encodeURIComponent(
          inquiryId,
        )}/cancel`,
      )

    return readItem(
      response.data,

      'ساختار پاسخ لغو درخواست معتبر نیست.',
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'لغو درخواست بررسی ناموفق بود.',
      ),
    )
  }
}


export async function getLawyerClientInquiries(
  params:
    ClientLawyerInquiryListParams = {},
): Promise<
  ClientLawyerInquiryPage<LawyerClientInquiry>
> {
  try {
    const response =
      await api.get<
        ListEnvelope<LawyerClientInquiry>
      >(
        LAWYER_INQUIRIES_ENDPOINT,

        {
          params:
            buildListParams(
              params,
            ),
        },
      )

    return readPage(
      response.data,

      'ساختار پاسخ درخواست‌های موکلین معتبر نیست.',
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت درخواست‌های موکلین ناموفق بود.',
      ),
    )
  }
}


export async function getLawyerClientInquiryById(
  inquiryId:
    string,
): Promise<LawyerClientInquiry> {
  try {
    const response =
      await api.get<
        ApiEnvelope<LawyerClientInquiry>
      >(
        `${LAWYER_INQUIRIES_ENDPOINT}/${encodeURIComponent(
          inquiryId,
        )}`,
      )

    return readItem(
      response.data,

      'ساختار پاسخ درخواست موکل معتبر نیست.',
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت درخواست موکل ناموفق بود.',
      ),
    )
  }
}


export async function updateLawyerClientInquiry(
  inquiryId:
    string,

  input:
    LawyerInquiryDecisionInput,
): Promise<LawyerClientInquiry> {
  try {
    const response =
      await api.patch<
        ApiEnvelope<LawyerClientInquiry>
      >(
        `${LAWYER_INQUIRIES_ENDPOINT}/${encodeURIComponent(
          inquiryId,
        )}`,

        input,
      )

    return readItem(
      response.data,

      'ساختار پاسخ بروزرسانی درخواست معتبر نیست.',
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'بروزرسانی درخواست موکل ناموفق بود.',
      ),
    )
  }
}