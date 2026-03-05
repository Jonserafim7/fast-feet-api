import { Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'
import { ListAvailableOrdersUseCase } from '@/core/use-cases/list-available-orders-use-case.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter.js'

const availableOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().min(1).optional(),
})

type AvailableOrdersQuery = z.infer<typeof availableOrdersQuerySchema>

@Controller('/orders/available')
@Roles('COURIER')
export class ListAvailableOrdersController {
  constructor(private readonly listAvailableOrders: ListAvailableOrdersUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(availableOrdersQuerySchema))
    query: AvailableOrdersQuery
  ) {
    const { page, perPage, search } = query

    const result = await this.listAvailableOrders.execute({
      page,
      perPage,
      search,
    })

    if (result.isRight()) {
      return {
        orders: result.value.orders.map((order) => OrderPresenter.toHTTP(order)),
      }
    }

    return { orders: [] }
  }
}
