import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { ListOrdersUseCase } from './list-orders-use-case.js'

describe('list orders use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let sut: ListOrdersUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new ListOrdersUseCase(ordersRepository)
  })

  it('should list orders with pagination', async () => {
    for (let i = 1; i <= 25; i++) {
      await ordersRepository.create({
        id: `order-${i}`,
        status: 'WAITING',
        recipientId: 'recipient-1',
        latitude: -23.55052,
        longitude: -46.633308,
        street: `Street ${i}`,
        number: `${i}`,
        city: 'São Paulo',
        neighborhood: 'Centro',
        state: 'SP',
        zip: '01310100',
        country: 'Brasil',
      })
    }

    const resultPage1 = await sut.execute({ page: 1, perPage: 10 })
    const resultPage2 = await sut.execute({ page: 2, perPage: 10 })
    const resultPage3 = await sut.execute({ page: 3, perPage: 10 })

    expect(resultPage1.isRight()).toBe(true)
    expect(resultPage2.isRight()).toBe(true)
    expect(resultPage3.isRight()).toBe(true)

    if (resultPage1.isRight()) {
      expect(resultPage1.value.orders).toHaveLength(10)
    }

    if (resultPage2.isRight()) {
      expect(resultPage2.value.orders).toHaveLength(10)
    }

    if (resultPage3.isRight()) {
      expect(resultPage3.value.orders).toHaveLength(5)
    }
  })

  it('should return empty array when no orders exist', async () => {
    const result = await sut.execute({ page: 1, perPage: 10 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(0)
    }
  })
})
