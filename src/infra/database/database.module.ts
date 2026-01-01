import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import { EnvModule } from '../env/env.module.js';
import { UsersRepository } from '../../core/repositories/users-repository.js';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository.js';

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [PrismaService, UsersRepository],
})
export class DatabaseModule {}
