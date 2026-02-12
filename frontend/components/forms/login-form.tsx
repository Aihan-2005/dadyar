'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth.store'

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    await new Promise((r) => setTimeout(r, 800))

    login({
      id: '1',
      name: 'وکیل دادیار',
      email: data.email,
      role: 'lawyer',
    })

    router.replace('/')
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow"
    >
      <h1 className="text-center text-xl font-bold">ورود وکلا</h1>

      <div>
        <input
          {...register('email')}
          type="email"
          placeholder="ایمیل"
          className="w-full rounded border px-3 py-2"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <input
          {...register('password')}
          type="password"
          placeholder="رمز عبور"
          className="w-full rounded border px-3 py-2"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-zinc-900 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {isSubmitting ? 'در حال ورود...' : 'ورود'}
      </button>
    </form>
  )
}
