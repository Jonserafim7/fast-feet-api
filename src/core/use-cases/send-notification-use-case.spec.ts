import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { FakeMailProvider } from '@/test/providers/fake-mail-provider.js'
import { SendNotificationUseCase } from './send-notification-use-case.js'

let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let fakeMailProvider: FakeMailProvider
let sut: SendNotificationUseCase

describe('Send Notification', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    fakeMailProvider = new FakeMailProvider()
    sut = new SendNotificationUseCase(
      inMemoryNotificationsRepository,
      inMemoryRecipientsRepository,
      fakeMailProvider
    )
  })

  it('should be able to send a notification', async () => {
    await inMemoryRecipientsRepository.create({
      id: 'recipient-1',
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '123456789',
    })

    const result = await sut.execute({
      recipientId: 'recipient-1',
      title: 'Nova notificação',
      content: 'Conteúdo da notificação',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryNotificationsRepository.items).toHaveLength(1)
    expect(inMemoryNotificationsRepository.items[0]).toMatchObject({
      recipientId: 'recipient-1',
      title: 'Nova notificação',
      content: 'Conteúdo da notificação',
    })
    expect(fakeMailProvider.messages).toHaveLength(1)
    expect(fakeMailProvider.messages[0]).toMatchObject({
      to: 'johndoe@example.com',
      subject: 'Nova notificação',
      body: 'Conteúdo da notificação',
    })
  })
})
