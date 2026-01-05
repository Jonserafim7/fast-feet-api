import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/errors/either.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { RecipientAlreadyExistsError } from '@/core/errors/recipient-already-exists-errors.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'

interface UpdateRecipientUseCaseRequest {
  recipientId: string
  name?: string
  email?: string
  phone?: string
}

type UpdateRecipientUseCaseResponse = Either<
  RecipientAlreadyExistsError | ResourceNotFoundError,
  null
>

@Injectable()
export class UpdateRecipientUseCase {
  constructor(private readonly recipientsRepository: RecipientsRepository) {}

  async execute({
    recipientId,
    name,
    email,
    phone,
  }: UpdateRecipientUseCaseRequest): Promise<UpdateRecipientUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError(recipientId))
    }

    if (email && email !== recipient.email) {
      const recipientWithSameEmail =
        await this.recipientsRepository.findByEmail(email)

      if (recipientWithSameEmail && recipientWithSameEmail.id !== recipient.id) {
        return left(new RecipientAlreadyExistsError(email))
      }
    }

    const updatedRecipient = {
      ...recipient,
      name: name ?? recipient.name,
      email: email ?? recipient.email,
      phone: phone ?? recipient.phone,
    }

    await this.recipientsRepository.save(updatedRecipient)

    return right(null)
  }
}
