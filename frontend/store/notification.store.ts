import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification, CreateReminderPayload } from '@/types/notification'

function generateId() {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

interface NotificationStore {
  notifications: Notification[]
  // Actions
  addReminder: (payload: CreateReminderPayload) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismiss: (id: string) => void
  clearAll: () => void
  // Computed helpers
  unreadCount: () => number
  getByCase: (caseId: string) => Notification[]
  getClientReminders: () => Notification[]
  getLawyerReminders: () => Notification[]
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      addReminder: (payload) => {
        const notification: Notification = {
          id: generateId(),
          type: payload.target === 'client' ? 'client_reminder' : 'reminder',
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
        }
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }))
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, status: 'read' } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, status: 'read' })),
        })),

      dismiss: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      unreadCount: () =>
        get().notifications.filter((n) => n.status === 'unread').length,

      getByCase: (caseId) =>
        get().notifications.filter((n) => n.caseId === caseId),

      getClientReminders: () =>
        get().notifications.filter((n) => n.target === 'client'),

      getLawyerReminders: () =>
        get().notifications.filter((n) => n.target === 'lawyer'),
    }),
    {
      name: 'notifications-storage',
    }
  )
)
