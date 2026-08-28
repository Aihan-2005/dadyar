import type {
  LawyerConsultationMode,
} from '@/features/client-portal/types/lawyer'

import type {
  ConsultationDurationOption,
  LawyerAvailabilityDay,
  LawyerConsultationOffer,
  LawyerMarketplaceProfile,
  LawyerReview,
} from '@/features/client-portal/types/marketplace'





function roundPrice(
  value:
    number
): number {
  return (
    Math.round(
      value /
        50_000
    ) *
    50_000
  )
}

function createDurations(
  values:
    Array<{
      minutes:
        number

      basePrice:
        number
    }>,

  multiplier:
    number
): ConsultationDurationOption[] {
  return values.map(
    (item) => ({
      minutes:
        item.minutes,

      priceToman:
        roundPrice(
          item.basePrice *
            multiplier
        ),
    })
  )
}



function createOffer(
  lawyerId:
    string,

  mode:
    LawyerConsultationMode,

  multiplier:
    number
): LawyerConsultationOffer {
  switch (
    mode
  ) {
    case 'phone':
      return {
        id:
          `${lawyerId}-phone`,

        mode:
          'phone',

        title:
          'مشاوره تلفنی',

        description:
          'گفت‌وگوی مستقیم تلفنی با وکیل برای بررسی موضوع و دریافت راهکار اولیه.',

        durations:
          createDurations(
            [
              {
                minutes:
                  30,

                basePrice:
                  300_000,
              },

              {
                minutes:
                  60,

                basePrice:
                  550_000,
              },
            ],

            multiplier
          ),
      }

    case 'online':
      return {
        id:
          `${lawyerId}-online`,

        mode:
          'online',

        title:
          'مشاوره آنلاین',

        description:
          'جلسه آنلاین برای بررسی موضوع، ارائه توضیحات و در صورت نیاز بررسی اولیه مدارک.',

        durations:
          createDurations(
            [
              {
                minutes:
                  30,

                basePrice:
                  350_000,
              },

              {
                minutes:
                  60,

                basePrice:
                  650_000,
              },
            ],

            multiplier
          ),
      }

    case 'in_person':
      return {
        id:
          `${lawyerId}-in-person`,

        mode:
          'in_person',

        title:
          'مشاوره حضوری',

        description:
          'جلسه حضوری در دفتر وکیل برای بررسی دقیق‌تر پرونده و مدارک.',

        durations:
          createDurations(
            [
              {
                minutes:
                  60,

                basePrice:
                  900_000,
              },

              {
                minutes:
                  90,

                basePrice:
                  1_250_000,
              },
            ],

            multiplier
          ),
      }
  }
}




const DEFAULT_SLOTS = [
  '09:00',
  '10:30',
  '12:00',
  '16:00',
  '17:30',
]

function toDateValue(
  date:
    Date
): string {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      '0'
    )

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    )

  return `${year}-${month}-${day}`
}

function createAvailability(
  shift:
    number
): LawyerAvailabilityDay[] {
  const offsets = [
    1 + shift,
    2 + shift,
    4 + shift,
    6 + shift,
  ]

  return offsets.map(
    (
      offset,
      index
    ) => {
      const date =
        new Date()

      date.setHours(
        12,
        0,
        0,
        0
      )

      date.setDate(
        date.getDate() +
          offset
      )

      const label =
        new Intl.DateTimeFormat(
          'fa-IR-u-ca-persian',
          {
            weekday:
              'long',

            day:
              'numeric',

            month:
              'long',
          }
        ).format(
          date
        )

      return {
        value:
          toDateValue(
            date
          ),

        label,

        slots:
          index %
            2 ===
          0
            ? DEFAULT_SLOTS
            : DEFAULT_SLOTS.slice(
                1,
                5
              ),
      }
    }
  )
}





