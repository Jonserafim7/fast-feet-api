import { Injectable } from '@nestjs/common'
import { Prisma, Recipient } from '@/generated/prisma/client.js'

@Injectable()
export abstract class RecipientsRepository {
  abstract create(data: Prisma.RecipientUncheckedCreateInput): Promise<void>
  abstract findByEmail(email: string): Promise<Recipient | null>
  abstract findById(id: string): Promise<Recipient | null>
  abstract findMany(params: {
    page: number
    perPage: number
  }): Promise<Recipient[]>
  abstract save(recipient: Recipient): Promise<void>
  abstract delete(id: string): Promise<void>
}
