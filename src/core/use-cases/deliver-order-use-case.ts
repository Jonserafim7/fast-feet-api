import { Injectable } from '@nestjs/common'
import { OrdersRepository } from '@/core/repositories/orders-repository.js'
import { AttachmentsRepository } from '@/core/repositories/attachments-repository.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { SendNotificationUseCase } from '@/core/use-cases/send-notification-use-case.js'
import { Uploader } from '@/core/storage/uploader.js'
import { Either, left, right } from '@/core/errors/either.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/core/errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '@/core/errors/not-order-courier-error.js'
import { AttachmentRequiredError } from '@/core/errors/attachment-required-error.js'

interface DeliverOrderUseCaseRequest {
  orderId: string
  courierId: string
  fileName: string
  fileType: string
  body: Buffer
}

type DeliverOrderUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidOrderStatusError
  | NotOrderCourierError
  | AttachmentRequiredError,
  { attachmentUrl: string }
>

@Injectable()
export class DeliverOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly recipientsRepository: RecipientsRepository,
    private readonly sendNotification: SendNotificationUseCase,
    private readonly uploader: Uploader
  ) {}

  async execute({
    orderId,
    courierId,
    fileName,
    fileType,
    body,
  }: DeliverOrderUseCaseRequest): Promise<DeliverOrderUseCaseResponse> {
    // 1. Find the order
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError(orderId))
    }

    // 2. Validate order status is WITHDRAWN
    if (order.status !== 'WITHDRAWN') {
      return left(new InvalidOrderStatusError(order.status, 'WITHDRAWN'))
    }

    // 3. Validate courier ownership
    if (order.courierId !== courierId) {
      return left(new NotOrderCourierError())
    }

    // 4. Validate file exists
    if (!body || body.length === 0) {
      return left(new AttachmentRequiredError())
    }

    // 5. Upload file to R2
    const { url } = await this.uploader.upload({
      fileName,
      fileType,
      body,
    })

    // 6. Create attachment record
    await this.attachmentsRepository.create({
      title: fileName,
      url,
      orderId,
    })

    // 7. Update order status to DELIVERED
    await this.ordersRepository.deliver(orderId, new Date())

    this.recipientsRepository
      .findById(order.recipientId)
      .then((recipient) => {
        if (recipient) {
          return this.sendNotification.execute({
            recipientId: recipient.id,
            recipientEmail: recipient.email,
            title: 'Pedido entregue',
            content: 'Seu pedido foi entregue com sucesso.',
          })
        }
      })
      .catch((error) => {
        console.error('Failed to send notification for order', orderId, error)
      })

    return right({ attachmentUrl: url })
  }
}
