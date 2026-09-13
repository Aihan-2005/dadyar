'use client'
import {
  useEffect,
  useState,
} from 'react'
import Link from 'next/link'

import {
  usePathname,
  useRouter,
} from 'next/navigation'

import {
  Bell,
  FolderOpen,
  LayoutDashboard,
<<<<<<< HEAD
  MessageSquareText,
  NotebookPen,
  Ticket,
  UsersRound,
=======
  LogOut,
  Plus,
  Scale,
  User,
  Users2,
>>>>>>> 1e69bc1 (added feature to client part)
  X,
} from 'lucide-react'

import {
  getAllLawyerRequests,
  subscribeClientLawyerRequests,
} from '@/features/client-portal/data/client-communication.repository'

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

  const user =
    useAuthStore(
      (state) =>
        state.user,
    )

  const logout =
    useAuthStore(
      (state) =>
        state.logout,
    )

  const notifications =
    useNotificationStore(
      (state) =>
        state.notifications,
    )

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.status ===
        'unread',
    ).length

<<<<<<< HEAD
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0)

      useEffect(() => {
        const reload = () => {
          const count = getAllLawyerRequests().filter(
            (record) => record.status === 'submitted'
          ).length

          setPendingRequestsCount(count)
        }

        reload()

        return subscribeClientLawyerRequests(reload)
      }, [])
=======
  const isClient =
    user?.role ===
    'CLIENT'
>>>>>>> 1e69bc1 (added feature to client part)

  const lawyerNavItems = [
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
        '/dashboard/profile',

      label:
        'پروفایل',

      icon:
        User,
    },

    {
      href:
        '/dashboard/customers',

      label:
        'موکلین',

      icon:
        Users2,
    },
  ]

  const clientNavItems = [
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
        '/dashboard/lawyers',

      label:
        'انتخاب وکیل',

      icon:
        Scale,
    },
  ]

  const navItems =
    isClient
      ? clientNavItems
      : lawyerNavItems

  function handleNavClick() {
    if (
      window.innerWidth <
      1024
    ) {
      onClose()
    }
  }

  function isActive(
    href: string,
  ) {
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
        `${href}/`,
      )
    )
  }

  async function handleLogout() {
    await logout()

    router.replace(
      '/login',
    )
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          onClick={
            onClose
          }
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-screen w-64 flex-col border-l border-zinc-200 bg-white transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 ${
          isOpen
            ? 'translate-x-0'
            : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 p-6">
          <Link
            href="/dashboard"
            onClick={
              handleNavClick
            }
          >
            <h1 className="text-xl font-bold text-zinc-900">
              دادیار
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              {isClient
                ? 'پنل موکل'
                : 'سیستم مدیریت پرونده'}
            </p>
          </Link>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label="بستن منو"
          >
            <X
              size={20}
            />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map(
            (item) => {
              const Icon =
                item.icon

              const active =
                isActive(
                  item.href,
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
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-blue-600'
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      active
                        ? 'text-white'
                        : 'text-zinc-500 transition-colors group-hover:text-blue-500'
                    }
                  />

                  <span>
                    {
                      item.label
                    }
                  </span>
                </Link>
              )
            },
          )}
          <Link
          href="/dashboard/client-requests"
          onClick={handleNavClick}
          className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-black transition ${
            pathname.startsWith('/dashboard/client-requests')
              ? 'bg-gradient-to-l from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200'
              : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
          }`}
        >
          <div
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${
              pathname.startsWith('/dashboard/client-requests')
                ? 'bg-white/15'
                : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
            }`}
          >
            <MessageSquareText size={20} />

<<<<<<< HEAD
            {pendingRequestsCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
              </span>
            )}
          </div>

          ارتباط با موکلین
        </Link>

=======
>>>>>>> 1e69bc1 (added feature to client part)
          <Link
            href="/dashboard/notifications"
            onClick={
              handleNavClick
            }
            className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
              isActive(
                '/dashboard/notifications',
              )
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-zinc-700 hover:bg-zinc-100 hover:text-blue-600'
            }`}
          >
            <div className="relative">
              <Bell
                size={20}
                className={
                  isActive(
                    '/dashboard/notifications',
                  )
                    ? 'text-white'
                    : 'text-zinc-500 group-hover:text-blue-500'
                }
              />

              {unreadCount >
                0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
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

          {!isClient && (
            <Link
              href="/dashboard/cases/new"
              onClick={
                handleNavClick
              }
              className="group mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-3 text-white shadow-md shadow-emerald-200 transition-all duration-200 hover:from-emerald-600 hover:to-green-600"
            >
<<<<<<< HEAD
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
                    <Link
            href="/dashboard/tickets"
            onClick={
              handleNavClick
            }
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
              <Ticket
=======
              <Plus
>>>>>>> 1e69bc1 (added feature to client part)
                size={20}
              />

              <span className="font-medium">
                پرونده جدید
              </span>
            </Link>
          )}
        </nav>

        <SupportButton />

        <div className="border-t border-zinc-200 p-4">
          {user && (
            <div className="mb-3 px-4">
              <p className="truncate text-xs font-bold text-zinc-700">
                {[
                  user.firstName,
                  user.lastName,
                ]
                  .filter(
                    Boolean,
                  )
                  .join(' ')}
              </p>

              <p className="mt-1 text-[10px] text-zinc-400">
                {isClient
                  ? 'موکل'
                  : 'وکیل'}
              </p>
            </div>
          )}

<<<<<<< HEAD
            سوالات و پیشنهادات (تیکت)
          </Link>
        </nav>

=======
          <button
            type="button"
            onClick={() =>
              void handleLogout()
            }
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut
              size={20}
            />
>>>>>>> 1e69bc1 (added feature to client part)

            <span>
              خروج
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}