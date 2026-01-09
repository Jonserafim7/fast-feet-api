import {
  BadRequestException,
  Controller,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { CurrentUser } from '@/infra/auth/current-user.decorator.js'
import type { TokenPayload } from '@/infra/auth/jwt.strategy.js'
import { WithdrawOrderUseCase } from '@/core/use-cases/withdraw-order-use-case.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/core/errors/invalid-order-status-error.js'
import { NotificationSendError } from '@/core/errors/notification-send-error.js'

@Controller('/orders')
@Roles('COURIER')
export class WithdrawOrderController {
  constructor(private readonly withdrawOrder: WithdrawOrderUseCase) {}

  @Patch(':orderId/withdraw')
  @HttpCode(204)
  async handle(
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @CurrentUser() user: TokenPayload
  ) {
    const result = await this.withdrawOrder.execute({
      orderId,
      courierId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case InvalidOrderStatusError:
          throw new BadRequestException(error.message)
        case NotificationSendError:
          throw new InternalServerErrorException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
