'use client'

import Link from 'next/link'

import {
  usePathname,
  useRouter,
} from 'next/navigation'

import {
  CirclePlus,
  FolderOpen,
  LayoutDashboard,
  NotebookPen,
  Ticket,
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
  isOpen:
    boolean

  onClose:
    () => void
}

export default function DashboardSidebar({
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const pathname =
    usePathname()

  const router =
    useRouter()



  const notifications =
    useNotificationStore(
      (state) =>
        state.notifications
    )

  const unreadCount =
    notifications.filter(
      (item) =>
        item.status ===
        'unread'
    ).length



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
      href:
        '/dashboard',

      label:
        'داشبورد',

      icon:
        LayoutDashboard,
    },

    {
      href:
        '/dashboard/cases',

      label:
        'پرونده‌ها',

      icon:
        FolderOpen,
    },

   

    {
      href:
        '/dashboard/customers',

      label:
        'موکلین',

      icon:
        UsersRound,
    },
  ]

  const isPathActive =
    (
      href:
        string
    ) => {
      if (
        href ===
        '/dashboard'
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

  const notificationActive =
    pathname.startsWith(
      '/dashboard/notifications'
    )
    const ticketsActive = pathname.startsWith('/dashboard/tickets')
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-screen w-72 flex-col border-l border-slate-200 bg-white shadow-xl shadow-slate-200/40 transition-transform duration-300 lg:sticky lg:w-64 lg:translate-x-0 lg:shadow-none ${
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
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X
              size={21}
            />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {navItems.map(
            (item) => {
              const Icon =
                item.icon

              const active =
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
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-black transition ${
                    active
                      ? 'bg-gradient-to-l from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      active
                        ? 'bg-white/15'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                    }`}
                  >
                    <Icon
                      size={20}
                    />
                  </div>

                  {item.label}
                </Link>
              )
            }
          )}

          {/* Notes */}

          <Link
            href="/dashboard/notifications"
            onClick={
              handleNavClick
            }
            className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-black transition ${
              notificationActive
                ? 'bg-gradient-to-l from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200'
                : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <div
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${
                notificationActive
                  ? 'bg-white/15'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
              }`}
            >
              <NotebookPen
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

            یادداشت‌ها
          </Link>

          {/* New Case */}

          <div className="pt-4">
            <Link
              href="/dashboard/cases/new"
              onClick={
                handleNavClick
              }
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <CirclePlus
                  size={22}
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

<div className="px-4 pb-2">
  <Link
    href="/dashboard/tickets"
    onClick={handleNavClick}
    className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-black transition ${
      ticketsActive
        ? 'bg-gradient-to-l from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200'
        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
    }`}
  >
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
        ticketsActive
          ? 'bg-white/15'
          : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
      }`}
    >
      <Ticket size={20} />
    </div>

    سوالات و پیشنهادات (تیکت)
  </Link>
</div>

<div className="border-t border-slate-200 p-4">
  <SupportButton />
</div>
      </aside>
    </>
  )
}