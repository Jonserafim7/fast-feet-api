import { Injectable, OnModuleInit } from '@nestjs/common'
import nodemailer, { Transporter } from 'nodemailer'
import { MailProvider, SendMailData } from '@/core/providers/mail-provider.js'

@Injectable()
export class EtherealMailProvider implements MailProvider, OnModuleInit {
  private client: Transporter

  async onModuleInit() {
    const account = await nodemailer.createTestAccount()

    this.client = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    })
  }

  async sendMail({ to, subject, body }: SendMailData): Promise<void> {
    const message = await this.client.sendMail({
      from: 'FastFeet <noreply@fastfeet.com>',
      to,
      subject,
      html: body,
    })

    console.log('Message sent: %s', message.messageId)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(message))
  }
}
