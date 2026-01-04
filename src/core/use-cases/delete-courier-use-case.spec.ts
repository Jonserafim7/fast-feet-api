import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js';
import { DeleteCourierUseCase } from './delete-courier-use-case.js';
import { Role } from '@/generated/prisma/client.js';
import { UserNotFoundError } from '../errors/user-not-found-errors.js';

describe('delete courier use case', () => {
  let usersRepository: InMemoryUsersRepository;
  let sut: DeleteCourierUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new DeleteCourierUseCase(usersRepository);
  });

  it('should delete a courier when it exists', async () => {
    await usersRepository.create({
      name: 'Courier User',
      cpf: '12345678909',
      passwordHash: 'hash',
      role: Role.COURIER,
    });

    const courierId = usersRepository.items[0].id;

    const result = await sut.execute({ courierId });

    expect(result.isRight()).toBe(true);
    expect(usersRepository.items).toHaveLength(0);
  });

  it('should return not found when user is not a courier', async () => {
    await usersRepository.create({
      name: 'Admin User',
      cpf: '11122233396',
      passwordHash: 'hash',
      role: Role.ADMIN,
    });

    const adminId = usersRepository.items[0].id;

    const result = await sut.execute({ courierId: adminId });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });
});
