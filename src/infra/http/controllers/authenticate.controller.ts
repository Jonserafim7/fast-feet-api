import {
  Controller,
  Post,
  Body,
  UsePipes,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe.js'
import { AuthenticateUserUseCase } from '@/core/use-cases/authenticate-user-use-case.js'
import { InvalidCredentialsError } from '@/core/errors/invalid-credentials-errors.js'
import { Public } from '@/infra/auth/public.decorator.js'
import { cpfSchema } from '@/infra/http/validators/cpf.schema.js'

const authenticateBodySchema = z.object({
  cpf: cpfSchema,
  password: z.string().min(6),
})

type AuthenticateBody = z.infer<typeof authenticateBodySchema>

@Controller('sessions')
export class AuthenticateController {
  constructor(private authenticateUser: AuthenticateUserUseCase) {}

  @Public()
  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBody) {
    const { cpf, password } = body

    const result = await this.authenticateUser.execute({
      cpf,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken } = result.value

    return {
      access_token: accessToken,
    }
  }
}
