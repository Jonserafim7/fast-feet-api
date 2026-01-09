import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { FakeNotificationSender } from '@/test/notifications/fake-notification-sender.js'
import { ReturnOrderUseCase } from './return-order-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '../errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '../errors/not-order-courier-error.js'

describe('return order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let recipientsRepository: InMemoryRecipientsRepository
  let notificationsRepository: InMemoryNotificationsRepository
  let notificationSender: FakeNotificationSender
  let sut: ReturnOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    recipientsRepository = new InMemoryRecipientsRepository()
    notificationsRepository = new InMemoryNotificationsRepository()
    notificationSender = new FakeNotificationSender()
    sut = new ReturnOrderUseCase(
      ordersRepository,
      recipientsRepository,
      notificationsRepository,
      notificationSender
    )
  })

  it('should be able to return an order', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'Recipient One',
      email: 'recipient@example.com',
    })
    await ordersRepository.create({
      id: 'order-1',
      status: 'WITHDRAWN',
      recipientId: 'recipient-1',
      courierId: 'courier-1',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'courier-1',
    })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items[0].status).toBe('RETURNED')
    expect(ordersRepository.items[0].returnDate).toBeInstanceOf(Date)
    expect(notificationsRepository.items).toHaveLength(1)
    expect(notificationSender.sent).toHaveLength(1)
  })

  it('should not be able to return a non-existent order', async () => {
    const result = await sut.execute({
      orderId: 'non-existent-order',
      courierId: 'courier-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(notificationsRepository.items).toHaveLength(0)
    expect(notificationSender.sent).toHaveLength(0)
  })

  it('should not be able to return an order that is not withdrawn', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'Recipient One',
      email: 'recipient@example.com',
    })
    await ordersRepository.create({
      id: 'order-1',
      status: 'WAITING',
      recipientId: 'recipient-1',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'courier-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidOrderStatusError)
    expect(notificationsRepository.items).toHaveLength(0)
    expect(notificationSender.sent).toHaveLength(0)
  })

  it('should not be able to return an order from a different courier', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'Recipient One',
      email: 'recipient@example.com',
    })
    await ordersRepository.create({
      id: 'order-1',
      status: 'WITHDRAWN',
      recipientId: 'recipient-1',
      courierId: 'courier-1',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'different-courier',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotOrderCourierError)
    expect(notificationsRepository.items).toHaveLength(0)
    expect(notificationSender.sent).toHaveLength(0)
  })
})
