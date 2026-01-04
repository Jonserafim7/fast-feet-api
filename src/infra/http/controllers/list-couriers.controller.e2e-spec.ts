import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@/infra/database/prisma/prisma.service.js';
import { AppModule } from '@/infra/app.module.js';
import { JwtService } from '@nestjs/jwt';

describe('List Couriers (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /couriers', async () => {
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        cpf: '70135775450',
        passwordHash: 'admin-hash',
        role: 'ADMIN',
      },
    });

    const accessToken = await jwt.signAsync({
      sub: adminUser.id,
      role: adminUser.role,
    });

    await prisma.user.createMany({
      data: [
        {
          name: 'Courier One',
          cpf: '59613902252',
          passwordHash: 'hash-1',
          role: 'COURIER',
        },
        {
          name: 'Courier Two',
          cpf: '55052209401',
          passwordHash: 'hash-2',
          role: 'COURIER',
        },
        {
          name: 'Courier Three',
          cpf: '30174152442',
          passwordHash: 'hash-3',
          role: 'COURIER',
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/couriers?page=1&perPage=2')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.couriers).toHaveLength(2);
    expect(
      response.body.couriers.every(
        (courier: { role: string }) => courier.role === 'COURIER',
      ),
    ).toBe(true);
  });
});
