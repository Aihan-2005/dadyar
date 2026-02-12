'use client'

import { useAuthStore } from '@/store/auth.store'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">
        سلام {user?.firstName} 👋
      </h1>

      <p className="mt-2 text-gray-600">
        به پنل مدیریت پرونده‌ها خوش آمدید
      </p>
    </div>
  )
}
