import { Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'
import { ListCourierOrdersUseCase } from '@/domain/use-cases/list-courier-orders-use-case.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { CurrentUser } from '@/infra/auth/current-user.decorator.js'
import type { TokenPayload } from '@/infra/auth/jwt.strategy.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter.js'

const courierOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
  status: z
    .enum(['PENDING', 'WAITING', 'WITHDRAWN', 'DELIVERED', 'RETURNED'])
    .optional(),
  search: z.string().trim().min(1).optional(),
})

type CourierOrdersQuery = z.infer<typeof courierOrdersQuerySchema>

@Controller('/orders')
@Roles('COURIER')
export class ListCourierOrdersController {
  constructor(private readonly listCourierOrders: ListCourierOrdersUseCase) {}

  @Get('/me')
  async handle(
    @CurrentUser() user: TokenPayload,
    @Query(new ZodValidationPipe(courierOrdersQuerySchema))
    query: CourierOrdersQuery
  ) {
    const { page, perPage, status, search } = query

    const result = await this.listCourierOrders.execute({
      courierId: user.sub,
      page,
      perPage,
      status,
      search,
    })

    if (result.isRight()) {
      return {
        orders: result.value.orders.map((order) => OrderPresenter.toHTTP(order)),
        total: result.value.total,
      }
    }

    return { orders: [], total: 0 }
  }
}
