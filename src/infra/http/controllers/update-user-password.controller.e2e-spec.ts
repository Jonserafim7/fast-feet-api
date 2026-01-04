import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@/infra/database/prisma/prisma.service.js';
import { AppModule } from '@/infra/app.module.js';
import { JwtService } from '@nestjs/jwt';
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher.js';

describe('Update User Password (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let bcryptHasher: BcryptHasher;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);
    bcryptHasher = new BcryptHasher();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[PATCH] /users/:id/password', async () => {
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        cpf: '62143827911',
        passwordHash: 'admin-hash',
        role: 'ADMIN',
      },
    });

    const courier = await prisma.user.create({
      data: {
        name: 'Courier User',
        cpf: '99073268281',
        passwordHash: await bcryptHasher.hash('old-password'),
        role: 'COURIER',
      },
    });

    const accessToken = await jwt.signAsync({
      sub: adminUser.id,
      role: adminUser.role,
    });

    const response = await request(app.getHttpServer())
      .patch(`/users/${courier.id}/password`)
      .send({
        password: 'new-password',
      })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(204);

    const courierOnDatabase = await prisma.user.findUnique({
      where: {
        id: courier.id,
      },
    });

    expect(courierOnDatabase).toBeTruthy();
    expect(
      await bcryptHasher.compare(
        'new-password',
        courierOnDatabase?.passwordHash ?? '',
      ),
    ).toBe(true);
  });
});
