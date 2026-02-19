// 'use client'

// import { useAuthStore } from '@/store/auth.store'
// import { useSearchStore } from '@/store/search.store'
// import {
//   Bell,
//   Search,
//   X,
//   LogOut,
// } from 'lucide-react'
// import { useRouter, usePathname } from 'next/navigation'
// import { useEffect, useState } from 'react'

// export default function DashboardHeader() {
//   const user = useAuthStore((s) => s.user)
//   const router = useRouter()
//   const pathname = usePathname()

//   const { searchTerm, setSearchTerm } = useSearchStore()
//   const [localSearch, setLocalSearch] = useState(searchTerm)

//   useEffect(() => {
//     setLocalSearch(searchTerm)
//   }, [searchTerm])

//   const handleSearch = () => {
//     if (!localSearch.trim()) return

//     setSearchTerm(localSearch)

//     if (!pathname.includes('/cases')) {
//       router.push(`/cases?search=${encodeURIComponent(localSearch)}`)
//     }
//   }

//   return (
//     <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
//       <div className="flex h-16 items-center justify-between px-6">

//         {/* 🔍 Search */}
//         <div className="relative w-full max-w-md">
//           <Search
//             size={18}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
//           />

//           <input
//             value={localSearch}
//             onChange={(e) => setLocalSearch(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter') handleSearch()
//               if (e.key === 'Escape') {
//                 setLocalSearch('')
//                 setSearchTerm('')
//               }
//             }}
//             placeholder="جستجوی پرونده‌ها..."
//             className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pr-10 pl-10 py-2 text-sm
//               focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
//           />

//           {localSearch && (
//             <button
//               onClick={() => {
//                 setLocalSearch('')
//                 setSearchTerm('')
//               }}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
//             >
//               <X size={16} />
//             </button>
//           )}
//         </div>

//         {/* 🔔 Right */}
//         <div className="flex items-center gap-4">

//           {/* Notification (فعلاً فقط آیکون) */}
//           <button
//             className="relative rounded-xl p-2 hover:bg-zinc-100 transition"
//             aria-label="Notifications"
//           >
//             <Bell size={20} className="text-zinc-700" />

//             {/* unread dot */}
//             <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
//           </button>

//           {/* User */}
//           <div className="flex items-center gap-3 border-r pr-4 border-zinc-200">
//             <div className="text-right leading-tight">
//               <p className="text-sm font-semibold text-zinc-900">
//                 {user?.firstName} {user?.lastName}
//               </p>
//               <p className="text-xs text-zinc-500">وکیل</p>
//             </div>

//             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white font-bold">
//               {user?.firstName?.[0]}
//               {user?.lastName?.[0]}
//             </div>
//           </div>

//           {/* Logout */}
//           <button
//             className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition"
//             title="خروج"
//           >
//             <LogOut size={18} />
//           </button>
//         </div>
//       </div>
//     </header>
//   )
// }


"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useSearchStore } from "@/store/search.store";
import {NotificationBell} from "@/components/notifications/NotificationBell";

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { query, setQuery, clearQuery } = useSearchStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ─── بستن منوی کاربر با کلیک بیرون ───────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── کنترل کیبورد در جستجو ─────────────────────────────────────────────
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        clearQuery();
        searchRef.current?.blur();
      }
      if (e.key === "Enter" && query.trim()) {
        router.push(`/dashboard/cases?search=${encodeURIComponent(query)}`);
      }
    },
    [query, clearQuery, router]
  );

  // ─── خروج ──────────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    setIsUserMenuOpen(false);
    try {
      await logout();
    } catch {
      // خطای logout را نادیده می‌گیریم
    } finally {
      router.replace("/login");
    }
  }, [logout, router]);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "وک";

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 gap-3">
        
        {/* ─── سمت راست: دکمه منو (موبایل) + جستجو ─── */}
        <div className="flex items-center gap-3 flex-1">
          {/* دکمه منو موبایل */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="باز کردن منو"
          >
            <Menu size={20} />
          </button>

          {/* نوار جستجو */}
          <div
            className={`relative flex items-center w-full max-w-md transition-all duration-200 ${
              isFocused ? "max-w-lg" : ""
            }`}
          >
            <Search
              size={16}
              className={`absolute right-3 transition-colors ${
                isFocused ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="جستجو در پرونده‌ها... (Enter برای نتایج)"
              className={`w-full h-9 pr-9 pl-8 text-sm rounded-xl border transition-all duration-200 outline-none bg-gray-50
                ${
                  isFocused
                    ? "border-blue-400 bg-white shadow-md shadow-blue-100 ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              dir="rtl"
            />
            {/* دکمه پاک‌کردن */}
            {query && (
              <button
                onClick={() => {
                  clearQuery();
                  searchRef.current?.focus();
                }}
                className="absolute left-2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="پاک کردن جستجو"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ─── سمت چپ: اکشن‌ها ─── */}
        <div className="flex items-center gap-2">
          
          {/* ── نوتیفیکیشن ── */}
          <NotificationBell />

          {/* ── منوی کاربر ── */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className={`flex items-center gap-2 h-9 px-2 rounded-xl border transition-all duration-200
                ${
                  isUserMenuOpen
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                }`}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              {/* آواتار */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {userInitials}
              </div>

              {/* نام (دسکتاپ) */}
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-sm font-medium text-gray-800 max-w-[100px] truncate">
                  {user?.name ?? "کاربر"}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  {user?.email ?? "وکیل"}
                </span>
              </div>

              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown منوی کاربر */}
            {isUserMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* هدر dropdown */}
                <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user?.name ?? "کاربر"}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {user?.email ?? ""}
                  </p>
                </div>

                {/* آیتم‌های منو */}
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors group"
                >
                  <User
                    size={16}
                    className="text-gray-400 group-hover:text-blue-500 transition-colors"
                  />
                  <span>پروفایل من</span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors group"
                >
                  <Settings
                    size={16}
                    className="text-gray-400 group-hover:text-blue-500 transition-colors"
                  />
                  <span>تنظیمات</span>
                </Link>

                <div className="my-1 border-t border-gray-100" />

                {/* دکمه خروج */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors group"
                >
                  <LogOut
                    size={16}
                    className="group-hover:translate-x-[-2px] transition-transform"
                  />
                  <span>خروج از حساب</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
