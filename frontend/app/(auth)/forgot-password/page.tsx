import PasswordResetForm from '@/components/forms/password-reset-form'

import {
  isSubscriptionPlanKey,
} from '@/lib/subscription-plans'

type ForgotPasswordPageProps = {
  searchParams:
    Promise<{
      plan?:
        string | string[]
    }>
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params =
    await searchParams

  const rawPlan =
    Array.isArray(
      params.plan
    )
      ? params.plan[0]
      : params.plan

  const selectedPlanKey =
    isSubscriptionPlanKey(
      rawPlan
    )
      ? rawPlan
      : undefined

  return (
    <PasswordResetForm
      selectedPlanKey={
        selectedPlanKey
      }
    />
  )
}