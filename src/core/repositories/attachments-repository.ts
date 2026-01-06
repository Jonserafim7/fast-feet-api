import { Injectable } from '@nestjs/common'
import { Attachment } from '@/generated/prisma/client.js'

export interface CreateAttachmentData {
  id?: string
  title: string
  url: string
  orderId: string
}

@Injectable()
export abstract class AttachmentsRepository {
  abstract create(data: CreateAttachmentData): Promise<Attachment>
  abstract findByOrderId(orderId: string): Promise<Attachment[]>
}
