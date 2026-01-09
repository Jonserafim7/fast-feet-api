export type NotificationStatus = 'SENT' | 'FAILED'

export interface CreateNotificationData {
  recipientId: string
  title: string
  content: string
  status: NotificationStatus
}

export interface Notification {
  id: string
  recipientId: string
  title: string
  content: string
  status: NotificationStatus
  readAt: Date | null
  createdAt: Date
}

export abstract class NotificationsRepository {
  abstract create(data: CreateNotificationData): Promise<void>
  abstract findManyByRecipientId(recipientId: string): Promise<Notification[]>
  abstract markAsRead(id: string): Promise<void>
}
