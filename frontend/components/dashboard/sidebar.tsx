'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderOpen, 
  User, 
  LogOut,
  Plus
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navItems = [
    { 
      href: '/dashboard', 
      label: 'داشبورد', 
      icon: LayoutDashboard 
    },
    { 
      href: '/dashboard/cases', 
      label: 'پرونده‌ها', 
      icon: FolderOpen 
    },
    { 
      href: '/dashboard/profile', 
      label: 'پروفایل', 
      icon: User 
    },
  ]

  return (
    <aside className="w-64 bg-white border-l border-zinc-200 flex flex-col">
      <div className="p-6 border-b border-zinc-200">
        <h1 className="text-xl font-bold text-zinc-900">دادیار</h1>
        <p className="text-sm text-zinc-500 mt-1">سیستم مدیریت پرونده</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-zinc-900 text-white' 
                  : 'text-zinc-700 hover:bg-zinc-100'
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}

        <Link
          href="/dashboard/cases/new"
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors mt-4"
        >
          <Plus size={20} />
          <span className="font-medium">پرونده جدید</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-zinc-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">خروج</span>
        </button>
      </div>
    </aside>
  )
}
