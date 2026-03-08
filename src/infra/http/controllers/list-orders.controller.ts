import { Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'
import { ListOrdersUseCase } from '@/domain/use-cases/list-orders-use-case.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter.js'

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
})

type PaginationQuery = z.infer<typeof paginationQuerySchema>

@Controller('/orders')
@Roles('ADMIN')
export class ListOrdersController {
  constructor(private readonly listOrders: ListOrdersUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery
  ) {
    const { page, perPage } = query

    const result = await this.listOrders.execute({ page, perPage })

    if (result.isRight()) {
      return {
        orders: result.value.orders.map((order) => OrderPresenter.toHTTP(order)),
        total: result.value.total,
      }
    }

    return { orders: [], total: 0 }
  }
}
