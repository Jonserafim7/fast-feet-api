import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe.js';
import { CreateUserUseCase } from '../../../core/use-cases/create-user-use-case.js';
import { UserAlreadyExistsError } from '../../../core/errors/user-already-exists-errors.js';
import { Roles } from '../../auth/roles.decorator.js';

const createUserBodySchema = z.object({
  name: z.string(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  password: z.string(),
  role: z.enum(['ADMIN', 'COURIER']).default('COURIER'),
});

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>;

@Controller('/users')
@Roles('ADMIN')
export class CreateUserController {
  constructor(private createUser: CreateUserUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createUserBodySchema))
  async handle(@Body() body: CreateUserBodySchema) {
    const { name, cpf, password, role } = body;

    const result = await this.createUser.execute({
      name,
      cpf,
      password,
      role,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
  }
}
