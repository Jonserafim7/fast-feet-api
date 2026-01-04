import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js';
import { FakeHashGenerator } from '@/test/cryptography/fake-hash-generator.js';
import { UpdateUserPasswordUseCase } from './update-user-password-use-case.js';
import { Role } from '@/generated/prisma/client.js';
import { UserNotFoundError } from '../errors/user-not-found-errors.js';

describe('update user password use case', () => {
  let usersRepository: InMemoryUsersRepository;
  let hashGenerator: FakeHashGenerator;
  let sut: UpdateUserPasswordUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    hashGenerator = new FakeHashGenerator();
    sut = new UpdateUserPasswordUseCase(usersRepository, hashGenerator);
  });

  it('should update password hash when user exists', async () => {
    await usersRepository.create({
      name: 'Courier User',
      cpf: '12345678909',
      passwordHash: 'old-hash',
      role: Role.COURIER,
    });

    const userId = usersRepository.items[0].id;

    const result = await sut.execute({
      userId,
      password: 'new-password',
    });

    expect(result.isRight()).toBe(true);
    expect(usersRepository.items[0].passwordHash).toBe('new-password-hashed');
  });

  it('should return not found when user does not exist', async () => {
    const result = await sut.execute({
      userId: 'missing-user',
      password: 'new-password',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });
});
