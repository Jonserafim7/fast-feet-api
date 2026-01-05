import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common'
import { PrismaClient } from '@/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { EnvService } from '@/infra/env/env.service.js'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private envService: EnvService) {
    const databaseUrl = envService.get('DATABASE_URL')

    const schema = new URL(databaseUrl).searchParams.get('schema') ?? undefined

    const adapter = new PrismaPg(
      { connectionString: databaseUrl },
      schema ? { schema } : undefined
    )

    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
