import type {
  ClientPetitionDraft,
  ClientPetitionRecord,
  ClientPetitionStatus,
  PetitionPartyRole,
  PetitionTemplateKey,
} from '@/features/client-portal/types/petition'

export interface PetitionTemplateDefinition {
  key:
    PetitionTemplateKey

  title:
    string

  description:
    string

  subjectPlaceholder:
    string

  factsHint:
    string

  requestHint:
    string
}

export const PETITION_TEMPLATES:
  PetitionTemplateDefinition[] = [
    {
      key:
        'defense',

      title:
        'لایحه دفاعیه',

      description:
        'برای ارائه دفاعیات، توضیحات و پاسخ به ادعاهای مطرح‌شده در پرونده.',

      subjectPlaceholder:
        'مثلاً: لایحه دفاعیه در خصوص دعوای مطالبه وجه',

      factsHint:
        'ماجرا و ترتیب اتفاقات مرتبط با پرونده را به صورت روشن و زمانی شرح دهید.',

      requestHint:
        'نتیجه‌ای که از مرجع رسیدگی درخواست دارید را مشخص کنید.',
    },

    {
      key:
        'supplementary',

      title:
        'لایحه تکمیلی',

      description:
        'برای تکمیل توضیحات یا مستنداتی که قبلاً در پرونده ارائه شده‌اند.',

      subjectPlaceholder:
        'مثلاً: لایحه تکمیلی در خصوص مستندات ارائه‌شده',

      factsHint:
        'توضیح دهید این لایحه در تکمیل کدام مطلب یا مدرک قبلی ارائه می‌شود.',

      requestHint:
        'درخواست خود را با توجه به توضیحات تکمیلی مشخص کنید.',
    },

    {
      key:
        'response',

      title:
        'لایحه پاسخ',

      description:
        'برای پاسخ منظم به مطالب، ادعاها یا لایحه طرف مقابل.',

      subjectPlaceholder:
        'مثلاً: پاسخ به لایحه تقدیمی طرف مقابل',

      factsHint:
        'ابتدا موضوعات اصلی مطرح‌شده از سوی طرف مقابل را توضیح دهید.',

      requestHint:
        'نتیجه مورد درخواست خود را پس از پاسخ به موارد مطرح‌شده بنویسید.',
    },

    {
      key:
        'expert_objection',

      title:
        'اعتراض به نظریه کارشناسی',

      description:
        'برای بیان ایرادات، ابهامات یا نکات مورد اعتراض نسبت به نظریه کارشناسی.',

      subjectPlaceholder:
        'اعتراض به نظریه کارشناسی',

      factsHint:
        'مشخص کنید نسبت به کدام بخش از نظریه کارشناسی توضیح یا اعتراض دارید.',

      requestHint:
        'درخواست مورد نظر درباره نظریه کارشناسی را روشن بنویسید.',
    },

    {
      key:
        'procedural_request',

      title:
        'درخواست و توضیح به شعبه',

      description:
        'برای ثبت توضیح، درخواست یا اعلام موضوع مرتبط با روند رسیدگی.',

      subjectPlaceholder:
        'مثلاً: درخواست بررسی مستندات جدید',

      factsHint:
        'موضوعی که لازم است شعبه از آن مطلع شود را توضیح دهید.',

      requestHint:
        'درخواست مشخص خود از شعبه را بنویسید.',
    },

    {
      key:
        'custom',

      title:
        'لایحه عمومی',

      description:
        'برای موضوعاتی که در قالب‌های دیگر قرار نمی‌گیرند.',

      subjectPlaceholder:
        'موضوع لایحه',

      factsHint:
        'شرح کامل و منظم موضوع را وارد کنید.',

      requestHint:
        'خواسته و نتیجه مورد انتظار خود را مشخص کنید.',
    },
  ]

