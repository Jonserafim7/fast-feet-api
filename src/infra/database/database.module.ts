import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { EnvModule } from '@/infra/env/env.module.js'
import { UsersRepository } from '@/core/repositories/users-repository.js'
import { PrismaUsersRepository } from '@/infra/database/prisma/repositories/prisma-users-repository.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { PrismaRecipientsRepository } from '@/infra/database/prisma/repositories/prisma-recipients-repository.js'

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: RecipientsRepository,
      useClass: PrismaRecipientsRepository,
    },
  ],
  exports: [PrismaService, UsersRepository, RecipientsRepository],
})
export class DatabaseModule {}
