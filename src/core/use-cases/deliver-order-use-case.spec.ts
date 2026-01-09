import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryAttachmentsRepository } from '@/test/repositories/in-memory-attachments-repository.js'
import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { FakeMailProvider } from '@/test/providers/fake-mail-provider.js'
import { FakeUploader } from '@/test/storage/fake-uploader.js'
import { DeliverOrderUseCase } from './deliver-order-use-case.js'
import { SendNotificationUseCase } from './send-notification-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '../errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '../errors/not-order-courier-error.js'
import { AttachmentRequiredError } from '../errors/attachment-required-error.js'

describe('deliver order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let attachmentsRepository: InMemoryAttachmentsRepository
  let notificationsRepository: InMemoryNotificationsRepository
  let recipientsRepository: InMemoryRecipientsRepository
  let fakeMailProvider: FakeMailProvider
  let uploader: FakeUploader
  let sendNotification: SendNotificationUseCase
  let sut: DeliverOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    attachmentsRepository = new InMemoryAttachmentsRepository()
    notificationsRepository = new InMemoryNotificationsRepository()
    recipientsRepository = new InMemoryRecipientsRepository()
    fakeMailProvider = new FakeMailProvider()
    uploader = new FakeUploader()
    sendNotification = new SendNotificationUseCase(
      notificationsRepository,
      recipientsRepository,
      fakeMailProvider
    )
    sut = new DeliverOrderUseCase(
      ordersRepository,
      attachmentsRepository,
      uploader,
      sendNotification
    )
  })

  it('should be able to deliver an order with photo and send a notification', async () => {
    await ordersRepository.create({
      id: 'order-1',
      status: 'WITHDRAWN',
      recipientId: 'recipient-1',
      courierId: 'courier-1',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'courier-1',
      fileName: 'delivery-photo.jpg',
      fileType: 'image/jpeg',
      body: Buffer.from('fake-image-content'),
    })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items[0].status).toBe('DELIVERED')
    expect(notificationsRepository.items).toHaveLength(1)
    expect(notificationsRepository.items[0].recipientId).toBe('recipient-1')
  })

  it('should not deliver order if courier is not the owner', async () => {
    await ordersRepository.create({
      id: 'order-1',
      status: 'WITHDRAWN',
      recipientId: 'recipient-1',
      courierId: 'courier-1',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'different-courier',
      fileName: 'delivery-photo.jpg',
      fileType: 'image/jpeg',
      body: Buffer.from('fake-image-content'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotOrderCourierError)
  })

  it('should not deliver order that is not withdrawn', async () => {
    await ordersRepository.create({
      id: 'order-1',
      status: 'WAITING',
      recipientId: 'recipient-1',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'courier-1',
      fileName: 'delivery-photo.jpg',
      fileType: 'image/jpeg',
      body: Buffer.from('fake-image-content'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidOrderStatusError)
  })

  it('should not deliver non-existent order', async () => {
    const result = await sut.execute({
      orderId: 'non-existent',
      courierId: 'courier-1',
      fileName: 'delivery-photo.jpg',
      fileType: 'image/jpeg',
      body: Buffer.from('fake-image-content'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not deliver order without file', async () => {
    await ordersRepository.create({
      id: 'order-1',
      status: 'WITHDRAWN',
      recipientId: 'recipient-1',
      courierId: 'courier-1',
      latitude: -23.55052,
      longitude: -46.633308,
      street: 'Av Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310100',
      country: 'Brasil',
    })

    const result = await sut.execute({
      orderId: 'order-1',
      courierId: 'courier-1',
      fileName: 'delivery-photo.jpg',
      fileType: 'image/jpeg',
      body: Buffer.from(''),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(AttachmentRequiredError)
  })
})
