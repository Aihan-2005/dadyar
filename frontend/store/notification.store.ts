// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
// import type { Notification, CreateReminderPayload, NotificationStatus } from '@/types/notification'

// interface NotificationState {
//   notifications: Notification[]
//   unreadCount: number
//   addReminder: (payload: CreateReminderPayload) => void
//   markAsRead: (id: string) => void
//   markAsCompleted: (id: string) => void
//   dismiss: (id: string) => void
//   deleteNotification: (id: string) => void
//   markAllAsRead: () => void
//   getUnreadCount: () => number
// }

// export const useNotificationStore = create<NotificationState>()(
//   persist(
//     (set, get) => ({
//       notifications: [],
//       unreadCount: 0,

//       addReminder: (payload) => {
//         const newNotification: Notification = {
//           id: Math.random().toString(36).substr(2, 9),
//           type: 'reminder',
//           priority: payload.priority,
//           status: 'unread',
//           target: payload.target,
//           title: payload.title,
//           message: payload.message || '',
//           caseId: payload.caseId,
//           caseName: payload.caseName,
//           clientId: payload.clientId,
//           clientName: payload.clientName,
//           scheduledFor: payload.scheduledFor,
//           createdAt: new Date().toISOString(),
//           completed: false,
//         }

//         set((state) => {
//           const newNotifications = [newNotification, ...state.notifications];
//           return {
//             notifications: newNotifications,
//             unreadCount: newNotifications.filter(n => n.status === 'unread').length
//           };
//         });
//       },

//       markAsRead: (id) => {
//         set((state) => {
//           const newNotifications = state.notifications.map((n) =>
//             n.id === id
//               ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
//               : n
//           );
//           return {
//             notifications: newNotifications,
//             unreadCount: newNotifications.filter(n => n.status === 'unread').length
//           };
//         });
//       },

//       markAsCompleted: (id) => {
//         set((state) => ({
//           notifications: state.notifications.map((n) =>
//             n.id === id ? { ...n, completed: !n.completed } : n
//           ),
//         }))
//       },

//       dismiss: (id) => {
//         set((state) => {
//           const newNotifications = state.notifications.map((n) =>
//             n.id === id ? { ...n, status: 'dismissed' as NotificationStatus } : n
//           );
//           return {
//             notifications: newNotifications,
//             unreadCount: newNotifications.filter(n => n.status === 'unread').length
//           };
//         });
//       },

//       deleteNotification: (id) => {
//         set((state) => {
//           const newNotifications = state.notifications.filter((n) => n.id !== id);
//           return {
//             notifications: newNotifications,
//             unreadCount: newNotifications.filter(n => n.status === 'unread').length
//           };
//         });
//       },

//       markAllAsRead: () => {
//         set((state) => {
//           const newNotifications = state.notifications.map((n) =>
//             n.status === 'unread'
//               ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
//               : n
//           );
//           return {
//             notifications: newNotifications,
//             unreadCount: 0
//           };
//         });
//       },

//       getUnreadCount: () => {
//         return get().notifications.filter(
//           (n) => n.status === 'unread'
//         ).length
//       },
//     }),
//     {
//       name: 'notification-storage',
//     }
//   )
// )
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

import type { Notification, CreateReminderPayload, NotificationStatus } from '@/types/notification'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null

  fetchNotifications: () => Promise<void>
  addReminder: (payload: CreateReminderPayload) => Promise<Notification | null>
  markAsRead: (id: string) => Promise<void>
  markAsCompleted: (id: string) => Promise<void>
  dismiss: (id: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>

  getUnreadCount: () => number
}

const getErrorMessage = (err: any) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'خطایی رخ داده است'
  )
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      fetchNotifications: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await api.get('/notifications')

          const notifications: Notification[] = response.data

          set({
            notifications,
            unreadCount: notifications.filter(n => n.status === 'unread').length,
            isLoading: false
          })
        } catch (err: any) {
          set({
            error: getErrorMessage(err),
            isLoading: false
          })
        }
      },

      addReminder: async (payload) => {
        set({ isLoading: true, error: null })

        try {
          const response = await api.post('/notifications/reminders', payload)

          const newNotification: Notification = response.data

          set((state) => {
            const notifications = [newNotification, ...state.notifications]

            return {
              notifications,
              unreadCount: notifications.filter(n => n.status === 'unread').length,
              isLoading: false
            }
          })

          return newNotification
        } catch (err: any) {
          set({
            error: getErrorMessage(err),
            isLoading: false
          })

          return null
        }
      },

      markAsRead: async (id) => {
        try {
          await api.patch(`/notifications/${id}/read`)

          set((state) => {
            const notifications = state.notifications.map((n) =>
              n.id === id
                ? { ...n, status: 'read' as NotificationStatus }
                : n
            )

            return {
              notifications,
              unreadCount: notifications.filter(n => n.status === 'unread').length
            }
          })
        } catch (err) {}
      },

      markAsCompleted: async (id) => {
        try {
          await api.patch(`/notifications/${id}/complete`)

          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, completed: !n.completed } : n
            ),
          }))
        } catch (err) {}
      },

      dismiss: async (id) => {
        try {
          await api.patch(`/notifications/${id}/dismiss`)

          set((state) => {
            const notifications = state.notifications.map((n) =>
              n.id === id ? { ...n, status: 'dismissed' as NotificationStatus } : n
            )

            return {
              notifications,
              unreadCount: notifications.filter(n => n.status === 'unread').length
            }
          })
        } catch (err) {}
      },

      deleteNotification: async (id) => {
        try {
          await api.delete(`/notifications/${id}`)

          set((state) => {
            const notifications = state.notifications.filter((n) => n.id !== id)

            return {
              notifications,
              unreadCount: notifications.filter(n => n.status === 'unread').length
            }
          })
        } catch (err) {}
      },

      markAllAsRead: async () => {
        try {
          await api.patch('/notifications/read-all')

          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.status === 'unread'
                ? { ...n, status: 'read' as NotificationStatus }
                : n
            ),
            unreadCount: 0
          }))
        } catch (err) {}
      },

      getUnreadCount: () => {
        return get().notifications.filter(n => n.status === 'unread').length
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications
      }),
    }
  )
)
