import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { ListNearbyOrdersUseCase } from './list-nearby-orders-use-case.js'

describe('list nearby orders use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let sut: ListNearbyOrdersUseCase

  const courierLocation = {
    latitude: -23.55052,
    longitude: -46.633308,
  }

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new ListNearbyOrdersUseCase(ordersRepository)
  })

  it('should list only WAITING orders within 20km radius', async () => {
    // Order 1: ~5km away (should be included)
    await ordersRepository.create({
      id: 'order-near',
      status: 'WAITING',
      recipientId: 'recipient-1',
      latitude: -23.5605,
      longitude: -46.6433,
      street: 'Near Street',
      number: '1',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    // Order 2: ~50km away (should be excluded)
    await ordersRepository.create({
      id: 'order-far',
      status: 'WAITING',
      recipientId: 'recipient-1',
      latitude: -23.9,
      longitude: -46.633308,
      street: 'Far Street',
      number: '2',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    // Order 3: Near but DELIVERED (should be excluded)
    await ordersRepository.create({
      id: 'order-delivered',
      status: 'DELIVERED',
      recipientId: 'recipient-1',
      latitude: -23.5605,
      longitude: -46.6433,
      street: 'Near Street 2',
      number: '3',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    const result = await sut.execute({
      courierLatitude: courierLocation.latitude,
      courierLongitude: courierLocation.longitude,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(1)
      expect(result.value.orders[0].id).toBe('order-near')
    }
  })

  it('should return empty array when no WAITING orders exist nearby', async () => {
    await ordersRepository.create({
      id: 'order-far',
      status: 'WAITING',
      recipientId: 'recipient-1',
      latitude: -23.9,
      longitude: -46.633308,
      street: 'Far Street',
      number: '1',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    const result = await sut.execute({
      courierLatitude: courierLocation.latitude,
      courierLongitude: courierLocation.longitude,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(0)
    }
  })
})
