import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { SendNotificationUseCase } from './send-notification-use-case.js'
import { Either, left, right } from '@/core/errors/either.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/core/errors/invalid-order-status-error.js'

interface MarkOrderAsWaitingUseCaseRequest {
  orderId: string
}

type MarkOrderAsWaitingUseCaseResponse = Either<
  ResourceNotFoundError | InvalidOrderStatusError,
  null
>

@Injectable()
export class MarkOrderAsWaitingUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly sendNotification: SendNotificationUseCase
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

    await this.ordersRepository.updateStatus(orderId, 'WAITING')

    await this.sendNotification.execute({
      recipientId: order.recipientId,
      title: 'Encomenda disponível para retirada',
      content: `Sua encomenda com ID ${order.id} agora está disponível para retirada.`,
    })

    return right(null)
  }
}
