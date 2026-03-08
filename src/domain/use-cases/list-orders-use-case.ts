import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import { Either, right } from '@/domain/errors/either.js'
import type { Order } from '@/domain/entities/order.js'

interface ListOrdersUseCaseRequest {
  page: number
  perPage: number
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
  }: ListOrdersUseCaseRequest): Promise<ListOrdersUseCaseResponse> {
    const { orders, total } = await this.ordersRepository.findMany({
      page,
      perPage,
    })

    return right({ orders, total })
  }
}
