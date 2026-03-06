import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { RecipientsRepository } from '@/domain/repositories/recipients-repository.js'
import { SendNotificationUseCase } from '@/domain/use-cases/send-notification-use-case.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/domain/errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '@/domain/errors/not-order-courier-error.js'

interface ReturnOrderUseCaseRequest {
  orderId: string
  courierId: string
}

type ReturnOrderUseCaseResponse = Either<
  ResourceNotFoundError | InvalidOrderStatusError | NotOrderCourierError,
  null
>

@Injectable()
export class ReturnOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly recipientsRepository: RecipientsRepository,
    private readonly sendNotification: SendNotificationUseCase
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

    // 4. Update order status to RETURNED
    await this.ordersRepository.return(orderId, new Date())

    this.recipientsRepository
      .findById(order.recipientId)
      .then((recipient) => {
        if (recipient) {
          return this.sendNotification.execute({
            recipientId: recipient.id,
            recipientEmail: recipient.email,
            title: 'Pedido devolvido',
            content:
              'Infelizmente seu pedido foi devolvido. Entre em contato para mais informações.',
          })
        }
      })
      .catch((error) => {
        console.error('Failed to send notification for order', orderId, error)
      })

    return right(null)
  }
}
