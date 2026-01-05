import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/errors/either.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { UsersRepository } from '@/core/repositories/users-repository.js'
import { HashGenerator } from '@/core/cryptography/hash-generator.js'

interface UpdateUserPasswordUseCaseRequest {
  userId: string
  password: string
}

type UpdateUserPasswordUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class UpdateUserPasswordUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashGenerator: HashGenerator
  ) {}

  async execute({
    userId,
    password,
  }: UpdateUserPasswordUseCaseRequest): Promise<UpdateUserPasswordUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError(userId))
    }

    const passwordHash = await this.hashGenerator.hash(password)

    await this.usersRepository.save({
      ...user,
      passwordHash,
    })

    return right(null)
  }
}
