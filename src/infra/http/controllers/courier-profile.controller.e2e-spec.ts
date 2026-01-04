import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@/infra/database/prisma/prisma.service.js';
import { AppModule } from '@/infra/app.module.js';
import { JwtService } from '@nestjs/jwt';

describe('Courier Profile (E2E)', () => {
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

  test('[GET] /couriers/me', async () => {
    const courier = await prisma.user.create({
      data: {
        name: 'Courier User',
        cpf: '57414331202',
        passwordHash: 'courier-hash',
        role: 'COURIER',
      },
    });

    const accessToken = await jwt.signAsync({
      sub: courier.id,
      role: courier.role,
    });

    const response = await request(app.getHttpServer())
      .get('/couriers/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);

    const body = response.body as { courier: { id: string } };
    expect(body.courier.id).toBe(courier.id);
  });
});
