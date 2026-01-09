import {
  NotificationSender,
  SendNotificationData,
} from '@/core/notifications/notification-sender.js'

export class FakeNotificationSender implements NotificationSender {
  public sent: SendNotificationData[] = []

  async send(data: SendNotificationData): Promise<void> {
    this.sent.push(data)
  }
}
