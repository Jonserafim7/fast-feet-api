import { Injectable } from '@nestjs/common'
import { Notification } from '@/generated/prisma/client.js'

export interface CreateNotificationData {
  recipientId: string
  title: string
  content: string
}

@Injectable()
export abstract class NotificationsRepository {
  abstract create(data: CreateNotificationData): Promise<Notification>
}
