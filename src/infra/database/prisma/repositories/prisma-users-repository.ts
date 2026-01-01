import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../../core/repositories/users-repository.js';
import { PrismaService } from '../prisma.service.js';
import { Prisma } from '../../../../generated/prisma/client.js';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserUncheckedCreateInput) {
    const user = await this.prisma.user.create({ data });
    return user;
  }

  async findByCpf(cpf: string) {
    const user = await this.prisma.user.findUnique({ where: { cpf } });
    return user;
  }
}
