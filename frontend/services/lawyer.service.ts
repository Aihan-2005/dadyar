import {
  api,
  getApiErrorMessage,
} from '@/lib/api'

import type {
  Education,
  Experience,
  LawyerProfile,
  Skill,
  SkillLevel,
} from '@/types/lawyer'

type UnknownRecord =
  Record<string, unknown>

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function readString(
  value: unknown,
): string {
  return typeof value === 'string'
    ? value
    : ''
}

function readNumber(
  value: unknown,
): number {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value
  }

  if (
    typeof value === 'string' &&
    value.trim() !== ''
  ) {
    const parsedValue =
      Number(value)

    return Number.isFinite(
      parsedValue,
    )
      ? parsedValue
      : 0
  }

  return 0
}

function readArray(
  value: unknown,
): unknown[] {
  return Array.isArray(value)
    ? value
    : []
}

function readSkillLevel(
  value: unknown,
): SkillLevel {
  const numericValue =
    readNumber(value)

  switch (numericValue) {
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
  value: unknown,
  index: number,
): Education | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id:
      readString(value.id) ||
      `education-${index}`,

    degree:
      readString(value.degree),

    field:
      readString(value.field),

    university:
      readString(
        value.university,
      ),

    year:
      readString(value.year),
  }
}

function parseExperience(
  value: unknown,
  index: number,
): Experience | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id:
      readString(value.id) ||
      `experience-${index}`,

    title:
      readString(value.title),

    company:
      readString(value.company),

    startYear:
      readString(
        value.startYear,
      ),

    endYear:
      readString(value.endYear),

    description:
      readString(
        value.description,
      ),
  }
}

function parseSkill(
  value: unknown,
  index: number,
): Skill | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id:
      readString(value.id) ||
      `skill-${index}`,

    name:
      readString(value.name),

    level:
      readSkillLevel(
        value.level,
      ),
  }
}

function parseLawyerProfile(
  value: unknown,
): LawyerProfile {
  if (!isRecord(value)) {
    throw new Error(
      'ساختار پروفایل دریافتی از سرور معتبر نیست.',
    )
  }

  const education =
    readArray(value.education)
      .map(parseEducation)
      .filter(
        (
          item,
        ): item is Education =>
          item !== null,
      )

  const experience =
    readArray(value.experience)
      .map(parseExperience)
      .filter(
        (
          item,
        ): item is Experience =>
          item !== null,
      )

  const skills =
    readArray(value.skills)
      .map(parseSkill)
      .filter(
        (
          item,
        ): item is Skill =>
          item !== null,
      )

  const languages =
    readArray(value.languages)
      .map(readString)
      .filter(
        (language) =>
          language.trim().length >
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
      readString(value.phone),

    website:
      readString(value.website),

    address:
      readString(value.address),

    bio:
      readString(value.bio),

    education,
    experience,
    skills,
    languages,
  }
}

function extractProfileFromResponse(
  response: unknown,
): LawyerProfile {
  if (!isRecord(response)) {
    throw new Error(
      'پاسخ سرور معتبر نیست.',
    )
  }

  if (
    response.success !== true
  ) {
    throw new Error(
      readString(
        response.message,
      ) ||
        'عملیات پروفایل ناموفق بود.',
    )
  }

  if (!isRecord(response.data)) {
    throw new Error(
      'داده پروفایل در پاسخ سرور وجود ندارد.',
    )
  }

  return parseLawyerProfile(
    response.data.profile,
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
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'دریافت پروفایل وکیل ناموفق بود.',
      ),
    )
  }
}

export async function updateLawyerProfile(
  profile: LawyerProfile,
): Promise<LawyerProfile> {
  try {
    const response =
      await api.put<unknown>(
        '/lawyers/me/profile',
        profile,
      )

    return extractProfileFromResponse(
      response.data,
    )
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'ذخیره پروفایل وکیل ناموفق بود.',
      ),
    )
  }
}


export const saveLawyerProfile =
  updateLawyerProfile