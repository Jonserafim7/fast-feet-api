import { DatabaseModule } from '../database/database.module.js';
import { Module } from '@nestjs/common';
import { CryptographyModule } from '../cryptography/cryptography.module.js';
import { CreateUserUseCase } from '../../core/use-cases/create-user-use-case.js';
import { AuthenticateUserUseCase } from '../../core/use-cases/authenticate-user-use-case.js';
import { CreateUserController } from './controllers/create-user.controller.js';
import { AuthenticateController } from './controllers/authenticate.controller.js';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  exports: [],
  controllers: [CreateUserController, AuthenticateController],
  providers: [CreateUserUseCase, AuthenticateUserUseCase],
})
export class HttpModule {}
