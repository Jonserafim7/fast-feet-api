import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/domain/repositories/orders-repository.js'
import type { CreateOrderData, UpdateOrderData } from '@/domain/entities/order.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import {
  Prisma,
  OrderStatus,
  Order as PrismaOrder,
} from '@/generated/prisma/client.js'
import type { Order } from '@/domain/entities/order.js'
import type { OrderWithRecipient } from '@/domain/entities/order.js'

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaOrder: PrismaOrder): Order {
    return {
      ...prismaOrder,
      latitude: prismaOrder.latitude.toNumber(),
      longitude: prismaOrder.longitude.toNumber(),
    }
  }

  private buildSearchFilter(search: string): Prisma.OrderWhereInput {
    return {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { street: { contains: search, mode: 'insensitive' } },
        { neighborhood: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { zip: { contains: search, mode: 'insensitive' } },
      ],
    }
  }

  async create(data: CreateOrderData) {
    await this.prisma.order.create({
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status ?? 'WAITING',
        recipientId: data.recipientId,
        latitude: new Prisma.Decimal(data.latitude),
        longitude: new Prisma.Decimal(data.longitude),
        street: data.street,
        number: data.number,
        city: data.city,
        neighborhood: data.neighborhood,
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
    return order ? this.toDomain(order) : null
  }

  async findByIdWithRecipient(id: string): Promise<OrderWithRecipient | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { recipient: true },
    })
    if (!order) return null
    const { recipient, ...rest } = order
    return { ...this.toDomain(rest), recipient }
  }

  async findMany({ page, perPage }: { page: number; perPage: number }) {
    const skip = (page - 1) * perPage
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count(),
    ])
    return { orders: items.map((o) => this.toDomain(o)), total }
  }

  async findManyAvailable({
    page,
    perPage,
    search,
  }: {
    page: number
    perPage: number
    search?: string
  }) {
    const skip = (page - 1) * perPage
    const where: Prisma.OrderWhereInput = {
      status: 'WAITING',
      courierId: null,
      ...(search && this.buildSearchFilter(search)),
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ])
    return { orders: items.map((o) => this.toDomain(o)), total }
  }

  async findManyByCourierId({
    courierId,
    page,
    perPage,
    status,
    search,
  }: {
    courierId: string
    page: number
    perPage: number
    status?: OrderStatus
    search?: string
  }) {
    const skip = (page - 1) * perPage
    const where: Prisma.OrderWhereInput = {
      courierId,
      ...(status && { status }),
      ...(search && this.buildSearchFilter(search)),
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ])
    return { orders: items.map((o) => this.toDomain(o)), total }
  }

  async save(data: UpdateOrderData) {
    await this.prisma.order.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
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
        neighborhood: data.neighborhood,
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
