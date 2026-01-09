import { Injectable } from '@nestjs/common'

export interface SendNotificationData {
  recipientEmail: string
  recipientName?: string
  subject: string
  content: string
}

@Injectable()
export abstract class NotificationSender {
  abstract send(data: SendNotificationData): Promise<void>
}
