import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/errors/either.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { Recipient } from '@/generated/prisma/client.js'

interface GetRecipientUseCaseRequest {
  recipientId: string
}

type GetRecipientUseCaseResponse = Either<
  ResourceNotFoundError,
  { recipient: Recipient }
>

@Injectable()
export class GetRecipientUseCase {
  constructor(private readonly recipientsRepository: RecipientsRepository) {}

  async execute({
    recipientId,
  }: GetRecipientUseCaseRequest): Promise<GetRecipientUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError(recipientId))
    }

    return right({ recipient })
  }
}
