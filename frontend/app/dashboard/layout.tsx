'use client'

import {
  useState,
} from 'react'

import {
  Menu,
} from 'lucide-react'

import AuthGuard from '@/components/auth-guard'

import DashboardSidebar from '@/components/dashboard/sidebar'

import {
  DashboardHeader,
} from '@/components/dashboard/header'

import {
  DashboardDataBootstrap,
} from '@/components/dashboard/DashboardDataBootstrap'



export default function DashboardLayout({
  children,
}: {
  children:
    React.ReactNode
}) {
  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] =
    useState(
      false
    )

  return (
    <AuthGuard>
   
      <DashboardDataBootstrap>
        <div
          className="flex min-h-screen bg-zinc-50"
          dir="rtl"
        >

          <button
            type="button"
            onClick={() =>
              setIsSidebarOpen(
                true
              )
            }
            className="fixed right-4 top-4 z-50 rounded-lg border border-zinc-200 bg-white p-2 shadow-md lg:hidden"
            aria-label="باز کردن منو"
          >
            <Menu
              size={24}
              className="text-zinc-700"
            />
          </button>


          <DashboardSidebar
            isOpen={
              isSidebarOpen
            }
            onClose={() =>
              setIsSidebarOpen(
                false
              )
            }
          />


          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardHeader />

            <main className="flex-1 overflow-auto p-6 pt-16 lg:pt-6">
              {children}
            </main>
          </div>
        </div>
      </DashboardDataBootstrap>
    </AuthGuard>
  )
}