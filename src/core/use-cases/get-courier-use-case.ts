import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/errors/either.js';
import { UsersRepository } from '@/core/repositories/users-repository.js';
import { Role, User } from '@/generated/prisma/client.js';
import { UserNotFoundError } from '@/core/errors/user-not-found-errors.js';

interface GetCourierUseCaseRequest {
  courierId: string;
}

type GetCourierUseCaseResponse = Either<UserNotFoundError, { courier: User }>;

@Injectable()
export class GetCourierUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    courierId,
  }: GetCourierUseCaseRequest): Promise<GetCourierUseCaseResponse> {
    const courier = await this.usersRepository.findById(courierId);

    if (!courier || courier.role !== Role.COURIER) {
      return left(new UserNotFoundError(courierId));
    }

    return right({ courier });
  }
}