export const PETITION_PARTY_ROLE_LABELS:
  Record<
    PetitionPartyRole,
    string
  > = {
    plaintiff:
      'خواهان',

    defendant:
      'خوانده',

    appellant:
      'تجدیدنظرخواه',

    respondent:
      'تجدیدنظرخوانده',

    applicant:
      'متقاضی',

    complainant:
      'شاکی',

    accused:
      'مشتکی‌عنه / متهم',

    other:
      'سایر',
  }

export const PETITION_STATUS_LABELS:
  Record<
    ClientPetitionStatus,
    string
  > = {
    draft:
      'پیش‌نویس',

    ready:
      'آماده بررسی',
  }

export function getPetitionTemplate(
  key:
    PetitionTemplateKey
): PetitionTemplateDefinition {
  return (
    PETITION_TEMPLATES.find(
      (
        item
      ) =>
        item.key ===
        key
    ) ??
    PETITION_TEMPLATES[
      PETITION_TEMPLATES.length -
        1
    ]
  )
}

export function createEmptyPetitionDraft():
  ClientPetitionDraft {
  return {
    templateKey:
      'defense',

    authorityName:
      '',

    branch:
      '',

    caseNumber:
      '',

    archiveNumber:
      '',

    authorFullName:
      '',

    authorRole:
      'plaintiff',

    opposingPartyName:
      '',

    subject:
      '',

    facts:
      '',

    legalArguments:
      '',

    evidence:
      [],

    request:
      '',

    closingNotes:
      '',
  }
}

function cleanText(
  value:
    string | undefined
): string {
  return (
    value
      ?.replace(
        /\r\n/g,
        '\n'
      )
      .trim() ??
    ''
  )
}

export function normalizePetitionDraft(
  draft:
    ClientPetitionDraft
): ClientPetitionDraft {
  return {
    templateKey:
      draft.templateKey,

    authorityName:
      cleanText(
        draft.authorityName
      ),

    branch:
      cleanText(
        draft.branch
      ),

    caseNumber:
      cleanText(
        draft.caseNumber
      ) ||
      undefined,

    archiveNumber:
      cleanText(
        draft.archiveNumber
      ) ||
      undefined,

    authorFullName:
      cleanText(
        draft.authorFullName
      ),

    authorRole:
      draft.authorRole,

    opposingPartyName:
      cleanText(
        draft.opposingPartyName
      ) ||
      undefined,

    subject:
      cleanText(
        draft.subject
      ),

    facts:
      cleanText(
        draft.facts
      ),

    legalArguments:
      cleanText(
        draft.legalArguments
      ) ||
      undefined,

    evidence:
      draft.evidence
        .map(
          (
            item
          ) =>
            cleanText(
              item
            )
        )
        .filter(
          Boolean
        )
        .slice(
          0,
          30
        ),

    request:
      cleanText(
        draft.request
      ),

    closingNotes:
      cleanText(
        draft.closingNotes
      ) ||
      undefined,
  }
}

export function petitionRecordToDraft(
  record:
    ClientPetitionRecord
): ClientPetitionDraft {
  return normalizePetitionDraft({
    templateKey:
      record.templateKey,

    authorityName:
      record.authorityName,

    branch:
      record.branch,

    caseNumber:
      record.caseNumber,

    archiveNumber:
      record.archiveNumber,

    authorFullName:
      record.authorFullName,

    authorRole:
      record.authorRole,

    opposingPartyName:
      record.opposingPartyName,

    subject:
      record.subject,

    facts:
      record.facts,

    legalArguments:
      record.legalArguments,

    evidence:
      record.evidence,

    request:
      record.request,

    closingNotes:
      record.closingNotes,
  })
}

