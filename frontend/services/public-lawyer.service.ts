import type {
  PublicLawyer,
  PublicLawyerListParams,
} from '@/types/public-lawyer'

/**
 * TEMPORARY FRONTEND DATA
 *
 * این داده‌ها فقط تا زمانی هستند که
 * endpoint عمومی وکلای قابل نمایش به موکلین
 * در backend ساخته شود.
 *
 * بعداً implementation این service
 * با GET /lawyers/public جایگزین می‌شود.
 */
const TEMPORARY_PUBLIC_LAWYERS: PublicLawyer[] = [
  {
    id: 'temporary-lawyer-1',

    firstName: 'علی',

    lastName: 'رضایی',

    fullName: 'علی رضایی',

    phone: '09120000001',

    email: 'ali.rezaei@example.com',

    specialization:
      'حقوق خانواده',

    licenseNumber:
      'LAW-1001',

    yearsOfExperience:
      12,

    address:
      'تهران',

    bio:
      'وکیل دادگستری با تمرکز بر پرونده‌های خانواده، طلاق، حضانت و دعاوی مرتبط.',

    skills: [
      'حقوق خانواده',
      'طلاق',
      'حضانت',
      'مهریه',
    ],

    languages: [
      'فارسی',
    ],

    isFeatured: true,

    displayOrder: 1,
  },

  {
    id: 'temporary-lawyer-2',

    firstName: 'سارا',

    lastName: 'محمدی',

    fullName: 'سارا محمدی',

    phone: '09120000002',

    email: 'sara.mohammadi@example.com',

    specialization:
      'حقوق کیفری',

    licenseNumber:
      'LAW-1002',

    yearsOfExperience:
      9,

    address:
      'تهران',

    bio:
      'فعال در حوزه پرونده‌های کیفری و ارائه مشاوره و دفاع تخصصی.',

    skills: [
      'حقوق کیفری',
      'دفاع کیفری',
      'جرایم مالی',
    ],

    languages: [
      'فارسی',
      'انگلیسی',
    ],

    isFeatured: true,

    displayOrder: 2,
  },

  {
    id: 'temporary-lawyer-3',

    firstName: 'محمد',

    lastName: 'احمدی',

    fullName: 'محمد احمدی',

    phone: '09120000003',

    email: 'mohammad.ahmadi@example.com',

    specialization:
      'حقوق قراردادها',

    licenseNumber:
      'LAW-1003',

    yearsOfExperience:
      15,

    address:
      'کرج',

    bio:
      'متخصص در تنظیم و بررسی قراردادهای تجاری و دعاوی ناشی از قراردادها.',

    skills: [
      'قراردادها',
      'حقوق تجاری',
      'داوری',
    ],

    languages: [
      'فارسی',
      'انگلیسی',
    ],

    isFeatured: false,

    displayOrder: 3,
  },

  {
    id: 'temporary-lawyer-4',

    firstName: 'مریم',

    lastName: 'کاظمی',

    fullName: 'مریم کاظمی',

    phone: '09120000004',

    email: 'maryam.kazemi@example.com',

    specialization:
      'حقوق ملکی',

    licenseNumber:
      'LAW-1004',

    yearsOfExperience:
      7,

    address:
      'تهران',

    bio:
      'فعال در حوزه دعاوی ملکی، قراردادهای املاک و اختلافات مالک و مستأجر.',

    skills: [
      'حقوق ملکی',
      'املاک',
      'اجاره',
    ],

    languages: [
      'فارسی',
    ],

    isFeatured: false,

    displayOrder: 4,
  },
]

function normalizeSearch(
  value: string,
) {
  return value
    .trim()
    .toLocaleLowerCase(
      'fa-IR',
    )
}

export async function getPublicLawyers(
  params: PublicLawyerListParams = {},
): Promise<PublicLawyer[]> {
  const search =
    normalizeSearch(
      params.search ?? '',
    )

  const specialization =
    params.specialization
      ?.trim()

  let items = [
    ...TEMPORARY_PUBLIC_LAWYERS,
  ]

  if (search) {
    items =
      items.filter(
        (lawyer) =>
          [
            lawyer.fullName,
            lawyer.specialization,
            lawyer.address,
            lawyer.licenseNumber,
            ...lawyer.skills,
            ...lawyer.languages,
          ].some(
            (value) =>
              value
                ?.toLocaleLowerCase(
                  'fa-IR',
                )
                .includes(
                  search,
                ),
          ),
      )
  }

  if (
    specialization &&
    specialization !==
      'ALL'
  ) {
    items =
      items.filter(
        (lawyer) =>
          lawyer.specialization ===
          specialization,
      )
  }

  if (
    params.featuredOnly
  ) {
    items =
      items.filter(
        (lawyer) =>
          lawyer.isFeatured,
      )
  }

  return items.sort(
    (a, b) =>
      a.displayOrder -
      b.displayOrder,
  )
}

export async function getPublicLawyerById(
  id: string,
): Promise<PublicLawyer | null> {
  const lawyer =
    TEMPORARY_PUBLIC_LAWYERS.find(
      (item) =>
        item.id === id,
    )

  return lawyer
    ? {
        ...lawyer,
      }
    : null
}

export async function getPublicLawyerSpecializations(): Promise<
  string[]
> {
  const values =
    TEMPORARY_PUBLIC_LAWYERS.map(
      (lawyer) =>
        lawyer.specialization,
    )

  return Array.from(
    new Set(values),
  ).sort(
    (a, b) =>
      a.localeCompare(
        b,
        'fa-IR',
      ),
  ) }