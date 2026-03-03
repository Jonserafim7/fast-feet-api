import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { Either, left, right } from '@/core/errors/either.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { NotOrderCourierError } from '@/core/errors/not-order-courier-error.js'
import { Order } from '@/generated/prisma/client.js'

interface GetCourierOrderUseCaseRequest {
  orderId: string
  courierId: string
}

type GetCourierOrderUseCaseResponse = Either<
  ResourceNotFoundError | NotOrderCourierError,
  {
    order: Order
  }
>

@Injectable()
export class GetCourierOrderUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
    courierId,
  }: GetCourierOrderUseCaseRequest): Promise<GetCourierOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    const isWaiting = order.status === 'WAITING'
    const isOwnOrder = order.courierId === courierId

    if (!isWaiting && !isOwnOrder) {
      return left(new NotOrderCourierError())
    }

    return right({ order })
  }
}
