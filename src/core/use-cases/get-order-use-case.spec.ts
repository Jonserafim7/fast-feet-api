import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { GetOrderUseCase } from './get-order-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'

describe('get order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let sut: GetOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new GetOrderUseCase(ordersRepository)
  })

  it('should get an order by id', async () => {
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

    const result = await sut.execute({ orderId: 'order-1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.id).toBe('order-1')
      expect(result.value.order.status).toBe('WAITING')
      expect(result.value.order.recipientId).toBe('recipient-1')
    }
  })

  it('should return error when order does not exist', async () => {
    const result = await sut.execute({ orderId: 'non-existent-order' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
