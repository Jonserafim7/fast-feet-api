import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { AppModule } from '@/infra/app.module.js'
import { JwtService } from '@nestjs/jwt'

describe('List Recipients (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
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

  test('[GET] /recipients', async () => {
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        cpf: '59130468722',
        passwordHash: 'admin-hash',
        role: 'ADMIN',
      },
    })

    const accessToken = await jwt.signAsync({
      sub: adminUser.id,
      role: adminUser.role,
    })

    await prisma.recipient.createMany({
      data: [
        {
          name: 'Recipient One',
          email: 'recipient.list.one@example.com',
          phone: '11999999999',
        },
        {
          name: 'Recipient Two',
          email: 'recipient.list.two@example.com',
          phone: '11888888888',
        },
        {
          name: 'Recipient Three',
          email: 'recipient.list.three@example.com',
          phone: '11777777777',
        },
      ],
    })

    const response = await request(app.getHttpServer())
      .get('/recipients?page=1&perPage=2')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.recipients).toHaveLength(2)
  })
})
