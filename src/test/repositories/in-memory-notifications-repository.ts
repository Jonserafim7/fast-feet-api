import {
  NotificationsRepository,
  CreateNotificationData,
} from '@/core/repositories/notifications-repository.js'
import { Notification } from '@/generated/prisma/client.js'
import { randomUUID } from 'node:crypto'

export class InMemoryNotificationsRepository
  implements NotificationsRepository
{
  public items: Notification[] = []

  async create(data: CreateNotificationData) {
    const notification: Notification = {
      id: randomUUID(),
      recipientId: data.recipientId,
      title: data.title,
      content: data.content,
      readAt: null,
      createdAt: new Date(),
    }

    this.items.push(notification)
  }

  async findById(id: string) {
    const notification = this.items.find((item) => item.id === id)

    if (!notification) {
      return null
    }

    return notification
  }

  async save(notification: Notification) {
    const itemIndex = this.items.findIndex((item) => item.id === notification.id)

    this.items[itemIndex] = notification
  }
}
