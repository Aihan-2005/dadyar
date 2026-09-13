import type {
  ClientPetitionDraft,
  ClientPetitionStatus,
} from '@/features/client-portal/types/petition'

export interface LawyerPetitionDraft extends ClientPetitionDraft {
  // موکل انتخاب‌شده از لیست موکلین ثبت‌شده‌ی وکیل (از /clients)
  clientId: string

  // اسنپ‌شات نام موکل، فقط برای نمایش سریع بدون نیاز به fetch دوباره
  clientName: string
}

export interface LawyerPetitionRecord extends LawyerPetitionDraft {
  schemaVersion: 1

  id: string
  reference: string
  lawyerId: string

  status: ClientPetitionStatus

  version: number

  createdAt: string
  updatedAt: string
}