// 'use client'

// import { useEffect } from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import { useAuthStore } from '@/store/auth.store'

// export default function AuthGuard({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const user = useAuthStore((s) => s.user)
//   const router = useRouter()
//   const pathname = usePathname()

//   useEffect(() => {
//     if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
//       return
//     }

//     if (!user) {
//       router.replace('/login')
//     }
//   }, [user, router, pathname])

//   if (
//     !user &&
//     !pathname.startsWith('/login') &&
//     !pathname.startsWith('/register')
//   ) {
//     return (
//       <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
//         در حال بررسی دسترسی...
//       </div>
//     )
//   }

//   return <>{children}</>
// }
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.replace('/login')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        در حال بررسی دسترسی...
      </div>
    )
  }

  return <>{children}</>
}
