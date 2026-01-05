import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/errors/either.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'

interface DeleteRecipientUseCaseRequest {
  recipientId: string
}

type DeleteRecipientUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class DeleteRecipientUseCase {
  constructor(private readonly recipientsRepository: RecipientsRepository) {}

  async execute({
    recipientId,
  }: DeleteRecipientUseCaseRequest): Promise<DeleteRecipientUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError(recipientId))
    }

    await this.recipientsRepository.delete(recipientId)

    return right(null)
  }
}
