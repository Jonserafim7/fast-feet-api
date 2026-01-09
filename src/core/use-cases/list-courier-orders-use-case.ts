import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { Either, right } from '@/core/errors/either.js'
import { Order } from '@/generated/prisma/client.js'

interface ListCourierOrdersUseCaseRequest {
  courierId: string
  page: number
  perPage: number
}

type ListCourierOrdersUseCaseResponse = Either<
  null,
  {
    orders: Order[]
  }
>

@Injectable()
export class ListCourierOrdersUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    courierId,
    page,
    perPage,
  }: ListCourierOrdersUseCaseRequest): Promise<ListCourierOrdersUseCaseResponse> {
    const orders = await this.ordersRepository.findManyByCourierId({
      courierId,
      page,
      perPage,
    })

    return right({ orders })
  }
}
