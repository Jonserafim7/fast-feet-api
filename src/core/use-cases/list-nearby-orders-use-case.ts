import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { Either, right } from '@/core/errors/either.js'
import { Order } from '@/generated/prisma/client.js'

interface ListNearbyOrdersUseCaseRequest {
  courierLatitude: number
  courierLongitude: number
}

type ListNearbyOrdersUseCaseResponse = Either<
  null,
  {
    orders: Order[]
  }
>

@Injectable()
export class ListNearbyOrdersUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({
    courierLatitude,
    courierLongitude,
  }: ListNearbyOrdersUseCaseRequest): Promise<ListNearbyOrdersUseCaseResponse> {
    const orders = await this.ordersRepository.findManyNearby({
      latitude: courierLatitude,
      longitude: courierLongitude,
    })

    return right({ orders })
  }
}
