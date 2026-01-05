import {
  OrdersRepository,
  CreateOrderData,
  UpdateOrderData,
} from '@/core/repositories/orders-repository.js'
import { Order, Prisma, OrderStatus } from '@/generated/prisma/client.js'
import { randomUUID } from 'node:crypto'

export class InMemoryOrdersRepository implements OrdersRepository {
  public items: Order[] = []

  async create(data: CreateOrderData): Promise<void> {
    const order: Order = {
      id: data.id ?? randomUUID(),
      status: data.status ?? 'WAITING',
      latitude: new Prisma.Decimal(data.latitude),
      longitude: new Prisma.Decimal(data.longitude),
      street: data.street,
      number: data.number,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
      complement: data.complement ?? null,
      pickupDate: data.pickupDate ?? null,
      deliveryDate: data.deliveryDate ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      recipientId: data.recipientId,
      courierId: data.courierId ?? null,
    }

    this.items.push(order)

    return Promise.resolve()
  }

  findById(id: string): Promise<Order | null> {
    const order = this.items.find((item) => item.id === id)

    if (!order) {
      return Promise.resolve(null)
    }

    return Promise.resolve(order)
  }

  findMany({
    page,
    perPage,
  }: {
    page: number
    perPage: number
  }): Promise<Order[]> {
    const start = (page - 1) * perPage
    const orders = this.items
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(start, start + perPage)

    return Promise.resolve(orders)
  }

  save(data: UpdateOrderData): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === data.id)

    if (itemIndex >= 0) {
      const currentOrder = this.items[itemIndex]
      this.items[itemIndex] = {
        ...currentOrder,
        latitude:
          data.latitude !== undefined
            ? new Prisma.Decimal(data.latitude)
            : currentOrder.latitude,
        longitude:
          data.longitude !== undefined
            ? new Prisma.Decimal(data.longitude)
            : currentOrder.longitude,
        street: data.street ?? currentOrder.street,
        number: data.number ?? currentOrder.number,
        city: data.city ?? currentOrder.city,
        state: data.state ?? currentOrder.state,
        zip: data.zip ?? currentOrder.zip,
        country: data.country ?? currentOrder.country,
        complement:
          data.complement !== undefined
            ? data.complement
            : currentOrder.complement,
        updatedAt: new Date(),
      }
    }

    return Promise.resolve()
  }

  delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id)
    return Promise.resolve()
  }

  updateStatus(id: string, status: OrderStatus): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === id)

    if (itemIndex >= 0) {
      this.items[itemIndex] = {
        ...this.items[itemIndex],
        status,
        updatedAt: new Date(),
      }
    }

    return Promise.resolve()
  }
}
