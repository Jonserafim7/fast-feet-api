import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { NotificationsRepository } from '@/core/repositories/notifications-repository.js'
import { NotificationSender } from '@/core/notifications/notification-sender.js'
import { buildOrderStatusNotification } from '@/core/notifications/order-status-notification.js'
import { Either, left, right } from '@/core/errors/either.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/core/errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '@/core/errors/not-order-courier-error.js'
import { NotificationSendError } from '@/core/errors/notification-send-error.js'

interface ReturnOrderUseCaseRequest {
  orderId: string
  courierId: string
}

type ReturnOrderUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidOrderStatusError
  | NotOrderCourierError
  | NotificationSendError,
  null
>

@Injectable()
export class ReturnOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly recipientsRepository: RecipientsRepository,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationSender: NotificationSender
  ) {}

  async execute({
    orderId,
    courierId,
  }: ReturnOrderUseCaseRequest): Promise<ReturnOrderUseCaseResponse> {
    // 1. Find the order
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    // 2. Validate order status is WITHDRAWN
    if (order.status !== 'WITHDRAWN') {
      return left(new InvalidOrderStatusError(order.status, 'WITHDRAWN'))
    }

    // 3. Validate courier ownership
    if (order.courierId !== courierId) {
      return left(new NotOrderCourierError())
    }

    const recipient = await this.recipientsRepository.findById(order.recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError(order.recipientId))
    }

    // 4. Update order status to RETURNED
    await this.ordersRepository.return(orderId, new Date())

    const { title, content } = buildOrderStatusNotification(orderId, 'RETURNED')

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
