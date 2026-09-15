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

import type {
  LucideIcon,
} from 'lucide-react'

import {
  CalendarClock,
  CalendarDays,
  CirclePlus,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  NotebookPen,
  Scale,
  Ticket,
  User,
  Users2,
  X,
} from 'lucide-react'

import {
  getLawyerClientInquiries,
  subscribeClientLawyerInquiryChanges,
} from '@/services/client-lawyer-inquiry.service'

import {
  getLawyerConsultationBookings,
  subscribeConsultationBookingChanges,
} from '@/services/consultation-booking.service'

import {
  useAuthStore,
} from '@/store/auth.store'

import {
  useNotificationStore,
} from '@/store/notification.store'

import SupportButton from './support'


interface DashboardSidebarProps {
  isOpen:
    boolean

  onClose:
    () => void
}


interface NavItem {
  href:
    string

  label:
    string

  icon:
    LucideIcon
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
      (
        state,
      ) =>
        state.user,
    )

  const logout =
    useAuthStore(
      (
        state,
      ) =>
        state.logout,
    )

  const notifications =
    useNotificationStore(
      (
        state,
      ) =>
        state.notifications,
    )

  const [
    pendingRequestsCount,

    setPendingRequestsCount,
  ] =
    useState(
      0,
    )

  const [
    pendingBookingsCount,

    setPendingBookingsCount,
  ] =
    useState(
      0,
    )


  const isClient =
    user?.role ===
    'CLIENT'

  const isLawyer =
    user?.role ===
    'LAWYER'


  const unreadCount =
    notifications.filter(
      (
        notification,
      ) =>
        notification.status ===
        'unread',
    ).length


  useEffect(
    () => {
      if (
        !isLawyer
      ) {
        setPendingRequestsCount(
          0,
        )

        setPendingBookingsCount(
          0,
        )

        return
      }


      let active =
        true

      let loading =
        false


      const reload =
        async () => {
          if (
            loading
          ) {
            return
          }

          loading =
            true

          try {
            const [
              inquiryResult,

              bookingResult,
            ] =
              await Promise.allSettled([
                getLawyerClientInquiries({
                  status:
                    'SUBMITTED',

                  page:
                    1,

                  limit:
                    1,
                }),

                getLawyerConsultationBookings(),
              ])


            if (
              !active
            ) {
              return
            }


            if (
              inquiryResult.status ===
              'fulfilled'
            ) {
              setPendingRequestsCount(
                inquiryResult
                  .value
                  .pagination
                  .total,
              )
            }


            if (
              bookingResult.status ===
              'fulfilled'
            ) {
              setPendingBookingsCount(
                bookingResult
                  .value
                  .filter(
                    (
                      booking,
                    ) =>
                      booking.status ===
                      'PENDING',
                  )
                  .length,
              )
            }
          } finally {
            loading =
              false
          }
        }


      const handleFocus =
        () => {
          void reload()
        }


      void reload()


      const intervalId =
        window.setInterval(
          () => {
            void reload()
          },

          30_000,
        )


      const unsubscribeInquiries =
        subscribeClientLawyerInquiryChanges(
          () => {
            void reload()
          },
        )


      const unsubscribeBookings =
        subscribeConsultationBookingChanges(
          () => {
            void reload()
          },
        )


      window.addEventListener(
        'focus',

        handleFocus,
      )


      return () => {
        active =
          false

        window.clearInterval(
          intervalId,
        )

        unsubscribeInquiries()

        unsubscribeBookings()

        window.removeEventListener(
          'focus',

          handleFocus,
        )
      }
    },

    [
      isLawyer,
    ],
  )


  const lawyerNavItems:
    NavItem[] = [
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
          Users2,
      },

      {
        href:
          '/dashboard/contracts',

        label:
          'قراردادهای آنلاین',

        icon:
          FileText,
      },

      {
        href:
          '/dashboard/profile',

        label:
          'پروفایل',

        icon:
          User,
      },
    ]


  const clientNavItems:
    NavItem[] = [
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
      typeof window !==
        'undefined' &&
      window.innerWidth <
        1024
    ) {
      onClose()
    }
  }


  function isActive(
    href:
      string,
  ): boolean {
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
      pathname ===
        href ||
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


  const notificationsActive =
    pathname.startsWith(
      '/dashboard/notifications',
    )

  const ticketsActive =
    pathname.startsWith(
      '/dashboard/tickets',
    )


  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          onClick={
            onClose
          }
          className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed
          right-0
          top-0
          z-[70]
          flex
          h-screen
          w-72
          flex-col
          border-l
          border-slate-200
          bg-white
          shadow-xl
          shadow-slate-200/40
          transition-transform
          duration-300
          lg:sticky
          lg:w-64
          lg:translate-x-0
          lg:shadow-none

          ${
            isOpen
              ? 'translate-x-0'
              : 'translate-x-full lg:translate-x-0'
          }
        `}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <Link
            href="/dashboard"
            onClick={
              handleNavClick
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-black text-white shadow-md shadow-blue-200">
              د
            </div>

            <div>
              <h1 className="text-xl font-black text-slate-950">
                دادیار
              </h1>

              <p className="mt-0.5 text-xs font-semibold text-slate-600">
                {isClient
                  ? 'پنل موکل'
                  : 'مدیریت دفتر وکالت'}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="بستن منو"
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          >
            <X
              size={21}
            />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {navItems.map(
            (
              item,
            ) => (
              <SidebarLink
                key={
                  item.href
                }
                href={
                  item.href
                }
                label={
                  item.label
                }
                icon={
                  item.icon
                }
                active={
                  isActive(
                    item.href,
                  )
                }
                onClick={
                  handleNavClick
                }
              />
            ),
          )}

          {isLawyer && (
            <>
              <SidebarLink
                href="/dashboard/client-requests"
                label="ارتباط با موکلین"
                icon={
                  MessageSquareText
                }
                active={
                  isActive(
                    '/dashboard/client-requests',
                  )
                }
                badge={
                  pendingRequestsCount
                }
                onClick={
                  handleNavClick
                }
              />

              <SidebarLink
                href="/dashboard/availability"
                label="زمان‌های آزاد"
                icon={
                  CalendarDays
                }
                active={
                  isActive(
                    '/dashboard/availability',
                  )
                }
                onClick={
                  handleNavClick
                }
              />

              <SidebarLink
                href="/dashboard/client-bookings"
                label="رزروهای مشاوره"
                icon={
                  CalendarClock
                }
                active={
                  isActive(
                    '/dashboard/client-bookings',
                  )
                }
                badge={
                  pendingBookingsCount
                }
                onClick={
                  handleNavClick
                }
              />
            </>
          )}

          <SidebarLink
            href="/dashboard/notifications"
            label="یادداشت‌ها"
            icon={
              NotebookPen
            }
            active={
              notificationsActive
            }
            badge={
              unreadCount
            }
            onClick={
              handleNavClick
            }
          />

          <SidebarLink
            href="/dashboard/tickets"
            label="سوالات و پیشنهادات"
            icon={
              Ticket
            }
            active={
              ticketsActive
            }
            onClick={
              handleNavClick
            }
          />

          {isLawyer && (
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
          )}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <SupportButton />
        </div>

        <div className="border-t border-slate-200 p-4">
          {user && (
            <div className="mb-3 rounded-xl bg-slate-50 px-4 py-3">
              <p className="truncate text-xs font-black text-slate-800">
                {[
                  user.firstName,

                  user.lastName,
                ]
                  .filter(
                    Boolean,
                  )
                  .join(
                    ' ',
                  ) ||
                  user.phone ||
                  user.email ||
                  'کاربر دادیار'}
              </p>

              <p className="mt-1 text-[10px] font-semibold text-slate-500">
                {isClient
                  ? 'موکل'
                  : 'وکیل'}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              void handleLogout()
            }
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
          >
            <LogOut
              size={20}
            />

            <span>
              خروج
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}


function SidebarLink({
  href,

  label,

  icon:
    Icon,

  active,

  badge = 0,

  onClick,
}: {
  href:
    string

  label:
    string

  icon:
    LucideIcon

  active:
    boolean

  badge?:
    number

  onClick:
    () => void
}) {
  return (
    <Link
      href={
        href
      }
      onClick={
        onClick
      }
      className={`
        group
        flex
        items-center
        gap-3
        rounded-2xl
        px-4
        py-3.5
        text-sm
        font-black
        transition

        ${
          active
            ? 'bg-gradient-to-l from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200'
            : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
        }
      `}
    >
      <div
        className={`
          relative
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl

          ${
            active
              ? 'bg-white/15'
              : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
          }
        `}
      >
        <Icon
          size={20}
        />

        {badge >
          0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
            {badge >
            99
              ? '99+'
              : badge.toLocaleString(
                  'fa-IR',
                )}
          </span>
        )}
      </div>

      <span className="min-w-0 truncate">
        {label}
      </span>
    </Link>
  )
}