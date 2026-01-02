import { Module } from '@nestjs/common';
import { AuthenticateUserUseCase } from '@/core/use-cases/authenticate-user-use-case.js';
import { CreateUserUseCase } from '@/core/use-cases/create-user-use-case.js';
import { DatabaseModule } from '@/infra/database/database.module.js';
import { CryptographyModule } from '@/infra/cryptography/cryptography.module.js';
import { CreateUserController } from '@/infra/http/controllers/create-user.controller.js';
import { AuthenticateController } from '@/infra/http/controllers/authenticate.controller.js';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  exports: [],
  controllers: [CreateUserController, AuthenticateController],
  providers: [CreateUserUseCase, AuthenticateUserUseCase],
})
export class HttpModule {}
