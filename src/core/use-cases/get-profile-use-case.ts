import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/errors/either.js'
import { UsersRepository } from '@/core/repositories/users-repository.js'
import { User } from '@/generated/prisma/client.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'

interface GetProfileUseCaseRequest {
  userId: string
}

type GetProfileUseCaseResponse = Either<ResourceNotFoundError, { user: User }>

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: GetProfileUseCaseRequest): Promise<GetProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError(userId))
    }

    return right({ user })
  }
}
