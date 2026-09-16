'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  Award,
  Briefcase,
  Calendar,
  Edit3,
  FileText,
  Globe,
  GraduationCap,
  Languages,
  Loader2,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Star,
  Trash2,
  User,
  X,
} from 'lucide-react'

import {
  getLawyerProfile,
  patchLawyerProfile,
  type LawyerProfilePatch,
} from '@/services/lawyer.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import {
  EMPTY_LAWYER_PROFILE,
  type Education,
  type Experience,
  type LawyerProfile,
  type Skill,
  type SkillLevel,
} from '@/types/lawyer'


type EditableSection =
  | 'basic'
  | 'education'
  | 'experience'
  | 'skills'
  | 'languages'


const INPUT_CLASS =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-right text-sm outline-none transition focus:border-zinc-700 focus:ring-2 focus:ring-zinc-200'


const LABEL_CLASS =
  'mb-1 block text-right text-xs font-medium text-zinc-600'


function createTemporaryId():
  string {
  if (
    typeof crypto !==
      'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`
}


function normalizeDigits(
  value:
    string,
): string {
  const persianDigits =
    '۰۱۲۳۴۵۶۷۸۹'

  const arabicDigits =
    '٠١٢٣٤٥٦٧٨٩'


  return value
    .replace(
      /[۰-۹]/g,

      (
        digit,
      ) =>
        String(
          persianDigits.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,

      (
        digit,
      ) =>
        String(
          arabicDigits.indexOf(
            digit,
          ),
        ),
    )
}


function cloneProfile(
  profile:
    LawyerProfile,
): LawyerProfile {
  return {
    ...profile,

    education:
      profile.education.map(
        (
          item,
        ) => ({
          ...item,
        }),
      ),

    experience:
      profile.experience.map(
        (
          item,
        ) => ({
          ...item,
        }),
      ),

    skills:
      profile.skills.map(
        (
          item,
        ) => ({
          ...item,
        }),
      ),

    languages: [
      ...profile.languages,
    ],
  }
}


function normalizeWebsite(
  value:
    string,
): string | null {
  const website =
    value.trim()


  if (
    !website
  ) {
    return null
  }


  return /^https?:\/\//i.test(
    website,
  )
    ? website
    : `https://${website}`
}


function buildBasicPatch(
  draft:
    LawyerProfile,
): LawyerProfilePatch {
  const phone =
    normalizeDigits(
      draft.phone.trim(),
    )


  return {
    specialization:
      draft.specialization.trim(),

    licenseNumber:
      normalizeDigits(
        draft.licenseNumber.trim(),
      ),

    yearsOfExperience:
      draft.yearsOfExperience,

    phone:
      phone ||
      null,

    website:
      normalizeWebsite(
        draft.website,
      ),

    address:
      draft.address.trim(),

    bio:
      draft.bio.trim(),
  }
}


function validateBasicPatch(
  patch:
    LawyerProfilePatch,
): string | null {
  if (
    !Number.isInteger(
      patch.yearsOfExperience,
    ) ||
    (
      patch.yearsOfExperience ??
      0
    ) <
      0 ||
    (
      patch.yearsOfExperience ??
      0
    ) >
      80
  ) {
    return 'سابقه کاری باید عدد صحیح بین صفر تا ۸۰ باشد.'
  }


  if (
    patch.phone &&
    !/^09\d{9}$/.test(
      patch.phone,
    )
  ) {
    return 'شماره تماس عمومی باید ۱۱ رقم و با ۰۹ شروع شود.'
  }


  if (
    patch.website
  ) {
    try {
      const website =
        new URL(
          patch.website,
        )


      if (
        website.protocol !==
          'http:' &&
        website.protocol !==
          'https:'
      ) {
        return 'آدرس وب‌سایت معتبر نیست.'
      }
    } catch {
      return 'آدرس وب‌سایت معتبر نیست.'
    }
  }


  return null
}


function normalizeEducation(
  items:
    Education[],
): Education[] {
  return items
    .map(
      (
        item,
      ) => ({
        ...item,

        degree:
          item.degree.trim(),

        field:
          item.field.trim(),

        university:
          item.university.trim(),

        year:
          normalizeDigits(
            item.year.trim(),
          ),
      }),
    )
    .filter(
      (
        item,
      ) =>
        Boolean(
          item.degree ||
            item.field ||
            item.university ||
            item.year,
        ),
    )
}


function normalizeExperience(
  items:
    Experience[],
): Experience[] {
  return items
    .map(
      (
        item,
      ) => {
        const endYear =
          item.endYear.trim()


        return {
          ...item,

          title:
            item.title.trim(),

          company:
            item.company.trim(),

          startYear:
            normalizeDigits(
              item.startYear.trim(),
            ),

          endYear:
            endYear ===
                'تاکنون' ||
              endYear ===
                'تا کنون'
              ? 'اکنون'
              : normalizeDigits(
                  endYear,
                ),

          description:
            item.description.trim(),
        }
      },
    )
    .filter(
      (
        item,
      ) =>
        Boolean(
          item.title ||
            item.company ||
            item.startYear ||
            item.endYear ||
            item.description,
        ),
    )
}


function validateExperience(
  items:
    Experience[],
): string | null {
  for (
    const item of
    items
  ) {
    if (
      !item.title ||
      !item.company ||
      !item.startYear ||
      !item.endYear
    ) {
      return 'عنوان شغلی، نام دفتر، سال شروع و سال پایان برای هر سابقه کاری الزامی است.'
    }


    if (
      !/^(13|14)\d{2}$/.test(
        item.startYear,
      )
    ) {
      return 'سال شروع سابقه کاری باید چهاررقمی باشد.'
    }


    if (
      item.endYear !==
        'اکنون' &&
      !/^(13|14)\d{2}$/.test(
        item.endYear,
      )
    ) {
      return 'سال پایان باید چهاررقمی یا «اکنون» باشد.'
    }


    if (
      item.endYear !==
        'اکنون' &&
      Number(
        item.endYear,
      ) <
        Number(
          item.startYear,
        )
    ) {
      return 'سال پایان نمی‌تواند قبل از سال شروع باشد.'
    }
  }


  return null
}


function normalizeSkills(
  items:
    Skill[],
): Skill[] {
  return items
    .map(
      (
        item,
      ) => ({
        ...item,

        name:
          item.name.trim(),
      }),
    )
    .filter(
      (
        item,
      ) =>
        item.name.length >
        0,
    )
}


function normalizeLanguages(
  items:
    string[],
): string[] {
  const result =
    new Map<
      string,
      string
    >()


  for (
    const raw of
    items
  ) {
    const language =
      raw.trim()


    if (
      !language
    ) {
      continue
    }


    const key =
      language.toLocaleLowerCase(
        'fa-IR',
      )


    if (
      !result.has(
        key,
      )
    ) {
      result.set(
        key,

        language,
      )
    }
  }


  return Array.from(
    result.values(),
  )
}


export default function ProfilePage() {
  const user =
    useAuthStore(
      (
        state,
      ) =>
        state.user,
    )


  const fetchMe =
    useAuthStore(
      (
        state,
      ) =>
        state.fetchMe,
    )


  const hasHydrated =
    useAuthStore(
      (
        state,
      ) =>
        state.hasHydrated,
    )


  const [
    profile,
    setProfile,
  ] =
    useState<LawyerProfile>(
      cloneProfile(
        EMPTY_LAWYER_PROFILE,
      ),
    )


  const [
    draft,
    setDraft,
  ] =
    useState<LawyerProfile>(
      cloneProfile(
        EMPTY_LAWYER_PROFILE,
      ),
    )


  const [
    editingSection,
    setEditingSection,
  ] =
    useState<EditableSection | null>(
      null,
    )


  const [
    newLanguage,
    setNewLanguage,
  ] =
    useState(
      '',
    )


  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true,
    )


  const [
    isSaving,
    setIsSaving,
  ] =
    useState(
      false,
    )


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )


  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null,
    )


  const loadProfile =
    useCallback(
      async (): Promise<void> => {
        setIsLoading(
          true,
        )

        setError(
          null,
        )

        setSuccessMessage(
          null,
        )


        try {
          const serverProfile =
            await getLawyerProfile()


          setProfile(
            cloneProfile(
              serverProfile,
            ),
          )


          setDraft(
            cloneProfile(
              serverProfile,
            ),
          )


          setEditingSection(
            null,
          )

          setNewLanguage(
            '',
          )
        } catch (
          loadError:
            unknown
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : 'دریافت پروفایل وکیل ناموفق بود.',
          )
        } finally {
          setIsLoading(
            false,
          )
        }
      },

      [],
    )


  useEffect(
    () => {
      if (
        !hasHydrated
      ) {
        return
      }


      void loadProfile()
    },

    [
      hasHydrated,
      loadProfile,
    ],
  )


  const fullName =
    useMemo(
      () => {
        const value =
          [
            user?.firstName,
            user?.lastName,
          ]
            .filter(
              Boolean,
            )
            .join(
              ' ',
            )
            .trim()


        return (
          value ||
          'وکیل دادگستری'
        )
      },

      [
        user?.firstName,
        user?.lastName,
      ],
    )


  const initials =
    useMemo(
      () => {
        const first =
          user?.firstName
            ?.trim()
            .charAt(
              0,
            ) ??
          ''


        const last =
          user?.lastName
            ?.trim()
            .charAt(
              0,
            ) ??
          ''


        return (
          `${first}${last}` ||
          'و'
        )
      },

      [
        user?.firstName,
        user?.lastName,
      ],
    )


  function startEdit(
    section:
      EditableSection,
  ): void {
    /*
     * مهم:
     * اجازه نمی‌دهیم کاربر وسط edit اطلاعات پایه
     * مستقیم برود روی Languages و draft قبلی را از دست بدهد.
     */
    if (
      editingSection &&
      editingSection !==
        section
    ) {
      setError(
        'ابتدا تغییرات بخش باز را ذخیره کنید یا انصراف بزنید.',
      )

      return
    }


    setDraft(
      cloneProfile(
        profile,
      ),
    )


    setEditingSection(
      section,
    )

    setNewLanguage(
      '',
    )

    setError(
      null,
    )

    setSuccessMessage(
      null,
    )
  }


  function cancelEdit():
    void {
    setDraft(
      cloneProfile(
        profile,
      ),
    )


    setEditingSection(
      null,
    )

    setNewLanguage(
      '',
    )

    setError(
      null,
    )
  }


  function buildCurrentSectionPatch(): {
    patch:
      LawyerProfilePatch

    validationError:
      string |
      null
  } | null {
    switch (
      editingSection
    ) {
      case 'basic': {
        const patch =
          buildBasicPatch(
            draft,
          )


        return {
          patch,

          validationError:
            validateBasicPatch(
              patch,
            ),
        }
      }


      case 'education':
        return {
          patch: {
            education:
              normalizeEducation(
                draft.education,
              ),
          },

          validationError:
            null,
        }


      case 'experience': {
        const experience =
          normalizeExperience(
            draft.experience,
          )


        return {
          patch: {
            experience,
          },

          validationError:
            validateExperience(
              experience,
            ),
        }
      }


      case 'skills':
        return {
          patch: {
            skills:
              normalizeSkills(
                draft.skills,
              ),
          },

          validationError:
            null,
        }


      case 'languages':
        return {
          patch: {
            languages:
              normalizeLanguages(
                draft.languages,
              ),
          },

          validationError:
            null,
        }


      default:
        return null
    }
  }


  async function saveEdit():
    Promise<void> {
    if (
      isSaving
    ) {
      return
    }


    const prepared =
      buildCurrentSectionPatch()


    if (
      !prepared
    ) {
      return
    }


    if (
      prepared.validationError
    ) {
      setError(
        prepared.validationError,
      )

      return
    }


    setIsSaving(
      true,
    )

    setError(
      null,
    )

    setSuccessMessage(
      null,
    )


    try {
      /*
       * فقط section فعال PATCH می‌شود.
       */
      const savedProfile =
        await patchLawyerProfile(
          prepared.patch,
        )


      setProfile(
        cloneProfile(
          savedProfile,
        ),
      )


      setDraft(
        cloneProfile(
          savedProfile,
        ),
      )


      setEditingSection(
        null,
      )

      setNewLanguage(
        '',
      )


      setSuccessMessage(
        'پروفایل با موفقیت ذخیره شد.',
      )


      void fetchMe()
    } catch (
      saveError:
        unknown
    ) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : 'ذخیره پروفایل وکیل ناموفق بود.',
      )
    } finally {
      setIsSaving(
        false,
      )
    }
  }


  function updateTextField(
    field:
      | 'specialization'
      | 'licenseNumber'
      | 'phone'
      | 'website'
      | 'address'
      | 'bio',

    value:
      string,
  ): void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        [field]:
          value,
      }),
    )
  }


  function addEducation():
    void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        education: [
          ...current.education,

          {
            id:
              createTemporaryId(),

            degree:
              '',

            field:
              '',

            university:
              '',

            year:
              '',
          },
        ],
      }),
    )
  }


  function updateEducation(
    id:
      string,

    field:
      Exclude<
        keyof Education,
        'id'
      >,

    value:
      string,
  ): void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        education:
          current.education.map(
            (
              item,
            ) =>
              item.id ===
              id
                ? {
                    ...item,

                    [field]:
                      value,
                  }
                : item,
          ),
      }),
    )
  }


  function removeEducation(
    id:
      string,
  ): void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        education:
          current.education.filter(
            (
              item,
            ) =>
              item.id !==
              id,
          ),
      }),
    )
  }


  function addExperience():
    void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        experience: [
          ...current.experience,

          {
            id:
              createTemporaryId(),

            title:
              '',

            company:
              '',

            startYear:
              '',

            endYear:
              '',

            description:
              '',
          },
        ],
      }),
    )
  }


  function updateExperience(
    id:
      string,

    field:
      Exclude<
        keyof Experience,
        'id'
      >,

    value:
      string,
  ): void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        experience:
          current.experience.map(
            (
              item,
            ) =>
              item.id ===
              id
                ? {
                    ...item,

                    [field]:
                      value,
                  }
                : item,
          ),
      }),
    )
  }


  function removeExperience(
    id:
      string,
  ): void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        experience:
          current.experience.filter(
            (
              item,
            ) =>
              item.id !==
              id,
          ),
      }),
    )
  }


  function addSkill():
    void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        skills: [
          ...current.skills,

          {
            id:
              createTemporaryId(),

            name:
              '',

            level:
              3,
          },
        ],
      }),
    )
  }


  function updateSkillName(
    id:
      string,

    name:
      string,
  ): void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        skills:
          current.skills.map(
            (
              item,
            ) =>
              item.id ===
              id
                ? {
                    ...item,

                    name,
                  }
                : item,
          ),
      }),
    )
  }


  function updateSkillLevel(
    id:
      string,

    level:
      SkillLevel,
  ): void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        skills:
          current.skills.map(
            (
              item,
            ) =>
              item.id ===
              id
                ? {
                    ...item,

                    level,
                  }
                : item,
          ),
      }),
    )
  }


  function removeSkill(
    id:
      string,
  ): void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        skills:
          current.skills.filter(
            (
              item,
            ) =>
              item.id !==
              id,
          ),
      }),
    )
  }


  function addLanguage():
    void {
    const language =
      newLanguage.trim()


    if (
      !language
    ) {
      return
    }


    const exists =
      draft.languages.some(
        (
          item,
        ) =>
          item.toLocaleLowerCase(
            'fa-IR',
          ) ===
          language.toLocaleLowerCase(
            'fa-IR',
          ),
      )


    if (
      !exists
    ) {
      setDraft(
        (
          current,
        ) => ({
          ...current,

          languages: [
            ...current.languages,

            language,
          ],
        }),
      )
    }


    setNewLanguage(
      '',
    )
  }


  function removeLanguage(
    language:
      string,
  ): void {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        languages:
          current.languages.filter(
            (
              item,
            ) =>
              item !==
              language,
          ),
      }),
    )
  }


  if (
    !hasHydrated ||
    isLoading
  ) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Loader2
            size={20}
            className="animate-spin"
          />

          در حال دریافت پروفایل...
        </div>
      </div>
    )
  }


  const anotherSectionIsEditing =
    editingSection !==
    null


  return (
    <div
      className="mx-auto max-w-7xl space-y-6 pb-12"
      dir="rtl"
    >
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>
            {error}
          </span>

          {!editingSection && (
            <button
              type="button"
              onClick={() =>
                void loadProfile()
              }
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5"
            >
              <RefreshCw
                size={14}
              />

              تلاش مجدد
            </button>
          )}
        </div>
      )}


      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}


      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="h-28 bg-gradient-to-l from-zinc-800 to-zinc-600" />

        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4 flex items-end gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-zinc-900 shadow-lg">
              <span className="text-3xl font-bold text-white">
                {initials}
              </span>
            </div>

            <div className="pb-2">
              <h1 className="text-xl font-bold text-zinc-900">
                {fullName}
              </h1>

              <p className="text-sm text-zinc-500">
                {profile.specialization ||
                  'وکیل دادگستری'}
              </p>

              {user?.email && (
                <p className="mt-1 text-xs text-zinc-400">
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-semibold leading-7 text-blue-800">
        برای نمایش در بخش موکلین فقط اطلاعات پایه لازم است:
        تخصص، شماره پروانه، شماره تماس عمومی، آدرس دفتر و بیوگرافی.
        وب‌سایت و بخش‌های تحصیلات، سوابق کاری، مهارت‌ها و زبان‌ها اختیاری
        هستند؛ اگر ثبت شوند در پروفایل موکلین نمایش داده می‌شوند.
      </div>


      <SectionCard
        title="اطلاعات پایه"
        icon={
          <User
            size={18}
          />
        }
        isEditing={
          editingSection ===
          'basic'
        }
        editDisabled={
          anotherSectionIsEditing &&
          editingSection !==
            'basic'
        }
        isSaving={
          isSaving
        }
        onEdit={() =>
          startEdit(
            'basic',
          )
        }
        onSave={() =>
          void saveEdit()
        }
        onCancel={
          cancelEdit
        }
      >
        {editingSection ===
        'basic' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              label="تخصص"
              value={
                draft.specialization
              }
              placeholder="مثلاً حقوق کیفری"
              onChange={(
                value,
              ) =>
                updateTextField(
                  'specialization',

                  value,
                )
              }
            />

            <TextField
              label="شماره پروانه وکالت"
              value={
                draft.licenseNumber
              }
              placeholder="شماره پروانه"
              onChange={(
                value,
              ) =>
                updateTextField(
                  'licenseNumber',

                  value,
                )
              }
            />


            <div>
              <label className={LABEL_CLASS}>
                سابقه کار
              </label>

              <input
                type="number"
                min={0}
                max={80}
                className={
                  INPUT_CLASS
                }
                value={
                  draft.yearsOfExperience
                }
                onChange={(
                  event,
                ) => {
                  const value =
                    Number(
                      event.target.value,
                    )

                  setDraft(
                    (
                      current,
                    ) => ({
                      ...current,

                      yearsOfExperience:
                        Number.isFinite(
                          value,
                        )
                          ? value
                          : 0,
                    }),
                  )
                }}
              />
            </div>


            <div>
              <TextField
                label="شماره تماس عمومی"
                value={
                  draft.phone
                }
                placeholder="09xxxxxxxxx"
                onChange={(
                  value,
                ) =>
                  updateTextField(
                    'phone',

                    value,
                  )
                }
              />

              <p className="mt-1 text-[11px] font-semibold leading-5 text-zinc-500">
                این شماره فقط در پروفایل عمومی شما نمایش داده می‌شود
                و شماره ورود حساب را تغییر نمی‌دهد.
              </p>
            </div>


            <TextField
              label="وب‌سایت (اختیاری)"
              value={
                draft.website
              }
              placeholder="example.com"
              onChange={(
                value,
              ) =>
                updateTextField(
                  'website',

                  value,
                )
              }
            />


            <TextField
              label="آدرس دفتر"
              value={
                draft.address
              }
              placeholder="آدرس دفتر"
              onChange={(
                value,
              ) =>
                updateTextField(
                  'address',

                  value,
                )
              }
            />


            <div className="md:col-span-2">
              <label className={LABEL_CLASS}>
                بیوگرافی
              </label>

              <textarea
                rows={5}
                className={
                  INPUT_CLASS
                }
                value={
                  draft.bio
                }
                onChange={(
                  event,
                ) =>
                  updateTextField(
                    'bio',

                    event.target.value,
                  )
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.bio && (
              <div className="rounded-xl bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
                <FileText
                  size={14}
                  className="ml-2 inline text-zinc-400"
                />

                {profile.bio}
              </div>
            )}


            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoItem
                icon={
                  <Briefcase
                    size={14}
                  />
                }
                label="تخصص"
                value={
                  profile.specialization ||
                  'ثبت نشده'
                }
              />

              <InfoItem
                icon={
                  <Award
                    size={14}
                  />
                }
                label="پروانه وکالت"
                value={
                  profile.licenseNumber ||
                  'ثبت نشده'
                }
              />

              <InfoItem
                icon={
                  <Calendar
                    size={14}
                  />
                }
                label="سابقه کار"
                value={`${profile.yearsOfExperience} سال`}
              />

              <InfoItem
                icon={
                  <Phone
                    size={14}
                  />
                }
                label="شماره تماس عمومی"
                value={
                  profile.phone ||
                  'ثبت نشده'
                }
              />

              <InfoItem
                icon={
                  <Globe
                    size={14}
                  />
                }
                label="وب‌سایت"
                value={
                  profile.website ? (
                    <a
                      href={
                        profile.website
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    'ثبت نشده'
                  )
                }
              />

              <InfoItem
                icon={
                  <MapPin
                    size={14}
                  />
                }
                label="آدرس"
                value={
                  profile.address ||
                  'ثبت نشده'
                }
              />
            </div>
          </div>
        )}
      </SectionCard>


      <SectionCard
        title="سوابق تحصیلی"
        icon={
          <GraduationCap
            size={18}
          />
        }
        isEditing={
          editingSection ===
          'education'
        }
        editDisabled={
          anotherSectionIsEditing &&
          editingSection !==
            'education'
        }
        isSaving={
          isSaving
        }
        onEdit={() =>
          startEdit(
            'education',
          )
        }
        onSave={() =>
          void saveEdit()
        }
        onCancel={
          cancelEdit
        }
      >
        {editingSection ===
        'education' ? (
          <div className="space-y-4">
            {draft.education.map(
              (
                item,
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="space-y-3 rounded-xl border border-zinc-200 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <TextField
                      label="مقطع تحصیلی"
                      value={
                        item.degree
                      }
                      onChange={(
                        value,
                      ) =>
                        updateEducation(
                          item.id,

                          'degree',

                          value,
                        )
                      }
                    />

                    <TextField
                      label="رشته"
                      value={
                        item.field
                      }
                      onChange={(
                        value,
                      ) =>
                        updateEducation(
                          item.id,

                          'field',

                          value,
                        )
                      }
                    />

                    <TextField
                      label="دانشگاه"
                      value={
                        item.university
                      }
                      onChange={(
                        value,
                      ) =>
                        updateEducation(
                          item.id,

                          'university',

                          value,
                        )
                      }
                    />

                    <TextField
                      label="سال"
                      value={
                        item.year
                      }
                      onChange={(
                        value,
                      ) =>
                        updateEducation(
                          item.id,

                          'year',

                          value,
                        )
                      }
                    />
                  </div>

                  <DeleteButton
                    onClick={() =>
                      removeEducation(
                        item.id,
                      )
                    }
                  />
                </div>
              ),
            )}

            <AddButton
              text="افزودن سابقه تحصیلی"
              onClick={
                addEducation
              }
            />
          </div>
        ) : profile.education.length >
          0 ? (
          <div className="space-y-3">
            {profile.education.map(
              (
                item,
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="rounded-xl bg-zinc-50 p-4"
                >
                  <p className="font-semibold text-zinc-900">
                    {[
                      item.degree,
                      item.field,
                    ]
                      .filter(
                        Boolean,
                      )
                      .join(
                        ' - ',
                      )}
                  </p>

                  {item.university && (
                    <p className="mt-1 text-sm text-zinc-600">
                      {item.university}
                    </p>
                  )}

                  {item.year && (
                    <p className="mt-1 text-xs text-zinc-400">
                      {item.year}
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
        ) : (
          <EmptyState text="سابقه تحصیلی اختیاری است." />
        )}
      </SectionCard>


      <SectionCard
        title="سوابق کاری"
        icon={
          <Briefcase
            size={18}
          />
        }
        isEditing={
          editingSection ===
          'experience'
        }
        editDisabled={
          anotherSectionIsEditing &&
          editingSection !==
            'experience'
        }
        isSaving={
          isSaving
        }
        onEdit={() =>
          startEdit(
            'experience',
          )
        }
        onSave={() =>
          void saveEdit()
        }
        onCancel={
          cancelEdit
        }
      >
        {editingSection ===
        'experience' ? (
          <div className="space-y-4">
            {draft.experience.map(
              (
                item,
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="space-y-3 rounded-xl border border-zinc-200 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <TextField
                      label="عنوان شغلی"
                      value={
                        item.title
                      }
                      onChange={(
                        value,
                      ) =>
                        updateExperience(
                          item.id,

                          'title',

                          value,
                        )
                      }
                    />

                    <TextField
                      label="دفتر یا شرکت"
                      value={
                        item.company
                      }
                      onChange={(
                        value,
                      ) =>
                        updateExperience(
                          item.id,

                          'company',

                          value,
                        )
                      }
                    />

                    <TextField
                      label="از سال"
                      value={
                        item.startYear
                      }
                      onChange={(
                        value,
                      ) =>
                        updateExperience(
                          item.id,

                          'startYear',

                          value,
                        )
                      }
                    />

                    <TextField
                      label="تا سال"
                      value={
                        item.endYear
                      }
                      placeholder="اکنون"
                      onChange={(
                        value,
                      ) =>
                        updateExperience(
                          item.id,

                          'endYear',

                          value,
                        )
                      }
                    />

                    <div className="md:col-span-2">
                      <label className={LABEL_CLASS}>
                        توضیحات
                      </label>

                      <textarea
                        rows={3}
                        className={
                          INPUT_CLASS
                        }
                        value={
                          item.description
                        }
                        onChange={(
                          event,
                        ) =>
                          updateExperience(
                            item.id,

                            'description',

                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <DeleteButton
                    onClick={() =>
                      removeExperience(
                        item.id,
                      )
                    }
                  />
                </div>
              ),
            )}

            <AddButton
              text="افزودن سابقه کاری"
              onClick={
                addExperience
              }
            />
          </div>
        ) : profile.experience.length >
          0 ? (
          <div className="space-y-4 border-r-2 border-zinc-200 pr-5">
            {profile.experience.map(
              (
                item,
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="relative"
                >
                  <div className="absolute -right-[1.65rem] top-1 h-4 w-4 rounded-full border-2 border-white bg-zinc-900" />

                  <p className="font-semibold text-zinc-900">
                    {item.title}
                  </p>

                  <p className="text-sm text-zinc-500">
                    {item.company}
                  </p>

                  <p className="text-xs text-zinc-400">
                    {item.startYear}

                    {item.endYear &&
                      ` — ${item.endYear}`}
                  </p>

                  {item.description && (
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {item.description}
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
        ) : (
          <EmptyState text="سابقه کاری اختیاری است." />
        )}
      </SectionCard>


      <SectionCard
        title="مهارت‌ها"
        icon={
          <Star
            size={18}
          />
        }
        isEditing={
          editingSection ===
          'skills'
        }
        editDisabled={
          anotherSectionIsEditing &&
          editingSection !==
            'skills'
        }
        isSaving={
          isSaving
        }
        onEdit={() =>
          startEdit(
            'skills',
          )
        }
        onSave={() =>
          void saveEdit()
        }
        onCancel={
          cancelEdit
        }
      >
        {editingSection ===
        'skills' ? (
          <div className="space-y-3">
            {draft.skills.map(
              (
                skill,
              ) => (
                <div
                  key={
                    skill.id
                  }
                  className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-3 sm:flex-row"
                >
                  <input
                    className={`${INPUT_CLASS} flex-1`}
                    value={
                      skill.name
                    }
                    onChange={(
                      event,
                    ) =>
                      updateSkillName(
                        skill.id,

                        event.target.value,
                      )
                    }
                  />

                  <select
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    value={
                      skill.level
                    }
                    onChange={(
                      event,
                    ) =>
                      updateSkillLevel(
                        skill.id,

                        Number(
                          event.target.value,
                        ) as SkillLevel,
                      )
                    }
                  >
                    <option value={1}>
                      مبتدی
                    </option>

                    <option value={2}>
                      متوسط
                    </option>

                    <option value={3}>
                      خوب
                    </option>

                    <option value={4}>
                      پیشرفته
                    </option>

                    <option value={5}>
                      متخصص
                    </option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      removeSkill(
                        skill.id,
                      )
                    }
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2
                      size={17}
                    />
                  </button>
                </div>
              ),
            )}

            <AddButton
              text="افزودن مهارت"
              onClick={
                addSkill
              }
            />
          </div>
        ) : profile.skills.length >
          0 ? (
          <div className="space-y-4">
            {profile.skills.map(
              (
                skill,
              ) => (
                <div
                  key={
                    skill.id
                  }
                >
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-zinc-700">
                      {skill.name}
                    </span>

                    <span className="text-zinc-400">
                      {
                        [
                          '',
                          'مبتدی',
                          'متوسط',
                          'خوب',
                          'پیشرفته',
                          'متخصص',
                        ][skill.level]
                      }
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-zinc-100">
                    <div
                      className="h-1.5 rounded-full bg-zinc-900"
                      style={{
                        width:
                          `${(
                            skill.level /
                            5
                          ) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <EmptyState text="مهارت‌ها اختیاری هستند." />
        )}
      </SectionCard>


      <SectionCard
        title="زبان‌ها"
        icon={
          <Languages
            size={18}
          />
        }
        isEditing={
          editingSection ===
          'languages'
        }
        editDisabled={
          anotherSectionIsEditing &&
          editingSection !==
            'languages'
        }
        isSaving={
          isSaving
        }
        onEdit={() =>
          startEdit(
            'languages',
          )
        }
        onSave={() =>
          void saveEdit()
        }
        onCancel={
          cancelEdit
        }
      >
        {editingSection ===
        'languages' ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                className={
                  INPUT_CLASS
                }
                value={
                  newLanguage
                }
                onChange={(
                  event,
                ) =>
                  setNewLanguage(
                    event.target.value,
                  )
                }
                onKeyDown={(
                  event,
                ) => {
                  if (
                    event.key ===
                    'Enter'
                  ) {
                    event.preventDefault()

                    addLanguage()
                  }
                }}
                placeholder="مثلاً انگلیسی"
              />

              <button
                type="button"
                onClick={
                  addLanguage
                }
                className="rounded-lg bg-zinc-900 px-4 text-white"
              >
                افزودن
              </button>
            </div>


            <div className="flex flex-wrap gap-2">
              {draft.languages.map(
                (
                  language,
                ) => (
                  <span
                    key={
                      language
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-sm"
                  >
                    {language}

                    <button
                      type="button"
                      onClick={() =>
                        removeLanguage(
                          language,
                        )
                      }
                    >
                      <X
                        size={14}
                      />
                    </button>
                  </span>
                ),
              )}
            </div>
          </div>
        ) : profile.languages.length >
          0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.languages.map(
              (
                language,
              ) => (
                <span
                  key={
                    language
                  }
                  className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700"
                >
                  {language}
                </span>
              ),
            )}
          </div>
        ) : (
          <EmptyState text="زبان‌ها اختیاری هستند." />
        )}
      </SectionCard>
    </div>
  )
}


type SectionCardProps = {
  title:
    string

  icon:
    ReactNode

  isEditing:
    boolean

  editDisabled:
    boolean

  isSaving:
    boolean

  onEdit:
    () => void

  onSave:
    () => void

  onCancel:
    () => void

  children:
    ReactNode
}


function SectionCard({
  title,
  icon,
  isEditing,
  editDisabled,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-bold text-zinc-900">
          {icon}

          {title}
        </h2>

        {!isEditing ? (
          <button
            type="button"
            onClick={
              onEdit
            }
            disabled={
              editDisabled ||
              isSaving
            }
            className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Edit3
              size={14}
            />

            ویرایش
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                isSaving
              }
              onClick={
                onSave
              }
              className="flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Save
                  size={14}
                />
              )}

              ذخیره
            </button>

            <button
              type="button"
              disabled={
                isSaving
              }
              onClick={
                onCancel
              }
              className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs disabled:opacity-60"
            >
              <X
                size={14}
              />

              انصراف
            </button>
          </div>
        )}
      </div>

      {children}
    </section>
  )
}


function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label:
    string

  value:
    string

  placeholder?:
    string

  onChange:
    (
      value:
        string,
    ) => void
}) {
  return (
    <div>
      <label className={LABEL_CLASS}>
        {label}
      </label>

      <input
        className={
          INPUT_CLASS
        }
        value={
          value
        }
        placeholder={
          placeholder
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
      />
    </div>
  )
}


function InfoItem({
  icon,
  label,
  value,
}: {
  icon:
    ReactNode

  label:
    string

  value:
    ReactNode
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-zinc-400">
        {icon}

        <span className="text-xs">
          {label}
        </span>
      </div>

      <div className="break-words text-sm font-medium text-zinc-800">
        {value}
      </div>
    </div>
  )
}


function EmptyState({
  text,
}: {
  text:
    string
}) {
  return (
    <p className="rounded-xl border border-dashed border-zinc-200 py-6 text-center text-sm text-zinc-400">
      {text}
    </p>
  )
}


function AddButton({
  text,
  onClick,
}: {
  text:
    string

  onClick:
    () => void
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50"
    >
      <Plus
        size={16}
      />

      {text}
    </button>
  )
}


function DeleteButton({
  onClick,
}: {
  onClick:
    () => void
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
    >
      <Trash2
        size={14}
      />

      حذف
    </button>
  )
}