import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { ListRecipientsUseCase } from './list-recipients-use-case.js'

describe('list recipients use case', () => {
  let recipientsRepository: InMemoryRecipientsRepository
  let sut: ListRecipientsUseCase

  beforeEach(() => {
    recipientsRepository = new InMemoryRecipientsRepository()
    sut = new ListRecipientsUseCase(recipientsRepository)
  })

  it('should list recipients with pagination when requested', async () => {
    await recipientsRepository.create({
      name: 'Recipient One',
      email: 'recipient.one@example.com',
    })

    await recipientsRepository.create({
      name: 'Recipient Two',
      email: 'recipient.two@example.com',
    })

    await recipientsRepository.create({
      name: 'Recipient Three',
      email: 'recipient.three@example.com',
    })

    const result = await sut.execute({ page: 1, perPage: 2 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.recipients).toHaveLength(2)
    }
  })

  it('should return the next page of recipients when paginating', async () => {
    await recipientsRepository.create({
      name: 'Recipient One',
      email: 'recipient.one@example.com',
    })

    await recipientsRepository.create({
      name: 'Recipient Two',
      email: 'recipient.two@example.com',
    })

    await recipientsRepository.create({
      name: 'Recipient Three',
      email: 'recipient.three@example.com',
    })

    const result = await sut.execute({ page: 2, perPage: 2 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.recipients).toHaveLength(1)
    }
  })
})
