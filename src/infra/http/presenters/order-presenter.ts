import { Order } from '@/generated/prisma/client.js'

export class OrderPresenter {
  static toHTTP(order: Order) {
    return {
      id: order.id,
      status: order.status,
      latitude: order.latitude.toNumber(),
      longitude: order.longitude.toNumber(),
      street: order.street,
      number: order.number,
      city: order.city,
      neighborhood: order.neighborhood,
      state: order.state,
      zip: order.zip,
      country: order.country,
      complement: order.complement,
      pickupDate: order.pickupDate,
      deliveryDate: order.deliveryDate,
      recipientId: order.recipientId,
      courierId: order.courierId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }
  }
}
