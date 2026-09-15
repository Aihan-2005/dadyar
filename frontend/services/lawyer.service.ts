import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  Education,
  Experience,
  LawyerDirectoryBlockedReason,
  LawyerDirectoryMissingField,
  LawyerDirectoryPublicationState,
  LawyerProfile,
  Skill,
  SkillLevel,
} from '@/types/lawyer'


type UnknownRecord =
  Record<string, unknown>


const LAWYER_PROFILE_CHANGED_EVENT =
  'dadyar:lawyer-profile:changed'


function isBrowser(): boolean {
  return typeof window !==
    'undefined'
}


function notifyLawyerProfileChanged(): void {
  if (
    !isBrowser()
  ) {
    return
  }

  window.dispatchEvent(
    new Event(
      LAWYER_PROFILE_CHANGED_EVENT,
    ),
  )
}


export function subscribeLawyerProfileChanges(
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
    LAWYER_PROFILE_CHANGED_EVENT,
    listener,
  )


  return () => {
    window.removeEventListener(
      LAWYER_PROFILE_CHANGED_EVENT,
      listener,
    )
  }
}


function isRecord(
  value:
    unknown,
): value is UnknownRecord {
  return (
    typeof value ===
      'object' &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
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
  const parsed =
    readString(
      value,
    ).trim()


  return parsed ||
    null
}


function readNumber(
  value:
    unknown,
): number {
  if (
    typeof value ===
      'number' &&
    Number.isFinite(
      value,
    )
  ) {
    return value
  }


  if (
    typeof value ===
      'string' &&
    value.trim() !==
      ''
  ) {
    const parsedValue =
      Number(
        value,
      )


    return Number.isFinite(
      parsedValue,
    )
      ? parsedValue
      : 0
  }


  return 0
}


function readArray(
  value:
    unknown,
): unknown[] {
  return Array.isArray(
    value,
  )
    ? value
    : []
}


function readSkillLevel(
  value:
    unknown,
): SkillLevel {
  const numericValue =
    readNumber(
      value,
    )


  switch (
    numericValue
  ) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      return numericValue

    default:
      return 3
  }
}


function parseEducation(
  value:
    unknown,

  index:
    number,
): Education | null {
  if (
    !isRecord(
      value,
    )
  ) {
    return null
  }


  return {
    id:
      readString(
        value.id,
      ) ||
      `education-${index}`,

    degree:
      readString(
        value.degree,
      ),

    field:
      readString(
        value.field,
      ),

    university:
      readString(
        value.university,
      ),

    year:
      readString(
        value.year,
      ),
  }
}


function parseExperience(
  value:
    unknown,

  index:
    number,
): Experience | null {
  if (
    !isRecord(
      value,
    )
  ) {
    return null
  }


  return {
    id:
      readString(
        value.id,
      ) ||
      `experience-${index}`,

    title:
      readString(
        value.title,
      ),

    company:
      readString(
        value.company,
      ),

    startYear:
      readString(
        value.startYear,
      ),

    endYear:
      readString(
        value.endYear,
      ),

    description:
      readString(
        value.description,
      ),
  }
}


function parseSkill(
  value:
    unknown,

  index:
    number,
): Skill | null {
  if (
    !isRecord(
      value,
    )
  ) {
    return null
  }


  return {
    id:
      readString(
        value.id,
      ) ||
      `skill-${index}`,

    name:
      readString(
        value.name,
      ),

    level:
      readSkillLevel(
        value.level,
      ),
  }
}


function parseLawyerProfile(
  value:
    unknown,
): LawyerProfile {
  if (
    !isRecord(
      value,
    )
  ) {
    throw new Error(
      'ساختار پروفایل دریافتی از سرور معتبر نیست.',
    )
  }


  const education =
    readArray(
      value.education,
    )
      .map(
        parseEducation,
      )
      .filter(
        (
          item,
        ): item is Education =>
          item !==
          null,
      )


  const experience =
    readArray(
      value.experience,
    )
      .map(
        parseExperience,
      )
      .filter(
        (
          item,
        ): item is Experience =>
          item !==
          null,
      )


  const skills =
    readArray(
      value.skills,
    )
      .map(
        parseSkill,
      )
      .filter(
        (
          item,
        ): item is Skill =>
          item !==
          null,
      )


  const languages =
    readArray(
      value.languages,
    )
      .map(
        readString,
      )
      .filter(
        (
          language,
        ) =>
          language
            .trim()
            .length >
          0,
      )


  return {
    specialization:
      readString(
        value.specialization,
      ),

    licenseNumber:
      readString(
        value.licenseNumber,
      ),

    yearsOfExperience:
      readNumber(
        value.yearsOfExperience,
      ),

    phone:
      readString(
        value.phone,
      ),

    website:
      readString(
        value.website,
      ),

    address:
      readString(
        value.address,
      ),

    bio:
      readString(
        value.bio,
      ),

    education,

    experience,

    skills,

    languages,
  }
}


