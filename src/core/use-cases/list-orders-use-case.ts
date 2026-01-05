import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { Either, right } from '@/core/errors/either.js'
import { Order } from '@/generated/prisma/client.js'

interface ListOrdersUseCaseRequest {
  page: number
  perPage: number
}

type ListOrdersUseCaseResponse = Either<
  null,
  {
    orders: Order[]
  }
>

@Injectable()
export class ListOrdersUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    page,
    perPage,
  }: ListOrdersUseCaseRequest): Promise<ListOrdersUseCaseResponse> {
    const orders = await this.ordersRepository.findMany({ page, perPage })

    return right({ orders })
  }
}
