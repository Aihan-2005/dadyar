import Link from 'next/link'

import {
  BriefcaseBusiness,
  CheckCircle2,
  UserRound,
} from 'lucide-react'

import {
  getSubscriptionPlan,
  isSubscriptionPlanKey,
} from '@/lib/subscription-plans'

type LaunchPageProps = {
  searchParams:
    Promise<{
      plan?:
        string | string[]
    }>
}

export default async function LaunchPage({
  searchParams,
}: LaunchPageProps) {
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

  const selectedPlan =
    selectedPlanKey
      ? getSubscriptionPlan(
          selectedPlanKey
        )
      : undefined

  const planQuery =
    selectedPlanKey
      ? `?plan=${selectedPlanKey}`
      : ''

  return (
    <main
      dir="rtl"
      className="relative h-dvh overflow-hidden bg-slate-100 text-slate-950"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-48 h-[520px] w-[520px] rounded-full bg-blue-300/30 blur-[110px]" />

        <div className="absolute -bottom-48 -left-36 h-[480px] w-[480px] rounded-full bg-emerald-200/20 blur-[110px]" />
      </div>

      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-black text-white shadow-md shadow-blue-200">
              د
            </div>

            <div>
              <p className="text-lg font-black text-slate-950">
                دادیار
              </p>

              <p className="hidden text-xs font-semibold text-slate-600 sm:block">
                مدیریت هوشمند دفتر وکالت
              </p>
            </div>
          </Link>

          <Link
            href="/#plans"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
          >
            تغییر پلن
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center justify-center px-4 pb-4 pt-20 sm:px-8">
        <div className="w-full max-w-4xl text-center">
          {selectedPlan && (
            <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
              <CheckCircle2
                size={17}
              />

              پلن انتخابی:
              {' '}
              {
                selectedPlan.title
              }
            </div>
          )}

          <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
            چطور می‌خواهید وارد دادیار شوید؟
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-8 text-slate-700">
            نوع حساب خود را انتخاب کنید تا
            وارد بخش مربوط به خودتان شوید.
          </p>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
            <Link
              href={`/login${planQuery}`}
              className="group rounded-[28px] border border-blue-300 bg-white p-6 text-right shadow-md shadow-slate-300/40 transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <BriefcaseBusiness
                  size={27}
                />
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950">
                ورود وکلا
              </h2>

              <p className="mt-2 text-base font-semibold leading-7 text-slate-700">
                ورود یا ثبت‌نام برای مدیریت
                پرونده‌ها، موکلین و امور
                مالی دفتر
              </p>

              <p className="mt-4 text-sm font-black text-blue-700">
                ادامه به عنوان وکیل ←
              </p>
            </Link>

            <Link
              href="/client-login"
              className="group rounded-[28px] border border-emerald-300 bg-white p-6 text-right shadow-md shadow-slate-300/40 transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <UserRound
                  size={27}
                />
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950">
                ورود موکلین
              </h2>

              <p className="mt-2 text-base font-semibold leading-7 text-slate-700">
                دسترسی موکل به اطلاعات و
                وضعیت پرونده‌ها
              </p>

              <p className="mt-4 text-sm font-black text-emerald-700">
                مشاهده پنل موکل ←
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}