import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { SendNotificationUseCase } from './send-notification-use-case.js'
import { Either, left, right } from '@/core/errors/either.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/core/errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '@/core/errors/not-order-courier-error.js'

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

    await this.sendNotification.execute({
      recipientId: order.recipientId,
      title: 'Sua encomenda foi devolvida',
      content: `Sua encomenda com ID ${order.id} foi devolvida ao centro de distribuição.`,
    })

    return right(null)
  }
}
