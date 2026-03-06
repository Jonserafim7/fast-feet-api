import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { Either, left, right } from '@/domain/errors/either.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import type { OrderWithRecipient } from '@/domain/entities/order.js'

interface GetOrderUseCaseRequest {
  orderId: string
}

type GetOrderUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: OrderWithRecipient
  }
>

@Injectable()
export class GetOrderUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
  }: GetOrderUseCaseRequest): Promise<GetOrderUseCaseResponse> {
    const order = await this.ordersRepository.findByIdWithRecipient(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    return right({ order })
  }
}
