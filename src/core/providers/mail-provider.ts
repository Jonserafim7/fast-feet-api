export interface SendMailData {
  to: string
  subject: string
  body: string
}

export abstract class MailProvider {
  abstract sendMail(data: SendMailData): Promise<void>
}
