import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common'
import { PrismaClient } from '@/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { EnvService } from '@/infra/env/env.service.js'
import { z } from 'zod'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly schema: string | undefined

  constructor(private envService: EnvService) {
    const databaseUrl = envService.get('DATABASE_URL')
    const nodeEnv = envService.get('NODE_ENV')

    const rawSchema = new URL(databaseUrl).searchParams.get('schema') ?? undefined

    // Security: Validate schema name to prevent SQL injection
    // We restrict to PostgreSQL unquoted identifier rules (plus UUIDs):
    // - UUIDs (E2E tests): 45dad699-2ac4-4f6e-8f52-14ccaac3d194 (hyphens allowed)
    // - Unquoted identifiers: public, tenant_abc, my_schema (must start with letter/underscore)
    // Rejects: quotes, semicolons, spaces, and other SQL injection characters
    const schemaSchema = z
      .union([
        z.uuid(), // UUIDs - allows hyphens
        z
          .string()
          .regex(
            /^[a-zA-Z_][a-zA-Z0-9_]*$/,
            'Must be valid PostgreSQL identifier'
          ), // Unquoted identifier rules - no hyphens
      ])
      .optional()
    const schema = schemaSchema.parse(rawSchema)

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

    this.schema = schema
  }

  getSchema(): string | undefined {
    // Schema is already validated as UUID format (or undefined) in constructor
    return this.schema
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
