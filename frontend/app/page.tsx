// import Image from "next/image";
// import Link from "next/link";

// export default function HomePage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
//       <main className="w-full max-w-4xl px-6 py-24 flex flex-col items-center text-center gap-8">
        
//         <Image
//           src="/next.svg"
//           alt="Dadyar Logo"
//           width={120}
//           height={30}
//           priority
//           className="dark:invert"
//         />

//         <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
//           پلتفرم مدیریت هوشمند پرونده‌های حقوقی
//         </h1>

//         <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//           دادیار یک ابزار حرفه‌ای برای وکلاست؛  
//           ثبت پرونده، قرارداد مرحله‌ای و مدیریت روند کاری، ساده و متمرکز.
//         </p>

//         <div className="flex flex-col sm:flex-row gap-4 mt-6">
//           <Link
//             href="/register"
//             className="h-12 px-6 rounded-full bg-black text-white flex items-center justify-center hover:bg-zinc-800 transition-colors"
//           >
//             شروع به کار
//           </Link>

//           <Link
//             href="/login"
//             className="h-12 px-6 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
//           >
//             ورود وکلا
//           </Link>
//         </div>
//       </main>
//     </div>
//   );
// }
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [user, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-zinc-500">در حال بارگذاری...</div>
    </div>
  )
}
