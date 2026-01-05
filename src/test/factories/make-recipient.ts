import { randomUUID } from 'node:crypto'
import type { PrismaService } from '@/infra/database/prisma/prisma.service.js'

export interface MakeRecipientInput {
  id?: string
  name?: string
  email?: string
  phone?: string | null
}

export interface MakeRecipientOutput {
  id: string
  name: string
  email: string
  phone: string | null
}

let emailCounter = 0

export async function makeRecipient(
  prisma: PrismaService,
  input: MakeRecipientInput = {}
): Promise<MakeRecipientOutput> {
  emailCounter++

  const id = input.id ?? randomUUID()
  const name = input.name ?? `Test Recipient ${emailCounter}`
  const email = input.email ?? `recipient-${emailCounter}@test.com`
  const phone = input.phone !== undefined ? input.phone : null

  await prisma.recipient.create({
    data: { id, name, email, phone },
  })

  return { id, name, email, phone }
}
