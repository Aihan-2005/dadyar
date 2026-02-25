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
import { NotificationBell } from "@/components/notifications/NotificationBell";

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

  const userFullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "کاربر";

  const userInitials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "وک"
    : "وک";

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

  const handleLogout = useCallback(async () => {
    setIsUserMenuOpen(false);
    try {
      await logout();
    } catch {
    } finally {
      router.replace("/login");
    }
  }, [logout, router]);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 gap-3">

        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="باز کردن منو"
          >
            <Menu size={20} />
          </button>

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

        <div className="flex items-center gap-2">

          <NotificationBell />

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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {userInitials}
              </div>

              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-sm font-medium text-gray-800 max-w-[100px] truncate">
                  {userFullName}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  وکیل دادگستری
                </span>
              </div>

              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isUserMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {userFullName}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    وکیل دادگستری
                  </p>
                </div>

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
