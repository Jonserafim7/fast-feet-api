import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { FakeNotificationSender } from '@/test/notifications/fake-notification-sender.js'
import { MarkOrderAsWaitingUseCase } from './mark-order-as-waiting-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '../errors/invalid-order-status-error.js'

describe('mark order as waiting use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let recipientsRepository: InMemoryRecipientsRepository
  let notificationsRepository: InMemoryNotificationsRepository
  let notificationSender: FakeNotificationSender
  let sut: MarkOrderAsWaitingUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    recipientsRepository = new InMemoryRecipientsRepository()
    notificationsRepository = new InMemoryNotificationsRepository()
    notificationSender = new FakeNotificationSender()
    sut = new MarkOrderAsWaitingUseCase(
      ordersRepository,
      recipientsRepository,
      notificationsRepository,
      notificationSender
    )
  })

  it('should mark a pending order as waiting', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'Recipient One',
      email: 'recipient@example.com',
    })
    await ordersRepository.create({
      id: 'order-1',
      status: 'PENDING',
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
    })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items[0].status).toBe('WAITING')
    expect(notificationsRepository.items).toHaveLength(1)
    expect(notificationSender.sent).toHaveLength(1)
  })

  it('should return ResourceNotFoundError when order does not exist', async () => {
    const result = await sut.execute({
      orderId: 'non-existent-order',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(notificationsRepository.items).toHaveLength(0)
    expect(notificationSender.sent).toHaveLength(0)
  })

  it('should return InvalidOrderStatusError when order is not pending', async () => {
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
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidOrderStatusError)
    expect(notificationsRepository.items).toHaveLength(0)
    expect(notificationSender.sent).toHaveLength(0)
  })

  it('should return InvalidOrderStatusError when order is already waiting', async () => {
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
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidOrderStatusError)
    expect(ordersRepository.items[0].status).toBe('WAITING')
    expect(notificationsRepository.items).toHaveLength(0)
    expect(notificationSender.sent).toHaveLength(0)
  })

  it('should return InvalidOrderStatusError when order is withdrawn', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'Recipient One',
      email: 'recipient@example.com',
    })
    await ordersRepository.create({
      id: 'order-1',
      status: 'WITHDRAWN',
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
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidOrderStatusError)
    expect(notificationsRepository.items).toHaveLength(0)
    expect(notificationSender.sent).toHaveLength(0)
  })
})
