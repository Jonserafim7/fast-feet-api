import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@/generated/prisma/client.js';

@Injectable()
export abstract class UsersRepository {
  abstract create(data: Prisma.UserUncheckedCreateInput): Promise<void>;
  abstract findByCpf(cpf: string): Promise<User | null>;
}
