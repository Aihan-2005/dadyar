// 'use client'

// import { useForm } from 'react-hook-form'
// import { z } from 'zod'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useAuthStore } from '@/store/auth.store'
// import { useRouter } from 'next/navigation'

// const registerSchema = z.object({
//   firstName: z.string().min(2, 'نام الزامی است'),
//   lastName: z.string().min(2, 'نام خانوادگی الزامی است'),
// })

// type RegisterFormData = z.infer<typeof registerSchema>

// export default function RegisterPage() {
//   const router = useRouter()
//   const login = useAuthStore((s) => s.login)

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<RegisterFormData>({
//     resolver: zodResolver(registerSchema),
//   })

//   const onSubmit = (data: RegisterFormData) => {
//     login({
//       id: crypto.randomUUID(),
//       firstName: data.firstName,
//       lastName: data.lastName,
//     })

//     router.push('/dashboard')
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="w-full max-w-sm space-y-4 border p-6 rounded-lg"
//       >
//         <h1 className="text-xl font-bold text-center">ثبت‌نام وکیل</h1>

//         <div>
//           <input
//             {...register('firstName')}
//             placeholder="نام"
//             className="w-full border p-2 rounded"
//           />
//           {errors.firstName && (
//             <p className="text-red-500 text-sm">{errors.firstName.message}</p>
//           )}
//         </div>

//         <div>
//           <input
//             {...register('lastName')}
//             placeholder="نام خانوادگی"
//             className="w-full border p-2 rounded"
//           />
//           {errors.lastName && (
//             <p className="text-red-500 text-sm">{errors.lastName.message}</p>
//           )}
//         </div>

//         <button className="w-full bg-black text-white py-2 rounded">
//           ثبت‌نام
//         </button>
//       </form>
//     </div>
//   )
// }

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
        className="w-full max-w-sm space-y-5 border p-6 rounded-lg shadow-lg"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">ثبت‌نام وکیل</h1>

        <div className="mb-4">
          <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">نام:</label>
          <input
            {...register('firstName')}
            placeholder="نام"
            className="w-full p-4 rounded-lg border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-blue-500 ring-opacity-50 text-gray-900"
            type="text"
            id="firstName"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-2">{errors.firstName.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">نام خانوادگی:</label>
          <input
            {...register('lastName')}
            placeholder="نام خانوادگی"
            className="w-full p-4 rounded-lg border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-blue-500 ring-opacity-50 text-gray-900"
            type="text"
            id="lastName"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-2">{errors.lastName.message}</p>
          )}
        </div>

        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all duration-300" type="submit">
          ثبت‌نام
        </button>
      </form>
    </div>
  )
}
