import { Injectable } from '@nestjs/common'
import { Order, OrderStatus } from '@/generated/prisma/client.js'

export interface CreateOrderData {
  id?: string
  status?: OrderStatus
  recipientId: string
  latitude: number
  longitude: number
  street: string
  number: string
  city: string
  state: string
  zip: string
  country: string
  complement?: string
  courierId?: string
  pickupDate?: Date
  deliveryDate?: Date
}

export interface UpdateOrderData {
  id: string
  latitude?: number
  longitude?: number
  street?: string
  number?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  complement?: string
}

@Injectable()
export abstract class OrdersRepository {
  abstract create(data: CreateOrderData): Promise<void>
  abstract findById(id: string): Promise<Order | null>
  abstract findMany(params: { page: number; perPage: number }): Promise<Order[]>
  abstract save(data: UpdateOrderData): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract updateStatus(id: string, status: OrderStatus): Promise<void>
  abstract withdraw(
    id: string,
    courierId: string,
    pickupDate: Date
  ): Promise<void>
}
