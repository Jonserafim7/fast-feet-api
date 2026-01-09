import { Module } from '@nestjs/common'
import { NotificationSender } from '@/core/notifications/notification-sender.js'
import { NodemailerNotificationSender } from '@/infra/notifications/nodemailer-notification-sender.js'
import { EnvModule } from '@/infra/env/env.module.js'

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: NotificationSender,
      useClass: NodemailerNotificationSender,
    },
  ],
  exports: [NotificationSender],
})
export class NotificationsModule {}
