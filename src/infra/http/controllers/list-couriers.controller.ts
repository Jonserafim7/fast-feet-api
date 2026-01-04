import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { ListCouriersUseCase } from '@/core/use-cases/list-couriers-use-case.js';
import { Roles } from '@/infra/auth/roles.decorator.js';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js';
import { CourierPresenter } from '@/infra/http/presenters/courier-presenter.js';

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
});

type PaginationQuery = z.infer<typeof paginationQuerySchema>;

@Controller('/couriers')
@Roles('ADMIN')
export class ListCouriersController {
  constructor(private readonly listCouriers: ListCouriersUseCase) {}

  @Get()
  @UsePipes(new ZodValidationPipe(paginationQuerySchema))
  async handle(@Query() query: PaginationQuery) {
    const { page, perPage } = query;

    const result = await this.listCouriers.execute({
      page,
      perPage,
    });

    if (result.isRight() && result.value.couriers.length > 0) {
      return {
        couriers: result.value.couriers.map((courier) =>
          CourierPresenter.toHTTP(courier),
        ),
      };
    }

    return {
      couriers: [],
    };
  }
}
