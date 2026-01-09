import { Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'
import { ListCourierOrdersUseCase } from '@/core/use-cases/list-courier-orders-use-case.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { CurrentUser } from '@/infra/auth/current-user.decorator.js'
import type { TokenPayload } from '@/infra/auth/jwt.strategy.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter.js'

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
})

type PaginationQuery = z.infer<typeof paginationQuerySchema>

@Controller('/orders')
@Roles('COURIER')
export class ListCourierOrdersController {
  constructor(private readonly listCourierOrders: ListCourierOrdersUseCase) {}

  @Get('/me')
  async handle(
    @CurrentUser() user: TokenPayload,
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery
  ) {
    const { page, perPage } = query

    const result = await this.listCourierOrders.execute({
      courierId: user.sub,
      page,
      perPage,
    })

    if (result.isRight()) {
      return {
        orders: result.value.orders.map((order) => OrderPresenter.toHTTP(order)),
      }
    }

    return { orders: [] }
  }
}
