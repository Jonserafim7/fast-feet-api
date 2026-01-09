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
    const nodeEnv = envService.get('NODE_ENV')

    // Schema is already validated by env schema (UUIDs or valid PostgreSQL identifiers)
    const schema = envService.get('DATABASE_SCHEMA')

    const adapter = new PrismaPg(
      { connectionString: databaseUrl },
      schema ? { schema } : undefined
    )

    super({
      adapter,
      log:
        nodeEnv === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
