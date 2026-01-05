import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/errors/either.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { Recipient } from '@/generated/prisma/client.js'

interface ListRecipientsUseCaseRequest {
  page: number
  perPage: number
}

type ListRecipientsUseCaseResponse = Either<null, { recipients: Recipient[] }>

@Injectable()
export class ListRecipientsUseCase {
  constructor(private readonly recipientsRepository: RecipientsRepository) {}

  async execute({
    page,
    perPage,
  }: ListRecipientsUseCaseRequest): Promise<ListRecipientsUseCaseResponse> {
    const recipients = await this.recipientsRepository.findMany({
      page,
      perPage,
    })

    return right({ recipients })
  }
}
