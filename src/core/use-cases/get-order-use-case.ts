import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { Either, left, right } from '@/core/errors/either.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { Order } from '@/generated/prisma/client.js'

interface GetOrderUseCaseRequest {
  orderId: string
}

type GetOrderUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: Order
  }
>

@Injectable()
export class GetOrderUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
  }: GetOrderUseCaseRequest): Promise<GetOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    return right({ order })
  }
}
