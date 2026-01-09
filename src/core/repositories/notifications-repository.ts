import { Injectable } from '@nestjs/common'
import { Notification } from '@/generated/prisma/client.js'

export interface CreateNotificationData {
  recipientId: string
  title: string
  content: string
}

@Injectable()
export abstract class NotificationsRepository {
  abstract create(data: CreateNotificationData): Promise<void>
  abstract findById(id: string): Promise<Notification | null>
  abstract save(notification: Notification): Promise<void>
}
