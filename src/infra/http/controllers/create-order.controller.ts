import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { CreateOrderUseCase } from '@/core/use-cases/create-order-use-case.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { NotificationSendError } from '@/core/errors/notification-send-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'

const createOrderBodySchema = z.object({
  recipientId: z.uuid(),
  latitude: z.number(),
  longitude: z.number(),
  street: z.string().trim().min(1),
  number: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().min(2).max(2),
  zip: z.string().trim().min(8).max(9),
  country: z.string().trim().min(1).default('Brasil'),
  complement: z.string().trim().optional(),
})

type CreateOrderBody = z.infer<typeof createOrderBodySchema>

@Controller('/orders')
@Roles('ADMIN')
export class CreateOrderController {
  constructor(private readonly createOrder: CreateOrderUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createOrderBodySchema))
    body: CreateOrderBody
  ) {
    const {
      recipientId,
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

    const result = await this.createOrder.execute({
      recipientId,
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
        case NotificationSendError:
          throw new InternalServerErrorException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
