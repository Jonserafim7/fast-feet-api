import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { z } from 'zod'
import { UpdateOrderUseCase } from '@/core/use-cases/update-order-use-case.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'

const orderIdSchema = z.uuid()

const updateOrderBodySchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  street: z.string().trim().min(1).optional(),
  number: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  state: z.string().trim().min(2).max(2).optional(),
  zip: z.string().trim().min(8).max(9).optional(),
  country: z.string().trim().min(1).optional(),
  complement: z.string().trim().optional(),
})

type UpdateOrderBody = z.infer<typeof updateOrderBodySchema>

@Controller('/orders')
@Roles('ADMIN')
export class UpdateOrderController {
  constructor(private readonly updateOrder: UpdateOrderUseCase) {}

  @Patch('/:id')
  async handle(
    @Param('id', new ZodValidationPipe(orderIdSchema)) orderId: string,
    @Body(new ZodValidationPipe(updateOrderBodySchema))
    body: UpdateOrderBody
  ) {
    const {
      latitude,
      longitude,
      street,
      number,
      city,
      state,
      zip,
      country,
      complement,
    } = body

    const result = await this.updateOrder.execute({
      orderId,
      latitude,
      longitude,
      street,
      number,
      city,
      state,
      zip,
      country,
      complement,
    })

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
