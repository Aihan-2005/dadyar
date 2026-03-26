import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification, CreateReminderPayload, NotificationStatus } from '@/types/notification'

interface NotificationState {
  notifications: Notification[]
  addReminder: (payload: CreateReminderPayload) => void
  markAsRead: (id: string) => void
  markAsCompleted: (id: string) => void
  dismiss: (id: string) => void
  markAllAsRead: () => void
  getUnreadCount: () => number
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addReminder: (payload) => {
        const newNotification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'reminder',
          priority: payload.priority,
          status: 'unread',
          target: payload.target,
          title: payload.title,
          message: payload.message,
          caseId: payload.caseId,
          caseName: payload.caseName,
          clientId: payload.clientId,
          clientName: payload.clientName,
          scheduledFor: payload.scheduledFor,
          createdAt: new Date().toISOString(),
          completed: false,
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }))
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id
              ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
              : n
          ),
        }))
      },

      markAsCompleted: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, completed: !n.completed } : n
          ),
        }))
      },

      dismiss: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, status: 'dismissed' as NotificationStatus } : n
          ),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.status === 'unread'
              ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
              : n
          ),
        }))
      },

      getUnreadCount: () => {
        return get().notifications.filter(
          (n) => n.status === 'unread' && n.status !== 'dismissed'
        ).length
      },
    }),
    {
      name: 'notification-storage',
    }
  )
)
