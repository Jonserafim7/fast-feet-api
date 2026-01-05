import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { z } from 'zod'
import { DeleteOrderUseCase } from '@/core/use-cases/delete-order-use-case.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'

const orderIdSchema = z.uuid()

@Controller('/orders')
@Roles('ADMIN')
export class DeleteOrderController {
  constructor(private readonly deleteOrder: DeleteOrderUseCase) {}

  @Delete('/:id')
  @HttpCode(204)
  async handle(
    @Param('id', new ZodValidationPipe(orderIdSchema)) orderId: string
  ) {
    const result = await this.deleteOrder.execute({ orderId })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
