import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = process.env.ADMIN_DEV_SEED_PASSWORD
  if (!password) {
    throw new Error(
      'ADMIN_DEV_SEED_PASSWORD environment variable is required for seeding'
    )
  }
  const cpf = process.env.ADMIN_DEV_SEED_CPF
  if (!cpf) {
    throw new Error(
      'ADMIN_DEV_SEED_CPF environment variable is required for seeding'
    )
  }

  const passwordHash = await hash(password, 8)

  await prisma.user.upsert({
    where: { cpf },
    update: { passwordHash },
    create: {
      name: 'Admin',
      cpf,
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log('Seed completed: admin user created/updated')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
