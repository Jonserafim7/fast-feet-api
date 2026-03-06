import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { GetOrderUseCase } from './get-order-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'

describe('get order use case', () => {
  let recipientsRepository: InMemoryRecipientsRepository
  let ordersRepository: InMemoryOrdersRepository
  let sut: GetOrderUseCase

  beforeEach(() => {
    recipientsRepository = new InMemoryRecipientsRepository()
    ordersRepository = new InMemoryOrdersRepository(recipientsRepository)
    sut = new GetOrderUseCase(ordersRepository)
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
    }
  })

  it('should return error when order does not exist', async () => {
    const result = await sut.execute({ orderId: 'non-existent-order' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
