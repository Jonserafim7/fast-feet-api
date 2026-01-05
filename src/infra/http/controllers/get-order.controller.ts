import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { z } from 'zod'
import { GetOrderUseCase } from '@/core/use-cases/get-order-use-case.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter.js'

const orderIdSchema = z.uuid()

@Controller('/orders')
@Roles('ADMIN')
export class GetOrderController {
  constructor(private readonly getOrder: GetOrderUseCase) {}

  @Get('/:id')
  async handle(
    @Param('id', new ZodValidationPipe(orderIdSchema)) orderId: string
  ) {
    const result = await this.getOrder.execute({ orderId })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return {
      order: OrderPresenter.toHTTP(result.value.order),
    }
  }
}
