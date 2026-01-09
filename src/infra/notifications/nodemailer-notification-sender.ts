import { Injectable } from '@nestjs/common'
import nodemailer from 'nodemailer'
import {
  NotificationSender,
  SendNotificationData,
} from '@/core/notifications/notification-sender.js'
import { EnvService } from '@/infra/env/env.service.js'

@Injectable()
export class NodemailerNotificationSender implements NotificationSender {
  private transporter?: nodemailer.Transporter

  constructor(private readonly env: EnvService) {}

  private async getTransporter() {
    if (this.transporter) {
      return this.transporter
    }

    if (this.env.get('NODE_ENV') === 'test') {
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      })
      return this.transporter
    }

    let host = this.env.get('MAIL_HOST')
    let port = this.env.get('MAIL_PORT')
    let secure = port === 465
    let user = this.env.get('MAIL_USER')
    let pass = this.env.get('MAIL_PASS')

    if (!user || !pass) {
      const testAccount = await nodemailer.createTestAccount()
      host = testAccount.smtp.host
      port = testAccount.smtp.port
      secure = testAccount.smtp.secure
      user = testAccount.user
      pass = testAccount.pass
    }

    if (!user || !pass) {
      throw new Error('Mail credentials are missing.')
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    })

    return this.transporter
  }

  async send({
    recipientEmail,
    recipientName,
    subject,
    content,
  }: SendNotificationData): Promise<void> {
    const transporter = await this.getTransporter()
    const fromEmail = this.env.get('MAIL_FROM_EMAIL')
    const fromName = this.env.get('MAIL_FROM_NAME')
    const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail
    const to = recipientName
      ? `"${recipientName}" <${recipientEmail}>`
      : recipientEmail

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: content,
    })

    if (this.env.get('NODE_ENV') !== 'test') {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        console.info(`Notification preview: ${previewUrl}`)
      }
    }
  }
}
