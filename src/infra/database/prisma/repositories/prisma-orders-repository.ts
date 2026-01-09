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

    const orders = await this.prisma.$queryRaw<Order[]>`
      SELECT * FROM orders
      WHERE status = 'WAITING'
      AND (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude::double precision)) *
          cos(radians(longitude::double precision) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude::double precision))
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
