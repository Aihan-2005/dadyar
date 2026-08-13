'use client'

import Link from 'next/link'

import {
  usePathname,
  useRouter,
} from 'next/navigation'

import {
  Bell,
  CirclePlus,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'

import SupportButton from './support'

import {
  useAuthStore,
} from '@/store/auth.store'

import {
  useNotificationStore,
} from '@/store/notification.store'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function DashboardSidebar({
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const pathname =
    usePathname()

  const router =
    useRouter()

  const logout =
    useAuthStore(
      (state) =>
        state.logout
    )

  const notifications =
    useNotificationStore(
      (state) =>
        state.notifications
    )

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.status ===
        'unread'
    ).length

  const handleLogout =
    () => {
      logout()
      router.push('/login')
    }

  const handleNavClick =
    () => {
      if (
        typeof window !==
          'undefined' &&
        window.innerWidth <
          1024
      ) {
        onClose()
      }
    }

  const navItems = [
    {
      href: '/dashboard',
      label: 'داشبورد',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/cases',
      label: 'پرونده‌ها',
      icon: FolderOpen,
    },
    {
      href: '/dashboard/profile',
      label: 'پروفایل',
      icon: UserRound,
    },
    {
      href: '/dashboard/customers',
      label: 'موکلین',
      icon: UsersRound,
    },
  ]

  const isPathActive = (
    href: string
  ) => {
    if (
      href === '/dashboard'
    ) {
      return (
        pathname ===
        '/dashboard'
      )
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    )
  }

  const notificationsActive =
    pathname.startsWith(
      '/dashboard/notifications'
    )

  return (
    <>
      {/* Mobile Overlay */}

      {isOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-screen w-72 flex-col border-l border-slate-200 bg-white shadow-xl shadow-slate-200/40 transition-transform duration-300 ease-in-out lg:sticky lg:w-64 lg:translate-x-0 lg:shadow-none ${
          isOpen
            ? 'translate-x-0'
            : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}

        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-black text-white shadow-md shadow-blue-200">
              د
            </div>

            <div>
              <h1 className="text-xl font-black text-slate-950">
                دادیار
              </h1>

              <p className="mt-0.5 text-xs font-semibold text-slate-600">
                مدیریت دفتر وکالت
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 lg:hidden"
            aria-label="بستن منو"
          >
            <X
              size={21}
            />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-black text-slate-500">
            منوی اصلی
          </p>

          {navItems.map(
            (item) => {
              const Icon =
                item.icon

              const isActive =
                isPathActive(
                  item.href
                )

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  onClick={
                    handleNavClick
                  }
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-l from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                      isActive
                        ? 'bg-white/15'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                    }`}
                  >
                    <Icon
                      size={20}
                    />
                  </div>

                  <span>
                    {item.label}
                  </span>
                </Link>
              )
            }
          )}

          {/* Notifications */}

          <Link
            href="/dashboard/notifications"
            onClick={
              handleNavClick
            }
            className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
              notificationsActive
                ? 'bg-gradient-to-l from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200'
                : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <div
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition ${
                notificationsActive
                  ? 'bg-white/15'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
              }`}
            >
              <Bell
                size={20}
              />

              {unreadCount >
                0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                  {unreadCount >
                  99
                    ? '99+'
                    : unreadCount}
                </span>
              )}
            </div>

            <span>
              یادداشت‌ها
            </span>
          </Link>

          {/* New Case */}

          <div className="pt-4">
            <Link
              href="/dashboard/cases/new"
              onClick={
                handleNavClick
              }
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 hover:shadow-emerald-300"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <CirclePlus
                  size={22}
                  className="transition-transform group-hover:rotate-90"
                />
              </div>

              <div>
                <p>
                  پرونده جدید
                </p>

                <p className="mt-0.5 text-[11px] font-semibold text-emerald-50">
                  ثبت سریع پرونده
                </p>
              </div>
            </Link>
          </div>
        </nav>

        {/* Support */}

        <div className="px-4 pb-2">
          <SupportButton />
        </div>

        {/* Logout */}

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={
              handleLogout
            }
            className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 transition group-hover:bg-red-100">
              <LogOut
                size={20}
              />
            </div>

            <span>
              خروج از حساب
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}