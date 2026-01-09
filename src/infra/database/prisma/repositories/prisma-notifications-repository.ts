import { Injectable } from '@nestjs/common'
import {
  NotificationsRepository,
  CreateNotificationData,
} from '@/core/repositories/notifications-repository.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'

@Injectable()
export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationData) {
    return this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        title: data.title,
        content: data.content,
      },
    })
  }
}
