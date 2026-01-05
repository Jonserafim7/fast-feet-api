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

beforeAll(async () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined')
  }

  const databaseUrlWithSchema = getDatabaseUrlWithSchema(databaseUrl, schemaId)

  console.log(`\n🔧 Database URL with Schema: ${databaseUrlWithSchema}\n`)

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
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "attachments", "notifications", "orders", "recipients", "users" CASCADE'
  )
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
