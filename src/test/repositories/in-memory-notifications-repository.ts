import {
  NotificationsRepository,
  CreateNotificationData,
} from '@/core/repositories/notifications-repository.js'
import { Notification } from '@/generated/prisma/client.js'
import { randomUUID } from 'node:crypto'

export class InMemoryNotificationsRepository implements NotificationsRepository {
  public items: Notification[] = []

  async create(data: CreateNotificationData): Promise<Notification> {
    const notification: Notification = {
      id: randomUUID(),
      recipientId: data.recipientId,
      title: data.title,
      content: data.content,
      readAt: null,
      createdAt: new Date(),
    }

    this.items.push(notification)

    return notification
  }
}
