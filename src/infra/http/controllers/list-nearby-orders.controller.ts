import { Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'
import { ListNearbyOrdersUseCase } from '@/core/use-cases/list-nearby-orders-use-case.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter.js'

const nearbyOrdersQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
})

type NearbyOrdersQuery = z.infer<typeof nearbyOrdersQuerySchema>

@Controller('/orders/nearby')
@Roles('COURIER')
export class ListNearbyOrdersController {
  constructor(private readonly listNearbyOrders: ListNearbyOrdersUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(nearbyOrdersQuerySchema))
    query: NearbyOrdersQuery
  ) {
    const { latitude, longitude } = query

    const result = await this.listNearbyOrders.execute({
      courierLatitude: latitude,
      courierLongitude: longitude,
    })

    if (result.isRight() && result.value.orders.length > 0) {
      return {
        orders: result.value.orders.map((order) => OrderPresenter.toHTTP(order)),
      }
    }

    return { orders: [] }
  }
}
