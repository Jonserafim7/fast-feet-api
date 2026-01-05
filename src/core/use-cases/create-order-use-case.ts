import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { Either, left, right } from '@/core/errors/either.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'

interface CreateOrderUseCaseRequest {
  recipientId: string
  latitude: number
  longitude: number
  street: string
  number: string
  city: string
  state: string
  zip: string
  country: string
  complement?: string
}

type CreateOrderUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly recipientsRepository: RecipientsRepository
  ) {}

  async execute({
    recipientId,
    latitude,
    longitude,
    street,
    number,
    city,
    state,
    zip,
    country,
    complement,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError(recipientId))
    }

    await this.ordersRepository.create({
      status: 'WAITING',
      recipientId,
      latitude,
      longitude,
      street,
      number,
      city,
      state,
      zip,
      country,
      complement,
    })

    return right(null)
  }
}
