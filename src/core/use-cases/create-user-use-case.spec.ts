import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js';
import { FakeHasher } from '@/test/cryptography/fake-hasher.js';
import { CreateUserUseCase } from './create-user-use-case.js';

describe('create user use case', () => {
  let usersRepository: InMemoryUsersRepository;
  let hashGenerator: FakeHasher;
  let sut: CreateUserUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    hashGenerator = new FakeHasher();
    sut = new CreateUserUseCase(usersRepository, hashGenerator);
  });
  it('should be able to create a new user', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      cpf: '12345678900',
      password: '123456',
      role: 'COURIER',
    });

    expect(result.isRight()).toBe(true);
  });
});
