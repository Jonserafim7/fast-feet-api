import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
} from '@nestjs/common'
import { GetCourierUseCase } from '@/core/use-cases/get-courier-use-case.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { CurrentUser } from '@/infra/auth/current-user.decorator.js'
import type { TokenPayload } from '@/infra/auth/jwt.strategy.js'
import { CourierPresenter } from '@/infra/http/presenters/courier-presenter.js'

@Controller('/couriers')
@Roles('COURIER')
export class CourierProfileController {
  constructor(private readonly getCourier: GetCourierUseCase) {}

  @Get('/me')
  async handle(@CurrentUser() user: TokenPayload) {
    const result = await this.getCourier.execute({ courierId: user.sub })

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
      courier: CourierPresenter.toHTTP(result.value.courier),
    }
  }
}
