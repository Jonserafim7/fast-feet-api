import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository.js'
import { AuthenticateUserUseCase } from './authenticate-user-use-case.js'
import { FakeHashGenerator } from '@/test/cryptography/fake-hash-generator.js'
import { FakeEncrypter } from '@/test/cryptography/fake-encrypter.js'
import { FakeHashComparer } from '@/test/cryptography/fake-hash-comparer.js'
import { InvalidCredentialsError } from '../errors/invalid-credentials-errors.js'

describe('authenticate user use case', () => {
  let usersRepository: InMemoryUsersRepository
  let fakeHashGenerator: FakeHashGenerator
  let fakeHashComparer: FakeHashComparer
  let encrypter: FakeEncrypter
  let sut: AuthenticateUserUseCase
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    fakeHashGenerator = new FakeHashGenerator()
    encrypter = new FakeEncrypter()
    fakeHashComparer = new FakeHashComparer()
    sut = new AuthenticateUserUseCase(
      usersRepository,
      fakeHashComparer,
      encrypter
    )
  })
  it('should be able to authenticate a user', async () => {
    await usersRepository.create({
      name: 'John Doe',
      cpf: '12345678909',
      passwordHash: await fakeHashGenerator.hash('123456'),
      role: 'COURIER',
    })

    const result = await sut.execute({
      cpf: '12345678909',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.accessToken).toEqual(expect.any(String))
    }
  })

  it('should not be able to authenticate a user with wrong credentials', async () => {
    await usersRepository.create({
      name: 'John Doe',
      cpf: '12345678909',
      passwordHash: await fakeHashGenerator.hash('123456'),
      role: 'COURIER',
    })

    const result = await sut.execute({
      cpf: '12345678909',
      password: 'wrong-password',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })
})
