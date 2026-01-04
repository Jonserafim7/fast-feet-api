import { Injectable } from '@nestjs/common';
import { Prisma, User, Role } from '@/generated/prisma/client.js';

@Injectable()
export abstract class UsersRepository {
  abstract create(data: Prisma.UserUncheckedCreateInput): Promise<void>;
  abstract findByCpf(cpf: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findManyByRole(params: {
    role: Role;
    page: number;
    perPage: number;
  }): Promise<User[]>;
  abstract save(user: User): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
