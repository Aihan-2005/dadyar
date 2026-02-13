'use client'

import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'
import { Plus, FolderOpen } from 'lucide-react'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          سلام {user?.firstName} {user?.lastName} 👋
        </h1>
        <p className="text-zinc-600 mt-1">
          به پنل مدیریت پرونده‌ها خوش آمدید
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/cases/new"
          className="p-6 bg-white rounded-lg border border-zinc-200 hover:border-zinc-900 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Plus className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">پرونده جدید</h3>
              <p className="text-sm text-zinc-600">ثبت پرونده جدید</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/cases"
          className="p-6 bg-white rounded-lg border border-zinc-200 hover:border-zinc-900 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FolderOpen className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">پرونده‌ها</h3>
              <p className="text-sm text-zinc-600">مشاهده همه پرونده‌ها</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
