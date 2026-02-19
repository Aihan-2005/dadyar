export type NotificationTarget = 'lawyer' | 'client'
export type NotificationType = 
  | 'reminder'        // یادآوری وکیل برای خودش
  | 'client_reminder' // یادآوری وکیل برای موکل
  | 'case_update'     // بروزرسانی پرونده
  | 'deadline'        // مهلت قانونی
  | 'system'          // اعلان سیستمی

export type NotificationPriority = 'low' | 'medium' | 'high'

export type NotificationStatus = 'unread' | 'read' | 'dismissed'

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  target: NotificationTarget
  title: string
  message: string
  caseId?: string
  caseName?: string
  clientId?: string
  clientName?: string
  reminderDate?: string   // ISO string
  createdAt: string       // ISO string
  scheduledFor?: string   // برای یادآوری‌های زمان‌بندی‌شده
}

export interface CreateReminderPayload {
  title: string
  message: string
  priority: NotificationPriority
  target: NotificationTarget
  caseId?: string
  caseName?: string
  clientId?: string
  clientName?: string
  scheduledFor: string
}
