import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js'
import { UpdateCourierUseCase } from './update-courier-use-case.js'
import { Role } from '@/domain/entities/role.js'
import { UserAlreadyExistsError } from '../errors/user-already-exists-errors.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'

describe('update courier use case', () => {
  let usersRepository: InMemoryUsersRepository
  let sut: UpdateCourierUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateCourierUseCase(usersRepository)
  })

  it('should update courier data when it exists', async () => {
    await usersRepository.create({
      name: 'Courier User',
      cpf: '12345678909',
      passwordHash: 'hash',
      role: Role.COURIER,
    })

    const courierId = usersRepository.items[0].id

    const result = await sut.execute({
      courierId,
      name: 'Updated Courier',
      cpf: '74185296355',
    })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items[0].name).toBe('Updated Courier')
    expect(usersRepository.items[0].cpf).toBe('74185296355')
  })

  it('should not update when cpf is already in use', async () => {
    await usersRepository.create({
      name: 'Courier One',
      cpf: '12345678909',
      passwordHash: 'hash',
      role: Role.COURIER,
    })

    await usersRepository.create({
      name: 'Courier Two',
      cpf: '74185296355',
      passwordHash: 'hash',
      role: Role.COURIER,
    })

    const courierId = usersRepository.items[0].id

    const result = await sut.execute({
      courierId,
      cpf: '74185296355',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should return not found when user is not a courier', async () => {
    await usersRepository.create({
      name: 'Admin User',
      cpf: '11122233396',
      passwordHash: 'hash',
      role: Role.ADMIN,
    })

    const adminId = usersRepository.items[0].id

    const result = await sut.execute({
      courierId: adminId,
      name: 'Updated Admin',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
