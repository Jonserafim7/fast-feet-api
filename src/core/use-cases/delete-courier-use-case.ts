import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/errors/either.js';
import { UsersRepository } from '@/core/repositories/users-repository.js';
import { UserNotFoundError } from '@/core/errors/user-not-found-errors.js';
import { Role } from '@/generated/prisma/client.js';

interface DeleteCourierUseCaseRequest {
  courierId: string;
}

type DeleteCourierUseCaseResponse = Either<UserNotFoundError, null>;

@Injectable()
export class DeleteCourierUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    courierId,
  }: DeleteCourierUseCaseRequest): Promise<DeleteCourierUseCaseResponse> {
    const courier = await this.usersRepository.findById(courierId);

    if (!courier || courier.role !== Role.COURIER) {
      return left(new UserNotFoundError(courierId));
    }

    await this.usersRepository.delete(courierId);

    return right(null);
  }
}
