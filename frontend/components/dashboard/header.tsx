'use client'

import { useAuthStore } from '@/store/auth.store'
import { Bell, Search } from 'lucide-react'

export default function DashboardHeader() {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="bg-white border-b border-zinc-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" 
              size={20} 
            />
            <input
              type="text"
              placeholder="جستجوی پرونده..."
              className="w-full pr-10 pl-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors relative">
            <Bell size={20} className="text-zinc-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pr-4 border-r border-zinc-200">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-zinc-500">وکیل</p>
            </div>
            <div className="w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
