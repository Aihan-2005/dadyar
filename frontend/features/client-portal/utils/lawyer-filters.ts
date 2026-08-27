import type {
  ClientPortalLawyer,
  LawyerDirectoryFilters,
} from '@/features/client-portal/types/lawyer'




function normalizeSearchText(
  value:
    string
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      'fa-IR'
    )
    .replace(
      /ي/g,
      'ی'
    )
    .replace(
      /ك/g,
      'ک'
    )
    .replace(
      /\s+/g,
      ' '
    )
}



export function getLawyerCities(
  lawyers:
    readonly ClientPortalLawyer[]
): string[] {
  return Array.from(
    new Set(
      lawyers.map(
        (lawyer) =>
          lawyer.city
      )
    )
  ).sort(
    (
      first,
      second
    ) =>
      first.localeCompare(
        second,
        'fa'
      )
  )
}

export function getLawyerSpecialties(
  lawyers:
    readonly ClientPortalLawyer[]
): string[] {
  return Array.from(
    new Set(
      lawyers.flatMap(
        (lawyer) =>
          lawyer.specialties
      )
    )
  ).sort(
    (
      first,
      second
    ) =>
      first.localeCompare(
        second,
        'fa'
      )
  )
}


function matchesSearch(
  lawyer:
    ClientPortalLawyer,

  rawSearch:
    string
): boolean {
  const search =
    normalizeSearchText(
      rawSearch
    )

  if (!search) {
    return true
  }

  const searchableText =
    normalizeSearchText(
      [
        lawyer.fullName,
        lawyer.title,
        lawyer.city,
        lawyer.province,
        lawyer.barAssociation,
        lawyer.bio,
        ...lawyer.specialties,
        ...lawyer.languages,
      ].join(
        ' '
      )
    )

  return searchableText.includes(
    search
  )
}





export function filterLawyers(
  lawyers:
    readonly ClientPortalLawyer[],

  filters:
    LawyerDirectoryFilters
): ClientPortalLawyer[] {
  const filtered =
    lawyers.filter(
      (lawyer) => {
        if (
          !matchesSearch(
            lawyer,
            filters.search
          )
        ) {
          return false
        }

        if (
          filters.city &&
          lawyer.city !==
            filters.city
        ) {
          return false
        }

        if (
          filters.specialty &&
          !lawyer.specialties.includes(
            filters.specialty
          )
        ) {
          return false
        }

        if (
          filters.consultationMode !==
            'all' &&
          !lawyer.consultationModes.includes(
            filters.consultationMode
          )
        ) {
          return false
        }

        if (
          filters.acceptsNewClientsOnly &&
          !lawyer.acceptsNewClients
        ) {
          return false
        }

        return true
      }
    )

  return [
    ...filtered,
  ].sort(
    (
      first,
      second
    ) => {
      switch (
        filters.sort
      ) {
        case 'experience':
          return (
            second.yearsExperience -
            first.yearsExperience
          )

        case 'rating':
          return (
            second.rating -
              first.rating ||
            second.reviewCount -
              first.reviewCount
          )

        case 'recommended':
        default: {
          

          const firstScore =
            first.rating *
              10 +
            Math.min(
              first.yearsExperience,
              15
            ) +
            (
              first.verified
                ? 5
                : 0
            ) +
            (
              first.acceptsNewClients
                ? 3
                : 0
            )

          const secondScore =
            second.rating *
              10 +
            Math.min(
              second.yearsExperience,
              15
            ) +
            (
              second.verified
                ? 5
                : 0
            ) +
            (
              second.acceptsNewClients
                ? 3
                : 0
            )

          return (
            secondScore -
            firstScore
          )
        }
      }
    }
  )
}