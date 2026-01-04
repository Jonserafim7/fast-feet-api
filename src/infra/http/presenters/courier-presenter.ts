import { User } from '@/generated/prisma/client.js';

export class CourierPresenter {
  static toHTTP(user: User) {
    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
