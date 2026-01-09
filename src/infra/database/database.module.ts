import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { EnvModule } from '@/infra/env/env.module.js'
import { UsersRepository } from '@/core/repositories/users-repository.js'
import { PrismaUsersRepository } from '@/infra/database/prisma/repositories/prisma-users-repository.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { PrismaRecipientsRepository } from '@/infra/database/prisma/repositories/prisma-recipients-repository.js'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { PrismaOrdersRepository } from '@/infra/database/prisma/repositories/prisma-orders-repository.js'
import { AttachmentsRepository } from '@/core/repositories/attachments-repository.js'
import { PrismaAttachmentsRepository } from '@/infra/database/prisma/repositories/prisma-attachments-repository.js'
import { NotificationsRepository } from '@/core/repositories/notifications-repository.js'
import { PrismaNotificationsRepository } from '@/infra/database/prisma/repositories/prisma-notifications-repository.js'

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
    {
      provide: OrdersRepository,
      useClass: PrismaOrdersRepository,
    },
    {
      provide: AttachmentsRepository,
      useClass: PrismaAttachmentsRepository,
    },
    {
      provide: NotificationsRepository,
      useClass: PrismaNotificationsRepository,
    },
  ],
  exports: [
    PrismaService,
    UsersRepository,
    RecipientsRepository,
    OrdersRepository,
    AttachmentsRepository,
    NotificationsRepository,
  ],
})
export class DatabaseModule {}
