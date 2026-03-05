import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { DeleteOrderUseCase } from './delete-order-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'

describe('delete order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let sut: DeleteOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new DeleteOrderUseCase(ordersRepository)
  })

  it('should delete an order', async () => {
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
    expect(ordersRepository.items).toHaveLength(0)
  })

  it('should return error when order does not exist', async () => {
    const result = await sut.execute({ orderId: 'non-existent-order' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
