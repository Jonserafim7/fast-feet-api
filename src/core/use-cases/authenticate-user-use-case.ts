import { Injectable } from '@nestjs/common';
import { Either, left, right } from '../errors/either.js';
import { InvalidCredentialsError } from '../errors/invalid-credentials-errors.js';
import { UsersRepository } from '../repositories/users-repository.js';
import { HashComparer } from '../cryptography/hash-comparer.js';
import { Encrypter } from '../cryptography/encrypter.js';

interface AuthenticateUserUseCaseRequest {
  cpf: string;
  password: string;
}

type AuthenticateUserUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    accessToken: string;
  }
>;

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
  ) {}

  async execute({
    cpf,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    const user = await this.usersRepository.findByCpf(cpf);

    if (!user) {
      return left(new InvalidCredentialsError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return left(new InvalidCredentialsError());
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role,
    });

    return right({ accessToken });
  }
}
