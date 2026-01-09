import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-orders-repository.js'
import { InMemoryAttachmentsRepository } from '@/test/repositories/in-memory-attachments-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipients-repository.js'
import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { FakeNotificationSender } from '@/test/notifications/fake-notification-sender.js'
import { FakeUploader } from '@/test/storage/fake-uploader.js'
import { DeliverOrderUseCase } from './deliver-order-use-case.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '../errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '../errors/not-order-courier-error.js'
import { AttachmentRequiredError } from '../errors/attachment-required-error.js'

describe('deliver order use case', () => {
  let ordersRepository: InMemoryOrdersRepository
  let attachmentsRepository: InMemoryAttachmentsRepository
  let recipientsRepository: InMemoryRecipientsRepository
  let notificationsRepository: InMemoryNotificationsRepository
  let uploader: FakeUploader
  let notificationSender: FakeNotificationSender
  let sut: DeliverOrderUseCase

  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    attachmentsRepository = new InMemoryAttachmentsRepository()
    recipientsRepository = new InMemoryRecipientsRepository()
    notificationsRepository = new InMemoryNotificationsRepository()
    uploader = new FakeUploader()
    notificationSender = new FakeNotificationSender()
    sut = new DeliverOrderUseCase(
      ordersRepository,
      attachmentsRepository,
      recipientsRepository,
      notificationsRepository,
      uploader,
      notificationSender
    )
  })

  it('should be able to deliver an order with photo', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'Recipient One',
      email: 'recipient@example.com',
    })
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
    if (result.isRight()) {
      expect(result.value.attachmentUrl).toBeTruthy()
    }
    expect(ordersRepository.items[0].status).toBe('DELIVERED')
    expect(ordersRepository.items[0].deliveryDate).toBeInstanceOf(Date)
    expect(attachmentsRepository.items).toHaveLength(1)
    expect(attachmentsRepository.items[0].orderId).toBe('order-1')
    expect(uploader.uploads).toHaveLength(1)
    expect(notificationsRepository.items).toHaveLength(1)
    expect(notificationSender.sent).toHaveLength(1)
  })

  it('should not deliver order if courier is not the owner', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'Recipient One',
      email: 'recipient@example.com',
    })
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
    expect(notificationsRepository.items).toHaveLength(0)
    expect(notificationSender.sent).toHaveLength(0)
  })

  it('should not deliver order that is not withdrawn', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'Recipient One',
      email: 'recipient@example.com',
    })
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
    expect(notificationsRepository.items).toHaveLength(0)
    expect(notificationSender.sent).toHaveLength(0)
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
    expect(notificationsRepository.items).toHaveLength(0)
    expect(notificationSender.sent).toHaveLength(0)
  })

  it('should not deliver order without file', async () => {
    await recipientsRepository.create({
      id: 'recipient-1',
      name: 'Recipient One',
      email: 'recipient@example.com',
    })
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
    expect(notificationsRepository.items).toHaveLength(0)
    expect(notificationSender.sent).toHaveLength(0)
  })
})
