import AuthForm from '@/components/forms/auth-form'

import {
  isSubscriptionPlanKey,
} from '@/lib/subscription-plans'

type RegisterPageProps = {
  searchParams:
    Promise<{
      plan?:
        string | string[]
    }>
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
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
    <AuthForm
      defaultTab="register"
      userType="lawyer"
      selectedPlanKey={
        selectedPlanKey
      }
    />
  )
}