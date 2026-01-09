import { Injectable } from '@nestjs/common'
import { NotificationsRepository } from '@/core/repositories/notifications-repository.js'
import { RecipientsRepository } from '@/core/repositories/recipients-repository.js'
import { MailProvider } from '@/core/providers/mail-provider.js'
import { Either, right } from '@/core/errors/either.js'

interface SendNotificationUseCaseRequest {
  recipientId: string
  title: string
  content: string
}

type SendNotificationUseCaseResponse = Either<null, null>

@Injectable()
export class SendNotificationUseCase {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly recipientsRepository: RecipientsRepository,
    private readonly mailProvider: MailProvider
  ) {}

  async execute({
    recipientId,
    title,
    content,
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (recipient) {
      await this.mailProvider.sendMail({
        to: recipient.email,
        subject: title,
        body: content,
      })
    }

    await this.notificationsRepository.create({
      recipientId,
      title,
      content,
    })

    return right(null)
  }
}