function createReviews(
  lawyerId:
    string,

  variant:
    number
): LawyerReview[] {
  const reviewGroups:
    LawyerReview[][] = [
      [
        {
          id:
            `${lawyerId}-review-1`,

          lawyerId,

          authorName:
            'مهدی ر.',

          rating:
            5,

          comment:
            'توضیحات بسیار دقیق و قابل فهم بود و قبل از شروع کار مسیر پرونده را کامل برای من توضیح دادند.',

          createdAtLabel:
            '۲ هفته پیش',

          verifiedClient:
            true,
        },

        {
          id:
            `${lawyerId}-review-2`,

          lawyerId,

          authorName:
            'سمیرا ک.',

          rating:
            4,

          comment:
            'جلسه منظم برگزار شد و برای سوال‌هایی که داشتم پاسخ روشن و کاربردی گرفتم.',

          createdAtLabel:
            '۱ ماه پیش',

          verifiedClient:
            true,
        },
      ],

      [
        {
          id:
            `${lawyerId}-review-1`,

          lawyerId,

          authorName:
            'علی م.',

          rating:
            5,

          comment:
            'برخورد حرفه‌ای و پیگیری خوبی داشتند. قبل از جلسه هم مدارک لازم را مشخص کردند.',

          createdAtLabel:
            '۵ روز پیش',

          verifiedClient:
            true,
        },

        {
          id:
            `${lawyerId}-review-2`,

          lawyerId,

          authorName:
            'نرگس الف.',

          rating:
            5,

          comment:
            'برای تصمیم‌گیری در مورد پرونده کمک زیادی گرفتم و نکات مهمی مطرح شد که قبلاً نمی‌دانستم.',

          createdAtLabel:
            '۳ هفته پیش',

          verifiedClient:
            true,
        },
      ],

      [
        {
          id:
            `${lawyerId}-review-1`,

          lawyerId,

          authorName:
            'رضا ح.',

          rating:
            4,

          comment:
            'مشاوره مفیدی بود و درباره هزینه‌ها و مراحل کار شفاف توضیح داده شد.',

          createdAtLabel:
            '۱ هفته پیش',

          verifiedClient:
            true,
        },

        {
          id:
            `${lawyerId}-review-2`,

          lawyerId,

          authorName:
            'زهرا ب.',

          rating:
            5,

          comment:
            'وقت کافی برای توضیح موضوع گذاشتند و راهکارهای مختلف را با مزایا و معایبشان توضیح دادند.',

          createdAtLabel:
            '۲ ماه پیش',

          verifiedClient:
            true,
        },
      ],
    ]

  return reviewGroups[
    variant %
      reviewGroups.length
  ]
}





function createProfile(
  lawyerId:
    string,

  modes:
    LawyerConsultationMode[],

  multiplier:
    number,

  availabilityShift:
    number,

  reviewVariant:
    number
): LawyerMarketplaceProfile {
  return {
    lawyerId,

    consultationOffers:
      modes.map(
        (mode) =>
          createOffer(
            lawyerId,
            mode,
            multiplier
          )
      ),

    availability:
      createAvailability(
        availabilityShift
      ),

    reviews:
      createReviews(
        lawyerId,
        reviewVariant
      ),
  }
}





const PROFILES:
  Record<
    string,
    LawyerMarketplaceProfile
  > = {
    'lawyer-mock-001':
      createProfile(
        'lawyer-mock-001',
        [
          'in_person',
          'phone',
          'online',
        ],
        1.15,
        0,
        0
      ),

    'lawyer-mock-002':
      createProfile(
        'lawyer-mock-002',
        [
          'in_person',
          'online',
        ],
        1.1,
        1,
        1
      ),

    'lawyer-mock-003':
      createProfile(
        'lawyer-mock-003',
        [
          'in_person',
          'phone',
        ],
        0.95,
        0,
        2
      ),

    'lawyer-mock-004':
      createProfile(
        'lawyer-mock-004',
        [
          'in_person',
          'phone',
          'online',
        ],
        1.25,
        2,
        0
      ),

    'lawyer-mock-005':
      createProfile(
        'lawyer-mock-005',
        [
          'in_person',
          'phone',
        ],
        1,
        1,
        1
      ),

    'lawyer-mock-006':
      createProfile(
        'lawyer-mock-006',
        [
          'in_person',
          'online',
        ],
        1.05,
        0,
        2
      ),

    'lawyer-mock-007':
      createProfile(
        'lawyer-mock-007',
        [
          'in_person',
          'phone',
          'online',
        ],
        1.1,
        2,
        0
      ),

    'lawyer-mock-008':
      createProfile(
        'lawyer-mock-008',
        [
          'phone',
          'online',
        ],
        0.9,
        1,
        1
      ),
  }

  
  

export function getMockLawyerMarketplaceProfile(
  lawyerId:
    string
): LawyerMarketplaceProfile {
  return (
    PROFILES[
      lawyerId
    ] ??
    createProfile(
      lawyerId,
      [
        'phone',
        'online',
      ],
      1,
      0,
      0
    )
  )
}

export function getMinimumConsultationPrice(
  lawyerId:
    string
): number | null {
  const profile =
    getMockLawyerMarketplaceProfile(
      lawyerId
    )

  const prices =
    profile.consultationOffers.flatMap(
      (offer) =>
        offer.durations.map(
          (duration) =>
            duration.priceToman
        )
    )

  if (
    prices.length ===
    0
  ) {
    return null
  }

  return Math.min(
    ...prices
  )
}