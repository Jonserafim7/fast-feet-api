import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { z } from 'zod'
import { GetRecipientUseCase } from '@/core/use-cases/get-recipient-use-case.js'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { RecipientPresenter } from '@/infra/http/presenters/recipient-presenter.js'

const recipientIdSchema = z.uuid()

@Controller('/recipients')
@Roles('ADMIN')
export class GetRecipientController {
  constructor(private readonly getRecipient: GetRecipientUseCase) {}

  @Get('/:id')
  async handle(
    @Param('id', new ZodValidationPipe(recipientIdSchema)) recipientId: string
  ) {
    const result = await this.getRecipient.execute({ recipientId })

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
      recipient: RecipientPresenter.toHTTP(result.value.recipient),
    }
  }
}
