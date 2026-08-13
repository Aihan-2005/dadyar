import AuthForm from '@/components/forms/auth-form'

import {
  isSubscriptionPlanKey,
} from '@/lib/subscription-plans'

type LoginPageProps = {
  searchParams:
    Promise<{
      plan?:
        string | string[]
    }>
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
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
      defaultTab="login"
      userType="lawyer"
      selectedPlanKey={
        selectedPlanKey
      }
    />
  )
}