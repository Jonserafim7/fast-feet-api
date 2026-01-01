import { Injectable } from '@nestjs/common';
import { User, Role } from '../../generated/prisma/client.js';
import { UserAlreadyExistsError } from '../errors/user-already-exists-errors.js';
import { Either, left, right } from '../errors/either.js';
import { UsersRepository } from '../repositories/users-repository.js';
import { HashGenerator } from '../cryptography/hash-generator.js';

interface CreateUserUseCaseRequest {
  name: string;
  cpf: string;
  password: string;
  role: Role;
}

type CreateUserUseCaseResponse = Either<
  UserAlreadyExistsError,
  {
    user: User;
  }
>;

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    cpf,
    password,
    role,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userWithSameCpf = await this.usersRepository.findByCpf(cpf);

    if (userWithSameCpf) {
      return left(new UserAlreadyExistsError(cpf));
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const user = await this.usersRepository.create({
      name,
      cpf,
      password: hashedPassword,
      role,
    });

    return right({ user });
  }
}
