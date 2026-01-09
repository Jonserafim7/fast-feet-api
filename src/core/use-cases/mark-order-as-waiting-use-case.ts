import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { NotificationsRepository } from '@/core/repositories/notifications-repository.js'
import { NotificationSender } from '@/core/notifications/notification-sender.js'
import { buildOrderStatusNotification } from '@/core/notifications/order-status-notification.js'
import { Either, left, right } from '@/core/errors/either.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/core/errors/invalid-order-status-error.js'
import { NotificationSendError } from '@/core/errors/notification-send-error.js'

interface MarkOrderAsWaitingUseCaseRequest {
  orderId: string
}

type MarkOrderAsWaitingUseCaseResponse = Either<
  ResourceNotFoundError | InvalidOrderStatusError | NotificationSendError,
  null
>

@Injectable()
export class MarkOrderAsWaitingUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly recipientsRepository: RecipientsRepository,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationSender: NotificationSender
  ) {}

  async execute({
    orderId,
  }: MarkOrderAsWaitingUseCaseRequest): Promise<MarkOrderAsWaitingUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    if (order.status !== 'PENDING') {
      return left(new InvalidOrderStatusError(order.status, 'PENDING'))
    }

    const recipient = await this.recipientsRepository.findById(order.recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError(order.recipientId))
    }

    await this.ordersRepository.updateStatus(orderId, 'WAITING')

    const { title, content } = buildOrderStatusNotification(orderId, 'WAITING')

    try {
      await this.notificationSender.send({
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        subject: title,
        content,
      })

      await this.notificationsRepository.create({
        recipientId: recipient.id,
        title,
        content,
      })
    } catch {
      return left(new NotificationSendError())
    }

    return right(null)
  }
}
