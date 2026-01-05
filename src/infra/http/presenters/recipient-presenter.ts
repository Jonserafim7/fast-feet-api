import { Recipient } from '@/generated/prisma/client.js'

export class RecipientPresenter {
  static toHTTP(recipient: Recipient) {
    return {
      id: recipient.id,
      name: recipient.name,
      email: recipient.email,
      phone: recipient.phone,
      createdAt: recipient.createdAt,
      updatedAt: recipient.updatedAt,
    }
  }
}
