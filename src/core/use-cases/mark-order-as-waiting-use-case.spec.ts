import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { FakeMailer } from '@/test/messaging/fake-mailer.js'
import { MarkOrderAsWaitingUseCase } from './mark-order-as-waiting-use-case.js'
import { SendNotificationUseCase } from './send-notification-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '../errors/invalid-order-status-error.js'

describe('mark order as waiting use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let recipientsRepository: InMemoryRecipientsRepository
  let notificationsRepository: InMemoryNotificationsRepository
  let mailer: FakeMailer
  let sendNotification: SendNotificationUseCase
  let sut: MarkOrderAsWaitingUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    recipientsRepository = new InMemoryRecipientsRepository()
    notificationsRepository = new InMemoryNotificationsRepository()
    mailer = new FakeMailer()
    sendNotification = new SendNotificationUseCase(
      notificationsRepository,
      mailer
    )
    sut = new MarkOrderAsWaitingUseCase(
      ordersRepository,
      recipientsRepository,
      sendNotification
    )
  })

  it('should mark a pending order as waiting', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'John Doe',
      email: 'john@example.com',
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
      neighborhood: 'Centro',
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
    expect(notificationsRepository.items[0]).toMatchObject({
      recipientId: 'recipient-1',
      title: 'Pedido disponível para retirada',
      content: 'Seu pedido está pronto e aguardando retirada pelo entregador.',
    })
    expect(mailer.emails).toHaveLength(1)
    expect(mailer.emails[0]).toMatchObject({
      to: 'john@example.com',
      subject: 'Pedido disponível para retirada',
      body: 'Seu pedido está pronto e aguardando retirada pelo entregador.',
    })
  })

  it('should return ResourceNotFoundError when order does not exist', async () => {
    const result = await sut.execute({
      orderId: 'non-existent-order',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return InvalidOrderStatusError when order is not pending', async () => {
    await ordersRepository.create({
      id: 'order-1',
      status: 'WAITING',
      recipientId: 'recipient-1',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      neighborhood: 'Centro',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    const result = await sut.execute({
      orderId: 'order-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidOrderStatusError)
  })

  it('should return InvalidOrderStatusError when order is already waiting', async () => {
    await ordersRepository.create({
      id: 'order-1',
      status: 'WAITING',
      recipientId: 'recipient-1',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      neighborhood: 'Centro',
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
  })

  it('should return InvalidOrderStatusError when order is withdrawn', async () => {
    await ordersRepository.create({
      id: 'order-1',
      status: 'WITHDRAWN',
      recipientId: 'recipient-1',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      neighborhood: 'Centro',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    const result = await sut.execute({
      orderId: 'order-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidOrderStatusError)
  })
})