function extractProfileFromResponse(
  response:
    unknown,
): LawyerProfile {
  if (
    !isRecord(
      response,
    )
  ) {
    throw new Error(
      'پاسخ سرور معتبر نیست.',
    )
  }


  if (
    response.success !==
    true
  ) {
    throw new Error(
      readString(
        response.message,
      ) ||
        'عملیات پروفایل ناموفق بود.',
    )
  }


  if (
    !isRecord(
      response.data,
    )
  ) {
    throw new Error(
      'داده پروفایل در پاسخ سرور وجود ندارد.',
    )
  }


  return parseLawyerProfile(
    response.data.profile,
  )
}


function readBlockedReason(
  value:
    unknown,
): LawyerDirectoryBlockedReason | null {
  switch (
    value
  ) {
    case 'LAWYER_SUSPENDED':
    case 'LAWYER_REJECTED':
    case 'ACCOUNT_NOT_ACTIVE':
      return value

    default:
      return null
  }
}


function readMissingFields(
  value:
    unknown,
): LawyerDirectoryMissingField[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return []
  }


  return value.flatMap(
    (
      item,
    ) => {
      if (
        !isRecord(
          item,
        )
      ) {
        return []
      }


      const key =
        readString(
          item.key,
        ).trim()


      const label =
        readString(
          item.label,
        ).trim()


      if (
        !key ||
        !label
      ) {
        return []
      }


      return [
        {
          key,
          label,
        },
      ]
    },
  )
}


function parseDirectoryPublicationState(
  value:
    unknown,
): LawyerDirectoryPublicationState {
  if (
    !isRecord(
      value,
    ) ||
    typeof value.isVisible !==
      'boolean' ||
    typeof value.isFeatured !==
      'boolean' ||
    typeof value.profileComplete !==
      'boolean' ||
    typeof value.canPublish !==
      'boolean'
  ) {
    throw new Error(
      'ساختار وضعیت انتشار پروفایل وکیل معتبر نیست.',
    )
  }


  const displayOrder =
    value.displayOrder ===
      null
      ? null
      : typeof value.displayOrder ===
            'number' &&
          Number.isFinite(
            value.displayOrder,
          )
        ? value.displayOrder
        : null


  return {
    isVisible:
      value.isVisible,

    isFeatured:
      value.isFeatured,

    displayOrder,

    publishedAt:
      readNullableString(
        value.publishedAt,
      ),

    profileComplete:
      value.profileComplete,

    canPublish:
      value.canPublish,

    missingFields:
      readMissingFields(
        value.missingFields,
      ),

    blockedReason:
      readBlockedReason(
        value.blockedReason,
      ),
  }
}


function extractDirectoryStateFromResponse(
  response:
    unknown,
): LawyerDirectoryPublicationState {
  if (
    !isRecord(
      response,
    ) ||
    response.success !==
      true
  ) {
    throw new Error(
      isRecord(
        response,
      )
        ? readString(
            response.message,
          ) ||
          'دریافت وضعیت انتشار پروفایل ناموفق بود.'
        : 'پاسخ سرور معتبر نیست.',
    )
  }


  return parseDirectoryPublicationState(
    response.data,
  )
}


export async function getLawyerProfile():
  Promise<LawyerProfile> {
  try {
    const response =
      await api.get<unknown>(
        '/lawyers/me/profile',
      )


    return extractProfileFromResponse(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت پروفایل وکیل ناموفق بود.',
      ),
    )
  }
}


export async function updateLawyerProfile(
  profile:
    LawyerProfile,
): Promise<LawyerProfile> {
  try {
    const response =
      await api.put<unknown>(
        '/lawyers/me/profile',

        profile,
      )


    const result =
      extractProfileFromResponse(
        response.data,
      )


    /*
     * کارت انتشار پروفایل بدون Refresh دستی
     * وضعیت completeness را دوباره می‌گیرد.
     */
    notifyLawyerProfileChanged()


    return result
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'ذخیره پروفایل وکیل ناموفق بود.',
      ),
    )
  }
}


export async function getLawyerDirectoryPublicationState():
  Promise<LawyerDirectoryPublicationState> {
  try {
    const response =
      await api.get<unknown>(
        '/lawyers/me/client-directory',
      )


    return extractDirectoryStateFromResponse(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        'دریافت وضعیت نمایش پروفایل در بخش موکلین ناموفق بود.',
      ),
    )
  }
}


export async function setLawyerDirectoryVisibility(
  isVisible:
    boolean,
): Promise<LawyerDirectoryPublicationState> {
  try {
    const response =
      await api.patch<unknown>(
        '/lawyers/me/client-directory',

        {
          isVisible,
        },
      )


    return extractDirectoryStateFromResponse(
      response.data,
    )
  } catch (
    error:
      unknown
  ) {
    throw new Error(
      getApiErrorMessage(
        error,

        isVisible
          ? 'نمایش پروفایل در بخش موکلین ناموفق بود.'
          : 'حذف پروفایل از بخش موکلین ناموفق بود.',
      ),
    )
  }
}


export const saveLawyerProfile =
  updateLawyerProfile

  