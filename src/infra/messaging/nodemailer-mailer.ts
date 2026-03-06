import { Injectable } from '@nestjs/common'
import { Mailer, SendMailData } from '@/domain/messaging/mailer.js'
import { EnvService } from '@/infra/env/env.service.js'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

@Injectable()
export class NodemailerMailer implements Mailer {
  private transporter: Transporter

  constructor(private readonly env: EnvService) {
    this.transporter = nodemailer.createTransport({
      host: this.env.get('MAIL_HOST'),
      port: this.env.get('MAIL_PORT'),
      auth: {
        user: this.env.get('MAIL_USER'),
        pass: this.env.get('MAIL_PASS'),
      },
    })
  }

  async send({ to, subject, body }: SendMailData): Promise<void> {
    await this.transporter.sendMail({
      from: this.env.get('MAIL_FROM'),
      to,
      subject,
      text: body,
    })
  }
}
