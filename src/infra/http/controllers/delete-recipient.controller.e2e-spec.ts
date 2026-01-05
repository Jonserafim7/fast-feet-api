import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'

describe('Delete Recipient (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const { AppModule } = await import('@/infra/app.module.js')

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[DELETE] /recipients/:id', async () => {
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        cpf: '20874531964',
        passwordHash: 'admin-hash',
        role: 'ADMIN',
      },
    })

    const recipient = await prisma.recipient.create({
      data: {
        name: 'Recipient One',
        email: 'recipient.delete@example.com',
      },
    })

    const accessToken = await jwt.signAsync({
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .delete(`/recipients/${recipient.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204)

    const recipientOnDatabase = await prisma.recipient.findUnique({
      where: {
        id: recipient.id,
      },
    })

    expect(recipientOnDatabase).toBeNull()
  })
})
