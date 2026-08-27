import type {
  ClientPortalLawyer,
} from '@/features/client-portal/types/lawyer'

/*
|--------------------------------------------------------------------------
| Development Mock Data
|--------------------------------------------------------------------------
|
| تمام اطلاعات این فایل آزمایشی هستند.
|
| بعد از آماده‌شدن Backend:
|
| MOCK_LAWYERS
|
| با API واقعی مثلاً:
|
| GET /lawyers/directory
|
| جایگزین خواهد شد.
|--------------------------------------------------------------------------
*/

export const MOCK_LAWYERS:
  readonly ClientPortalLawyer[] = [
    {
      id:
        'lawyer-mock-001',

      fullName:
        'آرمان نادری',

      title:
        'وکیل پایه یک دادگستری',

      city:
        'تهران',

      province:
        'تهران',

      specialties: [
        'دعاوی ملکی',
        'قراردادها',
        'امور ثبتی',
      ],

      yearsExperience:
        12,

      rating:
        4.9,

      reviewCount:
        86,

      barAssociation:
        'کانون وکلای دادگستری مرکز',

      licenseNumber:
        'MOCK-1001',

      officeAddress:
        'تهران، محدوده میدان ونک',

      phone:
        '09120000001',

      bio:
        'فعال در حوزه دعاوی ملکی، قراردادهای تجاری و امور ثبتی با تمرکز بر بررسی دقیق اسناد و پیشگیری از اختلافات حقوقی.',

      consultationModes: [
        'in_person',
        'phone',
        'online',
      ],

      acceptsNewClients:
        true,

      verified:
        true,

      responseTimeLabel:
        'معمولاً کمتر از ۲ ساعت',

      languages: [
        'فارسی',
        'انگلیسی',
      ],

      avatarInitials:
        'آ ن',
    },

    {
      id:
        'lawyer-mock-002',

      fullName:
        'سارا محمودی',

      title:
        'وکیل پایه یک دادگستری',

      city:
        'تهران',

      province:
        'تهران',

      specialties: [
        'حقوق خانواده',
        'طلاق',
        'مهریه',
      ],

      yearsExperience:
        9,

      rating:
        4.8,

      reviewCount:
        112,

      barAssociation:
        'کانون وکلای دادگستری مرکز',

      licenseNumber:
        'MOCK-1002',

      officeAddress:
        'تهران، محدوده یوسف‌آباد',

      phone:
        '09120000002',

      bio:
        'فعال در پرونده‌های خانواده با تمرکز بر پرونده‌های طلاق، مهریه، حضانت و سایر اختلافات خانوادگی.',

      consultationModes: [
        'in_person',
        'online',
      ],

      acceptsNewClients:
        true,

      verified:
        true,

      responseTimeLabel:
        'معمولاً کمتر از ۱ ساعت',

      languages: [
        'فارسی',
      ],

      avatarInitials:
        'س م',
    },

    {
      id:
        'lawyer-mock-003',

      fullName:
        'امیرحسین کریمی',

      title:
        'وکیل دادگستری',

      city:
        'کرج',

      province:
        'البرز',

      specialties: [
        'دعاوی کیفری',
        'جرایم مالی',
        'چک و سفته',
      ],

      yearsExperience:
        7,

      rating:
        4.7,

      reviewCount:
        64,

      barAssociation:
        'کانون وکلای دادگستری البرز',

      licenseNumber:
        'MOCK-1003',

      officeAddress:
        'کرج، محدوده عظیمیه',

      phone:
        '09120000003',

      bio:
        'فعال در دعاوی کیفری و پرونده‌های مرتبط با جرایم مالی، چک و اسناد تجاری.',

      consultationModes: [
        'in_person',
        'phone',
      ],

      acceptsNewClients:
        true,

      verified:
        true,

      responseTimeLabel:
        'معمولاً کمتر از ۳ ساعت',

      languages: [
        'فارسی',
      ],

      avatarInitials:
        'ا ک',
    },

    {
      id:
        'lawyer-mock-004',

      fullName:
        'نگار احمدی',

      title:
        'وکیل پایه یک دادگستری',

      city:
        'اصفهان',

      province:
        'اصفهان',

      specialties: [
        'حقوق شرکت‌ها',
        'قراردادهای تجاری',
        'داوری',
      ],

      yearsExperience:
        14,

      rating:
        4.9,

      reviewCount:
        91,

      barAssociation:
        'کانون وکلای دادگستری اصفهان',

      licenseNumber:
        'MOCK-1004',

      officeAddress:
        'اصفهان، محدوده چهارباغ بالا',

      phone:
        '09120000004',

      bio:
        'ارائه خدمات حقوقی در حوزه شرکت‌ها، تنظیم و بررسی قراردادهای تجاری و حل اختلاف از طریق داوری.',

      consultationModes: [
        'in_person',
        'phone',
        'online',
      ],

      acceptsNewClients:
        false,

      verified:
        true,

      responseTimeLabel:
        'معمولاً همان روز',

      languages: [
        'فارسی',
        'انگلیسی',
      ],

      avatarInitials:
        'ن ا',
    },

    {
      id:
        'lawyer-mock-005',

      fullName:
        'رضا شریفی',

      title:
        'وکیل دادگستری',

      city:
        'شیراز',

      province:
        'فارس',

      specialties: [
        'دعاوی ملکی',
        'ارث',
        'امور حسبی',
      ],

      yearsExperience:
        10,

      rating:
        4.6,

      reviewCount:
        55,

      barAssociation:
        'کانون وکلای دادگستری فارس',

      licenseNumber:
        'MOCK-1005',

      officeAddress:
        'شیراز، محدوده بلوار چمران',

      phone:
        '09120000005',

      bio:
        'فعال در دعاوی ملکی، ارث و امور حسبی و ارائه مشاوره در اختلافات مربوط به املاک و ماترک.',

      consultationModes: [
        'in_person',
        'phone',
      ],

      acceptsNewClients:
        true,

      verified:
        true,

      responseTimeLabel:
        'معمولاً کمتر از ۴ ساعت',

      languages: [
        'فارسی',
      ],

      avatarInitials:
        'ر ش',
    },

    {
      id:
        'lawyer-mock-006',

      fullName:
        'مریم توکلی',

      title:
        'وکیل پایه یک دادگستری',

      city:
        'مشهد',

      province:
        'خراسان رضوی',

      specialties: [
        'حقوق خانواده',
        'ارث',
        'امور ثبتی',
      ],

      yearsExperience:
        8,

      rating:
        4.8,

      reviewCount:
        72,

      barAssociation:
        'کانون وکلای دادگستری خراسان',

      licenseNumber:
        'MOCK-1006',

      officeAddress:
        'مشهد، محدوده بلوار سجاد',

      phone:
        '09120000006',

      bio:
        'مشاوره و پیگیری دعاوی خانواده، ارث و مسائل ثبتی با تمرکز بر حل اختلاف و کاهش زمان رسیدگی.',

      consultationModes: [
        'in_person',
        'online',
      ],

      acceptsNewClients:
        true,

      verified:
        true,

      responseTimeLabel:
        'معمولاً کمتر از ۲ ساعت',

      languages: [
        'فارسی',
      ],

      avatarInitials:
        'م ت',
    },

    {
      id:
        'lawyer-mock-007',

      fullName:
        'سامان رستگار',

      title:
        'وکیل پایه یک دادگستری',

      city:
        'تبریز',

      province:
        'آذربایجان شرقی',

      specialties: [
        'دعاوی کیفری',
        'حقوق کار',
        'بیمه',
      ],

      yearsExperience:
        11,

      rating:
        4.7,

      reviewCount:
        67,

      barAssociation:
        'کانون وکلای دادگستری آذربایجان شرقی',

      licenseNumber:
        'MOCK-1007',

      officeAddress:
        'تبریز، محدوده ولیعصر',

      phone:
        '09120000007',

      bio:
        'فعال در پرونده‌های کیفری، اختلافات کارگر و کارفرما و پرونده‌های مرتبط با بیمه.',

      consultationModes: [
        'in_person',
        'phone',
        'online',
      ],

      acceptsNewClients:
        true,

      verified:
        true,

      responseTimeLabel:
        'معمولاً کمتر از ۳ ساعت',

      languages: [
        'فارسی',
        'ترکی',
      ],

      avatarInitials:
        'س ر',
    },

    {
      id:
        'lawyer-mock-008',

      fullName:
        'الهام مرادی',

      title:
        'وکیل دادگستری',

      city:
        'رشت',

      province:
        'گیلان',

      specialties: [
        'قراردادها',
        'چک و سفته',
        'مطالبات',
      ],

      yearsExperience:
        6,

      rating:
        4.5,

      reviewCount:
        39,

      barAssociation:
        'کانون وکلای دادگستری گیلان',

      licenseNumber:
        'MOCK-1008',

      officeAddress:
        'رشت، محدوده گلسار',

      phone:
        '09120000008',

      bio:
        'فعال در تنظیم قرارداد، وصول مطالبات و دعاوی مرتبط با چک، سفته و تعهدات مالی.',

      consultationModes: [
        'phone',
        'online',
      ],

      acceptsNewClients:
        true,

      verified:
        false,

      responseTimeLabel:
        'معمولاً همان روز',

      languages: [
        'فارسی',
      ],

      avatarInitials:
        'ا م',
    },
  ]