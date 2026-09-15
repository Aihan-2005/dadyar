import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'

import type {
  PublicLawyer,
} from '@/types/public-lawyer'


function uniqueStrings(
  values:
    Array<
      string |
      null |
      undefined
    >,
): string[] {
  return Array.from(
    new Set(
      values
        .map(
          (
            value,
          ) =>
            value?.trim() ??
            '',
        )
        .filter(
          Boolean,
        ),
    ),
  )
}


function buildInitials(
  firstName:
    string,

  lastName:
    string,

  fullName:
    string,
): string {
  const parts =
    [
      firstName.trim(),

      lastName.trim(),
    ].filter(
      Boolean,
    )

  if (
    parts.length >
    0
  ) {
    return parts
      .map(
        (
          part,
        ) =>
          part.charAt(
            0,
          ),
      )
      .join(
        '',
      )
      .slice(
        0,

        2,
      )
  }

  return (
    fullName
      .trim()
      .split(
        /\s+/,
      )
      .filter(
        Boolean,
      )
      .slice(
        0,

        2,
      )
      .map(
        (
          part,
        ) =>
          part.charAt(
            0,
          ),
      )
      .join(
        ''
      ) ||
    'و'
  )
}


export function mapPublicLawyerToClientPortalLawyer(
  lawyer:
    PublicLawyer,
): ClientPortalLawyer {
  const specialties =
    uniqueStrings([
      lawyer.specialization,

      ...lawyer.skills,
    ])

  return {
    id:
      lawyer.id,

    fullName:
      lawyer.fullName
        .trim(),

    title:
      lawyer.specialization
        .trim() ||
      'وکیل دادگستری',

 
      
    city:
      '',

    province:
      '',

    specialties,

    yearsExperience:
      lawyer.yearsOfExperience,


      
    rating:
      0,

    reviewCount:
      0,

    barAssociation:
      '',

    licenseNumber:
      lawyer.licenseNumber,

    officeAddress:
      lawyer.address,

    phone:
      lawyer.phone ??
      '',

    bio:
      lawyer.bio,

 
      
    consultationModes:
      [],


      
    acceptsNewClients:
      true,

    verified:
      true,

    responseTimeLabel:
      '',

    languages:
      lawyer.languages,

    avatarInitials:
      buildInitials(
        lawyer.firstName,

        lawyer.lastName,

        lawyer.fullName,
      ),
  }
}
