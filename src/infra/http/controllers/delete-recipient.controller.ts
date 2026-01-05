import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { z } from 'zod'
import { DeleteRecipientUseCase } from '@/core/use-cases/delete-recipient-use-case.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'

const recipientIdSchema = z.uuid()

@Controller('/recipients')
@Roles('ADMIN')
export class DeleteRecipientController {
  constructor(private readonly deleteRecipient: DeleteRecipientUseCase) {}

  @Delete('/:id')
  @HttpCode(204)
  async handle(
    @Param('id', new ZodValidationPipe(recipientIdSchema))
    recipientId: string
  ) {
    const result = await this.deleteRecipient.execute({ recipientId })

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
