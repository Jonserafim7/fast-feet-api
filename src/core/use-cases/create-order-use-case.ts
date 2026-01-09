import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { NotificationsRepository } from '@/core/repositories/notifications-repository.js'
import { NotificationSender } from '@/core/notifications/notification-sender.js'
import { buildOrderStatusNotification } from '@/core/notifications/order-status-notification.js'
import { Either, left, right } from '@/core/errors/either.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { NotificationSendError } from '@/core/errors/notification-send-error.js'
import { randomUUID } from 'node:crypto'

interface CreateOrderUseCaseRequest {
  recipientId: string
  latitude: number
  longitude: number
  street: string
  number: string
  city: string
  state: string
  zip: string
  country: string
  complement?: string
}

type CreateOrderUseCaseResponse = Either<
  ResourceNotFoundError | NotificationSendError,
  null
>

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly recipientsRepository: RecipientsRepository,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationSender: NotificationSender
  ) {}

  async execute({
    recipientId,
    latitude,
    longitude,
    street,
    number,
    city,
    state,
    zip,
    country,
    complement,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError(recipientId))
    }

    const orderId = randomUUID()

    await this.ordersRepository.create({
      id: orderId,
      status: 'PENDING',
      recipientId,
      latitude,
      longitude,
      street,
      number,
      city,
      state,
      zip,
      country,
      complement,
    })

    const { title, content } = buildOrderStatusNotification(orderId, 'PENDING')

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
