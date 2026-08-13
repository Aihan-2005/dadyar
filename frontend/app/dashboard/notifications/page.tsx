'use client'

import { useEffect, useState } from "react";

import {
  CheckCheck,
  NotebookPen,
  Plus,
} from 'lucide-react'

import {
  DashboardPageHeader,
} from '@/components/dashboard/DashboardPageHeader'

import {
  useNotificationStore,
} from '@/store/notification.store'

import {
  NotificationItem,
} from '@/components/notifications/NotificationItem'

import {
  AddReminderForm,
} from '@/components/notifications/AddReminderForm'

export default function NotificationsPage() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<
      'all' | 'lawyer' | 'client'
    >(
      'all'
    )

 const [showForm, setShowForm] = useState(false)

const {
  notifications,
  fetchNotifications,
  markAsRead,
  dismiss,
  markAllAsRead,
  markAsCompleted,
} = useNotificationStore()

useEffect(() => {
  fetchNotifications()
}, [fetchNotifications])

const activeNotifications = notifications.filter(
  (item) => item.status !== 'dismissed'
)

const unreadCount = activeNotifications.filter(
  (item) => item.status === 'unread'
).length
  const filtered =
    activeNotifications.filter(
      (item) => {
        if (
          activeTab ===
          'all'
        ) {
          return true
        }

        return (
          item.target ===
          activeTab
        )
      }
    )

  const tabs = [
    {
      key:
        'all',

      label:
        'همه',
    },

    {
      key:
        'lawyer',

      label:
        'یادآوری وکیل',
    },

    {
      key:
        'client',

      label:
        'یادآوری موکل',
    },
  ] as const

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardPageHeader
        title="یادداشت‌ها و اعلان‌ها"
        description={
          unreadCount >
          0
            ? `${unreadCount.toLocaleString(
                'fa-IR'
              )} مورد خوانده‌نشده`
            : 'یادداشت‌ها و پیگیری‌های مهم دفتر'
        }
        actions={
          <>
            {unreadCount >
              0 && (
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-black text-blue-700"
              >
                <CheckCheck
                  size={17}
                />

                همه خوانده شد
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                setShowForm(
                  (value) =>
                    !value
                )
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white"
            >
              <Plus
                size={18}
              />

              یادآوری جدید
            </button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-3xl">
        {showForm && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-black text-slate-900">
              افزودن یادآوری جدید
            </h2>

            <AddReminderForm
              onClose={() =>
                setShowForm(
                  false
                )
              }
            />
          </div>
        )}

        <div className="mb-4 flex w-fit gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map(
            (tab) => (
              <button
                key={
                  tab.key
                }
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab.key
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-black transition ${
                  activeTab ===
                  tab.key
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            )
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filtered.length ===
          0 ? (
            <div className="py-16 text-center text-slate-500">
              <NotebookPen
                size={34}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="text-sm font-bold">
                یادداشتی وجود ندارد
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(
                (notification) => (
                  <NotificationItem
                    key={
                      notification.id
                    }
                    notification={
                      notification
                    }
                    onRead={() =>
                      markAsRead(
                        notification.id
                      )
                    }
                    onDismiss={() =>
                      dismiss(
                        notification.id
                      )
                    }
                    onToggleComplete={() =>
                      markAsCompleted(
                        notification.id
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}