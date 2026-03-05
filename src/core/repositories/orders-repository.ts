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
  neighborhood: string
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
  neighborhood?: string
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
  abstract findManyAvailable(params: {
    page: number
    perPage: number
    search?: string
  }): Promise<Order[]>
  abstract findManyByCourierId(params: {
    courierId: string
    page: number
    perPage: number
    status?: OrderStatus
    search?: string
  }): Promise<Order[]>
  abstract save(data: UpdateOrderData): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract updateStatus(id: string, status: OrderStatus): Promise<void>
  abstract withdraw(
    id: string,
    courierId: string,
    pickupDate: Date
  ): Promise<void>
  abstract deliver(id: string, deliveryDate: Date): Promise<void>
  abstract return(id: string, returnDate: Date): Promise<void>
}
