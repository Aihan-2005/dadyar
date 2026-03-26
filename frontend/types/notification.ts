export type NotificationTarget = 'lawyer' | 'client'

export type NotificationType = 
  | 'reminder'        
  | 'client_reminder' 
  | 'case_update'     
  | 'deadline'      
  | 'system'          

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
  reminderDate?: string   
  createdAt: string       
  scheduledFor?: string  
  readAt?: string
  completed?: boolean  
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
  scheduledFor?: string  
}
