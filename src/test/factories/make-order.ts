import { randomUUID } from 'node:crypto'
import type { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import type { OrderStatus } from '@/generated/prisma/client.js'
import { Prisma } from '@/generated/prisma/client.js'

export interface MakeOrderInput {
  id?: string
  status?: OrderStatus
  latitude?: number
  longitude?: number
  street?: string
  number?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  complement?: string | null
  pickupDate?: Date | null
  deliveryDate?: Date | null
  recipientId: string
  courierId?: string | null
}

export interface MakeOrderOutput {
  id: string
  status: OrderStatus
  latitude: Prisma.Decimal
  longitude: Prisma.Decimal
  street: string
  number: string
  city: string
  state: string
  zip: string
  country: string
  complement: string | null
  pickupDate: Date | null
  deliveryDate: Date | null
  recipientId: string
  courierId: string | null
}

let orderCounter = 0

export async function makeOrder(
  prisma: PrismaService,
  input: MakeOrderInput
): Promise<MakeOrderOutput> {
  orderCounter++

  const id = input.id ?? randomUUID()
  const status = input.status ?? 'WAITING'
  const latitude = new Prisma.Decimal(input.latitude ?? -23.55052)
  const longitude = new Prisma.Decimal(input.longitude ?? -46.633308)
  const street = input.street ?? `Rua Teste ${orderCounter}`
  const number = input.number ?? `${orderCounter}`
  const city = input.city ?? 'São Paulo'
  const state = input.state ?? 'SP'
  const zip = input.zip ?? '01310100'
  const country = input.country ?? 'Brasil'
  const complement = input.complement !== undefined ? input.complement : null
  const pickupDate = input.pickupDate !== undefined ? input.pickupDate : null
  const deliveryDate =
    input.deliveryDate !== undefined ? input.deliveryDate : null
  const courierId = input.courierId !== undefined ? input.courierId : null

  await prisma.order.create({
    data: {
      id,
      status,
      latitude,
      longitude,
      street,
      number,
      city,
      state,
      zip,
      country,
      complement,
      pickupDate,
      deliveryDate,
      recipientId: input.recipientId,
      courierId,
    },
  })

  return {
    id,
    status,
    latitude,
    longitude,
    street,
    number,
    city,
    state,
    zip,
    country,
    complement,
    pickupDate,
    deliveryDate,
    recipientId: input.recipientId,
    courierId,
  }
}
