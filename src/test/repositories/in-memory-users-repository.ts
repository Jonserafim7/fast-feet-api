import { UsersRepository } from '@/core/repositories/users-repository.js';
import { User, Prisma, Role } from '@/generated/prisma/client.js';
import { randomUUID } from 'node:crypto';

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async create(data: Prisma.UserUncheckedCreateInput): Promise<void> {
    const user: User = {
      id: data.id ?? randomUUID(),
      name: data.name,
      cpf: data.cpf,
      passwordHash: data.passwordHash,
      role: data.role ?? Role.COURIER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(user);

    return Promise.resolve();
  }

  findByCpf(cpf: string): Promise<User | null> {
    const user = this.items.find((item) => item.cpf === cpf);

    if (!user) {
      return Promise.resolve(null);
    }

    return Promise.resolve(user);
  }
}
