import { MailProvider, SendMailData } from '@/core/providers/mail-provider.js'

export class FakeMailProvider implements MailProvider {
  public messages: SendMailData[] = []

  async sendMail(data: SendMailData): Promise<void> {
    this.messages.push(data)
  }
}