export function validatePetitionStep(
  draft:
    ClientPetitionDraft,

  step:
    1 | 2 | 3 | 4
): string[] {
  const normalized =
    normalizePetitionDraft(
      draft
    )

  const errors:
    string[] = []

  if (
    step ===
      1 ||
    step ===
      4
  ) {
    if (
      normalized.authorityName.length <
      3
    ) {
      errors.push(
        'نام مرجع قضایی یا مرجع رسیدگی را کامل وارد کنید.'
      )
    }
  }

  if (
    step ===
      2 ||
    step ===
      4
  ) {
    if (
      normalized.authorFullName.length <
      3
    ) {
      errors.push(
        'نام و نام خانوادگی تنظیم‌کننده لایحه را کامل وارد کنید.'
      )
    }

    if (
      normalized.subject.length <
      5
    ) {
      errors.push(
        'موضوع لایحه را کامل‌تر وارد کنید.'
      )
    }
  }

  if (
    step ===
      3 ||
    step ===
      4
  ) {
    if (
      normalized.facts.length <
      20
    ) {
      errors.push(
        'شرح موضوع باید حداقل ۲۰ کاراکتر باشد.'
      )
    }

    if (
      normalized.request.length <
      5
    ) {
      errors.push(
        'درخواست نهایی خود را مشخص کنید.'
      )
    }
  }

  return errors
}

export function buildPetitionText(
  rawDraft:
    ClientPetitionDraft
): string {
  const draft =
    normalizePetitionDraft(
      rawDraft
    )

  const lines:
    string[] = []

  const roleLabel =
    PETITION_PARTY_ROLE_LABELS[
      draft.authorRole
    ]

  lines.push(
    'بسمه تعالی'
  )

  lines.push(
    ''
  )

  lines.push(
    `ریاست محترم ${draft.authorityName}${
      draft.branch
        ? ` - ${draft.branch}`
        : ''
    }`
  )

  lines.push(
    ''
  )

  lines.push(
    `موضوع: ${draft.subject}`
  )

  if (
    draft.caseNumber
  ) {
    lines.push(
      `شماره پرونده: ${draft.caseNumber}`
    )
  }

  if (
    draft.archiveNumber
  ) {
    lines.push(
      `شماره بایگانی شعبه: ${draft.archiveNumber}`
    )
  }

  lines.push(
    ''
  )

  lines.push(
    'با سلام و احترام'
  )

  lines.push(
    ''
  )

  lines.push(
    `اینجانب ${draft.authorFullName} به عنوان ${roleLabel}${
      draft.opposingPartyName
        ? ` در پرونده مرتبط با ${draft.opposingPartyName}`
        : ''
    }، مطالب زیر را جهت بررسی و اتخاذ تصمیم مقتضی تقدیم می‌نمایم:`
  )

  lines.push(
    ''
  )

  lines.push(
    'شرح موضوع'
  )

  lines.push(
    draft.facts
  )

  if (
    draft.legalArguments
  ) {
    lines.push(
      ''
    )

    lines.push(
      'توضیحات و دفاعیات'
    )

    lines.push(
      draft.legalArguments
    )
  }

  if (
    draft.evidence.length >
    0
  ) {
    lines.push(
      ''
    )

    lines.push(
      'دلایل و مستندات'
    )

    draft.evidence.forEach(
      (
        item,
        index
      ) => {
        lines.push(
          `${(
            index +
            1
          ).toLocaleString(
            'fa-IR'
          )}. ${item}`
        )
      }
    )
  }

  lines.push(
    ''
  )

  lines.push(
    'درخواست'
  )

  lines.push(
    draft.request
  )

  if (
    draft.closingNotes
  ) {
    lines.push(
      ''
    )

    lines.push(
      'توضیحات پایانی'
    )

    lines.push(
      draft.closingNotes
    )
  }

  lines.push(
    ''
  )

  lines.push(
    'با احترام'
  )

  lines.push(
    draft.authorFullName
  )

  return lines.join(
    '\n'
  )
}

export function formatPetitionDateTime(
  value:
    string
): string {
  const date =
    new Date(
      value
    )

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'fa-IR',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    }
  ).format(
    date
  )
}

export function getPetitionStatusClassName(
  status:
    ClientPetitionStatus
): string {
  if (
    status ===
    'ready'
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  return 'border-amber-200 bg-amber-50 text-amber-700'
}