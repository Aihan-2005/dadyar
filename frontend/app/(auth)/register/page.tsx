'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

const registerSchema = z.object({
  firstName: z.string().min(2, 'نام الزامی است'),
  lastName: z.string().min(2, 'نام خانوادگی الزامی است'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => {
    login({
      id: crypto.randomUUID(),
      firstName: data.firstName,
      lastName: data.lastName,
    })

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 border p-6 rounded-lg"
      >
        <h1 className="text-xl font-bold text-center">ثبت‌نام وکیل</h1>

        <div>
          <input
            {...register('firstName')}
            placeholder="نام"
            className="w-full border p-2 rounded"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('lastName')}
            placeholder="نام خانوادگی"
            className="w-full border p-2 rounded"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
          )}
        </div>

        <button className="w-full bg-black text-white py-2 rounded">
          ثبت‌نام
        </button>
      </form>
    </div>
  )
}
