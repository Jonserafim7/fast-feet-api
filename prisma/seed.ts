import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import { randomUUID } from 'node:crypto'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ---------------------------------------------------------------------------
// CPF Generator — computes valid mod-11 check digits from a 9-digit base
// ---------------------------------------------------------------------------

function generateValidCpf(base9: string): string {
  const digits = base9.split('').map(Number)

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i)
  }
  let remainder = sum % 11
  digits.push(remainder < 2 ? 0 : 11 - remainder)

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i)
  }
  remainder = sum % 11
  digits.push(remainder < 2 ? 0 : 11 - remainder)

  return digits.join('')
}

// ---------------------------------------------------------------------------
// Database clearing
// ---------------------------------------------------------------------------

async function clearDatabase() {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename != '_prisma_migrations'
  `

  if (tables.length === 0) return

  const tableNames = tables.map((t) => `"public"."${t.tablename}"`).join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE`)
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

const ADDRESSES = [
  {
    street: 'Avenida Paulista',
    number: '1578',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zip: '01310200',
    latitude: -23.5632,
    longitude: -46.6542,
    country: 'Brasil',
  },
  {
    street: 'Rua Barata Ribeiro',
    number: '320',
    neighborhood: 'Copacabana',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zip: '22040002',
    latitude: -22.9661,
    longitude: -43.1784,
    country: 'Brasil',
  },
  {
    street: 'Rua Pernambuco',
    number: '1000',
    neighborhood: 'Savassi',
    city: 'Belo Horizonte',
    state: 'MG',
    zip: '30130150',
    latitude: -19.9352,
    longitude: -43.9378,
    country: 'Brasil',
  },
  {
    street: 'Rua XV de Novembro',
    number: '450',
    neighborhood: 'Centro',
    city: 'Curitiba',
    state: 'PR',
    zip: '80020310',
    latitude: -25.4296,
    longitude: -49.2713,
    country: 'Brasil',
  },
  {
    street: 'SQS 308 Bloco A',
    number: '12',
    neighborhood: 'Asa Sul',
    city: 'Brasília',
    state: 'DF',
    zip: '70356080',
    latitude: -15.8267,
    longitude: -47.9218,
    country: 'Brasil',
  },
  {
    street: 'Avenida Sete de Setembro',
    number: '890',
    neighborhood: 'Vitória',
    city: 'Salvador',
    state: 'BA',
    zip: '40080001',
    latitude: -12.9894,
    longitude: -38.5106,
    country: 'Brasil',
  },
  {
    street: 'Rua Padre Chagas',
    number: '200',
    neighborhood: 'Moinhos de Vento',
    city: 'Porto Alegre',
    state: 'RS',
    zip: '90570080',
    latitude: -30.0248,
    longitude: -51.2005,
    country: 'Brasil',
  },
  {
    street: 'Avenida Boa Viagem',
    number: '1500',
    neighborhood: 'Boa Viagem',
    city: 'Recife',
    state: 'PE',
    zip: '51011000',
    latitude: -8.1186,
    longitude: -34.8953,
    country: 'Brasil',
  },
  {
    street: 'Avenida Beira Mar',
    number: '3100',
    neighborhood: 'Meireles',
    city: 'Fortaleza',
    state: 'CE',
    zip: '60165121',
    latitude: -3.7253,
    longitude: -38.4897,
    country: 'Brasil',
  },
  {
    street: 'Rua Ramos Ferreira',
    number: '750',
    neighborhood: 'Centro',
    city: 'Manaus',
    state: 'AM',
    zip: '69010120',
    latitude: -3.1316,
    longitude: -60.0212,
    country: 'Brasil',
  },
]

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seedUsers(
  adminCpf: string,
  adminPasswordHash: string,
  defaultPasswordHash: string
) {
  const adminId = randomUUID()
  await prisma.user.upsert({
    where: { cpf: adminCpf },
    update: { passwordHash: adminPasswordHash },
    create: {
      id: adminId,
      name: 'Admin',
      cpf: adminCpf,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  })

  const admin2Id = randomUUID()
  const courier1Id = randomUUID()
  const courier2Id = randomUUID()
  const courier3Id = randomUUID()

  await prisma.user.createMany({
    data: [
      {
        id: admin2Id,
        name: 'Fernanda Oliveira',
        cpf: generateValidCpf('529982247'),
        passwordHash: defaultPasswordHash,
        role: 'ADMIN',
      },
      {
        id: courier1Id,
        name: 'Carlos Silva',
        cpf: generateValidCpf('327648591'),
        passwordHash: defaultPasswordHash,
        role: 'COURIER',
      },
      {
        id: courier2Id,
        name: 'Mariana Santos',
        cpf: generateValidCpf('861543279'),
        passwordHash: defaultPasswordHash,
        role: 'COURIER',
      },
      {
        id: courier3Id,
        name: 'Rafael Costa',
        cpf: generateValidCpf('194637528'),
        passwordHash: defaultPasswordHash,
        role: 'COURIER',
      },
    ],
  })

  return { courier1Id, courier2Id, courier3Id }
}

async function seedRecipients() {
  const ids = Array.from({ length: 5 }, () => randomUUID())

  await prisma.recipient.createMany({
    data: [
      {
        id: ids[0],
        name: 'Ana Beatriz Souza',
        email: 'ana.souza@email.com',
        phone: '11987654321',
      },
      {
        id: ids[1],
        name: 'Lucas Ferreira',
        email: 'lucas.ferreira@email.com',
        phone: '21976543210',
      },
      {
        id: ids[2],
        name: 'Camila Rodrigues',
        email: 'camila.rodrigues@email.com',
      },
      {
        id: ids[3],
        name: 'Pedro Almeida',
        email: 'pedro.almeida@email.com',
        phone: '41965432109',
      },
      {
        id: ids[4],
        name: 'Julia Mendes',
        email: 'julia.mendes@email.com',
      },
    ],
  })

  return ids
}

async function seedOrders(
  courierIds: { courier1Id: string; courier2Id: string; courier3Id: string },
  recipientIds: string[]
) {
  const orderIds = Array.from({ length: 10 }, () => randomUUID())
  const couriers = [
    courierIds.courier1Id,
    courierIds.courier2Id,
    courierIds.courier3Id,
  ]

  const orders = [
    // 2 PENDING — no courier, no dates
    {
      id: orderIds[0],
      title: 'Encomenda de livros',
      description: 'Caixa com 3 livros de programação',
      status: 'PENDING' as const,
      recipientId: recipientIds[0],
      ...ADDRESSES[0],
    },
    {
      id: orderIds[1],
      title: 'Equipamento eletrônico',
      status: 'PENDING' as const,
      recipientId: recipientIds[1],
      ...ADDRESSES[1],
    },

    // 2 WAITING — no courier, no dates
    {
      id: orderIds[2],
      title: 'Material de escritório',
      description: 'Cadernos, canetas e organizadores',
      status: 'WAITING' as const,
      recipientId: recipientIds[2],
      ...ADDRESSES[2],
    },
    {
      id: orderIds[3],
      title: 'Roupas e acessórios',
      status: 'WAITING' as const,
      recipientId: recipientIds[3],
      ...ADDRESSES[3],
    },

    // 2 WITHDRAWN — courier assigned, pickupDate
    {
      id: orderIds[4],
      title: 'Peças automotivas',
      description: 'Kit de pastilhas de freio',
      status: 'WITHDRAWN' as const,
      recipientId: recipientIds[4],
      courierId: couriers[0],
      pickupDate: daysAgo(5),
      ...ADDRESSES[4],
    },
    {
      id: orderIds[5],
      title: 'Instrumentos musicais',
      status: 'WITHDRAWN' as const,
      recipientId: recipientIds[0],
      courierId: couriers[1],
      pickupDate: daysAgo(4),
      ...ADDRESSES[5],
    },

    // 2 DELIVERED — courier + pickupDate + deliveryDate
    {
      id: orderIds[6],
      title: 'Móveis para escritório',
      description: 'Cadeira ergonômica desmontada',
      status: 'DELIVERED' as const,
      recipientId: recipientIds[1],
      courierId: couriers[2],
      pickupDate: daysAgo(7),
      deliveryDate: daysAgo(2),
      ...ADDRESSES[6],
    },
    {
      id: orderIds[7],
      title: 'Produtos de beleza',
      status: 'DELIVERED' as const,
      recipientId: recipientIds[2],
      courierId: couriers[0],
      pickupDate: daysAgo(6),
      deliveryDate: daysAgo(1),
      ...ADDRESSES[7],
    },

    // 2 RETURNED — courier + pickupDate + returnDate
    {
      id: orderIds[8],
      title: 'Eletrodoméstico',
      description: 'Destinatário não encontrado no endereço',
      status: 'RETURNED' as const,
      recipientId: recipientIds[3],
      courierId: couriers[1],
      pickupDate: daysAgo(6),
      returnDate: daysAgo(1),
      ...ADDRESSES[8],
    },
    {
      id: orderIds[9],
      title: 'Documentos importantes',
      status: 'RETURNED' as const,
      recipientId: recipientIds[4],
      courierId: couriers[2],
      pickupDate: daysAgo(5),
      returnDate: daysAgo(2),
      ...ADDRESSES[9],
    },
  ]

  await prisma.order.createMany({ data: orders })

  return orderIds
}

async function seedAttachments(deliveredOrderIds: string[]) {
  await prisma.attachment.createMany({
    data: deliveredOrderIds.map((orderId) => ({
      id: randomUUID(),
      title: 'comprovante-entrega.jpg',
      url: `attachments/${randomUUID()}-comprovante-entrega.jpg`,
      orderId,
    })),
  })
}

async function seedNotifications(recipientIds: string[]) {
  await prisma.notification.createMany({
    data: [
      {
        id: randomUUID(),
        recipientId: recipientIds[2],
        title: 'Encomenda aguardando retirada',
        content:
          'Sua encomenda "Material de escritório" está aguardando retirada pelo entregador.',
        status: 'SENT',
        readAt: daysAgo(3),
      },
      {
        id: randomUUID(),
        recipientId: recipientIds[3],
        title: 'Encomenda aguardando retirada',
        content:
          'Sua encomenda "Roupas e acessórios" está aguardando retirada pelo entregador.',
        status: 'SENT',
      },
      {
        id: randomUUID(),
        recipientId: recipientIds[4],
        title: 'Encomenda retirada',
        content:
          'Sua encomenda "Peças automotivas" foi retirada pelo entregador e está a caminho.',
        status: 'SENT',
        readAt: daysAgo(4),
      },
      {
        id: randomUUID(),
        recipientId: recipientIds[1],
        title: 'Encomenda entregue',
        content:
          'Sua encomenda "Móveis para escritório" foi entregue com sucesso.',
        status: 'SENT',
        readAt: daysAgo(1),
      },
      {
        id: randomUUID(),
        recipientId: recipientIds[2],
        title: 'Encomenda entregue',
        content: 'Sua encomenda "Produtos de beleza" foi entregue com sucesso.',
        status: 'FAILED',
      },
      {
        id: randomUUID(),
        recipientId: recipientIds[3],
        title: 'Encomenda devolvida',
        content:
          'Sua encomenda "Eletrodoméstico" foi devolvida. Motivo: destinatário não encontrado.',
        status: 'SENT',
      },
    ],
  })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeding is not allowed in production')
  }

  const adminPassword = process.env.ADMIN_DEV_SEED_PASSWORD
  if (!adminPassword) {
    throw new Error(
      'ADMIN_DEV_SEED_PASSWORD environment variable is required for seeding'
    )
  }
  const adminCpf = process.env.ADMIN_DEV_SEED_CPF
  if (!adminCpf) {
    throw new Error(
      'ADMIN_DEV_SEED_CPF environment variable is required for seeding'
    )
  }

  const adminPasswordHash = await hash(adminPassword, 8)
  const defaultPasswordHash = await hash('123456', 8)

  console.log('Clearing database...')
  await clearDatabase()

  console.log('Seeding users...')
  const courierIds = await seedUsers(
    adminCpf,
    adminPasswordHash,
    defaultPasswordHash
  )

  console.log('Seeding recipients...')
  const recipientIds = await seedRecipients()

  console.log('Seeding orders...')
  const orderIds = await seedOrders(courierIds, recipientIds)

  console.log('Seeding attachments...')
  const deliveredOrderIds = [orderIds[6], orderIds[7]]
  await seedAttachments(deliveredOrderIds)

  console.log('Seeding notifications...')
  await seedNotifications(recipientIds)

  console.log('Seed completed successfully!')
  console.log('  - 5 users (2 admins, 3 couriers)')
  console.log('  - 5 recipients')
  console.log('  - 10 orders (2 per status)')
  console.log('  - 2 attachments')
  console.log('  - 6 notifications')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
