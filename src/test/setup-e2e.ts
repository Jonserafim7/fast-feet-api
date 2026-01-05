import { config } from 'dotenv'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client.js'

config({ path: '.env', override: true, quiet: true })
config({ path: '.env.test', override: true, quiet: true })

const schemaId = randomUUID()
let prisma: PrismaClient

function getDatabaseUrlWithSchema(databaseUrl: string, schema: string) {
  const url = new URL(databaseUrl)
  url.searchParams.set('schema', schema)
  return url.toString()
}

async function truncateAllTables() {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = ${schemaId}
    AND tablename != '_prisma_migrations'
  `

  if (tables.length === 0) return

  const tableNames = tables
    .map((t) => `"${schemaId}"."${t.tablename}"`)
    .join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE`)
}

beforeAll(async () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined')
  }

  const databaseUrlWithSchema = getDatabaseUrlWithSchema(databaseUrl, schemaId)

  console.log(`\n[E2E Setup] Schema: ${schemaId}\n`)

  process.env.DATABASE_URL = databaseUrlWithSchema

  execSync('npx prisma migrate deploy')

  const adapter = new PrismaPg(
    { connectionString: process.env.DATABASE_URL },
    { schema: schemaId }
  )

  prisma = new PrismaClient({ adapter })

  await prisma.$connect()
})

afterEach(async () => {
  await truncateAllTables()
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
