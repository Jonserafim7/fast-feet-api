import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { z } from 'zod';
import { GetCourierUseCase } from '@/core/use-cases/get-courier-use-case.js';
import { UserNotFoundError } from '@/core/errors/user-not-found-errors.js';
import { Roles } from '@/infra/auth/roles.decorator.js';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js';
import { CourierPresenter } from '@/infra/http/presenters/courier-presenter.js';

const courierIdSchema = z.uuid();

@Controller('/couriers')
@Roles('ADMIN')
export class GetCourierController {
  constructor(private readonly getCourier: GetCourierUseCase) {}

  @Get('/:id')
  async handle(
    @Param('id', new ZodValidationPipe(courierIdSchema)) courierId: string,
  ) {
    const result = await this.getCourier.execute({ courierId });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return {
      courier: CourierPresenter.toHTTP(result.value.courier),
    };
  }
}
