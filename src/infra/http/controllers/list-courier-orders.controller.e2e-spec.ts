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

describe('List Courier Orders (E2E)', () => {
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

  test('[GET] /orders/me - should list only orders assigned to authenticated courier', async () => {
    const courier1 = await makeCourier(prisma, { cpf: '11111111111' })
    const courier2 = await makeCourier(prisma, { cpf: '22222222222' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient@example.com',
    })

    // Create order assigned to courier1
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courier1.id,
      latitude: -23.5605,
      longitude: -46.6433,
    })

    // Create another order assigned to courier1
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'DELIVERED',
      courierId: courier1.id,
      latitude: -23.5605,
      longitude: -46.6433,
    })

    // Create order assigned to courier2 (should not appear for courier1)
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courier2.id,
      latitude: -23.5605,
      longitude: -46.6433,
    })

    // Create order without courier (should not appear)
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
      latitude: -23.5605,
      longitude: -46.6433,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier1.id,
      role: courier1.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.orders).toHaveLength(2)
    expect(response.body.orders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: 'WITHDRAWN',
        }),
        expect.objectContaining({
          status: 'DELIVERED',
        }),
      ])
    )
  })

  test('[GET] /orders/me - should return empty array when courier has no orders', async () => {
    const courier = await makeCourier(prisma, { cpf: '33333333333' })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier.id,
      role: courier.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.orders).toHaveLength(0)
  })

  test('[GET] /orders/me - should support pagination', async () => {
    const courier = await makeCourier(prisma, { cpf: '44444444444' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient2@example.com',
    })

    // Create 3 orders for courier
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courier.id,
      latitude: -23.5605,
      longitude: -46.6433,
    })
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'DELIVERED',
      courierId: courier.id,
      latitude: -23.5605,
      longitude: -46.6433,
    })
    await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'RETURNED',
      courierId: courier.id,
      latitude: -23.5605,
      longitude: -46.6433,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier.id,
      role: courier.role,
    })

    // First page with 2 items
    const response1 = await request(app.getHttpServer())
      .get('/orders/me')
      .query({ page: 1, perPage: 2 })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response1.statusCode).toBe(200)
    expect(response1.body.orders).toHaveLength(2)

    // Second page with 2 items
    const response2 = await request(app.getHttpServer())
      .get('/orders/me')
      .query({ page: 2, perPage: 2 })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response2.statusCode).toBe(200)
    expect(response2.body.orders).toHaveLength(1)
  })

  test('[GET] /orders/me - should require authentication', async () => {
    const response = await request(app.getHttpServer()).get('/orders/me')

    expect(response.statusCode).toBe(401)
  })

  test('[GET] /orders/me - should require COURIER role', async () => {
    const admin = await makeAdmin(prisma, { cpf: '55555555555' })

    const accessToken = await makeAccessToken(jwt, {
      sub: admin.id,
      role: admin.role,
    })

    const response = await request(app.getHttpServer())
      .get('/orders/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })
})
