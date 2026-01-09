import { Injectable } from '@nestjs/common'
import {
  NotificationsRepository,
  CreateNotificationData,
} from '@/core/repositories/notifications-repository.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { Notification } from '@/generated/prisma/client.js'

@Injectable()
export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationData) {
    await this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        title: data.title,
        content: data.content,
      },
    })
  }

  async findById(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    })

    return notification
  }

  async save(notification: Notification) {
    await this.prisma.notification.update({
      where: { id: notification.id },
      data: notification,
    })
  }
}
