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
  getAllLawyerRequests,
  subscribeClientLawyerRequests,
} from '@/features/client-portal/data/client-communication.repository'

import {
  useAuthStore,
} from '@/store/auth.store'

import {
  useNotificationStore,
} from '@/store/notification.store'

import SupportButton from './support'


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

  const [
    pendingRequestsCount,
    setPendingRequestsCount,
  ] = useState(0)


  const isClient =
    user?.role ===
    'CLIENT'


  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.status ===
        'unread',
    ).length


  useEffect(() => {
    if (isClient) {
      setPendingRequestsCount(0)

      return
    }

    const reload = () => {
      const count =
        getAllLawyerRequests().filter(
          (record) =>
            record.status ===
            'submitted',
        ).length

      setPendingRequestsCount(
        count,
      )
    }

    reload()

    return subscribeClientLawyerRequests(
      reload,
    )
  }, [isClient])


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
      typeof window !==
        'undefined' &&
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


  const clientRequestsActive =
    pathname.startsWith(
      '/dashboard/client-requests',
    )


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
          className="
            fixed
            inset-0
            z-[60]
            bg-slate-950/40
            backdrop-blur-sm
            lg:hidden
          "
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
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            p-5
          "
        >
          <Link
            href="/dashboard"
            onClick={
              handleNavClick
            }
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-blue-500
                to-blue-700
                text-lg
                font-black
                text-white
                shadow-md
                shadow-blue-200
              "
            >
              د
            </div>

            <div>
              <h1
                className="
                  text-xl
                  font-black
                  text-slate-950
                "
              >
                دادیار
              </h1>

              <p
                className="
                  mt-0.5
                  text-xs
                  font-semibold
                  text-slate-600
                "
              >
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
            className="
              rounded-xl
              p-2
              text-slate-600
              transition
              hover:bg-slate-100
              lg:hidden
            "
          >
            <X
              size={21}
            />
          </button>
        </div>


        <nav
          className="
            flex-1
            space-y-1.5
            overflow-y-auto
            p-4
          "
        >
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
                      flex
                      h-9
                      w-9
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
                  </div>

                  <span>
                    {item.label}
                  </span>
                </Link>
              )
            },
          )}


          {!isClient && (
            <Link
              href="/dashboard/client-requests"
              onClick={
                handleNavClick
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
                  clientRequestsActive
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
                  items-center
                  justify-center
                  rounded-xl

                  ${
                    clientRequestsActive
                      ? 'bg-white/15'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                  }
                `}
              >
                <MessageSquareText
                  size={20}
                />

                {pendingRequestsCount >
                  0 && (
                  <span
                    className="
                      absolute
                      -right-1.5
                      -top-1.5
                      flex
                      h-5
                      min-w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-red-500
                      px-1
                      text-[10px]
                      font-black
                      text-white
                      ring-2
                      ring-white
                    "
                  >
                    {pendingRequestsCount >
                    99
                      ? '99+'
                      : pendingRequestsCount}
                  </span>
                )}
              </div>

              <span>
                ارتباط با موکلین
              </span>
            </Link>
          )}


          <Link
            href="/dashboard/notifications"
            onClick={
              handleNavClick
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
                notificationsActive
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
                items-center
                justify-center
                rounded-xl

                ${
                  notificationsActive
                    ? 'bg-white/15'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                }
              `}
            >
              <NotebookPen
                size={20}
              />

              {unreadCount >
                0 && (
                <span
                  className="
                    absolute
                    -right-1.5
                    -top-1.5
                    flex
                    h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-1
                    text-[10px]
                    font-black
                    text-white
                    ring-2
                    ring-white
                  "
                >
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


          <Link
            href="/dashboard/tickets"
            onClick={
              handleNavClick
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
                ticketsActive
                  ? 'bg-gradient-to-l from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
              }
            `}
          >
            <div
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl

                ${
                  ticketsActive
                    ? 'bg-white/15'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                }
              `}
            >
              <Ticket
                size={20}
              />
            </div>

            <span>
              سوالات و پیشنهادات
            </span>
          </Link>


          {!isClient && (
            <div
              className="
                pt-4
              "
            >
              <Link
                href="/dashboard/cases/new"
                onClick={
                  handleNavClick
                }
                className="
                  group
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  bg-gradient-to-l
                  from-emerald-500
                  to-teal-600
                  px-4
                  py-4
                  text-sm
                  font-black
                  text-white
                  shadow-lg
                  shadow-emerald-200
                  transition
                  hover:-translate-y-0.5
                  hover:from-emerald-600
                  hover:to-teal-700
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/15
                  "
                >
                  <CirclePlus
                    size={22}
                  />
                </div>

                <div>
                  <p>
                    پرونده جدید
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      font-semibold
                      text-emerald-50
                    "
                  >
                    ثبت سریع پرونده
                  </p>
                </div>
              </Link>
            </div>
          )}
        </nav>


        <div
          className="
            border-t
            border-slate-200
            p-4
          "
        >
          <SupportButton />
        </div>


        <div
          className="
            border-t
            border-slate-200
            p-4
          "
        >
          {user && (
            <div
              className="
                mb-3
                rounded-xl
                bg-slate-50
                px-4
                py-3
              "
            >
              <p
                className="
                  truncate
                  text-xs
                  font-black
                  text-slate-800
                "
              >
                {[
                  user.firstName,
                  user.lastName,
                ]
                  .filter(
                    Boolean,
                  )
                  .join(' ')}
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  font-semibold
                  text-slate-500
                "
              >
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
            className="
              group
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-black
              text-red-600
              transition
              hover:bg-red-50
            "
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