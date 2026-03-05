import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { Either, right } from '@/core/errors/either.js'
import { Order } from '@/generated/prisma/client.js'

interface ListAvailableOrdersUseCaseRequest {
  page: number
  perPage: number
  search?: string
}

type ListAvailableOrdersUseCaseResponse = Either<
  null,
  {
    orders: Order[]
  }
>

@Injectable()
export class ListAvailableOrdersUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    page,
    perPage,
    search,
  }: ListAvailableOrdersUseCaseRequest): Promise<ListAvailableOrdersUseCaseResponse> {
    const orders = await this.ordersRepository.findManyAvailable({
      page,
      perPage,
      search,
    })

    return right({ orders })
  }
}
