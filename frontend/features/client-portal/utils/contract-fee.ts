import type {
  OnlineContractRecord,
} from '@/features/client-portal/types/contract'

/**
 * بک‌اند هنگام ساخت قرارداد feeToman را الزامی می‌گیرد،
 * پس موکل مقدار جایگزین ۱ می‌فرستد.
 * تا وقتی وکیل نسخه‌ای ثبت نکرده (version === 1)، حق‌الزحمه تعیین‌نشده است.
 * TODO: وقتی بک‌اند feeToman را اختیاری کرد، این placeholder حذف شود.
 */
export const FEE_PLACEHOLDER_TOMAN = 1

export function isContractFeePending(
  contract:
    Pick<
      OnlineContractRecord,
      'version'
    >,
): boolean {
  return contract.version <= 1
}

export function formatContractFee(
  contract:
    Pick<
      OnlineContractRecord,
      'version' | 'draft'
    >,
): string {
  return isContractFeePending(
    contract,
  )
    ? 'توسط وکیل تعیین می‌شود'
    : `${contract.draft.feeToman.toLocaleString(
        'fa-IR',
      )} تومان`
}