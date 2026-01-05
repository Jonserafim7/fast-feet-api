import { Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'
import { ListRecipientsUseCase } from '@/core/use-cases/list-recipients-use-case.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { RecipientPresenter } from '@/infra/http/presenters/recipient-presenter.js'

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
})

type PaginationQuery = z.infer<typeof paginationQuerySchema>

@Controller('/recipients')
@Roles('ADMIN')
export class ListRecipientsController {
  constructor(private readonly listRecipients: ListRecipientsUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery
  ) {
    const { page, perPage } = query

    const result = await this.listRecipients.execute({
      page,
      perPage,
    })

    if (result.isRight() && result.value.recipients.length > 0) {
      return {
        recipients: result.value.recipients.map((recipient) =>
          RecipientPresenter.toHTTP(recipient)
        ),
      }
    }

    return {
      recipients: [],
    }
  }
}
