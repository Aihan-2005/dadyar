'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderOpen, 
  User, 
  LogOut,
  Plus,
  Bell,
  Users2,
  X
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useNotificationStore } from '@/store/notification.store'

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = notifications.filter(n => n.status === 'unread').length

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  const navItems = [
    { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
    { href: '/dashboard/cases', label: 'پرونده‌ها', icon: FolderOpen },
    { href: '/dashboard/profile', label: 'پروفایل', icon: User },
    { href: '/dashboard/customers', label: 'موکلین', icon: Users2 },
  ]

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-64 bg-white border-l border-zinc-200 flex flex-col z-[70] transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">دادیار</h1>
            <p className="text-sm text-zinc-500 mt-1">سیستم مدیریت پرونده</p>
          </div>
          
          {/* Close button - فقط در موبایل */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="بستن منو"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-blue-600'
                  }`}
              >
                <Icon 
                  size={20} 
                  className={`transition-colors ${
                    isActive ? 'text-white' : 'text-zinc-500 group-hover:text-blue-500'
                  }`} 
                />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {/* Notifications */}
          <Link
            href="/dashboard/notifications"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative
              ${pathname === '/dashboard/notifications'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-zinc-700 hover:bg-zinc-100 hover:text-blue-600'}`}
          >
            <div className="relative">
              <Bell 
                size={20} 
                className={`transition-colors ${
                  pathname === '/dashboard/notifications' ? 'text-white' : 'text-zinc-500 group-hover:text-blue-500'
                }`} 
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <span>یادداشت‌ها</span>
          </Link>

          {/* Add New Case */}
          <Link
            href="/dashboard/cases/new"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 transition-all duration-200 mt-4 shadow-md shadow-emerald-200 hover:shadow-emerald-300 group"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">پرونده جدید</span>
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-zinc-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 w-full font-medium group"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span>خروج</span>
          </button>
        </div>
      </aside>
    </>
  )
}
