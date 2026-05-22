import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { Either, right } from '@/domain/errors/either.js'
import type { Order } from '@/domain/entities/order.js'
import type { OrderStatus } from '@/domain/entities/order-status.js'

interface ListOrdersUseCaseRequest {
  page: number
  perPage: number
  status?: OrderStatus
}

type ListOrdersUseCaseResponse = Either<
  null,
  {
    orders: Order[]
    total: number
  }
>

@Injectable()
export class ListOrdersUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    page,
    perPage,
    status,
  }: ListOrdersUseCaseRequest): Promise<ListOrdersUseCaseResponse> {
    const { orders, total } = await this.ordersRepository.findMany({
      page,
      perPage,
      status,
    })

    return right({ orders, total })
  }
}
