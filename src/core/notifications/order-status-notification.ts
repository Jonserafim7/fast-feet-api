import { OrderStatus } from '@/generated/prisma/client.js'

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'pendente',
  WAITING: 'aguardando retirada',
  WITHDRAWN: 'retirada',
  DELIVERED: 'entregue',
  RETURNED: 'devolvida',
}

export function buildOrderStatusNotification(
  orderId: string,
  status: OrderStatus
) {
  const statusLabel = STATUS_LABELS[status]

  return {
    title: `Atualizacao da encomenda ${orderId}`,
    content: `Sua encomenda ${orderId} agora esta ${statusLabel}.`,
  }
}
