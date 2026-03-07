import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { InMemoryAttachmentsRepository } from '@/test/repositories/in-memory-attachments-repository.js'
import { FakeUploader } from '@/test/storage/fake-uploader.js'
import { GetOrderUseCase } from './get-order-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'

describe('get order use case', () => {
  let recipientsRepository: InMemoryRecipientsRepository
  let ordersRepository: InMemoryOrdersRepository
  let attachmentsRepository: InMemoryAttachmentsRepository
  let uploader: FakeUploader
  let sut: GetOrderUseCase

  beforeEach(() => {
    recipientsRepository = new InMemoryRecipientsRepository()
    ordersRepository = new InMemoryOrdersRepository(recipientsRepository)
    attachmentsRepository = new InMemoryAttachmentsRepository()
    uploader = new FakeUploader()
    sut = new GetOrderUseCase(ordersRepository, attachmentsRepository, uploader)
  })

  it('should get an order by id with recipient', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'John Doe',
      email: 'john@example.com',
    })

    await ordersRepository.create({
      id: 'order-1',
      title: 'Entrega',
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

    const result = await sut.execute({ orderId: 'order-1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.id).toBe('order-1')
      expect(result.value.order.status).toBe('WAITING')
      expect(result.value.order.recipientId).toBe('recipient-1')
      expect(result.value.order.recipient.name).toBe('John Doe')
      expect(result.value.order.recipient.email).toBe('john@example.com')
      expect(result.value.order.attachments).toEqual([])
    }
  })

  it('should return order with attachments', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'John Doe',
      email: 'john@example.com',
    })

    await ordersRepository.create({
      id: 'order-1',
      title: 'Entrega',
      status: 'DELIVERED',
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

    await attachmentsRepository.create({
      title: 'photo.jpg',
      url: 'abc-photo.jpg',
      orderId: 'order-1',
    })

    const result = await sut.execute({ orderId: 'order-1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.attachments).toHaveLength(1)
      expect(result.value.order.attachments[0].title).toBe('photo.jpg')
      expect(result.value.order.attachments[0].url).toBe(
        'http://fake-url.com/abc-photo.jpg'
      )
    }
  })

  it('should return error when order does not exist', async () => {
    const result = await sut.execute({ orderId: 'non-existent-order' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
