import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification, CreateReminderPayload, NotificationStatus } from '@/types/notification'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addReminder: (payload: CreateReminderPayload) => void
  markAsRead: (id: string) => void
  markAsCompleted: (id: string) => void
  dismiss: (id: string) => void
  deleteNotification: (id: string) => void
  markAllAsRead: () => void
  getUnreadCount: () => number
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addReminder: (payload) => {
        const newNotification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'reminder',
          priority: payload.priority,
          status: 'unread',
          target: payload.target,
          title: payload.title,
          message: payload.message || '',
          caseId: payload.caseId,
          caseName: payload.caseName,
          clientId: payload.clientId,
          clientName: payload.clientName,
          scheduledFor: payload.scheduledFor,
          createdAt: new Date().toISOString(),
          completed: false,
        }

        set((state) => {
          const newNotifications = [newNotification, ...state.notifications];
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter(n => n.status === 'unread').length
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const newNotifications = state.notifications.map((n) =>
            n.id === id
              ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
              : n
          );
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter(n => n.status === 'unread').length
          };
        });
      },

      markAsCompleted: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, completed: !n.completed } : n
          ),
        }))
      },

      dismiss: (id) => {
        set((state) => {
          const newNotifications = state.notifications.map((n) =>
            n.id === id ? { ...n, status: 'dismissed' as NotificationStatus } : n
          );
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter(n => n.status === 'unread').length
          };
        });
      },

      deleteNotification: (id) => {
        set((state) => {
          const newNotifications = state.notifications.filter((n) => n.id !== id);
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter(n => n.status === 'unread').length
          };
        });
      },

      markAllAsRead: () => {
        set((state) => {
          const newNotifications = state.notifications.map((n) =>
            n.status === 'unread'
              ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
              : n
          );
          return {
            notifications: newNotifications,
            unreadCount: 0
          };
        });
      },

      getUnreadCount: () => {
        return get().notifications.filter(
          (n) => n.status === 'unread'
        ).length
      },
    }),
    {
      name: 'notification-storage',
    }
  )
)
