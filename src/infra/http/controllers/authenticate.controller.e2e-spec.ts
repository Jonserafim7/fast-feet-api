import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@/infra/database/prisma/prisma.service.js';
import { AppModule } from '@/infra/app.module.js';
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher.js';

describe('Authenticate (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let bcryptHasher: BcryptHasher;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    bcryptHasher = new BcryptHasher();
    await app.init();
  });

  test('[POST] /sessions', async () => {
    await prisma.user.create({
      data: {
        name: 'Admin User',
        cpf: '12345678909',
        passwordHash: await bcryptHasher.hash('123456'),
        role: 'ADMIN',
      },
    });

    const response = await request(app.getHttpServer()).post('/sessions').send({
      cpf: '123.456.789-09',
      password: '123456',
    });

    expect(response.statusCode).toBe(201);
  });
});
