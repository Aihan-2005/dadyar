import { create } from 'zustand'
import { 
  Notification, 
  CreateReminderPayload, 
  NotificationPriority,
  NotificationStatus 
} from '@/types/notification'

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number  
  addReminder: (data: CreateReminderPayload) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismiss: (id: string) => void              
  deleteNotification: (id: string) => void  
  filterByPriority: (priority: NotificationPriority | 'all') => Notification[]
  getUnreadCount: () => number
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0, 
  addReminder: (data: CreateReminderPayload) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: data.target === 'client' ? 'client_reminder' : 'reminder',
      priority: data.priority,
      status: 'unread',
      target: data.target,
      title: data.title,
      message: data.message,
      caseId: data.caseId,
      caseName: data.caseName,
      clientId: data.clientId,
      clientName: data.clientName,
      scheduledFor: data.scheduledFor,
      createdAt: new Date().toISOString(),
    }

    set((state) => {
      const newNotifications = [newNotification, ...state.notifications]
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => n.status === 'unread').length  
      }
    })
  },

  markAsRead: (id: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === id
          ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
          : n
      )
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => n.status === 'unread').length  
      }
    })
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        status: 'read' as NotificationStatus,
        readAt: n.readAt || new Date().toISOString(),
      })),
      unreadCount: 0  
    }))
  },

  dismiss: (id: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === id
          ? { ...n, status: 'dismissed' as NotificationStatus }
          : n
      )
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => n.status === 'unread').length 
      }
    })
  },

  deleteNotification: (id: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.filter((n) => n.id !== id)
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => n.status === 'unread').length 
      }
    })
  },

  filterByPriority: (priority: NotificationPriority | 'all') => {
    const { notifications } = get()
    if (priority === 'all') return notifications
    return notifications.filter((n) => n.priority === priority)
  },

  getUnreadCount: () => {
    const { notifications } = get()
    return notifications.filter((n) => n.status === 'unread').length
  },
}))
