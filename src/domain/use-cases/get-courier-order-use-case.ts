import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { NotOrderCourierError } from '@/domain/errors/not-order-courier-error.js'
import type { Order } from '@/domain/entities/order.js'

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
