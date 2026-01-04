import { Module } from '@nestjs/common';
import { AuthenticateUserUseCase } from '@/core/use-cases/authenticate-user-use-case.js';
import { CreateCourierUseCase } from '@/core/use-cases/create-courier-use-case.js';
import { CreateUserUseCase } from '@/core/use-cases/create-user-use-case.js';
import { DeleteCourierUseCase } from '@/core/use-cases/delete-courier-use-case.js';
import { GetCourierUseCase } from '@/core/use-cases/get-courier-use-case.js';
import { ListCouriersUseCase } from '@/core/use-cases/list-couriers-use-case.js';
import { UpdateCourierUseCase } from '@/core/use-cases/update-courier-use-case.js';
import { UpdateUserPasswordUseCase } from '@/core/use-cases/update-user-password-use-case.js';
import { DatabaseModule } from '@/infra/database/database.module.js';
import { CryptographyModule } from '@/infra/cryptography/cryptography.module.js';
import { CreateUserController } from '@/infra/http/controllers/create-user.controller.js';
import { AuthenticateController } from '@/infra/http/controllers/authenticate.controller.js';
import { CreateCourierController } from '@/infra/http/controllers/create-courier.controller.js';
import { DeleteCourierController } from '@/infra/http/controllers/delete-courier.controller.js';
import { GetCourierController } from '@/infra/http/controllers/get-courier.controller.js';
import { ListCouriersController } from '@/infra/http/controllers/list-couriers.controller.js';
import { UpdateCourierController } from '@/infra/http/controllers/update-courier.controller.js';
import { UpdateUserPasswordController } from '@/infra/http/controllers/update-user-password.controller.js';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  exports: [],
  controllers: [
    CreateUserController,
    AuthenticateController,
    CreateCourierController,
    ListCouriersController,
    GetCourierController,
    UpdateCourierController,
    DeleteCourierController,
    UpdateUserPasswordController,
  ],
  providers: [
    CreateUserUseCase,
    AuthenticateUserUseCase,
    CreateCourierUseCase,
    ListCouriersUseCase,
    GetCourierUseCase,
    UpdateCourierUseCase,
    DeleteCourierUseCase,
    UpdateUserPasswordUseCase,
  ],
})
export class HttpModule {}
