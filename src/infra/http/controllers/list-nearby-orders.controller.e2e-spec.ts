import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import {
  makeCourier,
  makeAdmin,
  makeAccessToken,
  makeRecipient,
  makeOrder,
} from '@/test/factories/index.js'

describe('List Nearby Orders (E2E)', () => {
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

  test('[GET] /orders/nearby - should list nearby WAITING orders', async () => {
    const courier = await makeCourier(prisma, { cpf: '12345678901' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient@example.com',
    })

    // Create order within 20km (near Sao Paulo center)
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
      latitude: -23.5605,
      longitude: -46.6433,
    })

    // Create order outside 20km
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
      latitude: -23.9,
      longitude: -46.633308,
    })

    // Create nearby order but not WAITING
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'DELIVERED',
      latitude: -23.5605,
      longitude: -46.6433,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier.id,
      role: courier.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders/nearby')
      .query({
        latitude: -23.55052,
        longitude: -46.633308,
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.orders).toHaveLength(1)
  })

  test('[GET] /orders/nearby - should require COURIER role', async () => {
    const admin = await makeAdmin(prisma, { cpf: '98765432101' })

    const accessToken = await makeAccessToken(jwt, {
      sub: admin.id,
      role: admin.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders/nearby')
      .query({
        latitude: -23.55052,
        longitude: -46.633308,
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })

  test('[GET] /orders/nearby - should validate query parameters', async () => {
    const courier = await makeCourier(prisma, { cpf: '11122233344' })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier.id,
      role: courier.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders/nearby')
      .query({
        latitude: 'invalid',
        longitude: -46.633308,
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(400)
  })

  test('[GET] /orders/nearby - should return empty array when no nearby orders exist', async () => {
    const courier = await makeCourier(prisma, { cpf: '55566677788' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient2@example.com',
    })

    // Create order far away
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
      latitude: -23.9,
      longitude: -46.633308,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier.id,
      role: courier.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders/nearby')
      .query({
        latitude: -23.55052,
        longitude: -46.633308,
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.orders).toHaveLength(0)
  })
})
