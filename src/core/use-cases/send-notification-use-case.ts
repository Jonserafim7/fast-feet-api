import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/errors/either.js'
import { NotificationsRepository } from '@/core/repositories/notifications-repository.js'
import { Mailer } from '@/core/messaging/mailer.js'

interface SendNotificationUseCaseRequest {
  recipientId: string
  recipientEmail: string
  title: string
  content: string
}

type SendNotificationUseCaseResponse = Either<null, null>

@Injectable()
export class SendNotificationUseCase {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly mailer: Mailer
  ) {}

  async execute({
    recipientId,
    recipientEmail,
    title,
    content,
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    try {
      await this.notificationsRepository.create({
        recipientId,
        title,
        content,
      })
    } catch (error) {
      console.error('Failed to store notification', { recipientId }, error)
      throw error
    }

    try {
      await this.mailer.send({
        to: recipientEmail,
        subject: title,
        body: content,
      })
    } catch (error) {
      console.error(
        'Failed to send email notification',
        { recipientId, recipientEmail },
        error
      )
    }

    return right(null)
  }
}
