import { Injectable } from '@nestjs/common'
import {
  OrdersRepository,
  CreateOrderData,
  UpdateOrderData,
  FindManyNearbyParams,
} from '@/core/repositories/orders-repository.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { Prisma, OrderStatus, Order } from '@/generated/prisma/client.js'

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderData) {
    await this.prisma.order.create({
      data: {
        id: data.id,
        status: data.status ?? 'WAITING',
        recipientId: data.recipientId,
        latitude: new Prisma.Decimal(data.latitude),
        longitude: new Prisma.Decimal(data.longitude),
        street: data.street,
        number: data.number,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        complement: data.complement,
        courierId: data.courierId,
        pickupDate: data.pickupDate,
        deliveryDate: data.deliveryDate,
      },
    })
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    })
    return order
  }

  async findMany({ page, perPage }: { page: number; perPage: number }) {
    const skip = (page - 1) * perPage
    const orders = await this.prisma.order.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    })
    return orders
  }

  async findManyNearby({
    latitude,
    longitude,
  }: FindManyNearbyParams): Promise<Order[]> {
    const MAX_DISTANCE_IN_KM = 20

    // Security: getSchema() validates that schema is UUID format or undefined,
    // making it safe to use with Prisma.raw()
    const schema = this.prisma.getSchema()
    const tableName = schema ? `"${schema}"."orders"` : 'orders'

    // Use Prisma.sql for safe parameterization with Prisma.raw for validated identifier
    const orders = await this.prisma.$queryRaw<Order[]>`
      SELECT * FROM ${Prisma.raw(tableName)}
      WHERE status = 'WAITING'
      AND (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) <= ${MAX_DISTANCE_IN_KM}
    `

    return orders
  }

  async save(data: UpdateOrderData) {
    await this.prisma.order.update({
      where: { id: data.id },
      data: {
        latitude:
          data.latitude !== undefined
            ? new Prisma.Decimal(data.latitude)
            : undefined,
        longitude:
          data.longitude !== undefined
            ? new Prisma.Decimal(data.longitude)
            : undefined,
        street: data.street,
        number: data.number,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        complement: data.complement,
      },
    })
  }

  async delete(id: string) {
    await this.prisma.order.delete({ where: { id } })
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.prisma.order.update({
      where: { id },
      data: { status },
    })
  }

  async withdraw(id: string, courierId: string, pickupDate: Date) {
    await this.prisma.order.update({
      where: { id },
      data: {
        status: 'WITHDRAWN',
        courierId,
        pickupDate,
      },
    })
  }

  async deliver(id: string, deliveryDate: Date) {
    await this.prisma.order.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        deliveryDate,
      },
    })
  }

  async return(id: string, returnDate: Date) {
    await this.prisma.order.update({
      where: { id },
      data: {
        status: 'RETURNED',
        returnDate,
      },
    })
  }
}
