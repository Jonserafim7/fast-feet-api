import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js'
import { GetCourierUseCase } from './get-courier-use-case.js'
import { Role } from '@/domain/entities/role.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'

describe('get courier use case', () => {
  let usersRepository: InMemoryUsersRepository
  let sut: GetCourierUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetCourierUseCase(usersRepository)
  })

  it('should return a courier when it exists', async () => {
    await usersRepository.create({
      name: 'Courier User',
      cpf: '12345678909',
      passwordHash: 'hash',
      role: Role.COURIER,
    })

    const courierId = usersRepository.items[0].id

    const result = await sut.execute({ courierId })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.courier.id).toBe(courierId)
    }
  })

  it('should return not found when user is not a courier', async () => {
    await usersRepository.create({
      name: 'Admin User',
      cpf: '11122233396',
      passwordHash: 'hash',
      role: Role.ADMIN,
    })

    const adminId = usersRepository.items[0].id

    const result = await sut.execute({ courierId: adminId })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
