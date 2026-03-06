import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { GetCourierOrderUseCase } from './get-courier-order-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { NotOrderCourierError } from '../errors/not-order-courier-error.js'

describe('get courier order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let sut: GetCourierOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new GetCourierOrderUseCase(ordersRepository)
  })

  it('should return a WAITING order for any courier', async () => {
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

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'any-courier',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.id).toBe('order-1')
    }
  })

  it('should return own order regardless of status', async () => {
    await ordersRepository.create({
      id: 'order-1',
      title: 'Entrega',
      status: 'WITHDRAWN',
      recipientId: 'recipient-1',
      courierId: 'courier-1',
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
      courierId: 'courier-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.id).toBe('order-1')
      expect(result.value.order.status).toBe('WITHDRAWN')
    }
  })

  it('should return error when courier tries to access another courier non-WAITING order', async () => {
    await ordersRepository.create({
      id: 'order-1',
      title: 'Entrega',
      status: 'WITHDRAWN',
      recipientId: 'recipient-1',
      courierId: 'courier-1',
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
      courierId: 'courier-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotOrderCourierError)
  })

  it('should return error when order does not exist', async () => {
    const result = await sut.execute({
      orderId: 'non-existent',
      courierId: 'courier-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
