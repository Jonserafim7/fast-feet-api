import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { FakeMailProvider } from '@/test/providers/fake-mail-provider.js'
import { ReturnOrderUseCase } from './return-order-use-case.js'
import { SendNotificationUseCase } from './send-notification-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '../errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '../errors/not-order-courier-error.js'

describe('return order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let notificationsRepository: InMemoryNotificationsRepository
  let recipientsRepository: InMemoryRecipientsRepository
  let fakeMailProvider: FakeMailProvider
  let sendNotification: SendNotificationUseCase
  let sut: ReturnOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    notificationsRepository = new InMemoryNotificationsRepository()
    recipientsRepository = new InMemoryRecipientsRepository()
    fakeMailProvider = new FakeMailProvider()
    sendNotification = new SendNotificationUseCase(
      notificationsRepository,
      recipientsRepository,
      fakeMailProvider
    )
    sut = new ReturnOrderUseCase(ordersRepository, sendNotification)
  })

  it('should be able to return an order and send a notification', async () => {
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
    expect(notificationsRepository.items).toHaveLength(1)
    expect(notificationsRepository.items[0].recipientId).toBe('recipient-1')
  })

  it('should not be able to return a non-existent order', async () => {
    const result = await sut.execute({
      orderId: 'non-existent-order',
      courierId: 'courier-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to return an order that is not withdrawn', async () => {
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
  })

  it('should not be able to return an order from a different courier', async () => {
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
  })
})
