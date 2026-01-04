import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/errors/either.js';
import { UsersRepository } from '@/core/repositories/users-repository.js';
import { UserAlreadyExistsError } from '@/core/errors/user-already-exists-errors.js';
import { UserNotFoundError } from '@/core/errors/user-not-found-errors.js';
import { Role } from '@/generated/prisma/client.js';

interface UpdateCourierUseCaseRequest {
  courierId: string;
  name?: string;
  cpf?: string;
}

type UpdateCourierUseCaseResponse = Either<
  UserAlreadyExistsError | UserNotFoundError,
  null
>;

@Injectable()
export class UpdateCourierUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    courierId,
    name,
    cpf,
  }: UpdateCourierUseCaseRequest): Promise<UpdateCourierUseCaseResponse> {
    const courier = await this.usersRepository.findById(courierId);

    if (!courier || courier.role !== Role.COURIER) {
      return left(new UserNotFoundError(courierId));
    }

    if (cpf && cpf !== courier.cpf) {
      const userWithSameCpf = await this.usersRepository.findByCpf(cpf);

      if (userWithSameCpf && userWithSameCpf.id !== courier.id) {
        return left(new UserAlreadyExistsError(cpf));
      }
    }

    const updatedCourier = {
      ...courier,
      name: name ?? courier.name,
      cpf: cpf ?? courier.cpf,
    };

    await this.usersRepository.save(updatedCourier);

    return right(null);
  }
}
