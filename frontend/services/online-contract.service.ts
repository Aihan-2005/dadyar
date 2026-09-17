import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  CreateOnlineContractInput,
  LawyerContractReviewInput,
  OnlineContractListParams,
  OnlineContractPage,
  OnlineContractPagination,
  OnlineContractRecord,
} from '@/features/client-portal/types/contract'

type ApiEnvelope<T> = {
  success: boolean
  data: T
  message?: string
}

type ListEnvelope = {
  success: boolean
  data: OnlineContractRecord[]
  pagination: OnlineContractPagination
  message?: string
}

const CLIENT_ENDPOINT =
  '/client/online-contracts'

const LAWYER_ENDPOINT =
  '/lawyer/online-contracts'

function assertItemEnvelope(
  payload:
    ApiEnvelope<OnlineContractRecord>,
): OnlineContractRecord {
  if (
    payload.success !==
      true ||
    !payload.data ||
    typeof payload.data !==
      'object'
  ) {
    throw new Error(
      'ساختار پاسخ قرارداد معتبر نیست.',
    )
  }

  return payload.data
}

function assertListEnvelope(
  payload:
    ListEnvelope,
): OnlineContractPage {
  if (
    payload.success !==
      true ||
    !Array.isArray(
      payload.data,
    ) ||
    !payload.pagination
  ) {
    throw new Error(
      'ساختار پاسخ فهرست قراردادها معتبر نیست.',
    )
  }

  return {
    items:
      payload.data,

    pagination:
      payload.pagination,
  }
}

function buildListParams(
  params:
    OnlineContractListParams,
) {
  const search =
    params.search?.trim()

  return {
    ...(search
      ? {
          search,
        }
      : {}),

    ...(params.status
      ? {
          status:
            params.status,
        }
      : {}),

    page:
      Math.max(
        1,
        params.page ??
          1,
      ),

    limit:
      Math.min(
        100,

        Math.max(
          1,
          params.limit ??
            100,
        ),
      ),
  }
}

async function getContractList(
  endpoint:
    string,

  params:
    OnlineContractListParams = {},
): Promise<OnlineContractPage> {
  try {
    const response =
      await api.get<
        ListEnvelope
      >(
        endpoint,

        {
          params:
            buildListParams(
              params,
            ),
        },
      )

    return assertListEnvelope(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,
        'دریافت قراردادها ناموفق بود.',
      ),
    )
  }
}

async function getContractById(
  endpoint:
    string,

  id:
    string,
): Promise<OnlineContractRecord> {
  const contractId =
    id.trim()

  if (
    !contractId
  ) {
    throw new Error(
      'شناسه قرارداد معتبر نیست.',
    )
  }

  try {
    const response =
      await api.get<
        ApiEnvelope<OnlineContractRecord>
      >(
        `${endpoint}/${encodeURIComponent(
          contractId,
        )}`,
      )

    return assertItemEnvelope(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,
        'دریافت قرارداد ناموفق بود.',
      ),
    )
  }
}

export async function createClientOnlineContract(
  input:
    CreateOnlineContractInput,
): Promise<OnlineContractRecord> {
  try {
    const response =
      await api.post<
        ApiEnvelope<OnlineContractRecord>
      >(
        CLIENT_ENDPOINT,
        input,
      )

    return assertItemEnvelope(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,
        'ثبت قرارداد انجام نشد.',
      ),
    )
  }
}

export function getClientOnlineContracts(
  params:
    OnlineContractListParams = {},
): Promise<OnlineContractPage> {
  return getContractList(
    CLIENT_ENDPOINT,
    params,
  )
}

export function getClientOnlineContractById(
  id:
    string,
): Promise<OnlineContractRecord> {
  return getContractById(
    CLIENT_ENDPOINT,
    id,
  )
}

export async function approveClientOnlineContract(
  id:
    string,
): Promise<OnlineContractRecord> {
  try {
    const response =
      await api.patch<
        ApiEnvelope<OnlineContractRecord>
      >(
        `${CLIENT_ENDPOINT}/${encodeURIComponent(
          id,
        )}/approve`,
      )

    return assertItemEnvelope(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,
        'تأیید قرارداد انجام نشد.',
      ),
    )
  }
}

export async function requestClientOnlineContractChanges(
  id:
    string,

  feedback:
    string,
): Promise<OnlineContractRecord> {
  try {
    const response =
      await api.patch<
        ApiEnvelope<OnlineContractRecord>
      >(
        `${CLIENT_ENDPOINT}/${encodeURIComponent(
          id,
        )}/request-changes`,

        {
          feedback:
            feedback.trim(),
        },
      )

    return assertItemEnvelope(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,
        'ثبت درخواست اصلاح انجام نشد.',
      ),
    )
  }
}

export function getLawyerOnlineContracts(
  params:
    OnlineContractListParams = {},
): Promise<OnlineContractPage> {
  return getContractList(
    LAWYER_ENDPOINT,
    params,
  )
}

export function getLawyerOnlineContractById(
  id:
    string,
): Promise<OnlineContractRecord> {
  return getContractById(
    LAWYER_ENDPOINT,
    id,
  )
}

export async function reviewLawyerOnlineContract(
  id:
    string,

  input:
    LawyerContractReviewInput,
): Promise<OnlineContractRecord> {
  try {
    const response =
      await api.patch<
        ApiEnvelope<OnlineContractRecord>
      >(
        `${LAWYER_ENDPOINT}/${encodeURIComponent(
          id,
        )}/review`,

        input,
      )

    return assertItemEnvelope(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,
        'ثبت بررسی قرارداد انجام نشد.',
      ),
    )
  }
}

export async function signLawyerOnlineContract(
  id:
    string,
): Promise<OnlineContractRecord> {
  try {
    const response =
      await api.patch<
        ApiEnvelope<OnlineContractRecord>
      >(
        `${LAWYER_ENDPOINT}/${encodeURIComponent(
          id,
        )}/sign`,
      )

    return assertItemEnvelope(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,
        'تأیید نهایی قرارداد انجام نشد.',
      ),
    )
  }
}

export async function rejectLawyerOnlineContract(
  id:
    string,

  reason:
    string,
): Promise<OnlineContractRecord> {
  try {
    const response =
      await api.patch<
        ApiEnvelope<OnlineContractRecord>
      >(
        `${LAWYER_ENDPOINT}/${encodeURIComponent(
          id,
        )}/reject`,

        {
          reason:
            reason.trim(),
        },
      )

    return assertItemEnvelope(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,
        'رد قرارداد انجام نشد.',
      ),
    )
  }
}