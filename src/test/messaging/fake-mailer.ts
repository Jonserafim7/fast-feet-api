import { Mailer, SendMailData } from '@/core/messaging/mailer.js'

export class FakeMailer implements Mailer {
  public emails: SendMailData[] = []

  async send(data: SendMailData): Promise<void> {
    this.emails.push(data)
  }
}
