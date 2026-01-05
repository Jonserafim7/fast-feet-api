import { Module } from '@nestjs/common'
import { AuthenticateUserUseCase } from '@/core/use-cases/authenticate-user-use-case.js'
import { CreateCourierUseCase } from '@/core/use-cases/create-courier-use-case.js'
import { CreateUserUseCase } from '@/core/use-cases/create-user-use-case.js'
import { CreateRecipientUseCase } from '@/core/use-cases/create-recipient-use-case.js'
import { DeleteCourierUseCase } from '@/core/use-cases/delete-courier-use-case.js'
import { DeleteRecipientUseCase } from '@/core/use-cases/delete-recipient-use-case.js'
import { GetCourierUseCase } from '@/core/use-cases/get-courier-use-case.js'
import { GetRecipientUseCase } from '@/core/use-cases/get-recipient-use-case.js'
import { ListCouriersUseCase } from '@/core/use-cases/list-couriers-use-case.js'
import { ListRecipientsUseCase } from '@/core/use-cases/list-recipients-use-case.js'
import { UpdateCourierUseCase } from '@/core/use-cases/update-courier-use-case.js'
import { UpdateRecipientUseCase } from '@/core/use-cases/update-recipient-use-case.js'
import { UpdateUserPasswordUseCase } from '@/core/use-cases/update-user-password-use-case.js'
import { CreateOrderUseCase } from '@/core/use-cases/create-order-use-case.js'
import { GetOrderUseCase } from '@/core/use-cases/get-order-use-case.js'
import { ListOrdersUseCase } from '@/core/use-cases/list-orders-use-case.js'
import { UpdateOrderUseCase } from '@/core/use-cases/update-order-use-case.js'
import { DeleteOrderUseCase } from '@/core/use-cases/delete-order-use-case.js'
import { MarkOrderAsWaitingUseCase } from '@/core/use-cases/mark-order-as-waiting-use-case.js'
import { DatabaseModule } from '@/infra/database/database.module.js'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module.js'
import { CreateUserController } from '@/infra/http/controllers/create-user.controller.js'
import { AuthenticateController } from '@/infra/http/controllers/authenticate.controller.js'
import { CourierProfileController } from '@/infra/http/controllers/courier-profile.controller.js'
import { CreateCourierController } from '@/infra/http/controllers/create-courier.controller.js'
import { CreateRecipientController } from '@/infra/http/controllers/create-recipient.controller.js'
import { DeleteCourierController } from '@/infra/http/controllers/delete-courier.controller.js'
import { DeleteRecipientController } from '@/infra/http/controllers/delete-recipient.controller.js'
import { GetCourierController } from '@/infra/http/controllers/get-courier.controller.js'
import { GetRecipientController } from '@/infra/http/controllers/get-recipient.controller.js'
import { ListCouriersController } from '@/infra/http/controllers/list-couriers.controller.js'
import { ListRecipientsController } from '@/infra/http/controllers/list-recipients.controller.js'
import { UpdateCourierController } from '@/infra/http/controllers/update-courier.controller.js'
import { UpdateRecipientController } from '@/infra/http/controllers/update-recipient.controller.js'
import { UpdateUserPasswordController } from '@/infra/http/controllers/update-user-password.controller.js'
import { CreateOrderController } from '@/infra/http/controllers/create-order.controller.js'
import { GetOrderController } from '@/infra/http/controllers/get-order.controller.js'
import { ListOrdersController } from '@/infra/http/controllers/list-orders.controller.js'
import { UpdateOrderController } from '@/infra/http/controllers/update-order.controller.js'
import { DeleteOrderController } from '@/infra/http/controllers/delete-order.controller.js'
import { MarkOrderAsWaitingController } from '@/infra/http/controllers/mark-order-as-waiting.controller.js'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  exports: [],
  controllers: [
    CreateUserController,
    AuthenticateController,
    CreateCourierController,
    CourierProfileController,
    ListCouriersController,
    GetCourierController,
    UpdateCourierController,
    DeleteCourierController,
    CreateRecipientController,
    ListRecipientsController,
    GetRecipientController,
    UpdateRecipientController,
    DeleteRecipientController,
    UpdateUserPasswordController,
    CreateOrderController,
    GetOrderController,
    ListOrdersController,
    UpdateOrderController,
    DeleteOrderController,
    MarkOrderAsWaitingController,
  ],
  providers: [
    CreateUserUseCase,
    AuthenticateUserUseCase,
    CreateCourierUseCase,
    ListCouriersUseCase,
    GetCourierUseCase,
    UpdateCourierUseCase,
    DeleteCourierUseCase,
    CreateRecipientUseCase,
    ListRecipientsUseCase,
    GetRecipientUseCase,
    UpdateRecipientUseCase,
    DeleteRecipientUseCase,
    UpdateUserPasswordUseCase,
    CreateOrderUseCase,
    GetOrderUseCase,
    ListOrdersUseCase,
    UpdateOrderUseCase,
    DeleteOrderUseCase,
    MarkOrderAsWaitingUseCase,
  ],
})
export class HttpModule {}
