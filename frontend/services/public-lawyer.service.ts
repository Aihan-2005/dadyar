import axios from 'axios'

import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  PublicLawyer,
  PublicLawyerListParams,
  PublicLawyerPage,
  PublicLawyerPagination,
} from '@/types/public-lawyer'


type ApiEnvelope<T> = {
  success: boolean

  data: T

  message?: string
}


type LawyerListEnvelope = {
  success: boolean

  data: PublicLawyer[]

  pagination: PublicLawyerPagination

  message?: string
}


const DIRECTORY_ENDPOINT =
  '/lawyers/directory'


function normalizeString(
  value: unknown,
): string {
  return typeof value === 'string'
    ? value.trim()
    : ''
}


function normalizeNullableString(
  value: unknown,
): string | null {
  const normalized =
    normalizeString(value)

  return normalized || null
}


function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item === 'string',
    )
    .map(
      (item) =>
        item.trim(),
    )
    .filter(Boolean)
}


function normalizeLawyer(
  value: PublicLawyer,
): PublicLawyer {
  const firstName =
    normalizeString(
      value.firstName,
    )

  const lastName =
    normalizeString(
      value.lastName,
    )

  const fullName =
    normalizeString(
      value.fullName,
    ) ||
    [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(' ')

  return {
    id:
      normalizeString(
        value.id,
      ),

    firstName,

    lastName,

    fullName,

    phone:
      normalizeNullableString(
        value.phone,
      ),

    email:
      normalizeNullableString(
        value.email,
      ),

    specialization:
      normalizeString(
        value.specialization,
      ),

    licenseNumber:
      normalizeString(
        value.licenseNumber,
      ),

    yearsOfExperience:
      Number.isFinite(
        value.yearsOfExperience,
      )
        ? Math.max(
            0,
            Number(
              value.yearsOfExperience,
            ),
          )
        : 0,

    website:
      normalizeNullableString(
        value.website,
      ),

    address:
      normalizeString(
        value.address,
      ),

    bio:
      normalizeString(
        value.bio,
      ),

    skills:
      normalizeStringArray(
        value.skills,
      ),

    languages:
      normalizeStringArray(
        value.languages,
      ),

    isFeatured:
      value.isFeatured === true,

    displayOrder:
      Number.isFinite(
        value.displayOrder,
      )
        ? Math.max(
            0,
            Number(
              value.displayOrder,
            ),
          )
        : 0,

    publishedAt:
      normalizeNullableString(
        value.publishedAt,
      ),
  }
}


function buildDirectoryParams(
  params: PublicLawyerListParams,
) {
  const search =
    params.search?.trim()

  const specialization =
    params.specialization?.trim()

  return {
    ...(search
      ? {
          search,
        }
      : {}),

    ...(specialization
      ? {
          specialization,
        }
      : {}),

    ...(params.featuredOnly !==
    undefined
      ? {
          featuredOnly:
            params.featuredOnly,
        }
      : {}),

    page:
      Math.max(
        params.page ?? 1,
        1,
      ),

    limit:
      Math.min(
        Math.max(
          params.limit ?? 20,
          1,
        ),
        100,
      ),
  }
}


function assertListEnvelope(
  payload: LawyerListEnvelope,
): void {
  if (
    payload.success !== true ||
    !Array.isArray(
      payload.data,
    ) ||
    !payload.pagination
  ) {
    throw new Error(
      'ساختار پاسخ فهرست وکلا معتبر نیست.',
    )
  }
}


function assertItemEnvelope(
  payload: ApiEnvelope<PublicLawyer>,
): void {
  if (
    payload.success !== true ||
    !payload.data ||
    typeof payload.data !==
      'object'
  ) {
    throw new Error(
      'ساختار پاسخ اطلاعات وکیل معتبر نیست.',
    )
  }
}


export async function getPublicLawyersPage(
  params:
    PublicLawyerListParams = {},
): Promise<PublicLawyerPage> {
  try {
    const response =
      await api.get<LawyerListEnvelope>(
        DIRECTORY_ENDPOINT,
        {
          params:
            buildDirectoryParams(
              params,
            ),
        },
      )

    assertListEnvelope(
      response.data,
    )

    return {
      items:
        response.data.data.map(
          normalizeLawyer,
        ),

      pagination:
        response.data.pagination,
    }
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'دریافت فهرست وکلا ناموفق بود.',
      ),
    )
  }
}


export async function getPublicLawyers(
  params:
    PublicLawyerListParams = {},
): Promise<PublicLawyer[]> {
  const firstPage =
    await getPublicLawyersPage({
      ...params,

      page:
        params.page ?? 1,

      limit:
        params.limit ?? 100,
    })

  if (
    params.page !== undefined ||
    firstPage.pagination.totalPages <=
      1
  ) {
    return firstPage.items
  }

  const remainingPages =
    await Promise.all(
      Array.from(
        {
          length:
            firstPage.pagination
              .totalPages - 1,
        },
        (
          _,
          index,
        ) =>
          getPublicLawyersPage({
            ...params,

            page:
              index + 2,

            limit:
              firstPage.pagination
                .limit,
          }),
      ),
    )

  return [
    ...firstPage.items,

    ...remainingPages.flatMap(
      (page) =>
        page.items,
    ),
  ]
}


export async function getPublicLawyerById(
  id: string,
): Promise<PublicLawyer | null> {
  const lawyerId =
    id.trim()

  if (!lawyerId) {
    return null
  }

  try {
    const response =
      await api.get<
        ApiEnvelope<PublicLawyer>
      >(
        `${DIRECTORY_ENDPOINT}/${encodeURIComponent(
          lawyerId,
        )}`,
      )

    assertItemEnvelope(
      response.data,
    )

    return normalizeLawyer(
      response.data.data,
    )
  } catch (error: unknown) {
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
        'دریافت اطلاعات وکیل ناموفق بود.',
      ),
    )
  }
}


export async function getPublicLawyerSpecializations(): Promise<
  string[]
> {
  const lawyers =
    await getPublicLawyers()

  return Array.from(
    new Set(
      lawyers
        .map(
          (lawyer) =>
            lawyer.specialization.trim(),
        )
        .filter(Boolean),
    ),
  ).sort(
    (
      first,
      second,
    ) =>
      first.localeCompare(
        second,
        'fa',
      ),
  )
}