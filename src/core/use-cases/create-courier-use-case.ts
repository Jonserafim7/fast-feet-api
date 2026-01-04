import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@/core/repositories/users-repository.js';
import { HashGenerator } from '@/core/cryptography/hash-generator.js';
import { Either, left, right } from '@/core/errors/either.js';
import { UserAlreadyExistsError } from '@/core/errors/user-already-exists-errors.js';
import { Role } from '@/generated/prisma/client.js';

interface CreateCourierUseCaseRequest {
  name: string;
  cpf: string;
  password: string;
}

type CreateCourierUseCaseResponse = Either<UserAlreadyExistsError, null>;

@Injectable()
export class CreateCourierUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    cpf,
    password,
  }: CreateCourierUseCaseRequest): Promise<CreateCourierUseCaseResponse> {
    const userWithSameCpf = await this.usersRepository.findByCpf(cpf);

    if (userWithSameCpf) {
      return left(new UserAlreadyExistsError(cpf));
    }

    const passwordHash = await this.hashGenerator.hash(password);

    await this.usersRepository.create({
      name,
      cpf,
      passwordHash,
      role: Role.COURIER,
    });

    return right(null);
  }
}
