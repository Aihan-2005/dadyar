'use client'

import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ChevronDown,
  LogOut,
  Scale,
  Search,
  Settings,
  X,
} from 'lucide-react'

import {
  usePathname,
  useRouter,
} from 'next/navigation'

import {
  NotificationBell,
} from '@/components/notifications/NotificationBell'

import {
  useAuthStore,
} from '@/store/auth.store'

import {
  useSearchStore,
} from '@/store/search.store'

interface DashboardHeaderProps {
  onMenuToggle?: () => void

  isSidebarOpen?: boolean
}

export function DashboardHeader({
  onMenuToggle,
}: DashboardHeaderProps) {
  const router =
    useRouter()

  const pathname =
    usePathname()

  const {
    user,
    logout,
  } = useAuthStore()

  const {
    query,
    setQuery,
    clearQuery,
    setSearchTerm,
  } = useSearchStore()

  const [
    userMenuOpen,
    setUserMenuOpen,
  ] = useState(false)

  const [
    focused,
    setFocused,
  ] = useState(false)

  const searchRef =
    useRef<HTMLInputElement>(
      null,
    )

  const menuRef =
    useRef<HTMLDivElement>(
      null,
    )

  const isClient =
    user?.role ===
    'CLIENT'

  const fullName =
    user
      ? `${user.firstName ?? ''} ${
          user.lastName ?? ''
        }`.trim()
      : 'کاربر'

  const initials =
    user
      ? `${
          user.firstName?.[0] ??
          ''
        }${
          user.lastName?.[0] ??
          ''
        }`.trim() ||
        (isClient
          ? 'م'
          : 'و')
      : 'ک'

  useEffect(() => {
    function clickOutside(
      event: MouseEvent,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setUserMenuOpen(
          false,
        )
      }
    }

    document.addEventListener(
      'mousedown',
      clickOutside,
    )

    return () =>
      document.removeEventListener(
        'mousedown',
        clickOutside,
      )
  }, [])

  const submitSearch =
    useCallback(() => {
      const value =
        query.trim()

      if (isClient) {
        const target =
          value
            ? `/dashboard/lawyers?search=${encodeURIComponent(
                value,
              )}`
            : '/dashboard/lawyers'

        router.push(
          target,
        )

        return
      }

      setSearchTerm(
        value,
      )

      router.push(
        value
          ? `/dashboard/cases?search=${encodeURIComponent(
              value,
            )}`
          : '/dashboard/cases',
      )
    }, [
      isClient,
      query,
      router,
      setSearchTerm,
    ])

  function handleSearchChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setQuery(
      event.target.value,
    )
  }

  function handleSearchKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key ===
      'Enter'
    ) {
      event.preventDefault()

      submitSearch()
    }
  }

  function handleClear() {
    clearQuery()

    if (
      isClient &&
      pathname.startsWith(
        '/dashboard/lawyers',
      )
    ) {
      router.push(
        '/dashboard/lawyers',
      )
    }

    if (
      !isClient &&
      pathname ===
        '/dashboard/cases'
    ) {
      router.push(
        '/dashboard/cases',
      )
    }

    searchRef.current?.focus()
  }

  async function handleLogout() {
    setUserMenuOpen(
      false,
    )

    await logout()

    router.replace(
      '/login',
    )
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {onMenuToggle && (
          <button
            type="button"
            onClick={
              onMenuToggle
            }
            className="sr-only"
          >
            باز کردن منو
          </button>
        )}

        <div className="mx-4 max-w-2xl flex-1">
          <div
            className={`relative rounded-lg transition ${
              focused
                ? 'ring-2 ring-blue-500'
                : ''
            }`}
          >
            <button
              type="button"
              onClick={
                submitSearch
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
              aria-label="جستجو"
            >
              <Search
                className="h-5 w-5"
              />
            </button>

            <input
              ref={
                searchRef
              }
              value={query}
              onChange={
                handleSearchChange
              }
              onKeyDown={
                handleSearchKeyDown
              }
              onFocus={() =>
                setFocused(
                  true,
                )
              }
              onBlur={() =>
                setFocused(
                  false,
                )
              }
              placeholder={
                isClient
                  ? 'جستجو بین وکلا...'
                  : 'جستجو در پرونده‌ها...'
              }
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none"
            />

            {query && (
              <button
                type="button"
                onClick={
                  handleClear
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X
                  className="h-4 w-4"
                />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <div
            ref={menuRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setUserMenuOpen(
                  (current) =>
                    !current,
                )
              }
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                {initials}
              </div>

              <span className="hidden sm:inline">
                {fullName}
              </span>

              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  userMenuOpen
                    ? 'rotate-180'
                    : ''
                }`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute left-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-200 p-3">
                  <p className="text-sm font-bold text-gray-900">
                    {fullName}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {user?.email ||
                      user?.phone ||
                      ''}
                  </p>
                </div>

                <div className="py-1">
                  {isClient ? (
                    <Link
                      href="/dashboard/lawyers"
                      onClick={() =>
                        setUserMenuOpen(
                          false,
                        )
                      }
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <Scale
                        size={16}
                      />

                      انتخاب وکیل
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/settings"
                      onClick={() =>
                        setUserMenuOpen(
                          false,
                        )
                      }
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <Settings
                        size={16}
                      />

                      تنظیمات
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      void handleLogout()
                    }
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut
                      size={16}
                    />

                    خروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}