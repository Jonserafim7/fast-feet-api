import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { z } from 'zod';
import { DeleteCourierUseCase } from '@/core/use-cases/delete-courier-use-case.js';
import { UserNotFoundError } from '@/core/errors/user-not-found-errors.js';
import { Roles } from '@/infra/auth/roles.decorator.js';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js';

const courierIdSchema = z.uuid();

@Controller('/couriers')
@Roles('ADMIN')
export class DeleteCourierController {
  constructor(private readonly deleteCourier: DeleteCourierUseCase) {}

  @Delete('/:id')
  @HttpCode(204)
  async handle(
    @Param('id', new ZodValidationPipe(courierIdSchema)) courierId: string,
  ) {
    const result = await this.deleteCourier.execute({ courierId });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
  }
}
